import { GRID_VIEWS, PEOPLE_IDS } from '../constants.js';
import { buildGymWeeks, isCheatDay, isTracked } from '../domain/schedule.js';
import { state } from '../state.js';
import { saveGridView } from '../storage.js';
import { addDays, formatShort, startOfToday, toIsoDate } from '../utils/dates.js';
import { escapeHtml } from '../utils/format.js';

const titleEl = document.getElementById('gridTitle');
const viewTabs = document.getElementById('viewTabs');
const gridBody = document.getElementById('gridBody');

function updateViewTabs() {
  viewTabs.querySelectorAll('button').forEach((b) => {
    b.classList.toggle('active', b.dataset.view === state.gridView);
  });
  titleEl.textContent = GRID_VIEWS[state.gridView].label;
}

function cellHtml(date, today) {
  if (date > today || !isTracked(date)) return '<span class="mark future">·</span>';

  const key = toIsoDate(date);
  if (isCheatDay(key)) return '<span class="mark cheat" title="Cheat day">🎉</span>';

  const record = state.checkins[key] || {};
  return PEOPLE_IDS.map((personId, i) => {
    const ok = !!record[personId];
    const title = escapeHtml(state.people[personId]?.label || personId);
    const spacing = i < PEOPLE_IDS.length - 1 ? ' style="margin-right:2px;"' : '';
    const symbol = ok ? personId.charAt(0).toUpperCase() : '✕';
    return `<span class="mark ${ok ? 'yes' : 'no'}" title="${title}"${spacing}>${symbol}</span>`;
  }).join('');
}

export function renderGrid() {
  const today = startOfToday();
  const weeks = buildGymWeeks(GRID_VIEWS[state.gridView].weeks);

  gridBody.innerHTML = weeks
    .map(({ weekStart, entries }) => {
      const isCurrentWeek = today >= weekStart && today < addDays(weekStart, 7);
      const cells = entries.map(({ date }) => `<td>${cellHtml(date, today)}</td>`).join('');
      return `<tr${isCurrentWeek ? ' class="row-today"' : ''}><td>${formatShort(weekStart)}</td>${cells}</tr>`;
    })
    .join('');
}

export function initGrid() {
  viewTabs.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.gridView = btn.dataset.view;
      saveGridView(state.gridView);
      updateViewTabs();
      renderGrid();
    });
  });
  updateViewTabs();
}
