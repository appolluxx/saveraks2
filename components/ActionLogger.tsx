import React, { useState, useRef } from 'react';
import { Bus, Lightbulb, Sprout, Upload, Video, Zap, Loader2 } from 'lucide-react';
import { analyzeUtilityBill, fileToBase64 } from '../services/geminiService';
import { uploadToDrive, updateUserXP, logActivity } from '../services/mockBackend';
import { ActionType } from '../types';

interface ActionLoggerProps {
  onActivityLogged: () => void;
}

const ActionLogger: React.FC<ActionLoggerProps> = ({ onActivityLogged }) => {
  const [activeTab, setActiveTab] = useState<'TRANS' | 'ENERGY' | 'GREEN'>('TRANS');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Commute State
  const [transportMode, setTransportMode] = useState('Bus');

  // Energy State
  const [billData, setBillData] = useState<{ units: number; amount: number; month: string } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setBillData(null); // Reset bill data on new file
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (activeTab === 'TRANS') {
        await logActivity(ActionType.COMMUTE, { mode: transportMode, xp: 15 });
        // XP update is now handled by logActivity result or a refetch, 
        // but for immediate UI we assume success
        await updateUserXP(15);
      } 
      
      else if (activeTab === 'ENERGY' && file) {
        // 1. Analyze with AI first
        const base64 = await fileToBase64(file);
        const analysis = await analyzeUtilityBill(base64);
        setBillData(analysis);
        
        // 2. Log & Upload in one go to Backend
        await logActivity(ActionType.ENERGY_POINT, { 
            ...analysis, 
            xp: 100,
            fileBase64: base64,
            fileName: `energy_${Date.now()}.jpg`,
            mimeType: file.type 
        });
        await updateUserXP(100); 
      } 
      
      else if (activeTab === 'GREEN' && file) {
        // Video upload
        const base64 = await fileToBase64(file);
        
        await logActivity(ActionType.GREEN_POINT, { 
            xp: 50,
            description: "Green activity video proof",
            fileBase64: base64,
            fileName: `green_${Date.now()}_${file.name}`,
            mimeType: file.type
        });
        await updateUserXP(50);
      }

      onActivityLogged();
      if (activeTab !== 'ENERGY') {
         // Keep energy tab open to show result, others reset
         setFile(null);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to process. Check connection or try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex bg-gray-100 p-1 rounded-xl">
        {[
          { id: 'TRANS', icon: Bus, label: 'Travel' },
          { id: 'GREEN', icon: Sprout, label: 'Green' },
          { id: 'ENERGY', icon: Zap, label: 'Energy' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setFile(null); setBillData(null); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
              activeTab === tab.id ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 min-h-[300px]">
        
        {/* TRANSPORT TAB */}
        {activeTab === 'TRANS' && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="font-bold text-gray-800">Log Eco-Travel</h3>
            <div className="grid grid-cols-2 gap-3">
              {['Bus', 'BTS/MRT', 'Walk', 'Bicycle', 'Carpool'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setTransportMode(mode)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    transportMode === mode ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 hover:border-emerald-200'
                  }`}
                >
                  <span className="block font-medium">{mode}</span>
                  <span className="text-xs text-gray-400">+15 XP</span>
                </button>
              ))}
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold mt-4 shadow-lg active:scale-95 transition-transform"
            >
              {loading ? 'Logging...' : 'Confirm Trip'}
            </button>
          </div>
        )}

        {/* GREEN POINTS TAB (VIDEO) */}
        {activeTab === 'GREEN' && (
          <div className="space-y-4 animate-in fade-in text-center">
             <div className="bg-green-50 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center text-green-600 mb-2">
                <Video size={32} />
             </div>
             <h3 className="font-bold text-gray-800">Green Points Evidence</h3>
             <p className="text-gray-500 text-sm">Upload a short video of you planting a tree or cleaning a garden.</p>

             <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:bg-gray-50 cursor-pointer transition-colors"
             >
                {file ? (
                  <div className="text-emerald-600 font-medium flex items-center justify-center gap-2">
                    <CheckCircleIcon /> {file.name}
                  </div>
                ) : (
                  <div className="text-gray-400 flex flex-col items-center gap-2">
                    <Upload size={24} />
                    <span>Select Video</span>
                  </div>
                )}
             </div>
             <input type="file" ref={fileInputRef} className="hidden" accept="video/*,image/*" onChange={handleFileChange} />
             
             <button
              onClick={handleSubmit}
              disabled={!file || loading}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold mt-4 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin"/> Uploading...</span> : 'Upload Evidence (+50 XP)'}
            </button>
            <p className="text-[10px] text-gray-400 mt-2">File will be saved to SaveRaks Drive for verification.</p>
          </div>
        )}

        {/* ENERGY TAB (OCR) */}
        {activeTab === 'ENERGY' && (
          <div className="space-y-4 animate-in fade-in">
             <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <Lightbulb size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800">Electricity Bill Tracker</h3>
                    <p className="text-xs text-gray-500">AI extracts usage data automatically.</p>
                </div>
             </div>

             {!billData ? (
                 <>
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-blue-200 bg-blue-50 rounded-xl p-8 cursor-pointer transition-colors text-center"
                    >
                        {file ? (
                            <div className="text-blue-700 font-medium">{file.name}</div>
                        ) : (
                            <div className="text-blue-400 flex flex-col items-center gap-2">
                                <Upload size={24} />
                                <span>Upload Bill Photo</span>
                            </div>
                        )}
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    
                    <button
                        onClick={handleSubmit}
                        disabled={!file || loading}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold mt-4 shadow-lg disabled:opacity-50"
                    >
                         {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin"/> Analyzing & Uploading...</span> : 'Process Bill'}
                    </button>
                 </>
             ) : (
                 <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                     <h4 className="font-bold text-emerald-800 mb-2">Verified by AI</h4>
                     <div className="space-y-2 text-sm">
                         <div className="flex justify-between">
                             <span className="text-gray-600">Period:</span>
                             <span className="font-mono font-bold">{billData.month}</span>
                         </div>
                         <div className="flex justify-between">
                             <span className="text-gray-600">Usage:</span>
                             <span className="font-mono font-bold">{billData.units} kWh</span>
                         </div>
                         <div className="flex justify-between">
                             <span className="text-gray-600">Amount:</span>
                             <span className="font-mono font-bold">฿{billData.amount}</span>
                         </div>
                     </div>
                     <div className="mt-4 pt-4 border-t border-emerald-200 text-center">
                         <span className="text-lg font-bold text-emerald-600">+100 XP Earned!</span>
                         <button onClick={() => { setBillData(null); setFile(null); }} className="block w-full text-xs text-gray-500 mt-2 underline">Scan another</button>
                     </div>
                 </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
)

export default ActionLogger;