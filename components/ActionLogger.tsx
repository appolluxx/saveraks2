
import React, { useState, useRef } from 'react';
import { Bus, Sprout, Video, Zap } from 'lucide-react';
import { analyzeUtilityBill, fileToBase64 } from '../services/geminiService';
import { logActivity, compressImage } from '../services/api';
import { ActionType } from '../types';

interface ActionLoggerProps {
  onActivityLogged: () => void;
}

const ActionLogger: React.FC<ActionLoggerProps> = ({ onActivityLogged }) => {
  const [activeTab, setActiveTab] = useState<'TRANS' | 'ENERGY' | 'GREEN'>('TRANS');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [transportMode, setTransportMode] = useState('Bus');
  const [billData, setBillData] = useState<{ units: number; amount: number; month: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setBillData(null);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (activeTab === 'TRANS') {
        await logActivity(ActionType.COMMUTE, { label: `Travel by ${transportMode}`, points: 15 });
      } 
      else if (activeTab === 'ENERGY' && file) {
        const rawBase64 = await fileToBase64(file);
        const analysis = await analyzeUtilityBill(rawBase64);
        setBillData(analysis);
        
        // Compress for backend storage
        const compressed = await compressImage(rawBase64);
        await logActivity(ActionType.ENERGY_POINT, { 
            category: 'energy',
            label: `Electricity Bill - ${analysis.month}`, 
            points: 100,
            fileBase64: compressed,
            aiData: analysis 
        });
      } 
      else if (activeTab === 'GREEN' && file) {
        const rawBase64 = await fileToBase64(file);
        // Video would normally be handled by Drive, here we treat as blob
        await logActivity(ActionType.GREEN_POINT, { 
            category: 'green',
            label: 'Eco-Video Evidence', 
            points: 50,
            fileBase64: rawBase64,
            mimeType: file.type
        });
      }
      onActivityLogged();
      if (activeTab !== 'ENERGY') setFile(null);
    } catch (err) {
      console.error(err);
      alert('Failed to process. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
        {[
          { id: 'TRANS', icon: Bus, label: 'Travel' },
          { id: 'GREEN', icon: Sprout, label: 'Green' },
          { id: 'ENERGY', icon: Zap, label: 'Energy' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setFile(null); setBillData(null); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
              activeTab === tab.id ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-gray-500'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 min-h-[300px] transition-colors">
        {activeTab === 'TRANS' && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="font-bold text-gray-800 dark:text-white">Log Eco-Travel</h3>
            <div className="grid grid-cols-2 gap-3">
              {['Bus', 'BTS/MRT', 'Walk', 'Bicycle', 'Carpool'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setTransportMode(mode)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    transportMode === mode ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400'
                  }`}
                >
                  <span className="block font-medium">{mode}</span>
                  <span className="text-xs opacity-60">+15 Points</span>
                </button>
              ))}
            </div>
            <button onClick={handleSubmit} disabled={loading} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold mt-4 shadow-lg active:scale-95 transition-all">
              {loading ? 'Logging...' : 'Confirm Trip'}
            </button>
          </div>
        )}

        {activeTab === 'GREEN' && (
          <div className="space-y-4 text-center animate-in fade-in">
             <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center text-green-600 dark:text-green-400 mb-2">
                <Video size={32} />
             </div>
             <h3 className="font-bold text-gray-800 dark:text-white">Green Points Evidence</h3>
             <p className="text-gray-500 dark:text-slate-400 text-sm">Upload video proof of sustainability efforts.</p>
             <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl p-8 cursor-pointer hover:border-emerald-500 transition-colors">
                {file ? <span className="text-emerald-600 dark:text-emerald-400 font-medium">{file.name}</span> : <span className="text-gray-400">Select Evidence File</span>}
             </div>
             <input type="file" ref={fileInputRef} className="hidden" accept="video/*,image/*" onChange={handleFileChange} />
             <button onClick={handleSubmit} disabled={!file || loading} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold mt-4 active:scale-95 transition-all">
              {loading ? 'Uploading...' : 'Upload Evidence (+50 Points)'}
            </button>
          </div>
        )}

        {activeTab === 'ENERGY' && (
          <div className="space-y-4 animate-in fade-in">
             <div className="flex items-center gap-3">
                <Zap className="text-blue-600" />
                <h3 className="font-bold text-gray-800 dark:text-white">Electricity Bill Tracker</h3>
             </div>
             {!billData ? (
                 <>
                    <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/10 rounded-xl p-8 cursor-pointer text-center hover:border-blue-500 transition-colors">
                        {file ? <span className="text-blue-700 dark:text-blue-400 font-medium">{file.name}</span> : <span className="text-gray-400">Upload Bill Photo</span>}
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    <button onClick={handleSubmit} disabled={!file || loading} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold mt-4 active:scale-95 transition-all">
                         {loading ? 'Analyzing...' : 'Process Bill'}
                    </button>
                 </>
             ) : (
                 <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 text-center animate-in zoom-in">
                     <h4 className="font-black text-emerald-800 dark:text-emerald-400 text-xl mb-4">Verified by AI</h4>
                     <div className="space-y-1 mb-6">
                        <p className="text-sm text-gray-600 dark:text-slate-300">Month: <span className="font-bold">{billData.month}</span></p>
                        <p className="text-sm text-gray-600 dark:text-slate-300">Usage: <span className="font-bold">{billData.units} kWh</span></p>
                     </div>
                     <div className="bg-white dark:bg-slate-800 py-3 rounded-xl shadow-inner">
                         <span className="text-lg font-black text-emerald-600">+100 Points Earned!</span>
                     </div>
                     <button onClick={() => { setBillData(null); setFile(null); }} className="mt-4 text-xs text-gray-400 underline uppercase tracking-widest font-bold">New Bill</button>
                 </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionLogger;
