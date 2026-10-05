import { DEFAULT_GRID_VIEW, GRID_VIEWS, STORAGE_KEYS } from './constants.js';

// Storage can throw (private mode, blocked site data), so every access is guarded.

export function saveSession(name, pin) {
  try {
    sessionStorage.setItem(STORAGE_KEYS.user, name);
    sessionStorage.setItem(STORAGE_KEYS.pin, pin);
  } catch {
    /* ignore */
  }
}

export function loadSession() {
  try {
    return {
      name: sessionStorage.getItem(STORAGE_KEYS.user),
      pin: sessionStorage.getItem(STORAGE_KEYS.pin),
    };
  } catch {
    return { name: null, pin: null };
  }
}

export function clearSession() {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.user);
    sessionStorage.removeItem(STORAGE_KEYS.pin);
  } catch {
    /* ignore */
  }
}

export function loadGridView() {
  try {
    const view = localStorage.getItem(STORAGE_KEYS.view);
    return GRID_VIEWS[view] ? view : DEFAULT_GRID_VIEW;
  } catch {
    return DEFAULT_GRID_VIEW;
  }
}

export function saveGridView(view) {
  try {
    localStorage.setItem(STORAGE_KEYS.view, view);
  } catch {
    /* ignore */
  }
}
