import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  actionUpdateSchema,
  actionStatusUpdateSchema,
} from "@/lib/validations/action";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { sanitizeFormData } from "@/lib/sanitize";
import { canAccessAction } from "@/lib/resource-ownership";
import { canEditAction, hasPermission, PERMISSIONS } from "@/lib/permissions";

/**
 * GET /api/actions/[id]
 * Fetch a single action by ID
 * - Admin: can view all actions
 * - Sales: can view actions from their projects
 * - Team Member: can view actions assigned to them
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

    const { id } = resolvedParams;
    const userId = session.user.id;
    const userRole = session.user.role;

    // Check if user can access this action
    const action = await canAccessAction(userId, id, userRole);

    if (!action) {
      logger.warn("Action access denied", {
        userId,
        actionId: id,
        role: userRole,
      });
      return NextResponse.json(
        { error: "Action not found or access denied" },
        { status: 404 }
      );
    }

    // Fetch full action with relations
    const fullAction = await db.actionItem.findUnique({
      where: { id },
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
            avatarColor: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: fullAction,
    });
  } catch (error) {
    logger.error("GET /api/actions/[id] error", error, {
      action: "fetch_action_by_id",
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/actions/[id]
 * Update an action item
 * - Admin: full edit of all fields
 * - Team Member: can update status field only if assigned to them
 * - Sales: read-only (403)
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
        { error: "Action ID is required" },
        { status: 400 }
      );
    }

    const { id } = resolvedParams;
    const userId = session.user.id;
    const userRole = session.user.role;

    // Check if action exists
    const existingAction = await db.actionItem.findUnique({
      where: { id },
      select: {
        id: true,
        assignedTo: true,
        description: true,
        status: true,
      },
    });

    if (!existingAction) {
      return NextResponse.json({ error: "Action not found" }, { status: 404 });
    }

    // Check edit permission
    const editPermission = canEditAction(
      userRole,
      existingAction.assignedTo,
      userId
    );

    if (!editPermission) {
      logger.warn("Action edit forbidden", {
        userId,
        actionId: id,
        role: userRole,
        assignedTo: existingAction.assignedTo,
      });
      return NextResponse.json(
        { error: "Forbidden: You don't have permission to edit this action" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Determine which schema to use based on permission level
    let validatedData;
    if (editPermission === "status_only") {
      // Team members can only update status and completedAt
      validatedData = actionStatusUpdateSchema.parse(body);
    } else {
      // Admin can update all fields
      validatedData = actionUpdateSchema.parse(body);
    }

    // Sanitize input to prevent XSS
    const sanitizedData = sanitizeFormData(validatedData, {
      textarea: ["description"],
      plainText: [],
    });

    // Auto-set completedAt when status changes to COMPLETED
    if (sanitizedData.status === "COMPLETED" && !sanitizedData.completedAt) {
      sanitizedData.completedAt = new Date();
    }

    // Clear completedAt if status is changed from COMPLETED
    if (
      sanitizedData.status &&
      sanitizedData.status !== "COMPLETED" &&
      existingAction.status === "COMPLETED"
    ) {
      sanitizedData.completedAt = null;
    }

    // Update action
    const action = await db.actionItem.update({
      where: { id },
      data: {
        ...sanitizedData,
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
        action: "updated",
        changes: sanitizedData,
      },
    });

    return NextResponse.json({
      success: true,
      data: action,
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

    logger.error("PATCH /api/actions/[id] error", error, {
      action: "update_action",
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/actions/[id]
 * Delete an action item
 * - Admin only
 * - Sales/Team Member: cannot delete (403)
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
        { error: "Action ID is required" },
        { status: 400 }
      );
    }

    const { id } = resolvedParams;
    const userRole = session.user.role;

    // Check delete permission (Admin only)
    if (!hasPermission(userRole, PERMISSIONS.ACTION_DELETE)) {
      logger.warn("Action delete forbidden", {
        userId: session.user.id,
        actionId: id,
        role: userRole,
      });
      return NextResponse.json(
        { error: "Forbidden: You don't have permission to delete actions" },
        { status: 403 }
      );
    }

    // Check if action exists
    const action = await db.actionItem.findUnique({
      where: { id },
      select: {
        id: true,
        meetingId: true,
        description: true,
      },
    });

    if (!action) {
      return NextResponse.json({ error: "Action not found" }, { status: 404 });
    }

    // Delete action
    await db.actionItem.delete({
      where: { id },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        entityType: "action",
        entityId: id,
        action: "deleted",
        changes: {
          meetingId: action.meetingId,
          description: action.description,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Action deleted successfully",
    });
  } catch (error) {
    logger.error("DELETE /api/actions/[id] error", error, {
      action: "delete_action",
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
