import { db } from "@/lib/db";

export interface SalesDashboardData {
  myClients: number;
  activeClients: number;
  myProjects: number;
  activeProjects: number;
  upcomingMeetings: number;
  recentClients: {
    id: string;
    companyName: string;
    contactName: string | null;
    contactEmail: string | null;
    status: string;
    createdAt: Date;
  }[];
  myProjectsList: {
    id: string;
    projectName: string;
    status: string;
    priority: string;
    client: {
      companyName: string;
    };
    startDate: Date;
    endDate: Date | null;
    progressPercentage: number | null;
  }[];
  projectsByStatus: {
    status: string;
    count: number;
  }[];
  upcomingMeetingsList: {
    id: string;
    meetingDate: Date;
    meetingType: string;
    durationMinutes: number | null;
    locationPlatform: string | null;
    agenda: string | null;
    project: {
      projectName: string;
      client: {
        companyName: string;
      };
    } | null;
  }[];
}

export async function getSalesDashboardData(
  userId: string
): Promise<SalesDashboardData> {
  // Get my clients count (only clients created by this sales user and not deleted)
  const [myClients, activeClients] = await Promise.all([
    db.client.count({
      where: {
        createdBy: userId,
        deletedAt: null,
      },
    }),
    db.client.count({
      where: {
        createdBy: userId,
        deletedAt: null,
        isActive: true,
      },
    }),
  ]);

  // Get my projects (projects for clients I created, excluding soft-deleted clients)
  const [myProjectsCount, activeProjectsCount] = await Promise.all([
    db.project.count({
      where: {
        Client: {
          createdBy: userId,
          deletedAt: null,
        },
      },
    }),
    db.project.count({
      where: {
        status: "ACTIVE",
        Client: {
          createdBy: userId,
          deletedAt: null,
        },
      },
    }),
  ]);

  // Get upcoming meetings (next 30 days) where user created the meeting
  const upcomingMeetings = await db.meeting.count({
    where: {
      createdBy: userId,
      meetingDate: {
        gte: new Date(),
        lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    },
  });

  // Get recent clients - need to get primary contact from ClientContact
  const recentClientsData = await db.client.findMany({
    where: {
      createdBy: userId,
      deletedAt: null,
    },
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      companyName: true,
      clientType: true,
      isActive: true,
      createdAt: true,
      ClientContact: {
        where: {
          isPrimary: true,
        },
        take: 1,
        select: {
          contactName: true,
          email: true,
        },
      },
    },
  });

  const recentClients = recentClientsData.map((client) => ({
    id: client.id,
    companyName: client.companyName,
    contactName: client.ClientContact[0]?.contactName || null,
    contactEmail: client.ClientContact[0]?.email || null,
    status: client.isActive ? "ACTIVE" : "INACTIVE",
    createdAt: client.createdAt,
  }));

  // Get my projects with details (no budget info)
  const myProjectsList = await db.project.findMany({
    where: {
      Client: {
        createdBy: userId,
        deletedAt: null,
      },
    },
    take: 10,
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

  // Get projects by status
  const projectsByStatus = await db.project.groupBy({
    by: ["status"],
    where: {
      Client: {
        createdBy: userId,
        deletedAt: null,
      },
    },
    _count: {
      status: true,
    },
  });

  // Get upcoming meetings list
  const upcomingMeetingsList = await db.meeting.findMany({
    where: {
      createdBy: userId,
      meetingDate: {
        gte: new Date(),
      },
    },
    take: 5,
    orderBy: {
      meetingDate: "asc",
    },
    include: {
      Project: {
        select: {
          projectName: true,
          Client: {
            select: {
              companyName: true,
            },
          },
        },
      },
    },
  });

  return {
    myClients,
    activeClients,
    myProjects: myProjectsCount,
    activeProjects: activeProjectsCount,
    upcomingMeetings,
    recentClients,
    myProjectsList: myProjectsList.map((project) => ({
      id: project.id,
      projectName: project.projectName,
      status: project.status,
      priority: project.priority,
      client: {
        companyName: project.Client.companyName,
      },
      startDate: project.startDate,
      endDate: project.endDate,
      progressPercentage: project.progressPercentage,
    })),
    projectsByStatus: projectsByStatus.map((item) => ({
      status: item.status,
      count: item._count.status,
    })),
    upcomingMeetingsList: upcomingMeetingsList.map((meeting) => ({
      id: meeting.id,
      meetingDate: meeting.meetingDate,
      meetingType: meeting.meetingType,
      durationMinutes: meeting.durationMinutes,
      locationPlatform: meeting.locationPlatform,
      agenda: meeting.agenda,
      project: meeting.Project
        ? {
            projectName: meeting.Project.projectName,
            client: {
              companyName: meeting.Project.Client.companyName,
            },
          }
        : null,
    })),
  };
}
