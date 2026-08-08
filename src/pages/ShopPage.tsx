'use client';

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Store, Phone, MapPin, Loader2, AlertCircle, PackageOpen, MessageCircle, Share2, ArrowLeft, Check } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

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
  business_name: string;
  phone: string;
  address: string | null;
  category_title: string;
  bank_name: string | null;
  account_number: string | null;
  account_name: string | null;
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

const buildOrderLink = (shop: Shop, product: Product) => {
  const priceText = product.price !== null ? `₦${Number(product.price).toLocaleString()}` : 'price on request';
  const paymentLine =
    shop.account_number && shop.account_name && shop.bank_name
      ? `\n\nPayment details:\nAccount Name: ${shop.account_name}\nAccount Number: ${shop.account_number}\nBank: ${shop.bank_name}`
      : '';
  const message =
    `Hi ${shop.business_name}, I'd like to order "${product.title}" (${priceText}) that I saw on 042 Plug.` +
    `\n\nPlease confirm it's available.${paymentLine}`;
  return `https://wa.me/${formatWhatsAppNumber(shop.phone)}?text=${encodeURIComponent(message)}`;
};

export const ShopPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    const loadShop = async () => {
      const { data, error } = await supabase
        .from('shops')
        .select(
          `
          id, business_name, phone, address, category_title, bank_name, account_number, account_name,
          products (
            id, title, description, price,
            product_media ( id, media_type, file_url, sort_order )
          )
        `
        )
        .eq('slug', slug)
        .maybeSingle();

      if (cancelled) return;

      if (error || !data) {
        setErrorMsg("This shop isn't available. It may be pending approval or no longer exists.");
      } else {
        setShop(data as unknown as Shop);
        document.title = `${(data as unknown as Shop).business_name} | 042 Plug`;
      }
      setLoading(false);
    };

    loadShop();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share && shop) {
      try {
        await navigator.share({ title: shop.business_name, url });
        return;
      } catch {
        // user cancelled the native share sheet — fall through to copy
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-stone-500 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-amber-600 mb-5">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to 042 Plugs</span>
        </Link>

        {loading && (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 text-amber-500 mx-auto mb-3 animate-spin" />
            <p className="text-xs text-stone-500">Loading shop...</p>
          </div>
        )}

        {!loading && errorMsg && (
          <div className="text-center py-20">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <p className="text-sm text-red-600">{errorMsg}</p>
          </div>
        )}

        {!loading && shop && (
          <div>
            <div className="rounded-2xl border border-stone-800 bg-stone-900/50 p-5 mb-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-block mb-2 px-2.5 py-1 rounded-full text-[10px] font-semibold border border-amber-500/30 bg-amber-500/10 text-amber-300">
                    {shop.category_title}
                  </span>
                  <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    <Store className="w-5 h-5 text-amber-400" />
                    {shop.business_name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-stone-400">
                    <a href={`tel:${shop.phone}`} className="flex items-center gap-1 hover:text-amber-400">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{shop.phone}</span>
                    </a>
                    {shop.address && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{shop.address}</span>
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-medium whitespace-nowrap"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Link Copied' : 'Share Shop'}</span>
                </button>
              </div>
            </div>

            {shop.products.length === 0 ? (
              <div className="text-center py-14 text-stone-500">
                <PackageOpen className="w-8 h-8 mx-auto mb-2" />
                <p className="text-xs">No products listed yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {shop.products.map((product) => (
                  <div key={product.id} className="rounded-xl border border-stone-800 bg-stone-900/40 p-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-semibold text-white text-sm">{product.title}</h3>
                      {product.price !== null && (
                        <span className="text-sm font-bold text-amber-400 whitespace-nowrap">
                          ₦{Number(product.price).toLocaleString()}
                        </span>
                      )}
                    </div>
                    {product.description && <p className="text-xs text-stone-400 mt-1">{product.description}</p>}

                    <a
                      href={buildOrderLink(shop, product)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 mt-3 w-fit px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Order via WhatsApp</span>
                    </a>

                    {product.product_media.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                        {[...product.product_media]
                          .sort((a, b) => a.sort_order - b.sort_order)
                          .map((media) => (
                            <div key={media.id} className="aspect-square rounded-lg overflow-hidden bg-stone-950 border border-stone-800">
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
        )}
      </div>
    </div>
  );
};

export default ShopPage;