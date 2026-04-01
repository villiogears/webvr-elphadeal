const cacheName = "DefaultCompany-My project (3)-0.1";
const contentToCache = [
    "Build/webvr-elphadeal.loader.js",
    "Build/webvr-elphadeal.framework.js.br",
    "Build/webvr-elphadeal.data.br",
    "Build/webvr-elphadeal.wasm.br",
    "TemplateData/style.css"

];

self.addEventListener('install', function (e) {
    console.log('[Service Worker] Install');
    
    e.waitUntil((async function () {
      const cache = await caches.open(cacheName);
      console.log('[Service Worker] Caching all: app shell and content');
      await cache.addAll(contentToCache);
    })());
});

self.addEventListener('fetch', function (e) {
    e.respondWith((async function () {
      let response = await caches.match(e.request);
      console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
      if (response) { return response; }

      response = await fetch(e.request);
      const cache = await caches.open(cacheName);
      console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
      cache.put(e.request, response.clone());
      return response;
    })());
  self.addEventListener('fetch', event => {
    const url = event.request.url;
    if (url.endsWith('.js') || url.endsWith('.wasm') || url.endsWith('.data')) {
      event.respondWith(
        fetch(url + '.br').then(response => {
          if (response.ok) {
            const newHeaders = new Headers(response.headers);
            newHeaders.set('Content-Encoding', 'br');
            if (url.endsWith('.js')) {
              newHeaders.set('Content-Type', 'application/javascript');
            } else if (url.endsWith('.wasm')) {
              newHeaders.set('Content-Type', 'application/wasm');
            } else if (url.endsWith('.data')) {
              newHeaders.set('Content-Type', 'application/octet-stream');
            }
            return new Response(response.body, {
              status: response.status,
              statusText: response.statusText,
              headers: newHeaders
            });
          }
          return response;
        }).catch(() => fetch(event.request))
      );
    }
  });
