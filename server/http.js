import { fail } from './auth.js';
export function json(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}
export function cors(request, response) {
  const allowed = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173').split(',').map(x => x.trim());
  const origin = request.headers.origin;
  response.setHeader('Vary', 'Origin');
  if (origin && !allowed.includes(origin)) throw fail(403, 'origin_denied', 'Origin tidak diizinkan.');
  if (origin) response.setHeader('Access-Control-Allow-Origin', origin);
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
}
export async function body(request) {
  let value = '';
  for await (const chunk of request) {
    value += chunk;
    if (Buffer.byteLength(value) > 100_000) throw fail(413, 'body_too_large', 'Permintaan terlalu besar.');
  }
  try {
    const result = JSON.parse(value || '{}');
    if (!result || Array.isArray(result) || typeof result !== 'object') throw new Error();
    return result;
  } catch { throw fail(400, 'invalid_json', 'JSON tidak valid.'); }
}
export function errorResponse(response, error) {
  return json(response, error.status || 500, { code: error.status ? error.code : 'internal_error', message: error.status ? error.message : 'Terjadi kesalahan server.' });
}
