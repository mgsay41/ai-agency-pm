/**
 * Server-side dashboard data fetching service
 * Used by Server Components for initial data load
 */

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export interface DashboardStats {
  activeProjects: number;
  planningProjects: number;
  overdueProjects: number;
  activeTeamMembers: number;
  totalProjects: number;
  projectsByStatus: Record<string, number>;
  projectsByPriority: Record<string, number>;
  upcomingDeadlines: Array<{
    id: string;
    project_name: string;
    end_date: Date;
    status: string;
    priority: string;
    client_name: string;
  }>;
}

export interface Activity {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  changes: any;
  created_at: Date;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ActivityResponse {
  activities: Activity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Fetch dashboard statistics (server-side)
 */
export async function getDashboardStats(): Promise<DashboardStats | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return null;
    }

    const now = new Date();

    // Count projects by status
    const [
      activeProjects,
      planningProjects,
      overdueProjects,
      activeTeamMembers,
      totalProjects,
      projectsByStatus,
      projectsByPriority,
      upcomingDeadlines,
    ] = await Promise.all([
      // Active projects count
      db.project.count({
        where: { status: "ACTIVE" },
      }),

      // Planning projects count
      db.project.count({
        where: { status: "PLANNING" },
      }),

      // Overdue projects (ACTIVE with end_date < now)
      db.project.count({
        where: {
          status: "ACTIVE",
          endDate: {
            lt: now,
          },
        },
      }),

      // Active team members
      db.teamMember.count({
        where: { status: "ACTIVE" },
      }),

      // Total projects
      db.project.count(),

      // Projects grouped by status
      db.project.groupBy({
        by: ["status"],
        _count: {
          status: true,
        },
      }),

      // Projects grouped by priority
      db.project.groupBy({
        by: ["priority"],
        _count: {
          priority: true,
        },
      }),

      // Upcoming deadlines (next 30 days)
      db.project.findMany({
        where: {
          status: {
            in: ["ACTIVE", "PLANNING"],
          },
          endDate: {
            gte: now,
            lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          },
        },
        include: {
          Client: true,
        },
        orderBy: {
          endDate: "asc",
        },
        take: 5,
      }),
    ]);

    // Transform grouped data into records
    const statusRecord: Record<string, number> = {};
    projectsByStatus.forEach((item) => {
      statusRecord[item.status] = item._count.status;
    });

    const priorityRecord: Record<string, number> = {};
    projectsByPriority.forEach((item) => {
      priorityRecord[item.priority] = item._count.priority;
    });

    return {
      activeProjects,
      planningProjects,
      overdueProjects,
      activeTeamMembers,
      totalProjects,
      projectsByStatus: statusRecord,
      projectsByPriority: priorityRecord,
      upcomingDeadlines: upcomingDeadlines.map((project) => ({
        id: project.id,
        project_name: project.projectName,
        end_date: project.endDate,
        status: project.status,
        priority: project.priority,
        client_name: project.Client.companyName,
      })),
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return null;
  }
}

/**
 * Fetch recent activity (server-side)
 */
export async function getRecentActivity(
  page: number = 1,
  limit: number = 10
): Promise<ActivityResponse | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return null;
    }

    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      db.activityLog.findMany({
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
        skip,
      }),
      db.activityLog.count(),
    ]);

    return {
      activities: activities.map((activity) => ({
        id: activity.id,
        entity_type: activity.entityType,
        entity_id: activity.entityId,
        action: activity.action,
        changes: activity.changes,
        created_at: activity.createdAt,
        user: activity.User,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Failed to fetch recent activity:", error);
    return null;
  }
}
