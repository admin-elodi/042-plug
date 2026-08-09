'use client';

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Loader2, AlertCircle, CheckCircle, Trash2, MapPin, Phone, LogIn, Store, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/modals/AuthModal';

const ADMIN_EMAIL = 'ikezion@gmail.com';

interface Shop {
  id: string;
  business_name: string;
  phone: string;
  address: string | null;
  category_title: string;
  payment_status: 'pending' | 'approved';
  paystack_reference: string | null;
  payment_claimed_at: string | null;
  created_at: string;
}

export const AdminShopsPage: React.FC = () => {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadShops = async () => {
      const { data, error } = await supabase
        .from('shops')
        .select('id, business_name, phone, address, category_title, payment_status, paystack_reference, payment_claimed_at, created_at')
        .order('created_at', { ascending: false });

      if (cancelled) return;

      if (error) {
        console.error(error);
        setErrorMsg('Could not load shop registrations. Please try again.');
      } else {
        setShops((data as Shop[]) ?? []);
        setErrorMsg(null);
      }
      setLoading(false);
    };

    loadShops();
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  useEffect(() => {
    document.title = 'Shop Approvals | 042 Plug';
  }, []);

  const handleApprove = async (shopId: string) => {
    setBusyId(shopId);
    setErrorMsg(null);
    try {
      const { error } = await supabase.from('shops').update({ payment_status: 'approved' }).eq('id', shopId);
      if (error) throw error;
      setShops((prev) => prev.map((s) => (s.id === shopId ? { ...s, payment_status: 'approved' } : s)));
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Could not approve this shop.');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (shop: Shop) => {
    if (!confirm(`Reject "${shop.business_name}"? This deletes the registration entirely and cannot be undone.`)) return;
    setBusyId(shop.id);
    setErrorMsg(null);
    try {
      const { error } = await supabase.from('shops').delete().eq('id', shop.id);
      if (error) throw error;
      setShops((prev) => prev.filter((s) => s.id !== shop.id));
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Could not reject this shop.');
    } finally {
      setBusyId(null);
    }
  };

  const pendingShops = shops
    .filter((s) => s.payment_status === 'pending')
    .sort((a, b) => {
      const aClaimed = !!a.payment_claimed_at || !!a.paystack_reference;
      const bClaimed = !!b.payment_claimed_at || !!b.paystack_reference;
      if (aClaimed && !bClaimed) return -1;
      if (!aClaimed && bClaimed) return 1;
      return 0;
    });
  const approvedShops = shops.filter((s) => s.payment_status === 'approved');

  return (
    <div className="min-h-screen bg-stone-950 text-white px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-amber-400 mb-5">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to 042 Plug</span>
        </Link>

        <div className="flex items-center gap-2 text-white font-bold text-lg mb-6">
          <ShieldCheck className="w-5 h-5 text-amber-500" />
          <span>Shop Approvals</span>
        </div>

        {!user && (
          <div className="text-center py-20">
            <LogIn className="w-10 h-10 text-stone-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">Sign in to manage shop approvals</h3>
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
            <p className="text-xs text-stone-400">Signed in as {user.email}</p>
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

            {loading && (
              <div className="text-center py-20">
                <Loader2 className="w-8 h-8 text-amber-500 mx-auto mb-3 animate-spin" />
                <p className="text-xs text-stone-400">Loading shop registrations...</p>
              </div>
            )}

            {!loading && (
              <div className="space-y-8">
                {/* Pending */}
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-3">
                    Pending Payment Approval ({pendingShops.length})
                  </h2>
                  <p className="text-[11px] text-stone-500 mb-3">
                    Cross-check each against your bank alerts before approving — this list includes both bank
                    transfer claims and any Paystack payments that somehow didn't auto-confirm.
                  </p>
                  {pendingShops.length === 0 ? (
                    <p className="text-xs text-stone-500">Nothing waiting for review right now.</p>
                  ) : (
                    <div className="space-y-3">
                      {pendingShops.map((shop) => (
                        <div
                          key={shop.id}
                          className={`rounded-xl border p-4 ${
                            shop.payment_claimed_at || shop.paystack_reference
                              ? 'border-emerald-500/30 bg-emerald-500/[0.03]'
                              : 'border-stone-800 bg-stone-900/60'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-bold text-white">{shop.business_name}</h3>
                            {shop.payment_claimed_at || shop.paystack_reference ? (
                              <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                                Payment Claimed
                              </span>
                            ) : (
                              <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-800 text-stone-500 border border-stone-700 whitespace-nowrap">
                                Not Yet Claimed
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-stone-400">
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-medium">
                              {shop.category_title}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              <span>{shop.phone}</span>
                            </span>
                            {shop.address && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{shop.address}</span>
                              </span>
                            )}
                          </div>
                          {shop.paystack_reference ? (
                            <p className="text-[11px] text-stone-500 mt-1.5">
                              Paystack ref: <span className="text-stone-300">{shop.paystack_reference}</span> — a
                              paid Paystack reference here likely means the webhook didn't fire; check Paystack's
                              dashboard to confirm before approving.
                            </p>
                          ) : shop.payment_claimed_at ? (
                            <p className="text-[11px] text-stone-500 mt-1.5">
                              Seller claimed payment via bank transfer — verify against your Opay alerts before approving.
                            </p>
                          ) : (
                            <p className="text-[11px] text-stone-500 mt-1.5">
                              No payment claim yet — this shop was likely saved but never paid for. No action needed unless they reach out.
                            </p>
                          )}

                          <div className="flex items-center gap-2 mt-3">
                            <button
                              onClick={() => handleApprove(shop.id)}
                              disabled={busyId === shop.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold disabled:opacity-50"
                            >
                              {busyId === shop.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                              <span>Approve</span>
                            </button>
                            <a
                              href={`https://wa.me/${shop.phone.replace(/\D/g, '').replace(/^0/, '234')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Message Seller</span>
                            </a>
                            <button
                              onClick={() => handleReject(shop)}
                              disabled={busyId === shop.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-semibold disabled:opacity-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Approved */}
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-3">
                    Live Shops ({approvedShops.length})
                  </h2>
                  {approvedShops.length === 0 ? (
                    <p className="text-xs text-stone-500">No approved shops yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {approvedShops.map((shop) => (
                        <div key={shop.id} className="flex items-center gap-2 rounded-lg border border-stone-800 bg-stone-900/40 p-3">
                          <Store className="w-3.5 h-3.5 text-stone-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{shop.business_name}</p>
                            <p className="text-[11px] text-stone-400 truncate">{shop.category_title}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminShopsPage;