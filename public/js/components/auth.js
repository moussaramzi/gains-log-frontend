import { api } from '../api.js';
import { LOGIN_TRANSITION_MS, PEOPLE_IDS } from '../constants.js';
import { personLabel, state } from '../state.js';
import { clearSession, saveSession } from '../storage.js';
import { escapeHtml } from '../utils/format.js';

const loginCard = document.getElementById('loginCard');
const app = document.getElementById('app');
const whoBar = document.getElementById('whoBar');
const whoName = document.getElementById('whoName');
const switchBtn = document.getElementById('switchBtn');
const personPick = document.getElementById('personPick');
const pinInput = document.getElementById('pinInput');
const loginGo = document.getElementById('loginGo');
const loginMsg = document.getElementById('loginMsg');

let pickedName = null;
let handlers = { onLogin: () => {}, onLogout: () => {} };

function setLoginMsg(text, kind = '') {
  loginMsg.textContent = text;
  loginMsg.dataset.kind = kind;
}

function setGoButtonIdle() {
  loginGo.disabled = !pickedName;
  loginGo.textContent = pickedName ? `Continue as ${personLabel(pickedName)}` : 'Select a name first';
}

function pickPerson(id, button) {
  personPick.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
  pickedName = id;
  setGoButtonIdle();
  setLoginMsg('');
  pinInput.focus();
}

async function attemptLogin() {
  if (!pickedName) return;
  const pin = pinInput.value;
  if (pin.length !== 4) {
    setLoginMsg('Enter your 4-digit PIN.', 'err');
    return;
  }

  loginGo.disabled = true;
  loginGo.textContent = 'Checking…';
  try {
    const res = await api.login(pickedName, pin);
    if (res.created) setLoginMsg(`PIN set. Welcome, ${personLabel(pickedName)}.`, 'ok');
    saveSession(pickedName, pin);
    // Brief pause so a "PIN set" message is visible before the app appears.
    setTimeout(() => handlers.onLogin(pickedName, pin), LOGIN_TRANSITION_MS);
  } catch (err) {
    setLoginMsg(err.status === 401 ? 'Wrong PIN.' : err.message || 'Could not reach the server.', 'err');
    setGoButtonIdle();
  }
}

function logout() {
  clearSession();
  pinInput.value = '';
  setLoginMsg('');
  setGoButtonIdle(); // otherwise it stays stuck on "Checking…" from the last login
  handlers.onLogout();
}

export function renderLoginButtons() {
  personPick.innerHTML = '';
  PEOPLE_IDS.filter((id) => state.people[id]).forEach((id) => {
    const label = state.people[id].label || id;
    const btn = document.createElement('button');
    btn.className =
      'flex-1 cursor-pointer rounded-[14px] border-2 border-line bg-surface-2 px-2.5 py-4 text-center text-ink transition-colors aria-pressed:border-accent';
    btn.type = 'button';
    btn.setAttribute('aria-pressed', 'false');
    btn.innerHTML = `
      <div class="mx-auto mb-2 flex size-8.5 items-center justify-center rounded-full font-display text-base text-white" style="background:${state.people[id].color}">${escapeHtml(label.charAt(0).toUpperCase())}</div>
      <div class="text-sm font-bold">${escapeHtml(label)}</div>`;
    btn.addEventListener('click', () => pickPerson(id, btn));
    personPick.appendChild(btn);
  });
}

export function updateWhoName() {
  whoName.textContent = personLabel(state.currentUser);
}

export function showApp() {
  loginCard.hidden = true;
  app.hidden = false;
  whoBar.hidden = false;
  updateWhoName();
}

export function showLogin() {
  app.hidden = true;
  loginCard.hidden = false;
  whoBar.hidden = true;
}

export function initAuth({ onLogin, onLogout }) {
  handlers = { onLogin, onLogout };
  pinInput.addEventListener('input', () => {
    pinInput.value = pinInput.value.replace(/\D/g, '').slice(0, 4);
  });
  pinInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') attemptLogin();
  });
  loginGo.addEventListener('click', attemptLogin);
  switchBtn.addEventListener('click', logout);
}
