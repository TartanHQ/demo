# Testing Instructions: Dropoff and Resume Journey Workflow

## Overview
This document explains how to test the dropoff and resume journey functionality for the HDFC Salary Account Opening Journey.

## Prerequisites
1. The application should be running locally or deployed
2. Browser developer tools should be open to monitor localStorage

## Testing Dropoff and Resume Workflow

### Step 1: Start the Journey
1. Open the application in your browser
2. Enter mobile number, DOB, and PAN
3. Click "Continue" to get OTP
4. Enter OTP and verify
5. Proceed through the journey steps

### Step 2: Simulate Dropoff
1. At any step in the journey (e.g., Personal Information, Employment Info, etc.)
2. **Close the browser tab** or **navigate away** from the page
3. The journey state is automatically saved to localStorage

### Step 3: Test Resume with Nudge
1. **Open the mobile mock drawer** (phone icon on desktop, bottom right)
2. Scroll down to **"Nudge Management"** section
3. Click **"Send"** button next to "Nudge 1", "Nudge 2", or "Nudge 3"
4. You'll see a notification appear: "New nudge sent! Check phone notifications"
5. A new SMS message will appear in the phone mockup showing the reminder

### Step 4: Resume the Journey
1. **Option A: Using Resume URL Parameter**
   - In the browser, manually add `?resume=true` to the URL
   - Example: `http://localhost:3000?resume=true`
   - The journey will detect this and show the resume screen

2. **Option B: Using Journey Link**
   - Copy the journey link from the mobile mock drawer
   - Open it in a new tab
   - The link contains a timestamp parameter that triggers resume mode

3. **Option C: Using localStorage (Developer Method)**
   - Open browser DevTools (F12)
   - Go to Application/Storage tab
   - Check localStorage for keys starting with `hdfcJourney_`
   - If they exist, the journey should auto-resume on page load

### Step 5: Verify Resume Functionality
1. When you resume, you should see "Resume Your Journey" screen
2. Enter your mobile number
3. Click "Get OTP"
4. Enter the OTP
5. You should be taken back to the **exact step** where you left off

## Testing Different Scenarios

### Scenario 1: Resume from Personal Information Step
1. Complete OTP verification
2. Reach "Personal Information" step
3. Close browser
4. Resume with `?resume=true`
5. Verify OTP
6. Should land back on "Personal Information" step

### Scenario 2: Resume from Employment Information Step
1. Complete Personal Information
2. Reach "Employment Information" step
3. Close browser
4. Resume with `?resume=true`
5. Verify OTP
6. Should land back on "Employment Information" step

### Scenario 3: Multiple Nudges
1. Start journey and drop off
2. Send Nudge 1 from mobile mock drawer
3. Wait a few seconds
4. Send Nudge 2
5. Wait a few seconds
6. Send Nudge 3
7. Each nudge should show as a new SMS in the phone mockup
8. Resume using any of the nudge links

## Troubleshooting

### Issue: Resume not working
**Solution:**
- Check browser console for errors
- Verify localStorage has `hdfcJourney_` keys
- Clear localStorage and try again
- Ensure URL parameter `?resume=true` is present

### Issue: Nudge not showing in phone
**Solution:**
- Check that you clicked "Send" button in Nudge Management
- Look for the green notification banner
- Scroll down in phone mockup to see new messages
- Refresh the mobile mock drawer

### Issue: Journey starts from beginning
**Solution:**
- localStorage might be cleared
- Check if `hdfcJourney_stepIndex` exists in localStorage
- Manually set it: `localStorage.setItem('hdfcJourney_stepIndex', '2')` (for step 2)
- Refresh the page

## Demo Flow for Client

### Recommended Demo Sequence:
1. **Start Fresh Journey**
   - Show the welcome screen
   - Enter details and verify OTP
   - Show Personal Information step

2. **Simulate Dropoff**
   - Explain: "User closes browser at this point"
   - Close tab or navigate away

3. **Show Nudge System**
   - Open mobile mock drawer
   - Show Nudge Management section
   - Click "Send" on Nudge 1
   - Show notification and new SMS in phone

4. **Resume Journey**
   - Open new tab with `?resume=true`
   - Show resume screen
   - Enter mobile and OTP
   - Land back on Personal Information step
   - Continue from where left off

5. **Complete Journey**
   - Fill remaining steps
   - Show completion screen

## Technical Details

### localStorage Keys Used:
- `hdfcJourney_userType`: User type (ntb, etb-no-acct, etb-with-acct)
- `hdfcJourney_journeyType`: Journey type (journey1, journey2, journey3)
- `hdfcJourney_stepIndex`: Current step index
- `hdfcJourney_journeySteps`: Array of step IDs
- `hdfcJourney_branchStepId`: Branch step ID if in branch flow

### URL Parameters:
- `?resume=true`: Triggers resume mode
- `?journey=<timestamp>`: Also triggers resume mode

### Resume Detection:
The app checks for:
1. URL parameters (`resume` or `journey`)
2. localStorage state
3. If both exist, it resumes from saved state

## Notes for Production
- In production, nudges would be sent via actual SMS/Email/WhatsApp APIs
- Journey links would be unique per user and stored in database
- Resume functionality would validate user identity via OTP before restoring state
- Nudge timing and frequency would be configurable via admin panel
