import { PEOPLE_IDS } from '../constants.js';
import { personLabel } from '../state.js';

const footerNames = document.getElementById('footerNames');

export function updateFooterNames() {
  const labels = PEOPLE_IDS.map(personLabel);
  if (labels.every(Boolean)) footerNames.textContent = labels.join(' & ');
}
