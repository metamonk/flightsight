# Environment Variables

## Required Variables

### Supabase Configuration
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Application URL
```bash
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## Optional Variables

### Authentication Configuration
```bash
# Email Confirmation Toggle
# Set to 'true' if you have email confirmation enabled in Supabase Dashboard
# Set to 'false' if you've disabled email confirmation (instant signup)
# Default: false
NEXT_PUBLIC_REQUIRE_EMAIL_CONFIRMATION=false
```

**Note:** This setting should match your Supabase configuration:
- **Supabase Dashboard** → Authentication → Settings → Email Auth → "Enable email confirmations"

## Role Management

### Role Assignment During Registration
Users can select their role during registration:
- **Student** (default): For student pilots
- **Instructor**: For certified flight instructors
- **Admin**: Cannot be self-assigned (must be set manually)

### Role Storage
- Roles are stored in `public.users.role` column
- Role enum: `'student' | 'instructor' | 'admin'`
- Default role if not specified: `'student'`

### Manually Setting Admin Role
To promote a user to admin:
1. Go to Supabase Dashboard → Table Editor → `users` table
2. Find the user by email
3. Update the `role` column to `'admin'`
4. User must log out and log back in for changes to take effect

For detailed role management documentation, see `/ROLE_MANAGEMENT.md`

## Setup Instructions

### Local Development
1. Copy `.env.example` to `.env.local`
2. Fill in your Supabase credentials
3. Set `NEXT_PUBLIC_APP_URL=http://localhost:3000`
4. Run `pnpm dev` to start development server

### Vercel Deployment
1. Go to your Vercel project → Settings → Environment Variables
2. Add all variables above
3. Set `NEXT_PUBLIC_APP_URL` to your production URL
4. Set `NEXT_PUBLIC_REQUIRE_EMAIL_CONFIRMATION` to match Supabase settings
5. Redeploy to apply changes

## Testing Role Management

### Create Test Accounts
1. Register as student: Use role selector → "Student Pilot"
2. Register as instructor: Use role selector → "Flight Instructor"  
3. Create admin: Register as student, then manually promote via Supabase dashboard

### Verify Redirects
- Student login → `/dashboard/student`
- Instructor login → `/dashboard/instructor`
- Admin login → `/dashboard/admin`

See `/ROLE_MANAGEMENT.md` for comprehensive testing checklist.


