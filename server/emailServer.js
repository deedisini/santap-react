import http from 'node:http';
import { pathToFileURL } from 'node:url';
import { authenticate, firebase, requireRole, fail } from './auth.js';
import { body, cors, json, errorResponse } from './http.js';
import { sendEmail, invite, validEmail } from './email.js';
import { createAccount } from './accounts.js';
import { sqlPool } from './database.js';

export function createHandler(deps = {}) {
  return async (request, response) => {
    try {
      cors(request, response);
      if (request.method === 'OPTIONS') { response.writeHead(204); return response.end(); }
      const services = deps.services || firebase();
      const identity = await authenticate(request, services);
      const path = new URL(request.url, 'http://localhost').pathname;
      if (request.method !== 'POST') throw fail(404, 'not_found', 'Endpoint tidak ditemukan.');
      const mail = deps.sendEmail || sendEmail;
      if (path === '/api/admin/users') {
        requireRole(identity, ['Admin']);
        const result = await createAccount(await body(request), { ...services, pool: deps.pool ?? (process.env.VITE_SQL_API_URL?.trim() ? sqlPool() : null), sendInvite: (auth, uid) => invite(auth, uid, mail) });
        return json(response, 201, result);
      }
      const retry = /^\/api\/admin\/users\/([^/]+)\/invite$/.exec(path);
      if (retry) {
        requireRole(identity, ['Admin']);
        const uid = decodeURIComponent(retry[1]);
        if (!(await services.db.collection('users').doc(uid).get()).exists) throw fail(404, 'user_not_found', 'Pengguna tidak ditemukan.');
        try { await invite(services.auth, uid, mail); }
        catch { throw fail(502, 'invitation_failed', 'Undangan gagal dikirim. Silakan coba lagi.'); }
        return json(response, 200, { uid, invitationSent: true, message: 'Undangan dikirim.' });
      }
      if (path === '/api/feedback') {
        requireRole(identity, ['Mahasiswa']);
        const data = await body(request);
        if (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5 || (data.message !== undefined && (typeof data.message !== 'string' || data.message.length > 5000)) || typeof data.period !== 'string' || !data.period.trim() || data.period.length > 80) throw fail(400, 'invalid_feedback', 'Rating 1-5, pesan (maks. 5000), dan periode (maks. 80) diperlukan.');
        if (!identity.nim) throw fail(403, 'profile_required', 'NIM belum tersedia.');
        if (!validEmail(process.env.FEEDBACK_TO)) throw fail(503, 'feedback_unavailable', 'Penerima saran belum dikonfigurasi.');
        const account = await services.auth.getUser(identity.uid);
        const studentEmail = validEmail(account.email) ? account.email : undefined;
        await mail({ to: process.env.FEEDBACK_TO, replyTo: studentEmail, subject: 'SANTAP: Penilaian dan saran mahasiswa', text: `Nama: ${identity.name}\nNIM: ${identity.nim}\nEmail: ${account.email || ''}\nUID: ${identity.uid}\nPeriode: ${data.period.trim()}\nRating: ${data.rating}/5\n\n${(data.message || "").trim()}` });
        return json(response, 200, { ok: true, message: 'Penilaian dan saran dikirim.' });
      }
      if (path === '/api/email-report') {
        requireRole(identity, ['Supervisor', 'Head', 'Admin']);
        const data = await body(request);
        if (!validEmail(data.to) || typeof data.report !== 'string' || !data.report.trim()) throw fail(400, 'invalid_report', 'Penerima dan laporan diperlukan.');
        await mail({ to: data.to, subject: String(data.subject || 'Laporan SANTAP').replace(/[\r\n]/g, ' ').slice(0, 160), text: data.report });
        return json(response, 200, { message: 'Laporan berhasil dikirim.' });
      }
      throw fail(404, 'not_found', 'Endpoint tidak ditemukan.');
    } catch (error) { return errorResponse(response, error); }
  };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.EMAIL_SERVER_PORT || 8787);
  http.createServer(createHandler()).listen(port, '127.0.0.1', () => console.log(`SANTAP API: http://127.0.0.1:${port}`));
}

