'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, LogIn, UserPlus, Loader2, AlertCircle, MailCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-stone-800">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            {mode === 'signin' ? <LogIn className="w-5 h-5 text-amber-400" /> : <UserPlus className="w-5 h-5 text-amber-400" />}
            <span>{mode === 'signin' ? 'Vendor Sign In' : 'Create Vendor Account'}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {signupSuccess ? (
            <div className="text-center py-4">
              <MailCheck className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white mb-1">Check your email</h3>
              <p className="text-xs text-stone-400 mb-5">
                We sent a confirmation link to {email}. Confirm it, then sign in to start setting up your shop.
              </p>
              <button
                onClick={() => {
                  setSignupSuccess(false);
                  setMode('signin');
                }}
                className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-sm font-medium"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
              <div>
                <label className="block text-xs text-stone-400 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-400 mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-stone-950 font-semibold text-sm transition-colors"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{mode === 'signin' ? 'Sign In' : 'Sign Up'}</span>
              </button>
              <p className="text-center text-xs text-stone-400">
                {mode === 'signin' ? "Don't have a vendor account?" : 'Already have an account?'}{' '}
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