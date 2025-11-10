# Dialog Component

A powerful Dialog (Modal) component for FlightSight with optional HUD-style visual enhancements. Built on Radix UI for accessibility and fully TypeScript-compatible.

## Overview

The Dialog component provides accessible modal dialogs with optional aviation-themed visual effects including corner brackets, grid overlays, and glowing borders. It handles focus management, keyboard navigation, and screen reader announcements automatically.

## Installation

The component is part of the Kibo UI component library:

```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/kibo-ui/dialog'
```

## Basic Usage

### Simple Dialog

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        This is a simple dialog description.
      </DialogDescription>
    </DialogHeader>
    <p>Your content here.</p>
  </DialogContent>
</Dialog>
```

### Dialog with Footer

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Action</DialogTitle>
      <DialogDescription>
        Are you sure you want to continue?
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="outline">Cancel</Button>
      </DialogClose>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Dialog without Close Button

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent showCloseButton={false}>
    <DialogHeader>
      <DialogTitle>Important Notice</DialogTitle>
    </DialogHeader>
    <p>You must take action before closing.</p>
    <DialogFooter>
      <DialogClose asChild>
        <Button>I Understand</Button>
      </DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## HUD Features

### Corner Brackets

L-shaped corner accents for that tactical HUD look:

```tsx
<DialogContent withCorners>
  <DialogHeader>
    <DialogTitle>HUD Dialog</DialogTitle>
  </DialogHeader>
</DialogContent>
```

### Grid Overlay

Technical grid pattern background:

```tsx
<DialogContent withGrid>
  <DialogHeader>
    <DialogTitle>Technical Display</DialogTitle>
  </DialogHeader>
</DialogContent>
```

### Glowing Border

Subtle glowing top border effect:

```tsx
<DialogContent withGlow>
  <DialogHeader>
    <DialogTitle>Active System</DialogTitle>
  </DialogHeader>
</DialogContent>
```

### All HUD Features

```tsx
<DialogContent withCorners withGrid withGlow>
  <DialogHeader>
    <DialogTitle>Full HUD Experience</DialogTitle>
  </DialogHeader>
</DialogContent>
```

## Complete Examples

### Confirmation Dialog

```tsx
function DeleteConfirmation() {
  const [open, setOpen] = React.useState(false);

  const handleDelete = () => {
    // Delete logic here
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Form Dialog

```tsx
function EditProfile() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Edit Profile</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-right">
              Name
            </label>
            <input
              id="name"
              defaultValue="John Doe"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="email" className="text-right">
              Email
            </label>
            <input
              id="email"
              defaultValue="john@example.com"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### HUD System Status Dialog

```tsx
function SystemStatus() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button withGlow>System Status</Button>
      </DialogTrigger>
      <DialogContent withCorners withGrid withGlow className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-mono text-2xl">
            SYSTEM STATUS - WX-2025
          </DialogTitle>
          <DialogDescription>
            Real-time system diagnostics and status
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <span className="font-mono">Weather Monitoring</span>
            <BadgeDot variant="success" withPulse>
              Active
            </BadgeDot>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono">Booking System</span>
            <BadgeDot variant="success" withPulse>
              Active
            </BadgeDot>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono">API Gateway</span>
            <BadgeDot variant="warning">
              Degraded
            </BadgeDot>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Nested Dialogs

```tsx
function NestedExample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open First Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>First Dialog</DialogTitle>
          <DialogDescription>
            This dialog contains another dialog trigger.
          </DialogDescription>
        </DialogHeader>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Second Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Second Dialog</DialogTitle>
              <DialogDescription>
                This is a nested dialog.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button>Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
```

## Controlled Dialog

Control the dialog state programmatically:

```tsx
function ControlledDialog() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Open Controlled Dialog
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Controlled Dialog</DialogTitle>
            <DialogDescription>
              This dialog is controlled by external state.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

## Accessibility

The Dialog component is fully accessible and WCAG 2.1 AA compliant:

### Keyboard Navigation

- `Space` or `Enter` on trigger opens the dialog
- `Esc` closes the dialog
- `Tab` cycles through focusable elements inside
- Focus is trapped within the dialog when open
- Focus returns to trigger when closed

### Screen Readers

```tsx
<Dialog>
  <DialogTrigger aria-label="Open settings dialog">
    <Settings />
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Settings</DialogTitle>
      <DialogDescription>
        Configure your application settings
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

### ARIA Attributes

The component automatically handles:
- `role="dialog"`
- `aria-modal="true"`
- `aria-labelledby` (linked to DialogTitle)
- `aria-describedby` (linked to DialogDescription)
- Focus management
- Body scroll locking

### Best Practices

```tsx
// ✅ Good: Always include DialogTitle for screen readers
<DialogContent>
  <DialogHeader>
    <DialogTitle>Title</DialogTitle>
  </DialogHeader>
</DialogContent>

// ❌ Bad: Missing title
<DialogContent>
  <DialogHeader>
    <DialogDescription>Description only</DialogDescription>
  </DialogHeader>
</DialogContent>

// ✅ Good: Provide context with DialogDescription
<DialogContent>
  <DialogHeader>
    <DialogTitle>Delete Account</DialogTitle>
    <DialogDescription>
      This action cannot be undone.
    </DialogDescription>
  </DialogHeader>
</DialogContent>

// ✅ Good: Use DialogClose for accessible close buttons
<DialogFooter>
  <DialogClose asChild>
    <Button>Cancel</Button>
  </DialogClose>
</DialogFooter>
```

## Component Props

### Dialog (Root)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | - | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | - | Callback when open state changes |
| `defaultOpen` | `boolean` | `false` | Uncontrolled default open state |
| `modal` | `boolean` | `true` | Whether dialog is modal |

### DialogTrigger

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Render as child component |
| `...props` | `ButtonHTMLAttributes` | - | All button props |

### DialogContent

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showCloseButton` | `boolean` | `true` | Show close button in top-right |
| `withCorners` | `boolean` | `false` | Enable HUD corner brackets |
| `withGrid` | `boolean` | `false` | Enable grid overlay pattern |
| `withGlow` | `boolean` | `false` | Enable glowing border effect |
| `className` | `string` | - | Additional CSS classes |
| `...props` | `DialogContentProps` | - | All dialog content props |

### DialogHeader, DialogFooter

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `...props` | `HTMLAttributes<HTMLDivElement>` | - | All div props |

### DialogTitle

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `...props` | `DialogTitleProps` | - | All dialog title props |

### DialogDescription

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `...props` | `DialogDescriptionProps` | - | All dialog description props |

### DialogClose

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Render as child component |
| `...props` | `ButtonHTMLAttributes` | - | All button props |

## Styling

### Custom Styles

```tsx
<DialogContent className="sm:max-w-2xl">
  <DialogHeader className="border-b pb-4">
    <DialogTitle className="text-2xl">Large Dialog</DialogTitle>
  </DialogHeader>
</DialogContent>
```

### Theme Variables

The component uses CSS custom properties:

```css
:root {
  --background: oklch(1.0 0 0);
  --foreground: oklch(0.15 0.01 240);
  --primary: oklch(0.55 0.22 220);
  --border: oklch(0.85 0.01 240);
  --ring: oklch(0.55 0.22 220);
}
```

## Best Practices

### Use Appropriate Sizes

```tsx
// ✅ Good: Default size for most content
<DialogContent>
  <DialogHeader>
    <DialogTitle>Standard Dialog</DialogTitle>
  </DialogHeader>
</DialogContent>

// ✅ Good: Large size for complex content
<DialogContent className="sm:max-w-2xl">
  <DialogHeader>
    <DialogTitle>Wide Dialog</DialogTitle>
  </DialogHeader>
</DialogContent>

// ❌ Bad: Unnecessarily large for simple content
<DialogContent className="sm:max-w-6xl">
  <DialogHeader>
    <DialogTitle>Simple Message</DialogTitle>
  </DialogHeader>
  <p>OK</p>
</DialogContent>
```

### Manage Focus

```tsx
// ✅ Good: Focus first input automatically
<DialogContent>
  <input autoFocus />
</DialogContent>

// ✅ Good: Use DialogClose for cancel actions
<DialogFooter>
  <DialogClose asChild>
    <Button variant="outline">Cancel</Button>
  </DialogClose>
</DialogFooter>
```

### HUD Features Usage

```tsx
// ✅ Good: HUD features for system/status dialogs
<DialogContent withCorners withGlow>
  <DialogHeader>
    <DialogTitle>System Alert</DialogTitle>
  </DialogHeader>
</DialogContent>

// ✅ Good: Clean dialog for forms
<DialogContent>
  <DialogHeader>
    <DialogTitle>Edit Profile</DialogTitle>
  </DialogHeader>
</DialogContent>

// ❌ Bad: Overusing HUD features
<DialogContent withCorners withGrid withGlow>
  <DialogHeader>
    <DialogTitle>Simple Message</DialogTitle>
  </DialogHeader>
  <p>OK</p>
</DialogContent>
```

## Related Components

- `AlertDialog` - For critical confirmations requiring explicit action
- `Sheet` - For side-panel style dialogs
- `Popover` - For non-modal contextual content
- `Card` - For contained content within dialogs

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- iOS Safari (latest 2 versions)
- Android Chrome (latest 2 versions)

## Performance

The component is optimized for performance:
- Portal-based rendering for proper z-index stacking
- CSS-only animations (no JavaScript)
- Automatic body scroll locking
- Focus trap with minimal overhead
- Lazy loading of dialog content

## Migration from shadcn Dialog

The API is 100% compatible with shadcn Dialog, so you can use it as a drop-in replacement:

```tsx
// Old (shadcn)
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from '@/components/ui/dialog'

<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
  </DialogContent>
</Dialog>

// New (Kibo UI) - Same API!
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from '@/components/kibo-ui/dialog'

<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
  </DialogContent>
</Dialog>

// With optional HUD features
<DialogContent withCorners withGlow>
  <DialogHeader>
    <DialogTitle>Enhanced Dialog</DialogTitle>
  </DialogHeader>
</DialogContent>
```

## License

Part of the FlightSight project.

