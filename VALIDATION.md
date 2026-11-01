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

A browser click-through added Cappuccino from the landing page, confirmed that the cart drawer opened, and followed its “Demo checkout” button to the no-payment checkout. Later status-flow validation used a `.test` address in credential-less demo mode; no email was sent and no Supabase row or payment was created.

## Automated checks

Run from the project root:

```bash
pnpm check
pnpm test
pnpm build
```

The final pass completed all three. The Vitest suite includes the starter platform tests plus `server/store.test.ts`, which covers the credential-less Figma-matched catalogue, product lookup, configured empty-menu and read-outage fallbacks, and configured write failures. A source audit found no active external image sources and no missing referenced local Figma assets.

Direct Express checks confirmed that all declared routes return route-specific title/description/fallback markup, unknown URLs return HTTP 404/noindex, `/api/products` returns the four-item demo catalogue when Supabase is unavailable, and invalid demo-order submissions return HTTP 422. Demo API success responses report `persistence: "preview-only"` and `emailDelivery: "not-configured"`; configured persistence failures are typed as retryable HTTP 503 errors. A production smoke test with the reserved hostname `https://beanscene-validation.example` verified that a configured HTTPS origin produces canonical metadata, absolute Open Graph/Twitter image paths, a sitemap and a robots sitemap declaration. This reserved test hostname is never used as a deployed canonical.

## Remaining deployment validation

Before public launch, configure the real `VITE_PUBLIC_SITE_URL` and verify that origin’s final metadata, sitemap, share preview and crawler access. Apply `supabase/schema.sql` in the owner’s Supabase project, configure its two server credentials, and perform a controlled end-to-end persistence test. These values were not provided during this build, so the validated Preview deliberately remains in safe demo mode.


## Action progress and result statuses

Newsletter signup, contact messages, product/cart additions and checkout now communicate their current outcome instead of silently doing work. Submitting forms shows a disabled progress button and a concise loading panel; successful demo actions say they were received only as previews, and a configured database write is reported as saved. Failures preserve retryable form/cart details, announce an error accessibly and expose the API validation message. Product/cart actions show a short “Added” confirmation.

The browser verified contact’s in-progress state, a demo-mode success response, and a simulated transient HTTP 422 with retry guidance. A demo checkout confirmed its order-reference page and displayed separate payment and email statuses (“Not collected” and “Not configured — no email sent”). Newsletter/contact/order demo API responses expose explicit `persistence` and `emailDelivery` fields; invalid contact/order requests return HTTP 422. No outbound email service is configured in this project, and no email is claimed as sent.

## Provider-outage and status-recovery checks

The expanded suite passes 11 tests. Store tests simulate unreachable Supabase reads and writes with mocked fetch only: absent credentials return the expected demo catalogue; configured empty inventory and configured read outage report different `source` values; configured newsletter, contact and order writes throw a typed persistence error instead of returning demo success.

An isolated compiled-server smoke test used only `http://127.0.0.1:9` as a deliberately unreachable test endpoint and a throwaway local port. Menu reads returned the four-item fallback with `source: "unavailable-fallback"`; newsletter, contact and order writes each returned HTTP 503 with `code: "store_unavailable"`. No real Supabase project or records were contacted. The credential-less Preview still reports `persistence: "preview-only"` and `emailDelivery: "not-configured"` on a demo newsletter response.

Browser checks simulated a blocked cart `localStorage.setItem`. Add-to-cart remained usable, showed a session-only warning and a retry control, and the polite announcement included the item count and subtotal. Retrying successfully saved the cart; removing the test item left the cart at `[]` and announced a $0.00 subtotal. A one-time mocked product-menu fetch failure kept four sample cards visible, displayed an error/retry notice, and recovered to the demo catalogue on retry. Opening `/order-confirmed` directly in a fresh app session displayed “No recent order” and neutral “Order Status” metadata instead of a success receipt.
