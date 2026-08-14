'use client';

import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Phone } from 'lucide-react';

const WHATSAPP_NUMBER = '2348136573235';
const DISPLAY_PHONE = '0813 657 3235, 0810 090 0926';

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-stone-950 border-t border-stone-800 text-stone-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-gradient-to-tr from-amber-500 to-orange-500 p-2 rounded-xl">
                <svg className="w-5 h-5 text-stone-950" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <span className="text-lg font-black tracking-tight sm:tracking-wider text-white whitespace-nowrap">
                042<span className="text-amber-400">PLUGS</span><span className="text-orange-500">PLAZA</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed max-w-xs">
              The Coal City's marketplace - connecting Enugu's businesses directly with the people looking for them.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-4">Explore</h3>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#storefronts" className="hover:text-amber-400 transition-colors">Storefronts</a></li>
              <li><Link to="/my-shops" className="hover:text-amber-400 transition-colors">Sell on 042</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-4">Get in Touch</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-amber-400 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Us</span>
                </a>
              </li>
              <li>
                <a href={`tel:${WHATSAPP_NUMBER}`} className="flex items-center gap-2 hover:text-amber-400 transition-colors">
                  <Phone className="w-4 h-4" />
                  <span>{DISPLAY_PHONE}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-stone-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <p>© {year} 042 Plugs Plaza. All rights reserved.</p>
          <p>Built by <span className="text-stone-300 font-medium">JungleX</span></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;