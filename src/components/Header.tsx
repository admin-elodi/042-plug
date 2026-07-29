'use client';

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/modals/AuthModal';

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 cursor-pointer">
            <div className="bg-gradient-to-tr from-green-500 to-emerald-400 p-2.5 rounded-2xl shadow-lg shadow-green-500/20">
              {/* Shopping Bag Icon SVG */}
              <svg 
                className="w-7 h-7 text-slate-950" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <div>
              <span className="text-2xl font-black tracking-wider text-white">
                042<span className="text-green-400">PLUGS</span>
                {/* <span className="text-xs font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-1.5 py-0.5 rounded ml-1.5">.ng</span> */}
              </span>
              <p className="text-[10px] text-slate-400 tracking-widest uppercase font-semibold">Enugu's Ultimate Market</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 font-medium text-slate-300 text-sm">
            <a href="#storefronts" className="whitespace-nowrap hover:text-green-400 transition-colors">Storefronts</a>
            <a href="#launch-info" className="whitespace-nowrap hover:text-green-400 transition-colors flex items-center gap-1.5">
              <span className="whitespace-nowrap">Oct 2026 Launch</span>
              <span className="whitespace-nowrap bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">VIP</span>
            </a>
            <Link to="/my-shops" className="whitespace-nowrap hover:text-green-400 transition-colors">Sell on 042</Link>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">{user.email}</span>
                <Link
                  to="/my-shops"
                  className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm border border-slate-700 transition-all"
                >
                  My Shops
                </Link>
                <button
                  onClick={() => signOut()}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2. rounded-xl font-semibold text-sm border border-slate-700 transition-all"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm border border-slate-700 transition-all"
              >
                Vendor Sign In
              </button>
            )}
            <a 
              href="https://wa.me/YOUR_NUMBER" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm border border-slate-700 transition-all"
            >
              Join WhatsApp
            </a>
            <a 
              href="#storefronts" 
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm shadow-lg shadow-green-500/25 transition-all flex items-center gap-2"
            >
              {/* Sparkles Icon SVG */}
              <svg 
                className="w-4 h-4 fill-slate-950" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
              </svg>
              <span>Get Listed @ ₦1k</span>
            </a>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button 
            type="button"
            aria-label="Toggle navigation menu"
            className="md:hidden text-slate-300 hover:text-white focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              /* Close (X) Icon SVG */
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            ) : (
              /* Menu (Hamburger) Icon SVG */
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-4 pb-6 space-y-4">
          <a href="#storefronts" onClick={() => setIsMobileMenuOpen(false)} className="block text-slate-300 hover:text-green-400 font-medium">Browse Storefronts</a>
          <a href="#launch-info" onClick={() => setIsMobileMenuOpen(false)} className="block text-slate-300 hover:text-green-400 font-medium">October 2026 Launch Details</a>
          <Link to="/my-shops" onClick={() => setIsMobileMenuOpen(false)} className="block text-slate-300 hover:text-green-400 font-medium">Sell on 042</Link>
          <div className="pt-2 flex flex-col gap-3">
            <a 
              href="#storefronts" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center bg-green-500 text-slate-950 font-bold py-3 rounded-xl shadow-md"
            >
              Upload Your Business (₦1,000)
            </a>
            {user ? (
              <>
                <Link
                  to="/my-shops"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center bg-slate-800 text-white font-semibold py-3 rounded-xl border border-slate-700"
                >
                  My Shops
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-center bg-slate-800 text-white font-semibold py-3 rounded-xl border border-slate-700"
                >
                  Sign Out ({user.email})
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setShowAuthModal(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-center bg-slate-800 text-white font-semibold py-3 rounded-xl border border-slate-700"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </header>
  );
};

export default Header;