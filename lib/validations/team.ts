import { z } from "zod";

// Team member validation schema
export const teamMemberSchema = z.object({
  full_name: z
    .string({ message: "Full name is required" })
    .min(1, "Full name cannot be empty")
    .max(255, "Full name must be less than 255 characters")
    .trim(),
  email: z
    .string({ message: "Email is required" })
    .email("Please enter a valid email address (e.g., name@example.com)")
    .max(255, "Email must be less than 255 characters")
    .trim()
    .toLowerCase(),
  phone: z
    .string()
    .max(50, "Phone number must be less than 50 characters")
    .optional()
    .nullable(),
  role_title: z
    .string({ message: "Role/title is required" })
    .min(1, "Role/title cannot be empty")
    .max(100, "Role/title must be less than 100 characters")
    .trim(),
  department: z.enum(
    [
      "DEVELOPMENT",
      "DESIGN",
      "QA",
      "DEVOPS",
      "MANAGEMENT",
      "CONSULTING",
      "OTHER",
    ],
    {
      message: "Please select a department",
    }
  ),
  specialization: z
    .array(z.string())
    .optional()
    .default([]),
  skills: z
    .array(z.string())
    .optional()
    .default([]),
  hourly_rate: z
    .number({
      message: "Hourly rate must be a number",
    })
    .positive("Hourly rate must be greater than 0")
    .max(10000, "Hourly rate seems too high (max $10,000)")
    .optional()
    .nullable(),
  currency: z.string().length(3).default("USD").optional(),
  employment_type: z.enum(
    ["FULL_TIME", "PART_TIME", "CONTRACTOR", "INTERN"],
    {
      message: "Please select an employment type",
    }
  ),
  start_date: z.coerce.date({
    message: "Please enter a valid start date",
  }).optional().nullable(),
  status: z.enum(["ACTIVE", "ON_LEAVE", "INACTIVE"]).default("ACTIVE"),
  avatar_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Please enter a valid color (e.g., #FF5733)")
    .default("#18181B")
    .optional(),
  bio: z
    .string()
    .max(1000, "Bio must be less than 1,000 characters")
    .optional()
    .nullable(),
  linkedin_url: z
    .string()
    .url("Please enter a valid LinkedIn URL (e.g., https://linkedin.com/in/...)")
    .max(500, "LinkedIn URL must be less than 500 characters")
    .optional()
    .nullable()
    .or(z.literal("")),
  github_url: z
    .string()
    .url("Please enter a valid GitHub URL (e.g., https://github.com/username)")
    .max(500, "GitHub URL must be less than 500 characters")
    .optional()
    .nullable()
    .or(z.literal("")),
});

// Type inference
export type TeamMemberFormData = z.infer<typeof teamMemberSchema>;

// Schema for updating team member (all fields optional except email)
export const updateTeamMemberSchema = teamMemberSchema.partial().extend({
  email: z.string().email().max(255).optional(),
});

// Predefined specializations
export const SPECIALIZATIONS = [
  "Frontend Development",
  "Backend Development",
  "Full Stack",
  "AI/ML Engineering",
  "UI Design",
  "UX Design",
  "Project Management",
  "DevOps",
  "QA Automation",
  "Manual Testing",
] as const;

// Predefined skills
export const SKILLS = [
  "React",
  "Next.js",
  "Vue.js",
  "Angular",
  "Node.js",
  "Python",
  "Django",
  "FastAPI",
  "Java",
  "Spring Boot",
  "C#",
  ".NET",
  "PHP",
  "Laravel",
  "Ruby",
  "Rails",
  "Go",
  "Rust",
  "TypeScript",
  "JavaScript",
  "HTML",
  "CSS",
  "Tailwind CSS",
  "SQL",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "AWS",
  "Azure",
  "GCP",
  "Docker",
  "Kubernetes",
  "CI/CD",
  "Git",
  "Figma",
  "Adobe XD",
  "Sketch",
  "Machine Learning",
  "Deep Learning",
  "TensorFlow",
  "PyTorch",
  "Computer Vision",
  "NLP",
  "Data Analysis",
  "Selenium",
  "Cypress",
  "Jest",
  "Pytest",
] as const;

// Department display names
export const DEPARTMENT_LABELS: Record<string, string> = {
  DEVELOPMENT: "Development",
  DESIGN: "Design",
  QA: "QA/Testing",
  DEVOPS: "DevOps",
  MANAGEMENT: "Management",
  CONSULTING: "Consulting",
  OTHER: "Other",
};

// Employment type display names
export const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACTOR: "Contractor",
  INTERN: "Intern",
};

// Status display names
export const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  ON_LEAVE: "On Leave",
  INACTIVE: "Inactive",
};
