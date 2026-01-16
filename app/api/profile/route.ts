import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { updateProfileSchema } from "@/lib/validations/profile";
import { sanitizePlainText } from "@/lib/sanitize";
import { z } from "zod";

// GET /api/profile - Get current user's profile
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
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

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("GET /api/profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/profile - Update current user's profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    // Sanitize string inputs
    const sanitizedData: Record<string, any> = {};
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
          id: { not: session.user.id },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Email is already taken" },
          { status: 409 }
        );
      }
    }

    // Update user profile
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
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
        userId: session.user.id,
        entityType: "user",
        entityId: session.user.id,
        action: "updated",
        changes: sanitizedData,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "Profile updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error("PATCH /api/profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
