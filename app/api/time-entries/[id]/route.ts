import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withRole } from "@/lib/api-middleware";
import {
  updateTimeEntrySchema,
  type UpdateTimeEntryInput,
} from "@/lib/validations/time-entry";
import { ZodError } from "zod";

// GET /api/time-entries/[id] - Get time entry details
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
          { error: "Time entry ID is required" },
          { status: 400 }
        );
      }

      const timeEntry = await db.timeEntry.findUnique({
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
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
          TeamMember: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarColor: true,
              roleTitle: true,
            },
          },
          ApprovedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!timeEntry) {
        return NextResponse.json(
          { error: "Time entry not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: { timeEntry },
      });
    } catch (error) {
      console.error("GET /api/time-entries/[id] error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },
  ["ADMIN", "SALES", "TEAM_MEMBER"]
);

// PATCH /api/time-entries/[id] - Update time entry
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
          { error: "Time entry ID is required" },
          { status: 400 }
        );
      }

      // Check if time entry exists
      const existingEntry = await db.timeEntry.findUnique({
        where: { id },
        select: {
          id: true,
          projectId: true,
          memberId: true,
          isApproved: true,
        },
      });

      if (!existingEntry) {
        return NextResponse.json(
          { error: "Time entry not found" },
          { status: 404 }
        );
      }

      // Only ADMIN/SALES can edit approved entries or entries they don't own
      const userRole = session.user.role;
      const userId = session.user.id;

      if (
        existingEntry.isApproved &&
        userRole !== "ADMIN" &&
        userRole !== "SALES"
      ) {
        return NextResponse.json(
          { error: "Cannot edit approved time entries" },
          { status: 403 }
        );
      }

      const body = await request.json();
      const sanitizedData: UpdateTimeEntryInput =
        updateTimeEntrySchema.parse(body);

      // Validate task if provided
      if (sanitizedData.taskId) {
        const task = await db.task.findFirst({
          where: {
            id: sanitizedData.taskId,
            projectId: existingEntry.projectId,
          },
        });

        if (!task) {
          return NextResponse.json(
            { error: "Task not found or does not belong to this project" },
            { status: 400 }
          );
        }
      }

      const timeEntry = await db.timeEntry.update({
        where: { id },
        data: sanitizedData,
        include: {
          Project: {
            select: {
              id: true,
              projectName: true,
            },
          },
          Task: {
            select: {
              id: true,
              title: true,
            },
          },
          TeamMember: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: { timeEntry },
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

      console.error("PATCH /api/time-entries/[id] error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },
  ["ADMIN", "SALES", "TEAM_MEMBER"]
);

// DELETE /api/time-entries/[id] - Delete time entry
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
          { error: "Time entry ID is required" },
          { status: 400 }
        );
      }

      // Check if time entry exists and is approved
      const existingEntry = await db.timeEntry.findUnique({
        where: { id },
        select: {
          id: true,
          isApproved: true,
        },
      });

      if (!existingEntry) {
        return NextResponse.json(
          { error: "Time entry not found" },
          { status: 404 }
        );
      }

      // Only ADMIN can delete approved time entries
      if (existingEntry.isApproved && session.user.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Only administrators can delete approved time entries" },
          { status: 403 }
        );
      }

      await db.timeEntry.delete({
        where: { id },
      });

      return NextResponse.json({
        success: true,
        message: "Time entry deleted successfully",
      });
    } catch (error) {
      console.error("DELETE /api/time-entries/[id] error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },
  ["ADMIN", "SALES", "TEAM_MEMBER"]
);
