import React, { useState, useRef } from 'react';
import { Camera, Loader2, Recycle, Droplets, ShieldAlert, Sparkles, AlertCircle, RefreshCcw } from 'lucide-react';
import { analyzeEnvironmentImage, fileToBase64 } from '../services/geminiService';
import { logActivity, compressImage } from '../services/api';
import { ActionType, ScanResult } from '../types';

interface EcoScannerProps { onActivityLogged: () => void; }

const EcoScanner: React.FC<EcoScannerProps> = ({ onActivityLogged }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const base64 = await fileToBase64(file);
      setImagePreview(`data:image/jpeg;base64,${base64}`);
      setResult(null);
      handleAnalyze(base64);
    }
  };

  const handleAnalyze = async (base64: string) => {
    setAnalyzing(true);
    try {
      const analysis = await analyzeEnvironmentImage(base64);
      setResult(analysis);
      
      if (analysis.point_reward > 0) {
        const category = (analysis.category || '').toLowerCase();
        let actionType = ActionType.RECYCLE;
        if (category === 'grease_trap') actionType = ActionType.GREASE_TRAP;
        if (category === 'hazard') actionType = ActionType.HAZARD_SCAN;

        const compressed = await compressImage(base64);
        await logActivity(actionType, {
            category: analysis.category,
            label: analysis.label,
            points: analysis.point_reward,
            fileBase64: compressed,
            aiData: analysis
        });
        onActivityLogged();
      }
    } catch (err) {
      alert("AI analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">AI Vision Scanner</h2>
        <p className="text-slate-500 text-xs font-medium uppercase tracking-[0.2em]">Categorizing campus sustainability</p>
      </div>

      {!imagePreview ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full aspect-square glass rounded-[3rem] flex flex-col items-center justify-center gap-6 group hover:border-primary/50 transition-all duration-500 overflow-hidden relative"
        >
          {/* Animated Background Lines */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent"></div>
          
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500 relative z-10">
            <Camera size={40} strokeWidth={1.5} />
          </div>
          <div className="space-y-2 relative z-10">
            <p className="text-sm font-black text-white uppercase tracking-widest">Start Scan</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Tap to activate camera</p>
          </div>
        </button>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="relative aspect-square rounded-[3rem] overflow-hidden border border-white/10 group">
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover grayscale-[0.2]" />
            
            {analyzing && (
              <div className="absolute inset-0 bg-obsidian/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                   <div className="w-12 h-12 border-2 border-primary/20 rounded-full"></div>
                   <div className="absolute inset-0 w-12 h-12 border-t-2 border-primary rounded-full animate-spin"></div>
                </div>
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] animate-pulse">Deep Analyzing...</p>
              </div>
            )}

            {/* Viewfinder Corners */}
            <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-primary/40 rounded-tl-2xl"></div>
            <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-primary/40 rounded-tr-2xl"></div>
            <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-primary/40 rounded-bl-2xl"></div>
            <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-primary/40 rounded-br-2xl"></div>
          </div>

          {result && (
            <div className="space-y-4 animate-in slide-in-from-bottom-4">
               <div className="glass p-6 rounded-3xl border border-primary/20 flex items-center gap-6">
                 <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <Recycle size={32} />
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Classification</p>
                    <h4 className="text-xl font-black text-white tracking-tight">{result.label}</h4>
                    <p className="text-xs font-bold text-primary">+{result.point_reward} Points Earned</p>
                 </div>
               </div>
               
               {result.upcycling_tip && (
                 <div className="bg-surface border border-border p-5 rounded-3xl space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-secondary tracking-widest">
                       <Sparkles size={12} /> AI Strategy
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed italic">"{result.upcycling_tip}"</p>
                 </div>
               )}

               <button 
                onClick={() => { setImagePreview(null); setResult(null); }}
                className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl"
               >
                <RefreshCcw size={16} /> New Classification
               </button>
            </div>
          )}
        </div>
      )}

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleCapture} />
    </div>
  );
};

export default EcoScanner;