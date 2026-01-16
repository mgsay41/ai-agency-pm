# Phase 3 - Role-Based Authorization System Testing Guide

## Overview

This document provides testing scenarios to verify the Role-Based Authorization System implementation.

---

## Test Setup

### Prerequisites
1. Database with test users for each role:
   - Admin user (role: ADMIN)
   - Sales user (role: SALES)
   - Team Member user (role: TEAM_MEMBER)
2. Sample data:
   - Clients created by Sales user
   - Projects associated with those clients
   - Team members assigned to projects

### Test User Setup Script

```typescript
// Run this in Prisma Studio or create a seed script
// Admin User
{
  email: "admin@test.com",
  name: "Admin User",
  role: "ADMIN",
  isActive: true
}

// Sales User
{
  email: "sales@test.com",
  name: "Sales User",
  role: "SALES",
  isActive: true
}

// Team Member User
{
  email: "member@test.com",
  name: "Team Member",
  role: "TEAM_MEMBER",
  isActive: true
}
```

---

## Test Scenarios

### 1. Client Access Control

#### 1.1 Admin Client Access
**Endpoint:** `GET /api/clients`

**Test Case 1: Admin views all clients**
- Login as: Admin
- Expected: Returns all clients (including deleted if `?includeDeleted=true`)
- Status: 200 OK

**Test Case 2: Admin creates client**
- Login as: Admin
- Endpoint: `POST /api/clients`
- Expected: Client created successfully
- Status: 201 Created

#### 1.2 Sales Client Access
**Test Case 1: Sales views own clients**
- Login as: Sales
- Endpoint: `GET /api/clients`
- Expected: Returns only clients created by this sales user
- Verify: `createdBy` matches sales user ID
- Status: 200 OK

**Test Case 2: Sales creates client**
- Login as: Sales
- Endpoint: `POST /api/clients`
- Expected: Client created with `createdBy` set to sales user ID
- Status: 201 Created

**Test Case 3: Sales cannot see other sales users' clients**
- Login as: Sales User A
- Expected: Response does not include clients created by Sales User B
- Status: 200 OK (but filtered data)

#### 1.3 Team Member Client Access
**Test Case 1: Team member attempts to view clients**
- Login as: Team Member
- Endpoint: `GET /api/clients`
- Expected: 403 Forbidden (insufficient permissions)
- Status: 403

**Test Case 2: Team member attempts to create client**
- Login as: Team Member
- Endpoint: `POST /api/clients`
- Expected: 403 Forbidden
- Status: 403

---

### 2. Project Access Control

#### 2.1 Admin Project Access
**Test Case 1: Admin views all projects with budgets**
- Login as: Admin
- Endpoint: `GET /api/projects`
- Expected: Returns all projects
- Verify: Response includes `budgetAmount` and `estimatedHours`
- Status: 200 OK

**Test Case 2: Admin creates project**
- Login as: Admin
- Endpoint: `POST /api/projects`
- Body: Include `budgetAmount`
- Expected: Project created for any client
- Status: 201 Created

#### 2.2 Sales Project Access
**Test Case 1: Sales views own clients' projects (no budgets)**
- Login as: Sales
- Endpoint: `GET /api/projects`
- Expected: Returns only projects where `client.createdBy` matches sales user
- Verify: Response does NOT include `budgetAmount` or `estimatedHours`
- Status: 200 OK

**Test Case 2: Sales creates project for own client**
- Login as: Sales
- Endpoint: `POST /api/projects`
- Body: `clientId` of client created by this sales user
- Expected: Project created successfully (without budget in response)
- Status: 201 Created

**Test Case 3: Sales attempts to create project for other sales user's client**
- Login as: Sales User A
- Endpoint: `POST /api/projects`
- Body: `clientId` of client created by Sales User B
- Expected: 403 Forbidden
- Error: "You can only create projects for your own clients"
- Status: 403

**Test Case 4: Sales cannot see projects after client soft-delete**
- Setup: Soft-delete a client (set `deletedAt`)
- Login as: Sales (who created the client)
- Endpoint: `GET /api/projects`
- Expected: Projects for soft-deleted client are NOT returned
- Status: 200 OK (but filtered data)

#### 2.3 Team Member Project Access
**Test Case 1: Team member views assigned projects (no budgets)**
- Login as: Team Member
- Endpoint: `GET /api/projects`
- Expected: Returns only projects with active ProjectAssignment for this member
- Verify: Response does NOT include `budgetAmount` or `estimatedHours`
- Status: 200 OK

**Test Case 2: Team member cannot view unassigned projects**
- Login as: Team Member
- Expected: Projects without active assignment are not returned
- Status: 200 OK (but filtered data)

**Test Case 3: Team member attempts to create project**
- Login as: Team Member
- Endpoint: `POST /api/projects`
- Expected: 403 Forbidden
- Status: 403

---

### 3. Profile Access Control

#### 3.1 All Users Can Access Own Profile
**Test Case 1: User views own profile**
- Login as: Any role
- Endpoint: `GET /api/profile`
- Expected: Returns current user's profile
- Status: 200 OK

**Test Case 2: User updates own profile**
- Login as: Any role
- Endpoint: `PATCH /api/profile`
- Body: `{ "name": "Updated Name" }`
- Expected: Profile updated successfully
- Status: 200 OK

**Test Case 3: User cannot update email to existing email**
- Login as: Any role
- Endpoint: `PATCH /api/profile`
- Body: `{ "email": "existing@test.com" }`
- Expected: 409 Conflict
- Error: "Email is already taken"
- Status: 409

---

### 4. Authentication & Authorization Middleware

#### 4.1 Unauthenticated Access
**Test Case 1: Access protected route without session**
- No authentication headers
- Endpoint: Any protected route (e.g., `GET /api/clients`)
- Expected: 401 Unauthorized
- Status: 401

#### 4.2 Inactive User Account
**Test Case 1: Inactive user attempts access**
- Setup: Set user's `isActive` to `false`
- Login as: Inactive user
- Endpoint: Any protected route
- Expected: 403 Forbidden
- Error: "Account is inactive"
- Status: 403

#### 4.3 Invalid Role
**Test Case 1: User with invalid role**
- Setup: Manually set user's role to invalid value (if possible)
- Expected: 403 Forbidden
- Error: "Invalid role"
- Status: 403

---

### 5. Permission System

#### 5.1 Permission Checks
**Test Case 1: Verify ADMIN permissions**
```typescript
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { Role } from '@prisma/client';

const adminRole = Role.ADMIN;
expect(hasPermission(adminRole, PERMISSIONS.CLIENT_VIEW_ALL)).toBe(true);
expect(hasPermission(adminRole, PERMISSIONS.PROJECT_VIEW_BUDGET)).toBe(true);
expect(hasPermission(adminRole, PERMISSIONS.USER_MANAGE)).toBe(true);
```

**Test Case 2: Verify SALES permissions**
```typescript
const salesRole = Role.SALES;
expect(hasPermission(salesRole, PERMISSIONS.CLIENT_VIEW_OWN)).toBe(true);
expect(hasPermission(salesRole, PERMISSIONS.CLIENT_VIEW_ALL)).toBe(false);
expect(hasPermission(salesRole, PERMISSIONS.PROJECT_VIEW_BUDGET)).toBe(false);
```

**Test Case 3: Verify TEAM_MEMBER permissions**
```typescript
const memberRole = Role.TEAM_MEMBER;
expect(hasPermission(memberRole, PERMISSIONS.PROJECT_VIEW_ASSIGNED)).toBe(true);
expect(hasPermission(memberRole, PERMISSIONS.CLIENT_VIEW_OWN)).toBe(false);
expect(hasPermission(memberRole, PERMISSIONS.PROJECT_CREATE)).toBe(false);
```

#### 5.2 Resource Ownership Checks
**Test Case 1: Client ownership**
```typescript
import { isClientOwner, canAccessClient } from '@/lib/resource-ownership';

const isOwner = await isClientOwner(userId, clientId);
expect(isOwner).toBe(true); // for creator

const client = await canAccessClient(userId, clientId, userRole);
expect(client).not.toBeNull(); // if has access
```

---

### 6. Activity Logging

#### 6.1 Authorization Failure Logging
**Test Case 1: Failed authorization is logged**
- Setup: Attempt unauthorized action (e.g., Team Member accessing clients)
- Expected: Entry in `ActivityLog` table with:
  - `entityType: "authorization"`
  - `action: "authorization_failure"`
  - `changes`: Contains method, endpoint, reason
- Verify in database after failed attempt

**Test Case 2: Successful actions are logged**
- Setup: Create a client as Sales user
- Expected: Entry in `ActivityLog` table with:
  - `entityType: "client"`
  - `action: "created"`
  - `userId`: Sales user ID

---

### 7. Edge Cases

#### 7.1 Soft Delete Cascade
**Test Case 1: Projects hidden after client soft-delete**
- Setup:
  1. Sales user creates client and project
  2. Soft-delete client (set `deletedAt`)
- Login as: Same sales user
- Endpoint: `GET /api/projects`
- Expected: Project for soft-deleted client is NOT returned
- Status: 200 OK

#### 7.2 Budget Field Removal
**Test Case 1: Budget fields removed for non-admins**
- Login as: Sales or Team Member
- Endpoint: `GET /api/projects` or `POST /api/projects`
- Expected: Response does not contain `budgetAmount` or `estimatedHours`
- Verify: `JSON.stringify(response)` does not include these fields

#### 7.3 Cross-User Data Isolation
**Test Case 1: Sales user A cannot access Sales user B's clients**
- Setup: Two sales users with separate clients
- Login as: Sales User A
- Endpoint: `GET /api/clients`
- Expected: Only returns clients created by Sales User A
- Verify: No clients from Sales User B in response

---

## Manual Testing Checklist

Use this checklist to verify the authorization system:

### Client Endpoints
- [ ] Admin can view all clients
- [ ] Admin can create clients
- [ ] Sales can view only own clients
- [ ] Sales can create clients
- [ ] Team Member is forbidden from client access

### Project Endpoints
- [ ] Admin sees all projects with budgets
- [ ] Sales sees only own clients' projects (no budgets)
- [ ] Sales cannot create projects for other users' clients
- [ ] Team Member sees only assigned projects (no budgets)
- [ ] Team Member cannot create projects
- [ ] Projects for soft-deleted clients are hidden from Sales

### Profile Endpoints
- [ ] All users can view/edit own profile
- [ ] Email uniqueness is enforced

### Authorization Middleware
- [ ] Unauthenticated requests return 401
- [ ] Inactive users return 403
- [ ] Failed authorization is logged to ActivityLog

### Permission System
- [ ] Role-to-permission mapping is correct
- [ ] Permission checks work for all roles
- [ ] Resource ownership verification works

---

## API Testing with cURL/Postman

### Example cURL Commands

**Get Clients (Admin)**
```bash
curl -X GET http://localhost:3000/api/clients \
  -H "Cookie: better-auth.session_token=YOUR_SESSION_TOKEN"
```

**Create Client (Sales)**
```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=YOUR_SESSION_TOKEN" \
  -d '{
    "companyName": "Test Company",
    "clientType": "COMPANY",
    "industry": "Technology",
    "billingAddress": "123 Main St",
    "isActive": true
  }'
```

**Get Projects (Team Member)**
```bash
curl -X GET http://localhost:3000/api/projects \
  -H "Cookie: better-auth.session_token=YOUR_SESSION_TOKEN"
```

---

## Expected Outcomes

### Success Criteria
✅ All role-based restrictions are enforced
✅ Budget information is hidden from non-admins
✅ Resource ownership is verified correctly
✅ Authorization failures are logged
✅ Soft-deleted client cascade works
✅ Inactive users are blocked
✅ Cross-user data isolation works

### Known Limitations
- Phase 1 is manual data entry only - no automated role assignment UI yet
- Meeting and Action Item endpoints not yet implemented
- Team management endpoints not yet implemented

---

## Testing Tools

### Recommended Tools
1. **Postman/Thunder Client**: For API endpoint testing
2. **Prisma Studio**: For database inspection
3. **Browser DevTools**: For session token inspection
4. **ActivityLog table**: For verifying authorization logging

### Session Token Location
Better Auth stores session tokens in cookies:
- Cookie name: `better-auth.session_token`
- Can be found in browser DevTools > Application > Cookies

---

## Troubleshooting

### Common Issues

**Issue: 401 Unauthorized**
- Check: Session token is valid and not expired
- Verify: Cookie is being sent with request
- Fix: Re-login to get fresh session

**Issue: 403 Forbidden**
- Check: User role matches required role
- Verify: User account is active (`isActive: true`)
- Check: Permission system for specific resource

**Issue: Budget fields still visible**
- Check: Response transformation logic in API route
- Verify: `canViewBudget()` check is called
- Debug: Log response before sending

**Issue: Soft-deleted client projects still visible**
- Check: `deletedAt` field is set on client
- Verify: Query includes `deletedAt: null` filter for Sales
- Debug: Log WHERE clause in query

---

## Next Steps After Testing

Once all tests pass:
1. ✅ Commit authorization system to git
2. Move to Phase 4: Implement Meeting and Action endpoints
3. Add role-based UI restrictions in components
4. Create user management endpoints for Admin

---

## Test Results Log

Document your test results here:

| Test Case | Date | Tester | Result | Notes |
|-----------|------|--------|--------|-------|
| Admin views all clients | | | ⬜ Pass / ❌ Fail | |
| Sales views own clients | | | ⬜ Pass / ❌ Fail | |
| Team member forbidden clients | | | ⬜ Pass / ❌ Fail | |
| Admin sees project budgets | | | ⬜ Pass / ❌ Fail | |
| Sales no project budgets | | | ⬜ Pass / ❌ Fail | |
| Team member assigned projects | | | ⬜ Pass / ❌ Fail | |
| Soft-delete cascade | | | ⬜ Pass / ❌ Fail | |
| Authorization logging | | | ⬜ Pass / ❌ Fail | |

---

**Phase 3 Status: Implementation Complete ✅**
**Testing Status: Ready for Manual Testing ⏳**
