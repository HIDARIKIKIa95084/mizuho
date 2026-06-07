const CACHE_NAME = 'mizuho-v1';
const LOCAL_FILES = [
  './mizuho_app.html',
  './icon.png',
  './manifest.json'
];
const CDN_FILES = [
  'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap',
  'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.44.0/tabler-icons.min.css'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // ローカルは確実にキャッシュ
      cache.addAll(LOCAL_FILES);
      // CDNはベストエフォート（失敗しても無視）
      CDN_FILES.forEach(url => {
        fetch(url).then(res => cache.put(url, res)).catch(() => {});
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        // 取得できたらキャッシュに保存
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, res.clone()));
        return res;
      }).catch(() => caches.match('./mizuho_app.html'));
    })
  );
});
