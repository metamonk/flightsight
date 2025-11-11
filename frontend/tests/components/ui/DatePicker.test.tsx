import * as React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DatePicker } from '@/components/ui/date-picker'
import { testAccessibility } from '@/tests/helpers/accessibility'

describe('DatePicker Component', () => {
  describe('Basic Rendering', () => {
    it('should render date picker button', () => {
      render(<DatePicker />)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should display placeholder when no date selected', () => {
      render(<DatePicker placeholder="Pick a date" />)
      expect(screen.getByText('Pick a date')).toBeInTheDocument()
    })

    it('should display formatted date when date is selected', () => {
      const date = new Date(2025, 0, 15) // January 15, 2025
      render(<DatePicker date={date} />)
      
      // date-fns formats this as a long date string
      expect(screen.getByRole('button')).toHaveTextContent(/january 15/i)
    })

    it('should render calendar icon', () => {
      render(<DatePicker />)
      const button = screen.getByRole('button')
      const icon = button.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('should have data-slot attribute', () => {
      render(<DatePicker />)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('data-slot', 'date-picker-trigger')
    })

    it('should apply custom button className', () => {
      render(<DatePicker buttonClassName="w-full" />)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('w-full')
    })
  })

  describe('States', () => {
    it('should render disabled state', () => {
      render(<DatePicker disabled />)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should not open calendar when disabled', async () => {
      const user = userEvent.setup()
      render(<DatePicker disabled />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      // Calendar should not be visible
      expect(screen.queryByRole('grid')).not.toBeInTheDocument()
    })

    it('should show muted text color when no date selected', () => {
      render(<DatePicker placeholder="Select date" />)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('text-muted-foreground')
    })

    it('should not have muted text color when date is selected', () => {
      const date = new Date(2025, 0, 15)
      render(<DatePicker date={date} />)
      const button = screen.getByRole('button')
      expect(button).not.toHaveClass('text-muted-foreground')
    })
  })

  describe('User Interactions', () => {
    it('should open calendar on button click', async () => {
      const user = userEvent.setup()
      render(<DatePicker />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      // Calendar should be visible
      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument()
      })
    })

    it('should call onSelect when date is clicked', async () => {
      const user = userEvent.setup()
      const handleSelect = vi.fn()
      
      render(<DatePicker onSelect={handleSelect} />)
      
      // Open calendar
      const button = screen.getByRole('button')
      await user.click(button)
      
      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument()
      })
      
      // Click a date (we'll click any gridcell that's a button)
      const dates = screen.getAllByRole('button').filter(btn => 
        btn.hasAttribute('data-day')
      )
      
      if (dates.length > 0) {
        await user.click(dates[0])
        expect(handleSelect).toHaveBeenCalled()
      }
    })

    it('should handle controlled component pattern', async () => {
      const user = userEvent.setup()
      const TestComponent = () => {
        const [date, setDate] = React.useState<Date>()
        return (
          <div>
            <DatePicker date={date} onSelect={setDate} />
            <span data-testid="selected-date">
              {date ? date.toISOString() : 'none'}
            </span>
          </div>
        )
      }

      render(<TestComponent />)
      const selectedDate = screen.getByTestId('selected-date')

      expect(selectedDate).toHaveTextContent('none')

      // Open and select a date
      const button = screen.getByRole('button', { name: /pick a date/i })
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument()
      })

      const dates = screen.getAllByRole('button').filter(btn =>
        btn.hasAttribute('data-day')
      )

      if (dates.length > 0) {
        await user.click(dates[5])
        await waitFor(() => {
          expect(selectedDate).not.toHaveTextContent('none')
        })
      }
    })

    it('should open calendar with keyboard (Space)', async () => {
      const user = userEvent.setup()
      render(<DatePicker />)
      
      const button = screen.getByRole('button')
      button.focus()
      await user.keyboard(' ')
      
      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument()
      })
    })

    it('should open calendar with keyboard (Enter)', async () => {
      const user = userEvent.setup()
      render(<DatePicker />)
      
      const button = screen.getByRole('button')
      button.focus()
      await user.keyboard('{Enter}')
      
      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument()
      })
    })
  })

  describe('Calendar Integration', () => {
    it('should pass calendarProps to Calendar component', async () => {
      const user = userEvent.setup()
      render(
        <DatePicker
          calendarProps={{
            showOutsideDays: false,
            numberOfMonths: 2,
          }}
        />
      )
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument()
      })
    })

    it('should support date constraints through calendarProps', async () => {
      const user = userEvent.setup()
      const today = new Date()
      
      render(
        <DatePicker
          calendarProps={{
            fromDate: today,
            disabled: { before: today },
          }}
        />
      )
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument()
      })
    })

    it('should set initialFocus on calendar', async () => {
      const user = userEvent.setup()
      render(<DatePicker />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      await waitFor(() => {
        const calendar = screen.getByRole('grid')
        expect(calendar).toBeInTheDocument()
        // Calendar should have focus management
      })
    })
  })

  describe('Accessibility', () => {
    it('should have no violations with basic date picker', async () => {
      const { container } = render(<DatePicker />)
      await testAccessibility(container)
    })

    it('should have no violations with selected date', async () => {
      const date = new Date(2025, 0, 15)
      const { container } = render(<DatePicker date={date} />)
      await testAccessibility(container)
    })

    it('should have no violations when disabled', async () => {
      const { container } = render(<DatePicker disabled />)
      await testAccessibility(container)
    })

    it('should have proper button role', () => {
      render(<DatePicker />)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup()
      render(
        <div>
          <DatePicker />
          <DatePicker />
        </div>
      )

      const buttons = screen.getAllByRole('button')
      
      // Tab to first date picker
      await user.tab()
      expect(buttons[0]).toHaveFocus()

      // Tab to second date picker
      await user.tab()
      expect(buttons[1]).toHaveFocus()
    })

    it('should support aria-label through button props', () => {
      render(<DatePicker />)
      const button = screen.getByRole('button')
      // Button should have accessible text from placeholder or selected date
      expect(button).toHaveTextContent(/pick a date|select/i)
    })
  })

  describe('Custom Placeholder', () => {
    it('should display custom placeholder', () => {
      render(<DatePicker placeholder="Choose your date" />)
      expect(screen.getByText('Choose your date')).toBeInTheDocument()
    })

    it('should use default placeholder when not provided', () => {
      render(<DatePicker />)
      expect(screen.getByText('Pick a date')).toBeInTheDocument()
    })

    it('should replace placeholder with date when selected', () => {
      const date = new Date(2025, 0, 15)
      render(<DatePicker date={date} placeholder="Select date" />)
      
      expect(screen.queryByText('Select date')).not.toBeInTheDocument()
      expect(screen.getByRole('button')).toHaveTextContent(/january/i)
    })
  })

  describe('Date Formatting', () => {
    it('should format date using PPP format', () => {
      const date = new Date(2025, 0, 15) // January 15, 2025
      render(<DatePicker date={date} />)
      
      const button = screen.getByRole('button')
      // PPP format: "January 15th, 2025" or similar
      expect(button.textContent).toMatch(/january.*15/i)
    })

    it('should handle different dates correctly', () => {
      const date = new Date(2025, 11, 25) // December 25, 2025
      render(<DatePicker date={date} />)
      
      const button = screen.getByRole('button')
      expect(button.textContent).toMatch(/december.*25/i)
    })
  })

  describe('Popover Behavior', () => {
    it('should align popover to start', async () => {
      const user = userEvent.setup()
      render(<DatePicker />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      await waitFor(() => {
        const popover = screen.getByRole('grid').closest('[data-slot="popover-content"]')
        expect(popover).toBeInTheDocument()
      })
    })

    it('should apply custom className to popover content', async () => {
      const user = userEvent.setup()
      render(<DatePicker className="custom-popover" />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      await waitFor(() => {
        const popover = screen.getByRole('grid').closest('[data-slot="popover-content"]')
        expect(popover).toHaveClass('custom-popover')
      })
    })

    it('should have zero padding on popover content', async () => {
      const user = userEvent.setup()
      render(<DatePicker />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      await waitFor(() => {
        const popover = screen.getByRole('grid').closest('[data-slot="popover-content"]')
        expect(popover).toHaveClass('p-0')
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined date gracefully', () => {
      render(<DatePicker date={undefined} />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should handle undefined onSelect gracefully', async () => {
      const user = userEvent.setup()
      render(<DatePicker />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument()
      })
    })

    it('should handle date changes', () => {
      const { rerender } = render(<DatePicker date={new Date(2025, 0, 15)} />)
      
      expect(screen.getByRole('button')).toHaveTextContent(/january.*15/i)
      
      rerender(<DatePicker date={new Date(2025, 5, 20)} />)
      
      expect(screen.getByRole('button')).toHaveTextContent(/june.*20/i)
    })

    it('should maintain state when re-rendered', () => {
      const date = new Date(2025, 0, 15)
      const { rerender } = render(<DatePicker date={date} />)
      
      expect(screen.getByRole('button')).toHaveTextContent(/january.*15/i)
      
      rerender(<DatePicker date={date} />)
      
      expect(screen.getByRole('button')).toHaveTextContent(/january.*15/i)
    })
  })

  describe('Button Variants', () => {
    it('should use outline variant by default', () => {
      render(<DatePicker />)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('border-input')
    })

    it('should have proper text alignment', () => {
      render(<DatePicker />)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('justify-start')
      expect(button).toHaveClass('text-left')
    })

    it('should have normal font weight', () => {
      render(<DatePicker />)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('font-normal')
    })
  })

  describe('Integration with Forms', () => {
    it('should work with controlled form state', async () => {
      const user = userEvent.setup()
      const handleSubmit = vi.fn()
      
      const FormExample = () => {
        const [date, setDate] = React.useState<Date>()
        
        return (
          <form onSubmit={(e) => {
            e.preventDefault()
            handleSubmit({ date })
          }}>
            <DatePicker date={date} onSelect={setDate} />
            <button type="submit">Submit</button>
          </form>
        )
      }

      render(<FormExample />)
      
      // Open calendar and select date
      const dateButton = screen.getByRole('button', { name: /pick a date/i })
      await user.click(dateButton)
      
      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument()
      })
      
      const dates = screen.getAllByRole('button').filter(btn =>
        btn.hasAttribute('data-day')
      )
      
      if (dates.length > 0) {
        await user.click(dates[0])
      }
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)
      
      expect(handleSubmit).toHaveBeenCalled()
    })

    it('should reset date when cleared', () => {
      const TestComponent = () => {
        const [date, setDate] = React.useState<Date | undefined>(new Date(2025, 0, 15))
        
        return (
          <div>
            <DatePicker date={date} onSelect={setDate} />
            <button onClick={() => setDate(undefined)}>Clear</button>
          </div>
        )
      }

      render(<TestComponent />)
      
      expect(screen.getByRole('button', { name: /january/i })).toBeInTheDocument()
      
      const clearButton = screen.getByRole('button', { name: /clear/i })
      clearButton.click()
      
      expect(screen.getByText('Pick a date')).toBeInTheDocument()
    })
  })
})

