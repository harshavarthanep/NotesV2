/* ZenDocs service worker — v4 */
const CACHE = 'zendocs-shell-v4';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png'];

self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}));
});

self.addEventListener('activate', (e) => {
    e.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
        await self.clients.claim();
    })());
});

self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;
    const url = new URL(e.request.url);
    if (url.origin !== location.origin) return; /* never intercept Firebase/CDNs */
    e.respondWith(
        fetch(e.request).then(res => {
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
            return res;
        }).catch(() =>
            caches.match(e.request).then(m => m || caches.match('./index.html'))
        )
    );
});

/* Snooze / Open buttons on reminder notifications */
self.addEventListener('notificationclick', (e) => {
    const tag = e.notification.tag || '';
    e.notification.close();
    e.waitUntil((async () => {
        const cs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        if (e.action === 'snooze') {
            if (cs.length) cs[0].postMessage({ type: 'zd-snooze', tag });
            return;
        }
        if (cs.length) { cs[0].focus(); cs[0].postMessage({ type: 'zd-open', tag }); }
        else self.clients.openWindow('./');
    })());
});

// /* NEW: Listen for incoming Push Events (Background Wakeups) */
// self.addEventListener('push', (e) => {
//     let data = { title: 'ZenDocs Reminder', body: 'You have a scheduled note reminder.' };
    
//     if (e.data) {
//         try { 
//             data = e.data.json(); 
//         } catch(err) { 
//             data.body = e.data.text(); 
//         }
//     }

//     const options = {
//         body: data.body,
//         icon: './icon-192.png',
//         badge: './icon-192.png',
//         tag: data.tag || 'zd-reminder',
//         renotify: true,
//         vibrate: [200, 100, 200],
//         actions: [
//             { action: 'open', title: 'Open note' },
//             { action: 'snooze', title: 'Snooze 10 min' }
//         ]
//     };

//     e.waitUntil(self.registration.showNotification(data.title, options));
// });
