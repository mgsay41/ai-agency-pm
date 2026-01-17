import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withRole } from "@/lib/api-middleware";
import {
  updateTaskSchema,
  type UpdateTaskInput,
} from "@/lib/validations/task";
import { ZodError } from "zod";

// GET /api/tasks/[id] - Get task details
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
          { error: "Task ID is required" },
          { status: 400 }
        );
      }

      const task = await db.task.findUnique({
        where: { id },
        include: {
          Project: {
            select: {
              id: true,
              projectName: true,
              projectCode: true,
            },
          },
          AssignedToMember: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarColor: true,
              roleTitle: true,
            },
          },
          Milestone: {
            select: {
              id: true,
              name: true,
              status: true,
              targetDate: true,
            },
          },
          ParentTask: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
          Subtasks: {
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
          TimeEntry: {
            include: {
              TeamMember: {
                select: {
                  id: true,
                  fullName: true,
                },
              },
            },
            orderBy: {
              workDate: "desc",
            },
          },
        },
      });

      if (!task) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: { task },
      });
    } catch (error) {
      console.error("GET /api/tasks/[id] error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },
  ["ADMIN", "SALES", "TEAM_MEMBER"]
);

// PATCH /api/tasks/[id] - Update task
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
          { error: "Task ID is required" },
          { status: 400 }
        );
      }

      // Check if task exists
      const existingTask = await db.task.findUnique({
        where: { id },
        select: {
          id: true,
          status: true,
          projectId: true,
        },
      });

      if (!existingTask) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
      }

      const body = await request.json();
      const sanitizedData: UpdateTaskInput = updateTaskSchema.parse(body);

      // Validate milestone if provided
      if (sanitizedData.milestoneId) {
        const milestone = await db.milestone.findFirst({
          where: {
            id: sanitizedData.milestoneId,
            projectId: existingTask.projectId,
          },
        });

        if (!milestone) {
          return NextResponse.json(
            { error: "Milestone not found or does not belong to this project" },
            { status: 400 }
          );
        }
      }

      // Validate assignee if provided
      if (sanitizedData.assignedTo) {
        const member = await db.teamMember.findUnique({
          where: {
            id: sanitizedData.assignedTo,
            status: "ACTIVE",
          },
        });

        if (!member) {
          return NextResponse.json(
            { error: "Assigned team member not found or inactive" },
            { status: 400 }
          );
        }
      }

      // Auto-set completedAt when status changes to COMPLETED
      const updateData: any = { ...sanitizedData };
      if (
        sanitizedData.status === "COMPLETED" &&
        existingTask.status !== "COMPLETED"
      ) {
        updateData.completedAt = updateData.completedAt || new Date();
      }

      // Clear completedAt if status changes from COMPLETED to other status
      if (
        sanitizedData.status &&
        sanitizedData.status !== "COMPLETED" &&
        existingTask.status === "COMPLETED"
      ) {
        updateData.completedAt = null;
      }

      const task = await db.task.update({
        where: { id },
        data: updateData,
        include: {
          AssignedToMember: {
            select: {
              id: true,
              fullName: true,
              avatarColor: true,
            },
          },
          Milestone: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: { task },
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

      console.error("PATCH /api/tasks/[id] error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },
  ["ADMIN", "SALES", "TEAM_MEMBER"]
);

// DELETE /api/tasks/[id] - Delete task
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
          { error: "Task ID is required" },
          { status: 400 }
        );
      }

      // Check if task has subtasks
      const subtaskCount = await db.task.count({
        where: { parentTaskId: id },
      });

      if (subtaskCount > 0) {
        return NextResponse.json(
          {
            error: `Cannot delete task with ${subtaskCount} subtask(s). Please delete subtasks first.`,
            subtaskCount,
          },
          { status: 409 }
        );
      }

      // Check if task has time entries
      const timeEntryCount = await db.timeEntry.count({
        where: { taskId: id },
      });

      if (timeEntryCount > 0) {
        return NextResponse.json(
          {
            error: `Cannot delete task with ${timeEntryCount} time entr${timeEntryCount === 1 ? "y" : "ies"}. Please delete or reassign time entries first.`,
            timeEntryCount,
          },
          { status: 409 }
        );
      }

      await db.task.delete({
        where: { id },
      });

      return NextResponse.json({
        success: true,
        message: "Task deleted successfully",
      });
    } catch (error) {
      console.error("DELETE /api/tasks/[id] error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },
  ["ADMIN", "SALES"]
);
