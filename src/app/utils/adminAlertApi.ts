// Admin Alert API - Backend endpoint simulation
import { saveAdminAlert } from './storage';

export interface AdminAlertPayload {
  severity: 'Low' | 'Medium' | 'High';
  emotion: string;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  alert: string;
  response?: string; // AI response from n8n
}

// Map AI response to action type
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

// Simulate POST /admin-alert endpoint
export const handleAdminAlertWebhook = (payload: AdminAlertPayload): void => {
  try {
    const alertData = {
      id: Date.now().toString(),
      severity: payload.severity,
      emotion: payload.emotion,
      location: payload.location,
      address: payload.address,
      alert: payload.alert,
      response: payload.response,
      time: new Date().toISOString(),
    };

    // Save to localStorage
    saveAdminAlert(alertData);

    // Trigger custom event for real-time updates
    window.dispatchEvent(new CustomEvent('newAdminAlert', { detail: alertData }));

    console.log('Admin alert received and stored:', alertData);
  } catch (error) {
    console.error('Error handling admin alert:', error);
  }
};

// Initialize webhook listener (for testing purposes)
export const initializeAdminAlertListener = (): void => {
  // This would normally be handled by your backend
  // For demo purposes, we'll expose a global function
  (window as any).receiveAdminAlert = handleAdminAlertWebhook;
  
  console.log('Admin alert listener initialized. Use window.receiveAdminAlert(payload) to test.');
};

// Polling mechanism to check for new alerts (alternative to real-time)
export const startAlertPolling = (callback: () => void, interval: number = 5000): NodeJS.Timeout => {
  return setInterval(callback, interval);
};

export const stopAlertPolling = (intervalId: NodeJS.Timeout): void => {
  clearInterval(intervalId);
};
