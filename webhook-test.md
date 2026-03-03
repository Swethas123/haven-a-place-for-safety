# n8n Webhook Integration Test Guide

## Setup Complete ✓

The HAVEN SOS system now sends alerts to your n8n webhook after each SOS is decoded.

## Webhook Details

- **Endpoint**: `http://localhost:5678/webhook-test/sos-alert`
- **Method**: POST
- **Content-Type**: application/json

## Payload Structure

```json
{
  "severity": "High" | "Medium" | "Low",
  "location": {
    "lat": 28.6139,
    "lng": 77.2090,
    "address": "New Delhi, India"
  },
  "emotion": "Physical and Emotional Abuse"
}
```

## Testing Steps

1. **Start n8n** (if not already running):
   ```bash
   n8n start
   ```

2. **Create a webhook workflow in n8n**:
   - Add a Webhook node
   - Set path to: `webhook-test/sos-alert`
   - Method: POST
   - Add any processing nodes you need

3. **Test the integration**:
   - Open HAVEN app
   - Navigate to "Create Post" page
   - Fill out the SOS form
   - Submit the form
   - Check n8n for incoming webhook data

## Implementation Details

- Webhook call is **non-blocking** - it runs in the background
- Errors are logged to console but don't affect SOS generation
- No UI changes were made
- Original SOS flow remains unchanged

## Files Modified

- `src/app/utils/webhook.ts` - New webhook utility
- `src/app/pages/CreatePostPage.tsx` - Added webhook call after SOS creation
