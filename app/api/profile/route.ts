import { db } from "@/lib/db";
import { updateProfileSchema } from "@/lib/validations/profile";
import { sanitizePlainText } from "@/lib/sanitize";
import { logger } from "@/lib/logger";
import { z } from "zod";
import { withAuth, apiResponses } from "@/lib/api-middleware";

// GET /api/profile - Get current user's profile
// All authenticated users can access their own profile
export const GET = withAuth(async (request, { user }) => {
  try {
    const userProfile = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        emailVerified: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!userProfile) {
      return apiResponses.notFound("User not found");
    }

    return apiResponses.success(userProfile);
  } catch (error) {
    logger.error("GET /api/profile error:", error);
    return apiResponses.serverError();
  }
});

// PATCH /api/profile - Update current user's profile
// All authenticated users can update their own profile
export const PATCH = withAuth(async (request, { user }) => {
  try {
    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    // Sanitize string inputs
    const sanitizedData: Record<string, string | null> = {};
    if (validatedData.name !== undefined) {
      sanitizedData.name = sanitizePlainText(validatedData.name);
    }
    if (validatedData.email !== undefined) {
      sanitizedData.email = validatedData.email.toLowerCase().trim();
    }
    if (validatedData.phone !== undefined) {
      sanitizedData.phone = validatedData.phone || null;
    }

    // Check if email is already taken by another user
    if (sanitizedData.email) {
      const existingUser = await db.user.findFirst({
        where: {
          email: sanitizedData.email,
          id: { not: user.id },
        },
      });

      if (existingUser) {
        return apiResponses.conflict("Email is already taken");
      }
    }

    // Update user profile
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: sanitizedData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        emailVerified: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        entityType: "user",
        entityId: user.id,
        action: "updated",
        changes: sanitizedData,
      },
    });

    return apiResponses.success(updatedUser, "Profile updated successfully");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiResponses.badRequest("Validation error", error.issues);
    }

    logger.error("PATCH /api/profile error:", error);
    return apiResponses.serverError();
  }
});
