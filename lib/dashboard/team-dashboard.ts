import { db } from "@/lib/db";

export interface TeamDashboardData {
  assignedProjects: number;
  activeProjects: number;
  assignedActions: number;
  pendingActions: number;
  upcomingMeetings: number;
  myProjects: {
    id: string;
    projectName: string;
    status: string;
    priority: string;
    client: {
      name: string;
    };
    startDate: Date;
    endDate: Date | null;
    progressPercentage: number | null;
  }[];
  myActions: {
    id: string;
    description: string;
    status: string;
    dueDate: Date | null;
    Project: {
      projectName: string;
    };
  }[];
  actionsByStatus: {
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
    } | null;
  }[];
}

export async function getTeamDashboardData(
  userId: string
): Promise<TeamDashboardData> {
  // Get assigned projects count
  const [assignedProjects, activeProjects] = await Promise.all([
    db.projectAssignment.count({
      where: {
        memberId: userId,
      },
    }),
    db.projectAssignment.count({
      where: {
        memberId: userId,
        Project: {
          status: "ACTIVE",
        },
      },
    }),
  ]);

  // Get assigned actions count
  const [assignedActions, pendingActions] = await Promise.all([
    db.actionItem.count({
      where: {
        assignedTo: userId,
      },
    }),
    db.actionItem.count({
      where: {
        assignedTo: userId,
        status: {
          in: ["OPEN", "IN_PROGRESS"],
        },
      },
    }),
  ]);

  // Get upcoming meetings (where user is a participant)
  const upcomingMeetings = await db.meetingAttendee.count({
    where: {
      memberId: userId,
      Meeting: {
        meetingDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  // Get my projects with client name only (no budget)
  const myProjectsList = await db.project.findMany({
    where: {
      ProjectAssignment: {
        some: {
          memberId: userId,
        },
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

  // Get my actions
  const myActionsList = await db.actionItem.findMany({
    where: {
      assignedTo: userId,
    },
    take: 10,
    orderBy: [
      {
        dueDate: "asc",
      },
      {
        status: "asc",
      },
    ],
    include: {
      Meeting: {
        include: {
          Project: {
            select: {
              projectName: true,
            },
          },
        },
      },
    },
  });

  // Get actions by status
  const actionsByStatus = await db.actionItem.groupBy({
    by: ["status"],
    where: {
      assignedTo: userId,
    },
    _count: {
      status: true,
    },
  });

  // Get upcoming meetings list
  const upcomingMeetingsList = await db.meeting.findMany({
    where: {
      MeetingAttendee: {
        some: {
          memberId: userId,
        },
      },
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
        },
      },
    },
  });

  return {
    assignedProjects,
    activeProjects,
    assignedActions,
    pendingActions,
    upcomingMeetings,
    myProjects: myProjectsList.map((project) => ({
      id: project.id,
      projectName: project.projectName,
      status: project.status,
      priority: project.priority,
      client: {
        name: project.Client.companyName, // Only client name, no other details
      },
      startDate: project.startDate,
      endDate: project.endDate,
      progressPercentage: project.progressPercentage,
    })),
    myActions: myActionsList.map((action) => ({
      id: action.id,
      description: action.description,
      status: action.status,
      dueDate: action.dueDate,
      Project: {
        projectName: action.Meeting.Project?.projectName || "No project",
      },
    })),
    actionsByStatus: actionsByStatus.map((item) => ({
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
          }
        : null,
    })),
  };
}
