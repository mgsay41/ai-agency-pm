import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withRole } from "@/lib/api-middleware";
import {
  updateExpenseSchema,
  type UpdateExpenseInput,
} from "@/lib/validations/expense";
import { ZodError } from "zod";

// GET /api/expenses/[id] - Get expense details
export const GET = withRole(
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

      const expense = await db.projectExpense.findUnique({
        where: { id },
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
              roleTitle: true,
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

      if (!expense) {
        return NextResponse.json(
          { error: "Expense not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: { expense },
      });
    } catch (error) {
      console.error("GET /api/expenses/[id] error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },
  ["ADMIN", "SALES", "TEAM_MEMBER"]
);

// PATCH /api/expenses/[id] - Update expense
export const PATCH = withRole(
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
          submittedBy: true,
        },
      });

      if (!existingExpense) {
        return NextResponse.json(
          { error: "Expense not found" },
          { status: 404 }
        );
      }

      // Only allow editing if expense is PENDING
      // Or if user is ADMIN/SALES
      const userRole = session.user.role;
      if (
        existingExpense.status !== "PENDING" &&
        userRole !== "ADMIN" &&
        userRole !== "SALES"
      ) {
        return NextResponse.json(
          { error: "Can only edit pending expenses" },
          { status: 403 }
        );
      }

      const body = await request.json();
      const sanitizedData: UpdateExpenseInput = updateExpenseSchema.parse(body);

      const expense = await db.projectExpense.update({
        where: { id },
        data: sanitizedData,
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

      console.error("PATCH /api/expenses/[id] error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },
  ["ADMIN", "SALES", "TEAM_MEMBER"]
);

// DELETE /api/expenses/[id] - Delete expense
export const DELETE = withRole(
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

      // Only ADMIN can delete approved/reimbursed expenses
      if (
        (existingExpense.status === "APPROVED" ||
          existingExpense.status === "REIMBURSED") &&
        session.user.role !== "ADMIN"
      ) {
        return NextResponse.json(
          {
            error: "Only administrators can delete approved/reimbursed expenses",
          },
          { status: 403 }
        );
      }

      await db.projectExpense.delete({
        where: { id },
      });

      return NextResponse.json({
        success: true,
        message: "Expense deleted successfully",
      });
    } catch (error) {
      console.error("DELETE /api/expenses/[id] error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },
  ["ADMIN", "SALES", "TEAM_MEMBER"]
);
