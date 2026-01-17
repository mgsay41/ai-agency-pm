import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withRole } from "@/lib/api-middleware";
import { generateId } from "@/lib/utils";
import {
  createTaskSchema,
  type CreateTaskInput,
} from "@/lib/validations/task";
import { ZodError } from "zod";

// GET /api/projects/[id]/tasks - List project tasks
export const GET = withRole(
  async (
    request: NextRequest,
    session: any,
    context: { params: Promise<{ id: string }> }
  ) => {
    try {
      const { id: projectId } = await context.params;

      if (!projectId) {
        return NextResponse.json(
          { error: "Project ID is required" },
          { status: 400 }
        );
      }

      // Parse query parameters
      const { searchParams } = new URL(request.url);
      const milestoneId = searchParams.get("milestoneId");
      const status = searchParams.get("status");
      const assignedTo = searchParams.get("assignedTo");

      // Verify project exists
      const project = await db.project.findUnique({
        where: { id: projectId },
        select: { id: true },
      });

      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }

      const tasks = await db.task.findMany({
        where: {
          projectId,
          ...(milestoneId && { milestoneId }),
          ...(status && { status: status as any }),
          ...(assignedTo && { assignedTo }),
        },
        orderBy: [{ orderIndex: "asc" }, { createdAt: "desc" }],
        include: {
          AssignedToMember: {
            select: {
              id: true,
              fullName: true,
              avatarColor: true,
              email: true,
            },
          },
          Milestone: {
            select: {
              id: true,
              name: true,
              status: true,
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
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
          TimeEntry: {
            select: {
              id: true,
              hours: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: { tasks },
      });
    } catch (error) {
      console.error("GET /api/projects/[id]/tasks error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },
  ["ADMIN", "SALES", "TEAM_MEMBER"]
);

// POST /api/projects/[id]/tasks - Create task
export const POST = withRole(
  async (
    request: NextRequest,
    session: any,
    context: { params: Promise<{ id: string }> }
  ) => {
    try {
      const { id: projectId } = await context.params;

      if (!projectId) {
        return NextResponse.json(
          { error: "Project ID is required" },
          { status: 400 }
        );
      }

      // Verify project exists
      const project = await db.project.findUnique({
        where: { id: projectId },
        select: { id: true },
      });

      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }

      const body = await request.json();
      const sanitizedData: CreateTaskInput = createTaskSchema.parse({
        ...body,
        projectId, // Ensure projectId matches URL param
      });

      // Validate milestone exists if provided
      if (sanitizedData.milestoneId) {
        const milestone = await db.milestone.findFirst({
          where: {
            id: sanitizedData.milestoneId,
            projectId, // Must belong to same project
          },
        });

        if (!milestone) {
          return NextResponse.json(
            { error: "Milestone not found or does not belong to this project" },
            { status: 400 }
          );
        }
      }

      // Validate assignee exists if provided
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

      // Validate parent task if provided
      if (sanitizedData.parentTaskId) {
        const parentTask = await db.task.findFirst({
          where: {
            id: sanitizedData.parentTaskId,
            projectId, // Must belong to same project
          },
        });

        if (!parentTask) {
          return NextResponse.json(
            { error: "Parent task not found or does not belong to this project" },
            { status: 400 }
          );
        }
      }

      const task = await db.task.create({
        data: {
          id: generateId(),
          ...sanitizedData,
        },
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

      return NextResponse.json(
        {
          success: true,
          data: { task },
        },
        { status: 201 }
      );
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

      console.error("POST /api/projects/[id]/tasks error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },
  ["ADMIN", "SALES", "TEAM_MEMBER"]
);
