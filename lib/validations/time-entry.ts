import { z } from "zod";

// Create Time Entry Schema
export const createTimeEntrySchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  taskId: z.string().optional().nullable(),
  memberId: z.string().min(1, "Team member is required"),
  workDate: z.coerce.date({
    message: "Please enter a valid work date",
  }),
  hours: z
    .number({ message: "Hours must be a number" })
    .positive("Hours must be greater than 0")
    .max(24, "Hours cannot exceed 24 in a single day"),
  description: z.string().optional().nullable(),
  isBillable: z.boolean().default(true),
  hourlyRate: z
    .number()
    .positive("Hourly rate must be greater than 0")
    .max(10000, "Hourly rate seems too high")
    .optional()
    .nullable(),
  isApproved: z.boolean().default(false),
  approvedBy: z.string().optional().nullable(),
  approvedAt: z.coerce.date().optional().nullable(),
});

// Update Time Entry Schema
export const updateTimeEntrySchema = z.object({
  taskId: z.string().optional().nullable(),
  workDate: z.coerce.date().optional(),
  hours: z
    .number()
    .positive("Hours must be greater than 0")
    .max(24, "Hours cannot exceed 24 in a single day")
    .optional(),
  description: z.string().optional().nullable(),
  isBillable: z.boolean().optional(),
  hourlyRate: z
    .number()
    .positive("Hourly rate must be greater than 0")
    .max(10000, "Hourly rate seems too high")
    .optional()
    .nullable(),
  isApproved: z.boolean().optional(),
  approvedBy: z.string().optional().nullable(),
  approvedAt: z.coerce.date().optional().nullable(),
});

// Query Parameters Schema for GET /api/time-entries
export const timeEntryQuerySchema = z.object({
  projectId: z.string().optional(),
  memberId: z.string().optional(),
  taskId: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  isBillable: z.coerce.boolean().optional(),
  isApproved: z.coerce.boolean().optional(),

  // Sorting
  sortBy: z
    .enum(["workDate", "hours", "createdAt"])
    .default("workDate")
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),

  // Pagination
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(25).optional(),
});

// Type exports
export type CreateTimeEntryInput = z.infer<typeof createTimeEntrySchema>;
export type UpdateTimeEntryInput = z.infer<typeof updateTimeEntrySchema>;
export type TimeEntryQueryInput = z.infer<typeof timeEntryQuerySchema>;
