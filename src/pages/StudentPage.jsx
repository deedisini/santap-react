import { useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Clock3, CheckCircle2, ScanLine, Users, Utensils } from "lucide-react";
import QrScanner from "../components/QrScanner";

export default function StudentPage({ student, queue, records, period, periodId, periodOpen, onJoinQueue }) {
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState(null);
  const myQueue = queue.find((item) => item.nim === student.nim && item.status === "waiting");
  const myRecord = records.find((item) => item.nim === student.nim && item.period === period);
  const position = useMemo(() => myQueue ? queue.filter((item) => item.status === "waiting").findIndex((item) => item.id === myQueue.id) + 1 : null, [queue, myQueue]);
  const payload = JSON.stringify({ type: "santap.student", version: 1, nim: student.nim });
  const receiptPayload = myRecord ? JSON.stringify({ type: "santap.meal-receipt", version: 1, recordId: myRecord.id, nim: student.nim, periodId, token: myRecord.verificationToken }) : "";
  function handleReceiptScan(value) {
    try {
      const parsed = JSON.parse(value);
      if (parsed.type !== "santap.meal-receipt" || !parsed.recordId || !parsed.nim || !parsed.token) throw new Error();
      if (String(parsed.nim) !== String(student.nim)) {
        setScanMessage({ type: "error", text: "QR ini bukan bukti pengambilan milik Anda." });
      } else {
        const matchingRecord = records.find(record => String(record.id) === String(parsed.recordId) && record.verificationToken === parsed.token);
        setScanMessage(matchingRecord ? { type: "success", text: "Bukti pengambilan staff berhasil diverifikasi." } : { type: "error", text: "Bukti tidak ditemukan atau token sudah tidak valid." });
      }
    } catch { setScanMessage({ type: "error", text: "QR tidak dikenali. Gunakan QR bukti yang dibuat oleh staff." }); }
    setScanning(false);
  }
  return <div className="page-grid student-grid">
    <section className="panel identity-panel">
      <div className="panel-heading"><div><span className="eyebrow">IDENTITAS DIGITAL</span><h2>Kartu Mahasiswa</h2></div><span className="status-pill success">Aktif</span></div>
      <div className="identity-content">
        <div className="student-avatar">{student.name.split(" ").map(x => x[0]).slice(0, 2).join("")}</div>
        <h3>{student.name}</h3><p>{student.nim} · {student.faculty}</p>
        <span className="residence-tag">{student.residence}</span>
        <div className="qr-frame"><QRCodeSVG value={payload} size={176} level="M" includeMargin /></div>
        <small className="muted">Tunjukkan QR ini kepada staff untuk identifikasi.</small>
      </div>
    </section>
    <div className="stack">
      <section className="panel">
        <div className="panel-heading"><div><span className="eyebrow">PERIODE MAKAN</span><h2>Status pengambilan</h2></div><Utensils size={20} className="muted-icon" /></div>
        <div className="period-summary"><div><b>{period}</b><span>Periode yang dipilih pada demo</span></div><span className={`status-pill ${periodOpen ? "success" : "warning"}`}>{periodOpen ? "Dibuka" : "Ditutup"}</span></div>
        {myRecord ? <div className="notice success-notice"><CheckCircle2 size={18} /> Pengambilan periode ini sudah tercatat pada {myRecord.time}.</div> : <div className="notice"><Clock3 size={18} /> Belum ada catatan pengambilan untuk periode ini.</div>}
      </section>
      <section className="panel receipt-panel"><div className="panel-heading"><div><span className="eyebrow">KONFIRMASI STAFF</span><h2>Verifikasi QR pengambilan</h2><p>Pindai QR yang diberikan staff untuk memastikan bukti transaksi sesuai akun Anda.</p></div><ScanLine className="muted-icon" /></div>
        {scanning && <QrScanner onScan={handleReceiptScan} onClose={() => setScanning(false)} title="Scan QR konfirmasi staff" helper="Arahkan kamera ke QR bukti pengambilan dari staff." />}
        {!scanning && <button className="button secondary full" onClick={() => { setScanning(true); setScanMessage(null); }}><ScanLine size={16} /> Pindai QR dari staff</button>}
        {scanMessage && <div className={`notice ${scanMessage.type === "success" ? "success-notice" : "error-notice"}`}>{scanMessage.text}</div>}
        {myRecord && <><div className="receipt-divider" /><div className="panel-heading"><div><span className="eyebrow">BUKTI PENGAMBILAN</span><h2>QR konfirmasi staff</h2><p>Tunjukkan bukti ini bila perlu verifikasi ulang.</p></div><CheckCircle2 className="muted-icon" /></div><div className="qr-frame receipt-qr"><QRCodeSVG value={receiptPayload} size={150} level="Q" includeMargin /></div></>}
      </section>
      <section className="panel queue-panel">
        <div className="panel-heading"><div><span className="eyebrow">ANTREAN DINING HALL</span><h2>Status antrean</h2></div><Users size={20} className="muted-icon" /></div>
        {myQueue ? <div className="queue-position"><strong>#{position}</strong><div><b>Anda berada dalam antrean</b><span>Posisi diperbarui otomatis pada demo.</span></div></div> : <p className="muted">Anda belum masuk ke antrean periode ini.</p>}
        <button className="button primary full" onClick={onJoinQueue} disabled={!periodOpen || !!myRecord || !!myQueue}>{myQueue ? "Sudah masuk antrean" : myRecord ? "Pengambilan sudah tercatat" : "Masuk antrean"}</button>
      </section>
    </div>
  </div>;
}
