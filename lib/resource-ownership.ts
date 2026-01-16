/**
 * Resource Ownership Service
 * Verify user ownership and access rights to specific resources
 */

import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { PERMISSIONS, hasPermission } from "./permissions";

/**
 * Check if user is the owner of a client
 * @param userId - User ID to check
 * @param clientId - Client ID to verify
 * @returns true if user created the client
 */
export async function isClientOwner(
  userId: string,
  clientId: string
): Promise<boolean> {
  const client = await db.client.findUnique({
    where: { id: clientId },
    select: { createdBy: true },
  });

  return client?.createdBy === userId;
}

/**
 * Check if user can access a specific client (includes ownership and role checks)
 * @param userId - User ID to check
 * @param clientId - Client ID to verify
 * @param userRole - User's role
 * @param includeDeleted - Whether to include soft-deleted clients (admin only)
 * @returns Client data if accessible, null otherwise
 */
export async function canAccessClient(
  userId: string,
  clientId: string,
  userRole: Role,
  includeDeleted: boolean = false
) {
  // Admin can access all clients
  if (hasPermission(userRole, PERMISSIONS.CLIENT_VIEW_ALL)) {
    const where: any = { id: clientId };
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    return await db.client.findUnique({ where });
  }

  // Sales can access their own clients (not deleted)
  if (hasPermission(userRole, PERMISSIONS.CLIENT_VIEW_OWN)) {
    return await db.client.findFirst({
      where: {
        id: clientId,
        createdBy: userId,
        deletedAt: null,
      },
    });
  }

  return null;
}

/**
 * Check if user is a collaborator on a project (assigned to it)
 * @param userId - User ID to check
 * @param projectId - Project ID to verify
 * @returns true if user is assigned to the project
 */
export async function isProjectCollaborator(
  userId: string,
  projectId: string
): Promise<boolean> {
  // Check if user has an active assignment for this project
  const assignment = await db.projectAssignment.findFirst({
    where: {
      projectId,
      memberId: userId,
      isActive: true,
    },
  });

  return !!assignment;
}

/**
 * Check if user can access a specific project based on role and ownership
 * @param userId - User ID to check
 * @param projectId - Project ID to verify
 * @param userRole - User's role
 * @returns Project data if accessible (with budget removed for non-admins), null otherwise
 */
export async function canAccessProject(
  userId: string,
  projectId: string,
  userRole: Role
) {
  // Admin can access all projects with budget
  if (hasPermission(userRole, PERMISSIONS.PROJECT_VIEW_ALL)) {
    return await db.project.findUnique({
      where: { id: projectId },
      include: {
        Client: {
          select: {
            id: true,
            companyName: true,
            deletedAt: true,
          },
        },
      },
    });
  }

  // Sales can access projects for their clients (not soft-deleted)
  if (hasPermission(userRole, PERMISSIONS.PROJECT_VIEW_OWN_CLIENTS)) {
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        Client: {
          createdBy: userId,
          deletedAt: null, // Hide projects for soft-deleted clients
        },
      },
      include: {
        Client: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
    });

    // Remove budget information for Sales
    if (project) {
      return removeBudgetFields(project);
    }

    return null;
  }

  // Team member can access assigned projects
  if (hasPermission(userRole, PERMISSIONS.PROJECT_VIEW_ASSIGNED)) {
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        ProjectAssignment: {
          some: {
            memberId: userId,
            isActive: true,
          },
        },
      },
      include: {
        Client: {
          select: {
            id: true,
            companyName: true, // Team members can see client name only
          },
        },
      },
    });

    // Remove budget information for Team Members
    if (project) {
      return removeBudgetFields(project);
    }

    return null;
  }

  return null;
}

/**
 * Check if user is a participant in a meeting
 * @param userId - User ID to check
 * @param meetingId - Meeting ID to verify
 * @returns true if user created the meeting or is an attendee
 */
export async function isMeetingParticipant(
  userId: string,
  meetingId: string
): Promise<boolean> {
  const meeting = await db.meeting.findFirst({
    where: {
      id: meetingId,
      OR: [
        { createdBy: userId },
        {
          MeetingAttendee: {
            some: {
              memberId: userId,
            },
          },
        },
      ],
    },
  });

  return !!meeting;
}

/**
 * Check if user can access a specific meeting
 * @param userId - User ID to check
 * @param meetingId - Meeting ID to verify
 * @param userRole - User's role
 * @returns Meeting data if accessible, null otherwise
 */
export async function canAccessMeeting(
  userId: string,
  meetingId: string,
  userRole: Role
) {
  // Admin can access all meetings
  if (hasPermission(userRole, PERMISSIONS.MEETING_VIEW_ALL)) {
    return await db.meeting.findUnique({
      where: { id: meetingId },
      include: {
        MeetingAttendee: true,
        ActionItem: true,
      },
    });
  }

  // Sales and Team Members can access meetings they participate in
  if (hasPermission(userRole, PERMISSIONS.MEETING_VIEW_PARTICIPATING)) {
    return await db.meeting.findFirst({
      where: {
        id: meetingId,
        OR: [
          { createdBy: userId },
          {
            MeetingAttendee: {
              some: {
                memberId: userId,
              },
            },
          },
        ],
      },
      include: {
        MeetingAttendee: true,
        ActionItem: true,
      },
    });
  }

  return null;
}

/**
 * Check if user can access a specific action item
 * @param userId - User ID to check
 * @param actionId - Action ID to verify
 * @param userRole - User's role
 * @returns Action data if accessible, null otherwise
 */
export async function canAccessAction(
  userId: string,
  actionId: string,
  userRole: Role
) {
  // Admin can access all actions
  if (hasPermission(userRole, PERMISSIONS.ACTION_VIEW_ALL)) {
    return await db.actionItem.findUnique({
      where: { id: actionId },
    });
  }

  // Sales can access actions from their projects
  if (hasPermission(userRole, PERMISSIONS.ACTION_VIEW_PROJECT)) {
    return await db.actionItem.findFirst({
      where: {
        id: actionId,
        Meeting: {
          Project: {
            Client: {
              createdBy: userId,
              deletedAt: null,
            },
          },
        },
      },
    });
  }

  // Team members can access actions assigned to them
  if (hasPermission(userRole, PERMISSIONS.ACTION_VIEW_ASSIGNED)) {
    return await db.actionItem.findFirst({
      where: {
        id: actionId,
        assignedTo: userId,
      },
    });
  }

  return null;
}

/**
 * Get list of clients user can access
 * @param userId - User ID
 * @param userRole - User's role
 * @param includeDeleted - Include soft-deleted clients (admin only)
 * @returns Array of clients user can access
 */
export async function getUserClients(
  userId: string,
  userRole: Role,
  includeDeleted: boolean = false
) {
  // Admin can see all clients
  if (hasPermission(userRole, PERMISSIONS.CLIENT_VIEW_ALL)) {
    const where: any = {};
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    return await db.client.findMany({
      where,
      orderBy: { companyName: "asc" },
    });
  }

  // Sales can see their own clients (not deleted)
  if (hasPermission(userRole, PERMISSIONS.CLIENT_VIEW_OWN)) {
    return await db.client.findMany({
      where: {
        createdBy: userId,
        deletedAt: null,
      },
      orderBy: { companyName: "asc" },
    });
  }

  // Team members cannot view clients directly
  return [];
}

/**
 * Get list of projects user can access
 * @param userId - User ID
 * @param userRole - User's role
 * @returns Array of projects user can access
 */
export async function getUserProjects(userId: string, userRole: Role) {
  // Admin can see all projects with budgets
  if (hasPermission(userRole, PERMISSIONS.PROJECT_VIEW_ALL)) {
    return await db.project.findMany({
      include: {
        Client: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // Sales can see projects for their clients (not soft-deleted)
  if (hasPermission(userRole, PERMISSIONS.PROJECT_VIEW_OWN_CLIENTS)) {
    const projects = await db.project.findMany({
      where: {
        Client: {
          createdBy: userId,
          deletedAt: null, // Hide projects for soft-deleted clients
        },
      },
      include: {
        Client: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Remove budget fields for Sales
    return projects.map(removeBudgetFields);
  }

  // Team members can see assigned projects
  if (hasPermission(userRole, PERMISSIONS.PROJECT_VIEW_ASSIGNED)) {
    const projects = await db.project.findMany({
      where: {
        ProjectAssignment: {
          some: {
            memberId: userId,
            isActive: true,
          },
        },
      },
      include: {
        Client: {
          select: {
            id: true,
            companyName: true, // Team members see client name only
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Remove budget fields for Team Members
    return projects.map(removeBudgetFields);
  }

  return [];
}

/**
 * Get list of meetings user can access
 * @param userId - User ID
 * @param userRole - User's role
 * @returns Array of meetings user can access
 */
export async function getUserMeetings(userId: string, userRole: Role) {
  // Admin can see all meetings
  if (hasPermission(userRole, PERMISSIONS.MEETING_VIEW_ALL)) {
    return await db.meeting.findMany({
      include: {
        MeetingAttendee: true,
        Project: {
          select: {
            id: true,
            projectName: true,
          },
        },
      },
      orderBy: { meetingDate: "desc" },
    });
  }

  // Sales and Team Members can see meetings they participate in
  if (hasPermission(userRole, PERMISSIONS.MEETING_VIEW_PARTICIPATING)) {
    return await db.meeting.findMany({
      where: {
        OR: [
          { createdBy: userId },
          {
            MeetingAttendee: {
              some: {
                memberId: userId,
              },
            },
          },
        ],
      },
      include: {
        MeetingAttendee: true,
        Project: {
          select: {
            id: true,
            projectName: true,
          },
        },
      },
      orderBy: { meetingDate: "desc" },
    });
  }

  return [];
}

/**
 * Get list of actions user can access
 * @param userId - User ID
 * @param userRole - User's role
 * @returns Array of actions user can access
 */
export async function getUserActions(userId: string, userRole: Role) {
  // Admin can see all actions
  if (hasPermission(userRole, PERMISSIONS.ACTION_VIEW_ALL)) {
    return await db.actionItem.findMany({
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
          },
        },
      },
      orderBy: { dueDate: "asc" },
    });
  }

  // Sales can see actions from their projects
  if (hasPermission(userRole, PERMISSIONS.ACTION_VIEW_PROJECT)) {
    return await db.actionItem.findMany({
      where: {
        Meeting: {
          Project: {
            Client: {
              createdBy: userId,
              deletedAt: null,
            },
          },
        },
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
          },
        },
      },
      orderBy: { dueDate: "asc" },
    });
  }

  // Team members can see actions assigned to them
  if (hasPermission(userRole, PERMISSIONS.ACTION_VIEW_ASSIGNED)) {
    return await db.actionItem.findMany({
      where: {
        assignedTo: userId,
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
      },
      orderBy: { dueDate: "asc" },
    });
  }

  return [];
}

/**
 * Helper function to remove budget fields from project data
 * @param project - Project object
 * @returns Project without budget fields
 */
function removeBudgetFields<T extends Record<string, any>>(project: T): T {
  const { budgetAmount, estimatedHours, ...projectWithoutBudget } = project;
  return projectWithoutBudget as T;
}
