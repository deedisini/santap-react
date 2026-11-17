import nodemailer from 'nodemailer';
import { fail } from './auth.js';
export const validEmail = value => typeof value === 'string' && value.length <= 255 && /^[A-Za-z0-9_%+.-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/.test(value);
export function emailConfiguration(env = process.env) {
  const missing = [];
  if (!validEmail(env.SMTP_USER)) missing.push('SMTP_USER');
  if (!env.SMTP_APP_PASSWORD) missing.push('SMTP_APP_PASSWORD');
  return { ready: missing.length === 0, missing };
}
export async function sendEmail({ to, subject, text, replyTo }) {
  const configuration = emailConfiguration();
  if (!validEmail(to) || !configuration.ready) throw fail(503, 'email_unavailable', configuration.ready ? 'Penerima email tidak valid.' : `Email belum dikonfigurasi: ${configuration.missing.join(', ')}.`);
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
