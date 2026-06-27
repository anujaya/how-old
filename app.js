/* ===========================================================================
   Cat age site — behavior.

   To change a cat's name or birth date, edit the CONFIG below. That's it.
   Birth dates are "YYYY-MM-DD". The `photos` arrays are unused in Phase 1 —
   they're here so Phase 2 (tap-to-cycle background photos) has a data home.
   =========================================================================== */

/* ----------------------------- CONFIG ----------------------------------- */
const CATS = [
  { name: "Kiki",   birthDate: "2019-06-15", photos: [] }, // photos added in Phase 2
  { name: "Knixie", birthDate: "2026-03-18", photos: [] },
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
 * Render each cat's name + age into its half's text overlay.
 */
function render() {
  const halves = document.querySelectorAll(".cat-half");
  halves.forEach((half) => {
    const index = Number(half.dataset.catIndex);
    const cat = CATS[index];
    if (!cat) return;

    half.querySelector(".cat-name").textContent = cat.name;
    half.querySelector(".cat-age").textContent = computeAge(cat.birthDate);
  });
}

document.addEventListener("DOMContentLoaded", render);
