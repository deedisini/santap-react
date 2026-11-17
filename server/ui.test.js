import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';
import { createElement } from 'react';

test('demo preserves meals across roles, validates NIM, opens Head views and allows re-entry', async () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
  const originals = new Map();
  for (const [name, value] of Object.entries({ window: dom.window, document: dom.window.document, navigator: dom.window.navigator, localStorage: dom.window.localStorage, HTMLElement: dom.window.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true })) {
    originals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
  }
  // Deterministic serving time, independent of the date/time of the test machine.
  const NativeDate = Date;
  globalThis.Date = class extends NativeDate {
    constructor(...args) { super(...(args.length ? args : ['2026-11-16T07:00:00+08:00'])); }
    static now() { return new NativeDate('2026-11-16T07:00:00+08:00').valueOf(); }
  };
  dom.window.HTMLCanvasElement.prototype.getContext = () => null;
  const vite = await createServer({ configFile: false, mode: 'demo', oxc: { jsx: { runtime: 'automatic' } }, ssr: { external: true }, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, hmr: false, ws: false, watch: null }, appType: 'custom', logLevel: 'error' });
  const { render, fireEvent, screen, waitFor, cleanup } = await import('@testing-library/react');
  try {
    const { default: App } = await vite.ssrLoadModule('/src/App.jsx');
    render(createElement(App));
    assert.ok(screen.getByText('Kartu Mahasiswa'));
    const roleSelect = () => screen.getByRole('combobox', { name: /Pilih role demo|Gunakan demo sebagai/i });
    fireEvent.change(roleSelect(), { target: { value: 'Staff' } });
    fireEvent.change(screen.getByLabelText('NIM / Nomor registrasi'), { target: { value: 'tidak-ada' } });
    fireEvent.click(screen.getByRole('button', { name: 'Identifikasi', exact: true }));
    assert.ok(screen.getByText(/Mahasiswa tidak ditemukan/));
    fireEvent.change(screen.getByLabelText('NIM / Nomor registrasi'), { target: { value: '23101001' } });
    fireEvent.click(screen.getByRole('button', { name: 'Catat pengambilan' }));
    await waitFor(() => assert.ok(screen.getByText(/Pengambilan Adrian Matthew berhasil dicatat/)));
    assert.equal(screen.getByRole('button', { name: 'Sudah tercatat' }).disabled, true);
    fireEvent.change(roleSelect(), { target: { value: 'Mahasiswa' } });
    assert.ok(screen.getByText(/Pengambilan periode ini sudah tercatat pada/));
    assert.equal(screen.getByRole('button', { name: 'Pengambilan sudah tercatat' }).disabled, true);
    fireEvent.change(roleSelect(), { target: { value: 'Head' } });
    assert.ok(screen.getByText('Total pengambilan'));
    fireEvent.click(screen.getByRole('button', { name: 'Antrean & Validasi', exact: true }));
    assert.ok(screen.getByText('Identifikasi mahasiswa'));
    fireEvent.click(screen.getByRole('button', { name: 'Monitoring', exact: true }));
    assert.ok(screen.getByText('Total pengambilan'));
    fireEvent.click(screen.getByRole('button', { name: 'Keluar', exact: true }));
    await waitFor(() => assert.ok(screen.getByRole('heading', { name: 'Masuk ke SANTAP' })));
    fireEvent.click(screen.getByRole('button', { name: 'Buka demo lokal' }));
    assert.ok(screen.getByText('Kartu Mahasiswa'));
  } finally {
    cleanup();
    await new Promise(resolve => setTimeout(resolve, 50));
    await vite.close(); dom.window.close(); globalThis.Date = NativeDate;
    for (const [name, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name];
    }
  }
});
