import { useRef, useState } from "react";
import { serviceRequest } from "../lib/serviceApi";

const roles = ["Mahasiswa", "Staff", "Supervisor", "Head", "Admin"];
const domainByRole = { Mahasiswa: "student.unklab.ac.id", Staff: "staffdining.unklab.ac.id", Supervisor: "supervisordining.unklab.ac.id", Head: "kepaladining.unklab.ac.id", Admin: "admin.unklab.ac.id" };
const emptyForm = { name: "", role: "Mahasiswa", nim: "", nip: "", faculty: "", residence: "Non-penghuni" };

export default function AdminPage({ user, demoMode, onDemoRoleChange }) {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState(null);
  const [pendingInvite, setPendingInvite] = useState(null);
  const [loading, setLoading] = useState(false);
  const busy = useRef(false);
  const isStudent = form.role === "Mahasiswa";
  const identifier = isStudent ? form.nim : form.nip;
  const email = identifier.trim() ? `${identifier.trim().toLowerCase()}@${domainByRole[form.role]}` : "";

  function change(event) {
    const { name, value } = event.target;
    setForm(previous => ({ ...previous, [name]: value }));
  }

  async function createUser(event) {
    event.preventDefault();
    if (busy.current || pendingInvite) return;
    if (demoMode) {
      setStatus({ type: "info", message: "Mode demo: tidak ada akun yang dibuat atau undangan yang dikirim. Data formulir tetap disimpan di tampilan ini saja." });
      return;
    }
    const data = { ...Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()])), email };
    if (!data.name || !data.email || !roles.includes(data.role) || (isStudent && (!data.nim || !data.faculty || !data.residence)) || (!isStudent && !data.nip)) {
      setStatus({ type: "error", message: "Lengkapi semua kolom wajib dengan nilai yang valid." });
      return;
    }
    if (!isStudent) Object.assign(data, { nim: "", faculty: "", residence: "" });
    else data.nip = "";
    busy.current = true;
    setLoading(true);
    setStatus(null);
    try {
      const result = await serviceRequest("/api/admin/users", data, user);
      const uid = typeof result.uid === "string" ? result.uid.trim() : "";
      if (!uid) throw new Error("Server belum mengonfirmasi UID akun. Periksa daftar akun sebelum mencoba membuat akun kembali.");
      setForm(emptyForm);
      if (result.invitationSent === false) {
        setPendingInvite({ uid, email: data.email });
        setStatus({ type: "error", message: result.message || "Akun berhasil dibuat, tetapi undangan belum terkirim. Coba kirim ulang undangan." });
      } else {
        setStatus({ type: "success", message: result.message || (result.invitationSent === true
          ? "Akun berhasil dibuat dan undangan pengaturan kata sandi telah dikirim."
          : "Akun berhasil dibuat. Status pengiriman undangan belum dikonfirmasi server.") });
      }
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Tidak dapat membuat akun. Periksa hasil operasi sebelum mencoba kembali." });
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }

  async function retryInvite() {
    if (busy.current || !pendingInvite) return;
    if (demoMode) {
      setStatus({ type: "info", message: "Mode demo: undangan tidak dikirim ulang." });
      return;
    }
    busy.current = true;
    setLoading(true);
    setStatus(null);
    try {
      const result = await serviceRequest(`/api/admin/users/${encodeURIComponent(pendingInvite.uid)}/invite`, {}, user);
      if (result.invitationSent !== true) {
        setStatus({ type: "error", message: result.message || "Pengiriman undangan belum dikonfirmasi. Akun sudah ada; jangan buat akun duplikat." });
        return;
      }
      setPendingInvite(null);
      setStatus({ type: "success", message: result.message || "Undangan pengaturan kata sandi berhasil dikirim ulang." });
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Undangan gagal dikirim ulang." });
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }

  return <div className="stack">
    <section className="panel admin-panel">
      <div className="panel-heading"><div><span className="eyebrow">ADMINISTRATOR</span><h2>Buat akun pengguna</h2><p>Buat akun beserta profil pengguna. Undangan untuk mengatur kata sandi akan dikirim melalui email.</p></div></div>
      {demoMode && <p className="notice">Mode demo: formulir hanya pratinjau. Tidak ada akun, perubahan data, atau email yang dikirim.</p>}
      <form className="email-report-form admin-user-form" onSubmit={createUser} aria-busy={loading}>
        <label>Nama lengkap<input name="name" autoComplete="name" value={form.name} onChange={change} disabled={loading || Boolean(pendingInvite)} required /></label>
        <label>Role<select name="role" value={form.role} onChange={change} disabled={loading || Boolean(pendingInvite)} required>{roles.map(role => <option key={role} value={role}>{role}</option>)}</select></label>
        {isStudent && <>
          <label>NIM<input name="nim" value={form.nim} onChange={change} disabled={loading || Boolean(pendingInvite)} required /></label>
          <label>Fakultas<input name="faculty" value={form.faculty} onChange={change} disabled={loading || Boolean(pendingInvite)} required /></label>
          <label className="checkbox-label"><input type="checkbox" checked={form.residence === "Penghuni Asrama"} onChange={event => setForm(previous => ({ ...previous, residence: event.target.checked ? "Penghuni Asrama" : "Non-penghuni" }))} disabled={loading || Boolean(pendingInvite)} /> Penghuni asrama</label>
          <p className="helper-text">Status akun: {form.residence}. Admin dapat mengubahnya dengan mencentang kotak ini.</p>
        </>}
        {!isStudent && <label>NIP<input name="nip" value={form.nip} onChange={change} disabled={loading || Boolean(pendingInvite)} required /></label>}
        <label>Email akun<input type="email" value={email} readOnly aria-readonly="true" /></label>
        <button className="button primary" type="submit" disabled={loading || Boolean(pendingInvite)}>{loading ? "Memproses..." : demoMode ? "Pratinjau pembuatan akun" : "Buat akun & kirim undangan"}</button>
      </form>
      {pendingInvite && <div className="stack"><p>Akun untuk {pendingInvite.email} sudah dibuat. Kirim ulang undangan tanpa membuat akun baru.</p><button className="button primary" type="button" onClick={retryInvite} disabled={loading}>{loading ? "Memproses..." : "Kirim ulang undangan"}</button><button className="button secondary" type="button" disabled={loading} onClick={() => { setPendingInvite(null); setStatus(null); }}>Lanjut buat akun lain</button></div>}
      <div role="status" aria-live="polite">{loading && <p>Memproses permintaan...</p>}{status && <p className={`notice ${status.type === "error" ? "error-notice" : status.type === "success" ? "success-notice" : ""}`}>{status.message}</p>}</div>
    </section>
  </div>;
}
