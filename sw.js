/* ZenDocs service worker — v4 */
const CACHE = 'zendocs-v4';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {}));
});

self.addEventListener('activate', (e) => {
    e.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
        await self.clients.claim();
    })());
});

/* Network-first, cache fallback — the app shell works offline */
self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;
    const url = new URL(e.request.url);
    if (url.origin !== self.location.origin) return; /* let CDNs/Firebase pass through */
    e.respondWith(
        fetch(e.request).then(res => {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone)).catch(() => {});
            return res;
        }).catch(() => caches.match(e.request).then(m => m || caches.match('./index.html')))
    );
});

/* Notification buttons: Snooze / Open note.
   Focus (or open) the app, then message it — with retries so a freshly
   opened window has time to attach its message listener. */
self.addEventListener('notificationclick', (e) => {
    e.notification.close();
    const tag = e.notification.tag || '';
    const type = e.action === 'snooze' ? 'zd-snooze' : 'zd-open';
    e.waitUntil((async () => {
        const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        let client = wins[0] || null;
        if (client) { try { await client.focus(); } catch (err) {} }
        else { try { client = await self.clients.openWindow('./'); } catch (err) {} }
        if (!client) return;
        for (const delay of [0, 1200, 3000, 6000]) {
            await new Promise(r => setTimeout(r, delay));
            try { client.postMessage({ type: type, tag: tag }); } catch (err) {}
        }
    })());
});
