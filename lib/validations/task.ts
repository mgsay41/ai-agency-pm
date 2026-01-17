import { z } from "zod";

// Task Status Enum
export const taskStatusEnum = z.enum([
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "BLOCKED",
  "COMPLETED",
  "CANCELLED",
]);

// Priority Enum (shared with projects)
export const priorityEnum = z.enum(["HIGH", "MEDIUM", "LOW"]);

// Create Task Schema
export const createTaskSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  milestoneId: z.string().optional().nullable(),
  assignedTo: z.string().optional().nullable(),
  title: z
    .string({ message: "Task title is required" })
    .min(1, "Task title cannot be empty")
    .max(255, "Task title must be less than 255 characters")
    .trim(),
  description: z.string().optional().nullable(),
  status: taskStatusEnum.default("BACKLOG"),
  priority: priorityEnum.default("MEDIUM"),
  estimatedHours: z
    .number({
      message: "Estimated hours must be a number",
    })
    .positive("Estimated hours must be greater than 0")
    .max(10000, "Estimated hours seems too high (max 10,000)")
    .optional()
    .nullable(),
  actualHours: z
    .number()
    .positive("Actual hours must be greater than 0")
    .max(10000, "Actual hours seems too high (max 10,000)")
    .optional()
    .nullable(),
  dueDate: z.coerce.date().optional().nullable(),
  completedAt: z.coerce.date().optional().nullable(),
  parentTaskId: z.string().optional().nullable(),
  orderIndex: z
    .number()
    .int("Order must be a whole number")
    .min(0, "Order cannot be negative")
    .optional()
    .nullable(),
  tags: z.array(z.string()).optional().nullable(),
  blockedReason: z.string().max(500).optional().nullable(),
});

// Update Task Schema
export const updateTaskSchema = z.object({
  milestoneId: z.string().optional().nullable(),
  assignedTo: z.string().optional().nullable(),
  title: z
    .string()
    .min(1, "Task title cannot be empty")
    .max(255, "Task title must be less than 255 characters")
    .optional(),
  description: z.string().optional().nullable(),
  status: taskStatusEnum.optional(),
  priority: priorityEnum.optional(),
  estimatedHours: z
    .number()
    .positive("Estimated hours must be greater than 0")
    .max(10000, "Estimated hours seems too high")
    .optional()
    .nullable(),
  actualHours: z
    .number()
    .positive("Actual hours must be greater than 0")
    .max(10000, "Actual hours seems too high")
    .optional()
    .nullable(),
  dueDate: z.coerce.date().optional().nullable(),
  completedAt: z.coerce.date().optional().nullable(),
  parentTaskId: z.string().optional().nullable(),
  orderIndex: z
    .number()
    .int("Order must be a whole number")
    .min(0, "Order cannot be negative")
    .optional()
    .nullable(),
  tags: z.array(z.string()).optional().nullable(),
  blockedReason: z.string().max(500).optional().nullable(),
});

// Type exports
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
