import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "10");

    if (query.length < 2) {
      return NextResponse.json({
        success: true,
        data: {
          projects: [],
          clients: [],
          teamMembers: [],
        },
      });
    }

    // Search projects
    const projects = await db.project.findMany({
      where: {
        OR: [
          {
            projectName: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            projectCode: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        projectName: true,
        projectCode: true,
        status: true,
        Client: {
          select: {
            companyName: true,
          },
        },
      },
      take: limit,
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Search clients
    const clients = await db.client.findMany({
      where: {
        OR: [
          {
            companyName: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            industry: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        companyName: true,
        industry: true,
        clientType: true,
      },
      take: limit,
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Search team members
    const teamMembers = await db.teamMember.findMany({
      where: {
        OR: [
          {
            fullName: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            roleTitle: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        roleTitle: true,
        status: true,
        avatarColor: true,
      },
      take: limit,
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        projects,
        clients,
        teamMembers,
      },
    });
  } catch (error) {
    logger.error("GET /api/search error", error, { action: "global_search" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
