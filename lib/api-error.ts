import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { logger } from "@/lib/logger";

/**
 * Standard API error response structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

/**
 * Standard API response structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

/**
 * Error codes used throughout the application
 */
export const ErrorCodes = {
  // Authentication & Authorization
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",

  // Validation
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",

  // Resource errors
  NOT_FOUND: "NOT_FOUND",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  CONFLICT: "CONFLICT",

  // Database errors
  DATABASE_ERROR: "DATABASE_ERROR",

  // Server errors
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
} as const;

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  code: string,
  message: string,
  status: number,
  details?: any
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    { status }
  );
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T = any>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

/**
 * Handle Zod validation errors
 */
export function handleZodError(error: ZodError<any>): NextResponse<ApiResponse> {
  const details = error.issues.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));

  return createErrorResponse(
    ErrorCodes.VALIDATION_ERROR,
    "Validation failed",
    400,
    details
  );
}

/**
 * Handle Prisma errors
 */
export function handlePrismaError(
  error: Prisma.PrismaClientKnownRequestError
): NextResponse<ApiResponse> {
  // Unique constraint violation
  if (error.code === "P2002") {
    const field = (error.meta?.target as string[])?.join(", ") || "field";
    return createErrorResponse(
      ErrorCodes.ALREADY_EXISTS,
      `A record with this ${field} already exists`,
      409
    );
  }

  // Foreign key constraint violation
  if (error.code === "P2003") {
    return createErrorResponse(
      ErrorCodes.INVALID_INPUT,
      "Referenced record does not exist",
      400
    );
  }

  // Record not found
  if (error.code === "P2025") {
    return createErrorResponse(
      ErrorCodes.NOT_FOUND,
      "Record not found",
      404
    );
  }

  // Default Prisma error
  return createErrorResponse(
    ErrorCodes.DATABASE_ERROR,
    "Database operation failed",
    500
  );
}

/**
 * Handle generic errors
 */
export function handleGenericError(error: unknown): NextResponse<ApiResponse> {
  logger.error("API Error", error, { action: "handle_generic_error" });

  // Zod validation error
  if (error instanceof ZodError) {
    return handleZodError(error);
  }

  // Prisma error
  if (
    error instanceof Prisma.PrismaClientKnownRequestError
  ) {
    return handlePrismaError(error);
  }

  // Standard Error object
  if (error instanceof Error) {
    return createErrorResponse(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      error.message || "An unexpected error occurred",
      500
    );
  }

  // Unknown error
  return createErrorResponse(
    ErrorCodes.INTERNAL_SERVER_ERROR,
    "An unexpected error occurred",
    500
  );
}

/**
 * Unauthorized error (401)
 */
export function unauthorizedError(
  message: string = "Authentication required"
): NextResponse<ApiResponse> {
  return createErrorResponse(ErrorCodes.UNAUTHORIZED, message, 401);
}

/**
 * Forbidden error (403)
 */
export function forbiddenError(
  message: string = "You don't have permission to perform this action"
): NextResponse<ApiResponse> {
  return createErrorResponse(ErrorCodes.FORBIDDEN, message, 403);
}

/**
 * Not found error (404)
 */
export function notFoundError(
  resource: string = "Resource"
): NextResponse<ApiResponse> {
  return createErrorResponse(
    ErrorCodes.NOT_FOUND,
    `${resource} not found`,
    404
  );
}

/**
 * Log activity to the database
 */
export async function logActivity(
  db: any,
  userId: string,
  entityType: string,
  entityId: string,
  action: string,
  changes?: any
): Promise<void> {
  try {
    await db.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        entityType,
        entityId,
        action,
        changes: changes || null,
      },
    });
  } catch (error) {
    // Log error but don't throw - activity logging should not break the main operation
    logger.error("Failed to log activity", error, { action: "log_activity_helper" });
  }
}
