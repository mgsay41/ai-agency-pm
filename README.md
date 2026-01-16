# AI Agency Project Management System

A comprehensive project management system built specifically for AI agencies to manage projects, clients, team members, and meetings.

## Overview

This application provides a complete solution for managing AI agency operations with features for project tracking, client management, team collaboration, and meeting organization. Built with modern web technologies for performance, security, and scalability.

## Technology Stack

### Core Technologies
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (strict mode)
- **Database:** Neon DB (Serverless PostgreSQL)
- **ORM:** Prisma
- **Authentication:** Better Auth
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Forms:** React Hook Form + Zod validation
- **Tables:** TanStack Table (React Table v8)
- **Icons:** Lucide React
- **Date Handling:** date-fns
- **Notifications:** Sonner (toast notifications)

## Features

### Phase 1 (Current Implementation)

#### Project Management
- Create, read, update, and delete projects
- Track project status (Planning, Active, On Hold, Completed, Archived)
- Set project priorities (High, Medium, Low)
- Assign team members to projects
- Monitor project progress and health status
- Budget and time tracking
- Advanced filtering and search
- Pagination support

#### Client Management
- Complete client CRUD operations
- Client contact management
- Track client information and communication
- Link clients to projects
- Search and filter clients

#### Team Management
- Manage team members and their details
- Track skills and specializations
- Employment details (hourly rate, type, start date)
- Professional links (LinkedIn, GitHub)
- Assign team members to projects with roles
- Track allocation percentages

#### Meeting Management
- Schedule and track meetings
- Support multiple meeting types (Kickoff, Discovery, Planning, Review, Demo, etc.)
- Internal and external attendee tracking
- Meeting transcripts and recording links
- Action items with status tracking
- Link meetings to projects

#### Dashboard & Analytics
- Real-time statistics (active projects, team members, meetings)
- Project status distribution
- Activity feed with recent system events
- Upcoming deadlines tracking
- Global search across projects and clients

#### Security & Compliance
- Secure authentication with session management
- Protected routes with middleware
- Role-based access control (Admin, PM, Team Member, Client)
- Activity logging for all CRUD operations
- Input validation and sanitization
- Error logging and monitoring

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm, yarn, pnpm, or bun package manager
- Neon DB account (or PostgreSQL database)
- Git

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-min-32-characters"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Environment
NODE_ENV="development"
```

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-agency-pm
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# (Optional) Seed the database with sample data
npx prisma db seed
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### First-Time Setup

1. Register the first user (will be created as Admin by default)
2. Log in with your credentials
3. Start adding clients, team members, and projects

## Project Structure

```
ai-agency-pm/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/              # Protected dashboard pages
│   │   ├── clients/
│   │   ├── meetings/
│   │   ├── projects/
│   │   ├── team/
│   │   └── page.tsx             # Dashboard home
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── clients/
│   │   ├── dashboard/
│   │   ├── meetings/
│   │   ├── projects/
│   │   ├── search/
│   │   └── team/
│   ├── error.tsx                 # Global error page
│   ├── not-found.tsx             # 404 page
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── clients/
│   ├── dashboard/
│   ├── layout/
│   ├── meetings/
│   ├── projects/
│   ├── team/
│   └── ui/                       # shadcn/ui components
├── hooks/                        # Custom React hooks
├── lib/                          # Utility functions and configurations
│   ├── services/                 # Business logic
│   ├── validations/              # Zod schemas
│   ├── api-error.ts
│   ├── auth.ts
│   ├── auth-client.ts
│   ├── client-error-handler.ts
│   ├── constants.ts
│   ├── date-utils.ts
│   ├── db.ts
│   ├── logger.ts
│   ├── sanitize.ts
│   └── utils.ts
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Database seeding
├── middleware.ts                 # Route protection
└── package.json
```

## Database Schema

The application uses Prisma ORM with the following main models:

- **User** - System users with authentication
- **Client** - Client companies and organizations
- **ClientContact** - Contact persons for clients
- **TeamMember** - Team members and their details
- **Project** - Projects with full tracking capabilities
- **ProjectAssignment** - Many-to-many relationship between projects and team members
- **Meeting** - Meeting records linked to projects
- **MeetingAttendee** - Meeting participants
- **ActionItem** - Action items from meetings
- **ActivityLog** - Audit trail for all operations

## Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npx prisma studio        # Open Prisma Studio (database GUI)
npx prisma migrate dev   # Create and apply migration
npx prisma generate      # Generate Prisma Client
npx prisma db push       # Push schema changes (dev only)
npx prisma db seed       # Run seed script
```

### Code Quality

- TypeScript strict mode enabled
- ESLint configured for Next.js and React
- Consistent code formatting
- Input validation with Zod
- Error boundaries for graceful error handling

### Design System

The application follows a **Modern Minimal** design system:

- **Colors:** Neutral palette (black, white, grays)
- **Spacing:** Consistent Tailwind spacing scale
- **Typography:** Clean, readable fonts (Geist Sans & Geist Mono)
- **Components:** No shadows, clean borders, subtle hover states
- **Status Colors:** Subdued success, warning, error, and info colors

## API Documentation

### Authentication

All API routes (except `/api/auth/*`) require authentication. Include the session cookie with all requests.

### Projects API

- `GET /api/projects` - List projects with filtering, sorting, and pagination
- `POST /api/projects` - Create a new project
- `GET /api/projects/[id]` - Get single project details
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project
- `GET /api/projects/[id]/team` - List project team assignments
- `POST /api/projects/[id]/team` - Assign team member to project
- `PUT /api/projects/[id]/team/[memberId]` - Update team assignment
- `DELETE /api/projects/[id]/team/[memberId]` - Remove team member from project

### Clients API

- `GET /api/clients` - List clients
- `POST /api/clients` - Create client
- `GET /api/clients/[id]` - Get client details
- `PUT /api/clients/[id]` - Update client
- `DELETE /api/clients/[id]` - Delete client
- Contact management endpoints available

### Team API

- `GET /api/team` - List team members
- `POST /api/team` - Create team member
- `GET /api/team/[id]` - Get team member details
- `PUT /api/team/[id]` - Update team member
- `DELETE /api/team/[id]` - Delete team member

### Meetings API

- `GET /api/meetings` - List meetings
- `POST /api/meetings` - Create meeting
- `GET /api/meetings/[id]` - Get meeting details
- `PUT /api/meetings/[id]` - Update meeting
- `DELETE /api/meetings/[id]` - Delete meeting

### Dashboard API

- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/activity` - Get recent activity feed

### Search API

- `GET /api/search?q=query` - Global search across projects and clients

## Security Features

- **Authentication:** Secure session-based auth with Better Auth
- **Authorization:** Role-based access control (RBAC)
- **Input Validation:** All inputs validated with Zod schemas
- **SQL Injection:** Protected via Prisma ORM
- **XSS Prevention:** React/Next.js automatic escaping
- **CSRF Protection:** Built into Better Auth
- **Activity Logging:** Complete audit trail
- **Error Handling:** Safe error messages in production
- **Secure Headers:** Configured via Next.js

## Deployment

### Production Build

```bash
npm run build
npm run start
```

### Environment Variables (Production)

Ensure all environment variables are set in your production environment:

- `DATABASE_URL` - Production database connection string
- `BETTER_AUTH_SECRET` - Strong random secret (min 32 chars)
- `BETTER_AUTH_URL` - Production domain URL
- `NEXT_PUBLIC_APP_URL` - Production domain URL
- `NODE_ENV` - Set to "production"

### Recommended Platforms

- **Vercel** - Optimized for Next.js (recommended)
- **Netlify** - Full Next.js support
- **Railway** - Easy deployment with database
- **Docker** - Containerized deployment

### Database

- **Neon DB** - Serverless PostgreSQL (recommended)
- **Supabase** - PostgreSQL with additional features
- **PlanetScale** - MySQL option (requires Prisma schema changes)
- **Self-hosted** - Any PostgreSQL 12+

## Contributing

This is a proprietary project for AI agency use. For questions or issues, contact the development team.

## License

Proprietary - All Rights Reserved

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.

## Roadmap

### Phase 2 (Planned)
- Advanced AI integrations
- Automated meeting transcription
- AI-powered insights and recommendations
- Enhanced reporting and analytics
- Custom dashboards
- Email notifications
- Calendar integrations
- File attachments
- Advanced permissions system

### Future Enhancements
- Mobile app (React Native)
- Real-time collaboration
- Webhook integrations
- API for third-party integrations
- Advanced reporting and exports
- Multi-language support
- Dark mode

---

**Built with ❤️ for AI Agencies**

Last Updated: January 2026
Version: 1.0.0 (Phase 1 Complete)
