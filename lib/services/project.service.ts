import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import type { ProjectQueryInput } from "@/lib/validations/project";

/**
 * Calculate the duration between two dates in days
 */
export function calculateDuration(
  startDate: Date,
  endDate: Date
): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Format project data with calculated fields keeping camelCase for frontend
 */
export function formatProjectData(project: any) {
  // Map camelCase Prisma fields to camelCase for frontend consistency
  const formatted: any = {
    id: project.id,
    projectCode: project.projectCode,
    projectName: project.projectName,
    projectType: project.projectType,
    status: project.status,
    priority: project.priority,
    description: project.description,
    internalNotes: project.internalNotes,
    startDate: project.startDate,
    endDate: project.endDate,
    budgetAmount: project.budgetAmount,
    budgetCurrency: project.currency,
    clientId: project.clientId,
    createdById: project.createdBy,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    durationDays: calculateDuration(
      new Date(project.startDate),
      new Date(project.endDate)
    ),
  };

  // Map Client relation if present
  if (project.Client) {
    formatted.Client = {
      id: project.Client.id,
      companyName: project.Client.companyName,
      clientType: project.Client.clientType,
      industry: project.Client.industry,
      isActive: project.Client.isActive,
    };
  }

  // Map ProjectAssignment relation if present
  if (project.ProjectAssignment) {
    formatted.ProjectAssignment = project.ProjectAssignment.map((assignment: any) => ({
      id: assignment.id,
      roleInProject: assignment.roleInProject,
      allocationPercentage: assignment.allocationPercentage,
      TeamMember: assignment.TeamMember
        ? {
            id: assignment.TeamMember.id,
            fullName: assignment.TeamMember.fullName,
            email: assignment.TeamMember.email,
            roleTitle: assignment.TeamMember.roleTitle,
            avatarColor: assignment.TeamMember.avatarColor,
          }
        : undefined,
    }));
  }

  return formatted;
}

/**
 * Build Prisma where clause from query parameters
 */
export function buildProjectWhereClause(
  query: ProjectQueryInput
): Prisma.ProjectWhereInput {
  const where: Prisma.ProjectWhereInput = {
    // Always filter out soft-deleted projects by default
    deletedAt: null,
  };

  // Status filter
  if (query.status && query.status.length > 0) {
    where.status = { in: query.status as any[] };
  }

  // Priority filter
  if (query.priority && query.priority.length > 0) {
    where.priority = { in: query.priority as any[] };
  }

  // Client filter
  if (query.clientId) {
    where.clientId = query.clientId;
  }

  // Project type filter
  if (query.projectType && query.projectType.length > 0) {
    where.projectType = { in: query.projectType as any[] };
  }

  // Search across project name, description, and client name
  if (query.search) {
    where.OR = [
      {
        projectName: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        Client: {
          companyName: {
            contains: query.search,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  return where;
}

/**
 * Build Prisma orderBy clause from query parameters
 */
export function buildProjectOrderBy(
  query: ProjectQueryInput
): Prisma.ProjectOrderByWithRelationInput {
  const sortBy = query.sortBy || "updatedAt";
  const sortOrder = query.sortOrder || "desc";

  return {
    [sortBy]: sortOrder,
  };
}

/**
 * Build Prisma include clause for relations
 */
export function buildProjectInclude(query: ProjectQueryInput) {
  const include: any = {};

  if (query.includeClient) {
    include.Client = {
      select: {
        id: true,
        companyName: true,
        clientType: true,
        industry: true,
        isActive: true,
      },
    };
  }

  if (query.includeTeam) {
    include.ProjectAssignment = {
      include: {
        TeamMember: {
          select: {
            id: true,
            fullName: true,
            email: true,
            roleTitle: true,
            avatarColor: true,
          },
        },
      },
      where: {
        isActive: true,
      },
    };
  }

  return include;
}

/**
 * Get paginated projects with filters
 */
export async function getPaginatedProjects(query: ProjectQueryInput) {
  const where = buildProjectWhereClause(query);
  const orderBy = buildProjectOrderBy(query);
  const include = buildProjectInclude(query);

  const page = query.page || 1;
  const limit = query.limit || 25;
  const skip = (page - 1) * limit;

  // Get total count for pagination
  const total = await db.project.count({ where });

  // Get projects
  const projects = await db.project.findMany({
    where,
    include,
    orderBy,
    take: limit,
    skip,
  });

  // Format projects with calculated fields
  const formattedProjects = projects.map(formatProjectData);

  return {
    projects: formattedProjects,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get a single project by ID with all relations
 */
export async function getProjectById(projectId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      Client: {
        include: {
          ClientContact: {
            where: { isPrimary: true },
          },
        },
      },
      ProjectAssignment: {
        include: {
          TeamMember: {
            select: {
              id: true,
              fullName: true,
              email: true,
              roleTitle: true,
              avatarColor: true,
              department: true,
              skills: true,
            },
          },
        },
        where: {
          isActive: true,
        },
      },
      Meeting: {
        orderBy: {
          meetingDate: "desc",
        },
        take: 10,
      },
      User_Project_createdByToUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      User_Project_lastModifiedByToUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!project) {
    return null;
  }

  return formatProjectData(project);
}

/**
 * Check if a project code is unique
 */
export async function isProjectCodeUnique(
  projectCode: string,
  excludeProjectId?: string
): Promise<boolean> {
  const existingProject = await db.project.findUnique({
    where: { projectCode },
  });

  if (!existingProject) {
    return true;
  }

  if (excludeProjectId && existingProject.id === excludeProjectId) {
    return true;
  }

  return false;
}

/**
 * Generate a unique project code
 */
export async function generateProjectCode(
  projectName: string,
  clientName: string
): Promise<string> {
  // Take first 3 letters of project name and client name
  const projectPrefix = projectName
    .substring(0, 3)
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
  const clientPrefix = clientName
    .substring(0, 3)
    .toUpperCase()
    .replace(/[^A-Z]/g, "");

  // Get current year
  const year = new Date().getFullYear();

  // Try to find a unique code
  let counter = 1;
  let code = `${projectPrefix}${clientPrefix}-${year}-${String(counter).padStart(3, "0")}`;

  while (!(await isProjectCodeUnique(code))) {
    counter++;
    code = `${projectPrefix}${clientPrefix}-${year}-${String(counter).padStart(3, "0")}`;

    // Safety check to prevent infinite loop
    if (counter > 999) {
      throw new Error("Unable to generate unique project code");
    }
  }

  return code;
}
