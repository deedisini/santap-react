import { useMemo, useState } from "react";
import { Mail, Send } from "lucide-react";
import { serviceRequest } from "../lib/serviceApi";

export default function EmailReportPanel({ weeklyRows, weeklyMean, period, user, demoMode }) {
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("Laporan SANTAP - Estimasi Porsi Mingguan");
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);
  const report = useMemo(() => {
    const lines = [
      "LAPORAN SANTAP - ESTIMASI PORSI MINGGUAN",
      `Periode aktif: ${period}`,
      "",
      `Rata-rata per hari: Sarapan ${weeklyMean.morning}, Siang ${weeklyMean.afternoon}, Malam ${weeklyMean.evening}`,
      "",
      "Histori tujuh hari:",
      ...weeklyRows.map(row => `${row.label} ${row.date}: Sarapan ${row.morning}, Siang ${row.afternoon}, Malam ${row.evening}, Total ${row.total}`),
    ];
    return lines.join("\n");
  }, [period, weeklyMean, weeklyRows]);

  async function sendReport(event) {
    event.preventDefault();
    setSending(true);
    setStatus(null);
    try {
      if (demoMode) { setStatus({ type: "success", message: "Simulasi selesai. Tidak ada email yang dikirim." }); return; }
      const result = await serviceRequest("/api/email-report", { to: recipient, subject, report }, user);
      setStatus({ type: "success", message: result.message });
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Server email belum berjalan." });
    } finally {
      setSending(false);
    }
  }

  return <section className="panel email-report-panel">
    <div className="panel-heading"><div><span className="eyebrow">LAPORAN EMAIL</span><h2>Kirim ringkasan ke pengelola</h2><p>Kirim histori konsumsi dan estimasi porsi ke Supervisor atau Kepala Dining Hall.</p></div><Mail className="muted-icon" /></div>
    <form className="email-report-form" onSubmit={sendReport}>
      <label>Email penerima<input type="email" value={recipient} onChange={event => setRecipient(event.target.value)} placeholder="supervisor@unklab.ac.id" required /></label>
      <label>Subjek<input value={subject} onChange={event => setSubject(event.target.value)} required /></label>
      <div className="email-report-preview"><span>Isi laporan</span><pre>{report}</pre></div>
      <button className="button primary" type="submit" disabled={sending}><Send size={14} />{sending ? "Mengirim..." : "Kirim laporan"}</button>
      {status && <div className={`notice ${status.type === "success" ? "success-notice" : "error-notice"}`}>{status.message}</div>}
    </form>
  </section>;
}
