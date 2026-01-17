import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserOwnershipStats, getAvailableAdmins } from "@/lib/user-management";

/**
 * GET /api/admin/users/[id]/stats
 * Get ownership statistics for a user
 * Admin only
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Get ownership statistics
    const stats = await getUserOwnershipStats(params.id);

    // Get available admins for transfer (excluding the user being deactivated)
    const availableAdmins = await getAvailableAdmins(params.id);

    return NextResponse.json(
      {
        success: true,
        data: {
          stats,
          availableAdmins,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/admin/users/[id]/stats error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
