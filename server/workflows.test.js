import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { createAccount } from './accounts.js';
import { authenticate } from './auth.js';
import { createHandler } from './emailServer.js';

function services(role = 'Admin') {
  const docs = new Map([['users/caller', { role, name: 'Verified Student', nim: '123' }]]);
  const deleted = [];
  const reference = (collection, id) => ({ key: `${collection}/${id}`, async get() {
    return { exists: docs.has(this.key), data: () => docs.get(this.key) };
  } });
  return {
    docs, deleted,
    auth: {
      async verifyIdToken(token) { if (token !== 'valid') throw new Error('Invalid'); return { uid: 'caller' }; },
      async createUser() { return { uid: 'new-user' }; },
      async deleteUser(uid) { deleted.push(uid); },
      async getUser() { return { email: 'verified@example.com', displayName: 'Verified Student' }; },
      async generatePasswordResetLink() { return 'https://example.com/setup'; },
    },
    db: {
      collection(name) { return { doc: id => reference(name, id) }; },
      async runTransaction(fn) {
        const pending = [];
        await fn({ get: ref => ref.get(), create(ref, data) {
          if (docs.has(ref.key)) throw Object.assign(new Error('Duplicate'), { code: 6 });
          pending.push([ref.key, data]);
        } });
        pending.forEach(([key, data]) => docs.set(key, data));
      },
      batch() {
        const keys = [];
        return { delete(ref) { keys.push(ref.key); }, async commit() { keys.forEach(key => docs.delete(key)); } };
      },
    },
  };
}

test('UID headers and invalid tokens cannot authenticate', async () => {
  const deps = services();
  await assert.rejects(authenticate({ headers: { 'x-firebase-uid': 'caller' } }, deps), { status: 401 });
  await assert.rejects(authenticate({ headers: { authorization: 'Bearer forged' } }, deps), { status: 401 });
});

test('invitation failure preserves created account and returns a retryable result', async () => {
  const deps = services();
  const result = await createAccount({ email: 'nip012@admin.unklab.ac.id', name: 'Admin', role: 'Admin', nip: 'nip012' }, {
    ...deps, sendInvite: async () => { throw new Error('SMTP offline'); },
  });
  assert.equal(result.uid, 'new-user');
  assert.equal(result.invitationSent, false);
  assert.equal(deps.docs.get('users/new-user').role, 'Admin');
  assert.deepEqual(deps.deleted, []);
});

test('duplicate student claim rolls back new auth user without changing existing profile', async () => {
  const deps = services();
  deps.docs.set('studentAccounts/123', { uid: 'existing-user' });
  await assert.rejects(createAccount({ email: '123@student.unklab.ac.id', name: 'Student', role: 'Mahasiswa', nim: '123', faculty: 'Science', residence: 'Penghuni Asrama' }, deps), { status: 409 });
  assert.deepEqual(deps.deleted, ['new-user']);
  assert.equal(deps.docs.get('studentAccounts/123').uid, 'existing-user');
  assert.equal(deps.docs.has('users/new-user'), false);
});

async function request(handler, path, data) {
  const req = Readable.from([JSON.stringify(data)]);
  Object.assign(req, { headers: { authorization: 'Bearer valid' }, method: 'POST', url: path });
  let status, payload;
  const response = { setHeader() {}, writeHead(value) { status = value; }, end(value) { payload = value ? JSON.parse(value) : null; } };
  await handler(req, response);
  return { status, payload };
}

test('Head cannot provision accounts', async () => {
  const result = await request(createHandler({ services: services('Head') }), '/api/admin/users', {});
  assert.equal(result.status, 403);
});

test('student rating can omit suggestion; recipient and identity come from server', async () => {
  const prior = process.env.FEEDBACK_TO;
  process.env.FEEDBACK_TO = 'head@example.com';
  try {
    const sent = [];
    const handler = createHandler({ services: services('Mahasiswa'), sendEmail: async message => sent.push(message) });
    const result = await request(handler, '/api/feedback', { rating: 4, message: '', period: 'Pagi', to: 'attacker@example.com', name: 'Forged' });
    assert.equal(result.status, 200);
    assert.equal(sent[0].to, 'head@example.com');
    assert.equal(sent[0].replyTo, 'verified@example.com');
    assert.match(sent[0].text, /Verified Student/);
    assert.match(sent[0].text, /4\/5/);
    assert.doesNotMatch(sent[0].text, /Forged/);
    assert.equal((await request(handler, '/api/feedback', { rating: 6, period: 'Pagi' })).status, 400);
    assert.equal(sent.length, 1);
  } finally {
    if (prior === undefined) delete process.env.FEEDBACK_TO; else process.env.FEEDBACK_TO = prior;
  }
});
