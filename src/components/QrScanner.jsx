import { useEffect, useRef, useState } from "react";
import { BarcodeFormat, BrowserCodeReader, BrowserMultiFormatReader } from "@zxing/browser";

const SCAN_FORMATS = [
  BarcodeFormat.QR_CODE,
  BarcodeFormat.CODE_128,
  BarcodeFormat.CODE_39,
  BarcodeFormat.CODE_93,
  BarcodeFormat.CODABAR,
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.ITF,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  BarcodeFormat.DATA_MATRIX,
  BarcodeFormat.PDF_417,
  BarcodeFormat.AZTEC,
];

function cameraError(error) {
  if (error?.name === "NotAllowedError" || error?.name === "SecurityError") return "Izin kamera ditolak. Izinkan kamera untuk localhost lalu buka pemindai lagi.";
  if (error?.name === "NotFoundError" || error?.name === "OverconstrainedError") return "Kamera yang dipilih tidak tersedia. Pilih kamera lain atau gunakan input NIM.";
  if (error?.name === "NotReadableError") return "Kamera sedang digunakan aplikasi lain. Tutup aplikasi tersebut lalu coba lagi.";
  return "Pembaca tidak dapat dimulai. Pastikan kamera tersedia dan gunakan HTTPS atau localhost.";
}

export default function QrScanner({ onScan, onClose, title = "Scan QR atau barcode", helper = "Arahkan kamera ke QR identitas mahasiswa atau barcode kartu." }) {
  const videoRef = useRef(null);
  const scannerControlsRef = useRef(null);
  const onScanRef = useRef(onScan);
  const [error, setError] = useState("");
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  useEffect(() => { onScanRef.current = onScan; }, [onScan]);
  useEffect(() => {
    let active = true;
    let scanned = false;
    setError("");
    scannerControlsRef.current?.stop();
    scannerControlsRef.current = null;

    const constraints = {
      audio: false,
      video: selectedCamera
        ? { deviceId: { exact: selectedCamera }, width: { ideal: 1920 }, height: { ideal: 1080 } }
        : { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
    };

    function finish(value) {
      const text = typeof value === "string" ? value.trim() : "";
      if (!active || scanned || !text) return;
      scanned = true;
      scannerControlsRef.current?.stop();
      onScanRef.current(text);
    }

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Browser ini tidak mendukung akses kamera. Gunakan browser modern atau input NIM sebagai cadangan.");
        return;
      }
      try {
        const reader = new BrowserMultiFormatReader();
        reader.possibleFormats = SCAN_FORMATS;
        const controls = await reader.decodeFromConstraints(
          constraints,
          videoRef.current,
          result => { if (result) finish(result.getText()); },
        );
        if (!active) { controls.stop(); return; }
        scannerControlsRef.current = controls;
        try {
          const devices = await BrowserCodeReader.listVideoInputDevices();
          if (active) setCameras(devices);
        } catch {
          // The active stream can still decode even when device labels cannot be listed.
        }
      } catch (scanError) {
        if (active) setError(cameraError(scanError));
      }
    }

    start();
    return () => {
      active = false;
      scannerControlsRef.current?.stop();
      scannerControlsRef.current = null;
    };
  }, [selectedCamera]);

  return <div className="scanner-panel">
    <div className="scanner-top"><b>{title}</b><button type="button" className="button small" onClick={onClose}>Tutup</button></div>
    {cameras.length > 1 && <label className="camera-picker">Kamera<select value={selectedCamera} onChange={event => setSelectedCamera(event.target.value)}><option value="">Pilih otomatis</option>{cameras.map((camera, index) => <option key={camera.deviceId} value={camera.deviceId}>{camera.label || `Kamera ${index + 1}`}</option>)}</select></label>}
    <video ref={videoRef} className="scanner-video" muted autoPlay playsInline />
    {error && <div className="notice error-notice">{error}</div>}
    <p className="helper-text">{helper} Pembaca QR dan barcode aktif.</p>
  </div>;
}
