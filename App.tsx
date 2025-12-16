import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LevelProgress from './components/LevelProgress';
import RecycleScanner from './components/RecycleScanner';
import IssueReporter from './components/IssueReporter';
import ActionLogger from './components/ActionLogger';
import Feed from './components/Feed';
import Leaderboard from './components/Leaderboard';
import LoginScreen from './components/LoginScreen';
import { getUserProfile, logoutUser } from './services/mockBackend';
import { User } from './types';
import { LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load user data on mount
  useEffect(() => {
    const loadUser = async () => {
      const data = await getUserProfile();
      setUser(data);
      setLoading(false);
    };
    loadUser();
  }, []);

  const refreshUser = async () => {
    const data = await getUserProfile();
    setUser(data);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  const handleLogout = () => {
    logoutUser(); // Clear storage
    setUser(null); // Clear state immediately to show LoginScreen
  };

  if (loading) return null; // Or a loading spinner

  if (!user) {
    return <LoginScreen onLoginSuccess={setUser} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 font-sans pb-20">
      {/* Sticky Top Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md z-40 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <h1 className="text-2xl font-black text-emerald-600 tracking-tight flex items-center gap-2">
          SaveRaks
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </h1>
        <div className="flex items-center gap-3">
            <button 
              type="button" 
              onClick={handleLogout} 
              className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-gray-100"
              title="Logout"
            >
                <LogOut size={20} />
            </button>
            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="avatar" />
            </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="px-4 pt-6 max-w-md mx-auto">
        <LevelProgress user={user} />
        
        {/* XP Gain Notification Overlay */}
        {showConfetti && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 px-6 py-2 rounded-full font-bold shadow-xl z-50 animate-bounce">
            XP Updated! ⭐
          </div>
        )}

        <div className="min-h-[60vh]">
          {currentTab === 'home' && <Feed />}
          
          {currentTab === 'recycle' && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <RecycleScanner onActivityLogged={refreshUser} />
            </div>
          )}
          
          {currentTab === 'actions' && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <ActionLogger onActivityLogged={refreshUser} />
            </div>
          )}
          
          {currentTab === 'map' && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <IssueReporter onActivityLogged={refreshUser} />
            </div>
          )}

          {currentTab === 'leaderboard' && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <Leaderboard />
            </div>
          )}
        </div>
      </main>

      <Navbar currentTab={currentTab} setTab={setCurrentTab} />
    </div>
  );
};

export default App;