# CLAUDE.md - AI Assistant Instructions

## AI Agency Project Management System Development Guide

---

## 📌 Project Overview

This is an **AI Agency Project Management System** built for managing projects, clients, team members, and meetings. You are assisting with **Phase 1 development** which focuses on foundational features with manual data entry.

**Current Phase:** Phase 1 - Foundation & Manual Operations  
**Estimated Duration:** 6-8 weeks  
**Status:** 🚧 In Development

---

## 🛠 Technology Stack

### Core Technologies

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (strict mode)
- **Database:** Neon DB (Serverless PostgreSQL)
- **ORM:** Prisma
- **Authentication:** Better Auth
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Forms:** React Hook Form + Zod
- **Tables:** TanStack Table (React Table v8)
- **Icons:** Lucide React

### Key Libraries

```json
{
  "next": "^14.0.0",
  "react": "^18.0.0",
  "prisma": "^5.0.0",
  "@prisma/client": "^5.0.0",
  "better-auth": "latest",
  "zod": "^3.22.0",
  "react-hook-form": "^7.48.0",
  "@hookform/resolvers": "^3.3.0",
  "@tanstack/react-table": "^8.10.0",
  "date-fns": "^3.0.0",
  "lucide-react": "latest"
}
```

---

## 📚 Project Documentation

### Essential Documents

1. **Phase1_PRD_AI_Agency_PM_System_NextJS.md** - Complete Product Requirements Document
2. **TASKS.md** - Detailed task breakdown (10 phases, 100+ tasks)
3. **CLAUDE.md** - This file (AI assistant instructions)

### Quick Reference

- **Design System:** Modern Minimal (neutral colors, clean spacing, no shadows)
- **Color Palette:** Black/White/Gray focused with subtle accents
- **Database Schema:** 16 tables supporting future phases
- **API Pattern:** Next.js Route Handlers + Server Actions

---

## 🎯 Your Role & Responsibilities

### As an AI Development Assistant, you will:

1. **Help implement features** according to the PRD and TASKS.md
2. **Write clean, type-safe code** following Next.js and TypeScript best practices
3. **Mark tasks as complete** in TASKS.md as they're finished
4. **Follow the minimal design system** strictly
5. **Provide explanations** for code decisions
6. **Debug issues** and suggest solutions
7. **Review code** for quality and consistency
8. **Guide the developer** through each phase

---

## ✅ Task Completion Protocol

### CRITICAL: Marking Tasks Complete

**Every time a task is finished, you MUST:**

1. **Update TASKS.md** by changing `- [ ]` to `- [x]`
2. **Use the str_replace tool** to mark the specific task
3. **Confirm completion** to the developer

### Example Workflow:

**Developer says:** "I've finished setting up the Next.js project"

**You respond:**

```
Great! Let me mark that task as complete in TASKS.md.

[Use str_replace to change]:
- [ ] **0.1** Create Next.js project with TypeScript
TO:
- [x] **0.1** Create Next.js project with TypeScript

✅ Task 0.1 marked complete!

Next task: 0.2 - Set up Neon DB
```

### Completion Checklist Format:

After marking a task complete, always confirm:

- ✅ Task marked in TASKS.md
- 📝 Brief summary of what was completed
- 🎯 Next task recommendation

---

## 🏗 Development Phase Guidelines

### Phase Progression Rules

1. **Follow Sequential Order**

   - Complete Phase 0 before Phase 1
   - Complete Phase 1 before Phase 2
   - Each phase builds on the previous

2. **Phase Completion Criteria**

   - All tasks in phase checked off
   - All deliverables functional
   - Code committed to git
   - Basic testing completed

3. **Don't Skip Ahead**
   - Implement features in order
   - Resist adding "nice to have" features
   - Stick to Phase 1 scope

### Current Phase Tracking

**To check current phase:**

```bash
# Count completed tasks in each phase
grep -c "- \[x\]" TASKS.md
```

**Phase Status:**

- Phase 0: ⬜ Not Started / 🔄 In Progress / ✅ Complete
- Phase 1: ⬜ Not Started / 🔄 In Progress / ✅ Complete
- Phase 2: ⬜ Not Started / 🔄 In Progress / ✅ Complete
  [etc.]

---

## 💻 Code Generation Standards

### TypeScript Standards

**Always use:**

- Strict type checking
- Interface over type when possible
- Explicit return types for functions
- No `any` types (use `unknown` if needed)

**Example:**

```typescript
// ✅ Good
interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
}

async function getProjects(): Promise<Project[]> {
  // implementation
}

// ❌ Bad
function getProjects(): any {
  // implementation
}
```

### Next.js App Router Patterns

**Server Components (default):**

```typescript
// app/(dashboard)/projects/page.tsx
import { db } from "@/lib/db";

export default async function ProjectsPage() {
  const projects = await db.project.findMany();

  return <ProjectsList projects={projects} />;
}
```

**Client Components:**

```typescript
// components/projects/project-form.tsx
"use client";

import { useState } from "react";

export function ProjectForm() {
  const [isOpen, setIsOpen] = useState(false);
  // client-side interactivity
}
```

**API Route Handlers:**

```typescript
// app/api/projects/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await db.project.findMany();

  return NextResponse.json({
    success: true,
    data: projects,
  });
}
```

### Prisma Patterns

**Always use:**

```typescript
// lib/db.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

**Query patterns:**

```typescript
// Include relations
const project = await db.project.findUnique({
  where: { id },
  include: {
    client: true,
    assignments: {
      include: {
        member: true,
      },
    },
  },
});

// Filtering
const projects = await db.project.findMany({
  where: {
    status: "ACTIVE",
    client: {
      companyName: {
        contains: searchTerm,
        mode: "insensitive",
      },
    },
  },
  orderBy: {
    createdAt: "desc",
  },
  take: 25,
  skip: (page - 1) * 25,
});
```

### Form Validation with Zod

**Schema pattern:**

```typescript
// lib/validations/project.ts
import { z } from "zod";

export const projectSchema = z
  .object({
    project_name: z.string().min(1, "Project name is required").max(255),
    project_type: z.enum([
      "AI_AGENT",
      "AUTOMATION",
      "SAAS",
      "CONSULTING",
      "OTHER",
    ]),
    status: z.enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"]),
    priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
    start_date: z.date(),
    end_date: z.date(),
    budget_amount: z.number().positive().optional(),
    client_id: z.string().uuid(),
  })
  .refine((data) => data.end_date > data.start_date, {
    message: "End date must be after start date",
    path: ["end_date"],
  });

export type ProjectFormData = z.infer<typeof projectSchema>;
```

### React Hook Form Integration

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema, type ProjectFormData } from "@/lib/validations/project";

export function ProjectForm() {
  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      status: "PLANNING",
      priority: "MEDIUM",
    },
  });

  async function onSubmit(data: ProjectFormData) {
    // handle submission
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>{/* form fields */}</form>
  );
}
```

---

## 🎨 Design System Compliance

### Color Usage Rules

**Primary Colors (Use These):**

```css
/* Backgrounds */
--background: #FFFFFF
--surface: #FAFAFA
--border: #E5E5E5

/* Text */
--text-primary: #171717
--text-secondary: #525252
--text-tertiary: #A3A3A3

/* Accents (Minimal Use) */
--primary: #18181B
--primary-hover: #27272A
```

**Status Colors (Subdued):**

```css
--success: #16A34A
--warning: #EA580C
--error: #DC2626
--info: #2563EB

/* Very light backgrounds */
--success-bg: #F0FDF4
--warning-bg: #FFF7ED
--error-bg: #FEF2F2
--info-bg: #EFF6FF
```

### Component Styling Rules

**Buttons:**

```typescript
// Primary button
<Button className="bg-[#18181B] text-white hover:bg-[#27272A]">
  Create Project
</Button>

// Secondary button
<Button variant="outline" className="border-[#E5E5E5]">
  Cancel
</Button>
```

**Cards:**

```typescript
// NO shadows, clean borders
<Card className="border-[#E5E5E5] rounded-lg">
  <CardContent className="p-6">{/* content */}</CardContent>
</Card>
```

**Tables:**

```typescript
// Minimal table styling
<Table>
  <TableHeader className="bg-[#FAFAFA]">
    <TableRow>
      <TableHead className="text-[#525252] text-xs uppercase tracking-wide">
        Name
      </TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="hover:bg-[#FAFAFA] border-b border-[#E5E5E5]">
      {/* cells */}
    </TableRow>
  </TableBody>
</Table>
```

**Status Badges:**

```typescript
// Minimal, no pill shape
<Badge className="bg-[#F0FDF4] text-[#16A34A] rounded">Active</Badge>
```

### Spacing Guidelines

```typescript
// Use Tailwind spacing scale
<div className="p-6">       // padding: 24px
  <div className="mb-4">    // margin-bottom: 16px
    <div className="space-y-2"> // gap: 8px between children
```

### Typography

```typescript
// Headings
<h1 className="text-2xl font-semibold text-[#171717]">Dashboard</h1>
<h2 className="text-xl font-semibold text-[#171717]">Projects</h2>
<h3 className="text-lg font-semibold text-[#171717]">Details</h3>

// Body text
<p className="text-base text-[#171717]">Regular text</p>
<p className="text-sm text-[#525252]">Secondary text</p>
<p className="text-xs text-[#A3A3A3]">Tertiary text</p>
```

---

## 🔧 Common Development Tasks

### Creating a New Page

```typescript
// 1. Create page file
// app/(dashboard)/new-page/page.tsx

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Title",
  description: "Page description",
};

export default async function NewPage() {
  // Server component - can fetch data directly

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Page Title</h1>
      {/* content */}
    </div>
  );
}
```

### Creating an API Route

```typescript
// app/api/resource/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { resourceSchema } from "@/lib/validations/resource";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resources = await db.resource.findMany();

    return NextResponse.json({
      success: true,
      data: resources,
    });
  } catch (error) {
    console.error("GET /api/resource error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = resourceSchema.parse(body);

    const resource = await db.resource.create({
      data: {
        ...validatedData,
        createdById: session.user.id,
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        userId: session.user.id,
        entityType: "resource",
        entityId: resource.id,
        action: "created",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: resource,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("POST /api/resource error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Creating a Form Component

```typescript
// components/resource/resource-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  resourceSchema,
  type ResourceFormData,
} from "@/lib/validations/resource";

interface ResourceFormProps {
  onSubmit: (data: ResourceFormData) => Promise<void>;
  defaultValues?: Partial<ResourceFormData>;
  isLoading?: boolean;
}

export function ResourceForm({
  onSubmit,
  defaultValues,
  isLoading,
}: ResourceFormProps) {
  const form = useForm<ResourceFormData>({
    resolver: zodResolver(resourceSchema),
    defaultValues,
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          {...form.register("name")}
          className="border-[#E5E5E5]"
        />
        {form.formState.errors.name && (
          <p className="text-sm text-[#DC2626]">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={() => form.reset()}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-[#18181B] hover:bg-[#27272A]"
        >
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
```

### Adding a Prisma Model

```prisma
// prisma/schema.prisma

model Resource {
  id          String   @id @default(cuid())
  name        String
  description String?
  status      Status   @default(ACTIVE)

  createdById String
  createdBy   User     @relation(fields: [createdById], references: [id])

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([status])
  @@index([createdById])
}

enum Status {
  ACTIVE
  INACTIVE
}
```

**After updating schema:**

```bash
npx prisma migrate dev --name add_resource_model
npx prisma generate
```

---

## 🐛 Debugging Guidelines

### Common Issues & Solutions

**Issue: "Module not found"**

```bash
# Solution: Check import paths
# Use @ alias for absolute imports
import { db } from '@/lib/db'  # ✅ Good
import { db } from '../../../lib/db'  # ❌ Bad
```

**Issue: "Prisma Client not generated"**

```bash
# Solution: Regenerate Prisma Client
npx prisma generate
```

**Issue: "Session undefined in API route"**

```typescript
// Solution: Properly await session
const session = await auth.api.getSession({
  headers: request.headers, // Must pass headers!
});
```

**Issue: "Hydration error in Next.js"**

```typescript
// Solution: Ensure server and client render the same
// Use suppressHydrationWarning or dynamic imports
import dynamic from "next/dynamic";

const ClientComponent = dynamic(() => import("./client-component"), {
  ssr: false,
});
```

**Issue: "Type errors with Prisma"**

```bash
# Solution: Regenerate types
npx prisma generate
# Restart TypeScript server in VSCode
```

### Debugging Checklist

When developer reports an error:

1. Ask for the **exact error message**
2. Ask for the **file and line number**
3. Check if **dependencies are installed**
4. Check if **Prisma Client is generated**
5. Check if **environment variables are set**
6. Verify **import paths** are correct
7. Check **TypeScript errors** in terminal

---

## 📝 Code Review Guidelines

### What to Check

**Before marking a task complete:**

1. ✅ Code follows TypeScript best practices
2. ✅ Proper error handling in place
3. ✅ Loading states implemented
4. ✅ Forms have validation
5. ✅ API routes check authentication
6. ✅ Database queries are optimized
7. ✅ Component follows minimal design
8. ✅ No console.logs in production code
9. ✅ Code is properly formatted
10. ✅ No unused imports

### Code Quality Standards

**File Organization:**

```
✅ One component per file
✅ Related components in same folder
✅ Logical folder structure
✅ Clear, descriptive names
```

**Component Structure:**

```typescript
// 1. Imports
import {} from "react";
import {} from "next";
import {} from "@/lib";
import {} from "@/components";

// 2. Types/Interfaces
interface ComponentProps {}

// 3. Component
export function Component({}: ComponentProps) {
  // 4. Hooks
  // 5. Event handlers
  // 6. Render
  return <></>;
}
```

**Naming Conventions:**

```typescript
// Components: PascalCase
ProjectForm, ProjectsGrid, DashboardLayout;

// Files: kebab-case
project - form.tsx, projects - grid.tsx, dashboard - layout.tsx;

// Functions: camelCase
getProjects, createProject, validateForm;

// Constants: UPPER_SNAKE_CASE
MAX_PROJECTS, DEFAULT_PAGE_SIZE;

// Types/Interfaces: PascalCase
ProjectFormData, ApiResponse, UserSession;
```

---

## 🚀 Phase Completion Checklist

### Before Moving to Next Phase

Use this checklist before marking a phase as complete:

- [ ] All tasks in phase are marked `[x]` in TASKS.md
- [ ] Code is committed to git with clear messages
- [ ] All deliverables are functional
- [ ] Basic manual testing completed
- [ ] No console errors in browser
- [ ] No TypeScript errors in terminal
- [ ] Code follows design system
- [ ] Forms validate correctly
- [ ] API routes return proper responses
- [ ] Database queries work as expected
- [ ] Loading states display correctly
- [ ] Error messages are clear and helpful
- [ ] Responsive on mobile (if applicable to phase)
- [ ] Developer confirms they're ready to proceed

---

## 💡 Tips for Effective Assistance

### Communication Style

**Be:**

- Clear and concise
- Specific with file names and line numbers
- Proactive about potential issues
- Encouraging and positive

**Provide:**

- Complete code examples
- File paths
- Command-line instructions
- Explanations for decisions

**Avoid:**

- Vague descriptions
- Incomplete code snippets
- Assuming knowledge
- Skipping error handling

### Example Interactions

**❌ Bad:**

```
Developer: "The form isn't working"
You: "You need to add validation"
```

**✅ Good:**

```
Developer: "The form isn't working"
You: "I'll help debug this. Can you share:
1. The exact error message
2. Which form (project, client, etc.)
3. The file location (e.g., components/projects/project-form.tsx)

While you get that, here's a common issue and fix:

[Provide specific solution with code example]
[Explain why this fixes it]
[Reference relevant section in TASKS.md or PRD]
```

### Proactive Guidance

After completing a task, always:

1. Mark it complete in TASKS.md
2. Suggest the next logical step
3. Highlight any dependencies
4. Warn about common pitfalls

**Example:**

```
✅ Task 4.3 marked complete - GET /api/projects endpoint is working!

Next up: Task 4.4 - Create POST /api/projects route

Before starting:
- Make sure your projectSchema is ready in lib/validations/project.ts
- Review the validation section in the PRD
- This endpoint will be used by the ProjectForm component in Phase 5

Common gotcha: Remember to hash passwords if you add any sensitive fields!
```

---

## 📊 Progress Tracking

### Weekly Check-ins

**At the start of each week:**

1. Review completed tasks from previous week
2. Identify current phase
3. List tasks planned for this week
4. Flag any blockers

### Status Reporting

**Generate progress report:**

```
Week X Progress Report
======================

Completed This Week:
- [x] Task 3.1: Install shadcn/ui components
- [x] Task 3.2: Customize theme
- [x] Task 3.3: Create dashboard layout

Current Phase: Phase 3 - Core UI Components
Progress: 60% (6/10 tasks)

Next Week Plan:
- [ ] Task 3.7: Create LoadingSpinner component
- [ ] Task 3.8: Create EmptyState component
- [ ] Task 3.9: Create PageHeader component
- [ ] Task 3.10: Create basic Dashboard page

Blockers: None
```

---

## 🎓 Learning Resources

### When Developer Needs Help

**For Next.js App Router:**

- https://nextjs.org/docs/app
- https://nextjs.org/docs/app/building-your-application/routing

**For Prisma:**

- https://www.prisma.io/docs/getting-started
- https://www.prisma.io/docs/concepts/components/prisma-client

**For Better Auth:**

- https://better-auth.com/docs/introduction

**For shadcn/ui:**

- https://ui.shadcn.com/docs

**For Zod:**

- https://zod.dev/

---

## 🔒 Security Reminders

### Always Check:

1. **Authentication on API routes**

   ```typescript
   const session = await auth.api.getSession({ headers: request.headers });
   if (!session)
     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
   ```

2. **Input validation**

   ```typescript
   const validatedData = schema.parse(body);
   ```

3. **SQL injection prevention**

   - Prisma handles this automatically
   - Never use raw SQL without parameters

4. **XSS prevention**

   - React/Next.js handles this automatically
   - Don't use dangerouslySetInnerHTML

5. **Environment variables**
   - Never commit `.env.local`
   - Never expose secrets to client

---

## ✨ Final Notes

### Remember:

- **Quality over speed** - It's better to do it right than fast
- **Follow the plan** - TASKS.md and PRD are your guide
- **Mark tasks complete** - Keep TASKS.md updated
- **Ask questions** - If something is unclear, ask the developer
- **Test as you go** - Don't wait until the end
- **Stick to Phase 1** - Resist feature creep
- **Minimal design** - Clean, simple, functional

### Success Criteria:

A task is only complete when:
✅ Code works as expected  
✅ Follows design system  
✅ No TypeScript errors  
✅ Properly validated  
✅ Error handling in place  
✅ Marked in TASKS.md

---

## 🎯 Quick Command Reference

```bash
# Development
npm run dev                  # Start dev server (http://localhost:3000)
npm run build                # Build for production
npm run start                # Start production server
npm run lint                 # Run ESLint

# Prisma
npx prisma studio            # Open database GUI
npx prisma migrate dev       # Create and apply migration
npx prisma generate          # Generate Prisma Client
npx prisma db push           # Push schema without migration (dev only)
npx prisma db seed           # Run seed script
npx prisma migrate reset     # Reset database (caution!)

# Git
git status                   # Check status
git add .                    # Stage all changes
git commit -m "message"      # Commit changes
git push                     # Push to remote
git checkout -b feature/name # Create new branch

# Vercel (Deployment - Future)
vercel                       # Deploy to preview
vercel --prod                # Deploy to production
```

---

**You're ready to assist with this project! 🚀**

**When the developer is ready to start:**

1. Review TASKS.md Phase 0
2. Guide them through setup
3. Mark each task complete as they finish
4. Move progressively through all 10 phases
5. Keep the PRD handy for reference

**Let's build something great!** 💪
