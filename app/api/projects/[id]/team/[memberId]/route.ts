import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  createSuccessResponse,
  handleGenericError,
  unauthorizedError,
  notFoundError,
  logActivity,
} from "@/lib/api-error";

/**
 * DELETE /api/projects/[id]/team/[memberId]
 * Remove a team member from a project
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return unauthorizedError();
    }

    const { id: projectId, memberId } = await params;

    // Check if project exists
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { id: true, projectName: true },
    });

    if (!project) {
      return notFoundError("Project");
    }

    // Find the assignment to remove
    const assignment = await db.projectAssignment.findFirst({
      where: {
        projectId,
        memberId,
        isActive: true,
      },
      include: {
        TeamMember: {
          select: {
            fullName: true,
          },
        },
      },
    });

    if (!assignment) {
      return notFoundError("Assignment");
    }

    // Log activity before deletion
    await logActivity(
      db,
      session.user.id,
      "project_assignment",
      assignment.id,
      "deleted",
      {
        projectName: project.projectName,
        memberName: assignment.TeamMember.fullName,
        role: assignment.roleInProject,
      }
    );

    // Delete the assignment
    await db.projectAssignment.delete({
      where: { id: assignment.id },
    });

    return createSuccessResponse(
      { id: assignment.id },
      "Team member removed from project successfully"
    );
  } catch (error) {
    return handleGenericError(error);
  }
}

/**
 * PUT /api/projects/[id]/team/[memberId]
 * Update a team member's assignment details
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return unauthorizedError();
    }

    const { id: projectId, memberId } = await params;

    // Parse request body
    const body = await request.json();
    const { roleInProject, allocationPercentage, startDate, endDate, notes } =
      body;

    // Find the assignment to update
    const assignment = await db.projectAssignment.findFirst({
      where: {
        projectId,
        memberId,
        isActive: true,
      },
    });

    if (!assignment) {
      return notFoundError("Assignment");
    }

    // Update assignment
    const updatedAssignment = await db.projectAssignment.update({
      where: { id: assignment.id },
      data: {
        roleInProject: roleInProject || assignment.roleInProject,
        allocationPercentage:
          allocationPercentage !== undefined
            ? allocationPercentage
            : assignment.allocationPercentage,
        startDate: startDate !== undefined ? startDate : assignment.startDate,
        endDate: endDate !== undefined ? endDate : assignment.endDate,
        notes: notes !== undefined ? notes : assignment.notes,
        updatedAt: new Date(),
      },
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
        Project: {
          select: {
            id: true,
            projectName: true,
          },
        },
      },
    });

    // Log activity
    await logActivity(
      db,
      session.user.id,
      "project_assignment",
      assignment.id,
      "updated",
      {
        projectName: updatedAssignment.Project.projectName,
        memberName: updatedAssignment.TeamMember.fullName,
      }
    );

    return createSuccessResponse(
      updatedAssignment,
      "Assignment updated successfully"
    );
  } catch (error) {
    return handleGenericError(error);
  }
}
