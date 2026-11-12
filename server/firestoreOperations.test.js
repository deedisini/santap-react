import test from 'node:test';
import assert from 'node:assert/strict';
import { firestoreOperation } from './operations.js';

function database() {
  const values = new Map([['students/123', { nim: '123', name: 'Student', faculty: 'Science', residence: 'Non-penghuni', email: 'test@example.com' }]]);
  function reference(path) { return { path, id: path.split('/').pop(), get: async () => snapshot(path) }; }
  function snapshot(path) { return { exists: values.has(path), ref: reference(path), id: path.split('/').pop(), data: () => values.get(path) }; }
  function collection(name, filters = []) { return { name, filters, doc: id => reference(`${name}/${id}`), where: (key, op, value) => collection(name, [...filters, [key, value]]) }; }
  let serial = Promise.resolve();
  return { values, collection,
    runTransaction(fn) {
      const operation = serial.then(async () => {
        const writes = [];
        const result = await fn({
          async get(ref) {
            if (ref.path) return snapshot(ref.path);
            return { docs: [...values.keys()].filter(path => path.startsWith(`${ref.name}/`) && ref.filters.every(([key, value]) => values.get(path)[key] === value)).map(snapshot) };
          },
          create(ref, value) { if (values.has(ref.path)) throw new Error('Duplicate identity'); writes.push(() => values.set(ref.path, value)); },
          set(ref, value, options) { writes.push(() => values.set(ref.path, options?.merge ? { ...values.get(ref.path), ...value } : value)); },
          update(ref, value) { writes.push(() => values.set(ref.path, { ...values.get(ref.path), ...value })); },
        });
        writes.forEach(write => write());
        return result;
      });
      serial = operation.catch(() => {});
      return operation;
    },
  };
}
const staff = { role: 'Staff', uid: 'verified-staff', name: 'Verified Staff' };
const now = new Date('2026-11-12T07:00:00+08:00');
test('Firestore records once, completes same-day queue atomically, and hides identity in public queue', async () => {
  const db = database();
  await firestoreOperation(db, { role: 'Mahasiswa', uid: 'student', nim: '123' }, 'queue', { nim: '123', periodId: 'morning' }, now);
  const publicEntry = [...db.values].find(([path]) => path.startsWith('publicQueue/'))[1];
  assert.equal(publicEntry.nim, undefined);
  assert.equal(publicEntry.studentName, undefined);
  const results = await Promise.allSettled([1, 2].map(() => firestoreOperation(db, staff, 'meal', { nim: '123', periodId: 'morning', staffUid: 'forged' }, now)));
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  const meals = [...db.values].filter(([path]) => path.startsWith('mealRecords/'));
  assert.equal(meals.length, 1);
  assert.equal(meals[0][1].staffUid, 'verified-staff');
  assert.equal([...db.values].find(([path]) => path.startsWith('queues/'))[1].status, 'completed');
  assert.equal([...db.values].find(([path]) => path.startsWith('publicQueue/'))[1].status, 'completed');
});
test('Firestore rejects legacy duplicates and closed/incomplete profiles before any write', async () => {
  const db = database();
  await assert.rejects(firestoreOperation(db, staff, 'meal', { nim: '123', periodId: 'morning' }, new Date('2026-11-12T08:00:00+08:00')), { code: 'period_closed' });
  await assert.rejects(firestoreOperation(db, staff, 'meal', { nim: '123', periodId: 'morning', expectedDate: '2026-11-11' }, now), { code: 'expired_pending' });
  db.values.set('mealRecords/legacy', { nim: '123', date: '2026-11-12', period: 'Pagi' });
  await assert.rejects(firestoreOperation(db, staff, 'meal', { nim: '123', periodId: 'morning' }, now), { code: 'duplicate_meal' });
  db.values.delete('mealRecords/legacy');
  db.values.get('students/123').faculty = '';
  await assert.rejects(firestoreOperation(db, staff, 'meal', { nim: '123', periodId: 'morning' }, now), { code: 'profile_required' });
  assert.equal(db.values.size, 1);
});
