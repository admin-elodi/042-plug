import { HTMLRewriter } from 'https://ghuc.cc/worker-tools/html-rewriter';

// Crawlers for WhatsApp, Facebook, X, etc. never run JavaScript - they only
// ever see the raw HTML Netlify serves them. Since this is a single-page
// app, every route normally serves the exact same index.html with the
// exact same generic tags. This function intercepts requests specifically
// to /shops/:slug and rewrites the Open Graph tags at the edge - before
// the HTML reaches anyone, bot or human - using that shop's real name and
// a real photo from one of their own products.

const FALLBACK_IMAGE_PATH = '/og-default.jpg';

export default async (request: Request, context: any) => {
  const url = new URL(request.url);
  const match = url.pathname.match(/^\/shops\/([^/]+)\/?$/);

  if (!match) {
    return context.next();
  }

  const response = await context.next();
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return response;
  }

  const slug = match[1];
  const supabaseUrl = Deno.env.get('VITE_SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('VITE_SUPABASE_ANON_KEY');

  // If config is missing for any reason, just serve the normal page with
  // its default tags rather than breaking the request entirely.
  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  let title = '042 Plugs Plaza';
  let description = "Coal City's own digital plaza - browse trusted local shops or rent your own.";
  let image = `${url.origin}${FALLBACK_IMAGE_PATH}`;

  try {
    const query =
      `${supabaseUrl}/rest/v1/shops?slug=eq.${encodeURIComponent(slug)}` +
      `&payment_status=eq.approved&select=business_name,category_title,products(product_media(file_url))`;

    const res = await fetch(query, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`
      }
    });

    const data = await res.json();
    const shop = Array.isArray(data) ? data[0] : null;

    if (shop) {
      title = `${shop.business_name} | 042 Plugs Plaza`;
      description = `Check out ${shop.business_name} on 042 Plugs Plaza - ${shop.category_title}. Real shop, real seller, right in Coal City.`;

      // Use the first product photo we find, from any of this shop's products.
      const firstImage = (shop.products ?? [])
        .flatMap((p: { product_media?: { file_url?: string }[] }) => p.product_media ?? [])
        .find((m: { file_url?: string }) => m?.file_url)?.file_url;

      if (firstImage) {
        image = firstImage;
      }
    }
  } catch {
    // Network hiccup or bad data - fall through to the safe defaults above
    // rather than failing the whole page load.
  }

  return new HTMLRewriter()
    .on('title', {
      element(el: any) {
        el.setInnerContent(title);
      }
    })
    .on('meta[property="og:title"]', {
      element(el: any) {
        el.setAttribute('content', title);
      }
    })
    .on('meta[property="og:description"]', {
      element(el: any) {
        el.setAttribute('content', description);
      }
    })
    .on('meta[property="og:image"]', {
      element(el: any) {
        el.setAttribute('content', image);
      }
    })
    .on('meta[property="og:url"]', {
      element(el: any) {
        el.setAttribute('content', url.href);
      }
    })
    .on('meta[name="description"]', {
      element(el: any) {
        el.setAttribute('content', description);
      }
    })
    .on('meta[name="twitter:title"]', {
      element(el: any) {
        el.setAttribute('content', title);
      }
    })
    .on('meta[name="twitter:description"]', {
      element(el: any) {
        el.setAttribute('content', description);
      }
    })
    .on('meta[name="twitter:image"]', {
      element(el: any) {
        el.setAttribute('content', image);
      }
    })
    .transform(response);
};
