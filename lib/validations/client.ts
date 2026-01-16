import { z } from "zod";

// Client validation schema
export const clientSchema = z.object({
  clientType: z.enum(["COMPANY", "INDIVIDUAL", "NONPROFIT", "GOVERNMENT"], {
    message: "Please select a client type",
  }),
  companyName: z
    .string({ message: "Company/Individual name is required" })
    .min(1, "Name cannot be empty")
    .max(255, "Name must be less than 255 characters")
    .trim(),
  industry: z
    .string()
    .max(100, "Industry must be less than 100 characters")
    .optional(),
  companySize: z
    .enum(["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"], {
      message: "Please select a valid company size",
    })
    .optional(),
  website: z
    .string()
    .refine(
      (val) => !val || val === "" || z.string().url().safeParse(val).success,
      "Please enter a valid website URL (e.g., https://example.com)"
    )
    .optional()
    .or(z.literal("")),
  billingAddress: z.string().optional(),
  timeZone: z.string().max(100).optional(),
  preferredCommunication: z
    .array(z.enum(["EMAIL", "PHONE", "SLACK", "TEAMS", "WHATSAPP"]))
    .optional()
    .default([]),
  tags: z.array(z.string()).optional().default([]),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
  clientSince: z.date().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;

// Client contact validation schema
export const clientContactSchema = z.object({
  clientId: z.string().refine((val) => z.string().uuid().safeParse(val).success, {
    message: "Invalid client ID",
  }),
  isPrimary: z.boolean().default(false),
  contactName: z
    .string({ message: "Contact name is required" })
    .min(1, "Contact name cannot be empty")
    .max(255, "Name must be less than 255 characters")
    .trim(),
  jobTitle: z
    .string()
    .max(100, "Job title must be less than 100 characters")
    .optional(),
  email: z
    .string({ message: "Email is required" })
    .email("Please enter a valid email address (e.g., name@example.com)")
    .max(255, "Email must be less than 255 characters")
    .trim()
    .toLowerCase(),
  phone: z
    .string()
    .max(50, "Phone number must be less than 50 characters")
    .optional(),
  mobile: z
    .string()
    .max(50, "Mobile number must be less than 50 characters")
    .optional(),
  linkedinUrl: z
    .string()
    .refine(
      (val) => !val || val === "" || z.string().url().safeParse(val).success,
      "Please enter a valid LinkedIn URL (e.g., https://linkedin.com/in/...)"
    )
    .optional()
    .or(z.literal("")),
  notes: z.string().optional(),
});

export type ClientContactFormData = z.infer<typeof clientContactSchema>;

// Schema for creating a client with primary contact
export const createClientWithContactSchema = z.object({
  client: clientSchema,
  contact: clientContactSchema.omit({ clientId: true }),
});

export type CreateClientWithContactData = z.infer<
  typeof createClientWithContactSchema
>;

// Schema for updating client
export const updateClientSchema = clientSchema.partial();

// Schema for updating contact
export const updateClientContactSchema = clientContactSchema
  .omit({ clientId: true })
  .partial();

// Legacy export for backward compatibility
export const createClientSchema = clientSchema;
export type CreateClientInput = ClientFormData;
