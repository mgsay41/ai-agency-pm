import { z } from "zod";

export const createClientSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(255),
  clientType: z.enum(["COMPANY", "INDIVIDUAL", "NONPROFIT", "GOVERNMENT"]),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  billingAddress: z.string().optional(),
  timeZone: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
  clientSince: z.date().optional(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
