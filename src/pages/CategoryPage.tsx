'use client';

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Store, Phone, MapPin, Loader2, AlertCircle, PackageOpen, MessageCircle, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useSellerIdentity } from '@/hooks/useSellerIdentity';
import CATEGORIES from '@/data/categories';

interface ProductMedia {
  id: string;
  media_type: 'image' | 'video';
  file_url: string;
  sort_order: number;
}

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  product_media: ProductMedia[];
}

interface Shop {
  id: string;
  slug: string;
  business_name: string;
  phone: string;
  address: string | null;
  bank_name: string | null;
  account_number: string | null;
  account_name: string | null;
  featured_until: string | null;
  created_at: string;
  products: Product[];
}

const formatWhatsAppNumber = (phone: string) => {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) {
    digits = '234' + digits.slice(1);
  } else if (!digits.startsWith('234')) {
    digits = '234' + digits;
  }
  return digits;
};

const buildOrderLink = (shop: Shop, product: Product, buyerShopName?: string | null) => {
  const priceText = product.price !== null ? `₦${Number(product.price).toLocaleString()}` : 'price on request';
  const paymentLine =
    shop.account_number && shop.account_name && shop.bank_name
      ? `\n\nPayment details:\nAccount Name: ${shop.account_name}\nAccount Number: ${shop.account_number}\nBank: ${shop.bank_name}`
      : '';
  const fellowPlugLine = buyerShopName
    ? `\n\nP.S. I'm also a registered 042 Plugs seller (my shop: ${buyerShopName}) — always happy to support fellow plugs 🙏`
    : '';
  const message =
    `Hi ${shop.business_name}, I'd like to order "${product.title}" (${priceText}) that I saw on 042 Plugs Plaza.` +
    `\n\nPlease confirm it's available.${paymentLine}${fellowPlugLine}`;
  return `https://wa.me/${formatWhatsAppNumber(shop.phone)}?text=${encodeURIComponent(message)}`;
};

export const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const category = CATEGORIES.find((c) => c.id === categoryId);
  const myShopName = useSellerIdentity();

  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!categoryId) return;
    let cancelled = false;

    const loadShops = async () => {
      const { data, error } = await supabase
        .from('shops')
        .select(
          `
          id, slug, business_name, phone, address, bank_name, account_number, account_name, featured_until, created_at,
          products (
            id, title, description, price,
            product_media ( id, media_type, file_url, sort_order )
          )
        `
        )
        .eq('category_id', categoryId)
        .order('created_at', { ascending: false });

      if (cancelled) return;

      if (error) {
        console.error(error);
        setErrorMsg('Could not load shops right now. Please try again.');
      } else {
        const now = Date.now();
        const sorted = ((data as unknown as Shop[]) ?? []).sort((a, b) => {
          const aFeatured = a.featured_until && new Date(a.featured_until).getTime() > now;
          const bFeatured = b.featured_until && new Date(b.featured_until).getTime() > now;
          if (aFeatured && !bFeatured) return -1;
          if (!aFeatured && bFeatured) return 1;
          return 0; // keep existing created_at order within each group
        });
        setShops(sorted);
      }
      setLoading(false);
    };

    loadShops();
    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  useEffect(() => {
    document.title = category ? `${category.title} | 042 Plugs Plaza` : '042 Plugs Plaza';
  }, [category]);

  return (
    <div className="min-h-screen bg-stone-950 text-white px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-amber-400 mb-5">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to 042 Plugs Plaza</span>
        </Link>

        <div className="flex items-center gap-2 text-white font-bold text-lg mb-6">
          <Store className="w-5 h-5 text-amber-500" />
          <span>{category ? category.title : 'Category'}</span>
        </div>

        {loading && (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 text-amber-500 mx-auto mb-3 animate-spin" />
            <p className="text-xs text-stone-400">Loading shops...</p>
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
            <h3 className="text-base font-bold text-white mb-1">No shops yet</h3>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              No one has registered a shop in {category ? category.title : 'this category'} yet. Be the first!
            </p>
          </div>
        )}

        {!loading && !errorMsg && shops.length > 0 && (
          <div className="space-y-5">
            {shops.map((shop) => {
              const isFeatured = !!(shop.featured_until && new Date(shop.featured_until).getTime() > Date.now());
              return (
              <div
                key={shop.id}
                className={`rounded-xl border p-4 ${
                  isFeatured ? 'border-amber-500/40 bg-amber-500/[0.03]' : 'border-stone-800 bg-stone-900/60'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    {isFeatured && (
                      <span className="inline-flex items-center gap-1 mb-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-amber-400/40 bg-amber-400/15 text-amber-300">
                        ⭐ Featured
                      </span>
                    )}
                    <h3 className="font-bold text-white text-sm">{shop.business_name}</h3>
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
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-300 text-[10px] font-medium whitespace-nowrap"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Full Page</span>
                  </Link>
                </div>

                {shop.products.length === 0 ? (
                  <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-3">
                    <PackageOpen className="w-3.5 h-3.5" />
                    <span>No products listed yet</span>
                  </div>
                ) : (
                  <div className="space-y-3 mt-3">
                    {shop.products.map((product) => (
                      <div key={product.id} className="border-t border-stone-800/70 pt-3">
                        <div className="flex items-baseline justify-between gap-2">
                          <h4 className="text-xs font-semibold text-white">{product.title}</h4>
                          {product.price !== null && (
                            <span className="text-xs font-bold text-amber-400 whitespace-nowrap">
                              ₦{Number(product.price).toLocaleString()}
                            </span>
                          )}
                        </div>
                        {product.description && <p className="text-[11px] text-stone-400 mt-1">{product.description}</p>}

                        <a
                          href={buildOrderLink(shop, product, myShopName)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 mt-2 w-fit px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[11px] font-semibold transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Order via WhatsApp</span>
                        </a>

                        {product.product_media.length > 0 && (
                          <div className="grid grid-cols-4 gap-1.5 mt-2">
                            {[...product.product_media]
                              .sort((a, b) => a.sort_order - b.sort_order)
                              .map((media) => (
                                <div key={media.id} className="aspect-square rounded-md overflow-hidden bg-stone-950 border border-stone-800">
                                  {media.media_type === 'image' ? (
                                    <img src={media.file_url} alt={product.title} className="w-full h-full object-cover" />
                                  ) : (
                                    <video src={media.file_url} className="w-full h-full object-cover" muted controls />
                                  )}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;