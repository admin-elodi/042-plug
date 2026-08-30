'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { X, TrendingUp, FileCheck2, Landmark, PiggyBank, Building2, ExternalLink } from 'lucide-react';
import { glassOverlay, glassCard, glassGlow, glassHeader, glassIconChip, glassCloseButton } from '@/styles/glassModal';

interface FinancialStepsModalProps {
  onClose: () => void;
}

interface StepOption {
  icon: React.ReactNode;
  title: string;
  description: string;
  link?: string;
  linkLabel?: string;
  link2?: string;
  link2Label?: string;
}

const STEPS: StepOption[] = [
  {
    icon: <FileCheck2 className="w-4 h-4 text-amber-400" />,
    title: 'Get Your TIN',
    description: 'Builds real trust with customers and banks - completely free to get.',
    link: 'https://taxid.nrs.gov.ng/',
    linkLabel: 'Get My TIN'
  },
  {
    icon: <Landmark className="w-4 h-4 text-amber-400" />,
    title: 'FGN Savings Bond',
    description: 'Government-backed, from as little as ₦5,000, with quarterly payouts.',
    link: 'https://www.dmo.gov.ng/fgn-bonds/savings-bond',
    linkLabel: 'See Current Offer'
  },
  {
    icon: <PiggyBank className="w-4 h-4 text-amber-400" />,
    title: 'Money Market Funds',
    description: 'Low-risk, easy-access savings funds run by licensed managers - ask your bank or any SEC-registered fund manager.'
  },
  {
    icon: <Building2 className="w-4 h-4 text-amber-400" />,
    title: 'Register Your Business',
    description:
      'CAC gives your business legal recognition (business name registration). SMEDAN currently has a partnership offering free registration for qualifying small businesses - worth checking while it lasts.',
    link: 'https://cac.gov.ng/services/business-name',
    linkLabel: 'Start with CAC',
    link2: 'https://smedan.gov.ng/',
    link2Label: 'Check SMEDAN'
  }
];

export const FinancialStepsModal: React.FC<FinancialStepsModalProps> = ({ onClose }) => {
  return createPortal(
    <div className={glassOverlay}>
      <div className={`${glassCard} w-full max-w-sm max-h-[85vh] overflow-y-auto`}>
        <div className={glassGlow} />

        <div className={glassHeader}>
          <div className="flex items-center gap-2.5 text-white font-bold text-base">
            <div className={glassIconChip}>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <span>Smart Money Moves</span>
          </div>
          <button onClick={onClose} className={glassCloseButton}>
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="relative p-6">
          <p className="text-xs text-stone-400 mb-4">
            A few free or low-cost steps worth knowing about, at any stage of building your business:
          </p>

          <div className="space-y-2.5">
            {STEPS.map((step, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/[0.06] border border-white/15">
                <div className="flex items-center gap-2 mb-1">
                  {step.icon}
                  <p className="text-xs font-bold text-white">{step.title}</p>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed mb-2">{step.description}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  {step.link && (
                    <a
                      href={step.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300"
                    >
                      <span>{step.linkLabel}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {step.link2 && (
                    <a
                      href={step.link2}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300"
                    >
                      <span>{step.link2Label}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-stone-500 text-center mt-4 leading-relaxed">
            General information only, not financial advice - always do your own research before committing money.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default FinancialStepsModal;
