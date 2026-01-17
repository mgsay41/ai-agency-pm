import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { updateProjectSchema, type UpdateProjectInput } from "@/lib/validations/project";
import {
  createSuccessResponse,
  handleGenericError,
  logActivity,
} from "@/lib/api-error";
import { sanitizeFormData } from "@/lib/sanitize";
import { withRole, apiResponses } from "@/lib/api-middleware";
import { Role } from "@prisma/client";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";
import { canAccessProject } from "@/lib/resource-ownership";
import { nanoid } from "nanoid";

/**
 * GET /api/projects/[id]
 * Get a single project by ID with role-based filtering
 * - Admin: All project details including budget
 * - Sales: Project details for their clients (no budget, cascade hiding for soft-deleted clients)
 * - Team Member: Project details for assigned projects (no budget, client name only)
 */
export const GET = withRole(
  ["ADMIN", "SALES", "TEAM_MEMBER"],
  async (request, { params, user }) => {
    try {
      if (!params?.id) {
        return apiResponses.badRequest("Project ID is required");
      }

      const projectId = params.id;
      const userRole = user.role as Role;

      // Check if user can access this project (handles role-based filtering and budget removal)
      const project = await canAccessProject(user.id, projectId, userRole);

      if (!project) {
        return apiResponses.notFound("Project not found or access denied");
      }

      // Get additional relations
      const projectWithRelations = await db.project.findUnique({
        where: { id: projectId },
        include: {
          Client: {
            select: {
              id: true,
              companyName: true,
              clientType: true,
              industry: userRole === "ADMIN" || userRole === "SALES",
              website: userRole === "ADMIN" || userRole === "SALES",
              // Team members only get client name
            },
          },
          ProjectAssignment: {
            include: {
              TeamMember: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  roleTitle: true,
                  avatarColor: true,
                },
              },
            },
            where: {
              isActive: true,
            },
          },
          Milestone: {
            orderBy: {
              targetDate: "asc",
            },
          },
        },
      });

      // Remove budget fields for non-admins
      if (!hasPermission(userRole, PERMISSIONS.PROJECT_VIEW_BUDGET)) {
        const { budgetAmount, estimatedHours, ...projectWithoutBudget } =
          projectWithRelations!;
        return apiResponses.success(projectWithoutBudget);
      }

      return apiResponses.success(projectWithRelations);
    } catch (error) {
      return handleGenericError(error);
    }
  }
);

/**
 * PATCH /api/projects/[id]
 * Update a project
 * - Admin: Full edit access
 * - Sales: Read-only (403 forbidden)
 * - Team Member: Read-only (403 forbidden)
 */
export const PATCH = withRole(
  ["ADMIN", "SALES", "TEAM_MEMBER"],
  async (request, { params, user }) => {
    try {
      if (!params?.id) {
        return apiResponses.badRequest("Project ID is required");
      }

      const projectId = params.id;
      const userRole = user.role as Role;

      // Sales and Team Members have read-only access
      if (!hasPermission(userRole, PERMISSIONS.PROJECT_EDIT)) {
        return apiResponses.forbidden(
          "Projects are read-only. Only administrators can edit projects."
        );
      }

      // Check if project exists and is not deleted
      const existingProject = await db.project.findFirst({
        where: {
          id: projectId,
          deletedAt: null,
        },
        select: {
          id: true,
          projectName: true,
          status: true,
          priority: true,
          Client: {
            select: {
              deletedAt: true,
            },
          },
        },
      });

      if (!existingProject) {
        return apiResponses.notFound("Project not found");
      }

      // Check if client is soft deleted
      if (existingProject.Client.deletedAt) {
        return apiResponses.badRequest(
          "Cannot edit project for archived client"
        );
      }

      // Parse request body
      const body = await request.json();

      // Validate input
      const validatedData: UpdateProjectInput = updateProjectSchema.parse(body);

      // Sanitize input to prevent XSS
      const sanitizedData = sanitizeFormData(validatedData, {
        textarea: ["description", "internalNotes"],
        plainText: ["projectName", "projectCode", "currentPhase"],
      });

      // Track changes for activity log
      const changes: Record<string, { old: unknown; new: unknown }> = {};
      Object.keys(sanitizedData).forEach((key) => {
        if (sanitizedData[key as keyof UpdateProjectInput] !== undefined) {
          changes[key] = {
            old: (existingProject as Record<string, unknown>)[key],
            new: sanitizedData[key as keyof UpdateProjectInput],
          };
        }
      });

      // Update project
      const updatedProject = await db.project.update({
        where: { id: projectId },
        data: {
          ...sanitizedData,
          lastModifiedBy: user.id,
          updatedAt: new Date(),
        },
        include: {
          Client: {
            select: {
              id: true,
              companyName: true,
              clientType: true,
              industry: true,
            },
          },
          ProjectAssignment: {
            include: {
              TeamMember: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  roleTitle: true,
                  avatarColor: true,
                },
              },
            },
            where: {
              isActive: true,
            },
          },
        },
      });

      // Log activity
      await logActivity(db, user.id, "project", projectId, "updated", changes);

      return apiResponses.success(updatedProject, "Project updated successfully");
    } catch (error) {
      return handleGenericError(error);
    }
  }
);

/**
 * DELETE /api/projects/[id]
 * Soft delete a project (Admin only)
 */
export const DELETE = withRole(["ADMIN"], async (request, { params, user }) => {
  try {
      if (!params?.id) {
        return apiResponses.badRequest("Project ID is required");
      }

      const projectId = params.id;

    // Check if project exists and is not already deleted
    const existingProject = await db.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
      },
      select: {
        id: true,
        projectName: true,
        status: true,
      },
    });

    if (!existingProject) {
      return apiResponses.notFound("Project not found");
    }

    // Soft delete project (set deletedAt timestamp)
    const deletedProject = await db.$transaction(async (tx) => {
      // Log activity before deletion
      await tx.activityLog.create({
        data: {
          id: nanoid(),
          userId: user.id,
          entityType: "project",
          entityId: projectId,
          action: "deleted",
          changes: {
            projectName: existingProject.projectName,
            status: existingProject.status,
          },
          createdAt: new Date(),
        },
      });

      // Soft delete
      return await tx.project.update({
        where: { id: projectId },
        data: {
          deletedAt: new Date(),
          lastModifiedBy: user.id,
          updatedAt: new Date(),
        },
      });
    });

    return apiResponses.success(
      {
        id: projectId,
        deletedAt: deletedProject.deletedAt,
      },
      "Project deleted successfully"
    );
  } catch (error) {
    return handleGenericError(error);
  }
});
