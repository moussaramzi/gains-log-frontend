import { state } from '../state.js';
import { escapeHtml } from '../utils/format.js';

export function swatchHtml(personId) {
  return `<span class="sw" style="background:${state.people[personId].color}"></span>`;
}

/** Colour dot + display name, used at the top of each per-person card. */
export function personHeaderHtml(personId) {
  return `<div class="who-line">${swatchHtml(personId)}<span class="nm">${escapeHtml(state.people[personId].label)}</span></div>`;
}

/** Disables a button while `action` runs; re-enables it only on failure (success re-renders). */
export async function withButtonBusy(button, action, onError) {
  button.disabled = true;
  try {
    await action();
  } catch (err) {
    button.disabled = false;
    if (onError) onError(err);
  }
}
