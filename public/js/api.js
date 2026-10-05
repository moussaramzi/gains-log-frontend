// Base URL comes from public/config.js so deployments can point at any backend.
const API_BASE = (window.GAINS_LOG_API_BASE || '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${API_BASE}/api/${path}`, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || 'request failed', res.status, data);
  return data;
}

const post = (path, body) => request(path, { method: 'POST', body });

// `creds` is always { name, pin } for the logged-in user.
export const api = {
  login: (name, pin) => post('login', { name, pin }),

  getPeople: () => request('people'),
  renamePerson: (creds, label) => post('people', { ...creds, label }),

  getSettings: () => request('settings'),
  saveSettings: (creds, { startDate, penaltyAmount }) =>
    post('settings', { ...creds, startDate, penaltyAmount }),
  confirmSettings: (creds) => post('settings/confirm', creds),
  rejectSettings: (creds) => post('settings/reject', creds),

  getCheckins: () => request('checkins'),
  setCheckin: (creds, date, checked) => post('checkin', { ...creds, date, checked }),

  getCheatDays: () => request('cheatdays'),
  proposeCheatDay: (creds, date) => post('cheatdays', { ...creds, date }),
  confirmCheatDay: (creds, owner) => post('cheatdays/confirm', { ...creds, owner }),
  rejectCheatDay: (creds, owner) => post('cheatdays/reject', { ...creds, owner }),
};
