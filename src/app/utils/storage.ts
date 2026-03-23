import { SOSCase, SafeContact } from '../types';

const STORAGE_KEY = 'haven_sos_cases';
const SAFE_CONTACTS_KEY = 'haven_safe_contacts';
const PIN_KEY = 'haven_victim_pin';
const SESSION_PIN_KEY = 'haven_current_session_pin';
const ADMIN_KEY = 'haven_admin_account';
const ADMIN_LOGGED_IN_KEY = 'haven_admin_logged_in';
const VICTIM_AUTH_KEY = 'haven_victim_authenticated';
const VICTIM_PHONE_KEY = 'haven_victim_phone';
const USER_PROFILE_KEY = 'userProfile';

export const getCases = (pinFilter?: string): SOSCase[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const cases: SOSCase[] = data ? JSON.parse(data) : [];
    if (pinFilter) {
      return cases.filter(c => c.pin === pinFilter);
    }
    return cases;
  } catch (error) {
    console.error('Error reading cases:', error);
    return [];
  }
};

export const saveCase = (sosCase: SOSCase): void => {
  try {
    const cases = getCases();
    const existingIndex = cases.findIndex(c => c.id === sosCase.id);

    if (existingIndex >= 0) {
      cases[existingIndex] = sosCase;
    } else {
      cases.push(sosCase);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
  } catch (error) {
    console.error('Error saving case:', error);
  }
};

export const getCaseById = (id: string): SOSCase | null => {
  const cases = getCases();
  return cases.find(c => c.id === id) || null;
};

export const updateCaseStatus = (id: string, status: SOSCase['status']): void => {
  const sosCase = getCaseById(id);
  if (sosCase) {
    sosCase.status = status;
    sosCase.timeline.push({
      id: Date.now().toString(),
      event: `Status changed to ${status}`,
      timestamp: Date.now(),
    });
    saveCase(sosCase);
  }
};

export const deleteCase = (id: string): void => {
  try {
    const cases = getCases();
    const filteredCases = cases.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredCases));
  } catch (error) {
    console.error('Error deleting case:', error);
  }
};

export const deleteAdminAlert = (id: string): void => {
  try {
    const alerts = getAdminAlerts();
    const filteredAlerts = alerts.filter(a => a.id !== id);
    localStorage.setItem(ADMIN_ALERTS_KEY, JSON.stringify(filteredAlerts));
  } catch (error) {
    console.error('Error deleting admin alert:', error);
  }
};

export const getSessionPin = (): string | null => localStorage.getItem(SESSION_PIN_KEY);
export const setSessionPin = (pin: string): void => localStorage.setItem(SESSION_PIN_KEY, pin);
export const clearSessionPin = (): void => localStorage.removeItem(SESSION_PIN_KEY);

export const getAdmin = (): any | null => {
  const data = localStorage.getItem(ADMIN_KEY);
  return data ? JSON.parse(data) : null;
};
export const saveAdmin = (admin: any): void => localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));

export const isAdminLoggedIn = (): boolean => localStorage.getItem(ADMIN_LOGGED_IN_KEY) === 'true';
export const setAdminLoggedIn = (status: boolean): void => localStorage.setItem(ADMIN_LOGGED_IN_KEY, status.toString());
export const clearAdminSession = (): void => localStorage.removeItem(ADMIN_LOGGED_IN_KEY);

export const isVictimAuthenticated = (): boolean => localStorage.getItem(VICTIM_AUTH_KEY) === 'true';
export const setVictimAuthenticated = (phone: string): void => {
  localStorage.setItem(VICTIM_AUTH_KEY, 'true');
  localStorage.setItem(VICTIM_PHONE_KEY, phone);
};
export const getVictimPhone = (): string | null => localStorage.getItem(VICTIM_PHONE_KEY);
export const clearVictimAuth = (): void => {
  localStorage.removeItem(VICTIM_AUTH_KEY);
  localStorage.removeItem(VICTIM_PHONE_KEY);
};

export const getSafeContacts = (): SafeContact[] => {
  try {
    const data = localStorage.getItem(SAFE_CONTACTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading safe contacts:', error);
    return [];
  }
};

export const saveSafeContact = (contact: SafeContact): void => {
  try {
    const contacts = getSafeContacts();
    const existingIndex = contacts.findIndex(c => c.id === contact.id);

    if (existingIndex >= 0) {
      contacts[existingIndex] = contact;
    } else {
      contacts.push(contact);
    }

    localStorage.setItem(SAFE_CONTACTS_KEY, JSON.stringify(contacts));
  } catch (error) {
    console.error('Error saving safe contact:', error);
  }
};

export const deleteSafeContact = (id: string): void => {
  try {
    const contacts = getSafeContacts();
    const filtered = contacts.filter(c => c.id !== id);
    localStorage.setItem(SAFE_CONTACTS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting safe contact:', error);
  }
};

// Admin Alert Management
const ADMIN_ALERTS_KEY = 'adminAlerts';

export const getAdminAlerts = (): any[] => {
  try {
    const data = localStorage.getItem(ADMIN_ALERTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading admin alerts:', error);
    return [];
  }
};

export const saveAdminAlert = (alert: any): void => {
  try {
    const alerts = getAdminAlerts();
    alerts.unshift(alert); // Add to beginning for newest first
    localStorage.setItem(ADMIN_ALERTS_KEY, JSON.stringify(alerts));
  } catch (error) {
    console.error('Error saving admin alert:', error);
  }
};

export const clearAdminAlerts = (): void => {
  try {
    localStorage.removeItem(ADMIN_ALERTS_KEY);
  } catch (error) {
    console.error('Error clearing admin alerts:', error);
  }
};

// User Profile Management
export interface UserProfile {
  name: string;
  phone: string;
  contactMode: 'SMS' | 'WhatsApp' | 'Email';
  email?: string;
}

export const getUserProfile = (): UserProfile | null => {
  try {
    const data = localStorage.getItem(USER_PROFILE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading user profile:', error);
    return null;
  }
};

export const saveUserProfile = (profile: UserProfile): void => {
  try {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving user profile:', error);
  }
};

export const clearUserProfile = (): void => {
  try {
    localStorage.removeItem(USER_PROFILE_KEY);
  } catch (error) {
    console.error('Error clearing user profile:', error);
  }
};
