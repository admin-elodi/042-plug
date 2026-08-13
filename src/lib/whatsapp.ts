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

const DEFAULT_PHONE = '2348136573235';

// Same idea as formatWhatsAppNumber, but falls back to the platform's own
// number if none was provided — used for admin-notification messages where
// a phone number isn't always guaranteed to be on hand.
export const cleanPhoneNumber = (phone?: string): string => {
  if (!phone) return DEFAULT_PHONE;
  const formatted = formatWhatsAppNumber(phone);
  return formatted.length > 3 ? formatted : DEFAULT_PHONE; // '234' alone means nothing usable was given
};

export interface WhatsAppJobMessageParams {
  jobTitle: string;
  companyName?: string;
  location?: string;
  salary?: string;
  jobType?: string;
}

const buildJobMessage = (params: WhatsAppJobMessageParams): string => {
  const lines = [
    `Hello! I saw your job vacancy post on 042 Plugs for the position of *${params.jobTitle}*${params.companyName ? ` at *${params.companyName}*` : ''}.`,
    '',
    'Here are the details of the post I am applying for:',
    `- Position: ${params.jobTitle}`,
    params.companyName ? `- Company: ${params.companyName}` : null,
    params.location ? `- Location: ${params.location}` : null,
    params.salary ? `- Pay/Salary: ${params.salary}` : null,
    params.jobType ? `- Employment Type: ${params.jobType}` : null,
    '',
    'I would like to apply and submit my credentials for this role. Please let me know the next steps. Thank you!'
  ].filter((line): line is string => line !== null);

  return lines.join('\n');
};

/**
 * Builds a pre-filled WhatsApp message link. Accepts EITHER:
 *  - a plain message string (used across most of the app — product orders,
 *    payment fallback messages, admin notifications), or
 *  - the structured WhatsAppJobMessageParams (used specifically for the
 *    job-application "Apply via WhatsApp" flow).
 */
export const buildWhatsAppLink = (
  phone: string | undefined,
  messageOrParams: string | WhatsAppJobMessageParams
): string => {
  const targetPhone = cleanPhoneNumber(phone);
  const fullMessage =
    typeof messageOrParams === 'string' ? messageOrParams : buildJobMessage(messageOrParams);

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(fullMessage)}`;
};