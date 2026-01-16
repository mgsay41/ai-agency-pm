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
import { sanitizeFormData } from "@/lib/sanitize";

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

    // Sanitize input to prevent XSS
    const sanitizedData = sanitizeFormData(validatedData, {
      textarea: ["description", "internalNotes"],
      plainText: ["projectName", "projectCode", "currentPhase"],
    });

    // Get client info for project code generation
    const client = await db.client.findUnique({
      where: { id: sanitizedData.clientId },
      select: { companyName: true },
    });

    if (!client) {
      return handleGenericError(new Error("Client not found"));
    }

    // Generate project code if not provided
    let projectCode = sanitizedData.projectCode;
    if (!projectCode) {
      projectCode = await generateProjectCode(
        sanitizedData.projectName,
        client.companyName
      );
    }

    // Create project
    const project = await db.project.create({
      data: {
        id: crypto.randomUUID(),
        projectName: sanitizedData.projectName,
        projectCode,
        clientId: sanitizedData.clientId,
        projectType: sanitizedData.projectType,
        description: sanitizedData.description || null,
        internalNotes: sanitizedData.internalNotes || null,
        status: sanitizedData.status,
        priority: sanitizedData.priority,
        startDate: sanitizedData.startDate,
        endDate: sanitizedData.endDate,
        actualStartDate: sanitizedData.actualStartDate || null,
        actualEndDate: sanitizedData.actualEndDate || null,
        estimatedHours: sanitizedData.estimatedHours || null,
        budgetAmount: sanitizedData.budgetAmount || null,
        currency: sanitizedData.currency,
        billingType: sanitizedData.billingType || null,
        progressPercentage: sanitizedData.progressPercentage,
        currentPhase: sanitizedData.currentPhase || null,
        healthStatus: sanitizedData.healthStatus || null,
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
