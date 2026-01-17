import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withRole } from "@/lib/api-middleware";

// GET /api/projects/[id]/time-entries - Get project time entries
export const GET = withRole(
  async (
    request: NextRequest,
    session: any,
    context: { params: Promise<{ id: string }> }
  ) => {
    try {
      const { id: projectId } = await context.params;

      if (!projectId) {
        return NextResponse.json(
          { error: "Project ID is required" },
          { status: 400 }
        );
      }

      // Parse query parameters
      const { searchParams } = new URL(request.url);
      const memberId = searchParams.get("memberId");
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");

      // Verify project exists
      const project = await db.project.findUnique({
        where: { id: projectId },
        select: { id: true },
      });

      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }

      // Build where clause
      const where: any = { projectId };

      if (memberId) where.memberId = memberId;

      if (startDate || endDate) {
        where.workDate = {};
        if (startDate) where.workDate.gte = new Date(startDate);
        if (endDate) where.workDate.lte = new Date(endDate);
      }

      const timeEntries = await db.timeEntry.findMany({
        where,
        orderBy: { workDate: "desc" },
        include: {
          Task: {
            select: {
              id: true,
              title: true,
            },
          },
          TeamMember: {
            select: {
              id: true,
              fullName: true,
              avatarColor: true,
            },
          },
        },
      });

      // Calculate total hours
      const totalHours = timeEntries.reduce(
        (sum, entry) => sum + parseFloat(entry.hours.toString()),
        0
      );

      // Calculate billable hours
      const billableHours = timeEntries
        .filter((entry) => entry.isBillable)
        .reduce((sum, entry) => sum + parseFloat(entry.hours.toString()), 0);

      return NextResponse.json({
        success: true,
        data: {
          timeEntries,
          summary: {
            totalHours,
            billableHours,
            nonBillableHours: totalHours - billableHours,
            entryCount: timeEntries.length,
          },
        },
      });
    } catch (error) {
      console.error("GET /api/projects/[id]/time-entries error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },
  ["ADMIN", "SALES", "TEAM_MEMBER"]
);
