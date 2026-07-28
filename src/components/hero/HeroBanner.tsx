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
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-5 sm:mb-6">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>042Plug Platform Launching Soon</span>
      </div>

      {/* Main Headline with Hot Coals Effect (Single Line Mobile) */}
      <h1 className="text-xl xs:text-2xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-3 sm:mb-4 text-white leading-tight whitespace-nowrap">
        <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
          Best Plugs in{' '}
        </span>
        <span className="relative inline-block bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(249,115,22,0.8)] animate-pulse">
          Coal City
        </span>
      </h1>

      {/* Feature Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto text-left text-xs">
        <div 
          onClick={onOpenCreateShop}
          className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors"
        >
          <ShoppingBag className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="font-semibold text-slate-200">Verified Vendors</div>
            <div className="text-slate-400">Direct business contact</div>
          </div>
        </div>
        <div 
          onClick={onOpenCreateShop}
          className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors"
        >
          <Zap className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <div className="font-semibold text-slate-200">Instant Set Up</div>
            <div className="text-slate-400">Create shop in 3 steps</div>
          </div>
        </div>
        <div 
          onClick={onOpenCreateShop}
          className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors"
        >
          <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
          <div>
            <div className="font-semibold text-slate-200">Local Reach</div>
            <div className="text-slate-400">Connect with local buyers</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;