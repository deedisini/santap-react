import crypto from 'node:crypto';
import { assertServing, localParts } from '../shared/operations.js';
import { fail, requireRole } from './auth.js';
import { checkStudent } from './operations.js';

export async function sqlOperation(pool, identity, action, data, config, now) {
  const clock = () => now || new Date();
  if (!['queue', 'meal', 'cancel', 'period'].includes(action)) throw fail(404, 'not_found', 'Operasi tidak ditemukan.');
  if (action !== 'queue') requireRole(identity, ['Staff', 'Supervisor', 'Head', 'Admin']);
  if (action === 'queue' && identity.role === 'Mahasiswa' && data.nim !== identity.nim) throw fail(403, 'forbidden', 'NIM tidak sesuai profil.');
  if (action === 'cancel') {
    const [result] = await pool.execute("UPDATE queues SET status = 'cancelled' WHERE id = ? AND status = 'waiting'", [data.id]);
    if (!result.affectedRows) throw fail(409, 'invalid_queue', 'Antrean tidak dapat dibatalkan.');
    return { ok: true };
  }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [periods] = await connection.execute('SELECT id, paused_date AS pausedDate FROM meal_periods WHERE id = ? FOR UPDATE', [data.periodId]);
    if (!periods.length) throw fail(400, 'invalid_period', 'Periode tidak valid.');
    if (action === 'period') {
      if (typeof data.active !== 'boolean') throw fail(400, 'invalid_period', 'Status tidak valid.');
      if (data.active) assertServing(data.periodId, clock(), config);
      await connection.execute('UPDATE meal_periods SET active = ?, paused_date = ? WHERE id = ?', [data.active, data.active ? null : localParts(clock()).date, data.periodId]);
      await connection.commit();
      return { ok: true };
    }
    const window = assertServing(data.periodId, clock(), config, periods[0].pausedDate);
    if (data.expectedDate !== undefined && data.expectedDate !== window.date) throw fail(409, 'expired_pending', 'Identifikasi berasal dari tanggal yang berbeda dan perlu ditinjau petugas.');
    if (typeof data.nim !== 'string' || !/^[A-Za-z0-9_-]{1,30}$/.test(data.nim)) throw fail(400, 'invalid_nim', 'NIM tidak valid.');
    const [students] = await connection.execute('SELECT * FROM students WHERE nim = ? FOR UPDATE', [data.nim]);
    checkStudent(students[0]);
    const [duplicates] = await connection.execute('SELECT id FROM meal_records WHERE nim = ? AND period_id = ? AND served_date = ? FOR UPDATE', [data.nim, data.periodId, window.date]);
    if (duplicates.length) throw fail(409, 'duplicate_meal', 'Pengambilan sudah tercatat.');
    const [waiting] = await connection.execute("SELECT id FROM queues WHERE nim = ? AND period_id = ? AND DATE(joined_at) = ? AND status = 'waiting' FOR UPDATE", [data.nim, data.periodId, window.date]);
    assertServing(data.periodId, clock(), config, periods[0].pausedDate);
    if (action === 'queue') {
      if (waiting.length) throw fail(409, 'duplicate_queue', 'Mahasiswa sudah berada dalam antrean.');
      const [result] = await connection.execute('INSERT INTO queues (nim, period_id, student_name, joined_at) VALUES (?, ?, ?, ?)', [data.nim, data.periodId, students[0].name, `${window.date} ${localParts(clock()).clock}`]);
      await connection.commit();
      return { id: result.insertId, ok: true };
    }
    const token = crypto.randomUUID();
    const [result] = await connection.execute('INSERT INTO meal_records (nim, period_id, period_label, student_name, staff_uid, staff_name, verification_token, served_date, served_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [data.nim, data.periodId, window.label, students[0].name, identity.uid, identity.name || identity.uid, token, window.date, localParts(clock()).clock]);
    await connection.execute("UPDATE queues SET status = 'completed', completed_at = ?, record_id = ? WHERE nim = ? AND period_id = ? AND DATE(joined_at) = ? AND status = 'waiting'", [`${window.date} ${localParts(clock()).clock}`, result.insertId, data.nim, data.periodId, window.date]);
    await connection.commit();
    return { id: result.insertId, nim: data.nim, periodId: data.periodId, period: window.label, verificationToken: token };
  } catch (error) {
    await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') throw fail(409, 'duplicate_meal', 'Pengambilan sudah tercatat.');
    throw error;
  } finally { connection.release(); }
}
