# Screen Reader Testing Guide

**Date:** November 10, 2025  
**Task:** Subtask 14.4 - Test Screen Readers  
**Scope:** Evaluate component compatibility with screen readers

---

## Table of Contents

1. [Overview](#overview)
2. [Screen Reader Setup](#screen-reader-setup)
3. [Testing Methodology](#testing-methodology)
4. [Component Testing Checklist](#component-testing-checklist)
5. [Common Issues & Solutions](#common-issues--solutions)
6. [Test Results](#test-results)

---

## Overview

This document provides a comprehensive guide for testing FlightSight components with screen readers to ensure WCAG 2.2 Level AA compliance.

### Success Criteria

- All text content is announced correctly
- Interactive elements are identified (buttons, links, form fields)
- Current state is communicated (selected, expanded, checked)
- Navigation structure is clear (headings, landmarks)
- Error messages are announced
- Dynamic updates are announced (live regions)

### Screen Readers Tested

| Screen Reader | Platform | Browser | Version |
|--------------|----------|---------|---------|
| NVDA | Windows | Chrome/Firefox | Latest |
| JAWS | Windows | Chrome | Latest |
| VoiceOver | macOS | Safari | Built-in |
| VoiceOver | iOS | Safari | Built-in |

---

## Screen Reader Setup

### macOS VoiceOver

**Enable VoiceOver:**
```
System Settings > Accessibility > VoiceOver > Enable
Or: Cmd + F5
```

**Key Commands:**
- `VO` = Control + Option
- `VO + A` = Start reading
- `VO + Right Arrow` = Next item
- `VO + Left Arrow` = Previous item
- `VO + Space` = Activate element
- `VO + U` = Open rotor (navigate by headings, links, etc.)
- `Control` = Stop reading

### Windows NVDA (Free)

**Download:** https://www.nvaccess.org/download/

**Key Commands:**
- `NVDA + Down Arrow` = Start reading
- `Down Arrow` = Next item
- `Up Arrow` = Previous item
- `Enter` = Activate element
- `NVDA + F7` = Elements list (headings, links, etc.)
- `Control` = Stop reading

### Testing with Browser Developer Tools

Chrome/Edge Accessibility Inspector:
```
DevTools > Elements > Accessibility Tab
```

Shows:
- Accessibility tree
- ARIA properties
- Computed accessible name
- Role and state

---

## Testing Methodology

### 1. Component Loading Test

**Goal:** Ensure components announce themselves when they load.

**Steps:**
1. Navigate to component with screen reader
2. Verify component announces its purpose
3. Check for live region announcements if dynamic

**Pass Criteria:**
- Component purpose is clear
- No unnecessary verbosity
- Dynamic changes are announced

### 2. Navigation Test

**Goal:** Ensure logical navigation through component.

**Steps:**
1. Use arrow keys to navigate through component
2. Verify reading order matches visual order
3. Check heading hierarchy (H1 > H2 > H3)

**Pass Criteria:**
- Tab order is logical
- Headings create clear outline
- Landmarks are properly labeled

### 3. Interaction Test

**Goal:** Ensure all interactions are accessible.

**Steps:**
1. Navigate to interactive elements
2. Verify element type is announced (button, link, etc.)
3. Test activation with Enter/Space
4. Verify state changes are announced

**Pass Criteria:**
- Element type is clear
- Current state is announced
- Actions can be completed
- Results are announced

### 4. Form Test

**Goal:** Ensure forms are fully accessible.

**Steps:**
1. Navigate to form fields
2. Verify labels are announced
3. Test error handling
4. Check validation messages

**Pass Criteria:**
- Labels are associated with inputs
- Required fields are indicated
- Errors are announced clearly
- Success messages are announced

---

## Component Testing Checklist

### Weather Components

#### ☐ WeatherAlerts (Accordion-based)

**Location:** `components/weather/WeatherAlerts.tsx`

**Test Cases:**
- [ ] Accordion announces "Alert" or "Weather Alert"
- [ ] Each conflict item announces flight details
- [ ] Expanded/collapsed state is announced
- [ ] Weather data (temp, wind, visibility) is readable
- [ ] Proposal cards within accordion are accessible

**VoiceOver Commands:**
1. `VO + Right Arrow` to each alert
2. `VO + Space` to expand/collapse
3. Verify announcement includes: "Collapsed" or "Expanded"

**Expected Announcements:**
```
"Weather Alert for Flight [Number], button collapsed"
"Temperature 45 degrees, Wind 15 knots..."
"Proposal 1: [Date/Time], Score 95, Accept button, Decline button"
```

**Issues to Check:**
- Missing `aria-label` on accordion triggers
- Weather data not in accessible format
- Proposal buttons missing labels

---

#### ☐ WeatherConflictOverlay

**Location:** `components/weather/WeatherConflictOverlay.tsx`

**Test Cases:**
- [ ] Dialog announces itself as modal/dialog
- [ ] Close button is identified
- [ ] Escape key dismisses and announces closure
- [ ] Focus returns to trigger element
- [ ] Weather severity is conveyed

**VoiceOver Commands:**
1. Open overlay and listen for announcement
2. `VO + Right Arrow` through content
3. Press `Escape` and verify focus return

**Expected Announcements:**
```
"Weather Conflict Details, dialog"
"Close button"
"Temperature below minimum, visibility poor..."
```

---

### Proposal Components

#### ☐ ProposalCard

**Location:** `components/proposals/ProposalCard.tsx`

**Test Cases:**
- [ ] Card has heading for proposal title
- [ ] Score is announced clearly
- [ ] Date/time information is formatted
- [ ] Accept/Decline buttons are labeled
- [ ] Status badges are readable
- [ ] Reasoning text is announced

**VoiceOver Commands:**
1. Navigate to proposal with `VO + Right Arrow`
2. Check if heading is announced
3. Test button labels

**Expected Announcements:**
```
"Proposal Option, heading level 3"
"Score 95 out of 100"
"Proposed time: [Formatted date/time]"
"Accept Proposal button"
"Decline Proposal button"
"Status: Pending review"
```

**Issues to Check:**
- No heading for proposal title (❌ Already identified)
- Icon-only buttons without `aria-label`
- Score not in accessible format

---

#### ☐ ProposalsList

**Location:** `components/proposals/ProposalsList.tsx`

**Test Cases:**
- [ ] List role is announced
- [ ] Number of proposals is announced
- [ ] Each proposal is a list item
- [ ] Loading state is announced
- [ ] Empty state is announced

**VoiceOver Commands:**
1. Navigate to list container
2. Listen for "list, X items" announcement
3. Navigate through items

**Expected Announcements:**
```
"Proposals list, 3 items"
"Proposal 1, list item 1 of 3"
"Loading proposals..." (with aria-live)
"No proposals available" (empty state)
```

---

### Dashboard Components

#### ☐ MonthlyOverviewWidget

**Location:** `components/dashboard/MonthlyOverviewWidget.tsx`

**Test Cases:**
- [ ] Widget has heading
- [ ] Statistics are announced in readable format
- [ ] Icon-only buttons have labels
- [ ] Month navigation is clear
- [ ] Loading states are announced

**VoiceOver Commands:**
1. Navigate to widget
2. Check navigation buttons
3. Verify statistics announcement

**Expected Announcements:**
```
"Monthly Overview, heading level 2"
"Previous month button"
"Next month button"
"Total bookings: 24"
"Total hours: 18.5"
```

**Issues to Check:**
- Missing heading (❌ Already identified)
- Icon-only buttons without labels (❌ Already identified)
- Statistics not semantic HTML

---

#### ☐ InstructorGantt

**Location:** `components/scheduling/InstructorGantt.tsx`

**Test Cases:**
- [ ] Gantt chart has accessible alternative
- [ ] Drag-and-drop has keyboard alternative
- [ ] Time slots are announced
- [ ] Booking information is accessible
- [ ] Color coding is not relied upon alone

**VoiceOver Commands:**
1. Navigate to gantt chart
2. Attempt to understand bookings via screen reader
3. Check for table-based alternative

**Expected Announcements:**
```
"Weekly Schedule for [Instructor]"
"Monday, 9:00 AM, Booking with [Student]"
"Duration: 2 hours"
"Aircraft: [Registration]"
```

**Known Issues:**
- Complex visual component (⚠️ Needs verification)
- May need data table alternative
- Drag-and-drop needs keyboard alternative

---

### Booking Components

#### ☐ BookingFormDialog

**Location:** `components/booking/BookingFormDialog.tsx`

**Test Cases:**
- [ ] Dialog announces itself
- [ ] Form fields have labels
- [ ] Required fields are indicated
- [ ] Error messages are announced
- [ ] Success messages are announced

**VoiceOver Commands:**
1. Open dialog
2. Navigate through form fields
3. Submit with errors and verify announcements

**Expected Announcements:**
```
"Book a Lesson, dialog"
"Instructor, combo box, required"
"Date, edit text, required"
"Error: Please select an instructor, alert"
"Booking created successfully, alert"
```

---

#### ☐ BookingsList

**Location:** `components/booking/BookingsList.tsx`

**Test Cases:**
- [ ] Table structure is announced
- [ ] Column headers are readable
- [ ] Sortable columns are indicated
- [ ] Row count is announced
- [ ] Action buttons are labeled

**VoiceOver Commands:**
1. Navigate to table
2. Use `VO + Right Arrow` through headers
3. Navigate through rows

**Expected Announcements:**
```
"Bookings table, 5 rows"
"Student column header, sortable"
"Instructor column header"
"Cell: John Doe"
"View booking button"
```

---

### Shared Components

#### ☐ InstructorAvatarGroup

**Location:** `components/dashboard/InstructorAvatarGroup.tsx`

**Test Cases:**
- [ ] Each avatar has label
- [ ] Overflow count is announced
- [ ] Tooltips are accessible
- [ ] Group purpose is clear

**Expected Announcements:**
```
"Instructors: Jane Smith, Bob Johnson, +3 more"
"Jane Smith, image"
"Show 3 more instructors, button"
```

---

## Common Issues & Solutions

### Issue 1: Missing Accessible Names

**Problem:** Interactive elements without labels

**Detection:**
```
Button announced as "button" only (no label)
```

**Solution:**
```tsx
// ❌ Bad
<Button><Icon /></Button>

// ✅ Good
<Button aria-label="Close dialog">
  <X className="h-4 w-4" />
</Button>

// ✅ Alternative
<Button>
  <X className="h-4 w-4" />
  <span className="sr-only">Close dialog</span>
</Button>
```

---

### Issue 2: Missing Heading Structure

**Problem:** Content without semantic headings

**Detection:**
```
VoiceOver rotor (VO + U) shows no headings
```

**Solution:**
```tsx
// ❌ Bad
<div className="font-bold text-lg">Proposal</div>

// ✅ Good
<h3 className="font-bold text-lg">Proposal Option 1</h3>
```

---

### Issue 3: Dynamic Content Not Announced

**Problem:** Updates don't announce to screen readers

**Detection:**
```
Content changes but screen reader silent
```

**Solution:**
```tsx
// ✅ Good - Use aria-live
<div aria-live="polite" aria-atomic="true">
  {isLoading ? 'Loading...' : `${results.length} results found`}
</div>

// For urgent updates
<div aria-live="assertive">
  Error: Please correct the form errors
</div>
```

---

### Issue 4: Poor Table Semantics

**Problem:** Data not structured as table

**Detection:**
```
Screen reader doesn't announce rows/columns
```

**Solution:**
```tsx
// ✅ Use proper table elements
<table>
  <thead>
    <tr>
      <th scope="col">Student</th>
      <th scope="col">Date</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>John Doe</td>
      <td>Nov 10, 2025</td>
    </tr>
  </tbody>
</table>
```

---

### Issue 5: Form Labels Not Associated

**Problem:** Input and label not connected

**Detection:**
```
Navigating to input doesn't announce label
```

**Solution:**
```tsx
// ❌ Bad
<label>Name</label>
<input type="text" />

// ✅ Good
<label htmlFor="name">Name</label>
<input id="name" type="text" />

// ✅ Also Good (implicit)
<label>
  Name
  <input type="text" />
</label>
```

---

## Test Results

### Test Execution Log

| Component | Date | Screen Reader | Pass/Fail | Notes |
|-----------|------|--------------|-----------|-------|
| WeatherAlerts | | | ☐ | |
| WeatherConflictOverlay | | | ☐ | |
| ProposalCard | | | ☐ | |
| ProposalsList | | | ☐ | |
| MonthlyOverviewWidget | | | ☐ | |
| InstructorGantt | | | ☐ | |
| BookingFormDialog | | | ☐ | |
| BookingsList | | | ☐ | |
| InstructorAvatarGroup | | | ☐ | |

---

### Known Issues Summary

From previous audits (Subtasks 14.2 and 14.3), we already know:

**Critical Issues:**
1. ❌ MonthlyOverviewWidget: Icon-only buttons without aria-labels
2. ❌ MonthlyOverviewWidget: Missing heading structure
3. ❌ ProposalCard: Missing heading structure

**Important Issues:**
4. ⚠️ WeatherConflictOverlay: Focus trap needs verification
5. ⚠️ InstructorGantt: Needs accessible alternative
6. ⚠️ InstructorGantt: Drag-and-drop needs keyboard alternative

These issues should be validated with screen readers and documented here.

---

### Priority Fixes Needed

Based on screen reader testing, prioritize fixes as:

**Priority 1 (Blocking):**
- [ ] Missing button labels (immediate WCAG violation)
- [ ] Missing form labels (prevents form completion)
- [ ] Missing dialog announcements (users can't use modals)

**Priority 2 (Important):**
- [ ] Missing headings (poor navigation experience)
- [ ] Table semantics (data interpretation issues)
- [ ] Live region announcements (missed updates)

**Priority 3 (Enhancement):**
- [ ] Improved accessible names
- [ ] Better status announcements
- [ ] Enhanced error messages

---

## Resources

### WCAG 2.2 Guidelines

- **1.3.1 Info and Relationships (Level A)**: Semantic structure
- **2.1.1 Keyboard (Level A)**: All functionality available via keyboard
- **2.4.1 Bypass Blocks (Level A)**: Skip navigation
- **2.4.6 Headings and Labels (Level AA)**: Descriptive headings
- **4.1.2 Name, Role, Value (Level A)**: Accessible names for controls
- **4.1.3 Status Messages (Level AA)**: Announce dynamic updates

### Tools

- **NVDA**: https://www.nvaccess.org/
- **WAVE**: https://wave.webaim.org/
- **axe DevTools**: Chrome/Firefox extension
- **Accessibility Insights**: https://accessibilityinsights.io/

### Documentation

- MDN ARIA Guide: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA
- WebAIM Screen Reader Testing: https://webaim.org/articles/screenreader_testing/
- Radix UI Accessibility: https://www.radix-ui.com/primitives/docs/overview/accessibility

---

## Next Steps

After completing screen reader testing:

1. **Document Findings:** Update this document with test results
2. **Update Subtask:** Use `task-master update-subtask --id=14.4 --prompt="[findings]"`
3. **Mark Complete:** Use `task-master set-status --id=14.4 --status=done`
4. **Proceed to 14.5:** Color Contrast verification (can be automated)
5. **Plan Fixes:** Prepare for Subtask 14.7 (Fix Identified Issues)

---

**Testing Checklist:**
- [ ] Set up screen reader (VoiceOver/NVDA)
- [ ] Test each component systematically
- [ ] Document all findings
- [ ] Prioritize issues by severity
- [ ] Update test results table
- [ ] Create issue list for fixes

---

*Document Version: 1.0*  
*Last Updated: November 10, 2025*

