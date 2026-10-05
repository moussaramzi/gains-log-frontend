import { state } from '../state.js';
import { personHeaderHtml } from './shared.js';

const statsRow = document.getElementById('statsRow');

export function renderStats(stats) {
  statsRow.innerHTML = Object.keys(state.people)
    .map((personId) => {
      const { streak, done, total } = stats[personId];
      const pct = total ? Math.round((done / total) * 100) : 0;
      return `
        <div class="stat-card">
          ${personHeaderHtml(personId)}
          <div class="stat-num">${streak}</div>
          <div class="stat-lbl">session streak</div>
          <div class="stat-sub">${done} / ${total} attended (${pct}%)</div>
        </div>`;
    })
    .join('');
}
