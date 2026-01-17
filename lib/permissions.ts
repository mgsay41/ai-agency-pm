/**
 * Permissions Service
 * Centralized permission checking for role-based access control
 */

import { Role } from "@prisma/client";

// Permission actions
export const PERMISSIONS = {
  // Client permissions
  CLIENT_VIEW_ALL: "client:view_all",
  CLIENT_VIEW_OWN: "client:view_own",
  CLIENT_CREATE: "client:create",
  CLIENT_EDIT_ALL: "client:edit_all",
  CLIENT_EDIT_OWN: "client:edit_own",
  CLIENT_DELETE_HARD: "client:delete_hard",
  CLIENT_DELETE_SOFT: "client:delete_soft",
  CLIENT_VIEW_DELETED: "client:view_deleted",

  // Project permissions
  PROJECT_VIEW_ALL: "project:view_all",
  PROJECT_VIEW_OWN_CLIENTS: "project:view_own_clients",
  PROJECT_VIEW_ASSIGNED: "project:view_assigned",
  PROJECT_VIEW_BUDGET: "project:view_budget",
  PROJECT_CREATE: "project:create",
  PROJECT_EDIT_ALL: "project:edit_all",
  PROJECT_EDIT_OWN: "project:edit_own",
  PROJECT_DELETE: "project:delete",

  // Meeting permissions
  MEETING_VIEW_ALL: "meeting:view_all",
  MEETING_VIEW_PARTICIPATING: "meeting:view_participating",
  MEETING_CREATE: "meeting:create",
  MEETING_EDIT_ALL: "meeting:edit_all",
  MEETING_EDIT_OWN: "meeting:edit_own",
  MEETING_DELETE_ALL: "meeting:delete_all",
  MEETING_DELETE_OWN: "meeting:delete_own",

  // Action permissions
  ACTION_VIEW_ALL: "action:view_all",
  ACTION_VIEW_PROJECT: "action:view_project",
  ACTION_VIEW_ASSIGNED: "action:view_assigned",
  ACTION_CREATE: "action:create",
  ACTION_EDIT_ALL: "action:edit_all",
  ACTION_EDIT_STATUS_OWN: "action:edit_status_own",
  ACTION_DELETE: "action:delete",

  // Team permissions
  TEAM_VIEW_ALL: "team:view_all",
  TEAM_VIEW_BASIC: "team:view_basic",
  TEAM_MANAGE: "team:manage",
  TEAM_ASSIGN: "team:assign",

  // User management permissions
  USER_MANAGE: "user:manage",
  USER_DEACTIVATE: "user:deactivate",
  USER_CHANGE_ROLE: "user:change_role",

  // Dashboard permissions
  DASHBOARD_VIEW_FINANCIAL: "dashboard:view_financial",
  DASHBOARD_VIEW_FULL: "dashboard:view_full",
  DASHBOARD_VIEW_PERSONAL: "dashboard:view_personal",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Role-to-Permission mapping
 * Defines which permissions each role has
 */
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    // Clients - full access
    PERMISSIONS.CLIENT_VIEW_ALL,
    PERMISSIONS.CLIENT_CREATE,
    PERMISSIONS.CLIENT_EDIT_ALL,
    PERMISSIONS.CLIENT_DELETE_HARD,
    PERMISSIONS.CLIENT_DELETE_SOFT,
    PERMISSIONS.CLIENT_VIEW_DELETED,

    // Projects - full access including budget
    PERMISSIONS.PROJECT_VIEW_ALL,
    PERMISSIONS.PROJECT_VIEW_BUDGET,
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_EDIT_ALL,
    PERMISSIONS.PROJECT_DELETE,

    // Meetings - full access
    PERMISSIONS.MEETING_VIEW_ALL,
    PERMISSIONS.MEETING_CREATE,
    PERMISSIONS.MEETING_EDIT_ALL,
    PERMISSIONS.MEETING_DELETE_ALL,

    // Actions - full access
    PERMISSIONS.ACTION_VIEW_ALL,
    PERMISSIONS.ACTION_CREATE,
    PERMISSIONS.ACTION_EDIT_ALL,
    PERMISSIONS.ACTION_DELETE,

    // Team - full management
    PERMISSIONS.TEAM_VIEW_ALL,
    PERMISSIONS.TEAM_MANAGE,
    PERMISSIONS.TEAM_ASSIGN,

    // User management
    PERMISSIONS.USER_MANAGE,
    PERMISSIONS.USER_DEACTIVATE,
    PERMISSIONS.USER_CHANGE_ROLE,

    // Dashboard
    PERMISSIONS.DASHBOARD_VIEW_FINANCIAL,
    PERMISSIONS.DASHBOARD_VIEW_FULL,
  ],

  SALES: [
    // Clients - own clients only
    PERMISSIONS.CLIENT_VIEW_OWN,
    PERMISSIONS.CLIENT_CREATE,
    PERMISSIONS.CLIENT_EDIT_OWN,
    PERMISSIONS.CLIENT_DELETE_SOFT,

    // Projects - own clients' projects, no budget, read-only after creation
    PERMISSIONS.PROJECT_VIEW_OWN_CLIENTS,
    PERMISSIONS.PROJECT_CREATE,
    // Note: No PROJECT_EDIT_OWN - projects are read-only after creation for Sales

    // Meetings - can create and manage own
    PERMISSIONS.MEETING_VIEW_PARTICIPATING,
    PERMISSIONS.MEETING_CREATE,
    PERMISSIONS.MEETING_EDIT_OWN,
    PERMISSIONS.MEETING_DELETE_OWN,

    // Actions - view only for their projects
    PERMISSIONS.ACTION_VIEW_PROJECT,

    // Team - view only, cannot add or edit
    PERMISSIONS.TEAM_VIEW_BASIC,

    // Dashboard
    PERMISSIONS.DASHBOARD_VIEW_PERSONAL,
  ],

  TEAM_MEMBER: [
    // Clients - no direct access

    // Projects - assigned projects only, no budget
    PERMISSIONS.PROJECT_VIEW_ASSIGNED,

    // Meetings - participating only
    PERMISSIONS.MEETING_VIEW_PARTICIPATING,

    // Actions - can view and update status of assigned actions
    PERMISSIONS.ACTION_VIEW_ASSIGNED,
    PERMISSIONS.ACTION_EDIT_STATUS_OWN,

    // Team - view basic info
    PERMISSIONS.TEAM_VIEW_BASIC,

    // Dashboard
    PERMISSIONS.DASHBOARD_VIEW_PERSONAL,
  ],
};

/**
 * Check if a role has a specific permission
 * @param role - User's role
 * @param permission - Permission to check
 * @returns true if role has permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role];
  return rolePermissions.includes(permission);
}

/**
 * Check if a role has any of the specified permissions
 * @param role - User's role
 * @param permissions - Array of permissions to check
 * @returns true if role has at least one permission
 */
export function hasAnyPermission(
  role: Role,
  permissions: Permission[]
): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Check if a role has all of the specified permissions
 * @param role - User's role
 * @param permissions - Array of permissions to check
 * @returns true if role has all permissions
 */
export function hasAllPermissions(
  role: Role,
  permissions: Permission[]
): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 * @param role - User's role
 * @returns Array of permissions
 */
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role];
}

/**
 * Check if user can view a specific client
 * @param userRole - User's role
 * @param clientCreatedBy - ID of user who created the client
 * @param userId - Current user's ID
 * @returns true if user can view the client
 */
export function canViewClient(
  userRole: Role,
  clientCreatedBy: string,
  userId: string
): boolean {
  // Admin can view all clients
  if (hasPermission(userRole, PERMISSIONS.CLIENT_VIEW_ALL)) {
    return true;
  }

  // Sales can view their own clients
  if (
    hasPermission(userRole, PERMISSIONS.CLIENT_VIEW_OWN) &&
    clientCreatedBy === userId
  ) {
    return true;
  }

  return false;
}

/**
 * Check if user can edit a specific client
 * @param userRole - User's role
 * @param clientCreatedBy - ID of user who created the client
 * @param userId - Current user's ID
 * @returns true if user can edit the client
 */
export function canEditClient(
  userRole: Role,
  clientCreatedBy: string,
  userId: string
): boolean {
  // Admin can edit all clients
  if (hasPermission(userRole, PERMISSIONS.CLIENT_EDIT_ALL)) {
    return true;
  }

  // Sales can edit their own clients
  if (
    hasPermission(userRole, PERMISSIONS.CLIENT_EDIT_OWN) &&
    clientCreatedBy === userId
  ) {
    return true;
  }

  return false;
}

/**
 * Check if user can delete a specific client
 * @param userRole - User's role
 * @param clientCreatedBy - ID of user who created the client
 * @param userId - Current user's ID
 * @returns "hard" | "soft" | null
 */
export function canDeleteClient(
  userRole: Role,
  clientCreatedBy: string,
  userId: string
): "hard" | "soft" | null {
  // Admin can hard delete any client
  if (hasPermission(userRole, PERMISSIONS.CLIENT_DELETE_HARD)) {
    return "hard";
  }

  // Sales can soft delete their own clients
  if (
    hasPermission(userRole, PERMISSIONS.CLIENT_DELETE_SOFT) &&
    clientCreatedBy === userId
  ) {
    return "soft";
  }

  return null;
}

/**
 * Check if user can view project budget
 * @param userRole - User's role
 * @returns true if user can view budgets
 */
export function canViewBudget(userRole: Role): boolean {
  return hasPermission(userRole, PERMISSIONS.PROJECT_VIEW_BUDGET);
}

/**
 * Check if user can edit a specific project
 * @param userRole - User's role
 * @returns true if user can edit projects
 */
export function canEditProject(userRole: Role): boolean {
  return hasPermission(userRole, PERMISSIONS.PROJECT_EDIT_ALL);
}

/**
 * Check if user can edit a specific meeting
 * @param userRole - User's role
 * @param meetingCreatedBy - ID of user who created the meeting
 * @param userId - Current user's ID
 * @returns true if user can edit the meeting
 */
export function canEditMeeting(
  userRole: Role,
  meetingCreatedBy: string,
  userId: string
): boolean {
  // Admin can edit all meetings
  if (hasPermission(userRole, PERMISSIONS.MEETING_EDIT_ALL)) {
    return true;
  }

  // Sales can edit their own meetings
  if (
    hasPermission(userRole, PERMISSIONS.MEETING_EDIT_OWN) &&
    meetingCreatedBy === userId
  ) {
    return true;
  }

  return false;
}

/**
 * Check if user can delete a specific meeting
 * @param userRole - User's role
 * @param meetingCreatedBy - ID of user who created the meeting
 * @param userId - Current user's ID
 * @returns true if user can delete the meeting
 */
export function canDeleteMeeting(
  userRole: Role,
  meetingCreatedBy: string,
  userId: string
): boolean {
  // Admin can delete all meetings
  if (hasPermission(userRole, PERMISSIONS.MEETING_DELETE_ALL)) {
    return true;
  }

  // Sales can delete their own meetings
  if (
    hasPermission(userRole, PERMISSIONS.MEETING_DELETE_OWN) &&
    meetingCreatedBy === userId
  ) {
    return true;
  }

  return false;
}

/**
 * Check if user can update action status
 * @param userRole - User's role
 * @param actionAssignedTo - ID of user assigned to the action
 * @param userId - Current user's ID
 * @returns "full" | "status_only" | null
 */
export function canEditAction(
  userRole: Role,
  actionAssignedTo: string | null,
  userId: string
): "full" | "status_only" | null {
  // Admin can fully edit all actions
  if (hasPermission(userRole, PERMISSIONS.ACTION_EDIT_ALL)) {
    return "full";
  }

  // Team member can update status of their own actions
  if (
    hasPermission(userRole, PERMISSIONS.ACTION_EDIT_STATUS_OWN) &&
    actionAssignedTo === userId
  ) {
    return "status_only";
  }

  return null;
}

/**
 * Type guard to check if a role is valid
 * @param role - Role to check
 * @returns true if role is valid
 */
export function isValidRole(role: string): role is Role {
  return ["ADMIN", "TEAM_MEMBER", "SALES"].includes(role);
}

/**
 * Get user-friendly role name
 * @param role - Role enum value
 * @returns Human-readable role name
 */
export function getRoleName(role: Role): string {
  const roleNames: Record<Role, string> = {
    ADMIN: "Administrator",
    TEAM_MEMBER: "Team Member",
    SALES: "Sales Representative",
  };
  return roleNames[role];
}
