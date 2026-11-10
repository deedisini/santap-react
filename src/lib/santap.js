import {
  addDoc, collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, serverTimestamp,
  updateDoc, where, writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { todayKey } from "../utils/format";

const today = todayKey;

export function subscribeCollection(name, onData, onError, constraints = []) {
  if (!db) return () => {};
  const q = query(collection(db, name), ...constraints);
  return onSnapshot(q, (snapshot) => onData(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))), onError);
}

export function subscribeUserProfile(uid, onData, onError) {
  if (!db || !uid) return () => {};
  return onSnapshot(doc(db, "users", uid), (snapshot) => onData(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null), onError);
}

export async function findStudentByNim(nim) {
  if (!db) return null;
  const snapshot = await getDoc(doc(db, "students", nim));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export async function createQueueEntry({ nim, periodId, studentName }) {
  if (!db) throw new Error("Firebase no está configurado.");
  return addDoc(collection(db, "queues"), { nim, periodId, studentName, status: "waiting", joinedAt: serverTimestamp(), date: today() });
}

export async function recordMeal({ nim, periodId, period, staffUid, staffName, studentName }) {
  if (!db) throw new Error("Firebase no está configurado.");
  const verificationToken = crypto.randomUUID();
  const record = await addDoc(collection(db, "mealRecords"), {
    nim, periodId, period, staffUid, staffName, studentName, verificationToken,
    date: today(), time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false }), createdAt: serverTimestamp(),
  });
  const waiting = query(collection(db, "queues"), where("nim", "==", nim), where("periodId", "==", periodId), where("status", "==", "waiting"));
  const waitingSnapshot = await getDocs(waiting);
  const batch = writeBatch(db);
  waitingSnapshot.docs.forEach((item) => batch.update(item.ref, { status: "completed", completedAt: serverTimestamp(), recordId: record.id }));
  await batch.commit();
  return { id: record.id, nim, periodId, period, studentName, verificationToken };
}

export async function setQueueStatus(id, status, recordId = null) {
  if (!db) throw new Error("Firebase no está configurado.");
  await updateDoc(doc(db, "queues", id), { status, ...(recordId ? { recordId } : {}) });
}

export async function saveMealPeriod(periodId, values) {
  if (!db) throw new Error("Firebase no está configurado.");
  await updateDoc(doc(db, "mealPeriods", periodId), values);
}
