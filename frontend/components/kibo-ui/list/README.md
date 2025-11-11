# List Component

A flexible, accessible list component system for displaying itemized data with rich content layouts.

## Overview

The List component provides a composable system for building various list patterns with consistent styling and behavior. It's built on semantic HTML with proper ARIA roles for accessibility.

## Components

### Core Components

- **`ListGroup`** - Container for list items (renders with `role="list"`)
- **`ListItem`** - Individual list item (renders with `role="listitem"`)
- **`ListItemSeparator`** - Visual separator between items

### Content Components

- **`ListItemMedia`** - Container for icons, images, or avatars
- **`ListItemContent`** - Main content area (takes up available space)
- **`ListItemTitle`** - Primary text heading
- **`ListItemDescription`** - Secondary descriptive text (auto-truncates at 2 lines)
- **`ListItemActions`** - Container for buttons and action controls
- **`ListItemHeader`** - Optional full-width header
- **`ListItemFooter`** - Optional full-width footer
- **`ListItemMetadata`** - Tags, badges, timestamps, etc.

## Installation

The List component is part of the Kibo UI library. Import it from:

```tsx
import {
  ListGroup,
  ListItem,
  ListItemMedia,
  ListItemContent,
  ListItemTitle,
  ListItemDescription,
  ListItemActions,
} from '@/components/kibo-ui/list'
```

## Variants

### ListItem Variants

| Variant | Description |
|---------|-------------|
| `default` | Transparent background (default) |
| `outline` | With border |
| `muted` | Muted background color |

### ListItem Sizes

| Size | Description |
|------|-------------|
| `sm` | Compact padding (py-3 px-4 gap-2.5) |
| `default` | Standard padding (p-4 gap-4) |
| `lg` | Large padding (p-6 gap-6) |

### ListItemMedia Variants

| Variant | Description |
|---------|-------------|
| `default` | No special styling |
| `icon` | Square container with border (8x8) |
| `image` | Square image container with rounded corners (10x10) |
| `avatar` | Circular avatar container (10x10) |

## Basic Usage

### Simple List

```tsx
<ListGroup>
  <ListItem>
    <ListItemContent>
      <ListItemTitle>List Item 1</ListItemTitle>
    </ListItemContent>
  </ListItem>
  <ListItemSeparator />
  <ListItem>
    <ListItemContent>
      <ListItemTitle>List Item 2</ListItemTitle>
    </ListItemContent>
  </ListItem>
</ListGroup>
```

### List with Icons

```tsx
<ListGroup>
  <ListItem>
    <ListItemMedia variant="icon">
      <UserIcon className="size-4" />
    </ListItemMedia>
    <ListItemContent>
      <ListItemTitle>John Doe</ListItemTitle>
      <ListItemDescription>Flight Instructor</ListItemDescription>
    </ListItemContent>
  </ListItem>
  <ListItemSeparator />
  <ListItem>
    <ListItemMedia variant="icon">
      <PlaneIcon className="size-4" />
    </ListItemMedia>
    <ListItemContent>
      <ListItemTitle>N12345</ListItemTitle>
      <ListItemDescription>Cessna 172</ListItemDescription>
    </ListItemContent>
  </ListItem>
</ListGroup>
```

### List with Actions

```tsx
<ListGroup>
  <ListItem variant="outline">
    <ListItemContent>
      <ListItemTitle>Flight Booking #1234</ListItemTitle>
      <ListItemDescription>
        Scheduled for Nov 10, 2025 at 10:00 AM
      </ListItemDescription>
    </ListItemContent>
    <ListItemActions>
      <Button size="sm" variant="ghost">Edit</Button>
      <Button size="sm" variant="ghost">Cancel</Button>
    </ListItemActions>
  </ListItem>
</ListGroup>
```

### List with Avatars

```tsx
<ListGroup>
  {users.map((user) => (
    <ListItem key={user.id} size="lg">
      <ListItemMedia variant="avatar">
        <img src={user.avatar} alt={user.name} />
      </ListItemMedia>
      <ListItemContent>
        <ListItemTitle>{user.name}</ListItemTitle>
        <ListItemDescription>{user.email}</ListItemDescription>
      </ListItemContent>
      <Badge>{user.role}</Badge>
    </ListItem>
  ))}
</ListGroup>
```

## Advanced Patterns

### Interactive List Items

Use the `asChild` prop to make the entire list item clickable:

```tsx
<ListGroup>
  <ListItem asChild>
    <Link href="/users/1">
      <ListItemMedia variant="avatar">
        <img src="/avatar.jpg" alt="User" />
      </ListItemMedia>
      <ListItemContent>
        <ListItemTitle>John Doe</ListItemTitle>
        <ListItemDescription>View profile</ListItemDescription>
      </ListItemContent>
    </Link>
  </ListItem>
</ListGroup>
```

### List with Header and Footer

```tsx
<ListItem size="lg">
  <ListItemHeader>
    <Badge>Premium</Badge>
    <Button size="sm" variant="ghost">⋯</Button>
  </ListItemHeader>
  
  <ListItemMedia variant="avatar">
    <img src="/avatar.jpg" alt="User" />
  </ListItemMedia>
  
  <ListItemContent>
    <ListItemTitle>Premium Account</ListItemTitle>
    <ListItemDescription>
      Full access to all features and unlimited bookings
    </ListItemDescription>
  </ListItemContent>
  
  <ListItemFooter>
    <ListItemMetadata>
      <span>Active since Jan 2024</span>
      <span>•</span>
      <span>Last login: 2 hours ago</span>
    </ListItemMetadata>
  </ListItemFooter>
</ListItem>
```

### Complex List Item Layout

```tsx
<ListItem variant="muted" size="lg">
  {/* Header across full width */}
  <ListItemHeader>
    <div className="flex items-center gap-2">
      <Badge variant="destructive">Weather Alert</Badge>
      <span className="text-xs text-muted-foreground">
        2 hours ago
      </span>
    </div>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost">⋯</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Reschedule</DropdownMenuItem>
        <DropdownMenuItem>Cancel</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </ListItemHeader>

  {/* Main content row */}
  <ListItemMedia variant="icon">
    <CloudRainIcon />
  </ListItemMedia>
  
  <ListItemContent>
    <ListItemTitle>Flight Lesson Affected by Weather</ListItemTitle>
    <ListItemDescription>
      Your scheduled flight on Nov 10 may be impacted by severe weather.
      Review proposed reschedule options.
    </ListItemDescription>
  </ListItemContent>

  {/* Footer across full width */}
  <ListItemFooter>
    <Button size="sm" variant="outline">View Details</Button>
    <Button size="sm">Accept Proposal</Button>
  </ListItemFooter>
</ListItem>
```

### List with Multiple Content Sections

```tsx
<ListItem>
  <ListItemMedia variant="image">
    <img src="/aircraft.jpg" alt="Aircraft" />
  </ListItemMedia>
  
  {/* Primary content */}
  <ListItemContent>
    <ListItemTitle>N12345 - Cessna 172</ListItemTitle>
    <ListItemDescription>
      Available for training flights
    </ListItemDescription>
  </ListItemContent>
  
  {/* Secondary content (metadata) */}
  <ListItemContent>
    <div className="text-right">
      <div className="font-medium text-sm">$150/hr</div>
      <div className="text-xs text-muted-foreground">Dual instruction</div>
    </div>
  </ListItemContent>
  
  <ListItemActions>
    <Button size="sm">Book Now</Button>
  </ListItemActions>
</ListItem>
```

## Accessibility

The List component follows WCAG 2.1 Level AA guidelines:

- ✅ **Semantic HTML**: Uses `role="list"` and `role="listitem"` for proper structure
- ✅ **Keyboard Navigation**: Full keyboard support with visible focus indicators
- ✅ **Focus Management**: Focus ring with `focus-visible:ring-[3px]`
- ✅ **Screen Reader Support**: Proper ARIA roles and structure
- ✅ **Color Contrast**: All text meets WCAG AA contrast requirements
- ✅ **Touch Targets**: Adequate padding for touch interactions

### Focus Behavior

```tsx
// Focus automatically styled with ring
<ListItem>
  <ListItemContent>
    <ListItemTitle>Focusable Item</ListItemTitle>
  </ListItemContent>
</ListItem>

// For interactive items, focus on the link/button
<ListItem asChild>
  <button onClick={handleClick}>
    <ListItemContent>
      <ListItemTitle>Click Me</ListItemTitle>
    </ListItemContent>
  </button>
</ListItem>
```

## Responsive Design

The List component is responsive by default:

```tsx
// Stack actions on mobile, inline on desktop
<ListItem className="md:flex-row flex-col">
  <ListItemContent>
    <ListItemTitle>Responsive Item</ListItemTitle>
  </ListItemContent>
  <ListItemActions className="md:w-auto w-full md:justify-end justify-between">
    <Button size="sm">Action 1</Button>
    <Button size="sm">Action 2</Button>
  </ListItemActions>
</ListItem>

// Change size on different breakpoints
<ListItem size="sm" className="md:p-4 md:gap-4">
  ...
</ListItem>
```

## Styling

### Custom Variants

You can create custom styling using Tailwind classes:

```tsx
// Highlight on hover
<ListItem className="hover:bg-primary/5 hover:border-primary/30">
  ...
</ListItem>

// Success state
<ListItem className="border-green-500/30 bg-green-500/5">
  ...
</ListItem>

// Danger state
<ListItem className="border-destructive/30 bg-destructive/5">
  ...
</ListItem>
```

### Data Slots

Components use `data-slot` attributes for advanced styling:

```css
/* Target specific slots in custom CSS */
[data-slot="list-item"]:hover [data-slot="list-item-title"] {
  color: hsl(var(--primary));
}

[data-slot="list-item"][data-variant="outline"] {
  border-width: 2px;
}
```

## Best Practices

### ✅ DO

- Use `ListItemSeparator` between items for visual clarity
- Use appropriate media variants (`icon`, `image`, `avatar`) for consistency
- Leverage `asChild` for making entire items interactive
- Use `ListItemDescription` for secondary information
- Apply proper ARIA labels when needed
- Use semantic HTML when wrapping in links/buttons

### ❌ DON'T

- Don't nest ListGroups inside ListItems (use separate lists)
- Don't override focus styles without maintaining accessibility
- Don't use multiple `ListItemContent` components unless needed
- Don't forget to provide alt text for images
- Don't make lists too deep (prefer flat structures)

## Real-World Examples

### User List

```tsx
<ListGroup>
  {users.map((user, index) => (
    <React.Fragment key={user.id}>
      {index > 0 && <ListItemSeparator />}
      <ListItem variant="outline">
        <ListItemMedia variant="avatar">
          <img src={user.avatar} alt={user.name} />
        </ListItemMedia>
        <ListItemContent>
          <ListItemTitle>{user.name}</ListItemTitle>
          <ListItemDescription>{user.email}</ListItemDescription>
        </ListItemContent>
        <RoleBadge role={user.role} />
        <ListItemActions>
          <Button size="sm" variant="ghost" onClick={() => handleEdit(user)}>
            Edit
          </Button>
        </ListItemActions>
      </ListItem>
    </React.Fragment>
  ))}
</ListGroup>
```

### Notification List

```tsx
<ListGroup>
  {notifications.map((notification) => (
    <ListItem
      key={notification.id}
      variant={notification.read ? 'default' : 'muted'}
      asChild
    >
      <Link href={`/notifications/${notification.id}`}>
        <ListItemMedia variant="icon">
          {notification.type === 'weather' && <CloudRainIcon />}
          {notification.type === 'booking' && <CalendarIcon />}
        </ListItemMedia>
        <ListItemContent>
          <ListItemTitle>{notification.title}</ListItemTitle>
          <ListItemDescription>
            {notification.message}
          </ListItemDescription>
          <ListItemMetadata>
            <span>{formatRelativeTime(notification.created_at)}</span>
          </ListItemMetadata>
        </ListItemContent>
        {!notification.read && (
          <Badge variant="primary" className="size-2 rounded-full p-0" />
        )}
      </Link>
    </ListItem>
  ))}
</ListGroup>
```

### Booking List with Status

```tsx
<ListGroup>
  {bookings.map((booking) => (
    <ListItem key={booking.id} size="lg" variant="outline">
      <ListItemHeader>
        <Badge variant={getBookingVariant(booking.status)}>
          {booking.status}
        </Badge>
        <span className="text-xs text-muted-foreground">
          #{booking.id}
        </span>
      </ListItemHeader>

      <ListItemMedia variant="icon">
        <PlaneIcon />
      </ListItemMedia>

      <ListItemContent>
        <ListItemTitle>
          {booking.lesson_type.replace('_', ' ').toUpperCase()}
        </ListItemTitle>
        <ListItemDescription>
          {formatDate(booking.scheduled_start)} at {formatTime(booking.scheduled_start)}
        </ListItemDescription>
      </ListItemContent>

      <ListItemContent>
        <div className="text-right text-sm">
          <div className="font-medium">{booking.aircraft.registration}</div>
          <div className="text-muted-foreground">
            {booking.instructor.name}
          </div>
        </div>
      </ListItemContent>

      <ListItemActions>
        <Button size="sm" variant="ghost">Edit</Button>
        <Button size="sm" variant="ghost">Cancel</Button>
      </ListItemActions>
    </ListItem>
  ))}
</ListGroup>
```

## API Reference

### ListGroup

```tsx
interface ListGroupProps extends React.ComponentProps<'div'> {}
```

### ListItem

```tsx
interface ListItemProps extends React.ComponentProps<'div'> {
  variant?: 'default' | 'outline' | 'muted'
  size?: 'sm' | 'default' | 'lg'
  asChild?: boolean
}
```

### ListItemMedia

```tsx
interface ListItemMediaProps extends React.ComponentProps<'div'> {
  variant?: 'default' | 'icon' | 'image' | 'avatar'
}
```

### Other Components

All other components (`ListItemContent`, `ListItemTitle`, etc.) accept standard `React.ComponentProps<'div'>` or `React.ComponentProps<'p'>` props.

## Related Components

- [Card](../card/README.md) - For card-based layouts
- [Table](../table/README.md) - For tabular data
- [Accordion](../accordion/README.md) - For collapsible lists

## Support

For issues or questions, refer to:
- [Design System Documentation](../../../DESIGN_SYSTEM.md)
- [Accessibility Guidelines](../../../docs/ACCESSIBILITY_GUIDELINES.md)
- [Component Library Overview](../../README.md)

