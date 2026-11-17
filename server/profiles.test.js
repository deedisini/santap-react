import test from 'node:test';
import assert from 'node:assert/strict';
import { updateStudentProfile } from './profiles.js';

const input = { nim: '123', name: ' Updated ', faculty: ' Informatika ', residence: 'Penghuni Asrama' };
function fixture({ sql = false, failBatch = false, failCommit = false } = {}) {
  const docs = new Map([
    ['users/student', { nim: '123', name: 'Account name', faculty: 'Account faculty', residence: 'Non-penghuni', role: 'Mahasiswa' }],
    ['students/123', { nim: '123', name: 'Master name', faculty: 'Master faculty', residence: 'Non-penghuni', email: 'student@example.com' }],
  ]);
  const initial = structuredClone(docs);
  const calls = { batch: 0, rollback: 0, release: 0, update: 0 };
  const ref = key => ({ key, async get() {
    const data = structuredClone(docs.get(key));
    return { exists: !!data, ref: this, data: () => data };
  } });
  const db = {
    collection(name) { return {
      doc: id => ref(`${name}/${id}`),
      where: () => ({ get: async () => ({ docs: [await ref('users/student').get()] }) }),
    }; },
    batch() {
      const updates = [];
      return { update(reference, values) { updates.push([reference.key, values]); }, async commit() {
        calls.batch++;
        if (failBatch) throw new Error('Firestore unavailable');
        updates.forEach(([key, values]) => docs.set(key, { ...docs.get(key), ...values }));
      } };
    },
  };
  const connection = {
    async beginTransaction() {},
    async execute(query) {
      if (query.startsWith('SELECT')) return [[{ ...initial.get('students/123'), name: 'SQL name', faculty: 'SQL faculty' }]];
      calls.update++;
      return [{}];
    },
    async commit() { if (failCommit) throw new Error('SQL commit failed'); },
    async rollback() { calls.rollback++; },
    release() { calls.release++; },
  };
  return { db, pool: sql ? { getConnection: async () => connection } : null, docs, initial, calls };
}

test('profile update trims fields and updates master and linked user without changing identity', async () => {
  const f = fixture();
  await updateStudentProfile(input, f.db, f.pool);
  for (const value of f.docs.values()) {
    assert.equal(value.name, 'Updated');
    assert.equal(value.faculty, 'Informatika');
    assert.equal(value.residence, 'Penghuni Asrama');
    assert.equal(value.nim, '123');
  }
  assert.equal(f.docs.get('users/student').role, 'Mahasiswa');
  assert.equal(f.docs.get('students/123').email, 'student@example.com');
});

test('invalid SQL profile update does not overwrite unchanged Firestore profiles', async () => {
  const f = fixture({ sql: true });
  await assert.rejects(updateStudentProfile({ ...input, name: ' ' }, f.db, f.pool), { code: 'profile_required' });
  assert.deepEqual(f.docs, f.initial);
  assert.equal(f.calls.batch, 0);
  assert.equal(f.calls.update, 0);
  assert.equal(f.calls.rollback, 1);
  assert.equal(f.calls.release, 1);
});

test('failed Firestore batch rolls back SQL without issuing a spurious restore batch', async () => {
  const f = fixture({ sql: true, failBatch: true });
  await assert.rejects(updateStudentProfile(input, f.db, f.pool), /Firestore unavailable/);
  assert.deepEqual(f.docs, f.initial);
  assert.equal(f.calls.batch, 1);
  assert.equal(f.calls.rollback, 1);
  assert.equal(f.calls.release, 1);
});

test('failed SQL commit restores each Firestore document from its own snapshot', async () => {
  const f = fixture({ sql: true, failCommit: true });
  await assert.rejects(updateStudentProfile(input, f.db, f.pool), /SQL commit failed/);
  assert.deepEqual(f.docs, f.initial);
  assert.equal(f.calls.batch, 2);
  assert.equal(f.calls.rollback, 1);
  assert.equal(f.calls.release, 1);
});
