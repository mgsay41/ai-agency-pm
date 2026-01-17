import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { updateClientContactSchema } from "@/lib/validations/client";
import { nanoid } from "nanoid";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { sanitizeFormData } from "@/lib/sanitize";

type RouteContext = {
  params: Promise<{ id: string; contactId: string }>;
};

// PATCH update contact
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await context.params;
    if (!resolvedParams?.id || !resolvedParams?.contactId) {
      return NextResponse.json(
        { error: "Client ID and Contact ID are required" },
        { status: 400 }
      );
    }

    const { id: clientId, contactId } = resolvedParams;
    const body = await request.json();

    // Check if contact exists
    const existingContact = await db.clientContact.findUnique({
      where: { id: contactId },
    });

    if (!existingContact) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    // Verify contact belongs to the specified client
    if (existingContact.clientId !== clientId) {
      return NextResponse.json(
        { error: "Contact does not belong to this client" },
        { status: 400 }
      );
    }

    // Validate update data
    const validatedData = updateClientContactSchema.parse(body);

    // Sanitize input to prevent XSS
    const sanitizedData = sanitizeFormData(validatedData, {
      textarea: ["notes"],
      plainText: ["contactName", "jobTitle", "email", "phone", "mobile", "linkedinUrl"],
    });

    // If setting this contact as primary, unset other primary contacts
    if (sanitizedData.isPrimary) {
      await db.clientContact.updateMany({
        where: {
          clientId,
          isPrimary: true,
          id: {
            not: contactId,
          },
        },
        data: {
          isPrimary: false,
        },
      });
    }

    // Update contact
    const updatedContact = await db.clientContact.update({
      where: { id: contactId },
      data: {
        ...(sanitizedData.contactName && {
          contactName: sanitizedData.contactName,
        }),
        ...(sanitizedData.jobTitle !== undefined && {
          jobTitle: sanitizedData.jobTitle,
        }),
        ...(sanitizedData.email && { email: sanitizedData.email }),
        ...(sanitizedData.phone !== undefined && { phone: sanitizedData.phone }),
        ...(sanitizedData.mobile !== undefined && {
          mobile: sanitizedData.mobile,
        }),
        ...(sanitizedData.linkedinUrl !== undefined && {
          linkedinUrl: sanitizedData.linkedinUrl || null,
        }),
        ...(sanitizedData.notes !== undefined && { notes: sanitizedData.notes }),
        ...(sanitizedData.isPrimary !== undefined && {
          isPrimary: sanitizedData.isPrimary,
        }),
        updatedAt: new Date(),
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        id: nanoid(),
        userId: session.user.id,
        entityType: "client_contact",
        entityId: contactId,
        action: "updated",
        changes: sanitizedData,
        createdAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedContact,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    logger.error("PATCH /api/clients/[id]/contacts/[contactId] error", error, { action: "update_client_contact" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE contact
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await context.params;
    if (!resolvedParams?.id || !resolvedParams?.contactId) {
      return NextResponse.json(
        { error: "Client ID and Contact ID are required" },
        { status: 400 }
      );
    }

    const { id: clientId, contactId } = resolvedParams;

    // Check if contact exists
    const existingContact = await db.clientContact.findUnique({
      where: { id: contactId },
    });

    if (!existingContact) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    // Verify contact belongs to the specified client
    if (existingContact.clientId !== clientId) {
      return NextResponse.json(
        { error: "Contact does not belong to this client" },
        { status: 400 }
      );
    }

    // Delete contact
    try {
      await db.clientContact.delete({
        where: { id: contactId },
      });
    } catch (deleteError: any) {
      // Handle case where record was already deleted
      if (deleteError?.code === 'P2025') {
        return NextResponse.json(
          { error: "Contact not found or already deleted" },
          { status: 404 }
        );
      }
      throw deleteError;
    }

    // If this was the primary contact, check if there are other contacts and make one primary
    if (existingContact.isPrimary) {
      const remainingContacts = await db.clientContact.findFirst({
        where: { clientId },
        orderBy: { createdAt: "asc" },
      });

      if (remainingContacts) {
        await db.clientContact.update({
          where: { id: remainingContacts.id },
          data: { isPrimary: true },
        });
      }
    }

    // Log activity
    await db.activityLog.create({
      data: {
        id: nanoid(),
        userId: session.user.id,
        entityType: "client_contact",
        entityId: contactId,
        action: "deleted",
        createdAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Contact deleted successfully",
    });
  } catch (error) {
    logger.error("DELETE /api/clients/[id]/contacts/[contactId] error", error, { action: "delete_client_contact" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
