
import { ActionType, User, UserRole, SchoolStats } from "../types";
import { LEVEL_THRESHOLDS } from "../constants";

// PROD API URL (Replace with your actual deployed GAS Web App URL)
const API_URL = "https://script.google.com/macros/s/AKfycbxQ3_TNCBnLhSmsBfuiL86yPfxRC6LeWlcLQKOADYhmP72x4bTMQjTD2Mtr5jOzZkN3uw/exec";

const apiCall = async (payload: any) => {
  if (!API_URL) {
    console.error("API_URL is not configured.");
    return null;
  }
  
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    const text = await response.text();
    if (!text || text === "undefined" || text.trim() === "") return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("API Connectivity Error:", error);
    return null;
  }
};

/**
 * Image compression utility for Google Apps Script payload limits
 */
export const compressImage = async (base64Str: string, maxWidth = 800, maxHeight = 800): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = `data:image/jpeg;base64,${base64Str}`;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7).split(',')[1]);
    };
  });
};

export const loginUser = async (schoolId: string): Promise<User> => {
  // First check local storage for session
  const stored = localStorage.getItem('saveraks_user');
  if (stored && stored !== "undefined") {
    try {
      const user = JSON.parse(stored);
      if (user && user.schoolId === schoolId) return user;
    } catch (e) {
      localStorage.removeItem('saveraks_user');
    }
  }

  const result = await apiCall({ action: 'LOGIN', schoolId });

  if (!result || !result.user) {
    // Fallback if GAS is not yet deployed or returning error
    const isAdmin = schoolId.toUpperCase().startsWith('ADMIN-');
    const mockUser: User = { 
      id: isAdmin ? 'admin-id' : 'demo-id', 
      name: isAdmin ? 'School Administrator' : 'Demo Student', 
      points: 0, 
      schoolId,
      role: isAdmin ? 'ADMIN' : 'STUDENT',
      level: 1,
      xp: 0
    };
    localStorage.setItem('saveraks_user', JSON.stringify(mockUser));
    return mockUser;
  }
  
  localStorage.setItem('saveraks_user', JSON.stringify(result.user));
  return result.user;
};

export const registerUser = async (name: string, schoolId: string): Promise<User> => {
  const result = await apiCall({ action: 'REGISTER', name, schoolId });
  
  if (!result || !result.user) {
    const isAdmin = schoolId.toUpperCase().startsWith('ADMIN-');
    const mockUser: User = { 
      id: Math.random().toString(36).substr(2, 9), 
      name, points: 0, schoolId,
      role: isAdmin ? 'ADMIN' : 'STUDENT',
      level: 1,
      xp: 0
    };
    localStorage.setItem('saveraks_user', JSON.stringify(mockUser));
    return mockUser;
  }
  
  localStorage.setItem('saveraks_user', JSON.stringify(result.user));
  return result.user;
};

export const getUserProfile = async (): Promise<User | null> => {
  const data = localStorage.getItem('saveraks_user');
  if (!data || data === "undefined") return null;
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
};

export const logoutUser = () => localStorage.removeItem('saveraks_user');

export const getLeaderboard = async (): Promise<User[]> => {
  const result = await apiCall({ action: 'GET_LEADERBOARD' });
  return result?.leaders || [];
};

export const getSchoolStats = async (): Promise<SchoolStats> => {
  const result = await apiCall({ action: 'GET_ADMIN_STATS' });
  return result || {
    totalStudents: 0,
    totalPoints: 0,
    pendingReports: 0,
    carbonSaved: 0
  };
};

/**
 * Updates both points and XP, and re-calculates level based on thresholds.
 */
export const updateUserPoints = async (amount: number) => {
  const user = await getUserProfile();
  if (user) {
    user.points = (user.points ?? 0) + amount;
    user.xp = (user.xp ?? 0) + amount;
    
    // Calculate new level based on LEVEL_THRESHOLDS
    let newLevel = 1;
    for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
      if (user.xp >= LEVEL_THRESHOLDS[i]) {
        newLevel = i + 1;
      } else {
        break;
      }
    }
    user.level = newLevel;
    
    localStorage.setItem('saveraks_user', JSON.stringify(user));
  }
};

export const logActivity = async (action: ActionType, details: any) => {
  const user = await getUserProfile();
  if (!user) return;

  const payload = {
    action: 'LOG_ACTIVITY',
    userId: user.id,
    category: details.category || action.toLowerCase(),
    label: details.label || 'Activity',
    points: details.points || 0,
    fileBase64: details.fileBase64 || null,
    mimeType: details.mimeType || 'image/jpeg',
    aiData: JSON.stringify(details.aiData || {})
  };

  const result = await apiCall(payload);
  
  // Update local points if successful
  if (result && result.newTotalPoints !== undefined) {
    user.points = result.newTotalPoints;
    
    // Also update XP and level based on the new points total to keep UI in sync
    user.xp = user.points; 
    let newLevel = 1;
    for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
      if (user.xp >= LEVEL_THRESHOLDS[i]) {
        newLevel = i + 1;
      } else {
        break;
      }
    }
    user.level = newLevel;
    
    localStorage.setItem('saveraks_user', JSON.stringify(user));
  }
};
