'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, FileCheck2, FileDown, ExternalLink } from 'lucide-react';
import { glassOverlay, glassCard, glassGlow, glassHeader, glassIconChip, glassCloseButton } from '@/styles/glassModal';

interface ResourcesModalProps {
  onClose: () => void;
}

export const ResourcesModal: React.FC<ResourcesModalProps> = ({ onClose }) => {
  return createPortal(
    <div className={glassOverlay}>
      <div className={`${glassCard} w-full max-w-sm`}>
        <div className={glassGlow} />

        <div className={glassHeader}>
          <div className="flex items-center gap-2.5 text-white font-bold text-base">
            <div className={glassIconChip}>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <span>Resources</span>
          </div>
          <button onClick={onClose} className={glassCloseButton}>
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="relative p-6 space-y-3">
          <div className="p-4 rounded-xl bg-white/[0.06] border border-white/15">
            <div className="flex items-center gap-2 mb-1">
              <FileCheck2 className="w-4 h-4 text-amber-400" />
              <p className="text-sm font-bold text-white">Get Your TIN</p>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed mb-2.5">
              Builds real trust with customers and banks - completely free to get.
            </p>
            <a
              href="https://taxid.nrs.gov.ng/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300"
            >
              <span>Get My TIN</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.06] border border-white/15">
            <div className="flex items-center gap-2 mb-1">
              <FileDown className="w-4 h-4 text-amber-400" />
              <p className="text-sm font-bold text-white">Seller Quick-Start Guide</p>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed mb-2.5">
              A one-page guide to making the most of your rented shop, in partnership with your Plaza managers.
            </p>
            <a
              href="/042-Plugs-Plaza-Seller-Guide.pdf"
              download="042 Plugs Plaza - Seller Guide.pdf"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300"
            >
              <span>Download PDF</span>
              <FileDown className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ResourcesModal;
