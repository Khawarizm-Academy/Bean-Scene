# Bean Scene validation record

## Figma visual reference set

The original supplied frames are committed as repository references so future maintainers can repeat the visual comparison without relying on an ephemeral upload workspace:

| Reference | Size | Project file |
| --- | ---: | --- |
| Desktop landing page | 1366 × 5085 | [`figma-reference/desktop-landing-frame.webp`](./figma-reference/desktop-landing-frame.webp) |
| Mobile landing page | 390 × 7828 | [`figma-reference/mobile-landing-frame.webp`](./figma-reference/mobile-landing-frame.webp) |

The Figma conversion artifacts also remain in `client/src/figma-export/`. Each of their 54 image references was rewritten to `/assets/figma/...`, and all 54 resolve beneath `client/public/assets/figma/`.

## Visual and interaction review

The live Bean Scene Preview was inspected at the supplied 1366px desktop and 390px mobile design widths. Review covered the hero/header, story, product cards, benefit cards, immersive coffee callout, testimonial, subscription panel, footer, mobile menu treatment and mobile stacking. Core addition pages were captured at desktop width for `/shop`, `/product/cappuccino`, `/contact` and `/cart`.

A browser click-through added Cappuccino from the landing page, confirmed that the cart drawer opened with a persisted item/subtotal, and followed its “Demo checkout” button to the no-payment checkout. The final “Confirm demo order” action was intentionally not submitted during manual validation, so Preview received no sample order record.

## Automated checks

Run from the project root:

```bash
pnpm check
pnpm test
pnpm build
```

The final pass completed all three. The Vitest suite includes the starter platform tests plus `server/store.test.ts`, which covers the credential-less Figma-matched catalogue fallback and product lookup. A source audit found no active external image sources and no missing referenced local Figma assets.

Direct Express checks confirmed that all declared routes return route-specific title/description/fallback markup, unknown URLs return HTTP 404/noindex, `/api/products` returns the four-item demo catalogue when Supabase is unavailable, and invalid demo-order submissions return HTTP 422. A production smoke test with the reserved hostname `https://beanscene-validation.example` verified that a configured HTTPS origin produces canonical metadata, absolute Open Graph/Twitter image paths, a sitemap and a robots sitemap declaration. This reserved test hostname is never used as a deployed canonical.

## Remaining deployment validation

Before public launch, configure the real `VITE_PUBLIC_SITE_URL` and verify that origin’s final metadata, sitemap, share preview and crawler access. Apply `supabase/schema.sql` in the owner’s Supabase project, configure its two server credentials, and perform a controlled end-to-end persistence test. These values were not provided during this build, so the validated Preview deliberately remains in safe demo mode.
