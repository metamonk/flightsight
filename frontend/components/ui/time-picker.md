# TimePicker Component

A flexible time picker component built with Radix UI primitives.

## Features

- 12-hour time format with AM/PM toggle
- Customizable minute intervals
- "Now" quick action button
- Fully accessible with ARIA labels
- Keyboard navigation support
- Dark mode support
- Consistent with DatePicker design patterns

## Usage

### Basic Example

```tsx
import { TimePicker } from "@/components/ui/time-picker"

function MyComponent() {
  const [time, setTime] = React.useState<Date>()

  return (
    <TimePicker
      time={time}
      onSelect={setTime}
      placeholder="Select time"
    />
  )
}
```

### With Custom Minute Interval

```tsx
<TimePicker
  time={time}
  onSelect={setTime}
  minuteInterval={15}
  placeholder="Select time"
/>
```

### Disabled State

```tsx
<TimePicker
  time={time}
  onSelect={setTime}
  disabled={true}
/>
```

### Custom Styling

```tsx
<TimePicker
  time={time}
  onSelect={setTime}
  buttonClassName="w-full"
  className="w-auto"
/>
```

## Props

### TimePickerProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `time` | `Date \| undefined` | `undefined` | The selected time value |
| `onSelect` | `(time: Date \| undefined) => void` | `undefined` | Callback when time is selected |
| `placeholder` | `string` | `"Pick a time"` | Placeholder text when no time is selected |
| `disabled` | `boolean` | `false` | Whether the picker is disabled |
| `className` | `string` | `undefined` | Additional classes for the popover content |
| `buttonClassName` | `string` | `undefined` | Additional classes for the trigger button |
| `minuteInterval` | `number` | `5` | Interval between minute options (e.g., 5, 10, 15) |

## Accessibility

The TimePicker component follows accessibility best practices:

- **ARIA Labels**: All interactive elements have appropriate ARIA labels
- **Keyboard Navigation**: Full keyboard support for navigation and selection
- **Focus Management**: Proper focus handling within the popover
- **Screen Reader Support**: Meaningful announcements for state changes

### Keyboard Shortcuts

- `Space/Enter`: Open/close the popover
- `Tab`: Navigate between hour, minute, and period controls
- `Arrow Keys`: Navigate within select dropdowns
- `Escape`: Close the popover

## Design Patterns

The TimePicker follows the same design patterns as the DatePicker:

1. **Popover + Button Trigger**: Consistent interaction pattern
2. **Outline Button Variant**: Standard styling for picker triggers
3. **Focus Rings**: 3px ring with ring-ring/50 opacity
4. **Dark Mode**: Proper contrast in both light and dark themes

## Examples

### In a Form

```tsx
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { TimePicker } from "@/components/ui/time-picker"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"

const formSchema = z.object({
  meetingTime: z.date({
    required_error: "Please select a meeting time",
  }),
})

function MeetingForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="meetingTime"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Meeting Time</FormLabel>
            <FormControl>
              <TimePicker
                time={field.value}
                onSelect={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </Form>
  )
}
```

### Combined with DatePicker

```tsx
import { DatePicker } from "@/components/ui/date-picker"
import { TimePicker } from "@/components/ui/time-picker"

function DateTimePicker() {
  const [dateTime, setDateTime] = React.useState<Date>()

  const handleDateChange = (newDate: Date | undefined) => {
    if (!newDate) {
      setDateTime(undefined)
      return
    }
    
    const updated = dateTime ? new Date(dateTime) : new Date()
    updated.setFullYear(newDate.getFullYear())
    updated.setMonth(newDate.getMonth())
    updated.setDate(newDate.getDate())
    setDateTime(updated)
  }

  const handleTimeChange = (newTime: Date | undefined) => {
    if (!newTime) return
    
    const updated = dateTime ? new Date(dateTime) : new Date()
    updated.setHours(newTime.getHours())
    updated.setMinutes(newTime.getMinutes())
    updated.setSeconds(0)
    updated.setMilliseconds(0)
    setDateTime(updated)
  }

  return (
    <div className="flex gap-2">
      <DatePicker
        date={dateTime}
        onSelect={handleDateChange}
      />
      <TimePicker
        time={dateTime}
        onSelect={handleTimeChange}
      />
    </div>
  )
}
```

## Implementation Details

### Time Format Conversion

The component handles conversion between 12-hour (display) and 24-hour (Date object) formats:

- **Display**: 1-12 with AM/PM
- **Storage**: 0-23 hours in Date object
- **Edge Cases**: 12:00 AM (midnight) = 0, 12:00 PM (noon) = 12

### Minute Intervals

The `minuteInterval` prop determines available minute options:
- `5` (default): 00, 05, 10, ..., 55
- `15`: 00, 15, 30, 45
- `1`: All minutes 00-59

### "Now" Button

The "Now" button sets the time to the current moment, rounded down to the nearest minute interval.

## Related Components

- [DatePicker](./date-picker.md) - For selecting dates
- [Select](./select.md) - Used internally for hour/minute selection
- [Button](./button.md) - Used for trigger and period controls
- [Popover](./popover.md) - Container for the time selection interface

