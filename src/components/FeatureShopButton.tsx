'use client';

import React, { useState } from 'react';
import { Sparkles, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

// Starting price - ₦500 for 7 days. Update this (and the matching constant
// in supabase/functions/verify-feature-payment/index.ts) together.
const FEATURE_FEE = 500;
const FEATURE_FEE_KOBO = FEATURE_FEE * 100;
const FEATURE_DURATION_DAYS = 7;

const PAYSTACK_PUBLIC_KEY = 'pk_live_23025680948d678259aa2eb30b9055232052afd6';

interface FeatureShopButtonProps {
  shopId: string;
  businessName: string;
  userEmail: string;
  isCurrentlyFeatured: boolean;
  onSuccess: (featuredUntil: string) => void;
}

export const FeatureShopButton: React.FC<FeatureShopButtonProps> = ({
  shopId,
  businessName,
  userEmail,
  isCurrentlyFeatured,
  onSuccess
}) => {
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastReference, setLastReference] = useState<string | null>(null);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const verifyPayment = async (reference: string) => {
    setPaying(true);
    setError(null);

    const MAX_ATTEMPTS = 3;
    let lastError: unknown = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const { data, error: fnError } = await supabase.functions.invoke('verify-feature-payment', {
          body: { reference, shopId }
        });
        if (fnError) throw fnError;
        if (data?.error) throw new Error(data.error);

        onSuccess(data.featuredUntil);
        setPaying(false);
        return;
      } catch (err) {
        lastError = err;
        if (attempt < MAX_ATTEMPTS) await sleep(1500 * attempt);
      }
    }

    console.error(lastError);
    setError(
      lastError instanceof Error
        ? lastError.message
        : 'Could not confirm payment automatically. Tap "Try Verifying Again" below, or message us on WhatsApp with your reference.'
    );
    setPaying(false);
  };

  const handlePayNow = () => {
    setError(null);

    if (!window.PaystackPop) {
      setError('Payment could not load. Please refresh the page and try again.');
      return;
    }

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: userEmail,
      amount: FEATURE_FEE_KOBO,
      currency: 'NGN',
      // Show every real payment method Nigerians actually use - bank transfer
      // and USSD first, card as an available option rather than the default.
      channels: ['bank_transfer', 'bank', 'ussd', 'mobile_money', 'card'],
      ref: `042plug-feature-${shopId}-${Date.now()}`,
      metadata: { shop_id: shopId, business_name: businessName, purpose: 'featured_listing' },
      callback: (response) => {
        setLastReference(response.reference);
        void verifyPayment(response.reference);
      },
      onClose: () => {}
    });

    handler.openIframe();
  };

  return (
    <div>
      {error && (
        <div className="mb-2 flex items-start gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-[11px]">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {error && lastReference && (
        <button
          onClick={() => verifyPayment(lastReference)}
          disabled={paying}
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-60 text-white text-xs font-semibold transition-colors mb-2 border border-amber-500/30"
        >
          {paying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5 text-amber-400" />}
          <span>Try Verifying Again</span>
        </button>
      )}

      <button
        onClick={handlePayNow}
        disabled={paying}
        className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-60 text-amber-400 border border-amber-500/30 font-semibold text-xs transition-colors"
      >
        {paying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
        <span>
          {paying
            ? 'Confirming...'
            : isCurrentlyFeatured
            ? `Extend Featured +${FEATURE_DURATION_DAYS} Days (₦${FEATURE_FEE})`
            : `Get Featured - ₦${FEATURE_FEE} / ${FEATURE_DURATION_DAYS} Days`}
        </span>
      </button>
    </div>
  );
};

export default FeatureShopButton;