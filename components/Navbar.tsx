
import React from 'react';
import { Home, Camera, Map, Leaf, Trophy, ShieldCheck, ShoppingBag } from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  userRole?: UserRole;
}

const Navbar: React.FC<NavbarProps> = ({ currentTab, setTab, userRole }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Feed' },
    { id: 'recycle', icon: Camera, label: 'Scan' },
    { id: 'market', icon: ShoppingBag, label: 'Shop' }, // New: Marketplace
    { id: 'map', icon: Map, label: 'Map' },
    { id: 'leaderboard', icon: Trophy, label: 'Rank' },
  ];

  if (userRole === 'ADMIN') {
    navItems.push({ id: 'admin', icon: ShieldCheck, label: 'Admin' });
  }

  return (
    <div className="fixed bottom-8 left-0 right-0 z-50 px-6 pointer-events-none">
      <nav className="max-w-md mx-auto glass rounded-[2.5rem] p-2 flex justify-between items-center shadow-2xl pointer-events-auto border border-white/10 overflow-hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                isActive 
                ? 'bg-primary text-black shadow-primary/30 shadow-xl scale-110' 
                : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Navbar;
