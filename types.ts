export enum ActionType {
  RECYCLE = 'RECYCLE',
  COMMUTE = 'COMMUTE',
  REPORT = 'REPORT',
  GREEN_POINT = 'GREEN_POINT',
  ENERGY_POINT = 'ENERGY_POINT'
}

export interface User {
  id: string;
  name: string;
  xp: number;
  level: number;
  schoolId: string;
}

export interface FeedItem {
  id: string;
  user: string;
  action: ActionType;
  description: string;
  timestamp: Date;
  imageUrl?: string;
  likes: number;
}

export interface MapPin {
  id: string;
  x: number; // percentage
  y: number; // percentage
  type: 'HAZARD' | 'FULL_BIN' | 'MAINTENANCE';
  description: string;
  status: 'OPEN' | 'RESOLVED';
}

export interface GeminiResponse {
  text: string;
  category?: string;
  confidence?: number;
  data?: any;
}
