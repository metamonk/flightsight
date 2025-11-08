# FlightSight Frontend

AI-Powered Flight Lesson Weather Rescheduling - Next.js Application

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5.9
- **Styling:** Tailwind CSS v4 (NO config file!)
- **State Management:** Zustand
- **Data Fetching:** TanStack React Query
- **Backend:** Supabase (Auth, Database, Realtime)
- **Date Utilities:** date-fns

## Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── auth/                     # Authentication pages
│   ├── dashboard/                # Dashboard pages (student/instructor/admin)
│   │   ├── student/             # Student dashboard
│   │   ├── instructor/          # Instructor dashboard
│   │   └── admin/               # Admin dashboard
│   ├── api/                      # API routes
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles (Tailwind v4)
│
├── components/                   # React components
│   ├── booking/                  # Booking-related components
│   ├── weather/                  # Weather display components
│   ├── proposals/                # AI proposal components
│   ├── shared/                   # Shared/common components
│   └── realtime/                 # Realtime subscription components
│
├── lib/                          # Core utilities and configuration
│   ├── supabase/                 # Supabase client setup
│   │   ├── client.ts            # Browser client
│   │   ├── server.ts            # Server client
│   │   └── middleware.ts        # Auth middleware
│   ├── queries/                  # React Query setup
│   │   └── provider.tsx         # Query provider
│   ├── state/                    # Zustand stores
│   │   └── store.ts             # Global state management
│   ├── types/                    # TypeScript types
│   │   └── database.types.ts    # Supabase generated types
│   └── utils/                    # Utility functions
│
├── hooks/                        # Custom React hooks
├── middleware.ts                 # Next.js middleware (auth)
└── .env.local                    # Environment variables (create from .env.local)
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+ (enforced)
- Supabase project credentials

### Installation

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   Copy the provided `.env.local` file and add your Supabase credentials:
   ```bash
   # Copy from parent project's .env file:
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Generate TypeScript types from Supabase:**
   ```bash
   npx supabase gen types typescript --project-id YOUR_PROJECT_REF > lib/types/database.types.ts
   ```

### Development

```bash
# Start development server (with Turbopack)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

## Key Features

### ✅ Implemented (Task 7.1 & 7.2)

- ✅ Next.js 16 with App Router
- ✅ TypeScript 5.9 configured
- ✅ Tailwind CSS v4 (NO config file!)
- ✅ Supabase client setup (browser, server, middleware)
- ✅ React Query provider with devtools
- ✅ Zustand state management
- ✅ Project structure created
- ✅ Build verification passed

### 🚧 TODO (Upcoming Tasks)

- [ ] Authentication pages (login, register)
- [ ] Student dashboard
- [ ] Instructor dashboard
- [ ] Admin dashboard
- [ ] Booking calendar component
- [ ] Weather alert components
- [ ] AI proposal cards
- [ ] Realtime subscriptions
- [ ] API routes for data fetching

## Important Notes

### Tailwind CSS v4

This project uses Tailwind CSS v4, which **does NOT use a tailwind.config.js file**.

- Styles are imported via `@import "tailwindcss"` in `globals.css`
- Theme customization uses `@theme inline` blocks
- PostCSS plugin: `@tailwindcss/postcss`

### Package Manager

This project uses **pnpm exclusively**. Do not use npm or yarn.

- Lock file: `pnpm-lock.yaml`
- Enforced in `package.json` via `packageManager` field

### Authentication Flow

- Middleware handles auth token refresh
- Protected routes redirect to `/auth/login`
- Session management via cookies (SSR-compatible)
- Supabase Auth with email/password

## Environment Variables

See `.env.local` file for required variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key

(Copy from parent `.env` file)

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://docs.pmnd.rs/zustand)
