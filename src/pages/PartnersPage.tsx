'use client';

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Wifi, Megaphone, Users, MessageCircle, Sparkles } from 'lucide-react';

const PARTNER_WHATSAPP = '2348136573235';

export const PartnersPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Partner With Us | 042 Plugs Plaza';
  }, []);

  return (
    <div className="min-h-screen bg-stone-950 text-white px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-amber-400 mb-6">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to 042 Plugs Plaza</span>
        </Link>

        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
            <Wifi className="w-7 h-7 text-amber-400" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mb-2">Your Customers Are Already Here</h1>
          <p className="text-sm text-stone-400 max-w-md mx-auto leading-relaxed">
            Every day on 042 Plugs Plaza, real Enugu sole traders upload photos, message buyers, and grow their
            business — all of it running on data and airtime. That's an audience worth reaching, not renting.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 flex-shrink-0">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">"This Week's Data Champion"</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Sponsor a small data or airtime reward for our most active seller each week. Your brand gets
                credited directly to sellers who are genuinely growing their business — not a random ad, a real
                thank-you they'll remember.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 flex-shrink-0">
              <Users className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Direct Access to Local Sole Traders</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                No mass-market guesswork — this is a real, active community of Enugu business owners who already
                need data plans and airtime to run what they're building. Exactly the customers you're already
                looking for.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 flex-shrink-0">
              <Megaphone className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">A Quiet, Honest Footer Credit</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                No loud banners here — that's not how we do things. Just a simple, real line on every page: "Data
                rewards powered by [Your Name]." Trust matters more to us than noise, and we think it does to you
                too.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-6">
          <h2 className="text-base font-bold text-white mb-1">Let's Talk</h2>
          <p className="text-xs text-stone-400 mb-4 max-w-sm mx-auto">
            Whether you're a local reseller, a VTU agent, or represent a telecom brand — we'd genuinely love to
            build something small and real with you.
          </p>
          <a
            href={`https://wa.me/${PARTNER_WHATSAPP}?text=${encodeURIComponent(
              "Hi! I'd like to talk about partnering with 042 Plugs Plaza around data/airtime support for your sellers."
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Message Us on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default PartnersPage;