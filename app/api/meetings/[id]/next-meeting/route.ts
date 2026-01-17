import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { sanitizeFormData } from "@/lib/sanitize";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

// Schema for next meeting details
const nextMeetingSchema = z.object({
  nextMeetingDate: z.string().transform((val) => val ? new Date(val) : null).optional(),
  nextMeetingNotes: z.string().optional(),
});

/**
 * PATCH /api/meetings/[id]/next-meeting
 * Update next meeting date and notes
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
      logger.warn("Next meeting update forbidden", {
        userId: session.user.id,
        meetingId: id,
        role: userRole,
      });
      return NextResponse.json(
        { error: "Forbidden: You don't have permission to update next meeting details" },
        { status: 403 }
      );
    }

    // Check if meeting exists
    const existingMeeting = await db.meeting.findUnique({
      where: { id },
      select: {
        id: true,
        nextMeetingDate: true,
        nextMeetingNotes: true,
      },
    });

    if (!existingMeeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = nextMeetingSchema.parse(body);

    // Sanitize input to prevent XSS
    const sanitizedData = sanitizeFormData(validatedData, {
      textarea: ["nextMeetingNotes"],
      plainText: [],
    });

    // Update next meeting details
    const meeting = await db.meeting.update({
      where: { id },
      data: {
        nextMeetingDate: sanitizedData.nextMeetingDate !== undefined ? sanitizedData.nextMeetingDate : existingMeeting.nextMeetingDate,
        nextMeetingNotes: sanitizedData.nextMeetingNotes !== undefined ? sanitizedData.nextMeetingNotes : existingMeeting.nextMeetingNotes,
        updatedAt: new Date(),
      },
      include: {
        Project: {
          select: {
            id: true,
            projectName: true,
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
        action: "updated_next_meeting",
        changes: sanitizedData,
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

    logger.error("PATCH /api/meetings/[id]/next-meeting error", error, { action: "update_next_meeting" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
