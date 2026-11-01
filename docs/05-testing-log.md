# Bean Scene — Testing Log

This document records what was visually reviewed, what the browser exercised, and what the automated suites confirm. It is the evidence trail behind the [roadmap](./06-roadmap.md).

## Figma visual reference set

The original supplied frames are committed to the repository so future maintainers can repeat the visual comparison without depending on a temporary upload workspace:

| Reference | Size | Project file |
| --- | ---: | --- |
| Desktop landing page | 1366 × 5085 | [`figma-reference/desktop-landing-frame.webp`](../figma-reference/desktop-landing-frame.webp) |
| Mobile landing page | 390 × 7828 | [`figma-reference/mobile-landing-frame.webp`](../figma-reference/mobile-landing-frame.webp) |

The Figma conversion artifacts also remain in `client/src/figma-export/`. Each of their 54 image references was rewritten to `/assets/figma/...`, and all 54 resolve beneath `client/public/assets/figma/`.

## Visual and interaction review

The live preview was inspected at the supplied 1366px desktop and 390px mobile design widths. The review covered:

- Hero and header, story section, product and benefit cards, the immersive coffee callout, testimonial, subscription panel and footer
- The mobile menu treatment and mobile stacking behavior
- Desktop captures of the addition pages: `/shop`, `/product/cappuccino`, `/contact` and `/cart`

A browser click-through then added Cappuccino from the landing page, confirmed the cart drawer opened, and followed its "Demo checkout" button to the no-payment checkout. Later status-flow validation used a `.test` address in credential-less demo mode — no email was sent and no Supabase row or payment was created.

## Automated checks

Run from the project root:

```bash
pnpm check   # TypeScript diagnostics
pnpm test    # Vitest suite
pnpm build   # Client + server production build
```

The final pass completed all three. The Vitest suite includes the starter platform tests plus `server/store.test.ts`, which covers the credential-less Figma-matched catalogue, product lookup, configured empty-menu and read-outage fallbacks, and configured write failures. A source audit found no active external image sources and no missing referenced local Figma assets.

## Routes, API and metadata checks

Direct Express checks confirmed that:

- All declared routes return route-specific title/description/fallback markup.
- Unknown URLs return HTTP 404 with `noindex` metadata.
- `/api/products` returns the four-item demo catalogue when Supabase is unavailable.
- Invalid demo-order submissions return HTTP 422.
- Demo success responses explicitly report `persistence: "preview-only"` and `emailDelivery: "not-configured"`; configured persistence failures are typed as retryable HTTP 503 errors.

A production smoke test with the reserved hostname `https://beanscene-validation.example` verified that a configured HTTPS origin produces canonical metadata, absolute Open Graph/Twitter image paths, a sitemap and a robots sitemap declaration. This reserved test hostname is never used as a deployed canonical.

## Action progress and result statuses

Newsletter signup, contact messages, product/cart additions and checkout all communicate their current outcome instead of silently doing work:

- Submitting forms shows a disabled progress button and a concise loading panel.
- Successful demo actions say they were received only as previews; a configured database write is reported as saved.
- Failures preserve retryable form/cart details, announce the error accessibly, and surface the API validation message.
- Product/cart actions show a short "Added" confirmation.

The browser verified contact's in-progress state, a demo-mode success response, and a simulated transient HTTP 422 with retry guidance. A demo checkout confirmed its order-reference page and displayed separate payment ("Not collected") and email ("Not configured — no email sent") statuses. Newsletter/contact/order demo API responses expose explicit `persistence` and `emailDelivery` fields, and invalid contact/order requests return HTTP 422. No outbound email service is configured in this project, and no email is claimed as sent.

## Provider-outage and status-recovery checks

The expanded suite passes 11 tests. Store tests simulate unreachable Supabase reads and writes with mocked `fetch` only: absent credentials return the expected demo catalogue; configured empty inventory and configured read outage report different `source` values; configured newsletter, contact and order writes throw a typed persistence error instead of returning demo success.

An isolated compiled-server smoke test used `http://127.0.0.1:9` as a deliberately unreachable endpoint and a throwaway local port:

- Menu reads returned the four-item fallback with `source: "unavailable-fallback"`.
- Newsletter, contact and order writes each returned HTTP 503 with `code: "store_unavailable"`.

No real Supabase project or records were contacted. The credential-less preview still reports `persistence: "preview-only"` and `emailDelivery: "not-configured"` on a demo newsletter response.

Browser checks also simulated a blocked cart `localStorage.setItem`:

- Add-to-cart stayed usable, showed a session-only warning and a retry control, and the polite announcement included the item count and subtotal.
- Retrying saved the cart successfully; removing the test item left the cart at `[]` and announced a $0.00 subtotal.
- A one-time mocked product-menu fetch failure kept four sample cards visible, displayed an error/retry notice, and recovered to the demo catalogue on retry.
- Opening `/order-confirmed` directly in a fresh app session displayed "No recent order" and neutral "Order Status" metadata instead of a success receipt.

## Final end-to-end flow

A complete fresh preview flow added Cappuccino, advanced through the cart drawer, and submitted checkout with a non-deliverable `.test` address. The in-memory receipt rendered the order reference, the cart cleared, and the page explicitly reported that payment was not collected and no email was sent. The order remained preview-only; no external persistence was configured.

## Still to validate before launch

Configure the real `VITE_PUBLIC_SITE_URL` and verify that origin's final metadata, sitemap, share preview and crawler access. Then apply `supabase/schema.sql` in the owner's Supabase project, configure its two server credentials, and perform a controlled end-to-end persistence test. Neither value was provided during this build, so the validated preview deliberately remains in safe demo mode.

- [ ] Final metadata, sitemap and share preview checked against the production origin
- [ ] Supabase schema applied and credentials configured
- [ ] Controlled end-to-end persistence test with a live database
