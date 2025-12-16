import { ActionType, User } from "../types";
import { MOCK_LEADERBOARD } from "../constants";

// ============================================================================
// ⚠️ IMPORTANT: PASTE YOUR WEB APP URL INSIDE THE QUOTES BELOW
// 1. In Google Sheet -> Extensions -> Apps Script -> Deploy -> New Deployment
// 2. Select "Web App".
// 3. SET "WHO HAS ACCESS" TO "ANYONE". (This is Critical!)
// 4. Copy the URL ending in '/exec' and paste it below.
// ============================================================================
const API_URL: string = "https://script.google.com/macros/s/AKfycbxQ3_TNCBnLhSmsBfuiL86yPfxRC6LeWlcLQKOADYhmP72x4bTMQjTD2Mtr5jOzZkN3uw/exec"; 
// Example: "https://script.google.com/macros/s/AKfycb.../exec"

// Circuit breaker: If the database is misconfigured (missing tabs), we switch to offline mode automatically
let isDatabaseBroken = false;

/**
 * Generic Helper for sending data to Google Apps Script
 */
const apiCall = async (payload: any) => {
  // If no URL is set, or we detected a broken DB previously, return null to trigger mock fallback
  if (!API_URL || API_URL === "" || isDatabaseBroken) {
    if (!isDatabaseBroken && !API_URL) console.warn("⚠️ API URL IS MISSING. Running in Offline Mock Mode.");
    return null; 
  }

  console.log("📤 Sending to Google Sheet:", payload.action, payload);

  try {
    // We use 'text/plain' to prevent the browser from sending a CORS Preflight (OPTIONS) request
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });
    
    const text = await response.text();
    console.log("📥 Response from Google Sheet:", text);

    try {
        const data = JSON.parse(text);
        if (data.status === 'error') {
            throw new Error(data.message);
        }
        return data;
    } catch (e: any) {
        // CRITICAL FIX: Detect missing tabs and switch to Offline Mode gracefully
        if (text.includes("getDataRange") || text.includes("Users")) {
             console.error("🔥 DATABASE ERROR: Missing Tabs in Google Sheet.");
             isDatabaseBroken = true;
             alert("⚠️ Database Configuration Error\n\nYour Google Sheet is missing the 'Users' or 'Logs' tabs.\n\nSwitching to Offline Demo Mode so you can continue testing.");
             return null; // Triggers fallback in calling function
        }
        
        if (text.includes("script.google.com")) {
             throw new Error("Access Error: Make sure your Script Deployment is set to 'Anyone', not 'Only Myself'.");
        }
        throw new Error(e.message || "Database connection failed.");
    }
  } catch (error: any) {
    console.error("API Error:", error);
    // If it's the database error we just caught, don't re-throw, return null
    if (isDatabaseBroken) return null;
    throw new Error(error.message || "Network error");
  }
};

// --- AUTHENTICATION ---

export const loginUser = async (schoolId: string): Promise<User> => {
  // Check for saved user first
  const stored = localStorage.getItem('saveraks_user');
  if (stored) {
    const user = JSON.parse(stored);
    if (user.schoolId === schoolId) return user;
  }

  // Try API Call
  let result = await apiCall({ action: 'LOGIN', schoolId });

  // FALLBACK: If API is missing (result null) or Database is Broken
  if (!result) {
    console.log("Using Mock Login (Offline Mode)");
    // Return a mock user so the app works
    return { id: 'mock', name: 'Demo Student', xp: 100, level: 1, schoolId };
  }

  if (result.status === 'success') {
    localStorage.setItem('saveraks_user', JSON.stringify(result.user));
    return result.user;
  }
  
  throw new Error(result.message || 'Login failed');
};

export const registerUser = async (name: string, schoolId: string): Promise<User> => {
  // Try API Call
  let result = await apiCall({ action: 'REGISTER', name, schoolId });

  // FALLBACK: If API is missing or Broken
  if (!result) {
    console.log("Using Mock Register (Offline Mode)");
    const mockUser = { id: 'new', name, xp: 0, level: 1, schoolId };
    localStorage.setItem('saveraks_user', JSON.stringify(mockUser));
    return mockUser;
  }

  if (result.status === 'success') {
    localStorage.setItem('saveraks_user', JSON.stringify(result.user));
    return result.user;
  }
  throw new Error(result.message || 'Registration failed');
};

export const logoutUser = () => {
  localStorage.removeItem('saveraks_user');
  // Removed window.location.reload() to allow React to handle state updates gracefully
};

// --- DATA FETCHING ---

export const getUserProfile = async (): Promise<User | null> => {
  const stored = localStorage.getItem('saveraks_user');
  return stored ? JSON.parse(stored) : null;
};

export const getLeaderboard = async (): Promise<User[]> => {
  const result = await apiCall({ action: 'GET_LEADERBOARD' });
  
  // Fallback to mock if API fails/offline
  if (!result || !Array.isArray(result)) {
      return MOCK_LEADERBOARD;
  }
  return result;
};

export const updateUserXP = async (amount: number): Promise<void> => {
  // Optimistic local update
  const stored = localStorage.getItem('saveraks_user');
  if (stored) {
    const user = JSON.parse(stored);
    user.xp += amount;
    // Simple level calc logic for UI immediate update
    if (user.xp > 100) user.level = 2;
    if (user.xp > 300) user.level = 3;
    if (user.xp > 600) user.level = 4;
    localStorage.setItem('saveraks_user', JSON.stringify(user));
  }
};

export const uploadToDrive = async (file: File, folder: 'GREEN' | 'ENERGY'): Promise<string> => {
   return "pending_upload";
};

export const logActivity = async (action: ActionType, details: any) => {
  const user = await getUserProfile();
  if (!user) return;

  const payload: any = {
    action: 'LOG_ACTIVITY',
    userId: user.id,
    type: action,
    description: details.description || action,
    xp: details.xp || 10, 
    aiData: details, 
  };
  
  if (details.fileBase64) {
      payload.fileBase64 = details.fileBase64;
      payload.mimeType = details.mimeType;
      payload.fileName = details.fileName;
  }

  // We don't need to await the result for logic flow, but we await to catch DB errors if they happen here
  await apiCall(payload);
};