
export enum ActionType {
  RECYCLE = 'RECYCLE',
  COMMUTE = 'COMMUTE',
  REPORT = 'REPORT',
  GREEN_POINT = 'GREEN_POINT',
  ENERGY_POINT = 'ENERGY_POINT',
  GREASE_TRAP = 'GREASE_TRAP',
  HAZARD_SCAN = 'HAZARD_SCAN',
  REDEMPTION = 'REDEMPTION'
}

export type UserRole = 'STUDENT' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  points: number;
  schoolId: string;
  classRoom?: string; // New: For Class Battles
  role: UserRole;
  level?: number;
  xp?: number;
}

export interface Reward {
  id: string;
  title: string;
  cost: number;
  icon: string;
  description: string;
}

export interface ScanResult {
  category: 'waste' | 'grease_trap' | 'hazard' | 'unknown';
  label: string;
  bin_color?: 'Yellow' | 'Green' | 'Red' | 'Blue';
  upcycling_tip?: string;
  maintenance_status?: 'clean' | 'dirty';
  risk_level?: 'Red' | 'Orange' | 'Green';
  point_reward: number;
  carbon_saved?: number;
}

export interface MapPin {
  id: string;
  x: number;
  y: number;
  type: 'HAZARD' | 'FULL_BIN' | 'MAINTENANCE';
  description: string;
  status: 'OPEN' | 'RESOLVED';
}

export interface SchoolStats {
  totalStudents: number;
  totalPoints: number;
  pendingReports: number;
  carbonSaved: number;
}

// Added missing FeedItem interface export to support constants.ts
export interface FeedItem {
  id: string;
  user: string;
  action: ActionType;
  description: string;
  timestamp: Date;
  likes: number;
  imageUrl?: string;
}
