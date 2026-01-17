import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const approveUserSchema = z.object({
  role: z.enum(["ADMIN", "TEAM_MEMBER", "SALES"]),
  projectIds: z.array(z.string()).optional(),
  teamInfo: z
    .object({
      fullName: z.string().min(1),
      roleTitle: z.string().min(1),
      department: z.enum([
        "DEVELOPMENT",
        "DESIGN",
        "QA",
        "DEVOPS",
        "MANAGEMENT",
        "CONSULTING",
        "OTHER",
      ]),
      skills: z.array(z.string()).optional(),
      hourlyRate: z.number().optional(),
    })
    .optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { id: userId } = await params;
    const body = await request.json();
    const validatedData = approveUserSchema.parse(body);

    // Check if user exists and is pending
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        isPending: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.isPending) {
      return NextResponse.json(
        { error: "User is not pending approval" },
        { status: 400 }
      );
    }

    // Start a transaction to approve user and create team member if needed
    const result = await db.$transaction(async (tx) => {
      // Update user status
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          isPending: false,
          role: validatedData.role,
        },
      });

      // Create or update TeamMember record if team info is provided
      let teamMember = null;
      if (validatedData.teamInfo) {
        const now = new Date();

        // Check if TeamMember already exists for this user
        const existingTeamMember = await tx.teamMember.findUnique({
          where: { userId: userId },
        });

        if (existingTeamMember) {
          // Update existing team member
          teamMember = await tx.teamMember.update({
            where: { userId: userId },
            data: {
              fullName: validatedData.teamInfo.fullName,
              roleTitle: validatedData.teamInfo.roleTitle,
              department: validatedData.teamInfo.department,
              skills: validatedData.teamInfo.skills || [],
              hourlyRate: validatedData.teamInfo.hourlyRate,
              status: "ACTIVE",
              updatedAt: now,
            },
          });
        } else {
          // Create new team member
          const teamMemberId = `tm-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

          teamMember = await tx.teamMember.create({
            data: {
              id: teamMemberId,
              userId: userId,
              fullName: validatedData.teamInfo.fullName,
              email: user.email,
              roleTitle: validatedData.teamInfo.roleTitle,
              department: validatedData.teamInfo.department,
              skills: validatedData.teamInfo.skills || [],
              hourlyRate: validatedData.teamInfo.hourlyRate,
              status: "ACTIVE",
              createdAt: now,
              updatedAt: now,
              createdBy: session.user.id,
            },
          });
        }

        // Assign to projects if provided
        if (validatedData.projectIds && validatedData.projectIds.length > 0) {
          await tx.projectAssignment.createMany({
            data: validatedData.projectIds.map((projectId) => ({
              id: `${projectId}-${teamMember!.id}-${Date.now()}`,
              projectId,
              memberId: teamMember!.id,
              roleInProject: validatedData.teamInfo!.roleTitle,
              isActive: true,
              createdAt: now,
              updatedAt: now,
            })),
          });
        }
      }

      // Log activity
      await tx.activityLog.create({
        data: {
          id: `activity-${Date.now()}-${Math.random()}`,
          userId: session.user.id,
          entityType: "user",
          entityId: userId,
          action: "approved",
          changes: {
            role: validatedData.role,
            hasTeamMember: !!teamMember,
            projectCount: validatedData.projectIds?.length || 0,
          },
        },
      });

      return { user: updatedUser, teamMember };
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: "User approved successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("POST /api/admin/users/[id]/approve error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
