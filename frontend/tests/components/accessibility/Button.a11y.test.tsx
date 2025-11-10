import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'
import { testAccessibility, a11yScenarios } from '@/tests/helpers/accessibility'

describe('Button Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>)
    await testAccessibility(container)
  })

  it('should be keyboard navigable', async () => {
    const user = userEvent.setup()
    render(<Button>Click me</Button>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    
    // Tab to button
    await user.tab()
    expect(button).toHaveFocus()
    
    // Space/Enter should trigger button
    await user.keyboard('{Enter}')
  })

  it('should have proper ARIA attributes when disabled', async () => {
    const { container } = render(<Button disabled>Disabled Button</Button>)
    
    const button = screen.getByRole('button', { name: /disabled button/i })
    expect(button).toBeDisabled()
    
    // Verify no accessibility violations with disabled state
    await testAccessibility(container)
  })

  it('should support aria-label for icon-only buttons', async () => {
    const { container } = render(
      <Button aria-label="Close dialog">
        <span aria-hidden="true">×</span>
      </Button>
    )
    
    const button = screen.getByRole('button', { name: /close dialog/i })
    expect(button).toBeInTheDocument()
    
    await testAccessibility(container)
  })

  it('should have proper focus styles', () => {
    render(<Button>Focusable</Button>)
    
    const button = screen.getByRole('button', { name: /focusable/i })
    
    // Check that button is focusable
    expect(button).not.toHaveAttribute('tabindex', '-1')
  })

  describe('Button variants', () => {
    const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const
    
    variants.forEach((variant) => {
      it(`should have no violations for ${variant} variant`, async () => {
        const { container } = render(
          <Button variant={variant}>{variant} Button</Button>
        )
        await testAccessibility(container)
      })
    })
  })

  describe('Button sizes', () => {
    const sizes = ['default', 'sm', 'lg', 'icon'] as const
    
    sizes.forEach((size) => {
      it(`should have no violations for ${size} size`, async () => {
        const { container } = render(
          <Button size={size} aria-label={size === 'icon' ? 'Icon button' : undefined}>
            {size === 'icon' ? '×' : `${size} Button`}
          </Button>
        )
        await testAccessibility(container)
      })
    })
  })

  it('should handle loading state accessibly', async () => {
    const { container } = render(
      <Button disabled aria-busy="true">
        Loading...
      </Button>
    )
    
    const button = screen.getByRole('button', { name: /loading/i })
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).toBeDisabled()
    
    await testAccessibility(container)
  })
})

