# FlightSight Accessibility Guidelines

**Version:** 1.0  
**Date:** November 10, 2025  
**Status:** Active

---

## Table of Contents

1. [Overview](#overview)
2. [WCAG Compliance Standards](#wcag-compliance-standards)
3. [Color Contrast Guidelines](#color-contrast-guidelines)
4. [Semantic HTML & ARIA](#semantic-html--aria)
5. [Keyboard Navigation](#keyboard-navigation)
6. [Screen Reader Compatibility](#screen-reader-compatibility)
7. [Component Checklist](#component-checklist)
8. [Testing Strategy](#testing-strategy)
9. [Common Patterns](#common-patterns)
10. [Resources](#resources)

---

## Overview

This document outlines accessibility standards and best practices for FlightSight development. All team members should follow these guidelines to ensure our application is usable by everyone, including users with disabilities.

### Our Commitment

- **Target:** WCAG 2.2 Level AA compliance
- **Priority:** Accessibility is a core requirement, not an afterthought
- **Approach:** Test early, test often, and fix proactively

---

## WCAG Compliance Standards

### WCAG 2.2 Level AA Requirements

We comply with WCAG 2.2 Level AA, which includes:

#### 1. Perceivable
- **1.1.1 Non-text Content:** All images, icons, and visual content have text alternatives
- **1.3.1 Info and Relationships:** Semantic HTML conveys structure and relationships
- **1.4.3 Contrast (Minimum):** 4.5:1 for normal text, 3:1 for large text and UI components
- **1.4.11 Non-text Contrast:** 3:1 for UI components and graphical objects

#### 2. Operable
- **2.1.1 Keyboard:** All functionality available via keyboard
- **2.1.2 No Keyboard Trap:** Users can navigate away using only keyboard
- **2.4.1 Bypass Blocks:** Skip navigation links provided
- **2.4.3 Focus Order:** Logical and intuitive focus order
- **2.4.6 Headings and Labels:** Descriptive headings and labels
- **2.4.7 Focus Visible:** Keyboard focus indicator always visible

#### 3. Understandable
- **3.1.1 Language of Page:** Page language identified
- **3.2.1 On Focus:** No unexpected context changes on focus
- **3.3.1 Error Identification:** Errors clearly identified
- **3.3.2 Labels or Instructions:** Form fields have labels

#### 4. Robust
- **4.1.2 Name, Role, Value:** All UI components have accessible names
- **4.1.3 Status Messages:** Status updates announced to assistive tech

---

## Color Contrast Guidelines

### Minimum Contrast Ratios (WCAG AA)

- **Normal text:** 4.5:1
- **Large text (18pt+ or 14pt+ bold):** 3:1
- **UI components & graphical objects:** 3:1

### Our Theme Colors (Tested & Compliant)

#### Light Theme
```css
/* Passing WCAG AA ✅ */
--background: oklch(0.9751 0.0127 244.2507)
--foreground: oklch(0.3729 0.0306 259.7328)        /* Contrast: 10.5:1 */
--primary: oklch(0.48 0.18 155)
--primary-foreground: oklch(1.0000 0 0)             /* Contrast: 5.2:1+ */
--secondary-foreground: oklch(0.38 0.0263 256.8018)
--muted-foreground: oklch(0.42 0.0234 264.3637)
--destructive: oklch(0.50 0.22 25)
--border: oklch(0.70 0.015 264)                     /* Contrast: 3.5:1+ */
```

#### Dark Theme
```css
/* Passing WCAG AA ✅ */
--background: oklch(0.2077 0.0398 265.7549)
--foreground: oklch(0.8717 0.0093 258.3382)         /* Contrast: 11.2:1 */
--primary: oklch(0.7729 0.1535 163.2231)
--secondary-foreground: oklch(0.82 0.01 286)
--muted-foreground: oklch(0.68 0.02 264)
--destructive: oklch(0.62 0.20 25)
--border: oklch(0.58 0.025 257)                     /* Contrast: 3.2:1+ */
```

### Testing Color Contrast

**Automated:** Run `pnpm test tests/accessibility/color-contrast.test.tsx`

**Manual Tools:**
- Chrome DevTools: Lighthouse Accessibility Audit
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Contrast Ratio Calculator](https://contrast-ratio.com/)

---

## Semantic HTML & ARIA

### Golden Rules

1. **Use native HTML first** - Semantic elements have built-in accessibility
2. **Don't override semantics** - Avoid `role="button"` on actual `<button>` elements
3. **Interactive = Keyboard accessible** - All ARIA widgets need keyboard support
4. **Never hide focusable content** - Don't use `aria-hidden="true"` on interactive elements
5. **Provide accessible names** - All interactive elements need descriptive labels

### Semantic HTML Elements

✅ **DO Use:**
```tsx
// Semantic structure
<header>, <nav>, <main>, <aside>, <footer>, <section>, <article>

// Headings (hierarchical)
<h1>, <h2>, <h3>, <h4>, <h5>, <h6>

// Lists
<ul>, <ol>, <li>, <dl>, <dt>, <dd>

// Forms
<form>, <label>, <input>, <select>, <textarea>, <button>

// Tables
<table>, <thead>, <tbody>, <tr>, <th scope="col">, <td>
```

❌ **DON'T Use:**
```tsx
// Generic divs for everything
<div onClick={...}>Click me</div>  // Use <button> instead

// Non-semantic structure
<div class="header">...</div>       // Use <header> instead
<span class="heading">...</span>    // Use <h2> instead
```

### ARIA Patterns for FlightSight

#### Headings for Component Structure

```tsx
// ✅ Every major component section should have a heading
<Card>
  <CardContent>
    <h2 className="sr-only">Monthly Overview</h2>  {/* Screen reader only */}
    {/* or */}
    <CardTitle asChild>
      <h2>Monthly Overview</h2>
    </CardTitle>
    {/* Content */}
  </CardContent>
</Card>
```

#### Icon-Only Buttons

```tsx
// ❌ BAD - No accessible name
<button>
  <X className="h-4 w-4" />
</button>

// ✅ GOOD - Aria-label provides name
<button aria-label="Close dialog">
  <X className="h-4 w-4" aria-hidden="true" />
</button>

// ✅ ALSO GOOD - Screen reader text
<button>
  <X className="h-4 w-4" aria-hidden="true" />
  <span className="sr-only">Close dialog</span>
</button>
```

#### Decorative vs. Meaningful Content

```tsx
// ✅ Hide decorative emojis
<Badge>
  <span aria-hidden="true">✓</span> Confirmed
</Badge>

// ✅ Provide context for visual-only info
<span 
  className="text-xs text-muted-foreground"
  aria-label="AI confidence score: 85 out of 100"
>
  Score: 85
</span>
```

#### Status Badges & Stats

```tsx
// ✅ Proper role and labels
<div 
  className="flex gap-1" 
  role="status" 
  aria-label="Booking statistics"
>
  <Badge 
    aria-label="5 confirmed bookings"
  >
    5 <span aria-hidden="true">✓</span>
  </Badge>
  <Badge 
    aria-label="2 pending bookings"
  >
    2 <span aria-hidden="true">⏱</span>
  </Badge>
</div>
```

#### Live Regions for Dynamic Updates

```tsx
// ✅ Polite announcements (don't interrupt)
<div 
  role="status" 
  aria-live="polite" 
  aria-atomic="true"
>
  Booking created successfully
</div>

// ✅ Urgent announcements (interrupt)
<div 
  role="alert" 
  aria-live="assertive"
>
  Error: Weather conflict detected
</div>
```

#### Form Validation

```tsx
// ✅ Associated labels and error messages
<div>
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email"
    type="email"
    aria-describedby={error ? "email-error" : undefined}
    aria-invalid={!!error}
  />
  {error && (
    <p id="email-error" role="alert" className="text-destructive">
      {error}
    </p>
  )}
</div>
```

#### Loading States

```tsx
// ✅ Screen reader announcement
<div 
  role="status" 
  aria-live="polite" 
  aria-label="Loading calendar data"
>
  <div className="animate-spin..." aria-hidden="true" />
  <span className="sr-only">Loading...</span>
</div>
```

---

## Keyboard Navigation

### Core Principles

1. **All interactive elements must be keyboard accessible**
2. **Logical tab order** - Matches visual flow (left-to-right, top-to-bottom)
3. **Visible focus indicators** - Always show where keyboard focus is
4. **No keyboard traps** - Users can always escape using keyboard alone
5. **Standard shortcuts** - Follow established patterns (Escape to close, etc.)

### Standard Keyboard Patterns

| Action | Keys | Use Case |
|--------|------|----------|
| Navigate forward | `Tab` | Move to next focusable element |
| Navigate backward | `Shift + Tab` | Move to previous element |
| Activate | `Enter` or `Space` | Trigger buttons, links, controls |
| Close/Cancel | `Escape` | Close dialogs, cancel operations |
| Select (lists) | `Arrow keys` | Navigate within lists/menus |
| Select (accordions) | `Arrow keys` | Expand/collapse accordion items |
| Toggle (checkboxes) | `Space` | Check/uncheck |

### Component-Specific Patterns

#### Dialogs & Modals
- **Open:** Focus moves to first focusable element inside
- **Navigate:** Tab cycles through dialog elements only (focus trap)
- **Close:** `Escape` key closes, focus returns to trigger element
- **Implementation:** Use Radix UI Dialog (built-in support)

```tsx
// ✅ Radix UI Dialog provides proper keyboard support
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    {/* Auto-managed focus trap and Escape handling */}
  </DialogContent>
</Dialog>
```

#### Accordions
- **Navigate:** `Arrow Up/Down` between items
- **Expand/Collapse:** `Enter` or `Space`
- **Implementation:** Use Radix UI Accordion (built-in support)

#### Custom Interactive Elements
```tsx
// ✅ Make divs interactive only if absolutely necessary
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }}
  aria-label="Descriptive action"
>
  Content
</div>

// ✅ But prefer real buttons!
<button onClick={handleClick} aria-label="Descriptive action">
  Content
</button>
```

### Focus Management

```tsx
// ✅ Programmatic focus after actions
import { useRef, useEffect } from 'react'

function Component() {
  const firstInputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    // Focus first input on mount
    firstInputRef.current?.focus()
  }, [])
  
  return <Input ref={firstInputRef} />
}

// ✅ Return focus after dialog closes
const [isOpen, setIsOpen] = useState(false)
const triggerRef = useRef<HTMLButtonElement>(null)

const closeDialog = () => {
  setIsOpen(false)
  triggerRef.current?.focus()  // Return focus to trigger
}
```

---

## Screen Reader Compatibility

### Testing Requirements

**Primary Screen Readers:**
- **macOS:** VoiceOver (built-in)
- **Windows:** NVDA (free) or JAWS (commercial)
- **Mobile:** VoiceOver (iOS), TalkBack (Android)

### Essential Commands

#### macOS VoiceOver
- **Start/Stop:** `Cmd + F5`
- **Navigate:** `VO + Arrow keys` (VO = Ctrl + Option)
- **Activate:** `VO + Space`
- **Rotor (elements list):** `VO + U`

#### Windows NVDA
- **Start:** `Ctrl + Alt + N`
- **Navigate:** `Arrow keys`
- **Activate:** `Enter` or `Space`
- **Elements list:** `NVDA + F7`

### Component Announcements

#### Expected Announcements

| Component | Expected |
|-----------|----------|
| Button | "Button name, button" |
| Link | "Link text, link" |
| Heading | "Heading level X, text" |
| Form input | "Label, edit text, required" (if required) |
| Checkbox | "Label, checkbox, checked/unchecked" |
| Status badge | "5 confirmed bookings, status" |
| Loading | "Loading calendar data, status" |

#### Screen Reader Only Text

```css
/* Utility class for screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

```tsx
// ✅ Provide context for screen readers
<h2 className="sr-only">
  Proposal 1: November 15, 2025 at 2:00 PM
</h2>
```

---

## Component Checklist

Use this checklist when creating or modifying components:

### ✅ Every Component Should:

- [ ] Use semantic HTML elements where possible
- [ ] Have a semantic heading (`<h1>` - `<h6>`)
- [ ] Have sufficient color contrast (4.5:1 for text, 3:1 for UI)
- [ ] Be fully keyboard navigable
- [ ] Show visible focus indicators
- [ ] Have descriptive labels for all interactive elements
- [ ] Hide decorative content from screen readers (`aria-hidden="true"`)
- [ ] Provide text alternatives for visual-only information
- [ ] Pass automated accessibility tests (axe-core)
- [ ] Be manually tested with screen reader

### 🔍 Common Issues to Avoid

- [ ] Icon-only buttons without labels
- [ ] Missing heading structure
- [ ] Insufficient color contrast
- [ ] Keyboard traps
- [ ] Non-semantic HTML (`<div>` buttons)
- [ ] Missing form labels
- [ ] Decorative emojis not hidden
- [ ] Dynamic updates not announced

---

## Testing Strategy

### 1. Automated Testing

#### Run Accessibility Tests
```bash
# All accessibility tests
pnpm test:a11y

# Specific test suites
pnpm test tests/components/accessibility/
pnpm test tests/accessibility/color-contrast.test.tsx
```

#### CI/CD Integration
All accessibility tests run automatically on:
- Pull request creation
- Pre-commit hooks (optional)
- Main branch pushes

### 2. Manual Testing

#### Keyboard Navigation Test
1. **Tab through entire page** - Verify logical order
2. **Check focus indicators** - Should be clearly visible
3. **Use only keyboard** - Perform all actions without mouse
4. **Test escape key** - Should close dialogs/modals
5. **Test arrow keys** - Navigate lists, accordions, tabs

#### Screen Reader Test
1. **Enable screen reader** - VoiceOver or NVDA
2. **Navigate by headings** - Use rotor/elements list
3. **Listen to announcements** - Verify all content is announced
4. **Test forms** - Labels and errors announced correctly
5. **Test dynamic updates** - Status changes announced

#### Color Contrast Test
1. **Use browser DevTools** - Inspect element contrast
2. **Test both themes** - Light and dark mode
3. **Check all states** - Hover, focus, disabled
4. **Use contrast checker** - WebAIM or similar tool

### 3. Browser Testing

Test in multiple browsers:
- Chrome/Edge (Chromium)
- Firefox
- Safari

---

## Common Patterns

### Pattern Library

#### Proposal Card
```tsx
<Card>
  <CardContent>
    {/* Semantic heading for screen readers */}
    <h3 className="sr-only">
      Proposal {rank + 1}: {date} at {time}
    </h3>
    
    {/* Visual content */}
    <Badge>
      <span aria-hidden="true">🥇</span>
      <span>Best Match</span>
    </Badge>
    
    {/* Score with aria-label */}
    <span aria-label="AI confidence score: 85 out of 100">
      Score: 85
    </span>
  </CardContent>
</Card>
```

#### Stats Widget
```tsx
<div role="status" aria-label="Booking statistics">
  <Badge aria-label="5 confirmed bookings">
    5 <span aria-hidden="true">✓</span>
  </Badge>
</div>
```

#### Loading State
```tsx
<div 
  role="status" 
  aria-live="polite"
  aria-label="Loading data"
>
  <Spinner aria-hidden="true" />
  <span className="sr-only">Loading...</span>
</div>
```

#### Error Message
```tsx
<div role="alert" className="text-destructive">
  <AlertCircle className="h-4 w-4" aria-hidden="true" />
  <span>Error: Unable to save booking</span>
</div>
```

---

## Resources

### Official Documentation
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/) - Browser extension
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [WAVE](https://wave.webaim.org/) - Web accessibility evaluation tool

### Component Libraries
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- [shadcn/ui](https://ui.shadcn.com/) - Accessible component collection

### FlightSight Documentation
- [KEYBOARD_NAVIGATION_AUDIT.md](../KEYBOARD_NAVIGATION_AUDIT.md)
- [SCREEN_READER_TESTING.md](./SCREEN_READER_TESTING.md)
- [ARIA_REVIEW_REPORT.md](./ARIA_REVIEW_REPORT.md)
- [ACCESSIBILITY_TESTING.md](./ACCESSIBILITY_TESTING.md)
- [Color Contrast Tests](../tests/accessibility/color-contrast.test.tsx)

---

## Changelog

### Version 1.0 (November 10, 2025)
- Initial release
- WCAG 2.2 Level AA standards documented
- Color contrast guidelines and compliant theme colors
- Semantic HTML and ARIA patterns
- Keyboard navigation requirements
- Screen reader compatibility guidelines
- Component checklist and testing strategy
- Common patterns and code examples

---

## Questions or Improvements?

If you have questions about these guidelines or suggestions for improvement:
1. Review the linked documentation
2. Test with actual assistive technology
3. Consult with the accessibility team
4. Update this document with new learnings

**Remember:** Accessibility is everyone's responsibility. When in doubt, test with real users and assistive technology!

