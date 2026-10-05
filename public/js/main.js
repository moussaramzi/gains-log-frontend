import { initAuth, renderLoginButtons, showApp, showLogin } from './components/auth.js';
import { initCheatDays } from './components/cheatDays.js';
import { updateFooterNames } from './components/footer.js';
import { initGrid } from './components/grid.js';
import { initPendingBanner } from './components/pendingBanner.js';
import { initSettings } from './components/settings.js';
import { initToday } from './components/today.js';
import { renderAll } from './render.js';
import { state, subscribe } from './state.js';
import { loadGridView, loadSession } from './storage.js';
import { loadPeople, startPolling, stopPolling } from './sync.js';

function enterApp(name, pin) {
  state.currentUser = name;
  state.currentPin = pin;
  showApp();
  startPolling();
}

function leaveApp() {
  stopPolling();
  state.currentUser = null;
  state.currentPin = null;
  showLogin();
}

async function bootstrap() {
  state.gridView = loadGridView();

  subscribe(() => {
    if (state.currentUser) renderAll();
  });

  initAuth({ onLogin: enterApp, onLogout: leaveApp });
  initSettings();
  initPendingBanner();
  initToday();
  initGrid();
  initCheatDays();

  await loadPeople();
  renderLoginButtons();
  updateFooterNames();

  const saved = loadSession();
  if (saved.name && saved.pin && state.people[saved.name]) enterApp(saved.name, saved.pin);
}

bootstrap();
