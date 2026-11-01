# Bean Scene Architecture

## Stack and runtime

Bean Scene is a React 19 + TypeScript storefront on Vite and the supplied Express starter. Wouter owns the client routes. The project selects Express from the user’s “Django - Express” backend alternatives. Its development and production server listens on the platform `PORT` (3000 by default); the public website Preview is separate from any future publish.

The external database is Supabase Postgres. The project does not enable or rely on the WebDev-managed database. `server/supabase.ts` makes service-role-authenticated REST calls from Express; the service key is never returned to the client. Browser cart state is saved in `localStorage` when available; storage failures fall back to an explicitly labelled session-only cart with a recovery action. A useful four-product demo catalogue keeps the storefront functional without a Supabase project.

## Structure

```text
client/
  index.html                      # Font imports, brand theme and fallback document
  public/assets/figma/            # All 54 locally transferred frame assets
  public/manus-routes.json        # Declared app routes; excludes 404-only routes
  src/App.tsx                     # Global providers and the page route switch
  src/components/                 # Brand primitives, shared status UI, site chrome and cart drawer
  src/contexts/CartContext.tsx    # Cart, persistence state, live announcements and recent order receipt
  src/data/                       # Demo catalogue + API-backed inventory hook/retry
  src/figma-export/               # Retained generated desktop and mobile frame sources
  src/lib/                        # API wrappers and route-level client metadata
  src/pages/                      # Responsive homepage and commerce pages
server/
  _core/index.ts                  # Express API, input validation and retryable store error responses
  _core/vite.ts                   # Vite dev and static production serving
  seo.ts                          # Route HTML/meta, crawler output and 404 handling
  store.ts                        # Supabase/demo-first catalogue and persistence services
  supabase.ts                     # Server-only external Postgres REST boundary
shared/products.ts                # Shared source-aligned catalogue data
docs/                             # Project documentation, indexed in docs/README.md
supabase/schema.sql               # Portable external Postgres/Supabase tables and product seeds
figma-reference/                  # Original desktop/mobile frame screenshots for comparison
```

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Figma-faithful responsive landing page |
| `/shop` | Searchable menu and featured filter, with catalogue fallback/retry status |
| `/product/:slug` | Product details, quantity selection, add-to-cart and accurate cart state |
| `/about` | Coffee-shop story and values |
| `/contact` | Required-field message form with in-progress, success, demo and error feedback |
| `/cart` | Cart persistence status, quantity updates, removal, totals and empty state |
| `/checkout` | Clearly labelled, no-payment demo checkout; errors preserve cart details |
| `/order-confirmed` | Confirms only a recent successful order held in live app state; direct visits get an informational not-confirmed state |

## Express API and data path

- `GET /api/health` exposes an unauthenticated readiness response.
- `GET /api/products` and `GET /api/products/:slug` return the local demo set when credentials are absent. A configured empty catalogue and configured provider outage have separate response states; the outage keeps fallback products visible and enables a client retry.
- `POST /api/newsletter` and `POST /api/contact` validate user input. Missing credentials deliberately return preview-only demo outcomes; configured writes report `saved` only after Supabase returns a saved row. Configured write failures return HTTP 503 with a retryable error.
- `POST /api/orders` requires customer details and valid catalogue slugs/quantities. Express recalculates subtotal from current server catalogue prices; it does not trust client-supplied totals. Only a clearly labelled demo-order record may be saved—there are no card or payment fields. The successful order receipt is passed through live app state, so browser storage failure cannot downgrade a saved order into a retryable checkout failure.
- tRPC remains available from the base starter for its separate platform service router; the storefront data flow described above uses its explicit REST endpoints.

`supabase/schema.sql` defines products, newsletter subscribers, contact messages and `demo_orders`, enables RLS, and provides public read access only for product catalogue rows. Submitted information remains server-managed with the service role.

## Progress, status, SEO and accessibility

Shared action statuses differentiate loading, success, informative demo/persistence state and retryable errors. Newsletter, contact and order messages never claim an outbound email was sent; email delivery is marked not configured. Cart changes announce the item/quantity and subtotal in a polite live region, and the saved/session-only outcome is stated accurately.

`server/seo.ts` emits a route-specific HTML fallback, `<title>`, description, indexing policy, Open Graph/Twitter tags, and applicable JSON-LD on the first document response, rather than relying solely on post-load React effects. Product HTML, product-slug 404 responses and the generated sitemap read the same Supabase-aware `store.ts` catalogue service as the API and React inventory hook. Unknown paths and unknown product slugs receive HTTP 404 and `noindex` metadata. Cart, checkout and confirmation pages are noindex. The route manifest is at `client/public/manus-routes.json`.

`robots.txt` is generated by Express. An absolute `sitemap.xml`, canonical links and absolute share images are produced only when `VITE_PUBLIC_SITE_URL` is a configured, real HTTPS origin. They are intentionally not derived from a transient preview host. In local Preview, sitemap returns 404 until the production origin is supplied; this avoids publishing false canonical URLs.

The interface uses semantic landmarks/headings, `<button>` for button actions, form labels, local image assets with purposeful alt text (decorative motifs have empty alt text), visible focus rings and a `prefers-reduced-motion` override. The two Figma frames are treated as a single responsive design reference, not copied from unrelated stock art.

## Run and build

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start Express + Vite on port 3000 |
| `pnpm check` | TypeScript diagnostics |
| `pnpm test` | Vitest suite |
| `pnpm build` | Build client assets and compiled Express server |
| `pnpm start` | Start the compiled production server |

Real payment capture, account sign-in, shipping integrations and live customer email are intentionally outside the small portfolio-showcase scope.
