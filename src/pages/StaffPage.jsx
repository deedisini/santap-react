import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck, Search, Users } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import QrScanner from "../components/QrScanner";

export default function StaffPage({ students, queue, records, period, periodOpen, setPeriodOpen, onAddQueue, onRecord, onCompleteQueue }) {
  const [nim, setNim] = useState("");
  const [method, setMethod] = useState("Manual NIM");
  const [message, setMessage] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [lastReceipt, setLastReceipt] = useState(null);
  const student = useMemo(() => students.find(s => s.nim === nim.trim()), [students, nim]);
  const existing = student && records.some(r => r.nim === student.nim && r.period === period);
  const waiting = queue.filter(q => q.status === "waiting");
  function identify(e) {
    e.preventDefault();
    if (!student) return setMessage({ type: "error", text: "Mahasiswa tidak ditemukan. Periksa NIM yang dimasukkan." });
    setMessage({ type: "success", text: `${student.name} berhasil ditemukan melalui ${method}.` });
  }
  function record() {
    onRecord(student.nim).then(result => { setMessage({ type: result.ok ? "success" : "error", text: result.message }); if (result.ok) setLastReceipt(result.record); }).catch(() => setMessage({ type: "error", text: "Pencatatan gagal. Periksa koneksi Firebase dan coba lagi." }));
  }
  function handleScan(value) {
    try {
      const parsed = JSON.parse(value);
      if (parsed.type === "santap.student" && parsed.nim) setNim(parsed.nim);
      else setNim(value.trim());
    } catch { setNim(value.trim()); }
    setScanning(false); setMethod("Scan QR"); setMessage({ type: "success", text: "Kode terbaca. Tekan Identifikasi untuk memeriksa data mahasiswa." });
  }
  return <div className="staff-layout">
    <section className="panel">
      <div className="panel-heading"><div><span className="eyebrow">PELAYANAN</span><h2>Identifikasi mahasiswa</h2><p>Gunakan salah satu metode identifikasi yang tersedia.</p></div><ClipboardCheck className="muted-icon" /></div>
      <form onSubmit={identify} className="identify-form">
        <label>Metode identifikasi</label>
        <div className="method-tabs">{["Scan QR", "Scan Barcode", "Manual NIM"].map(m => <button type="button" key={m} className={method === m ? "selected" : ""} onClick={() => {setMethod(m); setMessage(null); setScanning(m !== "Manual NIM");}}>{m}</button>)}</div>
        {method !== "Manual NIM" && scanning && <QrScanner onScan={handleScan} onClose={() => setScanning(false)} />}
        <label htmlFor="nim">NIM / Nomor registrasi</label>
        <div className="input-row"><input id="nim" value={nim} onChange={e => {setNim(e.target.value); setMessage(null);}} placeholder="Contoh: 23101001" /><button className="button primary" type="submit"><Search size={16} /> Identifikasi</button></div>
        <p className="helper-text">QR dan barcode dipindai langsung melalui kamera perangkat. Input NIM tetap tersedia sebagai metode cadangan.</p>
      </form>
      {message && <div className={`notice ${message.type === "success" ? "success-notice" : "error-notice"}`}>{message.text}</div>}
      {student && <div className="student-result">
        <div className="result-avatar">{student.name.split(" ").map(x => x[0]).slice(0,2).join("")}</div>
        <div className="result-details"><b>{student.name}</b><span>{student.nim} · {student.faculty}</span><span>{student.residence}</span></div>
        <span className={`status-pill ${existing ? "warning" : "success"}`}>{existing ? "Sudah mengambil" : "Teridentifikasi"}</span>
        <button className="button primary" disabled={!periodOpen || existing} onClick={record}>{existing ? "Sudah tercatat" : "Catat pengambilan"}</button>
      </div>}
      {lastReceipt && <div className="receipt-panel"><div className="panel-heading"><div><span className="eyebrow">KONFIRMASI STAFF</span><h2>QR bukti pengambilan</h2><p>Berikan QR ini kepada mahasiswa sebagai bukti transaksi.</p></div></div><div className="qr-frame receipt-qr"><QRCodeSVG value={JSON.stringify({ type: "santap.meal-receipt", version: 1, recordId: lastReceipt.id, nim: lastReceipt.nim, periodId: lastReceipt.periodId, token: lastReceipt.verificationToken })} size={150} level="Q" includeMargin /></div></div>}
    </section>
    <section className="panel">
      <div className="panel-heading"><div><span className="eyebrow">KONTROL OPERASIONAL</span><h2>Periode makan</h2></div></div>
      <div className="period-control"><div><b>{period}</b><span>Status periode aktif untuk pencatatan.</span></div><button className={`button ${periodOpen ? "danger-outline" : "primary"}`} onClick={() => setPeriodOpen(!periodOpen)}>{periodOpen ? "Tutup periode" : "Buka periode"}</button></div>
    </section>
    <section className="panel">
      <div className="panel-heading"><div><span className="eyebrow">DAFTAR LAYANAN</span><h2>Antrean berjalan</h2></div><span className="count-badge"><Users size={14} /> {waiting.length} menunggu</span></div>
      {waiting.length ? <div className="queue-table">{waiting.map((item, index) => {
        const s = students.find(x => x.nim === item.nim);
        return <div className="queue-row" key={item.id}><strong className="queue-number">{index + 1}</strong><div className="queue-person"><b>{s?.name || item.nim}</b><span>{item.nim} · Masuk {item.joinedAt}</span></div><button className="button small" onClick={() => onCompleteQueue(item.id)}><CheckCircle2 size={15} /> Selesaikan</button></div>;
      })}</div> : <div className="empty-state">Belum ada mahasiswa dalam antrean.</div>}
      <div className="inline-add"><span>Tambah antrean berdasarkan NIM</span><button className="button secondary small" onClick={() => {const candidate = students.find(s => !queue.some(q => q.nim === s.nim && q.status === "waiting") && !records.some(r => r.nim === s.nim && r.period === period)); if(candidate) {const r=onAddQueue(candidate.nim); setMessage({type:r.ok?"success":"error",text:r.message});} else setMessage({type:"error",text:"Tidak ada data demo yang tersedia untuk ditambahkan."});}}>Tambah data demo</button></div>
    </section>
  </div>;
}
