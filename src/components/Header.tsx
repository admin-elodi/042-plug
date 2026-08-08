'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Store, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/modals/AuthModal';

const ADMIN_EMAIL = 'ikezion@gmail.com';

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 cursor-pointer">
            <div className="bg-gradient-to-tr from-amber-500 to-orange-500 p-2.5 rounded-2xl shadow-lg shadow-amber-500/20">
              {/* Shopping Bag Icon SVG */}
              <svg 
                className="w-7 h-7 text-stone-950" 
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
              <span className="text-2xl font-black tracking-wider text-white whitespace-nowrap">
                042<span className="text-amber-400">PLUGS</span>
              </span>
              <p className="text-[10px] text-stone-400 tracking-widest uppercase font-semibold whitespace-nowrap">Legit Deals Only</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-5 font-medium text-stone-300 text-sm">
            <Link to="/storefronts" className="whitespace-nowrap hover:text-amber-400 transition-colors">Storefronts</Link>
            <a href="#launch-info" className="whitespace-nowrap hover:text-amber-400 transition-colors flex items-center gap-1.5">
              <span className="whitespace-nowrap">Oct 2026 Launch</span>
              <span className="whitespace-nowrap bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">VIP</span>
            </a>
            <Link to="/my-shops" className="whitespace-nowrap hover:text-amber-400 transition-colors">Sell on 042</Link>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="relative" ref={accountMenuRef}>
                <button
                  onClick={() => setShowAccountMenu((v) => !v)}
                  className="h-10 flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-white px-4 rounded-xl font-semibold text-sm border border-stone-700 transition-all whitespace-nowrap"
                >
                  <span>Account</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {showAccountMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-stone-900 border border-stone-800 shadow-2xl py-2 z-50">
                    <p className="px-4 py-1.5 text-xs text-stone-500 truncate border-b border-stone-800 mb-1">{user.email}</p>
                    <Link
                      to="/my-shops"
                      onClick={() => setShowAccountMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-stone-200 hover:bg-stone-800 hover:text-amber-400 transition-colors"
                    >
                      <Store className="w-4 h-4" />
                      <span>My Shops</span>
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin/jobs"
                        onClick={() => setShowAccountMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-amber-400 hover:bg-stone-800 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Job Approvals</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        signOut();
                        setShowAccountMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-stone-200 hover:bg-stone-800 hover:text-red-300 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="h-10 bg-stone-800 hover:bg-stone-700 text-white px-4 rounded-xl font-semibold text-sm border border-stone-700 transition-all whitespace-nowrap"
              >
                Seller Sign In
              </button>
            )}
            <a 
              href="https://chat.whatsapp.com/KbLAiBmxl1uGs32u24IXCu" 
              target="_blank" 
              rel="noopener noreferrer"
              className="h-10 flex items-center bg-stone-800 hover:bg-stone-700 text-white px-4 rounded-xl font-semibold text-sm border border-stone-700 transition-all whitespace-nowrap"
            >
              Join WhatsApp
            </a>
            <a 
              href="#storefronts" 
              className="h-10 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold px-5 rounded-xl text-sm shadow-lg shadow-amber-500/25 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              {/* Sparkles Icon SVG */}
              <svg 
                className="w-4 h-4 fill-stone-950" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
              </svg>
              <span>Get Listed</span>
            </a>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button 
            type="button"
            aria-label="Toggle navigation menu"
            className="md:hidden text-stone-300 hover:text-white focus:outline-none"
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
        <div className="md:hidden bg-stone-900 border-b border-stone-800 px-4 pt-4 pb-6 space-y-4">
          <Link to="/storefronts" onClick={() => setIsMobileMenuOpen(false)} className="block text-stone-300 hover:text-amber-400 font-medium">Browse Storefronts</Link>
          <a href="#launch-info" onClick={() => setIsMobileMenuOpen(false)} className="block text-stone-300 hover:text-amber-400 font-medium">October 2026 Launch Details</a>
          <Link to="/my-shops" onClick={() => setIsMobileMenuOpen(false)} className="block text-stone-300 hover:text-amber-400 font-medium">Sell on 042</Link>
          <div className="pt-2 flex flex-col gap-3">
            <a 
              href="#storefronts" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center bg-amber-500 text-stone-950 font-bold py-3 rounded-xl shadow-md"
            >
              Create Your Shop
            </a>
            <Link
              to="/storefronts"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center bg-stone-800 text-white font-semibold py-3 rounded-xl border border-stone-700"
            >
              Browse All Storefronts
            </Link>
            <a
              href="https://chat.whatsapp.com/KbLAiBmxl1uGs32u24IXCu"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center bg-stone-800 text-white font-semibold py-3 rounded-xl border border-stone-700"
            >
              Join WhatsApp
            </a>
            {user ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin/jobs"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center bg-amber-500/10 text-amber-400 font-semibold py-3 rounded-xl border border-amber-500/30"
                  >
                    Job Approvals
                  </Link>
                )}
                <Link
                  to="/my-shops"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center bg-stone-800 text-white font-semibold py-3 rounded-xl border border-stone-700"
                >
                  My Shops
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-center bg-stone-800 text-white font-semibold py-3 rounded-xl border border-stone-700"
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
                className="w-full text-center bg-stone-800 text-white font-semibold py-3 rounded-xl border border-stone-700"
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