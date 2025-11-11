import * as React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { testAccessibility } from '@/tests/helpers/accessibility'

describe('Textarea Component', () => {
  describe('Basic Rendering', () => {
    it('should render textarea', () => {
      render(<Textarea />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeInTheDocument()
    })

    it('should render with label', () => {
      render(
        <div>
          <Label htmlFor="test">Test Label</Label>
          <Textarea id="test" />
        </div>
      )
      
      const textarea = screen.getByRole('textbox')
      const label = screen.getByText('Test Label')
      expect(textarea).toBeInTheDocument()
      expect(label).toBeInTheDocument()
    })

    it('should render with placeholder', () => {
      render(<Textarea placeholder="Enter text here..." />)
      const textarea = screen.getByPlaceholderText('Enter text here...')
      expect(textarea).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      render(<Textarea className="custom-class" />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('custom-class')
    })

    it('should have data-slot attribute', () => {
      render(<Textarea />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('data-slot', 'textarea')
    })
  })

  describe('States', () => {
    it('should render empty by default', () => {
      render(<Textarea />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveValue('')
    })

    it('should render with value', () => {
      render(<Textarea value="Test content" readOnly />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveValue('Test content')
    })

    it('should render with defaultValue', () => {
      render(<Textarea defaultValue="Default content" />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveValue('Default content')
    })

    it('should render disabled state', () => {
      render(<Textarea disabled />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeDisabled()
    })

    it('should render required state', () => {
      render(<Textarea required />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeRequired()
    })

    it('should render with aria-invalid for error state', () => {
      render(<Textarea aria-invalid />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('aria-invalid', 'true')
    })

    it('should render with custom rows', () => {
      render(<Textarea rows={5} />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('rows', '5')
    })
  })

  describe('User Interactions', () => {
    it('should handle text input', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      
      render(<Textarea onChange={handleChange} />)
      const textarea = screen.getByRole('textbox')
      
      await user.type(textarea, 'Hello World')
      expect(textarea).toHaveValue('Hello World')
      expect(handleChange).toHaveBeenCalled()
    })

    it('should handle multi-line input', async () => {
      const user = userEvent.setup()
      
      render(<Textarea />)
      const textarea = screen.getByRole('textbox')
      
      await user.type(textarea, 'Line 1{Enter}Line 2{Enter}Line 3')
      expect(textarea).toHaveValue('Line 1\nLine 2\nLine 3')
    })

    it('should handle paste events', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      
      render(<Textarea onChange={handleChange} />)
      const textarea = screen.getByRole('textbox')
      
      await user.click(textarea)
      await user.paste('Pasted content')
      expect(textarea).toHaveValue('Pasted content')
    })

    it('should not accept input when disabled', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      
      render(<Textarea disabled onChange={handleChange} />)
      const textarea = screen.getByRole('textbox')
      
      await user.type(textarea, 'Test')
      expect(textarea).toHaveValue('')
      expect(handleChange).not.toHaveBeenCalled()
    })

    it('should handle controlled component pattern', async () => {
      const user = userEvent.setup()
      const TestComponent = () => {
        const [value, setValue] = React.useState('')
        return (
          <>
            <Textarea value={value} onChange={(e) => setValue(e.target.value)} />
            <span data-testid="value">{value}</span>
          </>
        )
      }

      render(<TestComponent />)
      const textarea = screen.getByRole('textbox')
      const value = screen.getByTestId('value')

      expect(value).toHaveTextContent('')
      await user.type(textarea, 'New text')
      expect(value).toHaveTextContent('New text')
    })

    it('should handle clear/delete operations', async () => {
      const user = userEvent.setup()
      
      render(<Textarea defaultValue="Test content" />)
      const textarea = screen.getByRole('textbox')
      
      await user.clear(textarea)
      expect(textarea).toHaveValue('')
    })
  })

  describe('Accessibility', () => {
    it('should have no violations with basic textarea', async () => {
      const { container } = render(<Textarea aria-label="Test textarea" />)
      await testAccessibility(container)
    })

    it('should have no violations with label', async () => {
      const { container } = render(
        <div>
          <Label htmlFor="test">Test Label</Label>
          <Textarea id="test" />
        </div>
      )
      await testAccessibility(container)
    })

    it('should have no violations when disabled', async () => {
      const { container } = render(<Textarea disabled aria-label="Disabled textarea" />)
      await testAccessibility(container)
    })

    it('should have no violations with value', async () => {
      const { container } = render(<Textarea value="Test" readOnly aria-label="Read-only textarea" />)
      await testAccessibility(container)
    })

    it('should have proper aria-label', () => {
      render(<Textarea aria-label="Custom label" />)
      const textarea = screen.getByLabelText('Custom label')
      expect(textarea).toBeInTheDocument()
    })

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup()
      render(
        <div>
          <Textarea id="textarea1" />
          <Textarea id="textarea2" />
        </div>
      )

      const textareas = screen.getAllByRole('textbox')
      
      // Tab to first textarea
      await user.tab()
      expect(textareas[0]).toHaveFocus()

      // Tab to second textarea
      await user.tab()
      expect(textareas[1]).toHaveFocus()
    })

    it('should support aria-describedby for helper text', () => {
      render(
        <div>
          <Textarea aria-describedby="helper" />
          <p id="helper">Helper text</p>
        </div>
      )
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('aria-describedby', 'helper')
    })
  })

  describe('Form Integration', () => {
    it('should work with form name attribute', () => {
      render(<Textarea name="description" />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('name', 'description')
    })

    it('should support required attribute', () => {
      render(<Textarea required />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeRequired()
    })

    it('should support maxLength constraint', () => {
      render(<Textarea maxLength={100} />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('maxLength', '100')
    })

    it('should support minLength constraint', () => {
      render(<Textarea minLength={10} />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('minLength', '10')
    })

    it('should enforce maxLength', async () => {
      const user = userEvent.setup()
      render(<Textarea maxLength={5} />)
      const textarea = screen.getByRole('textbox')
      
      await user.type(textarea, '1234567890')
      expect(textarea).toHaveValue('12345')
    })
  })

  describe('Character Count', () => {
    it('should display character count', async () => {
      const user = userEvent.setup()
      const TestComponent = () => {
        const [value, setValue] = React.useState('')
        return (
          <div>
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              maxLength={100}
            />
            <span data-testid="count">{value.length}/100</span>
          </div>
        )
      }

      render(<TestComponent />)
      const textarea = screen.getByRole('textbox')
      const count = screen.getByTestId('count')

      expect(count).toHaveTextContent('0/100')
      
      await user.type(textarea, 'Test')
      expect(count).toHaveTextContent('4/100')
    })
  })

  describe('Multi-line Support', () => {
    it('should handle Enter key for new lines', async () => {
      const user = userEvent.setup()
      render(<Textarea />)
      const textarea = screen.getByRole('textbox')
      
      await user.type(textarea, 'Line 1{Enter}Line 2')
      expect(textarea).toHaveValue('Line 1\nLine 2')
    })

    it('should handle multiple paragraphs', async () => {
      const user = userEvent.setup()
      render(<Textarea />)
      const textarea = screen.getByRole('textbox')
      
      await user.type(textarea, 'Paragraph 1{Enter}{Enter}Paragraph 2')
      expect(textarea).toHaveValue('Paragraph 1\n\nParagraph 2')
    })

    it('should maintain line breaks in value', () => {
      const multilineText = 'Line 1\nLine 2\nLine 3'
      render(<Textarea value={multilineText} readOnly />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveValue(multilineText)
    })
  })

  describe('Focus Management', () => {
    it('should handle focus', async () => {
      const user = userEvent.setup()
      render(<Textarea />)
      const textarea = screen.getByRole('textbox')
      
      await user.click(textarea)
      expect(textarea).toHaveFocus()
    })

    it('should handle blur', async () => {
      const user = userEvent.setup()
      const handleBlur = vi.fn()
      
      render(<Textarea onBlur={handleBlur} />)
      const textarea = screen.getByRole('textbox')
      
      await user.click(textarea)
      await user.tab()
      expect(handleBlur).toHaveBeenCalled()
    })

    it('should call onFocus when focused', async () => {
      const user = userEvent.setup()
      const handleFocus = vi.fn()
      
      render(<Textarea onFocus={handleFocus} />)
      const textarea = screen.getByRole('textbox')
      
      await user.click(textarea)
      expect(handleFocus).toHaveBeenCalled()
    })
  })

  describe('Styling Classes', () => {
    it('should have base styling classes', () => {
      render(<Textarea />)
      const textarea = screen.getByRole('textbox')
      
      // Check for key design system classes
      expect(textarea).toHaveClass('border-input')
      expect(textarea).toHaveClass('rounded-md')
      expect(textarea).toHaveClass('min-h-16')
    })

    it('should merge custom classes with base classes', () => {
      render(<Textarea className="text-lg font-mono" />)
      const textarea = screen.getByRole('textbox')
      
      expect(textarea).toHaveClass('text-lg')
      expect(textarea).toHaveClass('font-mono')
      expect(textarea).toHaveClass('border-input') // Base class still present
    })

    it('should have field-sizing-content for auto-resize', () => {
      render(<Textarea />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('field-sizing-content')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string value', () => {
      render(<Textarea value="" readOnly />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveValue('')
    })

    it('should handle undefined value gracefully', () => {
      render(<Textarea value={undefined} />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeInTheDocument()
    })

    it('should handle very long text', async () => {
      const user = userEvent.setup()
      const longText = 'A'.repeat(1000)
      
      render(<Textarea />)
      const textarea = screen.getByRole('textbox')
      
      await user.click(textarea)
      await user.paste(longText)
      expect(textarea).toHaveValue(longText)
    })

    it('should handle special characters', async () => {
      const user = userEvent.setup()
      // Use paste instead of type for special characters to avoid parsing issues
      const specialText = '!@#$%^&*()_+-=[]{}|;:,.<>?'
      
      render(<Textarea />)
      const textarea = screen.getByRole('textbox')
      
      await user.click(textarea)
      await user.paste(specialText)
      expect(textarea).toHaveValue(specialText)
    })

    it('should handle unicode characters', async () => {
      const user = userEvent.setup()
      const unicodeText = '🎉 Hello 世界 🌍'
      
      render(<Textarea />)
      const textarea = screen.getByRole('textbox')
      
      await user.click(textarea)
      await user.paste(unicodeText)
      expect(textarea).toHaveValue(unicodeText)
    })

    it('should maintain state when re-rendered', () => {
      const { rerender } = render(<Textarea value="Test" readOnly />)
      let textarea = screen.getByRole('textbox')
      expect(textarea).toHaveValue('Test')

      rerender(<Textarea value="Test" readOnly />)
      textarea = screen.getByRole('textbox')
      expect(textarea).toHaveValue('Test')
    })
  })

  describe('Read-only State', () => {
    it('should render read-only textarea', () => {
      render(<Textarea readOnly value="Read-only content" />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('readOnly')
    })

    it('should not allow editing when read-only', async () => {
      const user = userEvent.setup()
      render(<Textarea readOnly value="Original" />)
      const textarea = screen.getByRole('textbox')
      
      await user.type(textarea, 'New')
      expect(textarea).toHaveValue('Original')
    })
  })

  describe('Auto-resize Behavior', () => {
    it('should have field-sizing-content class', () => {
      render(<Textarea />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('field-sizing-content')
    })

    it('should have minimum height', () => {
      render(<Textarea />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('min-h-16')
    })

    it('should allow custom minimum height', () => {
      render(<Textarea className="min-h-32" />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('min-h-32')
    })
  })

  describe('Placeholder', () => {
    it('should display placeholder when empty', () => {
      render(<Textarea placeholder="Enter your thoughts..." />)
      const textarea = screen.getByPlaceholderText('Enter your thoughts...')
      expect(textarea).toBeInTheDocument()
    })

    it('should hide placeholder when typing', async () => {
      const user = userEvent.setup()
      render(<Textarea placeholder="Type here..." />)
      const textarea = screen.getByPlaceholderText('Type here...')
      
      await user.type(textarea, 'Content')
      // Placeholder is automatically hidden by browser when value exists
      expect(textarea).toHaveValue('Content')
    })
  })
})

