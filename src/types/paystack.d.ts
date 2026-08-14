// Shared type for the global window.PaystackPop object that Paystack's
// inline.js script attaches. Every file that uses Paystack imports this
// same declaration instead of writing its own copy — that's what stops
// the two from silently drifting out of sync (which is exactly what
// caused a build error before this file existed).
export {};

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: {
        key: string;
        email: string;
        amount: number;
        currency?: string;
        channels?: string[];
        subaccount?: string;
        ref?: string;
        metadata?: Record<string, unknown>;
        callback: (response: { reference: string }) => void;
        onClose: () => void;
      }) => { openIframe: () => void };
    };
  }
}
