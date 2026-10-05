import { api } from '../api.js';
import { applySettings, credentials, notify, personLabel, state } from '../state.js';
import { escapeHtml, formatEuro } from '../utils/format.js';
import { withButtonBusy } from './shared.js';

const banner = document.getElementById('pendingBanner');

const ACTIONS = {
  confirm: api.confirmSettings,
  reject: api.rejectSettings,
};

function runAction(action, button) {
  return withButtonBusy(button, async () => {
    const res = await ACTIONS[action](credentials());
    applySettings(res.settings);
    notify();
  });
}

/** Shows a pending penalty-change proposal and lets the other person confirm/reject it. */
export function renderPendingBanner() {
  const { pendingAmount, pendingBy } = state.settings;
  if (pendingAmount == null) {
    banner.hidden = true;
    banner.innerHTML = '';
    return;
  }

  const amount = formatEuro(pendingAmount);
  banner.hidden = false;

  if (pendingBy === state.currentUser) {
    banner.innerHTML = `
      <div class="pb-text">You proposed changing the penalty to ${amount} per missed day — waiting for the other person to confirm.</div>
      <div class="pb-actions"><button class="pb-reject" data-action="reject" type="button">Cancel proposal</button></div>`;
  } else {
    const proposer = escapeHtml(personLabel(pendingBy) || 'Someone');
    banner.innerHTML = `
      <div class="pb-text">${proposer} wants to change the penalty to ${amount} per missed day.</div>
      <div class="pb-actions">
        <button class="pb-confirm" data-action="confirm" type="button">Confirm</button>
        <button class="pb-reject" data-action="reject" type="button">Reject</button>
      </div>`;
  }
}

export function initPendingBanner() {
  banner.addEventListener('click', (e) => {
    const button = e.target.closest('button[data-action]');
    if (button) runAction(button.dataset.action, button);
  });
}
