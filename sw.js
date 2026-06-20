const CACHE_NAME = 'devforges-v6';
const ASSETS = [
    '/',
    '/index.html',
    '/tools/index.html',
    '/about/index.html',
    '/blog/index.html',
    '/404.html',
    '/assets/css/style.css',
    '/assets/js/common.js',
    '/assets/js/particle-bg.js',
    '/manifest.json',
    '/tool/json-formatter/index.html',
    '/tool/base64/index.html',
    '/tool/regex/index.html',
    '/tool/url-encoder/index.html',
    '/tool/color-picker/index.html',
    '/tool/word-counter/index.html',
    '/tool/lorem/index.html',
    '/tool/jwt-decoder/index.html',
    '/tool/hash-generator/index.html',
    '/tool/diff-checker/index.html',
    '/tool/contrast-checker/index.html',
    '/tool/timestamp/index.html',
    '/assets/js/tools/json-formatter.js',
    '/assets/js/tools/base64.js',
    '/assets/js/tools/regex.js',
    '/assets/js/tools/url-encoder.js',
    '/assets/js/tools/color-picker.js',
    '/assets/js/tools/word-counter.js',
    '/assets/js/tools/lorem.js'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS).catch(err => console.log("SW Cache installation warning: ", err));
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    // Only handle GET requests and http/https schemes
    if (e.request.method !== 'GET' || !e.request.url.startsWith('http')) {
        return;
    }

    // Bypass service worker cache for local development
    if (e.request.url.includes('127.0.0.1') || e.request.url.includes('localhost')) {
        return;
    }

    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(e.request).then((networkResponse) => {
                if (!networkResponse || networkResponse.status !== 200) {
                    return networkResponse;
                }
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(e.request, responseToCache);
                });
                return networkResponse;
            }).catch(() => {
                return caches.match(e.request);
            });
        })
    );
});
