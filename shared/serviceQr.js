// Public, permanent service marker. Never encode a staff identity or session here.
export const SERVICE_QR_PAYLOAD = JSON.stringify({ type: 'santap.service', version: 1 });

export function parseStudentIdentity(value) {
  if (typeof value !== 'string') throw new Error('QR atau NIM tidak valid.');
  const raw = value.trim();
  let parsed;
  try { parsed = JSON.parse(raw); } catch { /* Barcode dapat berisi NIM mentah. */ }
  const nim = parsed && typeof parsed === 'object' ?
    (parsed.type === 'santap.student' && parsed.version === 1 ? parsed.nim : null) : raw;
  if (typeof nim !== 'string' || !/^[A-Za-z0-9_-]{1,30}$/.test(nim)) {
    throw new Error('Gunakan QR identitas mahasiswa atau NIM yang valid.');
  }
  return nim;
}

export function isServiceQr(value) {
  try { const data = JSON.parse(value); return data?.type === 'santap.service' && data.version === 1; }
  catch { return false; }
}
