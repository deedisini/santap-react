import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function QrScanner({ onScan, onClose, title = "Scan QR atau barcode", helper = "Arahkan kamera ke QR identitas mahasiswa atau barcode kartu." }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scannerControlsRef = useRef(null);
  const [error, setError] = useState("");
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  useEffect(() => {
    let timer;
    let active = true;
    let scanned = false;
    const constraints = { audio: false, video: selectedCamera ? { deviceId: { exact: selectedCamera } } : { facingMode: { ideal: "environment" } } };

    async function loadCameras() {
      const devices = await navigator.mediaDevices.enumerateDevices();
      if (active) setCameras(devices.filter(device => device.kind === "videoinput"));
    }

    function finish(value) {
      if (!active || scanned) return;
      scanned = true;
      scannerControlsRef.current?.stop();
      onScan(value);
    }

    async function startFallbackScanner() {
      try {
        const reader = new BrowserMultiFormatReader();
        const controls = await reader.decodeFromConstraints(constraints, videoRef.current, (result) => {
          if (result) finish(result.getText());
        });
        scannerControlsRef.current = controls;
        await loadCameras();
        if (!active || scanned) controls.stop();
      } catch {
        if (active) setError("Kamera tidak tersedia atau izin kamera ditolak.");
      }
    }

    async function start() {
      setError("");
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Browser ini tidak mendukung akses kamera. Gunakan browser modern atau input NIM sebagai cadangan.");
        return;
      }
      if (!("BarcodeDetector" in window)) return startFallbackScanner();
      try {
        streamRef.current = await navigator.mediaDevices.getUserMedia(constraints);
        videoRef.current.srcObject = streamRef.current; await videoRef.current.play();
        await loadCameras();
        const detector = new window.BarcodeDetector({ formats: ["qr_code", "code_128", "code_39", "ean_13"] });
        async function read() { try { const codes = await detector.detect(videoRef.current); if (codes[0]?.rawValue) return finish(codes[0].rawValue); } catch { /* camera frames can be unavailable between devices */ } if (active && !scanned) timer = requestAnimationFrame(read); }
        read();
      } catch {
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        startFallbackScanner();
      }
    }
    start();
    return () => { active = false; if (timer) cancelAnimationFrame(timer); scannerControlsRef.current?.stop(); streamRef.current?.getTracks().forEach(track => track.stop()); };
  }, [onScan, selectedCamera]);
  return <div className="scanner-panel"><div className="scanner-top"><b>{title}</b><button className="button small" onClick={onClose}>Tutup</button></div>{cameras.length > 1 && <label className="camera-picker">Kamera<select value={selectedCamera} onChange={event => setSelectedCamera(event.target.value)}><option value="">Pilih otomatis</option>{cameras.map((camera, index) => <option key={camera.deviceId} value={camera.deviceId}>{camera.label || `Kamera ${index + 1}`}</option>)}</select></label>}<video ref={videoRef} className="scanner-video" muted playsInline />{error && <div className="notice error-notice">{error}</div>}<p className="helper-text">{helper}</p></div>;
}
