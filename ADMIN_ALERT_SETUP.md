# HAVEN Admin Alert System Setup Guide

## Overview
The admin alert system receives real-time notifications from n8n webhooks and displays them on the Authority Dashboard.

## Architecture

```
n8n Webhook → POST /admin-alert → Express Server → SSE → Admin Dashboard
                                        ↓
                                  localStorage (adminAlerts)
```

## Setup Instructions

### 1. Install Server Dependencies

```bash
# Install Express server dependencies
npm install --prefix . express cors
```

Or if using the separate package file:
```bash
npm install --save express cors
```

### 2. Start the Admin Alert Server

```bash
node server.js
```

The server will start on `http://localhost:3001` with:
- Webhook endpoint: `POST http://localhost:3001/admin-alert`
- SSE stream: `GET http://localhost:3001/admin-alert-stream`

### 3. Configure n8n Workflow

In your n8n workflow, add an HTTP Request node with:

**URL**: `http://localhost:3001/admin-alert`
**Method**: POST
**Body (JSON)**:
```json
{
  "severity": "High",
  "emotion": "Physical and Emotional Abuse",
  "location": {
    "lat": 28.6139,
    "lng": 77.2090
  },
  "address": "New Delhi, India",
  "alert": "Emergency SOS Alert - Immediate attention required"
}
```

### 4. Start Your HAVEN Application

```bash
npm run dev
```

### 5. Access Admin Dashboard

1. Navigate to the admin login page
2. Login with admin credentials
3. The dashboard will automatically connect to the alert stream
4. New alerts will appear in real-time at the top of the dashboard

## Testing the System

### Manual Test via cURL

```bash
curl -X POST http://localhost:3001/admin-alert \
  -H "Content-Type: application/json" \
  -d '{
    "severity": "High",
    "emotion": "Domestic Violence",
    "location": {
      "lat": 28.6139,
      "lng": 77.2090
    },
    "address": "New Delhi, India",
    "alert": "Test Alert - High Priority"
  }'
```

### Test via Postman

1. Create a new POST request
2. URL: `http://localhost:3001/admin-alert`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "severity": "Medium",
  "emotion": "Emotional Manipulation",
  "location": {
    "lat": 19.0760,
    "lng": 72.8777
  },
  "address": "Mumbai, Maharashtra",
  "alert": "Medium priority alert - Monitoring required"
}
```

### Test via Browser Console

Open the admin dashboard and run:
```javascript
fetch('http://localhost:3001/admin-alert', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    severity: 'Low',
    emotion: 'Supportive Check-in',
    location: { lat: 12.9716, lng: 77.5946 },
    address: 'Bangalore, Karnataka',
    alert: 'Low priority - Routine check'
  })
})
```

## Alert Display Features

### Severity Color Coding
- **HIGH**: Red background with red border
- **MEDIUM**: Yellow background with yellow border
- **LOW**: Green background with green border

### Real-time Updates
- Alerts appear instantly via Server-Sent Events (SSE)
- No page refresh required
- Automatic reconnection on connection loss

### Alert Information Displayed
- Severity badge
- Alert message
- Emotion/nature of incident
- Location address
- Timestamp

## Data Storage

Alerts are stored in `localStorage` under the key `adminAlerts`:

```javascript
// Access alerts programmatically
const alerts = JSON.parse(localStorage.getItem('adminAlerts') || '[]');
console.log(alerts);

// Clear all alerts
localStorage.removeItem('adminAlerts');
```

## Files Modified/Created

### New Files
- `server.js` - Express server for webhook endpoint
- `server-package.json` - Server dependencies
- `src/app/utils/adminAlertApi.ts` - Alert API utilities
- `src/app/types/index.ts` - Added AdminAlert interface

### Modified Files
- `src/app/pages/AuthorityDashboardPage.tsx` - Added alert display and SSE connection
- `src/app/utils/storage.ts` - Added admin alert storage functions

## Troubleshooting

### Server not starting
- Check if port 3001 is available
- Install dependencies: `npm install express cors`

### Alerts not appearing
- Verify server is running on port 3001
- Check browser console for SSE connection errors
- Ensure admin is logged in
- Check localStorage for `adminAlerts` key

### CORS errors
- Server has CORS enabled by default
- If issues persist, check browser console

### SSE connection drops
- Connection automatically reconnects
- Check server logs for disconnection messages

## Production Considerations

For production deployment:
1. Use environment variables for server URL
2. Implement authentication for webhook endpoint
3. Add rate limiting
4. Use a proper database instead of localStorage
5. Implement WebSocket for better real-time performance
6. Add alert acknowledgment/dismissal features
7. Implement alert history and filtering

## n8n Integration Example

Create a workflow in n8n:

1. **Trigger**: Webhook (receives SOS data)
2. **Process**: Transform data to match alert format
3. **HTTP Request**: POST to `http://localhost:3001/admin-alert`
4. **Response**: Success confirmation

Example n8n HTTP Request node configuration:
- Method: POST
- URL: `http://localhost:3001/admin-alert`
- Body Content Type: JSON
- Body:
```json
{
  "severity": "{{ $json.severity }}",
  "emotion": "{{ $json.emotion }}",
  "location": {
    "lat": {{ $json.location.lat }},
    "lng": {{ $json.location.lng }}
  },
  "address": "{{ $json.location.address }}",
  "alert": "SOS Alert from {{ $json.name }} - {{ $json.severity }} priority"
}
```

## Support

For issues or questions, check:
- Server logs in terminal
- Browser console for client-side errors
- Network tab for failed requests
