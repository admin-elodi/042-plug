'use client';

import React from 'react';
import { FileDown } from 'lucide-react';

// Anchored to the bottom-right corner with fixed pixel offsets, not a
// percentage-based vertical center - that combination is what causes
// floating buttons to visibly jitter on mobile, since vh-based centering
// recalculates every time the browser's address bar shows/hides during
// scroll. Bottom-right anchoring has no such dependency, so it stays
// genuinely still.
//
// A direct download link, not a button opening a modal - one click,
// no extra step, straight to the PDF sitting in /public.
export const TINFloatingButton: React.FC = () => {
  return (
    <a
      href="/042-Plugs-Plaza-Manual.pdf"
      download="042 Plugs Plaza - Manual.pdf"
      className="fixed bottom-5 right-4 sm:right-6 z-40 flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-md bg-stone-900/95 backdrop-blur-sm border border-stone-700 shadow-lg shadow-black/40 hover:bg-stone-800 transition-colors"
      aria-label="Download our manual"
    >
      <FileDown className="w-4 h-4 text-amber-400 flex-shrink-0" />
      <span className="text-xs font-bold text-white tracking-wide whitespace-nowrap">DOWNLOAD MANUAL</span>
    </a>
  );
};

export default TINFloatingButton;
