# RadioGroup Component

A fully accessible radio button component built on Radix UI primitives with FlightSight design system integration.

## Overview

The RadioGroup component provides a stylish, accessible way to capture single-selection input from users. It's built on @radix-ui/react-radio-group and integrates seamlessly with React Hook Form for form validation.

## Features

- ✅ **Fully Accessible** - WCAG 2.1 AA compliant with proper ARIA attributes
- ✅ **Keyboard Navigation** - Navigate with Arrow keys, select with Space, Tab between groups
- ✅ **Form Integration** - Works seamlessly with React Hook Form
- ✅ **Theme Aware** - Automatically adapts to light/dark mode
- ✅ **Single Selection** - Enforces mutually exclusive options
- ✅ **TypeScript** - Fully typed with TypeScript
- ✅ **Customizable** - Supports className and all Radix props
- ✅ **Roving Tabindex** - Intelligent focus management within the group

## Installation

The radio-group component is already installed in this project via shadcn/ui.

```bash
npx shadcn@latest add radio-group --yes
```

## Basic Usage

### Standalone RadioGroup

```tsx
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

function Example() {
  const [value, setValue] = React.useState('option-1')
  
  return (
    <RadioGroup value={value} onValueChange={setValue}>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-1" id="option-1" />
        <Label htmlFor="option-1">Option 1</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-2" id="option-2" />
        <Label htmlFor="option-2">Option 2</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-3" id="option-3" />
        <Label htmlFor="option-3">Option 3</Label>
      </div>
    </RadioGroup>
  )
}
```

### With Form (React Hook Form)

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Label } from '@/components/ui/label'

const formSchema = z.object({
  notificationMethod: z.enum(['email', 'sms', 'push'], {
    required_error: "Please select a notification method.",
  }),
})

function NotificationForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    console.log(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="notificationMethod"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Notification Method</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="email" />
                    <Label htmlFor="email" className="font-normal">
                      Email
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sms" id="sms" />
                    <Label htmlFor="sms" className="font-normal">
                      SMS
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="push" id="push" />
                    <Label htmlFor="push" className="font-normal">
                      Push Notification
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormDescription>
                Select your preferred notification method
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit">Submit</button>
      </form>
    </Form>
  )
}
```

### With Descriptions

```tsx
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

function PaymentMethodSelector() {
  const [method, setMethod] = React.useState('card')

  return (
    <RadioGroup value={method} onValueChange={setMethod}>
      <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
        <RadioGroupItem value="card" id="card" className="mt-0.5" />
        <div className="space-y-1">
          <Label htmlFor="card" className="font-medium">
            Credit/Debit Card
          </Label>
          <p className="text-sm text-muted-foreground">
            Pay with your credit or debit card
          </p>
        </div>
      </div>
      
      <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
        <RadioGroupItem value="paypal" id="paypal" className="mt-0.5" />
        <div className="space-y-1">
          <Label htmlFor="paypal" className="font-medium">
            PayPal
          </Label>
          <p className="text-sm text-muted-foreground">
            Pay securely with PayPal
          </p>
        </div>
      </div>
      
      <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
        <RadioGroupItem value="bank" id="bank" className="mt-0.5" />
        <div className="space-y-1">
          <Label htmlFor="bank" className="font-medium">
            Bank Transfer
          </Label>
          <p className="text-sm text-muted-foreground">
            Direct bank transfer (2-3 business days)
          </p>
        </div>
      </div>
    </RadioGroup>
  )
}
```

## Component Props

### RadioGroup Props

The RadioGroup component accepts all props from Radix UI's RadioGroup primitive:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | The controlled value of the selected radio item |
| `defaultValue` | `string` | - | The default value (uncontrolled) |
| `onValueChange` | `(value: string) => void` | - | Event handler called when value changes |
| `disabled` | `boolean` | `false` | Whether the entire group is disabled |
| `required` | `boolean` | `false` | Whether the group is required |
| `name` | `string` | - | The name of the group (for forms) |
| `orientation` | `'horizontal' \| 'vertical'` | `'vertical'` | Layout orientation |
| `loop` | `boolean` | `true` | Whether arrow key navigation wraps around |
| `className` | `string` | - | Additional CSS classes |

### RadioGroupItem Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | Required. The value of this radio item |
| `disabled` | `boolean` | `false` | Whether this specific item is disabled |
| `id` | `string` | - | ID for label association |
| `className` | `string` | - | Additional CSS classes |

## States

### Default (Unselected)

```tsx
<RadioGroup>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-1" id="option-1" />
    <Label htmlFor="option-1">Option 1</Label>
  </div>
</RadioGroup>
```

### Selected

```tsx
<RadioGroup defaultValue="option-1">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-1" id="option-1" />
    <Label htmlFor="option-1">Option 1</Label>
  </div>
</RadioGroup>
```

### Disabled Group

All items disabled:

```tsx
<RadioGroup disabled>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-1" id="option-1" />
    <Label htmlFor="option-1">Option 1</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-2" id="option-2" />
    <Label htmlFor="option-2">Option 2</Label>
  </div>
</RadioGroup>
```

### Disabled Individual Items

```tsx
<RadioGroup>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-1" id="option-1" />
    <Label htmlFor="option-1">Option 1</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-2" id="option-2" disabled />
    <Label htmlFor="option-2" className="text-muted-foreground">
      Option 2 (Unavailable)
    </Label>
  </div>
</RadioGroup>
```

### With Error State

Works with Form components for validation feedback:

```tsx
<FormField
  control={form.control}
  name="type"
  render={({ field }) => (
    <FormItem className="space-y-3">
      <FormLabel>Account Type *</FormLabel>
      <FormControl>
        <RadioGroup
          onValueChange={field.onChange}
          defaultValue={field.value}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="personal" id="personal" />
            <Label htmlFor="personal">Personal</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="business" id="business" />
            <Label htmlFor="business">Business</Label>
          </div>
        </RadioGroup>
      </FormControl>
      <FormDescription>
        Select your account type
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

## Layout Patterns

### Vertical Layout (Default)

```tsx
<RadioGroup defaultValue="option-1">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-1" id="option-1" />
    <Label htmlFor="option-1">Option 1</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-2" id="option-2" />
    <Label htmlFor="option-2">Option 2</Label>
  </div>
</RadioGroup>
```

### Horizontal Layout

```tsx
<RadioGroup defaultValue="option-1" className="flex space-x-4">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-1" id="option-1" />
    <Label htmlFor="option-1">Option 1</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-2" id="option-2" />
    <Label htmlFor="option-2">Option 2</Label>
  </div>
</RadioGroup>
```

### Card Layout

```tsx
<RadioGroup defaultValue="basic">
  <div className="flex items-center space-x-2 rounded-lg border border-input p-4 hover:bg-accent">
    <RadioGroupItem value="basic" id="basic" />
    <Label htmlFor="basic" className="flex flex-col space-y-1 cursor-pointer flex-1">
      <span className="font-medium">Basic Plan</span>
      <span className="text-sm text-muted-foreground">
        $9/month - Perfect for individuals
      </span>
    </Label>
  </div>
  
  <div className="flex items-center space-x-2 rounded-lg border border-input p-4 hover:bg-accent">
    <RadioGroupItem value="pro" id="pro" />
    <Label htmlFor="pro" className="flex flex-col space-y-1 cursor-pointer flex-1">
      <span className="font-medium">Pro Plan</span>
      <span className="text-sm text-muted-foreground">
        $29/month - For growing teams
      </span>
    </Label>
  </div>
</RadioGroup>
```

## Advanced Patterns

### Conditional Content

Show different content based on selected option:

```tsx
function ShippingOptions() {
  const [shipping, setShipping] = React.useState('standard')

  return (
    <div className="space-y-4">
      <RadioGroup value={shipping} onValueChange={setShipping}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="standard" id="standard" />
          <Label htmlFor="standard">Standard (3-5 business days) - Free</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="express" id="express" />
          <Label htmlFor="express">Express (1-2 business days) - $15</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="overnight" id="overnight" />
          <Label htmlFor="overnight">Overnight - $30</Label>
        </div>
      </RadioGroup>

      {shipping === 'overnight' && (
        <div className="ml-6 rounded-lg border border-yellow-500 bg-yellow-50 p-3 text-sm text-yellow-900">
          <p className="font-medium">⚡ Overnight shipping selected</p>
          <p className="text-xs mt-1">Order must be placed before 2 PM for same-day dispatch</p>
        </div>
      )}
    </div>
  )
}
```

### With Icons

```tsx
import { CreditCard, Wallet, Building2 } from 'lucide-react'

<RadioGroup defaultValue="card">
  <div className="flex items-center space-x-3">
    <RadioGroupItem value="card" id="card" />
    <Label htmlFor="card" className="flex items-center gap-2">
      <CreditCard className="h-4 w-4" />
      Credit Card
    </Label>
  </div>
  <div className="flex items-center space-x-3">
    <RadioGroupItem value="wallet" id="wallet" />
    <Label htmlFor="wallet" className="flex items-center gap-2">
      <Wallet className="h-4 w-4" />
      Digital Wallet
    </Label>
  </div>
  <div className="flex items-center space-x-3">
    <RadioGroupItem value="bank" id="bank" />
    <Label htmlFor="bank" className="flex items-center gap-2">
      <Building2 className="h-4 w-4" />
      Bank Transfer
    </Label>
  </div>
</RadioGroup>
```

### Nested Options

```tsx
function DeliveryPreferences() {
  const [delivery, setDelivery] = React.useState('home')
  const [homeOption, setHomeOption] = React.useState('front-door')

  return (
    <div className="space-y-4">
      <RadioGroup value={delivery} onValueChange={setDelivery}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="pickup" id="pickup" />
          <Label htmlFor="pickup">Pick up at store</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="home" id="home" />
          <Label htmlFor="home">Home delivery</Label>
        </div>
      </RadioGroup>

      {delivery === 'home' && (
        <div className="ml-6 space-y-2 border-l-2 border-border pl-4">
          <p className="text-sm font-medium">Delivery location</p>
          <RadioGroup value={homeOption} onValueChange={setHomeOption} className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="front-door" id="front-door" />
              <Label htmlFor="front-door" className="text-sm font-normal">
                Front door
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="back-door" id="back-door" />
              <Label htmlFor="back-door" className="text-sm font-normal">
                Back door
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="mailbox" id="mailbox" />
              <Label htmlFor="mailbox" className="text-sm font-normal">
                Mailbox
              </Label>
            </div>
          </RadioGroup>
        </div>
      )}
    </div>
  )
}
```

## Accessibility

The RadioGroup component is fully accessible and follows WCAG 2.1 Level AA guidelines:

- ✅ **Keyboard Navigation**
  - `Tab` - Move focus to/from radio group (focuses checked item, or first item if none checked)
  - `Arrow Up/Down` - Navigate between radio items (vertical orientation)
  - `Arrow Left/Right` - Navigate between radio items (horizontal orientation)
  - `Space` - Select the focused radio item
  - Arrow navigation automatically wraps around (can be disabled with `loop={false}`)

- ✅ **Screen Reader Support**
  - Proper role (`radiogroup` for group, `radio` for items) automatically applied
  - State announced correctly (selected/not selected)
  - Label association via `htmlFor` and `id`
  - Group can have `aria-label` or be labeled by a heading
  - Roving tabindex ensures only one item is in tab sequence

- ✅ **Focus Management**
  - Visible focus ring on keyboard navigation
  - Focus ring respects prefers-reduced-motion
  - Intelligent roving tabindex - only the selected (or first) item is tabbable

- ✅ **Color Contrast**
  - Meets WCAG AA standards (4.5:1)
  - Works in light and dark modes
  - State changes are not communicated by color alone (uses filled circle indicator)

### Accessibility Best Practices

**DO:**
- Always provide a group label via `aria-label` or a visible heading
- Always provide labels for individual radio items (visible or via `aria-label`)
- Use `FormDescription` for additional context
- Provide clear error messages via `FormMessage`
- Use `required` attribute for required selections
- Group related radio buttons together

**DON'T:**
- Don't use radio buttons for non-exclusive options (use checkboxes instead)
- Don't rely on color alone to communicate state
- Don't hide labels unless providing `aria-label`
- Don't use radio buttons for actions (use buttons instead)
- Don't have more than 5-7 options (consider a select dropdown instead)

## Styling

The radio button automatically uses theme tokens from your design system:

```tsx
// Custom styling example
<RadioGroupItem className="border-blue-500 text-blue-600" value="custom" />

// Size variations (custom)
<RadioGroupItem className="size-5" value="large" /> {/* Larger */}
<RadioGroupItem className="size-3" value="small" /> {/* Smaller */}

// Custom spacing
<RadioGroup className="space-y-4"> {/* More space between items */}
  {/* items */}
</RadioGroup>
```

### Theme Integration

The radio button uses these design tokens:
- `--border-input` - Border color
- `--primary` - Selected indicator color
- `--ring` - Focus ring color
- `--destructive` - Error state color
- `--muted` - Disabled state background

## Common Patterns

### Size Selection

```tsx
<RadioGroup defaultValue="m">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="xs" id="xs" />
    <Label htmlFor="xs">Extra Small</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="s" id="s" />
    <Label htmlFor="s">Small</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="m" id="m" />
    <Label htmlFor="m">Medium</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="l" id="l" />
    <Label htmlFor="l">Large</Label>
  </div>
</RadioGroup>
```

### Priority Selection

```tsx
<RadioGroup defaultValue="medium">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="low" id="low" />
    <Label htmlFor="low" className="flex items-center gap-2">
      <span className="h-2 w-2 rounded-full bg-green-500" />
      Low Priority
    </Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="medium" id="medium" />
    <Label htmlFor="medium" className="flex items-center gap-2">
      <span className="h-2 w-2 rounded-full bg-yellow-500" />
      Medium Priority
    </Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="high" id="high" />
    <Label htmlFor="high" className="flex items-center gap-2">
      <span className="h-2 w-2 rounded-full bg-red-500" />
      High Priority
    </Label>
  </div>
</RadioGroup>
```

### Rating/Satisfaction

```tsx
<RadioGroup defaultValue="satisfied" className="flex space-x-6">
  <div className="flex flex-col items-center space-y-2">
    <RadioGroupItem value="very-unsatisfied" id="very-unsatisfied" />
    <Label htmlFor="very-unsatisfied" className="text-xs">😞</Label>
  </div>
  <div className="flex flex-col items-center space-y-2">
    <RadioGroupItem value="unsatisfied" id="unsatisfied" />
    <Label htmlFor="unsatisfied" className="text-xs">🙁</Label>
  </div>
  <div className="flex flex-col items-center space-y-2">
    <RadioGroupItem value="neutral" id="neutral" />
    <Label htmlFor="neutral" className="text-xs">😐</Label>
  </div>
  <div className="flex flex-col items-center space-y-2">
    <RadioGroupItem value="satisfied" id="satisfied" />
    <Label htmlFor="satisfied" className="text-xs">🙂</Label>
  </div>
  <div className="flex flex-col items-center space-y-2">
    <RadioGroupItem value="very-satisfied" id="very-satisfied" />
    <Label htmlFor="very-satisfied" className="text-xs">😄</Label>
  </div>
</RadioGroup>
```

## Related Components

- [Form](./form.tsx) - Form wrapper with validation
- [Label](./label.tsx) - Accessible labels
- [Checkbox](./checkbox.tsx) - For multiple selections
- [Select](./select.tsx) - For many options (dropdown)
- [Switch](./switch.tsx) - Toggle switch for binary states

## When to Use RadioGroup vs Other Components

### Use RadioGroup when:
- User must select exactly ONE option from a set
- Options are 2-7 in number (for visibility)
- All options should be visible at once
- Selection changes the form/page state

### Use Checkbox when:
- User can select ZERO, ONE, or MULTIPLE options
- Each option is independent
- Options can be toggled on/off

### Use Select when:
- Options are more than 7
- Screen space is limited
- Options are familiar (like country selection)

### Use Switch when:
- Only TWO options (binary on/off)
- Change takes effect immediately
- Represents system state or settings

## Migration from Native Radio Buttons

If you're currently using native HTML radio buttons:

```tsx
// Before: Native radio
<input
  type="radio"
  name="option"
  value="option1"
  checked={value === 'option1'}
  onChange={(e) => setValue(e.target.value)}
/>

// After: RadioGroup component
<RadioGroup value={value} onValueChange={setValue}>
  <RadioGroupItem value="option1" id="option1" />
  <Label htmlFor="option1">Option 1</Label>
</RadioGroup>
```

Key differences:
- Use `onValueChange` instead of `onChange`
- No need for `e.target.value`, value is passed directly
- No need to manage `name` attribute per item
- Styling is built-in, no need for custom classes
- Automatic accessibility attributes
- Built-in keyboard navigation

## Support

For issues or questions, refer to:
- [Design System Documentation](../../DESIGN_SYSTEM.md)
- [Accessibility Guidelines](../../docs/ACCESSIBILITY_GUIDELINES.md)
- [Radix UI RadioGroup Docs](https://www.radix-ui.com/primitives/docs/components/radio-group)
- [shadcn/ui RadioGroup](https://ui.shadcn.com/docs/components/radio-group)

