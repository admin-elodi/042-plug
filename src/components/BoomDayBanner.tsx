'use client';

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, ArrowRight, Clock } from 'lucide-react';
import { useActiveBoomDay } from '@/hooks/useActiveBoomDay';

// The honest, general reason a Boom Day works — not a specific claim about
// results we haven't measured yet, just the real underlying mechanic.
const ECONOMIC_RATIONALE =
  'When everyone points buyers to one category at once, attention concentrates instead of scattering — every seller in that category gets seen, not just the loudest one.';

const getCountdown = (targetIso: string) => {
  const diffMs = new Date(targetIso).getTime() - Date.now();
  if (diffMs <= 0) return null;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  return { days, hours, minutes };
};

export const BoomDayBanner: React.FC = () => {
  const { boomDay, status } = useActiveBoomDay();
  const [countdown, setCountdown] = useState<{ days: number; hours: number; minutes: number } | null>(null);

  useEffect(() => {
    if (status !== 'upcoming' || !boomDay) {
      setCountdown(null);
      return;
    }
    const update = () => setCountdown(getCountdown(boomDay.start_at));
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [status, boomDay]);

  if (!boomDay || !status) return null;

  if (status === 'live') {
    return (
      <Link
        to={`/browse/${boomDay.category_id}`}
        className="group relative block overflow-hidden bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 bg-[length:200%_100%] animate-[boomShimmer_3s_ease-in-out_infinite]"
      >
        <style>{`
          @keyframes boomShimmer {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
        `}</style>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-center gap-2.5 text-center">
          <Flame className="w-4 h-4 text-stone-950 flex-shrink-0 animate-pulse" />
          <span className="text-xs sm:text-sm font-black text-stone-950 tracking-tight">
            {boomDay.headline || `BOOM DAY: ${boomDay.category_title} is Hot Right Now`}
          </span>
          <span className="hidden sm:flex items-center gap-1 text-xs font-bold text-stone-950 group-hover:gap-1.5 transition-all">
            <span>Shop Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </Link>
    );
  }

  // status === 'upcoming'
  return (
    <div className="bg-stone-900 border-y border-amber-500/20">
      <Link
        to={`/browse/${boomDay.category_id}`}
        className="group block max-w-7xl mx-auto px-4 py-3"
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-amber-300">
              {boomDay.headline || `${boomDay.category_title} Boom Day is Coming`}
            </span>
          </div>

          {countdown && (
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-300">
              <Clock className="w-3 h-3 text-stone-500" />
              <span>
                {countdown.days > 0 && `${countdown.days}d `}
                {countdown.hours}h {countdown.minutes}m to go
              </span>
            </div>
          )}
        </div>
        <p className="text-[10px] text-stone-500 text-center mt-1.5 max-w-md mx-auto leading-relaxed">
          {ECONOMIC_RATIONALE}
        </p>
      </Link>
    </div>
  );
};

export default BoomDayBanner;
