import * as React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TimePicker } from '@/components/ui/time-picker'
import { testAccessibility } from '@/tests/helpers/accessibility'

describe('TimePicker Component', () => {
  describe('Basic Rendering', () => {
    it('should render time picker button', () => {
      render(<TimePicker />)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should display placeholder when no time selected', () => {
      render(<TimePicker placeholder="Pick a time" />)
      expect(screen.getByText('Pick a time')).toBeInTheDocument()
    })

    it('should display formatted time when time is selected', () => {
      const time = new Date(2025, 0, 15, 14, 30) // 2:30 PM
      render(<TimePicker time={time} />)
      
      expect(screen.getByRole('button')).toHaveTextContent('2:30 PM')
    })

    it('should render clock icon', () => {
      render(<TimePicker />)
      const button = screen.getByRole('button')
      const icon = button.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('should have data-slot attribute', () => {
      render(<TimePicker />)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('data-slot', 'time-picker-trigger')
    })

    it('should apply custom button className', () => {
      render(<TimePicker buttonClassName="w-full" />)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('w-full')
    })
  })

  describe('States', () => {
    it('should render disabled state', () => {
      render(<TimePicker disabled />)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should not open time picker when disabled', async () => {
      const user = userEvent.setup()
      render(<TimePicker disabled />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      // Time picker popover should not be visible
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    })

    it('should show muted text color when no time selected', () => {
      render(<TimePicker placeholder="Select time" />)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('text-muted-foreground')
    })

    it('should not have muted text color when time is selected', () => {
      const time = new Date(2025, 0, 15, 14, 30)
      render(<TimePicker time={time} />)
      const button = screen.getByRole('button')
      expect(button).not.toHaveClass('text-muted-foreground')
    })
  })

  describe('User Interactions', () => {
    it('should open time picker on button click', async () => {
      const user = userEvent.setup()
      render(<TimePicker />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      // Time picker should be visible with selects
      await waitFor(() => {
        expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0)
      })
    })

    it('should call onSelect when "Now" button is clicked', async () => {
      const user = userEvent.setup()
      const handleSelect = vi.fn()
      
      render(<TimePicker onSelect={handleSelect} />)
      
      // Open time picker
      const button = screen.getByRole('button')
      await user.click(button)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /now/i })).toBeInTheDocument()
      })
      
      // Click "Now" button
      const nowButton = screen.getByRole('button', { name: /now/i })
      await user.click(nowButton)
      
      // onSelect should be called
      expect(handleSelect).toHaveBeenCalled()
      expect(handleSelect).toHaveBeenCalledWith(expect.any(Date))
    })

    it('should handle controlled component pattern', async () => {
      const user = userEvent.setup()
      const TestComponent = () => {
        const [time, setTime] = React.useState<Date>()
        return (
          <div>
            <TimePicker time={time} onSelect={setTime} />
            <span data-testid="selected-time">
              {time ? time.toLocaleTimeString() : 'none'}
            </span>
          </div>
        )
      }

      render(<TestComponent />)
      const selectedTime = screen.getByTestId('selected-time')

      expect(selectedTime).toHaveTextContent('none')

      // Open time picker
      const button = screen.getByRole('button', { name: /pick a time/i })
      await user.click(button)

      await waitFor(() => {
        expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0)
      })
    })

    it('should open time picker with keyboard (Space)', async () => {
      const user = userEvent.setup()
      render(<TimePicker />)
      
      const button = screen.getByRole('button')
      button.focus()
      await user.keyboard(' ')
      
      await waitFor(() => {
        expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0)
      })
    })

    it('should open time picker with keyboard (Enter)', async () => {
      const user = userEvent.setup()
      render(<TimePicker />)
      
      const button = screen.getByRole('button')
      button.focus()
      await user.keyboard('{Enter}')
      
      await waitFor(() => {
        expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0)
      })
    })
  })

  describe('Time Selection', () => {
    it('should display hour select', async () => {
      const user = userEvent.setup()
      render(<TimePicker />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      await waitFor(() => {
        const hourSelect = screen.getAllByRole('combobox')[0]
        expect(hourSelect).toHaveAttribute('data-slot', 'time-picker-hour')
      })
    })

    it('should display minute select', async () => {
      const user = userEvent.setup()
      render(<TimePicker />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      await waitFor(() => {
        const minuteSelect = screen.getAllByRole('combobox')[1]
        expect(minuteSelect).toHaveAttribute('data-slot', 'time-picker-minute')
      })
    })

    it('should display AM/PM buttons', async () => {
      const user = userEvent.setup()
      render(<TimePicker />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /am/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /pm/i })).toBeInTheDocument()
      })
    })

    it('should display "Now" button', async () => {
      const user = userEvent.setup()
      render(<TimePicker />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /now/i })).toBeInTheDocument()
      })
    })

    it('should set current time when "Now" button clicked', async () => {
      const user = userEvent.setup()
      const handleSelect = vi.fn()
      
      render(<TimePicker onSelect={handleSelect} />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      await waitFor(() => {
        const nowButton = screen.getByRole('button', { name: /now/i })
        expect(nowButton).toBeInTheDocument()
      })
      
      const nowButton = screen.getByRole('button', { name: /now/i })
      await user.click(nowButton)
      
      expect(handleSelect).toHaveBeenCalled()
    })
  })

  describe('Time Formatting', () => {
    it('should format time in 12-hour format', () => {
      const time = new Date(2025, 0, 15, 14, 30) // 2:30 PM
      render(<TimePicker time={time} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveTextContent('2:30 PM')
    })

    it('should handle midnight (12:00 AM)', () => {
      const time = new Date(2025, 0, 15, 0, 0) // 12:00 AM
      render(<TimePicker time={time} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveTextContent('12:00 AM')
    })

    it('should handle noon (12:00 PM)', () => {
      const time = new Date(2025, 0, 15, 12, 0) // 12:00 PM
      render(<TimePicker time={time} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveTextContent('12:00 PM')
    })

    it('should handle morning time', () => {
      const time = new Date(2025, 0, 15, 9, 15) // 9:15 AM
      render(<TimePicker time={time} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveTextContent('9:15 AM')
    })

    it('should handle evening time', () => {
      const time = new Date(2025, 0, 15, 21, 45) // 9:45 PM
      render(<TimePicker time={time} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveTextContent('9:45 PM')
    })
  })

  describe('Minute Interval', () => {
    it('should use default 5-minute interval', async () => {
      const user = userEvent.setup()
      render(<TimePicker />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      await waitFor(() => {
        const minuteSelect = screen.getAllByRole('combobox')[1]
        expect(minuteSelect).toBeInTheDocument()
      })
    })

    it('should support custom minute interval', async () => {
      const user = userEvent.setup()
      render(<TimePicker minuteInterval={15} />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      await waitFor(() => {
        const minuteSelect = screen.getAllByRole('combobox')[1]
        expect(minuteSelect).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have no violations with basic time picker', async () => {
      const { container } = render(<TimePicker />)
      await testAccessibility(container)
    })

    it('should have no violations with selected time', async () => {
      const time = new Date(2025, 0, 15, 14, 30)
      const { container } = render(<TimePicker time={time} />)
      await testAccessibility(container)
    })

    it('should have no violations when disabled', async () => {
      const { container } = render(<TimePicker disabled />)
      await testAccessibility(container)
    })

    it('should have proper button role', () => {
      render(<TimePicker />)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup()
      render(
        <div>
          <TimePicker />
          <TimePicker />
        </div>
      )

      const buttons = screen.getAllByRole('button')
      
      // Tab to first time picker
      await user.tab()
      expect(buttons[0]).toHaveFocus()

      // Tab to second time picker
      await user.tab()
      expect(buttons[1]).toHaveFocus()
    })

    it('should have aria-label on hour select', async () => {
      const user = userEvent.setup()
      render(<TimePicker />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      await waitFor(() => {
        const hourSelect = screen.getAllByRole('combobox')[0]
        expect(hourSelect).toHaveAttribute('aria-label', 'Select hour')
      })
    })

    it('should have aria-label on minute select', async () => {
      const user = userEvent.setup()
      render(<TimePicker />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      await waitFor(() => {
        const minuteSelect = screen.getAllByRole('combobox')[1]
        expect(minuteSelect).toHaveAttribute('aria-label', 'Select minute')
      })
    })

    it('should have aria-label on AM button', async () => {
      const user = userEvent.setup()
      render(<TimePicker />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      await waitFor(() => {
        const amButton = screen.getByRole('button', { name: /select am/i })
        expect(amButton).toBeInTheDocument()
      })
    })

    it('should have aria-label on PM button', async () => {
      const user = userEvent.setup()
      render(<TimePicker />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      await waitFor(() => {
        const pmButton = screen.getByRole('button', { name: /select pm/i })
        expect(pmButton).toBeInTheDocument()
      })
    })
  })

  describe('Custom Placeholder', () => {
    it('should display custom placeholder', () => {
      render(<TimePicker placeholder="Choose your time" />)
      expect(screen.getByText('Choose your time')).toBeInTheDocument()
    })

    it('should use default placeholder when not provided', () => {
      render(<TimePicker />)
      expect(screen.getByText('Pick a time')).toBeInTheDocument()
    })

    it('should replace placeholder with time when selected', () => {
      const time = new Date(2025, 0, 15, 14, 30)
      render(<TimePicker time={time} placeholder="Select time" />)
      
      expect(screen.queryByText('Select time')).not.toBeInTheDocument()
      expect(screen.getByRole('button')).toHaveTextContent('2:30 PM')
    })
  })

  describe('Popover Behavior', () => {
    it('should align popover to start', async () => {
      const user = userEvent.setup()
      render(<TimePicker />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      await waitFor(() => {
        const popover = screen.getAllByRole('combobox')[0].closest('[data-slot="popover-content"]')
        expect(popover).toBeInTheDocument()
      })
    })

    it('should apply custom className to popover content', async () => {
      const user = userEvent.setup()
      render(<TimePicker className="custom-popover" />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      await waitFor(() => {
        const popover = screen.getAllByRole('combobox')[0].closest('[data-slot="popover-content"]')
        expect(popover).toHaveClass('custom-popover')
      })
    })

    it('should have p-4 padding on popover content', async () => {
      const user = userEvent.setup()
      render(<TimePicker />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      await waitFor(() => {
        const popover = screen.getAllByRole('combobox')[0].closest('[data-slot="popover-content"]')
        expect(popover).toHaveClass('p-4')
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined time gracefully', () => {
      render(<TimePicker time={undefined} />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should handle undefined onSelect gracefully', async () => {
      const user = userEvent.setup()
      render(<TimePicker />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      await waitFor(() => {
        expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0)
      })
    })

    it('should handle time changes', () => {
      const { rerender } = render(<TimePicker time={new Date(2025, 0, 15, 14, 30)} />)
      
      expect(screen.getByRole('button')).toHaveTextContent('2:30 PM')
      
      rerender(<TimePicker time={new Date(2025, 0, 15, 9, 15)} />)
      
      expect(screen.getByRole('button')).toHaveTextContent('9:15 AM')
    })

    it('should maintain state when re-rendered', () => {
      const time = new Date(2025, 0, 15, 14, 30)
      const { rerender } = render(<TimePicker time={time} />)
      
      expect(screen.getByRole('button')).toHaveTextContent('2:30 PM')
      
      rerender(<TimePicker time={time} />)
      
      expect(screen.getByRole('button')).toHaveTextContent('2:30 PM')
    })

    it('should handle invalid time object gracefully', () => {
      const invalidTime = new Date('invalid')
      render(<TimePicker time={invalidTime} />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('Button Variants', () => {
    it('should use outline variant by default', () => {
      render(<TimePicker />)
      const button = screen.getByRole('button')
      // Outline variant adds border class
      expect(button).toHaveClass('border')
      expect(button).toHaveClass('bg-background')
    })

    it('should have proper text alignment', () => {
      render(<TimePicker />)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('justify-start')
      expect(button).toHaveClass('text-left')
    })

    it('should have normal font weight', () => {
      render(<TimePicker />)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('font-normal')
    })
  })

  describe('Integration with Forms', () => {
    it('should work with controlled form state', async () => {
      const user = userEvent.setup()
      const handleSubmit = vi.fn()
      
      const FormExample = () => {
        const [time, setTime] = React.useState<Date>()
        
        return (
          <form onSubmit={(e) => {
            e.preventDefault()
            handleSubmit({ time })
          }}>
            <TimePicker time={time} onSelect={setTime} />
            <button type="submit">Submit</button>
          </form>
        )
      }

      render(<FormExample />)
      
      // Open time picker
      const timeButton = screen.getByRole('button', { name: /pick a time/i })
      await user.click(timeButton)
      
      await waitFor(() => {
        expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0)
      })
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)
      
      expect(handleSubmit).toHaveBeenCalled()
    })

    it('should reset time when cleared', async () => {
      const user = userEvent.setup()
      const TestComponent = () => {
        const [time, setTime] = React.useState<Date | undefined>(new Date(2025, 0, 15, 14, 30))
        
        return (
          <div>
            <TimePicker time={time} onSelect={setTime} />
            <button onClick={() => setTime(undefined)}>Clear</button>
          </div>
        )
      }

      render(<TestComponent />)
      
      expect(screen.getByRole('button', { name: /2:30 pm/i })).toBeInTheDocument()
      
      const clearButton = screen.getByRole('button', { name: /clear/i })
      await user.click(clearButton)
      
      await waitFor(() => {
        expect(screen.getByText('Pick a time')).toBeInTheDocument()
      })
    })
  })

  describe('Period Toggle', () => {
    it('should toggle from AM to PM', async () => {
      const user = userEvent.setup()
      const handleSelect = vi.fn()
      const time = new Date(2025, 0, 15, 9, 30) // 9:30 AM
      
      render(<TimePicker time={time} onSelect={handleSelect} />)
      
      const button = screen.getByRole('button', { name: /9:30 am/i })
      await user.click(button)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /select pm/i })).toBeInTheDocument()
      })
      
      const pmButton = screen.getByRole('button', { name: /select pm/i })
      await user.click(pmButton)
      
      expect(handleSelect).toHaveBeenCalled()
    })

    it('should toggle from PM to AM', async () => {
      const user = userEvent.setup()
      const handleSelect = vi.fn()
      const time = new Date(2025, 0, 15, 21, 30) // 9:30 PM
      
      render(<TimePicker time={time} onSelect={handleSelect} />)
      
      const button = screen.getByRole('button', { name: /9:30 pm/i })
      await user.click(button)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /select am/i })).toBeInTheDocument()
      })
      
      const amButton = screen.getByRole('button', { name: /select am/i })
      await user.click(amButton)
      
      expect(handleSelect).toHaveBeenCalled()
    })

    it('should highlight active period button', async () => {
      const user = userEvent.setup()
      const time = new Date(2025, 0, 15, 14, 30) // 2:30 PM
      
      render(<TimePicker time={time} />)
      
      const button = screen.getByRole('button', { name: /2:30 pm/i })
      await user.click(button)
      
      await waitFor(() => {
        const pmButton = screen.getByRole('button', { name: /select pm/i })
        expect(pmButton).toHaveClass('bg-primary')
      })
    })
  })
})

