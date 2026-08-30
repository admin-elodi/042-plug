'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { X, FileCheck2, MessageCircle, Clock, ShieldCheck, TrendingUp } from 'lucide-react';
import { glassOverlay, glassCard, glassGlow, glassHeader, glassIconChip, glassCloseButton, glassButtonPrimary } from '@/styles/glassModal';

interface TINRequestModalProps {
  businessName: string;
  onClose: () => void;
}

const TIN_WHATSAPP_NUMBER = '2348136573235';

export const TINRequestModal: React.FC<TINRequestModalProps> = ({ businessName, onClose }) => {
  const message = `Hi! I just registered "${businessName}" on 042 Plugs Plaza and I'd like help getting my TIN. I understand it takes about 5 minutes - please guide me through it.`;

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
          <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-amber-400/10 border border-amber-400/20 w-fit">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-amber-300">Takes about 5 minutes</span>
          </div>

          <p className="text-sm text-stone-300 leading-relaxed mb-4">
            A Tax Identification Number makes <span className="text-white font-semibold">{businessName}</span> look
            more established to customers and partners - and it opens doors down the line, from bank loans to
            bigger contracts.
          </p>

          <div className="space-y-2.5 mb-5">
            <div className="flex items-start gap-2.5 text-xs text-stone-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>We walk you through it directly on WhatsApp - no forms, no offices to visit</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-stone-400">
              <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>A registered business is easier to trust - for customers and future partners alike</span>
            </div>
          </div>

          <a
            href={`https://wa.me/${TIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className={glassButtonPrimary}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Start on WhatsApp - 5 Minutes</span>
          </a>

          <p className="text-[10px] text-stone-500 text-center mt-3">
            Changed your mind? No problem - you can always come back to this from "My Shops" anytime.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TINRequestModal;
