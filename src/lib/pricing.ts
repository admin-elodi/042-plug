// Formats a product's price using its structured pricing fields - the
// single place this logic lives, so every page that shows a price (shop
// pages, category browsing, the WhatsApp order message) stays consistent.
export type PriceType = 'fixed' | 'starting_from' | 'negotiable';

export const formatProductPrice = (
  price: number | null,
  priceType: PriceType | null | undefined,
  isNegotiable: boolean | null | undefined
): string => {
  const type = priceType ?? 'fixed';

  if (type === 'negotiable') {
    return 'Negotiable';
  }

  const formatted = price !== null && price !== undefined ? `₦${Number(price).toLocaleString()}` : null;
  if (!formatted) return 'Price on request';

  const base = type === 'starting_from' ? `From ${formatted}` : formatted;
  return isNegotiable ? `${base} (Negotiable)` : base;
};