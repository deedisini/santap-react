import test from 'node:test';
import assert from 'node:assert/strict';
import { parseStudentIdentity, isServiceQr, SERVICE_QR_PAYLOAD } from '../shared/serviceQr.js';
import { firestoreOperation } from './operations.js';
import { validEmail } from './email.js';
import nodemailer from 'nodemailer';

test('student QR validates type and NIM without crashing on hostile JSON shapes', () => {
  assert.equal(parseStudentIdentity(' 23101001 '), '23101001');
  assert.equal(parseStudentIdentity('{"type":"santap.student","version":1,"nim":"23101001"}'), '23101001');
  for (const nim of [123, {}, [], null, true, '../123', '']) {
    assert.throws(() => parseStudentIdentity(JSON.stringify({ type: 'santap.student', version: 1, nim })));
  }
  for (const value of [null, '{}', '[]', SERVICE_QR_PAYLOAD, '{"type":"santap.meal-receipt","nim":"123"}']) assert.throws(() => parseStudentIdentity(value));
});

test('public service marker is recognized separately from identity and receipt', () => {
  assert.equal(isServiceQr(SERVICE_QR_PAYLOAD), true);
  for (const value of ['null', '{}', '{broken', '{"type":"santap.service","version":2}', '123']) assert.equal(isServiceQr(value), false);
});

test('malformed queue IDs fail before accessing Firestore', async () => {
  const actor = { role: 'Staff', uid: 'staff' };
  for (const id of [undefined, null, '../queue', {}, '']) {
    await assert.rejects(firestoreOperation(null, actor, 'cancel', { id }), { status: 400, code: 'invalid_queue' });
  }
});

test('mail accepts one plain address and rejects recipient lists or control characters', async () => {
  assert.equal(validEmail('student+demo@unklab.ac.id'), true);
  for (const value of ['a,b@example.com', 'a;other@example.com', 'Name <a@example.com>', 'a@example.com\r\nBcc: b@example.com', 'a@-host.example', 'a@host..example']) assert.equal(validEmail(value), false);
  const transport = nodemailer.createTransport({ streamTransport: true, buffer: true });
  const result = await transport.sendMail({ from: { name: 'SANTAP', address: 'sender@example.com' }, to: 'recipient@example.com', subject: 'Uji lokal', text: 'Tidak dikirim ke jaringan.' });
  assert.deepEqual(result.envelope.to, ['recipient@example.com']);
  assert.match(result.message.toString(), /Subject: Uji lokal/);
});
