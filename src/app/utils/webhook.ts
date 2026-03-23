// n8n webhook integration for SOS alerts

const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook-test/sos-alert';

export interface SOSWebhookPayload {
  emotionType: 'Low' | 'Medium' | 'High';
  emotion: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
}

export const sendSOSToWebhook = async (payload: SOSWebhookPayload): Promise<void> => {
  try {
    // Send POST request to n8n webhook in the background
    fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }).catch((error) => {
      // Silent fail - don't block SOS generation
      console.error('Webhook notification failed:', error);
    });
  } catch (error) {
    // Silent fail - don't block SOS generation
    console.error('Webhook error:', error);
  }
};
