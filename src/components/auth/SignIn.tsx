import React, { useState } from 'react';
import { Lock, Mail, ShieldAlert, ArrowRight, UserCheck, Sparkles, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { initialEmployees } from '../../mockData';

interface SignInProps {
  onNavigateToSignUp: () => void;
}

export const SignIn: React.FC<SignInProps> = ({ onNavigateToSignUp }) => {
  const { login, company } = useAuth();
  const [loginIdOrEmail, setLoginIdOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = login(loginIdOrEmail, password);
      if (!result.success) {
        setError(result.error || 'Authentication failed');
      }
      setIsLoading(false);
    }, 400);
  };

  const handleQuickDemoFill = (idOrEmail: string, pass: string = 'password123') => {
    setLoginIdOrEmail(idOrEmail);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Logo & Header */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-lg border border-slate-800">
            {company.code || 'HR'}
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          Sign In to {company.name}
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500 font-medium">
          Human Resource Management System
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-xl border border-slate-200/80">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Login ID / Work Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="signin-login-id"
                  type="text"
                  required
                  value={loginIdOrEmail}
                  onChange={(e) => setLoginIdOrEmail(e.target.value)}
                  placeholder="e.g. OIJODO20220001 or john.doe@..."
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                <span className="text-[11px] text-slate-400">Default: password123</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="signin-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                id="sign-in-submit-btn"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Signing In...' : 'SIGN IN'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-3 text-center border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Don't have an Account?{' '}
                <button
                  type="button"
                  id="goto-signup-btn"
                  onClick={onNavigateToSignUp}
                  className="font-bold text-indigo-600 hover:text-indigo-700 transition cursor-pointer"
                >
                  Sign Up (Create Company Admin)
                </button>
              </p>
            </div>
          </form>

          {/* Quick Demo Sign In presets for reviewers */}
          <div className="mt-6 pt-5 border-t border-dashed border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>1-Click Test Accounts</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                id="demo-login-admin"
                onClick={() => handleQuickDemoFill('OIAMSH20210001', 'password123')}
                className="flex items-center gap-2 p-2 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100 text-left transition cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  HR
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-purple-900 truncate">Amit Sharma</p>
                  <p className="text-[10px] text-purple-700">Admin / HR Officer</p>
                </div>
              </button>

              <button
                type="button"
                id="demo-login-employee"
                onClick={() => handleQuickDemoFill('OIJODO20220002', 'password123')}
                className="flex items-center gap-2 p-2 rounded-xl border border-sky-200 bg-sky-50/60 hover:bg-sky-100 text-left transition cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  JD
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-sky-900 truncate">John Doe</p>
                  <p className="text-[10px] text-sky-700">Frontend Engineer</p>
                </div>
              </button>
            </div>
            <p className="mt-2 text-[10px] text-slate-400 text-center">
              *Employees cannot self-register; HR Admins onboard employees with auto-generated IDs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
