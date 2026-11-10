import { useId, useRef, useState } from "react";
import { serviceRequest } from "../lib/serviceApi";

export default function FeedbackPanel({ user, demoMode, period }) {
  const [rating, setRating] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const busy = useRef(false);
  const disclosureId = useId();
  const selectedRating = Number(rating) || 0;

  async function submitFeedback(event) {
    event.preventDefault();
    if (busy.current) return;
    if (demoMode) {
      setStatus({ type: "info", message: "Mode demo: masukan tidak disimpan atau dikirim. Isi formulir tetap tersedia." });
      return;
    }
    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5 || !period) {
      setStatus({ type: "error", message: "Pilih nilai 1–5 dan pastikan periode makan tersedia." });
      return;
    }
    busy.current = true;
    setLoading(true);
    setStatus(null);
    try {
      const result = await serviceRequest("/api/feedback", { rating: numericRating, message: message.trim(), period }, user);
      setRating("");
      setMessage("");
      setStatus({ type: "success", message: result.message || "Terima kasih. Masukan berhasil dikirim." });
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Masukan belum dapat dikirim. Silakan coba kembali." });
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }

  return <section className="panel email-report-panel feedback-panel">
    <div className="panel-heading"><div><span className="eyebrow">MASUKAN MAHASISWA</span><h2>Bagaimana pengalaman makan Anda?</h2><p>Periode makan: {period || "Belum tersedia"}</p></div></div>
    <p id={disclosureId} className="helper-text">Penilaian dan saran dikirim melalui email kepada pengelola Dining Hall bersama nama dan NIM Anda. Masukan ini bukan anonim.</p>
    {demoMode && <p className="notice">Mode demo: tidak ada masukan yang disimpan atau email yang dikirim.</p>}
    <form className="email-report-form feedback-form" onSubmit={submitFeedback} aria-describedby={disclosureId} aria-busy={loading}>
      <div className="rating-stars" role="group" aria-label="Penilaian 1 sampai 5 bintang">{[1, 2, 3, 4, 5].map(value => <button key={value} className={`rating-star ${value <= selectedRating ? "selected" : ""}`} type="button" aria-label={`${value} dari 5 bintang`} aria-pressed={value <= selectedRating} onClick={() => setRating(current => current === String(value) ? "" : String(value))} disabled={loading}>{value <= selectedRating ? "★" : "☆"}</button>)}<span className="rating-value" aria-live="polite">{selectedRating ? `${selectedRating}/5` : "Belum dipilih"}</span></div>
      <label>Penilaian<select value={rating} onChange={event => setRating(event.target.value)} required disabled={loading}><option value="">Pilih nilai 1–5</option>{[1, 2, 3, 4, 5].map(value => <option key={value} value={value}>{value}{value === 1 ? " — Sangat tidak puas" : value === 5 ? " — Sangat puas" : ""}</option>)}</select></label>
      <label>Saran (opsional)<textarea value={message} onChange={event => setMessage(event.target.value)} rows={4} maxLength={5000} disabled={loading} /></label>
      <button className="button primary" type="submit" disabled={loading || !period}>{loading ? "Mengirim..." : demoMode ? "Pratinjau masukan" : "Kirim masukan"}</button>
      <div role="status" aria-live="polite">{loading && <p>Mengirim masukan...</p>}{status && <p className={`notice ${status.type === "error" ? "error-notice" : status.type === "success" ? "success-notice" : ""}`}>{status.message}</p>}</div>
    </form>
  </section>;
}
