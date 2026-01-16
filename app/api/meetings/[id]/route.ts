import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { meetingUpdateSchema } from "@/lib/validations/meeting";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { sanitizeFormData } from "@/lib/sanitize";

/**
 * GET /api/meetings/[id]
 * Fetch a single meeting by ID
 */
export async function GET(
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

    const { id } = await params;

    const meeting = await db.meeting.findUnique({
      where: { id },
      include: {
        Project: {
          select: {
            id: true,
            projectName: true,
            projectCode: true,
            Client: {
              select: {
                id: true,
                companyName: true,
              },
            },
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
                roleTitle: true,
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
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: meeting,
    });
  } catch (error) {
    logger.error("GET /api/meetings/[id] error", error, { action: "fetch_meeting_by_id" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/meetings/[id]
 * Update a meeting
 */
export async function PUT(
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

    const { id } = await params;

    // Check if meeting exists
    const existingMeeting = await db.meeting.findUnique({
      where: { id },
    });

    if (!existingMeeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = meetingUpdateSchema.parse(body);

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

    // Update meeting
    const meeting = await db.meeting.update({
      where: { id },
      data: {
        ...meetingData,
        updatedAt: new Date(),
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

    // If attendees are provided, update them
    if (sanitizedAttendees) {
      // Delete existing attendees
      await db.meetingAttendee.deleteMany({
        where: { meetingId: id },
      });

      // Create new attendees
      await db.meetingAttendee.createMany({
        data: sanitizedAttendees.map((attendee: any) => ({
          id: crypto.randomUUID(),
          meetingId: id,
          memberId: attendee.memberId,
          externalName: attendee.externalName,
          externalEmail: attendee.externalEmail,
          attendeeType: attendee.attendeeType,
          attended: attendee.attended,
        })),
      });
    }

    // If action items are provided, update them
    if (sanitizedActionItems) {
      // Delete existing action items
      await db.actionItem.deleteMany({
        where: { meetingId: id },
      });

      // Create new action items
      await db.actionItem.createMany({
        data: sanitizedActionItems.map((item: any) => ({
          id: crypto.randomUUID(),
          meetingId: id,
          description: item.description,
          assignedTo: item.assignedTo,
          dueDate: item.dueDate,
          status: item.status || "OPEN",
          updatedAt: new Date(),
        })),
      });
    }

    // Log activity
    await db.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        entityType: "meeting",
        entityId: meeting.id,
        action: "updated",
        changes: meetingData,
      },
    });

    return NextResponse.json({
      success: true,
      data: meeting,
    });
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

    logger.error("PUT /api/meetings/[id] error", error, { action: "update_meeting" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/meetings/[id]
 * Delete a meeting
 */
export async function DELETE(
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

    const { id } = await params;

    // Check if meeting exists
    const meeting = await db.meeting.findUnique({
      where: { id },
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    // Delete meeting (cascade will handle attendees and action items)
    await db.meeting.delete({
      where: { id },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        entityType: "meeting",
        entityId: id,
        action: "deleted",
        changes: {
          projectId: meeting.projectId,
          meetingType: meeting.meetingType,
          meetingDate: meeting.meetingDate,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Meeting deleted successfully",
    });
  } catch (error) {
    logger.error("DELETE /api/meetings/[id] error", error, { action: "delete_meeting" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
