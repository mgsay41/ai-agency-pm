import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { updateTeamMemberSchema } from "@/lib/validations/team";
import { handleGenericError } from "@/lib/api-error";
import { z } from "zod";
import { sanitizeFormData } from "@/lib/sanitize";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/team/[id] - Get single team member
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await context.params;
    if (!resolvedParams?.id) {
      return NextResponse.json(
        { error: "Team member ID is required" },
        { status: 400 }
      );
    }

    const { id } = resolvedParams;

    const teamMember = await db.teamMember.findUnique({
      where: { id },
      include: {
        ProjectAssignment: {
          where: {
            isActive: true,
          },
          include: {
            Project: {
              include: {
                Client: {
                  select: {
                    id: true,
                    companyName: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            ProjectAssignment: {
              where: {
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!teamMember) {
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: teamMember,
    });
  } catch (error) {
    return handleGenericError(error);
  }
}

// PUT /api/team/[id] - Update team member
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await context.params;
    if (!resolvedParams?.id) {
      return NextResponse.json(
        { error: "Team member ID is required" },
        { status: 400 }
      );
    }

    const { id } = resolvedParams;

    // Check if team member exists
    const existingMember = await db.teamMember.findUnique({
      where: { id },
    });

    if (!existingMember) {
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate input
    const validatedData = updateTeamMemberSchema.parse(body);

    // Sanitize input to prevent XSS
    const sanitizedData = sanitizeFormData(validatedData, {
      textarea: ["bio"],
      plainText: ["fullName", "email", "phone", "roleTitle", "linkedinUrl", "githubUrl"],
    });

    // If email is being changed, check if it's already in use
    if (sanitizedData.email && sanitizedData.email !== existingMember.email) {
      const emailExists = await db.teamMember.findUnique({
        where: { email: sanitizedData.email },
      });

      if (emailExists) {
        return NextResponse.json(
          {
            success: false,
            error: "A team member with this email already exists"
          },
          { status: 409 }
        );
      }
    }

    // Prepare update data
    const updateData: {
      fullName?: string;
      email?: string;
      phone?: string | null;
      roleTitle?: string;
      department?: string;
      specialization?: any;
      skills?: any;
      hourlyRate?: number | null;
      currency?: string;
      employmentType?: string;
      startDate?: Date | null;
      status?: string;
      avatarColor?: string;
      bio?: string | null;
      linkedinUrl?: string | null;
      githubUrl?: string | null;
    } = {};

    if (sanitizedData.fullName) updateData.fullName = sanitizedData.fullName;
    if (sanitizedData.email) updateData.email = sanitizedData.email;
    if (sanitizedData.phone !== undefined) updateData.phone = sanitizedData.phone;
    if (sanitizedData.roleTitle) updateData.roleTitle = sanitizedData.roleTitle;
    if (sanitizedData.department) updateData.department = sanitizedData.department;
    if (sanitizedData.specialization !== undefined) updateData.specialization = sanitizedData.specialization;
    if (sanitizedData.skills !== undefined) updateData.skills = sanitizedData.skills;
    if (sanitizedData.hourlyRate !== undefined) updateData.hourlyRate = sanitizedData.hourlyRate;
    if (sanitizedData.currency) updateData.currency = sanitizedData.currency;
    if (sanitizedData.employmentType) updateData.employmentType = sanitizedData.employmentType;
    if (sanitizedData.startDate !== undefined) updateData.startDate = sanitizedData.startDate;
    if (sanitizedData.status) updateData.status = sanitizedData.status;
    if (sanitizedData.avatarColor) updateData.avatarColor = sanitizedData.avatarColor;
    if (sanitizedData.bio !== undefined) updateData.bio = sanitizedData.bio;
    if (sanitizedData.linkedinUrl !== undefined) updateData.linkedinUrl = sanitizedData.linkedinUrl;
    if (sanitizedData.githubUrl !== undefined) updateData.githubUrl = sanitizedData.githubUrl;

    // Update team member
    const updatedMember = await db.teamMember.update({
      where: { id },
      data: updateData,
    });

    // Handle status change cascading
    if (sanitizedData.status) {
      if (sanitizedData.status === "INACTIVE") {
        // Deactivate all active project assignments
        await db.projectAssignment.updateMany({
          where: {
            memberId: id,
            isActive: true,
          },
          data: {
            isActive: false,
            endDate: new Date(),
            updatedAt: new Date(),
          },
        });

        // Log the cascade action
        await db.activityLog.create({
          data: {
            id: crypto.randomUUID(),
            userId: session.user.id,
            entityType: "team_member",
            entityId: id,
            action: "status_cascade",
            changes: {
              status: "INACTIVE",
              action: "deactivated_all_assignments",
            },
          },
        });
      } else if (sanitizedData.status === "ON_LEAVE") {
        // Log status change for project managers to review
        await db.activityLog.create({
          data: {
            id: crypto.randomUUID(),
            userId: session.user.id,
            entityType: "team_member",
            entityId: id,
            action: "status_cascade",
            changes: {
              status: "ON_LEAVE",
              action: "assignments_need_review",
              message: "Team member is on leave. Active assignments and action items may need reassignment.",
            },
          },
        });
      }
    }

    // Log activity
    await db.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        entityType: "team_member",
        entityId: id,
        action: "updated",
        changes: updateData,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Team member updated successfully",
      data: updatedMember,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return handleGenericError(error);
  }
}

// DELETE /api/team/[id] - Delete team member
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const resolvedParams = await context.params;
    if (!resolvedParams?.id) {
      return NextResponse.json(
        { error: "Team member ID is required" },
        { status: 400 }
      );
    }

    const { id } = resolvedParams;

    // Check if team member exists
    const teamMember = await db.teamMember.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            ProjectAssignment: {
              where: {
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!teamMember) {
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 }
      );
    }

    // Check if team member has active project assignments
    if (teamMember._count.ProjectAssignment > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete team member with active project assignments. Please remove them from all projects first.",
        },
        { status: 400 }
      );
    }

    // Delete team member
    await db.teamMember.delete({
      where: { id },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        entityType: "team_member",
        entityId: id,
        action: "deleted",
        changes: {
          name: teamMember.fullName,
          email: teamMember.email,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Team member deleted successfully",
    });
  } catch (error) {
    return handleGenericError(error);
  }
}
