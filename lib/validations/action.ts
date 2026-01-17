/**
 * Validation schemas for Action Items
 */

import { z } from "zod";
import { ActionItemStatus } from "@prisma/client";

/**
 * Schema for creating an action item
 */
export const actionSchema = z.object({
  meetingId: z.string().min(1, "Invalid meeting ID"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(1000, "Description is too long"),
  assignedTo: z.string().min(1, "Invalid team member ID").optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
  status: z.nativeEnum(ActionItemStatus).optional(),
});

/**
 * Schema for updating an action item
 */
export const actionUpdateSchema = z.object({
  description: z
    .string()
    .min(1, "Description is required")
    .max(1000, "Description is too long")
    .optional(),
  assignedTo: z.string().min(1, "Invalid team member ID").optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
  status: z.nativeEnum(ActionItemStatus).optional(),
  completedAt: z.coerce.date().optional().nullable(),
});

/**
 * Schema for team members updating only status (restricted update)
 */
export const actionStatusUpdateSchema = z.object({
  status: z.nativeEnum(ActionItemStatus),
  completedAt: z.coerce.date().optional().nullable(),
});

export type ActionFormData = z.infer<typeof actionSchema>;
export type ActionUpdateData = z.infer<typeof actionUpdateSchema>;
export type ActionStatusUpdateData = z.infer<typeof actionStatusUpdateSchema>;
