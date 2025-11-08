# FlightSight Design System

> A comprehensive guide to the FlightSight design system, built with shadcn/ui and Tailwind CSS.

## Table of Contents

1. [Color System](#color-system)
2. [Typography](#typography)
3. [Spacing & Layout](#spacing--layout)
4. [Component Patterns](#component-patterns)
5. [Best Practices](#best-practices)

---

## Color System

### Overview

FlightSight uses a semantic color system based on CSS custom properties. All colors automatically adapt to light and dark modes.

### Semantic Color Tokens

#### Background & Foreground

```css
--background     /* Main page background */
--foreground     /* Main text color */
```

**Usage:**
```tsx
<div className="bg-background text-foreground">
  Main content
</div>
```

#### Card Colors

```css
--card              /* Card background */
--card-foreground   /* Text on cards */
```

**Usage:**
```tsx
import { Card, CardContent } from '@/components/ui/card'

<Card>
  <CardContent>Card content</CardContent>
</Card>
```

#### Primary Colors

```css
--primary              /* Primary brand color */
--primary-foreground   /* Text on primary backgrounds */
```

**Usage:**
```tsx
<Button className="bg-primary text-primary-foreground">
  Primary Action
</Button>
```

#### Secondary Colors

```css
--secondary              /* Secondary UI elements */
--secondary-foreground   /* Text on secondary backgrounds */
```

**Usage:**
```tsx
<Button variant="secondary">
  Secondary Action
</Button>
```

#### Muted Colors

```css
--muted              /* Subtle backgrounds */
--muted-foreground   /* De-emphasized text */
```

**Usage:**
```tsx
<p className="text-muted-foreground">
  Helper text or captions
</p>

<div className="bg-muted p-4">
  Subtle background section
</div>
```

#### Accent Colors

```css
--accent              /* Accent highlights */
--accent-foreground   /* Text on accent backgrounds */
```

**Usage:**
```tsx
<div className="bg-accent text-accent-foreground">
  Highlighted content
</div>
```

#### Destructive Colors

```css
--destructive              /* Error/danger states */
--destructive-foreground   /* Text on destructive backgrounds */
```

**Usage:**
```tsx
<Button variant="destructive">
  Delete
</Button>

<Badge variant="destructive">
  Error
</Badge>
```

#### Border & Input

```css
--border   /* Border color for UI elements */
--input    /* Input field borders */
--ring     /* Focus ring color */
```

**Usage:**
```tsx
<div className="border border-border rounded-lg p-4">
  Bordered container
</div>

<Input className="border-input focus:ring-ring" />
```

### Chart Colors

For data visualizations, use the chart color scale:

```css
--chart-1   /* Primary chart color */
--chart-2   /* Secondary chart color */
--chart-3   /* Tertiary chart color */
--chart-4   /* Quaternary chart color */
--chart-5   /* Quinary chart color */
```

**Usage in Recharts:**
```tsx
<Line 
  dataKey="confirmed" 
  stroke="hsl(var(--chart-1))" 
  strokeWidth={2}
/>
<Bar 
  dataKey="pending" 
  fill="hsl(var(--chart-2))" 
/>
```

### Color Values

#### Light Mode

```css
:root {
  --background: oklch(0.9751 0.0127 244.2507);
  --foreground: oklch(0.3729 0.0306 259.7328);
  --primary: oklch(0.7227 0.1920 149.5793);
  --secondary: oklch(0.9514 0.0250 236.8242);
  --muted: oklch(0.9670 0.0029 264.5419);
  --accent: oklch(0.9505 0.0507 163.0508);
  --destructive: oklch(0.6368 0.2078 25.3313);
  --border: oklch(0.9276 0.0058 264.5313);
  --chart-1: oklch(0.7227 0.1920 149.5793);
  --chart-2: oklch(0.6959 0.1491 162.4796);
  --chart-3: oklch(0.5960 0.1274 163.2254);
  --chart-4: oklch(0.5081 0.1049 165.6121);
  --chart-5: oklch(0.4318 0.0865 166.9128);
}
```

#### Dark Mode

```css
.dark {
  --background: oklch(0.2077 0.0398 265.7549);
  --foreground: oklch(0.8717 0.0093 258.3382);
  --primary: oklch(0.7729 0.1535 163.2231);
  --secondary: oklch(0.3351 0.0331 260.9120);
  --muted: oklch(0.2463 0.0275 259.9628);
  --accent: oklch(0.3729 0.0306 259.7328);
  --destructive: oklch(0.6368 0.2078 25.3313);
  --border: oklch(0.4461 0.0263 256.8018);
  --chart-1: oklch(0.7729 0.1535 163.2231);
  --chart-2: oklch(0.7845 0.1325 181.9120);
  --chart-3: oklch(0.7227 0.1920 149.5793);
  --chart-4: oklch(0.6959 0.1491 162.4796);
  --chart-5: oklch(0.5960 0.1274 163.2254);
}
```

### Color Usage Guidelines

#### ✅ DO

- Use semantic tokens (e.g., `text-foreground`, `bg-muted`)
- Use `hsl(var(--color))` syntax for inline styles in charts
- Rely on component variants for consistent styling
- Test colors in both light and dark modes

#### ❌ DON'T

- Use hardcoded hex colors (e.g., `#3b82f6`)
- Use Tailwind arbitrary values for colors (e.g., `bg-[#ff0000]`)
- Mix semantic tokens inappropriately (e.g., `bg-primary text-muted-foreground`)

---

## Typography

### Font Families

FlightSight uses three font families from Google Fonts:

```css
--font-sans: 'DM Sans', sans-serif;    /* Primary UI font */
--font-serif: 'Lora', serif;            /* Decorative/headers */
--font-mono: 'IBM Plex Mono', monospace; /* Code/data */
```

**Usage:**
```tsx
<p className="font-sans">Standard text</p>
<h1 className="font-serif">Elegant heading</h1>
<code className="font-mono">const code = true</code>
```

### Font Sizes

Tailwind's default type scale is used:

| Class | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `text-xs` | 0.75rem (12px) | 1rem | Small labels, captions |
| `text-sm` | 0.875rem (14px) | 1.25rem | Secondary text, helper text |
| `text-base` | 1rem (16px) | 1.5rem | Body text (default) |
| `text-lg` | 1.125rem (18px) | 1.75rem | Emphasis text |
| `text-xl` | 1.25rem (20px) | 1.75rem | Subheadings |
| `text-2xl` | 1.5rem (24px) | 2rem | Section headings |
| `text-3xl` | 1.875rem (30px) | 2.25rem | Page titles |
| `text-4xl` | 2.25rem (36px) | 2.5rem | Hero text |

### Font Weights

| Class | Weight | Usage |
|-------|--------|-------|
| `font-normal` | 400 | Body text |
| `font-medium` | 500 | Slightly emphasized |
| `font-semibold` | 600 | Headings, labels |
| `font-bold` | 700 | Strong emphasis |

### Typography Examples

#### Headings

```tsx
<h1 className="text-3xl font-bold text-foreground">
  Page Title
</h1>

<h2 className="text-2xl font-semibold text-foreground">
  Section Heading
</h2>

<h3 className="text-xl font-semibold text-foreground">
  Subsection
</h3>
```

#### Body Text

```tsx
<p className="text-base text-foreground">
  Standard paragraph text
</p>

<p className="text-sm text-muted-foreground">
  Secondary or helper text
</p>
```

#### Cards & Components

```tsx
<CardTitle className="text-lg font-semibold">
  Card Title
</CardTitle>

<CardDescription className="text-sm text-muted-foreground">
  Card description text
</CardDescription>
```

---

## Spacing & Layout

### Spacing Scale

FlightSight uses Tailwind's default spacing scale based on `0.25rem` (4px) increments:

| Class | Size | Pixels | Usage |
|-------|------|--------|-------|
| `p-1` | 0.25rem | 4px | Tight spacing |
| `p-2` | 0.5rem | 8px | Compact padding |
| `p-3` | 0.75rem | 12px | Small padding |
| `p-4` | 1rem | 16px | Standard padding |
| `p-6` | 1.5rem | 24px | Medium padding |
| `p-8` | 2rem | 32px | Large padding |
| `p-12` | 3rem | 48px | Extra large padding |

### Gap Utilities

For flex and grid layouts:

```tsx
<div className="flex gap-2">        {/* 8px gap */}
<div className="flex gap-4">        {/* 16px gap */}
<div className="flex gap-6">        {/* 24px gap */}

<div className="grid gap-4">        {/* 16px gap */}
<div className="grid gap-6">        {/* 24px gap */}
```

### Border Radius

Custom radius values defined in the theme:

```css
--radius: 0.5rem;              /* 8px - default */
--radius-sm: 0.375rem;         /* 6px */
--radius-md: 0.5rem;           /* 8px */
--radius-lg: 0.75rem;          /* 12px */
--radius-xl: 1rem;             /* 16px */
```

**Usage:**
```tsx
<div className="rounded">         {/* 8px */}
<div className="rounded-lg">      {/* 12px */}
<div className="rounded-xl">      {/* 16px */}
<div className="rounded-full">    {/* Fully rounded */}
```

### Shadows

Custom shadow values for depth:

| Class | Usage |
|-------|-------|
| `shadow-sm` | Subtle elevation |
| `shadow` | Standard elevation |
| `shadow-md` | Medium elevation |
| `shadow-lg` | High elevation |
| `shadow-xl` | Very high elevation |

**Example:**
```tsx
<Card className="shadow-sm">       {/* Subtle */}
<Card className="shadow-lg">       {/* Prominent */}
```

### Responsive Breakpoints

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large desktop */
```

**Usage:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* 1 column mobile, 2 tablet, 3 desktop */}
</div>
```

### Layout Patterns

#### Container

```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Responsive container with padding */}
</div>
```

#### Grid Layouts

```tsx
{/* Responsive grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>

{/* Auto-fit grid */}
<div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
  <Card>...</Card>
</div>
```

#### Flex Layouts

```tsx
{/* Horizontal stack */}
<div className="flex items-center gap-4">
  <Button>Left</Button>
  <Button>Right</Button>
</div>

{/* Vertical stack */}
<div className="flex flex-col gap-4">
  <Card>Top</Card>
  <Card>Bottom</Card>
</div>

{/* Space between */}
<div className="flex items-center justify-between">
  <span>Left</span>
  <span>Right</span>
</div>
```

---

## Component Patterns

### shadcn/ui Components

FlightSight uses shadcn/ui components as the foundation. All components are located in `/components/ui/`.

#### Card Component

The most commonly used component for grouping content:

```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Optional description</CardDescription>
  </CardHeader>
  <CardContent>
    Main content goes here
  </CardContent>
</Card>
```

**Variants:**
```tsx
{/* With custom styling */}
<Card className="bg-primary/5 border-primary/20">
  <CardContent>Highlighted card</CardContent>
</Card>

{/* With action */}
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardAction>
      <Button size="sm">Action</Button>
    </CardAction>
  </CardHeader>
</Card>
```

#### Button Component

```tsx
import { Button } from '@/components/ui/button'

{/* Variants */}
<Button variant="default">Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>

{/* Sizes */}
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
```

#### Badge Component

```tsx
import { Badge } from '@/components/ui/badge'

{/* Status badges */}
<Badge variant="default">Active</Badge>
<Badge variant="secondary">Pending</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Draft</Badge>
```

#### Table Component

```tsx
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>
        <Badge>Active</Badge>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

#### Input & Form Components

```tsx
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email" 
    type="email" 
    placeholder="you@example.com"
  />
</div>
```

#### Skeleton Component

For loading states:

```tsx
import { Skeleton } from '@/components/ui/skeleton'

{/* Loading card */}
<Card>
  <CardHeader>
    <Skeleton className="h-6 w-1/3" />
    <Skeleton className="h-4 w-1/2" />
  </CardHeader>
  <CardContent>
    <Skeleton className="h-32 w-full" />
  </CardContent>
</Card>
```

### Charts with Recharts

FlightSight uses Recharts for data visualization with theme integration:

```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <CartesianGrid 
      strokeDasharray="3 3" 
      className="stroke-border" 
    />
    <XAxis 
      dataKey="date"
      className="text-xs fill-muted-foreground"
      tick={{ fill: 'hsl(var(--muted-foreground))' }}
    />
    <YAxis 
      className="text-xs fill-muted-foreground"
      tick={{ fill: 'hsl(var(--muted-foreground))' }}
    />
    <Tooltip 
      contentStyle={{
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: 'var(--radius)',
        padding: '8px',
        color: 'hsl(var(--card-foreground))'
      }}
    />
    <Line 
      type="monotone" 
      dataKey="value" 
      stroke="hsl(var(--chart-1))" 
      strokeWidth={2}
    />
  </LineChart>
</ResponsiveContainer>
```

### Common Patterns

#### Loading States

```tsx
const Component = () => {
  const { data, isLoading } = useQuery()
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }
  
  return <div>{/* Actual content */}</div>
}
```

#### Empty States

```tsx
{data.length === 0 && (
  <div className="flex items-center justify-center h-64 text-muted-foreground">
    <p>No data available</p>
  </div>
)}
```

#### Error States

```tsx
{error && (
  <Card className="border-destructive/50 bg-destructive/5">
    <CardContent className="pt-6">
      <p className="text-destructive">
        {error.message}
      </p>
    </CardContent>
  </Card>
)}
```

---

## Best Practices

### General Guidelines

1. **Always use semantic color tokens** - Never hardcode colors
2. **Prefer component variants** over custom styling
3. **Use consistent spacing** from the spacing scale
4. **Test in both light and dark modes**
5. **Make components responsive** with Tailwind breakpoints

### Accessibility

1. **Use proper heading hierarchy** (h1, h2, h3)
2. **Include alt text** for images
3. **Ensure sufficient color contrast** (use muted-foreground for secondary text)
4. **Add focus states** (components include ring-ring by default)
5. **Use semantic HTML** elements

### Performance

1. **Use Skeleton components** for loading states
2. **Lazy load** heavy components when appropriate
3. **Optimize images** with Next.js Image component
4. **Minimize custom CSS** - prefer Tailwind utilities

### Naming Conventions

```tsx
// Component files: PascalCase
MetricsCards.tsx
BookingsList.tsx

// Utility functions: camelCase
formatDate()
calculateTotal()

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3
const API_ENDPOINT = '/api/bookings'
```

### File Organization

```
components/
├── ui/              # shadcn/ui base components
├── analytics/       # Analytics-specific components
├── booking/         # Booking-specific components
├── shared/          # Shared utility components
└── weather/         # Weather-specific components
```

---

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Recharts Documentation](https://recharts.org/)
- [Next.js Documentation](https://nextjs.org/docs)

---

**Version:** 1.0.0  
**Last Updated:** November 8, 2025

