import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { meetingSchema } from "@/lib/validations/meeting";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { sanitizeFormData } from "@/lib/sanitize";

/**
 * GET /api/meetings
 * Fetch all meetings with filtering, search, sorting, and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Filters
    const projectId = searchParams.get("projectId");
    const meetingType = searchParams.get("meetingType");
    const search = searchParams.get("search") || "";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Sorting
    const sortBy = searchParams.get("sortBy") || "meetingDate";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "25");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (projectId) {
      where.projectId = projectId;
    }

    if (meetingType) {
      where.meetingType = meetingType;
    }

    if (search) {
      where.OR = [
        {
          notes: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          agenda: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          transcript: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          Project: {
            projectName: {
              contains: search,
              mode: "insensitive",
            },
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

    // Build orderBy
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Fetch meetings with relations
    const [meetings, total] = await Promise.all([
      db.meeting.findMany({
        where,
        include: {
          Project: {
            select: {
              id: true,
              projectName: true,
              projectCode: true,
            },
          },
          User: {
            select: {
              id: true,
              name: true,
              email: true,
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
        orderBy,
        skip,
        take: limit,
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
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = meetingSchema.parse(body);

    // Sanitize input to prevent XSS
    const sanitizedData = sanitizeFormData(validatedData, {
      textarea: ["notes", "agenda", "transcript"],
      plainText: [],
    });

    // Sanitize attendees
    const sanitizedAttendees = sanitizedData.attendees?.map((attendee: any) => {
      return sanitizeFormData(attendee, {
        plainText: ["externalName", "externalEmail"],
      });
    });

    // Sanitize action items
    const sanitizedActionItems = sanitizedData.actionItems?.map((item: any) => {
      return sanitizeFormData(item, {
        textarea: ["description"],
      });
    });

    // Extract attendees and action items
    const { attendees, actionItems, ...meetingData } = sanitizedData;

    // Handle "New Project" special value - set projectId to null
    const projectId = meetingData.projectId === "__new_project__" ? null : meetingData.projectId;

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
              create: sanitizedAttendees.map((attendee: any) => ({
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
              create: sanitizedActionItems.map((item: any) => ({
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
  } catch (error: any) {
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
