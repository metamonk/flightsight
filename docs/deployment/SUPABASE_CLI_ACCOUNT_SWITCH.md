# Switching Supabase CLI Account

## Quick Steps

### 1. Log out of current account
```bash
npx supabase logout
```

### 2. Log in to new account
```bash
npx supabase login
```

This will open your browser to authenticate with your new Supabase account.

### 3. Link to your project
```bash
# Get your project reference from Supabase Dashboard
# Settings → General → Reference ID

npx supabase link --project-ref YOUR_PROJECT_REF
```

### 4. Verify the connection
```bash
npx supabase projects list
```

## Troubleshooting

### If you get "Already logged in"
```bash
# Force logout
npx supabase logout --force

# Or manually remove the access token
rm -rf ~/.supabase
```

### If link fails
```bash
# Check you're in the right directory (should have supabase/config.toml)
ls supabase/config.toml

# Try linking with the database password
npx supabase link --project-ref YOUR_PROJECT_REF --password YOUR_DB_PASSWORD
```

### Check current logged-in account
```bash
# This should show your projects for the logged-in account
npx supabase projects list
```

## Setting Up Environment Variables

After linking, update your frontend/.env.local:

```bash
# Get these from Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-new-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-new-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-new-service-role-key
```

## Deploying Edge Functions to New Project

Once linked, deploy your functions:

```bash
cd supabase

# Deploy all functions
npx supabase functions deploy weather-checker
npx supabase functions deploy ai-rescheduler
npx supabase functions deploy notification-sender
```

## Running Migrations on New Project

```bash
# Push your local migrations to the new project
npx supabase db push

# Or if you want to reset and start fresh
npx supabase db reset
```

## Common Issues

### "Project not found"
- Make sure you copied the correct project reference ID
- Verify you're logged into the right account (npx supabase projects list)

### "Permission denied"
- Your account must have access to the project
- If it's an organization project, make sure you have the right permissions

### "Invalid access token"
- Your session may have expired
- Run: `npx supabase logout` then `npx supabase login` again

