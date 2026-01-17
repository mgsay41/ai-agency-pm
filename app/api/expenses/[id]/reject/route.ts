import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withRole } from "@/lib/api-middleware";
import {
  rejectExpenseSchema,
  type RejectExpenseInput,
} from "@/lib/validations/expense";
import { ZodError } from "zod";

// POST /api/expenses/[id]/reject - Reject expense
export const POST = withRole(
  async (
    request: NextRequest,
    session: any,
    context: { params: Promise<{ id: string }> }
  ) => {
    try {
      const { id } = await context.params;

      if (!id) {
        return NextResponse.json(
          { error: "Expense ID is required" },
          { status: 400 }
        );
      }

      // Check if expense exists
      const existingExpense = await db.projectExpense.findUnique({
        where: { id },
        select: {
          id: true,
          status: true,
        },
      });

      if (!existingExpense) {
        return NextResponse.json(
          { error: "Expense not found" },
          { status: 404 }
        );
      }

      // Check if already rejected
      if (existingExpense.status === "REJECTED") {
        return NextResponse.json(
          { error: "Expense is already rejected" },
          { status: 400 }
        );
      }

      // Check if expense is pending
      if (existingExpense.status !== "PENDING") {
        return NextResponse.json(
          {
            error: `Cannot reject expense with status: ${existingExpense.status}`,
          },
          { status: 400 }
        );
      }

      const body = await request.json();
      const sanitizedData: RejectExpenseInput =
        rejectExpenseSchema.parse(body);

      const expense = await db.projectExpense.update({
        where: { id },
        data: {
          status: "REJECTED",
          rejectionReason: sanitizedData.rejectionReason,
          approvedBy: null,
          approvedAt: null,
        },
        include: {
          Project: {
            select: {
              id: true,
              projectName: true,
            },
          },
          SubmittedByMember: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: { expense },
        message: "Expense rejected",
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

      console.error("POST /api/expenses/[id]/reject error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },
  ["ADMIN", "SALES"]
);
