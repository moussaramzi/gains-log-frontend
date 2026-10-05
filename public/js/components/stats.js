import { state } from '../state.js';
import { personHeaderHtml } from './shared.js';

const statsRow = document.getElementById('statsRow');

export function renderStats(stats) {
  statsRow.innerHTML = Object.keys(state.people)
    .map((personId) => {
      const { streak, done, total } = stats[personId];
      const pct = total ? Math.round((done / total) * 100) : 0;
      return `
        <div class="flex-1 rounded-[14px] border border-line bg-surface p-3.5">
          ${personHeaderHtml(personId, 'mb-2')}
          <div class="font-display text-[30px] leading-none">${streak}</div>
          <div class="mt-0.5 text-[11px] font-semibold text-dim">session streak</div>
          <div class="mt-2 text-[11px] font-medium text-dim">${done} / ${total} attended (${pct}%)</div>
        </div>`;
    })
    .join('');
}
