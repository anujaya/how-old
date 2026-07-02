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
- 1 year+ → whole years, no months (`"6 years"`)

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

Tapping the bare photo (anywhere in a half outside the text card) cycles to
that cat's next photo, independently per half — there's a single `click`
listener on `.cat-half` for this. The text card has its own tap behavior
(see below) and stops the click from bubbling up to this handler, so tapping
the card never also cycles the photo.

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

Repo files keep the existing `<cat>-N.jpg` numbering — don't rename them to
the original upload filename. Instead, before processing, hash the
*original* file (`sha256sum raw.jpg`) and append a row to
`images/SOURCES.md` mapping the new repo filename to that original filename
and hash. This means checking whether a newly uploaded photo is a duplicate
of one already in the repo is a filename/hash lookup in `SOURCES.md`, not
an image comparison.

New photos are added manually, by uploading them in a Claude Code session
and having them processed with the pipeline above. This was a deliberate
choice: an automated ingestion pipeline (Google Photos API → Drive → local
ML classification for people/screens/documents → approval queue) was
scoped out and explicitly rejected as too much complexity for what this
site needs. Don't build one unless asked again.

## Scalloped seam between the photos (`updateSeamClip` in `app.js`)

The two photos are full-bleed and touch directly — there is no gap, no
background color showing through, and no separate line drawn at the seam.
The wavy border the user sees *is* each photo's own edge: `.cat-half` has
no `overflow: hidden`, and `updateSeamClip()` sets an inline `clip-path:
path(...)` on each half that traces a wave instead of a straight cut on
whichever edge sits on the seam (right edge for Kiki/half 0, left edge for
Knixie/half 1; top/bottom for the stacked mobile layout). Both halves
trace the exact same `waveSegments()` curve, each from their own local
origin, so they always interlock with zero gap and zero overlap — don't
give them independently-tuned curves, or a gap (or overlap) will reappear.

`#divider` is still a real element and still owns the drag, but it's
**invisible** now (no `background-image`, no `mask-image`) — it exists
purely as a hit target, sized generously around the seam so it's easy to
grab even though there's nothing to see there. Don't add a visible line
back to it; the squiggle is the photo boundary, not a decoration on top of
it.

`updateSeamClip()` re-reads each half's live `getBoundingClientRect()` and
re-runs on: initial `render()`, and on every `resize` event. It doesn't
need its own listener on the divider's drag — `setupDivider()`'s
`applyPercent()` already dispatches a synthetic `resize` event on every
drag move (to re-clamp `.cat-info`), and that's enough to keep the wave
glued to the live seam position while dragging too.

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
(`suppressNextClick`) so finishing a drag doesn't also toggle the age
reveal below. Position is **intentionally not persisted** — it always
resets to center on reload. Don't add `localStorage` for this; it was
explicitly decided against.

## Tap-to-reveal age (`.cat-info.expanded`)

The age is hidden by default; a plain tap (not a drag) on the text card
toggles the `expanded` class on `.cat-info`. The card's `click` handler
always calls `stopPropagation()` so this tap never also bubbles into the
half's photo-cycle handler above.

The open/close animates a literal pixel `height` on `.cat-age`, set in
`app.js` from `age.scrollHeight` at the moment of the tap — not `max-height`
and not "auto". `scrollHeight` reports the text's true height even while
it's currently clipped to 0 by `overflow: hidden`, so there's no hardcoded
height to keep in sync with font size or text length. Animating a real
`height` (rather than `max-height`, or a grid-row `fr` track, both of which
get capped at the content's own natural size in an auto-sized container) is
what lets the transition's overshoot `cubic-bezier` actually render the row
taller than its settled height for a moment — that overshoot *is* the
"bloop." Don't swap it for a plain ease-in-out, and don't switch back to
`max-height`/grid-rows — both were tried and don't bounce.

**Bounce on both directions, not just expand.** `.cat-age` and
`.cat-info.expanded .cat-age` declare *different* `transition` curves for
the same `height`/`margin` properties — `.cat-age` (the rule that applies
when `.expanded` is removed, i.e. collapsing) uses an "easeInBack" curve
(`cubic-bezier(0.36, 0, 0.66, -0.56)`), while `.cat-info.expanded .cat-age`
(expanding) uses "easeOutBack" (`cubic-bezier(0.34, 1.56, 0.64, 1)`). A
single shared overshoot curve only bounces *above* its target, which is
invisible when the target is 0 (height can't render negative) — hence two
curves, one per direction, rather than one `transition` shared by both.
The same asymmetric-curve pairing is used for `.cat-info`'s `width`
transition, for the same reason.

**Width also fit-to-content, not just height.** `.cat-info` keeps
`width: max-content` in CSS, but `app.js`'s `measureWidths()` (in
`setupHalf`) additionally drives an explicit inline `width` in px on setup,
on every tap, and on resize: `name`'s natural width + padding when
collapsed, or `max(name, age)` + padding when expanded. This mirrors the
height technique and exists for the same root reason: intrinsic
shrink-to-fit width in normal block layout reflects *all* children's
natural widths regardless of a child's own `overflow`/height state, so
without this the card would always be sized for the wider of name/age even
while the age was collapsed to 0 height. `white-space: nowrap` on both
`.cat-name` and `.cat-age` keeps these width measurements stable (a wrapped
line would under-measure its own natural single-line width).

Two gotchas this tripped on, both from forcing a layout read at the wrong
moment (`measureWidths()`'s `naturalWidth()` helper reads `scrollWidth`,
which always forces one):
- Plain `el.scrollWidth` on `name`/`age` doesn't give their true natural
  width — as ordinary block children with `width: auto` they stretch to
  fill the card's *current* width, so `scrollWidth` only reports their own
  text's width when that text happens to already be the wider of the two;
  otherwise it reports the (unrelated) current card width instead.
  `naturalWidth()` works around this by toggling the element's own
  `display` to `inline-block` (which isn't subject to that stretch rule)
  for the read, then restoring it.
- `measureWidths()` must run, in full, *before* `age.style.height` and
  `info.style.width` are set to their real new values in the tap/resize
  handlers — not after, and not interleaved. Doing the forced-layout read
  in between setting a property's old and new value breaks that property's
  transition (confirmed: the bounce vanished and the value snapped
  instantly). Measure everything first, then make the real changes in one
  batch with no layout reads in between.

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
