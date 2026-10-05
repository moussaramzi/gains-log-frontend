import { api } from './api.js';
import { PEOPLE_IDS, POLL_INTERVAL_MS } from './constants.js';
import { applySettings, notify, state } from './state.js';
import { capitalize } from './utils/format.js';

let pollTimer = null;

// Individual loads swallow errors so one failing endpoint doesn't block the rest;
// the next poll will simply try again.

export async function loadPeople() {
  let remote = {};
  try {
    remote = (await api.getPeople()).people || {};
  } catch {
    // Backend unreachable at startup — fall back to defaults so the page still works.
  }
  PEOPLE_IDS.forEach((id) => {
    state.people[id] = {
      label: remote[id]?.label || capitalize(id),
      color: `var(--${id})`,
    };
  });
}

async function loadSettings() {
  try {
    const res = await api.getSettings();
    if (res.settings) applySettings(res.settings);
  } catch {
    /* keep previous settings */
  }
}

async function loadCheatDays() {
  try {
    const res = await api.getCheatDays();
    PEOPLE_IDS.forEach((id) => {
      state.cheatDays[id] = res[id] || [];
    });
  } catch {
    /* keep previous cheat days */
  }
}

async function loadCheckins() {
  try {
    state.checkins = (await api.getCheckins()).checkins || {};
  } catch {
    /* keep previous check-ins */
  }
}

async function refresh() {
  // Check-ins are rendered against settings + cheat days, so load those first.
  await Promise.all([loadSettings(), loadCheatDays()]);
  await loadCheckins();
  if (state.currentUser) notify();
}

export function startPolling() {
  stopPolling();
  refresh();
  pollTimer = setInterval(refresh, POLL_INTERVAL_MS);
}

export function stopPolling() {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = null;
}
