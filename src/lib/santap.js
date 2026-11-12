import { collection, doc, getDoc, onSnapshot, query } from 'firebase/firestore';
import { db } from './firebase';

export function subscribeCollection(name, onData, onError, constraints = []) {
  if (!db) return () => {};
  return onSnapshot(query(collection(db, name), ...constraints), snapshot => {
    const rows = snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
    if (name === 'queues' || name === 'publicQueue') rows.sort((a, b) => (a.joinedAt?.toMillis?.() || 0) - (b.joinedAt?.toMillis?.() || 0) || String(a.id).localeCompare(String(b.id)));
    onData(rows);
  }, onError);
}

export function subscribeUserProfile(uid, onData, onError) {
  if (!db || !uid) return () => {};
  return onSnapshot(doc(db, 'users', uid), snapshot => onData(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null), onError);
}

export async function findStudentByNim(nim) {
  if (!db) return null;
  const snapshot = await getDoc(doc(db, 'students', nim));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}
