# Checkbox Component

A fully accessible checkbox component built on Radix UI primitives with FlightSight design system integration.

## Overview

The Checkbox component provides a stylish, accessible way to capture boolean input from users. It's built on @radix-ui/react-checkbox and integrates seamlessly with React Hook Form for form validation.

## Features

- ✅ **Fully Accessible** - WCAG 2.1 AA compliant with proper ARIA attributes
- ✅ **Keyboard Navigation** - Toggle with Space key, navigate with Tab
- ✅ **Form Integration** - Works seamlessly with React Hook Form
- ✅ **Theme Aware** - Automatically adapts to light/dark mode
- ✅ **States** - Checked, unchecked, indeterminate, disabled
- ✅ **TypeScript** - Fully typed with TypeScript
- ✅ **Customizable** - Supports className and all Radix props

## Installation

The checkbox component is already installed in this project via shadcn/ui.

```bash
npx shadcn@latest add checkbox --yes
```

## Basic Usage

### Standalone Checkbox

```tsx
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

function Example() {
  const [checked, setChecked] = React.useState(false)
  
  return (
    <div className="flex items-center space-x-2">
      <Checkbox 
        id="terms" 
        checked={checked}
        onCheckedChange={setChecked}
      />
      <Label 
        htmlFor="terms"
        className="text-sm font-medium cursor-pointer"
      >
        Accept terms and conditions
      </Label>
    </div>
  )
}
```

### With Form (React Hook Form)

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const formSchema = z.object({
  notifications: z.boolean().default(false),
  marketing: z.boolean().default(false),
})

function PreferencesForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notifications: false,
      marketing: false,
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    console.log(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="notifications"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Email notifications
                </FormLabel>
                <FormDescription>
                  Receive emails about your account activity
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="marketing"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Marketing emails
                </FormLabel>
                <FormDescription>
                  Receive emails about new features and promotions
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
```

### Checkbox Group

```tsx
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

const items = [
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'pending', label: 'Pending' },
  { id: 'cancelled', label: 'Cancelled' },
] as const

function StatusFilter() {
  const [selected, setSelected] = React.useState<string[]>([])

  const handleToggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Filter by Status</h3>
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="flex items-center space-x-2">
            <Checkbox
              id={item.id}
              checked={selected.includes(item.id)}
              onCheckedChange={() => handleToggle(item.id)}
            />
            <Label
              htmlFor={item.id}
              className="text-sm font-normal cursor-pointer"
            >
              {item.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Component Props

The Checkbox component accepts all props from Radix UI's Checkbox primitive:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean \| 'indeterminate'` | `false` | The controlled checked state |
| `defaultChecked` | `boolean` | `false` | The default checked state (uncontrolled) |
| `onCheckedChange` | `(checked: boolean \| 'indeterminate') => void` | - | Event handler called when checked state changes |
| `disabled` | `boolean` | `false` | Whether the checkbox is disabled |
| `required` | `boolean` | `false` | Whether the checkbox is required |
| `name` | `string` | - | The name of the checkbox (for forms) |
| `value` | `string` | `'on'` | The value of the checkbox when checked |
| `className` | `string` | - | Additional CSS classes |

## States

### Default (Unchecked)

```tsx
<Checkbox />
```

### Checked

```tsx
<Checkbox checked={true} />
```

### Indeterminate

Useful for "select all" checkboxes when some but not all items are selected:

```tsx
<Checkbox checked="indeterminate" />
```

### Disabled

```tsx
<Checkbox disabled />
<Checkbox checked disabled />
```

### With Error State

Works with Form components for validation feedback:

```tsx
<FormField
  control={form.control}
  name="terms"
  render={({ field }) => (
    <FormItem className="flex flex-row items-start space-x-3">
      <FormControl>
        <Checkbox
          checked={field.value}
          onCheckedChange={field.onChange}
        />
      </FormControl>
      <div className="space-y-1">
        <FormLabel>Accept terms *</FormLabel>
        <FormDescription>
          You must accept the terms and conditions
        </FormDescription>
        <FormMessage />
      </div>
    </FormItem>
  )}
/>
```

## Advanced Patterns

### Select All / Indeterminate

```tsx
function SelectAllExample() {
  const [items, setItems] = React.useState([
    { id: 1, checked: false },
    { id: 2, checked: false },
    { id: 3, checked: false },
  ])

  const allChecked = items.every(item => item.checked)
  const someChecked = items.some(item => item.checked)
  const checkedState = allChecked ? true : someChecked ? 'indeterminate' : false

  const handleSelectAll = () => {
    setItems(prev => prev.map(item => ({ ...item, checked: !allChecked })))
  }

  const handleToggleItem = (id: number) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          checked={checkedState}
          onCheckedChange={handleSelectAll}
          aria-label="Select all"
        />
        <Label className="font-medium">Select All</Label>
      </div>
      
      <div className="ml-6 space-y-2">
        {items.map(item => (
          <div key={item.id} className="flex items-center space-x-2">
            <Checkbox
              checked={item.checked}
              onCheckedChange={() => handleToggleItem(item.id)}
            />
            <Label>Item {item.id}</Label>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Conditional Fields

Show/hide fields based on checkbox state:

```tsx
function ConditionalFields() {
  const [enableAdvanced, setEnableAdvanced] = React.useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="advanced"
          checked={enableAdvanced}
          onCheckedChange={setEnableAdvanced}
        />
        <Label htmlFor="advanced">Enable advanced options</Label>
      </div>

      {enableAdvanced && (
        <div className="ml-6 space-y-4 border-l-2 border-border pl-4">
          <div className="space-y-2">
            <Label htmlFor="option1">Advanced Option 1</Label>
            <Input id="option1" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="option2">Advanced Option 2</Label>
            <Input id="option2" />
          </div>
        </div>
      )}
    </div>
  )
}
```

## Accessibility

The Checkbox component is fully accessible and follows WCAG 2.1 Level AA guidelines:

- ✅ **Keyboard Navigation**
  - `Tab` - Move focus to/from checkbox
  - `Space` - Toggle checked state
  - `Enter` - Submit form (when in a form)

- ✅ **Screen Reader Support**
  - Proper role (`checkbox`) automatically applied
  - State announced correctly (checked/unchecked/indeterminate)
  - Label association via `htmlFor` and `id`
  - Optional `aria-label` for checkboxes without visible labels

- ✅ **Focus Management**
  - Visible focus ring on keyboard navigation
  - Focus ring respects prefers-reduced-motion

- ✅ **Color Contrast**
  - Meets WCAG AA standards (4.5:1)
  - Works in light and dark modes
  - State changes are not communicated by color alone

### Accessibility Best Practices

**DO:**
- Always provide a label (visible or via `aria-label`)
- Use `FormDescription` for additional context
- Group related checkboxes with fieldset/legend or section headings
- Provide clear error messages via `FormMessage`
- Use `required` attribute for required checkboxes

**DON'T:**
- Don't rely on color alone to communicate state
- Don't use checkboxes for mutually exclusive options (use radio buttons instead)
- Don't hide labels unless providing `aria-label`
- Don't use checkboxes for actions (use buttons instead)

## Styling

The checkbox automatically uses theme tokens from your design system:

```tsx
// Custom styling example
<Checkbox className="data-[state=checked]:bg-blue-500" />

// Size variations (custom)
<Checkbox className="size-5" /> {/* Larger */}
<Checkbox className="size-3" /> {/* Smaller */}
```

### Theme Integration

The checkbox uses these design tokens:
- `--border-input` - Border color
- `--primary` - Checked background
- `--primary-foreground` - Check icon color
- `--ring` - Focus ring color
- `--destructive` - Error state color

## Common Patterns

### Terms and Conditions

```tsx
<div className="flex items-start space-x-2">
  <Checkbox id="terms" className="mt-0.5" />
  <Label htmlFor="terms" className="text-sm leading-relaxed">
    I agree to the{' '}
    <a href="/terms" className="underline hover:text-primary">
      Terms and Conditions
    </a>{' '}
    and{' '}
    <a href="/privacy" className="underline hover:text-primary">
      Privacy Policy
    </a>
  </Label>
</div>
```

### Newsletter Signup

```tsx
<div className="flex items-center space-x-2">
  <Checkbox id="newsletter" />
  <Label htmlFor="newsletter" className="flex items-center gap-2">
    <Mail className="h-4 w-4" />
    Subscribe to our newsletter
  </Label>
</div>
```

### Filter with Count

```tsx
<div className="flex items-center justify-between">
  <div className="flex items-center space-x-2">
    <Checkbox id="active" />
    <Label htmlFor="active">Active</Label>
  </div>
  <Badge variant="secondary">12</Badge>
</div>
```

## Related Components

- [Form](./form.tsx) - Form wrapper with validation
- [Label](./label.tsx) - Accessible labels
- [Switch](./switch.tsx) - Toggle switch for on/off states
- [Radio Group](https://ui.shadcn.com/docs/components/radio-group) - Mutually exclusive options

## Migration from Native Checkboxes

If you're currently using native HTML checkboxes:

```tsx
// Before: Native checkbox
<input
  type="checkbox"
  checked={checked}
  onChange={(e) => setChecked(e.target.checked)}
  className="w-4 h-4 rounded border-input"
/>

// After: Checkbox component
<Checkbox
  checked={checked}
  onCheckedChange={setChecked}
/>
```

Key differences:
- Use `onCheckedChange` instead of `onChange`
- No need for `e.target.checked`, value is passed directly
- Styling is built-in, no need for size/border classes
- Automatic accessibility attributes

## Support

For issues or questions, refer to:
- [Design System Documentation](../../DESIGN_SYSTEM.md)
- [Accessibility Guidelines](../../docs/ACCESSIBILITY_GUIDELINES.md)
- [Radix UI Checkbox Docs](https://www.radix-ui.com/primitives/docs/components/checkbox)
- [shadcn/ui Checkbox](https://ui.shadcn.com/docs/components/checkbox)

