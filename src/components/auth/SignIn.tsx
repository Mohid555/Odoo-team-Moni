import React, { useState } from 'react';
import { Lock, Mail, ShieldAlert, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SignInProps {
  onNavigateToSignUp: () => void;
}

export const SignIn: React.FC<SignInProps> = ({ onNavigateToSignUp }) => {
  const { login, company } = useAuth();
  const [loginIdOrEmail, setLoginIdOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await login(loginIdOrEmail, password);
      if (!result.success) {
        setError(result.error || 'Authentication failed');
      }
    } finally {
      setIsLoading(false);
    }
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
                <span className="text-[11px] text-slate-400">Use your company credentials</span>
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

        </div>
      </div>
    </div>
  );
};
