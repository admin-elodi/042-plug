'use client';

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Flame, Loader2, AlertCircle, LogIn, ShieldCheck, Plus, Trash2, Copy, CheckCircle, TrendingUp, Users, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/modals/AuthModal';
import CATEGORIES from '@/data/categories';
import { buildWhatsAppLink } from '@/lib/whatsapp';

const ADMIN_EMAIL = 'ikezion@gmail.com';

interface BoomDay {
  id: string;
  category_id: string;
  category_title: string;
  headline: string | null;
  start_at: string;
  end_at: string;
  baseline_view_count: number;
}

interface CategorySeller {
  id: string;
  business_name: string;
  phone: string;
  view_count: number;
}

const toDatetimeLocal = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const emptyForm = {
  categoryId: CATEGORIES[0]?.id ?? '',
  headline: '',
  startAt: toDatetimeLocal(new Date()),
  endAt: toDatetimeLocal(new Date(Date.now() + 24 * 60 * 60 * 1000))
};

// Fetches every live shop in a category and sums their view counts - used
// both for the baseline snapshot at scheduling time and for the live
// results comparison afterward.
const getCategoryViewTotal = async (categoryId: string): Promise<number> => {
  const { data } = await supabase
    .from('shops')
    .select('view_count')
    .eq('category_id', categoryId)
    .eq('payment_status', 'approved');

  return (data ?? []).reduce((sum, s) => sum + (s.view_count ?? 0), 0);
};

export const AdminBoomDaysPage: React.FC = () => {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [boomDays, setBoomDays] = useState<BoomDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [resultsById, setResultsById] = useState<Record<string, number>>({});
  const [expandedSellersId, setExpandedSellersId] = useState<string | null>(null);
  const [sellersByCategory, setSellersByCategory] = useState<Record<string, CategorySeller[]>>({});
  const [loadingSellers, setLoadingSellers] = useState(false);

  const isAdmin = user?.email === ADMIN_EMAIL;

  const fetchBoomDays = async () => {
    const { data, error } = await supabase
      .from('boom_days')
      .select('id, category_id, category_title, headline, start_at, end_at, baseline_view_count')
      .order('start_at', { ascending: false });

    if (error) {
      console.error(error);
      setErrorMsg('Could not load Boom Days.');
    } else {
      const days = (data as BoomDay[]) ?? [];
      setBoomDays(days);
      setErrorMsg(null);

      // For any Boom Day that's already started, fetch current totals so
      // we can show real "views gained since announced" results.
      const now = Date.now();
      const started = days.filter((bd) => new Date(bd.start_at).getTime() <= now);
      const results: Record<string, number> = {};
      await Promise.all(
        started.map(async (bd) => {
          const current = await getCategoryViewTotal(bd.category_id);
          results[bd.id] = current - bd.baseline_view_count;
        })
      );
      setResultsById(results);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    fetchBoomDays();
  }, [isAdmin]);

  useEffect(() => {
    document.title = 'Boom Days | 042 Plugs Plaza';
  }, []);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const category = CATEGORIES.find((c) => c.id === form.categoryId);
      if (!category) throw new Error('Please choose a valid category.');

      // Snapshot the category's total views right now, before any
      // announcement or countdown starts influencing traffic - this
      // becomes the honest "before" baseline for results later.
      const baseline = await getCategoryViewTotal(category.id);

      const { error } = await supabase.from('boom_days').insert({
        category_id: category.id,
        category_title: category.title,
        headline: form.headline || null,
        start_at: new Date(form.startAt).toISOString(),
        end_at: new Date(form.endAt).toISOString(),
        baseline_view_count: baseline
      });

      if (error) throw error;
      setForm({ ...emptyForm, categoryId: form.categoryId });
      fetchBoomDays();
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Could not schedule this Boom Day.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Cancel this Boom Day?')) return;
    const { error } = await supabase.from('boom_days').delete().eq('id', id);
    if (!error) fetchBoomDays();
  };

  const buildWhatsAppAnnouncement = (boomDay: BoomDay) => {
    const link = `${window.location.origin}/browse/${boomDay.category_id}`;
    const headline = boomDay.headline || `${boomDay.category_title} is BOOMING today on 042 Plugs Plaza!`;
    return (
      `🔥 *BOOM DAY* 🔥\n\n${headline}\n\n` +
      `Check out every seller in ${boomDay.category_title} right now:\n${link}\n\n` +
      `Sellers — this is your moment. Buyers — don't sleep on this one!`
    );
  };

  const copyAnnouncement = (boomDay: BoomDay) => {
    navigator.clipboard.writeText(buildWhatsAppAnnouncement(boomDay));
    setCopiedId(boomDay.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSellers = async (boomDay: BoomDay) => {
    if (expandedSellersId === boomDay.id) {
      setExpandedSellersId(null);
      return;
    }
    setExpandedSellersId(boomDay.id);

    if (!sellersByCategory[boomDay.category_id]) {
      setLoadingSellers(true);
      const { data } = await supabase
        .from('shops')
        .select('id, business_name, phone, view_count')
        .eq('category_id', boomDay.category_id)
        .eq('payment_status', 'approved');

      setSellersByCategory((prev) => ({ ...prev, [boomDay.category_id]: (data as CategorySeller[]) ?? [] }));
      setLoadingSellers(false);
    }
  };

  const buildSellerPrepMessage = (seller: CategorySeller, boomDay: BoomDay) => {
    return (
      `Hi ${seller.business_name}! 👋\n\n` +
      `Great news — your category (*${boomDay.category_title}*) is our next Boom Day on ` +
      `${new Date(boomDay.start_at).toLocaleDateString()}!\n\n` +
      `We're going to be pushing real traffic your way. To make the most of it, please check before then:\n` +
      `✅ Your shop is fully paid and showing "Live"\n` +
      `✅ You have at least one product with photos\n` +
      `✅ Your prices are up to date\n` +
      `✅ You're ready to respond quickly on WhatsApp that day\n\n` +
      `This is your moment — let's make it count! 🔥`
    );
  };

  const now = Date.now();
  const isActive = (bd: BoomDay) => new Date(bd.start_at).getTime() <= now && new Date(bd.end_at).getTime() >= now;
  const isUpcoming = (bd: BoomDay) => new Date(bd.start_at).getTime() > now;
  const hasStarted = (bd: BoomDay) => new Date(bd.start_at).getTime() <= now;

  return (
    <div className="min-h-screen bg-stone-950 text-white px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-amber-400 mb-5">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to 042 Plugs Plaza</span>
        </Link>

        <div className="flex items-center gap-2 text-white font-bold text-lg mb-6">
          <Flame className="w-5 h-5 text-amber-500" />
          <span>Boom Days</span>
        </div>

        {!user && (
          <div className="text-center py-20">
            <LogIn className="w-10 h-10 text-stone-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">Sign in to manage Boom Days</h3>
            <button
              onClick={() => setShowAuthModal(true)}
              className="mt-4 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-sm font-semibold"
            >
              Sign In
            </button>
            {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
          </div>
        )}

        {user && !isAdmin && (
          <div className="text-center py-20">
            <ShieldCheck className="w-10 h-10 text-stone-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">This page is only for the platform owner</h3>
          </div>
        )}

        {user && isAdmin && (
          <>
            {errorMsg && (
              <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Schedule new */}
            <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 mb-8">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-3">Schedule a Boom Day</h2>
              <form onSubmit={handleSchedule} className="space-y-3">
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Category</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Custom Headline (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., Shoes & Footwear takes over today!"
                    value={form.headline}
                    onChange={(e) => setForm({ ...form, headline: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-stone-400 mb-1">Starts</label>
                    <input
                      type="datetime-local"
                      required
                      value={form.startAt}
                      onChange={(e) => setForm({ ...form, startAt: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-stone-400 mb-1">Ends</label>
                    <input
                      type="datetime-local"
                      required
                      value={form.endAt}
                      onChange={(e) => setForm({ ...form, endAt: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-stone-950 font-semibold text-sm"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>{submitting ? 'Scheduling...' : 'Schedule Boom Day'}</span>
                </button>
              </form>
            </div>

            {/* List */}
            <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-3">All Boom Days</h2>

            {loading && (
              <div className="text-center py-10">
                <Loader2 className="w-6 h-6 text-amber-500 mx-auto animate-spin" />
              </div>
            )}

            {!loading && boomDays.length === 0 && <p className="text-xs text-stone-500">No Boom Days scheduled yet.</p>}

            <div className="space-y-3">
              {boomDays.map((bd) => (
                <div
                  key={bd.id}
                  className={`rounded-xl border p-4 ${
                    isActive(bd) ? 'border-amber-500/40 bg-amber-500/[0.03]' : 'border-stone-800 bg-stone-900/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white">{bd.category_title}</h3>
                      {bd.headline && <p className="text-xs text-stone-400 mt-0.5">{bd.headline}</p>}
                    </div>
                    {isActive(bd) && (
                      <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase">
                        🔥 Live Now
                      </span>
                    )}
                    {isUpcoming(bd) && (
                      <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-800 text-stone-400 border border-stone-700">
                        Upcoming
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500 mt-2">
                    {new Date(bd.start_at).toLocaleString()} → {new Date(bd.end_at).toLocaleString()}
                  </p>

                  {/* Aftermath results - only shown once it's actually started */}
                  {hasStarted(bd) && resultsById[bd.id] !== undefined && (
                    <div className="flex items-center gap-1.5 mt-2 p-2 rounded-lg bg-white/[0.04] border border-white/10 w-fit">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-400">
                        +{resultsById[bd.id]} view{resultsById[bd.id] === 1 ? '' : 's'}
                      </span>
                      <span className="text-[10px] text-stone-500">since announced</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <button
                      onClick={() => copyAnnouncement(bd)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold"
                    >
                      {copiedId === bd.id ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === bd.id ? 'Copied!' : 'Copy WhatsApp Announcement'}</span>
                    </button>
                    <button
                      onClick={() => toggleSellers(bd)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Notify Sellers</span>
                      {expandedSellersId === bd.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => handleDelete(bd.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  </div>

                  {/* Seller prep list - who to personally notify, with a ready message each */}
                  {expandedSellersId === bd.id && (
                    <div className="mt-3 pt-3 border-t border-stone-800 space-y-2">
                      {loadingSellers && (
                        <div className="text-center py-4">
                          <Loader2 className="w-4 h-4 text-amber-500 mx-auto animate-spin" />
                        </div>
                      )}
                      {!loadingSellers && (sellersByCategory[bd.category_id]?.length ?? 0) === 0 && (
                        <p className="text-[11px] text-stone-500">No live sellers in this category yet.</p>
                      )}
                      {!loadingSellers &&
                        sellersByCategory[bd.category_id]?.map((seller) => (
                          <div key={seller.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-stone-950/60">
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-white truncate">{seller.business_name}</p>
                              <p className="text-[10px] text-stone-500">{seller.view_count} views so far</p>
                            </div>
                            <a
                              href={buildWhatsAppLink(seller.phone, buildSellerPrepMessage(seller, bd))}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[10px] font-semibold"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>Prep Message</span>
                            </a>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminBoomDaysPage;
