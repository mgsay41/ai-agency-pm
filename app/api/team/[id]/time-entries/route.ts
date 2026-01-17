import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withRole } from "@/lib/api-middleware";

// GET /api/team/[id]/time-entries - Get team member time entries
export const GET = withRole(
  async (
    request: NextRequest,
    session: any,
    context: { params: Promise<{ id: string }> }
  ) => {
    try {
      const { id: memberId } = await context.params;

      if (!memberId) {
        return NextResponse.json(
          { error: "Team member ID is required" },
          { status: 400 }
        );
      }

      // Parse query parameters
      const { searchParams } = new URL(request.url);
      const projectId = searchParams.get("projectId");
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");

      // Verify team member exists
      const member = await db.teamMember.findUnique({
        where: { id: memberId },
        select: { id: true, fullName: true },
      });

      if (!member) {
        return NextResponse.json(
          { error: "Team member not found" },
          { status: 404 }
        );
      }

      // Build where clause
      const where: any = { memberId };

      if (projectId) where.projectId = projectId;

      if (startDate || endDate) {
        where.workDate = {};
        if (startDate) where.workDate.gte = new Date(startDate);
        if (endDate) where.workDate.lte = new Date(endDate);
      }

      const timeEntries = await db.timeEntry.findMany({
        where,
        orderBy: { workDate: "desc" },
        include: {
          Project: {
            select: {
              id: true,
              projectName: true,
              projectCode: true,
            },
          },
          Task: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      // Calculate totals
      const totalHours = timeEntries.reduce(
        (sum, entry) => sum + parseFloat(entry.hours.toString()),
        0
      );

      const billableHours = timeEntries
        .filter((entry) => entry.isBillable)
        .reduce((sum, entry) => sum + parseFloat(entry.hours.toString()), 0);

      // Calculate total value
      const totalValue = timeEntries.reduce((sum, entry) => {
        if (entry.isBillable && entry.hourlyRate) {
          return (
            sum +
            parseFloat(entry.hours.toString()) *
              parseFloat(entry.hourlyRate.toString())
          );
        }
        return sum;
      }, 0);

      return NextResponse.json({
        success: true,
        data: {
          timeEntries,
          summary: {
            totalHours,
            billableHours,
            nonBillableHours: totalHours - billableHours,
            totalValue,
            entryCount: timeEntries.length,
          },
        },
      });
    } catch (error) {
      console.error("GET /api/team/[id]/time-entries error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },
  ["ADMIN", "SALES", "TEAM_MEMBER"]
);
