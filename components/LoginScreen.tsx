import React, { useState } from 'react';
import { Leaf, ArrowRight, Loader2, UserPlus, LogIn } from 'lucide-react';
import { loginUser, registerUser } from '../services/mockBackend';
import { User } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [schoolId, setSchoolId] = useState('');
  const [name, setName] = useState('');

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
        if (!schoolId) throw new Error("Please enter School ID");
        user = await loginUser(schoolId);
      }
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-emerald-200 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-blue-200 rounded-full blur-3xl opacity-30"></div>

      <div className="bg-white/80 backdrop-blur-lg w-full max-w-sm rounded-3xl shadow-xl border border-white p-8 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 shadow-sm transform rotate-3">
            <Leaf size={32} />
          </div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">SaveRaks</h1>
          <p className="text-emerald-600 font-medium text-sm">Surasakmontree Sustainability</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div className="space-y-1 animate-in slide-in-from-top-2">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex. Somchai Jaidee"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Student ID / School ID</label>
            <input
              type="text"
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
              placeholder="Ex. 12345"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-mono text-gray-900 placeholder:text-gray-400"
            />
          </div>

          {error && (
            <div className="text-red-500 text-xs font-bold text-center bg-red-50 py-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                {isRegistering ? 'Start Saving Earth' : 'Login'} <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <button
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
            className="text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            {isRegistering ? (
               <>Already have an account? <span className="underline">Login</span></>
            ) : (
               <>New here? <span className="underline">Register Account</span></>
            )}
          </button>
        </div>
      </div>
      
      <p className="absolute bottom-6 text-gray-400 text-xs font-medium">v2.0 • Powered by Gemini AI</p>
    </div>
  );
};

export default LoginScreen;