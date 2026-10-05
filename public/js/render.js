import { computeStats } from './domain/stats.js';
import { renderCheatDays } from './components/cheatDays.js';
import { renderGrid } from './components/grid.js';
import { renderMissed } from './components/missed.js';
import { renderPendingBanner } from './components/pendingBanner.js';
import { renderPot } from './components/pot.js';
import { renderStats } from './components/stats.js';
import { renderToday } from './components/today.js';

export function renderAll() {
  const stats = computeStats();
  renderToday();
  renderStats(stats);
  renderGrid();
  renderMissed();
  renderCheatDays();
  renderPot(stats);
  renderPendingBanner();
}
