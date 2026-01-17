import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withRole } from "@/lib/api-middleware";
import { generateId } from "@/lib/utils";
import {
  createExpenseSchema,
  expenseQuerySchema,
  type CreateExpenseInput,
  type ExpenseQueryInput,
} from "@/lib/validations/expense";
import { ZodError } from "zod";

// GET /api/expenses - List all expenses (with filters)
export const GET = withRole(
  async (request: NextRequest, session: any) => {
    try {
      const { searchParams } = new URL(request.url);
      const queryParams = Object.fromEntries(searchParams.entries());

      const filters: ExpenseQueryInput = expenseQuerySchema.parse(queryParams);

      const {
        projectId,
        submittedBy,
        status,
        startDate,
        endDate,
        isBillable,
        sortBy = "expenseDate",
        sortOrder = "desc",
        page = 1,
        limit = 25,
      } = filters;

      // Build where clause
      const where: any = {};

      if (projectId) where.projectId = projectId;
      if (submittedBy) where.submittedBy = submittedBy;
      if (status && status.length > 0) where.status = { in: status };
      if (isBillable !== undefined) where.isBillable = isBillable;

      if (startDate || endDate) {
        where.expenseDate = {};
        if (startDate) where.expenseDate.gte = startDate;
        if (endDate) where.expenseDate.lte = endDate;
      }

      // Get total count
      const total = await db.projectExpense.count({ where });

      // Get paginated results
      const expenses = await db.projectExpense.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        take: limit,
        skip: (page - 1) * limit,
        include: {
          Project: {
            select: {
              id: true,
              projectName: true,
              projectCode: true,
            },
          },
          SubmittedByMember: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarColor: true,
            },
          },
          ApprovedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          expenses,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            error: "Validation error",
            details: error.errors,
          },
          { status: 400 }
        );
      }

      console.error("GET /api/expenses error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },
  ["ADMIN", "SALES", "TEAM_MEMBER"]
);

// POST /api/expenses - Create expense (moved to project-specific endpoint)
// This endpoint is kept for backward compatibility but redirects logic to project-based creation
