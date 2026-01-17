import { db } from "@/lib/db";
import { clientSchema } from "@/lib/validations/client";
import { nanoid } from "nanoid";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { sanitizeFormData } from "@/lib/sanitize";
import { Role } from "@prisma/client";
import { withRole, apiResponses } from "@/lib/api-middleware";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";

// GET /api/clients/[id] - Get single client
// Admin: Can view any client (including soft deleted)
// Sales: Can view only their own client (if not deleted)
export const GET = withRole(
  ["ADMIN", "SALES"],
  async (request, { params, user }) => {
    try {
      if (!params?.id) {
        return apiResponses.badRequest("Client ID is required");
      }
      const clientId = params.id;
      const userRole = user.role as Role;

      // Build where clause with role-based filtering
      const where: { id: string; createdBy?: string; deletedAt?: null } = { id: clientId };

      // Role-based access control
      if (hasPermission(userRole, PERMISSIONS.CLIENT_VIEW_ALL)) {
        // Admin can see any client (including soft deleted)
        // No additional filtering needed
      } else if (hasPermission(userRole, PERMISSIONS.CLIENT_VIEW_OWN)) {
        // Sales can only see their own clients (not deleted)
        where.createdBy = user.id;
        where.deletedAt = null;
      } else {
        return apiResponses.forbidden();
      }

      const client = await db.client.findFirst({
        where,
        include: {
          ClientContact: {
            orderBy: {
              isPrimary: "desc",
            },
          },
          Project: {
            where: {
              // Hide soft-deleted projects
              deletedAt: null,
            },
            select: {
              id: true,
              projectName: true,
              status: true,
              priority: true,
              startDate: true,
              endDate: true,
              progressPercentage: true,
            },
          },
          User: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!client) {
        return apiResponses.notFound("Client not found");
      }

      // Transform data
      const { ClientContact, Project, User: creator, ...rest } = client;
      const transformedClient = {
        ...rest,
        contacts: ClientContact,
        projects: Project,
        creator,
      };

      return apiResponses.success(transformedClient);
    } catch (error) {
      logger.error("GET /api/clients/[id] error", error, {
        action: "fetch_client",
      });
      return apiResponses.serverError();
    }
  }
);

// PATCH /api/clients/[id] - Update client
// Admin: Can update any client
// Sales: Can update only their own client (if not deleted)
export const PATCH = withRole(
  ["ADMIN", "SALES"],
  async (request, { params, user }) => {
    try {
      if (!params?.id) {
        return apiResponses.badRequest("Client ID is required");
      }
      const clientId = params.id;
      const userRole = user.role as Role;
      const body = await request.json();

      // Validate input
      const validatedData = clientSchema.partial().parse(body);

      // Sanitize input to prevent XSS
      const sanitizedData = sanitizeFormData(validatedData, {
        textarea: ["notes"],
        plainText: [
          "companyName",
          "industry",
          "companySize",
          "website",
          "billingAddress",
          "timeZone",
        ],
      });

      // Check if client exists and user has permission to edit
      const existingClient = await db.client.findUnique({
        where: { id: clientId },
        select: {
          id: true,
          createdBy: true,
          deletedAt: true,
        },
      });

      if (!existingClient) {
        return apiResponses.notFound("Client not found");
      }

      // Check if client is soft deleted
      if (existingClient.deletedAt && userRole !== "ADMIN") {
        return apiResponses.forbidden("Cannot edit a deleted client");
      }

      // Role-based access control
      if (!hasPermission(userRole, PERMISSIONS.CLIENT_EDIT_ALL)) {
        // Sales can only edit their own clients
        if (existingClient.createdBy !== user.id) {
          return apiResponses.forbidden(
            "You can only edit clients you created"
          );
        }
      }

      // Update client
      const updatedClient = await db.$transaction(async (tx) => {
        const client = await tx.client.update({
          where: { id: clientId },
          data: {
            ...sanitizedData,
            updatedAt: new Date(),
          },
          include: {
            ClientContact: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        });

        // Log activity
        await tx.activityLog.create({
          data: {
            id: nanoid(),
            userId: user.id,
            entityType: "client",
            entityId: clientId,
            action: "updated",
            changes: sanitizedData,
            createdAt: new Date(),
          },
        });

        return client;
      });

      return apiResponses.success({
        ...updatedClient,
        primaryContact: updatedClient.ClientContact[0] || null,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiResponses.badRequest("Validation error", error.issues);
      }

      logger.error("PATCH /api/clients/[id] error", error, {
        action: "update_client",
      });
      return apiResponses.serverError();
    }
  }
);

// DELETE /api/clients/[id] - Delete client
// Admin: Hard delete (permanently removes)
// Sales: Soft delete (sets deletedAt and deletedBy)
export const DELETE = withRole(
  ["ADMIN", "SALES"],
  async (request, { params, user }) => {
    try {
      if (!params?.id) {
        return apiResponses.badRequest("Client ID is required");
      }
      const clientId = params.id;
      const userRole = user.role as Role;

      // Check if client exists
      const existingClient = await db.client.findUnique({
        where: { id: clientId },
        select: {
          id: true,
          companyName: true,
          createdBy: true,
          deletedAt: true,
          _count: {
            select: {
              Project: true,
            },
          },
        },
      });

      if (!existingClient) {
        return apiResponses.notFound("Client not found");
      }

      // Sales can only delete their own clients
      if (
        !hasPermission(userRole, PERMISSIONS.CLIENT_DELETE_ALL) &&
        existingClient.createdBy !== user.id
      ) {
        return apiResponses.forbidden("You can only delete clients you created");
      }

      // Admin: Hard delete
      if (hasPermission(userRole, PERMISSIONS.CLIENT_DELETE_ALL)) {
        // Check for active projects before hard delete
        const activeProjectCount = await db.project.count({
          where: {
            clientId: clientId,
            deletedAt: null, // Only count non-deleted projects
          },
        });

        if (activeProjectCount > 0) {
          return NextResponse.json(
            {
              error: `Cannot delete client with ${activeProjectCount} active project(s). Please delete or reassign projects first.`,
              projectCount: activeProjectCount,
            },
            { status: 409 } // Conflict
          );
        }

        await db.$transaction(async (tx) => {
          // Log activity before deletion
          await tx.activityLog.create({
            data: {
              id: nanoid(),
              userId: user.id,
              entityType: "client",
              entityId: clientId,
              action: "deleted_hard",
              changes: {
                companyName: existingClient.companyName,
                projectCount: existingClient._count.Project,
              },
              createdAt: new Date(),
            },
          });

          // Hard delete - Prisma will handle cascading deletes
          await tx.client.delete({
            where: { id: clientId },
          });
        });

        return apiResponses.success({
          message: "Client permanently deleted",
          clientId,
        });
      }

      // Sales: Soft delete
      const softDeletedClient = await db.$transaction(async (tx) => {
        const client = await tx.client.update({
          where: { id: clientId },
          data: {
            deletedAt: new Date(),
            deletedBy: user.id,
            updatedAt: new Date(),
          },
        });

        // Log activity
        await tx.activityLog.create({
          data: {
            id: nanoid(),
            userId: user.id,
            entityType: "client",
            entityId: clientId,
            action: "deleted_soft",
            changes: {
              companyName: existingClient.companyName,
              projectCount: existingClient._count.Project,
            },
            createdAt: new Date(),
          },
        });

        return client;
      });

      return apiResponses.success({
        message: "Client archived (soft deleted)",
        clientId: softDeletedClient.id,
        deletedAt: softDeletedClient.deletedAt,
      });
    } catch (error) {
      logger.error("DELETE /api/clients/[id] error", error, {
        action: "delete_client",
      });
      return apiResponses.serverError();
    }
  }
);
