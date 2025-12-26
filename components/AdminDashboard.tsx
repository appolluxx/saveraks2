
import React, { useEffect, useState } from 'react';
import { ShieldCheck, Users, AlertCircle, TreeDeciduous, ArrowUpRight, CheckCircle2, FileText, Loader2, Smartphone, MessageSquare, Zap, Send } from 'lucide-react';
import { getSchoolStats, getLeaderboard } from '../services/api';
import { SchoolStats, User } from '../types';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<SchoolStats | null>(null);
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [lineStatus, setLineStatus] = useState('ACTIVE');

  useEffect(() => {
    const fetchData = async () => {
      const [s, u] = await Promise.all([getSchoolStats(), getLeaderboard()]);
      setStats(s);
      setTopUsers(u.slice(0, 5));
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
    </div>
  );

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
        <ShieldCheck className="absolute -right-4 -bottom-4 w-32 h-32 text-emerald-500/10" />
        <h2 className="text-2xl font-black mb-1">Admin Console</h2>
        <p className="text-slate-400 text-xs font-mono uppercase tracking-widest">Surasakmontree Eco-Control</p>
        
        <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 flex flex-col items-center">
                <Users className="text-blue-400 mb-2" size={20} />
                <div className="text-2xl font-black">{stats?.totalStudents || 0}</div>
                <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Students</div>
            </div>
            <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 flex flex-col items-center">
                <AlertCircle className="text-rose-400 mb-2" size={20} />
                <div className="text-2xl font-black">{stats?.pendingReports || 0}</div>
                <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Hazards</div>
            </div>
        </div>
      </div>

      {/* LINE Messaging API Configuration Card */}
      <div className="glass p-6 rounded-3xl border border-white/10 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MessageSquare className="text-emerald-500" size={20} />
            <h4 className="text-sm font-black text-white uppercase tracking-widest">LINE Messaging Gateway</h4>
          </div>
          <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-lg border border-emerald-500/20">
            {lineStatus}
          </span>
        </div>
        
        <div className="bg-obsidian/50 p-4 rounded-2xl border border-white/5 space-y-2">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Webhook Dispatcher</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Send size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-tight">Messaging API Push</p>
              <p className="text-[9px] text-slate-500 uppercase tracking-tighter">Endpoint: api.line.me/v2/bot</p>
            </div>
          </div>
        </div>

        <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 transition-all">
          Send Test Push Message
        </button>
      </div>

      <div className="bg-emerald-600 p-6 rounded-3xl shadow-lg flex items-center justify-between text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-white/5 opacity-10 pointer-events-none"></div>
        <div className="relative z-10">
            <p className="text-emerald-100 text-xs font-black uppercase tracking-wider mb-1">Global Impact</p>
            <h3 className="text-3xl font-black">{(stats?.totalPoints || 0).toLocaleString()} <span className="text-sm font-normal">Points</span></h3>
            <p className="text-emerald-200 text-[10px] mt-1 italic">School-wide sustainability score</p>
        </div>
        <div className="bg-white/20 p-4 rounded-3xl relative z-10 backdrop-blur-sm shadow-inner">
            <TreeDeciduous size={40} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
            <h4 className="font-bold text-gray-800 dark:text-slate-100">Validation Queue</h4>
            <button className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase">View All</button>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-4 group transition-all">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-xl text-amber-600 dark:text-amber-400">
                <FileText size={24} />
            </div>
            <div className="flex-1">
                <h5 className="text-sm font-bold text-gray-800 dark:text-slate-100">Pending Evidence</h5>
                <p className="text-[10px] text-gray-500 italic">Bills & Videos for verification</p>
            </div>
            <button className="p-2 bg-gray-50 dark:bg-slate-900 rounded-lg group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
                <ArrowUpRight size={18} className="text-gray-400" />
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm transition-colors">
        <h4 className="font-bold text-gray-800 dark:text-slate-100 mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-600" /> Top Performers
        </h4>
        <div className="space-y-6">
            {topUsers.length > 0 ? topUsers.map((u, i) => (
                <div key={u.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-gray-400 w-4">{i+1}</span>
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-sm transition-transform group-hover:scale-110">
                            {u.name.charAt(0)}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-800 dark:text-slate-100">{u.name}</p>
                            <p className="text-[9px] text-gray-400 font-mono tracking-tighter">{u.schoolId}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">{(u.points || 0).toLocaleString()} PTS</p>
                    </div>
                </div>
            )) : (
                <p className="text-xs text-center text-gray-400 py-4 italic">No rankings available yet.</p>
            )}
        </div>
      </div>

      <button className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
        <FileText size={18} /> Download School Impact Report
      </button>
    </div>
  );
};

const TrendingUp = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
    </svg>
);

export default AdminDashboard;
