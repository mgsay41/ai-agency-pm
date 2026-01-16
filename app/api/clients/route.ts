import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  clientSchema,
  createClientWithContactSchema,
} from "@/lib/validations/client";
import { nanoid } from "nanoid";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { sanitizeFormData } from "@/lib/sanitize";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const industry = searchParams.get("industry") || "";
    const isActive = searchParams.get("isActive");
    const clientType = searchParams.get("clientType") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "25");
    const sortBy = searchParams.get("sortBy") || "companyName";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: "insensitive" } },
        { industry: { contains: search, mode: "insensitive" } },
      ];
    }

    if (industry) {
      where.industry = industry;
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    if (clientType) {
      const types = clientType.split(",");
      if (types.length > 0) {
        where.clientType = { in: types };
      }
    }

    // Get total count for pagination
    const total = await db.client.count({ where });

    // Get clients with pagination
    const clients = await db.client.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        ClientContact: {
          where: { isPrimary: true },
          take: 1,
        },
        Project: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    // Transform data to include project counts and clean up relation names
    const transformedClients = clients.map((client) => {
      const { ClientContact, Project, ...rest } = client as any;
      return {
        ...rest,
        activeProjectsCount: Project.filter((p: any) => p.status === "ACTIVE").length,
        totalProjectsCount: Project.length,
        primaryContact: ClientContact[0] || null,
        _count: {
          projects: Project.length,
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedClients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("GET /api/clients error", error, { action: "fetch_clients" });
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

    // Check if body includes contact information
    const hasContact = body.contact && Object.keys(body.contact).length > 0;

    let validatedData: any;
    let contactData: any = null;

    if (hasContact) {
      // Validate with contact schema
      const validated = createClientWithContactSchema.parse(body);
      validatedData = validated.client;
      contactData = validated.contact;
    } else {
      // Validate client only
      validatedData = clientSchema.parse(body);
    }

    // Sanitize client input to prevent XSS
    const sanitizedClientData = sanitizeFormData(validatedData, {
      textarea: ["notes"],
      plainText: ["companyName", "industry", "companySize", "website", "billingAddress", "timeZone"],
    });

    // Sanitize contact data if present
    let sanitizedContactData: any = null;
    if (contactData) {
      sanitizedContactData = sanitizeFormData(contactData, {
        textarea: ["notes"],
        plainText: ["contactName", "jobTitle", "email", "phone", "mobile", "linkedinUrl"],
      });
    }

    // Create client
    const client = await db.client.create({
      data: {
        id: nanoid(),
        companyName: sanitizedClientData.companyName,
        clientType: sanitizedClientData.clientType,
        industry: sanitizedClientData.industry,
        companySize: sanitizedClientData.companySize,
        website: sanitizedClientData.website || null,
        billingAddress: sanitizedClientData.billingAddress,
        timeZone: sanitizedClientData.timeZone,
        preferredCommunication: sanitizedClientData.preferredCommunication || [],
        tags: sanitizedClientData.tags || [],
        notes: sanitizedClientData.notes,
        isActive: sanitizedClientData.isActive ?? true,
        clientSince: sanitizedClientData.clientSince,
        createdBy: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Create primary contact if provided
    let contact = null;
    if (sanitizedContactData) {
      contact = await db.clientContact.create({
        data: {
          id: nanoid(),
          clientId: client.id,
          isPrimary: true,
          contactName: sanitizedContactData.contactName,
          jobTitle: sanitizedContactData.jobTitle,
          email: sanitizedContactData.email,
          phone: sanitizedContactData.phone,
          mobile: sanitizedContactData.mobile,
          linkedinUrl: sanitizedContactData.linkedinUrl || null,
          notes: sanitizedContactData.notes,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

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
        data: {
          ...client,
          primaryContact: contact,
        },
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

    logger.error("POST /api/clients error", error, { action: "create_client" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
