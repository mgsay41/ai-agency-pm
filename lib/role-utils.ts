/**
 * Role utility functions for type-safe role checking
 *
 * IMPORTANT: Always use these utilities instead of string comparisons
 * to prevent case sensitivity issues and ensure type safety.
 *
 * The Role enum in Prisma schema uses UPPERCASE values:
 * - ADMIN
 * - TEAM_MEMBER
 * - SALES
 *
 * NEVER use lowercase strings like "admin", "sales", "team_member"
 */

/**
 * Role enum matching Prisma schema
 * Keep this in sync with prisma/schema.prisma
 */
export enum Role {
  ADMIN = "ADMIN",
  TEAM_MEMBER = "TEAM_MEMBER",
  SALES = "SALES",
}

/**
 * Type for role string values
 */
export type RoleValue = keyof typeof Role;

/**
 * Check if a user has admin role
 *
 * @example
 * if (isAdmin(session.user.role)) {
 *   // User is admin
 * }
 */
export function isAdmin(role: string | undefined | null): boolean {
  return role === Role.ADMIN;
}

/**
 * Check if a user has sales role
 */
export function isSales(role: string | undefined | null): boolean {
  return role === Role.SALES;
}

/**
 * Check if a user has team member role
 */
export function isTeamMember(role: string | undefined | null): boolean {
  return role === Role.TEAM_MEMBER;
}

/**
 * Check if a user has any of the specified roles
 *
 * @example
 * if (hasAnyRole(session.user.role, [Role.ADMIN, Role.SALES])) {
 *   // User is admin or sales
 * }
 */
export function hasAnyRole(
  userRole: string | undefined | null,
  allowedRoles: Role[]
): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole as Role);
}

/**
 * Check if a user has all of the specified roles
 * (Note: In this system, a user can only have one role, so this is mainly for future-proofing)
 */
export function hasAllRoles(
  userRoles: string[] | undefined | null,
  requiredRoles: Role[]
): boolean {
  if (!userRoles || userRoles.length === 0) return false;
  return requiredRoles.every(role => userRoles.includes(role));
}

/**
 * Get role display name
 *
 * @example
 * getRoleDisplayName(Role.ADMIN) // "Admin"
 * getRoleDisplayName(Role.TEAM_MEMBER) // "Team Member"
 */
export function getRoleDisplayName(role: string | undefined | null): string {
  switch (role) {
    case Role.ADMIN:
      return "Admin";
    case Role.SALES:
      return "Sales";
    case Role.TEAM_MEMBER:
      return "Team Member";
    default:
      return "Unknown";
  }
}

/**
 * Get role badge color (for UI components)
 *
 * @example
 * getRoleBadgeColor(Role.ADMIN) // "bg-red-100 text-red-800"
 */
export function getRoleBadgeColor(role: string | undefined | null): string {
  switch (role) {
    case Role.ADMIN:
      return "bg-red-100 text-red-800";
    case Role.SALES:
      return "bg-blue-100 text-blue-800";
    case Role.TEAM_MEMBER:
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/**
 * Validate if a string is a valid role
 *
 * @example
 * if (isValidRole("ADMIN")) {
 *   // Valid role
 * }
 */
export function isValidRole(role: string | undefined | null): role is Role {
  if (!role) return false;
  return Object.values(Role).includes(role as Role);
}

/**
 * Assert that a role is valid (throws error if not)
 * Useful for ensuring type safety in critical sections
 *
 * @throws {Error} If role is invalid
 */
export function assertValidRole(role: string | undefined | null): asserts role is Role {
  if (!isValidRole(role)) {
    throw new Error(`Invalid role: ${role}. Must be one of: ${Object.values(Role).join(", ")}`);
  }
}

/**
 * Get all available roles
 */
export function getAllRoles(): Role[] {
  return Object.values(Role);
}

/**
 * Get role options for form select fields
 *
 * @example
 * <Select>
 *   {getRoleOptions().map(option => (
 *     <option key={option.value} value={option.value}>
 *       {option.label}
 *     </option>
 *   ))}
 * </Select>
 */
export function getRoleOptions(): Array<{ value: Role; label: string }> {
  return [
    { value: Role.ADMIN, label: "Admin" },
    { value: Role.SALES, label: "Sales" },
    { value: Role.TEAM_MEMBER, label: "Team Member" },
  ];
}

/**
 * Check if user can perform an action based on role
 * This is a helper for common permission checks
 */
export const RolePermissions = {
  /**
   * Can create/edit/delete any resource
   */
  canManageAll: (role: string | undefined | null): boolean => {
    return isAdmin(role);
  },

  /**
   * Can create/edit own resources
   */
  canManageOwn: (role: string | undefined | null): boolean => {
    return hasAnyRole(role, [Role.ADMIN, Role.SALES]);
  },

  /**
   * Can view resources
   */
  canView: (role: string | undefined | null): boolean => {
    return hasAnyRole(role, [Role.ADMIN, Role.SALES, Role.TEAM_MEMBER]);
  },

  /**
   * Can manage team members
   */
  canManageTeam: (role: string | undefined | null): boolean => {
    return isAdmin(role);
  },

  /**
   * Can manage projects
   */
  canManageProjects: (role: string | undefined | null): boolean => {
    return hasAnyRole(role, [Role.ADMIN, Role.SALES]);
  },

  /**
   * Can manage clients
   */
  canManageClients: (role: string | undefined | null): boolean => {
    return hasAnyRole(role, [Role.ADMIN, Role.SALES]);
  },

  /**
   * Can approve expenses
   */
  canApproveExpenses: (role: string | undefined | null): boolean => {
    return isAdmin(role);
  },
} as const;

/**
 * Type-safe role comparison
 * Use this instead of direct string comparison
 *
 * @example
 * // ❌ Bad
 * if (session.user.role === "admin") { }
 *
 * // ✅ Good
 * if (roleEquals(session.user.role, Role.ADMIN)) { }
 */
export function roleEquals(
  role1: string | undefined | null,
  role2: Role
): boolean {
  return role1 === role2;
}

/**
 * Type-safe role not equals comparison
 *
 * @example
 * // ❌ Bad
 * if (session.user.role !== "admin") { }
 *
 * // ✅ Good
 * if (roleNotEquals(session.user.role, Role.ADMIN)) { }
 */
export function roleNotEquals(
  role1: string | undefined | null,
  role2: Role
): boolean {
  return role1 !== role2;
}
