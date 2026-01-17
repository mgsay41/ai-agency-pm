import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { sanitizeFormData } from "@/lib/sanitize";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

// Schema for updating meeting details
const meetingDetailsSchema = z.object({
  notes: z.string().optional(),
  transcript: z.string().optional(),
  recordingUrl: z.string().url().optional().or(z.literal("")),
});

/**
 * PATCH /api/meetings/[id]/details
 * Update meeting notes, transcript, and recording URL
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
      logger.warn("Meeting details update forbidden", {
        userId: session.user.id,
        meetingId: id,
        role: userRole,
      });
      return NextResponse.json(
        { error: "Forbidden: You don't have permission to update meeting details" },
        { status: 403 }
      );
    }

    // Check if meeting exists
    const existingMeeting = await db.meeting.findUnique({
      where: { id },
      select: {
        id: true,
        notes: true,
        transcript: true,
        recordingUrl: true,
      },
    });

    if (!existingMeeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = meetingDetailsSchema.parse(body);

    // Sanitize input to prevent XSS
    const sanitizedData = sanitizeFormData(validatedData, {
      textarea: ["notes", "transcript"],
      plainText: [],
    });

    // Update meeting details
    const meeting = await db.meeting.update({
      where: { id },
      data: {
        notes: sanitizedData.notes !== undefined ? sanitizedData.notes : existingMeeting.notes,
        transcript: sanitizedData.transcript !== undefined ? sanitizedData.transcript : existingMeeting.transcript,
        recordingUrl: sanitizedData.recordingUrl !== undefined ? (sanitizedData.recordingUrl || null) : existingMeeting.recordingUrl,
        updatedAt: new Date(),
      },
      include: {
        Project: {
          select: {
            id: true,
            projectName: true,
          },
        },
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
        action: "updated_details",
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

    logger.error("PATCH /api/meetings/[id]/details error", error, { action: "update_meeting_details" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
