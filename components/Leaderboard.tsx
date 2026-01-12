
import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Crown, Loader2, Users, User as UserIcon } from 'lucide-react';
import { User } from '../types';
import { getLeaderboard } from '../services/api';

const Leaderboard: React.FC = () => {
  const [leaders, setLeaders] = useState<User[]>([]);
  const [classLeaders, setClassLeaders] = useState<{name: string, points: number}[]>([]);
  const [view, setView] = useState<'INDIVIDUAL' | 'CLASS'>('INDIVIDUAL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getLeaderboard();
      setLeaders(data);
      
      // Mock Class Leaderboard Data - In prod, call get_class_leaderboard API
      setClassLeaders([
        { name: 'M.5/1', points: 12500 },
        { name: 'M.6/2', points: 10200 },
        { name: 'M.4/3', points: 8400 },
      ]);
      setLoading(false);
    };
    load();
  }, []);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="text-yellow-500" size={20} />;
    if (index === 1) return <Medal className="text-slate-400" size={20} />;
    if (index === 2) return <Medal className="text-amber-700" size={20} />;
    return <span className="text-[10px] font-black text-slate-600 w-5 text-center">{index + 1}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="glass p-8 rounded-[2.5rem] border-primary/20 relative overflow-hidden">
        <Trophy className="absolute -right-6 top-6 text-primary/10 w-48 h-48 rotate-12" />
        <h3 className="text-3xl font-black text-white leading-none mb-1 uppercase tracking-tighter">Hall of Fame</h3>
        <p className="text-slate-500 text-[10px] uppercase font-black tracking-[0.2em]">Surasakmontree Elite Guardians</p>
      </div>

      <div className="flex glass p-1 rounded-2xl border-white/5">
        <button 
          onClick={() => setView('INDIVIDUAL')}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${view === 'INDIVIDUAL' ? 'bg-primary text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}
        >
          <UserIcon size={14} /> Individual
        </button>
        <button 
          onClick={() => setView('CLASS')}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${view === 'CLASS' ? 'bg-primary text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}
        >
          <Users size={14} /> Class Battle
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-12 space-y-4">
          <Loader2 className="animate-spin text-primary" />
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Syncing Rankings...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {view === 'INDIVIDUAL' ? (
            leaders.map((u, i) => (
              <div key={u.id} className="glass p-5 rounded-3xl flex items-center justify-between border-white/5 hover:border-white/10 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-8 flex justify-center">{getRankIcon(i)}</div>
                  <div>
                    <h4 className="font-black text-white text-sm group-hover:text-primary transition-colors">{u.name}</h4>
                    <p className="text-[9px] text-slate-500 font-mono">{u.schoolId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-white">{(u.points || 0).toLocaleString()}</span>
                  <span className="text-[8px] font-black text-primary ml-1 uppercase">pts</span>
                </div>
              </div>
            ))
          ) : (
            classLeaders.map((c, i) => (
              <div key={c.name} className="glass p-5 rounded-3xl flex items-center justify-between border-primary/5 hover:border-primary/20 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-8 flex justify-center">{getRankIcon(i)}</div>
                  <h4 className="font-black text-white text-base group-hover:text-primary transition-colors">{c.name}</h4>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-white">{c.points.toLocaleString()}</span>
                  <span className="text-[8px] font-black text-primary ml-1 uppercase">Total pts</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
