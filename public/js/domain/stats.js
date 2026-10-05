import { MISSED_LOOKBACK_DAYS, MISSED_MAX_ITEMS } from '../constants.js';
import { state } from '../state.js';
import { addDays, startOfToday, toIsoDate } from '../utils/dates.js';
import { countedGymDaysToDate, isCountedGymDay, isTracked } from './schedule.js';

const hasCheckedIn = (isoDate, personId) => !!(state.checkins[isoDate] || {})[personId];

/**
 * Per-person attendance: sessions done, total counted sessions, current streak
 * and missed sessions. Today is never counted as missed — there's still time.
 */
export function computeStats() {
  const gymDays = countedGymDaysToDate();
  const todayIso = toIsoDate(startOfToday());
  const stats = {};

  Object.keys(state.people).forEach((personId) => {
    let done = 0;
    let missed = 0;
    let streak = 0;
    let streakBroken = false;

    for (let i = gymDays.length - 1; i >= 0; i--) {
      const key = toIsoDate(gymDays[i]);
      if (hasCheckedIn(key, personId)) {
        done++;
        if (!streakBroken) streak++;
      } else if (key !== todayIso) {
        missed++;
        streakBroken = true;
      }
    }

    stats[personId] = { done, missed, streak, total: gymDays.length };
  });

  return stats;
}

/** Penalty owed per person plus the combined total. */
export function computePot(stats) {
  const perPerson = {};
  let total = 0;
  Object.keys(state.people).forEach((personId) => {
    const amount = stats[personId].missed * state.settings.penaltyAmount;
    perPerson[personId] = amount;
    total += amount;
  });
  return { perPerson, total };
}

/** Most recent missed sessions (excluding today), newest first. */
export function recentMissedSessions() {
  const items = [];
  let day = addDays(startOfToday(), -1);

  for (let i = 0; i < MISSED_LOOKBACK_DAYS && items.length < MISSED_MAX_ITEMS && isTracked(day); i++) {
    if (isCountedGymDay(day)) {
      const key = toIsoDate(day);
      Object.keys(state.people).forEach((personId) => {
        if (!hasCheckedIn(key, personId)) items.push({ date: day, personId });
      });
    }
    day = addDays(day, -1);
  }

  return items.slice(0, MISSED_MAX_ITEMS);
}
