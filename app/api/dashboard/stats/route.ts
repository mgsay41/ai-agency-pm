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

    // Calculate total active projects
    const activeProjectsCount = await db.project.count({
      where: {
        status: "ACTIVE",
      },
    });

    // Calculate projects in planning
    const planningProjectsCount = await db.project.count({
      where: {
        status: "PLANNING",
      },
    });

    // Calculate overdue projects (endDate < today and status not completed/archived)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueProjectsCount = await db.project.count({
      where: {
        endDate: {
          lt: today,
        },
        status: {
          notIn: ["COMPLETED", "ARCHIVED"],
        },
      },
    });

    // Count active team members
    const activeTeamMembersCount = await db.teamMember.count({
      where: {
        status: "ACTIVE",
      },
    });

    // Get projects by status for breakdown
    const projectsByStatus = await db.project.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    });

    // Get upcoming deadlines (projects ending in next 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const upcomingDeadlines = await db.project.findMany({
      where: {
        endDate: {
          gte: today,
          lte: sevenDaysFromNow,
        },
        status: {
          notIn: ["COMPLETED", "ARCHIVED"],
        },
      },
      include: {
        Client: {
          select: {
            companyName: true,
          },
        },
      },
      orderBy: {
        endDate: "asc",
      },
      take: 5,
    });

    // Get total projects count
    const totalProjectsCount = await db.project.count();

    // Get projects by priority
    const projectsByPriority = await db.project.groupBy({
      by: ["priority"],
      _count: {
        id: true,
      },
      where: {
        status: {
          notIn: ["COMPLETED", "ARCHIVED"],
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        activeProjects: activeProjectsCount,
        planningProjects: planningProjectsCount,
        overdueProjects: overdueProjectsCount,
        activeTeamMembers: activeTeamMembersCount,
        totalProjects: totalProjectsCount,
        projectsByStatus: projectsByStatus.reduce((acc, curr) => {
          acc[curr.status] = curr._count.id;
          return acc;
        }, {} as Record<string, number>),
        projectsByPriority: projectsByPriority.reduce((acc, curr) => {
          acc[curr.priority] = curr._count.id;
          return acc;
        }, {} as Record<string, number>),
        upcomingDeadlines: upcomingDeadlines.map((project) => ({
          id: project.id,
          project_name: project.projectName,
          end_date: project.endDate,
          status: project.status,
          priority: project.priority,
          client_name: project.Client.companyName,
        })),
      },
    });
  } catch (error) {
    logger.error("GET /api/dashboard/stats error", error, { action: "fetch_dashboard_stats" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
