import { useEffect, useRef, useState } from 'react';
import QrScanner from './QrScanner.jsx';
import { loadPending, storePending } from '../lib/pendingScans.js';
import { localParts, periodWindow } from '../../shared/operations.js';
import { serviceRequest } from '../lib/serviceApi.js';
import { createSqlMealRecord } from '../lib/sqlApi.js';

export default function PendingScans({ user, demoMode, students, periodId, config, useSqlData, onSaved }) {
  const [rows, setRows] = useState(() => loadPending(localStorage, user.uid));
  const [nim, setNim] = useState(''), [scanning, setScanning] = useState(false), [message, setMessage] = useState(''), [busy, setBusy] = useState(false);
  const synchronizing = useRef(false);
  function persist(next) { storePending(localStorage, user.uid, next); setRows(next); }
  function stage(value) {
    if (rows.length >= 100) { setMessage('Penyimpanan sementara penuh. Sinkronkan atau tinjau entri yang sudah ada.'); return; }
    let identity = value.trim();
    try { const parsed = JSON.parse(identity); if (parsed.type === 'santap.student') identity = parsed.nim; } catch { /* Raw barcode or NIM. */ }
    if (!/^[A-Za-z0-9_-]{1,30}$/.test(identity || '')) { setMessage('QR, barcode, atau NIM tidak valid.'); return; }
    const window = periodWindow(periodId, new Date(), config);
    if (!window?.active) { setMessage('Penyimpanan sementara hanya tersedia selama jadwal layanan.'); return; }
    if (!students.some(student => student.nim === identity)) { setMessage('NIM belum tersedia dalam data lokal perangkat ini.'); return; }
    if (rows.some(row => row.nim === identity && row.periodId === periodId && row.date === window.date)) { setMessage('Identifikasi sudah disimpan sementara.'); return; }
    try {
      persist([...rows, { id: crypto.randomUUID(), nim: identity, periodId, date: window.date, observedAt: new Date().toISOString(), status: 'Belum tersinkron' }]);
      setNim(''); setMessage('Identifikasi disimpan di perangkat. Ini belum menjadi catatan pengambilan final.');
    } catch { setMessage('Penyimpanan perangkat tidak tersedia. Data belum tersimpan.'); }
  }
  async function sync() {
    if (synchronizing.current || demoMode) return;
    synchronizing.current = true; setBusy(true);
    let pending = loadPending(localStorage, user.uid);
    try {
      for (const row of pending) {
        const window = periodWindow(row.periodId, new Date(), config);
        if (row.date !== localParts().date || !window?.active) {
          pending = pending.map(item => item.id === row.id ? { ...item, status: 'Periode sudah berakhir. Perlu peninjauan petugas; tidak dicatat otomatis.' } : item);
          continue;
        }
        try {
          if (useSqlData) await createSqlMealRecord({ nim: row.nim, periodId: row.periodId, expectedDate: row.date }, user);
          else await serviceRequest('/api/operations/meal', { nim: row.nim, periodId: row.periodId, expectedDate: row.date }, user);
          pending = pending.filter(item => item.id !== row.id);
        } catch (error) {
          pending = pending.map(item => item.id === row.id ? { ...item, status: error.message } : item);
        }
      }
      persist(pending); await onSaved();
      setMessage(pending.length ? 'Sebagian identifikasi belum tersinkron. Periksa status masing-masing.' : 'Sinkronisasi selesai.');
    } catch (error) { setMessage(error.message); }
    finally { synchronizing.current = false; setBusy(false); }
  }
  useEffect(() => {
    const online = () => sync();
    window.addEventListener('online', online);
    if (navigator.onLine && rows.length) online();
    return () => window.removeEventListener('online', online);
  }, [user, useSqlData, config, demoMode]);
  return <section className="panel"><h2>Identifikasi sementara saat jaringan bermasalah</h2><p>Data disimpan di perangkat dan belum membuktikan pengambilan. Server memvalidasi ulang saat sinkronisasi. Identifikasi dari periode yang sudah berakhir memerlukan peninjauan petugas.</p><form className="input-row" onSubmit={e => { e.preventDefault(); stage(nim); }}><label>NIM<input value={nim} onChange={e => setNim(e.target.value)} required disabled={busy} /></label><button className="button secondary" disabled={busy || rows.length >= 100}>Simpan sementara</button><button type="button" className="button secondary" disabled={busy} onClick={() => setScanning(true)}>Scan sementara</button></form>{scanning && <QrScanner onScan={value => { setScanning(false); stage(value); }} onClose={() => setScanning(false)} />}
    {rows.map(row => <div className="pending-row" key={row.id}><span>{row.nim} · {row.date} · {config.schedules[row.periodId]?.label}<br />{row.status}</span><button className="button secondary" disabled={busy} onClick={() => persist(rows.filter(item => item.id !== row.id))}>Hapus dari perangkat</button></div>)}<button className="button primary" disabled={busy || !rows.length || demoMode} onClick={sync}>{busy ? 'Menyinkronkan...' : 'Sinkronkan sekarang'}</button><p role="status">{message}</p>
  </section>;
}
