import { randomBytes } from 'node:crypto';
import { fail, roles } from './auth.js';
import { invite, validEmail } from './email.js';
export function validateUser(input) {
  const profile = {};
  for (const key of ['email', 'name', 'role', 'nim', 'nip', 'faculty', 'residence']) profile[key] = typeof input[key] === 'string' ? input[key].trim() : '';
  profile.email = profile.email.toLowerCase();
  if (!profile.name || profile.name.length > 120 || !roles.includes(profile.role)) throw fail(400, 'invalid_user', 'Nama atau peran tidak valid.');
  if (profile.role === 'Mahasiswa') {
    if (!/^[A-Za-z0-9_-]{1,30}$/.test(profile.nim) || !profile.faculty || profile.faculty.length > 120 || !['Penghuni Asrama', 'Non-penghuni'].includes(profile.residence)) throw fail(400, 'invalid_student', 'NIM, fakultas, dan tempat tinggal wajib diisi dengan benar.');
    profile.nip = '';
  } else {
    if (!/^[A-Za-z0-9_-]{1,30}$/.test(profile.nip)) throw fail(400, 'invalid_staff_id', 'NIP wajib diisi dengan benar.');
    profile.nim = ''; profile.faculty = ''; profile.residence = '';
  }
  const identifier = profile.role === 'Mahasiswa' ? profile.nim : profile.nip;
  const domain = {
    Mahasiswa: 'student.unklab.ac.id',
    Staff: 'staffdining.unklab.ac.id',
    Supervisor: 'supervisordining.unklab.ac.id',
    Head: 'kepaladining.unklab.ac.id',
    Admin: 'admin.unklab.ac.id',
  }[profile.role];
  const expectedEmail = `${identifier}@${domain}`.toLowerCase();
  if (!validEmail(profile.email) || profile.email !== expectedEmail) throw fail(400, 'invalid_email_format', `Email ${profile.role} harus menggunakan format ${identifier}@${domain}.`);
  return profile;
}
export async function createAccount(input, { auth, db, pool, sendInvite = invite }) {
  const profile = validateUser(input);
  let user, connection, firestoreCreated = false, studentCreated = false;
  const student = profile.role === 'Mahasiswa';
  try {
    // Unique SQL key / Firestore create preconditions arbitrate concurrent NIM claims.
    if (student && pool) {
      connection = await pool.getConnection();
      await connection.beginTransaction();
      const [existing] = await connection.execute('SELECT nim, name, faculty, residence, email FROM students WHERE nim = ? FOR UPDATE', [profile.nim]);
      if (existing.length) {
        if (existing[0].email.trim().toLowerCase() !== profile.email) throw fail(409, 'nim_exists', 'NIM terdaftar dengan email berbeda.');
        Object.assign(profile, existing[0], { email: profile.email });
      } else {
        await connection.execute('INSERT INTO students (nim, name, faculty, residence, email) VALUES (?, ?, ?, ?, ?)', [profile.nim, profile.name, profile.faculty, profile.residence, profile.email]);
      }
    }
    user = await auth.createUser({ email: profile.email, displayName: profile.name, password: randomBytes(48).toString('base64url') });
    await db.runTransaction(async transaction => {
      studentCreated = false;
      if (student) {
        // A server-only claim prevents multiple accounts linking the same NIM.
        const claim = db.collection('studentAccounts').doc(profile.nim);
        const existingClaim = await transaction.get(claim);
        if (existingClaim.exists) throw fail(409, 'nim_exists', 'NIM sudah memiliki akun.');
        if (!pool) {
          const ref = db.collection('students').doc(profile.nim);
          const existing = await transaction.get(ref);
          if (existing.exists) {
            const data = existing.data();
            if (data.email?.trim().toLowerCase() !== profile.email) throw fail(409, 'nim_exists', 'NIM terdaftar dengan email berbeda.');
            for (const key of ['name', 'faculty', 'residence']) profile[key] = data[key];
          } else { transaction.create(ref, profile); studentCreated = true; }
        }
        transaction.create(claim, { uid: user.uid, email: profile.email });
      }
      transaction.create(db.collection('users').doc(user.uid), { ...profile, createdAt: new Date().toISOString() });
    });
    firestoreCreated = true;
    if (connection) await connection.commit();
  } catch (error) {
    const cleanup = [];
    if (connection) cleanup.push(() => connection.rollback());
    if (firestoreCreated) cleanup.push(async () => {
      const batch = db.batch();
      batch.delete(db.collection('users').doc(user.uid));
      if (studentCreated) batch.delete(db.collection('students').doc(profile.nim));
      if (student) batch.delete(db.collection('studentAccounts').doc(profile.nim));
      await batch.commit();
    });
    if (user) cleanup.push(() => auth.deleteUser(user.uid));
    let cleanupFailed = false;
    for (const action of cleanup) { try { await action(); } catch { cleanupFailed = true; } }
    if (cleanupFailed) throw fail(500, 'rollback_failed', `Pembersihan akun gagal; administrator server perlu memeriksa UID ${user?.uid || '(belum dibuat)'}.`);
    if (error.code === 'auth/email-already-exists') throw fail(409, 'email_exists', 'Email sudah terdaftar.');
    if (error.code === 'ER_DUP_ENTRY' || error.code === 6 || error.code === 'already-exists') throw fail(409, 'nim_exists', 'NIM sudah terdaftar.');
    throw error;
  } finally { connection?.release(); }
  try {
    await sendInvite(auth, user.uid);
    return { uid: user.uid, email: profile.email, role: profile.role, created: true, invitationSent: true, code: 'created', message: 'Akun dibuat dan undangan dikirim.' };
  } catch {
    return { uid: user.uid, email: profile.email, role: profile.role, created: true, invitationSent: false, code: 'invitation_failed', message: 'Akun dibuat, tetapi undangan gagal dikirim. Kirim ulang undangan.' };
  }
}
