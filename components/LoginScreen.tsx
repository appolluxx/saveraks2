
import React, { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { loginUser, registerUser } from '../services/api';
import { User } from '../types';
import Logo from './Logo';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [schoolId, setSchoolId] = useState('');
  const [name, setName] = useState('');
  const [classRoom, setClassRoom] = useState('M.4/1');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let user: User;
      if (isRegistering) {
        if (!name || !schoolId) throw new Error("Please fill in all fields");
        user = await registerUser(name, schoolId);
      } else {
        if (!schoolId) throw new Error("Please enter ID");
        user = await loginUser(schoolId);
      }
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || "Auth failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-[120px]"></div>
      
      <div className="glass w-full max-w-sm rounded-[2.5rem] p-8 relative z-10 border border-white/10">
        <div className="flex flex-col items-center mb-8">
          <Logo size="lg" className="mb-4" />
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">SaveRaks</h1>
          <p className="text-primary font-mono text-[10px] tracking-[0.3em] uppercase mt-1">Eco-Guardian OS</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Somchai Jaidee"
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary outline-none transition-all text-white placeholder:text-slate-600"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Classroom</label>
                <select 
                   value={classRoom} onChange={(e) => setClassRoom(e.target.value)}
                   className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary outline-none transition-all text-white appearance-none"
                >
                  <option value="M.4/1" className="bg-obsidian">M.4/1</option>
                  <option value="M.5/1" className="bg-obsidian">M.5/1</option>
                  <option value="M.6/1" className="bg-obsidian">M.6/1</option>
                </select>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Student ID</label>
            <input
              type="text" value={schoolId} onChange={(e) => setSchoolId(e.target.value)}
              placeholder="SM-2024-XXX"
              className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary outline-none transition-all text-white font-mono placeholder:text-slate-600"
            />
          </div>

          {error && <div className="text-rose-500 text-[10px] font-black text-center uppercase tracking-widest bg-rose-500/10 py-2 rounded-xl">{error}</div>}

          <button
            type="submit" disabled={loading}
            className="w-full py-5 bg-primary text-black rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>{isRegistering ? 'Register Agent' : 'Initialize Session'} <ArrowRight size={18} /></>}
          </button>
        </form>

        <button
          onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
          className="w-full mt-6 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
        >
          {isRegistering ? "Existing Agent? Login" : "New Agent? Create Profile"}
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;
