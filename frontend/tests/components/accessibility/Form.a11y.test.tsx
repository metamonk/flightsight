import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { testAccessibility } from '@/tests/helpers/accessibility'

describe('Form Accessibility', () => {
  describe('Input with Label', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <div>
          <Label htmlFor="username">Username</Label>
          <Input id="username" type="text" />
        </div>
      )
      await testAccessibility(container)
    })

    it('should associate label with input correctly', () => {
      render(
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" />
        </div>
      )

      const input = screen.getByLabelText(/email address/i)
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'email')
    })

    it('should support aria-describedby for helper text', async () => {
      const { container } = render(
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" aria-describedby="password-hint" />
          <p id="password-hint">Must be at least 8 characters</p>
        </div>
      )

      const input = screen.getByLabelText(/password/i)
      expect(input).toHaveAttribute('aria-describedby', 'password-hint')

      await testAccessibility(container)
    })

    it('should indicate required fields', async () => {
      const { container } = render(
        <div>
          <Label htmlFor="required-field">
            Required Field <span aria-label="required">*</span>
          </Label>
          <Input id="required-field" required aria-required="true" />
        </div>
      )

      const input = screen.getByLabelText(/required field/i)
      expect(input).toHaveAttribute('aria-required', 'true')
      expect(input).toBeRequired()

      await testAccessibility(container)
    })

    it('should handle error states accessibly', async () => {
      const { container } = render(
        <div>
          <Label htmlFor="error-field">Field with Error</Label>
          <Input
            id="error-field"
            aria-invalid="true"
            aria-describedby="error-message"
          />
          <p id="error-message" role="alert">
            This field is required
          </p>
        </div>
      )

      const input = screen.getByLabelText(/field with error/i)
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(input).toHaveAttribute('aria-describedby', 'error-message')

      const errorMessage = screen.getByRole('alert')
      expect(errorMessage).toHaveTextContent(/this field is required/i)

      await testAccessibility(container)
    })
  })

  describe('Input types', () => {
    const inputTypes = ['text', 'email', 'password', 'number', 'tel', 'url', 'search'] as const

    inputTypes.forEach((type) => {
      it(`should have no violations for ${type} input`, async () => {
        const { container } = render(
          <div>
            <Label htmlFor={`${type}-input`}>{type} Input</Label>
            <Input id={`${type}-input`} type={type} />
          </div>
        )
        await testAccessibility(container)
      })
    })
  })

  describe('Keyboard navigation', () => {
    it('should be keyboard navigable', async () => {
      const user = userEvent.setup()
      render(
        <div>
          <Label htmlFor="field1">Field 1</Label>
          <Input id="field1" />
          <Label htmlFor="field2">Field 2</Label>
          <Input id="field2" />
        </div>
      )

      const field1 = screen.getByLabelText(/field 1/i)
      const field2 = screen.getByLabelText(/field 2/i)

      // Tab to first field
      await user.tab()
      expect(field1).toHaveFocus()

      // Tab to second field
      await user.tab()
      expect(field2).toHaveFocus()
    })

    it('should support disabled state', async () => {
      const { container } = render(
        <div>
          <Label htmlFor="disabled-input">Disabled Input</Label>
          <Input id="disabled-input" disabled />
        </div>
      )

      const input = screen.getByLabelText(/disabled input/i)
      expect(input).toBeDisabled()

      await testAccessibility(container)
    })
  })

  describe('Placeholder usage', () => {
    it('should not rely solely on placeholder for label', async () => {
      const { container } = render(
        <div>
          <Label htmlFor="with-placeholder">Search</Label>
          <Input id="with-placeholder" placeholder="Enter search term..." />
        </div>
      )

      // Placeholder should supplement, not replace the label
      const input = screen.getByLabelText(/search/i)
      expect(input).toHaveAttribute('placeholder', 'Enter search term...')

      await testAccessibility(container)
    })
  })

  describe('Autocomplete', () => {
    it('should use appropriate autocomplete attributes', async () => {
      const { container } = render(
        <form>
          <div>
            <Label htmlFor="email-autocomplete">Email</Label>
            <Input id="email-autocomplete" type="email" autoComplete="email" />
          </div>
          <div>
            <Label htmlFor="name-autocomplete">Name</Label>
            <Input id="name-autocomplete" type="text" autoComplete="name" />
          </div>
        </form>
      )

      const emailInput = screen.getByLabelText(/email/i)
      expect(emailInput).toHaveAttribute('autocomplete', 'email')

      const nameInput = screen.getByLabelText(/name/i)
      expect(nameInput).toHaveAttribute('autocomplete', 'name')

      await testAccessibility(container)
    })
  })
})

