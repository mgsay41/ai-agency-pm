import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

// Schema for attendance updates
const attendanceSchema = z.object({
  attendeeId: z.string(),
  attended: z.boolean(),
});

const attendanceUpdateSchema = z.object({
  updates: z.array(attendanceSchema),
});

/**
 * PATCH /api/meetings/[id]/attendance
 * Update attendance status for meeting attendees
 * - Admin: can update any meeting
 * - Sales: can update any meeting
 * - Team Member: cannot update (403)
 */
export async function PATCH(
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
    const userRole = session.user.role;

    // Check if user has permission (Admin or Sales only)
    if (
      !hasPermission(userRole, PERMISSIONS.MEETING_EDIT_ALL) &&
      !hasPermission(userRole, PERMISSIONS.MEETING_EDIT_OWN)
    ) {
      logger.warn("Attendance update forbidden", {
        userId: session.user.id,
        meetingId: id,
        role: userRole,
      });
      return NextResponse.json(
        { error: "Forbidden: You don't have permission to update attendance" },
        { status: 403 }
      );
    }

    // Check if meeting exists
    const existingMeeting = await db.meeting.findUnique({
      where: { id },
      select: {
        id: true,
      },
    });

    if (!existingMeeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = attendanceUpdateSchema.parse(body);

    // Update each attendee's attendance status
    for (const update of validatedData.updates) {
      // Verify the attendee belongs to this meeting
      const attendee = await db.meetingAttendee.findFirst({
        where: {
          id: update.attendeeId,
          meetingId: id,
        },
      });

      if (!attendee) {
        return NextResponse.json(
          { error: `Attendee ${update.attendeeId} not found in this meeting` },
          { status: 400 }
        );
      }

      // Update attendance
      await db.meetingAttendee.update({
        where: { id: update.attendeeId },
        data: {
          attended: update.attended,
        },
      });
    }

    // Fetch updated meeting with attendees
    const meeting = await db.meeting.findUnique({
      where: { id },
      include: {
        MeetingAttendee: {
          include: {
            TeamMember: {
              select: {
                id: true,
                fullName: true,
                avatarColor: true,
                roleTitle: true,
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
        entityId: id,
        action: "updated_attendance",
        changes: {
          attendanceUpdates: validatedData.updates.length,
        },
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

    logger.error("PATCH /api/meetings/[id]/attendance error", error, { action: "update_attendance" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
