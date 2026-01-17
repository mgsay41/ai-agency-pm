import { db } from "@/lib/db";

export interface AdminDashboardData {
  totalProjects: number;
  activeProjects: number;
  totalClients: number;
  activeClients: number;
  totalRevenue: number;
  totalBudget: number;
  teamMembers: number;
  upcomingMeetings: number;
  projectsByStatus: {
    status: string;
    count: number;
  }[];
  recentProjects: {
    id: string;
    projectName: string;
    status: string;
    client: {
      companyName: string;
    };
    startDate: Date;
    endDate: Date | null;
    budgetAmount: number | null;
  }[];
  recentActivities: {
    id: string;
    action: string;
    entityType: string;
    createdAt: Date;
    user: {
      name: string | null;
      email: string;
    };
  }[];
  upcomingMeetingsDetails: {
    id: string;
    meetingDate: Date;
    meetingType: string;
    durationMinutes: number | null;
    locationPlatform: string | null;
    agenda: string | null;
    project: {
      projectName: string;
    } | null;
  }[];
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  // Get total and active projects
  const [totalProjects, activeProjects] = await Promise.all([
    db.project.count(),
    db.project.count({
      where: {
        status: "ACTIVE",
      },
    }),
  ]);

  // Get total and active clients
  const [totalClients, activeClients] = await Promise.all([
    db.client.count(),
    db.client.count({
      where: {
        isActive: true,
      },
    }),
  ]);

  // Get financial metrics - Note: there's no revenueAmount field in Project model
  const financialData = await db.project.aggregate({
    _sum: {
      budgetAmount: true,
    },
  });

  // Get team member count
  const teamMembers = await db.teamMember.count({
    where: {
      status: "ACTIVE",
    },
  });

  // Get upcoming meetings count (next 7 days)
  const upcomingMeetings = await db.meeting.count({
    where: {
      meetingDate: {
        gte: new Date(),
        lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    },
  });

  // Get projects by status
  const projectsByStatus = await db.project.groupBy({
    by: ["status"],
    _count: {
      status: true,
    },
  });

  // Get recent projects
  const recentProjects = await db.project.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      Client: {
        select: {
          companyName: true,
        },
      },
    },
  });

  // Get recent activities
  const recentActivities = await db.activityLog.findMany({
    take: 10,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      User: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  // Get upcoming meetings for this week
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + 7);

  const upcomingMeetingsDetails = await db.meeting.findMany({
    where: {
      meetingDate: {
        gte: today,
        lte: endOfWeek,
      },
    },
    orderBy: {
      meetingDate: "asc",
    },
    include: {
      Project: {
        select: {
          projectName: true,
        },
      },
    },
    take: 10,
  });

  return {
    totalProjects,
    activeProjects,
    totalClients,
    activeClients,
    totalRevenue: 0, // No revenueAmount field in schema
    totalBudget: Number(financialData._sum.budgetAmount) || 0,
    teamMembers,
    upcomingMeetings,
    projectsByStatus: projectsByStatus.map((item) => ({
      status: item.status,
      count: item._count.status,
    })),
    recentProjects: recentProjects.map((project) => ({
      id: project.id,
      projectName: project.projectName,
      status: project.status,
      client: {
        companyName: project.Client.companyName,
      },
      startDate: project.startDate,
      endDate: project.endDate,
      budgetAmount: project.budgetAmount ? Number(project.budgetAmount) : null,
    })),
    recentActivities: recentActivities.map((activity) => ({
      id: activity.id,
      action: activity.action,
      entityType: activity.entityType,
      createdAt: activity.createdAt,
      user: {
        name: activity.User?.name || null,
        email: activity.User?.email || "",
      },
    })),
    upcomingMeetingsDetails: upcomingMeetingsDetails.map((meeting) => ({
      id: meeting.id,
      meetingDate: meeting.meetingDate,
      meetingType: meeting.meetingType,
      durationMinutes: meeting.durationMinutes,
      locationPlatform: meeting.locationPlatform,
      agenda: meeting.agenda,
      project: meeting.Project
        ? {
            projectName: meeting.Project.projectName,
          }
        : null,
    })),
  };
}
