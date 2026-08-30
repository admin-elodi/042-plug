'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { X, FileCheck2, ExternalLink } from 'lucide-react';
import { glassOverlay, glassCard, glassGlow, glassHeader, glassIconChip, glassCloseButton, glassButtonPrimary } from '@/styles/glassModal';

interface TINRequestModalProps {
  onClose: () => void;
}

export const TINRequestModal: React.FC<TINRequestModalProps> = ({ onClose }) => {
  return createPortal(
    <div className={glassOverlay}>
      <div className={`${glassCard} w-full max-w-sm`}>
        <div className={glassGlow} />

        <div className={glassHeader}>
          <div className="flex items-center gap-2.5 text-white font-bold text-base">
            <div className={glassIconChip}>
              <FileCheck2 className="w-4 h-4 text-amber-400" />
            </div>
            <span>Get Your TIN</span>
          </div>
          <button onClick={onClose} className={glassCloseButton}>
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="relative p-6">
          <p className="text-sm text-stone-300 leading-relaxed mb-5">
            A TIN builds real trust with customers and banks - and it's completely free to get.
          </p>

          <a
            href="https://taxid.nrs.gov.ng/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className={glassButtonPrimary}
          >
            <ExternalLink className="w-4 h-4" />
            <span>Get My TIN - It's Free</span>
          </a>

          <p className="text-[10px] text-stone-500 text-center mt-3">
            You'll be taken to the official government TIN portal.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TINRequestModal;
