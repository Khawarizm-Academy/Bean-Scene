# Bean Scene Design System

## Source and frame relationship

The supplied desktop frame (`1366 × 5085`) and mobile frame (`390 × 7828`) describe **one landing page at two breakpoints**. They share the same narrative sequence, original text, products, imagery, colors, and CTA language. Desktop distributes content through a wide 1180px content rail and horizontal product/benefit rows. Mobile preserves the order while changing the header to a menu trigger, stacking products vertically, changing benefits to a two-column grid, and converting the newsletter to a labelled vertical form.

The implementation treats the Figma frames as the source of truth for the homepage. Additional storefront pages extend the same system rather than introducing a different visual language.

## Design read

- **Artifact:** editorial coffee storefront and portfolio-grade e-commerce experience.
- **Audience:** people looking for a warm coffee-shop brand and a straightforward, tactile ordering experience.
- **Visual language:** warm coffee editorial; dark roasted photography contrasted with cream paper surfaces and gold actions.
- **Mode:** preserve/extend.
- **Visual variance:** 2/10 — preserve the supplied Figma composition.
- **Motion intensity:** 3/10 — restrained fade/slide entrances, generous hover lift, never theatrical.
- **Information density:** 4/10 — text-led, breathable sections.
- **Asset dependence:** 10/10 — supplied photography and coffee-flourish assets provide the brand character.
- **Brand fidelity:** 10/10 — no substitute palette or generic imagery.

## Tokens

### Colors

| Token | Value | Role |
| --- | --- | --- |
| `--bean` | `#603809` | Section headings, dark text, footer treatment |
| `--espresso` | `#442808` | Footer and deep coffee backgrounds |
| `--gold` | `#F9C06A` | Primary actions, carousel controls, warm highlights |
| `--paper` | `#FFF9F1` | Product cards and pale elevated surfaces |
| `--cream` | `#FFEED8` | Selected benefit surface |
| `--canvas` | `#FFFDFC` | Primary page canvas |
| `--copy` | `#707070` | Supporting copy |
| `--ink` | `#1E1E1E` | High-contrast body copy |
| `--white` | `#FFFFFF` | Reverse text and controls |

### Typography

- **Display / body:** `Playfair Display`, serif. It supports the editorial product-story tone and is used for navigation, headings, body text, labels, and price.
- **Wordmark / hero noun:** `Clicker Script`, cursive. It is reserved for the Bean Scene wordmark and the hero word “Coffee.”
- Desktop heading scale is 54px; desktop body is 20px. Mobile section heading scale is 32px and body is 16px.
- The hero display is 220px on desktop and 112px on mobile.

### Spacing and widths

- The main desktop rail is `1180px`, approximately `93px` from either side on the supplied 1366px canvas.
- Desktop vertical rhythm is intentionally spacious: content sections use 88–140px top/bottom breathing room.
- Mobile uses a 20px side inset, 56px section padding, 24px primary gaps, and 32px feature/product section gaps.
- The responsive transition occurs at 768px: navigation collapses and multi-column page regions stack.

### Shape, border and elevation

- Primary actions are pill-shaped (`999px`) and use the original `0 6px 12px rgba(249, 192, 106, .22)` shadow.
- Cards are deliberately square or subtly rounded rather than app-like: product / testimonial surfaces have a one-pixel `rgba(249,192,106,.4)` outline.
- Testimonial arrow buttons use the supplied 16px radius.
- Images are full-bleed within their regions; photography is not placed in generic rounded image cards.

## Components

| Component | Figma behavior | Extension rules |
| --- | --- | --- |
| Header | Transparent on desktop hero; cream compact header on mobile | Sticky on interior pages; preserve wordmark and serif links |
| Gold CTA | 134×48 desktop core / 142×56 mobile hit area | Use a semantic `<button>` or link; hover lifts 2px and deepens shadow |
| Product card | Pale outlined surface, 222px photo, centered title/blend/price, overlapping order button | Maintain image-led layout and gold action |
| Benefit card | Icon, brown title, grey supporting copy; first card cream | Keep two-by-two mobile and four-across desktop behavior |
| Immersive callout | Dark brown photo + warm overlay + white text | Keep the photographic depth and avoid adding extra UI chrome |
| Testimonial | Pale paper panel, oversized quote, gold arrows, portrait | Make arrows operable with accessible labels |
| Newsletter | Photo/espresso field with white reverse type | Desktop horizontal input, mobile semantic labelled stack |
| Footer | Coffee-textured dark field with white columns | Stack content groups on mobile, retain real social assets |

## Imagery

All imagery comes from the Figma export and is copied locally under `client/public/assets/figma/`. The application must not hotlink or use `placehold.com`. The hero uses the desktop or mobile export according to breakpoint; decorative flourishes stay out of the reading flow and are hidden from assistive technologies.

## Motion and interaction

- Respect `prefers-reduced-motion`; do not hide content when motion is disabled.
- Cards shift upward by 4px on hover with a 220ms ease-out transition.
- Primary actions use a 150–220ms color/shadow/transform transition and a visible focus ring.
- Sections may enter with a short opacity/translate animation once, avoiding autoplayed effects.
- Drawers, cart controls, mobile navigation, and testimonial pagination are keyboard-operable, labelled, and closable.
