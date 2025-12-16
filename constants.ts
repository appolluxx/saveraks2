import { User, FeedItem, ActionType, MapPin } from './types';

export const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2500, 5000];

export const MOCK_USER: User = {
  id: 'u123',
  name: 'Student Somchai',
  xp: 450,
  level: 3,
  schoolId: 'SM-2024-889'
};

export const MOCK_LEADERBOARD: User[] = [
  { id: 'u1', name: 'Ploy P.', xp: 5240, level: 8, schoolId: 'SM-2024-001' },
  { id: 'u2', name: 'Win S.', xp: 4890, level: 7, schoolId: 'SM-2024-045' },
  { id: 'u3', name: 'Fah A.', xp: 4150, level: 7, schoolId: 'SM-2024-112' },
  { id: 'u4', name: 'Ken T.', xp: 3800, level: 6, schoolId: 'SM-2024-088' },
  { id: 'u5', name: 'Beam K.', xp: 3200, level: 6, schoolId: 'SM-2024-231' },
  { id: 'u6', name: 'Nune R.', xp: 2900, level: 6, schoolId: 'SM-2024-009' },
  { id: 'u7', name: 'Jay J.', xp: 2100, level: 5, schoolId: 'SM-2024-555' },
  { id: 'u8', name: 'Mild D.', xp: 1850, level: 5, schoolId: 'SM-2024-321' },
  { id: 'u9', name: 'Boss W.', xp: 1600, level: 5, schoolId: 'SM-2024-101' },
  { id: 'u10', name: 'Grace L.', xp: 1200, level: 4, schoolId: 'SM-2024-777' },
];

export const INITIAL_FEED: FeedItem[] = [
  {
    id: 'f1',
    user: 'Nipa T.',
    action: ActionType.RECYCLE,
    description: 'Recycled 5 plastic bottles at Building 3.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    likes: 12
  },
  {
    id: 'f2',
    user: 'Arthit K.',
    action: ActionType.COMMUTE,
    description: 'Took the BTS to school today! 🚆',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
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