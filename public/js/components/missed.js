import { recentMissedSessions } from '../domain/stats.js';
import { state } from '../state.js';
import { escapeHtml } from '../utils/format.js';
import { swatchHtml } from './shared.js';

const missedList = document.getElementById('missedList');

export function renderMissed() {
  const items = recentMissedSessions();
  if (items.length === 0) {
    missedList.innerHTML =
      '<div class="py-2.5 text-center text-[13px] text-dim">No missed sessions in the last 4 weeks. Solid.</div>';
    return;
  }

  missedList.innerHTML = items
    .map(({ date, personId }) => {
      const dateLabel = date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      return `
        <div class="flex items-center justify-between border-t border-line py-2 text-[13px] first:border-t-0">
          <span class="flex items-center gap-1.75">${swatchHtml(personId, 'size-2')}${escapeHtml(state.people[personId].label)} missed</span>
          <span class="text-xs font-medium text-dim">${dateLabel}</span>
        </div>`;
    })
    .join('');
}
