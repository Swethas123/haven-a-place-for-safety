# HAVEN Admin Alert System

Real-time alert notification system for HAVEN administrators to receive instant SOS notifications via n8n webhooks.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install express cors
```

### 2. Start Alert Server
```bash
node server.js
```

### 3. Start HAVEN App
```bash
npm run dev
```

### 4. Test the System
```bash
node test-admin-alert.js
```

## 📋 What Was Implemented

### ✅ Backend Endpoint
- **POST /admin-alert** - Receives alerts from n8n
- **GET /admin-alert-stream** - SSE stream for real-time updates
- Server runs on port 3001
- Accepts optional `response` field for AI action

### ✅ Data Storage
- Alerts stored in `localStorage` under key `adminAlerts`
- Each alert includes: id, severity, emotion, location, address, alert, response, time

### ✅ Admin Dashboard Updates
- Real-time alert display at top of dashboard
- Color-coded severity indicators:
  - 🔴 **HIGH** - Red
  - 🟡 **MEDIUM** - Yellow
  - 🟢 **LOW** - Green
- **AI Action Display**:
  - 🚨 **CRITICAL** → Police Dispatch (Red badge)
  - ⚠️ **ATTENTION** → NGO Monitoring (Orange badge)
  - 💬 **SUPPORT** → Counselor Support (Blue badge)
  - ⏳ **Pending Review** (Gray badge, when no response)
- Auto-updates via Server-Sent Events (SSE)
- No UI design changes - alerts integrated seamlessly

### ✅ Real-time Features
- SSE connection for instant updates
- Automatic reconnection on disconnect
- No page refresh required
- Background processing

## 📁 Files Created

```
├── server.js                      # Express server for webhook endpoint
├── server-package.json            # Server dependencies
├── test-admin-alert.js           # Test script
├── start-alert-system.sh         # Linux/Mac startup script
├── start-alert-system.bat        # Windows startup script
├── ADMIN_ALERT_SETUP.md          # Detailed setup guide
├── INTEGRATION_GUIDE.md          # Complete integration guide
└── src/
    ├── app/
    │   ├── pages/
    │   │   └── AuthorityDashboardPage.tsx  # Updated with alerts
    │   ├── types/
    │   │   └── index.ts                    # Added AdminAlert type
    │   └── utils/
    │       ├── adminAlertApi.ts            # Alert API utilities
    │       └── storage.ts                  # Added alert storage functions
```

## 🔗 Integration Flow

```
HAVEN SOS → n8n Webhook → Admin Alert Server → Admin Dashboard
                                    ↓
                              localStorage
```

## 🧪 Testing

### Manual Test
```bash
curl -X POST http://localhost:3001/admin-alert \
  -H "Content-Type: application/json" \
  -d '{
    "severity": "High",
    "emotion": "Domestic Violence",
    "location": {"lat": 28.6139, "lng": 77.2090},
    "address": "New Delhi, India",
    "alert": "Test Alert",
    "response": "CRITICAL"
  }'
```

### Test Different AI Actions

**Police Dispatch (CRITICAL):**
```bash
curl -X POST http://localhost:3001/admin-alert \
  -H "Content-Type: application/json" \
  -d '{
    "severity": "High",
    "emotion": "Physical Abuse",
    "location": {"lat": 28.6139, "lng": 77.2090},
    "address": "New Delhi, India",
    "alert": "Emergency - Immediate intervention needed",
    "response": "CRITICAL"
  }'
```

**NGO Monitoring (ATTENTION):**
```bash
curl -X POST http://localhost:3001/admin-alert \
  -H "Content-Type: application/json" \
  -d '{
    "severity": "Medium",
    "emotion": "Emotional Abuse",
    "location": {"lat": 19.0760, "lng": 72.8777},
    "address": "Mumbai, India",
    "alert": "Requires monitoring",
    "response": "ATTENTION"
  }'
```

**Counselor Support (SUPPORT):**
```bash
curl -X POST http://localhost:3001/admin-alert \
  -H "Content-Type: application/json" \
  -d '{
    "severity": "Low",
    "emotion": "Stress",
    "location": {"lat": 12.9716, "lng": 77.5946},
    "address": "Bangalore, India",
    "alert": "Counseling recommended",
    "response": "SUPPORT"
  }'
```

### Automated Test
```bash
node test-admin-alert.js
```

## 📊 Alert Payload Structure

```json
{
  "severity": "High" | "Medium" | "Low",
  "emotion": "string",
  "location": {
    "lat": number,
    "lng": number
  },
  "address": "string",
  "alert": "string",
  "response": "CRITICAL" | "ATTENTION" | "SUPPORT" (optional)
}
```

### AI Response Mapping

The `response` field from n8n is mapped to action types:

| n8n Response | AI Action Display | Badge Color |
|--------------|-------------------|-------------|
| CRITICAL     | 🚨 Police Dispatch | Red         |
| ATTENTION    | ⚠️ NGO Monitoring  | Orange      |
| SUPPORT      | 💬 Counselor Support | Blue      |
| (empty)      | ⏳ Pending Review  | Gray        |

## 🎯 Key Features

- ✅ Non-blocking webhook integration
- ✅ Real-time SSE updates
- ✅ Color-coded severity display
- ✅ localStorage persistence
- ✅ Automatic reconnection
- ✅ No UI design changes
- ✅ Admin-only visibility
- ✅ Victim side untouched

## 📖 Documentation

- **ADMIN_ALERT_SETUP.md** - Detailed setup instructions
- **INTEGRATION_GUIDE.md** - Complete integration guide with n8n
- **webhook-test.md** - Original webhook integration docs

## 🔧 Configuration

### n8n Webhook Setup
1. Create HTTP Request node in n8n
2. URL: `http://localhost:3001/admin-alert`
3. Method: POST
4. Body: JSON with required fields

### Environment Variables (Production)
```env
VITE_ADMIN_ALERT_SERVER=https://your-server.com
```

## 🛡️ Security Notes

⚠️ For production:
- Add authentication to webhook endpoint
- Implement rate limiting
- Use HTTPS
- Validate webhook signatures
- Sanitize inputs

## 📞 Support

Check these if issues occur:
1. Server running on port 3001?
2. Admin logged in?
3. SSE connection established?
4. Check browser console for errors
5. Verify localStorage has `adminAlerts` key

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Server logs show "Admin client connected"
- ✅ Alerts appear at top of admin dashboard
- ✅ Colors match severity levels
- ✅ Timestamps are current
- ✅ No page refresh needed for new alerts

---

**Status**: ✅ Complete and Ready to Use

**Victim Side**: ✅ Untouched (as required)

**Admin Side**: ✅ Real-time alerts implemented
