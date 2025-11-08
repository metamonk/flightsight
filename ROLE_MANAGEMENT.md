# Role Management System

## Overview

FlightSight implements a comprehensive role-based access control (RBAC) system with three distinct user roles: **Student**, **Instructor**, and **Admin**. Each role has specific permissions, dashboard access, and visual indicators throughout the application.

---

## User Roles

### 🎓 Student
- **Primary Users**: Student pilots learning to fly
- **Dashboard**: `/dashboard/student`
- **Permissions**:
  - View own bookings and flight schedule
  - Receive weather alerts for scheduled lessons
  - Review and respond to AI-generated reschedule proposals
  - Book new lessons with available instructors
- **Badge Color**: Blue (`bg-blue-100`)

### 👨‍✈️ Instructor
- **Primary Users**: Certified flight instructors
- **Dashboard**: `/dashboard/instructor`
- **Permissions**:
  - View all bookings where they are the instructor
  - Manage availability calendar
  - Review and respond to student reschedule proposals
  - Receive weather alerts for scheduled lessons
  - View student information for their lessons
- **Badge Color**: Purple (`bg-purple-100`)

### ⚙️ Admin
- **Primary Users**: System administrators
- **Dashboard**: `/dashboard/admin`
- **Permissions**:
  - Full system access and oversight
  - View all bookings, conflicts, and proposals
  - Access system-wide analytics and metrics
  - Monitor instructor and student activity
  - Manage users (requires manual database access currently)
- **Badge Color**: Orange (`bg-orange-100`)

---

## Role Assignment

### Registration Flow

1. **User Registration** (`/auth/register`)
   - New users can select their role during registration
   - Dropdown selector: "Student Pilot" or "Flight Instructor"
   - Admin role cannot be self-assigned (security measure)

2. **Role Storage**
   - Role stored in `auth.users` metadata during signup
   - Synced to `public.users` table via database trigger
   - Default role: `student` if not specified

3. **Admin Role Assignment**
   - Must be manually assigned via Supabase dashboard
   - Update `public.users.role` to `'admin'`
   - Consider implementing admin approval workflow in future

---

## Authentication & Redirects

### Login Flow

```typescript
// File: frontend/app/auth/actions.ts

1. User submits login credentials
2. Supabase authenticates user
3. Query user role from database: 
   SELECT role FROM users WHERE id = user.id
4. Redirect based on role:
   - admin → /dashboard/admin
   - instructor → /dashboard/instructor
   - student → /dashboard/student
```

### Auth Callback

```typescript
// File: frontend/app/auth/callback/route.ts

1. Handle OAuth/email confirmation callback
2. Exchange code for session
3. Query user role from database
4. Redirect to appropriate dashboard
```

### Dashboard Access Control

Each dashboard implements server-side role verification:

```typescript
// Example: frontend/app/dashboard/instructor/page.tsx

1. Verify user is authenticated
2. Query user role from database
3. Check if role matches dashboard:
   - If role !== 'instructor' → redirect to correct dashboard
4. Render dashboard if authorized
```

**Security Pattern:**
- ✅ Admin dashboard: Checks role, redirects non-admins
- ✅ Instructor dashboard: Checks role, redirects non-instructors  
- ✅ Student dashboard: Checks role, redirects admins/instructors
- All checks happen server-side before rendering

---

## Visual Indicators

### RoleBadge Component

Location: `frontend/components/shared/RoleBadge.tsx`

**Usage:**
```tsx
import { RoleBadge } from '@/components/shared/RoleBadge'

<RoleBadge role="student" size="sm" />
<RoleBadge role="instructor" />
<RoleBadge role="admin" size="lg" />
```

**Props:**
- `role`: 'student' | 'instructor' | 'admin' (required)
- `size`: 'sm' | 'default' | 'lg' (optional, default: 'default')
- `className`: Additional CSS classes (optional)

**Styling:**
- Student: Blue badge with 🎓 emoji
- Instructor: Purple badge with 👨‍✈️ emoji
- Admin: Orange badge with ⚙️ emoji
- Full dark mode support
- Accessible color contrast ratios

**Integration:**
- Displayed in all dashboard headers next to title
- Visible immediately upon login
- Updates automatically if role changes

---

## Database Schema

### Users Table

```sql
-- File: supabase/migrations/20250107000000_initial_schema.sql

CREATE TYPE user_role AS ENUM ('student', 'instructor', 'admin');

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  training_level training_level,
  -- ... other fields
);
```

### Row Level Security (RLS)

```sql
-- Users can view their own profile
CREATE POLICY "users_select_own"
  ON public.users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Authenticated users can view all profiles (needed for bookings)
CREATE POLICY "users_select_authenticated"
  ON public.users FOR SELECT
  TO authenticated
  USING (true);
```

---

## Testing Role Management

### Manual Testing Checklist

#### Registration & Login
- [ ] Register as student → verify redirect to student dashboard
- [ ] Register as instructor → verify redirect to instructor dashboard
- [ ] Login with existing student → verify correct redirect
- [ ] Login with existing instructor → verify correct redirect
- [ ] Login with admin → verify redirect to admin dashboard

#### Dashboard Access Control
- [ ] Student tries to access `/dashboard/instructor` → redirected to `/dashboard/student`
- [ ] Student tries to access `/dashboard/admin` → redirected to `/dashboard/student`
- [ ] Instructor tries to access `/dashboard/student` → redirected to `/dashboard/instructor`
- [ ] Instructor tries to access `/dashboard/admin` → redirected to `/dashboard/instructor`
- [ ] Admin can access all dashboards → stays on admin dashboard

#### Visual Indicators
- [ ] Student dashboard shows blue "Student" badge
- [ ] Instructor dashboard shows purple "Instructor" badge
- [ ] Admin dashboard shows orange "Admin" badge
- [ ] Badges visible in dark mode with proper contrast

#### Auth Callback
- [ ] Email confirmation → redirects to correct dashboard
- [ ] OAuth callback → redirects to correct dashboard

---

## Future Enhancements

### Planned Features
1. **Admin Approval Workflow**
   - Instructors register with "pending" status
   - Admins review and approve instructor accounts
   - Email notifications for approval/rejection

2. **Role Change Audit Log**
   - Track when user roles are modified
   - Record who made the change
   - Display in admin dashboard

3. **Role Permissions Matrix**
   - Granular permissions beyond role
   - Feature flags per user
   - Custom permission groups

4. **Multi-Role Support**
   - Users can have multiple roles (e.g., instructor + admin)
   - Context switching between roles
   - Role selection dropdown in header

---

## Troubleshooting

### Common Issues

**Q: User registered but showing wrong role**
- Check `public.users.role` in Supabase dashboard
- Verify auth metadata: `auth.users.raw_user_meta_data.role`
- May need to manually sync if trigger failed

**Q: User stuck in redirect loop**
- Check server logs for errors
- Verify RLS policies allow role query
- Check if user exists in `public.users` table

**Q: Role badge not displaying**
- Verify RoleBadge component imported correctly
- Check if role is being queried from database
- Inspect browser console for errors

**Q: Admin can't access admin dashboard**
- Verify role is exactly `'admin'` (not 'Admin' or 'ADMIN')
- Check RLS policies aren't blocking query
- Clear browser cache and re-login

---

## Code References

### Key Files
- `frontend/app/auth/actions.ts` - Login/signup with role handling
- `frontend/app/auth/register/RegisterForm.tsx` - Role selection UI
- `frontend/app/auth/callback/route.ts` - OAuth callback redirects
- `frontend/components/shared/RoleBadge.tsx` - Role indicator component
- `frontend/app/dashboard/student/page.tsx` - Student dashboard with security
- `frontend/app/dashboard/instructor/page.tsx` - Instructor dashboard with security
- `frontend/app/dashboard/admin/page.tsx` - Admin dashboard with security
- `supabase/migrations/20250107000000_initial_schema.sql` - Role enum and users table

### Environment Variables
See `ENV.md` for authentication-related environment variables.

---

## Security Considerations

### Best Practices
✅ **Server-side verification**: All role checks happen server-side  
✅ **RLS policies**: Database-level access control  
✅ **Admin protection**: Admin role cannot be self-assigned  
✅ **Consistent redirects**: Unauthorized access redirects appropriately  

### Known Limitations
⚠️ **No audit logging**: Role changes not tracked  
⚠️ **No approval workflow**: Instructors can self-register  
⚠️ **No permission granularity**: Role is all-or-nothing  

---

**Last Updated**: November 8, 2025  
**Version**: 1.0.0  
**Maintainer**: FlightSight Development Team

