# Bean Scene — Roadmap

Everything below is tracked in two sections: what has been delivered (with a summary of how it was verified), and the small list of things that still need real production configuration.

## Delivered ✅

### Analyzed and documented the Figma system

The two supplied Figma designs were analyzed before any code was written. The desktop frame (1366 × 5085) and mobile frame (390 × 7828) turned out to be responsive presentations of **one** landing page, not two separate products. The styles, palette, typography, spacing, imagery, breakpoints, components and motion rules were recorded in the docs folder — mainly the [design guide](./02-design-guide.md) — together with the architecture, route set, Supabase schema, SEO and run instructions in the other documents.

### Recreated the landing page responsively

The goal was a website that looks exactly like the Figma design, with all original text and copy preserved unchanged, exact colors, shadows and typography, and all fonts imported. The `setup-figma.py` scripts ran for both frames: the converted sources are retained under `client/src/figma-export/`, every embedded image URL was rewritten to a local `client/public/assets/figma/` reference, and an image audit found no external sources or missing files. Full-page browser captures were reviewed at 1366px and 390px.

### Delivered the compact public storefront

The request was to extend the landing page into a small but professional e-commerce showcase using React with an Express backend (the "Django - Express" option) and Supabase as the database — deliberately compact, "not very full". All eight routes render: `/`, `/shop`, `/product/:slug`, `/about`, `/contact`, `/cart`, `/checkout` and `/order-confirmed`, built with React 19, TypeScript, Wouter and Vite.

### Catalogue, cart and demo checkout

Shopping works end to end but stays visibly demo-only: product quantities can be added or removed, the cart persists in browser storage, totals are shown, and checkout validates the required name/email fields before rendering an order confirmation. It never asks for card details, processes payment or stores payment data. A browser click-through completed a Cappuccino demo order with a `.test` address: the order reference was shown, the cart cleared, payment reported "Not collected" and email reported "Not configured — no email sent". No Supabase row or real payment was created.

### Supabase-ready backend with a safe demo fallback

Supabase is wired as the external database with service credentials kept server-only, and data paths exist for products, newsletter, contact and non-payment demo orders. Without credentials the storefront remains useful and honest: `/api/products` returns four products flagged `demo: true`, and newsletter/contact/order actions are labelled preview-only. The schema and Express REST adapter are in place; the empty checkout API request returned HTTP 422 without writing any data.

### Honest progress and outcome states

Every user action — newsletter sign-up, contact message, cart addition, checkout, confirmation — shows accessible in-progress, success, demo/persistence and error/retry feedback. The rules it follows:

- Missing Supabase credentials → explicitly labelled demo behavior.
- Configured read/write failures → a retryable error, never a false "success"; cart details are preserved.
- An empty configured catalogue and an unavailable configured menu are distinct from demo mode, with a sample-menu fallback and retry.
- If browser storage fails, the cart is never claimed as saved — an explicit session-only notice with a retry action is shown instead.
- The `/order-confirmed` route never claims an order without a recent successful checkout, and a storage failure *after* a successful order response is not treated as a failed order.
- Quantity/removal/subtotal changes are announced politely to screen readers.
- No email is ever reported as sent, because no email provider is configured — the "not configured" state is stated plainly.

The 11 Vitest checks cover missing credentials, empty and upstream-failed catalogue reads, and configured write failures. An isolated compiled-server outage test returned HTTP 503 for all three configured persistence routes, and browser validation confirmed sample-menu retry, storage-denial notices, subtotal announcements and direct order-status protection at 390px.

### Implementation and asset validation

The implementation was compared side-by-side against the Figma frames, tested responsively, and every image was verified to load. Coverage includes desktop/mobile landing screenshots, shop/product/contact/cart captures, a live browser checkout flow with receipt, mobile status/recovery screenshots at 390px, resolution of all retained generated Figma paths, and successful runs of `pnpm check`, `pnpm test` (11 passed) and `pnpm build`. Details are in the [testing log](./05-testing-log.md).

## Pending — production configuration ⏳

### Activate production canonical/social URLs and an absolute sitemap

Set `VITE_PUBLIC_SITE_URL` to the real production HTTPS origin, then verify the emitted canonical, Open Graph/Twitter image URLs and `sitemap.xml`. The real site domain was never provided for this build, so the preview deliberately does not guess it or publish an ephemeral origin.

### Connect and verify a live Supabase project

Apply [`supabase/schema.sql`](../supabase/schema.sql) and supply `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` through a secure runtime configuration. No project credentials were supplied during the build, so the validated preview correctly stays in demo mode.
