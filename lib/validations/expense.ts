import { z } from "zod";

// Expense Status Enum
export const expenseStatusEnum = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "REIMBURSED",
]);

// Create Expense Schema
export const createExpenseSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  category: z.string().max(100).optional().nullable(),
  description: z
    .string({ message: "Description is required" })
    .min(1, "Description cannot be empty")
    .max(500, "Description must be less than 500 characters")
    .trim(),
  amount: z
    .number({ message: "Amount must be a number" })
    .positive("Amount must be greater than 0")
    .max(1000000, "Amount seems too high"),
  currency: z.string().max(3).default("USD"),
  expenseDate: z.coerce.date({
    message: "Please enter a valid expense date",
  }),
  receiptUrl: z.string().url("Must be a valid URL").optional().nullable(),
  isBillable: z.boolean().default(true),
  submittedBy: z.string().min(1, "Submitted by is required"),
  approvedBy: z.string().optional().nullable(),
  approvedAt: z.coerce.date().optional().nullable(),
  status: expenseStatusEnum.default("PENDING"),
  rejectionReason: z.string().max(500).optional().nullable(),
});

// Update Expense Schema
export const updateExpenseSchema = z.object({
  category: z.string().max(100).optional().nullable(),
  description: z
    .string()
    .min(1, "Description cannot be empty")
    .max(500, "Description must be less than 500 characters")
    .optional(),
  amount: z
    .number()
    .positive("Amount must be greater than 0")
    .max(1000000, "Amount seems too high")
    .optional(),
  currency: z.string().max(3).optional(),
  expenseDate: z.coerce.date().optional(),
  receiptUrl: z.string().url("Must be a valid URL").optional().nullable(),
  isBillable: z.boolean().optional(),
  status: expenseStatusEnum.optional(),
  approvedBy: z.string().optional().nullable(),
  approvedAt: z.coerce.date().optional().nullable(),
  rejectionReason: z.string().max(500).optional().nullable(),
});

// Approve Expense Schema
export const approveExpenseSchema = z.object({
  approvedBy: z.string().min(1, "Approver ID is required"),
});

// Reject Expense Schema
export const rejectExpenseSchema = z.object({
  rejectionReason: z
    .string()
    .min(1, "Rejection reason is required")
    .max(500, "Rejection reason must be less than 500 characters"),
});

// Query Parameters Schema for GET /api/expenses
export const expenseQuerySchema = z.object({
  projectId: z.string().optional(),
  submittedBy: z.string().optional(),
  status: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(",") : undefined)),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  isBillable: z.coerce.boolean().optional(),

  // Sorting
  sortBy: z
    .enum(["expenseDate", "amount", "createdAt", "status"])
    .default("expenseDate")
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),

  // Pagination
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(25).optional(),
});

// Type exports
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ApproveExpenseInput = z.infer<typeof approveExpenseSchema>;
export type RejectExpenseInput = z.infer<typeof rejectExpenseSchema>;
export type ExpenseQueryInput = z.infer<typeof expenseQuerySchema>;
