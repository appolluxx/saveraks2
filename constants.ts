
import { User, FeedItem, ActionType, MapPin } from './types';

// Exported level thresholds for gamification logic
export const LEVEL_THRESHOLDS = [0, 500, 1500, 3000, 5000, 8000, 12000, 20000];

export const MOCK_USER: User = {
  id: 'u123',
  name: 'Student Somchai',
  points: 450,
  schoolId: 'SM-2024-889',
  role: 'STUDENT',
  level: 1,
  xp: 450
};

export const MOCK_LEADERBOARD: User[] = [
  { id: 'u1', name: 'Ploy P.', points: 5240, schoolId: 'SM-2024-001', role: 'STUDENT', level: 5, xp: 5240 },
  { id: 'u2', name: 'Win S.', points: 4890, schoolId: 'SM-2024-045', role: 'STUDENT', level: 4, xp: 4890 },
  { id: 'u3', name: 'Fah A.', points: 4150, schoolId: 'SM-2024-112', role: 'STUDENT', level: 4, xp: 4150 },
  { id: 'u4', name: 'Ken T.', points: 3800, schoolId: 'SM-2024-088', role: 'STUDENT', level: 4, xp: 3800 },
  { id: 'u5', name: 'Beam K.', points: 3200, schoolId: 'SM-2024-231', role: 'STUDENT', level: 4, xp: 3200 },
  { id: 'u6', name: 'Nune R.', points: 2900, schoolId: 'SM-2024-009', role: 'STUDENT', level: 3, xp: 2900 },
  { id: 'u7', name: 'Jay J.', points: 2100, schoolId: 'SM-2024-555', role: 'STUDENT', level: 3, xp: 2100 },
  { id: 'u8', name: 'Mild D.', points: 1850, schoolId: 'SM-2024-321', role: 'STUDENT', level: 3, xp: 1850 },
  { id: 'u9', name: 'Boss W.', points: 1600, schoolId: 'SM-2024-101', role: 'STUDENT', level: 3, xp: 1600 },
  { id: 'u10', name: 'Grace L.', points: 1200, schoolId: 'SM-2024-777', role: 'STUDENT', level: 2, xp: 1200 },
];

export const INITIAL_FEED: FeedItem[] = [
  {
    id: 'f1',
    user: 'Nipa T.',
    action: ActionType.RECYCLE,
    description: 'Recycled 5 plastic bottles at Building 3.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    likes: 12
  },
  {
    id: 'f2',
    user: 'Arthit K.',
    action: ActionType.COMMUTE,
    description: 'Took the BTS to school today! 🚆',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    likes: 24
  },
  {
    id: 'f3',
    user: 'School Admin',
    action: ActionType.REPORT,
    description: 'The broken faucet in the cafeteria has been fixed. Thanks for reporting!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    imageUrl: 'https://picsum.photos/400/200',
    likes: 56
  }
];

export const INITIAL_PINS: MapPin[] = [
  {
    id: 'p1',
    x: 45,
    y: 30,
    type: 'FULL_BIN',
    description: 'Blue bin overflow near library',
    status: 'OPEN'
  },
  {
    id: 'p2',
    x: 70,
    y: 60,
    type: 'HAZARD',
    description: 'Slippery floor in walkway',
    status: 'RESOLVED'
  }
];