import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { createClientSchema } from "@/lib/validations/client";
import { nanoid } from "nanoid";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clients = await db.client.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        companyName: "asc",
      },
      select: {
        id: true,
        companyName: true,
        clientType: true,
        industry: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: clients,
    });
  } catch (error) {
    console.error("GET /api/clients error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createClientSchema.parse(body);

    const client = await db.client.create({
      data: {
        id: nanoid(),
        companyName: validatedData.companyName,
        clientType: validatedData.clientType,
        industry: validatedData.industry,
        companySize: validatedData.companySize,
        website: validatedData.website,
        billingAddress: validatedData.billingAddress,
        timeZone: validatedData.timeZone,
        notes: validatedData.notes,
        isActive: validatedData.isActive,
        clientSince: validatedData.clientSince,
        createdBy: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        id: nanoid(),
        userId: session.user.id,
        entityType: "client",
        entityId: client.id,
        action: "created",
        createdAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: client,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("POST /api/clients error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
