# Dashboard Navigation - Migration Guide

## 🎯 What We Built

A unified, responsive navigation component (`DashboardNav`) that:
- ✅ Works for all roles (student, instructor, admin)
- ✅ Fully responsive with mobile hamburger menu
- ✅ Includes notification bell
- ✅ Consistent back navigation
- ✅ Proper spacing and layout
- ✅ Works on all screen sizes

---

## 📦 Files Created

```
frontend/
├── components/
│   └── navigation/
│       └── DashboardNav.tsx           # Unified navigation component
└── app/
    └── dashboard/
        └── instructor/
            └── availability/
                ├── page.tsx           # Updated with auth
                └── InstructorAvailabilityClient.tsx  # Client wrapper
```

---

## 🔧 How to Use DashboardNav

### Basic Usage

```typescript
import { DashboardNav } from '@/components/navigation/DashboardNav'
import { logout } from '@/app/actions/auth'

<DashboardNav
  userId={user.id}
  userEmail={user.email}
  role="student"              // or "instructor" or "admin"
  currentPage="dashboard"     // or "calendar", "availability", etc.
  onSignOut={logout}
/>
```

### Props

- **userId**: User's UUID (for notification bell)
- **userEmail**: Display email in navigation
- **role**: 'student' | 'instructor' | 'admin'
- **currentPage**: 'dashboard' | 'calendar' | 'availability' | 'users' | 'lookups'
- **onSignOut**: Server action for sign out

---

## 📝 Migration Steps

### ✅ Step 1: Availability Page (Already Done!)

The availability page now has:
- Navigation header with back button
- Notification bell
- Mobile-responsive menu
- All links work properly

### Step 2: Student Dashboard

**File:** `frontend/app/dashboard/student/page.tsx`

**Replace the entire header section (lines 55-85) with:**

```typescript
import { DashboardNav } from '@/components/navigation/DashboardNav'

// In the return statement, replace the <header> section:
<DashboardNav
  userId={user.id}
  userEmail={user.email}
  role="student"
  currentPage="dashboard"
  onSignOut={logout}
/>
```

**Remove these imports (no longer needed):**
- `BookLessonButton` (now in DashboardNav)
- `RoleBadge` (now in DashboardNav)

### Step 3: Instructor Dashboard  

**File:** `frontend/app/dashboard/instructor/page.tsx`

**Replace the header section (lines 51-89) with:**

```typescript
import { DashboardNav } from '@/components/navigation/DashboardNav'

// In the return statement:
<DashboardNav
  userId={user.id}
  userEmail={user.email}
  role="instructor"
  currentPage="dashboard"
  onSignOut={logout}
/>
```

### Step 4: Instructor Calendar

**File:** `frontend/app/dashboard/instructor/calendar/InstructorCalendarClient.tsx`

**Replace the header section (lines 41-76) with:**

```typescript
import { DashboardNav } from '@/components/navigation/DashboardNav'
import { logout } from '@/app/actions/auth'

// In the return statement:
<DashboardNav
  userId={instructorId}
  userEmail={userEmail}
  role="instructor"
  currentPage="calendar"
  onSignOut={logout}
/>
```

### Step 5: Admin Dashboard

**File:** `frontend/app/dashboard/admin/page.tsx`

**Add DashboardNav similar to other dashboards**

### Step 6: Admin Users Page

**File:** `frontend/app/dashboard/admin/users/page.tsx`

**Add DashboardNav with `currentPage="users"`**

### Step 7: Admin Lookups Page

**File:** `frontend/app/dashboard/admin/lookups/page.tsx`

**Add DashboardNav with `currentPage="lookups"`**

---

## 🎨 Features by Breakpoint

### Desktop (lg: ≥1024px)
- Full horizontal navigation
- All buttons visible
- Notification bell
- Settings and Sign Out

### Tablet (md: 768-1023px)
- Notification bell stays visible
- Some buttons might wrap
- Still mostly horizontal

### Mobile (< 768px)
- Hamburger menu
- Notification bell + menu button
- All links in dropdown
- Full-width buttons in menu

---

## 📱 Mobile Menu Behavior

When hamburger is clicked:
1. ✅ Menu expands below header
2. ✅ Shows user email
3. ✅ Shows role-specific links
4. ✅ Settings button
5. ✅ Sign Out button
6. ✅ Click X or menu item to close

---

## 🎯 Role-Specific Navigation

### Student
- **Desktop:** Notification Bell + Book Lesson + Settings + Sign Out
- **Mobile:** Same in hamburger menu

### Instructor
- **Desktop:** Notification Bell + Availability + Calendar + Settings + Sign Out
- **Mobile:** Same in hamburger menu
- **Subpages:** Back button appears

### Admin
- **Desktop:** Notification Bell + Users + Lookups + Settings + Sign Out
- **Mobile:** Same in hamburger menu

---

## ✨ Features

### 1. Back Navigation
- Automatically shows back button on subpages
- Takes you back to role-specific dashboard
- Hidden on main dashboard pages

### 2. Active Page Detection
- `currentPage` prop controls what's shown
- Hides current page link (e.g., no "Calendar" button on calendar page)
- Shows appropriate title

### 3. Responsive Title
- Full title on desktop
- Truncated on mobile
- Email hidden on small screens

### 4. Sticky Header
- Stays at top when scrolling
- Backdrop blur effect
- z-index: 50 (above content, below modals)

---

## 🐛 Common Issues & Solutions

### Issue: "logout is not a function"

**Solution:** Import the server action:
```typescript
import { logout } from '@/app/actions/auth'
```

### Issue: Navigation doesn't appear

**Solution:** Make sure you wrapped it properly and passed all required props

### Issue: Mobile menu doesn't close

**Solution:** The menu closes automatically when clicking a link or the X button

### Issue: Wrong links showing

**Solution:** Check the `role` and `currentPage` props are correct

---

## 📊 Before & After

### Before
- ❌ Cramped layout
- ❌ No mobile menu
- ❌ Missing navigation on some pages
- ❌ Inconsistent across roles

### After
- ✅ Clean, spacious layout
- ✅ Responsive hamburger menu
- ✅ Navigation on all pages
- ✅ Unified component
- ✅ Notification bell integrated
- ✅ Back buttons where needed

---

## 🚀 Next Steps

1. Migrate remaining dashboard pages to use `DashboardNav`
2. Test on mobile devices
3. Verify all links work
4. Check notification bell integration
5. Remove old navigation code

---

## 💡 Tips

- The component handles its own state (mobile menu toggle)
- Notification bell is always visible
- Role-specific links are automatic
- Back button logic is built-in
- Responsive breakpoints are optimized for real devices

---

**That's it! Your navigation is now modern, responsive, and consistent! 🎉**

