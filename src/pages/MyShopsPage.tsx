'use client';

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Store, Trash2, Loader2, AlertCircle, PackageOpen, Phone, MapPin, PackagePlus, ExternalLink, LogIn, Sparkles, Eye, Copy, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { formatProductPrice } from '@/lib/pricing';
import { useAuth } from '@/context/AuthContext';
import AddProductModal from '@/components/modals/AddProductModal';
import PayRegistrationFeeButton from '@/components/PayRegistrationFeeButton';
import FeatureShopButton from '@/components/FeatureShopButton';
import AuthModal from '@/components/modals/AuthModal';

interface ProductMedia {
  id: string;
  file_url: string;
}

interface Product {
  id: string;
  title: string;
  price: number | null;
  price_type: 'fixed' | 'starting_from' | 'negotiable' | null;
  is_negotiable: boolean | null;
  product_media: ProductMedia[];
}

interface Shop {
  id: string;
  slug: string;
  business_name: string;
  phone: string;
  address: string | null;
  category_title: string;
  payment_status: 'pending' | 'approved';
  featured_until: string | null;
  view_count: number;
  ai_tip: string | null;
  products: Product[];
}

// AI Sales Tips is temporarily switched off - its Edge Function calls the
// Claude API, which needs a funded Anthropic Console billing account
// behind it. Flip this back to true once that's set up; nothing else
// needs to change.
const AI_TIPS_ENABLED = false;

// Featured Listings is temporarily switched off - holding back on charging
// for extra visibility until the platform has proven its core value to
// buyers first. Flip this back to true whenever that's ready; nothing
// else needs to change.
const FEATURED_LISTINGS_ENABLED = false;

export const MyShopsPage: React.FC = () => {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [addProductTarget, setAddProductTarget] = useState<{ shopId: string; businessName: string } | null>(null);
  const [generatingTipId, setGeneratingTipId] = useState<string | null>(null);
  const [tipError, setTipError] = useState<string | null>(null);
  const [bankTransferShopId, setBankTransferShopId] = useState<string | null>(null);
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Kept in sync with the same constant in PayRegistrationFeeButton.tsx -
  // both must be updated together if the fee ever changes.
  const REGISTRATION_FEE = 1000;

  const fetchMyShops = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('shops')
      .select(
        `
        id, slug, business_name, phone, address, category_title, payment_status, ai_tip, featured_until, view_count,
        products (
          id, title, price, price_type, is_negotiable,
          product_media ( id, file_url )
        )
      `
      )
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      setErrorMsg('Could not load your shops. Please try again.');
    } else {
      setShops((data as unknown as Shop[]) ?? []);
      setErrorMsg(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadShops = async () => {
      const { data, error } = await supabase
        .from('shops')
        .select(
          `
          id, slug, business_name, phone, address, category_title, payment_status, ai_tip, featured_until, view_count,
          products (
            id, title, price, price_type, is_negotiable,
            product_media ( id, file_url )
          )
        `
        )
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (cancelled) return;

      if (error) {
        console.error(error);
        setErrorMsg('Could not load your shops. Please try again.');
      } else {
        setShops((data as unknown as Shop[]) ?? []);
        setErrorMsg(null);
      }
      setLoading(false);
    };

    loadShops();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const removeStorageFolder = async (productId: string) => {
    const { data: files, error: listError } = await supabase.storage.from('product-media').list(productId);
    if (listError || !files || files.length === 0) return;
    const paths = files.map((f) => `${productId}/${f.name}`);
    await supabase.storage.from('product-media').remove(paths);
  };

  const handleDeleteProduct = async (product: Product, shopId: string) => {
    if (!confirm(`Delete "${product.title}"? This cannot be undone.`)) return;
    setBusyId(product.id);
    setErrorMsg(null);
    try {
      await removeStorageFolder(product.id);
      const { error } = await supabase.from('products').delete().eq('id', product.id);
      if (error) throw error;
      setShops((prev) =>
        prev.map((s) => (s.id === shopId ? { ...s, products: s.products.filter((p) => p.id !== product.id) } : s))
      );
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Could not delete that product.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteShop = async (shop: Shop) => {
    if (!confirm(`Delete "${shop.business_name}" and all ${shop.products.length} product(s) under it? This cannot be undone.`))
      return;
    setBusyId(shop.id);
    setErrorMsg(null);
    try {
      for (const product of shop.products) {
        await removeStorageFolder(product.id);
      }
      const { error } = await supabase.from('shops').delete().eq('id', shop.id);
      if (error) throw error;
      setShops((prev) => prev.filter((s) => s.id !== shop.id));
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Could not delete that shop.');
    } finally {
      setBusyId(null);
    }
  };

  const handleGenerateTip = async (shopId: string) => {
    setGeneratingTipId(shopId);
    setTipError(null);
    try {
      const { data, error } = await supabase.functions.invoke('generate-shop-tip', {
        body: { shopId }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setShops((prev) => prev.map((s) => (s.id === shopId ? { ...s, ai_tip: data.tip } : s)));
    } catch (err) {
      console.error(err);
      setTipError(err instanceof Error ? err.message : 'Could not generate a tip right now.');
    } finally {
      setGeneratingTipId(null);
    }
  };

  useEffect(() => {
    document.title = 'My Shops | 042 Plugs Plaza';
  }, []);

  return (
    <div className="min-h-screen bg-stone-700 text-white px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-amber-400 mb-5">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to 042 Plugs Plaza</span>
        </Link>

        <div className="flex items-center gap-2 text-white font-bold text-lg mb-6">
          <Store className="w-5 h-5 text-amber-400" />
          <span>My Shops</span>
        </div>

        {!user && (
          <div className="text-center py-20">
            <LogIn className="w-10 h-10 text-stone-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">Sign in to view your shops</h3>
            <button
              onClick={() => setShowAuthModal(true)}
              className="mt-4 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-sm font-semibold"
            >
              Sign In / Sign Up
            </button>
            {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
          </div>
        )}

        {user && (
          <>
            {errorMsg && (
              <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {tipError && (
              <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{tipError}</span>
              </div>
            )}

            {loading && (
              <div className="text-center py-20">
                <Loader2 className="w-8 h-8 text-amber-400 mx-auto mb-3 animate-spin" />
                <p className="text-xs text-stone-400">Loading your shops...</p>
              </div>
            )}

            {!loading && shops.length === 0 && (
              <div className="text-center py-20">
                <Store className="w-10 h-10 text-stone-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white mb-1">No shops yet</h3>
                <p className="text-xs text-stone-400">Create a shop from any category to see it here.</p>
              </div>
            )}

            {!loading && shops.length > 0 && (
              <div className="space-y-5">
                {shops.map((shop) => (
                  <div key={shop.id} className="rounded-xl border border-stone-800 bg-stone-900/50 p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border border-amber-500/30 bg-amber-500/10 text-amber-300">
                            {shop.category_title}
                          </span>
                          {shop.payment_status === 'approved' ? (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border border-amber-500/30 bg-amber-500/10 text-amber-300">
                              Live
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border border-stone-600 bg-stone-800 text-stone-300">
                              Pending Payment
                            </span>
                          )}
                          {shop.featured_until && new Date(shop.featured_until) > new Date() && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-amber-400/40 bg-amber-400/15 text-amber-300">
                              ⭐ Featured
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-white text-sm">{shop.business_name}</h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-stone-400">
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
                          <span className="flex items-center gap-1 text-amber-400/80">
                            <Eye className="w-3 h-3" />
                            <span>{shop.view_count} view{shop.view_count === 1 ? '' : 's'}</span>
                          </span>
                        </div>
                        {shop.payment_status === 'pending' && (
                          <div className="mt-3 max-w-xs">
                            <PayRegistrationFeeButton
                              shopId={shop.id}
                              businessName={shop.business_name}
                              userEmail={user?.email ?? ''}
                              onSuccess={() =>
                                setShops((prev) =>
                                  prev.map((s) => (s.id === shop.id ? { ...s, payment_status: 'approved' } : s))
                                )
                              }
                            />
                            <button
                              type="button"
                              onClick={() => setBankTransferShopId(bankTransferShopId === shop.id ? null : shop.id)}
                              className="mt-2 text-[11px] font-semibold text-amber-400 hover:text-amber-300"
                            >
                              {bankTransferShopId === shop.id ? 'Hide bank transfer details' : 'Or pay via bank transfer instead'}
                            </button>

                            {bankTransferShopId === shop.id && (
                              <div className="mt-2">
                                <div className="rounded-xl border border-white/15 bg-white/[0.06] backdrop-blur-sm p-3 mb-2">
                                  <div className="space-y-1.5 text-[11px]">
                                    <div className="flex items-center justify-between">
                                      <span className="text-stone-400">Bank</span>
                                      <span className="text-white font-medium">Opay</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-stone-400">Account Number</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText('8136573235');
                                          setCopiedAccount(true);
                                          setTimeout(() => setCopiedAccount(false), 2000);
                                        }}
                                        className="flex items-center gap-1 text-white font-medium hover:text-amber-400"
                                      >
                                        <span>8136573235</span>
                                        <Copy className="w-2.5 h-2.5" />
                                        {copiedAccount && <span className="text-amber-400 text-[9px]">Copied!</span>}
                                      </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-stone-400">Account Name</span>
                                      <span className="text-white font-medium">Ikenna Kingsley Nwachukwu</span>
                                    </div>
                                    <div className="flex items-center justify-between pt-1.5 border-t border-white/10">
                                      <span className="text-stone-400">Amount</span>
                                      <span className="text-amber-400 font-bold">₦{REGISTRATION_FEE.toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>
                                <a
                                  href={`https://wa.me/2348136573235?text=${encodeURIComponent(
                                    `Hi, I just paid the ₦${REGISTRATION_FEE.toLocaleString()} shop space fee for "${shop.business_name}" via bank transfer.\n\nPlease confirm and approve my shop. Thank you!`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => {
                                    void supabase
                                      .from('shops')
                                      .update({ payment_claimed_at: new Date().toISOString() })
                                      .eq('id', shop.id);
                                  }}
                                  className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-semibold text-xs transition-colors"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>I've Paid - Notify via WhatsApp</span>
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                        {FEATURED_LISTINGS_ENABLED && shop.payment_status === 'approved' && (
                          <div className="mt-3 max-w-xs">
                            <FeatureShopButton
                              shopId={shop.id}
                              businessName={shop.business_name}
                              userEmail={user?.email ?? ''}
                              isCurrentlyFeatured={!!(shop.featured_until && new Date(shop.featured_until) > new Date())}
                              onSuccess={(featuredUntil) =>
                                setShops((prev) =>
                                  prev.map((s) => (s.id === shop.id ? { ...s, featured_until: featuredUntil } : s))
                                )
                              }
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Link
                          to={`/shops/${shop.slug}`}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-medium whitespace-nowrap"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>View / Share Page</span>
                        </Link>
                        <button
                          onClick={() => setAddProductTarget({ shopId: shop.id, businessName: shop.business_name })}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[11px] font-medium whitespace-nowrap"
                        >
                          <PackagePlus className="w-3.5 h-3.5" />
                          <span>Add Product</span>
                        </button>
                        <button
                          onClick={() => handleDeleteShop(shop)}
                          disabled={busyId === shop.id}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 text-[11px] font-medium disabled:opacity-50 whitespace-nowrap"
                        >
                          {busyId === shop.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          <span>Delete Shop</span>
                        </button>
                      </div>
                    </div>

                    {shop.products.length === 0 ? (
                      <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-3">
                        <PackageOpen className="w-3.5 h-3.5" />
                        <span>No products listed yet</span>
                      </div>
                    ) : (
                      <div className="space-y-2 mt-3">
                        {shop.products.map((product) => (
                          <div key={product.id} className="flex items-center justify-between gap-2 border-t border-stone-800/70 pt-2">
                            <div className="flex items-center gap-2 min-w-0">
                              {product.product_media[0] && (
                                <img
                                  src={product.product_media[0].file_url}
                                  alt=""
                                  className="w-8 h-8 rounded-md object-cover flex-shrink-0 bg-stone-900"
                                />
                              )}
                              <div className="min-w-0">
                                <p className="text-xs text-white truncate">{product.title}</p>
                                <p className="text-[11px] text-amber-400">
                                  {formatProductPrice(product.price, product.price_type, product.is_negotiable)}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteProduct(product, shop.id)}
                              disabled={busyId === product.id}
                              className="flex items-center gap-1 px-2 py-1 rounded-md bg-stone-800 hover:bg-red-500/20 hover:text-red-300 text-stone-300 text-[10px] font-medium disabled:opacity-50 whitespace-nowrap"
                            >
                              {busyId === product.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                              <span>Remove</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* AI Sales Tip - hidden while AI_TIPS_ENABLED is false */}
                    {AI_TIPS_ENABLED && (
                      <div className="mt-3 pt-3 border-t border-stone-800/70">
                        {shop.ai_tip ? (
                          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] text-stone-300 leading-relaxed">{shop.ai_tip}</p>
                              <button
                                onClick={() => handleGenerateTip(shop.id)}
                                disabled={generatingTipId === shop.id}
                                className="mt-1.5 text-[10px] font-semibold text-amber-400 hover:text-amber-300 disabled:opacity-50"
                              >
                                {generatingTipId === shop.id ? 'Refreshing...' : 'Refresh Tip'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleGenerateTip(shop.id)}
                            disabled={generatingTipId === shop.id}
                            className="flex items-center gap-1.5 text-[11px] font-medium text-amber-400 hover:text-amber-300 disabled:opacity-50"
                          >
                            {generatingTipId === shop.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Sparkles className="w-3.5 h-3.5" />
                            )}
                            <span>{generatingTipId === shop.id ? 'Generating tip...' : 'Get AI Sales Tip'}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {addProductTarget && (
        <AddProductModal
          shopId={addProductTarget.shopId}
          businessName={addProductTarget.businessName}
          onClose={() => setAddProductTarget(null)}
          onProductAdded={fetchMyShops}
        />
      )}
    </div>
  );
};

export default MyShopsPage;