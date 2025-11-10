# Realtime Architecture - Server vs Client Component Boundaries

## Problem

We encountered an error: `No QueryClient set, use QueryClientProvider to set one` when the `RealtimeProvider` tried to call `useQueryClient()`.

### Root Cause

The issue stemmed from mixing server and client component boundaries incorrectly:

1. **Dashboard pages are server components** (correct for auth checks and initial data fetching)
2. **RealtimeProvider was wrapping the entire page** from the server component
3. **RealtimeProvider uses React Query hooks** (`useQueryClient()`) that only work in client components
4. Even with `'use client'` directive, the component initialization happens during SSR where there's no QueryClient

```tsx
// ❌ INCORRECT: Wrapping from server component
export default async function StudentDashboard() {
  // ... server-side auth checks ...
  
  return (
    <RealtimeProvider userId={user.id}>  {/* ❌ Tries to initialize on server */}
      {/* dashboard content */}
    </RealtimeProvider>
  )
}
```

## Solution

### Architectural Principle

**Real-time subscriptions should be initialized INSIDE the client component boundary, not wrapping it from a server component.**

### Implementation Pattern

We created dedicated client components that handle real-time subscriptions:

```
┌─────────────────────────────────────────────────┐
│  Server Component (page.tsx)                   │
│  - Auth checks                                  │
│  - Initial data fetching                        │
│  - Role verification                            │
│                                                  │
│  ┌───────────────────────────────────────────┐ │
│  │  Client Component (*DashboardClient.tsx)  │ │
│  │  'use client'                             │ │
│  │                                           │ │
│  │  ┌─────────────────────────────────────┐ │ │
│  │  │  RealtimeProvider                   │ │ │
│  │  │  - useQueryClient() ✅              │ │ │
│  │  │  - Realtime subscriptions           │ │ │
│  │  │                                     │ │ │
│  │  │  {children}                         │ │ │
│  │  └─────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### File Structure

```
app/dashboard/
├── student/
│   ├── page.tsx                       # Server component (auth, data)
│   ├── StudentDashboardClient.tsx     # Client component (realtime)
│   └── calendar/
│       ├── page.tsx                   # Server component (auth)
│       └── StudentCalendarClient.tsx  # Client component (realtime)
└── instructor/
    ├── page.tsx                       # Server component (auth, data)
    ├── InstructorDashboardClient.tsx  # Client component (realtime)
    └── calendar/
        ├── page.tsx                   # Server component (auth, role check)
        └── InstructorCalendarClient.tsx # Client component (realtime)
```

### Code Example

#### Server Component (page.tsx)
```tsx
// ✅ Server component handles auth and structure
export default async function StudentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/auth/login')
  
  return (
    <div className="min-h-screen">
      <header>{/* Static header */}</header>
      
      {/* Client boundary starts here */}
      <StudentDashboardClient userId={user.id}>
        {/* All dashboard content */}
      </StudentDashboardClient>
    </div>
  )
}
```

#### Client Component (*DashboardClient.tsx)
```tsx
'use client'

import { RealtimeProvider } from '@/components/realtime/RealtimeProvider'

// ✅ RealtimeProvider initializes within client boundary
export function StudentDashboardClient({ userId, children }) {
  return (
    <RealtimeProvider userId={userId}>
      {children}
    </RealtimeProvider>
  )
}
```

## Benefits of This Architecture

### 1. **Clear Separation of Concerns**
- Server components: Auth, data fetching, SEO
- Client components: Interactivity, real-time updates, state

### 2. **Performance**
- Server components can be cached and streamed
- Client bundles are smaller (no server-only code)
- Optimal hydration strategy

### 3. **Type Safety**
- Server-only utilities (like Supabase server client) stay on server
- Client-only code (React Query, Realtime) stays on client
- No accidental mixing of contexts

### 4. **Maintainability**
- Easy to identify where real-time logic lives
- Clear patterns for other developers to follow
- Testable in isolation

## Pattern for Other Features

When adding new dashboard features:

1. **Server Component (page.tsx):**
   - Authentication checks
   - Role verification
   - Initial data prefetching (if needed)
   - Static layout/structure

2. **Client Component (*Client.tsx):**
   - Wrap with RealtimeProvider
   - Handle user interactions
   - Manage client-side state
   - Real-time subscriptions

3. **Feature Components:**
   - Use React Query hooks
   - Assume QueryClient is available
   - Focus on feature logic

## Related Files

- `/components/realtime/RealtimeProvider.tsx` - Realtime subscription hooks
- `/lib/queries/provider.tsx` - React Query setup
- `/app/layout.tsx` - Root QueryProvider wrapper
- `/components/booking/BookingFormDialog.tsx` - Dialog component (fixed to properly wrap DialogTrigger)

## Common Pitfalls Fixed

### 1. DialogTrigger Outside Dialog Context
**Problem**: Using `DialogTrigger` without wrapping it in a parent `Dialog` component causes React context errors.

**Solution**:
```tsx
// ❌ Wrong
<>
  <DialogTrigger asChild>{children}</DialogTrigger>
  <SomeContent />
</>

// ✅ Correct
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>{children}</DialogTrigger>
  <SomeContent />
</Dialog>
```

### 2. RealtimeProvider in Server Component
**Problem**: Wrapping content with RealtimeProvider from a server component causes QueryClient initialization errors.

**Solution**: Always wrap in a client component first, then use RealtimeProvider inside that boundary.

## Testing Checklist

When adding new dashboard pages:

- [ ] Server component handles auth
- [ ] Client component wraps content with RealtimeProvider
- [ ] No `useQueryClient()` calls outside client boundary
- [ ] Real-time subscriptions work correctly
- [ ] Page renders without hydration errors
- [ ] No "No QueryClient set" errors in console

