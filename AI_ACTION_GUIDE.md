# HAVEN AI Action System Guide

## Overview

The AI Action system extends the admin alert functionality by adding intelligent response recommendations from n8n workflows. Based on the severity and nature of the SOS alert, the system suggests appropriate actions for administrators.

---

## AI Response Types

### 1. CRITICAL → 🚨 Police Dispatch

**When to use:**
- High severity cases
- Immediate danger situations
- Physical violence reported
- Life-threatening scenarios

**Display:**
- Badge Color: Red
- Icon: 🚨
- Text: "Police Dispatch"

**Example n8n Response:**
```json
{
  "response": "CRITICAL"
}
```

---

### 2. ATTENTION → ⚠️ NGO Monitoring

**When to use:**
- Medium severity cases
- Ongoing abuse situations
- Cases requiring regular check-ins
- Escalating patterns detected

**Display:**
- Badge Color: Orange
- Icon: ⚠️
- Text: "NGO Monitoring"

**Example n8n Response:**
```json
{
  "response": "ATTENTION"
}
```

---

### 3. SUPPORT → 💬 Counselor Support

**When to use:**
- Low severity cases
- Emotional support needed
- Preventive intervention
- Mental health concerns

**Display:**
- Badge Color: Blue
- Icon: 💬
- Text: "Counselor Support"

**Example n8n Response:**
```json
{
  "response": "SUPPORT"
}
```

---

### 4. Pending Review (Default)

**When to use:**
- No AI response provided
- Manual review required
- Unclear severity

**Display:**
- Badge Color: Gray
- Icon: ⏳
- Text: "Pending Review"

**Example (no response field):**
```json
{
  "severity": "Medium",
  "emotion": "Unknown",
  "location": {...},
  "address": "...",
  "alert": "..."
}
```

---

## Implementation in n8n

### Option 1: Rule-Based Logic

```javascript
// In n8n Code node
const severity = $input.item.json.severity;
const emotion = $input.item.json.emotion;

let response = 'SUPPORT'; // Default

if (severity === 'High' || emotion.includes('Physical')) {
  response = 'CRITICAL';
} else if (severity === 'Medium' || emotion.includes('Violence')) {
  response = 'ATTENTION';
}

return {
  ...input.item.json,
  response: response
};
```

### Option 2: AI-Powered Decision

```javascript
// In n8n with AI integration
const prompt = `
Analyze this SOS alert and recommend an action:
- Severity: ${$json.severity}
- Emotion: ${$json.emotion}
- Situation: ${$json.alert}

Respond with ONLY one word:
- CRITICAL (for police dispatch)
- ATTENTION (for NGO monitoring)
- SUPPORT (for counselor support)
`;

// Call your AI service (OpenAI, Claude, etc.)
const aiResponse = await callAI(prompt);

return {
  ...$json,
  response: aiResponse.trim().toUpperCase()
};
```

### Option 3: Keyword Matching

```javascript
// In n8n Code node
const text = `${$json.alert} ${$json.emotion}`.toLowerCase();

let response = 'SUPPORT';

const criticalKeywords = ['emergency', 'danger', 'violence', 'assault', 'threat'];
const attentionKeywords = ['abuse', 'harassment', 'fear', 'unsafe'];

if (criticalKeywords.some(keyword => text.includes(keyword))) {
  response = 'CRITICAL';
} else if (attentionKeywords.some(keyword => text.includes(keyword))) {
  response = 'ATTENTION';
}

return {
  ...$json,
  response: response
};
```

---

## Complete n8n Workflow Example

### Workflow Structure

```
1. Webhook Trigger (from HAVEN)
   ↓
2. Extract Data
   ↓
3. AI Decision Logic
   ↓
4. HTTP Request (to Admin Alert Server)
```

### Node Configurations

#### Node 1: Webhook Trigger
- Path: `/webhook-test/sos-alert`
- Method: POST

#### Node 2: Code - AI Decision
```javascript
// Extract data
const severity = $input.item.json.severity;
const emotion = $input.item.json.emotion;
const location = $input.item.json.location;

// Decision logic
let response = 'SUPPORT';
let actionMessage = '';

if (severity === 'High') {
  response = 'CRITICAL';
  actionMessage = 'Immediate police intervention required';
} else if (severity === 'Medium') {
  response = 'ATTENTION';
  actionMessage = 'NGO monitoring and regular check-ins needed';
} else {
  response = 'SUPPORT';
  actionMessage = 'Counselor support and resources recommended';
}

return {
  severity: severity,
  emotion: emotion,
  location: location,
  address: location.address,
  alert: `${severity} Priority Alert - ${actionMessage}`,
  response: response
};
```

#### Node 3: HTTP Request
- Method: POST
- URL: `http://localhost:3001/admin-alert`
- Body:
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

---

## Testing AI Actions

### Test Script

```bash
# Test CRITICAL response
curl -X POST http://localhost:3001/admin-alert \
  -H "Content-Type: application/json" \
  -d '{
    "severity": "High",
    "emotion": "Physical Violence",
    "location": {"lat": 28.6139, "lng": 77.2090},
    "address": "New Delhi, India",
    "alert": "Emergency - Physical assault in progress",
    "response": "CRITICAL"
  }'

# Test ATTENTION response
curl -X POST http://localhost:3001/admin-alert \
  -H "Content-Type: application/json" \
  -d '{
    "severity": "Medium",
    "emotion": "Domestic Abuse",
    "location": {"lat": 19.0760, "lng": 72.8777},
    "address": "Mumbai, India",
    "alert": "Ongoing abuse situation - monitoring required",
    "response": "ATTENTION"
  }'

# Test SUPPORT response
curl -X POST http://localhost:3001/admin-alert \
  -H "Content-Type: application/json" \
  -d '{
    "severity": "Low",
    "emotion": "Emotional Distress",
    "location": {"lat": 12.9716, "lng": 77.5946},
    "address": "Bangalore, India",
    "alert": "Emotional support needed",
    "response": "SUPPORT"
  }'
```

### Using test-admin-alert.js

The test script now includes AI responses:

```bash
node test-admin-alert.js
```

This will send three alerts with different AI actions:
1. High severity → CRITICAL → Police Dispatch
2. Medium severity → ATTENTION → NGO Monitoring
3. Low severity → SUPPORT → Counselor Support

---

## Visual Display

### Admin Dashboard Alert Card

```
┌─────────────────────────────────────────────────────┐
│ ⚠️ [HIGH]                    2024-03-08 10:15:43   │
│ Emergency - Physical assault in progress            │
│ Emotion: Physical Violence                          │
│ [🚨 AI Action: Police Dispatch]  ← Red Badge       │
│ 📍 New Delhi, India                                 │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ ⚠️ [MEDIUM]                  2024-03-08 10:14:21   │
│ Ongoing abuse situation - monitoring required       │
│ Emotion: Domestic Abuse                             │
│ [⚠️ AI Action: NGO Monitoring]  ← Orange Badge     │
│ 📍 Mumbai, India                                    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ ℹ️ [LOW]                     2024-03-08 10:12:05   │
│ Emotional support needed                            │
│ Emotion: Emotional Distress                         │
│ [💬 AI Action: Counselor Support]  ← Blue Badge    │
│ 📍 Bangalore, India                                 │
└─────────────────────────────────────────────────────┘
```

---

## Response Mapping Logic

The system uses case-insensitive matching:

```typescript
// In adminAlertApi.ts
export const mapResponseToAction = (response?: string): string => {
  if (!response) return 'Pending Review';
  
  const responseLower = response.toLowerCase();
  
  if (responseLower.includes('critical')) {
    return 'Police Dispatch';
  } else if (responseLower.includes('attention')) {
    return 'NGO Monitoring';
  } else if (responseLower.includes('support')) {
    return 'Counselor Support';
  }
  
  return 'Pending Review';
};
```

This means these variations all work:
- `CRITICAL`, `critical`, `Critical`
- `ATTENTION`, `attention`, `Attention`
- `SUPPORT`, `support`, `Support`

---

## Best Practices

### 1. Consistent Response Format
Always use uppercase for clarity:
```json
{ "response": "CRITICAL" }
```

### 2. Fallback Handling
If AI fails, omit the response field:
```json
{
  "severity": "High",
  "emotion": "Unknown",
  "location": {...},
  "address": "...",
  "alert": "..."
  // No response field - will show "Pending Review"
}
```

### 3. Logging
Log AI decisions for audit:
```javascript
console.log(`AI Decision: ${response} for severity ${severity}`);
```

### 4. Testing
Test all three response types regularly:
```bash
node test-admin-alert.js
```

---

## Troubleshooting

### Issue: AI Action not displaying

**Check:**
1. Response field is included in payload
2. Response value is one of: CRITICAL, ATTENTION, SUPPORT
3. Server is receiving the response field (check logs)
4. Admin dashboard is connected to SSE stream

**Solution:**
```bash
# Check server logs
node server.cjs

# Check payload
curl -X POST http://localhost:3001/admin-alert \
  -H "Content-Type: application/json" \
  -d '{"severity":"High","emotion":"Test","location":{"lat":28.6139,"lng":77.2090},"address":"Test","alert":"Test","response":"CRITICAL"}'
```

### Issue: Wrong action displayed

**Check:**
1. Response value spelling
2. Case sensitivity (should work with any case)
3. Extra whitespace in response

**Solution:**
Use exact values: `CRITICAL`, `ATTENTION`, or `SUPPORT`

---

## Production Considerations

1. **AI Service Integration**: Connect to OpenAI, Claude, or custom AI
2. **Response Validation**: Validate AI responses before sending
3. **Fallback Logic**: Handle AI service failures gracefully
4. **Audit Trail**: Log all AI decisions for review
5. **Human Override**: Allow admins to change AI recommendations
6. **Performance**: Cache AI responses for similar cases
7. **Monitoring**: Track AI accuracy and adjust logic

---

## Future Enhancements

- [ ] Add confidence scores to AI responses
- [ ] Allow admins to override AI recommendations
- [ ] Track AI accuracy over time
- [ ] Add more granular action types
- [ ] Implement machine learning for better predictions
- [ ] Add explanation for AI decisions
- [ ] Create admin feedback loop for AI improvement

---

**Status**: ✅ Implemented and Ready

**Documentation**: Complete

**Testing**: Automated tests available
