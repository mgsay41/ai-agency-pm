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

    const { id } = await context.params;

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

    const { id } = await context.params;

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
      plainText: ["full_name", "email", "phone", "role_title", "linkedin_url", "github_url"],
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
    const updateData: any = {};

    if (sanitizedData.full_name) updateData.fullName = sanitizedData.full_name;
    if (sanitizedData.email) updateData.email = sanitizedData.email;
    if (sanitizedData.phone !== undefined) updateData.phone = sanitizedData.phone;
    if (sanitizedData.role_title) updateData.roleTitle = sanitizedData.role_title;
    if (sanitizedData.department) updateData.department = sanitizedData.department;
    if (sanitizedData.specialization !== undefined) updateData.specialization = sanitizedData.specialization;
    if (sanitizedData.skills !== undefined) updateData.skills = sanitizedData.skills;
    if (sanitizedData.hourly_rate !== undefined) updateData.hourlyRate = sanitizedData.hourly_rate;
    if (sanitizedData.currency) updateData.currency = sanitizedData.currency;
    if (sanitizedData.employment_type) updateData.employmentType = sanitizedData.employment_type;
    if (sanitizedData.start_date !== undefined) updateData.startDate = sanitizedData.start_date;
    if (sanitizedData.status) updateData.status = sanitizedData.status;
    if (sanitizedData.avatar_color) updateData.avatarColor = sanitizedData.avatar_color;
    if (sanitizedData.bio !== undefined) updateData.bio = sanitizedData.bio;
    if (sanitizedData.linkedin_url !== undefined) updateData.linkedinUrl = sanitizedData.linkedin_url;
    if (sanitizedData.github_url !== undefined) updateData.githubUrl = sanitizedData.github_url;

    // Update team member
    const updatedMember = await db.teamMember.update({
      where: { id },
      data: updateData,
    });

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
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await context.params;

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
