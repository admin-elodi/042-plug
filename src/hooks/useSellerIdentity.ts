'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

// If the currently signed-in visitor also owns a shop, returns that shop's
// name - used to add a friendly "I'm also a 042 Plugs seller" line onto
// outgoing WhatsApp order messages. Returns null for logged-out visitors
// or sellers with no shop of their own.
export const useSellerIdentity = (): string | null => {
  const { user } = useAuth();
  const [myShopName, setMyShopName] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setMyShopName(null);
      return;
    }

    let cancelled = false;

    const checkOwnership = async () => {
      const { data } = await supabase
        .from('shops')
        .select('business_name')
        .eq('owner_id', user.id)
        .eq('payment_status', 'approved')
        .limit(1)
        .maybeSingle();

      if (cancelled) return;
      setMyShopName(data?.business_name ?? null);
    };

    checkOwnership();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return myShopName;
};