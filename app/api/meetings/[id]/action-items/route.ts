import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { sanitizeFormData } from "@/lib/sanitize";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

// Schema for action items
const actionItemSchema = z.object({
  id: z.string().optional(), // For updates
  description: z.string().min(1, "Description is required"),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  status: z.enum(["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
});

const actionItemsUpdateSchema = z.object({
  actionItems: z.array(actionItemSchema),
});

/**
 * POST /api/meetings/[id]/action-items
 * Replace all action items for a meeting
 * - Admin: can update any meeting
 * - Sales: can update any meeting
 * - Team Member: cannot update (403)
 */
export async function POST(
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
      logger.warn("Action items update forbidden", {
        userId: session.user.id,
        meetingId: id,
        role: userRole,
      });
      return NextResponse.json(
        { error: "Forbidden: You don't have permission to update action items" },
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
    const validatedData = actionItemsUpdateSchema.parse(body);

    // Sanitize action items
    const sanitizedActionItems = validatedData.actionItems.map((item) => {
      return sanitizeFormData(item, {
        textarea: ["description"],
      });
    });

    // Validate team member IDs in action item assignees
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

    // Delete existing action items and create new ones
    await db.actionItem.deleteMany({
      where: { meetingId: id },
    });

    // Create new action items
    if (sanitizedActionItems.length > 0) {
      await db.actionItem.createMany({
        data: sanitizedActionItems.map((item: any) => ({
          id: crypto.randomUUID(),
          meetingId: id,
          description: item.description,
          assignedTo: item.assignedTo || null,
          dueDate: item.dueDate || null,
          status: item.status || "OPEN",
          updatedAt: new Date(),
        })),
      });
    }

    // Fetch updated meeting with action items
    const meeting = await db.meeting.findUnique({
      where: { id },
      include: {
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
        entityId: id,
        action: "updated_action_items",
        changes: {
          actionItemsCount: sanitizedActionItems.length,
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

    logger.error("POST /api/meetings/[id]/action-items error", error, { action: "update_action_items" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
