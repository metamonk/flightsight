import * as React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { testAccessibility } from '@/tests/helpers/accessibility'
import { InfoIcon, AlertCircleIcon } from 'lucide-react'

describe('Alert Component', () => {
  describe('Basic Rendering', () => {
    it('should render alert with title', () => {
      render(
        <Alert>
          <AlertTitle>Test Title</AlertTitle>
        </Alert>
      )
      expect(screen.getByText('Test Title')).toBeInTheDocument()
    })

    it('should render alert with description', () => {
      render(
        <Alert>
          <AlertDescription>Test Description</AlertDescription>
        </Alert>
      )
      expect(screen.getByText('Test Description')).toBeInTheDocument()
    })

    it('should render alert with title and description', () => {
      render(
        <Alert>
          <AlertTitle>Title</AlertTitle>
          <AlertDescription>Description</AlertDescription>
        </Alert>
      )
      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('should render alert with icon', () => {
      render(
        <Alert>
          <InfoIcon data-testid="alert-icon" />
          <AlertTitle>Title</AlertTitle>
        </Alert>
      )
      expect(screen.getByTestId('alert-icon')).toBeInTheDocument()
    })

    it('should have data-slot attributes', () => {
      render(
        <Alert>
          <AlertTitle>Title</AlertTitle>
          <AlertDescription>Description</AlertDescription>
        </Alert>
      )
      
      const title = screen.getByText('Title')
      const description = screen.getByText('Description')
      
      expect(title).toHaveAttribute('data-slot', 'alert-title')
      expect(description).toHaveAttribute('data-slot', 'alert-description')
    })

    it('should render without children', () => {
      const { container } = render(<Alert />)
      expect(container.querySelector('[data-slot="alert"]')).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it('should render default variant', () => {
      render(
        <Alert>
          <AlertTitle>Default</AlertTitle>
        </Alert>
      )
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('bg-card')
      expect(alert).toHaveClass('text-card-foreground')
    })

    it('should render destructive variant', () => {
      render(
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
        </Alert>
      )
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('text-destructive')
    })

    it('should render warning variant', () => {
      render(
        <Alert variant="warning">
          <AlertTitle>Warning</AlertTitle>
        </Alert>
      )
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('border-orange-500')
      expect(alert).toHaveClass('bg-orange-50')
    })

    it('should render hud variant', () => {
      render(
        <Alert variant="hud">
          <AlertTitle>Success</AlertTitle>
        </Alert>
      )
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('border-primary/30')
      expect(alert).toHaveClass('bg-primary/5')
    })
  })

  describe('Accessibility', () => {
    it('should have role="alert"', () => {
      render(
        <Alert>
          <AlertTitle>Alert</AlertTitle>
        </Alert>
      )
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('should have no violations with default alert', async () => {
      const { container } = render(
        <Alert>
          <AlertTitle>Title</AlertTitle>
          <AlertDescription>Description</AlertDescription>
        </Alert>
      )
      await testAccessibility(container)
    })

    it('should have no violations with icon', async () => {
      const { container } = render(
        <Alert>
          <InfoIcon />
          <AlertTitle>Title</AlertTitle>
          <AlertDescription>Description</AlertDescription>
        </Alert>
      )
      await testAccessibility(container)
    })

    it('should have no violations with destructive variant', async () => {
      const { container } = render(
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Error message</AlertDescription>
        </Alert>
      )
      await testAccessibility(container)
    })

    it('should have no violations with warning variant', async () => {
      const { container } = render(
        <Alert variant="warning">
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>Warning message</AlertDescription>
        </Alert>
      )
      await testAccessibility(container)
    })

    it('should have no violations with hud variant', async () => {
      const { container } = render(
        <Alert variant="hud">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Success message</AlertDescription>
        </Alert>
      )
      await testAccessibility(container)
    })
  })

  describe('Custom Styling', () => {
    it('should apply custom className to Alert', () => {
      render(
        <Alert className="custom-alert">
          <AlertTitle>Title</AlertTitle>
        </Alert>
      )
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('custom-alert')
    })

    it('should apply custom className to AlertTitle', () => {
      render(
        <Alert>
          <AlertTitle className="custom-title">Title</AlertTitle>
        </Alert>
      )
      const title = screen.getByText('Title')
      expect(title).toHaveClass('custom-title')
    })

    it('should apply custom className to AlertDescription', () => {
      render(
        <Alert>
          <AlertDescription className="custom-description">
            Description
          </AlertDescription>
        </Alert>
      )
      const description = screen.getByText('Description')
      expect(description).toHaveClass('custom-description')
    })

    it('should merge custom classes with default classes', () => {
      render(
        <Alert className="shadow-md">
          <AlertTitle>Title</AlertTitle>
        </Alert>
      )
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('shadow-md')
      expect(alert).toHaveClass('rounded-lg')
      expect(alert).toHaveClass('border')
    })
  })

  describe('Content Composition', () => {
    it('should render title only', () => {
      render(
        <Alert>
          <AlertTitle>Title Only</AlertTitle>
        </Alert>
      )
      expect(screen.getByText('Title Only')).toBeInTheDocument()
      expect(screen.queryByText('Description')).not.toBeInTheDocument()
    })

    it('should render description only', () => {
      render(
        <Alert>
          <AlertDescription>Description Only</AlertDescription>
        </Alert>
      )
      expect(screen.getByText('Description Only')).toBeInTheDocument()
      expect(screen.queryByText('Title')).not.toBeInTheDocument()
    })

    it('should render icon, title, and description together', () => {
      render(
        <Alert>
          <InfoIcon data-testid="icon" />
          <AlertTitle>Title</AlertTitle>
          <AlertDescription>Description</AlertDescription>
        </Alert>
      )
      expect(screen.getByTestId('icon')).toBeInTheDocument()
      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('should render multiple paragraphs in description', () => {
      render(
        <Alert>
          <AlertTitle>Title</AlertTitle>
          <AlertDescription>
            <p>First paragraph</p>
            <p>Second paragraph</p>
          </AlertDescription>
        </Alert>
      )
      expect(screen.getByText('First paragraph')).toBeInTheDocument()
      expect(screen.getByText('Second paragraph')).toBeInTheDocument()
    })

    it('should render list in description', () => {
      render(
        <Alert variant="destructive">
          <AlertTitle>Validation Errors</AlertTitle>
          <AlertDescription>
            <ul>
              <li>Error 1</li>
              <li>Error 2</li>
            </ul>
          </AlertDescription>
        </Alert>
      )
      expect(screen.getByText('Error 1')).toBeInTheDocument()
      expect(screen.getByText('Error 2')).toBeInTheDocument()
    })
  })

  describe('Grid Layout', () => {
    it('should use grid layout', () => {
      render(
        <Alert>
          <AlertTitle>Title</AlertTitle>
        </Alert>
      )
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('grid')
    })

    it('should adjust grid columns when icon is present', () => {
      const { container } = render(
        <Alert>
          <InfoIcon />
          <AlertTitle>Title</AlertTitle>
        </Alert>
      )
      const alert = container.querySelector('[data-slot="alert"]')
      expect(alert).toHaveClass('has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr]')
    })

    it('should have proper gap between icon and content', () => {
      render(
        <Alert>
          <InfoIcon />
          <AlertTitle>Title</AlertTitle>
        </Alert>
      )
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('has-[>svg]:gap-x-3')
    })
  })

  describe('Icon Styling', () => {
    it('should style icon with proper size', () => {
      render(
        <Alert>
          <InfoIcon data-testid="icon" />
          <AlertTitle>Title</AlertTitle>
        </Alert>
      )
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('[&>svg]:size-4')
    })

    it('should have icon color classes for warning variant', () => {
      render(
        <Alert variant="warning">
          <InfoIcon data-testid="icon" />
          <AlertTitle>Warning</AlertTitle>
        </Alert>
      )
      const alert = screen.getByRole('alert')
      // Warning variant has specific icon color classes
      expect(alert).toHaveClass('[&>svg]:text-orange-600')
      expect(alert).toHaveClass('dark:[&>svg]:text-orange-400')
    })
  })

  describe('Responsive Behavior', () => {
    it('should be full width by default', () => {
      render(
        <Alert>
          <AlertTitle>Title</AlertTitle>
        </Alert>
      )
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('w-full')
    })

    it('should allow width override with className', () => {
      render(
        <Alert className="w-auto">
          <AlertTitle>Title</AlertTitle>
        </Alert>
      )
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('w-auto')
    })
  })

  describe('DOM Properties', () => {
    it('should forward standard div props to Alert', () => {
      render(
        <Alert data-testid="custom-alert" id="alert-1">
          <AlertTitle>Title</AlertTitle>
        </Alert>
      )
      const alert = screen.getByTestId('custom-alert')
      expect(alert).toHaveAttribute('id', 'alert-1')
    })

    it('should forward standard div props to AlertTitle', () => {
      render(
        <Alert>
          <AlertTitle data-testid="custom-title" id="title-1">
            Title
          </AlertTitle>
        </Alert>
      )
      const title = screen.getByTestId('custom-title')
      expect(title).toHaveAttribute('id', 'title-1')
    })

    it('should forward standard div props to AlertDescription', () => {
      render(
        <Alert>
          <AlertDescription data-testid="custom-desc" id="desc-1">
            Description
          </AlertDescription>
        </Alert>
      )
      const description = screen.getByTestId('custom-desc')
      expect(description).toHaveAttribute('id', 'desc-1')
    })
  })

  describe('Real-world Scenarios', () => {
    it('should render form validation error', () => {
      render(
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Validation Error</AlertTitle>
          <AlertDescription>
            <ul>
              <li>Email is required</li>
              <li>Password must be at least 8 characters</li>
            </ul>
          </AlertDescription>
        </Alert>
      )
      expect(screen.getByText('Validation Error')).toBeInTheDocument()
      expect(screen.getByText('Email is required')).toBeInTheDocument()
      expect(screen.getByText(/Password must be at least 8 characters/)).toBeInTheDocument()
    })

    it('should render success notification', () => {
      render(
        <Alert variant="hud">
          <AlertTitle>Profile Updated</AlertTitle>
          <AlertDescription>
            Your profile information has been successfully updated.
          </AlertDescription>
        </Alert>
      )
      expect(screen.getByText('Profile Updated')).toBeInTheDocument()
      expect(screen.getByText(/successfully updated/)).toBeInTheDocument()
    })

    it('should render warning before destructive action', () => {
      render(
        <Alert variant="warning">
          <AlertTitle>Are you sure?</AlertTitle>
          <AlertDescription>
            This will permanently delete your account and all associated data.
          </AlertDescription>
        </Alert>
      )
      expect(screen.getByText('Are you sure?')).toBeInTheDocument()
      expect(screen.getByText(/permanently delete/)).toBeInTheDocument()
    })

    it('should render system status', () => {
      render(
        <Alert>
          <AlertTitle>System Status</AlertTitle>
          <AlertDescription>
            All systems operational.
          </AlertDescription>
        </Alert>
      )
      expect(screen.getByText('System Status')).toBeInTheDocument()
      expect(screen.getByText('All systems operational.')).toBeInTheDocument()
    })

    it('should render network error', () => {
      render(
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Connection Lost</AlertTitle>
          <AlertDescription>
            Unable to connect to the server. Please check your internet connection.
          </AlertDescription>
        </Alert>
      )
      expect(screen.getByText('Connection Lost')).toBeInTheDocument()
      expect(screen.getByText(/Unable to connect/)).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty title gracefully', () => {
      render(
        <Alert>
          <AlertTitle></AlertTitle>
          <AlertDescription>Description</AlertDescription>
        </Alert>
      )
      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('should handle empty description gracefully', () => {
      render(
        <Alert>
          <AlertTitle>Title</AlertTitle>
          <AlertDescription></AlertDescription>
        </Alert>
      )
      expect(screen.getByText('Title')).toBeInTheDocument()
    })

    it('should handle long title text', () => {
      const longTitle = 'This is a very long title that might wrap to multiple lines in some layouts'
      render(
        <Alert>
          <AlertTitle>{longTitle}</AlertTitle>
        </Alert>
      )
      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })

    it('should handle long description text', () => {
      const longDescription = 'This is a very long description that contains multiple sentences and provides detailed information about the alert. It should wrap naturally and maintain readability across different screen sizes.'
      render(
        <Alert>
          <AlertDescription>{longDescription}</AlertDescription>
        </Alert>
      )
      expect(screen.getByText(longDescription)).toBeInTheDocument()
    })

    it('should handle special characters in content', () => {
      render(
        <Alert>
          <AlertTitle>Alert & Warning: Important!</AlertTitle>
          <AlertDescription>
            Special chars: {'<'} {'>'} & " '
          </AlertDescription>
        </Alert>
      )
      expect(screen.getByText(/Alert & Warning/)).toBeInTheDocument()
    })
  })

  describe('Typography', () => {
    it('should have correct title typography classes', () => {
      render(
        <Alert>
          <AlertTitle>Title</AlertTitle>
        </Alert>
      )
      const title = screen.getByText('Title')
      expect(title).toHaveClass('font-medium')
      expect(title).toHaveClass('tracking-tight')
    })

    it('should have correct description typography classes', () => {
      render(
        <Alert>
          <AlertDescription>Description</AlertDescription>
        </Alert>
      )
      const description = screen.getByText('Description')
      expect(description).toHaveClass('text-sm')
      expect(description).toHaveClass('text-muted-foreground')
    })

    it('should have relaxed line height for description paragraphs', () => {
      render(
        <Alert>
          <AlertDescription>
            <p>Paragraph text</p>
          </AlertDescription>
        </Alert>
      )
      const description = screen.getByText('Paragraph text').parentElement
      expect(description).toHaveClass('[&_p]:leading-relaxed')
    })
  })
})

