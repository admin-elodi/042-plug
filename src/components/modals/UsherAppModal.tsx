'use client';

import React, { useState } from 'react';
import { X, CheckCircle, UserCheck } from 'lucide-react';

interface UsherAppModalProps {
  onClose: () => void;
}

export const UsherAppModal: React.FC<UsherAppModalProps> = ({ onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    experience: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Connect Supabase or database submission here
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <span>Usher Application</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Chidimma Okoh"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Phone / WhatsApp</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g., 08012345678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Ushering/Event Experience</label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe previous protocol or event work..."
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-colors"
              >
                Submit Application
              </button>
            </form>
          ) : (
            <div className="text-center py-6">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">Application Received!</h3>
              <p className="text-xs text-slate-400 mb-6">Our launch team will review your details and contact you via WhatsApp.</p>
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium"
              >
                Back to Portal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsherAppModal;