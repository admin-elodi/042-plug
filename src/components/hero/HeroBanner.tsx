'use client';

import React from 'react';
import { ShoppingBag, Zap, ShieldCheck, UtensilsCrossed, Smartphone, Umbrella } from 'lucide-react';
// Save your chosen photo in src/assets/images/ and update this path/extension
// to match (e.g. herob.jpg, herob.webp, herob.png).
import heroImage from '@/assets/images/herobanner.jpg';

interface HeroBannerProps {
  onOpenCreateShop?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onOpenCreateShop }) => {
  return (
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

      {/* Floating signage badges — stand in for real storefront signs (fashion,
          restaurant, tech, POS agent umbrellas) without needing an actual photo
          of all four together. Hidden on small screens to avoid crowding the
          headline on mobile. */}
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

        {/* Main Headline (Single Line Mobile) */}
        <h1 className="text-xl xs:text-2xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-3 sm:mb-4 text-stone-100 leading-tight whitespace-nowrap drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)]">
          <span>Best Plugs in </span>
          <span className="text-amber-500 drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)]">
            Coal City
          </span>
          
        </h1>
        <p className="text-sm md:text-3xl mb-2 tracking-widest drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)]">
            Buy & Sell or Search for Jobs
        </p>

        {/* Feature Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto text-left text-xs">
          <div
            onClick={onOpenCreateShop}
            className="flex items-center gap-3 p-3 rounded-lg bg-black/70 border border-stone-700 cursor-pointer hover:border-amber-500/30 transition-colors backdrop-blur-md shadow-lg shadow-black/50"
          >
            <ShoppingBag className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <div className="font-semibold text-stone-200">Verified Vendors</div>
              <div className="text-stone-400">Direct business contact</div>
            </div>
          </div>

          <div
            onClick={onOpenCreateShop}
            className="flex items-center gap-3 p-3 rounded-lg bg-black/70 border border-stone-700 cursor-pointer hover:border-amber-500/30 transition-colors backdrop-blur-md shadow-lg shadow-black/50"
          >
            <Zap className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <div className="font-semibold text-stone-200">Instant Set Up</div>
              <div className="text-stone-400">Create shop in 3 steps</div>
            </div>
          </div>

          <div
            onClick={onOpenCreateShop}
            className="flex items-center gap-3 p-3 rounded-lg bg-black/70 border border-stone-700 cursor-pointer hover:border-amber-500/30 transition-colors backdrop-blur-md shadow-lg shadow-black/50"
          >
            <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <div className="font-semibold text-stone-200">Local Reach</div>
              <div className="text-stone-400">Connect with local buyers</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;