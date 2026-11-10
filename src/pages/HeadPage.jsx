import { ShieldCheck } from "lucide-react";

export default function HeadPage() {
  return <section className="panel placeholder-panel">
    <div className="placeholder-icon"><ShieldCheck size={28} /></div>
    <span className="eyebrow">KEPALA DINING HALL</span>
    <h2>Administrasi dan Pengawasan</h2>
    <p>SANTAP menyediakan antarmuka terpisah untuk role Head. Rincian fungsi dan kewenangan role ini masih perlu ditetapkan melalui requirement sistem.</p>
    <span className="status-pill warning">Menunggu definisi kebutuhan</span>
  </section>;
}
