'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, LogIn, UserPlus, Loader2, AlertCircle, MailCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AuthModalProps {
  onClose: () => void;
}

// Same shared glass treatment used across the app's modals - frosted,
// translucent, brightens gently on focus.
const glassInput =
  'w-full px-3 py-2 pr-10 bg-white/[0.07] backdrop-blur-sm border border-white/15 rounded-xl text-white text-sm ' +
  'placeholder:text-stone-400 focus:outline-none focus:border-amber-400/60 focus:bg-white/[0.1] transition-colors';

const glassLabel = 'block text-xs text-stone-400 mb-1.5';

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    const result = mode === 'signin' ? await signIn(email, password) : await signUp(email, password);

    setSubmitting(false);

    if (result.error) {
      setErrorMsg(result.error);
      return;
    }

    if (mode === 'signup') {
      setSignupSuccess(true);
    } else {
      onClose();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-md p-4">
      <div className="relative bg-stone-800/60 backdrop-blur-2xl border border-amber-500/15 rounded-[28px] w-full max-w-sm overflow-hidden shadow-2xl shadow-black/40">
        {/* subtle ambient glow, purely decorative, sits behind everything */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl" />

        <div className="relative flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/15">
          <div className="flex items-center gap-2.5 text-white font-bold text-base">
            <div className="p-1.5 rounded-xl bg-amber-400/10 border border-amber-400/20">
              {mode === 'signin' ? <LogIn className="w-4 h-4 text-amber-400" /> : <UserPlus className="w-4 h-4 text-amber-400" />}
            </div>
            <span>{mode === 'signin' ? 'Seller Sign In' : 'Create Seller Account'}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="relative p-6">
          {signupSuccess ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
                <MailCheck className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Check your email</h3>
              <p className="text-xs text-stone-400 mb-5">
                We sent a confirmation link to {email}. Confirm it, then sign in to start setting up your shop.
              </p>
              <button
                onClick={() => {
                  setSignupSuccess(false);
                  setMode('signin');
                }}
                className="px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur border border-white/20 hover:bg-white/15 text-white text-sm font-medium transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 backdrop-blur-sm border border-red-500/20 text-red-300 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
              <div>
                <label className={glassLabel}>Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.07] backdrop-blur-sm border border-white/15 rounded-xl text-white text-sm placeholder:text-stone-400 focus:outline-none focus:border-amber-400/60 focus:bg-white/[0.1] transition-colors"
                />
              </div>
              <div>
                <label className={glassLabel}>Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={glassInput}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-60 text-stone-950 font-semibold text-sm transition-colors shadow-lg shadow-amber-500/20"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{mode === 'signin' ? 'Sign In' : 'Sign Up'}</span>
              </button>
              <p className="text-center text-xs text-stone-400">
                {mode === 'signin' ? "Don't have a seller account?" : 'Already have an account?'}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'signin' ? 'signup' : 'signin');
                    setErrorMsg(null);
                  }}
                  className="text-amber-400 hover:text-amber-300 font-medium"
                >
                  {mode === 'signin' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AuthModal;