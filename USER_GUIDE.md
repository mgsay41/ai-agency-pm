# AI Agency PM System - User Guide

Welcome to the AI Agency Project Management System! This guide will help you understand and use all the features available in the application.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard](#dashboard)
3. [Project Management](#project-management)
4. [Client Management](#client-management)
5. [Team Management](#team-management)
6. [Meeting Management](#meeting-management)
7. [Search & Filters](#search--filters)
8. [User Roles & Permissions](#user-roles--permissions)
9. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

### Logging In

1. Navigate to the login page at `/login`
2. Enter your email and password
3. Click "Sign In"
4. You'll be redirected to the dashboard

### First-Time Setup

If you're the first user:
1. Click "Create Account" on the login page
2. Fill in your details (name, email, password)
3. Your account will be created with Admin privileges
4. Log in with your new credentials

### Navigation

The sidebar on the left provides quick access to:
- **Dashboard** - Overview and statistics
- **Projects** - Manage all projects
- **Clients** - Manage client companies
- **Team** - Manage team members
- **Meetings** - Schedule and track meetings

---

## Dashboard

The dashboard provides an at-a-glance view of your agency's operations.

### Statistics Cards

- **Active Projects** - Number of projects currently in progress
- **Total Clients** - Number of client companies
- **Team Members** - Active team member count
- **This Month's Meetings** - Meetings scheduled for the current month

### Project Status Distribution

Visual breakdown of projects by status:
- Planning
- Active
- On Hold
- Completed
- Archived

### Activity Feed

Real-time log of recent activities including:
- New projects created
- Projects updated or status changed
- Team member assignments
- Meeting schedules
- Client updates

### Upcoming Deadlines

Lists projects with end dates approaching in the next 30 days:
- Project name
- End date
- Status
- Priority level
- Client name

### Global Search

Use the search bar in the header to quickly find:
- Projects (by name or description)
- Clients (by company name)

---

## Project Management

### Viewing Projects

1. Click **Projects** in the sidebar
2. See all projects in a table format
3. Use filters to narrow down results:
   - Status (Planning, Active, On Hold, etc.)
   - Priority (High, Medium, Low)
   - Project Type (AI Agent, Automation, SaaS, etc.)
   - Search by name or description

### Creating a New Project

1. Click the **"New Project"** button
2. Fill in the required fields:
   - **Project Name** - Descriptive name for the project
   - **Client** - Select from existing clients or create new
   - **Project Type** - AI Agent, Automation, SaaS, Consulting, or Other
   - **Start Date** - Project start date
   - **End Date** - Projected completion date
3. Optional fields:
   - Project Code - Custom identifier
   - Description - Detailed project description
   - Internal Notes - Private notes for team
   - Status - Planning (default), Active, On Hold, etc.
   - Priority - High, Medium (default), or Low
   - Budget Amount - Project budget
   - Currency - USD (default) or other
   - Estimated Hours - Time estimate
   - Billing Type - Fixed Price, Time & Materials, Retainer, Pro Bono
   - Progress % - Current completion percentage (0-100)
   - Current Phase - Current project phase
   - Health Status - On Track, At Risk, Off Track
4. Click **"Create Project"**

### Editing a Project

1. Find the project in the list
2. Click the **pencil icon** (Edit)
3. Update any fields
4. Click **"Save Changes"**

### Deleting a Project

1. Find the project in the list
2. Click the **trash icon** (Delete)
3. Confirm deletion in the dialog
4. **Note:** This will also remove all team assignments

### Viewing Project Details

1. Click on a project name in the list
2. View tabs for:
   - **Overview** - All project information
   - **Client** - Client details and contacts
   - **Team** - Assigned team members and their roles
   - **Meetings** - All meetings linked to this project
   - **Notes** - Internal notes (if any)

### Assigning Team Members

1. Go to Project Details
2. Click the **Team** tab
3. Click **"Assign Team Member"**
4. Select team member
5. Enter their role in the project
6. Set allocation percentage (0-100%)
7. Optionally set start and end dates
8. Add notes if needed
9. Click **"Assign"**

---

## Client Management

### Viewing Clients

1. Click **Clients** in the sidebar
2. Browse all clients in a table
3. Use search to find specific clients
4. See project count for each client

### Creating a New Client

1. Click **"New Client"** button
2. Fill in required fields:
   - **Company Name** - Official company name
   - **Client Type** - Corporate, Startup, Individual, Non-Profit, Government, or Other
3. Optional fields:
   - Industry - Client's industry
   - Website - Company website
   - Company Size - Number of employees
   - Annual Revenue - Company's annual revenue
   - Time Zone - Client's time zone
   - Preferred Contact Method - Email, Phone, Slack, Teams, Other
   - Billing Address - Full billing address
   - Client Since - Date of first engagement
4. **Primary Contact:**
   - Contact Name
   - Title/Position
   - Email
   - Phone
5. Click **"Create Client"**

### Quick Client Creation

When creating a project, if you need to add a new client:
1. Click the **"+ Quick Add"** button next to the client selector
2. Enter minimal client information
3. Create the client without leaving the project form

### Editing a Client

1. Find the client in the list
2. Click the **pencil icon**
3. Update information
4. Click **"Save Changes"**

### Deleting a Client

1. Find the client
2. Click the **trash icon**
3. Confirm deletion
4. **Warning:** This will affect all linked projects

### Viewing Client Details

1. Click on a client name
2. View:
   - Company information
   - Contact details
   - All projects for this client
   - Activity history

---

## Team Management

### Viewing Team Members

1. Click **Team** in the sidebar
2. Browse all team members
3. Filter by:
   - Department
   - Status (Active/Inactive)
   - Skills
4. Search by name, email, or role

### Adding a Team Member

1. Click **"New Team Member"** button
2. Fill in required fields:
   - **Full Name**
   - **Email** - Unique email address
   - **Role/Title** - Job title
   - **Department** - Engineering, Design, PM, Sales, Marketing, Operations, etc.
3. Optional fields:
   - Avatar Color - Choose a color for their avatar
   - Skills - Select multiple skills (JavaScript, Python, React, AI/ML, etc.)
   - Specialization - Frontend, Backend, Full Stack, AI/ML, DevOps, Design, PM
   - Hourly Rate - Billing rate
   - Currency - USD (default)
   - Employment Type - Full-time, Part-time, Contract, Freelance
   - Start Date - Employment start date
   - LinkedIn URL
   - GitHub URL
   - Bio - Brief description
   - Status - Active (default) or Inactive
4. Click **"Create Team Member"**

### Editing Team Members

1. Find the team member
2. Click the **pencil icon**
3. Update information
4. Click **"Save Changes"**

### Deactivating Team Members

1. Edit the team member
2. Change Status to **"Inactive"**
3. Save changes
4. **Note:** Inactive members won't appear in assignment dropdowns

### Viewing Team Member Details

1. Click on a team member's name
2. View:
   - Full profile information
   - All assigned projects
   - Skills and specializations
   - Employment details

---

## Meeting Management

### Viewing Meetings

1. Click **Meetings** in the sidebar
2. Browse all meetings
3. Filter by:
   - Project
   - Meeting Type
   - Date Range
4. See statistics:
   - Total meetings
   - This week's meetings
   - This month's meetings

### Scheduling a Meeting

1. Click **"New Meeting"** button
2. Fill in required fields:
   - **Meeting Title**
   - **Project** - Link to a project
   - **Meeting Type** - Kickoff, Discovery, Planning, Review, Demo, Retrospective, Client Call, Internal Sync, or Other
   - **Date** - Meeting date
3. Optional fields:
   - **Agenda** - Meeting agenda/topics
   - **Duration** - In minutes
   - **Location** - Physical location or video link
   - **Recording URL** - Link to recording
   - **Internal Attendees** - Select team members
   - **External Attendees** - Add external participant names (comma-separated)
   - **Notes** - Meeting notes
   - **Transcript** - Full meeting transcript (paste or type)
   - **Next Meeting Date** - Schedule follow-up
   - **Action Items** - Add tasks with assignees and due dates
4. Click **"Create Meeting"**

### Adding Action Items

Within the meeting form:
1. Scroll to **Action Items** section
2. Click **"Add Action Item"**
3. Enter:
   - Description - What needs to be done
   - Assigned To - Team member responsible
   - Due Date - Deadline
   - Priority - High, Medium, Low
   - Status - Open, In Progress, Completed, Cancelled
4. Add multiple items as needed

### Editing Meetings

1. Find the meeting
2. Click the **pencil icon**
3. Update information
4. Click **"Save Changes"**

### Viewing Meeting Details

1. Click on a meeting title
2. View:
   - Full meeting information
   - Attendee list
   - Meeting notes and transcript
   - Action items with status
   - Download transcript option

### Meeting from Project Page

To create a meeting for a specific project:
1. Go to Project Details
2. Click the **Meetings** tab
3. Click **"New Meeting"**
4. The project will be pre-selected

---

## Search & Filters

### Global Search

1. Click the search icon in the header
2. Type your search query
3. See results for:
   - Projects matching name or description
   - Clients matching company name
4. Click a result to navigate to it

### Project Filters

- **Status Filter** - Select one or more statuses
- **Priority Filter** - Filter by priority level
- **Project Type** - Filter by AI Agent, Automation, etc.
- **Search** - Text search across project names and descriptions
- **Clear Filters** - Reset all filters

### Client Filters

- **Search** - Find clients by company name
- **Industry** - Filter by industry (if you add custom filters)

### Team Filters

- **Department** - Filter by department
- **Status** - Active or Inactive
- **Skills** - Filter by specific skills
- **Search** - Search by name, email, or role

### Meeting Filters

- **Project** - Show meetings for specific project
- **Meeting Type** - Filter by meeting type
- **Date Range** - Custom date range selection

---

## User Roles & Permissions

### Admin
- Full access to all features
- Can create, edit, and delete anything
- Can manage users (future feature)
- Can view all activity logs

### Project Manager
- Create and manage projects
- Assign team members
- Create and manage meetings
- View all clients and team members
- Limited deletion rights

### Team Member
- View assigned projects
- Update project status and progress
- Add meeting notes
- View team members
- Cannot delete projects or clients

### Client
- View own projects only
- Read-only access to project information
- Cannot edit or delete anything
- Limited dashboard access

**Note:** Full RBAC implementation is planned for Phase 2. Current Phase 1 has basic authentication with Admin role support.

---

## Tips & Best Practices

### Project Management

1. **Keep Projects Updated** - Regularly update project status and progress percentage
2. **Use Health Status** - Mark projects as "At Risk" or "Off Track" early
3. **Add Internal Notes** - Document important decisions or issues privately
4. **Set Realistic Dates** - Choose achievable start and end dates
5. **Assign Team Early** - Assign team members during project planning phase

### Client Management

1. **Complete Client Profiles** - Fill in all client information for better tracking
2. **Update Contact Info** - Keep primary contact information current
3. **Use Client Types** - Properly categorize clients for better filtering
4. **Track Client Since** - Record the start of the business relationship

### Team Management

1. **Keep Skills Updated** - Regularly update team member skills
2. **Set Realistic Allocations** - Don't over-allocate team members (total should not exceed 100%)
3. **Use Specializations** - Helps with finding the right person for projects
4. **Update Status** - Mark members as inactive when they leave

### Meeting Management

1. **Link to Projects** - Always link meetings to the relevant project
2. **Add Action Items During Meeting** - Capture tasks in real-time
3. **Upload Transcripts** - Paste meeting transcripts for future reference
4. **Set Next Meeting** - Schedule follow-ups immediately
5. **Update Action Item Status** - Keep action items current

### General Tips

1. **Use Search** - The global search is fast and comprehensive
2. **Check Dashboard Daily** - Stay on top of upcoming deadlines
3. **Review Activity Feed** - Keep track of team changes
4. **Export Data** - Use browser print or screenshots for reports (export features coming in Phase 2)
5. **Regular Backups** - Ensure database backups are running (handled by Neon DB)

### Performance Tips

1. **Use Filters** - Narrow down large lists with filters
2. **Pagination** - Navigate through pages for large datasets
3. **Specific Searches** - Use specific search terms for faster results
4. **Close Unused Tabs** - Keep only necessary sections open

---

## Keyboard Shortcuts

**Coming in Phase 2**

Planned shortcuts:
- `Ctrl/Cmd + K` - Global search
- `Ctrl/Cmd + N` - New project (context-aware)
- `Escape` - Close dialogs
- `Tab` - Navigate form fields
- Arrow keys - Navigate tables

---

## Troubleshooting

### Can't Log In
- Verify email and password are correct
- Check if Caps Lock is on
- Try resetting password (feature coming soon)
- Contact administrator

### Can't See Projects
- Check if you're on the correct page
- Clear any active filters
- Verify you have permission to view projects
- Refresh the page

### Changes Not Saving
- Check your internet connection
- Verify all required fields are filled
- Look for validation error messages
- Try again after a moment

### Page Not Loading
- Refresh the browser
- Clear browser cache
- Check internet connection
- Contact support if issue persists

---

## Support & Feedback

For technical support or to report issues:
- Contact your system administrator
- Check the project repository for known issues
- Submit feedback through your organization's channels

---

## What's Next?

### Phase 2 Features (Coming Soon)

- Advanced AI integrations
- Automated meeting transcription with AI
- Email notifications
- Calendar integration (Google Calendar, Outlook)
- File attachments
- Advanced reporting and exports
- Custom dashboards
- Enhanced permissions system
- API access
- Webhook integrations

### Stay Updated

Watch for announcements about new features and updates!

---

**Need Help?** Contact your system administrator or development team.

**Version:** 1.0.0 (Phase 1)
**Last Updated:** January 2026
