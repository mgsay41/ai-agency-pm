import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deactivateUserAndTransfer } from "@/lib/user-management";
import { z } from "zod";

const deactivateUserSchema = z.object({
  transferToUserId: z.string().uuid("Must provide a valid admin user ID"),
});

/**
 * POST /api/admin/users/[id]/deactivate
 * Deactivate a user and transfer their clients to another admin
 * Admin only
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Validate that user is not trying to deactivate themselves
    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot deactivate your own account" },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = deactivateUserSchema.parse(body);

    // Validate that transfer target is not the user being deactivated
    if (validatedData.transferToUserId === params.id) {
      return NextResponse.json(
        { error: "Cannot transfer ownership to the user being deactivated" },
        { status: 400 }
      );
    }

    // Perform deactivation and ownership transfer
    const result = await deactivateUserAndTransfer(
      params.id,
      validatedData.transferToUserId,
      session.user.id
    );

    return NextResponse.json(
      {
        success: true,
        data: result,
        message: result.message,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/admin/users/[id]/deactivate error:", error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // Handle specific error messages from the service
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
