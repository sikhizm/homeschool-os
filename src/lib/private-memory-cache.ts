'use client';

/**
 * Short-lived, in-tab memory only. Never writes learner data to browser storage,
 * Cache Storage, a service worker, a shared CDN or a server process.
 */
const MAX_ENTRIES = 24;
export const PRIVATE_CACHE_TTL_MS = 30_000;
type Entry = {value: unknown; expiresAt: number};
const items = new Map<string, Entry>();
let currentScope = '';

export function clearPrivateMemoryCache() {
  items.clear();
  currentScope = '';
}

function scopeKey(scope: string, key: string) {
  if (!scope || !key) return null;
  // A different authenticated user must not see a previous user's cached data.
  if (currentScope !== scope) {
    items.clear();
    currentScope = scope;
  }
  return scope + '\u0000' + key;
}

export function readPrivateMemoryCache<T>(scope: string, key: string, now = Date.now()): T | undefined {
  const id = scopeKey(scope, key);
  if (!id) return undefined;
  const entry = items.get(id);
  if (!entry) return undefined;
  if (entry.expiresAt <= now) {
    items.delete(id);
    return undefined;
  }
  // Keep recently used entries during bounded eviction.
  items.delete(id);
  items.set(id, entry);
  return entry.value as T;
}

export function writePrivateMemoryCache<T>(scope: string, key: string, value: T,
  ttlMs = PRIVATE_CACHE_TTL_MS, now = Date.now()) {
  const id = scopeKey(scope, key);
  if (!id || ttlMs <= 0) return;
  items.delete(id);
  items.set(id, {value, expiresAt: now + ttlMs});
  while (items.size > MAX_ENTRIES) {
    const oldest = items.keys().next().value;
    if (oldest === undefined) break;
    items.delete(oldest);
  }
}

export function invalidatePrivateMemoryCache(scope: string, prefix = '') {
  const scopedPrefix = scopeKey(scope, prefix || '_');
  if (!scopedPrefix) return;
  // Empty prefix clears everything for the current account.
  if (!prefix) {
    items.clear();
    return;
  }
  for (const id of items.keys()) {
    if (id.startsWith(scopedPrefix)) items.delete(id);
  }
}
