"use client";

import { useAuth } from "@/lib/auth-client";
import { Role } from "@prisma/client";

/**
 * Hook to get the current user's role
 * @returns Object with role and loading state
 */
export function useRole() {
  const { user, isLoading, isAuthenticated } = useAuth();

  return {
    role: user?.role as Role | undefined,
    isLoading,
    isAuthenticated,
  };
}

/**
 * Hook to check if user has a specific role
 * @param requiredRole - The role to check for
 * @returns Object with hasRole boolean and loading state
 */
export function useHasRole(requiredRole: Role) {
  const { role, isLoading, isAuthenticated } = useRole();

  return {
    hasRole: role === requiredRole,
    isLoading,
    isAuthenticated,
  };
}

/**
 * Hook to check if user is admin
 * @returns Object with isAdmin boolean and loading state
 */
export function useIsAdmin() {
  const { hasRole, isLoading, isAuthenticated } = useHasRole("ADMIN");

  return {
    isAdmin: hasRole,
    isLoading,
    isAuthenticated,
  };
}

/**
 * Hook to check if user is sales
 * @returns Object with isSales boolean and loading state
 */
export function useIsSales() {
  const { hasRole, isLoading, isAuthenticated } = useHasRole("SALES");

  return {
    isSales: hasRole,
    isLoading,
    isAuthenticated,
  };
}

/**
 * Hook to check if user is team member
 * @returns Object with isTeamMember boolean and loading state
 */
export function useIsTeamMember() {
  const { hasRole, isLoading, isAuthenticated } = useHasRole("TEAM_MEMBER");

  return {
    isTeamMember: hasRole,
    isLoading,
    isAuthenticated,
  };
}
