import React, { useState } from 'react';
import { MapPin, Check } from 'lucide-react';
import { INITIAL_PINS } from '../constants';
import { MapPin as PinType } from '../types';
import { updateUserXP, logActivity } from '../services/mockBackend';
import { ActionType } from '../types';

interface IssueReporterProps {
    onActivityLogged: () => void;
}

const IssueReporter: React.FC<IssueReporterProps> = ({ onActivityLogged }) => {
  const [pins, setPins] = useState<PinType[]>(INITIAL_PINS);
  const [newPin, setNewPin] = useState<{x: number, y: number} | null>(null);
  const [description, setDescription] = useState('');
  const [type, setType] = useState<PinType['type']>('FULL_BIN');
  const [submitting, setSubmitting] = useState(false);

  // Use local map image (Ensure map.jpg is in the project root)
  const mapImage = "./map.jpg";

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setNewPin({ x, y });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin) return;
    
    setSubmitting(true);
    
    // Simulate API call
    const pin: PinType = {
      id: Date.now().toString(),
      x: newPin.x,
      y: newPin.y,
      type,
      description,
      status: 'OPEN'
    };

    // Log to simulated backend
    await logActivity(ActionType.REPORT, pin);
    await updateUserXP(30); // Reward for reporting
    
    setPins([...pins, pin]);
    setNewPin(null);
    setDescription('');
    setSubmitting(false);
    onActivityLogged();
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-1">Campus Map</h3>
        <p className="text-gray-500 text-xs mb-4">Tap on the map to pin a hazard or issue.</p>
        
        <div 
          className="relative w-full aspect-[4/3] bg-gray-200 rounded-xl overflow-hidden cursor-crosshair shadow-inner"
          onClick={handleMapClick}
        >
          <img src={mapImage} alt="School Map" className="w-full h-full object-cover opacity-90" />
          
          {/* Existing Pins */}
          {pins.map(pin => (
            <div 
              key={pin.id}
              className={`absolute w-6 h-6 -ml-3 -mt-6 transform transition-transform hover:scale-125 ${
                pin.type === 'HAZARD' ? 'text-rose-500' : 'text-blue-500'
              }`}
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            >
              <MapPin fill="currentColor" />
            </div>
          ))}

          {/* New Pin Draft */}
          {newPin && (
            <div 
              className="absolute w-8 h-8 -ml-4 -mt-8 text-emerald-600 animate-bounce"
              style={{ left: `${newPin.x}%`, top: `${newPin.y}%` }}
            >
              <MapPin fill="currentColor" size={32} />
            </div>
          )}
        </div>
      </div>

      {newPin && (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-3xl shadow-lg border border-emerald-100 animate-in slide-in-from-bottom-10 fixed bottom-24 left-4 right-4 z-40">
          <h4 className="font-bold text-gray-800 mb-3">Report Issue</h4>
          
          <div className="grid grid-cols-3 gap-2 mb-4">
            {(['FULL_BIN', 'HAZARD', 'MAINTENANCE'] as const).map(t => (
              <button
                type="button"
                key={t}
                onClick={() => setType(t)}
                className={`text-xs py-2 rounded-lg border font-medium ${
                  type === t ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-gray-50 text-gray-600 border-gray-200'
                }`}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue..."
            className="w-full p-3 bg-gray-50 rounded-xl border-gray-200 text-sm mb-4 focus:ring-2 focus:ring-emerald-500 outline-none"
            rows={2}
            required
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setNewPin(null)}
              className="flex-1 py-3 text-gray-500 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-md flex items-center justify-center gap-2"
            >
              {submitting ? 'Sending...' : <><Check size={18} /> Submit Report</>}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default IssueReporter;