import { GRID_VIEWS, PEOPLE_IDS } from '../constants.js';
import { buildGymWeeks, isCheatDay, isTracked } from '../domain/schedule.js';
import { state } from '../state.js';
import { saveGridView } from '../storage.js';
import { addDays, formatShort, startOfToday, toIsoDate } from '../utils/dates.js';
import { escapeHtml } from '../utils/format.js';

const titleEl = document.getElementById('gridTitle');
const viewTabs = document.getElementById('viewTabs');
const gridBody = document.getElementById('gridBody');

const MARK_TEXT = 'text-[10px] xs:text-[13px]';
const MARK_VARIANTS = {
  yes: `mark ${MARK_TEXT} bg-good text-white`,
  no: `mark ${MARK_TEXT} bg-bad text-white`,
  future: `mark ${MARK_TEXT} bg-surface-2 text-dim`,
  cheat: 'mark bg-transparent text-[13px]',
};

const CELL = 'border-t border-line px-px py-1.75 text-center xs:px-1 xs:py-2';
const LABEL_CELL =
  'truncate border-t border-line py-1.75 pl-0.75 text-left text-[11px] font-semibold xs:py-2 xs:text-[12.5px]';

function updateViewTabs() {
  viewTabs.querySelectorAll('button').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.view === state.gridView));
  });
  titleEl.textContent = GRID_VIEWS[state.gridView].label;
}

function cellHtml(date, today) {
  if (date > today || !isTracked(date)) return `<span class="${MARK_VARIANTS.future}">·</span>`;

  const key = toIsoDate(date);
  if (isCheatDay(key)) return `<span class="${MARK_VARIANTS.cheat}" title="Cheat day">🎉</span>`;

  const record = state.checkins[key] || {};
  return PEOPLE_IDS.map((personId, i) => {
    const ok = !!record[personId];
    const title = escapeHtml(state.people[personId]?.label || personId);
    const spacing = i < PEOPLE_IDS.length - 1 ? ' mr-0.5' : '';
    const symbol = ok ? personId.charAt(0).toUpperCase() : '✕';
    return `<span class="${MARK_VARIANTS[ok ? 'yes' : 'no']}${spacing}" title="${title}">${symbol}</span>`;
  }).join('');
}

export function renderGrid() {
  const today = startOfToday();
  const weeks = buildGymWeeks(GRID_VIEWS[state.gridView].weeks);

  gridBody.innerHTML = weeks
    .map(({ weekStart, entries }) => {
      const isCurrentWeek = today >= weekStart && today < addDays(weekStart, 7);
      const highlight = isCurrentWeek ? ' bg-accent/16' : '';
      const labelColor = isCurrentWeek ? ' text-accent font-extrabold' : ' text-dim';
      const cells = entries.map(({ date }) => `<td class="${CELL}${highlight}">${cellHtml(date, today)}</td>`).join('');
      return `<tr><td class="${LABEL_CELL}${highlight}${labelColor}">${formatShort(weekStart)}</td>${cells}</tr>`;
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
