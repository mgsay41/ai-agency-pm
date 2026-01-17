import { z } from "zod";

// Milestone Status Enum
export const milestoneStatusEnum = z.enum([
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);

// Create Milestone Schema
export const createMilestoneSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  name: z
    .string({ message: "Milestone name is required" })
    .min(1, "Milestone name cannot be empty")
    .max(255, "Milestone name must be less than 255 characters")
    .trim(),
  description: z.string().optional().nullable(),
  targetDate: z.coerce.date({
    message: "Please enter a valid target date",
  }),
  actualDate: z.coerce.date().optional().nullable(),
  status: milestoneStatusEnum.default("PENDING"),
  orderIndex: z
    .number()
    .int("Order must be a whole number")
    .min(0, "Order cannot be negative")
    .optional()
    .nullable(),
});

// Update Milestone Schema
export const updateMilestoneSchema = z.object({
  name: z
    .string()
    .min(1, "Milestone name cannot be empty")
    .max(255, "Milestone name must be less than 255 characters")
    .optional(),
  description: z.string().optional().nullable(),
  targetDate: z.coerce.date().optional(),
  actualDate: z.coerce.date().optional().nullable(),
  status: milestoneStatusEnum.optional(),
  orderIndex: z
    .number()
    .int("Order must be a whole number")
    .min(0, "Order cannot be negative")
    .optional()
    .nullable(),
});

// Type exports
export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;
