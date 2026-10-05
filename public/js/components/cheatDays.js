import { api } from '../api.js';
import { activeCheatRecord, otherPerson } from '../domain/schedule.js';
import { credentials, notify, personLabel, state } from '../state.js';
import { currentMonthIso, formatIsoShort, monthEndIso, startOfToday, toIsoDate } from '../utils/dates.js';
import { escapeHtml } from '../utils/format.js';
import { personHeaderHtml, withButtonBusy } from './shared.js';

const card = document.getElementById('cheatdayCard');

const INTRO =
  'Each person gets 1 cheat day per month — pick a date this month and the other person confirms it. ' +
  'Once confirmed, neither of you has to go to the gym that day.';

function showMessage(text) {
  const el = document.getElementById('cdMsg');
  if (el) el.textContent = text;
}

/** Earliest/latest date selectable for a cheat day: today → end of this month. */
function selectableRange() {
  const month = currentMonthIso();
  const todayIso = toIsoDate(startOfToday());
  const monthStart = `${month}-01`;
  return { min: todayIso > monthStart ? todayIso : monthStart, max: monthEndIso(month) };
}

function actionButton(action, owner, text, secondary = false) {
  return `<button class="cd-btn${secondary ? ' secondary' : ''}" data-action="${action}" data-owner="${owner}" type="button">${text}</button>`;
}

function personBodyHtml(personId) {
  const record = activeCheatRecord(personId);
  const isMe = personId === state.currentUser;
  const name = escapeHtml(personLabel(personId));

  if (!record) {
    const { min, max } = selectableRange();
    const picker = isMe
      ? `<div class="cd-row">
           <input type="date" id="cdDate_${personId}" min="${min}" max="${max}">
           ${actionButton('propose', personId, 'Use cheat day')}
         </div>`
      : '';
    return `<div class="cd-status">No cheat day used this month yet.</div>${picker}`;
  }

  const date = formatIsoShort(record.date);
  if (record.status === 'confirmed') {
    return `<div class="cd-status confirmed">🎉 Confirmed for ${date}.</div>`;
  }
  if (record.status !== 'pending') return '';

  if (isMe) {
    const other = escapeHtml(personLabel(otherPerson(personId)));
    return `
      <div class="cd-status pending">Pending — waiting for ${other} to confirm ${date}.</div>
      <div class="cd-row">${actionButton('cancel', personId, 'Cancel', true)}</div>`;
  }
  return `
    <div class="cd-status pending">${name} wants ${date} as their cheat day.</div>
    <div class="cd-row">
      ${actionButton('confirm', personId, 'Confirm')}
      ${actionButton('reject', personId, 'Reject', true)}
    </div>`;
}

export function renderCheatDays() {
  const people = Object.keys(state.people)
    .map((personId) => `<div class="cd-person">${personHeaderHtml(personId)}${personBodyHtml(personId)}</div>`)
    .join('');
  card.innerHTML = `<div class="cd-note">${INTRO}</div>${people}<div class="cd-msg" id="cdMsg"></div>`;
}

// Each action resolves to the owner's updated list of cheat-day records.
const ACTIONS = {
  propose: (owner) => {
    const date = document.getElementById(`cdDate_${owner}`)?.value;
    if (!date) throw new Error('Pick a date first.');
    return api.proposeCheatDay(credentials(), date);
  },
  cancel: (owner) => api.rejectCheatDay(credentials(), owner),
  reject: (owner) => api.rejectCheatDay(credentials(), owner),
  confirm: (owner) => api.confirmCheatDay(credentials(), owner),
};

function handleAction(button) {
  const { action, owner } = button.dataset;
  return withButtonBusy(
    button,
    async () => {
      const res = await ACTIONS[action](owner);
      state.cheatDays[owner] = res.records;
      notify();
    },
    (err) => showMessage(err.message || 'Could not save.'),
  );
}

export function initCheatDays() {
  card.addEventListener('click', (e) => {
    const button = e.target.closest('button[data-action]');
    if (button) handleAction(button);
  });
}
