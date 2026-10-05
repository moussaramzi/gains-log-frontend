const pad = (n) => String(n).padStart(2, '0');

/** Local-time YYYY-MM-DD for a Date. */
export function toIsoDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Parses YYYY-MM-DD as local midnight (not UTC). */
export function parseIsoDate(isoDate) {
  return new Date(`${isoDate}T00:00:00`);
}

export function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function tomorrowIso() {
  return toIsoDate(addDays(startOfToday(), 1));
}

/** Monday 00:00 of the week containing `date`. */
export function startOfWeek(date) {
  const d = new Date(date);
  const dow = d.getDay();
  d.setDate(d.getDate() + (dow === 0 ? -6 : 1 - dow));
  d.setHours(0, 0, 0, 0);
  return d;
}

/** YYYY-MM for the current month. */
export function currentMonthIso() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

/** YYYY-MM-DD of the last day of a YYYY-MM month. */
export function monthEndIso(month) {
  const [year, monthNum] = month.split('-').map(Number);
  return toIsoDate(new Date(year, monthNum, 0));
}

export function formatShort(date) {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatIsoShort(isoDate) {
  return formatShort(parseIsoDate(isoDate));
}
