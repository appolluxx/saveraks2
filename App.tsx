
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PointsSummary from './components/PointsSummary';
import LevelProgress from './components/LevelProgress';
import EcoScanner from './components/RecycleScanner';
import IssueReporter from './components/IssueReporter';
import ActionLogger from './components/ActionLogger';
import Feed from './components/Feed';
import Leaderboard from './components/Leaderboard';
import Marketplace from './components/Marketplace';
import LoginScreen from './components/LoginScreen';
import AdminDashboard from './components/AdminDashboard';
import Logo from './components/Logo';
import { getUserProfile, logoutUser, updateUserPoints } from './services/api';
import { User } from './types';
import { LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const data = await getUserProfile();
      setUser(data);
      if (data?.role === 'ADMIN') setCurrentTab('admin');
      setLoading(false);
    };
    loadUser();
  }, []);

  const refreshUser = async () => {
    const data = await getUserProfile();
    setUser(data);
  };

  const handleRedeem = async (cost: number) => {
    await updateUserPoints(-cost);
    refreshUser();
  };

  const handleLogout = () => {
    logoutUser(); 
    setUser(null); 
    setCurrentTab('home');
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-obsidian">
      <div className="w-12 h-12 border-2 border-primary/20 rounded-full border-t-primary animate-spin"></div>
    </div>
  );

  if (!user) return <LoginScreen onLoginSuccess={setUser} />;

  return (
    <div className="min-h-screen bg-obsidian text-slate-100 font-sans pb-32 overflow-x-hidden">
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10"></div>
      
      <header className="sticky top-0 glass z-50 px-6 py-4 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <h1 className="text-xl font-black tracking-tight text-white uppercase italic">SaveRaks</h1>
        </div>
        <div className="flex items-center gap-3">
            <button 
              onClick={handleLogout} 
              className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5 active:scale-90"
            >
              <LogOut size={20} />
            </button>
            <div className="w-10 h-10 rounded-xl bg-surface border border-border overflow-hidden ring-1 ring-white/5">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                  alt="avatar" 
                  className="w-full h-full object-cover"
                />
            </div>
        </div>
      </header>

      <main className="px-6 pt-8 max-w-xl mx-auto space-y-8">
        {user.role !== 'ADMIN' && currentTab !== 'market' && (
          <div className="space-y-4">
            <PointsSummary user={user} />
            <LevelProgress user={user} />
          </div>
        )}
        
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {currentTab === 'home' && <Feed />}
          {currentTab === 'recycle' && <EcoScanner onActivityLogged={refreshUser} />}
          {currentTab === 'actions' && <ActionLogger onActivityLogged={refreshUser} />}
          {currentTab === 'map' && <IssueReporter onActivityLogged={refreshUser} />}
          {currentTab === 'leaderboard' && <Leaderboard />}
          {currentTab === 'market' && <Marketplace user={user} onRedeem={handleRedeem} />}
          {currentTab === 'admin' && user.role === 'ADMIN' && <AdminDashboard />}
        </section>
      </main>

      <Navbar currentTab={currentTab} setTab={setCurrentTab} isDarkMode={true} toggleDarkMode={() => {}} userRole={user.role} />
    </div>
  );
};

export default App;
