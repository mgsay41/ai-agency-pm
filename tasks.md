# Phase 1 Development Tasks

## AI Agency Project Management System - Task Breakdown

---

## Overview

This document breaks down Phase 1 into **10 small phases** that can be developed incrementally. Each phase builds upon the previous one and has clear deliverables.

**Estimated Timeline:** 6-8 weeks  
**Technology Stack:** Next.js 14+ / Neon DB / Prisma / Better Auth

---

## Phase 0: Project Setup & Configuration

**Duration:** 2-3 days  
**Goal:** Set up the foundation for development

### Tasks:

- [x] **0.1** Create Next.js project with TypeScript

  ```bash
  npx create-next-app@latest ai-agency-pm --typescript --tailwind --app --eslint
  ```

  - Use App Router
  - Enable TypeScript
  - Include Tailwind CSS
  - Include ESLint

- [x] **0.2** Set up Neon DB

  - Create Neon account
  - Create new database project
  - Get connection string
  - Create `.env` file with `DATABASE_URL`

- [x] **0.3** Install and configure Prisma

  ```bash
  npm install prisma @prisma/client
  npx prisma init
  ```

  - Update `schema.prisma` with Neon DB config
  - Create `lib/db.ts` for Prisma client singleton

- [x] **0.4** Install core dependencies

  ```bash
  npm install better-auth date-fns zod react-hook-form @hookform/resolvers
  npm install @tanstack/react-table
  npm install -D @types/node
  ```

- [x] **0.5** Set up shadcn/ui

  ```bash
  npx shadcn-ui@latest init
  ```

  - Configure with minimal theme
  - Set up custom colors (neutrals)

- [x] **0.6** Configure project structure

  - Create folder structure as per PRD
  - Set up path aliases in `tsconfig.json`
  - Create `lib/utils.ts` helper file

- [x] **0.7** Set up Git repository
  - Initialize git
  - Create `.gitignore` (exclude `.env.local`)
  - Initial commit
  - Create `develop` branch

### Deliverables:

✅ Next.js project running on `http://localhost:3000`  
✅ Neon DB connected  
✅ Prisma initialized  
✅ Project structure in place  
✅ Git repository set up

---

## Phase 1: Database Schema & Migrations

**Duration:** 2-3 days  
**Goal:** Create complete database schema and run migrations

### Tasks:

- [x] **1.1** Define User model in Prisma schema

  - id, email, passwordHash, fullName, role, isActive
  - createdAt, updatedAt timestamps
  - Enums for Role

- [x] **1.2** Define Client model

  - All fields from PRD
  - Relation to projects

- [x] **1.3** Define ClientContact model

  - Linked to Client
  - Primary contact flag

- [x] **1.4** Define TeamMember model

  - All fields from PRD
  - JSON fields for skills, specialization
  - Optional link to User model

- [x] **1.5** Define Project model

  - All core fields
  - Relations to Client, User (creator)
  - Enums for ProjectType, ProjectStatus, Priority

- [x] **1.6** Define ProjectAssignment model

  - Many-to-many between Projects and TeamMembers
  - Role in project, allocation percentage

- [x] **1.7** Define Meeting model

  - Linked to Project
  - Meeting type, transcript, notes

- [x] **1.8** Define MeetingAttendee model

  - Linked to Meeting
  - Support for internal and external attendees

- [x] **1.9** Define ActionItem model

  - Linked to Meeting
  - Status tracking

- [x] **1.10** Define ActivityLog model

  - Track all CRUD operations
  - JSON field for changes

- [x] **1.11** Add all indexes as specified in PRD

- [x] **1.12** Create and run initial migration

  ```bash
  npx prisma migrate dev --name init
  npx prisma generate
  ```

- [x] **1.13** Create seed script

  - Create `prisma/seed.ts`
  - Add admin user
  - Add sample clients
  - Add sample team members
  - Add sample projects
  - Configure seed in `package.json`

- [x] **1.14** Test database connection
  - Open Prisma Studio: `npx prisma studio`
  - Verify all tables created
  - Run seed: `npx prisma db seed`

### Deliverables:

✅ Complete Prisma schema  
✅ Database migrated with all tables  
✅ Seed data in database  
✅ Prisma Client generated

---

## Phase 2: Authentication Setup

**Duration:** 2-3 days
**Goal:** Implement authentication with Better Auth

### Tasks:

- [x] **2.1** Install Better Auth

  ```bash
  npm install better-auth
  ```

- [x] **2.2** Create Better Auth configuration

  - Create `lib/auth.ts`
  - Configure with Prisma adapter
  - Set up session management
  - Configure email/password provider

- [x] **2.3** Create auth API route

  - Create `app/api/auth/[...better-auth]/route.ts`
  - Export GET and POST handlers

- [x] **2.4** Create auth utilities

  - Create `lib/auth-client.ts` for client-side
  - Create helper functions for session checks

- [x] **2.5** Create middleware for protected routes

  - Create `middleware.ts` in root
  - Protect `/dashboard/*` routes
  - Redirect unauthenticated users to login

- [x] **2.6** Create login page UI

  - Create `app/(auth)/login/page.tsx`
  - Email and password form
  - Form validation with Zod
  - Error handling
  - Minimal design

- [x] **2.7** Create register page UI (admin only for Phase 1)

  - Create `app/(auth)/register/page.tsx`
  - Simple registration form
  - Note: Can be admin-only or disabled later

- [x] **2.8** Create auth layout

  - Create `app/(auth)/layout.tsx`
  - Centered form layout
  - Minimal branding

- [x] **2.9** Test authentication flow
  - Register new user
  - Login
  - Session persistence
  - Logout
  - Protected route access

### Deliverables:

✅ Better Auth configured and working
✅ Login/Register pages functional
✅ Session management working
✅ Protected routes middleware
✅ Can login and access dashboard

### Completion Notes:

**Date Completed:** January 12, 2026
**Files Created:**
- `lib/auth.ts` - Better Auth server configuration with Prisma adapter
- `lib/auth-client.ts` - Client-side auth utilities and hooks
- `app/api/auth/[...better-auth]/route.ts` - Auth API route handler
- `middleware.ts` - Route protection middleware
- `app/(auth)/login/page.tsx` - Login page with form validation
- `app/(auth)/register/page.tsx` - Registration page with password validation
- `app/(auth)/layout.tsx` - Authentication layout
- `app/(dashboard)/page.tsx` - Basic dashboard with stats cards
- `app/(dashboard)/layout.tsx` - Dashboard layout

**Environment Variables Added:**
- `BETTER_AUTH_SECRET` - Authentication secret key
- `BETTER_AUTH_URL` - Base URL for Better Auth
- `NEXT_PUBLIC_APP_URL` - Public app URL
- `NODE_ENV` - Development environment

**Components Installed:**
- shadcn/ui: button, input, label, card

**Build Status:** ✅ Successful (TypeScript compilation passed)

**Notes:**
- Used Suspense boundary for useSearchParams in login page to prevent build errors
- Created basic dashboard as landing page for authenticated users
- Middleware redirects: / → /login (unauthenticated) or / → /dashboard (authenticated)
- Protected routes: /dashboard, /projects, /clients, /team, /meetings
- Password requirements: 8+ characters, uppercase, lowercase, numbers
- Session expires in 24 hours with hourly updates

---

## Phase 3: Core UI Components & Layout

**Duration:** 2-3 days  
**Goal:** Build reusable UI components and main layout

### Tasks:

- [x] **3.1** Install additional shadcn/ui components

  ```bash
  npx shadcn-ui@latest add button input label select textarea
  npx shadcn-ui@latest add dialog dropdown-menu table badge
  npx shadcn-ui@latest add avatar card separator
  ```

- [x] **3.2** Customize shadcn/ui theme

  - Update `app/globals.css` with minimal color palette
  - Set up CSS variables for neutral colors
  - Configure font families

- [x] **3.3** Create dashboard layout

  - Create `app/(dashboard)/layout.tsx`
  - Responsive layout structure

- [x] **3.4** Create Sidebar component

  - Create `components/layout/sidebar.tsx`
  - Navigation items (Dashboard, Projects, Clients, Team, Meetings)
  - Active state styling
  - Minimal design with icons (Lucide)
  - User menu at bottom

- [x] **3.5** Create Header component

  - Create `components/layout/header.tsx`
  - Page title
  - User avatar and dropdown
  - Logout button

- [x] **3.6** Create UserMenu component

  - Dropdown with profile, settings, logout
  - Use shadcn/ui dropdown-menu

- [x] **3.7** Create LoadingSpinner component

  - Simple spinner for loading states

- [x] **3.8** Create EmptyState component

  - For empty tables/lists
  - Reusable component

- [x] **3.9** Create PageHeader component

  - Reusable page title + action button layout
  - Used across all pages

- [x] **3.10** Create basic Dashboard page
  - Create `app/(dashboard)/page.tsx`
  - Placeholder content
  - Test layout

### Deliverables:

✅ Reusable UI components library  
✅ Dashboard layout with sidebar and header  
✅ Navigation working  
✅ Minimal, clean design implemented

---

## Phase 4: Projects API & Backend Logic

**Duration:** 3-4 days  
**Goal:** Create all API routes for projects

### Tasks:

- [x] **4.1** Create validation schemas

  - Create `lib/validations/project.ts`
  - Zod schemas for create/update project
  - Date validation, budget validation

- [x] **4.2** Create project helper functions

  - Create `lib/services/project.service.ts`
  - Function to calculate duration
  - Function to format project data

- [x] **4.3** Create GET /api/projects route

  - Create `app/api/projects/route.ts`
  - Implement filtering (status, priority, search)
  - Implement sorting
  - Implement pagination
  - Include client and team data
  - Authentication check

- [x] **4.4** Create POST /api/projects route

  - Same file as above
  - Validate input with Zod
  - Create project in database
  - Log activity
  - Return created project

- [x] **4.5** Create GET /api/projects/[id] route

  - Create `app/api/projects/[id]/route.ts`
  - Fetch single project with all relations
  - 404 handling

- [x] **4.6** Create PUT /api/projects/[id] route

  - Update project
  - Validate input
  - Log activity
  - Return updated project

- [x] **4.7** Create DELETE /api/projects/[id] route

  - Delete project
  - Check permissions
  - Cascade delete assignments
  - Log activity

- [x] **4.8** Create project team assignment endpoints

  - Create `app/api/projects/[id]/team/route.ts`
  - POST to add team member
  - GET to list team
  - Create `app/api/projects/[id]/team/[memberId]/route.ts`
  - DELETE to remove team member
  - PUT to update assignment

- [x] **4.9** Create error handling utilities

  - Create `lib/api-error.ts`
  - Standard error responses
  - Error logging

- [x] **4.10** Test all endpoints with Postman/Thunder Client
  - Create sample requests
  - Verify responses
  - Test error cases

### Deliverables:

✅ Complete Projects API
✅ CRUD operations working
✅ Filtering, sorting, pagination
✅ Team assignment endpoints
✅ Error handling

### Completion Notes:

**Date Completed:** January 15, 2026
**Build Status:** ✅ Successful (TypeScript compilation passed)

**Files Created:**
- `lib/validations/project.ts` - Zod validation schemas for projects
- `lib/services/project.service.ts` - Project helper functions and utilities
- `lib/api-error.ts` - Standardized error handling utilities
- `app/api/projects/route.ts` - GET (list) and POST (create) endpoints
- `app/api/projects/[id]/route.ts` - GET (single), PUT (update), DELETE endpoints
- `app/api/projects/[id]/team/route.ts` - GET (list team) and POST (assign member) endpoints
- `app/api/projects/[id]/team/[memberId]/route.ts` - DELETE (remove) and PUT (update) endpoints

**API Endpoints Implemented:**
- `GET /api/projects` - List projects with filtering, sorting, pagination
- `POST /api/projects` - Create new project
- `GET /api/projects/[id]` - Get single project with all relations
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project
- `GET /api/projects/[id]/team` - List team assignments
- `POST /api/projects/[id]/team` - Assign team member
- `PUT /api/projects/[id]/team/[memberId]` - Update assignment
- `DELETE /api/projects/[id]/team/[memberId]` - Remove team member

**Features Implemented:**
- Authentication checks on all routes
- Zod validation for all inputs
- Activity logging for all CRUD operations
- Project code auto-generation
- Comprehensive error handling with standardized responses
- Filtering by status, priority, client, project type
- Search across project name, description, and client name
- Sorting by multiple fields with asc/desc order
- Pagination with configurable page size
- Relations included: Client info, Team assignments

**Notes:**
- Updated for Next.js 15+ async params pattern
- All TypeScript types properly defined
- Error responses follow consistent structure
- Activity logs track all changes for audit trail

---

## Phase 5: Projects UI (Grid & Forms)

**Duration:** 3-4 days  
**Goal:** Build projects grid view and forms

### Tasks:

- [x] **5.1** Create custom hooks for projects

  - Create `hooks/use-projects.ts`
  - Fetch projects with filters
  - Create project mutation
  - Update project mutation
  - Delete project mutation

- [x] **5.2** Create ProjectsGrid component

  - Create `components/projects/projects-grid.tsx`
  - Use TanStack Table
  - Display all project columns
  - Status badges
  - Priority indicators
  - Team avatars
  - Action buttons (edit, delete)

- [x] **5.3** Create ProjectFilters component

  - Create `components/projects/project-filters.tsx`
  - Status filter (multi-select)
  - Priority filter
  - Team member filter
  - Search input
  - Clear filters button

- [x] **5.4** Create ProjectForm component

  - Create `components/projects/project-form.tsx`
  - Form with React Hook Form + Zod
  - All fields from PRD
  - Client selector (dropdown)
  - Date pickers
  - Budget input
  - Validation
  - Loading states

- [x] **5.5** Create ProjectDialog component

  - Create `components/projects/project-dialog.tsx`
  - Modal wrapper for ProjectForm
  - Create/Edit modes
  - Use shadcn/ui dialog

- [x] **5.6** Create DeleteConfirmDialog component

  - Reusable confirmation dialog
  - Create `components/ui/delete-confirm-dialog.tsx`

- [x] **5.7** Create Projects page

  - Create `app/(dashboard)/projects/page.tsx`
  - Page header with "New Project" button
  - ProjectFilters
  - ProjectsGrid
  - Pagination
  - Loading states
  - Empty state

- [x] **5.8** Create Project Detail page

  - Create `app/(dashboard)/projects/[id]/page.tsx`
  - Fetch single project
  - Display all project info
  - Tabs: Overview, Client, Team, Meetings, Notes
  - Edit button
  - Back button

- [x] **5.9** Style with minimal design

  - Apply neutral colors
  - Clean spacing
  - No shadows
  - Subtle borders

- [x] **5.10** Test all functionality
  - Create new project
  - Edit project
  - Delete project
  - Filter projects
  - Search projects
  - View project details

### Deliverables:

✅ Projects grid with filters  
✅ Create/Edit project forms  
✅ Project detail page  
✅ All CRUD operations working in UI  
✅ Minimal, clean design

---

## Phase 6: Clients API & UI

**Duration:** 2-3 days  
**Goal:** Build client management system

### Tasks:

- [ ] **6.1** Create validation schemas

  - Create `lib/validations/client.ts`
  - Zod schemas for clients and contacts

- [ ] **6.2** Create Clients API routes

  - Create `app/api/clients/route.ts`
  - GET all clients (with search, pagination)
  - POST create client
  - Create `app/api/clients/[id]/route.ts`
  - GET single client
  - PUT update client
  - DELETE client

- [ ] **6.3** Create Client Contacts API

  - Create `app/api/clients/[id]/contacts/route.ts`
  - POST add contact
  - Create `app/api/clients/[id]/contacts/[contactId]/route.ts`
  - PUT update contact
  - DELETE contact

- [ ] **6.4** Create hooks for clients

  - Create `hooks/use-clients.ts`
  - Fetch, create, update, delete clients

- [ ] **6.5** Create ClientForm component

  - Create `components/clients/client-form.tsx`
  - All client fields
  - Contact person fields
  - Validation

- [ ] **6.6** Create ClientDialog component

  - Modal wrapper for ClientForm

- [ ] **6.7** Create ClientsGrid component

  - Create `components/clients/clients-grid.tsx`
  - Display clients in table
  - Show projects count
  - Actions

- [ ] **6.8** Create Clients page

  - Create `app/(dashboard)/clients/page.tsx`
  - Grid view
  - Search
  - "New Client" button

- [ ] **6.9** Create Client Detail page

  - Create `app/(dashboard)/clients/[id]/page.tsx`
  - Client information
  - Contact details
  - List of projects
  - Edit button

- [ ] **6.10** Test client management
  - Create client
  - Edit client
  - Delete client
  - View client details

### Deliverables:

✅ Clients API complete  
✅ Client management UI  
✅ Client-Project relationship working  
✅ CRUD operations functional

---

## Phase 7: Team Management API & UI

**Duration:** 2-3 days  
**Goal:** Build team member management

### Tasks:

- [ ] **7.1** Create validation schemas

  - Create `lib/validations/team.ts`
  - Zod schemas for team members

- [ ] **7.2** Create Team API routes

  - Create `app/api/team/route.ts`
  - GET all team members
  - POST create team member
  - Create `app/api/team/[id]/route.ts`
  - GET single member
  - PUT update member
  - DELETE member

- [ ] **7.3** Create hooks for team

  - Create `hooks/use-team.ts`

- [ ] **7.4** Create TeamMemberForm component

  - Create `components/team/team-member-form.tsx`
  - All fields from PRD
  - Skills multi-select
  - Specialization checkboxes

- [ ] **7.5** Create TeamMemberDialog component

  - Modal wrapper

- [ ] **7.6** Create TeamGrid component

  - Create `components/team/team-grid.tsx`
  - Display all team members
  - Status indicators
  - Skills display

- [ ] **7.7** Create Team page

  - Create `app/(dashboard)/team/page.tsx`
  - Grid view
  - Filters by department, status
  - "New Team Member" button

- [ ] **7.8** Create Team Member Detail page

  - Create `app/(dashboard)/team/[id]/page.tsx`
  - Member information
  - Assigned projects
  - Edit button

- [ ] **7.9** Update ProjectForm for team assignment

  - Add team member multi-select
  - Role and allocation fields
  - Save assignments

- [ ] **7.10** Test team management
  - Create team member
  - Edit team member
  - Assign to project
  - View member details

### Deliverables:

✅ Team management API  
✅ Team member CRUD UI  
✅ Team-Project assignment working  
✅ All functionality tested

---

## Phase 8: Meetings Management

**Duration:** 2-3 days  
**Goal:** Build meeting tracking system

### Tasks:

- [ ] **8.1** Create validation schemas

  - Create `lib/validations/meeting.ts`
  - Schemas for meetings and action items

- [ ] **8.2** Create Meetings API routes

  - Create `app/api/meetings/route.ts`
  - GET all meetings (with filters)
  - POST create meeting
  - Create `app/api/meetings/[id]/route.ts`
  - GET single meeting
  - PUT update meeting
  - DELETE meeting

- [ ] **8.3** Create hooks for meetings

  - Create `hooks/use-meetings.ts`

- [ ] **8.4** Create MeetingForm component

  - Create `components/meetings/meeting-form.tsx`
  - All fields from PRD
  - Attendee selection (internal)
  - External attendees (text)
  - Transcript textarea
  - Action items list
  - Validation

- [ ] **8.5** Create MeetingDialog component

  - Modal wrapper

- [ ] **8.6** Create MeetingsGrid component

  - Create `components/meetings/meetings-grid.tsx`
  - Display meetings
  - Filter by project, type, date

- [ ] **8.7** Create Meetings page

  - Create `app/(dashboard)/meetings/page.tsx`
  - All meetings view
  - Filters
  - "New Meeting" button

- [ ] **8.8** Add Meetings tab to Project Detail page

  - Show project meetings
  - Add meeting from project page
  - Display meeting list

- [ ] **8.9** Create Meeting Detail view

  - Show full meeting details
  - Display transcript
  - Show action items
  - Edit button

- [ ] **8.10** Test meetings functionality
  - Create meeting
  - Link to project
  - Add transcript
  - Add action items
  - Edit/delete

### Deliverables:

✅ Meetings API complete  
✅ Meeting management UI  
✅ Meetings linked to projects  
✅ Transcripts and action items

---

## Phase 9: Dashboard & Activity Tracking

**Duration:** 2-3 days  
**Goal:** Build dashboard with stats and activity log

### Tasks:

- [ ] **9.1** Create Dashboard API route

  - Create `app/api/dashboard/stats/route.ts`
  - Calculate total active projects
  - Calculate projects by status
  - Count team members
  - Upcoming deadlines

- [ ] **9.2** Create Activity API route

  - Create `app/api/dashboard/activity/route.ts`
  - GET recent activities
  - Pagination

- [ ] **9.3** Implement activity logging

  - Update all API routes to log activities
  - Log create, update, delete operations
  - Store in ActivityLog table

- [ ] **9.4** Create StatsCard component

  - Create `components/dashboard/stats-card.tsx`
  - Display metric with icon
  - Minimal design

- [ ] **9.5** Create ActivityFeed component

  - Create `components/dashboard/activity-feed.tsx`
  - List recent activities
  - Relative timestamps
  - Links to entities

- [ ] **9.6** Create UpcomingDeadlines component

  - Create `components/dashboard/upcoming-deadlines.tsx`
  - List projects ending soon
  - Links to projects

- [ ] **9.7** Update Dashboard page

  - Update `app/(dashboard)/page.tsx`
  - Stats cards row
  - Activity feed
  - Upcoming deadlines
  - Quick actions

- [ ] **9.8** Create hooks for dashboard

  - Create `hooks/use-dashboard.ts`
  - Fetch stats
  - Fetch activity

- [ ] **9.9** Add search functionality

  - Global search in header
  - Search across projects, clients

- [ ] **9.10** Test dashboard
  - Verify stats are accurate
  - Check activity logging
  - Test search

### Deliverables:

✅ Dashboard with statistics  
✅ Activity feed working  
✅ Activity logging on all operations  
✅ Global search functional

---

## Phase 10: Polish, Testing & Documentation

**Duration:** 3-4 days  
**Goal:** Refinement and preparation for production

### Tasks:

- [ ] **10.1** UI/UX refinement

  - Review all pages for consistency
  - Ensure minimal design throughout
  - Check spacing and alignment
  - Verify color usage matches design system
  - Ensure all interactive elements have hover states

- [ ] **10.2** Responsive design testing

  - Test on mobile (< 640px)
  - Test on tablet (640-1024px)
  - Test on desktop (> 1024px)
  - Fix any layout issues
  - Ensure tables work on mobile (card view)

- [ ] **10.3** Loading states

  - Add skeletons/spinners to all data fetching
  - Loading states for forms
  - Optimistic updates where appropriate

- [ ] **10.4** Error handling

  - Proper error messages on forms
  - API error handling and display
  - 404 pages
  - Error boundaries
  - Toast notifications for actions

- [ ] **10.5** Form validation improvements

  - Clear validation messages
  - Inline validation
  - Field-level errors
  - Success messages

- [ ] **10.6** Accessibility improvements

  - Keyboard navigation test
  - Focus indicators
  - ARIA labels
  - Screen reader testing
  - Color contrast check

- [ ] **10.7** Performance optimization

  - Implement React.memo where needed
  - Lazy load heavy components
  - Optimize images (if any)
  - Check bundle size
  - Database query optimization

- [ ] **10.8** Security review

  - Verify all API routes check authentication
  - Check authorization (role-based access)
  - Input sanitization
  - SQL injection prevention (Prisma handles this)
  - XSS prevention

- [ ] **10.9** Manual testing checklist

  - [ ] User registration and login
  - [ ] Create/edit/delete projects
  - [ ] Filter and search projects
  - [ ] Pagination works
  - [ ] Create/edit/delete clients
  - [ ] Create/edit/delete team members
  - [ ] Assign team to projects
  - [ ] Create/edit/delete meetings
  - [ ] Dashboard stats are accurate
  - [ ] Activity log captures all actions
  - [ ] Mobile responsive on all pages
  - [ ] All forms validate correctly
  - [ ] Error messages display properly
  - [ ] Loading states show correctly
  - [ ] User can logout

- [ ] **10.10** Code cleanup

  - Remove console.logs
  - Remove unused imports
  - Remove commented code
  - Ensure consistent code formatting
  - Add code comments where needed

- [ ] **10.11** Documentation

  - Create README.md with setup instructions
  - Document environment variables
  - Create USER_GUIDE.md with screenshots
  - Document API endpoints
  - Add inline code comments

- [ ] **10.12** Prepare for deployment
  - Create production environment variables template
  - Test production build locally
  - Verify all features work in production build
  - Create deployment checklist

### Deliverables:

✅ Polished, production-ready application  
✅ All features tested and working  
✅ Responsive on all devices  
✅ Documentation complete  
✅ Ready for deployment

---

## Quick Reference: Development Order

**Week 1:**

- Phase 0: Project Setup (2-3 days)
- Phase 1: Database Schema (2-3 days)

**Week 2:**

- Phase 2: Authentication (2-3 days)
- Phase 3: Core UI Components (2-3 days)

**Week 3-4:**

- Phase 4: Projects API (3-4 days)
- Phase 5: Projects UI (3-4 days)

**Week 5:**

- Phase 6: Clients (2-3 days)
- Phase 7: Team Management (2-3 days)

**Week 6:**

- Phase 8: Meetings (2-3 days)
- Phase 9: Dashboard (2-3 days)

**Week 7-8:**

- Phase 10: Polish & Testing (3-4 days)
- Buffer time for unexpected issues

---

## Tips for Success

### Daily Workflow:

1. Start each day by reviewing tasks for current phase
2. Commit code frequently with clear messages
3. Test features as you build them
4. Document any deviations from plan
5. Update task checkboxes as you complete them

### Best Practices:

- **Don't skip ahead**: Each phase builds on the previous
- **Test early and often**: Don't wait until the end
- **Keep it simple**: Resist adding features not in Phase 1
- **Ask for help**: Review PRD if unclear on requirements
- **Take breaks**: Quality over speed

### Git Workflow:

```bash
# Start a new phase
git checkout develop
git pull
git checkout -b feature/phase-X-description

# Work on tasks, commit frequently
git add .
git commit -m "feat(phase-X): descriptive message"

# When phase is complete
git push origin feature/phase-X-description
# Create pull request to develop
# After review and merge, start next phase
```

### Common Commands:

```bash
# Development
npm run dev              # Start dev server
npx prisma studio        # Open database GUI
npx prisma migrate dev   # Create migration
npx prisma generate      # Generate Prisma Client

# Prisma
npx prisma db push       # Quick schema sync (dev only)
npx prisma db seed       # Run seed script
npx prisma migrate reset # Reset database (caution!)

# Build
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run linter
```

---

## Checkpoint Questions

After each phase, ask yourself:

- ✅ Did I complete all tasks in the phase?
- ✅ Are there any bugs or issues?
- ✅ Does the code follow the minimal design system?
- ✅ Is the code properly formatted and documented?
- ✅ Did I test the functionality?
- ✅ Can I move to the next phase confidently?

---

## Notes Section

Use this space to track issues, learnings, or deviations:

```
Example:
- Phase 3: Changed sidebar width from 240px to 260px for better readability
- Phase 5: Added additional validation for budget field per user feedback
- Phase 7: Skills component needed custom multi-select, built custom solution
```

---

**Good luck with development! 🚀**

_Remember: Quality over speed. A well-built Phase 1 makes future phases much easier._
