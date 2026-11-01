# Supabase Setup

## Purpose

Supabase Postgres is the optional durable store for Bean Scene product rows, contact messages, newsletter subscribers and portfolio-only demo orders. The storefront remains useful without a Supabase project: it loads a local coffee catalogue and clearly says when form submissions are running in demo mode.

## Environment variables

Copy `.env.example` to `.env` for local development or add the equivalent environment values to the server runtime:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_PUBLIC_SITE_URL=https://your-real-production-domain.example
```

`SUPABASE_SERVICE_ROLE_KEY` is for Express only. Do **not** prefix it with `VITE_`, do not add it to client code and do not commit it. `VITE_PUBLIC_SITE_URL` is a separate public origin setting; use the real HTTPS site domain, never the ephemeral Preview URL. It enables production canonical URLs, share images, and a valid absolute sitemap.

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

## Fallback behavior

| Capability | With Supabase | Without Supabase / on read failure |
| --- | --- | --- |
| Catalogue | Express loads product rows | The source-aligned four-product demo set is returned (`demo: true`) |
| Newsletter | Stores validated email | Returns an explicit demo-mode receipt; no remote row is claimed |
| Contact | Stores validated name/email/subject/message | Returns an explicit demo receipt; no remote row is claimed |
| Checkout | Stores a demo-order record only | Confirms a demo order in browser state; no payment is requested or taken |

No flow processes real payments, handles payment instruments, or claims email was sent. This is a functional portfolio demonstration, not an enabled live commercial store. Supabase credentials were not supplied during the build, so Preview uses the documented local demo mode.
