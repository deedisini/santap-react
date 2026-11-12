import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { dispatchClosingPush, registerPush } from './push.js';

function database(role = 'Supervisor') {
  const values = new Map([['users/supervisor', { role }], ['pushSubscriptions/device', { uid: 'supervisor', token: 'valid-test-token-long-enough' }]]);
  function ref(path) {
    return { id: path.split('/').pop(),
      get: async () => ({ exists: values.has(path), data: () => values.get(path) }),
      create: async value => { if (values.has(path)) throw Object.assign(new Error('exists'), { code: 6 }); values.set(path, value); },
      update: async value => values.set(path, { ...values.get(path), ...value }),
      set: async value => values.set(path, value), delete: async () => values.delete(path),
    };
  }
  return { values, collection(name) { return { doc: id => ref(`${name}/${id}`), get: async () => ({ docs: [...values].filter(([key]) => key.startsWith(`${name}/`)).map(([key, value]) => ({ ...ref(key), ref: ref(key), data: () => value })) }) }; } };
}
test('push worker claims each event once and respects Friday closing and role revocation', async () => {
  const db = database(), sent = [];
  const messaging = { send: async payload => sent.push(payload) };
  await dispatchClosingPush(db, messaging, new Date('2026-11-13T17:49:59+08:00'));
  assert.equal(sent.length, 0);
  await dispatchClosingPush(db, messaging, new Date('2026-11-13T17:50:00+08:00'));
  await dispatchClosingPush(db, messaging, new Date('2026-11-13T17:50:15+08:00'));
  assert.equal(sent.length, 1);
  assert.match(sent[0].data.body, /18:00/);
  assert.equal(sent[0].webpush.headers.TTL, '600');
  await dispatchClosingPush(db, messaging, new Date('2026-11-13T18:00:00+08:00'));
  assert.equal(sent.length, 1);
  const revoked = database('Mahasiswa');
  await dispatchClosingPush(revoked, messaging, new Date('2026-11-13T17:50:00+08:00'));
  assert.equal(revoked.values.has('pushSubscriptions/device'), false);
  assert.equal(sent.length, 1);
});
test('paused service suppresses push and unauthorized roles cannot subscribe', async () => {
  const db = database();
  db.values.set('mealPeriods/evening', { pausedDate: '2026-11-13' });
  const sent = [];
  await dispatchClosingPush(db, { send: async payload => sent.push(payload) }, new Date('2026-11-13T17:50:00+08:00'));
  assert.equal(sent.length, 0);
  await assert.rejects(registerPush(db, { role: 'Mahasiswa' }, { token: 'valid-test-token-long-enough' }), { status: 403 });
});
test('service worker deduplicates simultaneous local and remote events persistently', async () => {
  const events = {}, records = new Map(), shown = [];
  const cache = { match: async url => records.get(String(url)), put: async (url, response) => records.set(String(url), response), keys: async () => [...records.keys()], delete: async key => records.delete(String(key)) };
  const self = { location: { origin: 'https://test.example' }, registration: { showNotification: async (...args) => shown.push(args) }, addEventListener: (name, callback) => { events[name] = callback; } };
  const source = await readFile(new URL('../public/notifications-sw.js', import.meta.url), 'utf8');
  const context = { self, caches: { open: async () => cache }, URL, Response, clients: { claim: async () => {} } };
  vm.runInNewContext(source, context);
  const data = { eventId: 'test-evening-1800', expiresAt: '2099-11-13T18:00:00+08:00', title: 'Malam segera ditutup', body: '18:00 WITA' };
  const pending = [];
  events.push({ data: { json: () => ({ data }) }, waitUntil: promise => pending.push(promise) });
  events.message({ data: { type: 'closing', data }, waitUntil: promise => pending.push(promise) });
  await Promise.all(pending);
  assert.equal(shown.length, 1);
  await new Promise((resolve, reject) => events.push({ data: { json: () => ({ data: { ...data, eventId: 'expired-event', expiresAt: '2000-01-01T00:00:00Z' } }) }, waitUntil: promise => promise.then(resolve, reject) }));
  assert.equal(shown.length, 1);
  vm.runInNewContext(source, { ...context, self: { ...self } });
  await new Promise((resolve, reject) => events.push({ data: { json: () => ({ data }) }, waitUntil: promise => promise.then(resolve, reject) }));
  assert.equal(shown.length, 1);
});
