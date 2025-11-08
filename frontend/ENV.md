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

## Setup Instructions

### Local Development
1. Copy `.env.example` to `.env.local`
2. Fill in your Supabase credentials
3. Set `NEXT_PUBLIC_APP_URL=http://localhost:3000`

### Vercel Deployment
1. Go to your Vercel project → Settings → Environment Variables
2. Add all variables above
3. Set `NEXT_PUBLIC_APP_URL` to your production URL
4. Redeploy to apply changes

