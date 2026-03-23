# HAVEN Logic Update Summary

## ✅ Implementation Complete

All requested logic changes have been implemented without modifying UI design, layout, or styling.

---

## 1️⃣ Sign Up Page Changes

### What Changed
- **File**: `src/app/pages/VictimLoginPage.tsx`
- **Storage**: `src/app/utils/storage.ts`

### New Flow
1. User enters mobile number
2. OTP verification (existing flow preserved)
3. **NEW**: Profile creation step for new users
   - Name (required)
   - Mobile Number (auto-filled from OTP step)
   - Preferred Contact Mode (Radio buttons):
     - SMS
     - WhatsApp
     - Email
   - Email field (dynamically shown only if "Email" is selected)

### Data Storage
Profile stored in `localStorage` under key `"userProfile"`:

```typescript
{
  name: string,
  phone: string,
  contactMode: "SMS" | "WhatsApp" | "Email",
  email?: string  // Only if contactMode is "Email"
}
```

### Behavior
- **SMS/WhatsApp selected**: Email field hidden, not required
- **Email selected**: Email field shown and required
- **Existing users**: Skip profile creation, login directly
- **OTP flow**: Unchanged, works exactly as before

---

## 2️⃣ Create SOS Page Changes

### What Changed
- **File**: `src/app/pages/CreatePostPage.tsx`

### Simplified Form
Removed complex fields:
- ❌ Name input (auto-filled from profile)
- ❌ Phone input (auto-filled from profile)
- ❌ Preferred Contact dropdown (auto-filled from profile)
- ❌ Duration of Abuse
- ❌ Frequency
- ❌ Current Situation (long textarea)
- ❌ Culprit Description

### New Simple Form
Only 3 fields:

1. **Severity Selection** (Required)
   - High
   - Medium
   - Low

2. **Additional Details** (Optional)
   - Single textarea
   - Not required
   - Placeholder: "Add any additional information..."

3. **Image Template** (Existing, unchanged)
   - Nature, Food, Pet, Hobby

### Profile Auto-Attach
- User profile loaded from `localStorage` on page load
- Name, phone, and contact mode automatically attached to SOS
- Displayed in read-only info box at top of form
- If no profile found, redirects to login

---

## 3️⃣ Location Changes

### What Changed
- **File**: `src/app/pages/CreatePostPage.tsx`

### Reverse Geocoding Implementation
- Uses OpenStreetMap Nominatim API
- Fetches GPS coordinates (lat/lng)
- Converts to human-readable location
- Displays: "City, State" or "City, Country"
- Falls back to coordinates if geocoding fails

### Data Structure
```typescript
location: {
  lat: number,      // GPS latitude
  lng: number,      // GPS longitude
}
address: string     // Human-readable: "Mumbai, Maharashtra"
```

### Display
- **User sees**: "Mumbai, Maharashtra"
- **Stored internally**: lat/lng coordinates
- **Sent to webhook**: Both address and coordinates

---

## 4️⃣ Webhook Payload

### ✅ Format Preserved
No changes to webhook structure. Existing n8n integration continues working.

```json
{
  "severity": "High" | "Medium" | "Low",
  "emotion": "additionalDetails or nature",
  "location": {
    "lat": 28.6139,
    "lng": 77.2090
  },
  "address": "New Delhi, India"
}
```

### Mapping
- `severity`: Directly from user selection (High/Medium/Low)
- `emotion`: Additional details text or default "Emergency"
- `location`: GPS coordinates
- `address`: Human-readable location from reverse geocoding

---

## 5️⃣ Profile Auto-Attach

### Implementation
- Profile loaded on CreatePostPage mount
- Automatic redirect to login if profile missing
- Profile data attached to SOS case automatically
- No need to re-enter name/phone

### User Experience
1. User logs in once (creates profile)
2. Profile saved to localStorage
3. Every SOS creation uses saved profile
4. User only selects severity and optionally adds details

---

## 📁 Files Modified

### Core Files
1. ✅ `src/app/pages/VictimLoginPage.tsx`
   - Added profile creation step
   - Added radio group for contact mode
   - Added conditional email field
   - Added profile storage logic

2. ✅ `src/app/pages/CreatePostPage.tsx`
   - Removed complex form fields
   - Added severity selection (High/Medium/Low)
   - Simplified to optional text field
   - Added reverse geocoding
   - Added profile auto-load
   - Simplified SOS creation logic

3. ✅ `src/app/utils/storage.ts`
   - Added `UserProfile` interface
   - Added `getUserProfile()` function
   - Added `saveUserProfile()` function
   - Added `clearUserProfile()` function
   - Added `USER_PROFILE_KEY` constant

### UI Components Used
- ✅ `RadioGroup` (existing component)
- ✅ `RadioGroupItem` (existing component)
- ✅ All other existing components unchanged

---

## 🎯 Key Features

### ✅ No UI Changes
- All existing components preserved
- Layout unchanged
- Styling unchanged
- Only logic and form behavior updated

### ✅ Simplified User Flow
**Before**:
1. Login with OTP
2. Fill 10+ fields in SOS form
3. Submit

**After**:
1. Login with OTP (+ profile creation for new users)
2. Select severity (High/Medium/Low)
3. Optionally add details
4. Submit

### ✅ Backward Compatible
- Existing OTP flow unchanged
- Webhook format preserved
- n8n integration continues working
- No breaking changes

---

## 🧪 Testing Checklist

### Sign Up Flow
- [ ] Enter mobile number
- [ ] Receive and verify OTP
- [ ] Profile creation form appears for new users
- [ ] Name field required
- [ ] Contact mode selection works
- [ ] Email field shows only when "Email" selected
- [ ] Email required when "Email" mode selected
- [ ] Profile saved to localStorage
- [ ] Existing users skip profile creation

### Create SOS Flow
- [ ] Profile auto-loaded from localStorage
- [ ] Redirect to login if no profile
- [ ] Profile info displayed (read-only)
- [ ] Location detected and reverse geocoded
- [ ] Human-readable location displayed
- [ ] Severity selection required
- [ ] Additional details optional
- [ ] Image template selection works
- [ ] SOS created with profile data
- [ ] Webhook sent with correct format

### Location
- [ ] GPS coordinates fetched
- [ ] Reverse geocoding successful
- [ ] Human-readable address displayed
- [ ] Fallback to coordinates if geocoding fails
- [ ] Both lat/lng and address stored

### Webhook
- [ ] Severity sent correctly
- [ ] Location object includes lat/lng
- [ ] Address sent as human-readable string
- [ ] Emotion field populated
- [ ] n8n receives data correctly

---

## 📊 Data Flow

### Sign Up
```
Mobile Input → OTP Verification → Profile Creation → localStorage
                                                    ↓
                                              userProfile key
```

### Create SOS
```
Load Profile → Select Severity → Add Details (optional) → Create SOS
     ↓              ↓                    ↓                     ↓
localStorage    High/Medium/Low    Optional text         Save + Webhook
```

### Location
```
GPS Coordinates → Reverse Geocoding API → Human-readable Address
     ↓                                            ↓
  lat/lng                                    "City, State"
     ↓                                            ↓
  Stored internally                         Displayed to user
```

---

## 🔧 API Usage

### Reverse Geocoding
- **Service**: OpenStreetMap Nominatim
- **Endpoint**: `https://nominatim.openstreetmap.org/reverse`
- **Format**: JSON
- **Rate Limit**: 1 request per second (free tier)
- **Fallback**: Coordinates if API fails

### Example Request
```
GET https://nominatim.openstreetmap.org/reverse?format=json&lat=28.6139&lon=77.2090&zoom=10
```

### Example Response
```json
{
  "address": {
    "city": "New Delhi",
    "state": "Delhi",
    "country": "India"
  },
  "display_name": "New Delhi, Delhi, India"
}
```

---

## 🚀 Quick Start

### For New Users
1. Navigate to `/victim-login`
2. Enter mobile number
3. Verify OTP
4. Complete profile:
   - Enter name
   - Select contact mode (SMS/WhatsApp/Email)
   - Enter email if "Email" selected
5. Profile saved automatically
6. Redirected to victim dashboard

### For Existing Users
1. Navigate to `/victim-login`
2. Enter mobile number
3. Verify OTP
4. Automatically logged in (profile already exists)

### Creating SOS
1. Navigate to `/create-post`
2. Profile auto-loaded
3. Location auto-detected
4. Select severity (High/Medium/Low)
5. Optionally add details
6. Select image template
7. Submit
8. SOS created and webhook sent

---

## 🐛 Troubleshooting

### Issue: Profile not found
**Solution**: User needs to complete sign-up flow first

### Issue: Email field not showing
**Solution**: Select "Email" as contact mode

### Issue: Location shows coordinates
**Solution**: Reverse geocoding API may be slow or failed, coordinates shown as fallback

### Issue: Webhook not sending
**Solution**: Check n8n server is running and webhook URL is correct

---

## 📝 Notes

### Important Considerations
1. **Reverse Geocoding**: Uses free OpenStreetMap API, may have rate limits
2. **Profile Storage**: Stored in localStorage, cleared if user clears browser data
3. **OTP Flow**: Unchanged, still uses mock OTP for demo
4. **Webhook Format**: Preserved exactly to maintain n8n compatibility

### Production Recommendations
1. Use paid geocoding service for better reliability
2. Store profiles in backend database
3. Implement real OTP service
4. Add profile edit functionality
5. Add profile picture upload
6. Implement profile deletion

---

## ✅ Summary

All requirements successfully implemented:
- ✅ Sign up with profile creation
- ✅ Dynamic email field based on contact mode
- ✅ Simplified SOS form (severity + optional details)
- ✅ Reverse geocoding for human-readable location
- ✅ Profile auto-attach to SOS
- ✅ Webhook format preserved
- ✅ No UI design changes
- ✅ No layout changes
- ✅ No styling changes

**Status**: Ready for testing and deployment
