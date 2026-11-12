import { fail } from './auth.js';
import { checkStudent } from './operations.js';
export async function updateStudentProfile(input, db, pool) {
  if (typeof input.nim !== 'string' || !/^[A-Za-z0-9_-]{1,30}$/.test(input.nim)) throw fail(400, 'invalid_nim', 'NIM tidak valid.');
  const values = Object.fromEntries(['name', 'faculty', 'residence'].map(key => [key, typeof input[key] === 'string' ? input[key].trim() : '']));
  if (values.name.length > 120 || values.faculty.length > 120) throw fail(400, 'invalid_profile', 'Nama atau fakultas terlalu panjang.');
  const profiles = await db.collection('users').where('nim', '==', input.nim).get();
  const studentRef = db.collection('students').doc(input.nim);
  const student = await studentRef.get();
  let connection, previous;
  try {
    if (pool) {
      connection = await pool.getConnection();
      await connection.beginTransaction();
      const [rows] = await connection.execute('SELECT * FROM students WHERE nim = ? FOR UPDATE', [input.nim]);
      previous = rows[0];
    } else previous = student.exists ? { ...student.data(), nim: input.nim } : null;
    if (!previous) throw fail(404, 'student_not_found', 'Mahasiswa tidak ditemukan.');
    checkStudent({ ...previous, ...values });
    if (connection) await connection.execute('UPDATE students SET name = ?, faculty = ?, residence = ? WHERE nim = ?', [values.name, values.faculty, values.residence, input.nim]);
    const batch = db.batch();
    profiles.docs.forEach(doc => batch.update(doc.ref, values));
    if (student.exists) batch.update(studentRef, values);
    await batch.commit();
    if (connection) await connection.commit();
  } catch (error) {
    if (connection) {
      await connection.rollback();
      if (previous) {
        const restore = db.batch();
        const oldValues = Object.fromEntries(Object.keys(values).map(key => [key, previous[key]]));
        profiles.docs.forEach(doc => restore.update(doc.ref, oldValues));
        if (student.exists) restore.update(studentRef, oldValues);
        await restore.commit();
      }
    }
    throw error;
  } finally { connection?.release(); }
}
