import nodemailer from 'nodemailer';
import { fail } from './auth.js';
export const validEmail = value => typeof value === 'string' && value.length <= 255 && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value);
export async function sendEmail({ to, subject, text, replyTo }) {
  if (!validEmail(to) || !process.env.SMTP_USER || !process.env.SMTP_APP_PASSWORD) throw fail(503, 'email_unavailable', 'Email belum dikonfigurasi.');
  const transport = nodemailer.createTransport({ host: process.env.SMTP_HOST || 'smtp.gmail.com', port: Number(process.env.SMTP_PORT || 465), secure: (process.env.SMTP_SECURE || 'true') === 'true', auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_APP_PASSWORD } });
  try {
    const result = await transport.sendMail({ from: { name: process.env.SMTP_FROM_NAME || 'SANTAP Dining Hall', address: process.env.SMTP_USER }, to, replyTo: validEmail(replyTo) ? replyTo : undefined, subject, text });
    if (!result.accepted?.length) throw new Error('Recipient rejected');
  } catch { throw fail(502, 'email_failed', 'Email gagal dikirim. Silakan coba lagi.'); }
}
export async function invite(auth, uid, mail = sendEmail) {
  const user = await auth.getUser(uid);
  const link = await auth.generatePasswordResetLink(user.email);
  await mail({ to: user.email, subject: 'Undangan akun SANTAP', text: `Halo ${user.displayName || ''},\n\nAtur kata sandi akun SANTAP Anda melalui tautan berikut:\n${link}\n\nJika tautan kedaluwarsa, minta Admin mengirim ulang undangan.` });
}
