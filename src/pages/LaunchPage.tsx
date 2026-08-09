'use client';

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, PartyPopper, MapPin, Calendar, Store, Handshake, Loader2, AlertCircle, CheckCircle, Sparkles, BedDouble, Music } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const emptyForm = { name: '', phone: '', shopName: '', message: '' };

export const LaunchPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'attendee' | 'sponsor'>('attendee');
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    document.title = '042 Plugs Plaza Launch Event | Hotel Presidential, Enugu';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.from('launch_interest').insert({
        name: form.name,
        phone: form.phone,
        interest_type: activeTab,
        shop_name: activeTab === 'attendee' ? form.shopName || null : null,
        message: activeTab === 'sponsor' ? form.message || null : null
      });

      if (error) throw error;
      setForm(emptyForm);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Could not submit right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-white px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-amber-400 mb-6">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to 042 Plugs Plaza</span>
        </Link>

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
            <PartyPopper className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">042 Plugs Plaza Launch</h1>
          <p className="text-sm text-stone-400 max-w-lg mx-auto leading-relaxed mb-4">
            Coal City's marketplace, formally introduced - a gathering for the sellers, sponsors, and press
            shaping what's next.
          </p>
          <div className="flex items-center justify-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/15 text-stone-300">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Hotel Presidential, Enugu</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/15 text-stone-300">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Ember Months 2026 · Date TBD</span>
            </span>
          </div>
        </div>

        {/* For Sellers */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.03] p-5 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Store className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white">For Our Sellers</h2>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed mb-3">
            Select active sellers get full attendance covered -{' '}
            <strong className="text-stone-200 font-semibold">2 nights at Hotel Presidential</strong>, plus
            entertainment. The people building our momentum come first.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-white/[0.06] border border-white/15 text-stone-300">
              <BedDouble className="w-3 h-3 text-amber-400" />
              2 Nights Covered
            </span>
            <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-white/[0.06] border border-white/15 text-stone-300">
              <Music className="w-3 h-3 text-amber-400" />
              Entertainment Included
            </span>
          </div>
        </div>

        {/* For Sponsors */}
        <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-5 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Handshake className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white">For Brands & Sponsors</h2>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed">
            Like a book launch, but for a working platform already connecting real Enugu traders to real
            customers. Real visibility, in front of sellers and press - not a logo lost in a crowd.
          </p>
        </div>

        {/* Interest form */}
        <div className="rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-sm p-6">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-bold text-white">Register Your Interest</h2>
          </div>
          <p className="text-xs text-stone-400 mb-5">
            The date isn't locked in yet - register now and we'll notify you personally the moment it is.
          </p>

          <div className="grid grid-cols-2 gap-2 mb-5 p-1 bg-white/[0.05] rounded-lg border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('attendee')}
              className={`py-2 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'attendee' ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-stone-950 shadow-md' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              I Want to Attend
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sponsor')}
              className={`py-2 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'sponsor' ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-stone-950 shadow-md' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              I'm Interested in Sponsoring
            </button>
          </div>

          {success ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">You're on the list!</h3>
              <p className="text-xs text-stone-400">We'll reach out personally once the date is confirmed.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              {errorMsg && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs text-stone-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white/[0.07] backdrop-blur-sm border border-white/15 rounded-xl text-white text-sm placeholder:text-stone-400 focus:outline-none focus:border-amber-400/60"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-400 mb-1">WhatsApp Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g., 08012345678"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-white/[0.07] backdrop-blur-sm border border-white/15 rounded-xl text-white text-sm placeholder:text-stone-400 focus:outline-none focus:border-amber-400/60"
                />
              </div>

              {activeTab === 'attendee' && (
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Your Shop Name (if registered on 042 Plugs Plaza)</label>
                  <input
                    type="text"
                    value={form.shopName}
                    onChange={(e) => setForm({ ...form, shopName: e.target.value })}
                    className="w-full px-3 py-2 bg-white/[0.07] backdrop-blur-sm border border-white/15 rounded-xl text-white text-sm placeholder:text-stone-400 focus:outline-none focus:border-amber-400/60"
                  />
                </div>
              )}

              {activeTab === 'sponsor' && (
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Tell us a bit about your brand (optional)</label>
                  <textarea
                    rows={3}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-3 py-2 bg-white/[0.07] backdrop-blur-sm border border-white/15 rounded-xl text-white text-sm placeholder:text-stone-400 focus:outline-none focus:border-amber-400/60 resize-none"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-60 text-stone-950 font-bold text-sm transition-colors shadow-lg shadow-amber-500/20"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{submitting ? 'Submitting...' : 'Register My Interest'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LaunchPage;