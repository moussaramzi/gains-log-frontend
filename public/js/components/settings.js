import { api } from '../api.js';
import { applySettings, credentials, notify, personLabel, state } from '../state.js';
import { updateWhoName } from './auth.js';
import { updateFooterNames } from './footer.js';

const settingsBtn = document.getElementById('settingsBtn');
const panel = document.getElementById('settingsPanel');
const displayNameInput = document.getElementById('displayNameInput');
const startDateInput = document.getElementById('startDateInput');
const penaltyInput = document.getElementById('penaltyInput');
const saveBtn = document.getElementById('settingsSave');
const msg = document.getElementById('settingsMsg');

function togglePanel() {
  startDateInput.value = state.settings.startDate;
  penaltyInput.value = state.settings.penaltyAmount;
  displayNameInput.value = personLabel(state.currentUser);
  msg.textContent = '';
  panel.classList.toggle('show');
}

function readForm() {
  const penalty = parseFloat(penaltyInput.value);
  return {
    startDate: startDateInput.value || state.settings.startDate,
    penaltyAmount: Number.isNaN(penalty) || penalty < 0 ? state.settings.penaltyAmount : penalty,
    label: displayNameInput.value.trim(),
  };
}

function applyPeopleLabels(people) {
  Object.entries(people).forEach(([id, person]) => {
    if (state.people[id]) state.people[id].label = person.label;
  });
  updateWhoName();
  updateFooterNames();
}

async function save() {
  const { startDate, penaltyAmount, label } = readForm();
  const renaming = !!label && label !== personLabel(state.currentUser);

  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving…';
  try {
    const [settingsRes, peopleRes] = await Promise.all([
      api.saveSettings(credentials(), { startDate, penaltyAmount }),
      renaming ? api.renamePerson(credentials(), label) : null,
    ]);

    applySettings(settingsRes.settings);
    if (peopleRes && peopleRes.people) applyPeopleLabels(peopleRes.people);

    const awaitingConfirmation =
      state.settings.pendingAmount != null && state.settings.pendingBy === state.currentUser;
    msg.textContent = awaitingConfirmation
      ? 'Saved. Waiting on the other person to confirm the new penalty.'
      : 'Saved.';
    notify();
  } catch {
    msg.textContent = 'Could not save — try again.';
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save';
  }
}

export function initSettings() {
  settingsBtn.addEventListener('click', togglePanel);
  saveBtn.addEventListener('click', save);
}
