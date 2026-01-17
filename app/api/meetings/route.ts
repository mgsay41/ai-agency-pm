import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { meetingSchema } from "@/lib/validations/meeting";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { sanitizeFormData } from "@/lib/sanitize";
import { getUserMeetings } from "@/lib/resource-ownership";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

/**
 * GET /api/meetings
 * Fetch meetings based on user role and participation
 * - Admin: all meetings
 * - Sales/Team Member: only meetings they participate in
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "25");
    const skip = (page - 1) * limit;

    // Filters
    const projectId = searchParams.get("projectId");
    const meetingType = searchParams.get("meetingType");
    const search = searchParams.get("search");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Sorting
    const sortBy = searchParams.get("sortBy") || "meetingDate";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build base where clause based on role
    let baseWhere: any = {};

    if (hasPermission(userRole, PERMISSIONS.MEETING_VIEW_ALL)) {
      // Admin can see all meetings
      baseWhere = {};
    } else if (hasPermission(userRole, PERMISSIONS.MEETING_VIEW_PARTICIPATING)) {
      // Sales and Team Members can see meetings they participate in
      baseWhere = {
        OR: [
          { createdBy: userId },
          {
            MeetingAttendee: {
              some: {
                memberId: userId,
              },
            },
          },
        ],
      };
    } else {
      // No permission
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Add filters
    const where: any = { ...baseWhere };

    if (projectId) {
      where.projectId = projectId;
    }

    if (meetingType) {
      where.meetingType = meetingType;
    }

    if (search) {
      where.OR = [
        ...(where.OR || []),
        {
          agenda: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          notes: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (startDate || endDate) {
      where.meetingDate = {};
      if (startDate) {
        where.meetingDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.meetingDate.lte = new Date(endDate);
      }
    }

    // Fetch meetings with pagination
    const [meetings, total] = await Promise.all([
      db.meeting.findMany({
        where,
        include: {
          MeetingAttendee: true,
          ActionItem: true,
          Project: {
            select: {
              id: true,
              projectName: true,
              projectCode: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        take: limit,
        skip,
      }),
      db.meeting.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: meetings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("GET /api/meetings error", error, { action: "fetch_meetings" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/meetings
 * Create a new meeting
 * - Admin/Sales: can create
 * - Team Member: cannot create (403)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role;

    // Check permission to create meetings
    if (!hasPermission(userRole, PERMISSIONS.MEETING_CREATE)) {
      logger.warn("Meeting creation forbidden", {
        userId: session.user.id,
        role: userRole,
        action: "create_meeting",
      });
      return NextResponse.json(
        { error: "Forbidden: You don't have permission to create meetings" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = meetingSchema.parse(body);

    // Sanitize input to prevent XSS
    const sanitizedData = sanitizeFormData(validatedData, {
      textarea: ["notes", "agenda", "transcript"],
      plainText: [],
    });

    // Sanitize attendees
    const sanitizedAttendees = sanitizedData.attendees?.map((attendee: { memberId?: string; externalName?: string; externalEmail?: string; attendeeType: string; attended?: boolean }) => {
      return sanitizeFormData(attendee, {
        plainText: ["externalName", "externalEmail"],
      });
    });

    // Sanitize action items
    const sanitizedActionItems = sanitizedData.actionItems?.map((item: { description: string; assignedTo?: string; dueDate?: Date; status?: string }) => {
      return sanitizeFormData(item, {
        textarea: ["description"],
      });
    });

    // Extract attendees and action items
    const { attendees, actionItems, ...meetingData } = sanitizedData;

    // Handle "New Project" special value - set projectId to null
    const projectId = meetingData.projectId === "__new_project__" ? null : meetingData.projectId;

    // Validate team member IDs before creating meeting
    if (sanitizedAttendees && sanitizedAttendees.length > 0) {
      const memberIds = sanitizedAttendees
        .map((a: any) => a.memberId)
        .filter(Boolean);

      if (memberIds.length > 0) {
        const validMembers = await db.teamMember.findMany({
          where: {
            id: { in: memberIds },
            status: "ACTIVE"
          },
          select: { id: true }
        });

        if (validMembers.length !== memberIds.length) {
          logger.error("Invalid team member IDs in meeting attendees", {
            providedIds: memberIds,
            validIds: validMembers.map(m => m.id),
            action: "create_meeting"
          });
          return NextResponse.json(
            { error: "Some team members not found or inactive" },
            { status: 400 }
          );
        }
      }
    }

    // Validate action item assignees
    if (sanitizedActionItems && sanitizedActionItems.length > 0) {
      const assigneeIds = sanitizedActionItems
        .map((item: any) => item.assignedTo)
        .filter(Boolean);

      if (assigneeIds.length > 0) {
        const validAssignees = await db.teamMember.findMany({
          where: {
            id: { in: assigneeIds },
            status: "ACTIVE"
          },
          select: { id: true }
        });

        if (validAssignees.length !== assigneeIds.length) {
          logger.error("Invalid team member IDs in action item assignees", {
            providedIds: assigneeIds,
            validIds: validAssignees.map(m => m.id),
            action: "create_meeting"
          });
          return NextResponse.json(
            { error: "Some action item assignees not found or inactive" },
            { status: 400 }
          );
        }
      }
    }

    // Create meeting with attendees and action items
    const meeting = await db.meeting.create({
      data: {
        id: crypto.randomUUID(),
        ...meetingData,
        projectId,
        createdBy: session.user.id,
        updatedAt: new Date(),
        MeetingAttendee: sanitizedAttendees
          ? {
              create: sanitizedAttendees.map((attendee: { memberId?: string; externalName?: string; externalEmail?: string; attendeeType: string; attended?: boolean }) => ({
                id: crypto.randomUUID(),
                memberId: attendee.memberId,
                externalName: attendee.externalName,
                externalEmail: attendee.externalEmail,
                attendeeType: attendee.attendeeType,
                attended: attendee.attended,
              })),
            }
          : undefined,
        ActionItem: sanitizedActionItems
          ? {
              create: sanitizedActionItems.map((item: { description: string; assignedTo?: string; dueDate?: Date; status?: string }) => ({
                id: crypto.randomUUID(),
                description: item.description,
                assignedTo: item.assignedTo,
                dueDate: item.dueDate,
                status: item.status || "OPEN",
                updatedAt: new Date(),
              })),
            }
          : undefined,
      },
      include: {
        Project: {
          select: {
            id: true,
            projectName: true,
            projectCode: true,
          },
        },
        MeetingAttendee: {
          include: {
            TeamMember: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatarColor: true,
              },
            },
          },
        },
        ActionItem: {
          include: {
            TeamMember: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        entityType: "meeting",
        entityId: meeting.id,
        action: "created",
        changes: {
          projectId: meeting.projectId,
          meetingType: meeting.meetingType,
          meetingDate: meeting.meetingDate,
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: meeting,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    logger.error("POST /api/meetings error", error, { action: "create_meeting" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
