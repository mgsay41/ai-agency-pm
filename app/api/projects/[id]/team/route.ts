import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  projectAssignmentSchema,
  type ProjectAssignmentInput,
} from "@/lib/validations/project";
import {
  createSuccessResponse,
  handleGenericError,
  unauthorizedError,
  notFoundError,
  logActivity,
} from "@/lib/api-error";

/**
 * GET /api/projects/[id]/team
 * Get all team members assigned to a project
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

    // Check if project exists
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { id: true, projectName: true },
    });

    if (!project) {
      return notFoundError("Project");
    }

    // Get all active team assignments
    const assignments = await db.projectAssignment.findMany({
      where: {
        projectId,
        isActive: true,
      },
      include: {
        TeamMember: {
          select: {
            id: true,
            fullName: true,
            email: true,
            roleTitle: true,
            department: true,
            skills: true,
            avatarColor: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return createSuccessResponse({
      projectId,
      projectName: project.projectName,
      team: assignments,
      totalMembers: assignments.length,
    });
  } catch (error) {
    return handleGenericError(error);
  }
}

/**
 * POST /api/projects/[id]/team
 * Assign a team member to a project
 */
export async function POST(
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
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { id: true, projectName: true },
    });

    if (!project) {
      return notFoundError("Project");
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validatedData: ProjectAssignmentInput =
      projectAssignmentSchema.parse(body);

    // Check if team member exists
    const teamMember = await db.teamMember.findUnique({
      where: { id: validatedData.memberId },
      select: { id: true, fullName: true, roleTitle: true },
    });

    if (!teamMember) {
      return notFoundError("Team member");
    }

    // Check if assignment already exists
    const existingAssignment = await db.projectAssignment.findUnique({
      where: {
        projectId_memberId_roleInProject: {
          projectId,
          memberId: validatedData.memberId,
          roleInProject: validatedData.roleInProject,
        },
      },
    });

    if (existingAssignment) {
      return handleGenericError(
        new Error(
          `${teamMember.fullName} is already assigned as ${validatedData.roleInProject} to this project`
        )
      );
    }

    // Create assignment
    const assignment = await db.projectAssignment.create({
      data: {
        id: crypto.randomUUID(),
        projectId,
        memberId: validatedData.memberId,
        roleInProject: validatedData.roleInProject,
        allocationPercentage: validatedData.allocationPercentage,
        startDate: validatedData.startDate || null,
        endDate: validatedData.endDate || null,
        notes: validatedData.notes || null,
        isActive: true,
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
      },
    });

    // Log activity
    await logActivity(
      db,
      session.user.id,
      "project_assignment",
      assignment.id,
      "created",
      {
        projectName: project.projectName,
        memberName: teamMember.fullName,
        role: validatedData.roleInProject,
        allocation: validatedData.allocationPercentage,
      }
    );

    return createSuccessResponse(
      assignment,
      "Team member assigned successfully",
      201
    );
  } catch (error) {
    return handleGenericError(error);
  }
}
