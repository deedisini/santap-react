import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_OPERATIONS, TIME_ZONE, activePeriod, assertServing, isSabbath, localParts, periodWindow, validateOperations } from '../shared/operations.js';
import { buildNotifications } from '../src/utils/closingNotifications.js';
import { loadPending, storePending } from '../src/lib/pendingScans.js';
import { sqlOperation } from './sqlOperations.js';
import { firestoreOperation } from './operations.js';

const at = value => new Date(`${value}+08:00`);
test('official hours are inclusive at opening and exclusive at closing on every weekday', () => {
  for (let day = 8; day <= 14; day++) {
    const date = `2026-11-${String(day).padStart(2, '0')}`;
    for (const [id, open, close] of [['morning', '05:30', '08:00'], ['afternoon', '11:30', '13:00'], ['evening', day >= 13 ? '16:30' : '17:00', day >= 13 ? '18:00' : '18:30']]) {
      assert.equal(periodWindow(id, at(`${date}T${open}:00`)).active, true);
      assert.equal(periodWindow(id, new Date(at(`${date}T${open}:00`) - 1)).active, false);
      assert.equal(periodWindow(id, new Date(at(`${date}T${close}:00`) - 1)).active, true);
      assert.equal(periodWindow(id, at(`${date}T${close}:00`)).active, false);
    }
  }
});
test('warning starts exactly ten minutes before closing and stops at closing', () => {
  for (const [id, date, warning, close] of [['morning', '2026-11-12', '07:50', '08:00'], ['afternoon', '2026-11-12', '12:50', '13:00'], ['evening', '2026-11-12', '18:20', '18:30'], ['evening', '2026-11-13', '17:50', '18:00'], ['evening', '2026-11-14', '17:50', '18:00']]) {
    const start = at(`${date}T${warning}:00`);
    assert.equal(buildNotifications([{ id }], new Date(start - 1)).length, 0);
    const notices = buildNotifications([{ id }], start);
    assert.equal(notices.length, 1);
    assert.equal(notices[0].id, buildNotifications([{ id }], new Date(+start + 1000))[0].id);
    assert.equal(buildNotifications([{ id }], at(`${date}T${close}:00`)).length, 0);
    assert.equal(buildNotifications([{ id, pausedDate: date }], start).length, 0);
    assert.equal(buildNotifications([{ id }], start, false).length, 0);
  }
});
test('local date and active period do not depend on machine timezone', () => {
  assert.equal(TIME_ZONE, 'Asia/Makassar');
  assert.equal(localParts(new Date('2026-11-12T16:01:00Z')).date, '2026-11-13');
  assert.equal(activePeriod(new Date('2026-11-13T08:30:00Z')).id, 'evening');
  assert.equal(activePeriod(at('2026-11-12T09:00:00')), null);
  assert.throws(() => assertServing('morning', at('2026-11-12T08:00:00'), DEFAULT_OPERATIONS), { code: 'period_closed' });
  assert.throws(() => assertServing('morning', at('2026-11-12T07:00:00'), DEFAULT_OPERATIONS, '2026-11-12'), { code: 'period_closed' });
});
test('configurable schedules validate overlap and preserve custom Sabbath windows', () => {
  const config = structuredClone(DEFAULT_OPERATIONS);
  config.schedules.morning.close = '08:15';
  config.sabbath = { enabled: true, windows: [{ start: '2026-11-13T17:43:00+08:00', end: '2026-11-14T17:44:00+08:00', source: 'Synthetic test fixture, not a local sunset observation' }] };
  validateOperations(config);
  assert.equal(isSabbath(at('2026-11-13T17:42:59'), config), false);
  assert.equal(isSabbath(at('2026-11-13T17:43:00'), config), true);
  assert.equal(isSabbath(at('2026-11-14T17:44:00'), config), false);
  assert.equal(isSabbath(at('2026-11-13T18:00:00')), true);
  config.sabbath.windows[0].source = '';
  assert.throws(() => validateOperations(config));
  config.sabbath.windows = [];
  config.schedules.morning.close = '12:00';
  assert.throws(() => validateOperations(config));
});
test('Sabbath defaults to recurring Friday 18:00 through Saturday 18:00 WITA', () => {
  for (const [time, expected] of [
    ['2026-11-12T18:00:00', false], ['2026-11-13T17:59:59', false],
    ['2026-11-13T18:00:00', true], ['2026-11-14T17:59:59', true],
    ['2026-11-14T18:00:00', false], ['2026-11-15T12:00:00', false],
    ['2026-11-20T18:00:00', true],
  ]) assert.equal(isSabbath(at(time)), expected, time);
  assert.equal(isSabbath(new Date('2026-11-13T10:00:00Z')), true);
  const config = structuredClone(DEFAULT_OPERATIONS);
  config.sabbath.enabled = false;
  assert.equal(isSabbath(at('2026-11-13T18:00:00'), config), false);
  config.sabbath.enabled = true;
  config.sabbath.startTime = '19:00';
  assert.equal(isSabbath(at('2026-11-13T18:00:00'), validateOperations(config)), false);
  config.sabbath.endTime = '25:00';
  assert.throws(() => validateOperations(config));
});
test('pending scans survive reload and are isolated by authenticated UID', () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
  const scan = { id: 'scan', nim: '123', periodId: 'morning', date: '2026-11-12' };
  storePending(storage, 'alice', [scan]);
  assert.deepEqual(loadPending(storage, 'alice'), [scan]);
  assert.deepEqual(loadPending(storage, 'bob'), []);
  values.set('santap-pending-scans-alice', '{broken');
  assert.deepEqual(loadPending(storage, 'alice'), []);
});
function sqlMock({ duplicate = false } = {}) {
  const calls = [];
  const connection = {
    async beginTransaction() {}, async commit() { calls.push('commit'); }, async rollback() { calls.push('rollback'); }, release() {},
    async execute(sql, params) {
      calls.push([sql, params]);
      if (sql.startsWith('SELECT id, paused_date')) return [[{ id: 'morning', pausedDate: null }]];
      if (sql.startsWith('SELECT * FROM students')) return [[{ nim: '123', name: 'Student', faculty: 'Science', email: 'test@example.com', residence: 'Non-penghuni' }]];
      if (sql.startsWith('SELECT id FROM meal_records')) return [duplicate ? [{ id: 1 }] : []];
      if (sql.startsWith('SELECT id FROM queues')) return [[]];
      return [{ insertId: 7, affectedRows: 1 }];
    },
  };
  return { calls, getConnection: async () => connection };
}
test('SQL backend rejects closed and duplicate requests before inserting a meal', async () => {
  const actor = { role: 'Staff', uid: 'staff', name: 'Staff' };
  const data = { nim: '123', periodId: 'morning' };
  const closed = sqlMock();
  await assert.rejects(sqlOperation(closed, actor, 'meal', data, DEFAULT_OPERATIONS, at('2026-11-12T08:00:00')), { code: 'period_closed' });
  const duplicate = sqlMock({ duplicate: true });
  await assert.rejects(sqlOperation(duplicate, actor, 'meal', data, DEFAULT_OPERATIONS, at('2026-11-12T07:00:00')), { code: 'duplicate_meal' });
  for (const pool of [closed, duplicate]) assert.equal(pool.calls.some(call => Array.isArray(call) && call[0].startsWith('INSERT')), false);
});
test('SQL persists authoritative WITA date, period label and staff identity', async () => {
  const pool = sqlMock();
  const result = await sqlOperation(pool, { role: 'Staff', uid: 'verified', name: 'Verified' }, 'meal', { nim: '123', periodId: 'morning', period: 'Forged', staffName: 'Forged' }, DEFAULT_OPERATIONS, at('2026-11-12T07:00:00'));
  assert.equal(result.period, 'Pagi');
  const insert = pool.calls.find(call => Array.isArray(call) && call[0].startsWith('INSERT'));
  assert.deepEqual(insert[1].slice(4, 6), ['verified', 'Verified']);
  assert.deepEqual(insert[1].slice(-2), ['2026-11-12', '07:00:00']);
});
test('SQL rejects pending identifications from a previous WITA date', async () => {
  const pool = sqlMock();
  await assert.rejects(sqlOperation(pool, { role: 'Staff', uid: 'staff' }, 'meal', { nim: '123', periodId: 'morning', expectedDate: '2026-11-11' }, DEFAULT_OPERATIONS, at('2026-11-12T07:00:00')), { code: 'expired_pending' });
  assert.equal(pool.calls.some(call => Array.isArray(call) && call[0].startsWith('INSERT')), false);
});
test('students cannot record meals, cancel queues or join for another NIM', async () => {
  const actor = { role: 'Mahasiswa', uid: 'student', nim: '123' };
  for (const action of ['meal', 'cancel', 'period']) {
    await assert.rejects(sqlOperation(null, actor, action, {}, DEFAULT_OPERATIONS), { status: 403 });
    await assert.rejects(firestoreOperation(null, actor, action, {}), { status: 403 });
  }
  await assert.rejects(firestoreOperation(null, actor, 'queue', { nim: '456' }), { status: 403 });
});
