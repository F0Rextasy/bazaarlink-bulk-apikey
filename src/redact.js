'use strict';
/**
 * Strips key material out of an account record before it is written to the
 * readable `outputs/accounts.json`. `keys.txt` and `outputs/state.json` are the
 * key-bearing files; everything else must be safe to share.
 *
 * Drops `key`, drops the raw registration `body` (it embeds `api_key`), and
 * sweeps any remaining `sk-bl-…` occurrence out of every string.
 */
const KEY_PATTERN = /sk-bl-[A-Za-z0-9_-]{16,}/g;

function scrub(value) {
  if (typeof value === 'string') return value.replace(KEY_PATTERN, 'sk-bl-***');
  if (Array.isArray(value)) return value.map(scrub);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (k === 'key' || k === 'api_key' || k === 'apiKey' || k === 'body') continue;
      out[k] = scrub(v);
    }
    return out;
  }
  return value;
}

/** Redacts a list of account records. */
function redactAccounts(accounts) {
  return accounts.map(scrub);
}

module.exports = { scrub, redactAccounts, KEY_PATTERN };