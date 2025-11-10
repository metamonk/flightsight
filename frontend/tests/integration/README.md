# Integration Tests

This directory contains integration tests that verify how multiple components work together in the FlightSight application.

## Overview

Unlike unit tests that test individual components in isolation, integration tests verify:
- Cross-component communication and state synchronization
- End-to-end user workflows
- Data flow through multiple layers (UI → queries → state → UI)
- Real-world interaction scenarios

## Test Structure

### Test Helpers

#### `test-utils.tsx`
Custom render function that wraps components with necessary providers:
- React Query's `QueryClientProvider`
- Test-specific query client configuration (no retries, no caching)

Usage:
```typescript
import { render } from '@/tests/helpers/test-utils'

render(<MyComponent />)
```

#### `mockData.ts`
Centralized mock data for consistent test scenarios:
- Mock users (student, instructor, admin)
- Mock bookings with various statuses
- Mock proposals
- Mock weather conflicts
- Helper functions to create custom mock data

## Test Suites

### 1. Student Dashboard Integration (`StudentDashboard.test.tsx`)

Tests student-facing workflows and component interactions:

#### Weather Alerts and Bookings Integration
- ✅ Displays weather alerts for affected bookings
- ✅ Links weather alerts to specific bookings
- ✅ Shows warning indicators on affected bookings

#### Proposals and Bookings Synchronization
- ✅ Displays proposals related to bookings
- ✅ Updates booking time when proposal is accepted
- ✅ Removes accepted proposals from list
- ✅ Keeps bookings unchanged when proposal is rejected

#### Multi-Component State Synchronization
- ✅ Updates all components when booking is cancelled
- ✅ Removes related proposals when booking is removed
- ✅ Removes related weather alerts when booking is removed

#### Real-time Updates Simulation
- ✅ Handles new weather alert appearing
- ✅ Handles new proposal appearing
- ✅ Updates warning indicators dynamically

### 2. Instructor Dashboard Integration (`InstructorDashboard.test.tsx`)

Tests instructor-facing workflows and component coordination:

#### Gantt View and Bookings List Coordination
- ✅ Displays bookings in both gantt and list views
- ✅ Highlights selected booking in both views
- ✅ Allows drag-and-drop rescheduling in gantt

#### Monthly Overview Widget Integration
- ✅ Displays overview stats from bookings data
- ✅ Updates overview when bookings change
- ✅ Allows navigation to specific date from overview

#### Proposal Creation Flow
- ✅ Creates proposal from booking context menu
- ✅ Shows proposal in instructor proposals list
- ✅ Updates proposal status in real-time

#### Cross-Component State Synchronization
- ✅ Updates all views when booking status changes
- ✅ Handles concurrent updates from multiple users
- ✅ Maintains consistency across gantt, list, and overview

### 3. Weather Conflict Workflow (`WeatherConflictWorkflow.test.tsx`)

Tests end-to-end weather conflict resolution workflows:

#### Complete Weather Alert to Proposal Flow
- ✅ Detects weather conflict
- ✅ Displays alert with severity indicators
- ✅ Shows affected booking warnings
- ✅ Opens weather conflict modal
- ✅ Creates reschedule proposal
- ✅ Updates all views with proposal

#### Proposal Acceptance/Rejection Flow
- ✅ Student accepts proposal
- ✅ Booking time updates across all views
- ✅ Weather conflict resolves with new time
- ✅ Proposal removed from all lists
- ✅ Instructor sees updated state
- ✅ Rejected proposal keeps original booking
- ✅ Weather alert remains for unresolved conflict

#### Multiple Weather Conflicts Management
- ✅ Displays multiple conflicts simultaneously
- ✅ Shows severity-based sorting (high → medium → low)
- ✅ Updates overlay with conflict count
- ✅ Handles new conflicts appearing dynamically

#### Weather Alert Notification and Interaction
- ✅ Allows dismissing low-severity alerts
- ✅ Prevents dismissing high-severity alerts
- ✅ Shows appropriate action buttons by severity

## Running Tests

### Run All Integration Tests
```bash
cd frontend
pnpm test tests/integration
```

### Run Specific Test Suite
```bash
pnpm test StudentDashboard.test
pnpm test InstructorDashboard.test
pnpm test WeatherConflictWorkflow.test
```

### Run with Coverage
```bash
pnpm test:coverage tests/integration
```

### Run with UI (Interactive)
```bash
pnpm test:ui
```

## Mocking Strategy

### Supabase Client
All tests mock the Supabase client to avoid real database calls:
```typescript
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase,
}))
```

### Server Actions
Server actions are mocked to control data flow:
```typescript
vi.mock('@/app/auth/actions')
vi.mock('@/app/booking/actions')
```

### React Query
Tests use a custom query client with:
- `retry: false` - No automatic retries
- `gcTime: 0` - No caching between tests

## Best Practices

### Test Structure
1. **Arrange**: Set up mock data and initial state
2. **Act**: Simulate user interactions
3. **Assert**: Verify expected outcomes across multiple components

### Assertions
- Use `waitFor` for async updates
- Check multiple views to verify synchronization
- Verify both UI state and data state
- Test both success and failure paths

### User Interactions
- Use `userEvent` from `@testing-library/user-event`
- Simulate realistic user actions (click, type, drag)
- Test keyboard navigation where applicable

### Naming Conventions
- Test file: `ComponentName.test.tsx`
- Test suite: `describe('Feature Name', ...)`
- Test case: `it('should do something specific', ...)`

## Common Patterns

### Testing Component Interactions
```typescript
// Component A triggers action
await user.click(buttonInComponentA)

// Verify Component B reflects change
await waitFor(() => {
  expect(screen.getByTestId('component-b-indicator')).toHaveAttribute('data-updated', 'true')
})
```

### Testing State Synchronization
```typescript
// Update data
getBookings.mockResolvedValue({ bookings: updatedBookings, ... })
rerender(<Dashboard />)

// Verify all components show updated data
await waitFor(() => {
  expect(listView).toShowUpdatedData()
  expect(ganttView).toShowUpdatedData()
  expect(overviewWidget).toShowUpdatedData()
})
```

### Testing Real-time Updates
```typescript
// Initial state
render(<Component />)
expect(screen.getByText('Initial')).toBeInTheDocument()

// Simulate external update
mockDataSource.mockResolvedValue(updatedData)
rerender(<Component />)

// Verify update appears
await waitFor(() => {
  expect(screen.getByText('Updated')).toBeInTheDocument()
})
```

## Debugging Tests

### View Test Output
```bash
pnpm test -- --reporter=verbose
```

### Debug Specific Test
```typescript
import { screen } from '@testing-library/react'

// Add to test:
screen.debug() // Prints entire DOM
screen.debug(element) // Prints specific element
```

### Check What Queries Are Available
```typescript
import { logRoles } from '@testing-library/react'

const { container } = render(<Component />)
logRoles(container) // Prints all available roles
```

## Adding New Integration Tests

1. Create test file in `tests/integration/`
2. Import test helpers:
   ```typescript
   import { render } from '@/tests/helpers/test-utils'
   import { mockUsers, mockBookings } from '@/tests/helpers/mockData'
   ```
3. Mock required modules (Supabase, server actions)
4. Write test cases following existing patterns
5. Verify tests pass: `pnpm test YourTest.test`

## Maintenance

### When to Update Tests
- New features added that affect multiple components
- Component interactions change
- Data flow patterns change
- New props or state added to components

### When to Add New Tests
- New user workflows implemented
- New cross-component features
- New real-time synchronization scenarios
- New multi-step processes

## Coverage Goals

Integration tests should cover:
- ✅ All critical user workflows
- ✅ All cross-component state synchronization
- ✅ All data flow patterns
- ✅ All real-time update scenarios
- ✅ All multi-user interaction scenarios

Target: **80%+ coverage** of integration points

