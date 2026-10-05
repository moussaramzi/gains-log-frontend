import { GYM_DAYS_OF_WEEK, PEOPLE_IDS, STATS_LOOKBACK_DAYS } from '../constants.js';
import { state } from '../state.js';
import { addDays, currentMonthIso, startOfToday, startOfWeek, toIsoDate } from '../utils/dates.js';

export function isGymDay(date) {
  return GYM_DAYS_OF_WEEK.includes(date.getDay());
}

/** Days before the configured start date aren't tracked or penalized. */
export function isTracked(date) {
  return toIsoDate(date) >= state.settings.startDate;
}

export function otherPerson(id) {
  return PEOPLE_IDS.find((p) => p !== id);
}

/** This month's non-rejected cheat-day record for a person, if any. */
export function activeCheatRecord(personId) {
  const month = currentMonthIso();
  const records = state.cheatDays[personId] || [];
  return records.findLast((r) => r.month === month && r.status !== 'rejected') || null;
}

export function isCheatDay(isoDate) {
  return PEOPLE_IDS.some((p) =>
    (state.cheatDays[p] || []).some((r) => r.status === 'confirmed' && r.date === isoDate),
  );
}

/** A gym day that counts towards attendance and penalties. */
export function isCountedGymDay(date) {
  return isGymDay(date) && isTracked(date) && !isCheatDay(toIsoDate(date));
}

/** The last `weekCount` weeks (oldest first), each with its four gym days. */
export function buildGymWeeks(weekCount) {
  const currentWeekStart = startOfWeek(startOfToday());
  const weeks = [];
  for (let w = weekCount - 1; w >= 0; w--) {
    const weekStart = addDays(currentWeekStart, -7 * w);
    weeks.push({
      weekStart,
      entries: [
        { label: 'Mon', date: weekStart },
        { label: 'Wed', date: addDays(weekStart, 2) },
        { label: 'Fri', date: addDays(weekStart, 4) },
        { label: 'Sun', date: addDays(weekStart, 6) },
      ],
    });
  }
  return weeks;
}

/** Every counted gym day from the start date up to and including today, oldest first. */
export function countedGymDaysToDate() {
  const days = [];
  let day = startOfToday();
  for (let i = 0; i < STATS_LOOKBACK_DAYS && isTracked(day); i++) {
    if (isCountedGymDay(day)) days.push(day);
    day = addDays(day, -1);
  }
  return days.reverse();
}
