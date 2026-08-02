// Converts a Nigerian phone number in any common format (080..., +234..., 234...)
// into the digits-only international format wa.me requires.
export const formatWhatsAppNumber = (phone: string) => {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) {
    digits = '234' + digits.slice(1);
  } else if (!digits.startsWith('234')) {
    digits = '234' + digits;
  }
  return digits;
};

export const buildWhatsAppLink = (phone: string, message: string) => {
  return `https://wa.me/${formatWhatsAppNumber(phone)}?text=${encodeURIComponent(message)}`;
};