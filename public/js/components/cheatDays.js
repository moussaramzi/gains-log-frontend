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

const STATUS = {
  idle: 'mb-2 text-[12.5px] text-dim',
  pending: 'mb-2 text-[12.5px] font-bold text-accent',
  confirmed: 'mb-2 text-[12.5px] font-bold text-good',
};
const ROW = 'flex flex-wrap items-center gap-2';

function actionButton(action, owner, text, secondary = false) {
  return `<button class="${secondary ? 'btn-secondary' : 'btn-primary'}" data-action="${action}" data-owner="${owner}" type="button">${text}</button>`;
}

function personBodyHtml(personId) {
  const record = activeCheatRecord(personId);
  const isMe = personId === state.currentUser;
  const name = escapeHtml(personLabel(personId));

  if (!record) {
    const { min, max } = selectableRange();
    const picker = isMe
      ? `<div class="${ROW}">
           <input type="date" id="cdDate_${personId}" min="${min}" max="${max}" aria-label="Cheat day date"
             class="field min-w-0 flex-1 rounded-lg px-2.5 py-2 text-[12.5px]">
           ${actionButton('propose', personId, 'Use cheat day')}
         </div>`
      : '';
    return `<div class="${STATUS.idle}">No cheat day used this month yet.</div>${picker}`;
  }

  const date = formatIsoShort(record.date);
  if (record.status === 'confirmed') {
    return `<div class="${STATUS.confirmed}">🎉 Confirmed for ${date}.</div>`;
  }
  if (record.status !== 'pending') return '';

  if (isMe) {
    const other = escapeHtml(personLabel(otherPerson(personId)));
    return `
      <div class="${STATUS.pending}">Pending — waiting for ${other} to confirm ${date}.</div>
      <div class="${ROW}">${actionButton('cancel', personId, 'Cancel', true)}</div>`;
  }
  return `
    <div class="${STATUS.pending}">${name} wants ${date} as their cheat day.</div>
    <div class="${ROW}">
      ${actionButton('confirm', personId, 'Confirm')}
      ${actionButton('reject', personId, 'Reject', true)}
    </div>`;
}

export function renderCheatDays() {
  const people = Object.keys(state.people)
    .map(
      (personId) =>
        `<div class="border-t border-line py-2.5">${personHeaderHtml(personId)}${personBodyHtml(personId)}</div>`,
    )
    .join('');
  card.innerHTML = `
    <div class="mb-3 text-[11px] leading-[1.4] text-dim">${INTRO}</div>
    ${people}
    <div id="cdMsg" class="mt-0.5 min-h-3.5 text-[11.5px] text-bad" aria-live="polite"></div>`;
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
