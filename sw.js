const CACHE_NAME = 'onyx-ui-cache-v1';
const ASSETS = [
  './',
  'index.html',
  'styles.css',
  'script.js',
  'agenticon.png',
  'usericon.png',
  'onyxicon.jpg',
  'onyxicon.png',
  'onyxicon2.png',
  'emo.png',
  'lol.png',
  'question.png',
  'settings.png',
  // sub-pages/screenshots for help/reference (optional)
  'collapsible_sidebar_(controls_panel)/code.html',
  'collapsible_sidebar_(controls_panel)/screen.png',
  'help/information_popup/code.html',
  'help/information_popup/screen.png',
  'introductory_welcome_popup/code.html',
  'introductory_welcome_popup/screen.png',
  'loading_overlay/code.html',
  'loading_overlay/screen.png',
  'main_chat_interface_1/code.html',
  'main_chat_interface_1/screen.png',
  'main_chat_interface_2/code.html',
  'main_chat_interface_2/screen.png',
  // Tailwind CDN file will be cached at runtime if available once
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))).then(
      () => self.clients.claim()
    )
  );
});

// Cache-first for same-origin, network-first fallback for others
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET
  if (req.method !== 'GET') return;

  // Same-origin: cache-first
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        return res;
      }).catch(() => cached))
    );
    return;
  }

  // Other origins (e.g., Tailwind CDN): network-first, fallback to cache if previously saved
  event.respondWith(
    fetch(req)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        return res;
      })
      .catch(() => caches.match(req))
  );
});

