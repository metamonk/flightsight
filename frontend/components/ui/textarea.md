# Textarea Component

A fully accessible textarea component for multi-line text input, built with FlightSight design system integration.

## Overview

The Textarea component provides a stylish, accessible way to capture multi-line text input from users. It features automatic resizing, full keyboard support, and integrates seamlessly with React Hook Form for form validation.

## Features

- ✅ **Fully Accessible** - WCAG 2.1 AA compliant with proper ARIA attributes
- ✅ **Auto-resizing** - Automatically adjusts height based on content
- ✅ **Keyboard Navigation** - Full keyboard support with Tab and text editing
- ✅ **Form Integration** - Works seamlessly with React Hook Form
- ✅ **Theme Aware** - Automatically adapts to light/dark mode
- ✅ **States** - Default, focused, disabled, error states
- ✅ **TypeScript** - Fully typed with TypeScript
- ✅ **Customizable** - Supports className and all native textarea props

## Installation

The textarea component is available in this project.

```bash
npx shadcn@latest add textarea --yes
```

## Basic Usage

### Standalone Textarea

```tsx
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

function Example() {
  const [value, setValue] = React.useState('')
  
  return (
    <div className="space-y-2">
      <Label htmlFor="message">Message</Label>
      <Textarea 
        id="message"
        placeholder="Type your message here..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  )
}
```

### With Form (React Hook Form)

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'

const formSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters'),
  notes: z.string().optional(),
})

function FeedbackForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      notes: '',
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your issue..."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide a detailed description of your feedback
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional information..."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional supplementary information
              </FormDescription>
            </FormItem>
          )}
        />

        <Button type="submit">Submit Feedback</Button>
      </form>
    </Form>
  )
}
```

### Controlled with Character Count

```tsx
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

function CharacterCountExample() {
  const [value, setValue] = React.useState('')
  const maxLength = 500

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label htmlFor="bio">Bio</Label>
        <span className="text-sm text-muted-foreground">
          {value.length}/{maxLength}
        </span>
      </div>
      <Textarea 
        id="bio"
        placeholder="Tell us about yourself..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={maxLength}
      />
    </div>
  )
}
```

## Component Props

The Textarea component accepts all props from native HTML textarea element:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | The controlled value |
| `defaultValue` | `string` | - | The default value (uncontrolled) |
| `onChange` | `(e: React.ChangeEvent<HTMLTextAreaElement>) => void` | - | Event handler called when value changes |
| `placeholder` | `string` | - | Placeholder text when empty |
| `disabled` | `boolean` | `false` | Whether the textarea is disabled |
| `required` | `boolean` | `false` | Whether the textarea is required |
| `name` | `string` | - | The name of the textarea (for forms) |
| `rows` | `number` | - | Number of visible text rows (overrides min-height) |
| `maxLength` | `number` | - | Maximum number of characters allowed |
| `minLength` | `number` | - | Minimum number of characters required |
| `aria-invalid` | `boolean` | - | Indicates validation error state |
| `className` | `string` | - | Additional CSS classes |

## States

### Default

```tsx
<Textarea placeholder="Enter text..." />
```

### With Value

```tsx
<Textarea value="This is some text content" />
```

### Disabled

```tsx
<Textarea disabled placeholder="Cannot edit..." />
<Textarea disabled value="Read-only content" />
```

### With Error State

The textarea automatically shows error styling when `aria-invalid` is set:

```tsx
<Textarea aria-invalid placeholder="Invalid input..." />
```

Works with Form components for validation feedback:

```tsx
<FormField
  control={form.control}
  name="description"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Description *</FormLabel>
      <FormControl>
        <Textarea
          placeholder="Required field..."
          {...field}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Custom Size

```tsx
{/* Taller textarea */}
<Textarea rows={8} placeholder="Larger text area..." />

{/* Custom minimum height */}
<Textarea className="min-h-32" placeholder="Custom height..." />
```

## Advanced Patterns

### Auto-expanding Textarea

The textarea automatically expands based on content using `field-sizing-content`:

```tsx
<Textarea 
  placeholder="Start typing and watch this expand..."
  className="max-h-64 overflow-y-auto"
/>
```

### With Helper Text

```tsx
function HelperTextExample() {
  const [value, setValue] = React.useState('')

  return (
    <div className="space-y-2">
      <Label htmlFor="feedback">Feedback</Label>
      <Textarea
        id="feedback"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Share your thoughts..."
      />
      <p className="text-sm text-muted-foreground">
        Your feedback helps us improve our service
      </p>
    </div>
  )
}
```

### Markdown Editor Preview

```tsx
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

function MarkdownEditor() {
  const [markdown, setMarkdown] = React.useState('')

  return (
    <Tabs defaultValue="edit">
      <TabsList>
        <TabsTrigger value="edit">Edit</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>
      
      <TabsContent value="edit" className="space-y-2">
        <Textarea
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          placeholder="# Write markdown here..."
          rows={10}
        />
      </TabsContent>
      
      <TabsContent value="preview">
        <div className="min-h-64 p-4 border rounded-md">
          {/* Rendered markdown preview */}
          {markdown || 'Nothing to preview yet...'}
        </div>
      </TabsContent>
    </Tabs>
  )
}
```

### Comments Section

```tsx
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

function CommentBox() {
  const [comment, setComment] = React.useState('')

  const handleSubmit = () => {
    // Submit comment
    setComment('')
  }

  return (
    <div className="flex gap-4">
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-2">
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write a comment..."
          rows={3}
        />
        <div className="flex justify-end">
          <Button 
            onClick={handleSubmit}
            disabled={!comment.trim()}
          >
            Post Comment
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### Multi-section Form

```tsx
function TicketForm() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="subject">Subject *</Label>
        <Input id="subject" placeholder="Brief summary..." />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          placeholder="Detailed description of the issue..."
          rows={6}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="steps">Steps to Reproduce</Label>
        <Textarea
          id="steps"
          placeholder="1. Go to...&#10;2. Click on...&#10;3. See error"
          rows={5}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="expected">Expected Behavior</Label>
        <Textarea
          id="expected"
          placeholder="What should happen..."
          rows={3}
        />
      </div>
    </div>
  )
}
```

## Accessibility

The Textarea component is fully accessible and follows WCAG 2.1 Level AA guidelines:

- ✅ **Keyboard Navigation**
  - `Tab` - Move focus to/from textarea
  - `Shift+Tab` - Move focus backwards
  - All standard text editing shortcuts work (Ctrl+A, Ctrl+C, etc.)
  - `Enter` - New line (not form submission)

- ✅ **Screen Reader Support**
  - Proper semantic `<textarea>` element
  - Label association via `htmlFor` and `id`
  - Placeholder text announced when empty
  - Character count can be announced via `aria-describedby`
  - Error messages linked via `aria-describedby`

- ✅ **Focus Management**
  - Visible focus ring on keyboard navigation
  - Focus ring respects prefers-reduced-motion
  - Smooth transitions for better UX

- ✅ **Color Contrast**
  - Meets WCAG AA standards (4.5:1)
  - Works in light and dark modes
  - Error states have sufficient contrast

### Accessibility Best Practices

**DO:**
- Always provide a visible label via `<Label>`
- Use descriptive placeholder text
- Link error messages with `aria-describedby`
- Indicate required fields with `*` or "(required)"
- Provide character count feedback when there's a limit
- Use `FormDescription` for additional context

**DON'T:**
- Don't rely on placeholder as the only label
- Don't use extremely small text sizes
- Don't set `rows` too small (minimum 3-4 for readability)
- Don't forget to set appropriate `maxLength` if needed
- Don't use textarea for single-line input (use Input instead)

## Styling

The textarea automatically uses theme tokens from your design system:

```tsx
// Custom styling examples
<Textarea className="font-mono" /> {/* Monospace font */}
<Textarea className="text-lg" /> {/* Larger text */}
<Textarea className="resize-none" /> {/* Disable manual resizing */}
<Textarea className="max-h-96 overflow-y-auto" /> {/* Max height with scroll */}
```

### Theme Integration

The textarea uses these design tokens:
- `--border-input` - Border color
- `--ring` - Focus ring color
- `--input` - Dark mode background
- `--muted-foreground` - Placeholder text color
- `--destructive` - Error state color

### Size Variations

```tsx
{/* Small (3 rows) */}
<Textarea rows={3} />

{/* Medium (5 rows) - Good default */}
<Textarea rows={5} />

{/* Large (10 rows) */}
<Textarea rows={10} />

{/* Custom minimum height */}
<Textarea className="min-h-24" />
```

## Common Patterns

### Feedback Form

```tsx
<div className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="feedback">What can we improve?</Label>
    <Textarea
      id="feedback"
      placeholder="Share your suggestions..."
      rows={5}
    />
  </div>
  <Button>Submit Feedback</Button>
</div>
```

### Message Composer

```tsx
<div className="border rounded-lg p-4 space-y-3">
  <Textarea
    placeholder="Type your message..."
    rows={4}
    className="border-0 focus-visible:ring-0 p-0"
  />
  <div className="flex justify-between items-center pt-2 border-t">
    <div className="flex gap-2">
      <Button variant="ghost" size="sm">
        <Paperclip className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm">
        <Smile className="h-4 w-4" />
      </Button>
    </div>
    <Button size="sm">Send</Button>
  </div>
</div>
```

### Settings Description

```tsx
<div className="space-y-6">
  <div>
    <h3 className="text-lg font-medium">Project Description</h3>
    <p className="text-sm text-muted-foreground mt-1">
      Describe what your project is about
    </p>
  </div>
  
  <Textarea
    placeholder="This project aims to..."
    rows={6}
  />
  
  <Button>Save Changes</Button>
</div>
```

## Related Components

- [Form](./form.tsx) - Form wrapper with validation
- [Label](./label.tsx) - Accessible labels
- [Input](./input.tsx) - Single-line text input
- [Button](./button.tsx) - Action buttons

## Migration from Native Textarea

If you're currently using native HTML textareas:

```tsx
// Before: Native textarea
<textarea
  value={value}
  onChange={(e) => setValue(e.target.value)}
  className="w-full rounded-md border px-3 py-2"
  rows={4}
/>

// After: Textarea component
<Textarea
  value={value}
  onChange={(e) => setValue(e.target.value)}
  rows={4}
/>
```

Key differences:
- Styling is built-in via design system
- Automatic dark mode support
- Built-in auto-resize via `field-sizing-content`
- Consistent focus states
- Automatic accessibility attributes

## Support

For issues or questions, refer to:
- [Design System Documentation](../../DESIGN_SYSTEM.md)
- [Accessibility Guidelines](../../docs/ACCESSIBILITY_GUIDELINES.md)
- [shadcn/ui Textarea](https://ui.shadcn.com/docs/components/textarea)

