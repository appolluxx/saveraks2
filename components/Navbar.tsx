import React from 'react';
import { Home, Camera, Map, Leaf, Trophy } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setTab: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentTab, setTab }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Feed' },
    { id: 'recycle', icon: Camera, label: 'Recycle' },
    { id: 'actions', icon: Leaf, label: 'Actions' },
    { id: 'map', icon: Map, label: 'Report' },
    { id: 'leaderboard', icon: Trophy, label: 'Rank' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 pb-5 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex flex-col items-center space-y-1 transition-all duration-200 min-w-[50px] ${
                isActive ? 'text-emerald-600 -translate-y-1' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={isActive ? 26 : 22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;