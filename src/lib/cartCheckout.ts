import type { CartItem } from '@/context/CartContext';
import { formatWhatsAppNumber } from './whatsapp';
import { formatProductPrice } from './pricing';

// An item only gets folded into a firm numeric total when its price is
// genuinely fixed and non-negotiable. Anything "Starting From" or marked
// negotiable is listed with its own price instead — summing those would
// imply a certainty about the final cost that isn't actually there.
const isFirmPrice = (item: CartItem) => item.priceType === 'fixed' && !item.isNegotiable && item.price !== null;

export const buildShopCheckoutMessage = (shopName: string, shopItems: CartItem[]): string => {
  const firm = shopItems.filter(isFirmPrice);
  const flexible = shopItems.filter((i) => !isFirmPrice(i));

  const lines: string[] = [`Hi ${shopName}, I'd like to order the following from 042 Plugs Plaza:`, ''];

  let subtotal = 0;
  firm.forEach((item, idx) => {
    const lineTotal = (item.price ?? 0) * item.quantity;
    subtotal += lineTotal;
    lines.push(`${idx + 1}. ${item.title} x${item.quantity} — ₦${lineTotal.toLocaleString()}`);
  });

  if (firm.length > 0) {
    lines.push('', `Subtotal: ₦${subtotal.toLocaleString()}`);
  }

  if (flexible.length > 0) {
    lines.push('', 'Also interested in (price to confirm):');
    flexible.forEach((item) => {
      lines.push(`- ${item.title} x${item.quantity} — ${formatProductPrice(item.price, item.priceType, item.isNegotiable)}`);
    });
  }

  lines.push('', 'Please confirm availability and next steps for payment and delivery. Thank you!');

  return lines.join('\n');
};

export const buildShopCheckoutLink = (shopPhone: string, shopName: string, shopItems: CartItem[]): string => {
  const message = buildShopCheckoutMessage(shopName, shopItems);
  return `https://wa.me/${formatWhatsAppNumber(shopPhone)}?text=${encodeURIComponent(message)}`;
};

export const calculateFirmSubtotal = (shopItems: CartItem[]): number => {
  return shopItems.filter(isFirmPrice).reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0);
};
