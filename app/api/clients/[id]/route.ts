import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { updateClientSchema } from "@/lib/validations/client";
import { nanoid } from "nanoid";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { sanitizeFormData } from "@/lib/sanitize";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET single client
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const client = await db.client.findUnique({
      where: { id },
      include: {
        ClientContact: {
          orderBy: {
            isPrimary: "desc",
          },
        },
        Project: {
          select: {
            id: true,
            projectName: true,
            projectCode: true,
            status: true,
            priority: true,
            startDate: true,
            endDate: true,
            progressPercentage: true,
          },
          orderBy: {
            startDate: "desc",
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
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Calculate project statistics
    const activeProjects = client.Project.filter(
      (p) => p.status === "ACTIVE"
    ).length;
    const completedProjects = client.Project.filter(
      (p) => p.status === "COMPLETED"
    ).length;

    // Transform to match expected format
    const responseData = {
      ...client,
      contacts: client.ClientContact,
      projects: client.Project,
      activeProjectsCount: activeProjects,
      completedProjectsCount: completedProjects,
      totalProjectsCount: client.Project.length,
    };

    // Remove the Prisma relation names
    const { ClientContact: _, Project: __, User: ___, ...rest } = client as any;

    return NextResponse.json({
      success: true,
      data: {
        ...rest,
        contacts: client.ClientContact,
        projects: client.Project,
        activeProjectsCount: activeProjects,
        completedProjectsCount: completedProjects,
        totalProjectsCount: client.Project.length,
      },
    });
  } catch (error) {
    logger.error("GET /api/clients/[id] error", error, { action: "fetch_client_by_id" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT update client
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    // Check if client exists
    const existingClient = await db.client.findUnique({
      where: { id },
    });

    if (!existingClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Validate update data
    const validatedData = updateClientSchema.parse(body);

    // Sanitize input to prevent XSS
    const sanitizedData = sanitizeFormData(validatedData, {
      textarea: ["notes"],
      plainText: ["companyName", "industry", "companySize", "website", "billingAddress", "timeZone"],
    });

    // Update client
    const updatedClient = await db.client.update({
      where: { id },
      data: {
        ...(sanitizedData.companyName && {
          companyName: sanitizedData.companyName,
        }),
        ...(sanitizedData.clientType && { clientType: sanitizedData.clientType }),
        ...(sanitizedData.industry !== undefined && {
          industry: sanitizedData.industry,
        }),
        ...(sanitizedData.companySize !== undefined && {
          companySize: sanitizedData.companySize,
        }),
        ...(sanitizedData.website !== undefined && {
          website: sanitizedData.website || null,
        }),
        ...(sanitizedData.billingAddress !== undefined && {
          billingAddress: sanitizedData.billingAddress,
        }),
        ...(sanitizedData.timeZone !== undefined && {
          timeZone: sanitizedData.timeZone,
        }),
        ...(sanitizedData.preferredCommunication !== undefined && {
          preferredCommunication: sanitizedData.preferredCommunication,
        }),
        ...(sanitizedData.tags !== undefined && { tags: sanitizedData.tags }),
        ...(sanitizedData.notes !== undefined && { notes: sanitizedData.notes }),
        ...(sanitizedData.isActive !== undefined && {
          isActive: sanitizedData.isActive,
        }),
        ...(sanitizedData.clientSince !== undefined && {
          clientSince: sanitizedData.clientSince,
        }),
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
    await db.activityLog.create({
      data: {
        id: nanoid(),
        userId: session.user.id,
        entityType: "client",
        entityId: id,
        action: "updated",
        changes: sanitizedData,
        createdAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updatedClient,
        primaryContact: updatedClient.ClientContact[0] || null,
        contacts: updatedClient.ClientContact,
        ClientContact: undefined,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    logger.error("PUT /api/clients/[id] error", error, { action: "update_client" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE client
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    // Check if client exists
    const existingClient = await db.client.findUnique({
      where: { id },
      include: {
        Project: {
          where: {
            status: {
              in: ["PLANNING", "ACTIVE"],
            },
          },
        },
      },
    });

    if (!existingClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Check if client has active projects
    if (existingClient.Project.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete client with active or planning projects. Please complete or archive projects first.",
          activeProjects: existingClient.Project.length,
        },
        { status: 409 }
      );
    }

    // Delete related contacts first (cascade delete)
    await db.clientContact.deleteMany({
      where: { clientId: id },
    });

    // Delete client
    await db.client.delete({
      where: { id },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        id: nanoid(),
        userId: session.user.id,
        entityType: "client",
        entityId: id,
        action: "deleted",
        createdAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Client deleted successfully",
    });
  } catch (error) {
    logger.error("DELETE /api/clients/[id] error", error, { action: "delete_client" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
