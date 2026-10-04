/* Service worker My Chicken — cache des assets statiques uniquement.
   Les pages, API et Firestore restent en network-first pour toujours
   servir la carte et les commandes à jour. */
const CACHE = 'mychicken-v6';
const PRECACHE = [
  '/',
  '/la-carte',
  '/commander',
  '/icon-192.png',
  '/icon-512.png',
  '/fond-bois.avif',
  '/fond-bois-m2.avif',
  '/fond-bois.jpg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.matchAll().then((cs) => cs.forEach((c) => c.navigate(c.url))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  // API, navigation et bundles Next (recompilés en dev) : toujours le réseau
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/')) return;
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() => caches.match(url.pathname).then((r) => r || caches.match('/'))));
    return;
  }
  // Assets statiques : cache-first
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put(e.request, copy));
    return res;
  }).catch(() => hit)));
});
