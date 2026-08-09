'use client';

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Wifi, MessageCircle } from 'lucide-react';

const PARTNER_WHATSAPP = '2348136573235';

export const PartnersPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Partner With Us | 042 Plugs Plaza';
  }, []);

  return (
    <div className="min-h-screen bg-stone-950 text-white px-4 py-8">
      <div className="max-w-xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-amber-400 mb-6">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to 042 Plugs Plaza</span>
        </Link>

        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
            <Wifi className="w-7 h-7 text-amber-400" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mb-2">Data & Airtime Partners</h1>
          <p className="text-sm text-stone-400 max-w-md mx-auto leading-relaxed">
            Every seller on 042 Plugs Plaza runs on data and airtime to grow their business. If you sell that -
            street-level VTU agent or telecom corporate - there's a real audience here worth reaching.
          </p>
        </div>

        <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-5 mb-6 space-y-3">
          <p className="text-sm text-stone-300 leading-relaxed">
            <span className="text-amber-400 font-bold">The idea:</span> sponsor a small weekly data/airtime
            reward for our most active seller. Your name gets credited directly - no loud banners, just a real
            thank-you real traders will notice.
          </p>
          <p className="text-sm text-stone-300 leading-relaxed">
            <span className="text-amber-400 font-bold">Who this is for:</span> individual VTU/data resellers,
            local agents, and telecom brands alike - whatever scale fits you.
          </p>
        </div>

        <div className="text-center">
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