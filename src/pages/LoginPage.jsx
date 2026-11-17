import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, firebaseSetupHint } from "../lib/firebase";
import universityLogo from "../assets/LOGO_UNIVERSITAS_KLABAT.png";

export default function LoginPage({ onDemo }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault();
    setError("");
    if (!auth) return setError(firebaseSetupHint);
    try { await signInWithEmailAndPassword(auth, email, password); }
    catch { setError("Email atau kata sandi tidak valid."); }
  }
  return <main className="login-shell">
    <section className="login-intro" aria-label="Tentang SANTAP">
      <div className="login-brand"><img src={universityLogo} alt="Logo Universitas Klabat" /><div><b>SANTAP</b><span>FERN WALLACE DINING HALL</span></div></div>
      <div className="login-intro-copy"><span className="login-overline">SISTEM LAYANAN MAKAN</span><h1>Satu akses untuk<br /><em>layanan dining</em> yang tertata.</h1><p>Antrean lebih jelas, validasi lebih cepat, dan setiap pengambilan tercatat dengan aman.</p></div>
      <div className="login-feature-grid"><div><b>01</b><span>Antrean teratur</span></div><div><b>02</b><span>Validasi QR</span></div><div><b>03</b><span>Data terukur</span></div></div>
      <div className="login-intro-footer"><span>Built for Fern Wallace Dining Hall</span><span>v1.0.0</span></div>
    </section>
    <section className="login-stage"><div className="login-stage-meta">SANTAP <span>•</span> Fern Wallace Dining Hall</div><div className="login-panel">
      <span className="eyebrow">SELAMAT DATANG KEMBALI</span><h2>Masuk ke SANTAP</h2><p className="muted">Gunakan akun email UNKLAB anda untuk melanjutkan.</p>
      <form onSubmit={submit} className="login-form"><label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label><label>Kata sandi<input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></label>{error && <div className="notice error-notice">{error}</div>}<button className="button primary full">Masuk ke akun</button></form>
      {onDemo && <button type="button" className="button secondary full" onClick={onDemo}>Buka demo lokal</button>}
      <p className="login-privacy">Dengan masuk, Anda menyetujui penggunaan SANTAP sesuai kebijakan layanan dining hall.</p>
    </div><div className="login-stage-footer">Butuh bantuan? Hubungi administrator dining hall.</div></section>
  </main>;
}
