// Captures a ?ref=<code> from the URL the moment someone lands on the
// site, and remembers it in localStorage — so even if they browse around
// for a while before actually registering a shop, we still know which
// partner group's link brought them here.
const REFERRAL_STORAGE_KEY = '042plug_referral_code';

export const captureReferralFromUrl = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem(REFERRAL_STORAGE_KEY, ref);
    }
  } catch {
    // localStorage unavailable — referral just won't be tracked this visit.
  }
};

export const getStoredReferralCode = (): string | null => {
  try {
    return localStorage.getItem(REFERRAL_STORAGE_KEY);
  } catch {
    return null;
  }
};
