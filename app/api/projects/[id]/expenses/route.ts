import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withRole } from "@/lib/api-middleware";
import { generateId } from "@/lib/utils";
import {
  createExpenseSchema,
  type CreateExpenseInput,
} from "@/lib/validations/expense";
import { ZodError } from "zod";

// GET /api/projects/[id]/expenses - Get project expenses
export const GET = withRole(
  async (
    request: NextRequest,
    session: any,
    context: { params: Promise<{ id: string }> }
  ) => {
    try {
      const { id: projectId } = await context.params;

      if (!projectId) {
        return NextResponse.json(
          { error: "Project ID is required" },
          { status: 400 }
        );
      }

      // Parse query parameters
      const { searchParams } = new URL(request.url);
      const status = searchParams.get("status");
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");

      // Verify project exists
      const project = await db.project.findUnique({
        where: { id: projectId },
        select: { id: true },
      });

      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }

      // Build where clause
      const where: any = { projectId };

      if (status) {
        const statusArray = status.split(",");
        where.status = { in: statusArray };
      }

      if (startDate || endDate) {
        where.expenseDate = {};
        if (startDate) where.expenseDate.gte = new Date(startDate);
        if (endDate) where.expenseDate.lte = new Date(endDate);
      }

      const expenses = await db.projectExpense.findMany({
        where,
        orderBy: { expenseDate: "desc" },
        include: {
          SubmittedByMember: {
            select: {
              id: true,
              fullName: true,
              avatarColor: true,
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

      // Calculate totals
      const totalAmount = expenses.reduce(
        (sum, expense) => sum + parseFloat(expense.amount.toString()),
        0
      );

      const billableAmount = expenses
        .filter((expense) => expense.isBillable)
        .reduce((sum, expense) => sum + parseFloat(expense.amount.toString()), 0);

      const approvedAmount = expenses
        .filter((expense) => expense.status === "APPROVED")
        .reduce((sum, expense) => sum + parseFloat(expense.amount.toString()), 0);

      const pendingAmount = expenses
        .filter((expense) => expense.status === "PENDING")
        .reduce((sum, expense) => sum + parseFloat(expense.amount.toString()), 0);

      return NextResponse.json({
        success: true,
        data: {
          expenses,
          summary: {
            totalAmount,
            billableAmount,
            approvedAmount,
            pendingAmount,
            expenseCount: expenses.length,
          },
        },
      });
    } catch (error) {
      console.error("GET /api/projects/[id]/expenses error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },
  ["ADMIN", "SALES", "TEAM_MEMBER"]
);

// POST /api/projects/[id]/expenses - Submit expense
export const POST = withRole(
  async (
    request: NextRequest,
    session: any,
    context: { params: Promise<{ id: string }> }
  ) => {
    try {
      const { id: projectId } = await context.params;

      if (!projectId) {
        return NextResponse.json(
          { error: "Project ID is required" },
          { status: 400 }
        );
      }

      // Verify project exists
      const project = await db.project.findUnique({
        where: { id: projectId },
        select: { id: true },
      });

      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }

      const body = await request.json();
      const sanitizedData: CreateExpenseInput = createExpenseSchema.parse({
        ...body,
        projectId, // Ensure projectId matches URL param
      });

      // Validate submitter exists
      const submitter = await db.teamMember.findUnique({
        where: { id: sanitizedData.submittedBy },
        select: { id: true },
      });

      if (!submitter) {
        return NextResponse.json(
          { error: "Submitter not found" },
          { status: 400 }
        );
      }

      const expense = await db.projectExpense.create({
        data: {
          id: generateId(),
          ...sanitizedData,
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

      return NextResponse.json(
        {
          success: true,
          data: { expense },
        },
        { status: 201 }
      );
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

      console.error("POST /api/projects/[id]/expenses error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },
  ["ADMIN", "SALES", "TEAM_MEMBER"]
);
