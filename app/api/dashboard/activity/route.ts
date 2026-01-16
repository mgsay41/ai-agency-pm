import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Get recent activities with user information
    const activities = await db.activityLog.findMany({
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: skip,
    });

    // Get total count for pagination
    const totalCount = await db.activityLog.count();

    return NextResponse.json({
      success: true,
      data: {
        activities: activities.map((activity) => ({
          id: activity.id,
          entity_type: activity.entityType,
          entity_id: activity.entityId,
          action: activity.action,
          changes: activity.changes,
          created_at: activity.createdAt,
          user: {
            id: activity.User.id,
            name: activity.User.name,
            email: activity.User.email,
          },
        })),
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    logger.error("GET /api/dashboard/activity error", error, { action: "fetch_dashboard_activity" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
