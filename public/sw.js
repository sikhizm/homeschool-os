// The worker caches public, versioned UI assets only. Authenticated HTML and API
// data always travel to the server and are never persisted by Cache Storage.
const CACHE_NAME = 'homeschool-os-static-v3';
const OFFLINE_URL = '/offline.html';
const MAX_STATIC_ENTRIES = 140;

function isCacheableAsset(url) {
  if (url.search) return false;
  if (url.pathname.startsWith('/_next/static/')) return true;
  return /^\/(?:brand|illustrations|icons)\/[a-zA-Z0-9/_-]+\.(?:svg|png|jpe?g|webp|ico|woff2?)$/.test(url.pathname);
}

async function remember(cache, request, response) {
  // A route returning HTML or user-specific data must never enter the asset cache.
  const contentType = response.headers.get('content-type') || '';
  const directive = response.headers.get('cache-control') || '';
  if (!response.ok || response.type === 'opaque' || /private|no-store/i.test(directive)
    || /text\/html|application\/json/i.test(contentType)
    || response.headers.has('set-cookie')) return;
  await cache.put(request, response.clone());
  const entries = await cache.keys();
  if (entries.length > MAX_STATIC_ENTRIES) {
    await Promise.all(entries.slice(0, entries.length - MAX_STATIC_ENTRIES)
      .map(oldRequest => cache.delete(oldRequest)));
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      await cache.add(OFFLINE_URL);
    } catch {
      // The worker can still activate; the next successful visit retries the offline page.
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith('homeschool-os-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Keep authenticated responses, server actions and RSC payloads network-only.
  if (url.pathname.startsWith('/api/')
    || url.pathname.startsWith('/auth/')
    || url.pathname.startsWith('/_next/data/')
    || request.headers.has('rsc')
    || url.searchParams.has('_rsc')) return;

  if (isCacheableAsset(url) && request.mode !== 'navigate') {
    event.respondWith((async () => {
      // Cache Storage is optional: quota/storage failures must never break page assets.
      const cache = await caches.open(CACHE_NAME).catch(() => null);
      const existing = cache ? await cache.match(request).catch(() => undefined) : undefined;
      // Hashed Next.js resources are immutable and can load entirely from disk.
      if (existing && url.pathname.startsWith('/_next/static/')) return existing;
      const update = fetch(request).then(async response => {
        if (cache) {
          try { await remember(cache, request, response); } catch { /* Network response stays usable. */ }
        }
        return response;
      });
      // Stable-name public SVGs and icons refresh in the background.
      if (existing) {
        event.waitUntil(update.catch(() => undefined));
        return existing;
      }
      return update.catch(() => Response.error());
    })());
    return;
  }

  // Never replay a cached dashboard or learner record while offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => (await caches.match(OFFLINE_URL)) || Response.error()),
    );
  }
});
