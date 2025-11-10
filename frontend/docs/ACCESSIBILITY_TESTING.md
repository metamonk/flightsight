# Accessibility Testing Guide

This document outlines the accessibility testing setup and practices for the FlightSight application.

## Overview

We use **axe-core** and **jest-axe** to automatically test our components for accessibility violations according to WCAG 2.1 standards.

## Tools

- **axe-core**: Industry-standard accessibility testing engine
- **jest-axe**: Integration for axe-core with Vitest/Jest
- **@axe-core/react**: Runtime accessibility monitoring (optional)

## Running Tests

### Run All Accessibility Tests
```bash
pnpm test:a11y
```

### Run Specific Test File
```bash
pnpm test tests/components/accessibility/Button.a11y.test.tsx
```

### Run Tests in Watch Mode
```bash
pnpm test -- tests/components/accessibility
```

### Run with Coverage
```bash
pnpm test:coverage -- tests/components/accessibility
```

## Test Structure

Accessibility tests are located in `tests/components/accessibility/` and follow the naming pattern `*.a11y.test.tsx`.

### Example Test

```typescript
import { testAccessibility } from '@/tests/helpers/accessibility'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>)
    await testAccessibility(container)
  })

  it('should support keyboard navigation', async () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button')
    
    // Tab to button
    await user.tab()
    expect(button).toHaveFocus()
  })
})
```

## Helper Functions

We provide accessibility testing helpers in `tests/helpers/accessibility.tsx`:

### `testAccessibility(container, config?)`

Runs axe-core on a rendered component and checks for violations.

```typescript
const { container } = render(<MyComponent />)
await testAccessibility(container)
```

### `renderWithA11y(ui, options?, axeConfig?)`

Renders a component and automatically runs accessibility tests.

```typescript
const { container, a11yResults } = await renderWithA11y(<MyComponent />)
expect(a11yResults).toHaveNoViolations()
```

### `expectNoA11yViolations(ui)`

Quick helper for basic accessibility checks.

```typescript
await expectNoA11yViolations(<MyComponent />)
```

### `a11yScenarios`

Collection of common accessibility testing scenarios:

- **`keyboardNavigation.tabThrough(container)`**: Get all focusable elements
- **`keyboardNavigation.testFocusOrder(elements)`**: Validate tab order
- **`ariaAttributes.validateAriaLabels(container)`**: Check for missing labels
- **`semanticHTML.validateLandmarks(container)`**: Check for semantic landmarks
- **`semanticHTML.validateHeadingHierarchy(container)`**: Check heading structure

## Component Checklist

When creating or updating components, ensure:

### ✅ Keyboard Navigation
- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical
- [ ] Focus states are visible
- [ ] No positive tabindex values (use 0 or -1 only)

### ✅ ARIA Attributes
- [ ] All interactive elements have accessible names
- [ ] Use `aria-label` for icon-only buttons
- [ ] Use `aria-describedby` for helper text
- [ ] Use `aria-invalid` and `role="alert"` for errors
- [ ] Use `aria-required` for required form fields

### ✅ Semantic HTML
- [ ] Use proper heading hierarchy (h1 → h2 → h3, no skips)
- [ ] Use semantic landmarks (header, nav, main, footer)
- [ ] Use `<button>` for actions, `<a>` for navigation
- [ ] Associate labels with form inputs using `htmlFor`

### ✅ Color & Contrast
- [ ] Text has sufficient contrast (4.5:1 for normal, 3:1 for large)
- [ ] Don't rely on color alone to convey information
- [ ] Ensure focus indicators are visible

### ✅ Screen Readers
- [ ] Test with VoiceOver (macOS) or NVDA (Windows)
- [ ] All content is announced properly
- [ ] Hide decorative elements with `aria-hidden="true"`

## Common Patterns

### Icon-Only Buttons
```tsx
<Button aria-label="Close dialog">
  <X aria-hidden="true" />
</Button>
```

### Form Inputs with Labels
```tsx
<div>
  <Label htmlFor="email">Email Address</Label>
  <Input id="email" type="email" required aria-required="true" />
</div>
```

### Error States
```tsx
<div>
  <Label htmlFor="password">Password</Label>
  <Input
    id="password"
    type="password"
    aria-invalid="true"
    aria-describedby="password-error"
  />
  <p id="password-error" role="alert">
    Password must be at least 8 characters
  </p>
</div>
```

### Loading States
```tsx
<Button disabled aria-busy="true">
  <Loader2 className="animate-spin" aria-hidden="true" />
  Loading...
</Button>
```

### Helper Text
```tsx
<div>
  <Label htmlFor="username">Username</Label>
  <Input id="username" aria-describedby="username-hint" />
  <p id="username-hint" className="text-sm text-muted-foreground">
    Must be 3-20 characters
  </p>
</div>
```

## WCAG Levels

Our accessibility tests check for violations at multiple WCAG levels:

- **Level A**: Minimum level of conformance (critical issues)
- **Level AA**: Our target level (recommended for most websites)
- **Level AAA**: Enhanced level (nice to have)

## CI/CD Integration

Accessibility tests run automatically as part of our CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Run accessibility tests
  run: pnpm test:a11y
```

## Manual Testing

While automated tests catch many issues, manual testing is still important:

1. **Keyboard Navigation**: Navigate the entire app using only keyboard
   - Tab through all interactive elements
   - Use arrow keys for dropdown menus
   - Press Enter/Space on buttons
   - Press Escape to close dialogs

2. **Screen Readers**:
   - **macOS**: Enable VoiceOver (Cmd+F5)
   - **Windows**: Install and use NVDA (free)
   - Navigate through the app and verify all content is announced

3. **Zoom**: Test at 200% zoom level
   - Ensure content reflows properly
   - No horizontal scrolling
   - All buttons remain clickable

4. **Color Contrast**: Use browser DevTools or extensions
   - Chrome DevTools: Inspect > Accessibility tab
   - Browser extensions: WAVE, axe DevTools

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [MDN Accessibility Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM Articles](https://webaim.org/articles/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

## Getting Help

If you have questions about accessibility:

1. Check this guide first
2. Run automated tests to identify issues
3. Consult the resources above
4. Ask the team in #accessibility channel

## Continuous Improvement

Accessibility is an ongoing process. We continuously:

- Add new test cases as we identify edge cases
- Update tests when WCAG guidelines evolve
- Learn from user feedback and accessibility audits
- Share knowledge and best practices with the team

