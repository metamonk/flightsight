import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
  CardStatus,
  CardIcon,
  CardStats,
  CardStat,
  CardDivider,
} from '@/components/kibo-ui/card'
import { testAccessibility } from '@/tests/helpers/accessibility'

describe('Card Component', () => {
  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(
        <Card>
          <CardContent>Test content</CardContent>
        </Card>
      )
      expect(screen.getByText('Test content')).toBeInTheDocument()
    })

    it('should render with all subcomponents', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
            <CardDescription>Test Description</CardDescription>
            <CardAction>
              <button>Action</button>
            </CardAction>
          </CardHeader>
          <CardContent>Content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      )

      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
      expect(screen.getByText('Footer')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(
        <Card className="custom-class">
          <CardContent>Content</CardContent>
        </Card>
      )
      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })
  })

  describe('HUD Features', () => {
    it('should render corner brackets by default', () => {
      const { container } = render(
        <Card>
          <CardContent>Content</CardContent>
        </Card>
      )
      // Should have 4 corner bracket elements
      const corners = container.querySelectorAll('[class*="border-l-2"][class*="border-t-2"], [class*="border-r-2"][class*="border-t-2"], [class*="border-l-2"][class*="border-b-2"], [class*="border-r-2"][class*="border-b-2"]')
      expect(corners.length).toBe(4)
    })

    it('should hide corner brackets when withCorners is false', () => {
      const { container } = render(
        <Card withCorners={false}>
          <CardContent>Content</CardContent>
        </Card>
      )
      const corners = container.querySelectorAll('[class*="border-l-2"][class*="border-t-2"]')
      expect(corners.length).toBe(0)
    })

    it('should render grid overlay by default', () => {
      const { container } = render(
        <Card>
          <CardContent>Content</CardContent>
        </Card>
      )
      const grid = container.querySelector('[class*="bg-\\[linear-gradient"]')
      expect(grid).toBeInTheDocument()
    })

    it('should hide grid overlay when withGrid is false', () => {
      const { container } = render(
        <Card withGrid={false}>
          <CardContent>Content</CardContent>
        </Card>
      )
      const grid = container.querySelector('[class*="bg-\\[linear-gradient"]')
      expect(grid).toBeNull()
    })

    it('should not render glow by default', () => {
      const { container } = render(
        <Card>
          <CardContent>Content</CardContent>
        </Card>
      )
      const glows = container.querySelectorAll('[class*="bg-gradient-to-r"]')
      // Should not find glow (there might be other gradients, so we check the specific glow pattern)
      const topGlow = Array.from(glows).find(el => 
        el.classList.contains('top-0') && el.classList.contains('h-\\[1px\\]')
      )
      expect(topGlow).toBeFalsy()
    })

    it('should render glow when withGlow is true', () => {
      const { container } = render(
        <Card withGlow>
          <CardContent>Content</CardContent>
        </Card>
      )
      const glow = container.querySelector('.top-0.h-\\[1px\\]')
      expect(glow).toBeInTheDocument()
    })

    it('should not render scan line by default', () => {
      const { container } = render(
        <Card>
          <CardContent>Content</CardContent>
        </Card>
      )
      const scanLine = container.querySelector('[class*="animate-\\[scan"]')
      expect(scanLine).toBeNull()
    })

    it('should render scan line when withScanLine is true', () => {
      const { container } = render(
        <Card withScanLine>
          <CardContent>Content</CardContent>
        </Card>
      )
      const scanLine = container.querySelector('[class*="animate-\\[scan"]')
      expect(scanLine).toBeInTheDocument()
    })
  })

  describe('CardStatus Component', () => {
    it('should render with default active status', () => {
      render(<CardStatus label="System Active" />)
      expect(screen.getByText('System Active')).toBeInTheDocument()
    })

    it('should render with ID', () => {
      render(<CardStatus label="Active" id="WX-2025" />)
      expect(screen.getByText('ID: WX-2025')).toBeInTheDocument()
    })

    it('should apply correct styling for different statuses', () => {
      const { container: activeContainer } = render(
        <CardStatus status="active" label="Active" />
      )
      const { container: errorContainer } = render(
        <CardStatus status="error" label="Error" />
      )

      const activeDot = activeContainer.querySelector('[class*="bg-accent"]')
      const errorDot = errorContainer.querySelector('[class*="bg-destructive"]')

      expect(activeDot).toBeInTheDocument()
      expect(errorDot).toBeInTheDocument()
    })

    it('should show pulse animation for active status', () => {
      const { container } = render(<CardStatus status="active" label="Active" />)
      const dot = container.querySelector('[class*="animate-pulse"]')
      expect(dot).toBeInTheDocument()
    })

    it('should not show pulse animation for inactive status', () => {
      const { container } = render(<CardStatus status="inactive" label="Inactive" />)
      const dots = container.querySelectorAll('[class*="animate-pulse"]')
      expect(dots.length).toBe(0)
    })
  })

  describe('CardIcon Component', () => {
    it('should render with glow by default', () => {
      const { container } = render(
        <CardIcon>
          <span>Icon</span>
        </CardIcon>
      )
      const glow = container.querySelector('[class*="animate-pulse"][class*="blur-xl"]')
      expect(glow).toBeInTheDocument()
    })

    it('should hide glow when withGlow is false', () => {
      const { container } = render(
        <CardIcon withGlow={false}>
          <span>Icon</span>
        </CardIcon>
      )
      const glow = container.querySelector('[class*="animate-pulse"][class*="blur-xl"]')
      expect(glow).toBeNull()
    })

    it('should render children', () => {
      render(
        <CardIcon>
          <span data-testid="icon-child">Icon Content</span>
        </CardIcon>
      )
      expect(screen.getByTestId('icon-child')).toBeInTheDocument()
    })
  })

  describe('CardStats Component', () => {
    it('should render stats in grid layout', () => {
      render(
        <CardStats>
          <CardStat label="Update Rate" value="60min" />
          <CardStat label="Accuracy" value="98.5%" />
          <CardStat label="Coverage" value="Global" />
        </CardStats>
      )

      expect(screen.getByText('Update Rate')).toBeInTheDocument()
      expect(screen.getByText('60min')).toBeInTheDocument()
      expect(screen.getByText('Accuracy')).toBeInTheDocument()
      expect(screen.getByText('98.5%')).toBeInTheDocument()
      expect(screen.getByText('Coverage')).toBeInTheDocument()
      expect(screen.getByText('Global')).toBeInTheDocument()
    })

    it('should apply correct variant colors', () => {
      const { container } = render(
        <div>
          <CardStat label="Primary" value="Value1" variant="primary" />
          <CardStat label="Accent" value="Value2" variant="accent" />
        </div>
      )

      const primaryValue = screen.getByText('Value1')
      const accentValue = screen.getByText('Value2')

      expect(primaryValue).toHaveClass('text-primary')
      expect(accentValue).toHaveClass('text-accent')
    })
  })

  describe('CardDivider Component', () => {
    it('should render divider with gradient', () => {
      const { container } = render(<CardDivider />)
      const divider = container.querySelector('[class*="bg-gradient-to-r"]')
      expect(divider).toBeInTheDocument()
    })
  })

  describe('Data Slots', () => {
    it('should apply correct data-slot attributes', () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description</CardDescription>
            <CardAction>Action</CardAction>
          </CardHeader>
          <CardContent>Content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      )

      expect(container.querySelector('[data-slot="card"]')).toBeInTheDocument()
      expect(container.querySelector('[data-slot="card-header"]')).toBeInTheDocument()
      expect(container.querySelector('[data-slot="card-title"]')).toBeInTheDocument()
      expect(container.querySelector('[data-slot="card-description"]')).toBeInTheDocument()
      expect(container.querySelector('[data-slot="card-action"]')).toBeInTheDocument()
      expect(container.querySelector('[data-slot="card-content"]')).toBeInTheDocument()
      expect(container.querySelector('[data-slot="card-footer"]')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have no violations with default card', async () => {
      const { container } = render(
        <Card>
          <CardContent>Accessible content</CardContent>
        </Card>
      )
      await testAccessibility(container)
    })

    it('should have no violations with full card structure', async () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Accessible Title</CardTitle>
            <CardDescription>Accessible description</CardDescription>
          </CardHeader>
          <CardContent>Accessible content</CardContent>
          <CardFooter>Accessible footer</CardFooter>
        </Card>
      )
      await testAccessibility(container)
    })

    it('should have no violations with HUD features', async () => {
      const { container } = render(
        <Card withCorners withGrid withGlow withScanLine>
          <CardHeader>
            <CardStatus status="active" label="Active" id="TEST-001" />
          </CardHeader>
          <CardContent>
            <CardIcon>
              <span aria-label="Weather icon">☁️</span>
            </CardIcon>
          </CardContent>
          <CardFooter>
            <CardStats>
              <CardStat label="Rate" value="60min" />
              <CardStat label="Accuracy" value="98%" />
            </CardStats>
          </CardFooter>
        </Card>
      )
      await testAccessibility(container)
    })

    it('should support ARIA attributes via spread props', () => {
      render(
        <Card aria-label="Weather card" role="region">
          <CardContent>Weather data</CardContent>
        </Card>
      )

      const card = screen.getByLabelText('Weather card')
      expect(card).toHaveAttribute('role', 'region')
    })
  })

  describe('Complex Compositions', () => {
    it('should handle weather monitoring card example', async () => {
      const { container } = render(
        <Card withCorners withGrid withGlow>
          <CardContent>
            <CardStatus status="active" label="System Active" id="WX-2025" />
            <div className="my-8">
              <CardIcon>
                <span aria-label="Rain icon">🌧️</span>
              </CardIcon>
            </div>
            <div className="space-y-2">
              <h2 className="font-mono text-4xl font-bold">Weather Monitoring</h2>
              <CardDivider />
            </div>
            <p className="mt-4 text-lg text-muted-foreground">
              Hourly checks for safe flying conditions
            </p>
            <CardStats>
              <CardStat label="Update Rate" value="60min" variant="primary" />
              <CardStat label="Accuracy" value="98.5%" variant="accent" />
              <CardStat label="Coverage" value="Global" />
            </CardStats>
          </CardContent>
        </Card>
      )

      expect(screen.getByText('Weather Monitoring')).toBeInTheDocument()
      await testAccessibility(container)
    })
  })
})

