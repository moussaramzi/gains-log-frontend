import { api } from '../api.js';
import { credentials, notify, state } from '../state.js';
import { formatIsoShort, formatShort, startOfToday, toIsoDate } from '../utils/dates.js';
import { isCheatDay, isCountedGymDay, isGymDay, isTracked } from '../domain/schedule.js';

const card = document.getElementById('todayCard');
const dayEl = document.getElementById('todayDay');
const dateEl = document.getElementById('todayDate');
const checkBtn = document.getElementById('checkBtn');

/** variant: 'active' (can check in), 'done' (checked in, can undo) or 'muted' (nothing to do). */
function setButton(text, variant = 'active') {
  checkBtn.textContent = text;
  checkBtn.dataset.variant = variant;
  checkBtn.disabled = variant === 'muted';
}

function isCheckedInToday() {
  const record = state.checkins[toIsoDate(startOfToday())] || {};
  return !!record[state.currentUser];
}

export function renderToday() {
  const today = startOfToday();
  const tracked = isTracked(today);
  const gym = isGymDay(today);
  const cheat = isCheatDay(toIsoDate(today));

  dayEl.textContent = today.toLocaleDateString(undefined, { weekday: 'long' });
  dateEl.textContent = formatShort(today);
  card.dataset.state = tracked && (!gym || cheat) ? 'rest' : 'gym';

  if (!tracked) setButton(`Starts ${formatIsoShort(state.settings.startDate)}`, 'muted');
  else if (cheat) setButton('🎉 Cheat day — no gym', 'muted');
  else if (!gym) setButton('Rest day', 'muted');
  else if (isCheckedInToday()) setButton('✓ Checked in — tap to undo', 'done');
  else setButton('Check in');
}

async function toggleCheckin() {
  const today = startOfToday();
  if (checkBtn.disabled || !isCountedGymDay(today)) return;

  const key = toIsoDate(today);
  const wasChecked = isCheckedInToday();
  checkBtn.disabled = true;
  checkBtn.textContent = wasChecked ? 'Undoing…' : 'Saving…';
  try {
    const res = await api.setCheckin(credentials(), key, !wasChecked);
    state.checkins[key] = res.checkin;
    notify();
  } catch {
    checkBtn.disabled = false;
  }
}

export function initToday() {
  checkBtn.addEventListener('click', toggleCheckin);
}
