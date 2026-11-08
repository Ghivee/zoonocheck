const V = 'zoonocheck-v7';
const SHELL = '/index.html';
const CORE = [
  '/', SHELL, '/manifest.webmanifest',
  '/assets/css/main.css',
  '/assets/js/core.js', '/assets/js/art.js', '/assets/js/ui.js', '/assets/js/pages.js',
  '/assets/fonts/bricolage.woff2', '/assets/fonts/inter.woff2', '/assets/fonts/fraunces.woff2',
  '/assets/icons/icon-192.png', '/assets/icons/icon-512.png', '/assets/icons/icon-maskable-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // Navigasi: semua rute memakai shell yang sama (network-first, fallback cache).
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match(SHELL)));
    return;
  }
  // Aset: stale-while-revalidate.
  e.respondWith(
    caches.match(req).then(hit => {
      const net = fetch(req).then(r => {
        if (r && r.ok) { const copy = r.clone(); caches.open(V).then(c => c.put(req, copy)); }
        return r;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
