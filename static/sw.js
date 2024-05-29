const cacheName = 'SelfStats-v0.0.1';
const toCache = [
	'/',
	'/data',
	'/icons/favicon-16x16.png',
	'/icons/favicon.ico',
	'/icons/apple-icon.png',
	'/icons/apple-icon-144x144.png',
	'/icons/android-icon-192x192.png',
	'/icons/apple-icon-precomposed.png',
	'/icons/apple-icon-114x114.png',
	'/icons/ms-icon-310x310.png',
	'/icons/ms-icon-144x144.png',
	'/icons/apple-icon-57x57.png',
	'/icons/apple-icon-152x152.png',
	'/icons/ms-icon-150x150.png',
	'/icons/android-icon-72x72.png',
	'/icons/android-icon-96x96.png',
	'/icons/android-icon-36x36.png',
	'/icons/apple-icon-180x180.png',
	'/icons/favicon-96x96.png',
	'/icons/manifest.json',
	'/icons/android-icon-48x48.png',
	'/icons/apple-icon-76x76.png',
	'/icons/apple-icon-60x60.png',
	'/icons/browserconfig.xml',
	'/icons/android-icon-144x144.png',
	'/icons/apple-icon-72x72.png',
	'/icons/apple-icon-120x120.png',
	'/icons/favicon-32x32.png',
	'/icons/ms-icon-70x70.png'
];

self.addEventListener('install', (e) => {
	console.log('[Service Worker] Install');
	e.waitUntil(
		(async () => {
			const cache = await caches.open(cacheName);
			console.log('[Service Worker] Caching all: app shell and content');
			await cache.addAll(toCache);
		})()
	);
});

self.addEventListener('fetch', (e) => {
	e.respondWith(
		(async () => {
			const r = await caches.match(e.request);
			console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
			if (r) {
				return r;
			}
			const response = await fetch(e.request);
			const cache = await caches.open(cacheName);
			console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
			cache.put(e.request, response.clone());
			return response;
		})()
	);
});
