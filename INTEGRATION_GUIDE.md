# HAVEN Complete Integration Guide

## System Architecture

```
┌─────────────────┐
│  HAVEN React    │
│  Application    │
│  (Port 5173)    │
└────────┬────────┘
         │
         │ Creates SOS
         ↓
┌─────────────────┐      POST      ┌─────────────────┐
│  SOS Creation   │─────────────→  │  n8n Webhook    │
│  (CreatePost)   │  /sos-alert    │  (Port 5678)    │
└─────────────────┘                └────────┬────────┘
                                            │
                                            │ Process & Forward
                                            ↓
                                   ┌─────────────────┐
                                   │  Admin Alert    │
                                   │  Server         │
                                   │  (Port 3001)    │
                                   └────────┬────────┘
                                            │
                                            │ SSE Stream
                                            ↓
                                   ┌─────────────────┐
                                   │  Admin          │
                                   │  Dashboard      │
                                   │  (Real-time)    │
                                   └─────────────────┘
```

## Complete Setup Steps

### Step 1: Start the Admin Alert Server

**Windows:**
```bash
start-alert-system.bat
```

**Linux/Mac:**
```bash
chmod +x start-alert-system.sh
./start-alert-system.sh
```

**Manual:**
```bash
npm install express cors
node server.js
```

### Step 2: Start Your HAVEN Application

```bash
npm run dev
```

The app will start on `http://localhost:5173`

### Step 3: Configure n8n Workflow

Create a new workflow in n8n with these nodes:

#### Node 1: Webhook Trigger (Receives from HAVEN)
- **Webhook URL**: `http://localhost:5678/webhook-test/sos-alert`
- **Method**: POST
- **Response**: Immediately

#### Node 2: Set Variables (Transform Data)
```javascript
// Extract and transform data
return {
  severity: $input.item.json.severity,
  emotion: $input.item.json.emotion,
  location: $input.item.json.location,
  address: $input.item.json.location.address,
  alert: `SOS Alert - ${$input.item.json.severity} Priority - ${$input.item.json.emotion}`
};
```

#### Node 3: HTTP Request (Send to Admin Server)
- **Method**: POST
- **URL**: `http://localhost:3001/admin-alert`
- **Body Content Type**: JSON
- **Body**:
```json
{
  "severity": "={{ $json.severity }}",
  "emotion": "={{ $json.emotion }}",
  "location": {
    "lat": ={{ $json.location.lat }},
    "lng": ={{ $json.location.lng }}
  },
  "address": "={{ $json.address }}",
  "alert": "={{ $json.alert }}",
  "response": "={{ $json.response }}"
}
```

**Note**: The `response` field should contain one of:
- `CRITICAL` - Maps to "Police Dispatch"
- `ATTENTION` - Maps to "NGO Monitoring"
- `SUPPORT` - Maps to "Counselor Support"

### Step 4: Test the Complete Flow

#### Option A: Create a Real SOS in HAVEN

1. Open HAVEN app: `http://localhost:5173`
2. Navigate to "Create Post"
3. Fill out the SOS form
4. Submit
5. Check n8n for incoming webhook
6. Check Admin Dashboard for real-time alert

#### Option B: Test with cURL

```bash
# Test HAVEN → n8n webhook
curl -X POST http://localhost:5678/webhook-test/sos-alert \
  -H "Content-Type: application/json" \
  -d '{
    "severity": "High",
    "emotion": "Physical and Emotional Abuse",
    "location": {
      "lat": 28.6139,
      "lng": 77.2090,
      "address": "New Delhi, India"
    }
  }'
```

#### Option C: Test with Node.js Script

```bash
node test-admin-alert.js
```

## Verification Checklist

- [ ] Admin Alert Server running on port 3001
- [ ] HAVEN app running on port 5173
- [ ] n8n running on port 5678
- [ ] n8n workflow activated
- [ ] Admin logged into dashboard
- [ ] SSE connection established (check browser console)

## Expected Behavior

### When SOS is Created:

1. **User Side** (CreatePostPage):
   - Form submitted
   - SOS narrative generated
   - Data decomposed (severity, emotion, etc.)
   - Case saved to localStorage
   - Webhook sent to n8n (background, non-blocking)
   - User redirected to preview page

2. **n8n Side**:
   - Receives webhook from HAVEN
   - Processes and transforms data
   - Forwards to Admin Alert Server

3. **Admin Server Side**:
   - Receives POST request
   - Creates alert object with unique ID and timestamp
   - Saves to localStorage (key: `adminAlerts`)
   - Broadcasts to all connected admin clients via SSE

4. **Admin Dashboard Side**:
   - Receives alert via SSE stream
   - Automatically updates UI (no refresh needed)
   - Displays alert with color-coded severity
   - Shows alert details (emotion, location, time)

## Alert Display Colors

| Severity | Background | Border | Badge |
|----------|-----------|--------|-------|
### Input (HAVEN SOS):
```json
{
  "severity": "High",
  "location": {
    "lat": 28.6139,
    "lng": 77.2090,
    "address": "New Delhi, India"
  },
  "emotion": "Physical and Emotional Abuse"
}
```

### n8n Processing (Add AI Response):
```json
{
  "severity": "High",
  "emotion": "Physical and Emotional Abuse",
  "location": {
    "lat": 28.6139,
    "lng": 77.2090
  },
  "address": "New Delhi, India",
  "alert": "Emergency SOS Alert - Immediate attention required",
  "response": "CRITICAL"
}
```

### Output (Admin Alert):
```json
{
  "id": "1709876543210",
  "severity": "High",
  "emotion": "Physical and Emotional Abuse",
  "location": {
    "lat": 28.6139,
    "lng": 77.2090
  },
  "address": "New Delhi, India",
  "alert": "Emergency SOS Alert - Immediate attention required",
  "response": "CRITICAL",
  "time": "2024-03-08T10:15:43.210Z"
}
```

### Display (Admin Dashboard):
- Severity Badge: 🔴 High (Red)
- AI Action Badge: 🚨 Police Dispatch (Red) "lng": 77.2090
  },
  "address": "New Delhi, India",
  "alert": "Emergency SOS Alert - Immediate attention required",
  "time": "2024-03-08T10:15:43.210Z"
}
```

## Troubleshooting

### Issue: Alerts not appearing on dashboard

**Check:**
1. Is server.js running? → Check terminal
2. Is SSE connected? → Check browser console for "Admin client connected"
3. Are alerts in localStorage? → Run `localStorage.getItem('adminAlerts')` in console
4. Is admin logged in? → Verify AdminGuard is passing

**Solution:**
```bash
# Restart server
node server.js

# Clear localStorage and refresh
localStorage.clear()
location.reload()
```

### Issue: n8n webhook not receiving data

**Check:**
1. Is n8n running? → Visit `http://localhost:5678`
2. Is workflow activated? → Check workflow status
3. Is webhook URL correct? → Verify in CreatePostPage.tsx

**Solution:**
```javascript
// Check webhook.ts file
const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/sos-alert';
```

### Issue: CORS errors

**Check:**
1. Server has CORS enabled (it does by default)
2. Ports are correct
3. No proxy issues

**Solution:**
Server already includes:
```javascript
app.use(cors());
```

## Production Deployment

For production, update these configurations:

### 1. Environment Variables

Create `.env` file:
```env
VITE_N8N_WEBHOOK_URL=https://your-n8n-domain.com/webhook/sos-alert
VITE_ADMIN_ALERT_SERVER=https://your-admin-server.com
```

### 2. Update webhook.ts
```typescript
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;
```

### 3. Update AuthorityDashboardPage.tsx
```typescript
const eventSource = new EventSource(import.meta.env.VITE_ADMIN_ALERT_SERVER + '/admin-alert-stream');
```

### 4. Secure the Endpoints
- Add authentication tokens
- Implement rate limiting
- Use HTTPS
- Validate webhook signatures

## Monitoring

### Server Logs
```bash
# Watch server logs
tail -f server.log
```

### Browser Console
```javascript
// Check SSE connection
console.log('SSE readyState:', eventSource.readyState);
// 0 = CONNECTING, 1 = OPEN, 2 = CLOSED

// Check alerts
console.log(JSON.parse(localStorage.getItem('adminAlerts')));
```

### n8n Execution Logs
- Check workflow executions in n8n UI
- View execution data for debugging

## Performance Considerations

- **SSE Connection**: Lightweight, one connection per admin
- **localStorage**: Limited to ~5-10MB, consider cleanup strategy
- **Real-time Updates**: Instant delivery via SSE
- **Scalability**: For multiple admins, consider Redis pub/sub

## Security Notes

⚠️ **Important for Production:**
- Implement webhook signature verification
- Add authentication to admin endpoints
- Use environment variables for sensitive data
- Implement rate limiting
- Add request validation
- Use HTTPS in production
- Sanitize all inputs

## Support

If you encounter issues:
1. Check all three services are running
2. Verify ports are not in use
3. Check browser console for errors
4. Review server logs
5. Test each component individually

## Quick Commands Reference

```bash
# Start alert server
node server.js

# Start HAVEN app
npm run dev

# Test alerts
node test-admin-alert.js

# Check if ports are in use
netstat -ano | findstr :3001
netstat -ano | findstr :5173
netstat -ano | findstr :5678

# Install dependencies
npm install express cors
```
