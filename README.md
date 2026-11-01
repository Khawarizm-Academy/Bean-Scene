# Bean Scene

Bean Scene is a responsive coffee-shop storefront built as a polished React + Express portfolio project. Its landing page faithfully adapts the supplied Figma desktop and mobile frames using their local image exports, original copy, `Playfair Display` typography, `Clicker Script` wordmark treatment, roasted-brown palette, coffee flourishes, and gold pill actions.

## What is included

The public storefront has responsive home, shop, product detail, about, contact, cart, demo checkout, and order-confirmation routes. It includes a persisted browser cart, product quantities, removal and totals, mobile navigation, accessible contact/newsletter forms, demo checkout validation, reduced-motion support, real local imagery, crawler documents, meaningful metadata, product structured data, and a small Express API.

Supabase is optional for the portfolio preview. When its server-only credentials are configured, the Express layer reads products and records newsletter signups, contact messages, and demo orders. When unavailable, every public feature remains useful with clearly labelled local demo behavior. The checkout never collects or processes payment data.

## Quick start

```bash
cp .env.example .env
pnpm dev
```

Open the managed Preview after the server reports that it is listening on port `3000`.

| Command | Result |
| --- | --- |
| `pnpm dev` | Express server plus Vite development client |
| `pnpm check` | TypeScript type check |
| `pnpm build` | Production build of the client and Express server |
| `pnpm start` | Run the compiled production server |

## Documentation

Read [the design-system analysis](./DESIGN_SYSTEM.md) for the Figma token/relationship analysis, [the architecture guide](./ARCHITECTURE.md) for implementation and route structure, [the Supabase guide](./SUPABASE.md) for external database configuration, [the validation record](./VALIDATION.md) for browser/build evidence and retained Figma reference frames, and [the delivery tracker](./TODO.md) for the confirmed project outcomes.

The portable SQL is at [`supabase/schema.sql`](./supabase/schema.sql). Apply it in a Supabase SQL editor after adding `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as server-side environment values. Set `VITE_PUBLIC_SITE_URL` to the production domain before publishing to activate canonical and absolute social metadata.

## SEO and accessibility

The website exposes its declared routes in `client/public/manus-routes.json`, emits route-specific HTML, titles, descriptions, structured data and real 404s from Express, and generates `robots.txt` and an absolute `sitemap.xml`. The sitemap and production canonicals become available after `VITE_PUBLIC_SITE_URL` is set to the real HTTPS site origin. The site uses semantic headings/labels/alt text, keyboard-operable menus and cart controls, and honors `prefers-reduced-motion`. Do not replace the local Figma image references with external placeholders: the frame exports are deliberately retained under `client/public/assets/figma/`.


## Project plan

The design and implementation blueprint is recorded in [plan.md](./plan.md). The two Figma files are desktop/mobile frames of the same homepage; see the system analysis before extending its styles or adding pages.
