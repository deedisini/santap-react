export const pendingKey = uid => `santap-pending-scans-${uid}`;
export function loadPending(storage, uid) {
  try {
    const rows = JSON.parse(storage.getItem(pendingKey(uid)) || '[]');
    return Array.isArray(rows) ? rows.filter(row => row && typeof row.id === 'string' && typeof row.nim === 'string' && typeof row.date === 'string' && typeof row.periodId === 'string').slice(0, 100) : [];
  } catch { return []; }
}
export function storePending(storage, uid, rows) {
  storage.setItem(pendingKey(uid), JSON.stringify(rows));
}
