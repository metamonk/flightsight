import { describe, it } from 'vitest'
import { render } from '@testing-library/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { testAccessibility } from '@/tests/helpers/accessibility'

describe('Card Accessibility', () => {
  it('should have no accessibility violations with header', async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description text</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card content goes here</p>
        </CardContent>
      </Card>
    )
    await testAccessibility(container)
  })

  it('should have no violations without header', async () => {
    const { container } = render(
      <Card>
        <CardContent>
          <p>Simple card content</p>
        </CardContent>
      </Card>
    )
    await testAccessibility(container)
  })

  it('should have proper heading hierarchy', async () => {
    const { container } = render(
      <div>
        <h1>Page Title</h1>
        <Card>
          <CardHeader>
            <CardTitle>Card Title (should be h2 or h3)</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Content</p>
          </CardContent>
        </Card>
      </div>
    )
    
    await testAccessibility(container)
  })

  it('should support semantic article structure', async () => {
    const { container } = render(
      <article>
        <Card>
          <CardHeader>
            <CardTitle>Article Title</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Article content</p>
          </CardContent>
        </Card>
      </article>
    )

    await testAccessibility(container)
  })

  it('should handle nested interactive elements accessibly', async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Interactive Card</CardTitle>
        </CardHeader>
        <CardContent>
          <button type="button">Primary Action</button>
          <button type="button">Secondary Action</button>
        </CardContent>
      </Card>
    )
    
    await testAccessibility(container)
  })
})

