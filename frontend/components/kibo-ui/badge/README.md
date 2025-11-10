# Badge Component

A versatile Badge component for FlightSight that provides status indicators with optional pulse animations and dot indicators. Built with TypeScript and fully accessible (WCAG 2.1 AA compliant).

## Overview

The Badge component is perfect for displaying status indicators, labels, counts, and other metadata throughout your application. It includes several variants with pulse animations for drawing attention to dynamic status changes.

## Installation

The component is already part of the Kibo UI component library:

```tsx
import {
  Badge,
  BadgePulse,
  BadgeDot,
  BadgeGroup,
} from '@/components/kibo-ui/badge'
```

## Basic Usage

### Simple Badge

```tsx
<Badge>Default Badge</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Error</Badge>
```

### Status Badges

```tsx
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="info">Information</Badge>
```

### Badge with Icon

```tsx
<Badge>
  <CheckCircle className="mr-1 h-3 w-3" />
  Completed
</Badge>
```

## Badge Variants

### BadgePulse

Badge with continuous pulsing animation - ideal for drawing attention to active status:

```tsx
<BadgePulse variant="success">
  System Online
</BadgePulse>

<BadgePulse variant="warning">
  Action Required
</BadgePulse>

<BadgePulse variant="destructive">
  Critical Alert
</BadgePulse>
```

**Use Cases:**
- Active system status
- Pending notifications
- Real-time updates
- Critical alerts

### BadgeDot

Badge with a dot indicator, optionally with pulse animation:

```tsx
{/* Static dot */}
<BadgeDot variant="success">
  Available
</BadgeDot>

{/* Pulsing dot */}
<BadgeDot variant="success" withPulse>
  Live
</BadgeDot>

{/* Different statuses */}
<BadgeDot variant="destructive" withPulse>
  Offline
</BadgeDot>

<BadgeDot variant="warning">
  Away
</BadgeDot>

<BadgeDot variant="info">
  Busy
</BadgeDot>
```

**Use Cases:**
- User online/offline status
- System availability
- Connection status
- Activity indicators

### BadgeGroup

Container for multiple related badges with consistent spacing:

```tsx
<BadgeGroup>
  <Badge>JavaScript</Badge>
  <Badge>TypeScript</Badge>
  <Badge>React</Badge>
</BadgeGroup>

{/* Custom spacing */}
<BadgeGroup spacing="lg">
  <BadgeDot variant="success" withPulse>Active</BadgeDot>
  <BadgeDot variant="warning">Pending</BadgeDot>
  <BadgeDot variant="destructive">Error</BadgeDot>
</BadgeGroup>
```

**Spacing Options:**
- `xs` - 4px gap
- `sm` - 8px gap (default)
- `md` - 12px gap
- `lg` - 16px gap

## Complete Examples

### Flight Status Indicator

```tsx
<Card>
  <CardContent className="flex items-center justify-between">
    <div>
      <h3 className="font-semibold">Cessna 172 - N12345</h3>
      <p className="text-sm text-muted-foreground">Last inspection: 2 days ago</p>
    </div>
    <BadgeDot variant="success" withPulse>
      Available
    </BadgeDot>
  </CardContent>
</Card>
```

### System Status Dashboard

```tsx
<div className="grid gap-4">
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium">Weather Monitoring</span>
    <BadgePulse variant="success">Active</BadgePulse>
  </div>
  
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium">Booking System</span>
    <BadgePulse variant="success">Active</BadgePulse>
  </div>
  
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium">API Gateway</span>
    <BadgePulse variant="warning">Degraded</BadgePulse>
  </div>
</div>
```

### User Presence

```tsx
<div className="flex items-center gap-3">
  <Avatar>
    <AvatarImage src="/avatar.jpg" alt="John Doe" />
    <AvatarFallback>JD</AvatarFallback>
  </Avatar>
  <div>
    <p className="font-semibold">John Doe</p>
    <BadgeDot variant="success" withPulse>
      Online
    </BadgeDot>
  </div>
</div>
```

### Booking Status

```tsx
<BadgeGroup>
  {booking.status === 'confirmed' && (
    <Badge variant="success">Confirmed</Badge>
  )}
  {booking.isPaid && (
    <Badge variant="info">Paid</Badge>
  )}
  {booking.isRecurring && (
    <Badge variant="secondary">Recurring</Badge>
  )}
</BadgeGroup>
```

### Notification Counter

```tsx
<Button variant="ghost" size="icon">
  <Bell className="h-5 w-5" />
  <Badge 
    className="absolute -right-1 -top-1 h-5 w-5 p-0"
    variant="destructive"
  >
    3
  </Badge>
</Button>
```

## Variant Colors

### default (Primary)
- Light: Blue background with white text
- Use for: Primary actions, main status

### secondary
- Light: Gray background with dark text
- Use for: Less important information, tags

### destructive
- Light: Red background with white text
- Use for: Errors, critical alerts, deletions

### outline
- Light: Transparent with border
- Use for: Subtle labels, categories

### success
- Light: Green background with white text
- Use for: Success states, confirmations, active status

### warning
- Light: Yellow/Orange background with dark text
- Use for: Warnings, pending actions, attention needed

### info
- Light: Blue background with white text
- Use for: Information, help, neutral status

## Accessibility

The Badge component is fully accessible and WCAG 2.1 AA compliant:

### Screen Readers

All components support ARIA attributes:

```tsx
<Badge aria-label="5 unread notifications">
  5
</Badge>

<BadgeDot 
  variant="success" 
  withPulse
  aria-label="User is online"
>
  Online
</BadgeDot>
```

### Animation Considerations

Pulsing animations respect `prefers-reduced-motion`:

```tsx
{/* Animation automatically disabled for users who prefer reduced motion */}
<BadgePulse variant="success">Active</BadgePulse>
```

### Color Contrast

All badge variants meet WCAG AA contrast requirements:
- Text contrast: 4.5:1 minimum
- UI components: 3:1 minimum

### Focus Management

Badges can be made focusable when interactive:

```tsx
<Badge
  asChild
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  <button>Interactive Badge</button>
</Badge>
```

## Component Props

### Badge

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'secondary' \| 'destructive' \| 'outline' \| 'success' \| 'warning' \| 'info'` | `'default'` | Visual style variant |
| `asChild` | `boolean` | `false` | Render as child component using Radix Slot |
| `className` | `string` | - | Additional CSS classes |
| `...props` | `React.ComponentProps<'span'>` | - | All span props |

### BadgePulse

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | Same as Badge | `'default'` | Visual style variant |
| `className` | `string` | - | Additional CSS classes |
| `...props` | `React.ComponentProps<'span'>` | - | All span props |

### BadgeDot

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | Same as Badge | `'default'` | Visual style variant |
| `withPulse` | `boolean` | `false` | Enable pulsing animation on dot |
| `asChild` | `boolean` | `false` | Render as child component |
| `className` | `string` | - | Additional CSS classes |
| `...props` | `React.ComponentProps<'span'>` | - | All span props |

### BadgeGroup

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `spacing` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'sm'` | Spacing between badges |
| `className` | `string` | - | Additional CSS classes |
| `...props` | `React.ComponentProps<'div'>` | - | All div props |

## Styling

### Custom Styles

Add custom styles via className:

```tsx
<Badge className="text-base px-4 py-1">
  Large Badge
</Badge>

<Badge className="rounded-sm">
  Square Badge
</Badge>
```

### Theme Variables

The component uses CSS custom properties:

```css
:root {
  --primary: oklch(0.55 0.22 220);
  --destructive: oklch(0.60 0.20 25);
  --success: oklch(0.60 0.16 145);
  --warning: oklch(0.75 0.15 85);
  --info: oklch(0.55 0.15 220);
}
```

## Best Practices

### Use Appropriate Variants

```tsx
// ✅ Good: Semantic variant usage
<BadgeDot variant="success" withPulse>Available</BadgeDot>
<BadgeDot variant="destructive">Offline</BadgeDot>
<Badge variant="warning">Pending Review</Badge>

// ❌ Bad: Confusing variant usage
<Badge variant="success">Error</Badge>
<Badge variant="destructive">Success</Badge>
```

### Don't Overuse Animations

```tsx
// ✅ Good: Pulse for important status
<BadgePulse variant="destructive">Critical Alert</BadgePulse>

// ❌ Bad: Too many pulsing badges
<div>
  <BadgePulse>Item 1</BadgePulse>
  <BadgePulse>Item 2</BadgePulse>
  <BadgePulse>Item 3</BadgePulse>
  <BadgePulse>Item 4</BadgePulse>
</div>
```

### Provide Accessible Labels

```tsx
// ✅ Good: Clear labels
<BadgeDot variant="success" withPulse aria-label="User is currently online">
  Online
</BadgeDot>

// ✅ Good: Icon with text
<Badge aria-label="5 unread messages">
  <Mail className="mr-1 h-3 w-3" />
  5
</Badge>

// ❌ Bad: Icon only without label
<Badge>
  <AlertTriangle className="h-3 w-3" />
</Badge>
```

### Group Related Badges

```tsx
// ✅ Good: Using BadgeGroup
<BadgeGroup>
  <Badge>React</Badge>
  <Badge>TypeScript</Badge>
  <Badge>Tailwind</Badge>
</BadgeGroup>

// ❌ Bad: Manual spacing
<div className="flex gap-2">
  <Badge>React</Badge>
  <Badge>TypeScript</Badge>
  <Badge>Tailwind</Badge>
</div>
```

## Testing

The component includes comprehensive test coverage:

- ✅ Unit tests for all variants
- ✅ Accessibility tests (WCAG 2.1 AA)
- ✅ Animation tests
- ✅ Interaction tests

Run tests:

```bash
pnpm test -- tests/components/kibo-ui/Badge.test.tsx
```

## Related Components

- `Card` - Container for badges in status displays
- `Avatar` - Often used with BadgeDot for presence indicators
- `Button` - Can contain badges for counters
- `Table` - Status badges in data tables

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- iOS Safari (latest 2 versions)
- Android Chrome (latest 2 versions)

## Performance

The component is optimized for performance:
- CSS-only animations (no JavaScript)
- Minimal re-renders with React.useMemo
- Tree-shakeable exports
- Small bundle size

## Migration from shadcn Badge

The API is 100% compatible with shadcn, so you can use it as a drop-in replacement:

```tsx
// Old (shadcn)
import { Badge } from '@/components/ui/badge'

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>

// New (Kibo UI) - Same API!
import { Badge } from '@/components/kibo-ui/badge'

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>

// With optional new features
<BadgePulse variant="success">Active</BadgePulse>
<BadgeDot variant="success" withPulse>Online</BadgeDot>
```

## License

Part of the FlightSight project.

