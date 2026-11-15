# Africar Rentals — Design System

> Inspired by the design language of apple.com (calm full-width bands, a two-up
> tile grid, one swipeable row of big cards). Original identity: Africar's own
> name, logo, colours, wording and artwork. Not affiliated with or endorsed by
> the reference.

## 1. Visual theme
Quiet and confident. Lots of space, one short headline per band, a big visual
under it, and pill buttons. The page barely moves: no scroll animations, only
colour changes on hover. Navy and orange come from the Africar logo.

## 2. Color
| Token | Value | Role |
|---|---|---|
| `--bg` | `#ffffff` | page background, gaps between bands |
| `--surface` | `#f6f5f3` | light bands, light tiles, footer |
| `--ink` | `#161b33` | primary text |
| `--muted` | `#5f6477` | secondary text |
| `--navy` | `#1b2455` | dark bands and 2-tonne tiles |
| `--navy-deep` | `#121a40` | text on orange, dark cards |
| `--orange` | `#f37021` | buttons, selected dates, accents on navy |
| `--line` | `#e3e1dc` | hairlines |
| `--free` / `--booked` / `--clash` | `#e6f4e7` / `#d9d9d9` / `#c62828` | calendar states |

Contrast (WCAG): ink on white 17.0:1 · muted on surface 5.4:1 · white on navy
14.7:1 · navy-deep on orange 5.7:1 · orange on navy 5.0:1. Never put white text
on orange (2.9:1) or orange text on a light background (2.7:1).

## 3. Typography
Hanken Grotesk (SIL Open Font License, via Google Fonts), weights 400/500/600/800,
with `system-ui` as fallback.

| Use | Size | Weight | Tracking |
|---|---|---|---|
| Band headline (h1, h2) | 56px (48 ≤1068px, 36 ≤734px) | 600 | −0.02em |
| Tile headline (h3) | 40px (30 ≤734px) | 600 | −0.015em |
| Band subhead | 28px (24, 21) | 400 | 0 |
| Tile copy | 21px (19) | 400 | 0 |
| Body | 17px / 1.47 | 400 | 0 |
| Nav | 13px | 400 | 0 |
| Footer | 12px | 400 | 0 |

## 4. Spacing & layout
- 12px gap between bands and between tiles (`--gap`).
- Bands are full width, at least 692px tall, 56px top padding, content centred.
- Tiles: two columns, 580px tall, 44px/40px padding. One column, 470px, on phones.
- Card row: cards up to 980px wide, 560px tall, scroll-snap centred.
- Nav and footer content sit in a 1024px / 980px column.
- Breakpoints: 1068px and 734px.

## 5. Shape & depth
- Buttons are pills (980px radius). Tiles, cards and the dialog use 28px corners.
- Flat: no shadows, except one soft shadow under the calendar mock.
- Nav is translucent white (80%) with a 20px backdrop blur and a hairline.

## 6. Components
- **Button** `.btn`: orange pill, navy-deep text. `.btn.ghost`: outline in the
  current text colour. Hover changes colour only; nothing lifts or moves.
- **Band** `.band`: headline, subhead, buttons, then a visual pinned to the
  bottom. `.band.dark` is navy. `.band.split` puts start-aligned text beside photos.
- **Tile** `.tile`: tag, name, one line, button at top left; a full-tile SVG with
  a giant `1T`/`2T` behind the van illustration. `.tile.dark` for 2-tonne vans,
  `.tile.how` (orange) for the steps.
- **Card** `.card`: navy, giant faint word, van illustration, caption bottom left.
- **Section heading** `.head`: centred h2 plus one line, above the van tiles.
- **Questions** `#faq`: native `<details>` rows with hairlines; answers in muted text.
- **Dialog** `#cal`: calendar → details form → thank-you. Behaviour lives in `app.js`.
- **Van illustrations**: two SVG symbols, `#van-1t` and `#van-2t`, defined once at
  the top of `index.html` and reused with `<use>`.

## 7. Motion
- No scroll-triggered animation.
- Hover/focus transitions: 240ms `cubic-bezier(.4, 0, .6, 1)`, colour only.
- Smooth scrolling for in-page links and the card row paddles.

## 8. Do / Don't
- Do keep one idea per band: a short headline, one line under it, one or two buttons.
- Do use navy for dark surfaces. Don't use pure black.
- Do keep button text navy-deep on orange. Don't use white on orange.
- Do replace the illustrations and the soft Facebook photo crops with real,
  sharp van photos when they're available; keep them large.
- Don't add scroll animations, drop shadows or card hover lifts.
- Don't add a second accent colour. Orange is the only one.
- Don't shrink the headlines or the band heights to fit more in.
