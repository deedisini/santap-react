import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
export const roles = ['Mahasiswa', 'Staff', 'Supervisor', 'Head', 'Admin'];
export function firebase() {
  const app = getApps()[0] || initializeApp({ credential: applicationDefault(), projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID });
  return { auth: getAuth(app), db: getFirestore(app) };
}
export const fail = (status, code, message) => Object.assign(new Error(message), { status, code });
export function requireRole(identity, allowed) {
  if (!allowed.includes(identity.role)) throw fail(403, 'forbidden', 'Akses ditolak.');
}
export async function authenticate(request, services = firebase()) {
  const match = /^Bearer (\S+)$/i.exec(request.headers.authorization || '');
  if (!match) throw fail(401, 'unauthorized', 'Firebase ID token diperlukan.');
  let token;
  try { token = await services.auth.verifyIdToken(match[1], true); }
  catch { throw fail(401, 'unauthorized', 'Token tidak valid atau kedaluwarsa.'); }
  const profile = await services.db.collection('users').doc(token.uid).get();
  if (!profile.exists || !roles.includes(profile.data().role)) throw fail(403, 'profile_required', 'Profil pengguna belum tersedia.');
  return { ...profile.data(), uid: token.uid };
}
