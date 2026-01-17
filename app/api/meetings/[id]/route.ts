import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { meetingUpdateSchema } from "@/lib/validations/meeting";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { sanitizeFormData } from "@/lib/sanitize";
import { canAccessMeeting } from "@/lib/resource-ownership";
import { canEditMeeting, canDeleteMeeting } from "@/lib/permissions";

/**
 * GET /api/meetings/[id]
 * Fetch a single meeting by ID
 * - Admin: can view all meetings
 * - Sales/Team Member: can only view meetings they participate in
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

    const resolvedParams = await params;
    if (!resolvedParams?.id) {
      return NextResponse.json(
        { error: "Meeting ID is required" },
        { status: 400 }
      );
    }

    const { id } = resolvedParams;
    const userId = session.user.id;
    const userRole = session.user.role;

    // Check if user can access this meeting
    const meeting = await canAccessMeeting(userId, id, userRole);

    if (!meeting) {
      logger.warn("Meeting access denied", {
        userId,
        meetingId: id,
        role: userRole,
      });
      return NextResponse.json(
        { error: "Meeting not found or access denied" },
        { status: 404 }
      );
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
 * - Admin: can edit any meeting
 * - Sales: can edit only their own meetings
 * - Team Member: read-only (403)
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

    const resolvedParams = await params;
    if (!resolvedParams?.id) {
      return NextResponse.json(
        { error: "Meeting ID is required" },
        { status: 400 }
      );
    }

    const { id } = resolvedParams;
    const userId = session.user.id;
    const userRole = session.user.role;

    // Check if meeting exists
    const existingMeeting = await db.meeting.findUnique({
      where: { id },
      select: {
        id: true,
        createdBy: true,
      },
    });

    if (!existingMeeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    // Check edit permission
    const createdBy = existingMeeting.createdBy;
    if (!createdBy) {
      return NextResponse.json(
        { error: "Meeting has no creator - cannot determine edit permissions" },
        { status: 400 }
      );
    }

    if (!canEditMeeting(userRole, createdBy, userId)) {
      logger.warn("Meeting edit forbidden", {
        userId,
        meetingId: id,
        role: userRole,
        createdBy,
      });
      return NextResponse.json(
        { error: "Forbidden: You don't have permission to edit this meeting" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = meetingUpdateSchema.parse(body);

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    // Validate team member IDs in attendees before updating
    if (sanitizedAttendees) {
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
          return NextResponse.json(
            { error: "Some team members not found or inactive" },
            { status: 400 }
          );
        }
      }
    }

    // Validate team member IDs in action item assignees before updating
    if (sanitizedActionItems) {
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
          return NextResponse.json(
            { error: "Some action item assignees not found or inactive" },
            { status: 400 }
          );
        }
      }
    }

    // If attendees are provided, update them
    if (sanitizedAttendees) {
      // Delete existing attendees
      await db.meetingAttendee.deleteMany({
        where: { meetingId: id },
      });

      // Create new attendees
      await db.meetingAttendee.createMany({
        data: sanitizedAttendees.map((attendee: { memberId?: string; externalName?: string; externalEmail?: string; attendeeType: string; attended?: boolean }) => ({
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
        data: sanitizedActionItems.map((item: { description: string; assignedTo?: string; dueDate?: Date; status?: string }) => ({
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
 * - Admin: can delete any meeting
 * - Sales: can delete only their own meetings
 * - Team Member: cannot delete (403)
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

    const resolvedParams = await params;
    if (!resolvedParams?.id) {
      return NextResponse.json(
        { error: "Meeting ID is required" },
        { status: 400 }
      );
    }

    const { id } = resolvedParams;
    const userId = session.user.id;
    const userRole = session.user.role;

    // Check if meeting exists
    const meeting = await db.meeting.findUnique({
      where: { id },
      select: {
        id: true,
        createdBy: true,
        projectId: true,
        meetingType: true,
        meetingDate: true,
      },
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    // Check delete permission
    const createdBy = meeting.createdBy;
    if (!createdBy) {
      return NextResponse.json(
        { error: "Meeting has no creator - cannot determine delete permissions" },
        { status: 400 }
      );
    }

    if (!canDeleteMeeting(userRole, createdBy, userId)) {
      logger.warn("Meeting delete forbidden", {
        userId,
        meetingId: id,
        role: userRole,
        createdBy,
      });
      return NextResponse.json(
        { error: "Forbidden: You don't have permission to delete this meeting" },
        { status: 403 }
      );
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
