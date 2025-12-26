
import React, { useState } from 'react';
import { ShoppingBag, Ticket, Star, ChevronRight, X, Sparkles, Check } from 'lucide-react';
import { Reward, User } from '../types';

const MOCK_REWARDS: Reward[] = [
  { id: 'r1', title: 'Late Pass', cost: 500, icon: '🎫', description: 'One-time pass for 15 min late arrival.' },
  { id: 'r2', title: 'Zero-Waste Snack', cost: 150, icon: '🍎', description: 'Fresh organic fruit from school garden.' },
  { id: 'r3', title: 'Library VR Access', cost: 300, icon: '🥽', description: '30 mins of VR Educational session.' },
  { id: 'r4', title: 'Eco-Hero Badge', cost: 1000, icon: '🎖️', description: 'Permanent profile badge + Certificate.' },
];

interface MarketplaceProps {
  user: User;
  onRedeem: (points: number) => void;
}

const Marketplace: React.FC<MarketplaceProps> = ({ user, onRedeem }) => {
  const [selected, setSelected] = useState<Reward | null>(null);
  const [ticketCode, setTicketCode] = useState<string | null>(null);

  const handleRedeem = () => {
    if (!selected) return;
    const code = "SR-" + Math.random().toString(36).substr(2, 6).toUpperCase();
    onRedeem(selected.cost);
    setTicketCode(code);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-4">
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Eco Marketplace</h2>
        <p className="text-slate-500 text-xs font-medium uppercase tracking-[0.2em]">Spend credits on real rewards</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {MOCK_REWARDS.map(reward => (
          <button
            key={reward.id}
            onClick={() => { setSelected(reward); setTicketCode(null); }}
            className="glass p-5 rounded-[2rem] flex items-center justify-between group border-white/5 hover:border-primary/30 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                {reward.icon}
              </div>
              <div>
                <h4 className="font-black text-white">{reward.title}</h4>
                <p className="text-[10px] text-primary font-black uppercase tracking-widest">{reward.cost} Credits</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
              <ChevronRight size={18} />
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="glass fixed bottom-28 left-6 right-6 p-8 rounded-[2.5rem] border-primary/20 animate-in slide-in-from-bottom-6 z-50 shadow-2xl">
          {!ticketCode ? (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-primary uppercase tracking-widest">Confirmation Required</p>
                   <h3 className="text-2xl font-black text-white">{selected.title}</h3>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-500"><X size={24} /></button>
              </div>
              
              <p className="text-sm text-slate-400 leading-relaxed italic">"{selected.description}"</p>
              
              <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                <span className="text-xs font-bold text-slate-400">Your Credits</span>
                <span className="text-lg font-black text-white">{user.points}</span>
              </div>

              <button
                disabled={user.points < selected.cost}
                onClick={handleRedeem}
                className="w-full py-5 bg-primary text-black rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
              >
                {user.points < selected.cost ? 'Insufficient Credits' : `Redeem for ${selected.cost} pts`}
              </button>
            </div>
          ) : (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center text-primary mx-auto">
                <Check size={40} strokeWidth={3} />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-white">Redemption Success</h3>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Present this code to staff</p>
              </div>
              
              <div className="bg-obsidian py-6 rounded-2xl border-2 border-dashed border-primary/40">
                <span className="text-4xl font-black text-white font-mono tracking-widest">{ticketCode}</span>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="w-full py-4 bg-white/5 text-white rounded-xl font-black uppercase text-[10px] tracking-widest border border-white/10"
              >
                Close Ticket
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
