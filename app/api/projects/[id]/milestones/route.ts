import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withRole } from "@/lib/api-middleware";
import { generateId } from "@/lib/utils";
import {
  createMilestoneSchema,
  type CreateMilestoneInput,
} from "@/lib/validations/milestone";
import { ZodError } from "zod";

// GET /api/projects/[id]/milestones - List project milestones
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

      // Verify project exists and user has access
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

      const milestones = await db.milestone.findMany({
        where: { projectId },
        orderBy: [{ orderIndex: "asc" }, { targetDate: "asc" }],
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
        data: { milestones },
      });
    } catch (error) {
      console.error("GET /api/projects/[id]/milestones error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },
  ["ADMIN", "SALES", "TEAM_MEMBER"]
);

// POST /api/projects/[id]/milestones - Create milestone
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
      const sanitizedData: CreateMilestoneInput = createMilestoneSchema.parse({
        ...body,
        projectId, // Ensure projectId matches URL param
      });

      const milestone = await db.milestone.create({
        data: {
          id: generateId(),
          ...sanitizedData,
        },
        include: {
          Task: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: { milestone },
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

      console.error("POST /api/projects/[id]/milestones error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },
  ["ADMIN", "SALES"]
);
