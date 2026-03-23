# Admin Dashboard Refactor - Testing Guide

## 🧪 Quick Testing Steps

---

## Test 1: Verify Resolved Cases Removed

### Steps
1. Navigate to admin dashboard: `/authority-dashboard`
2. Look at the cases section

### Expected Results
- ✅ No tabs visible (no "Active SOS" / "Resolved Archives" tabs)
- ✅ Only one table showing all cases
- ✅ Stats show 4 cards (Total, Open, In Progress, High Severity)
- ✅ No "Closed" counter card

### Visual Check
```
Before:
┌─────────────────────────────────────┐
│ [Active SOS] [Resolved Archives]    │ ← Should be GONE
└─────────────────────────────────────┘

After:
┌─────────────────────────────────────┐
│ Case Management                      │ ← Just title, no tabs
└─────────────────────────────────────┘
```

---

## Test 2: Delete Case Functionality

### Steps
1. On admin dashboard, find a case in the table
2. Click the "Delete" button (red, with trash icon)
3. Observe the UI

### Expected Results
- ✅ Case disappears immediately from table
- ✅ Stats update (Total count decreases by 1)
- ✅ No confirmation modal appears
- ✅ No error messages

### Verify Persistence
4. Refresh the page (F5)
5. Check if the deleted case is still gone

### Expected Results
- ✅ Deleted case does NOT reappear
- ✅ Stats remain updated
- ✅ Case is permanently deleted

### Verify localStorage
```javascript
// Open browser console
const cases = JSON.parse(localStorage.getItem('haven_sos_cases'));
console.log('Total cases:', cases.length);
console.log('Case IDs:', cases.map(c => c.id));
// Deleted case ID should NOT be in the list
```

---

## Test 3: Delete Admin Alert

### Steps
1. Ensure there are admin alerts visible (create test alerts if needed)
2. Find the trash icon in the top-right corner of an alert card
3. Click the trash icon

### Expected Results
- ✅ Alert disappears immediately
- ✅ Alert count badge updates
- ✅ No confirmation modal

### Verify Persistence
4. Refresh the page
5. Check if the deleted alert is still gone

### Expected Results
- ✅ Deleted alert does NOT reappear
- ✅ Alert count remains updated

### Verify localStorage
```javascript
// Open browser console
const alerts = JSON.parse(localStorage.getItem('adminAlerts'));
console.log('Total alerts:', alerts.length);
console.log('Alert IDs:', alerts.map(a => a.id));
// Deleted alert ID should NOT be in the list
```

---

## Test 4: Stats Accuracy

### Setup
1. Note current stats on dashboard
2. Create a new SOS case (from victim side)
3. Return to admin dashboard

### Expected Results
- ✅ "Total" increases by 1
- ✅ "Open" increases by 1
- ✅ If severity is High, "High Severity" increases by 1

### Continue Test
4. Delete the newly created case
5. Observe stats

### Expected Results
- ✅ "Total" decreases by 1
- ✅ "Open" decreases by 1
- ✅ If it was High severity, "High Severity" decreases by 1

---

## Test 5: Multiple Deletions

### Steps
1. Create 3 test cases
2. Delete all 3 cases one by one
3. Observe UI after each deletion

### Expected Results
- ✅ Each case disappears immediately
- ✅ Stats update after each deletion
- ✅ After deleting all, empty state shows

### Empty State Check
```
┌─────────────────────────────────────┐
│         🛡️                          │
│   No Active Cases                   │
│   All cases have been handled       │
└─────────────────────────────────────┘
```

---

## Test 6: Button Styling

### Visual Checks

**Delete Button (Cases Table):**
- ✅ Red text color
- ✅ Red border
- ✅ Trash icon visible
- ✅ Text says "Delete"
- ✅ Hover: Red background

**Delete Button (Alerts):**
- ✅ Trash icon in top-right corner
- ✅ Gray by default
- ✅ Hover: Red color, red background

**View Button (Unchanged):**
- ✅ Blue text color
- ✅ Blue border
- ✅ Eye icon visible
- ✅ Text says "Details" or translated equivalent

---

## Test 7: No Resolved Status

### Steps
1. Look at all cases in the table
2. Check the "Status" column

### Expected Results
- ✅ Only "Open" or "In Progress" statuses visible
- ✅ No "Closed" status anywhere
- ✅ Status badges: Orange (Open) or Yellow (In Progress)
- ✅ No Green status badges

---

## Test 8: Real-time Updates (SSE)

### Setup
1. Keep admin dashboard open
2. Send a test alert via n8n or test script

### Steps
```bash
# Run this in terminal
curl -X POST http://localhost:3001/admin-alert \
  -H "Content-Type: application/json" \
  -d '{
    "severity": "High",
    "emotion": "Test",
    "location": {"lat": 28.6139, "lng": 77.2090},
    "address": "Test Location",
    "alert": "Test Alert",
    "response": "CRITICAL"
  }'
```

### Expected Results
- ✅ New alert appears in Live Alerts section
- ✅ Alert count badge updates
- ✅ Delete button visible on new alert
- ✅ Can delete the new alert immediately

---

## Test 9: Case Detail Page

### Steps
1. Click "View" button on any case
2. Navigate to case detail page

### Expected Results
- ✅ Case detail page loads correctly
- ✅ All case information displayed
- ✅ No "Mark as Resolved" button
- ✅ Page functions normally

### Note
Case detail page should be unchanged. If it has a "Mark as Resolved" button, that's a separate page that may need updating.

---

## Test 10: Map View

### Steps
1. Click "Map View" button on admin dashboard
2. Navigate to map view page

### Expected Results
- ✅ Map view loads correctly
- ✅ All cases shown on map
- ✅ Deleted cases NOT shown on map
- ✅ Map functions normally

---

## Test 11: Concurrent Admin Sessions

### Setup
1. Open admin dashboard in two browser windows
2. Login as admin in both

### Steps
1. In Window 1: Delete a case
2. In Window 2: Observe

### Expected Results
- ✅ Window 2 receives SSE update
- ✅ Case disappears in Window 2
- ✅ Stats update in Window 2
- ✅ No errors in console

---

## Test 12: localStorage Integrity

### Before Any Actions
```javascript
// Open browser console
const cases = JSON.parse(localStorage.getItem('haven_sos_cases'));
console.log('Initial cases:', cases.length);
const initialIds = cases.map(c => c.id);
console.log('Initial IDs:', initialIds);
```

### After Deleting One Case
```javascript
const casesAfter = JSON.parse(localStorage.getItem('haven_sos_cases'));
console.log('Cases after deletion:', casesAfter.length);
const afterIds = casesAfter.map(c => c.id);
console.log('Remaining IDs:', afterIds);

// Verify deleted ID is gone
const deletedId = initialIds.find(id => !afterIds.includes(id));
console.log('Deleted ID:', deletedId);
```

### Expected Results
- ✅ Case count decreased by 1
- ✅ Deleted case ID not in remaining IDs
- ✅ All other case IDs still present
- ✅ No duplicate IDs
- ✅ No null or undefined values

---

## Test 13: Edge Cases

### Test 13a: Delete Last Case
1. Delete all cases except one
2. Delete the last case

**Expected:**
- ✅ Empty state shows
- ✅ Stats show all zeros
- ✅ No errors

### Test 13b: Rapid Deletions
1. Click delete on multiple cases quickly

**Expected:**
- ✅ All deletions process
- ✅ UI updates correctly
- ✅ No race conditions
- ✅ Stats accurate

### Test 13c: Delete While Viewing Details
1. Open case detail page
2. In another tab, delete that case
3. Return to detail page

**Expected:**
- ✅ Detail page shows error or redirects
- ✅ No crash

---

## Test 14: Victim Side Unaffected

### Steps
1. Navigate to victim login: `/victim-login`
2. Login as victim
3. Create a new SOS case
4. View victim dashboard

### Expected Results
- ✅ Victim pages work normally
- ✅ Can create SOS without issues
- ✅ Victim dashboard shows cases
- ✅ No admin features visible

---

## Test 15: n8n Integration

### Steps
1. Ensure n8n server is running
2. Create a new SOS case from victim side
3. Check n8n workflow execution

### Expected Results
- ✅ Webhook received by n8n
- ✅ Payload format unchanged
- ✅ Workflow executes successfully
- ✅ Admin alert created

### Verify Webhook Payload
```json
{
  "severity": "High" | "Medium" | "Low",
  "emotion": "...",
  "location": {
    "lat": 28.6139,
    "lng": 77.2090
  }
}
```

---

## 🎯 Success Criteria

All tests should pass with these results:

### UI Tests
- ✅ No tabs visible
- ✅ 4 stats cards (not 5)
- ✅ Delete buttons present
- ✅ No "Mark as Resolved" buttons
- ✅ No "Closed" status badges

### Functionality Tests
- ✅ Cases delete permanently
- ✅ Alerts delete permanently
- ✅ Stats update correctly
- ✅ UI updates immediately
- ✅ Changes persist after refresh

### Integration Tests
- ✅ SSE still works
- ✅ n8n integration intact
- ✅ Victim side unaffected
- ✅ Map view works
- ✅ Case details work

---

## 🐛 Common Issues

### Issue: Cases reappear after refresh
**Check:**
- localStorage.setItem called correctly
- No caching issues
- Correct storage key used

**Fix:**
```javascript
// Verify deletion function
const deleteCase = (id) => {
  const cases = getCases();
  const filtered = cases.filter(c => c.id !== id);
  localStorage.setItem('haven_sos_cases', JSON.stringify(filtered));
};
```

### Issue: Stats not updating
**Check:**
- loadCases() called after deletion
- Stats calculation correct
- State updating properly

**Fix:**
```javascript
// Ensure loadCases is called
const handleDeleteCase = (caseId) => {
  deleteCase(caseId);
  loadCases(); // ← Must be called
};
```

### Issue: Delete button not visible
**Check:**
- Import Trash2 icon
- Button rendered in table
- CSS classes applied

**Fix:**
```typescript
import { Trash2 } from 'lucide-react';
```

---

## 📊 Test Results Template

```
Test 1: Resolved Cases Removed     [ ] Pass [ ] Fail
Test 2: Delete Case                [ ] Pass [ ] Fail
Test 3: Delete Alert               [ ] Pass [ ] Fail
Test 4: Stats Accuracy             [ ] Pass [ ] Fail
Test 5: Multiple Deletions         [ ] Pass [ ] Fail
Test 6: Button Styling             [ ] Pass [ ] Fail
Test 7: No Resolved Status         [ ] Pass [ ] Fail
Test 8: Real-time Updates          [ ] Pass [ ] Fail
Test 9: Case Detail Page           [ ] Pass [ ] Fail
Test 10: Map View                  [ ] Pass [ ] Fail
Test 11: Concurrent Sessions       [ ] Pass [ ] Fail
Test 12: localStorage Integrity    [ ] Pass [ ] Fail
Test 13: Edge Cases                [ ] Pass [ ] Fail
Test 14: Victim Side               [ ] Pass [ ] Fail
Test 15: n8n Integration           [ ] Pass [ ] Fail

Overall Status: [ ] All Pass [ ] Some Fail
```

---

## 🚀 Quick Verification Script

```javascript
// Run in browser console on admin dashboard

// 1. Check stats cards
const statsCards = document.querySelectorAll('[class*="grid"] > div');
console.log('Stats cards count:', statsCards.length); // Should be 4

// 2. Check for tabs
const tabs = document.querySelectorAll('[role="tablist"]');
console.log('Tabs found:', tabs.length); // Should be 0

// 3. Check delete buttons
const deleteButtons = Array.from(document.querySelectorAll('button'))
  .filter(btn => btn.textContent.includes('Delete'));
console.log('Delete buttons found:', deleteButtons.length); // Should match case count

// 4. Check localStorage
const cases = JSON.parse(localStorage.getItem('haven_sos_cases') || '[]');
console.log('Cases in storage:', cases.length);
console.log('Cases with Closed status:', cases.filter(c => c.status === 'Closed').length); // Should be 0

console.log('✅ Verification complete!');
```

---

**Testing Status:** Ready

**Estimated Time:** 20-30 minutes for complete suite

**Priority Tests:** 1, 2, 3, 4, 7, 14, 15
