// Shared glassmorphic design tokens for every modal in the app. Import
// these instead of writing new className strings from scratch — this is
// what keeps AuthModal, CreateShopModal, SalariedJobsModal, etc. all
// looking like one consistent system instead of quietly drifting apart
// over time.

export const glassOverlay = 'fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-md p-4';

// Base card shell — pair with a max-w-* and w-full on the element itself,
// since that's the one thing that legitimately varies per modal.
export const glassCard =
  'relative bg-stone-800/60 backdrop-blur-2xl border border-amber-500/15 rounded-[28px] overflow-hidden shadow-2xl shadow-black/40';

// The soft blurred amber orb that sits behind every modal's content.
export const glassGlow = 'pointer-events-none absolute -top-24 -right-24 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl';

export const glassHeader = 'relative flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/15';

// Use when the header needs to stay pinned while the body scrolls
// (longer modals like CreateShopModal/AddProductModal).
export const glassHeaderSticky = `${glassHeader} sticky top-0 bg-stone-800/70 backdrop-blur-2xl z-10`;

export const glassIconChip = 'p-1.5 rounded-xl bg-amber-400/10 border border-amber-400/20';

// Bigger centered icon chip used for empty/success/prompt states.
export const glassIconChipLarge = (color: 'amber' | 'emerald' | 'red' | 'stone' = 'amber') => {
  const colors = {
    amber: 'bg-amber-400/10 border-amber-400/20 text-amber-400',
    emerald: 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400',
    red: 'bg-red-400/10 border-red-400/20 text-red-400',
    stone: 'bg-white/10 border-white/20 text-stone-400'
  };
  return `w-16 h-16 mx-auto mb-4 rounded-2xl border flex items-center justify-center ${colors[color]}`;
};

export const glassCloseButton = 'p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors';

export const glassInput =
  'w-full px-3 py-2 bg-white/[0.07] backdrop-blur-sm border border-white/15 rounded-xl text-white text-sm ' +
  'placeholder:text-stone-400 focus:outline-none focus:border-amber-400/60 focus:bg-white/[0.1] transition-colors';

export const glassInputWithIcon = `${glassInput} pr-10`;

export const glassLabel = 'block text-xs text-stone-400 mb-1.5';

export const glassButtonPrimary =
  'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 ' +
  'hover:from-amber-300 hover:to-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-stone-950 ' +
  'font-semibold text-sm transition-colors shadow-lg shadow-amber-500/20';

export const glassButtonSecondary =
  'px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur border border-white/20 hover:bg-white/15 ' +
  'text-white text-sm font-medium transition-colors';

export const glassErrorBox =
  'flex items-start gap-2 p-3 rounded-xl bg-red-500/10 backdrop-blur-sm border border-red-500/20 text-red-300 text-xs';

export const glassDashedUpload =
  'flex items-center justify-center gap-2 w-full px-3 py-4 bg-white/[0.06] backdrop-blur-sm border border-dashed ' +
  'border-white/20 rounded-xl text-stone-400 text-xs cursor-pointer hover:border-amber-400/40 hover:text-amber-400 transition-colors';

export const glassMediaThumb = 'relative group aspect-square rounded-xl overflow-hidden bg-white/[0.06] border border-white/15';

// Tab selector pattern (used by SalariedJobsModal's Browse/Post toggle).
export const glassTabActive = 'bg-gradient-to-b from-amber-400 to-amber-500 text-stone-950 shadow-md';
export const glassTabInactive = 'text-stone-400 hover:text-stone-200';
export const glassTabContainer = 'grid grid-cols-2 gap-2 p-1 bg-white/[0.05] backdrop-blur-sm rounded-lg border border-white/10';