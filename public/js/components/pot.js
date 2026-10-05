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
        <div class="pot-person" style="border-left-color:${state.people[personId].color}">
          ${personHeaderHtml(personId)}
          <div class="amt">${formatEuro(pot.perPerson[personId])}</div>
          <div class="sub">${stats[personId].missed} missed &times; €${state.settings.penaltyAmount}</div>
        </div>`,
    )
    .join('');
}
