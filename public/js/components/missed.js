import { recentMissedSessions } from '../domain/stats.js';
import { state } from '../state.js';
import { escapeHtml } from '../utils/format.js';
import { swatchHtml } from './shared.js';

const missedList = document.getElementById('missedList');

export function renderMissed() {
  const items = recentMissedSessions();
  if (items.length === 0) {
    missedList.innerHTML = '<div class="empty-note">No missed sessions in the last 4 weeks. Solid.</div>';
    return;
  }

  missedList.innerHTML = items
    .map(({ date, personId }) => {
      const dateLabel = date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      return `
        <div class="missed-item">
          <span class="who-line">${swatchHtml(personId)}${escapeHtml(state.people[personId].label)} missed</span>
          <span class="d">${dateLabel}</span>
        </div>`;
    })
    .join('');
}
