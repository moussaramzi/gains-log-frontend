export function formatEuro(amount) {
  const rounded = Math.round(amount * 100) / 100;
  return '€' + rounded.toLocaleString(undefined, {
    minimumFractionDigits: amount % 1 ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escapes user-controlled text (e.g. display names) before it goes into innerHTML. */
export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
}
