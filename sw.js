const C = 'offgrid-v3.4';
const SHELL = ['SYSTEM.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => null)))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { if (r.ok) { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); } return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('SYSTEM.html'))));
});
/* الإشعارات: مكالمات ورسايل بتوصل حتى والأبلكيشن مقفول */
self.addEventListener('push', e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (x) { d = { title: 'OFFGRID', body: e.data ? e.data.text() : '' }; }
  const url = new URL(d.url || './', self.registration.scope);
  if (!url.pathname.endsWith('.html')) url.pathname = url.pathname.replace(/\/?$/, '/') + 'SYSTEM.html';
  e.waitUntil(self.registration.showNotification(d.title || 'OFFGRID', {
    body: d.body || '', tag: d.tag || 'og', renotify: true, requireInteraction: !!d.call, icon: 'icon-192.png', badge: 'icon-192.png',
    vibrate: d.call ? [500, 250, 500, 250, 500, 250, 500] : [150], data: { url: url.href }
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close(); const url = (e.notification.data && e.notification.data.url) || self.registration.scope;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(L => {
    for (const c of L) if (c.url.startsWith(self.registration.scope) && 'focus' in c) { c.postMessage({ t: 'nav', url }); return c.focus(); }
    return self.clients.openWindow(url);
  }));
});
