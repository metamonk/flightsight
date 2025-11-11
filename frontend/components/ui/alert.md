# Alert Component

A flexible alert component for displaying important messages with different variants and optional icons.

## Features

- Multiple variants (default, destructive, warning, hud)
- Optional icon support
- Title and description composition
- Fully accessible with `role="alert"`
- Dark mode support
- Semantic HTML structure

## Usage

### Basic Example

```tsx
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

function MyComponent() {
  return (
    <Alert>
      <InfoIcon />
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>
        This is an important message for you to know.
      </AlertDescription>
    </Alert>
  )
}
```

### Destructive Alert

```tsx
<Alert variant="destructive">
  <AlertCircleIcon />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Your session has expired. Please log in again.
  </AlertDescription>
</Alert>
```

### Warning Alert

```tsx
<Alert variant="warning">
  <AlertTriangleIcon />
  <AlertTitle>Warning</AlertTitle>
  <AlertDescription>
    This action cannot be undone. Please proceed with caution.
  </AlertDescription>
</Alert>
```

### HUD Style Alert

```tsx
<Alert variant="hud">
  <CheckCircleIcon />
  <AlertTitle>Success</AlertTitle>
  <AlertDescription>
    Your changes have been saved successfully.
  </AlertDescription>
</Alert>
```

### Without Icon

```tsx
<Alert>
  <AlertTitle>Note</AlertTitle>
  <AlertDescription>
    You can use alerts without icons too!
  </AlertDescription>
</Alert>
```

### Title Only

```tsx
<Alert variant="hud">
  <CheckCircleIcon />
  <AlertTitle>Operation completed successfully</AlertTitle>
</Alert>
```

### Description Only

```tsx
<Alert>
  <InfoIcon />
  <AlertDescription>
    This is a simple informational message.
  </AlertDescription>
</Alert>
```

## Props

### Alert

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"default" \| "destructive" \| "warning" \| "hud"` | `"default"` | Visual style variant of the alert |
| `className` | `string` | `undefined` | Additional CSS classes |
| `children` | `React.ReactNode` | - | Alert content (icon, title, description) |
| ...props | `React.ComponentProps<"div">` | - | All standard div props are supported |

### AlertTitle

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `undefined` | Additional CSS classes |
| `children` | `React.ReactNode` | - | Title content |
| ...props | `React.ComponentProps<"div">` | - | All standard div props are supported |

### AlertDescription

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `undefined` | Additional CSS classes |
| `children` | `React.ReactNode` | - | Description content |
| ...props | `React.ComponentProps<"div">` | - | All standard div props are supported |

## Variants

### default
- Background: Card background
- Text: Card foreground
- Use for: General informational messages

### destructive
- Background: Card background
- Text: Destructive color
- Use for: Errors, critical warnings, failed operations

### warning
- Background: Orange tinted
- Border: Orange
- Use for: Warnings, cautions, important notices

### hud
- Background: Primary color tinted
- Border: Primary color
- Use for: Success messages, confirmations, highlights

## Accessibility

The Alert component follows accessibility best practices:

- **ARIA Role**: Uses `role="alert"` for screen reader announcements
- **Semantic Structure**: Proper heading hierarchy with AlertTitle
- **Keyboard Navigation**: Fully accessible via keyboard
- **Color Contrast**: All variants meet WCAG AA contrast requirements
- **Icon Support**: Icons are decorative and properly marked for screen readers

### Screen Reader Behavior

When an alert appears on the page:
- Screen readers will automatically announce the content due to `role="alert"`
- The AlertTitle is announced first, followed by AlertDescription
- Icons are decorative and hidden from screen readers

## Design Patterns

### With Icons

Always place the icon as the first child for consistent layout:

```tsx
<Alert variant="destructive">
  <XCircleIcon />  {/* Icon first */}
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>...</AlertDescription>
</Alert>
```

### Multiple Paragraphs

AlertDescription supports multiple paragraphs:

```tsx
<Alert>
  <InfoIcon />
  <AlertTitle>Important Update</AlertTitle>
  <AlertDescription>
    <p>The system will be undergoing maintenance.</p>
    <p>Please save your work before 5 PM.</p>
  </AlertDescription>
</Alert>
```

### With Actions

Add interactive elements inside the AlertDescription:

```tsx
<Alert>
  <InfoIcon />
  <AlertTitle>New Features Available</AlertTitle>
  <AlertDescription>
    <p>Check out the latest updates to improve your workflow.</p>
    <Button variant="link" className="h-auto p-0">
      Learn more
    </Button>
  </AlertDescription>
</Alert>
```

## Examples

### Form Validation Error

```tsx
<Alert variant="destructive">
  <AlertCircleIcon />
  <AlertTitle>Validation Error</AlertTitle>
  <AlertDescription>
    <ul className="list-disc list-inside">
      <li>Email is required</li>
      <li>Password must be at least 8 characters</li>
    </ul>
  </AlertDescription>
</Alert>
```

### Success Notification

```tsx
<Alert variant="hud">
  <CheckCircleIcon />
  <AlertTitle>Profile Updated</AlertTitle>
  <AlertDescription>
    Your profile information has been successfully updated.
  </AlertDescription>
</Alert>
```

### Warning Before Destructive Action

```tsx
<Alert variant="warning">
  <AlertTriangleIcon />
  <AlertTitle>Are you sure?</AlertTitle>
  <AlertDescription>
    <p>This will permanently delete your account and all associated data.</p>
    <div className="mt-2 flex gap-2">
      <Button variant="destructive" size="sm">Delete Account</Button>
      <Button variant="outline" size="sm">Cancel</Button>
    </div>
  </AlertDescription>
</Alert>
```

### System Status

```tsx
<Alert>
  <ServerIcon />
  <AlertTitle>System Status</AlertTitle>
  <AlertDescription>
    All systems operational. Last checked: {new Date().toLocaleTimeString()}
  </AlertDescription>
</Alert>
```

### Network Error

```tsx
<Alert variant="destructive">
  <WifiOffIcon />
  <AlertTitle>Connection Lost</AlertTitle>
  <AlertDescription>
    Unable to connect to the server. Please check your internet connection.
  </AlertDescription>
</Alert>
```

## Common Icon Recommendations

From `lucide-react`:

- **Info/Default**: `InfoIcon`, `BellIcon`, `MessageSquareIcon`
- **Error/Destructive**: `AlertCircleIcon`, `XCircleIcon`, `AlertOctagonIcon`
- **Warning**: `AlertTriangleIcon`, `AlertIcon`
- **Success/HUD**: `CheckCircleIcon`, `CheckIcon`, `ShieldCheckIcon`

## Styling

### Custom Colors

```tsx
<Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
  <InfoIcon className="text-blue-600" />
  <AlertTitle className="text-blue-900 dark:text-blue-100">
    Custom Styled Alert
  </AlertTitle>
  <AlertDescription className="text-blue-700 dark:text-blue-300">
    You can customize colors for specific use cases.
  </AlertDescription>
</Alert>
```

### With Shadow

```tsx
<Alert className="shadow-md">
  <AlertTitle>Elevated Alert</AlertTitle>
  <AlertDescription>This alert has a shadow for emphasis.</AlertDescription>
</Alert>
```

### Full Width

```tsx
<Alert className="w-full">
  <AlertTitle>Spanning Alert</AlertTitle>
  <AlertDescription>This alert spans the full width of its container.</AlertDescription>
</Alert>
```

## Implementation Details

### Grid Layout

The Alert uses CSS Grid to automatically position icons:
- When an icon (svg) is present, it uses a 2-column grid
- Icon column: `calc(var(--spacing)*4)` width
- Content column: Takes remaining space
- Gap between icon and content: `0.75rem` (gap-x-3)

### Icon Styling

Icons are automatically styled:
- Size: `1rem` (size-4)
- Vertical alignment: Slight translation for optical balance
- Color: Inherits from variant

### Responsive Behavior

- Alerts are full-width by default (`w-full`)
- Content wraps naturally on smaller screens
- Icons maintain consistent positioning

## Related Components

- [AlertDialog](./alert-dialog.md) - For modal alerts requiring user confirmation
- [Badge](./badge.md) - For status indicators
- [Card](./card.tsx) - For containing related information
- [Toast](https://ui.shadcn.com/docs/components/toast) - For temporary notifications

## Best Practices

### Do's

- ✅ Use appropriate variant for the message type
- ✅ Keep titles concise (1 line when possible)
- ✅ Provide clear, actionable descriptions
- ✅ Include relevant icons for quick recognition
- ✅ Place alerts near related content

### Don'ts

- ❌ Don't use multiple variants on the same alert
- ❌ Don't overuse alerts (they lose impact)
- ❌ Don't put critical actions only in alerts
- ❌ Don't use alerts for loading states
- ❌ Don't make alert content too verbose

## Migration Guide

If migrating from a different alert system:

```tsx
// Old pattern
<div className="alert alert-error">
  <span>Error message</span>
</div>

// New pattern
<Alert variant="destructive">
  <AlertCircleIcon />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Error message</AlertDescription>
</Alert>
```

## Browser Support

The Alert component works in all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Lightweight: Minimal CSS and no JavaScript
- No runtime overhead
- Tree-shakeable exports
- Optimized for bundle size

