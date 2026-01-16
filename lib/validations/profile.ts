import { z } from "zod";

// User profile validation schema
export const profileSchema = z.object({
  name: z
    .string({ message: "Name is required" })
    .min(1, "Name cannot be empty")
    .max(255, "Name must be less than 255 characters")
    .trim(),
  email: z
    .string({ message: "Email is required" })
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters")
    .trim()
    .toLowerCase(),
  phone: z
    .string()
    .max(50, "Phone number must be less than 50 characters")
    .optional()
    .nullable()
    .or(z.literal("")),
});

// Type inference
export type ProfileFormData = z.infer<typeof profileSchema>;

// Schema for updating profile (all fields optional)
export const updateProfileSchema = profileSchema.partial();

export type UpdateProfileData = z.infer<typeof updateProfileSchema>;
