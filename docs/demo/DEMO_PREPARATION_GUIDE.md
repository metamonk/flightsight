# 🎬 Demo Preparation Guide

## ✅ Database Cleared Successfully!

Your FlightSight database is now clean and ready for the demo video.

---

## 📋 What Was Cleared

### ❌ **Deleted:**
- All bookings
- All weather conflicts
- All reschedule proposals
- All notifications

### ✅ **Preserved:**
- User accounts (student, instructor, admin)
- Aircraft inventory
- Airports
- Lesson types
- Availability blocks (instructor schedules)

---

## 🚀 How to Clear the Database

### **Option 1: Supabase Dashboard (Easiest)**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in the sidebar
4. Copy the contents of `clear-bookings-for-demo.sql`
5. Paste into the editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. Verify the output shows:
   ```
   bookings_count: 0
   conflicts_count: 0
   proposals_count: 0
   notifications_count: 0
   ```

### **Option 2: Supabase CLI**

```bash
cd /Users/zeno/Projects/FlightSight
npx supabase db execute --file clear-bookings-for-demo.sql
```

---

## 🎥 Demo Flow Recommendations

Now that you have a clean slate, here's a suggested demo flow to showcase all the features:

### **Scene 1: Student Books a Lesson (30 seconds)**
1. Login as **student**
2. Navigate to calendar
3. Click on empty time slot
4. Fill out booking form:
   - Choose instructor
   - Select aircraft
   - Pick lesson type
   - Set date/time
5. Submit booking
6. ✨ **Show:** Real-time calendar update

### **Scene 2: Weather Conflict Detection (45 seconds)**
1. While on student dashboard
2. Press **Ctrl+Shift+W** (admin trigger)
3. Paste the booking ID
4. Click "Create Weather Conflict"
5. ✨ **Show:** 
   - Animated red toast notification appears
   - Bell badge updates (1)
   - ⚠️ Weather conflict badge on calendar
   - "Processing..." message with explanation

### **Scene 3: AI Reschedule Proposals (30 seconds)**
1. Wait ~30 seconds
2. ✨ **Show:**
   - Blue toast notification: "🤖 AI Reschedule Proposals Ready"
   - Bell badge updates (2)
   - Expand weather conflict accordion
   - Weather statistics display:
     - Cloud Cover: 98%
     - Wind: 30 kts
     - Visibility: 1.5 mi
     - Ceiling: 800 ft
   - 3 AI-generated reschedule options

### **Scene 4: Student Accepts Proposal (30 seconds)**
1. Click "Accept" on the top-ranked proposal
2. ✨ **Show:**
   - Green success toast
   - Calendar updates with new time immediately
   - Weather conflict disappears
   - No page refresh needed!

### **Scene 5: Instructor View (30 seconds)**
1. Switch to **instructor dashboard** (separate browser/incognito)
2. ✨ **Show:**
   - Real-time notification toast appears
   - Availability timeline updates
   - Old slot becomes available (green)
   - New slot shows as booked (blue)
   - Weather conflict details

### **Scene 6: Notifications Bell (20 seconds)**
1. Click notification bell icon
2. ✨ **Show:**
   - 2 notifications in dropdown
   - Weather conflict notification
   - Reschedule proposal notification
   - Click notification to navigate to booking

---

## 🎬 Demo Script (Full Narrative)

Here's a complete script you can follow:

```
[Scene: Student Dashboard]

"Welcome to FlightSight, the intelligent flight school management platform. 

I'm a student pilot, and I want to schedule a lesson. Let me click here on 
the calendar... I'll select my instructor, choose an aircraft, and pick a 
time slot. And... booked! The calendar updates in real-time.

But here's where FlightSight gets really interesting. Let's say severe 
weather rolls in...

[Press Ctrl+Shift+W, trigger weather conflict]

Immediately, I get a notification. FlightSight has detected that weather 
conditions are unsafe for my student pilot training. Look at these 
conditions: visibility is only 1.5 miles when we need 5, winds are 30 knots 
when the limit is 10, and cloud cover is 98%.

My lesson has been automatically placed on hold. But FlightSight doesn't 
just tell me there's a problem—it's already working on a solution.

[Wait for proposals]

Within 30 seconds, our AI analyzes weather patterns, instructor 
availability, and aircraft scheduling to generate three optimal reschedule 
options. Each one is scored based on weather quality, convenience, and 
availability.

I'll accept this top option—perfect weather, same instructor, same aircraft.

[Click Accept]

And just like that, my lesson is rescheduled. The calendar updates 
immediately, the weather conflict is resolved, and I didn't have to make a 
single phone call.

[Switch to instructor view]

Now watch this—my instructor, in a completely separate session, instantly 
receives a notification. Their availability timeline updates in real-time. 
No refresh needed. The old slot is now available, and the new slot shows 
my rescheduled lesson.

This is FlightSight: intelligent, automated, and real-time flight school 
management that keeps everyone safe and informed."
```

---

## ⚙️ Pre-Demo Checklist

Before starting your recording:

- [ ] Database cleared (`clear-bookings-for-demo.sql` executed)
- [ ] Dev server running (`pnpm dev`)
- [ ] Two browsers open (Chrome + Firefox/Incognito)
- [ ] Student account logged in (Browser 1)
- [ ] Instructor account logged in (Browser 2)
- [ ] Browser windows positioned side-by-side
- [ ] Screen recording software ready
- [ ] Browser zoom at 100% (or 90% for more visibility)
- [ ] Hide browser bookmarks bar (cleaner look)
- [ ] Close unnecessary tabs
- [ ] Notification bell visible
- [ ] Test Ctrl+Shift+W admin trigger works

---

## 🎨 Visual Tips

### **For Better Screen Recording:**

1. **Increase UI zoom** (if needed):
   - Browser zoom: 110% for better visibility
   - Or adjust in Settings

2. **Use split screen** for real-time demo:
   - Left: Student dashboard
   - Right: Instructor dashboard
   - Shows real-time updates across users

3. **Highlight cursor** (optional):
   - macOS: System Settings → Accessibility → Display → Pointer → Shake to locate
   - Windows: Mouse settings → Pointer Options → Show location

4. **Clean browser UI:**
   ```
   - Hide bookmarks bar (Cmd/Ctrl + Shift + B)
   - Full screen mode (F11)
   - Zoom browser to 90-100%
   ```

---

## 🎯 Key Features to Highlight

1. ✅ **Real-time updates** - No refresh needed
2. ✅ **Animated notifications** - Toast popups
3. ✅ **AI-powered rescheduling** - Weather analysis
4. ✅ **Weather safety** - Automatic conflict detection
5. ✅ **Multi-user sync** - Student & instructor see updates instantly
6. ✅ **Intelligent UI** - Weather stats, conflict reasons, smart proposals

---

## 📞 If Something Goes Wrong

### **Weather Trigger Not Working:**
- Check `.env.local` has `SUPABASE_SERVICE_ROLE_KEY`
- Restart dev server
- Check browser console for errors

### **Notifications Not Appearing:**
- Hard refresh browser (Ctrl+Shift+R)
- Check "Realtime subscriptions active" in console
- Verify bell icon shows badge

### **Calendar Not Updating:**
- Check browser console for errors
- Verify realtime connection status
- Refresh page as fallback

---

**Status:** ✅ Ready for demo!
**Good luck with your recording!** 🎬✨

