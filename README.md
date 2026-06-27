# how-old ♡

A tiny kawaii website that shows how old my two cats are. The only thing on the
screen is each cat's name and their current age — auto-calculated from their birth
date, so it's never stale.

Live structure: a split screen, one half per cat (side-by-side on desktop, stacked
on mobile).

## Editing the cats

Open `app.js` and edit the `CATS` config at the top:

```js
const CATS = [
  { name: "Kiki",   birthDate: "2019-06-15", photos: ["images/kiki/kiki-1.jpg", ...] },
  { name: "Knixie", birthDate: "2026-03-18", photos: ["images/knixie/knixie-1.jpg", ...] },
];
```

- `name` — shown on screen.
- `birthDate` — `"YYYY-MM-DD"`. Age is computed from this.
- `photos` — array of image paths shown as that cat's background, tap-to-cycle.

### How age is displayed

The format adapts to how old the cat is:

| Age                          | Shown as            | Example            |
| ---------------------------- | ------------------- | ------------------ |
| Under 6 months               | weeks               | `14 weeks`         |
| 6 months to under 1 year     | months              | `8 months`         |
| 1 year and older             | years + months      | `6 years, 11 months` |

## Running locally

No build step. Just open `index.html` in a browser.

## Deploying to GitHub Pages

The site is plain static files at the repo root, so GitHub Pages can serve it as-is:

1. Push this branch and merge it into your default branch (or point Pages at this branch).
2. In the repo: **Settings → Pages**.
3. Under **Source**, choose **Deploy from a branch**, pick the branch and the `/ (root)`
   folder, and save.
4. It will publish at `https://anujaya.github.io/how-old/`.

(That one-time toggle has to be done in the GitHub UI — it can't be set from the code.)

## Phase 2: photos

Each half shows a **background photo** of that cat, with the name/age card floating
on top.

- **Tap a half** (the photo or the card) to cycle to that cat's next photo. Add more
  photos by dropping files in `images/<cat>/` and listing them in that cat's `photos`
  array in `app.js`.
- **Drag the name/age card** anywhere — it's clamped to stay within its own half and
  always resets to the center on reload (position isn't saved).

Before adding new photos to the repo, strip EXIF/GPS metadata and downsize them (this
is a public site) — e.g. with Pillow:

```python
from PIL import Image, ImageOps
img = ImageOps.exif_transpose(Image.open("raw.jpg")).convert("RGB")
img.thumbnail((1600, 1600))
img.save("images/<cat>/<cat>-N.jpg", quality=82, optimize=True)
```
