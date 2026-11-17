import { fail } from './auth.js';
import { checkStudent } from './operations.js';
export async function updateStudentProfile(input, db) {
  if (typeof input.nim !== 'string' || !/^[A-Za-z0-9_-]{1,30}$/.test(input.nim)) throw fail(400, 'invalid_nim', 'NIM tidak valid.');
  const values = Object.fromEntries(['name', 'faculty', 'residence'].map(key => [key, typeof input[key] === 'string' ? input[key].trim() : '']));
  if (values.name.length > 120 || values.faculty.length > 120) throw fail(400, 'invalid_profile', 'Nama atau fakultas terlalu panjang.');
  const profiles = await db.collection('users').where('nim', '==', input.nim).get();
  const studentRef = db.collection('students').doc(input.nim);
  const student = await studentRef.get();
  const previous = student.exists ? { ...student.data(), nim: input.nim } : null;
  if (!previous) throw fail(404, 'student_not_found', 'Mahasiswa tidak ditemukan.');
  checkStudent({ ...previous, ...values });
  const batch = db.batch();
  profiles.docs.forEach(doc => batch.update(doc.ref, values));
  if (student.exists) batch.update(studentRef, values);
  try {
    await batch.commit();
  } catch (error) { throw error; }
}
