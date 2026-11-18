import { createHash, randomUUID } from 'node:crypto';
import { getMessaging } from 'firebase-admin/messaging';
import { firebase, requireRole, fail, roles } from './auth.js';
import { readOperations } from './operations.js';
import { periodWindow } from '../shared/operations.js';

export async function registerPush(db, identity, data) {
  requireRole(identity, roles);
  if (typeof data.token !== 'string' || data.token.length < 20 || data.token.length > 4096) throw fail(400, 'invalid_token', 'Token notifikasi tidak valid.');
  const key = createHash('sha256').update(data.token).digest('hex');
  const ref = db.collection('pushSubscriptions').doc(key);
  if (data.enabled === false) {
    const existing = await ref.get();
    if (existing.exists && existing.data().uid === identity.uid) await ref.delete();
  } else await ref.set({ uid: identity.uid, token: data.token, updatedAt: new Date() });
  return { ok: true };
}

export async function dispatchClosingPush(db, messaging, now = new Date()) {
  const config = await readOperations(db);
  const windows = Object.keys(config.schedules).map(id => periodWindow(id, now, config)).filter(window => window.warning);
  if (!windows.length) return;
  const subscriptions = await db.collection('pushSubscriptions').get();
  for (const window of windows) {
    const period = await db.collection('mealPeriods').doc(window.id).get();
    const pausedDate = period.data()?.pausedDate;
    if (pausedDate === window.date) continue;
    for (const subscription of subscriptions.docs) {
      const { uid, token } = subscription.data();
      const profile = await db.collection('users').doc(uid).get();
      if (!profile.exists) { await subscription.ref.delete(); continue; }
      if (!['Supervisor', 'Head'].includes(profile.data()?.role)) continue;
      const delivery = db.collection('pushDeliveries').doc(`${window.eventId}_${subscription.id}`);
      try { await delivery.create({ attemptedAt: now, status: 'sending' }); }
      catch (error) { if (error.code === 6 || error.code === 'already-exists') continue; throw error; }
      try {
        await messaging.send({ token, data: { eventId: window.eventId, expiresAt: window.endAt.toISOString(), title: `${window.label} segera ditutup`, body: `Layanan ditutup pukul ${window.close} WITA.` }, webpush: { headers: { TTL: String(Math.max(1, Math.floor((window.endAt - now) / 1000))) } } });
        await delivery.update({ status: 'sent' });
      } catch (error) {
        await delivery.update({ status: 'failed', code: String(error.code || 'unknown') });
        if (['messaging/registration-token-not-registered', 'messaging/invalid-registration-token'].includes(error.code)) await subscription.ref.delete();
      }
    }
  }
}

export async function dispatchAdminPush(db, messaging, now = new Date()) {
  const subscriptions = await db.collection('pushSubscriptions').get();
  const eventId = `admin-test-${now.getTime()}-${randomUUID()}`;
  const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);
  const result = { eventId, targeted: 0, sent: 0, failed: 0, removed: 0 };
  for (const subscription of subscriptions.docs) {
    const { uid, token } = subscription.data();
    const profile = await db.collection('users').doc(uid).get();
    if (!profile.exists || !roles.includes(profile.data()?.role)) {
      await subscription.ref.delete();
      result.removed += 1;
      continue;
    }
    result.targeted += 1;
    try {
      await messaging.send({
        token,
        data: {
          eventId,
          expiresAt: expiresAt.toISOString(),
          title: 'SANTAP: Uji notifikasi admin',
          body: 'Notifikasi paksa dari administrator. Jika Anda melihat ini, push SANTAP berfungsi.',
        },
        webpush: { headers: { TTL: '600' } },
      });
      result.sent += 1;
    } catch (error) {
      result.failed += 1;
      if (['messaging/registration-token-not-registered', 'messaging/invalid-registration-token'].includes(error.code)) {
        await subscription.ref.delete();
        result.removed += 1;
      }
    }
  }
  return result;
}

export function startPushWorker() {
  let running = false;
  const tick = async () => {
    if (running) return;
    running = true;
    try { const { db } = firebase(); await dispatchClosingPush(db, getMessaging(), new Date()); }
    catch (error) { console.error('Closing push worker:', error.message); }
    finally { running = false; }
  };
  tick();
  return setInterval(tick, 15000);
}
