'use client';

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Trash2, Plus, Minus, MessageCircle, Store } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { buildShopCheckoutLink, calculateFirmSubtotal } from '@/lib/cartCheckout';
import { formatProductPrice } from '@/lib/pricing';

export const CartPage: React.FC = () => {
  const { items, removeItem, updateQuantity, clearShop } = useCart();

  // Group items by shop — checkout always happens one shop at a time,
  // since each shop has its own WhatsApp number and payment details.
  const groupedByShop = items.reduce<Record<string, typeof items>>((acc, item) => {
    if (!acc[item.shopId]) acc[item.shopId] = [];
    acc[item.shopId].push(item);
    return acc;
  }, {});

  const shopGroups = Object.values(groupedByShop);

  return (
    <div className="min-h-screen bg-stone-950 text-white px-4 py-8">
      <div className="max-w-xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-amber-400 mb-6">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continue Browsing</span>
        </Link>

        <div className="flex items-center gap-2 text-white font-bold text-lg mb-6">
          <ShoppingCart className="w-5 h-5 text-amber-500" />
          <span>Your Cart</span>
        </div>

        {shopGroups.length === 0 && (
          <div className="text-center py-20">
            <ShoppingCart className="w-10 h-10 text-stone-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">Your cart is empty</h3>
            <p className="text-xs text-stone-400 mb-4">Add a few items from any shop to get started.</p>
            <Link
              to="/storefronts"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-sm font-semibold"
            >
              Browse Storefronts
            </Link>
          </div>
        )}

        <div className="space-y-6">
          {shopGroups.map((shopItems) => {
            const shopName = shopItems[0].shopName;
            const shopId = shopItems[0].shopId;
            const shopPhone = shopItems[0].shopPhone;
            const subtotal = calculateFirmSubtotal(shopItems);
            const hasFlexiblePricing = shopItems.some((i) => i.priceType !== 'fixed' || i.isNegotiable);

            return (
              <div key={shopId} className="rounded-2xl border border-stone-800 bg-stone-900/60 p-4">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-stone-800">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">{shopName}</h3>
                  </div>
                  <button
                    onClick={() => clearShop(shopId)}
                    className="text-[11px] text-stone-500 hover:text-red-400"
                  >
                    Clear
                  </button>
                </div>

                <div className="space-y-3">
                  {shopItems.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                        <p className="text-[11px] text-amber-400">
                          {formatProductPrice(item.price, item.priceType, item.isNegotiable)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-md bg-stone-800 hover:bg-stone-700 text-stone-300"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.priceType === 'negotiable'}
                          className="w-6 h-6 flex items-center justify-center rounded-md bg-stone-800 hover:bg-stone-700 text-stone-300 disabled:opacity-40"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="ml-1 text-stone-500 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-stone-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-stone-400">
                      {hasFlexiblePricing ? 'Subtotal (fixed-price items)' : 'Subtotal'}
                    </span>
                    <span className="text-sm font-bold text-amber-400">₦{subtotal.toLocaleString()}</span>
                  </div>
                  {hasFlexiblePricing && (
                    <p className="text-[10px] text-stone-500 mb-3">
                      Some items are negotiable or "starting from" — their price isn't included in this total, but
                      they'll be listed separately in your message to the seller.
                    </p>
                  )}
                  <a
                    href={buildShopCheckoutLink(shopPhone, shopName, shopItems)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-sm transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Checkout via WhatsApp</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {shopGroups.length > 1 && (
          <p className="text-[11px] text-stone-500 text-center mt-6">
            Items from different shops need separate checkouts — each seller has their own WhatsApp and payment
            details.
          </p>
        )}
      </div>
    </div>
  );
};

export default CartPage;
