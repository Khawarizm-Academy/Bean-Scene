# Bean Scene ☕

A polished, responsive coffee-shop storefront built as a portfolio showcase with **React 19 + TypeScript + Express**. The landing page is a faithful recreation of the supplied Figma frames — their local imagery, original copy, `Playfair Display` / `Clicker Script` typography, roasted-brown palette and gold pill actions are all preserved.

## What's inside

- **Public storefront** — home, shop, product detail, about, contact, cart, demo checkout and order-confirmation pages.
- **Cart & demo checkout** — a persisted browser cart with quantities, totals and removal; a clearly-labelled, no-payment checkout flow.
- **Optional Supabase backend** — when server-side credentials exist, Express reads products and records newsletter, contact and demo-order submissions. Without them, everything stays usable in an honestly-labelled demo mode.
- **SEO & accessibility** — per-route metadata and structured data, real 404s, sitemap/robots support, semantic markup, keyboard-friendly controls and reduced-motion support.

No real payments, sign-ins or email delivery — every flow says exactly what happened (saved, preview-only, or not configured).

## Run it

```bash
cp .env.example .env
pnpm dev
```

Open the preview once the server reports it is listening on port `3000`.

| Command | What it does |
| --- | --- |
| `pnpm dev` | Express server + Vite dev client |
| `pnpm check` | TypeScript type check |
| `pnpm test` | Vitest suite |
| `pnpm build` | Production build (client + server) |
| `pnpm start` | Run the compiled production server |

## Documentation

Everything lives in the [`docs/`](./docs/README.md) folder — start with the [documentation index](./docs/README.md), which explains the suggested reading order:

| Doc | Contents |
| --- | --- |
| [Design guide](./docs/02-design-guide.md) | Figma token analysis, colors, type, components, motion rules |
| [Architecture](./docs/03-architecture.md) | Stack, folder structure, routes, API and data flow |
| [Database — Supabase](./docs/04-supabase-database.md) | Optional database setup, env variables, schema and fallbacks |
| [Testing log](./docs/05-testing-log.md) | Visual/interaction review, automated checks and results |
| [Roadmap](./docs/06-roadmap.md) | Delivered features and pending production configuration |
| [Original plan](./docs/07-original-plan.md) | The implementation blueprint this project followed |

## Quick notes

- The portable SQL schema is at [`supabase/schema.sql`](./supabase/schema.sql) — apply it in a Supabase SQL editor, then set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as server-only environment values.
- Set `VITE_PUBLIC_SITE_URL` to the real production domain before publishing; it activates canonical, share-image and absolute-sitemap URLs.
- Keep the Figma image exports under `client/public/assets/figma/` — they are the brand's local assets, not placeholders.
