import { useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Info, QrCode } from 'lucide-react';
import { SERVICE_QR_PAYLOAD } from '../../shared/serviceQr.js';

export default function ServiceQr() {
  const canvas = useRef(null);
  const [error, setError] = useState('');
  function download() {
    try {
      const link = document.createElement('a');
      link.href = canvas.current.toDataURL('image/png');
      link.download = 'SANTAP-QR-Layanan.png';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setError('');
    } catch { setError('QR gagal diunduh. Silakan coba lagi.'); }
  }
  return <section className="panel service-qr-panel">
    <div className="panel-heading"><div><span className="eyebrow">QR LAYANAN</span><h2>QR universal mahasiswa</h2><p>Tampilkan kode ini untuk dipindai melalui akun mahasiswa.</p></div><QrCode className="muted-icon" /></div>
    <div className="service-qr-content">
      <div className="qr-frame service-qr-code"><QRCodeCanvas ref={canvas} value={SERVICE_QR_PAYLOAD} size={480} style={{ width: 220, height: 220, maxWidth: '100%' }} level="M" includeMargin title="QR layanan SANTAP" /></div>
      <div className="service-qr-details">
        <div><h3>Siap dipindai</h3><p>Mahasiswa dapat membuka pemindai dari akun mereka lalu mengarahkan kamera ke kode ini.</p></div>
        <button type="button" className="button secondary" onClick={download}><Download size={16} /> Unduh PNG</button>
        {error && <p className="form-error" role="alert">{error}</p>}
        <p className="service-qr-note"><Info size={15} /> <span>Satu kode tetap untuk seluruh petugas dan periode makan. Kode tidak memuat identitas pribadi.</span></p>
      </div>
    </div>
  </section>;
}
