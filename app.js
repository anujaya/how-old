/* ===========================================================================
   Cat age site — behavior.

   To change a cat's name or birth date, edit the CONFIG below. That's it.
   Birth dates are "YYYY-MM-DD". To add/swap photos, drop files in
   images/<cat>/ and list them in that cat's `photos` array.
   =========================================================================== */

/* ----------------------------- CONFIG ----------------------------------- */
const CATS = [
  {
    name: "Kiki",
    birthDate: "2019-06-15",
    photos: [
      "images/kiki/kiki-1.jpg",
      "images/kiki/kiki-2.jpg",
      "images/kiki/kiki-3.jpg",
      "images/kiki/kiki-4.jpg",
      "images/kiki/kiki-5.jpg",
      "images/kiki/kiki-6.jpg",
      "images/kiki/kiki-7.jpg",
      "images/kiki/kiki-8.jpg",
      "images/kiki/kiki-9.jpg",
      "images/kiki/kiki-10.jpg",
      "images/kiki/kiki-11.jpg",
      "images/kiki/kiki-12.jpg",
      "images/kiki/kiki-13.jpg",
      "images/kiki/kiki-14.jpg",
      "images/kiki/kiki-15.jpg",
      "images/kiki/kiki-16.jpg",
      "images/kiki/kiki-17.jpg",
      "images/kiki/kiki-18.jpg",
      "images/kiki/kiki-19.jpg",
      "images/kiki/kiki-20.jpg",
    ],
  },
  {
    name: "Knixie",
    birthDate: "2026-03-18",
    photos: [
      "images/knixie/knixie-1.jpg",
      "images/knixie/knixie-2.jpg",
      "images/knixie/knixie-4.jpg",
      "images/knixie/knixie-5.jpg",
    ],
  },
];
/* ------------------------------------------------------------------------ */


/**
 * Pluralize a unit: count(1, "week") -> "1 week", count(3, "week") -> "3 weeks".
 */
function unit(count, word) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

/**
 * Calendar-based difference from birthDate to `now`, broken into whole
 * years, months, and the leftover days within the current month, plus the
 * total number of whole days since birth.
 */
function diffParts(birth, now) {
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();

  // Borrow days from the previous (now) month if the day-of-month hasn't been reached.
  if (days < 0) {
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0); // last day of prev month
    days += prevMonth.getDate();
    months -= 1;
  }
  // Borrow a year if the month count went negative.
  if (months < 0) {
    months += 12;
    years -= 1;
  }

  const totalDays = Math.floor((now - birth) / 86400000); // ms per day
  return { years, months, days, totalDays };
}

/**
 * Format a cat's age using the tiered rule:
 *   - under 6 months old  -> whole weeks   ("14 weeks")
 *   - 6 to under 12 months -> whole months  ("8 months")
 *   - 1 year and older     -> whole years   ("6 years")
 */
function computeAge(birthDate, now = new Date()) {
  const birth = new Date(birthDate + "T00:00:00");

  // Guard against future / invalid birth dates.
  if (isNaN(birth) || birth > now) {
    return "not born yet ♡";
  }

  const { years, months, days, totalDays } = diffParts(birth, now);
  const totalMonths = years * 12 + months;

  if (totalMonths < 6) {
    const weeks = Math.floor(totalDays / 7);
    return unit(weeks, "week");
  }

  if (totalMonths < 12) {
    return unit(months, "month"); // years is 0 here, so months is the full age
  }

  // 1 year and older: whole years only.
  return unit(years, "year");
  // (note: `months`/`days` are intentionally unused in display, kept for clarity/future use)
}

/**
 * Shuffle a copy of an array (Fisher-Yates). Used so each page load cycles
 * a cat's photos in a fresh random order instead of always the same one.
 */
function shuffled(array) {
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Wire up a single cat's half: render its name/age, show its first photo,
 * make the photo tap-to-cycle, and make the text overlay draggable (clamped
 * to this half's own bounds).
 */
function setupHalf(half, cat) {
  const photoLayers = half.querySelectorAll(".cat-photo");
  const info = half.querySelector(".cat-info");
  const name = half.querySelector(".cat-name");
  const age = half.querySelector(".cat-age");

  name.textContent = cat.name;
  age.textContent = computeAge(cat.birthDate);

  /* --- Width fit-to-content --------------------------------------------- *
   * `.cat-info` is `width: max-content`, which always reflects the union of
   * ALL children's natural widths — including the age line even while it's
   * height-collapsed to 0, since shrink-to-fit sizing in normal block layout
   * ignores a child's overflow/height state. So the card never actually
   * narrows when the age is hidden unless we measure and drive it as an
   * explicit pixel value ourselves, the same trick used for height above.
   *
   * A plain `el.scrollWidth` on `name`/`age` doesn't reliably give their true
   * natural width either: as block children with `width: auto`, they stretch
   * to fill the card's *current* content width, so `scrollWidth` only
   * reflects their own text width when that text happens to be the wider of
   * the two right now — otherwise it reports the card's current (unrelated)
   * width instead. Temporarily switching to `display: inline-block` (which
   * isn't subject to that stretch rule) gets the real number regardless of
   * the card's current width.
   *
   * Also: never toggle `info.style.width` itself during measurement (e.g. to
   * fall back to CSS `max-content` and read it back) — that forces a layout
   * that lands a transition-eligible width change on `info` mid-function,
   * which fights with the real width change made right after and kills the
   * transition (verified: it snapped instantly with no bounce). Measuring
   * via the children's own `display` instead never touches `info`'s width,
   * so the only width change `info` sees in a tap is the final one below.
   */
  function naturalWidth(el) {
    const priorDisplay = el.style.display;
    el.style.display = "inline-block";
    const width = el.scrollWidth;
    el.style.display = priorDisplay;
    return width;
  }

  function measureWidths() {
    const paddingX =
      parseFloat(getComputedStyle(info).paddingLeft) +
      parseFloat(getComputedStyle(info).paddingRight);
    const nameWidth = naturalWidth(name);
    const ageWidth = naturalWidth(age);
    return {
      collapsed: nameWidth + paddingX,
      expanded: Math.max(nameWidth, ageWidth) + paddingX,
    };
  }

  // Start snug to just the name — the age starts hidden/collapsed.
  info.style.width = `${measureWidths().collapsed}px`;

  /* --- Tap-to-cycle photos, crossfaded --------------------------------- */
  // Two stacked layers; we only ever paint a photo onto the hidden one and
  // wait for it to fully decode before fading it in, so the gradient behind
  // is never exposed mid-swap. Cycle order is reshuffled on every page load.
  // Warm the browser's cache for every photo up front so later taps decode
  // quickly too.
  const photos = shuffled(cat.photos);
  photos.forEach((src) => {
    const img = new Image();
    img.src = src;
  });

  let photoIndex = 0;
  let visibleLayer = photoLayers[0];

  function preload(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => (img.decode ? img.decode().then(resolve, resolve) : resolve());
      img.onerror = resolve;
      img.src = src;
    });
  }

  function showPhoto(i) {
    if (photos.length === 0) return;
    const nextIndex = ((i % photos.length) + photos.length) % photos.length;
    const src = photos[nextIndex];
    preload(src).then(() => {
      const hiddenLayer = visibleLayer === photoLayers[0] ? photoLayers[1] : photoLayers[0];
      hiddenLayer.style.backgroundImage = `url("${src}")`;
      hiddenLayer.setAttribute("aria-label", `Photo of ${cat.name} (${nextIndex + 1} of ${photos.length})`);
      hiddenLayer.removeAttribute("aria-hidden");
      hiddenLayer.classList.add("is-visible");
      visibleLayer.classList.remove("is-visible");
      visibleLayer.setAttribute("aria-hidden", "true");
      visibleLayer = hiddenLayer;
      photoIndex = nextIndex;
    });
  }
  showPhoto(0);

  // A click on the bare photo (not the text card, which stops propagation
  // to handle its own tap-to-reveal-age behavior) advances to the next photo.
  half.addEventListener("click", () => showPhoto(photoIndex + 1));

  /* --- Draggable text overlay, clamped to this half ------------------- */
  const DRAG_THRESHOLD = 6; // px of movement before a press counts as a drag
  let dragging = false;
  let movedPastThreshold = false;
  let suppressNextClick = false;
  let startX, startY, startLeft, startTop;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  // The default look centers .cat-info via top/left 50% + a transform. The
  // first time it's dragged, pin that same visual position down as explicit
  // pixel left/top so plain arithmetic + clamping can take over from there.
  function switchToPixelPositioning() {
    if (info.dataset.pxPositioned) return;
    const halfRect = half.getBoundingClientRect();
    const infoRect = info.getBoundingClientRect();
    info.style.left = `${infoRect.left - halfRect.left}px`;
    info.style.top = `${infoRect.top - halfRect.top}px`;
    info.style.transform = "none";
    info.dataset.pxPositioned = "true";
  }

  info.addEventListener("pointerdown", (e) => {
    info.setPointerCapture(e.pointerId);
    switchToPixelPositioning();
    dragging = true;
    movedPastThreshold = false;
    startX = e.clientX;
    startY = e.clientY;
    startLeft = info.offsetLeft;
    startTop = info.offsetTop;
  });

  info.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (!movedPastThreshold) {
      if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
      movedPastThreshold = true;
      info.classList.add("dragging");
    }

    const maxLeft = Math.max(0, half.clientWidth - info.offsetWidth);
    const maxTop = Math.max(0, half.clientHeight - info.offsetHeight);
    info.style.left = `${clamp(startLeft + dx, 0, maxLeft)}px`;
    info.style.top = `${clamp(startTop + dy, 0, maxTop)}px`;
  });

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    info.classList.remove("dragging");
    if (movedPastThreshold) suppressNextClick = true;
  }
  info.addEventListener("pointerup", endDrag);
  info.addEventListener("pointercancel", endDrag);

  // Tapping the card reveals/hides the age (see the .expanded rules in
  // styles.css); it never bubbles to the half's click handler, so tapping
  // the card doesn't also cycle the photo underneath. A drag's pointerup is
  // followed by a synthetic click here too — swallow that one so finishing
  // a drag doesn't also toggle the age.
  info.addEventListener("click", (e) => {
    e.stopPropagation();
    if (suppressNextClick) {
      suppressNextClick = false;
      return;
    }
    const expanding = !info.classList.contains("expanded");
    // Measure first: measureWidths() forces a layout (reading scrollWidth)
    // and briefly toggles display on name/age to do it. Doing that *before*
    // touching height/width below means the only changes those properties
    // see in this tap are their real final ones — no transition-breaking
    // layout sandwiched in between (confirmed by testing: interleaving the
    // measurement after setting height/width made the bounce disappear).
    const widths = measureWidths();
    // scrollHeight measures the age text's natural height even while it's
    // clipped to 0 by overflow:hidden, giving the transition a real target
    // to animate toward (and past, for the bounce) instead of "auto".
    age.style.height = expanding ? `${age.scrollHeight}px` : "0px";
    info.style.width = `${expanding ? widths.expanded : widths.collapsed}px`;
    info.classList.toggle("expanded", expanding);
  });

  // Keep the overlay within bounds if the viewport is resized/rotated.
  window.addEventListener("resize", () => {
    // Re-measure: the age text's height/width can change with viewport width
    // (font-size is clamp()'d to vw, and the card's max-width is a % of
    // the half), so a stale fixed size would clip or leave a gap. Measure
    // before mutating height/width, for the same reason as the tap handler.
    const expanded = info.classList.contains("expanded");
    const widths = measureWidths();
    if (expanded) {
      age.style.height = `${age.scrollHeight}px`;
    }
    info.style.width = `${expanded ? widths.expanded : widths.collapsed}px`;
    if (!info.dataset.pxPositioned) return;
    const maxLeft = Math.max(0, half.clientWidth - info.offsetWidth);
    const maxTop = Math.max(0, half.clientHeight - info.offsetHeight);
    info.style.left = `${clamp(info.offsetLeft, 0, maxLeft)}px`;
    info.style.top = `${clamp(info.offsetTop, 0, maxTop)}px`;
  });
}

/**
 * Wire up the draggable divider between the two halves: dragging it sets
 * the --split CSS variable (read by both halves' flex-basis and the
 * divider's own position in styles.css), so the photos' background-size:
 * cover just naturally fills whatever space each half ends up with — no
 * extra resize logic needed for the photos themselves.
 */
function setupDivider() {
  const divider = document.getElementById("divider");
  const split = document.getElementById("split");
  if (!divider || !split) return;

  const MIN_PERCENT = 15;
  const MAX_PERCENT = 85;
  let currentPercent = 50;
  let dragging = false;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function isStacked() {
    return getComputedStyle(split).flexDirection === "column";
  }

  function percentFromPointer(e) {
    const rect = split.getBoundingClientRect();
    return isStacked()
      ? ((e.clientY - rect.top) / rect.height) * 100
      : ((e.clientX - rect.left) / rect.width) * 100;
  }

  function applyPercent(pct) {
    currentPercent = clamp(pct, MIN_PERCENT, MAX_PERCENT);
    split.style.setProperty("--split", `${currentPercent}%`);
    // Reuses each half's existing resize listener (see setupHalf above) to
    // re-clamp the draggable .cat-info card to the half's new live bounds.
    window.dispatchEvent(new Event("resize"));
  }

  divider.addEventListener("pointerdown", (e) => {
    divider.setPointerCapture(e.pointerId);
    dragging = true;
    divider.classList.add("dragging");
    applyPercent(percentFromPointer(e));
  });

  divider.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    applyPercent(percentFromPointer(e));
  });

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    divider.classList.remove("dragging");
  }
  divider.addEventListener("pointerup", endDrag);
  divider.addEventListener("pointercancel", endDrag);

  // Arrow keys nudge the split too, since the divider is focusable
  // (role="separator" + tabindex) for keyboard/screen-reader users.
  divider.addEventListener("keydown", (e) => {
    const step = e.shiftKey ? 10 : 2;
    const stacked = isStacked();
    const decreaseKey = stacked ? "ArrowUp" : "ArrowLeft";
    const increaseKey = stacked ? "ArrowDown" : "ArrowRight";
    if (e.key === decreaseKey) {
      applyPercent(currentPercent - step);
      e.preventDefault();
    } else if (e.key === increaseKey) {
      applyPercent(currentPercent + step);
      e.preventDefault();
    }
  });
}

function render() {
  document.querySelectorAll(".cat-half").forEach((half) => {
    const cat = CATS[Number(half.dataset.catIndex)];
    if (cat) setupHalf(half, cat);
  });
  setupDivider();
}

document.addEventListener("DOMContentLoaded", render);
