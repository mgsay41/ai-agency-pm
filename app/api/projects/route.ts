import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  createProjectSchema,
  projectQuerySchema,
  type CreateProjectInput,
} from "@/lib/validations/project";
import {
  createSuccessResponse,
  handleGenericError,
  logActivity,
} from "@/lib/api-error";
import {
  getPaginatedProjects,
  generateProjectCode,
} from "@/lib/services/project.service";
import { sanitizeFormData } from "@/lib/sanitize";
import { withRole, apiResponses } from "@/lib/api-middleware";
import { Role } from "@prisma/client";
import { canViewBudget } from "@/lib/permissions";
import { getUserProjects } from "@/lib/resource-ownership";

/**
 * GET /api/projects
 * Get all projects with filtering, sorting, and pagination
 * Role-based access:
 * - Admin: All projects with budgets
 * - Sales: Projects for their clients (no budgets, excludes soft-deleted clients)
 * - Team Member: Projects they're assigned to (no budgets)
 */
export const GET = withRole(
  ["ADMIN", "SALES", "TEAM_MEMBER"],
  async (request, { user }) => {
    try {
      const userRole = user.role as Role;

      // Get projects based on user role and ownership
      const projects = await getUserProjects(user.id, userRole);

      // Note: getUserProjects already handles:
      // - Role-based filtering
      // - Budget field removal for non-admins
      // - Client name inclusion
      // - Soft-deleted client cascade hiding for Sales

      return apiResponses.success({ projects });
    } catch (error) {
      return handleGenericError(error);
    }
  }
);

/**
 * POST /api/projects
 * Create a new project
 * Role-based access:
 * - Admin: Can create for any client
 * - Sales: Can create only for their own clients
 */
export const POST = withRole(["ADMIN", "SALES"], async (request, { user }) => {
  try {
    const userRole = user.role as Role;

    // Parse request body
    const body = await request.json();

    // Validate input
    const validatedData: CreateProjectInput = createProjectSchema.parse(body);

    // Sanitize input to prevent XSS
    const sanitizedData = sanitizeFormData(validatedData, {
      textarea: ["description", "internalNotes"],
      plainText: ["projectName", "projectCode", "currentPhase"],
    });

    // Get client info and verify ownership for Sales users
    const client = await db.client.findUnique({
      where: { id: sanitizedData.clientId },
      select: {
        id: true,
        companyName: true,
        createdBy: true,
        deletedAt: true,
      },
    });

    if (!client) {
      return apiResponses.notFound("Client not found");
    }

    // Check if client is soft deleted
    if (client.deletedAt) {
      return apiResponses.badRequest("Cannot create project for archived client");
    }

    // Sales users can only create projects for their own clients
    if (userRole === "SALES" && client.createdBy !== user.id) {
      return apiResponses.forbidden(
        "You can only create projects for your own clients"
      );
    }

    // Generate project code if not provided
    let projectCode = sanitizedData.projectCode;
    if (!projectCode) {
      projectCode = await generateProjectCode(
        sanitizedData.projectName,
        client.companyName
      );
    }

    // Create project
    const project = await db.project.create({
      data: {
        id: crypto.randomUUID(),
        projectName: sanitizedData.projectName,
        projectCode,
        clientId: sanitizedData.clientId,
        projectType: sanitizedData.projectType,
        description: sanitizedData.description || null,
        internalNotes: sanitizedData.internalNotes || null,
        status: sanitizedData.status,
        priority: sanitizedData.priority,
        startDate: sanitizedData.startDate,
        endDate: sanitizedData.endDate,
        actualStartDate: sanitizedData.actualStartDate || null,
        actualEndDate: sanitizedData.actualEndDate || null,
        estimatedHours: sanitizedData.estimatedHours || null,
        budgetAmount: sanitizedData.budgetAmount || null,
        currency: sanitizedData.currency,
        billingType: sanitizedData.billingType || null,
        progressPercentage: sanitizedData.progressPercentage,
        currentPhase: sanitizedData.currentPhase || null,
        healthStatus: sanitizedData.healthStatus || null,
        createdBy: user.id,
        lastModifiedBy: user.id,
        updatedAt: new Date(),
      },
      include: {
        Client: {
          select: {
            id: true,
            companyName: true,
            clientType: true,
          },
        },
      },
    });

    // Log activity
    await logActivity(
      db,
      user.id,
      "project",
      project.id,
      "created",
      {
        projectName: project.projectName,
        status: project.status,
        client: client.companyName,
      }
    );

    // Remove budget fields for Sales users
    if (!canViewBudget(userRole)) {
      const { budgetAmount, estimatedHours, ...projectWithoutBudget } = project;
      return apiResponses.created(projectWithoutBudget, "Project created successfully");
    }

    return apiResponses.created(project, "Project created successfully");
  } catch (error) {
    return handleGenericError(error);
  }
});
