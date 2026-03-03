# 🚀 HAVEN Admin Alert System - Quick Start

## One-Command Setup

### Windows
```bash
npm install express cors && start-alert-system.bat
```

### Linux/Mac
```bash
npm install express cors && chmod +x start-alert-system.sh && ./start-alert-system.sh
```

---

## Three Steps to Success

### 1️⃣ Start Alert Server
```bash
node server.js
```
✅ Server running on http://localhost:3001

### 2️⃣ Start HAVEN App
```bash
npm run dev
```
✅ App running on http://localhost:5173

### 3️⃣ Test It
```bash
node test-admin-alert.js
```
✅ Alerts sent to admin dashboard

---

## Verify It's Working

1. Open admin dashboard: http://localhost:5173
2. Login as admin
3. Look for "Live Alerts" section at top
4. Run test script - alerts should appear instantly

---

## Test with cURL

```bash
curl -X POST http://localhost:3001/admin-alert \
  -H "Content-Type: application/json" \
  -d '{"severity":"High","emotion":"Test","location":{"lat":28.6139,"lng":77.2090},"address":"New Delhi","alert":"Test Alert"}'
```

---

## What You Should See

### In Terminal (Server)
```
🚀 Admin Alert Server running on http://localhost:3001
📡 SSE endpoint: http://localhost:3001/admin-alert-stream
📬 Webhook endpoint: POST http://localhost:3001/admin-alert
✅ Admin client connected: 1709876543210
📢 New Admin Alert Received: {...}
📡 Alert broadcasted to 1 connected admin(s)
```

### In Browser (Admin Dashboard)
```
┌─────────────────────────────────┐
│ 🔔 Live Alerts      [1 New]    │
├─────────────────────────────────┤
│ ⚠️ HIGH - Test Alert           │
│ Emotion: Test                   │
│ 📍 New Delhi                    │
└─────────────────────────────────┘
```

---

## Troubleshooting

### Port 3001 already in use?
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### Dependencies not installed?
```bash
npm install express cors
```

### Server not starting?
```bash
# Check Node.js version
node --version  # Should be v14+

# Reinstall dependencies
rm -rf node_modules
npm install express cors
```

---

## Success Indicators

✅ Server logs show "Admin client connected"
✅ Browser console shows SSE connection
✅ Alerts appear without page refresh
✅ Colors match severity (Red/Yellow/Green)
✅ localStorage has "adminAlerts" key

---

## Full Documentation

- **ADMIN_ALERT_README.md** - Overview
- **ADMIN_ALERT_SETUP.md** - Detailed setup
- **INTEGRATION_GUIDE.md** - n8n integration
- **IMPLEMENTATION_SUMMARY.md** - Technical details

---

## Need Help?

1. Check server is running: http://localhost:3001
2. Check browser console for errors
3. Verify admin is logged in
4. Check localStorage: `localStorage.getItem('adminAlerts')`
5. Review server logs in terminal

---

**Ready to go!** 🎉
