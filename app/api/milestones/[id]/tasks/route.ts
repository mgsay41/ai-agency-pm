import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withRole } from "@/lib/api-middleware";

// GET /api/milestones/[id]/tasks - Get milestone tasks
export const GET = withRole(
  async (
    request: NextRequest,
    session: any,
    context: { params: Promise<{ id: string }> }
  ) => {
    try {
      const { id: milestoneId } = await context.params;

      if (!milestoneId) {
        return NextResponse.json(
          { error: "Milestone ID is required" },
          { status: 400 }
        );
      }

      // Verify milestone exists
      const milestone = await db.milestone.findUnique({
        where: { id: milestoneId },
        select: { id: true, projectId: true },
      });

      if (!milestone) {
        return NextResponse.json(
          { error: "Milestone not found" },
          { status: 404 }
        );
      }

      const tasks = await db.task.findMany({
        where: { milestoneId },
        orderBy: [{ orderIndex: "asc" }, { createdAt: "desc" }],
        include: {
          AssignedToMember: {
            select: {
              id: true,
              fullName: true,
              avatarColor: true,
            },
          },
          Subtasks: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: { tasks },
      });
    } catch (error) {
      console.error("GET /api/milestones/[id]/tasks error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },
  ["ADMIN", "SALES", "TEAM_MEMBER"]
);
