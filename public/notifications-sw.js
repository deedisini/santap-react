// Cache claims serialize local and remote delivery for the same closing event.
let delivery = Promise.resolve();
async function showClosing(data) {
  if (!data?.eventId || !data.title || !data.body || !(new Date(data.expiresAt).getTime() > Date.now())) return;
  const cache = await caches.open('santap-closing-events-v1');
  const url = new URL(`/notification-events/${encodeURIComponent(data.eventId)}`, self.location.origin);
  if (await cache.match(url)) return;
  await self.registration.showNotification(data.title, { body: data.body, tag: data.eventId, renotify: false, data: { url: '/' } });
  await cache.put(url, new Response('shown'));
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - 100)).map(key => cache.delete(key)));
}
function enqueue(data) { delivery = delivery.catch(() => {}).then(() => showClosing(data)); return delivery; }
self.addEventListener('push', event => {
  let payload;
  try { payload = event.data?.json(); } catch { return; }
  event.waitUntil(enqueue(payload?.data || payload));
});
self.addEventListener('message', event => { if (event.data?.type === 'closing') event.waitUntil(enqueue(event.data.data)); });
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async windows => {
    const existing = windows.find(window => new URL(window.url).origin === self.location.origin);
    if (existing) return existing.focus();
    return clients.openWindow('/');
  }));
});
self.addEventListener('activate', event => event.waitUntil(clients.claim()));
