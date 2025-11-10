# Switch Component

A fully accessible toggle switch component built on Radix UI primitives with FlightSight design system integration.

## Overview

The Switch component provides a stylish, accessible way to toggle between on and off states. It's built on @radix-ui/react-switch and integrates seamlessly with React Hook Form for form validation. Perfect for settings, preferences, and binary states.

## Features

- ✅ **Fully Accessible** - WCAG 2.1 AA compliant with proper ARIA attributes
- ✅ **Keyboard Navigation** - Toggle with Space or Enter, navigate with Tab
- ✅ **Form Integration** - Works seamlessly with React Hook Form
- ✅ **Theme Aware** - Automatically adapts to light/dark mode
- ✅ **Smooth Animations** - Butter-smooth transitions between states
- ✅ **TypeScript** - Fully typed with TypeScript
- ✅ **Customizable** - Supports className and all Radix props
- ✅ **Instant Feedback** - Perfect for settings that take effect immediately

## Installation

The switch component is already installed in this project via shadcn/ui.

```bash
npx shadcn@latest add switch --yes
```

## Basic Usage

### Standalone Switch

```tsx
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

function Example() {
  const [enabled, setEnabled] = React.useState(false)
  
  return (
    <div className="flex items-center space-x-2">
      <Switch 
        id="airplane-mode" 
        checked={enabled}
        onCheckedChange={setEnabled}
      />
      <Label htmlFor="airplane-mode">Airplane Mode</Label>
    </div>
  )
}
```

### With Form (React Hook Form)

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Switch } from '@/components/ui/switch'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form'

const formSchema = z.object({
  notifications: z.boolean().default(false),
  marketing: z.boolean().default(false),
})

function SettingsForm() {
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
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Push Notifications
                </FormLabel>
                <FormDescription>
                  Receive notifications about your account activity
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="marketing"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Marketing Emails
                </FormLabel>
                <FormDescription>
                  Receive emails about new features and promotions
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
```

### Settings Panel

```tsx
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function NotificationSettings() {
  const [emailNotifications, setEmailNotifications] = React.useState(true)
  const [pushNotifications, setPushNotifications] = React.useState(false)
  const [smsNotifications, setSmsNotifications] = React.useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Manage how you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="email" className="flex flex-col space-y-1">
            <span>Email Notifications</span>
            <span className="font-normal text-sm text-muted-foreground">
              Receive email updates about your account
            </span>
          </Label>
          <Switch
            id="email"
            checked={emailNotifications}
            onCheckedChange={setEmailNotifications}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="push" className="flex flex-col space-y-1">
            <span>Push Notifications</span>
            <span className="font-normal text-sm text-muted-foreground">
              Get push notifications on your device
            </span>
          </Label>
          <Switch
            id="push"
            checked={pushNotifications}
            onCheckedChange={setPushNotifications}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="sms" className="flex flex-col space-y-1">
            <span>SMS Notifications</span>
            <span className="font-normal text-sm text-muted-foreground">
              Receive text messages about urgent updates
            </span>
          </Label>
          <Switch
            id="sms"
            checked={smsNotifications}
            onCheckedChange={setSmsNotifications}
          />
        </div>
      </CardContent>
    </Card>
  )
}
```

## Component Props

The Switch component accepts all props from Radix UI's Switch primitive:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean` | `false` | The controlled checked state |
| `defaultChecked` | `boolean` | `false` | The default checked state (uncontrolled) |
| `onCheckedChange` | `(checked: boolean) => void` | - | Event handler called when checked state changes |
| `disabled` | `boolean` | `false` | Whether the switch is disabled |
| `required` | `boolean` | `false` | Whether the switch is required |
| `name` | `string` | - | The name of the switch (for forms) |
| `value` | `string` | `'on'` | The value of the switch when checked |
| `className` | `string` | - | Additional CSS classes |

## States

### Default (Unchecked)

```tsx
<Switch />
```

### Checked

```tsx
<Switch checked={true} />
```

### Disabled

```tsx
<Switch disabled />
<Switch checked disabled />
```

### With Label

```tsx
<div className="flex items-center space-x-2">
  <Switch id="feature" />
  <Label htmlFor="feature">Enable Feature</Label>
</div>
```

### With Description

```tsx
<div className="flex items-center justify-between">
  <div className="space-y-0.5">
    <Label htmlFor="feature">Enable Feature</Label>
    <p className="text-sm text-muted-foreground">
      This feature enhances your experience
    </p>
  </div>
  <Switch id="feature" />
</div>
```

## Layout Patterns

### Horizontal (Default)

```tsx
<div className="flex items-center space-x-2">
  <Switch id="setting" />
  <Label htmlFor="setting">Setting Name</Label>
</div>
```

### Justified (Settings)

```tsx
<div className="flex items-center justify-between">
  <Label htmlFor="setting">Setting Name</Label>
  <Switch id="setting" />
</div>
```

### Card Layout

```tsx
<div className="flex items-center justify-between rounded-lg border p-4">
  <div className="space-y-0.5">
    <Label htmlFor="setting" className="text-base">
      Setting Name
    </Label>
    <p className="text-sm text-muted-foreground">
      Description of what this setting does
    </p>
  </div>
  <Switch id="setting" />
</div>
```

### Grouped Settings

```tsx
<div className="space-y-4">
  <h3 className="text-lg font-medium">Privacy Settings</h3>
  
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <Label htmlFor="public-profile">Public Profile</Label>
      <Switch id="public-profile" />
    </div>
    
    <div className="flex items-center justify-between">
      <Label htmlFor="show-email">Show Email</Label>
      <Switch id="show-email" />
    </div>
    
    <div className="flex items-center justify-between">
      <Label htmlFor="show-phone">Show Phone</Label>
      <Switch id="show-phone" />
    </div>
  </div>
</div>
```

## Advanced Patterns

### With Confirmation Dialog

Show a dialog before changing sensitive settings:

```tsx
import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

function DangerousSettingSwitch() {
  const [enabled, setEnabled] = React.useState(false)
  const [showDialog, setShowDialog] = React.useState(false)

  const handleChange = (checked: boolean) => {
    if (checked) {
      setShowDialog(true)
    } else {
      setEnabled(false)
    }
  }

  const confirmEnable = () => {
    setEnabled(true)
    setShowDialog(false)
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <Label htmlFor="dangerous">
          <span className="flex items-center gap-2">
            <span>Enable Dangerous Feature</span>
            <Badge variant="destructive">Caution</Badge>
          </span>
        </Label>
        <Switch
          id="dangerous"
          checked={enabled}
          onCheckedChange={handleChange}
        />
      </div>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently enable
              dangerous features that may affect your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmEnable}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
```

### With Loading State

Show loading state while saving:

```tsx
function SwitchWithLoading() {
  const [enabled, setEnabled] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const handleChange = async (checked: boolean) => {
    setLoading(true)
    try {
      await updateSetting(checked) // API call
      setEnabled(checked)
    } catch (error) {
      console.error('Failed to update setting', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-between">
      <Label htmlFor="feature">
        Feature Name
        {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
      </Label>
      <Switch
        id="feature"
        checked={enabled}
        onCheckedChange={handleChange}
        disabled={loading}
      />
    </div>
  )
}
```

### Conditional Content

Show/hide content based on switch state:

```tsx
function ConditionalContent() {
  const [showAdvanced, setShowAdvanced] = React.useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="advanced"
          checked={showAdvanced}
          onCheckedChange={setShowAdvanced}
        />
        <Label htmlFor="advanced">Show advanced settings</Label>
      </div>

      {showAdvanced && (
        <Card>
          <CardHeader>
            <CardTitle>Advanced Settings</CardTitle>
            <CardDescription>
              Configure advanced options
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Advanced settings here */}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

### With Icons

```tsx
import { Bell, BellOff } from 'lucide-react'

function SwitchWithIcon() {
  const [enabled, setEnabled] = React.useState(false)

  return (
    <div className="flex items-center space-x-2">
      {enabled ? (
        <Bell className="h-4 w-4 text-primary" />
      ) : (
        <BellOff className="h-4 w-4 text-muted-foreground" />
      )}
      <Switch
        id="notifications"
        checked={enabled}
        onCheckedChange={setEnabled}
      />
      <Label htmlFor="notifications">
        Notifications {enabled ? 'On' : 'Off'}
      </Label>
    </div>
  )
}
```

## Accessibility

The Switch component is fully accessible and follows WCAG 2.1 Level AA guidelines:

- ✅ **Keyboard Navigation**
  - `Tab` - Move focus to/from switch
  - `Space` - Toggle switch state
  - `Enter` - Toggle switch state

- ✅ **Screen Reader Support**
  - Proper role (`switch`) automatically applied
  - State announced correctly (on/off)
  - Label association via `htmlFor` and `id`
  - Optional `aria-label` for switches without visible labels
  - `aria-checked` attribute reflects current state

- ✅ **Focus Management**
  - Visible focus ring on keyboard navigation
  - Focus ring respects prefers-reduced-motion
  - Clear visual indication of interactive element

- ✅ **Color Contrast**
  - Meets WCAG AA standards (4.5:1)
  - Works in light and dark modes
  - State changes are not communicated by color alone (thumb position changes)

### Accessibility Best Practices

**DO:**
- Always provide a label (visible or via `aria-label`)
- Use descriptive labels that explain what the switch controls
- Provide additional context via descriptions when the action isn't obvious
- Group related switches with section headings
- Use appropriate labels for state ("On/Off" or "Enabled/Disabled")

**DON'T:**
- Don't use switches for actions (use buttons instead)
- Don't rely on color alone to communicate state
- Don't hide labels unless providing `aria-label`
- Don't use switches for navigation (use tabs or buttons)
- Don't use switches when the change requires a save action (use checkbox + save button)

## When to Use Switch vs Other Components

### Use Switch when:
- Setting takes effect **immediately** (no save button needed)
- Represents a **binary state** (on/off, enabled/disabled)
- Used for **settings and preferences**
- Change is **reversible** and low-risk

### Use Checkbox when:
- Selection is part of a **form that requires submission**
- Used for **agreements** (terms, privacy policy)
- Part of a **multi-select** list
- Requires a **Save** or **Submit** button

### Use Radio Button when:
- User must select **one option from many**
- Options are **mutually exclusive**
- All options should be **visible** at once

### Use Select/Dropdown when:
- More than **7 options** available
- Options are **familiar** (countries, states)
- Screen space is **limited**

## Styling

The switch automatically uses theme tokens from your design system:

```tsx
// Custom styling example
<Switch className="data-[state=checked]:bg-green-500" />

// Disabled appearance
<Switch className="disabled:opacity-30" />
```

### Theme Integration

The switch uses these design tokens:
- `--primary` - Checked background color
- `--input` - Unchecked background color
- `--background` - Thumb color (light mode)
- `--foreground` - Thumb color (dark mode unchecked)
- `--primary-foreground` - Thumb color (dark mode checked)
- `--ring` - Focus ring color

## Common Patterns

### Dark Mode Toggle

```tsx
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

function DarkModeToggle() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="flex items-center space-x-2">
      <Sun className="h-4 w-4" />
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
      />
      <Moon className="h-4 w-4" />
    </div>
  )
}
```

### Two-Factor Authentication

```tsx
<div className="flex items-center justify-between rounded-lg border border-yellow-500 bg-yellow-50 p-4">
  <div className="space-y-0.5">
    <Label htmlFor="2fa" className="text-base">
      Two-Factor Authentication
    </Label>
    <p className="text-sm text-muted-foreground">
      Add an extra layer of security to your account
    </p>
  </div>
  <Switch id="2fa" />
</div>
```

### Notification Preferences

```tsx
<div className="space-y-3">
  <div className="flex items-center justify-between">
    <Label htmlFor="email-notif">Email Notifications</Label>
    <Switch id="email-notif" defaultChecked />
  </div>
  
  <div className="flex items-center justify-between">
    <Label htmlFor="push-notif">Push Notifications</Label>
    <Switch id="push-notif" />
  </div>
  
  <div className="flex items-center justify-between">
    <Label htmlFor="sms-notif">SMS Notifications</Label>
    <Switch id="sms-notif" />
  </div>
</div>
```

### Privacy Settings

```tsx
<div className="space-y-4">
  <div className="flex items-center justify-between">
    <Label htmlFor="public">Public Profile</Label>
    <Switch id="public" defaultChecked />
  </div>
  
  <div className="flex items-center justify-between">
    <Label htmlFor="email-visible">Show Email Address</Label>
    <Switch id="email-visible" />
  </div>
  
  <div className="flex items-center justify-between">
    <Label htmlFor="activity">Show Activity Status</Label>
    <Switch id="activity" defaultChecked />
  </div>
</div>
```

## Related Components

- [Checkbox](./checkbox.tsx) - For selections that require a save action
- [Radio Group](./radio-group.tsx) - For mutually exclusive options
- [Label](./label.tsx) - Accessible labels
- [Form](./form.tsx) - Form wrapper with validation
- [Card](./card.tsx) - Card container for settings

## Migration from Native Checkboxes

If you're currently using checkboxes for settings:

```tsx
// Before: Checkbox for instant settings
<input
  type="checkbox"
  checked={enabled}
  onChange={(e) => {
    setEnabled(e.target.checked)
    updateSetting(e.target.checked) // Immediate effect
  }}
/>

// After: Switch component (more appropriate)
<Switch
  checked={enabled}
  onCheckedChange={(checked) => {
    setEnabled(checked)
    updateSetting(checked)
  }}
/>
```

Key differences:
- Use `onCheckedChange` instead of `onChange`
- No need for `e.target.checked`, value is passed directly
- More appropriate semantics for on/off states
- Better visual indication of state
- Automatic accessibility attributes

## Design Guidelines

### Visual Hierarchy
- Place switches on the **right side** in settings lists
- Align switches vertically for consistency
- Use consistent spacing between switch groups
- Keep labels left-aligned with descriptions below

### Grouping
- Group related switches under section headings
- Use cards or borders to separate switch groups
- Maintain visual hierarchy with typography

### Feedback
- Provide immediate visual feedback on toggle
- Use loading states for async operations
- Show confirmation dialogs for destructive actions
- Display toast notifications for successful changes

## Support

For issues or questions, refer to:
- [Design System Documentation](../../DESIGN_SYSTEM.md)
- [Accessibility Guidelines](../../docs/ACCESSIBILITY_GUIDELINES.md)
- [Radix UI Switch Docs](https://www.radix-ui.com/primitives/docs/components/switch)
- [shadcn/ui Switch](https://ui.shadcn.com/docs/components/switch)

