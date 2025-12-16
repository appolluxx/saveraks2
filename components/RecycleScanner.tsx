import React, { useState, useRef } from 'react';
import { Camera, RefreshCw, Loader2, CheckCircle, AlertTriangle, Trash2, Recycle, Leaf, Zap } from 'lucide-react';
import { analyzeWasteImage, fileToBase64 } from '../services/geminiService';
import { updateUserXP, logActivity } from '../services/mockBackend';
import { ActionType } from '../types';

interface RecycleScannerProps {
  onActivityLogged: () => void;
}

const RecycleScanner: React.FC<RecycleScannerProps> = ({ onActivityLogged }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{ item: string; category: string; advice: string; xp: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const base64 = await fileToBase64(file);
      setImagePreview(`data:image/jpeg;base64,${base64}`);
      setResult(null); // Reset previous result
      handleAnalyze(base64);
    }
  };

  const handleAnalyze = async (base64: string) => {
    setAnalyzing(true);
    try {
      const analysis = await analyzeWasteImage(base64);
      setResult(analysis);
      
      // Auto-award XP
      if (analysis.xp > 0) {
        // Log to database (data only, no image upload for recycling)
        await logActivity(ActionType.RECYCLE, {
            item: analysis.item,
            category: analysis.category,
            xp: analysis.xp,
            description: `Recycled ${analysis.item} (${analysis.category})`
        });

        // Optimistic UI update
        await updateUserXP(analysis.xp);
        onActivityLogged();
      }
    } catch (err) {
      console.error(err);
      setResult({ item: 'Error', category: 'Error', advice: 'Try again.', xp: 0 });
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setImagePreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getBinDetails = (category: string) => {
    const c = category.toLowerCase();
    
    if (c.includes('recycle') || c.includes('yellow')) {
      return {
        bg: 'bg-yellow-400',
        border: 'border-yellow-500',
        text: 'text-yellow-900',
        icon: <Recycle className="w-16 h-16 text-yellow-900" />,
        name: 'Yellow Bin',
        desc: 'Recyclables (Plastic, Glass, Paper)'
      };
    }
    if (c.includes('organic') || c.includes('green') || c.includes('food')) {
      return {
        bg: 'bg-green-500',
        border: 'border-green-600',
        text: 'text-white',
        icon: <Leaf className="w-16 h-16 text-white" />,
        name: 'Green Bin',
        desc: 'Organic Waste (Food, Leaves)'
      };
    }
    if (c.includes('hazard') || c.includes('red') || c.includes('danger')) {
      return {
        bg: 'bg-red-500',
        border: 'border-red-600',
        text: 'text-white',
        icon: <AlertTriangle className="w-16 h-16 text-white" />,
        name: 'Red Bin',
        desc: 'Hazardous (Batteries, Chemicals)'
      };
    }
    // Default to General (Blue in Thailand)
    return {
      bg: 'bg-blue-500',
      border: 'border-blue-600',
      text: 'text-white',
      icon: <Trash2 className="w-16 h-16 text-white" />,
      name: 'Blue Bin',
      desc: 'General Waste (Wrappers, Foam)'
    };
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100 text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-2">AI Waste Sorter</h3>
        <p className="text-gray-500 text-sm mb-6">Take a photo of your trash. Gemini will tell you which bin to use and award you XP!</p>

        {!imagePreview ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-12 border-2 border-dashed border-emerald-300 rounded-2xl bg-emerald-50 hover:bg-emerald-100 transition-colors flex flex-col items-center justify-center gap-3"
          >
            <div className="bg-emerald-200 p-4 rounded-full text-emerald-700">
              <Camera size={32} />
            </div>
            <span className="font-semibold text-emerald-800">Tap to Scan Waste</span>
          </button>
        ) : (
          <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-square mb-4">
            <img src={imagePreview} alt="Captured waste" className="w-full h-full object-cover" />
            {analyzing && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                <Loader2 size={40} className="animate-spin mb-2" />
                <span className="font-medium animate-pulse">Gemini is thinking...</span>
              </div>
            )}
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          capture="environment"
          onChange={handleCapture}
        />

        {result && (
          <div className="mt-6 text-left bg-gray-50 border border-gray-200 rounded-2xl p-5 animate-in slide-in-from-bottom-5">
            {/* Header with XP */}
            <div className="flex justify-between items-start mb-4">
               <div>
                  <h3 className="text-2xl font-black text-gray-900 capitalize leading-none mb-1">
                    {result.item}
                  </h3>
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Identified Item</span>
               </div>
               <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg font-bold text-sm shadow-sm whitespace-nowrap">
                  +{result.xp} XP
               </div>
            </div>

            {/* Bin Card */}
            {(() => {
               const bin = getBinDetails(result.category);
               return (
                  <div className={`${bin.bg} ${bin.text} p-6 rounded-xl border-b-4 ${bin.border} shadow-lg mb-5 flex flex-col items-center text-center relative overflow-hidden`}>
                     <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-10 -mt-10 pointer-events-none"/>
                     <div className="mb-3 animate-bounce">
                        {bin.icon}
                     </div>
                     <h2 className="text-2xl font-black uppercase tracking-tight mb-1">
                        THROW IN {bin.name}
                     </h2>
                     <p className="text-sm font-medium opacity-90">{bin.desc}</p>
                  </div>
               );
            })()}
            
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2 text-sm">
                <CheckCircle size={16} className="text-emerald-500" />
                Gemini's Tip
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                {result.advice}
                </p>
            </div>

            <button 
              onClick={reset}
              className="mt-4 w-full py-3 bg-gray-900 text-white rounded-xl font-bold shadow-md hover:bg-black active:scale-95 transition-all"
            >
              Scan Another Item
            </button>
          </div>
        )}
      </div>

      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
        <AlertTriangle className="text-blue-500 flex-shrink-0" size={20} />
        <p className="text-xs text-blue-800">
          <strong>Privacy Note:</strong> Photos processed here are transient. They are analyzed by AI and immediately discarded to save storage.
        </p>
      </div>
    </div>
  );
};

export default RecycleScanner;