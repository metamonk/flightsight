# FlightSight Internal Testing Guide

**Version:** 1.0  
**Date:** November 10, 2025  
**Phase:** Internal Testing (Phase 1)

---

## Overview

This guide is for internal testers during the first phase of FlightSight deployment. Your feedback is crucial to ensuring a smooth public launch.

---

## Testing Environment

**Staging URL:** `https://staging.flightsight.app` (placeholder)  
**Duration:** 1 week  
**Testers:** 5-10 internal staff members

---

## Test User Accounts

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| Admin | admin@test.flightsight.app | [Provided separately] | Full system access |
| Instructor 1 | instructor1@test.flightsight.app | [Provided separately] | Primary instructor testing |
| Instructor 2 | instructor2@test.flightsight.app | [Provided separately] | Multi-instructor scenarios |
| Student 1 | student1@test.flightsight.app | [Provided separately] | Primary student testing |
| Student 2 | student2@test.flightsight.app | [Provided separately] | Multi-student scenarios |

---

## Test Scenarios

### Scenario 1: Student Books a Flight

**Goal:** Verify the complete booking flow from student perspective

**Steps:**
1. Sign in as Student 1
2. Navigate to "Book a Flight"
3. Select aircraft, instructor, date/time
4. Submit booking request
5. Verify confirmation email received
6. Check booking appears in "My Bookings"

**Expected Results:**
- ✅ Form validation works correctly
- ✅ Available slots show accurate availability
- ✅ Booking created successfully
- ✅ Email notification sent
- ✅ Booking visible in student dashboard

**Report Issues:** Note any errors, unclear UI, or missing information

---

### Scenario 2: Instructor Reviews Schedule

**Goal:** Verify instructor can view and manage their schedule

**Steps:**
1. Sign in as Instructor 1
2. Navigate to Dashboard
3. View today's bookings
4. Check Gantt chart for week view
5. View Monthly Overview widget
6. Filter bookings by status

**Expected Results:**
- ✅ All bookings display correctly
- ✅ Gantt chart shows proper timeline
- ✅ Monthly overview shows density
- ✅ Filters work as expected
- ✅ Calendar is responsive

**Report Issues:** Note rendering problems, incorrect data, or UI glitches

---

### Scenario 3: Weather Conflict Detection

**Goal:** Test the new weather proposal system

**Steps:**
1. Sign in as Admin
2. Create a booking for tomorrow
3. Wait for weather check (automatic)
4. Verify conflict detection if bad weather
5. Check proposals generated
6. Test accepting/rejecting proposals

**Expected Results:**
- ✅ Weather data fetches correctly
- ✅ Conflicts detected accurately
- ✅ Proposals are reasonable alternatives
- ✅ Acceptance creates new booking
- ✅ Rejection is handled properly
- ✅ Email notifications sent

**Report Issues:** Note weather API errors, poor proposals, or broken workflows

---

### Scenario 4: Drag-and-Drop Scheduling

**Goal:** Test instructor scheduling with drag-and-drop

**Steps:**
1. Sign in as Instructor 1
2. Navigate to Schedule page
3. Drag a booking to new time slot
4. Verify conflict detection
5. Confirm rescheduling
6. Check student notified

**Expected Results:**
- ✅ Drag interaction smooth
- ✅ Drop zones clear
- ✅ Conflicts highlighted
- ✅ Booking updates correctly
- ✅ Student receives notification

**Report Issues:** Note UI responsiveness, incorrect behavior, or missing features

---

### Scenario 5: Accessibility Testing

**Goal:** Verify keyboard navigation and screen reader support

**Steps:**
1. Disconnect mouse
2. Use only Tab, Enter, Escape keys
3. Navigate entire application
4. Enable screen reader (VoiceOver/NVDA)
5. Navigate key features
6. Test form submission

**Expected Results:**
- ✅ All interactive elements reachable
- ✅ Focus indicators visible
- ✅ Logical tab order
- ✅ Screen reader announcements clear
- ✅ No keyboard traps
- ✅ Escape closes dialogs

**Report Issues:** Note inaccessible elements or confusing navigation

---

### Scenario 6: Mobile Experience

**Goal:** Test responsive design on mobile devices

**Steps:**
1. Open staging site on mobile device
2. Test portrait and landscape modes
3. Navigate all key pages
4. Create a booking
5. Test calendar interactions
6. Check performance

**Expected Results:**
- ✅ Layout adapts to screen size
- ✅ Touch targets adequate size
- ✅ Text readable without zooming
- ✅ Images/icons scale properly
- ✅ Performance acceptable
- ✅ No horizontal scrolling

**Report Issues:** Note layout problems or usability issues

---

### Scenario 7: Error Handling

**Goal:** Test how system handles errors gracefully

**Steps:**
1. Disconnect internet briefly
2. Try to submit a form
3. Enter invalid data
4. Navigate to non-existent page
5. Try unauthorized actions
6. Exceed rate limits (if applicable)

**Expected Results:**
- ✅ Network errors handled gracefully
- ✅ Validation messages clear
- ✅ 404 page displays properly
- ✅ Unauthorized access blocked
- ✅ Rate limit messages clear
- ✅ User can recover from errors

**Report Issues:** Note confusing errors or application crashes

---

### Scenario 8: Performance & Speed

**Goal:** Assess application responsiveness

**Steps:**
1. Open browser DevTools (Performance tab)
2. Navigate to Dashboard
3. Measure page load time
4. Test calendar rendering speed
5. Submit forms and measure response
6. Scroll through long lists

**Expected Results:**
- ✅ Page loads < 3 seconds
- ✅ Time to Interactive < 5 seconds
- ✅ No janky animations
- ✅ Form submission quick
- ✅ Smooth scrolling
- ✅ No memory leaks (check over time)

**Report Issues:** Note slow pages or performance problems

---

## Exploratory Testing

**Beyond scripted scenarios, try to:**
- "Break" the application with unexpected inputs
- Test edge cases (e.g., booking on leap day, midnight times)
- Use different browsers (Chrome, Firefox, Safari, Edge)
- Test with different screen sizes
- Try rapid clicking/multiple submissions
- Look for inconsistencies in UI/UX
- Check spelling and grammar
- Verify branding is consistent

---

## Reporting Bugs

### Where to Report
- **Bug Tracker:** [Link to GitHub Issues, Jira, etc.]
- **Slack Channel:** #flightsight-testing
- **Email:** testing@flightsight.app

### Bug Report Template

```markdown
## Bug Title
Brief description of the issue

**Severity:** Critical / High / Medium / Low
**Environment:** Staging
**Browser:** Chrome 119 / Firefox 120 / Safari 17
**Device:** Desktop / Mobile (iPhone 14, Android Pixel 7, etc.)
**User Role:** Admin / Instructor / Student

### Steps to Reproduce
1. Go to...
2. Click on...
3. See error...

### Expected Behavior
What should happen

### Actual Behavior
What actually happens

### Screenshots/Videos
[Attach or link]

### Console Errors
[Paste any browser console errors]

### Additional Notes
Any other relevant information
```

### Severity Guidelines

**Critical (P0):**
- Application crashes or becomes unusable
- Data loss or corruption
- Security vulnerabilities
- Complete feature failure

**High (P1):**
- Major feature significantly impaired
- Workaround exists but difficult
- Affects many users
- Payment/billing issues

**Medium (P2):**
- Minor feature impaired
- Easy workaround available
- Affects some users
- UI inconsistencies

**Low (P3):**
- Cosmetic issues
- Rare edge cases
- Minor inconveniences
- Spelling/grammar errors

---

## Feedback Form

**After each testing session, please provide:**

### Overall Impression
- How intuitive is the application? (1-10)
- How would you rate the design? (1-10)
- How responsive does it feel? (1-10)
- Would you use this product? (Yes/No/Maybe)

### Feature-Specific Feedback

**Booking System:**
- Ease of use: ___/10
- Comments: ___

**Weather Proposals:**
- Usefulness: ___/10
- Comments: ___

**Calendar/Scheduling:**
- Usability: ___/10
- Comments: ___

**Dashboard:**
- Information clarity: ___/10
- Comments: ___

### Open-Ended Questions
1. What did you like most?
2. What frustrated you most?
3. What features are missing?
4. Any other comments or suggestions?

---

## Testing Schedule

### Week 1 Timeline

**Day 1 (Monday):**
- Morning: Onboarding & account setup
- Afternoon: Scenarios 1-2 (Basic flows)

**Day 2 (Tuesday):**
- Scenarios 3-4 (New features)
- Report initial bugs

**Day 3 (Wednesday):**
- Scenarios 5-6 (Accessibility & mobile)
- Exploratory testing

**Day 4 (Thursday):**
- Scenario 7-8 (Error handling & performance)
- Continue exploratory testing

**Day 5 (Friday):**
- Final exploratory testing
- Complete feedback forms
- Bug triage meeting

---

## Support During Testing

**Need Help?**
- **Slack:** #flightsight-support (fastest response)
- **Email:** support@flightsight.app
- **Phone:** [Number] (emergencies only)

**Known Issues:**
- [List any known issues that testers don't need to report]

---

## Testing Best Practices

### Do:
✅ Test thoroughly but efficiently  
✅ Document all findings clearly  
✅ Take screenshots/videos of issues  
✅ Try to break things (in a good way!)  
✅ Think like an end user  
✅ Ask questions if unclear  
✅ Have fun!

### Don't:
❌ Skip test scenarios  
❌ Assume something is "good enough"  
❌ Test only happy paths  
❌ Forget to log out between roles  
❌ Use your real email/phone  
❌ Share test credentials publicly

---

## Success Criteria

**For deployment to proceed, we need:**
- ✅ All P0 (Critical) bugs fixed
- ✅ 80%+ of P1 (High) bugs fixed
- ✅ No data loss or corruption
- ✅ Core workflows functional
- ✅ Acceptable performance metrics
- ✅ Positive overall feedback (7+/10 average)

---

## Thank You!

Your testing efforts are invaluable to making FlightSight a success. We appreciate your time, attention to detail, and honest feedback.

**Questions?** Contact the testing lead: [Name/Email]

**Final Reminder:** All testing data is confidential. Please do not share screenshots, test accounts, or findings outside the testing team.

---

## Appendix: Quick Reference

### Keyboard Shortcuts
- `Tab` - Navigate forward
- `Shift+Tab` - Navigate backward
- `Enter` - Activate/submit
- `Escape` - Close dialog/cancel
- `Space` - Toggle checkbox/button

### Test Data
- Aircraft types: Cessna 172, Piper PA-28, Cirrus SR22
- Airports: KSNA, KVNY, KBUR, KSMO
- Typical lesson duration: 1-2 hours
- Standard booking lead time: 24-48 hours

### Browser DevTools
- **Console:** F12 or Cmd+Option+J (Mac)
- **Network Tab:** Monitor API calls
- **Performance Tab:** Measure load times
- **Lighthouse:** Run accessibility audit

---

*Version 1.0 - November 10, 2025*

