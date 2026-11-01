# Bean Scene implementation plan

## Approved scope and frame analysis

Bean Scene is the name of the requested portfolio storefront. The two supplied Figma exports are **two responsive frames of the same landing page**, not independent products: DesktopViewLandingPage is a 1366 × 5085 desktop frame and MobileViewLandingPage is a 390 × 7828 mobile frame. Their section order, headline, copy, coffee products, motif imagery and CTA language align. The implementation keeps one responsive homepage and extends it with a compact shop, product-detail, about, contact, cart, demo checkout and order-confirmation flow.

The Figma page remains the design source of truth. Its original text and spelling, palette, photographs, coffee-bean flourishes, typography and visual hierarchy are retained. The supplied `setup-figma.py` scripts were run for both frames; their converted sources are retained under `client/src/figma-export/` with every image path rewritten to the actual local `client/public/assets/figma/` directory. Semantic page components use responsive Flexbox/Grid and breakpoints rather than exposing the generated absolute-position frames as an inflexible page.

## Design system

- **Design Movement:** warm editorial coffee-shop design—serif-led typography, full-bleed café imagery, cream-paper product panels and unhurried whitespace.
- **Core Principles:** preserve the Figma narrative; let actual Bean Scene photography carry the brand; keep actions easy to recognize; retain comfortable spacing and readable contrast across widths.
- **Color Philosophy:** roasted-bean brown (`#603809`) grounds headings and coffee identity, deep espresso (`#442808`) supplies depth, parchment (`#FFF9F1` / `#FFFDFC`) makes the page feel calm, and toasted gold (`#F9C06A`) marks the principal actions.
- **Layout Paradigm:** an asymmetric, wide editorial desktop rail transitions into a direct single-column mobile story; images bleed into immersive section backgrounds rather than being reduced to generic card thumbnails.
- **Signature Elements:** Clicker Script coffee wordmark/hero noun; coffee-bean and steam flourishes; gold pill actions and warm outlined paper cards.
- **Interaction Philosophy:** keep the visual quiet but make navigation, calls to action, cart updates and feedback controls direct and clearly labelled. Provide visible keyboard focus and brief feedback.
- **Animation:** use short color/shadow/transform transitions, subtle card lift and a sliding cart drawer. Avoid autoplay or motion that delays reading, and respect `prefers-reduced-motion`.
- **Typography System:** load Google Fonts `Clicker Script` for the wordmark and hero word “Coffee”, and `Playfair Display` for display and body text. Use a 54px / 32px section-heading scale, 20px / 16px body scale and 220px / 112px hero noun on desktop/mobile respectively.
- **Brand Essence:** an inviting coffee-shop experience for people who want quality coffee and a calmer morning; **warm, crafted, unhurried**.
- **Brand Voice:** approachable sensory lines; keep the source copy intact. Examples: “We’ve got your morning covered with Coffee.” and “There is always a new cup worth experiencing.”
- **Wordmark & Logo:** a text-first Bean Scene wordmark set in the supplied Clicker Script character, matching the Figma frame; do not substitute an unrelated icon or a default sans-serif logo.
- **Signature Brand Color:** toasted-bean gold `#F9C06A`, used for calls to action and focused visual accents.

See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for the extracted token inventory and component rules.

## Implementation approach

- **Frontend:** React + TypeScript on the supplied Vite/Express starter; Wouter routes provide home, shop, product detail, about, contact, cart, checkout and confirmation. Shared brand primitives and site chrome avoid duplicating the existing Figma visual language.
- **Product data:** `client/src/data/products.ts` contains the source-aligned demo catalogue. `useProducts()` requests `/api/products` and starts with that local catalogue to avoid an empty first paint. The API normalizes Supabase rows and keeps their image paths local.
- **Backend:** the selected option from the user’s Django/Express alternatives is Express. It owns health, product, newsletter, contact and demo-order routes, validates user fields and recomputes order totals from catalogue prices. No payment information is requested or stored.
- **Database:** Supabase is the explicitly requested external Postgres service; the WebDev-managed database is not enabled. `server/supabase.ts` calls Supabase’s REST API with server-only environment credentials. `supabase/schema.sql` defines products, newsletter subscribers, contact messages and demo orders. Without credentials the UI remains functional and reports that actions are in demo mode.
- **SEO:** route-specific Express document responses supply title, description, index policy and a crawlable HTML fallback. Unknown pages receive HTTP 404. `robots.txt` is dynamic; sitemap and canonical/Open Graph absolute URLs are enabled only when the actual HTTPS `VITE_PUBLIC_SITE_URL` is configured. Product structured data also waits for that real origin. Route declarations remain available through `client/public/manus-routes.json`.
- **Accessibility/performance:** semantic links/buttons, labelled required forms, descriptive or decorative alt text, keyboard focus, reduced-motion support, local Figma media and shared assets are used. No card payments, login backend or production user accounts are implied.

## Project structure

```text
client/
  index.html                     # Fonts, theme, progressive SEO fallback
  public/assets/figma/           # Local desktop/mobile image exports
  public/manus-routes.json       # Declared non-404 page route set
  src/App.tsx                    # Routes and providers
  src/components/                # Shared brand primitives, navigation, footer, cart
  src/contexts/CartContext.tsx    # Browser-persisted cart
  src/data/                      # Demo catalogue and API-backed product hook
  src/figma-export/              # Retained generated desktop/mobile source
  src/lib/                       # API and client route metadata helpers
  src/pages/                     # Landing and commerce pages
server/
  _core/index.ts                 # Express server, HTTP API and validation
  _core/vite.ts                  # Development and production static/document serving
  seo.ts                         # Route-specific HTML, metadata, robots, sitemap and 404
  store.ts                       # Supabase/demo-first product and submission services
  supabase.ts                    # External Supabase REST boundary
shared/products.ts               # Shared source-aligned catalogue data
supabase/schema.sql              # Portable external Postgres schema and product seeds
DESIGN_SYSTEM.md                 # Visual system extracted from both frames
ARCHITECTURE.md                  # Runtime, pages, data flow and SEO details
SUPABASE.md                      # Environment, schema and security guidance
TODO.md                          # Outcome acceptance and delivery status
```

## Dependencies and constraints

The existing starter already includes the required React, TypeScript, Express, Wouter and Vite toolchain. No payment processor, user-account provider, API keys or external product imagery were supplied, so they are not added. Configure a real Supabase project and HTTPS production origin to activate persistent data and final canonical/sitemap output. Keep its service-role key in the runtime environment only. Development runs with `pnpm dev`; validate with `pnpm check`, `pnpm test` and `pnpm build`.
