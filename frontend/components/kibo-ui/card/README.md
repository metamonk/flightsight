# Card Component

A powerful, HUD-styled Card component for FlightSight that combines standard card functionality with aviation-themed visual effects.

## Overview

The Card component provides a flexible container with optional HUD-style visual enhancements including corner brackets, grid overlays, glowing borders, and scan line animations. It's fully accessible (WCAG 2.1 AA compliant) and built with TypeScript.

## Installation

The component is already part of the Kibo UI component library:

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
  CardStatus,
  CardIcon,
  CardStats,
  CardStat,
  CardDivider,
} from '@/components/kibo-ui/card'
```

## Basic Usage

### Simple Card

```tsx
<Card>
  <CardContent>
    <p>Your content here</p>
  </CardContent>
</Card>
```

### Card with Header

```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Optional description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Main content</p>
  </CardContent>
</Card>
```

### Card with All Sections

```tsx
<Card>
  <CardHeader>
    <CardTitle>Complete Card</CardTitle>
    <CardDescription>With all sections</CardDescription>
    <CardAction>
      <Button size="sm">Action</Button>
    </CardAction>
  </CardHeader>
  <CardContent>
    <p>Main content area</p>
  </CardContent>
  <CardFooter>
    <Button variant="ghost">Cancel</Button>
    <Button>Submit</Button>
  </CardFooter>
</Card>
```

## HUD Features

### Corner Brackets (Default: ON)

L-shaped corner accents for that tactical HUD look:

```tsx
<Card withCorners={true}>
  <CardContent>HUD-style corners enabled</CardContent>
</Card>

<Card withCorners={false}>
  <CardContent>Clean card without corners</CardContent>
</Card>
```

### Grid Overlay (Default: ON)

Technical grid pattern background:

```tsx
<Card withGrid={true}>
  <CardContent>Technical grid overlay</CardContent>
</Card>

<Card withGrid={false}>
  <CardContent>Clean card without grid</CardContent>
</Card>
```

### Glowing Border (Default: OFF)

Subtle glowing top border effect:

```tsx
<Card withGlow={true}>
  <CardContent>Card with glowing border</CardContent>
</Card>
```

### Scan Line Animation (Default: OFF)

Animated scan line effect for dynamic displays:

```tsx
<Card withScanLine={true}>
  <CardContent>Card with scan line animation</CardContent>
</Card>
```

### All HUD Features

```tsx
<Card withCorners withGrid withGlow withScanLine>
  <CardContent>
    Full HUD experience
  </CardContent>
</Card>
```

## HUD Components

### CardStatus

Status indicator with pulse animation and optional ID:

```tsx
<CardStatus 
  status="active" 
  label="System Active" 
  id="WX-2025" 
/>
```

**Status Variants:**
- `active` (green, with pulse)
- `inactive` (gray)
- `warning` (yellow)
- `error` (red)

```tsx
<Card>
  <CardContent>
    <CardStatus status="active" label="Operational" id="SYS-001" />
    <CardStatus status="warning" label="High Winds" id="WX-123" />
    <CardStatus status="error" label="System Error" id="ERR-500" />
    <CardStatus status="inactive" label="Offline" />
  </CardContent>
</Card>
```

### CardIcon

Icon container with optional glow effect:

```tsx
<CardIcon withGlow={true}>
  <CloudRain className="h-8 w-8 text-primary" />
</CardIcon>
```

```tsx
<Card>
  <CardContent>
    <CardIcon>
      <Plane className="h-8 w-8" />
    </CardIcon>
  </CardContent>
</Card>
```

### CardStats & CardStat

Technical statistics display:

```tsx
<CardStats>
  <CardStat label="Update Rate" value="60min" variant="primary" />
  <CardStat label="Accuracy" value="98.5%" variant="accent" />
  <CardStat label="Coverage" value="Global" />
</CardStats>
```

**Stat Variants:**
- `default` (foreground color)
- `primary` (blue)
- `accent` (teal)
- `muted` (gray)

### CardDivider

Gradient divider line:

```tsx
<div className="space-y-4">
  <h2>Section Title</h2>
  <CardDivider />
  <p>Section content</p>
</div>
```

## Complete Examples

### Weather Monitoring Card

```tsx
<Card withCorners withGrid withGlow>
  <CardContent>
    <CardStatus status="active" label="System Active" id="WX-2025" />
    
    <div className="my-8">
      <CardIcon>
        <CloudRain className="h-8 w-8 text-primary" />
      </CardIcon>
    </div>
    
    <div className="space-y-2">
      <h2 className="font-mono text-4xl font-bold">
        Weather Monitoring
      </h2>
      <CardDivider />
    </div>
    
    <p className="mt-4 text-lg text-muted-foreground">
      Hourly checks for safe flying conditions
    </p>
    
    <CardStats>
      <CardStat 
        label="Update Rate" 
        value="60min" 
        variant="primary" 
      />
      <CardStat 
        label="Accuracy" 
        value="98.5%" 
        variant="accent" 
      />
      <CardStat 
        label="Coverage" 
        value="Global" 
      />
    </CardStats>
  </CardContent>
</Card>
```

### Dashboard Summary Card

```tsx
<Card>
  <CardHeader>
    <CardTitle>Flight Hours</CardTitle>
    <CardDescription>This month</CardDescription>
    <CardAction>
      <Button variant="ghost" size="sm">View All</Button>
    </CardAction>
  </CardHeader>
  <CardContent>
    <div className="text-4xl font-bold">42.5</div>
    <p className="text-sm text-muted-foreground">
      +12.5 from last month
    </p>
  </CardContent>
</Card>
```

### Notification Card

```tsx
<Card className="border-primary/50 bg-primary/5">
  <CardContent>
    <div className="flex items-start gap-3">
      <CardIcon withGlow={false}>
        <CheckCircle className="h-5 w-5 text-primary" />
      </CardIcon>
      <div>
        <h4 className="font-semibold">Booking Confirmed</h4>
        <p className="text-sm text-muted-foreground">
          Your lesson is scheduled for tomorrow at 9:00 AM
        </p>
      </div>
    </div>
  </CardContent>
</Card>
```

## Accessibility

The Card component is fully accessible and WCAG 2.1 AA compliant:

### Screen Readers

All components support ARIA attributes via spread props:

```tsx
<Card aria-label="Weather information" role="region">
  <CardContent>
    <CardStatus 
      status="active" 
      label="System Active"
      aria-live="polite"
    />
  </CardContent>
</Card>
```

### Semantic HTML

Use semantic HTML elements when appropriate:

```tsx
<Card>
  <CardHeader>
    <CardTitle>
      <h2>Proper Heading</h2>
    </CardTitle>
  </CardHeader>
  <CardContent>
    <article>
      <p>Article content</p>
    </article>
  </CardContent>
</Card>
```

### Focus Management

All interactive elements within cards are keyboard navigable:

```tsx
<Card>
  <CardContent>
    <Button>Focusable Action</Button>
  </CardContent>
</Card>
```

### Color Contrast

All text and UI elements meet WCAG AA contrast requirements:
- Body text: 4.5:1 minimum
- Large text: 3:1 minimum
- UI components: 3:1 minimum

## Component Props

### Card

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `withCorners` | `boolean` | `true` | Enables HUD-style corner brackets |
| `withGrid` | `boolean` | `true` | Enables grid overlay pattern |
| `withGlow` | `boolean` | `false` | Enables glowing top border |
| `withScanLine` | `boolean` | `false` | Enables scan line animation |
| `className` | `string` | - | Additional CSS classes |
| `...props` | `React.ComponentProps<'div'>` | - | All div props |

### CardStatus

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `status` | `'active' \| 'inactive' \| 'warning' \| 'error'` | `'active'` | Status variant |
| `label` | `string` | Required | Status label text |
| `id` | `string` | - | Optional ID display |
| `className` | `string` | - | Additional CSS classes |

### CardIcon

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `withGlow` | `boolean` | `true` | Enables pulsing glow effect |
| `className` | `string` | - | Additional CSS classes |
| `...props` | `React.ComponentProps<'div'>` | - | All div props |

### CardStat

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | Required | Stat label text |
| `value` | `string` | Required | Stat value text |
| `variant` | `'default' \| 'primary' \| 'accent' \| 'muted'` | `'default'` | Color variant |
| `className` | `string` | - | Additional CSS classes |

## Styling

### Custom Styles

Add custom styles via className:

```tsx
<Card className="border-primary/50 bg-primary/5">
  <CardContent>Custom styled card</CardContent>
</Card>
```

### Theme Variables

The component uses CSS custom properties that can be customized:

```css
:root {
  --primary: oklch(0.55 0.22 220);
  --accent: oklch(0.60 0.16 180);
  --border: oklch(0.85 0.01 240);
  --card: oklch(1.0 0 0);
  --card-foreground: oklch(0.15 0.01 240);
}
```

## Best Practices

### Use HUD Features Sparingly

Not every card needs all HUD features. Use them purposefully:

```tsx
// ✅ Good: HUD features for important system cards
<Card withCorners withGlow>
  <CardContent>
    <CardStatus status="active" label="Flight Systems" />
  </CardContent>
</Card>

// ✅ Good: Simple cards for general content
<Card withCorners={false} withGrid={false}>
  <CardContent>Regular content card</CardContent>
</Card>
```

### Maintain Proper Heading Hierarchy

```tsx
// ✅ Good
<div>
  <h1>Page Title</h1>
  <Card>
    <CardHeader>
      <CardTitle>
        <h2>Card Title</h2>
      </CardTitle>
    </CardHeader>
  </Card>
</div>

// ❌ Bad: Skipping heading levels
<div>
  <h1>Page Title</h1>
  <Card>
    <CardHeader>
      <CardTitle>
        <h3>Card Title</h3>  {/* Skipped h2 */}
      </CardTitle>
    </CardHeader>
  </Card>
</div>
```

### Use CardAction for Header Actions

```tsx
// ✅ Good
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
    <CardAction>
      <Button size="sm">Edit</Button>
    </CardAction>
  </CardHeader>
</Card>
```

## Testing

The component includes comprehensive test coverage:

- ✅ 28 tests, all passing
- ✅ Unit tests for all features
- ✅ Accessibility tests (WCAG 2.1 AA)
- ✅ Component composition tests
- ✅ No linter errors

Run tests:

```bash
pnpm test -- tests/components/kibo-ui/Card.test.tsx
```

## Related Components

- `Button` - Actions and interactions
- `Badge` - Status indicators
- `Avatar` - User representation
- `Tabs` - Content organization

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- iOS Safari (latest 2 versions)
- Android Chrome (latest 2 versions)

## Performance

The component is optimized for performance:
- No unnecessary re-renders
- CSS-only animations (no JavaScript)
- Minimal DOM nodes
- Tree-shakeable exports

## Migration from Old Card

If migrating from the shadcn Card component:

```tsx
// Old (shadcn)
import { Card, CardContent } from '@/components/ui/card'

<Card>
  <CardContent>Content</CardContent>
</Card>

// New (Kibo UI) - Same API!
import { Card, CardContent } from '@/components/kibo-ui/card'

<Card>
  <CardContent>Content</CardContent>
</Card>

// With optional HUD features
<Card withCorners withGrid>
  <CardContent>Enhanced content</CardContent>
</Card>
```

The API is 100% compatible, so you can use it as a drop-in replacement and gradually add HUD features where needed.

## License

Part of the FlightSight project.

