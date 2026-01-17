"use client";

import { usePermissions, Permissions } from "@/lib/hooks/use-permissions";
import { ReactNode } from "react";

interface PermissionGateProps {
  children: ReactNode;
  requires: keyof Permissions;
  fallback?: ReactNode;
}

/**
 * PermissionGate Component
 *
 * Conditionally renders children based on user permissions.
 *
 * Usage:
 * <PermissionGate requires="canEditProject">
 *   <Button>Edit Project</Button>
 * </PermissionGate>
 *
 * With fallback:
 * <PermissionGate requires="canEditProject" fallback={<div>No permission</div>}>
 *   <Button>Edit Project</Button>
 * </PermissionGate>
 */
export function PermissionGate({
  children,
  requires,
  fallback = null,
}: PermissionGateProps) {
  const permissions = usePermissions();

  // Check if user has the required permission
  const hasPermission = permissions[requires];

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface MultiPermissionGateProps {
  children: ReactNode;
  requires: (keyof Permissions)[];
  requireAll?: boolean; // If true, all permissions must be present. If false, at least one must be present.
  fallback?: ReactNode;
}

/**
 * MultiPermissionGate Component
 *
 * Conditionally renders children based on multiple user permissions.
 *
 * Usage (require all):
 * <MultiPermissionGate requires={["canEditProject", "canViewBudget"]} requireAll={true}>
 *   <Button>Edit Project Budget</Button>
 * </MultiPermissionGate>
 *
 * Usage (require any):
 * <MultiPermissionGate requires={["canEditProject", "canViewBudget"]} requireAll={false}>
 *   <Button>View or Edit</Button>
 * </MultiPermissionGate>
 */
export function MultiPermissionGate({
  children,
  requires,
  requireAll = true,
  fallback = null,
}: MultiPermissionGateProps) {
  const permissions = usePermissions();

  // Check permissions based on requireAll flag
  const hasPermission = requireAll
    ? requires.every((permission) => permissions[permission])
    : requires.some((permission) => permissions[permission]);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
