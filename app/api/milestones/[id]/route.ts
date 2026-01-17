import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withRole } from "@/lib/api-middleware";
import {
  updateMilestoneSchema,
  type UpdateMilestoneInput,
} from "@/lib/validations/milestone";
import { ZodError } from "zod";

// GET /api/milestones/[id] - Get milestone details
export const GET = withRole(
  async (
    request: NextRequest,
    session: any,
    context: { params: Promise<{ id: string }> }
  ) => {
    try {
      const { id } = await context.params;

      if (!id) {
        return NextResponse.json(
          { error: "Milestone ID is required" },
          { status: 400 }
        );
      }

      const milestone = await db.milestone.findUnique({
        where: { id },
        include: {
          Project: {
            select: {
              id: true,
              projectName: true,
              projectCode: true,
            },
          },
          Task: {
            orderBy: { orderIndex: "asc" },
            include: {
              AssignedToMember: {
                select: {
                  id: true,
                  fullName: true,
                  avatarColor: true,
                },
              },
            },
          },
        },
      });

      if (!milestone) {
        return NextResponse.json(
          { error: "Milestone not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: { milestone },
      });
    } catch (error) {
      console.error("GET /api/milestones/[id] error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },
  ["ADMIN", "SALES", "TEAM_MEMBER"]
);

// PATCH /api/milestones/[id] - Update milestone
export const PATCH = withRole(
  async (
    request: NextRequest,
    session: any,
    context: { params: Promise<{ id: string }> }
  ) => {
    try {
      const { id } = await context.params;

      if (!id) {
        return NextResponse.json(
          { error: "Milestone ID is required" },
          { status: 400 }
        );
      }

      // Check if milestone exists
      const existingMilestone = await db.milestone.findUnique({
        where: { id },
        select: { id: true, status: true },
      });

      if (!existingMilestone) {
        return NextResponse.json(
          { error: "Milestone not found" },
          { status: 404 }
        );
      }

      const body = await request.json();
      const sanitizedData: UpdateMilestoneInput =
        updateMilestoneSchema.parse(body);

      // Auto-set actualDate when status changes to COMPLETED
      const updateData: any = { ...sanitizedData };
      if (
        sanitizedData.status === "COMPLETED" &&
        existingMilestone.status !== "COMPLETED"
      ) {
        updateData.actualDate = updateData.actualDate || new Date();
      }

      // Clear actualDate if status changes from COMPLETED to other status
      if (
        sanitizedData.status &&
        sanitizedData.status !== "COMPLETED" &&
        existingMilestone.status === "COMPLETED"
      ) {
        updateData.actualDate = null;
      }

      const milestone = await db.milestone.update({
        where: { id },
        data: updateData,
        include: {
          Task: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: { milestone },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            error: "Validation error",
            details: error.errors,
          },
          { status: 400 }
        );
      }

      console.error("PATCH /api/milestones/[id] error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },
  ["ADMIN", "SALES"]
);

// DELETE /api/milestones/[id] - Delete milestone
export const DELETE = withRole(
  async (
    request: NextRequest,
    session: any,
    context: { params: Promise<{ id: string }> }
  ) => {
    try {
      const { id } = await context.params;

      if (!id) {
        return NextResponse.json(
          { error: "Milestone ID is required" },
          { status: 400 }
        );
      }

      // Check if milestone has tasks
      const taskCount = await db.task.count({
        where: { milestoneId: id },
      });

      if (taskCount > 0) {
        return NextResponse.json(
          {
            error: `Cannot delete milestone with ${taskCount} associated task(s). Please reassign or delete tasks first.`,
            taskCount,
          },
          { status: 409 }
        );
      }

      await db.milestone.delete({
        where: { id },
      });

      return NextResponse.json({
        success: true,
        message: "Milestone deleted successfully",
      });
    } catch (error) {
      console.error("DELETE /api/milestones/[id] error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },
  ["ADMIN", "SALES"]
);
