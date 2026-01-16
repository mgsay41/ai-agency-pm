import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateProjectSchema, type UpdateProjectInput } from "@/lib/validations/project";
import {
  createSuccessResponse,
  handleGenericError,
  unauthorizedError,
  notFoundError,
  logActivity,
} from "@/lib/api-error";
import { getProjectById } from "@/lib/services/project.service";
import { sanitizeFormData } from "@/lib/sanitize";

/**
 * GET /api/projects/[id]
 * Get a single project by ID with all relations
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return unauthorizedError();
    }

    const { id: projectId } = await params;

    // Get project with all relations
    const project = await getProjectById(projectId);

    if (!project) {
      return notFoundError("Project");
    }

    return createSuccessResponse(project);
  } catch (error) {
    return handleGenericError(error);
  }
}

/**
 * PUT /api/projects/[id]
 * Update a project
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return unauthorizedError();
    }

    const { id: projectId } = await params;

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
      },
    });

    if (!existingProject) {
      return notFoundError("Project");
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
    const changes: any = {};
    Object.keys(sanitizedData).forEach((key) => {
      if (sanitizedData[key as keyof UpdateProjectInput] !== undefined) {
        changes[key] = {
          old: (existingProject as any)[key],
          new: sanitizedData[key as keyof UpdateProjectInput],
        };
      }
    });

    // Update project
    const updatedProject = await db.project.update({
      where: { id: projectId },
      data: {
        ...sanitizedData,
        lastModifiedBy: session.user.id,
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
    await logActivity(
      db,
      session.user.id,
      "project",
      projectId,
      "updated",
      changes
    );

    return createSuccessResponse(
      updatedProject,
      "Project updated successfully"
    );
  } catch (error) {
    return handleGenericError(error);
  }
}

/**
 * DELETE /api/projects/[id]
 * Soft delete a project (sets deletedAt timestamp)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return unauthorizedError();
    }

    const { id: projectId } = await params;

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
      return notFoundError("Project");
    }

    // Log activity before deletion
    await logActivity(
      db,
      session.user.id,
      "project",
      projectId,
      "deleted",
      {
        projectName: existingProject.projectName,
        status: existingProject.status,
      }
    );

    // Soft delete project (set deletedAt timestamp)
    const deletedProject = await db.project.update({
      where: { id: projectId },
      data: {
        deletedAt: new Date(),
        lastModifiedBy: session.user.id,
        updatedAt: new Date(),
      },
    });

    return createSuccessResponse(
      {
        id: projectId,
        deletedAt: deletedProject.deletedAt,
      },
      "Project deleted successfully"
    );
  } catch (error) {
    return handleGenericError(error);
  }
}
