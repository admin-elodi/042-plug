'use client';

import React from 'react';
import { X, Briefcase, Users, Sparkles, ArrowRight } from 'lucide-react';

interface JobsPortalModalProps {
  onClose: () => void;
  onApplyUsher: () => void;
}

export const JobsPortalModal: React.FC<JobsPortalModalProps> = ({ onClose, onApplyUsher }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Briefcase className="w-5 h-5 text-emerald-400" />
            <span>Opportunities & Job Portal</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Featured Launch Usher Opportunity */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/30">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold w-fit mb-3">
              <Sparkles className="w-3 h-3" />
              <span>Website Launch Event Opportunity</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Paid Event Ushers (7 Openings)</h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              We are seeking 7 professional ushers to assist with guest reception and protocol during our official launch event. Paid role with provided outfit guidelines.
            </p>
            <button
              onClick={onApplyUsher}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors"
            >
              <span>Apply for Usher Position</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* General Opportunities Note */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs flex items-start gap-3">
            <Users className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-200 mb-0.5">More Roles Coming Soon</div>
              <div>Social media managers, sales associates, and delivery logistics partners will open enrollment shortly.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobsPortalModal;