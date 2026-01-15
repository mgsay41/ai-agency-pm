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

    // Check if project exists
    const existingProject = await db.project.findUnique({
      where: { id: projectId },
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

    // Track changes for activity log
    const changes: any = {};
    Object.keys(validatedData).forEach((key) => {
      if (validatedData[key as keyof UpdateProjectInput] !== undefined) {
        changes[key] = {
          old: (existingProject as any)[key],
          new: validatedData[key as keyof UpdateProjectInput],
        };
      }
    });

    // Update project
    const updatedProject = await db.project.update({
      where: { id: projectId },
      data: {
        ...validatedData,
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
 * Delete a project
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

    // Check if project exists
    const existingProject = await db.project.findUnique({
      where: { id: projectId },
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

    // Delete project (cascade will handle related records)
    await db.project.delete({
      where: { id: projectId },
    });

    return createSuccessResponse(
      { id: projectId },
      "Project deleted successfully"
    );
  } catch (error) {
    return handleGenericError(error);
  }
}
