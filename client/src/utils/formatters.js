/**
 * @file formatters.js
 * @description UI formatting utilities for data display.
 * Includes helpers for values representation, latency tags, date objects, token masking, and initials.
 */

/**
 * Format a number with locale-aware abbreviations.
 * Supports thousand (k) and million (M) formatting suffixes.
 * 
 * @param {number|null|undefined} n - The raw value.
 * @returns {string} Abbreviated locale string.
 */
export function formatNumber(n) {
  if (n === null || n === undefined) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  return n.toLocaleString();
}

/**
 * Format latency in ms or s depending on magnitude.
 * 
 * @param {number|string|null|undefined} ms - The millisecond count.
 * @returns {string} Formatted latency text.
 */
export function formatLatency(ms) {
  if (ms === null || ms === undefined) return '—';
  const val = parseFloat(ms);
  if (val >= 1000) return (val / 1000).toFixed(2) + 's';
  return val.toFixed(1) + 'ms';
}

/**
 * Format a decimal percentage as text with a percentage suffix.
 * 
 * @param {number|string|null|undefined} n - Ratio number.
 * @returns {string} Percentage text.
 */
export function formatPercentage(n) {
  if (n === null || n === undefined) return '—';
  return parseFloat(n).toFixed(2) + '%';
}

/**
 * Format a date as relative time (e.g. "Just now", "2m ago") or fall back to an absolute date string.
 * 
 * @param {Date|string|number|null|undefined} date - Date object/timestamp.
 * @returns {string} Relative time representation.
 */
export function formatDate(date) {
  if (!date) return '—';
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Format a date to a full readable datetime string.
 * 
 * @param {Date|string|number|null|undefined} date - Target date.
 * @returns {string} Full local datetime text.
 */
export function formatDateTime(date) {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format a time bucket timestamp to localized hour:minute string for chart axis.
 * 
 * @param {Date|string|number|null|undefined} bucket - Bucket timestamp.
 * @returns {string} Formatted time text.
 */
export function formatTimeBucket(bucket) {
  if (!bucket) return '';
  const d = new Date(bucket);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Mask an API key showing only first 8 and last 4 characters.
 * 
 * @param {string|null|undefined} key - Raw API key token.
 * @returns {string} Masked token.
 */
export function maskApiKey(key) {
  if (!key || key.length < 12) return key || '—';
  return key.slice(0, 8) + '••••' + key.slice(-4);
}

/**
 * Get user initials from a username.
 * 
 * @param {string|null|undefined} name - Username/email/name.
 * @returns {string} Initials text (max 2 characters).
 */
export function getInitials(name) {
  if (!name) return '?';
  return name.slice(0, 2).toUpperCase();
}
