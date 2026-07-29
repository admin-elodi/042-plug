'use client';

import React from 'react';
import { ShoppingBag, Zap, ShieldCheck } from 'lucide-react';

interface HeroBannerProps {
  onOpenCreateShop?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onOpenCreateShop }) => {
  return (
    <div className="pt-6 sm:pt-8 pb-6 px-4 max-w-7xl mx-auto text-center">
      {/* Launch Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium mb-5 sm:mb-6">
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        <span>042Plug Platform Launching Soon</span>
      </div>

      {/* Main Headline (Single Line Mobile) */}
      <h1 className="text-xl xs:text-2xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-3 sm:mb-4 text-stone-100 leading-tight whitespace-nowrap">
        <span>Best Plugs in </span>
        <span className="text-amber-500">Coal City</span>
      </h1>

      {/* Feature Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto text-left text-xs">
        <div
          onClick={onOpenCreateShop}
          className="flex items-center gap-3 p-3 rounded-lg bg-stone-900/60 border border-stone-800 cursor-pointer hover:border-amber-500/30 transition-colors"
        >
          <ShoppingBag className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <div className="font-semibold text-stone-200">Verified Vendors</div>
            <div className="text-stone-400">Direct business contact</div>
          </div>
        </div>
        <div
          onClick={onOpenCreateShop}
          className="flex items-center gap-3 p-3 rounded-lg bg-stone-900/60 border border-stone-800 cursor-pointer hover:border-amber-500/30 transition-colors"
        >
          <Zap className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <div className="font-semibold text-stone-200">Instant Set Up</div>
            <div className="text-stone-400">Create shop in 3 steps</div>
          </div>
        </div>
        <div
          onClick={onOpenCreateShop}
          className="flex items-center gap-3 p-3 rounded-lg bg-stone-900/60 border border-stone-800 cursor-pointer hover:border-amber-500/30 transition-colors"
        >
          <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <div className="font-semibold text-stone-200">Local Reach</div>
            <div className="text-stone-400">Connect with local buyers</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;