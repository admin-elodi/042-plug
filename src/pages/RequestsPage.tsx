'use client';

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Send, Loader2, AlertCircle, CheckCircle, Clock, MessageCircle, Tag } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import CATEGORIES from '@/data/categories';

interface RequestItem {
  id: string;
  item_wanted: string;
  category_title: string | null;
  details: string | null;
  budget: string | null;
  buyer_phone: string;
  created_at: string;
}

const emptyForm = {
  itemWanted: '',
  categoryId: '',
  details: '',
  budget: '',
  buyerPhone: ''
};

const timeAgo = (dateStr: string) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

export const RequestsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'browse' | 'post'>('browse');
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [postSuccess, setPostSuccess] = useState(false);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('requests')
      .select('id, item_wanted, category_title, details, budget, buyer_phone, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error(error);
      setErrorMsg('Could not load requests right now. Please try again.');
    } else {
      setRequests((data as RequestItem[]) ?? []);
      setErrorMsg(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    document.title = "I'm Looking For This | 042 Plugs Plaza";
  }, []);

  const handlePostRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setPostError(null);

    try {
      const category = CATEGORIES.find((c) => c.id === form.categoryId);

      const { error } = await supabase.from('requests').insert({
        item_wanted: form.itemWanted,
        category_id: form.categoryId || null,
        category_title: category?.title ?? null,
        details: form.details || null,
        budget: form.budget || null,
        buyer_phone: form.buyerPhone
      });

      if (error) throw error;

      setForm(emptyForm);
      setPostSuccess(true);
      fetchRequests();
    } catch (err) {
      console.error(err);
      setPostError(err instanceof Error ? err.message : 'Could not post your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-white px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-amber-400 mb-5">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to 042 Plugs Plaza</span>
        </Link>

        <div className="flex items-center gap-2 text-white font-bold text-lg mb-1">
          <Search className="w-5 h-5 text-amber-500" />
          <span>I'm Looking For This</span>
        </div>
        <p className="text-xs text-stone-400 mb-6">
          Can't find what you want? Post it here — any seller who has it can message you directly.
        </p>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2 mb-5 p-1 bg-stone-900 rounded-lg border border-stone-800">
          <button
            onClick={() => setActiveTab('browse')}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'browse' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Browse Requests
          </button>
          <button
            onClick={() => setActiveTab('post')}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'post' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Post a Request
          </button>
        </div>

        {activeTab === 'browse' && (
          <>
            {loading && (
              <div className="text-center py-16">
                <Loader2 className="w-7 h-7 text-amber-500 mx-auto mb-2 animate-spin" />
                <p className="text-xs text-stone-400">Loading requests...</p>
              </div>
            )}

            {!loading && errorMsg && (
              <div className="text-center py-16">
                <AlertCircle className="w-7 h-7 text-red-400 mx-auto mb-2" />
                <p className="text-sm text-red-300">{errorMsg}</p>
              </div>
            )}

            {!loading && !errorMsg && requests.length === 0 && (
              <div className="text-center py-16 text-stone-500">
                <Search className="w-8 h-8 mx-auto mb-2" />
                <p className="text-xs">No requests yet. Be the first to post what you're looking for.</p>
              </div>
            )}

            {!loading && !errorMsg && requests.length > 0 && (
              <div className="space-y-3">
                {requests.map((req) => (
                  <div key={req.id} className="rounded-xl border border-stone-800 bg-stone-900/60 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-white">{req.item_wanted}</h3>
                      <span className="flex items-center gap-1 text-[10px] text-stone-500 whitespace-nowrap">
                        <Clock className="w-3 h-3" />
                        {timeAgo(req.created_at)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      {req.category_title && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border border-stone-700 bg-stone-950 text-stone-300">
                          <Tag className="w-2.5 h-2.5" />
                          {req.category_title}
                        </span>
                      )}
                      {req.budget && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium border border-amber-500/30 bg-amber-500/10 text-amber-300">
                          Budget: {req.budget}
                        </span>
                      )}
                    </div>
                    {req.details && <p className="text-xs text-stone-400 mt-2">{req.details}</p>}

                    <a
                      href={buildWhatsAppLink(
                        req.buyer_phone,
                        `Hi! I saw your request on 042 Plugs Plaza for "${req.item_wanted}" — I have this available. Let's talk!`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 mt-3 w-fit px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[11px] font-semibold transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>I Can Help — Message Buyer</span>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'post' && (
          <>
            {postSuccess ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-white mb-1">Request Posted!</h3>
                <p className="text-xs text-stone-400 mb-5">
                  Sellers browsing this page can now see what you're looking for and message you directly.
                </p>
                <button
                  onClick={() => {
                    setPostSuccess(false);
                    setActiveTab('browse');
                  }}
                  className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-sm font-medium"
                >
                  View Requests
                </button>
              </div>
            ) : (
              <form onSubmit={handlePostRequest} className="space-y-3">
                {postError && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{postError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">What are you looking for?</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Wireless earbuds under ₦15,000"
                    value={form.itemWanted}
                    onChange={(e) => setForm({ ...form, itemWanted: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-800 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">Category (optional)</label>
                    <select
                      value={form.categoryId}
                      onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-800 text-white text-sm focus:outline-none focus:border-amber-500"
                    >
                      <option value="">Not sure</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">Budget (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., ₦10,000-₦15,000"
                      value={form.budget}
                      onChange={(e) => setForm({ ...form, budget: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-800 text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">More details (optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Color, size, brand, anything that helps a seller know exactly what you want..."
                    value={form.details}
                    onChange={(e) => setForm({ ...form, details: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-800 text-white text-sm focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">Your WhatsApp Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g., 08012345678"
                    value={form.buyerPhone}
                    onChange={(e) => setForm({ ...form, buyerPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-800 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">Sellers who have what you need will message this number.</p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-stone-950 font-bold text-sm transition-colors"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>{submitting ? 'Posting...' : 'Post Request'}</span>
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RequestsPage;