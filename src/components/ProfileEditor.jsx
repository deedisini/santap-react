import { useState } from 'react';
import { serviceRequest } from '../lib/serviceApi.js';
export default function ProfileEditor({ user, students, demoMode, onSaved }) {
  const [form, setForm] = useState(null), [message, setMessage] = useState(''), [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      if (!demoMode) await serviceRequest('/api/admin/students/update', form, user);
      await onSaved(form);
      setMessage(demoMode ? 'Profil demo diperbarui.' : 'Profil diperbarui.');
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  return <section className="panel"><h2>Perbarui profil mahasiswa</h2><label>Mahasiswa<select value={form?.nim || ''} disabled={busy} onChange={e => setForm(students.find(s => s.nim === e.target.value) || null)}><option value="">Pilih mahasiswa</option>{students.map(s => <option key={s.nim} value={s.nim}>{s.nim} · {s.name}</option>)}</select></label>{form && <form className="stack" onSubmit={submit}>{[['name', 'Nama'], ['faculty', 'Fakultas']].map(([key, label]) => <label key={key}>{label}<input required maxLength={120} value={form[key]} disabled={busy} onChange={e => setForm(old => ({ ...old, [key]: e.target.value }))} /></label>)}<label>Status asrama<select value={form.residence} disabled={busy} onChange={e => setForm(old => ({ ...old, residence: e.target.value }))}><option>Penghuni Asrama</option><option>Non-penghuni</option></select></label><button className="button primary" disabled={busy}>{busy ? 'Menyimpan...' : 'Simpan profil'}</button></form>}<p role="status">{message}</p></section>;
}
