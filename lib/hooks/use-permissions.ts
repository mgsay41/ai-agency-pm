"use client";

import { useRole } from "@/lib/hooks/use-role";

export interface Permissions {
  // Client permissions
  canCreateClient: boolean;
  canEditClient: boolean;
  canDeleteClient: boolean;
  canViewAllClients: boolean;
  canHardDeleteClient: boolean;

  // Project permissions
  canCreateProject: boolean;
  canEditProject: boolean;
  canDeleteProject: boolean;
  canViewAllProjects: boolean;
  canViewBudget: boolean;
  canAssignTeamMembers: boolean;

  // Meeting permissions
  canCreateMeeting: boolean;
  canEditMeeting: boolean;
  canDeleteMeeting: boolean;
  canViewAllMeetings: boolean;

  // Team permissions
  canManageTeam: boolean;
  canViewTeam: boolean;
  canDeactivateUsers: boolean;
  canAssignRoles: boolean;

  // Action permissions
  canCreateAction: boolean;
  canEditAction: boolean;
  canDeleteAction: boolean;
  canUpdateActionStatus: boolean;
  canReassignAction: boolean;

  // Dashboard permissions
  canViewFinancialMetrics: boolean;
  canViewCompanyMetrics: boolean;
}

export function usePermissions(): Permissions {
  const { role } = useRole();

  // Admin has full permissions
  if (role === "ADMIN") {
    return {
      // Client permissions
      canCreateClient: true,
      canEditClient: true,
      canDeleteClient: true,
      canViewAllClients: true,
      canHardDeleteClient: true,

      // Project permissions
      canCreateProject: true,
      canEditProject: true,
      canDeleteProject: true,
      canViewAllProjects: true,
      canViewBudget: true,
      canAssignTeamMembers: true,

      // Meeting permissions
      canCreateMeeting: true,
      canEditMeeting: true,
      canDeleteMeeting: true,
      canViewAllMeetings: true,

      // Team permissions
      canManageTeam: true,
      canViewTeam: true,
      canDeactivateUsers: true,
      canAssignRoles: true,

      // Action permissions
      canCreateAction: true,
      canEditAction: true,
      canDeleteAction: true,
      canUpdateActionStatus: true,
      canReassignAction: true,

      // Dashboard permissions
      canViewFinancialMetrics: true,
      canViewCompanyMetrics: true,
    };
  }

  // Sales permissions
  if (role === "SALES") {
    return {
      // Client permissions
      canCreateClient: true,
      canEditClient: true, // Only their own clients (enforced at API level)
      canDeleteClient: true, // Soft delete only (enforced at API level)
      canViewAllClients: false, // Only see their clients
      canHardDeleteClient: false,

      // Project permissions
      canCreateProject: true, // Only for their clients
      canEditProject: false, // Read-only after creation
      canDeleteProject: false,
      canViewAllProjects: false, // Only see their client's projects
      canViewBudget: false, // Cannot see budgets
      canAssignTeamMembers: false,

      // Meeting permissions
      canCreateMeeting: true,
      canEditMeeting: true, // Only their own meetings (enforced at API level)
      canDeleteMeeting: true, // Only their own meetings (enforced at API level)
      canViewAllMeetings: false,

      // Team permissions
      canManageTeam: false,
      canViewTeam: true, // Read-only view of team members
      canDeactivateUsers: false,
      canAssignRoles: false,

      // Action permissions
      canCreateAction: false,
      canEditAction: false,
      canDeleteAction: false,
      canUpdateActionStatus: false,
      canReassignAction: false,

      // Dashboard permissions
      canViewFinancialMetrics: false,
      canViewCompanyMetrics: false,
    };
  }

  // Team Member permissions (default)
  return {
    // Client permissions
    canCreateClient: false,
    canEditClient: false,
    canDeleteClient: false,
    canViewAllClients: false, // Can only see client name for assigned projects
    canHardDeleteClient: false,

    // Project permissions
    canCreateProject: false,
    canEditProject: false,
    canDeleteProject: false,
    canViewAllProjects: false, // Only see assigned projects
    canViewBudget: false, // Cannot see budgets
    canAssignTeamMembers: false,

    // Meeting permissions
    canCreateMeeting: false,
    canEditMeeting: false,
    canDeleteMeeting: false,
    canViewAllMeetings: false, // Only see meetings they're invited to

    // Team permissions
    canManageTeam: false,
    canViewTeam: true, // Can see other team members (basic info)
    canDeactivateUsers: false,
    canAssignRoles: false,

    // Action permissions
    canCreateAction: false,
    canEditAction: false,
    canDeleteAction: false,
    canUpdateActionStatus: true, // Can update status of their own actions
    canReassignAction: false,

    // Dashboard permissions
    canViewFinancialMetrics: false,
    canViewCompanyMetrics: false,
  };
}

// Helper functions for specific permission checks
export function useCanEditProject(): boolean {
  const { canEditProject } = usePermissions();
  return canEditProject;
}

export function useCanViewBudget(): boolean {
  const { canViewBudget } = usePermissions();
  return canViewBudget;
}

export function useCanManageTeam(): boolean {
  const { canManageTeam } = usePermissions();
  return canManageTeam;
}

export function useCanDeleteClient(): boolean {
  const { canDeleteClient } = usePermissions();
  return canDeleteClient;
}

export function useCanHardDeleteClient(): boolean {
  const { canHardDeleteClient } = usePermissions();
  return canHardDeleteClient;
}
