import { useEffect, useState } from 'react';
import { serviceRequest } from '../lib/serviceApi.js';
import { validateOperations } from '../../shared/operations.js';

export default function OperationsSettings({ config, user, demoMode, onDemoChange }) {
  const [draft, setDraft] = useState(config);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => setDraft(config), [config]);
  const update = (id, key, value) => setDraft(old => ({ ...old, schedules: { ...old.schedules, [id]: { ...old.schedules[id], [key]: value } } }));
  async function save(event) {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      const valid = validateOperations(draft);
      if (demoMode) onDemoChange(valid);
      else await serviceRequest('/api/admin/operations', valid, user);
      setMessage(demoMode ? 'Jadwal demo diperbarui untuk sesi ini.' : 'Pengaturan tersimpan.');
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  return <section className="panel"><h2>Jadwal layanan dan Sabat</h2><p>Semua waktu menggunakan WITA (Asia/Makassar). Perubahan jadwal berlaku untuk seluruh layanan.</p>
    <form className="stack" onSubmit={save}>
      <fieldset disabled={busy}><legend>Jam operasional</legend>{Object.entries(draft.schedules).map(([id, item]) => <div className="schedule-row" key={id}><b>{item.label}</b>{Object.entries({ open: 'Buka', close: 'Tutup', ...(id === 'evening' ? { weekendOpen: 'Buka Jumat–Sabtu', weekendClose: 'Tutup Jumat–Sabtu' } : {}) }).map(([key, label]) => <label key={key}>{label}<input type="time" required value={item[key]} onChange={e => update(id, key, e.target.value)} /></label>)}</div>)}</fieldset>
      <fieldset disabled={busy}><legend>Tema Sabat (opsional)</legend><label className="sabbath-toggle"><input type="checkbox" checked={draft.sabbath.enabled} onChange={e => setDraft(old => ({ ...old, sabbath: { ...old.sabbath, enabled: e.target.checked } }))} /> Aktifkan tema Sabat — Jumat 18.00 sampai Sabtu 18.00 WITA</label></fieldset>
      <button className="button primary" disabled={busy}>{busy ? 'Menyimpan...' : 'Simpan pengaturan'}</button><p role="status">{message}</p>
    </form></section>;
}
