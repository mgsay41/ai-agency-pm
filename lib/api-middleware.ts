/**
 * API Middleware Utilities
 * Reusable middleware functions for API routes with RBAC support
 */

import { NextRequest, NextResponse } from "next/server";
import { auth, Session } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { Role } from "@prisma/client";
import {
  Permission,
  hasPermission,
  hasAnyPermission,
  isValidRole,
} from "@/lib/permissions";
import { db } from "@/lib/db";

/**
 * Auth context passed to authenticated route handlers
 */
export interface AuthContext {
  session: Session;
  user: Session["user"];
  params?: Record<string, string>;
}

/**
 * API Route handler with auth context
 */
export type AuthenticatedHandler<T = unknown> = (
  request: NextRequest,
  context: AuthContext
) => Promise<NextResponse<T>>;

/**
 * Higher-order function that wraps API route handlers with authentication
 * Automatically checks for valid session and returns 401 if unauthorized
 *
 * @example
 * export const GET = withAuth(async (request, { session, user }) => {
 *   // Your authenticated logic here
 *   const data = await db.project.findMany({ where: { userId: user.id } });
 *   return NextResponse.json({ success: true, data });
 * });
 */
export function withAuth<T = unknown>(
  handler: AuthenticatedHandler<T>
): (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> }
) => Promise<NextResponse<T>> {
  return async (
    request: NextRequest,
    routeContext?: { params: Promise<Record<string, string>> }
  ) => {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        ) as NextResponse<T>;
      }

      // Await params if provided (Next.js 15+)
      const params = routeContext?.params ? await routeContext.params : undefined;

      const context: AuthContext = {
        session,
        user: session.user,
        params,
      };

      return await handler(request, context);
    } catch (error) {
      logger.error("Auth middleware error", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      ) as NextResponse<T>;
    }
  };
}

/**
 * Role-based access control wrapper
 * Extends withAuth to also check for specific user roles
 *
 * @example
 * export const DELETE = withRole(['ADMIN'], async (request, { session, user }) => {
 *   // Only admins can access this endpoint
 * });
 */
export function withRole<T = unknown>(
  allowedRoles: string[],
  handler: AuthenticatedHandler<T>
): (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> }
) => Promise<NextResponse<T>> {
  return withAuth(async (request, context) => {
    const userRole = context.user.role as string;

    // Validate role is a known role
    if (!isValidRole(userRole)) {
      logger.error("Invalid user role detected", { userId: context.user.id, role: userRole });

      // Log authorization failure
      await logAuthorizationFailure(
        context.user.id,
        request.method,
        request.nextUrl.pathname,
        "Invalid role"
      );

      return NextResponse.json(
        { error: "Forbidden: Invalid role" },
        { status: 403 }
      ) as NextResponse<T>;
    }

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(userRole)) {
      logger.warn("Authorization failed: insufficient permissions", {
        userId: context.user.id,
        userRole,
        allowedRoles,
        endpoint: request.nextUrl.pathname,
        method: request.method,
      });

      // Log authorization failure
      await logAuthorizationFailure(
        context.user.id,
        request.method,
        request.nextUrl.pathname,
        `Role ${userRole} not in allowed roles: ${allowedRoles.join(", ")}`
      );

      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 }
      ) as NextResponse<T>;
    }

    // Check if user account is active
    if (context.user.isActive === false) {
      logger.warn("Authorization failed: user account is inactive", {
        userId: context.user.id,
      });

      await logAuthorizationFailure(
        context.user.id,
        request.method,
        request.nextUrl.pathname,
        "User account is inactive"
      );

      return NextResponse.json(
        { error: "Forbidden: Account is inactive" },
        { status: 403 }
      ) as NextResponse<T>;
    }

    return await handler(request, context);
  });
}

/**
 * Permission-based access control wrapper
 * Checks if user has specific permission(s) rather than role
 *
 * @example
 * export const DELETE = withPermission('CLIENT_DELETE_HARD', async (request, { session, user }) => {
 *   // Only users with CLIENT_DELETE_HARD permission can access
 * });
 */
export function withPermission<T = unknown>(
  requiredPermissions: Permission | Permission[],
  handler: AuthenticatedHandler<T>
): (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> }
) => Promise<NextResponse<T>> {
  return withAuth(async (request, context) => {
    const userRole = context.user.role as Role;

    if (!isValidRole(userRole)) {
      logger.error("Invalid user role detected", { userId: context.user.id, role: userRole });

      await logAuthorizationFailure(
        context.user.id,
        request.method,
        request.nextUrl.pathname,
        "Invalid role"
      );

      return NextResponse.json(
        { error: "Forbidden: Invalid role" },
        { status: 403 }
      ) as NextResponse<T>;
    }

    // Check if user account is active
    if (context.user.isActive === false) {
      await logAuthorizationFailure(
        context.user.id,
        request.method,
        request.nextUrl.pathname,
        "User account is inactive"
      );

      return NextResponse.json(
        { error: "Forbidden: Account is inactive" },
        { status: 403 }
      ) as NextResponse<T>;
    }

    // Convert to array if single permission
    const permissions = Array.isArray(requiredPermissions)
      ? requiredPermissions
      : [requiredPermissions];

    // Check if user has any of the required permissions
    if (!hasAnyPermission(userRole, permissions)) {
      logger.warn("Authorization failed: missing required permissions", {
        userId: context.user.id,
        userRole,
        requiredPermissions: permissions,
        endpoint: request.nextUrl.pathname,
        method: request.method,
      });

      await logAuthorizationFailure(
        context.user.id,
        request.method,
        request.nextUrl.pathname,
        `Missing required permissions: ${permissions.join(", ")}`
      );

      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 }
      ) as NextResponse<T>;
    }

    return await handler(request, context);
  });
}

/**
 * Log authorization failure to activity log
 * @param userId - User who attempted the action
 * @param method - HTTP method
 * @param endpoint - Endpoint path
 * @param reason - Reason for denial
 */
async function logAuthorizationFailure(
  userId: string,
  method: string,
  endpoint: string,
  reason: string
): Promise<void> {
  try {
    await db.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        entityType: "authorization",
        entityId: endpoint,
        action: "authorization_failure",
        changes: {
          method,
          endpoint,
          reason,
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    // Don't let logging failures break the request
    logger.error("Failed to log authorization failure", error);
  }
}

/**
 * Error response helpers
 */
export const apiResponses = {
  unauthorized: () =>
    NextResponse.json({ error: "Unauthorized" }, { status: 401 }),

  forbidden: (message = "Forbidden") =>
    NextResponse.json({ error: message }, { status: 403 }),

  notFound: (message = "Not found") =>
    NextResponse.json({ error: message }, { status: 404 }),

  badRequest: (message = "Bad request", details?: unknown) =>
    NextResponse.json({ error: message, details }, { status: 400 }),

  conflict: (message = "Resource conflict") =>
    NextResponse.json({ error: message }, { status: 409 }),

  serverError: (message = "Internal server error") =>
    NextResponse.json({ error: message }, { status: 500 }),

  success: <T>(data: T, message?: string) =>
    NextResponse.json({
      success: true,
      data,
      ...(message && { message }),
    }),

  created: <T>(data: T, message?: string) =>
    NextResponse.json(
      {
        success: true,
        data,
        ...(message && { message }),
      },
      { status: 201 }
    ),
};
