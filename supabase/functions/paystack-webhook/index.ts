import { createClient } from 'jsr:@supabase/supabase-js@2';

// This must match the amount actually charged. Update together with the
// matching value in CreateShopModal.tsx / PayRegistrationFeeButton.tsx.
const EXPECTED_AMOUNT_KOBO = 100000; // ₦1,000

// Paystack signs every webhook payload with this header, computed as
// HMAC-SHA512 of the raw request body using your secret key. We must
// verify it independently - otherwise anyone who found this URL could
// fake a "payment succeeded" call and get a free shop approval.
async function verifyPaystackSignature(rawBody: string, signature: string | null, secret: string): Promise<boolean> {
  if (!signature) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign']
  );
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));
  const computedHex = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return computedHex === signature;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');

    if (!paystackSecretKey) {
      console.error('PAYSTACK_SECRET_KEY not configured');
      return new Response('Not configured', { status: 500 });
    }

    const isValid = await verifyPaystackSignature(rawBody, signature, paystackSecretKey);
    if (!isValid) {
      console.error('Invalid Paystack webhook signature - possible spoofed request');
      return new Response('Invalid signature', { status: 401 });
    }

    const event = JSON.parse(rawBody);

    // We only care about successful charges. Every other event type
    // (failed, abandoned, etc.) is acknowledged but ignored.
    if (event.event !== 'charge.success') {
      return new Response('Ignored', { status: 200 });
    }

    const { amount, reference, metadata } = event.data;
    const shopId = metadata?.shop_id;

    if (!shopId) {
      console.error('Webhook received with no shop_id in metadata', reference);
      return new Response('Missing shop_id', { status: 200 }); // 200 so Paystack doesn't retry forever
    }

    if (amount !== EXPECTED_AMOUNT_KOBO) {
      console.error(`Amount mismatch for shop ${shopId}: got ${amount}, expected ${EXPECTED_AMOUNT_KOBO}`);
      return new Response('Amount mismatch', { status: 200 });
    }

    // Webhooks have no signed-in user - this uses the service role key,
    // which bypasses RLS entirely. That's appropriate here specifically
    // because we've already independently verified this request really
    // came from Paystack via the signature check above.
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { error } = await supabase
      .from('shops')
      .update({
        payment_status: 'approved',
        paystack_reference: reference,
        payment_amount_kobo: amount
      })
      .eq('id', shopId);

    if (error) {
      console.error('Failed to approve shop from webhook:', error);
      return new Response('Database error', { status: 500 });
    }

    console.log(`Shop ${shopId} approved via webhook, reference ${reference}`);
    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('Webhook processing error:', err);
    return new Response('Internal error', { status: 500 });
  }
});