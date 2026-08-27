# Hillsedge Beragala

The Hillsedge Beragala site — a mountain smokehouse and dining destination in
Sri Lanka's hill country — built as a React single-page application with Vite.

## Running it

```bash
npm install
npm run dev      # development server
npm run build    # production bundle in dist/
npm run preview  # serve the production bundle locally
npm run images   # regenerate the responsive image variants
```

`dev` and `build` run `images` first, so the responsive variants are always in
step with the source photographs. The variants themselves are derived and
gitignored — only the full-size originals in `src/assets/images` are tracked.

## What this is

The site began as six standalone HTML files, each carrying its own copy of the
stylesheet, the header, the footer, the scroll-animation scripts, the brand
logo and — as base64 data URIs — the photographs. This version keeps the design
and every word of the copy, and removes the duplication:

| Duplicated before | Now |
| --- | --- |
| 23 base64-embedded copies of 13 photographs (~1.6 MB inline) | 13 image files in `src/assets/images`, referenced from one map |
| The ~58 KB logo outline inlined on all six pages | One `<BrandMarkSprite />` at the app root, referenced by `<use>` |
| ~30 KB of identical CSS repeated per page | One stylesheet in `src/styles`, loaded once |
| Header, mobile sheet and footer markup written six times | `Header` / `Footer` components |
| Hero, section heads, split rows, closing bands re-typed per page | `PageHero`, `SectionHead`, `SplitFeature`, `Bands` |
| Three IntersectionObserver scripts repeated per page | `useReveal`, `useParallax`, `useScrolled` hooks |
| Nav, footer and contact details restated in every file | `src/data/site.js` |

Page copy that is list-shaped (the nine cuisines, the FAQ, the routes, the
pillars) lives in `src/data/content.js`, so components stay layout-only.

## Layout

```
src/
  assets/images/     the 13 photographs
  components/        Header, Footer, PageHero, SplitFeature, Bands, …
  data/              site.js, content.js, images.js, brandMarkPaths.js
  hooks/             useReveal, useParallax, useScrolled, useBodyScrollLock, …
  pages/             Home, About, Smokehouse, Cuisine, Gallery, Visit, NotFound
  styles/            tokens, base, components, sections, motion, responsive
```

## Images

`scripts/generate-images.mjs` derives a WebP ladder (480 / 960 / 1440 px, never
upscaled) from each photograph in `src/assets/images`. Where WebP does not beat
an already well-compressed JPEG at full width, the script steps the quality down
until it does, so no variant is ever heavier than the source it replaces.

`<Picture>` emits that ladder as a `<source srcset>` with the JPEG as the
fallback, and always sets intrinsic `width`/`height` so the layout does not jump
as images load. Each caller passes a `sizes` describing how wide the image
actually renders.

The effect on the gallery — the heaviest page — measured against the built
bundle:

| | Before | After |
| --- | --- | --- |
| 13 photographs, 390 px viewport | 1.93 MB | 407 KB |

## Mobile

The layout is fluid from 320 px upward, verified with no horizontal overflow at
390 / 820 / 1440 px. Specifically:

- Breakpoints at 1100 px (nav becomes the full-screen sheet), 900 px (two-column
  editorial layouts collapse), 720 px (single column, full-width buttons) and
  480 px (small phones).
- `env(safe-area-inset-*)` respected in the header, the sheet, the footer and
  the lightbox, so nothing hides behind a notch or a home indicator.
- Every standalone control is at least 44 × 44 px on touch devices; form inputs
  are 16 px so iOS Safari does not zoom on focus.
- Hover flourishes (image zoom, card tilt, caption fades) are gated behind
  `@media (hover: hover)`; on touch, photo captions are always visible instead
  of hover-gated.
- Parallax is skipped for coarse pointers and for `prefers-reduced-motion`.
- A separate landscape rule keeps the hero from filling more than a short
  screen.

## Notes

- Routing is client-side (`react-router-dom`). Deploying to a static host needs
  the usual SPA rewrite so deep links such as `/visit` fall back to
  `index.html`.
- The reservation form composes a WhatsApp message and hands it to the guest —
  nothing is transmitted until they press send inside WhatsApp. Swap
  `ReservationForm`'s submit handler for a backend call if that changes.
- The original markup carried two different telephone numbers — a placeholder
  (`+94 00 000 0000`) in every footer and the real one (`074 237 3394`) on the
  visit page. Both now come from `site.phone`, so the footer shows the real
  number.
