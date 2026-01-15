import { z } from "zod";

// Project Type Enum
export const projectTypeEnum = z.enum([
  "AI_AGENT",
  "AUTOMATION",
  "SAAS",
  "CONSULTING",
  "OTHER",
]);

// Project Status Enum
export const projectStatusEnum = z.enum([
  "PLANNING",
  "ACTIVE",
  "ON_HOLD",
  "COMPLETED",
  "ARCHIVED",
]);

// Priority Enum
export const priorityEnum = z.enum(["HIGH", "MEDIUM", "LOW"]);

// Billing Type Enum
export const billingTypeEnum = z.enum([
  "FIXED_PRICE",
  "TIME_MATERIALS",
  "RETAINER",
  "PRO_BONO",
]);

// Health Status Enum
export const healthStatusEnum = z.enum(["ON_TRACK", "AT_RISK", "OFF_TRACK"]);

// Create Project Schema
export const createProjectSchema = z
  .object({
    projectName: z
      .string()
      .min(1, "Project name is required")
      .max(255, "Project name must be less than 255 characters"),
    projectCode: z
      .string()
      .max(50, "Project code must be less than 50 characters")
      .optional(),
    clientId: z.string().min(1, "Client is required"),
    projectType: projectTypeEnum,
    description: z.string().optional(),
    internalNotes: z.string().optional(),
    status: projectStatusEnum.default("PLANNING"),
    priority: priorityEnum.default("MEDIUM"),
    startDate: z.coerce.date({
      message: "Start date is required and must be a valid date",
    }),
    endDate: z.coerce.date({
      message: "End date is required and must be a valid date",
    }),
    actualStartDate: z.coerce.date().optional().nullable(),
    actualEndDate: z.coerce.date().optional().nullable(),
    estimatedHours: z
      .number()
      .positive("Estimated hours must be positive")
      .optional()
      .nullable(),
    budgetAmount: z
      .number()
      .positive("Budget amount must be positive")
      .optional()
      .nullable(),
    currency: z.string().max(3).default("USD"),
    billingType: billingTypeEnum.optional().nullable(),
    progressPercentage: z
      .number()
      .int()
      .min(0, "Progress must be at least 0")
      .max(100, "Progress must be at most 100")
      .default(0),
    currentPhase: z.string().max(255).optional().nullable(),
    healthStatus: healthStatusEnum.optional().nullable(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

// Update Project Schema (all fields optional except ID)
export const updateProjectSchema = z
  .object({
    projectName: z
      .string()
      .min(1, "Project name is required")
      .max(255, "Project name must be less than 255 characters")
      .optional(),
    projectCode: z
      .string()
      .max(50, "Project code must be less than 50 characters")
      .optional()
      .nullable(),
    clientId: z.string().min(1, "Client is required").optional(),
    projectType: projectTypeEnum.optional(),
    description: z.string().optional().nullable(),
    internalNotes: z.string().optional().nullable(),
    status: projectStatusEnum.optional(),
    priority: priorityEnum.optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    actualStartDate: z.coerce.date().optional().nullable(),
    actualEndDate: z.coerce.date().optional().nullable(),
    estimatedHours: z
      .number()
      .positive("Estimated hours must be positive")
      .optional()
      .nullable(),
    budgetAmount: z
      .number()
      .positive("Budget amount must be positive")
      .optional()
      .nullable(),
    currency: z.string().max(3).optional(),
    billingType: billingTypeEnum.optional().nullable(),
    progressPercentage: z
      .number()
      .int()
      .min(0, "Progress must be at least 0")
      .max(100, "Progress must be at most 100")
      .optional(),
    currentPhase: z.string().max(255).optional().nullable(),
    healthStatus: healthStatusEnum.optional().nullable(),
    isArchived: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.endDate > data.startDate;
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

// Query Parameters Schema for GET /api/projects
export const projectQuerySchema = z.object({
  // Filtering
  status: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(",") : undefined)),
  priority: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(",") : undefined)),
  clientId: z.string().optional(),
  projectType: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(",") : undefined)),

  // Search
  search: z.string().optional(),

  // Sorting
  sortBy: z
    .enum([
      "projectName",
      "startDate",
      "endDate",
      "createdAt",
      "updatedAt",
      "status",
      "priority",
    ])
    .default("updatedAt")
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),

  // Pagination
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(25).optional(),

  // Include relations
  includeClient: z.coerce.boolean().default(true).optional(),
  includeTeam: z.coerce.boolean().default(true).optional(),
});

// Project Assignment Schema
export const projectAssignmentSchema = z.object({
  memberId: z.string().min(1, "Team member is required"),
  roleInProject: z
    .string()
    .min(1, "Role in project is required")
    .max(100, "Role must be less than 100 characters"),
  allocationPercentage: z
    .number()
    .int()
    .min(0, "Allocation must be at least 0")
    .max(100, "Allocation must be at most 100")
    .default(100),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// Type exports
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectQueryInput = z.infer<typeof projectQuerySchema>;
export type ProjectAssignmentInput = z.infer<typeof projectAssignmentSchema>;
