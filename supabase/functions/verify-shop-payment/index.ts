import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Starting price - ₦500 for 7 days. Update this (and the matching constant
// in FeatureShopButton.tsx) together whenever the price/duration changes.
const EXPECTED_AMOUNT_KOBO = 50000; // ₦500
const FEATURE_DURATION_DAYS = 7;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { reference, shopId } = await req.json();
    if (!reference || !shopId) {
      return new Response(JSON.stringify({ error: 'reference and shopId are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('id, owner_id, payment_status, featured_until')
      .eq('id', shopId)
      .single();

    if (shopError || !shop) {
      return new Response(JSON.stringify({ error: 'Shop not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (shop.owner_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Not your shop' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (shop.payment_status !== 'approved') {
      return new Response(JSON.stringify({ error: 'Only live shops can be featured.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!paystackSecretKey) {
      return new Response(JSON.stringify({ error: 'Payment verification is not configured yet.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${paystackSecretKey}` },
    });

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok || !verifyData.status) {
      return new Response(JSON.stringify({ error: 'Could not verify this payment with Paystack.' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const transaction = verifyData.data;

    if (transaction.status !== 'success') {
      return new Response(JSON.stringify({ error: `Payment was not successful (status: ${transaction.status}).` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (transaction.amount !== EXPECTED_AMOUNT_KOBO) {
      return new Response(JSON.stringify({ error: 'The amount paid does not match the featured listing fee.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extend from the current featured_until if it's still active (so
    // buying another 7 days while already featured adds on top, rather
    // than wasting the remaining time), otherwise start fresh from now.
    const currentExpiry = shop.featured_until ? new Date(shop.featured_until) : null;
    const baseTime = currentExpiry && currentExpiry.getTime() > Date.now() ? currentExpiry : new Date();
    const newExpiry = new Date(baseTime.getTime() + FEATURE_DURATION_DAYS * 24 * 60 * 60 * 1000);

    const { error: updateError } = await supabase
      .from('shops')
      .update({ featured_until: newExpiry.toISOString() })
      .eq('id', shopId);

    if (updateError) {
      console.error(updateError);
      return new Response(JSON.stringify({ error: 'Payment verified but could not activate featuring. Please contact support.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, featuredUntil: newExpiry.toISOString() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Something went wrong verifying your payment.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});