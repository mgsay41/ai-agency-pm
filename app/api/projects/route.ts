import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  createProjectSchema,
  projectQuerySchema,
  type CreateProjectInput,
} from "@/lib/validations/project";
import {
  createSuccessResponse,
  handleGenericError,
  unauthorizedError,
  logActivity,
} from "@/lib/api-error";
import {
  getPaginatedProjects,
  generateProjectCode,
} from "@/lib/services/project.service";

/**
 * GET /api/projects
 * Get all projects with filtering, sorting, and pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return unauthorizedError();
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const query = projectQuerySchema.parse(queryParams);

    // Get paginated projects
    const result = await getPaginatedProjects(query);

    return createSuccessResponse(result);
  } catch (error) {
    return handleGenericError(error);
  }
}

/**
 * POST /api/projects
 * Create a new project
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return unauthorizedError();
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validatedData: CreateProjectInput = createProjectSchema.parse(body);

    // Get client info for project code generation
    const client = await db.client.findUnique({
      where: { id: validatedData.clientId },
      select: { companyName: true },
    });

    if (!client) {
      return handleGenericError(new Error("Client not found"));
    }

    // Generate project code if not provided
    let projectCode = validatedData.projectCode;
    if (!projectCode) {
      projectCode = await generateProjectCode(
        validatedData.projectName,
        client.companyName
      );
    }

    // Create project
    const project = await db.project.create({
      data: {
        id: crypto.randomUUID(),
        projectName: validatedData.projectName,
        projectCode,
        clientId: validatedData.clientId,
        projectType: validatedData.projectType,
        description: validatedData.description || null,
        internalNotes: validatedData.internalNotes || null,
        status: validatedData.status,
        priority: validatedData.priority,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        actualStartDate: validatedData.actualStartDate || null,
        actualEndDate: validatedData.actualEndDate || null,
        estimatedHours: validatedData.estimatedHours || null,
        budgetAmount: validatedData.budgetAmount || null,
        currency: validatedData.currency,
        billingType: validatedData.billingType || null,
        progressPercentage: validatedData.progressPercentage,
        currentPhase: validatedData.currentPhase || null,
        healthStatus: validatedData.healthStatus || null,
        createdBy: session.user.id,
        lastModifiedBy: session.user.id,
        updatedAt: new Date(),
      },
      include: {
        Client: {
          select: {
            id: true,
            companyName: true,
            clientType: true,
          },
        },
      },
    });

    // Log activity
    await logActivity(
      db,
      session.user.id,
      "project",
      project.id,
      "created",
      {
        projectName: project.projectName,
        status: project.status,
        client: client.companyName,
      }
    );

    return createSuccessResponse(
      project,
      "Project created successfully",
      201
    );
  } catch (error) {
    return handleGenericError(error);
  }
}
