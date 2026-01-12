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
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});

export type Session = typeof auth.$Infer.Session;
