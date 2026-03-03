export interface SOSCase {
  id: string;
  pin?: string;
  name: string;
  phone: string;
  preferredContact: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  durationOfAbuse: string;
  frequency: string;
  currentSituation: string;
  culpritDescription: string;
  sosMessage: string;
  severity: 'Low' | 'Medium' | 'High';
  nature: string;
  riskLevel: string;
  status: 'Open' | 'In Progress' | 'Closed';
  timestamp: number;
  imageUrl?: string;
  timeline: TimelineEvent[];
}

export interface TimelineEvent {
  id: string;
  event: string;
  timestamp: number;
}

export interface SafeContact {
  id: string;
  name: string;
  type: 'NGO' | 'Helper';
  phone: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  riskLevel?: 'Low' | 'Medium' | 'High';
}

export interface AdminAlert {
  id: string;
  severity: 'Low' | 'Medium' | 'High';
  emotion: string;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  alert: string;
  time: string;
  response?: string; // AI response from n8n
}
