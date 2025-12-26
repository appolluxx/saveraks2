import React from 'react';
import { User } from '../types';
import { Target } from 'lucide-react';

interface PointsSummaryProps {
  user: User;
}

const PointsSummary: React.FC<PointsSummaryProps> = ({ user }) => {
  return (
    <div className="glass rounded-[2rem] p-8 border border-white/5 relative overflow-hidden group">
      {/* Decorative Gradient Overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] -mr-10 -mt-10 group-hover:bg-primary/30 transition-all duration-700"></div>
      
      <div className="relative z-10 space-y-4">
        <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Current Balance</span>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/10">
              <Target size={12} className="text-primary" />
              <span className="text-[10px] font-bold text-slate-400">ECO-CREDITS</span>
            </div>
        </div>

        <div className="flex items-baseline gap-2">
          <h2 className="text-7xl font-black tracking-tighter text-white">
            {(user.points ?? 0).toLocaleString()}
          </h2>
          <span className="text-primary font-black text-sm uppercase tracking-widest">pts</span>
        </div>

        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
           <div className="flex -space-x-2">
             {[1,2,3].map(i => (
               <div key={i} className="w-6 h-6 rounded-full border-2 border-obsidian bg-surface text-[8px] flex items-center justify-center text-slate-500">
                 {i}
               </div>
             ))}
           </div>
           <p className="text-[10px] font-medium text-slate-500 italic">Contributing to Surasakmontree sustainability</p>
        </div>
      </div>
    </div>
  );
};

export default PointsSummary;