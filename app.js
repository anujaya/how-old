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
    ],
  },
  {
    name: "Knixie",
    birthDate: "2026-03-18",
    photos: [
      "images/knixie/knixie-1.jpg",
      "images/knixie/knixie-2.jpg",
      "images/knixie/knixie-3.jpg",
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
 *   - 1 year and older     -> years + months ("6 years, 11 months")
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

  // 1 year and older: "X years, Y months"
  return `${unit(years, "year")}, ${unit(months, "month")}`;
  // (note: `days` is intentionally unused in display, kept for clarity/future use)
}

/**
 * Wire up a single cat's half: render its name/age, show its first photo,
 * make the photo tap-to-cycle, and make the text overlay draggable (clamped
 * to this half's own bounds).
 */
function setupHalf(half, cat) {
  const photoLayers = half.querySelectorAll(".cat-photo");
  const info = half.querySelector(".cat-info");

  half.querySelector(".cat-name").textContent = cat.name;
  half.querySelector(".cat-age").textContent = computeAge(cat.birthDate);

  /* --- Tap-to-cycle photos, crossfaded --------------------------------- */
  // Two stacked layers; we only ever paint a photo onto the hidden one and
  // wait for it to fully decode before fading it in, so the gradient behind
  // is never exposed mid-swap. Warm the browser's cache for every photo up
  // front so later taps decode quickly too.
  cat.photos.forEach((src) => {
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
    if (cat.photos.length === 0) return;
    const nextIndex = ((i % cat.photos.length) + cat.photos.length) % cat.photos.length;
    const src = cat.photos[nextIndex];
    preload(src).then(() => {
      const hiddenLayer = visibleLayer === photoLayers[0] ? photoLayers[1] : photoLayers[0];
      hiddenLayer.style.backgroundImage = `url("${src}")`;
      hiddenLayer.setAttribute("aria-label", `Photo of ${cat.name} (${nextIndex + 1} of ${cat.photos.length})`);
      hiddenLayer.removeAttribute("aria-hidden");
      hiddenLayer.classList.add("is-visible");
      visibleLayer.classList.remove("is-visible");
      visibleLayer.setAttribute("aria-hidden", "true");
      visibleLayer = hiddenLayer;
      photoIndex = nextIndex;
    });
  }
  showPhoto(0);

  // A click anywhere in the half — including one that bubbles up from a tap
  // (not a drag) on the text overlay — advances to the next photo.
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

  // A drag's pointerup is followed by a click on .cat-info; swallow that one
  // click so finishing a drag doesn't also cycle the photo underneath.
  info.addEventListener("click", (e) => {
    if (suppressNextClick) {
      e.stopPropagation();
      suppressNextClick = false;
    }
  });

  // Keep the overlay within bounds if the viewport is resized/rotated.
  window.addEventListener("resize", () => {
    if (!info.dataset.pxPositioned) return;
    const maxLeft = Math.max(0, half.clientWidth - info.offsetWidth);
    const maxTop = Math.max(0, half.clientHeight - info.offsetHeight);
    info.style.left = `${clamp(info.offsetLeft, 0, maxLeft)}px`;
    info.style.top = `${clamp(info.offsetTop, 0, maxTop)}px`;
  });
}

function render() {
  document.querySelectorAll(".cat-half").forEach((half) => {
    const cat = CATS[Number(half.dataset.catIndex)];
    if (cat) setupHalf(half, cat);
  });
}

document.addEventListener("DOMContentLoaded", render);
