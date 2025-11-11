import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Button,
  ButtonPulse,
  ButtonIcon,
  ButtonGroup,
} from '@/components/kibo-ui/button'
import { testAccessibility } from '@/tests/helpers/accessibility'

describe('Button Component', () => {
  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
    })

    it('should render with custom className', () => {
      render(<Button className="custom-class">Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })

    it('should apply data-slot attribute', () => {
      const { container } = render(<Button>Button</Button>)
      const button = container.querySelector('[data-slot="button"]')
      expect(button).toBeInTheDocument()
    })

    it('should forward ref correctly', () => {
      const ref = vi.fn()
      render(<Button ref={ref}>Button</Button>)
      expect(ref).toHaveBeenCalled()
    })
  })

  describe('Variants', () => {
    const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const

    variants.forEach((variant) => {
      it(`should render ${variant} variant`, () => {
        render(<Button variant={variant}>{variant}</Button>)
        expect(screen.getByRole('button', { name: new RegExp(variant, 'i') })).toBeInTheDocument()
      })
    })
  })

  describe('Sizes', () => {
    const sizes = ['default', 'sm', 'lg', 'icon', 'icon-sm', 'icon-lg'] as const

    sizes.forEach((size) => {
      it(`should render ${size} size`, () => {
        const isIconButton = size.includes('icon')
        render(
          <Button size={size} aria-label={isIconButton ? 'Icon button' : undefined}>
            {isIconButton ? '×' : size}
          </Button>
        )
        const button = screen.getByRole('button')
        expect(button).toBeInTheDocument()
      })
    })
  })

  describe('Glow Effects', () => {
    it('should not render glow wrapper by default', () => {
      const { container } = render(<Button>No Glow</Button>)
      // No glow wrapper div should exist
      const glowWrapper = container.querySelector('.relative.inline-flex')
      expect(glowWrapper).not.toBeInTheDocument()
    })

    it('should render glow wrapper when withGlow is true', () => {
      const { container } = render(<Button withGlow>With Glow</Button>)
      const glowWrapper = container.querySelector('.relative.inline-flex')
      expect(glowWrapper).toBeInTheDocument()
    })

    it('should render glow effect layer with aria-hidden', () => {
      const { container } = render(<Button withGlow>Glow Button</Button>)
      const glowLayer = container.querySelector('[aria-hidden="true"]')
      expect(glowLayer).toBeInTheDocument()
    })

    it('should apply correct glow color for default variant', () => {
      const { container } = render(
        <Button withGlow variant="default">
          Default Glow
        </Button>
      )
      const glowLayer = container.querySelector('[aria-hidden="true"]')
      expect(glowLayer).toHaveClass('bg-primary/20')
    })

    it('should apply correct glow color for destructive variant', () => {
      const { container } = render(
        <Button withGlow variant="destructive">
          Destructive Glow
        </Button>
      )
      const glowLayer = container.querySelector('[aria-hidden="true"]')
      expect(glowLayer).toHaveClass('bg-destructive/20')
    })

    it('should apply correct glow color for secondary variant', () => {
      const { container } = render(
        <Button withGlow variant="secondary">
          Secondary Glow
        </Button>
      )
      const glowLayer = container.querySelector('[aria-hidden="true"]')
      expect(glowLayer).toHaveClass('bg-secondary/20')
    })

    it('should apply subtle glow intensity', () => {
      const { container } = render(
        <Button withGlow glowIntensity="subtle">
          Subtle Glow
        </Button>
      )
      const glowLayer = container.querySelector('[aria-hidden="true"]')
      expect(glowLayer).toHaveClass('blur-md')
    })

    it('should apply medium glow intensity by default', () => {
      const { container } = render(<Button withGlow>Medium Glow</Button>)
      const glowLayer = container.querySelector('[aria-hidden="true"]')
      expect(glowLayer).toHaveClass('blur-xl')
    })

    it('should apply strong glow intensity', () => {
      const { container } = render(
        <Button withGlow glowIntensity="strong">
          Strong Glow
        </Button>
      )
      const glowLayer = container.querySelector('[aria-hidden="true"]')
      expect(glowLayer).toHaveClass('blur-2xl')
    })

    it('should have group class on button with glow', () => {
      render(<Button withGlow>Group Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('group')
      expect(button).toHaveClass('relative')
    })
  })

  describe('ButtonPulse Component', () => {
    it('should render with pulsing glow', () => {
      const { container } = render(<ButtonPulse>Pulse Button</ButtonPulse>)
      expect(screen.getByRole('button')).toBeInTheDocument()
      const glowLayer = container.querySelector('.animate-pulse')
      expect(glowLayer).toBeInTheDocument()
    })

    it('should have glow wrapper', () => {
      const { container } = render(<ButtonPulse>Pulse</ButtonPulse>)
      const wrapper = container.querySelector('.relative.inline-flex')
      expect(wrapper).toBeInTheDocument()
    })

    it('should apply correct glow color based on variant', () => {
      const { container } = render(
        <ButtonPulse variant="destructive">Destructive Pulse</ButtonPulse>
      )
      const glowLayer = container.querySelector('.animate-pulse')
      expect(glowLayer).toHaveClass('bg-destructive/20')
    })

    it('should have aria-hidden on glow layer', () => {
      const { container } = render(<ButtonPulse>Pulse</ButtonPulse>)
      const glowLayer = container.querySelector('.animate-pulse')
      expect(glowLayer).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('ButtonIcon Component', () => {
    it('should render with icon size by default', () => {
      render(
        <ButtonIcon aria-label="Close">×</ButtonIcon>
      )
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should require aria-label', () => {
      render(<ButtonIcon aria-label="Icon action">×</ButtonIcon>)
      const button = screen.getByRole('button', { name: /icon action/i })
      expect(button).toHaveAccessibleName()
    })

    it('should support withGlow prop', () => {
      const { container } = render(
        <ButtonIcon withGlow aria-label="Glow icon">
          ×
        </ButtonIcon>
      )
      const glowWrapper = container.querySelector('.relative.inline-flex')
      expect(glowWrapper).toBeInTheDocument()
    })

    it('should support all variants', () => {
      render(
        <ButtonIcon variant="destructive" aria-label="Delete">
          ×
        </ButtonIcon>
      )
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('ButtonGroup Component', () => {
    it('should render with role="group"', () => {
      render(
        <ButtonGroup>
          <Button>One</Button>
          <Button>Two</Button>
        </ButtonGroup>
      )
      const group = screen.getByRole('group')
      expect(group).toBeInTheDocument()
    })

    it('should render horizontal by default', () => {
      const { container } = render(
        <ButtonGroup>
          <Button>One</Button>
          <Button>Two</Button>
        </ButtonGroup>
      )
      const group = container.querySelector('.flex-row')
      expect(group).toBeInTheDocument()
    })

    it('should render vertical when specified', () => {
      const { container } = render(
        <ButtonGroup orientation="vertical">
          <Button>One</Button>
          <Button>Two</Button>
        </ButtonGroup>
      )
      const group = container.querySelector('.flex-col')
      expect(group).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      render(
        <ButtonGroup className="custom-group">
          <Button>One</Button>
        </ButtonGroup>
      )
      const group = screen.getByRole('group')
      expect(group).toHaveClass('custom-group')
    })
  })

  describe('Interaction', () => {
    it('should call onClick handler', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      render(<Button onClick={handleClick}>Click me</Button>)
      const button = screen.getByRole('button')

      await user.click(button)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not call onClick when disabled', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      )
      const button = screen.getByRole('button')

      await user.click(button)
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('should be keyboard accessible', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      render(<Button onClick={handleClick}>Keyboard</Button>)
      const button = screen.getByRole('button')

      await user.tab()
      expect(button).toHaveFocus()

      await user.keyboard('{Enter}')
      expect(handleClick).toHaveBeenCalled()
    })
  })

  describe('asChild Prop', () => {
    it('should render as child component when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      )
      const link = screen.getByRole('link')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/test')
    })
  })

  describe('Accessibility', () => {
    it('should have no violations with default button', async () => {
      const { container } = render(<Button>Accessible Button</Button>)
      await testAccessibility(container)
    })

    it('should have no violations with glow effect', async () => {
      const { container } = render(<Button withGlow>Glow Button</Button>)
      await testAccessibility(container)
    })

    it('should have no violations with ButtonPulse', async () => {
      const { container } = render(<ButtonPulse>Pulse Button</ButtonPulse>)
      await testAccessibility(container)
    })

    it('should have no violations with ButtonIcon', async () => {
      const { container } = render(
        <ButtonIcon aria-label="Close">×</ButtonIcon>
      )
      await testAccessibility(container)
    })

    it('should have no violations with ButtonGroup', async () => {
      const { container } = render(
        <ButtonGroup>
          <Button>One</Button>
          <Button>Two</Button>
          <Button>Three</Button>
        </ButtonGroup>
      )
      await testAccessibility(container)
    })

    it('should support ARIA attributes', () => {
      render(
        <Button aria-label="Custom label" aria-pressed="true">
          Toggle
        </Button>
      )
      const button = screen.getByRole('button')
      expect(button).toHaveAccessibleName()
      expect(button).toHaveAttribute('aria-pressed', 'true')
    })

    it('should have proper disabled state', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveAttribute('disabled')
    })
  })

  describe('All Variants with Glow', () => {
    const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost'] as const

    variants.forEach((variant) => {
      it(`should render ${variant} variant with glow without violations`, async () => {
        const { container } = render(
          <Button withGlow variant={variant}>
            {variant} with glow
          </Button>
        )
        await testAccessibility(container)
      })
    })
  })

  describe('All Sizes with Glow', () => {
    const sizes = ['default', 'sm', 'lg'] as const

    sizes.forEach((size) => {
      it(`should render ${size} size with glow`, () => {
        render(
          <Button withGlow size={size}>
            {size} with glow
          </Button>
        )
        expect(screen.getByRole('button')).toBeInTheDocument()
      })
    })
  })

  describe('Complex Compositions', () => {
    it('should handle ButtonGroup with mixed buttons', async () => {
      const { container } = render(
        <ButtonGroup>
          <Button variant="default">Default</Button>
          <Button variant="outline">Outline</Button>
          <ButtonIcon variant="ghost" aria-label="More">
            ⋯
          </ButtonIcon>
        </ButtonGroup>
      )

      expect(screen.getAllByRole('button')).toHaveLength(3)
      await testAccessibility(container)
    })

    it('should handle ButtonPulse with icon', async () => {
      const { container } = render(
        <ButtonPulse variant="default">
          <span>⚡</span>
          Live Status
        </ButtonPulse>
      )

      expect(screen.getByRole('button')).toBeInTheDocument()
      await testAccessibility(container)
    })

    it('should handle Button with glow and all features', async () => {
      const handleClick = vi.fn()
      const { container } = render(
        <Button
          withGlow
          glowIntensity="strong"
          variant="default"
          size="lg"
          onClick={handleClick}
          aria-label="Call to action"
        >
          <span>🚀</span>
          Get Started
        </Button>
      )

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()

      const user = userEvent.setup()
      await user.click(button)
      expect(handleClick).toHaveBeenCalled()

      await testAccessibility(container)
    })
  })
})

