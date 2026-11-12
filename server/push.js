import { createHash } from 'node:crypto';
import { getMessaging } from 'firebase-admin/messaging';
import { firebase, requireRole, fail } from './auth.js';
import { readOperations } from './operations.js';
import { periodWindow } from '../shared/operations.js';
import { sqlPool } from './database.js';

export async function registerPush(db, identity, data) {
  requireRole(identity, ['Supervisor', 'Head']);
  if (typeof data.token !== 'string' || data.token.length < 20 || data.token.length > 4096) throw fail(400, 'invalid_token', 'Token notifikasi tidak valid.');
  const key = createHash('sha256').update(data.token).digest('hex');
  const ref = db.collection('pushSubscriptions').doc(key);
  if (data.enabled === false) {
    const existing = await ref.get();
    if (existing.exists && existing.data().uid === identity.uid) await ref.delete();
  } else await ref.set({ uid: identity.uid, token: data.token, updatedAt: new Date() });
  return { ok: true };
}

export async function dispatchClosingPush(db, messaging, now = new Date(), pool = null) {
  const config = await readOperations(db);
  const windows = Object.keys(config.schedules).map(id => periodWindow(id, now, config)).filter(window => window.warning);
  if (!windows.length) return;
  const subscriptions = await db.collection('pushSubscriptions').get();
  for (const window of windows) {
    let pausedDate;
    if (pool) {
      const [periods] = await pool.execute('SELECT paused_date AS pausedDate FROM meal_periods WHERE id = ?', [window.id]);
      pausedDate = periods[0]?.pausedDate;
    } else {
      const period = await db.collection('mealPeriods').doc(window.id).get();
      pausedDate = period.data()?.pausedDate;
    }
    if (pausedDate === window.date) continue;
    for (const subscription of subscriptions.docs) {
      const { uid, token } = subscription.data();
      const profile = await db.collection('users').doc(uid).get();
      if (!['Supervisor', 'Head'].includes(profile.data()?.role)) { await subscription.ref.delete(); continue; }
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

export function startPushWorker() {
  let running = false;
  const tick = async () => {
    if (running) return;
    running = true;
    try { const { db } = firebase(); await dispatchClosingPush(db, getMessaging(), new Date(), process.env.VITE_SQL_API_URL?.trim() ? sqlPool() : null); }
    catch (error) { console.error('Closing push worker:', error.message); }
    finally { running = false; }
  };
  tick();
  return setInterval(tick, 15000);
}
