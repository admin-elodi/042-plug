'use client';

import React, { useEffect, useState } from 'react';
import { Flame, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface BoomDaySellerNoticeProps {
  shopId: string;
  categoryId: string;
  categoryTitle: string;
  isPaid: boolean;
  hasProducts: boolean;
  hasPhotos: boolean;
}

interface RelevantBoomDay {
  headline: string | null;
  start_at: string;
  status: 'live' | 'upcoming';
}

// Shown automatically inside "My Shops" the moment a seller's own category
// has a Boom Day coming or already live - no admin action needed for this
// half of seller prep, it just appears on its own.
export const BoomDaySellerNotice: React.FC<BoomDaySellerNoticeProps> = ({
  categoryId,
  categoryTitle,
  isPaid,
  hasProducts,
  hasPhotos
}) => {
  const [boomDay, setBoomDay] = useState<RelevantBoomDay | null>(null);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const now = new Date().toISOString();

      const { data: live } = await supabase
        .from('boom_days')
        .select('headline, start_at, end_at')
        .eq('category_id', categoryId)
        .lte('start_at', now)
        .gte('end_at', now)
        .maybeSingle();

      if (cancelled) return;
      if (live) {
        setBoomDay({ headline: live.headline, start_at: live.start_at, status: 'live' });
        return;
      }

      const { data: upcoming } = await supabase
        .from('boom_days')
        .select('headline, start_at')
        .eq('category_id', categoryId)
        .gt('start_at', now)
        .order('start_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!cancelled) {
        setBoomDay(upcoming ? { headline: upcoming.headline, start_at: upcoming.start_at, status: 'upcoming' } : null);
      }
    };

    check();
    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  if (!boomDay) return null;

  const checklist = [
    { label: 'Shop fully paid and live', done: isPaid },
    { label: 'At least one product listed', done: hasProducts },
    { label: 'Products have photos', done: hasPhotos }
  ];

  return (
    <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30">
      <div className="flex items-center gap-2 mb-2">
        <Flame className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <p className="text-xs font-bold text-amber-300">
          {boomDay.status === 'live'
            ? `${categoryTitle} Boom Day is LIVE right now!`
            : `${categoryTitle} Boom Day is coming on ${new Date(boomDay.start_at).toLocaleDateString()}`}
        </p>
      </div>
      <p className="text-[11px] text-stone-400 mb-2">
        We're pushing real traffic to your category. Here's your readiness checklist:
      </p>
      <div className="space-y-1">
        {checklist.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[11px]">
            {item.done ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
            )}
            <span className={item.done ? 'text-stone-300' : 'text-stone-400'}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BoomDaySellerNotice;
