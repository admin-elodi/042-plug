'use client';

import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import FinancialStepsModal from '@/components/modals/FinancialStepsModal';

// A persistent edge tab, always available regardless of where someone is
// in their journey - not tied to shop registration or any other flow.
export const TINFloatingButton: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-1 px-2 py-3 rounded-l-xl bg-gradient-to-b from-amber-400 to-amber-500 text-stone-950 shadow-lg shadow-amber-500/25 hover:pr-3 transition-all"
        aria-label="Smart money moves"
      >
        <TrendingUp className="w-4 h-4 flex-shrink-0" />
        <span className="text-[9px] font-black leading-[1.1] text-center">
          Money<br />Tips
        </span>
      </button>

      {showModal && <FinancialStepsModal onClose={() => setShowModal(false)} />}
    </>
  );
};

export default TINFloatingButton;
