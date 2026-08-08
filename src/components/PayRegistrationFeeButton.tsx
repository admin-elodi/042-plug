'use client';

import React, { useState } from 'react';
import { CreditCard, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: {
        key: string;
        email: string;
        amount: number;
        currency?: string;
        channels?: string[];
        ref?: string;
        metadata?: Record<string, unknown>;
        callback: (response: { reference: string }) => void;
        onClose: () => void;
      }) => { openIframe: () => void };
    };
  }
}

// Launch price — currently ₦1,000. Raise to ₦2,000 later by updating BOTH
// this value AND EXPECTED_AMOUNT_KOBO in supabase/functions/verify-shop-payment/index.ts.
const REGISTRATION_FEE = 1000;
const REGISTRATION_FEE_KOBO = REGISTRATION_FEE * 100;

const PAYSTACK_PUBLIC_KEY = 'pk_live_23025680948d678259aa2eb30b9055232052afd6';

interface PayRegistrationFeeButtonProps {
  shopId: string;
  businessName: string;
  userEmail: string;
  onSuccess: () => void;
}

export const PayRegistrationFeeButton: React.FC<PayRegistrationFeeButtonProps> = ({
  shopId,
  businessName,
  userEmail,
  onSuccess
}) => {
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [lastPaymentReference, setLastPaymentReference] = useState<string | null>(null);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const verifyPayment = async (reference: string) => {
    setPaying(true);
    setPaymentError(null);

    // Paystack's verify endpoint is safe to call repeatedly — it never
    // charges anything. If the payment genuinely succeeded but our own
    // network call has a brief hiccup, quietly retry before showing an error.
    const MAX_ATTEMPTS = 3;
    let lastError: unknown = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const { data, error } = await supabase.functions.invoke('verify-shop-payment', {
          body: { reference, shopId }
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        onSuccess();
        setPaying(false);
        return;
      } catch (err) {
        lastError = err;
        if (attempt < MAX_ATTEMPTS) {
          await sleep(1500 * attempt);
        }
      }
    }

    console.error(lastError);
    setPaymentError(
      lastError instanceof Error
        ? lastError.message
        : 'We could not confirm your payment automatically. If money left your account, tap "Try Verifying Again" below, or message us on WhatsApp with your reference number.'
    );
    setPaying(false);
  };

  const handlePayNow = () => {
    setPaymentError(null);

    if (!window.PaystackPop) {
      setPaymentError('Payment could not load. Please refresh the page and try again.');
      return;
    }

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: userEmail,
      amount: REGISTRATION_FEE_KOBO,
      currency: 'NGN',
      // Show every real payment method Nigerians actually use — bank transfer
      // and USSD first, card as an available option rather than the default.
      channels: ['bank_transfer', 'bank', 'ussd', 'mobile_money', 'card'],
      ref: `042plug-${shopId}-${Date.now()}`,
      metadata: { shop_id: shopId, business_name: businessName },
      callback: (response) => {
        setLastPaymentReference(response.reference);
        void verifyPayment(response.reference);
      },
      onClose: () => {
        // User closed the popup without completing payment — nothing to do.
      }
    });

    handler.openIframe();
  };

  return (
    <div>
      {paymentError && (
        <div className="mb-2 flex items-start gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-[11px]">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>{paymentError}</span>
        </div>
      )}

      {paymentError && lastPaymentReference && (
        <button
          onClick={() => verifyPayment(lastPaymentReference)}
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
        className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-stone-950 font-semibold text-xs transition-colors"
      >
        {paying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
        <span>
          {paying ? 'Confirming...' : lastPaymentReference ? 'Pay Again' : `Pay ₦${REGISTRATION_FEE.toLocaleString()} to Go Live`}
        </span>
      </button>

      {paymentError && lastPaymentReference && (
        <a
          href={`https://wa.me/2348136573235?text=${encodeURIComponent(
            `Hi, I paid the ₦${REGISTRATION_FEE.toLocaleString()} registration fee for "${businessName}" but it hasn't confirmed automatically.\n\nMy payment reference: ${lastPaymentReference}\n\nPlease check and approve my shop.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-full py-2 mt-1 text-[10px] text-stone-400 hover:text-amber-400 underline"
        >
          Still not working? Message us on WhatsApp with your reference
        </a>
      )}
    </div>
  );
};

export default PayRegistrationFeeButton;