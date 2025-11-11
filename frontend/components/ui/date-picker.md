# DatePicker Component

A fully accessible date picker component built on react-day-picker with FlightSight design system integration. Combines a Calendar component with a Popover for an intuitive date selection experience.

## Overview

The DatePicker component provides a user-friendly way to select dates through a calendar interface. It features a button trigger that opens a popover containing a calendar, making it perfect for forms, filters, and date-based inputs.

## Features

- ✅ **Fully Accessible** - WCAG 2.1 AA compliant with proper ARIA attributes and keyboard navigation
- ✅ **Calendar Integration** - Built on react-day-picker for robust date selection
- ✅ **Popover Interface** - Clean popover UI that doesn't clutter the page
- ✅ **Date Formatting** - Uses date-fns for consistent, localized date display
- ✅ **Form Integration** - Works seamlessly with React Hook Form
- ✅ **Theme Aware** - Automatically adapts to light/dark mode
- ✅ **Customizable** - Supports custom styling and calendar configurations
- ✅ **TypeScript** - Fully typed with TypeScript
- ✅ **Range Selection** - Calendar supports date range selection when configured

## Installation

The date picker component requires both the calendar and date-picker components:

```bash
npx shadcn@latest add calendar --yes
# DatePicker is custom but uses the installed Calendar component
```

## Basic Usage

### Standalone DatePicker

```tsx
import { useState } from 'react'
import { DatePicker } from '@/components/ui/date-picker'

function Example() {
  const [date, setDate] = useState<Date>()
  
  return (
    <DatePicker
      date={date}
      onSelect={setDate}
      placeholder="Select a date"
    />
  )
}
```

### With Label

```tsx
import { useState } from 'react'
import { DatePicker } from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'

function Example() {
  const [date, setDate] = useState<Date>()
  
  return (
    <div className="space-y-2">
      <Label htmlFor="date">Date of Birth</Label>
      <DatePicker
        date={date}
        onSelect={setDate}
        placeholder="MM/DD/YYYY"
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
import { DatePicker } from '@/components/ui/date-picker'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'

const formSchema = z.object({
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
  }),
  appointmentDate: z.date().optional(),
})

function AppointmentForm() {
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
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Birth</FormLabel>
              <FormControl>
                <DatePicker
                  date={field.value}
                  onSelect={field.onChange}
                  placeholder="Pick your date of birth"
                />
              </FormControl>
              <FormDescription>
                Your date of birth is used to calculate your age
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="appointmentDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Appointment Date (Optional)</FormLabel>
              <FormControl>
                <DatePicker
                  date={field.value}
                  onSelect={field.onChange}
                  placeholder="Select appointment date"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

## Component Props

### DatePicker Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `date` | `Date \| undefined` | - | The selected date (controlled) |
| `onSelect` | `(date: Date \| undefined) => void` | - | Callback when date is selected |
| `placeholder` | `string` | `"Pick a date"` | Placeholder text when no date selected |
| `disabled` | `boolean` | `false` | Whether the date picker is disabled |
| `className` | `string` | - | Additional CSS classes for popover content |
| `buttonClassName` | `string` | - | Additional CSS classes for trigger button |
| `calendarProps` | `CalendarProps` | - | Props to pass through to Calendar component |

### Calendar Props

The Calendar component (from react-day-picker) supports many props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `"single" \| "multiple" \| "range"` | - | Selection mode |
| `selected` | `Date \| Date[] \| DateRange` | - | Selected date(s) |
| `onSelect` | `(date) => void` | - | Selection callback |
| `disabled` | `Date \| Date[] \| Matcher` | - | Dates to disable |
| `fromDate` | `Date` | - | Earliest selectable date |
| `toDate` | `Date` | - | Latest selectable date |
| `showOutsideDays` | `boolean` | `true` | Show days from adjacent months |
| `captionLayout` | `"label" \| "dropdown"` | `"label"` | Month/year caption style |
| `numberOfMonths` | `number` | `1` | Number of months to display |

## Usage Patterns

### Date Range Selection

```tsx
import { useState } from 'react'
import { DateRange } from 'react-day-picker'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'

function DateRangePicker() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "LLL dd, y")} -{" "}
                {format(dateRange.to, "LLL dd, y")}
              </>
            ) : (
              format(dateRange.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={setDateRange}
          numberOfMonths={2}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
```

### Disabled Dates

```tsx
import { DatePicker } from '@/components/ui/date-picker'
import { addDays, isWeekend } from 'date-fns'

function BookingDatePicker() {
  const [date, setDate] = useState<Date>()

  return (
    <DatePicker
      date={date}
      onSelect={setDate}
      placeholder="Select booking date"
      calendarProps={{
        disabled: [
          // Disable weekends
          { dayOfWeek: [0, 6] },
          // Disable past dates
          { before: new Date() },
          // Disable specific dates
          new Date(2025, 11, 25), // Christmas
        ],
      }}
    />
  )
}
```

### Future Dates Only

```tsx
<DatePicker
  date={date}
  onSelect={setDate}
  placeholder="Select future date"
  calendarProps={{
    fromDate: new Date(),
    disabled: { before: new Date() },
  }}
/>
```

### Past Dates Only

```tsx
<DatePicker
  date={date}
  onSelect={setDate}
  placeholder="Select past date"
  calendarProps={{
    toDate: new Date(),
    disabled: { after: new Date() },
  }}
/>
```

### Date Range Constraint

```tsx
import { addMonths, subMonths } from 'date-fns'

<DatePicker
  date={date}
  onSelect={setDate}
  placeholder="Select date within 3 months"
  calendarProps={{
    fromDate: subMonths(new Date(), 3),
    toDate: addMonths(new Date(), 3),
  }}
/>
```

### Custom Date Formatting

```tsx
import { format } from 'date-fns'
import { DatePicker } from '@/components/ui/date-picker'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'

function CustomFormatDatePicker() {
  const [date, setDate] = useState<Date>()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "MM/dd/yyyy") : "MM/DD/YYYY"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
```

### Month and Year Dropdowns

```tsx
<DatePicker
  date={date}
  onSelect={setDate}
  placeholder="Select date"
  calendarProps={{
    captionLayout: "dropdown",
    fromYear: 1900,
    toYear: 2100,
  }}
/>
```

### Multiple Months Display

```tsx
<DatePicker
  date={date}
  onSelect={setDate}
  placeholder="Select date"
  calendarProps={{
    numberOfMonths: 2,
  }}
/>
```

### With Custom Styling

```tsx
<DatePicker
  date={date}
  onSelect={setDate}
  placeholder="Select date"
  buttonClassName="w-full"
  className="w-[600px]"
  calendarProps={{
    numberOfMonths: 3,
  }}
/>
```

## Advanced Patterns

### Birthday Picker

```tsx
import { DatePicker } from '@/components/ui/date-picker'
import { subYears } from 'date-fns'

function BirthdayPicker() {
  const [birthday, setBirthday] = useState<Date>()

  return (
    <DatePicker
      date={birthday}
      onSelect={setBirthday}
      placeholder="Select your birthday"
      calendarProps={{
        captionLayout: "dropdown",
        fromYear: 1900,
        toYear: new Date().getFullYear(),
        toDate: subYears(new Date(), 13), // Must be 13+ years old
        defaultMonth: subYears(new Date(), 25), // Start at age 25
      }}
    />
  )
}
```

### Booking System with Blackout Dates

```tsx
function BookingDatePicker() {
  const [date, setDate] = useState<Date>()
  
  const blackoutDates = [
    new Date(2025, 11, 24),
    new Date(2025, 11, 25),
    new Date(2025, 11, 31),
    new Date(2026, 0, 1),
  ]

  return (
    <div className="space-y-2">
      <Label>Select Booking Date</Label>
      <DatePicker
        date={date}
        onSelect={setDate}
        placeholder="Choose available date"
        calendarProps={{
          disabled: [
            ...blackoutDates,
            { dayOfWeek: [0, 6] }, // Weekends
            { before: new Date() }, // Past dates
          ],
        }}
      />
      <p className="text-sm text-muted-foreground">
        Weekdays only. Holiday blackouts apply.
      </p>
    </div>
  )
}
```

### Event Scheduler with Recurrence

```tsx
function EventScheduler() {
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()

  return (
    <div className="space-y-4">
      <div>
        <Label>Start Date</Label>
        <DatePicker
          date={startDate}
          onSelect={(date) => {
            setStartDate(date)
            if (endDate && date && date > endDate) {
              setEndDate(undefined)
            }
          }}
          placeholder="Select start date"
          calendarProps={{
            fromDate: new Date(),
          }}
        />
      </div>

      <div>
        <Label>End Date</Label>
        <DatePicker
          date={endDate}
          onSelect={setEndDate}
          placeholder="Select end date"
          disabled={!startDate}
          calendarProps={{
            fromDate: startDate,
            disabled: startDate ? { before: startDate } : undefined,
          }}
        />
      </div>
    </div>
  )
}
```

## Accessibility

The DatePicker and Calendar components are fully accessible and follow WCAG 2.1 Level AA guidelines:

- ✅ **Keyboard Navigation**
  - `Tab` - Move focus to/from date picker button
  - `Enter` or `Space` - Open calendar popover
  - Arrow keys - Navigate between dates in calendar
  - `Escape` - Close popover
  - `Home` - Go to start of week
  - `End` - Go to end of week
  - `Page Up` - Go to previous month
  - `Page Down` - Go to next month

- ✅ **Screen Reader Support**
  - Proper button labeling for trigger
  - Selected date announced when changed
  - Calendar navigation announced
  - Disabled dates properly communicated
  - Month/year changes announced

- ✅ **Focus Management**
  - `initialFocus` prop ensures calendar receives focus when opened
  - Focus returns to trigger button when closed
  - Visible focus indicators on all interactive elements

- ✅ **Color Contrast**
  - Meets WCAG AA standards (4.5:1)
  - Works in light and dark modes
  - Today's date highlighted with accent color
  - Selected dates clearly differentiated

### Accessibility Best Practices

**DO:**
- Always provide a label for the date picker (via Label component or aria-label)
- Use descriptive placeholder text
- Disable invalid dates rather than allowing selection
- Provide clear error messages for invalid dates
- Use FormDescription to explain date requirements

**DON'T:**
- Don't use date picker for very distant past/future dates (use year dropdown)
- Don't hide important constraints (show disabled dates, don't just block them)
- Don't rely on placeholder as the only label
- Don't use overly restrictive date constraints without explanation

## Calendar Component

The Calendar component can be used standalone for embedded calendar views:

```tsx
import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'

function EmbeddedCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-md border"
    />
  )
}
```

### Calendar Features

- Single date selection
- Multiple date selection
- Date range selection
- Custom disabled dates
- Month/year dropdowns
- Week numbers
- Custom formatters
- RTL support
- Responsive design

## Styling

Both components automatically use theme tokens from your design system:

```tsx
// Custom button width
<DatePicker
  buttonClassName="w-64"
  date={date}
  onSelect={setDate}
/>

// Custom popover width
<DatePicker
  className="w-[400px]"
  date={date}
  onSelect={setDate}
/>

// Custom calendar styling
<DatePicker
  date={date}
  onSelect={setDate}
  calendarProps={{
    className: "border-primary",
    buttonVariant: "default",
  }}
/>
```

### Theme Integration

The components use these design tokens:
- `--background` - Calendar background
- `--popover-foreground` - Text color
- `--primary` - Selected date background
- `--accent` - Today/hover states
- `--muted-foreground` - Outside days, disabled dates
- `--border` - Calendar borders
- `--ring` - Focus indicators

## Common Patterns

### Filter by Date Range

```tsx
function DateRangeFilter() {
  const [dateRange, setDateRange] = useState<DateRange>()

  return (
    <div className="flex gap-2 items-center">
      <span className="text-sm text-muted-foreground">From</span>
      <DatePicker
        date={dateRange?.from}
        onSelect={(date) => setDateRange({ ...dateRange, from: date })}
        placeholder="Start date"
      />
      <span className="text-sm text-muted-foreground">to</span>
      <DatePicker
        date={dateRange?.to}
        onSelect={(date) => setDateRange({ ...dateRange, to: date })}
        placeholder="End date"
        disabled={!dateRange?.from}
        calendarProps={{
          fromDate: dateRange?.from,
          disabled: dateRange?.from ? { before: dateRange.from } : undefined,
        }}
      />
    </div>
  )
}
```

### Dashboard Date Selector

```tsx
function DashboardDateSelector() {
  const [date, setDate] = useState<Date>(new Date())

  return (
    <div className="flex items-center gap-2">
      <DatePicker
        date={date}
        onSelect={(date) => date && setDate(date)}
        buttonClassName="w-[200px]"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => setDate(new Date())}
      >
        Today
      </Button>
    </div>
  )
}
```

### Appointment Booking

```tsx
function AppointmentBooking() {
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState<string>()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book Appointment</CardTitle>
        <CardDescription>
          Select your preferred date and time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Date</Label>
          <DatePicker
            date={date}
            onSelect={setDate}
            placeholder="Select appointment date"
            calendarProps={{
              fromDate: new Date(),
              disabled: { dayOfWeek: [0, 6] },
            }}
          />
        </div>
        {date && (
          <div className="space-y-2">
            <Label>Time</Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="09:00">9:00 AM</SelectItem>
                <SelectItem value="10:00">10:00 AM</SelectItem>
                <SelectItem value="11:00">11:00 AM</SelectItem>
                {/* More times */}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

## Related Components

- [Calendar](./calendar.tsx) - Standalone calendar component
- [Form](./form.tsx) - Form wrapper with validation
- [Label](./label.tsx) - Accessible labels
- [Popover](./popover.tsx) - Popover container
- [Button](./button.tsx) - Trigger button

## Migration from Native Date Inputs

If you're currently using native HTML date inputs:

```tsx
// Before: Native input
<input
  type="date"
  value={date}
  onChange={(e) => setDate(new Date(e.target.value))}
  className="border rounded px-3 py-2"
/>

// After: DatePicker component
<DatePicker
  date={date}
  onSelect={setDate}
  placeholder="Select date"
/>
```

Key differences:
- Better cross-browser consistency
- More flexible date constraints
- Richer visual interface
- Better accessibility
- Consistent with design system

## Support

For issues or questions, refer to:
- [Design System Documentation](../../DESIGN_SYSTEM.md)
- [Accessibility Guidelines](../../docs/ACCESSIBILITY_GUIDELINES.md)
- [react-day-picker Documentation](https://react-day-picker.js.org/)
- [date-fns Documentation](https://date-fns.org/)
- [shadcn/ui Calendar](https://ui.shadcn.com/docs/components/calendar)

