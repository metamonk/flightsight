# Accessibility Testing Guide

This guide outlines the accessibility testing setup and best practices for FlightSight components.

## Table of Contents

- [Setup](#setup)
- [Running Accessibility Tests](#running-accessibility-tests)
- [Writing Accessibility Tests](#writing-accessibility-tests)
- [Common Patterns](#common-patterns)
- [Testing Checklist](#testing-checklist)
- [Tools and Resources](#tools-and-resources)

## Setup

### Installed Packages

- **axe-core** (v4.11.0): Core accessibility testing engine
- **jest-axe** (v10.0.0): Vitest/Jest integration for axe-core
- **@axe-core/react** (v4.11.0): React-specific accessibility checking

### Configuration

The accessibility testing setup is configured in:

1. **`tests/setup.ts`**: Extends Vitest's `expect` with `toHaveNoViolations()` matcher
2. **`tests/vitest.d.ts`**: TypeScript type definitions for jest-axe matchers

## Running Accessibility Tests

```bash
# Run all tests (including accessibility tests)
pnpm test

# Run only accessibility tests
pnpm test accessibility

# Run tests in watch mode
pnpm test --watch

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage
```

## Writing Accessibility Tests

### Basic Test Structure

```typescript
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { MyComponent } from '@/components/MyComponent'

describe('MyComponent - Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<MyComponent />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

### Testing Specific Rules

```typescript
it('should have sufficient color contrast', async () => {
  const { container } = render(<MyComponent />)
  const results = await axe(container, {
    rules: {
      'color-contrast': { enabled: true },
    },
  })
  expect(results).toHaveNoViolations()
})
```

### Testing with Options

```typescript
it('should be accessible', async () => {
  const { container } = render(<MyComponent />)
  const results = await axe(container, {
    // Include specific rules
    rules: {
      'color-contrast': { enabled: true },
      'label': { enabled: true },
    },
    // Or exclude specific rules (use sparingly!)
    rules: {
      'color-contrast': { enabled: false },
    },
  })
  expect(results).toHaveNoViolations()
})
```

## Common Patterns

### Testing Interactive Components

```typescript
describe('Button Component - Accessibility', () => {
  it('should be keyboard accessible', () => {
    const { getByRole } = render(<Button>Click me</Button>)
    const button = getByRole('button')
    
    // Button should be focusable
    expect(button).not.toHaveAttribute('tabindex', '-1')
  })

  it('should have accessible label', () => {
    const { getByRole } = render(<Button aria-label="Submit form">Submit</Button>)
    const button = getByRole('button', { name: /submit form/i })
    expect(button).toBeInTheDocument()
  })
})
```

### Testing Forms

```typescript
describe('Form - Accessibility', () => {
  it('should have proper labels', () => {
    const { getByLabelText } = render(
      <form>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" />
      </form>
    )
    const emailInput = getByLabelText(/email/i)
    expect(emailInput).toBeInTheDocument()
  })

  it('should have accessible error messages', () => {
    const { getByRole } = render(
      <form>
        <input aria-invalid="true" aria-describedby="error-msg" />
        <div id="error-msg" role="alert">Email is required</div>
      </form>
    )
    const errorMsg = getByRole('alert')
    expect(errorMsg).toHaveTextContent(/email is required/i)
  })
})
```

### Testing Navigation

```typescript
describe('Navigation - Accessibility', () => {
  it('should have proper landmarks', () => {
    const { container } = render(<Navigation />)
    const nav = container.querySelector('nav')
    expect(nav).toBeInTheDocument()
  })

  it('should have skip links', () => {
    const { getByText } = render(<Navigation />)
    const skipLink = getByText(/skip to main content/i)
    expect(skipLink).toBeInTheDocument()
  })
})
```

### Testing Modals/Dialogs

```typescript
describe('Modal - Accessibility', () => {
  it('should trap focus', async () => {
    const { getByRole } = render(<Modal isOpen={true} />)
    const dialog = getByRole('dialog')
    
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('should have accessible close button', () => {
    const { getByRole } = render(<Modal isOpen={true} />)
    const closeButton = getByRole('button', { name: /close/i })
    expect(closeButton).toBeInTheDocument()
  })
})
```

### Testing Data Tables

```typescript
describe('DataTable - Accessibility', () => {
  it('should use semantic table elements', () => {
    const { container } = render(<DataTable data={mockData} />)
    
    const table = container.querySelector('table')
    const thead = container.querySelector('thead')
    const tbody = container.querySelector('tbody')
    
    expect(table).toBeInTheDocument()
    expect(thead).toBeInTheDocument()
    expect(tbody).toBeInTheDocument()
  })

  it('should have proper column headers', () => {
    const { getAllByRole } = render(<DataTable data={mockData} />)
    const columnHeaders = getAllByRole('columnheader')
    expect(columnHeaders.length).toBeGreaterThan(0)
  })
})
```

## Testing Checklist

Use this checklist when testing components for accessibility:

### WCAG 2.2 Level A (Required)

- [ ] **Keyboard Navigation**: All interactive elements are keyboard accessible
- [ ] **Focus Visible**: Focus indicators are visible
- [ ] **Form Labels**: All form inputs have associated labels
- [ ] **Alternative Text**: Images have alt text (or are decorative)
- [ ] **Semantic HTML**: Use proper HTML5 elements
- [ ] **Heading Structure**: Logical heading hierarchy
- [ ] **Link Purpose**: Link text is descriptive

### WCAG 2.2 Level AA (Recommended)

- [ ] **Color Contrast**: Text has 4.5:1 contrast ratio (3:1 for large text)
- [ ] **Resize Text**: Text can be resized to 200% without loss of functionality
- [ ] **Multiple Ways**: Multiple ways to navigate (e.g., search, sitemap)
- [ ] **Focus Order**: Tab order is logical
- [ ] **Error Identification**: Form errors are clearly identified
- [ ] **Labels or Instructions**: Form fields have clear labels

### Additional Checks

- [ ] **Screen Reader Testing**: Test with NVDA/JAWS/VoiceOver
- [ ] **Keyboard-Only Navigation**: Test without mouse
- [ ] **Mobile Accessibility**: Test on touch devices
- [ ] **ARIA Usage**: ARIA attributes are used correctly
- [ ] **Dynamic Content**: Live regions announce updates

## Tools and Resources

### Automated Testing Tools

- **axe DevTools**: Browser extension for accessibility testing
- **Lighthouse**: Built into Chrome DevTools
- **WAVE**: Web accessibility evaluation tool
- **axe-core**: Automated accessibility testing engine (we use this)

### Manual Testing Tools

- **NVDA**: Free screen reader for Windows
- **JAWS**: Popular commercial screen reader
- **VoiceOver**: Built into macOS/iOS
- **Keyboard**: Test tab order and keyboard navigation

### Resources

- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)
- [Deque University](https://dequeuniversity.com/)
- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)

### Component Libraries

- **Radix UI**: We use this - it has excellent accessibility built-in
- **shadcn/ui**: Our UI component library built on Radix UI

### Testing Commands

```bash
# Run accessibility tests specifically
pnpm test accessibility

# Run tests for a specific component
pnpm test ProposalCard.a11y

# Run tests in watch mode for development
pnpm test --watch accessibility

# Generate coverage report
pnpm test:coverage
```

## CI/CD Integration

Accessibility tests run automatically in CI/CD:

```yaml
# .github/workflows/test.yml
- name: Run Tests
  run: pnpm test

- name: Run Accessibility Tests
  run: pnpm test accessibility
```

## Common Issues and Fixes

### Issue: Color Contrast Violations

```typescript
// ❌ BAD: Insufficient contrast
<p className="text-gray-400 bg-gray-300">Low contrast text</p>

// ✅ GOOD: Sufficient contrast
<p className="text-gray-900 bg-white">High contrast text</p>
```

### Issue: Missing Form Labels

```typescript
// ❌ BAD: No label
<input type="email" placeholder="Email" />

// ✅ GOOD: Proper label
<label htmlFor="email">Email</label>
<input id="email" type="email" />
```

### Issue: Non-Semantic Button

```typescript
// ❌ BAD: Div as button
<div onClick={handleClick}>Click me</div>

// ✅ GOOD: Proper button
<button onClick={handleClick}>Click me</button>
```

### Issue: Missing Alt Text

```typescript
// ❌ BAD: No alt text
<img src="profile.jpg" />

// ✅ GOOD: Descriptive alt text
<img src="profile.jpg" alt="User profile picture" />

// ✅ GOOD: Decorative image
<img src="decorative.jpg" alt="" role="presentation" />
```

## Next Steps

1. Run the accessibility tests: `pnpm test accessibility`
2. Review any violations and fix them
3. Add accessibility tests for new components
4. Perform manual testing with keyboard and screen readers
5. Document accessibility features in component documentation

## Support

For questions or issues with accessibility testing:
- Review the [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- Check the [axe-core documentation](https://github.com/dequelabs/axe-core)
- Consult the team's accessibility champion

