import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Crown, Loader2 } from 'lucide-react';
import { User } from '../types';
import { getLeaderboard } from '../services/mockBackend';

const Leaderboard: React.FC = () => {
  const [leaders, setLeaders] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard().then(data => {
      setLeaders(data);
      setLoading(false);
    });
  }, []);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="text-yellow-500 fill-yellow-500" size={24} />;
      case 1: return <Medal className="text-gray-400 fill-gray-400" size={24} />;
      case 2: return <Medal className="text-amber-700 fill-amber-700" size={24} />;
      default: return <span className="font-bold text-gray-400 w-6 text-center">{index + 1}</span>;
    }
  };

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0: return "bg-gradient-to-r from-yellow-50 to-white border-yellow-200 ring-1 ring-yellow-100";
      case 1: return "bg-gradient-to-r from-gray-50 to-white border-gray-200";
      case 2: return "bg-gradient-to-r from-orange-50 to-white border-orange-200";
      default: return "bg-white border-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-emerald-600">
        <Loader2 size={40} className="animate-spin mb-4" />
        <p className="font-medium">Loading Ranks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      <div className="bg-emerald-600 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden mb-6">
        <Trophy className="absolute right-4 top-4 text-emerald-500/30 w-32 h-32 rotate-12" />
        <h3 className="text-2xl font-black relative z-10">Leaderboard</h3>
        <p className="text-emerald-100 text-sm relative z-10">Top 10 Eco-Warriors of the Month</p>
      </div>

      <div className="space-y-3">
        {leaders.map((user, index) => (
          <div 
            key={user.id} 
            className={`flex items-center p-4 rounded-2xl shadow-sm border transition-transform hover:scale-[1.02] ${getRankStyle(index)}`}
          >
            <div className="flex items-center justify-center w-10 h-10 mr-3">
              {getRankIcon(index)}
            </div>
            
            <div className="flex-shrink-0 mr-3">
               <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="avatar" />
               </div>
            </div>

            <div className="flex-grow">
              <h4 className="font-bold text-gray-800 text-sm">{user.name}</h4>
              <p className="text-[10px] text-gray-400 font-mono">{user.schoolId}</p>
            </div>

            <div className="text-right">
              <div className="font-black text-emerald-600 text-sm">{user.xp.toLocaleString()} XP</div>
              <div className="text-[10px] text-emerald-400 font-medium">Lvl {user.level}</div>
            </div>
          </div>
        ))}
      </div>
      
      <p className="text-center text-xs text-gray-400 mt-6">
        Keep recycling to climb the ranks! 🚀
      </p>
    </div>
  );
};

export default Leaderboard;