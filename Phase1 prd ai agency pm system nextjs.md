# Product Requirements Document (PRD)
## AI Agency Project Management System - Phase 1 (Foundation)

---

## Document Information

**Product Name:** AI Agency Project Management System  
**Version:** Phase 1 - Foundation & Manual Operations  
**Document Version:** 1.0  
**Date:** January 11, 2026  
**Status:** Ready for Development  

---

## 1. Executive Summary

### 1.1 Overview
Phase 1 establishes the foundational infrastructure for the AI Agency Project Management System. This phase focuses on creating a functional grid-based interface for viewing and manually managing projects, while building a complete database schema to support all future phases.

### 1.2 Phase 1 Objectives
- Build complete database schema for entire system (future-proof)
- Create intuitive grid/table view for all projects
- Implement manual CRUD operations (Create, Read, Update, Delete)
- Establish basic authentication and user management
- Design responsive and clean UI foundation
- Enable manual data entry for all core entities

### 1.3 What's In Phase 1
✅ Project grid view with all essential data fields  
✅ Manual project creation and editing  
✅ Client information management (manual entry)  
✅ Team member management (manual entry)  
✅ Meeting records (manual entry)  
✅ Basic search and filtering  
✅ Complete database schema  
✅ User authentication  

### 1.4 What's NOT In Phase 1
❌ Automated workflows and notifications  
❌ Third-party integrations  
❌ Advanced analytics and reporting  
❌ File upload/document management  
❌ Time tracking  
❌ Calendar integration  
❌ Real-time collaboration features  
❌ AI-powered features  

---

## 2. User Stories

### 2.1 As a Project Manager
- I want to see all projects in a grid view so I can quickly assess status
- I want to manually add new projects so I can track them in the system
- I want to edit project details so I can keep information up-to-date
- I want to filter projects by status so I can focus on active work
- I want to search for projects by name so I can find them quickly
- I want to add client information so I have contact details accessible
- I want to assign team members to projects so everyone knows their responsibilities

### 2.2 As a Team Member
- I want to view projects I'm assigned to so I know what I'm working on
- I want to see project details so I understand the scope and timeline
- I want to see client contact information so I can communicate when needed
- I want to update project status so the team stays informed

### 2.3 As an Admin
- I want to manage user accounts so I can control system access
- I want to add/edit team members so the system reflects our current team
- I want to manage all projects regardless of assignment
- I want to delete outdated projects to keep the system clean

---

## 3. Functional Requirements

### 3.1 Authentication & User Management

#### 3.1.1 User Registration & Login
**Requirements:**
- Email and password-based authentication
- Secure password requirements (min 8 characters, mixed case, numbers)
- Login page with email and password fields
- "Remember me" option
- Password hashing (bcrypt or similar)
- Session management with 24-hour expiration
- Logout functionality

#### 3.1.2 User Roles
**Two roles for Phase 1:**
1. **Admin**
   - Full access to all features
   - Can create/edit/delete all projects
   - Can manage users and team members
   - Can assign any team member to projects

2. **Team Member**
   - View all projects
   - Edit projects they're assigned to
   - Update task status
   - Cannot delete projects
   - Cannot manage users

#### 3.1.3 User Profile
- View/edit own profile information:
  - Name
  - Email
  - Phone
  - Role
  - Skills
  - Avatar (placeholder/initials for Phase 1)

### 3.2 Projects Grid View

#### 3.2.1 Grid Display
**Layout:**
- Responsive table/grid layout
- Columns (all resizable):
  1. Project Name
  2. Status (with color badge)
  3. Client Name
  4. Start Date
  5. End Date
  6. Duration (auto-calculated)
  7. Assigned Team (avatars/initials)
  8. Priority
  9. Progress %
  10. Actions (Edit, Delete icons)

**Visual Design:**
- Clean, modern table with alternating row colors
- Hover states for rows
- Status badges with colors:
  - Planning: Blue
  - Active: Green
  - On Hold: Yellow
  - Completed: Gray
  - Archived: Dark Gray
- Priority indicators:
  - High: Red flag
  - Medium: Orange flag
  - Low: Green flag
- Team member avatars (2-letter initials in colored circles)

#### 3.2.2 Grid Features
**Sorting:**
- Click column headers to sort (ascending/descending)
- Multi-column sorting capability
- Default sort: Most recently updated first

**Filtering:**
- Filter by status (checkboxes)
- Filter by priority (checkboxes)
- Filter by team member (dropdown)
- Date range filter (start/end dates)
- "Clear all filters" button

**Search:**
- Global search bar at top of grid
- Search across:
  - Project names
  - Client names
  - Project descriptions
- Real-time search (updates as you type)
- Case-insensitive search

**Pagination:**
- Show 25 projects per page (default)
- Options: 10, 25, 50, 100 per page
- Page navigation (Previous, 1, 2, 3... Next)
- "Showing X-Y of Z projects" indicator

**View Options:**
- Toggle between grid/table view and card view
- Column visibility toggle (show/hide columns)
- Density options: Compact, Standard, Comfortable

### 3.3 Project Management (Manual Operations)

#### 3.3.1 Create New Project
**Modal/Form with sections:**

**Section 1: Basic Information**
- Project Name* (required)
- Project Type* (dropdown):
  - AI Agent Development
  - Automation Solution
  - SaaS Product
  - Consulting
  - Other
- Status* (dropdown):
  - Planning
  - Active
  - On Hold
  - Completed
  - Archived
- Priority* (dropdown): High, Medium, Low
- Description (textarea, 500 chars max)
- Internal Notes (textarea, private to team)

**Section 2: Timeline**
- Start Date* (date picker)
- End Date* (date picker)
- Duration (auto-calculated, read-only)
- Estimated Hours (number input)

**Section 3: Financial**
- Budget Amount (currency input)
- Currency (dropdown: USD, EUR, GBP, etc.)
- Billing Type (dropdown):
  - Fixed Price
  - Time & Materials
  - Retainer
  - Pro Bono

**Section 4: Progress**
- Progress Percentage (0-100 slider)
- Current Phase/Milestone (text input)

**Validation:**
- All required fields must be filled
- End date must be after start date
- Budget must be positive number
- Progress must be 0-100

**Actions:**
- "Create Project" button (primary)
- "Cancel" button (secondary)
- Success message on creation
- Auto-redirect to project detail view

#### 3.3.2 Edit Project
**Same form as Create, pre-populated with existing data**
- All fields editable
- "Save Changes" button
- "Cancel" button (discards changes)
- Confirmation message on save
- Last updated timestamp shown

#### 3.3.3 Delete Project
- Delete icon/button on each project row
- Confirmation modal: "Are you sure you want to delete [Project Name]? This action cannot be undone."
- "Delete" (danger button) and "Cancel" buttons
- Success message on deletion
- Project removed from grid immediately

#### 3.3.4 View Project Details
**Detailed view page with tabs:**

**Tab 1: Overview**
- All project information displayed
- Edit button (opens edit modal)
- Status history timeline (placeholder for Phase 1)

**Tab 2: Client**
- Client information (see section 3.4)
- Meeting records (see section 3.6)

**Tab 3: Team**
- Assigned team members list
- Assignment details per member

**Tab 4: Notes**
- Internal notes section
- Manually add/edit notes with timestamps

### 3.4 Client Management

#### 3.4.1 Add/Edit Client (Manual Entry)
**Client Form Fields:**
- Client Type (dropdown):
  - Company
  - Individual
  - Non-profit
  - Government
- Company/Individual Name*
- Industry (dropdown with common industries)
- Company Size (dropdown):
  - 1-10
  - 11-50
  - 51-200
  - 201-500
  - 501-1000
  - 1000+

**Primary Contact:**
- Contact Name*
- Job Title
- Email Address*
- Phone Number
- Mobile Number
- LinkedIn URL

**Additional Information:**
- Company Website
- Billing Address (text area)
- Time Zone (dropdown)
- Preferred Communication (checkboxes):
  - Email
  - Phone
  - Slack
  - Teams
  - WhatsApp
- Tags/Labels (comma-separated)
- Notes (textarea)

**From Project View:**
- Select existing client from dropdown OR
- "Add New Client" button (opens client form modal)

#### 3.4.2 Clients List View
- Table view of all clients
- Columns:
  - Company Name
  - Primary Contact
  - Email
  - Phone
  - Industry
  - Active Projects Count
  - Actions (Edit, Delete)
- Search and filter by name, industry
- Click to view client detail page

#### 3.4.3 Client Detail Page
- All client information displayed
- List of all projects for this client
- Edit button
- Delete button (with warning if active projects exist)

### 3.5 Team Management

#### 3.5.1 Add/Edit Team Member (Manual Entry)
**Team Member Form:**
- Full Name*
- Email Address* (unique)
- Phone Number
- Role/Title*
- Department (dropdown):
  - Development
  - Design
  - QA/Testing
  - DevOps
  - Management
  - Consulting
  - Other
- Specialization (checkboxes):
  - Frontend Development
  - Backend Development
  - Full Stack
  - AI/ML Engineering
  - UI Design
  - UX Design
  - Project Management
  - DevOps
  - QA Automation
  - Manual Testing
- Skills (multi-select tags):
  - React
  - Python
  - Node.js
  - AWS
  - Docker
  - etc. (predefined list)
- Hourly Rate (optional, currency input)
- Employment Type:
  - Full-time
  - Part-time
  - Contractor
  - Intern
- Start Date
- Status:
  - Active
  - On Leave
  - Inactive
- Avatar Color (for initials display)

#### 3.5.2 Team Members List View
- Table view of all team members
- Columns:
  - Name
  - Role
  - Department
  - Skills (top 3)
  - Active Projects Count
  - Status
  - Actions (Edit, View)
- Filter by department, status, skills
- Search by name

#### 3.5.3 Team Member Detail Page
- All member information
- List of assigned projects
- Edit button
- Cannot delete if assigned to active projects

#### 3.5.4 Assign Team to Project
**From Project Edit/Create:**
- Multi-select dropdown of team members
- For each selected member:
  - Role in Project (dropdown):
    - Project Lead
    - Developer
    - Designer
    - QA Engineer
    - DevOps
    - Consultant
  - Allocation % (0-100 slider)
  - Notes (optional)

**Display on Project:**
- Table of assigned team
- Columns: Name, Role, Allocation %, Actions (Remove)
- Add team member button

### 3.6 Meeting Management

#### 3.6.1 Add Meeting (Manual Entry)
**Meeting Form (within Project detail page):**
- Meeting Date & Time* (datetime picker)
- Meeting Type* (dropdown):
  - Kickoff
  - Discovery
  - Planning
  - Progress Review
  - Demo
  - Retrospective
  - Client Call
  - Internal Sync
  - Other
- Duration (minutes, number input)
- Location/Platform (text input, e.g., "Zoom", "Office", "Google Meet")

**Attendees:**
- Internal (multi-select from team members)
- External (manual text entry for client attendees)

**Meeting Content:**
- Agenda (textarea)
- Notes (textarea, rich text)
- Transcript (textarea, for manual paste)
- Action Items (list, manually add items):
  - Item description
  - Assigned to (optional)
  - Due date (optional)
- Recording URL (text input for external link)

**Next Meeting:**
- Scheduled Date & Time (datetime picker)
- Notes (text input)

#### 3.6.2 Meeting List (within Project)
- Table showing all meetings for project
- Columns:
  - Date & Time
  - Type
  - Attendees (count)
  - Has Transcript (Y/N)
  - Actions (View, Edit, Delete)
- Sort by date (most recent first)
- Quick view of first meeting highlighted

#### 3.6.3 Meeting Detail View
- All meeting information displayed
- Searchable transcript text
- Downloadable transcript (text file)
- Edit/Delete options
- Link to parent project

### 3.7 Dashboard (Home Page)

#### 3.7.1 Quick Stats Cards
**4 KPI Cards (top of page):**
1. Total Active Projects (count with trend icon)
2. Projects in Planning (count)
3. Overdue Projects (count, red if >0)
4. Team Members Active (count)

#### 3.7.2 Recent Activity Feed
- Last 10 activities shown:
  - "Project X created by User Y"
  - "Project X status changed to Active"
  - "Team member added to Project X"
  - "Client ABC updated"
- Timestamp for each activity
- Link to relevant project/entity

#### 3.7.3 Quick Actions
- "Create New Project" button (prominent)
- "Add Client" button
- "Add Team Member" button

#### 3.7.4 Upcoming Items
- Next 5 meetings (date, time, project)
- Projects ending in next 7 days
- Link to full calendar/timeline (placeholder)

### 3.8 Navigation & Layout

#### 3.8.1 Main Navigation (Sidebar or Top Nav)
**Menu Items:**
- 🏠 Dashboard
- 📊 Projects
- 👥 Clients
- 👨‍💼 Team
- 📅 Meetings (all meetings list)
- ⚙️ Settings
- 👤 Profile
- 🚪 Logout

#### 3.8.2 Header Bar
- Logo/App Name
- Current page title
- Search bar (global)
- Notifications icon (placeholder for future)
- User avatar/name with dropdown:
  - My Profile
  - Settings
  - Logout

#### 3.8.3 Responsive Design
- Desktop: Full sidebar + main content
- Tablet: Collapsible sidebar
- Mobile: Hamburger menu + full-width content
- All tables convert to card view on mobile

---

## 4. Database Schema

### 4.1 Complete Schema (Phase 1 Foundation)

**Note:** This schema supports all future phases. Phase 1 will only actively use core tables, but all tables are created from the start.

#### 4.1.1 Users Table
```sql
users
├── user_id (UUID, PK)
├── email (VARCHAR(255), UNIQUE, NOT NULL)
├── password_hash (VARCHAR(255), NOT NULL)
├── full_name (VARCHAR(255), NOT NULL)
├── role (ENUM: 'admin', 'team_member', 'client', NOT NULL)
├── phone (VARCHAR(50))
├── is_active (BOOLEAN, DEFAULT TRUE)
├── last_login (TIMESTAMP)
├── created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
├── updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE)
└── created_by (UUID, FK to users.user_id)
```

#### 4.1.2 Team Members Table
```sql
team_members
├── member_id (UUID, PK)
├── user_id (UUID, FK to users.user_id, NULLABLE)
├── full_name (VARCHAR(255), NOT NULL)
├── email (VARCHAR(255), UNIQUE, NOT NULL)
├── phone (VARCHAR(50))
├── role_title (VARCHAR(100), NOT NULL)
├── department (ENUM: 'development', 'design', 'qa', 'devops', 'management', 'consulting', 'other')
├── specialization (JSON) -- Array of specializations
├── skills (JSON) -- Array of skills
├── hourly_rate (DECIMAL(10,2))
├── currency (VARCHAR(3), DEFAULT 'USD')
├── employment_type (ENUM: 'full_time', 'part_time', 'contractor', 'intern')
├── start_date (DATE)
├── status (ENUM: 'active', 'on_leave', 'inactive', DEFAULT 'active')
├── avatar_color (VARCHAR(7)) -- Hex color code
├── bio (TEXT)
├── linkedin_url (VARCHAR(500))
├── github_url (VARCHAR(500))
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── created_by (UUID, FK to users.user_id)
```

#### 4.1.3 Clients Table
```sql
clients
├── client_id (UUID, PK)
├── client_type (ENUM: 'company', 'individual', 'nonprofit', 'government', NOT NULL)
├── company_name (VARCHAR(255), NOT NULL)
├── industry (VARCHAR(100))
├── company_size (VARCHAR(20))
├── website (VARCHAR(500))
├── billing_address (TEXT)
├── time_zone (VARCHAR(100))
├── preferred_communication (JSON) -- Array of communication methods
├── tags (JSON) -- Array of tags
├── notes (TEXT)
├── is_active (BOOLEAN, DEFAULT TRUE)
├── client_since (DATE)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── created_by (UUID, FK to users.user_id)
```

#### 4.1.4 Client Contacts Table
```sql
client_contacts
├── contact_id (UUID, PK)
├── client_id (UUID, FK to clients.client_id, NOT NULL)
├── is_primary (BOOLEAN, DEFAULT FALSE)
├── contact_name (VARCHAR(255), NOT NULL)
├── job_title (VARCHAR(100))
├── email (VARCHAR(255), NOT NULL)
├── phone (VARCHAR(50))
├── mobile (VARCHAR(50))
├── linkedin_url (VARCHAR(500))
├── notes (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

#### 4.1.5 Projects Table
```sql
projects
├── project_id (UUID, PK)
├── project_name (VARCHAR(255), NOT NULL)
├── project_code (VARCHAR(50), UNIQUE) -- Auto-generated or manual
├── client_id (UUID, FK to clients.client_id, NOT NULL)
├── project_type (ENUM: 'ai_agent', 'automation', 'saas', 'consulting', 'other', NOT NULL)
├── description (TEXT)
├── internal_notes (TEXT)
├── status (ENUM: 'planning', 'active', 'on_hold', 'completed', 'archived', NOT NULL)
├── priority (ENUM: 'high', 'medium', 'low', DEFAULT 'medium')
├── start_date (DATE, NOT NULL)
├── end_date (DATE, NOT NULL)
├── actual_start_date (DATE)
├── actual_end_date (DATE)
├── estimated_hours (DECIMAL(10,2))
├── budget_amount (DECIMAL(12,2))
├── currency (VARCHAR(3), DEFAULT 'USD')
├── billing_type (ENUM: 'fixed_price', 'time_materials', 'retainer', 'pro_bono')
├── progress_percentage (INT, DEFAULT 0, CHECK (progress_percentage >= 0 AND progress_percentage <= 100))
├── current_phase (VARCHAR(255))
├── health_status (ENUM: 'on_track', 'at_risk', 'off_track') -- Future use
├── is_archived (BOOLEAN, DEFAULT FALSE)
├── archived_at (TIMESTAMP)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
├── created_by (UUID, FK to users.user_id)
└── last_modified_by (UUID, FK to users.user_id)
```

#### 4.1.6 Project Assignments Table
```sql
project_assignments
├── assignment_id (UUID, PK)
├── project_id (UUID, FK to projects.project_id, NOT NULL)
├── member_id (UUID, FK to team_members.member_id, NOT NULL)
├── role_in_project (VARCHAR(100), NOT NULL) -- e.g., "Project Lead", "Frontend Developer"
├── allocation_percentage (INT, DEFAULT 100, CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100))
├── start_date (DATE)
├── end_date (DATE)
├── is_active (BOOLEAN, DEFAULT TRUE)
├── notes (TEXT)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── UNIQUE (project_id, member_id, role_in_project)
```

#### 4.1.7 Meetings Table
```sql
meetings
├── meeting_id (UUID, PK)
├── project_id (UUID, FK to projects.project_id, NOT NULL)
├── meeting_date (TIMESTAMP, NOT NULL)
├── duration_minutes (INT)
├── meeting_type (ENUM: 'kickoff', 'discovery', 'planning', 'review', 'demo', 'retrospective', 'client_call', 'internal_sync', 'other', NOT NULL)
├── location_platform (VARCHAR(255))
├── agenda (TEXT)
├── notes (TEXT)
├── transcript (TEXT)
├── recording_url (VARCHAR(500))
├── next_meeting_date (TIMESTAMP)
├── next_meeting_notes (TEXT)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── created_by (UUID, FK to users.user_id)
```

#### 4.1.8 Meeting Attendees Table
```sql
meeting_attendees
├── attendee_id (UUID, PK)
├── meeting_id (UUID, FK to meetings.meeting_id, NOT NULL)
├── member_id (UUID, FK to team_members.member_id, NULLABLE) -- Internal attendee
├── external_name (VARCHAR(255)) -- External attendee
├── external_email (VARCHAR(255))
├── attendee_type (ENUM: 'internal', 'external', NOT NULL)
├── attended (BOOLEAN, DEFAULT TRUE)
└── created_at (TIMESTAMP)
```

#### 4.1.9 Action Items Table
```sql
action_items
├── action_id (UUID, PK)
├── meeting_id (UUID, FK to meetings.meeting_id, NOT NULL)
├── description (TEXT, NOT NULL)
├── assigned_to (UUID, FK to team_members.member_id, NULLABLE)
├── due_date (DATE)
├── status (ENUM: 'open', 'in_progress', 'completed', 'cancelled', DEFAULT 'open')
├── completed_at (TIMESTAMP)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

#### 4.1.10 Milestones Table (Future Use)
```sql
milestones
├── milestone_id (UUID, PK)
├── project_id (UUID, FK to projects.project_id, NOT NULL)
├── name (VARCHAR(255), NOT NULL)
├── description (TEXT)
├── target_date (DATE, NOT NULL)
├── actual_date (DATE)
├── status (ENUM: 'pending', 'in_progress', 'completed', 'delayed', DEFAULT 'pending')
├── order_index (INT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

#### 4.1.11 Tasks Table (Future Use)
```sql
tasks
├── task_id (UUID, PK)
├── project_id (UUID, FK to projects.project_id, NOT NULL)
├── milestone_id (UUID, FK to milestones.milestone_id, NULLABLE)
├── assigned_to (UUID, FK to team_members.member_id, NULLABLE)
├── title (VARCHAR(255), NOT NULL)
├── description (TEXT)
├── status (ENUM: 'backlog', 'todo', 'in_progress', 'review', 'done', DEFAULT 'backlog')
├── priority (ENUM: 'high', 'medium', 'low', DEFAULT 'medium')
├── estimated_hours (DECIMAL(10,2))
├── actual_hours (DECIMAL(10,2))
├── due_date (DATE)
├── completed_at (TIMESTAMP)
├── parent_task_id (UUID, FK to tasks.task_id, NULLABLE) -- For subtasks
├── order_index (INT)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── created_by (UUID, FK to users.user_id)
```

#### 4.1.12 Documents Table (Future Use)
```sql
documents
├── document_id (UUID, PK)
├── project_id (UUID, FK to projects.project_id, NOT NULL)
├── file_name (VARCHAR(255), NOT NULL)
├── file_path (VARCHAR(500), NOT NULL)
├── file_type (VARCHAR(50))
├── file_size (BIGINT) -- in bytes
├── category (VARCHAR(100))
├── description (TEXT)
├── version (VARCHAR(20))
├── uploaded_by (UUID, FK to users.user_id, NOT NULL)
├── uploaded_at (TIMESTAMP)
└── is_deleted (BOOLEAN, DEFAULT FALSE)
```

#### 4.1.13 Time Entries Table (Future Use)
```sql
time_entries
├── entry_id (UUID, PK)
├── project_id (UUID, FK to projects.project_id, NOT NULL)
├── task_id (UUID, FK to tasks.task_id, NULLABLE)
├── member_id (UUID, FK to team_members.member_id, NOT NULL)
├── work_date (DATE, NOT NULL)
├── hours (DECIMAL(10,2), NOT NULL)
├── description (TEXT)
├── is_billable (BOOLEAN, DEFAULT TRUE)
├── hourly_rate (DECIMAL(10,2))
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

#### 4.1.14 Project Expenses Table (Future Use)
```sql
project_expenses
├── expense_id (UUID, PK)
├── project_id (UUID, FK to projects.project_id, NOT NULL)
├── category (VARCHAR(100))
├── description (TEXT, NOT NULL)
├── amount (DECIMAL(12,2), NOT NULL)
├── currency (VARCHAR(3), DEFAULT 'USD')
├── expense_date (DATE, NOT NULL)
├── receipt_url (VARCHAR(500))
├── is_billable (BOOLEAN, DEFAULT TRUE)
├── submitted_by (UUID, FK to team_members.member_id, NOT NULL)
├── approved_by (UUID, FK to users.user_id, NULLABLE)
├── status (ENUM: 'pending', 'approved', 'rejected', DEFAULT 'pending')
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

#### 4.1.15 Activity Log Table
```sql
activity_log
├── log_id (UUID, PK)
├── user_id (UUID, FK to users.user_id, NOT NULL)
├── entity_type (VARCHAR(50), NOT NULL) -- e.g., 'project', 'client', 'meeting'
├── entity_id (UUID, NOT NULL)
├── action (VARCHAR(50), NOT NULL) -- e.g., 'created', 'updated', 'deleted'
├── changes (JSON) -- What changed
├── ip_address (VARCHAR(45))
├── user_agent (TEXT)
├── created_at (TIMESTAMP)
└── INDEX (entity_type, entity_id), INDEX (user_id), INDEX (created_at)
```

#### 4.1.16 System Settings Table (Future Use)
```sql
system_settings
├── setting_id (UUID, PK)
├── setting_key (VARCHAR(100), UNIQUE, NOT NULL)
├── setting_value (TEXT)
├── setting_type (VARCHAR(50)) -- 'string', 'number', 'boolean', 'json'
├── description (TEXT)
├── is_public (BOOLEAN, DEFAULT FALSE)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### 4.2 Database Indexes

**Essential Indexes for Phase 1:**
```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Team Members
CREATE INDEX idx_team_members_email ON team_members(email);
CREATE INDEX idx_team_members_status ON team_members(status);

-- Clients
CREATE INDEX idx_clients_company_name ON clients(company_name);
CREATE INDEX idx_clients_is_active ON clients(is_active);

-- Projects
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_start_date ON projects(start_date);
CREATE INDEX idx_projects_end_date ON projects(end_date);
CREATE INDEX idx_projects_priority ON projects(priority);

-- Project Assignments
CREATE INDEX idx_assignments_project_id ON project_assignments(project_id);
CREATE INDEX idx_assignments_member_id ON project_assignments(member_id);

-- Meetings
CREATE INDEX idx_meetings_project_id ON meetings(project_id);
CREATE INDEX idx_meetings_date ON meetings(meeting_date);

-- Activity Log
CREATE INDEX idx_activity_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_user ON activity_log(user_id);
CREATE INDEX idx_activity_created ON activity_log(created_at);
```

### 4.3 Database Constraints & Triggers

**Constraints:**
- Foreign key constraints with CASCADE on delete for dependent records
- Check constraints for percentage fields (0-100)
- Unique constraints on email addresses
- NOT NULL constraints on essential fields

**Triggers (to implement):**
- Auto-update `updated_at` timestamp on record modification
- Log activity on INSERT, UPDATE, DELETE operations
- Calculate project duration on date changes
- Validate date ranges (end_date > start_date)

---

## 5. Technical Specifications

### 5.1 Technology Stack

#### 5.1.1 Full-Stack Framework
**Next.js 14+ (App Router)**
- **Framework:** Next.js 14+ with TypeScript (handles both frontend and backend)
- **Rendering:** Server Components + Client Components
- **Routing:** App Router (file-based routing)
- **API Routes:** Route Handlers in `/app/api`
- **Server Actions:** For form submissions and mutations
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (modern, minimal, accessible)
- **Forms:** React Hook Form + Zod (validation)
- **Date Handling:** date-fns
- **Tables/Grid:** TanStack Table (React Table v8)

#### 5.1.2 Database & ORM
- **Database:** Neon DB (Serverless PostgreSQL)
  - Serverless, auto-scaling PostgreSQL
  - Built-in connection pooling
  - Branching for development/staging
  - Generous free tier
- **ORM:** Prisma
  - Type-safe database client
  - Automatic migrations
  - Prisma Studio for data management
  - Excellent TypeScript integration

#### 5.1.3 Authentication
- **Better Auth**
  - Modern, type-safe authentication for Next.js
  - Built-in session management
  - Social providers support (future)
  - Email/password authentication
  - Role-based access control
  - Middleware for protected routes

#### 5.1.4 Development Tools
- **Version Control:** Git + GitHub/GitLab
- **Code Quality:** 
  - ESLint (Next.js config)
  - Prettier
  - TypeScript strict mode
- **Database Management:** Prisma Studio
- **Environment Management:** dotenv (built into Next.js)

### 5.2 Project Structure

```
project-root/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Dashboard
│   │   ├── projects/
│   │   │   ├── page.tsx                # Projects grid
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx            # Project detail
│   │   │   └── new/
│   │   │       └── page.tsx            # Create project
│   │   ├── clients/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── new/
│   │   │       └── page.tsx
│   │   ├── team/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── meetings/
│   │       └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...better-auth]/
│   │   │       └── route.ts
│   │   ├── projects/
│   │   │   ├── route.ts                # GET, POST /api/projects
│   │   │   └── [id]/
│   │   │       └── route.ts            # GET, PUT, DELETE /api/projects/[id]
│   │   ├── clients/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── team/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   └── meetings/
│   │       ├── route.ts
│   │       └── [id]/
│   │           └── route.ts
│   ├── layout.tsx
│   ├── globals.css
│   └── not-found.tsx
├── components/
│   ├── ui/                             # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   ├── badge.tsx
│   │   └── ...
│   ├── projects/
│   │   ├── project-grid.tsx
│   │   ├── project-form.tsx
│   │   ├── project-filters.tsx
│   │   └── ...
│   ├── clients/
│   │   └── ...
│   ├── team/
│   │   └── ...
│   ├── meetings/
│   │   └── ...
│   └── layout/
│       ├── navbar.tsx
│       ├── sidebar.tsx
│       └── user-menu.tsx
├── lib/
│   ├── auth.ts                         # Better Auth config
│   ├── db.ts                           # Prisma client
│   ├── utils.ts                        # Utility functions
│   └── validations/
│       ├── project.ts
│       ├── client.ts
│       └── ...
├── hooks/
│   ├── use-projects.ts
│   ├── use-clients.ts
│   └── ...
├── types/
│   ├── project.ts
│   ├── client.ts
│   └── index.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/
│   └── ...
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 5.3 API Routes (Next.js Route Handlers)

#### 5.3.1 Authentication
```
POST   /api/auth/sign-up           - Register new user
POST   /api/auth/sign-in           - Login
POST   /api/auth/sign-out          - Logout
GET    /api/auth/session           - Get current session
```

#### 5.3.2 Projects
```
GET    /api/projects               - Get all projects (with filters, search, pagination)
POST   /api/projects               - Create project
GET    /api/projects/[id]          - Get single project
PUT    /api/projects/[id]          - Update project
DELETE /api/projects/[id]          - Delete project
GET    /api/projects/[id]/team     - Get project team
POST   /api/projects/[id]/team     - Assign team member
DELETE /api/projects/[id]/team/[memberId] - Remove team member
```

#### 5.3.3 Clients
```
GET    /api/clients                - Get all clients
POST   /api/clients                - Create client
GET    /api/clients/[id]           - Get single client
PUT    /api/clients/[id]           - Update client
DELETE /api/clients/[id]           - Delete client
GET    /api/clients/[id]/projects  - Get client's projects
```

#### 5.3.4 Team Members
```
GET    /api/team                   - Get all team members
POST   /api/team                   - Create team member
GET    /api/team/[id]              - Get single member
PUT    /api/team/[id]              - Update team member
DELETE /api/team/[id]              - Delete team member
GET    /api/team/[id]/projects     - Get member's projects
```

#### 5.3.5 Meetings
```
GET    /api/meetings               - Get all meetings (with filters)
POST   /api/meetings               - Create meeting
GET    /api/meetings/[id]          - Get single meeting
PUT    /api/meetings/[id]          - Update meeting
DELETE /api/meetings/[id]          - Delete meeting
```

#### 5.3.6 Dashboard
```
GET    /api/dashboard/stats        - Get dashboard statistics
GET    /api/dashboard/activity     - Get recent activities
```

### 5.4 Request/Response Examples

#### Example: Get Projects with Filters
**Request:**
```http
GET /api/projects?status=active,planning&priority=high&search=automation&page=1&limit=25&sortBy=start_date&sortOrder=desc
Cookie: better-auth.session_token={token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "project_id": "uuid",
        "project_name": "AI Automation Suite",
        "project_type": "automation",
        "status": "active",
        "priority": "high",
        "description": "...",
        "start_date": "2026-01-01",
        "end_date": "2026-04-30",
        "duration_days": 120,
        "budget_amount": 50000,
        "currency": "USD",
        "progress_percentage": 45,
        "client": {
          "client_id": "uuid",
          "company_name": "Tech Corp"
        },
        "team": [
          {
            "member_id": "uuid",
            "full_name": "John Doe",
            "role_in_project": "Project Lead",
            "allocation_percentage": 80
          }
        ],
        "created_at": "2025-12-15T10:00:00Z",
        "updated_at": "2026-01-10T14:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 25,
      "total": 47,
      "totalPages": 2
    }
  }
}
```

#### Example: Create Project (Server Action Alternative)
**Using Server Action in Next.js:**
```typescript
// app/actions/projects.ts
'use server'

export async function createProject(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (!session) {
    return { error: 'Unauthorized' }
  }

  const data = {
    project_name: formData.get('project_name'),
    project_type: formData.get('project_type'),
    // ... other fields
  }

  const project = await db.project.create({ data })
  
  revalidatePath('/projects')
  return { success: true, data: project }
}
```

**Or via API Route:**
```http
POST /api/projects
Cookie: better-auth.session_token={token}
Content-Type: application/json

{
  "project_name": "Customer Portal Automation",
  "project_type": "automation",
  "client_id": "client-uuid",
  "description": "Automate customer onboarding process",
  "status": "planning",
  "priority": "high",
  "start_date": "2026-02-01",
  "end_date": "2026-05-31",
  "budget_amount": 35000,
  "currency": "USD",
  "billing_type": "fixed_price",
  "estimated_hours": 280
}
```

**Response:**
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "project_id": "new-uuid",
    "project_name": "Customer Portal Automation",
    "project_code": "CPA-2026-001"
  }
}
```

### 5.5 Error Handling

**Standard Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "end_date",
        "message": "End date must be after start date"
      }
    ]
  }
}
```

**HTTP Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request (validation errors)
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict (duplicate entries)
- 500: Internal Server Error

### 5.6 Security Requirements

**Authentication:**
- Better Auth session-based authentication
- Secure HTTP-only cookies
- Session expiration (configurable)
- CSRF protection (built-in with Better Auth)

**Authorization:**
- Role-based access control via Better Auth
- Server-side permission checks
- Middleware for protected routes

**Data Security:**
- Password hashing (Better Auth handles this)
- SQL injection prevention (Prisma parameterized queries)
- XSS prevention (React/Next.js built-in)
- Input validation with Zod
- Rate limiting on auth endpoints (optional)
- HTTPS required in production

**Environment Variables:**
```env
# Neon Database
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-min-32-chars"
BETTER_AUTH_URL="http://localhost:3000" # Production URL in prod

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional
NODE_ENV="development"
```

---

## 6. UI/UX Design Specifications

### 6.1 Design Philosophy: Modern Minimal

**Core Principles:**
- **Clarity:** Clean layouts with generous white space
- **Simplicity:** Remove unnecessary elements, focus on content
- **Consistency:** Unified design language throughout
- **Subtle:** Refined interactions, minimal decoration
- **Functional:** Every element serves a purpose

### 6.2 Design System

#### 6.2.1 Color Palette (Neutral & Refined)
**Neutrals (Primary):**
- Background: #FFFFFF (White)
- Surface: #FAFAFA (Light Gray)
- Border: #E5E5E5 (Subtle Border)
- Muted: #737373 (Medium Gray)
- Text Primary: #171717 (Almost Black)
- Text Secondary: #525252 (Dark Gray)
- Text Tertiary: #A3A3A3 (Light Gray)

**Accent (Minimal Use):**
- Primary: #18181B (Charcoal) - for important actions
- Primary Hover: #27272A
- Link: #404040 (Subtle dark gray)

**Status (Subdued):**
- Success: #16A34A (Green)
- Warning: #EA580C (Orange)
- Error: #DC2626 (Red)
- Info: #2563EB (Blue)
- Neutral: #71717A (Gray)

**Status Backgrounds (Very Light):**
- Success BG: #F0FDF4
- Warning BG: #FFF7ED
- Error BG: #FEF2F2
- Info BG: #EFF6FF
- Neutral BG: #F4F4F5

#### 6.2.2 Typography (Clean & Readable)
**Font Family:**
- Sans: 'Inter', -apple-system, system-ui, sans-serif
- Mono: 'JetBrains Mono', 'Courier New', monospace

**Font Sizes:**
- Display: 36px / 700 (rarely used)
- H1: 28px / 600
- H2: 22px / 600
- H3: 18px / 600
- Body Large: 16px / 400
- Body: 15px / 400
- Small: 14px / 400
- Tiny: 13px / 400
- Caption: 12px / 400

**Line Height:**
- Tight: 1.25
- Normal: 1.5
- Relaxed: 1.75

#### 6.2.3 Spacing (Consistent Grid)
- Base unit: 4px
- Scale: 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80px
- Container max-width: 1400px
- Content padding: 24px (mobile), 32px (tablet), 48px (desktop)

#### 6.2.4 Components (Minimal & Functional)

**Buttons:**
- Primary: 
  - Background: #18181B
  - Text: White
  - Height: 36px (default)
  - Padding: 0 16px
  - Border-radius: 6px
  - Font-weight: 500
  - Hover: #27272A
  
- Secondary:
  - Background: Transparent
  - Border: 1px solid #E5E5E5
  - Text: #171717
  - Hover: #FAFAFA background
  
- Ghost:
  - Background: Transparent
  - Text: #525252
  - Hover: #FAFAFA background

**Input Fields:**
- Height: 36px
- Border: 1px solid #E5E5E5
- Border-radius: 6px
- Padding: 0 12px
- Font-size: 15px
- Placeholder: #A3A3A3
- Focus: Border #171717, subtle shadow

**Cards:**
- Background: White
- Border: 1px solid #E5E5E5
- Border-radius: 8px
- No shadow (minimal approach)
- Hover: subtle border color change to #D4D4D4

**Tables:**
- No borders between cells (cleaner look)
- Row hover: #FAFAFA background
- Header: 
  - Background: #FAFAFA
  - Text: #525252
  - Font-size: 13px
  - Font-weight: 500
  - Text-transform: uppercase
  - Letter-spacing: 0.05em
- Cell padding: 12px 16px
- Font-size: 15px

**Badges:**
- Border-radius: 4px (subtle, not pill)
- Padding: 2px 8px
- Font-size: 12px
- Font-weight: 500
- Background: Status background color
- Text: Matching status color
- No border

**Modals/Dialogs:**
- Overlay: rgba(0, 0, 0, 0.4)
- Background: White
- Border: 1px solid #E5E5E5
- Border-radius: 10px
- No shadow (clean)
- Max-width: 500px (forms), 800px (large)
- Padding: 24px

**Sidebar Navigation:**
- Background: #FAFAFA (subtle contrast)
- Width: 240px
- Item padding: 10px 16px
- Active item: #18181B background, white text
- Hover: #F4F4F5 background
- Font-size: 15px
- Icon + text layout
- Subtle separators

#### 6.2.5 Iconography
- Style: Outline (not filled)
- Size: 20px default, 16px small, 24px large
- Stroke-width: 1.5px
- Library: Lucide Icons (minimal, consistent)

#### 6.2.6 Animations (Subtle & Fast)
- Duration: 150ms (default), 200ms (complex)
- Easing: ease-in-out
- Minimal use: only for feedback
- No decorative animations

### 6.3 Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px
- Wide: > 1440px

### 6.4 Key Screen Layouts (Minimal Design)

#### 6.4.1 Projects Grid Page
```
┌──────────────────────────────────────────────────────────────────┐
│  Projects                                    👤 John    [Sign Out]│
├──────────────────────────────────────────────────────────────────┤
│  [≡]  Dashboard  Projects  Clients  Team  Meetings               │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Projects                                       + New Project     │
│                                                                   │
│  [Active ▾]  [All Teams ▾]  [All Priorities ▾]    Search...      │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ NAME           CLIENT    STATUS   TEAM      PROGRESS  DUE │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │ AI Suite       TechCo    Active   JD MS    ▓▓▓▓░░    4/30│  │
│  │ Portal         Corp      Planning DB       ▓░░░░░    5/31│  │
│  │ Dashboard      StartX    Active   JD       ▓▓▓▓▓░    3/15│  │
│  │ Integration    BigCo     Hold     MS BW    ▓▓░░░░    6/15│  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  47 projects                            ← 1 2 3 ... 5 →          │
└──────────────────────────────────────────────────────────────────┘
```

#### 6.4.2 Create Project Form (Minimal Modal)
```
┌──────────────────────────────────────────────┐
│  New Project                              ✕  │
├──────────────────────────────────────────────┤
│                                              │
│  Project Name                                │
│  [________________________________]          │
│                                              │
│  Client                   Type               │
│  [TechCorp ▾]            [AI Agent ▾]       │
│                                              │
│  Timeline                                    │
│  [📅 Jan 1, 2026]  to  [📅 Apr 30, 2026]   │
│                                              │
│  Status        Priority        Budget        │
│  [Active ▾]    [High ▾]        [$50,000]    │
│                                              │
│  Description                                 │
│  [________________________________]          │
│  [________________________________]          │
│                                              │
│                    Cancel    Create Project  │
└──────────────────────────────────────────────┘
```

#### 6.4.3 Project Detail Page
```
┌──────────────────────────────────────────────────────────────────┐
│  ← Projects                                                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  AI Automation Suite                                    Edit      │
│  Active  •  High Priority  •  65% Complete                       │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Overview  Client  Team  Meetings  Notes                     ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │                                                              ││
│  │ PROJECT DETAILS                                              ││
│  │ Type           AI Agent Development                          ││
│  │ Timeline       Jan 1, 2026 → Apr 30, 2026 (120 days)        ││
│  │ Budget         $50,000 USD                                   ││
│  │ Client         TechCorp                                      ││
│  │                                                              ││
│  │ DESCRIPTION                                                  ││
│  │ Build an AI-powered automation suite for customer            ││
│  │ onboarding process...                                        ││
│  │                                                              ││
│  │ TEAM (3)                                                     ││
│  │ • John Doe - Project Lead (80%)                             ││
│  │ • Jane Smith - Frontend Developer (100%)                    ││
│  │ • Bob Wilson - AI Engineer (60%)                            ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

### 6.5 Status Indicators (Minimal)

**Project Status:**
- Active: Small green dot • + "Active" text
- Planning: Small blue dot • + "Planning" text
- On Hold: Small orange dot • + "On Hold" text
- Completed: Small gray dot • + "Completed" text

**Priority:**
- High: "High" text in red
- Medium: "Medium" text in orange  
- Low: "Low" text in gray
- No flag icons, just text

**Progress Bar:**
- Height: 6px
- Background: #F4F4F5
- Fill: #18181B
- Border-radius: 3px
- Minimal, no gradients

### 6.6 Accessibility (Built-in)
- WCAG 2.1 Level AA compliance
- Keyboard navigation (Tab, Enter, Esc)
- Focus ring: 2px solid #18181B with offset
- Sufficient contrast ratios (4.5:1 minimum)
- Screen reader labels
- Semantic HTML5
- Skip to content link

### 6.7 Dark Mode (Future Consideration)
Phase 1 focuses on light mode only. Dark mode can be added in future phases with:
- Background: #0A0A0A
- Surface: #171717
- Text: #FAFAFA
- Borders: #27272A

---

## 7. Development Workflow

### 7.1 Environment Setup

**Required Tools:**
- Node.js 18+ (LTS recommended)
- npm or pnpm or yarn
- Git
- VS Code (recommended) with extensions:
  - Prisma
  - Tailwind CSS IntelliSense
  - ESLint
  - Prettier

**Getting Started:**
1. Create Neon DB account (free tier available)
2. Create new Neon project and get connection string
3. Clone repository
4. Install dependencies: `npm install`
5. Set up environment variables (see below)
6. Run Prisma migrations: `npx prisma migrate dev`
7. Seed database (optional): `npx prisma db seed`
8. Start development server: `npm run dev`

**Environment Variables (.env.local):**
```env
# Neon Database URL
DATABASE_URL="postgresql://username:password@ep-xxxxx.us-east-2.aws.neon.tech/dbname?sslmode=require"

# Better Auth Configuration
BETTER_AUTH_SECRET="your-secret-key-at-least-32-characters-long"
BETTER_AUTH_URL="http://localhost:3000"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Environment
NODE_ENV="development"
```

**Prisma Setup:**
```bash
# Initialize Prisma (already done in project)
npx prisma init

# Create and apply migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio to view/edit data
npx prisma studio

# Reset database (caution: deletes all data)
npx prisma migrate reset
```

**Next.js Development:**
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

### 7.2 Git Workflow

**Branching Strategy:**
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

**Commit Message Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: feat, fix, docs, style, refactor, test, chore

**Example:**
```
feat(projects): add project grid filtering

- Add status filter dropdown
- Add priority filter
- Add search by name
- Implement filter combination logic

Closes #123
```

### 7.3 Code Review Process
1. Create feature branch from `develop`
2. Develop feature with proper commits
3. Create pull request with description
4. Code review by team member
5. Address feedback
6. Merge to develop
7. Test on local/staging environment

---

## 8. Development Workflow

### 8.1 Functional Criteria
✅ Users can register and log in securely with Better Auth  
✅ All CRUD operations work for projects, clients, team, and meetings  
✅ Grid view displays all projects with correct data  
✅ Filters and search function correctly  
✅ Forms validate input properly with Zod  
✅ Data persists correctly in Neon DB via Prisma  
✅ Activity log tracks all changes  
✅ Different user roles have appropriate permissions  

### 8.2 Technical Criteria
✅ Database schema supports all future phases  
✅ Next.js API routes follow best practices  
✅ Code is well-structured and type-safe with TypeScript  
✅ No major security vulnerabilities  
✅ Application loads in < 2 seconds  
✅ Works on Chrome, Firefox, Safari, Edge  
✅ Responsive on mobile, tablet, desktop  
✅ Server components used where appropriate  

### 8.3 User Experience Criteria
✅ Intuitive navigation with minimal design  
✅ Clear visual hierarchy with generous white space  
✅ Helpful error messages  
✅ Consistent minimal design throughout  
✅ Accessible to users with disabilities  
✅ No confusing or broken workflows  
✅ Clean, modern aesthetic  

---

## 9. Project Timeline

### 9.1 Phase 1 Development Schedule (6-8 Weeks)

**Week 1-2: Setup & Database**
- Next.js project setup with App Router
- Neon DB setup and connection
- Prisma schema design and migrations
- Better Auth configuration
- Initial database seeding
- Development environment configuration

**Week 3-4: Core Backend & API**
- API route handlers for projects
- API route handlers for clients
- API route handlers for team members
- API route handlers for meetings
- Server actions for form submissions
- Data validation with Zod
- Activity logging implementation

**Week 5-6: Frontend Core**
- Layout components (sidebar, header)
- Authentication UI (login/register)
- Projects grid view with filters
- Project create/edit forms
- Client management pages
- Team management pages

**Week 7: Frontend Polish & Integration**
- Meeting management UI
- Dashboard with statistics
- Search and advanced filters
- Responsive design refinements
- Loading states and error handling
- UI polish and consistency

**Week 8: Testing & Refinement**
- Manual testing of all features
- Bug fixes and edge case handling
- Performance optimization
- Code cleanup and documentation
- Final UI refinements
- Production-ready preparation

### 9.2 Milestones

**Milestone 1 (Week 2):** Foundation Complete
- Next.js + Neon DB + Prisma configured
- Database schema created and migrated
- Better Auth working with basic login/register

**Milestone 2 (Week 4):** Backend Complete
- All API routes functional
- CRUD operations working
- Data validation in place
- Server actions implemented

**Milestone 3 (Week 6):** Frontend Core Complete
- All main pages implemented
- Forms functional with validation
- Grid view working with filters
- Navigation complete

**Milestone 4 (Week 8):** Phase 1 Launch Ready
- All features tested and working
- UI polished and responsive
- Documentation complete
- Ready for production use

---

## 10. Risks & Mitigation

### 10.1 Technical Risks

**Risk:** Neon DB connection limits on free tier  
**Impact:** Medium  
**Mitigation:** 
- Monitor connection usage
- Implement connection pooling (Prisma default)
- Upgrade to paid tier if needed ($20/month)
- Use database branching for development

**Risk:** Better Auth configuration complexity  
**Impact:** Low  
**Mitigation:**
- Follow official documentation closely
- Use TypeScript for type safety
- Test authentication flows thoroughly
- Keep auth configuration simple for Phase 1

**Risk:** Next.js server/client component confusion  
**Impact:** Low  
**Mitigation:**
- Clear documentation of when to use each
- Use 'use client' directive consistently
- Server components by default
- Team training on Next.js patterns

**Risk:** Browser compatibility with modern features  
**Impact:** Low  
**Mitigation:**
- Next.js handles most polyfills
- Test on major browsers regularly
- Use progressive enhancement

### 10.2 Schedule Risks

**Risk:** Underestimated development time  
**Impact:** Medium  
**Mitigation:**
- Add 20% buffer to estimates
- Prioritize core features first
- Weekly progress reviews
- Have backup plan for feature cuts

**Risk:** Scope creep during development  
**Impact:** High  
**Mitigation:**
- Strict adherence to Phase 1 PRD
- Document "future features" for Phase 2
- Regular stakeholder alignment
- Change request process

**Risk:** Learning curve with new stack  
**Impact:** Low  
**Mitigation:**
- Team members review docs before start
- Pair programming for complex features
- Code reviews for knowledge sharing

### 10.3 Data Risks

**Risk:** Data loss during development  
**Impact:** Medium  
**Mitigation:**
- Neon DB automatic backups
- Database branching for testing
- Regular Prisma migrations
- Never test destructive operations on main branch

---

## 11. Budget Estimate (Phase 1)

### 11.1 Development Costs

**Internal Team (assuming full-time):**
- Full-stack Developer (Next.js): 6-8 weeks
- UI/UX Designer: 1 week (initial design system)
- Project Manager: 2 weeks (part-time oversight)

**External Costs:**
- None required for Phase 1 (internal development)

### 11.2 Infrastructure Costs

**Hosting & Database (Monthly):**

**Option 1 - Free Tier (Development/Testing):**
- Vercel (Next.js hosting): Free (Hobby plan)
- Neon DB: Free tier (500MB storage, 3 projects)
- Total: $0/month

**Option 2 - Production Ready:**
- Vercel Pro: $20/month (includes SSL, CDN, analytics)
- Neon DB Scale: $20/month (10GB storage, unlimited projects)
- Total: $40/month

**Option 3 - High Performance:**
- Vercel Pro: $20/month
- Neon DB Business: $69/month (50GB storage, dedicated compute)
- Total: $89/month

**Recommendation:** Start with Free Tier for development, upgrade to Option 2 ($40/month) for production.

**Additional Costs:**
- Domain name: $10-15/year
- SSL certificate: Free (included with Vercel)
- Email service: Free tier (for auth emails if needed)

### 11.3 Tools & Services

**Development Tools (Free):**
- VS Code: Free
- GitHub: Free (or $4/user/month for private repos)
- Prisma Studio: Free (included)
- Better Auth: Free (open source)

**Optional Tools:**
- Figma: Free tier sufficient
- Linear/GitHub Projects: Free tier sufficient

### 11.4 Total Estimated Costs

**Initial Setup:** $10-15 (domain only)  
**Monthly (Development):** $0  
**Monthly (Production):** $40-90  
**Annual (Production):** $480-1,080

## 12. Post-Launch Plan

### 12.1 Immediate Post-Launch (Week 1-2)
- Monitor application performance and errors
- Collect user feedback on UX and features
- Fix critical bugs immediately
- Track usage metrics and analytics
- Provide direct user support

### 12.2 Short Term (Month 1-3)
- Gather and prioritize feature requests
- Plan Phase 2 development roadmap
- Performance optimization based on real usage
- UI/UX improvements from feedback
- Additional user training if needed

### 12.3 Documentation Deliverables
- User guide with screenshots
- API documentation (generated from code)
- Database schema documentation (Prisma ERD)
- Developer setup guide
- Maintenance and backup procedures
- Phase 2 feature roadmap

---

## 13. Appendices

### 13.1 Glossary

**CRUD:** Create, Read, Update, Delete operations  
**ORM:** Object-Relational Mapping (Prisma in this case)  
**API:** Application Programming Interface  
**UI/UX:** User Interface / User Experience  
**RBAC:** Role-Based Access Control  
**SSR:** Server-Side Rendering (Next.js feature)
**RSC:** React Server Components (Next.js App Router)

### 13.2 Key Resources
- Next.js Documentation: https://nextjs.org/docs
- Prisma Documentation: https://www.prisma.io/docs
- Better Auth Documentation: https://better-auth.com
- Neon DB Documentation: https://neon.tech/docs
- Tailwind CSS: https://tailwindcss.com
- shadcn/ui: https://ui.shadcn.com
- TanStack Table: https://tanstack.com/table

### 13.3 Prisma Schema Example

```prisma
// Example from prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  fullName     String
  role         Role     @default(TEAM_MEMBER)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  createdProjects Project[] @relation("ProjectCreator")
  activityLogs    ActivityLog[]
}

enum Role {
  ADMIN
  TEAM_MEMBER
  CLIENT
}

model Project {
  id              String        @id @default(cuid())
  projectName     String
  projectCode     String?       @unique
  projectType     ProjectType
  status          ProjectStatus @default(PLANNING)
  priority        Priority      @default(MEDIUM)
  description     String?
  startDate       DateTime
  endDate         DateTime
  budgetAmount    Decimal?
  progressPercent Int           @default(0)
  
  clientId        String
  client          Client        @relation(fields: [clientId], references: [id])
  
  createdById     String
  createdBy       User          @relation("ProjectCreator", fields: [createdById], references: [id])
  
  assignments     ProjectAssignment[]
  meetings        Meeting[]
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@index([status])
  @@index([clientId])
}

enum ProjectType {
  AI_AGENT
  AUTOMATION
  SAAS
  CONSULTING
  OTHER
}

enum ProjectStatus {
  PLANNING
  ACTIVE
  ON_HOLD
  COMPLETED
  ARCHIVED
}

enum Priority {
  HIGH
  MEDIUM
  LOW
}
```

### 13.4 Version History

**v1.0 - January 11, 2026**
- Initial Phase 1 PRD created
- Next.js full-stack with Neon DB and Better Auth
- Modern minimal UI design system
- Complete database schema with Prisma
- Ready for development kickoff

---

## 14. Sign-off

**Prepared by:** AI Agency Development Team  
**Document Type:** Product Requirements Document - Phase 1  
**Technology Stack:** Next.js 14+ / Neon DB / Prisma / Better Auth  
**Design Language:** Modern Minimal  
**Date:** January 11, 2026  

**Approval Signatures:**

Product Owner: ___________________ Date: ___________

Technical Lead: ___________________ Date: ___________

Project Manager: ___________________ Date: ___________

---

**END OF DOCUMENT**

*This PRD is a living document and may be updated as requirements evolve. All changes should be tracked in the version history section.*