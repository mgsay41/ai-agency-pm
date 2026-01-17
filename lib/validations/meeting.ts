import { z } from "zod";

// Meeting Type enum values
export const meetingTypeValues = [
  "KICKOFF",
  "DISCOVERY",
  "PLANNING",
  "REVIEW",
  "DEMO",
  "RETROSPECTIVE",
  "CLIENT_CALL",
  "INTERNAL_SYNC",
  "OTHER",
] as const;

// Meeting Type labels for display
export const meetingTypeLabels: Record<typeof meetingTypeValues[number], string> = {
  KICKOFF: "Kickoff",
  DISCOVERY: "Discovery",
  PLANNING: "Planning",
  REVIEW: "Progress Review",
  DEMO: "Demo",
  RETROSPECTIVE: "Retrospective",
  CLIENT_CALL: "Client Call",
  INTERNAL_SYNC: "Internal Sync",
  OTHER: "Other",
};

// Action Item Status enum values
export const actionItemStatusValues = [
  "OPEN",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;

// Action Item Status labels for display
export const actionItemStatusLabels: Record<typeof actionItemStatusValues[number], string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

// Attendee Type enum values
export const attendeeTypeValues = ["INTERNAL", "EXTERNAL"] as const;

// Attendee schema
export const attendeeSchema = z.object({
  memberId: z.string().optional(),
  externalName: z.string().optional(),
  externalEmail: z.string().email().optional(),
  attendeeType: z.enum(attendeeTypeValues),
  attended: z.boolean(),
});

// Action Item schema
export const actionItemSchema = z.object({
  description: z
    .string({ message: "Action item description is required" })
    .min(1, "Description cannot be empty")
    .max(500, "Description must be less than 500 characters")
    .trim(),
  assignedTo: z.string().optional(),
  dueDate: z.coerce.date({
    message: "Please enter a valid due date",
  }).optional(),
  status: z.enum(actionItemStatusValues, {
    message: "Please select a status",
  }),
});

// Meeting schema for creation (used for form validation)
export const meetingFormSchema = z.object({
  projectId: z
    .string({ message: "Please select a project" })
    .min(1, "Please select a project"),
  meetingDate: z.coerce.date({
    message: "Please enter a valid meeting date",
  }).optional(),
  durationMinutes: z
    .number({
      message: "Duration must be a number",
    })
    .int("Duration must be a whole number")
    .positive("Duration must be greater than 0")
    .max(480, "Meeting duration cannot exceed 8 hours (480 minutes)")
    .optional(),
  meetingType: z.enum(meetingTypeValues, {
    message: "Please select a meeting type",
  }),
  locationPlatform: z
    .string()
    .max(255, "Location/Platform must be less than 255 characters")
    .optional(),
  agenda: z
    .string()
    .max(2000, "Agenda must be less than 2,000 characters")
    .optional(),
  notes: z.string().optional(),
  transcript: z.string().optional(),
  recordingUrl: z
    .string()
    .optional()
    .transform((val) => (val?.trim() === "" ? undefined : val))
    .refine(
      (val) => {
        if (!val) return true;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      "Please enter a valid recording URL (e.g., https://...)"
    ),
  nextMeetingDate: z.coerce.date({
    message: "Please enter a valid date for next meeting",
  }).optional(),
  nextMeetingNotes: z
    .string()
    .max(500, "Next meeting notes must be less than 500 characters")
    .optional(),
  attendees: z.array(attendeeSchema).optional(),
  actionItems: z.array(actionItemSchema).optional(),
});

// Meeting schema for API validation (stricter - requires date, allows __new_project__)
export const meetingSchema = z.object({
  projectId: z.string().min(1, "Project is required"), // Allows __new_project__ special value
  meetingDate: z.coerce.date(),
  durationMinutes: z.number().int().positive().max(480).optional(),
  meetingType: z.enum(meetingTypeValues),
  locationPlatform: z.string().max(255).optional(),
  agenda: z.string().max(2000).optional(),
  notes: z.string().optional(),
  transcript: z.string().optional(),
  recordingUrl: z.string().url().optional().or(z.literal("")),
  nextMeetingDate: z.coerce.date().optional(),
  nextMeetingNotes: z.string().max(500).optional(),
  // Attendees will be handled separately
  attendees: z.array(attendeeSchema).optional(),
  // Action items will be handled separately
  actionItems: z.array(actionItemSchema).optional(),
});

// Meeting update schema (all fields optional except ID)
export const meetingUpdateSchema = meetingSchema.partial();

// Type inference
export type MeetingFormData = z.infer<typeof meetingSchema>;
export type MeetingFormInput = z.infer<typeof meetingFormSchema>;
export type MeetingUpdateData = z.infer<typeof meetingUpdateSchema>;
export type AttendeeFormData = z.infer<typeof attendeeSchema>;
export type ActionItemFormData = z.infer<typeof actionItemSchema>;
