import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { actionSchema } from "@/lib/validations/action";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { sanitizeFormData } from "@/lib/sanitize";
import { getUserActions } from "@/lib/resource-ownership";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

/**
 * GET /api/actions
 * Fetch actions based on user role
 * - Admin: all actions
 * - Sales: actions on their projects
 * - Team Member: actions assigned to them
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

    // Use role-based filtering from resource-ownership service
    const actions = await getUserActions(userId, userRole);

    return NextResponse.json({
      success: true,
      data: actions,
    });
  } catch (error) {
    logger.error("GET /api/actions error", error, { action: "fetch_actions" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/actions
 * Create a new action item
 * - Admin only (or project managers in future)
 * - Sales/Team Member: cannot create (403)
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

    // Check permission to create actions
    if (!hasPermission(userRole, PERMISSIONS.ACTION_CREATE)) {
      logger.warn("Action creation forbidden", {
        userId: session.user.id,
        role: userRole,
        action: "create_action",
      });
      return NextResponse.json(
        { error: "Forbidden: You don't have permission to create action items" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = actionSchema.parse(body);

    // Sanitize input to prevent XSS
    const sanitizedData = sanitizeFormData(validatedData, {
      textarea: ["description"],
      plainText: [],
    });

    // Verify meeting exists
    const meeting = await db.meeting.findUnique({
      where: { id: sanitizedData.meetingId },
    });

    if (!meeting) {
      return NextResponse.json(
        { error: "Meeting not found" },
        { status: 404 }
      );
    }

    // Create action item
    const action = await db.actionItem.create({
      data: {
        id: crypto.randomUUID(),
        ...sanitizedData,
        status: sanitizedData.status || "OPEN",
        updatedAt: new Date(),
      },
      include: {
        Meeting: {
          select: {
            id: true,
            meetingDate: true,
            Project: {
              select: {
                id: true,
                projectName: true,
              },
            },
          },
        },
        TeamMember: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        entityType: "action",
        entityId: action.id,
        action: "created",
        changes: {
          meetingId: action.meetingId,
          description: action.description,
          assignedTo: action.assignedTo,
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: action,
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

    logger.error("POST /api/actions error", error, { action: "create_action" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
