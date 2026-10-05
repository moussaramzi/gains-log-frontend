export const PEOPLE_IDS = ['kasem', 'moussa'];

// Day-of-week indexes as returned by Date#getDay(): Mon, Wed, Fri, Sun.
export const GYM_DAYS_OF_WEEK = [1, 3, 5, 0];

export const DEFAULT_PENALTY = 5;
export const POLL_INTERVAL_MS = 15000;
export const LOGIN_TRANSITION_MS = 200;

export const STATS_LOOKBACK_DAYS = 120;
export const MISSED_LOOKBACK_DAYS = 28;
export const MISSED_MAX_ITEMS = 10;

export const GRID_VIEWS = {
  week: { weeks: 1, label: 'This week' },
  '2weeks': { weeks: 2, label: 'Last 2 weeks' },
  month: { weeks: 4, label: 'Last month' },
};
export const DEFAULT_GRID_VIEW = 'week';

export const STORAGE_KEYS = {
  user: 'gains-log-user',
  pin: 'gains-log-pin',
  view: 'gains-log-view',
};
