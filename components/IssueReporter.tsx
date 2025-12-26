import React, { useState } from 'react';
import { MapPin, Check, AlertCircle, X, Info, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { INITIAL_PINS } from '../constants';
import { MapPin as PinType } from '../types';
import { updateUserPoints, logActivity } from '../services/api';
import { ActionType } from '../types';

interface IssueReporterProps {
    onActivityLogged: () => void;
}

const IssueReporter: React.FC<IssueReporterProps> = ({ onActivityLogged }) => {
  const [pins, setPins] = useState<PinType[]>(INITIAL_PINS);
  const [newPin, setNewPin] = useState<{x: number, y: number} | null>(null);
  const [selectedPin, setSelectedPin] = useState<PinType | null>(null);
  const [description, setDescription] = useState('');
  const [type, setType] = useState<PinType['type']>('FULL_BIN');
  const [submitting, setSubmitting] = useState(false);
  
  const [mapSrc, setMapSrc] = useState('map.jpg');
  const [imageError, setImageError] = useState(false);

  const FALLBACK_MAP = "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1000&auto=format&fit=crop";

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If we're clicking the map, clear any selected pin
    if (selectedPin) {
      setSelectedPin(null);
      return;
    }
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setNewPin({ x, y });
  };

  const handlePinClick = (e: React.MouseEvent, pin: PinType) => {
    e.stopPropagation(); // Prevent map click handler from triggering
    setSelectedPin(pin);
    setNewPin(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin) return;
    
    setSubmitting(true);
    
    const pin: PinType = {
      id: Date.now().toString(),
      x: newPin.x,
      y: newPin.y,
      type,
      description,
      status: 'OPEN'
    };

    await logActivity(ActionType.REPORT, {
      category: 'map_report',
      label: `New Report: ${type}`,
      points: 30,
      description: description
    });
    
    await updateUserPoints(30);
    
    setPins([...pins, pin]);
    setNewPin(null);
    setDescription('');
    setSubmitting(false);
    onActivityLogged();
  };

  const handleResolve = async (pinId: string) => {
    setSubmitting(true);
    
    // Simulate API update
    await logActivity(ActionType.REPORT, {
      category: 'map_resolve',
      label: `Resolved Report: ${pinId}`,
      points: 20,
      description: 'Marked as resolved'
    });

    setPins(prev => prev.map(p => p.id === pinId ? { ...p, status: 'RESOLVED' } : p));
    setSelectedPin(null);
    setSubmitting(false);
    onActivityLogged();
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-4">
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Eco-Safety Map</h2>
        <p className="text-slate-500 text-xs font-medium uppercase tracking-[0.2em]">Live Campus Hazard Monitoring</p>
      </div>

      <div className="glass rounded-[2.5rem] p-3 border border-white/10 relative overflow-hidden transition-all">
        <div 
          className="relative w-full aspect-[4/3] bg-obsidian rounded-[2rem] overflow-hidden cursor-crosshair group"
          onClick={handleMapClick}
        >
          <img 
            src={mapSrc} 
            onError={() => {
                setImageError(true);
                setMapSrc(FALLBACK_MAP);
            }}
            alt="School Map" 
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700 grayscale-[0.3]" 
          />

          {/* Grid Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          
          {/* Existing Pins */}
          {pins.map(pin => (
            <button 
              key={pin.id}
              onClick={(e) => handlePinClick(e, pin)}
              className={`absolute w-8 h-8 -ml-4 -mt-8 transform transition-all hover:scale-125 duration-300 flex items-center justify-center ${
                pin.status === 'RESOLVED' 
                ? 'text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]' 
                : pin.type === 'HAZARD' ? 'text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'text-primary drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]'
              }`}
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            >
              {pin.status === 'RESOLVED' ? <CheckCircle2 size={24} strokeWidth={2.5} /> : <MapPin fill="currentColor" size={24} />}
            </button>
          ))}

          {/* New Pin Draft */}
          {newPin && (
            <div 
              className="absolute w-10 h-10 -ml-5 -mt-10 text-white animate-bounce pointer-events-none flex items-center justify-center"
              style={{ left: `${newPin.x}%`, top: `${newPin.y}%` }}
            >
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
              <MapPin fill="currentColor" size={32} className="relative z-10" />
            </div>
          )}
        </div>

        {imageError && (
          <div className="mt-4 px-4 py-2 bg-white/5 text-slate-400 text-[10px] rounded-full flex items-center gap-2 mx-auto w-fit border border-white/5">
            <AlertCircle size={12} />
            <span>Using satellite reference. Campus layout initialized.</span>
          </div>
        )}
      </div>

      {/* Detail Overlay for Selected Pin */}
      {selectedPin && (
        <div className="glass p-6 rounded-[2rem] border border-white/10 animate-in slide-in-from-bottom-6 fixed bottom-28 left-6 right-6 z-50 shadow-2xl">
          <button onClick={() => setSelectedPin(null)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedPin.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'}`}>
              {selectedPin.status === 'RESOLVED' ? <Check size={24} /> : <Info size={24} />}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{selectedPin.type.replace('_', ' ')}</p>
              <h4 className="text-lg font-black text-white">{selectedPin.status === 'RESOLVED' ? 'Verified & Resolved' : 'Active Issue'}</h4>
            </div>
          </div>

          <p className="text-sm text-slate-300 mb-6 leading-relaxed bg-white/5 p-4 rounded-xl italic">"{selectedPin.description}"</p>

          <div className="flex gap-3">
            {selectedPin.status === 'OPEN' && (
              <button
                onClick={() => handleResolve(selectedPin.id)}
                disabled={submitting}
                className="flex-1 py-4 bg-primary text-black rounded-xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2 active:scale-95 transition-all glow-emerald"
              >
                {submitting ? 'Updating...' : <><Check size={16} /> Mark as Fixed</>}
              </button>
            )}
            <button
              onClick={() => setSelectedPin(null)}
              className="flex-1 py-4 bg-white/5 text-white rounded-xl font-black uppercase text-xs tracking-[0.2em] border border-white/10 active:scale-95 transition-all"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

      {/* Creation Modal for New Pin */}
      {newPin && (
        <div className="glass p-6 rounded-[2.5rem] border border-primary/20 animate-in slide-in-from-bottom-6 fixed bottom-28 left-6 right-6 z-50 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-sm font-black text-white uppercase tracking-widest">New Deployment</h4>
            <button onClick={() => setNewPin(null)} className="text-slate-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-6">
            {(['FULL_BIN', 'HAZARD', 'MAINTENANCE'] as const).map(t => (
              <button
                type="button"
                key={t}
                onClick={() => setType(t)}
                className={`text-[9px] py-3 rounded-xl border font-black uppercase tracking-widest transition-all ${
                  type === t 
                  ? 'bg-primary text-black border-primary shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                  : 'bg-white/5 text-slate-500 border-white/5 hover:border-white/10'
                }`}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Specify details for AI verification..."
            className="w-full p-4 bg-obsidian rounded-2xl border border-white/10 text-sm mb-6 focus:ring-1 focus:ring-primary outline-none transition-all text-white placeholder:text-slate-600 min-h-[100px]"
            rows={3}
            required
          />

          <div className="flex gap-3">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={submitting || !description}
              className="w-full py-5 bg-primary text-black rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
            >
              {submitting ? 'Transmitting...' : <><Check size={18} /> Submit Report</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueReporter;