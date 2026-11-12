import crypto from 'node:crypto';
import { DEFAULT_OPERATIONS, assertServing, localParts } from '../shared/operations.js';
import { fail, requireRole } from './auth.js';

export async function readOperations(db) {
  const snapshot = await db.collection('settings').doc('operations').get();
  return snapshot.exists ? snapshot.data() : DEFAULT_OPERATIONS;
}

export function checkStudent(student) {
  if (!student || !['nim', 'name', 'faculty', 'email'].every(key => typeof student[key] === 'string' && student[key].trim()) || !['Penghuni Asrama', 'Non-penghuni'].includes(student.residence)) throw fail(409, 'profile_required', 'Profil mahasiswa belum lengkap.');
}

export async function firestoreOperation(db, identity, action, data, now) {
  const clock = () => now || new Date();
  if (!['queue', 'meal', 'cancel', 'period'].includes(action)) throw fail(404, 'not_found', 'Operasi tidak ditemukan.');
  if (action !== 'queue') requireRole(identity, ['Staff', 'Supervisor', 'Head', 'Admin']);
  if (action === 'queue' && identity.role === 'Mahasiswa' && data.nim !== identity.nim) throw fail(403, 'forbidden', 'NIM tidak sesuai profil.');
  if (action === 'cancel') {
    const ref = db.collection('queues').doc(String(data.id));
    return db.runTransaction(async tx => {
      const queue = await tx.get(ref);
      if (!queue.exists || queue.data().status !== 'waiting') throw fail(409, 'invalid_queue', 'Antrean tidak dapat dibatalkan.');
      tx.update(ref, { status: 'cancelled' });
      if (queue.data().publicId) tx.set(db.collection('publicQueue').doc(queue.data().publicId), { status: 'cancelled' }, { merge: true });
      return { ok: true };
    });
  }
  if (!Object.keys(DEFAULT_OPERATIONS.schedules).includes(data.periodId)) throw fail(400, 'invalid_period', 'Periode tidak valid.');
  const periodRef = db.collection('mealPeriods').doc(data.periodId);
  if (action === 'period') {
    if (typeof data.active !== 'boolean') throw fail(400, 'invalid_period', 'Status tidak valid.');
    const config = await readOperations(db);
    if (data.active) assertServing(data.periodId, clock(), config);
    await periodRef.set({ pausedDate: data.active ? null : localParts(clock()).date }, { merge: true });
    return { ok: true };
  }
  if (typeof data.nim !== 'string' || !/^[A-Za-z0-9_-]{1,30}$/.test(data.nim)) throw fail(400, 'invalid_nim', 'NIM tidak valid.');
  return db.runTransaction(async tx => {
    const [settings, period, student] = await Promise.all([tx.get(db.collection('settings').doc('operations')), tx.get(periodRef), tx.get(db.collection('students').doc(data.nim))]);
    const config = settings.exists ? settings.data() : DEFAULT_OPERATIONS;
    const window = assertServing(data.periodId, clock(), config, period.data()?.pausedDate);
    if (data.expectedDate !== undefined && data.expectedDate !== window.date) throw fail(409, 'expired_pending', 'Identifikasi berasal dari tanggal yang berbeda dan perlu ditinjau petugas.');
    const studentData = student.exists ? { ...student.data(), nim: data.nim } : null;
    checkStudent(studentData);
    const [meals, queues] = await Promise.all([
      tx.get(db.collection('mealRecords').where('nim', '==', data.nim).where('date', '==', window.date)),
      tx.get(db.collection('queues').where('nim', '==', data.nim).where('date', '==', window.date)),
    ]);
    if (meals.docs.some(doc => doc.data().periodId === data.periodId || doc.data().period === window.label)) throw fail(409, 'duplicate_meal', 'Pengambilan sudah tercatat.');
    const waiting = queues.docs.filter(doc => doc.data().periodId === data.periodId && doc.data().status === 'waiting');
    const key = `${window.date}_${data.periodId}_${data.nim}`;
    const servedAt = clock();
    assertServing(data.periodId, servedAt, config, period.data()?.pausedDate);
    if (action === 'queue') {
      if (waiting.length) throw fail(409, 'duplicate_queue', 'Mahasiswa sudah berada dalam antrean.');
      const publicId = crypto.createHash('sha256').update(key).digest('hex');
      tx.set(db.collection('queues').doc(key), { nim: data.nim, periodId: data.periodId, date: window.date, studentName: studentData.name, status: 'waiting', joinedAt: servedAt, publicId });
      tx.set(db.collection('publicQueue').doc(publicId), { periodId: data.periodId, date: window.date, status: 'waiting', joinedAt: servedAt });
      return { id: key, ok: true };
    }
    const record = { nim: data.nim, periodId: data.periodId, period: window.label, studentName: studentData.name, staffUid: identity.uid, staffName: identity.name || identity.uid, verificationToken: crypto.randomUUID(), date: window.date, time: localParts(servedAt).clock.slice(0, 5), createdAt: servedAt };
    tx.create(db.collection('mealRecords').doc(key), record);
    waiting.forEach(doc => {
      tx.update(doc.ref, { status: 'completed', completedAt: servedAt, recordId: key });
      if (doc.data().publicId) tx.set(db.collection('publicQueue').doc(doc.data().publicId), { status: 'completed' }, { merge: true });
    });
    return { ...record, id: key };
  });
}
