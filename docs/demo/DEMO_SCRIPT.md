# 🎬 Weather Conflict Demo Script for Video

This guide provides step-by-step instructions for demonstrating the weather conflict feature in a video.

## Setup (Before Recording)

### 1. Prepare Two Browser Windows
- **Window 1**: Student account logged in
- **Window 2**: Instructor account logged in
- Position them side-by-side for split-screen recording

### 2. Have SQL Editor Ready
- Open Supabase Dashboard in a third window/tab
- Navigate to SQL Editor
- Load `demo-create-conflict.sql` script (don't run yet!)

### 3. Test Accounts
- **Student**: zenodshin@gmail.com
- **Instructor**: zshin77@gmail.com

---

## 🎥 Demo Flow

### **SCENE 1: Student Books a Lesson** (Student Browser)

1. **Navigate**: Student Dashboard → "Book a Lesson" button
2. **Fill Form**:
   - Select instructor: zshin77
   - Select aircraft: Any available
   - Select date/time: Tomorrow at 2:00 PM (or any future time)
   - Departure airport: KSFO (San Francisco)
   - Lesson type: "Pattern Work" or "Local Flight"
   - Duration: 2 hours
3. **Submit**: Click "Book Lesson"
4. **Observe**: 
   - Booking appears on student's calendar
   - Status shows "Scheduled" or "Pending Confirmation"

📝 **Copy the Booking ID** from the booking details or URL for the next step!

---

### **SCENE 2: Instructor Confirms** (Instructor Browser)

1. **Check notification**: Bell icon shows new booking request
2. **Navigate**: Click notification or go to bookings list
3. **Review**: Open the booking details
4. **Confirm**: Click "Confirm Booking" button
5. **Observe**: 
   - Status changes to "Confirmed"
   - Booking now appears on instructor's calendar in green/confirmed color

---

### **SCENE 3: Weather Conflict Triggered** (SQL + Both Browsers)

1. **Switch to Supabase SQL Editor**
2. **Update the script**:
   ```sql
   v_booking_id UUID := 'PASTE-THE-BOOKING-ID-HERE';
   ```
3. **Run the SQL script**
4. **Watch BOTH browsers simultaneously**:

**Student Browser (Left)** 📱:
- 🔔 Bell icon shows "2" notifications
- 📅 Calendar: Booking changes to red/amber with ⚠️ icon
- Click notification: "Weather Conflict Detected"
- Click notification: "AI Reschedule Proposals Ready"

**Instructor Browser (Right)** 📱:
- 🔔 Bell icon shows "1" notification  
- 📅 Calendar: Same booking shows red/amber with ⚠️ icon
- Click notification: "Student Lesson - Weather Hold"

---

### **SCENE 4: Student Reviews Conflict** (Student Browser)

1. **Click** on the affected booking on calendar
2. **Show booking details modal**:
   - Status badge: "Weather Hold" (red/amber)
   - Weather data section showing:
     - ⚠️ Visibility: 1.5mi (needs 5mi)
     - ⚠️ Ceiling: 800ft (needs 5000ft)
     - ⚠️ Wind: 30kts (max 10kts)
     - ⚠️ Crosswind: 24kts (max 7kts)
     - 🌧️ Heavy rain showers

3. **Scroll to "Reschedule Proposals" section**
4. **Show 3 AI-generated proposals**:
   - **Proposal 1**: 97% score, "BEST OPTION", tomorrow same time
   - **Proposal 2**: 91% score, in 2 days
   - **Proposal 3**: 88% score, tomorrow afternoon

---

### **SCENE 5: Student Accepts Proposal** (Student Browser)

1. **Click** "Accept Proposal" on the best option (97% score)
2. **Observe**:
   - Booking moves to new time slot on calendar
   - Old time slot is freed up
   - Weather warning disappears
   - Status changes to "Confirmed"

3. **Switch to Instructor Browser**:
   - 🔔 New notification: "Lesson Rescheduled"
   - Calendar shows booking at new time
   - Old time slot is now available

---

## 🎯 Key Points to Highlight in Video

### Weather Checking System
- "FlightSight automatically monitors weather conditions"
- "Compares real weather against training level minimums"
- "Student pilots have strictest requirements for safety"

### AI Rescheduler
- "AI analyzes weather forecasts for next 7 days"
- "Considers instructor/student/aircraft availability"
- "Scores each option based on weather quality and convenience"
- "Proposes 3 best alternatives automatically"

### Real-Time Updates
- "Both student and instructor see updates immediately"
- "No page refresh needed"
- "Powered by Supabase Realtime"

### Smart Safety
- "Prevents students from flying in unsafe conditions"
- "Reduces cancellations and no-shows"
- "Proactive rather than reactive"

---

## 📋 Troubleshooting

### Booking doesn't appear on calendar
- Wait 2-3 seconds for real-time update
- Check date range in calendar view
- Refresh page if needed

### SQL script fails
- Make sure you updated the booking ID
- Verify booking exists: `SELECT * FROM bookings WHERE id = 'YOUR-ID';`
- Check booking is in "confirmed" status

### Notifications don't appear
- Check bell icon - it should show a number
- Click bell to open notification panel
- May need to enable realtime subscriptions in Supabase

### Weather conflict doesn't show on calendar
- Check booking status changed to "weather_hold"
- Verify weather_conflicts record was created
- Refresh calendar view

---

## 🧹 Cleanup After Demo

```sql
-- Delete the test conflict and reset booking
DELETE FROM weather_conflicts WHERE booking_id = 'YOUR-BOOKING-ID';
DELETE FROM reschedule_proposals WHERE conflict_id = 'YOUR-CONFLICT-ID';
DELETE FROM notifications WHERE metadata->>'booking_id' = 'YOUR-BOOKING-ID';
UPDATE bookings SET status = 'confirmed' WHERE id = 'YOUR-BOOKING-ID';
```

Or use the cleanup script:
```bash
pnpm test:functions:cleanup
```

---

## 🎬 Video Timeline Suggestion

- **0:00-0:30**: Intro - "Watch how FlightSight handles weather conflicts"
- **0:30-1:00**: Student books lesson (split screen setup)
- **1:00-1:20**: Instructor confirms
- **1:20-1:30**: Trigger weather conflict (show SQL briefly)
- **1:30-2:00**: Show real-time notifications appearing
- **2:00-2:30**: Review weather details and violations
- **2:30-3:00**: Show AI proposals with scores
- **3:00-3:20**: Accept best proposal
- **3:20-3:40**: Show instructor receiving update
- **3:40-4:00**: Outro - highlight key features

---

## 💡 Tips for Best Video Quality

1. **Use 1080p or 4K recording**
2. **Clean up browser**: Hide bookmarks bar, close unnecessary tabs
3. **Use incognito/private windows** for clean UI
4. **Zoom in on important UI elements** (notifications, proposals)
5. **Add captions** explaining what's happening
6. **Use cursor highlights** to draw attention
7. **Keep the pace steady** - don't rush the real-time updates
8. **Consider adding B-roll** weather graphics or aircraft footage

Good luck with your demo! 🎥✈️🌤️

