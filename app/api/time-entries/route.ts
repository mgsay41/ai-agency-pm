import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withRole } from "@/lib/api-middleware";
import { generateId } from "@/lib/utils";
import {
  createTimeEntrySchema,
  timeEntryQuerySchema,
  type CreateTimeEntryInput,
  type TimeEntryQueryInput,
} from "@/lib/validations/time-entry";
import { ZodError } from "zod";

// GET /api/time-entries - List time entries with filters
export const GET = withRole(
  async (request: NextRequest, session: any) => {
    try {
      const { searchParams } = new URL(request.url);
      const queryParams = Object.fromEntries(searchParams.entries());

      const filters: TimeEntryQueryInput =
        timeEntryQuerySchema.parse(queryParams);

      const {
        projectId,
        memberId,
        taskId,
        startDate,
        endDate,
        isBillable,
        isApproved,
        sortBy = "workDate",
        sortOrder = "desc",
        page = 1,
        limit = 25,
      } = filters;

      // Build where clause
      const where: any = {};

      if (projectId) where.projectId = projectId;
      if (memberId) where.memberId = memberId;
      if (taskId) where.taskId = taskId;
      if (isBillable !== undefined) where.isBillable = isBillable;
      if (isApproved !== undefined) where.isApproved = isApproved;

      if (startDate || endDate) {
        where.workDate = {};
        if (startDate) where.workDate.gte = startDate;
        if (endDate) where.workDate.lte = endDate;
      }

      // Get total count
      const total = await db.timeEntry.count({ where });

      // Get paginated results
      const timeEntries = await db.timeEntry.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        take: limit,
        skip: (page - 1) * limit,
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
              hourlyRate: true,
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

      return NextResponse.json({
        success: true,
        data: {
          timeEntries,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
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

      console.error("GET /api/time-entries error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },
  ["ADMIN", "SALES", "TEAM_MEMBER"]
);

// POST /api/time-entries - Create time entry
export const POST = withRole(
  async (request: NextRequest, session: any) => {
    try {
      const body = await request.json();
      const sanitizedData: CreateTimeEntryInput =
        createTimeEntrySchema.parse(body);

      // Validate project exists
      const project = await db.project.findUnique({
        where: { id: sanitizedData.projectId },
        select: { id: true },
      });

      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }

      // Validate team member exists and is active
      const member = await db.teamMember.findUnique({
        where: {
          id: sanitizedData.memberId,
          status: "ACTIVE",
        },
        select: {
          id: true,
          hourlyRate: true,
        },
      });

      if (!member) {
        return NextResponse.json(
          { error: "Team member not found or inactive" },
          { status: 400 }
        );
      }

      // Validate task if provided
      if (sanitizedData.taskId) {
        const task = await db.task.findFirst({
          where: {
            id: sanitizedData.taskId,
            projectId: sanitizedData.projectId,
          },
        });

        if (!task) {
          return NextResponse.json(
            { error: "Task not found or does not belong to this project" },
            { status: 400 }
          );
        }
      }

      // Use member's hourly rate if not provided
      const hourlyRate =
        sanitizedData.hourlyRate ||
        (member.hourlyRate ? parseFloat(member.hourlyRate.toString()) : null);

      const timeEntry = await db.timeEntry.create({
        data: {
          id: generateId(),
          ...sanitizedData,
          hourlyRate: hourlyRate,
        },
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

      return NextResponse.json(
        {
          success: true,
          data: { timeEntry },
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

      console.error("POST /api/time-entries error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },
  ["ADMIN", "SALES", "TEAM_MEMBER"]
);
