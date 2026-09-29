import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';
import { Award, Lock, Mail, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { signIn, switchDemoRole } = useAuth();
  const { navigate } = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    setError(null);

    const res = await signIn(email.trim(), password);
    setIsLoading(false);

    if (!res.success) {
      setError(res.error || 'Authentication failed. Please check credentials or use demo button.');
    } else {
      navigate('/dashboard');
    }
  };

  const handleQuickDemo = async (role: 'student' | 'organizer' | 'admin') => {
    await switchDemoRole(role);
    if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'organizer') navigate('/organizer/dashboard');
    else navigate('/dashboard');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        
        {/* College Logo / Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-900 text-white font-extrabold text-lg shadow-sm">
            EGS
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            E.G.S. Pillay Engineering College
          </h1>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Event Management Portal Sign In
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                College Email or Register Number
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="vishwaegs@gmail.com or 820822104055"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* 1-Click Demo Profiles (For Instant Verification) */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block text-center">
              Quick 1-Click Demo Sign-in
            </span>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('student')}
                className="p-2 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-center transition-colors group"
              >
                <span className="block text-[11px] font-bold text-blue-900">Student</span>
                <span className="block text-[10px] text-blue-700">Vishwa S.</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('organizer')}
                className="p-2 rounded-lg border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-center transition-colors group"
              >
                <span className="block text-[11px] font-bold text-amber-900">Faculty</span>
                <span className="block text-[10px] text-amber-700">Dr. Ramanathan</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="p-2 rounded-lg border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-center transition-colors group"
              >
                <span className="block text-[11px] font-bold text-emerald-900">Dean Office</span>
                <span className="block text-[10px] text-emerald-700">Prof. Balu</span>
              </button>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center text-xs text-slate-500 pt-1">
            <span>Don&apos;t have an account yet? </span>
            <button
              onClick={() => navigate('/register')}
              className="text-blue-900 font-semibold hover:underline"
            >
              Create Account
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
