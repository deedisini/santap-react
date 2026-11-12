import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import { DEFAULT_OPERATIONS } from '../shared/operations.js';

test('dashboard components render with real Firestore timestamp shapes and WITA warning states', async () => {
  const vite = await createServer({ configFile: false, plugins: [react()], ssr: { external: ['lucide-react'] }, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
  try {
    const student = { nim: '123', name: 'Test Student', faculty: 'Science', residence: 'Non-penghuni', email: 'test@example.com' };
    const queue = [{ id: 'queue', nim: '123', periodId: 'morning', status: 'waiting', joinedAt: { toDate: () => new Date('2026-11-12T07:50:00+08:00') } }];
    const common = { students: [student], student, queue, publicQueue: queue, records: [], period: 'Pagi', periodId: 'morning', periodOpen: true, setPeriodOpen() {}, onAddQueue: async () => ({ ok: true }), onRecord: async () => ({ ok: true }), onCompleteQueue: async () => ({ ok: true }), onCancelQueue: async () => {}, demoMode: true, reminder: true, setReminder() {}, onJoinQueue: async () => ({ ok: true }) };
    for (const [file, expected] of [['StaffPage', 'Batalkan'], ['StudentPage', 'Sudah masuk antrean'], ['SupervisorPage', 'Total pengambilan'], ['AdminPage', 'Buat akun pengguna']]) {
      const module = await vite.ssrLoadModule(`/src/pages/${file}.jsx`);
      assert.match(renderToStaticMarkup(createElement(module.default, common)), new RegExp(expected));
    }
    const { default: Clock } = await vite.ssrLoadModule('/src/components/OperationsClock.jsx');
    const warning = renderToStaticMarkup(createElement(Clock, { now: new Date('2026-11-13T17:50:00+08:00'), config: DEFAULT_OPERATIONS, periods: [] }));
    assert.match(warning, /closing-warning/);
    assert.match(warning, /18:00/);
    const closed = renderToStaticMarkup(createElement(Clock, { now: new Date('2026-11-13T18:00:00+08:00'), config: DEFAULT_OPERATIONS, periods: [] }));
    assert.doesNotMatch(closed, /closing-warning/);
    assert.match(closed, /Di luar jam layanan/);
    const { default: Settings } = await vite.ssrLoadModule('/src/components/OperationsSettings.jsx');
    assert.match(renderToStaticMarkup(createElement(Settings, { config: DEFAULT_OPERATIONS, demoMode: true })), /Buka Jumat/);
  } finally { await vite.close(); }
});
