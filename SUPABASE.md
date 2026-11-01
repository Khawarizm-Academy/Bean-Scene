# Supabase Setup

## Purpose

Supabase Postgres is the optional durable store for Bean Scene product rows, contact messages, newsletter subscribers and portfolio-only demo orders. Without credentials, the storefront remains useful in an intentionally labelled local demo mode. With configured credentials, confirmed writes are reported as saved only when Supabase returns the inserted row; failed writes return a retryable service error instead of a false success.

## Environment variables

Copy `.env.example` to `.env` for local development or add the equivalent environment values to the server runtime:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_PUBLIC_SITE_URL=https://your-real-production-domain.example
```

`SUPABASE_SERVICE_ROLE_KEY` is for Express only. Do **not** prefix it with `VITE_`, add it to client code, or commit it. `VITE_PUBLIC_SITE_URL` is a separate public origin setting; use the real HTTPS site domain, never the ephemeral Preview URL. It enables production canonical URLs, share images and an absolute sitemap.

## Apply the schema

1. Create/select the Supabase project.
2. Open **SQL Editor**.
3. Run [`supabase/schema.sql`](./supabase/schema.sql).
4. Confirm the four Figma-matched coffee rows exist in `products`.
5. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in the server runtime.
6. Restart the app. `/api/products` reads rows through Express when configured.

The HTTP API calls Supabase PostgREST with the server-only service key. Frontend components call same-origin `/api/products`, `/api/newsletter`, `/api/contact` and `/api/orders`; they never call Supabase with the private key.

## Tables and policies

| Table | Purpose | Access behavior |
| --- | --- | --- |
| `products` | Shop listing and product pages | Public read policy; seeded Figma-matched catalogue |
| `newsletter_subscribers` | Newsletter opt-ins | Express-only inserts; unique email |
| `contact_messages` | Customer contact form | Express validates and writes |
| `demo_orders` | No-payment checkout records | Express validates and recomputes totals; no payment/card columns |

RLS is enabled on all four tables. Service-role access is restricted to the server. Product IDs, slugs, quantities and prices are revalidated/recomputed at the API boundary; client-supplied totals are not accepted as authoritative. Before a live shop is added, review rate limiting, retention, privacy notices and policies appropriate to the operator’s actual region.

## Status and fallback behavior

| Capability | Result |
| --- | --- |
| No Supabase credentials | Return the source-aligned four-product demo catalogue. Newsletter/contact/order actions are marked `demo: true`, `persistence: "preview-only"`; no remote write or email delivery is claimed. |
| Configured catalogue with rows | Return the Supabase product rows with `source: "supabase"`. |
| Configured but empty catalogue | Show the sample menu with `source: "empty-fallback"` and an informative “catalogue is empty” message plus retry. |
| Configured catalogue read failure | Keep the sample menu usable but mark `source: "unavailable-fallback"`, display a retryable error, and let the user refresh the menu. |
| Configured newsletter/contact/order write | A successful Supabase insert must return a saved row before the UI says `persistence: "saved"`. |
| Configured write failure | Return HTTP 503 with `code: "store_unavailable"`; keep form/cart details and display retry guidance instead of demo success. |
| Email delivery | No outbound email provider is configured. Newsletter/contact/order status explicitly says no email was sent or that confirmation delivery is not configured. |
| Checkout | Never collects payment; only a portfolio demo-order record may be saved. Confirmation requires a recent successful response in the active browser session. |

No flow processes real payments or handles payment instruments. This is a functional portfolio demonstration, not an enabled live commercial store. Supabase credentials were not supplied during the build, so Preview uses the documented local demo mode.
