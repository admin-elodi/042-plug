'use client';

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Loader2, AlertCircle, LogIn, Users, Copy, CheckCircle, Plus, Power } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/modals/AuthModal';

const ADMIN_EMAIL = 'ikezion@gmail.com';

interface PartnerGroup {
  id: string;
  group_name: string;
  referral_code: string;
  subaccount_code: string;
  split_percentage: number | null;
  active: boolean;
  created_at: string;
}

const emptyForm = { groupName: '', referralCode: '', subaccountCode: '', splitPercentage: '' };

export const AdminPartnerGroupsPage: React.FC = () => {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [groups, setGroups] = useState<PartnerGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const isAdmin = user?.email === ADMIN_EMAIL;

  const fetchGroups = async () => {
    const { data, error } = await supabase
      .from('partner_groups')
      .select('id, group_name, referral_code, subaccount_code, split_percentage, active, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      setErrorMsg('Could not load partner groups.');
    } else {
      setGroups((data as PartnerGroup[]) ?? []);
      setErrorMsg(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    fetchGroups();
  }, [isAdmin]);

  useEffect(() => {
    document.title = 'Partner Groups | 042 Plugs Plaza';
  }, []);

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.from('partner_groups').insert({
        group_name: form.groupName,
        referral_code: form.referralCode.trim().toLowerCase().replace(/\s+/g, '-'),
        subaccount_code: form.subaccountCode.trim(),
        split_percentage: form.splitPercentage ? Number(form.splitPercentage) : null
      });

      if (error) throw error;
      setForm(emptyForm);
      fetchGroups();
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Could not add this partner group.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (group: PartnerGroup) => {
    const { error } = await supabase.from('partner_groups').update({ active: !group.active }).eq('id', group.id);
    if (!error) fetchGroups();
  };

  const copyReferralLink = (code: string) => {
    const link = `${window.location.origin}/?ref=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-white px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-amber-400 mb-5">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to 042 Plugs Plaza</span>
        </Link>

        <div className="flex items-center gap-2 text-white font-bold text-lg mb-6">
          <ShieldCheck className="w-5 h-5 text-amber-500" />
          <span>Partner Groups & Splits</span>
        </div>

        {!user && (
          <div className="text-center py-20">
            <LogIn className="w-10 h-10 text-stone-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">Sign in to manage partner groups</h3>
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

            {/* Add new partner group */}
            <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 mb-8">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-3">Add a Partner Group</h2>
              <p className="text-[11px] text-stone-500 mb-4">
                First create a subaccount for this group's admin directly on your Paystack Dashboard (Subaccounts →
                Create Subaccount, using their bank details and agreed split), then paste the resulting subaccount
                code here.
              </p>
              <form onSubmit={handleAddGroup} className="space-y-3">
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Group Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Enugu Fashion Traders"
                    value={form.groupName}
                    onChange={(e) => setForm({ ...form, groupName: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Referral Code (for their link)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., fashion-traders"
                    value={form.referralCode}
                    onChange={(e) => setForm({ ...form, referralCode: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-stone-400 mb-1">Paystack Subaccount Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., ACCT_xxxxxxxx"
                      value={form.subaccountCode}
                      onChange={(e) => setForm({ ...form, subaccountCode: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-stone-400 mb-1">Split % (for reference)</label>
                    <input
                      type="number"
                      placeholder="e.g., 20"
                      value={form.splitPercentage}
                      onChange={(e) => setForm({ ...form, splitPercentage: e.target.value })}
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
                  <span>{submitting ? 'Adding...' : 'Add Partner Group'}</span>
                </button>
              </form>
            </div>

            {/* Existing groups */}
            <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-3">
              Active Partner Groups ({groups.length})
            </h2>

            {loading && (
              <div className="text-center py-10">
                <Loader2 className="w-6 h-6 text-amber-500 mx-auto animate-spin" />
              </div>
            )}

            {!loading && groups.length === 0 && (
              <p className="text-xs text-stone-500">No partner groups added yet.</p>
            )}

            <div className="space-y-3">
              {groups.map((group) => (
                <div key={group.id} className="rounded-xl border border-stone-800 bg-stone-900/60 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-amber-400" />
                      <h3 className="text-sm font-bold text-white">{group.group_name}</h3>
                    </div>
                    <button
                      onClick={() => toggleActive(group)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        group.active
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-stone-800 text-stone-500 border-stone-700'
                      }`}
                    >
                      <Power className="w-2.5 h-2.5" />
                      {group.active ? 'Active' : 'Paused'}
                    </button>
                  </div>
                  <div className="mt-2 text-[11px] text-stone-400 space-y-1">
                    <p>Subaccount: <span className="text-stone-300">{group.subaccount_code}</span></p>
                    {group.split_percentage !== null && <p>Split: <span className="text-stone-300">{group.split_percentage}%</span></p>}
                  </div>
                  <button
                    onClick={() => copyReferralLink(group.referral_code)}
                    className="flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[11px] font-semibold"
                  >
                    {copiedCode === group.referral_code ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === group.referral_code ? 'Copied!' : 'Copy Referral Link'}</span>
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPartnerGroupsPage;
