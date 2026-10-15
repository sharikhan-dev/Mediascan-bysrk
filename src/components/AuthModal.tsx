import React, { useState } from 'react';
import { X, Mail, Lock, User, AlertCircle, ArrowRight, Check } from 'lucide-react';
import { UserProfile } from '../types';
import { getSupabaseClient, setLocalUser } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const supabase = getSupabaseClient();

      if (mode === 'forgot') {
        if (!email) {
          setError('Please provide your account email address.');
          setLoading(false);
          return;
        }

        if (supabase) {
          const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email);
          if (resetErr) throw resetErr;
        }

        setSuccessMessage('Password reset instructions have been sent to your email.');
        setLoading(false);
        return;
      }

      if (mode === 'signup') {
        if (!email || !password || !displayName) {
          setError('Please fill out all fields.');
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError('Password must contain at least 6 characters.');
          setLoading(false);
          return;
        }

        let userProfile: UserProfile;

        if (supabase) {
          const { data, error: signupErr } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                display_name: displayName,
              },
            },
          });
          if (signupErr) throw signupErr;
          userProfile = {
            id: data.user?.id || 'usr-' + Date.now(),
            email: data.user?.email || email,
            display_name: displayName,
            created_at: new Date().toISOString(),
          };
        } else {
          userProfile = {
            id: 'usr-' + Date.now(),
            email,
            display_name: displayName,
            created_at: new Date().toISOString(),
          };
        }

        setLocalUser(userProfile);
        onSuccess(userProfile);
        onClose();
      } else {
        if (!email || !password) {
          setError('Please enter both email and password.');
          setLoading(false);
          return;
        }

        let userProfile: UserProfile;

        if (supabase) {
          const { data, error: signinErr } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (signinErr) throw signinErr;
          userProfile = {
            id: data.user?.id || 'usr-' + Date.now(),
            email: data.user?.email || email,
            display_name: data.user?.user_metadata?.display_name || email.split('@')[0],
            created_at: data.user?.created_at || new Date().toISOString(),
          };
        } else {
          userProfile = {
            id: 'usr-' + Date.now(),
            email,
            display_name: email.split('@')[0],
            created_at: new Date().toISOString(),
          };
        }

        setLocalUser(userProfile);
        onSuccess(userProfile);
        onClose();
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    const demoUser: UserProfile = {
      id: 'demo-user-alex',
      email: 'alex.morgan@example.com',
      display_name: 'Alex Morgan',
      created_at: '2026-01-15T08:00:00Z',
    };
    setLocalUser(demoUser);
    onSuccess(demoUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0F1D]/60 backdrop-blur-xs animate-fade-in font-sans" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
      <div className="relative w-full max-w-md bg-white border-2 border-slate-900 shadow-[8px_8px_0px_0px_#0A0F1D] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
              Authorization Gateway
            </span>
            <h2 id="auth-modal-title" className="text-xl font-bold text-slate-900 font-editorial mt-0.5">
              {mode === 'signin' && 'Sign in to Workspace'}
              {mode === 'signup' && 'Create Operator Account'}
              {mode === 'forgot' && 'Reset Password'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 border border-slate-200"
            aria-label="Close modal dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 font-mono text-xs">
          {error && (
            <div className="p-3 bg-red-50 border-l-4 border-red-600 text-red-800 flex items-start gap-2" role="alert">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border-l-4 border-emerald-600 text-emerald-800 flex items-start gap-2" role="status">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label htmlFor="auth-name-input" className="block text-slate-600 uppercase mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <input
                    id="auth-name-input"
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:border-slate-900 font-sans"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="auth-email-input" className="block text-slate-600 uppercase mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  id="auth-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@domain.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:border-slate-900 font-sans"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="auth-password-input" className="block text-slate-600 uppercase">Password</label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-blue-600 hover:underline uppercase text-[10px]"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <input
                    id="auth-password-input"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:border-slate-900 font-sans"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 font-bold text-white bg-[#0A0F1D] hover:bg-blue-600 disabled:opacity-50 transition-colors uppercase flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'signin' && 'Sign In'}
                    {mode === 'signup' && 'Create Account'}
                    {mode === 'forgot' && 'Send Reset Email'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Mode Switcher */}
          <div className="pt-3 border-t border-slate-200 text-center font-sans text-xs">
            {mode === 'signin' && (
              <p className="text-slate-600">
                New user?{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="font-bold text-blue-600 hover:underline"
                >
                  Create an account
                </button>
              </p>
            )}
            {mode === 'signup' && (
              <p className="text-slate-600">
                Existing account?{' '}
                <button
                  onClick={() => setMode('signin')}
                  className="font-bold text-blue-600 hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
            {mode === 'forgot' && (
              <button
                onClick={() => setMode('signin')}
                className="font-bold text-blue-600 hover:underline"
              >
                Return to sign in
              </button>
            )}
          </div>

          {/* Immediate Demo Access */}
          <div className="p-3 bg-slate-100 border border-slate-300 flex items-center justify-between font-mono">
            <div>
              <p className="font-bold text-slate-900 uppercase text-[10px]">Instant Exploration</p>
              <p className="text-[10px] text-slate-500 font-sans">No registration required</p>
            </div>
            <button
              onClick={handleDemoLogin}
              className="px-3 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 uppercase"
            >
              Demo Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
