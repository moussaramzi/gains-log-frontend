import { computePot } from '../domain/stats.js';
import { state } from '../state.js';
import { formatEuro } from '../utils/format.js';
import { personHeaderHtml } from './shared.js';

const totalEl = document.getElementById('potTotal');
const peopleEl = document.getElementById('potPeople');

export function renderPot(stats) {
  const pot = computePot(stats);
  totalEl.textContent = formatEuro(pot.total);
  peopleEl.innerHTML = Object.keys(state.people)
    .map(
      (personId) => `
        <div class="flex-1 rounded-xl border border-l-4 border-line p-3" style="border-left-color:${state.people[personId].color}">
          ${personHeaderHtml(personId)}
          <div class="font-display text-[26px] leading-none">${formatEuro(pot.perPerson[personId])}</div>
          <div class="mt-1 text-[11px] font-medium text-dim">${stats[personId].missed} missed &times; €${state.settings.penaltyAmount}</div>
        </div>`,
    )
    .join('');
}
