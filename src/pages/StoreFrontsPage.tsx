'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Store, Phone, MapPin, Loader2, AlertCircle, ExternalLink, Search } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import CATEGORIES from '@/data/categories';

interface Shop {
  id: string;
  slug: string;
  business_name: string;
  phone: string;
  address: string | null;
  category_id: string;
  category_title: string;
  featured_until: string | null;
  created_at: string;
}

const SHOPS_PER_CATEGORY_PREVIEW = 5;

const isFeatured = (shop: Shop) => !!(shop.featured_until && new Date(shop.featured_until).getTime() > Date.now());

const ShopRow: React.FC<{ shop: Shop; showCategoryTag?: boolean }> = ({ shop, showCategoryTag }) => {
  const featured = isFeatured(shop);
  return (
    <div
      className={`rounded-xl border p-4 flex items-start justify-between gap-3 ${
        featured ? 'border-amber-500/40 bg-amber-500/[0.03]' : 'border-stone-800 bg-stone-900/60'
      }`}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 mb-1">
          {showCategoryTag && (
            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border border-stone-700 bg-stone-950 text-stone-300">
              {shop.category_title}
            </span>
          )}
          {featured && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-amber-400/40 bg-amber-400/15 text-amber-300">
              ⭐ Featured
            </span>
          )}
        </div>
        <h3 className="font-bold text-white text-sm truncate">{shop.business_name}</h3>
        <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-stone-400">
          <a href={`tel:${shop.phone}`} className="flex items-center gap-1 hover:text-amber-400">
            <Phone className="w-3 h-3" />
            <span>{shop.phone}</span>
          </a>
          {shop.address && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{shop.address}</span>
            </span>
          )}
        </div>
      </div>
      <Link
        to={`/shops/${shop.slug}`}
        className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-300 text-[10px] font-medium whitespace-nowrap"
      >
        <ExternalLink className="w-3 h-3" />
        <span>Visit</span>
      </Link>
    </div>
  );
};

export const StorefrontsPage: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadShops = async () => {
      const { data, error } = await supabase
        .from('shops')
        .select('id, slug, business_name, phone, address, category_id, category_title, featured_until, created_at')
        .order('created_at', { ascending: false });

      if (cancelled) return;

      if (error) {
        console.error(error);
        setErrorMsg('Could not load storefronts right now. Please try again.');
      } else {
        setShops((data as Shop[]) ?? []);
      }
      setLoading(false);
    };

    loadShops();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.title = 'All Storefronts | 042 Plug';
  }, []);

  // Groups shops by category, in the SAME fixed order categories appear
  // in on the homepage grid — not alphabetical, not chronological — so
  // the mental map stays consistent everywhere on the site. Within each
  // category: featured shops first, then newest first (matching Browse).
  const groupedByCategory = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const shopsInCategory = shops
        .filter((s) => s.category_id === cat.id)
        .sort((a, b) => {
          const aFeatured = isFeatured(a);
          const bFeatured = isFeatured(b);
          if (aFeatured && !bFeatured) return -1;
          if (!aFeatured && bFeatured) return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
      return { category: cat, shops: shopsInCategory };
    }).filter((group) => group.shops.length > 0); // skip categories with no shops yet
  }, [shops]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.trim().toLowerCase();
    return shops
      .filter((s) => s.business_name.toLowerCase().includes(q))
      .sort((a, b) => {
        const aFeatured = isFeatured(a);
        const bFeatured = isFeatured(b);
        if (aFeatured && !bFeatured) return -1;
        if (!aFeatured && bFeatured) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [shops, searchQuery]);

  return (
    <div className="min-h-screen bg-stone-950 text-white px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-amber-400 mb-5">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to 042 Plug</span>
        </Link>

        <div className="flex items-center gap-2 text-white font-bold text-lg mb-4">
          <Store className="w-5 h-5 text-amber-500" />
          <span>All Storefronts</span>
        </div>

        {/* Search — the real scaling tool once there are hundreds/thousands
            of shops; sort order alone can't keep a page like this usable. */}
        <div className="relative mb-6">
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search shops by name..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-white text-sm focus:outline-none focus:border-amber-500"
          />
        </div>

        {loading && (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 text-amber-500 mx-auto mb-3 animate-spin" />
            <p className="text-xs text-stone-400">Loading storefronts...</p>
          </div>
        )}

        {!loading && errorMsg && (
          <div className="text-center py-20">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <p className="text-sm text-red-300">{errorMsg}</p>
          </div>
        )}

        {!loading && !errorMsg && shops.length === 0 && (
          <div className="text-center py-20">
            <Store className="w-10 h-10 text-stone-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No storefronts yet</h3>
            <p className="text-xs text-stone-400">Be the first to register a shop on 042 Plugs.</p>
          </div>
        )}

        {/* Search results — flat list, no category grouping, since the
            person already knows what they're looking for by name. */}
        {!loading && !errorMsg && searchResults !== null && (
          <div>
            <p className="text-xs text-stone-500 mb-3">
              {searchResults.length === 0
                ? `No shops matching "${searchQuery}"`
                : `${searchResults.length} shop${searchResults.length === 1 ? '' : 's'} matching "${searchQuery}"`}
            </p>
            <div className="space-y-3">
              {searchResults.map((shop) => (
                <ShopRow key={shop.id} shop={shop} showCategoryTag />
              ))}
            </div>
          </div>
        )}

        {/* Normal browsing view — grouped by category */}
        {!loading && !errorMsg && searchResults === null && shops.length > 0 && (
          <div className="space-y-8">
            {groupedByCategory.map(({ category, shops: shopsInCategory }) => (
              <div key={category.id}>
                <h2 className="text-sm font-extrabold text-white tracking-tight mb-3">
                  {category.title}
                  <span className="ml-2 text-xs font-normal text-stone-500">({shopsInCategory.length})</span>
                </h2>
                <div className="space-y-3">
                  {shopsInCategory.slice(0, SHOPS_PER_CATEGORY_PREVIEW).map((shop) => (
                    <ShopRow key={shop.id} shop={shop} />
                  ))}
                </div>
                {shopsInCategory.length > SHOPS_PER_CATEGORY_PREVIEW && (
                  <Link
                    to={`/browse/${category.id}`}
                    className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-amber-400 hover:text-amber-300"
                  >
                    <span>
                      View all {shopsInCategory.length} shops in {category.title}
                    </span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StorefrontsPage;