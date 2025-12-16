import React from 'react';
import { User } from '../types';
import { LEVEL_THRESHOLDS } from '../constants';
import { Trophy, Star } from 'lucide-react';

interface LevelProgressProps {
  user: User;
}

const LevelProgress: React.FC<LevelProgressProps> = ({ user }) => {
  const nextLevelXP = LEVEL_THRESHOLDS[user.level] || 10000;
  const prevLevelXP = LEVEL_THRESHOLDS[user.level - 1] || 0;
  const progressPercent = Math.min(100, Math.max(0, ((user.xp - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100));

  return (
    <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white p-4 rounded-2xl shadow-lg mb-6 relative overflow-hidden">
      {/* Background Decorative Circles */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
      
      <div className="flex justify-between items-start mb-2 relative z-10">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            {user.name}
          </h2>
          <p className="text-emerald-100 text-xs font-mono">ID: {user.schoolId}</p>
        </div>
        <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg flex items-center gap-1">
          <Trophy size={16} className="text-yellow-300" />
          <span className="font-bold text-sm">Lvl {user.level}</span>
        </div>
      </div>

      <div className="relative z-10 mt-4">
        <div className="flex justify-between text-xs mb-1 font-medium text-emerald-50">
          <span>{user.xp} XP</span>
          <span>{nextLevelXP} XP</span>
        </div>
        <div className="h-3 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
          <div 
            className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 transition-all duration-1000 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-[10px] text-right mt-1 text-emerald-100">
          {(nextLevelXP - user.xp)} XP to next level
        </p>
      </div>
    </div>
  );
};

export default LevelProgress;