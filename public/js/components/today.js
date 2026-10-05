import { api } from '../api.js';
import { credentials, notify, state } from '../state.js';
import { formatIsoShort, formatShort, startOfToday, toIsoDate } from '../utils/dates.js';
import { isCheatDay, isCountedGymDay, isGymDay, isTracked } from '../domain/schedule.js';

const card = document.getElementById('todayCard');
const dayEl = document.getElementById('todayDay');
const dateEl = document.getElementById('todayDate');
const checkBtn = document.getElementById('checkBtn');

function setButton(text, { done = false, disabled = false } = {}) {
  checkBtn.textContent = text;
  checkBtn.className = 'check-btn' + (done ? ' done' : '');
  checkBtn.disabled = disabled;
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
  card.classList.toggle('rest', (!gym || cheat) && tracked);
  card.classList.toggle('notyet', !tracked);

  if (!tracked) setButton(`Starts ${formatIsoShort(state.settings.startDate)}`, { disabled: true });
  else if (cheat) setButton('🎉 Cheat day — no gym', { disabled: true });
  else if (!gym) setButton('Rest day', { disabled: true });
  else if (isCheckedInToday()) setButton('✓ Checked in — tap to undo', { done: true });
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
