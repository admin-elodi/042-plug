'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface BoomDay {
  id: string;
  category_id: string;
  category_title: string;
  headline: string | null;
  start_at: string;
  end_at: string;
}

export type BoomDayStatus = 'live' | 'upcoming' | null;

interface BoomDayState {
  boomDay: BoomDay | null;
  status: BoomDayStatus;
}

// Returns whichever Boom Day is most relevant right now: a currently LIVE
// one takes priority, otherwise the soonest UPCOMING one (so the site can
// announce it and count down, well before it actually starts).
export const useActiveBoomDay = (): BoomDayState => {
  const [state, setState] = useState<BoomDayState>({ boomDay: null, status: null });

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const now = new Date().toISOString();

      // A currently-live Boom Day always takes priority.
      const { data: live } = await supabase
        .from('boom_days')
        .select('id, category_id, category_title, headline, start_at, end_at')
        .lte('start_at', now)
        .gte('end_at', now)
        .order('start_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (live) {
        setState({ boomDay: live as BoomDay, status: 'live' });
        return;
      }

      // Otherwise, announce the soonest one still to come.
      const { data: upcoming } = await supabase
        .from('boom_days')
        .select('id, category_id, category_title, headline, start_at, end_at')
        .gt('start_at', now)
        .order('start_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!cancelled) {
        setState(upcoming ? { boomDay: upcoming as BoomDay, status: 'upcoming' } : { boomDay: null, status: null });
      }
    };

    check();
    // Re-check periodically so the banner transitions itself from
    // "upcoming" to "live" to gone, with no page reload needed.
    const interval = setInterval(check, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return state;
};
