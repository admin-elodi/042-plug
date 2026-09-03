'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FileDown, Download, X } from 'lucide-react';
import { glassOverlay, glassCard, glassGlow, glassCloseButton } from '@/styles/glassModal';

// Anchored to the bottom-right corner with fixed pixel offsets, not a
// percentage-based vertical center - that combination is what causes
// floating buttons to visibly jitter on mobile, since vh-based centering
// recalculates every time the browser's address bar shows/hides during
// scroll. Bottom-right anchoring has no such dependency, so it stays
// genuinely still.
export const TINFloatingButton: React.FC = () => {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="fixed bottom-5 right-4 sm:right-6 z-40 flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-md bg-stone-900/95 backdrop-blur-sm border border-stone-700 shadow-lg shadow-black/40 hover:bg-stone-800 transition-colors"
        aria-label="Download our manual"
      >
        <FileDown className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <span className="text-xs font-bold text-white tracking-wide whitespace-nowrap">DOWNLOAD MANUAL</span>
      </button>

      {showConfirm &&
        createPortal(
          <div className={glassOverlay}>
            <div className={`${glassCard} w-full max-w-xs`}>
              <div className={glassGlow} />
              <div className="relative p-6 text-center">
                <button onClick={() => setShowConfirm(false)} className={`${glassCloseButton} absolute top-3 right-3`}>
                  <X className="w-4 h-4" />
                </button>

                <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                  <FileDown className="w-6 h-6 text-amber-400" />
                </div>

                <h3 className="text-sm font-bold text-white mb-1">Download the Manual?</h3>
                <p className="text-xs text-stone-400 mb-5">
                  A one-page guide to getting the most out of 042 Plugs Plaza.
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="py-2.5 rounded-xl bg-white/10 backdrop-blur border border-white/20 hover:bg-white/15 text-white text-sm font-semibold transition-colors"
                  >
                    No
                  </button>
                  <a
                    href="/042-Plugs-Plaza-Manual.pdf"
                    download="042 Plugs Plaza - Manual.pdf"
                    onClick={() => setShowConfirm(false)}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 text-sm font-bold transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Yes</span>
                  </a>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default TINFloatingButton;
