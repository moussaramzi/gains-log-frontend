import { DEFAULT_GRID_VIEW, DEFAULT_PENALTY, PEOPLE_IDS } from './constants.js';
import { tomorrowIso } from './utils/dates.js';

/** Single source of truth for everything the UI renders. */
export const state = {
  people: {}, // { [id]: { label, color } } — populated from the backend on startup
  currentUser: null,
  currentPin: null,
  checkins: {}, // { [YYYY-MM-DD]: { [personId]: true } }
  cheatDays: Object.fromEntries(PEOPLE_IDS.map((id) => [id, []])),
  settings: {
    startDate: tomorrowIso(),
    penaltyAmount: DEFAULT_PENALTY,
    pendingAmount: null,
    pendingBy: null,
    pendingAt: null,
  },
  gridView: DEFAULT_GRID_VIEW,
};

const listeners = new Set();

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Call after mutating state to re-render the UI. */
export function notify() {
  listeners.forEach((listener) => listener(state));
}

export function credentials() {
  return { name: state.currentUser, pin: state.currentPin };
}

export function personLabel(id) {
  return state.people[id] ? state.people[id].label : '';
}

export function applySettings(next) {
  state.settings = {
    startDate: next.startDate,
    penaltyAmount: next.penaltyAmount,
    pendingAmount: next.pendingAmount ?? null,
    pendingBy: next.pendingBy || null,
    pendingAt: next.pendingAt || null,
  };
}
