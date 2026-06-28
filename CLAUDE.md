# CLAUDE.md

Guidance for working in this repo. For user-facing docs (editing cats, running
locally, GitHub Pages setup) see `README.md`.

## What this is

A tiny static site showing two cats' names and ages, kawaii-styled. No
illustrations — cuteness comes from color, type, and spacing. Plain
HTML/CSS/vanilla JS, no build step, no dependencies, no `package.json`.

```
index.html   — markup: two .cat-half sections (one per cat)
styles.css   — all visual styling
app.js       — CATS config + age math + all interactivity
images/<cat>/ — that cat's photos (kiki-1.jpg, knixie-1.jpg, ...)
```

## Editing cat data

Everything lives in the `CATS` array at the top of `app.js`: `name`,
`birthDate` ("YYYY-MM-DD"), `photos` (array of paths under `images/<cat>/`).
No other file needs to change to add/rename a cat or swap photos.

## Age computation (`computeAge` / `diffParts` in `app.js`)

Tiered display, recomputed fresh on every page load (never cached/stored):
- under 6 months old → whole weeks (`"14 weeks"`)
- 6–12 months old → whole months (`"8 months"`)
- 1 year+ → years + months (`"6 years, 11 months"`)

`diffParts` does calendar-correct year/month/day math (borrows a day from the
previous month / a month from the previous year as needed) rather than
dividing milliseconds, so tier transitions land on the right calendar day.
If you touch this, re-check all three tier boundaries — there's no test
suite, so verify manually (see Verifying changes below).

## Photo system

Each `.cat-half` has **two stacked `.cat-photo` layers** (see `index.html`),
not one. This is deliberate: `setupHalf()` in `app.js` always paints a new
photo onto the *hidden* layer, waits for it to fully load and `decode()`,
and only then crossfades it in over the visible layer (`.is-visible` opacity
transition in `styles.css`). The two layers' opacity always sums to 1, so
the half's gradient background is never exposed mid-swap. Don't go back to
swapping `background-image` on a single layer — that's what caused the
flash this was built to fix. All of a cat's photos are also warmed into the
browser cache on setup so later taps decode quickly.

Tapping anywhere in a half (the bare photo or the text card) cycles to that
cat's next photo, independently per half — there's a single `click` listener
on `.cat-half` that catches bubbled clicks from either region.

**Adding new photos:** raw phone photos carry EXIF/GPS metadata and are
several MB — strip and downsize before committing, since this is a public
repo/site:

```python
from PIL import Image, ImageOps
img = ImageOps.exif_transpose(Image.open("raw.jpg")).convert("RGB")
img.thumbnail((1600, 1600))
img.save("images/<cat>/<cat>-N.jpg", quality=82, optimize=True)
```
(Saving without passing `exif=` drops the metadata.)

## Draggable text card (`.cat-info`)

Default look is centered via `top/left: 50%` + `transform: translate(-50%,
-50%)`. On the *first* pointerdown, `switchToPixelPositioning()` reads the
card's current rendered position and pins it down as explicit `left`/`top`
pixels with `transform: none` — from then on dragging is plain arithmetic,
clamped to `half.clientWidth/clientHeight` so the card can't leave its own
half or cross into the other cat's side.

Tap vs. drag is disambiguated with a 6px movement threshold
(`DRAG_THRESHOLD`): crossing it marks the gesture a drag, and on
`pointerup` the next synthetic `click` on the card is swallowed
(`suppressNextClick` / `stopPropagation`) so finishing a drag doesn't also
trigger the photo-cycle handler. Position is **intentionally not
persisted** — it always resets to center on reload. Don't add
`localStorage` for this; it was explicitly decided against.

## CSS gotcha: don't remove `width: max-content` on `.cat-info`

With `left: 50%` + `transform: translate(-50%, ...)` and `width: auto`, the
browser's shrink-to-fit width calculation for the absolutely-positioned
element only sees half the container as "available," causing text to wrap
early even when it would otherwise fit. `width: max-content; max-width:
90%;` is the fix — keep both if you touch this rule.

## Styling conventions

- Cat colors are CSS custom properties in `:root` (`--tux-*` for Kiki,
  `--tabby-*` for Knixie), applied per-half via `[data-cat-index="0"]` /
  `[data-cat-index="1"]` selectors. Kiki is always index 0, Knixie index 1
  (matches `CATS` order and `data-cat-index` in the HTML).
- `@media (max-width: 700px)` stacks the halves vertically instead of
  side-by-side.
- `@media (prefers-reduced-motion: reduce)` globally kills all
  `animation`/`transition` (see bottom of `styles.css`). Any new animation
  (e.g. the load-time card wiggle) gets this for free — no per-animation
  opt-out needed.
- Google Fonts ("Baloo 2") loaded via `<link>` tags in `index.html`, no
  local font files.

## Verifying changes

There's no test suite or build step. To check a change:

```
python3 -m http.server 8000   # from repo root
```

then open `http://localhost:8000/index.html`. Chromium + Playwright are
available in this environment (`/opt/pw-browsers/chromium`,
`NODE_PATH=/opt/node22/lib/node_modules`) for scripted screenshot/interaction
checks — useful for confirming drag clamping, tap-to-cycle, and crossfade
timing without relying on a human eyeballing it. `playwright install` is
unnecessary and shouldn't be run (browsers are pre-provisioned).

## Deployment

Plain static files at the repo root — GitHub Pages serves it directly via
**Settings → Pages → Deploy from a branch**, branch + `/ (root)`. No CI,
no build artifact.
