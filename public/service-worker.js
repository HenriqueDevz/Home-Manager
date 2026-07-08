const { cache } = require("react");

const CACHE_NAME = 'financas-compras-v1';
const ARQUIVOS = [
    '/',
    '/dashboard.html',
    '/style.css',
    '/dashboard.js',
    'https://cdn.jsdelivr.net/npm/chart;js'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ARQUIVOS))
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.resquest).then(cached => cached || fetch(e.resquest))
    );
});