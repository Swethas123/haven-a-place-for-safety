# HAVEN Logic Update - Testing Guide

## 🧪 Complete Testing Checklist

---

## Test 1: New User Sign Up Flow

### Steps
1. Navigate to `/victim-login`
2. Enter mobile number: `9876543210`
3. Click "Send OTP"
4. Note the OTP shown in toast notification
5. Enter the OTP
6. Click "Verify"

### Expected Result
- ✅ Profile creation form appears
- ✅ Form shows:
  - Name field (empty, required)
  - Contact Mode radio buttons (SMS selected by default)
  - No email field visible initially

### Continue Test
7. Enter name: "Test User"
8. Keep "SMS" selected
9. Click "Complete Profile"

### Expected Result
- ✅ Profile saved to localStorage
- ✅ Success toast: "Profile created successfully!"
- ✅ Redirected to `/victim` dashboard

### Verify
```javascript
// Open browser console
JSON.parse(localStorage.getItem('userProfile'))
// Should show:
// {
//   name: "Test User",
//   phone: "9876543210",
//   contactMode: "SMS"
// }
```

---

## Test 2: Email Contact Mode

### Steps
1. Clear localStorage: `localStorage.clear()`
2. Navigate to `/victim-login`
3. Enter mobile: `9876543210`
4. Verify OTP
5. In profile form, select "Email" radio button

### Expected Result
- ✅ Email field appears below contact mode
- ✅ Email field is required

### Continue Test
6. Try to submit without email

### Expected Result
- ✅ Form validation error: "Email is required..."

### Continue Test
7. Enter name: "Email User"
8. Enter email: "test@example.com"
9. Click "Complete Profile"

### Expected Result
- ✅ Profile saved with email
- ✅ Redirected to dashboard

### Verify
```javascript
JSON.parse(localStorage.getItem('userProfile'))
// Should show:
// {
//   name: "Email User",
//   phone: "9876543210",
//   contactMode: "Email",
//   email: "test@example.com"
// }
```

---

## Test 3: Existing User Login

### Steps
1. Keep profile in localStorage from previous test
2. Navigate to `/victim-login`
3. Enter same mobile: `9876543210`
4. Verify OTP

### Expected Result
- ✅ Profile creation step skipped
- ✅ Directly redirected to dashboard
- ✅ No profile form shown

---

## Test 4: Create SOS - Profile Auto-Load

### Steps
1. Ensure profile exists in localStorage
2. Navigate to `/create-post`

### Expected Result
- ✅ Profile info box displayed at top
- ✅ Shows: Name, Phone, Contact Mode
- ✅ All read-only (no input fields)
- ✅ Location being detected

### Verify Profile Display
```
┌─────────────────────────────────┐
│ Your Profile                    │
│ Name: Email User                │
│ Phone: 9876543210               │
│ Contact Mode: Email             │
└─────────────────────────────────┘
```

---

## Test 5: Location Reverse Geocoding

### Steps
1. On Create SOS page
2. Wait for location detection

### Expected Result
- ✅ Location shows human-readable address
- ✅ Format: "City, State" or "City, Country"
- ✅ NOT showing raw coordinates
- ✅ Green checkmark icon visible

### Example Displays
- ✅ "Mumbai, Maharashtra"
- ✅ "New Delhi, India"
- ✅ "Bangalore, Karnataka"
- ❌ NOT "19.0760, 72.8777"

### If Geocoding Fails
- ✅ Falls back to coordinates
- ✅ Shows: "28.6139, 77.2090"

---

## Test 6: Simplified SOS Form

### Steps
1. On Create SOS page
2. Scroll through form

### Expected Result - Fields Present
- ✅ Profile info box (read-only)
- ✅ Location display (auto-detected)
- ✅ Severity dropdown (High/Medium/Low)
- ✅ Additional details textarea (optional)
- ✅ Image template selection (4 options)
- ✅ Submit button

### Expected Result - Fields Removed
- ❌ Name input field
- ❌ Phone input field
- ❌ Preferred Contact dropdown
- ❌ Duration of Abuse dropdown
- ❌ Frequency dropdown
- ❌ Current Situation textarea
- ❌ Culprit Description textarea

---

## Test 7: Severity Selection

### Steps
1. Click severity dropdown
2. View options

### Expected Result
- ✅ Exactly 3 options:
  - High
  - Medium
  - Low
- ❌ No other options

### Continue Test
3. Select "High"
4. Verify selection shows in dropdown

### Expected Result
- ✅ "High" displayed in dropdown
- ✅ Dropdown closes

---

## Test 8: Optional Details Field

### Steps
1. Leave "Additional details" field empty
2. Select severity: "Medium"
3. Select image template
4. Click submit

### Expected Result
- ✅ Form submits successfully
- ✅ No validation error for empty details
- ✅ SOS created

### Continue Test
5. Create another SOS
6. Add text in "Additional details": "Need help urgently"
7. Submit

### Expected Result
- ✅ Form submits with details
- ✅ Details saved in SOS case

---

## Test 9: Complete SOS Creation

### Steps
1. On Create SOS page
2. Verify profile loaded
3. Wait for location
4. Select severity: "High"
5. Add details: "Emergency situation"
6. Select image: "Nature"
7. Click "Generate Covert SOS Post"

### Expected Result
- ✅ Loading spinner shows
- ✅ Success toast appears
- ✅ Redirected to post preview page
- ✅ SOS case created in localStorage

### Verify SOS Data
```javascript
// Open browser console
const cases = JSON.parse(localStorage.getItem('haven_sos_cases'))
const latestCase = cases[cases.length - 1]
console.log(latestCase)

// Should include:
// - name: "Email User" (from profile)
// - phone: "9876543210" (from profile)
// - preferredContact: "Email" (from profile)
// - severity: "High" (from selection)
// - location: { lat, lng } (GPS coordinates)
// - sosMessage: "Emergency situation" (from details)
```

---

## Test 10: Webhook Payload

### Steps
1. Start n8n server
2. Create SOS with:
   - Severity: "High"
   - Details: "Test webhook"
3. Check n8n webhook received data

### Expected Payload Format
```json
{
  "severity": "High",
  "emotion": "Test webhook",
  "location": {
    "lat": 28.6139,
    "lng": 77.2090
  }
}
```

### Verify
- ✅ `severity` is "High", "Medium", or "Low"
- ✅ `emotion` contains additional details or default text
- ✅ `location` has `lat` and `lng` numbers
- ✅ No extra fields
- ✅ No missing fields

---

## Test 11: No Profile Redirect

### Steps
1. Clear localStorage: `localStorage.clear()`
2. Navigate directly to `/create-post`

### Expected Result
- ✅ Error toast: "Please complete your profile first"
- ✅ Redirected to `/victim-login`
- ✅ Cannot access Create SOS without profile

---

## Test 12: WhatsApp Contact Mode

### Steps
1. Clear localStorage
2. Complete sign up flow
3. Select "WhatsApp" as contact mode
4. Complete profile

### Expected Result
- ✅ Email field NOT shown
- ✅ Profile saved without email
- ✅ Can create SOS successfully

### Verify
```javascript
JSON.parse(localStorage.getItem('userProfile'))
// Should show:
// {
//   name: "...",
//   phone: "...",
//   contactMode: "WhatsApp"
//   // No email field
// }
```

---

## Test 13: Location Fallback

### Steps
1. Disable location services in browser
2. Navigate to `/create-post`

### Expected Result
- ✅ Default location used: "New Delhi, India"
- ✅ Info toast: "Using default location"
- ✅ Can still create SOS

---

## Test 14: UI Preservation

### Visual Checks
- ✅ All colors unchanged
- ✅ All fonts unchanged
- ✅ All spacing unchanged
- ✅ All borders unchanged
- ✅ All shadows unchanged
- ✅ All animations unchanged
- ✅ All icons unchanged
- ✅ All layouts unchanged

### Component Checks
- ✅ Cards look the same
- ✅ Buttons look the same
- ✅ Inputs look the same
- ✅ Dropdowns look the same
- ✅ Radio buttons styled correctly
- ✅ Profile info box fits design

---

## Test 15: Edge Cases

### Test 15a: Very Long Name
1. Enter name: "A" * 100 (100 characters)
2. Complete profile

**Expected**: ✅ Accepts long names

### Test 15b: Special Characters in Name
1. Enter name: "Test User @#$%"
2. Complete profile

**Expected**: ✅ Accepts special characters

### Test 15c: Invalid Email Format
1. Select Email mode
2. Enter email: "notanemail"
3. Try to submit

**Expected**: ✅ HTML5 validation error

### Test 15d: Very Long Details
1. Enter 1000 characters in additional details
2. Submit SOS

**Expected**: ✅ Accepts long text

### Test 15e: No Severity Selected
1. Leave severity empty
2. Try to submit

**Expected**: ✅ Validation error: "Please select severity level"

---

## 🎯 Success Criteria

All tests should pass with these results:

### Sign Up
- ✅ OTP flow works
- ✅ Profile creation for new users
- ✅ Email field conditional on contact mode
- ✅ Profile saved to localStorage
- ✅ Existing users skip profile creation

### Create SOS
- ✅ Profile auto-loaded
- ✅ Simplified form (only severity + optional details)
- ✅ Location reverse geocoded
- ✅ Human-readable address displayed
- ✅ SOS created with profile data
- ✅ Webhook sent with correct format

### UI
- ✅ No visual changes
- ✅ No layout changes
- ✅ No styling changes
- ✅ All components work correctly

---

## 🐛 Common Issues

### Issue: Profile not loading
**Check**: `localStorage.getItem('userProfile')`
**Fix**: Complete sign-up flow

### Issue: Email field not appearing
**Check**: Contact mode selection
**Fix**: Click "Email" radio button

### Issue: Location shows coordinates
**Check**: Network tab for geocoding API call
**Fix**: Wait longer or check internet connection

### Issue: Webhook not received
**Check**: n8n server running
**Fix**: Start n8n and verify webhook URL

---

## 📊 Test Results Template

```
Test 1: New User Sign Up          [ ] Pass [ ] Fail
Test 2: Email Contact Mode         [ ] Pass [ ] Fail
Test 3: Existing User Login        [ ] Pass [ ] Fail
Test 4: Profile Auto-Load          [ ] Pass [ ] Fail
Test 5: Reverse Geocoding          [ ] Pass [ ] Fail
Test 6: Simplified Form            [ ] Pass [ ] Fail
Test 7: Severity Selection         [ ] Pass [ ] Fail
Test 8: Optional Details           [ ] Pass [ ] Fail
Test 9: Complete SOS Creation      [ ] Pass [ ] Fail
Test 10: Webhook Payload           [ ] Pass [ ] Fail
Test 11: No Profile Redirect       [ ] Pass [ ] Fail
Test 12: WhatsApp Mode             [ ] Pass [ ] Fail
Test 13: Location Fallback         [ ] Pass [ ] Fail
Test 14: UI Preservation           [ ] Pass [ ] Fail
Test 15: Edge Cases                [ ] Pass [ ] Fail

Overall Status: [ ] All Pass [ ] Some Fail
```

---

## 🚀 Quick Test Script

```javascript
// Run in browser console after each test

// Check profile
console.log('Profile:', JSON.parse(localStorage.getItem('userProfile')));

// Check latest SOS
const cases = JSON.parse(localStorage.getItem('haven_sos_cases') || '[]');
console.log('Latest SOS:', cases[cases.length - 1]);

// Clear all data (for fresh test)
// localStorage.clear();
```

---

**Testing Status**: Ready for QA

**Estimated Testing Time**: 30-45 minutes for complete suite
