import type { NextFunction, Request, Response } from "express";
import { findProduct, listProducts, type StoreProduct } from "./store";

const safeText = (value: string) => value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
const xmlText = (value: string) => value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character] ?? character);

function publicOrigin() {
  const value = process.env.VITE_PUBLIC_SITE_URL?.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.origin : null;
  } catch {
    return null;
  }
}

type PageInfo = {
  title: string;
  description: string;
  path: string;
  body: string;
  status: number;
  noindex?: boolean;
  structuredData?: Record<string, unknown>;
};

function productMarkup(catalogue: readonly StoreProduct[]) {
  return catalogue.map((product) => `<article><a href="/product/${safeText(product.slug)}"><img src="${safeText(product.image)}" alt="${safeText(product.name)} coffee" width="280" height="222"><h3>${safeText(product.name)}</h3></a><p>${safeText(product.blend)}</p><p>${safeText(product.description)}</p><strong>$${Number(product.price).toFixed(2)}</strong></article>`).join("");
}

function notFoundPage(path: string): PageInfo {
  return { title: "Page Not Found | Bean Scene", description: "The page you requested could not be found. Continue to the Bean Scene coffee shop.", path, status: 404, noindex: true, body: `<main class="seo-fallback"><h1>Page not found</h1><p>The page you requested is not part of the Bean Scene storefront.</p><a href="/">Return to Bean Scene</a></main>` };
}

async function getPage(path: string): Promise<PageInfo> {
  if (path === "/") {
    const { products } = await listProducts();
    return {
      title: "Bean Scene | Coffee Shop & Roastery",
      description: "Bean Scene brings beautifully roasted coffee and a warm, unhurried morning ritual to every cup.",
      path,
      status: 200,
      body: `<main class="seo-fallback"><header><p>We’ve got your morning covered with</p><h1>Coffee</h1><p>It is best to start your day with a cup of coffee. Discover the best flavours coffee you will ever have. We provide the best for our customers.</p><p><a href="/shop">Order Now</a></p></header><section><h2>Discover the best coffee</h2><p>Bean Scene is a coffee shop that provides you with quality coffee that helps boost your productivity and helps build your mood. Having a cup of coffee is good, but having a cup of real coffee is greater. There is no doubt that you will enjoy this coffee more than others you have ever tasted.</p><h2>Enjoy a new blend of coffee style</h2><p>Explore all flavours of coffee with us. There is always a new cup worth experiencing</p><div>${productMarkup(products)}</div><h2>Why are we different?</h2><p>We don’t just make your coffee, we make your day!</p><p>Supreme Beans · High Quality · Extraordinary · Affordable Price</p><h2>Get a chance to have an Amazing morning</h2><p>We are giving you are one time opportunity to experience a better life with coffee.</p><h2>Our coffee perfection feedback</h2><p>Our customers has amazing things to say about us</p><h2>Subscribe to get the Latest News</h2><p>Don’t miss out on our latest news, updates, tips and special offers</p></section></main>`,
      structuredData: { "@context": "https://schema.org", "@type": "CafeOrCoffeeShop", name: "Bean Scene", description: "A warm coffee shop for beautifully roasted coffee and unhurried rituals.", servesCuisine: "Coffee", telephone: "+1 202-918-2132", email: "beanscene@mail.com" },
    };
  }
  if (path === "/shop") {
    const { products } = await listProducts();
    return {
      title: "Shop Coffee | Bean Scene Coffee Favorites",
      description: "Browse coffee favorites from Bean Scene, including Cappuccino, Chai Latte, Macchiato and Expresso.",
      path,
      status: 200,
      body: `<main class="seo-fallback"><p>The Bean Scene selection</p><h1>Find a cup worth experiencing</h1><p>Explore the coffee ritual that fits your pace, your palate, and your morning.</p><section><h2>Our signature cups</h2><div>${productMarkup(products)}</div></section></main>`,
    };
  }

  const productMatch = path.match(/^\/product\/([^/]+)$/);
  if (productMatch) {
    let slug = "";
    try { slug = decodeURIComponent(productMatch[1]); } catch { return notFoundPage(path); }
    const { product } = await findProduct(slug);
    if (!product) return { title: "Coffee Not Found | Bean Scene", description: "This coffee could not be found. Browse Bean Scene coffee favorites.", path, status: 404, noindex: true, body: `<main class="seo-fallback"><h1>Coffee not found</h1><p>This product may no longer be available.</p><a href="/shop">Browse coffee</a></main>` };
    const origin = publicOrigin();
    return {
      title: `${product.name} Coffee | Bean Scene`,
      description: product.description,
      path,
      status: 200,
      structuredData: origin ? { "@context": "https://schema.org", "@type": "Product", name: product.name, description: product.description, image: `${origin}${product.image}`, offers: { "@type": "Offer", priceCurrency: "USD", price: product.price, availability: "https://schema.org/InStock" } } : undefined,
      body: `<main class="seo-fallback"><a href="/shop">Back to Menu</a><article><img src="${safeText(product.image)}" alt="${safeText(product.name)} coffee" width="640" height="460"><p>Bean Scene coffee</p><h1>${safeText(product.name)}</h1><p>${safeText(product.blend)}</p><strong>$${Number(product.price).toFixed(2)}</strong><p>${safeText(product.description)}</p><ul>${product.notes.map((note) => `<li>${safeText(note)}</li>`).join("")}</ul><a href="/shop">Explore more coffee</a></article></main>`,
    };
  }

  if (path === "/about") return { title: "About Bean Scene | Coffee and Hospitality", description: "Learn how Bean Scene brings quality coffee, thoughtful craft and warm hospitality to an unhurried morning.", path, status: 200, body: `<main class="seo-fallback"><p>Our coffee story</p><h1>We make room for the unhurried morning.</h1><p>Bean Scene is a coffee shop shaped around flavour, thoughtful craft, and a little more time for yourself.</p><h2>Discover the best coffee</h2><p>Bean Scene is a coffee shop that provides you with quality coffee that helps boost your productivity and helps build your mood. Having a cup of coffee is good, but having a cup of real coffee is greater.</p><h2>Why are we different?</h2><p>We don’t just make your coffee, we make your day!</p></main>` };
  if (path === "/contact") return { title: "Contact Bean Scene | Coffee Questions and Support", description: "Contact Bean Scene with coffee questions, menu feedback or support requests. We would love to hear from you.", path, status: 200, body: `<main class="seo-fallback"><p>Let’s talk coffee</p><h1>We’d love to hear from you.</h1><p>Ask a question, share a coffee moment, or tell us what you would like to taste next.</p><h2>Find your Bean Scene</h2><p>Akshya Nagar 1st Block 1st Cross, Rammurthy nagar, Bangalore-560016</p><p><a href="tel:+12029182132">+1 202-918-2132</a> · <a href="mailto:beanscene@mail.com">beanscene@mail.com</a></p></main>` };
  if (path === "/cart") return { title: "Your Cart | Bean Scene Coffee", description: "Review the Bean Scene coffee selection in your cart before demo checkout.", path, status: 200, noindex: true, body: `<main class="seo-fallback"><h1>Your coffee cart</h1><p>Review your selections before continuing to our clearly-labelled demo checkout.</p><a href="/shop">Explore coffee</a></main>` };
  if (path === "/checkout") return { title: "Demo Checkout | Bean Scene Coffee", description: "Confirm your Bean Scene demo coffee order without entering payment information.", path, status: 200, noindex: true, body: `<main class="seo-fallback"><h1>Finish your demo order</h1><p>This portfolio checkout never asks for payment details and does not place a real coffee order.</p></main>` };
  if (path === "/order-confirmed") return { title: "Demo Order Confirmed | Bean Scene", description: "Your Bean Scene demo coffee order has been confirmed.", path, status: 200, noindex: true, body: `<main class="seo-fallback"><h1>Demo order confirmed</h1><p>This portfolio flow has not processed a payment or placed a real coffee order.</p></main>` };
  return notFoundPage(path);
}

function sitemapXml(origin: string, catalogue: readonly StoreProduct[]) {
  const paths = ["/", "/shop", "/about", "/contact", ...catalogue.map((product) => `/product/${product.slug}`)];
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>${xmlText(`${origin}${path}`)}</loc></url>`).join("")}</urlset>`;
}

function injectSeo(template: string, page: PageInfo) {
  const origin = publicOrigin();
  const title = safeText(page.title);
  const description = safeText(page.description);
  const originMeta = origin ? `<link rel="canonical" href="${origin}${safeText(page.path)}"><meta property="og:url" content="${origin}${safeText(page.path)}"><meta property="og:image" content="${origin}/assets/figma/1-41.webp"><meta name="twitter:image" content="${origin}/assets/figma/1-41.webp"><script>window.__BEAN_SCENE_PUBLIC_ORIGIN__=${JSON.stringify(origin).replace(/</g, "\\u003c")};</script>` : "";
  const meta = `<meta name="description" content="${description}"><meta name="robots" content="${page.noindex ? "noindex, nofollow" : "index, follow"}"><meta property="og:type" content="${page.structuredData?.["@type"] === "Product" ? "product" : "website"}"><meta property="og:site_name" content="Bean Scene"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}">${originMeta}`;
  const jsonLd = page.structuredData ? `<script type="application/ld+json">${JSON.stringify(page.structuredData).replace(/</g, "\\u003c")}</script>` : "";
  return template
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`)
    .replace(/<meta\s+name="description"[^>]*>/i, "")
    .replace(/<meta\s+name="robots"[^>]*>/i, "")
    .replace(/<meta\s+property="og:[^"]+"[^>]*>/gi, "")
    .replace(/<meta\s+name="twitter:[^"]+"[^>]*>/gi, "")
    .replace(/<link\s+rel="canonical"[^>]*>/i, "")
    .replace(/<script\s+type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<div\s+id="root">[\s\S]*?<\/div>/i, `<div id="root">${page.body}</div>`)
    .replace(/<\/head>/i, `${meta}${jsonLd}</head>`);
}

async function xmlRoutes() {
  const origin = publicOrigin();
  if (!origin) return null;
  const { products } = await listProducts();
  return sitemapXml(origin, products);
}

export function createSeoMiddleware(
  getTemplate: () => Promise<string>,
  transform?: (template: string, url: string) => Promise<string>,
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "GET") return next();
    const pathname = new URL(req.originalUrl, "http://beanscene.local").pathname;
    if (pathname === "/robots.txt") {
      const origin = publicOrigin();
      res.type("text/plain").send(["User-agent: *", "Allow: /", "Disallow: /api/", ...(origin ? [`Sitemap: ${origin}/sitemap.xml`] : [])].join("\n") + "\n");
      return;
    }
    if (pathname === "/sitemap.xml") {
      try {
        const xml = await xmlRoutes();
        if (!xml) { res.status(404).type("text/plain").send("Set VITE_PUBLIC_SITE_URL to the real production origin to enable the sitemap.\n"); return; }
        res.type("application/xml").send(xml);
      } catch (error) { next(error); }
      return;
    }
    if (pathname.startsWith("/api/") || pathname.startsWith("/assets/") || pathname.startsWith("/@") || /\.[a-z0-9]{2,6}$/i.test(pathname)) return next();
    if (!req.headers.accept?.includes("text/html")) return next();

    try {
      const page = await getPage(pathname);
      let html = injectSeo(await getTemplate(), page);
      if (transform) html = await transform(html, req.originalUrl);
      res.status(page.status).type("html").send(html);
    } catch (error) {
      next(error);
    }
  };
}
