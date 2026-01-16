import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { clientContactSchema } from "@/lib/validations/client";
import { nanoid } from "nanoid";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { sanitizeFormData } from "@/lib/sanitize";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET all contacts for a client
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    // Check if client exists
    const client = await db.client.findUnique({
      where: { id },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Get all contacts for this client
    const contacts = await db.clientContact.findMany({
      where: { clientId: id },
      orderBy: [{ isPrimary: "desc" }, { contactName: "asc" }],
    });

    return NextResponse.json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    logger.error("GET /api/clients/[id]/contacts error", error, { action: "fetch_client_contacts" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create new contact for a client
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: clientId } = await context.params;
    const body = await request.json();

    // Check if client exists
    const client = await db.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Add clientId to body for validation
    const dataWithClientId = { ...body, clientId };

    // Validate data
    const validatedData = clientContactSchema.parse(dataWithClientId);

    // Sanitize input to prevent XSS
    const sanitizedData = sanitizeFormData(validatedData, {
      textarea: ["notes"],
      plainText: ["contactName", "jobTitle", "email", "phone", "mobile", "linkedinUrl"],
    });

    // If this contact is set as primary, unset other primary contacts
    if (sanitizedData.isPrimary) {
      await db.clientContact.updateMany({
        where: {
          clientId,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    // Create contact
    const contact = await db.clientContact.create({
      data: {
        id: nanoid(),
        clientId: sanitizedData.clientId,
        isPrimary: sanitizedData.isPrimary,
        contactName: sanitizedData.contactName,
        jobTitle: sanitizedData.jobTitle,
        email: sanitizedData.email,
        phone: sanitizedData.phone,
        mobile: sanitizedData.mobile,
        linkedinUrl: sanitizedData.linkedinUrl || null,
        notes: sanitizedData.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        id: nanoid(),
        userId: session.user.id,
        entityType: "client_contact",
        entityId: contact.id,
        action: "created",
        createdAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: contact,
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

    logger.error("POST /api/clients/[id]/contacts error", error, { action: "create_client_contact" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
