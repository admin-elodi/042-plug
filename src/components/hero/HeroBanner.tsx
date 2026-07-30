'use client';

import React, { useState } from 'react';
import { ShoppingBag, Briefcase, UtensilsCrossed, Smartphone, Umbrella, Search, PlusCircle } from 'lucide-react';
import heroImage from '@/assets/images/herobanner.jpg';
import { SalariedJobsModal } from '@/components/modals/SalariedJobsModal';

interface HeroBannerProps {
  onOpenCreateShop?: () => void;
  onOpenJobs?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onOpenCreateShop, onOpenJobs }) => {
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);

  const handleOpenJobsModal = () => {
    setIsJobModalOpen(true);
    if (onOpenJobs) onOpenJobs();
  };

  return (
    <>
      <div className="relative overflow-hidden min-h-[440px] sm:min-h-[560px] flex items-center">
        {/* Background photo */}
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Dark wash so the amber/white text and pills stay readable over the photo */}
        <div className="absolute inset-0 bg-black/65" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/70 to-black/50" />

        {/* Floating signage badges */}
        <div
          className="hidden sm:flex items-center gap-1.5 absolute top-8 left-4 md:left-10 -rotate-6 bg-stone-900/70 backdrop-blur-sm border border-stone-700 rounded-lg px-3 py-1.5 shadow-lg shadow-black/40 z-10 pointer-events-none"
        >
          <ShoppingBag className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-stone-100">Fashion</span>
        </div>

        <div
          className="hidden sm:flex items-center gap-1.5 absolute top-14 right-4 md:right-12 rotate-3 bg-stone-900/70 backdrop-blur-sm border border-stone-700 rounded-lg px-3 py-1.5 shadow-lg shadow-black/40 z-10 pointer-events-none"
        >
          <UtensilsCrossed className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-stone-100">Restaurant</span>
        </div>

        <div
          className="hidden sm:flex items-center gap-1.5 absolute bottom-10 left-6 md:left-16 rotate-3 bg-stone-900/70 backdrop-blur-sm border border-stone-700 rounded-lg px-3 py-1.5 shadow-lg shadow-black/40 z-10 pointer-events-none"
        >
          <Smartphone className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-stone-100">Tech</span>
        </div>

        <div
          className="hidden sm:flex items-center gap-1.5 absolute bottom-16 right-6 md:right-20 -rotate-3 bg-stone-900/70 backdrop-blur-sm border border-stone-700 rounded-lg px-3 py-1.5 shadow-lg shadow-black/40 z-10 pointer-events-none"
        >
          <Umbrella className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-stone-100">POS Agent</span>
        </div>

        {/* Content sits above the photo + overlay */}
        <div className="relative z-10 w-full pt-6 sm:pt-8 pb-6 px-4 max-w-7xl mx-auto text-center">
          {/* Launch Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-amber-500/40 text-amber-400 text-xs font-medium mb-5 sm:mb-6 shadow-lg shadow-black/60">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>042Plug Platform Launching Soon</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-xl xs:text-2xl sm:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 text-stone-100 leading-tight whitespace-nowrap drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)]">
            <span className="inline-block tracking-[0.15em]">Best Plugs in </span>{' '}
            <span className="inline-block tracking-[0.15em] text-amber-500 drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)]">
              Coal City
            </span>
          </h1>

          <p className="text-sm md:text-3xl mb-6 tracking-widest text-stone-200 drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)]">
            Buy & Sell or Search for Jobs
          </p>

          {/* Action Cards Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto text-left">
            {/* 1. Salaried Jobs Card */}
            <div
              onClick={handleOpenJobsModal}
              className="flex items-center justify-between gap-3 p-4 rounded-xl bg-black/75 border border-stone-700/80 hover:border-amber-500/50 transition-all backdrop-blur-md shadow-xl shadow-black/60 group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0 group-hover:bg-amber-500 group-hover:text-black transition-colors">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-stone-100 text-sm">
                    Salaried Jobs
                  </div>
                  <div className="text-xs text-stone-400 mt-0.5">
                    Browse vacancy posts or recruit talent
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-300 hover:bg-amber-400 text-stone-950 font-semibold text-xs transition-colors shadow-md"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Explore</span>
              </button>
            </div>

            {/* 2. Business Spot / Store Creation Card */}
            <div
              onClick={onOpenCreateShop}
              className="flex items-center justify-between gap-3 p-4 rounded-xl bg-black/75 border border-stone-700/80 hover:border-amber-500/50 transition-all backdrop-blur-md shadow-xl shadow-black/60 group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0 group-hover:bg-amber-500 group-hover:text-black transition-colors">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-stone-100 text-sm">
                    Merchants
                  </div>
                  <div className="text-xs text-stone-400 mt-0.5">
                    Open your digital shop in minutes
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-600 text-stone-200 font-semibold text-xs transition-colors shadow-md"
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Create Shop</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Imported Salaried Jobs Modal */}
      <SalariedJobsModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
      />
    </>
  );
};

export default HeroBanner;