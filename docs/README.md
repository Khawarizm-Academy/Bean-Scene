# Bean Scene — Project Documentation

Welcome. This folder holds everything you need to understand, run and extend Bean Scene. Read the docs in the order below — each one builds on the previous.

## Reading order

| # | Document | What you'll find in it |
| --- | --- | --- |
| 1 | [Design guide](./02-design-guide.md) | How the Figma frames relate, the color/type/spacing tokens, component rules, imagery and motion guidelines. |
| 2 | [Architecture](./03-architecture.md) | The stack, folder layout, every route, the REST API, the data path, SEO and build commands. |
| 3 | [Database — Supabase](./04-supabase-database.md) | Optional database setup: environment variables, schema, security policies and demo-mode fallback behavior. |
| 4 | [Testing log](./05-testing-log.md) | What was tested (visual, browser, automated), what passed, and what still needs production validation. |
| 5 | [Roadmap](./06-roadmap.md) | Delivered work and the remaining production steps. |
| 6 | [Original plan](./07-original-plan.md) | The design and implementation blueprint the project was built against. |

## The 30-second version

Bean Scene is a **React 19 + TypeScript storefront on Vite, served by an Express server**. An optional **Supabase Postgres** database holds products, newsletter signups, contact messages and demo orders — but its credentials are server-only, and when they're absent the app runs in a clearly-labelled local demo mode with a four-product sample catalogue.

The UI was recreated from two Figma frames (desktop 1366px and mobile 390px) that represent **one landing page at two breakpoints**; the design guide is the source of truth for any visual change.

Checkout is deliberately **demo-only**: no card details, no payment processing, no stored payment data, and no email is ever claimed as "sent" unless a provider is configured.

## Common tasks

| I want to… | Go to |
| --- | --- |
| Run the project locally | [`../README.md`](../README.md) → *Run it* |
| Understand how a page/API works | [Architecture](./03-architecture.md) |
| Change colors, fonts or a component | [Design guide](./02-design-guide.md) |
| Connect a real Supabase project | [Database — Supabase](./04-supabase-database.md) |
| See what's tested and what's pending | [Testing log](./05-testing-log.md) + [Roadmap](./06-roadmap.md) |
