import * as React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { testAccessibility } from '@/tests/helpers/accessibility'

describe('Checkbox Component', () => {
  describe('Basic Rendering', () => {
    it('should render checkbox', () => {
      render(<Checkbox />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
    })

    it('should render with label', () => {
      render(
        <div>
          <Checkbox id="test" />
          <Label htmlFor="test">Test Label</Label>
        </div>
      )
      
      const checkbox = screen.getByRole('checkbox')
      const label = screen.getByText('Test Label')
      expect(checkbox).toBeInTheDocument()
      expect(label).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      render(<Checkbox className="custom-class" />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveClass('custom-class')
    })
  })

  describe('States', () => {
    it('should render unchecked by default', () => {
      render(<Checkbox />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('data-state', 'unchecked')
    })

    it('should render checked when checked prop is true', () => {
      render(<Checkbox checked={true} />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('data-state', 'checked')
      expect(checkbox).toHaveAttribute('aria-checked', 'true')
    })

    it('should render indeterminate state', () => {
      render(<Checkbox checked="indeterminate" />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('data-state', 'indeterminate')
      expect(checkbox).toHaveAttribute('aria-checked', 'mixed')
    })

    it('should render disabled state', () => {
      render(<Checkbox disabled />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeDisabled()
      expect(checkbox).toHaveAttribute('data-disabled')
    })

    it('should render required state', () => {
      render(<Checkbox required />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeRequired()
    })
  })

  describe('User Interactions', () => {
    it('should toggle when clicked', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      
      render(<Checkbox onCheckedChange={handleChange} />)
      const checkbox = screen.getByRole('checkbox')
      
      await user.click(checkbox)
      expect(handleChange).toHaveBeenCalledWith(true)
    })

    it('should toggle with spacebar', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      
      render(<Checkbox onCheckedChange={handleChange} />)
      const checkbox = screen.getByRole('checkbox')
      
      checkbox.focus()
      await user.keyboard(' ')
      expect(handleChange).toHaveBeenCalledWith(true)
    })

    it('should not toggle when disabled', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      
      render(<Checkbox disabled onCheckedChange={handleChange} />)
      const checkbox = screen.getByRole('checkbox')
      
      await user.click(checkbox)
      expect(handleChange).not.toHaveBeenCalled()
    })

    it('should handle controlled component pattern', async () => {
      const user = userEvent.setup()
      const TestComponent = () => {
        const [checked, setChecked] = React.useState(false)
        return (
          <>
            <Checkbox
              checked={checked}
              onCheckedChange={(value) => setChecked(value === true)}
            />
            <span data-testid="state">{checked.toString()}</span>
          </>
        )
      }

      render(<TestComponent />)
      const checkbox = screen.getByRole('checkbox')
      const state = screen.getByTestId('state')

      expect(state).toHaveTextContent('false')
      await user.click(checkbox)
      expect(state).toHaveTextContent('true')
    })

    it('should toggle label when clicked', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      
      render(
        <div>
          <Checkbox id="test" onCheckedChange={handleChange} />
          <Label htmlFor="test">Click me</Label>
        </div>
      )
      
      const label = screen.getByText('Click me')
      await user.click(label)
      expect(handleChange).toHaveBeenCalledWith(true)
    })
  })

  describe('Accessibility', () => {
    it('should have no violations with basic checkbox', async () => {
      const { container } = render(<Checkbox />)
      await testAccessibility(container)
    })

    it('should have no violations with label', async () => {
      const { container } = render(
        <div>
          <Checkbox id="test" />
          <Label htmlFor="test">Test Label</Label>
        </div>
      )
      await testAccessibility(container)
    })

    it('should have no violations when disabled', async () => {
      const { container } = render(<Checkbox disabled />)
      await testAccessibility(container)
    })

    it('should have no violations when checked', async () => {
      const { container } = render(<Checkbox checked={true} />)
      await testAccessibility(container)
    })

    it('should have proper aria-label', () => {
      render(<Checkbox aria-label="Custom label" />)
      const checkbox = screen.getByLabelText('Custom label')
      expect(checkbox).toBeInTheDocument()
    })

    it('should have proper aria-checked attribute', () => {
      const { rerender } = render(<Checkbox checked={false} />)
      let checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('aria-checked', 'false')

      rerender(<Checkbox checked={true} />)
      checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('aria-checked', 'true')

      rerender(<Checkbox checked="indeterminate" />)
      checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('aria-checked', 'mixed')
    })

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup()
      render(
        <div>
          <Checkbox id="checkbox1" />
          <Checkbox id="checkbox2" />
        </div>
      )

      const checkboxes = screen.getAllByRole('checkbox')
      
      // Tab to first checkbox
      await user.tab()
      expect(checkboxes[0]).toHaveFocus()

      // Tab to second checkbox
      await user.tab()
      expect(checkboxes[1]).toHaveFocus()
    })
  })

  describe('Form Integration', () => {
    it('should work with form name attribute', () => {
      render(<Checkbox name="terms" />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('name', 'terms')
    })

    it('should work with form value attribute', () => {
      render(<Checkbox value="accepted" />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('value', 'accepted')
    })

    it('should support required attribute', () => {
      render(<Checkbox required />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeRequired()
    })
  })

  describe('Indeterminate State', () => {
    it('should render indeterminate correctly', () => {
      render(<Checkbox checked="indeterminate" />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('data-state', 'indeterminate')
      expect(checkbox).toHaveAttribute('aria-checked', 'mixed')
    })

    it('should transition from indeterminate to checked', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      
      render(<Checkbox checked="indeterminate" onCheckedChange={handleChange} />)
      const checkbox = screen.getByRole('checkbox')
      
      await user.click(checkbox)
      // When clicking indeterminate, it typically goes to checked
      expect(handleChange).toHaveBeenCalled()
    })
  })

  describe('Select All Pattern', () => {
    it('should handle select all functionality', async () => {
      const user = userEvent.setup()
      
      const TestComponent = () => {
        const [items, setItems] = React.useState([false, false, false])
        const allChecked = items.every(Boolean)
        const someChecked = items.some(Boolean)
        const checkboxState = allChecked ? true : someChecked ? 'indeterminate' : false

        const toggleAll = () => {
          setItems(items.map(() => !allChecked))
        }

        const toggleItem = (index: number) => {
          setItems(prev => prev.map((val, i) => (i === index ? !val : val)))
        }

        return (
          <div>
            <Checkbox
              checked={checkboxState}
              onCheckedChange={toggleAll}
              aria-label="Select all"
            />
            {items.map((checked, i) => (
              <Checkbox
                key={i}
                checked={checked}
                onCheckedChange={() => toggleItem(i)}
                aria-label={`Item ${i + 1}`}
              />
            ))}
          </div>
        )
      }

      render(<TestComponent />)
      
      const selectAll = screen.getByLabelText('Select all')
      const item1 = screen.getByLabelText('Item 1')
      const item2 = screen.getByLabelText('Item 2')

      // Initially unchecked
      expect(selectAll).toHaveAttribute('data-state', 'unchecked')

      // Check one item - should be indeterminate
      await user.click(item1)
      expect(selectAll).toHaveAttribute('data-state', 'indeterminate')

      // Check select all - should check all
      await user.click(selectAll)
      expect(item1).toHaveAttribute('data-state', 'checked')
      expect(item2).toHaveAttribute('data-state', 'checked')
      expect(selectAll).toHaveAttribute('data-state', 'checked')
    })
  })

  describe('Visual States', () => {
    it('should apply focus-visible styles', async () => {
      const user = userEvent.setup()
      render(<Checkbox />)
      const checkbox = screen.getByRole('checkbox')
      
      await user.tab()
      expect(checkbox).toHaveFocus()
      // Radix applies focus-visible state automatically
    })

    it('should apply hover state', async () => {
      const user = userEvent.setup()
      render(<Checkbox />)
      const checkbox = screen.getByRole('checkbox')
      
      await user.hover(checkbox)
      // Component is hoverable (tested via interaction)
    })

    it('should show check icon when checked', () => {
      const { container } = render(<Checkbox checked={true} />)
      const indicator = container.querySelector('[data-slot="checkbox-indicator"]')
      expect(indicator).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid toggling', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      
      render(<Checkbox onCheckedChange={handleChange} />)
      const checkbox = screen.getByRole('checkbox')
      
      await user.click(checkbox)
      await user.click(checkbox)
      await user.click(checkbox)
      
      expect(handleChange).toHaveBeenCalledTimes(3)
    })

    it('should handle undefined checked prop gracefully', () => {
      render(<Checkbox checked={undefined} />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
    })

    it('should maintain state when re-rendered', () => {
      const { rerender } = render(<Checkbox checked={true} />)
      let checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('data-state', 'checked')

      rerender(<Checkbox checked={true} />)
      checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('data-state', 'checked')
    })
  })
})

