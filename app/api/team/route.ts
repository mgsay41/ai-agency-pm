import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { teamMemberSchema } from "@/lib/validations/team";
import { handleGenericError } from "@/lib/api-error";
import { z } from "zod";
import { sanitizeFormData } from "@/lib/sanitize";

// GET /api/team - Get all team members
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Filters
    const status = searchParams.get("status");
    const department = searchParams.get("department");
    const search = searchParams.get("search");
    const skills = searchParams.get("skills")?.split(",").filter(Boolean);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "25");
    const skip = (page - 1) * limit;

    // Sorting
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (department) {
      where.department = department;
    }

    if (search) {
      where.OR = [
        {
          fullName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          roleTitle: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (skills && skills.length > 0) {
      where.skills = {
        hasSome: skills,
      };
    }

    // Fetch team members
    const [teamMembers, total] = await Promise.all([
      db.teamMember.findMany({
        where,
        include: {
          _count: {
            select: {
              ProjectAssignment: {
                where: {
                  isActive: true,
                },
              },
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        take: limit,
        skip,
      }),
      db.teamMember.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        teamMembers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    return handleGenericError(error);
  }
}

// POST /api/team - Create team member
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validatedData = teamMemberSchema.parse(body);

    // Sanitize input to prevent XSS
    const sanitizedData = sanitizeFormData(validatedData, {
      textarea: ["bio"],
      plainText: ["fullName", "email", "phone", "roleTitle", "linkedinUrl", "githubUrl"],
    });

    // Check if email already exists
    const existingMember = await db.teamMember.findUnique({
      where: { email: sanitizedData.email },
    });

    if (existingMember) {
      return NextResponse.json(
        {
          success: false,
          error: "A team member with this email already exists"
        },
        { status: 409 }
      );
    }

    // Create team member
    const teamMember = await db.teamMember.create({
      data: {
        id: crypto.randomUUID(),
        fullName: sanitizedData.fullName,
        email: sanitizedData.email,
        phone: sanitizedData.phone,
        roleTitle: sanitizedData.roleTitle,
        department: sanitizedData.department,
        specialization: sanitizedData.specialization || [],
        skills: sanitizedData.skills || [],
        hourlyRate: sanitizedData.hourlyRate,
        currency: sanitizedData.currency || "USD",
        employmentType: sanitizedData.employmentType,
        startDate: sanitizedData.startDate,
        status: sanitizedData.status || "ACTIVE",
        avatarColor: sanitizedData.avatarColor || "#18181B",
        bio: sanitizedData.bio,
        linkedinUrl: sanitizedData.linkedinUrl,
        githubUrl: sanitizedData.githubUrl,
        createdBy: session.user.id,
        updatedAt: new Date(),
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        entityType: "team_member",
        entityId: teamMember.id,
        action: "created",
        changes: {
          name: teamMember.fullName,
          email: teamMember.email,
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Team member created successfully",
        data: teamMember,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return handleGenericError(error);
  }
}
