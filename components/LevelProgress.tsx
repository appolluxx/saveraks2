import React from 'react';
import { User } from '../types';
import { LEVEL_THRESHOLDS } from '../constants';
import { ChevronRight } from 'lucide-react';

interface LevelProgressProps { user: User; }

const LevelProgress: React.FC<LevelProgressProps> = ({ user }) => {
  const userLvl = user.level || 1;
  const userXp = user.xp || 0;
  const nextLevelXP = LEVEL_THRESHOLDS[userLvl] || 10000;
  const prevLevelXP = LEVEL_THRESHOLDS[userLvl - 1] || 0;
  const progressPercent = Math.min(100, Math.max(0, ((userXp - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100));

  return (
    <div className="bg-surface border border-border rounded-3xl p-6 transition-colors hover:border-white/10 group">
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Tier Status</p>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            Elite Guardian <span className="text-primary">Lvl {userLvl}</span>
          </h3>
        </div>
        <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="space-y-3">
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between font-mono text-[9px] text-slate-500 uppercase font-bold tracking-widest">
          <span>Progress {progressPercent.toFixed(0)}%</span>
          <span>Next: {nextLevelXP} XP</span>
        </div>
      </div>
    </div>
  );
};

export default LevelProgress;