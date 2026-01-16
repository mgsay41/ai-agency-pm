import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  clientSchema,
  createClientWithContactSchema,
} from "@/lib/validations/client";
import { nanoid } from "nanoid";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { sanitizeFormData } from "@/lib/sanitize";
import { Prisma, Role } from "@prisma/client";
import { withRole, apiResponses } from "@/lib/api-middleware";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";

// GET /api/clients - List clients with role-based filtering
// Admin: All clients (including deleted with ?includeDeleted=true)
// Sales: Only their own clients (not deleted)
// Team Member: Forbidden
export const GET = withRole(
  ["ADMIN", "SALES"],
  async (request, { user }) => {
    try {
      const userRole = user.role as Role;

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
      const includeDeleted = searchParams.get("includeDeleted") === "true";

      // Build where clause with role-based filtering
      const where: Prisma.ClientWhereInput = {};

      // Role-based filtering
      if (hasPermission(userRole, PERMISSIONS.CLIENT_VIEW_ALL)) {
        // Admin can see all clients
        // Only include deleted if explicitly requested
        if (!includeDeleted) {
          where.deletedAt = null;
        }
      } else if (hasPermission(userRole, PERMISSIONS.CLIENT_VIEW_OWN)) {
        // Sales can only see their own clients (not deleted)
        where.createdBy = user.id;
        where.deletedAt = null;
      }

      // Apply search filters
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
        const { ClientContact, Project, ...rest } = client;
        return {
          ...rest,
          activeProjectsCount: Project.filter((p) => p.status === "ACTIVE")
            .length,
          totalProjectsCount: Project.length,
          primaryContact: ClientContact[0] || null,
          _count: {
            projects: Project.length,
          },
        };
      });

      return apiResponses.success({
        clients: transformedClients,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      logger.error("GET /api/clients error", error, {
        action: "fetch_clients",
      });
      return apiResponses.serverError();
    }
  }
);

// POST /api/clients - Create new client
// Admin: Can create for any user
// Sales: Can create (auto-assigned as createdBy)
export const POST = withRole(["ADMIN", "SALES"], async (request, { user }) => {
  try {
    const body = await request.json();

    // Check if body includes contact information
    const hasContact = body.contact && Object.keys(body.contact).length > 0;

    let validatedData: z.infer<typeof clientSchema>;
    let contactData: z.infer<typeof createClientWithContactSchema>['contact'] | null = null;

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
    let sanitizedContactData: Record<string, unknown> | null = null;
    if (contactData) {
      sanitizedContactData = sanitizeFormData(contactData, {
        textarea: ["notes"],
        plainText: ["contactName", "jobTitle", "email", "phone", "mobile", "linkedinUrl"],
      });
    }

    // Use transaction to ensure atomicity
    const result = await db.$transaction(async (tx) => {
      // Create client
      const client = await tx.client.create({
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
          createdBy: user.id, // Auto-assign current user as creator
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Create primary contact if provided
      let contact = null;
      if (sanitizedContactData) {
        contact = await tx.clientContact.create({
          data: {
            id: nanoid(),
            clientId: client.id,
            isPrimary: true,
            contactName: sanitizedContactData.contactName as string,
            jobTitle: sanitizedContactData.jobTitle as string,
            email: sanitizedContactData.email as string,
            phone: sanitizedContactData.phone as string | null,
            mobile: sanitizedContactData.mobile as string | null,
            linkedinUrl: sanitizedContactData.linkedinUrl as string | null,
            notes: sanitizedContactData.notes as string | null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }

      // Log activity
      await tx.activityLog.create({
        data: {
          id: nanoid(),
          userId: user.id,
          entityType: "client",
          entityId: client.id,
          action: "created",
          createdAt: new Date(),
        },
      });

      return { client, contact };
    });

    return apiResponses.created({
      ...result.client,
      primaryContact: result.contact,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiResponses.badRequest("Validation error", error.issues);
    }

    logger.error("POST /api/clients error", error, { action: "create_client" });
    return apiResponses.serverError();
  }
});
