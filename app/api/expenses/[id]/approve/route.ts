import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withRole } from "@/lib/api-middleware";
import {
  approveExpenseSchema,
  type ApproveExpenseInput,
} from "@/lib/validations/expense";
import { ZodError } from "zod";

// POST /api/expenses/[id]/approve - Approve expense
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
          amount: true,
        },
      });

      if (!existingExpense) {
        return NextResponse.json(
          { error: "Expense not found" },
          { status: 404 }
        );
      }

      // Check if already approved
      if (existingExpense.status === "APPROVED") {
        return NextResponse.json(
          { error: "Expense is already approved" },
          { status: 400 }
        );
      }

      // Check if expense is pending
      if (existingExpense.status !== "PENDING") {
        return NextResponse.json(
          {
            error: `Cannot approve expense with status: ${existingExpense.status}`,
          },
          { status: 400 }
        );
      }

      const body = await request.json();
      const sanitizedData: ApproveExpenseInput =
        approveExpenseSchema.parse(body);

      const expense = await db.projectExpense.update({
        where: { id },
        data: {
          status: "APPROVED",
          approvedBy: sanitizedData.approvedBy,
          approvedAt: new Date(),
          rejectionReason: null, // Clear any previous rejection reason
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
          ApprovedByUser: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: { expense },
        message: "Expense approved successfully",
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

      console.error("POST /api/expenses/[id]/approve error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },
  ["ADMIN", "SALES"]
);
