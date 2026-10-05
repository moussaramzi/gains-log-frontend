import { state } from '../state.js';
import { escapeHtml } from '../utils/format.js';

export function swatchHtml(personId, size = 'size-2.25') {
  return `<span class="${size} shrink-0 rounded-full" style="background:${state.people[personId].color}"></span>`;
}

/** Colour dot + display name, used at the top of each per-person card. */
export function personHeaderHtml(personId, spacing = 'mb-1.5') {
  return `<div class="${spacing} flex items-center gap-1.75">${swatchHtml(personId)}<span class="text-[13px] font-bold">${escapeHtml(state.people[personId].label)}</span></div>`;
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
