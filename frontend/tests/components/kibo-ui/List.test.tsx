import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  ListGroup,
  ListItem,
  ListItemMedia,
  ListItemContent,
  ListItemTitle,
  ListItemDescription,
  ListItemActions,
  ListItemHeader,
  ListItemFooter,
  ListItemMetadata,
  ListItemSeparator,
} from '@/components/kibo-ui/list'
import { testAccessibility } from '@/tests/helpers/accessibility'
import { Button } from '@/components/kibo-ui/button'

describe('List Component', () => {
  describe('Basic Rendering', () => {
    it('should render ListGroup with role="list"', () => {
      const { container } = render(
        <ListGroup>
          <ListItem>
            <ListItemContent>
              <ListItemTitle>Test Item</ListItemTitle>
            </ListItemContent>
          </ListItem>
        </ListGroup>
      )
      
      const list = container.querySelector('[role="list"]')
      expect(list).toBeInTheDocument()
    })

    it('should render ListItem with role="listitem"', () => {
      const { container } = render(
        <ListGroup>
          <ListItem>
            <ListItemContent>
              <ListItemTitle>Test Item</ListItemTitle>
            </ListItemContent>
          </ListItem>
        </ListGroup>
      )
      
      const listItem = container.querySelector('[role="listitem"]')
      expect(listItem).toBeInTheDocument()
    })

    it('should render ListItemTitle with text content', () => {
      render(
        <ListGroup>
          <ListItem>
            <ListItemContent>
              <ListItemTitle>Test Title</ListItemTitle>
            </ListItemContent>
          </ListItem>
        </ListGroup>
      )
      
      expect(screen.getByText('Test Title')).toBeInTheDocument()
    })

    it('should render ListItemDescription with text content', () => {
      render(
        <ListGroup>
          <ListItem>
            <ListItemContent>
              <ListItemTitle>Title</ListItemTitle>
              <ListItemDescription>Test Description</ListItemDescription>
            </ListItemContent>
          </ListItem>
        </ListGroup>
      )
      
      expect(screen.getByText('Test Description')).toBeInTheDocument()
    })

    it('should apply custom className to ListGroup', () => {
      const { container } = render(
        <ListGroup className="custom-list">
          <ListItem>
            <ListItemContent>
              <ListItemTitle>Item</ListItemTitle>
            </ListItemContent>
          </ListItem>
        </ListGroup>
      )
      
      expect(container.querySelector('.custom-list')).toBeInTheDocument()
    })

    it('should apply custom className to ListItem', () => {
      const { container } = render(
        <ListGroup>
          <ListItem className="custom-item">
            <ListItemContent>
              <ListItemTitle>Item</ListItemTitle>
            </ListItemContent>
          </ListItem>
        </ListGroup>
      )
      
      expect(container.querySelector('.custom-item')).toBeInTheDocument()
    })
  })

  describe('ListItem Variants', () => {
    it('should render with default variant', () => {
      const { container } = render(
        <ListGroup>
          <ListItem variant="default">
            <ListItemContent>
              <ListItemTitle>Default Item</ListItemTitle>
            </ListItemContent>
          </ListItem>
        </ListGroup>
      )
      
      const item = container.querySelector('[data-variant="default"]')
      expect(item).toBeInTheDocument()
    })

    it('should render with outline variant', () => {
      const { container } = render(
        <ListGroup>
          <ListItem variant="outline">
            <ListItemContent>
              <ListItemTitle>Outlined Item</ListItemTitle>
            </ListItemContent>
          </ListItem>
        </ListGroup>
      )
      
      const item = container.querySelector('[data-variant="outline"]')
      expect(item).toBeInTheDocument()
    })

    it('should render with muted variant', () => {
      const { container } = render(
        <ListGroup>
          <ListItem variant="muted">
            <ListItemContent>
              <ListItemTitle>Muted Item</ListItemTitle>
            </ListItemContent>
          </ListItem>
        </ListGroup>
      )
      
      const item = container.querySelector('[data-variant="muted"]')
      expect(item).toBeInTheDocument()
    })
  })

  describe('ListItem Sizes', () => {
    it('should render with small size', () => {
      const { container } = render(
        <ListGroup>
          <ListItem size="sm">
            <ListItemContent>
              <ListItemTitle>Small Item</ListItemTitle>
            </ListItemContent>
          </ListItem>
        </ListGroup>
      )
      
      const item = container.querySelector('[data-size="sm"]')
      expect(item).toBeInTheDocument()
    })

    it('should render with default size', () => {
      const { container } = render(
        <ListGroup>
          <ListItem size="default">
            <ListItemContent>
              <ListItemTitle>Default Size Item</ListItemTitle>
            </ListItemContent>
          </ListItem>
        </ListGroup>
      )
      
      const item = container.querySelector('[data-size="default"]')
      expect(item).toBeInTheDocument()
    })

    it('should render with large size', () => {
      const { container } = render(
        <ListGroup>
          <ListItem size="lg">
            <ListItemContent>
              <ListItemTitle>Large Item</ListItemTitle>
            </ListItemContent>
          </ListItem>
        </ListGroup>
      )
      
      const item = container.querySelector('[data-size="lg"]')
      expect(item).toBeInTheDocument()
    })
  })

  describe('ListItemMedia Component', () => {
    it('should render with default variant', () => {
      const { container } = render(
        <ListItemMedia variant="default">
          <span>Icon</span>
        </ListItemMedia>
      )
      
      const media = container.querySelector('[data-variant="default"]')
      expect(media).toBeInTheDocument()
    })

    it('should render with icon variant', () => {
      const { container } = render(
        <ListItemMedia variant="icon">
          <span>📧</span>
        </ListItemMedia>
      )
      
      const media = container.querySelector('[data-variant="icon"]')
      expect(media).toBeInTheDocument()
    })

    it('should render with image variant', () => {
      const { container } = render(
        <ListItemMedia variant="image">
          <img src="/test.jpg" alt="Test" />
        </ListItemMedia>
      )
      
      const media = container.querySelector('[data-variant="image"]')
      expect(media).toBeInTheDocument()
    })

    it('should render with avatar variant', () => {
      const { container } = render(
        <ListItemMedia variant="avatar">
          <img src="/avatar.jpg" alt="User" />
        </ListItemMedia>
      )
      
      const media = container.querySelector('[data-variant="avatar"]')
      expect(media).toBeInTheDocument()
    })

    it('should render children content', () => {
      render(
        <ListItemMedia>
          <span data-testid="media-child">Content</span>
        </ListItemMedia>
      )
      
      expect(screen.getByTestId('media-child')).toBeInTheDocument()
    })
  })

  describe('ListItemActions Component', () => {
    it('should render action buttons', () => {
      render(
        <ListGroup>
          <ListItem>
            <ListItemContent>
              <ListItemTitle>Item with Actions</ListItemTitle>
            </ListItemContent>
            <ListItemActions>
              <Button size="sm">Edit</Button>
              <Button size="sm">Delete</Button>
            </ListItemActions>
          </ListItem>
        </ListGroup>
      )
      
      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    })

    it('should render multiple actions in a row', () => {
      const { container } = render(
        <ListItemActions>
          <button>Action 1</button>
          <button>Action 2</button>
          <button>Action 3</button>
        </ListItemActions>
      )
      
      const actions = container.querySelectorAll('button')
      expect(actions.length).toBe(3)
    })
  })

  describe('ListItemHeader and ListItemFooter', () => {
    it('should render header component', () => {
      render(
        <ListGroup>
          <ListItem>
            <ListItemHeader>
              <span>Header Content</span>
            </ListItemHeader>
            <ListItemContent>
              <ListItemTitle>Item</ListItemTitle>
            </ListItemContent>
          </ListItem>
        </ListGroup>
      )
      
      expect(screen.getByText('Header Content')).toBeInTheDocument()
    })

    it('should render footer component', () => {
      render(
        <ListGroup>
          <ListItem>
            <ListItemContent>
              <ListItemTitle>Item</ListItemTitle>
            </ListItemContent>
            <ListItemFooter>
              <span>Footer Content</span>
            </ListItemFooter>
          </ListItem>
        </ListGroup>
      )
      
      expect(screen.getByText('Footer Content')).toBeInTheDocument()
    })

    it('should render both header and footer', () => {
      render(
        <ListGroup>
          <ListItem>
            <ListItemHeader>Header</ListItemHeader>
            <ListItemContent>
              <ListItemTitle>Content</ListItemTitle>
            </ListItemContent>
            <ListItemFooter>Footer</ListItemFooter>
          </ListItem>
        </ListGroup>
      )
      
      expect(screen.getByText('Header')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
      expect(screen.getByText('Footer')).toBeInTheDocument()
    })
  })

  describe('ListItemMetadata Component', () => {
    it('should render metadata content', () => {
      render(
        <ListItemMetadata>
          <span>Created: 2 days ago</span>
          <span>•</span>
          <span>Updated: 1 hour ago</span>
        </ListItemMetadata>
      )
      
      expect(screen.getByText('Created: 2 days ago')).toBeInTheDocument()
      expect(screen.getByText('Updated: 1 hour ago')).toBeInTheDocument()
    })
  })

  describe('ListItemSeparator Component', () => {
    it('should render separator between items', () => {
      const { container } = render(
        <ListGroup>
          <ListItem>
            <ListItemContent>
              <ListItemTitle>Item 1</ListItemTitle>
            </ListItemContent>
          </ListItem>
          <ListItemSeparator />
          <ListItem>
            <ListItemContent>
              <ListItemTitle>Item 2</ListItemTitle>
            </ListItemContent>
          </ListItem>
        </ListGroup>
      )
      
      const separator = container.querySelector('[data-slot="list-item-separator"]')
      expect(separator).toBeInTheDocument()
    })
  })

  describe('Data Slots', () => {
    it('should apply correct data-slot attributes', () => {
      const { container } = render(
        <ListGroup>
          <ListItem>
            <ListItemHeader>Header</ListItemHeader>
            <ListItemMedia>Media</ListItemMedia>
            <ListItemContent>
              <ListItemTitle>Title</ListItemTitle>
              <ListItemDescription>Description</ListItemDescription>
            </ListItemContent>
            <ListItemActions>Actions</ListItemActions>
            <ListItemFooter>Footer</ListItemFooter>
          </ListItem>
        </ListGroup>
      )

      expect(container.querySelector('[data-slot="list-group"]')).toBeInTheDocument()
      expect(container.querySelector('[data-slot="list-item"]')).toBeInTheDocument()
      expect(container.querySelector('[data-slot="list-item-header"]')).toBeInTheDocument()
      expect(container.querySelector('[data-slot="list-item-media"]')).toBeInTheDocument()
      expect(container.querySelector('[data-slot="list-item-content"]')).toBeInTheDocument()
      expect(container.querySelector('[data-slot="list-item-title"]')).toBeInTheDocument()
      expect(container.querySelector('[data-slot="list-item-description"]')).toBeInTheDocument()
      expect(container.querySelector('[data-slot="list-item-actions"]')).toBeInTheDocument()
      expect(container.querySelector('[data-slot="list-item-footer"]')).toBeInTheDocument()
    })
  })

  describe('Interactive Features', () => {
    it('should support asChild prop for custom wrapper', () => {
      render(
        <ListGroup>
          <ListItem asChild>
            <a href="/test">
              <ListItemContent>
                <ListItemTitle>Clickable Item</ListItemTitle>
              </ListItemContent>
            </a>
          </ListItem>
        </ListGroup>
      )
      
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/test')
      expect(link).toHaveAttribute('role', 'listitem')
    })

    it('should apply hover styles on interactive items', () => {
      const { container } = render(
        <ListGroup>
          <ListItem asChild>
            <a href="/test">
              <ListItemContent>
                <ListItemTitle>Hoverable Item</ListItemTitle>
              </ListItemContent>
            </a>
          </ListItem>
        </ListGroup>
      )
      
      const item = container.querySelector('[data-slot="list-item"]')
      expect(item).toHaveClass('transition-colors')
    })
  })

  describe('Accessibility', () => {
    it('should have no violations with basic list', async () => {
      const { container } = render(
        <ListGroup>
          <ListItem>
            <ListItemContent>
              <ListItemTitle>Accessible Item</ListItemTitle>
            </ListItemContent>
          </ListItem>
        </ListGroup>
      )
      await testAccessibility(container)
    })

    it('should have no violations with complete list structure', async () => {
      const { container } = render(
        <ListGroup>
          <ListItem>
            <ListItemMedia variant="icon">
              <span aria-label="User icon">👤</span>
            </ListItemMedia>
            <ListItemContent>
              <ListItemTitle>John Doe</ListItemTitle>
              <ListItemDescription>Flight Instructor</ListItemDescription>
            </ListItemContent>
            <ListItemActions>
              <Button size="sm">Edit</Button>
            </ListItemActions>
          </ListItem>
        </ListGroup>
      )
      await testAccessibility(container)
    })

    it('should have no violations with interactive list items', async () => {
      const { container } = render(
        <ListGroup>
          <ListItem asChild>
            <a href="/user/1">
              <ListItemMedia variant="avatar">
                <img src="/avatar.jpg" alt="John Doe" />
              </ListItemMedia>
              <ListItemContent>
                <ListItemTitle>John Doe</ListItemTitle>
                <ListItemDescription>View profile</ListItemDescription>
              </ListItemContent>
            </a>
          </ListItem>
        </ListGroup>
      )
      await testAccessibility(container)
    })

    it('should support ARIA attributes via spread props', () => {
      render(
        <ListGroup aria-label="User list">
          <ListItem>
            <ListItemContent>
              <ListItemTitle>User 1</ListItemTitle>
            </ListItemContent>
          </ListItem>
        </ListGroup>
      )
      
      const list = screen.getByLabelText('User list')
      expect(list).toBeInTheDocument()
    })

    it('should have proper focus indicators', () => {
      const { container } = render(
        <ListGroup>
          <ListItem>
            <ListItemContent>
              <ListItemTitle>Focusable Item</ListItemTitle>
            </ListItemContent>
          </ListItem>
        </ListGroup>
      )
      
      const item = container.querySelector('[data-slot="list-item"]')
      expect(item).toHaveClass('focus-visible:ring-[3px]')
      expect(item).toHaveClass('focus-visible:border-ring')
    })
  })

  describe('Complex Compositions', () => {
    it('should handle user list example', async () => {
      const users = [
        { id: '1', name: 'John Doe', role: 'Instructor', avatar: '/john.jpg' },
        { id: '2', name: 'Jane Smith', role: 'Student', avatar: '/jane.jpg' },
      ]

      const { container } = render(
        <ListGroup>
          {users.map((user, index) => (
            <div key={user.id}>
              {index > 0 && <ListItemSeparator />}
              <ListItem variant="outline">
                <ListItemMedia variant="avatar">
                  <img src={user.avatar} alt={user.name} />
                </ListItemMedia>
                <ListItemContent>
                  <ListItemTitle>{user.name}</ListItemTitle>
                  <ListItemDescription>{user.role}</ListItemDescription>
                </ListItemContent>
                <ListItemActions>
                  <Button size="sm">Edit</Button>
                </ListItemActions>
              </ListItem>
            </div>
          ))}
        </ListGroup>
      )

      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('Instructor')).toBeInTheDocument()
      expect(screen.getByText('Student')).toBeInTheDocument()
      await testAccessibility(container)
    })

    it('should handle booking list example with header and footer', async () => {
      const { container } = render(
        <ListGroup>
          <ListItem size="lg" variant="outline">
            <ListItemHeader>
              <span>Booking #1234</span>
              <span className="text-xs text-muted-foreground">Nov 10, 2025</span>
            </ListItemHeader>
            
            <ListItemMedia variant="icon">
              <span aria-label="Aircraft icon">✈️</span>
            </ListItemMedia>
            
            <ListItemContent>
              <ListItemTitle>Flight Training Lesson</ListItemTitle>
              <ListItemDescription>
                Cessna 172 with Instructor Smith at 10:00 AM
              </ListItemDescription>
            </ListItemContent>
            
            <ListItemFooter>
              <Button size="sm" variant="outline">Reschedule</Button>
              <Button size="sm">Confirm</Button>
            </ListItemFooter>
          </ListItem>
        </ListGroup>
      )

      expect(screen.getByText('Booking #1234')).toBeInTheDocument()
      expect(screen.getByText('Flight Training Lesson')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Reschedule' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
      await testAccessibility(container)
    })

    it('should handle multiple content sections', async () => {
      const { container } = render(
        <ListGroup>
          <ListItem>
            <ListItemMedia variant="image">
              <img src="/aircraft.jpg" alt="Aircraft" />
            </ListItemMedia>
            
            <ListItemContent>
              <ListItemTitle>N12345 - Cessna 172</ListItemTitle>
              <ListItemDescription>Available for training</ListItemDescription>
            </ListItemContent>
            
            <ListItemContent>
              <div className="text-right">
                <div className="font-medium">$150/hr</div>
                <div className="text-xs text-muted-foreground">Dual instruction</div>
              </div>
            </ListItemContent>
            
            <ListItemActions>
              <Button size="sm">Book Now</Button>
            </ListItemActions>
          </ListItem>
        </ListGroup>
      )

      expect(screen.getByText('N12345 - Cessna 172')).toBeInTheDocument()
      expect(screen.getByText('$150/hr')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Book Now' })).toBeInTheDocument()
      await testAccessibility(container)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty ListGroup', () => {
      const { container } = render(<ListGroup />)
      const list = container.querySelector('[role="list"]')
      expect(list).toBeInTheDocument()
      expect(list?.children.length).toBe(0)
    })

    it('should handle ListItem without ListItemContent', () => {
      render(
        <ListGroup>
          <ListItem>
            <div>Custom content without ListItemContent</div>
          </ListItem>
        </ListGroup>
      )
      
      expect(screen.getByText('Custom content without ListItemContent')).toBeInTheDocument()
    })

    it('should handle ListItemDescription with links', () => {
      render(
        <ListItemDescription>
          Learn more at <a href="/help">our help center</a>
        </ListItemDescription>
      )
      
      const link = screen.getByRole('link', { name: 'our help center' })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/help')
    })

    it('should truncate long descriptions with line-clamp-2', () => {
      const { container } = render(
        <ListItemDescription>
          This is a very long description that should be truncated after two lines.
          It contains multiple sentences and should demonstrate the line-clamp behavior.
          This third line and beyond should not be visible.
        </ListItemDescription>
      )
      
      const description = container.querySelector('[data-slot="list-item-description"]')
      expect(description).toHaveClass('line-clamp-2')
    })
  })
})

