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
  { name: "Kiki",   birthDate: "2019-06-15", photos: [] },
  { name: "Knixie", birthDate: "2026-03-18", photos: [] },
];
```

- `name` — shown on screen.
- `birthDate` — `"YYYY-MM-DD"`. Age is computed from this.
- `photos` — reserved for Phase 2 (currently unused).

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

## Phase 2 (planned, not built yet)

- Each half gets a **background photo** of that cat.
- **Tapping a photo** cycles to the next photo of the same cat (`photos` array).
- The name + age **text overlay** becomes **draggable**, constrained to its own half.
