# Popover & Tooltip Components

Powerful Popover and Tooltip components for FlightSight with optional HUD-style visual enhancements. Built on Radix UI for accessibility and fully TypeScript-compatible.

## Overview

These components provide accessible popovers and tooltips with optional aviation-themed visual effects. They handle positioning, keyboard navigation, and screen reader announcements automatically.

---

## Popover Component

Rich contextual overlays for interactive content.

### Installation

```tsx
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  PopoverClose,
} from '@/components/kibo-ui/popover'
```

### Basic Usage

```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Open Popover</Button>
  </PopoverTrigger>
  <PopoverContent>
    <div className="grid gap-4">
      <h4 className="font-medium leading-none">Dimensions</h4>
      <p className="text-sm text-muted-foreground">
        Set the dimensions for the layer.
      </p>
    </div>
  </PopoverContent>
</Popover>
```

### With Form

```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button>Settings</Button>
  </PopoverTrigger>
  <PopoverContent className="w-80">
    <div className="grid gap-4">
      <div className="space-y-2">
        <h4 className="font-medium leading-none">Settings</h4>
        <p className="text-sm text-muted-foreground">
          Configure your preferences
        </p>
      </div>
      <div className="grid gap-2">
        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="width">Width</label>
          <input
            id="width"
            defaultValue="100%"
            className="col-span-2 h-8"
          />
        </div>
        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="maxWidth">Max width</label>
          <input
            id="maxWidth"
            defaultValue="300px"
            className="col-span-2 h-8"
          />
        </div>
      </div>
    </div>
  </PopoverContent>
</Popover>
```

### HUD Features

```tsx
{/* With corner brackets */}
<PopoverContent withCorners>
  <p>HUD-style popover</p>
</PopoverContent>

{/* With grid overlay */}
<PopoverContent withGrid>
  <p>Technical display</p>
</PopoverContent>

{/* All HUD features */}
<PopoverContent withCorners withGrid>
  <p>Full HUD experience</p>
</PopoverContent>

{/* Without arrow */}
<PopoverContent showArrow={false}>
  <p>Clean popover</p>
</PopoverContent>
```

### Controlled Popover

```tsx
function ControlledPopover() {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button>Toggle</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p>Controlled content</p>
        <PopoverClose asChild>
          <Button size="sm" onClick={() => setOpen(false)}>
            Close
          </Button>
        </PopoverClose>
      </PopoverContent>
    </Popover>
  );
}
```

### Positioning

```tsx
{/* Side placement */}
<PopoverContent side="top">Content</PopoverContent>
<PopoverContent side="right">Content</PopoverContent>
<PopoverContent side="bottom">Content</PopoverContent>
<PopoverContent side="left">Content</PopoverContent>

{/* Alignment */}
<PopoverContent align="start">Content</PopoverContent>
<PopoverContent align="center">Content</PopoverContent>
<PopoverContent align="end">Content</PopoverContent>

{/* Offset */}
<PopoverContent sideOffset={20}>Content</PopoverContent>
```

### Popover Props

#### Popover (Root)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | - | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | - | Callback when state changes |
| `defaultOpen` | `boolean` | `false` | Uncontrolled default state |
| `modal` | `boolean` | `false` | Modal behavior |

#### PopoverContent

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `align` | `'start' \| 'center' \| 'end'` | `'center'` | Alignment relative to trigger |
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'bottom'` | Side to render on |
| `sideOffset` | `number` | `4` | Distance from trigger (px) |
| `withCorners` | `boolean` | `false` | Enable HUD corner brackets |
| `withGrid` | `boolean` | `false` | Enable grid overlay |
| `showArrow` | `boolean` | `true` | Show arrow pointer |
| `className` | `string` | - | Additional CSS classes |

---

## Tooltip Component

Brief contextual information on hover or focus.

### Installation

```tsx
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipSimple,
} from '@/components/kibo-ui/tooltip'
```

### Basic Usage

```tsx
<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="outline">Hover me</Button>
  </TooltipTrigger>
  <TooltipContent>
    <p>This is a tooltip</p>
  </TooltipContent>
</Tooltip>
```

### Simple Tooltip

Quick wrapper for common use cases:

```tsx
<TooltipSimple content="Delete item">
  <Button variant="destructive" size="icon">
    <Trash className="h-4 w-4" />
  </Button>
</TooltipSimple>
```

### HUD Style Tooltip

```tsx
<Tooltip>
  <TooltipTrigger asChild>
    <Button>System Status</Button>
  </TooltipTrigger>
  <TooltipContent withHUD>
    <p>All systems operational</p>
  </TooltipContent>
</Tooltip>

{/* Or with TooltipSimple */}
<TooltipSimple content="Active" withHUD>
  <BadgeDot variant="success" withPulse>
    System
  </BadgeDot>
</TooltipSimple>
```

### Custom Delay

```tsx
{/* Fast tooltip */}
<Tooltip delayDuration={0}>
  <TooltipTrigger>Instant</TooltipTrigger>
  <TooltipContent>Shows immediately</TooltipContent>
</Tooltip>

{/* Slow tooltip */}
<Tooltip delayDuration={1000}>
  <TooltipTrigger>Delayed</TooltipTrigger>
  <TooltipContent>Shows after 1 second</TooltipContent>
</Tooltip>

{/* With TooltipSimple */}
<TooltipSimple content="Tooltip" delayDuration={500}>
  <Button>Hover</Button>
</TooltipSimple>
```

### Positioning

```tsx
{/* Different sides */}
<TooltipSimple content="Top tooltip" side="top">
  <Button>Hover</Button>
</TooltipSimple>

<TooltipSimple content="Right tooltip" side="right">
  <Button>Hover</Button>
</TooltipSimple>

{/* Without arrow */}
<TooltipSimple content="No arrow" showArrow={false}>
  <Button>Hover</Button>
</TooltipSimple>
```

### Tooltip Props

#### Tooltip

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `delayDuration` | `number` | `200` | Delay before showing (ms) |
| `...props` | `TooltipRootProps` | - | All Radix Tooltip props |

#### TooltipContent

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'top'` | Side to render on |
| `sideOffset` | `number` | `4` | Distance from trigger (px) |
| `showArrow` | `boolean` | `true` | Show arrow pointer |
| `withHUD` | `boolean` | `false` | Enable HUD styling |
| `className` | `string` | - | Additional CSS classes |

#### TooltipSimple

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `ReactNode` | Required | Tooltip content |
| `children` | `ReactElement` | Required | Trigger element |
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'top'` | Placement |
| `delayDuration` | `number` | `200` | Show delay (ms) |
| `showArrow` | `boolean` | `true` | Show arrow |
| `withHUD` | `boolean` | `false` | HUD styling |

---

## Complete Examples

### User Profile Popover

```tsx
function UserProfilePopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src="/avatar.jpg" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">John Doe</h4>
              <p className="text-sm text-muted-foreground">
                john@example.com
              </p>
            </div>
          </div>
          <div className="grid gap-2">
            <Button variant="outline" size="sm">
              View Profile
            </Button>
            <Button variant="outline" size="sm">
              Settings
            </Button>
            <Button variant="outline" size="sm">
              Log Out
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

### HUD System Info Popover

```tsx
function SystemInfoPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button withGlow>
          <Info className="mr-2 h-4 w-4" />
          System Info
        </Button>
      </PopoverTrigger>
      <PopoverContent withCorners withGrid className="w-96">
        <div className="grid gap-3">
          <h4 className="font-mono text-sm font-medium">
            SYSTEM STATUS - WX-2025
          </h4>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Uptime</span>
              <span className="font-mono">99.8%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Check</span>
              <span className="font-mono">2 min ago</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <BadgeDot variant="success" withPulse>
                Operational
              </BadgeDot>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

### Icon Buttons with Tooltips

```tsx
function ActionBar() {
  return (
    <div className="flex gap-2">
      <TooltipSimple content="Edit">
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </TooltipSimple>

      <TooltipSimple content="Delete" side="bottom">
        <Button variant="ghost" size="icon">
          <Trash className="h-4 w-4" />
        </Button>
      </TooltipSimple>

      <TooltipSimple content="Share" withHUD>
        <Button variant="ghost" size="icon">
          <Share className="h-4 w-4" />
        </Button>
      </TooltipSimple>
    </div>
  );
}
```

---

## Accessibility

Both components are fully accessible and WCAG 2.1 AA compliant:

### Keyboard Navigation

**Popover:**
- `Space` or `Enter` on trigger opens the popover
- `Esc` closes the popover
- `Tab` moves focus through interactive elements

**Tooltip:**
- Shows on hover or focus
- Hidden on mouse leave or blur
- Not keyboard navigable (informational only)

### Screen Readers

```tsx
{/* Popover with proper labeling */}
<Popover>
  <PopoverTrigger aria-label="Open settings">
    <Settings />
  </PopoverTrigger>
  <PopoverContent>
    <h4>Settings</h4>
    <p>Configure options</p>
  </PopoverContent>
</Popover>

{/* Tooltip for icon button */}
<TooltipSimple content="Delete item">
  <Button
    variant="destructive"
    size="icon"
    aria-label="Delete"
  >
    <Trash />
  </Button>
</TooltipSimple>
```

### Best Practices

```tsx
// ✅ Good: Tooltip for icon-only button
<TooltipSimple content="Save changes">
  <Button size="icon" aria-label="Save">
    <Save />
  </Button>
</TooltipSimple>

// ✅ Good: Popover for interactive content
<Popover>
  <PopoverTrigger>Options</PopoverTrigger>
  <PopoverContent>
    <Button>Action 1</Button>
    <Button>Action 2</Button>
  </PopoverContent>
</Popover>

// ❌ Bad: Tooltip on disabled element (won't show)
<TooltipSimple content="Disabled">
  <Button disabled>Action</Button>
</TooltipSimple>

// ✅ Good: Wrap disabled element
<TooltipSimple content="Not available">
  <span>
    <Button disabled>Action</Button>
  </span>
</TooltipSimple>
```

---

## Related Components

- `Dialog` - For modal overlays
- `DropdownMenu` - For menu-style popovers
- `HoverCard` - For richer hover content
- `Sheet` - For side-panel content

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- iOS Safari (latest 2 versions)
- Android Chrome (latest 2 versions)

## Performance

- Portal-based rendering for proper stacking
- CSS-only animations
- Automatic positioning calculations
- Collision detection and boundary awareness
- Minimal re-renders

## Migration from shadcn

100% compatible API - drop-in replacement:

```tsx
// Old (shadcn)
import { Popover, PopoverContent } from '@/components/ui/popover'
import { Tooltip, TooltipContent } from '@/components/ui/tooltip'

// New (Kibo UI) - Same API!
import { Popover, PopoverContent } from '@/components/kibo-ui/popover'
import { Tooltip, TooltipContent } from '@/components/kibo-ui/tooltip'

// With optional HUD features
<PopoverContent withCorners withGrid />
<TooltipContent withHUD />
```

## License

Part of the FlightSight project.

