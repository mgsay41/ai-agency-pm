import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
  },
  onRequest: async (request, context) => {
    // Check if this is a signup request
    if (request.method === "POST" && request.url.includes("/sign-up/email")) {
      // Check if this is the first user
      const userCount = await db.user.count();

      if (userCount === 0) {
        // First user should be ADMIN and not pending
        context.body = {
          ...context.body,
          role: "ADMIN",
          isPending: false,
        };
      }
    }

    return { request, context };
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "TEAM_MEMBER",
        returned: true,
      },
      phone: {
        type: "string",
        required: false,
        returned: true,
      },
      isActive: {
        type: "boolean",
        required: false,
        defaultValue: true,
        returned: true,
      },
      isPending: {
        type: "boolean",
        required: false,
        defaultValue: true,
        returned: true,
      },
      lastLogin: {
        type: "date",
        required: false,
        returned: false,
      },
      createdBy: {
        type: "string",
        required: false,
        returned: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24, // 24 hours
    updateAge: 60 * 60, // Update session every hour
    modelName: "session",
  },
  advanced: {
    // Better Auth has built-in CSRF protection enabled by default
    // This validates origin header for state-changing requests
    useSecureCookies: process.env.NODE_ENV === "production",
    crossSubDomainCookies: {
      enabled: false,
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});

export type Session = typeof auth.$Infer.Session;
