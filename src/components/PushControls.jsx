import { useEffect, useRef, useState } from 'react';
import { getApp } from 'firebase/app';
import { serviceRequest } from '../lib/serviceApi.js';

export default function PushControls({ user, demoMode, notifications, reminder }) {
  const key = `santap-push-${user.uid}`;
  const [enabled, setEnabled] = useState(() => { try { return localStorage.getItem(key) === 'true'; } catch { return false; } });
  const [message, setMessage] = useState('Pengingat tetap tersedia di aplikasi.');
  const [busy, setBusy] = useState(false);
  const [remote, setRemote] = useState(false);
  const tokenRef = useRef(null);
  const seen = useRef(new Set());

  useEffect(() => {
    if (!enabled || !reminder || demoMode || !('Notification' in window) || Notification.permission !== 'granted') return;
    let disposed = false;
    async function register() {
      try {
        const registration = await navigator.serviceWorker.register('/notifications-sw.js');
        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
        const { getMessaging, getToken, isSupported } = await import('firebase/messaging');
        if (!vapidKey || !(await isSupported())) { setMessage('Notifikasi perangkat aktif saat aplikasi terbuka. Push latar belakang belum dikonfigurasi.'); return; }
        const token = await getToken(getMessaging(getApp()), { vapidKey, serviceWorkerRegistration: registration });
        await serviceRequest('/api/push/register', { token }, user);
        if (disposed) { await serviceRequest('/api/push/register', { token, enabled: false }, user); return; }
        tokenRef.current = token;
        try { localStorage.setItem(`${key}-token`, token); } catch { /* Registration still works without preference storage. */ }
        setRemote(true);
        setMessage('Perangkat terdaftar untuk push. Pengiriman memerlukan worker server yang aktif.');
      } catch (error) { if (!disposed) setMessage(`Push belum tersedia: ${error.message}. Pengingat aplikasi tetap aktif.`); }
    }
    register();
    return () => {
      disposed = true; setRemote(false);
      if (tokenRef.current) {
        serviceRequest('/api/push/register', { token: tokenRef.current, enabled: false }, user).catch(() => {});
        tokenRef.current = null;
      }
    };
  }, [enabled, reminder, demoMode, user]);

  useEffect(() => {
    if (!enabled || !reminder || remote || !('Notification' in window) || Notification.permission !== 'granted') return;
    for (const item of notifications) {
      if (seen.current.has(item.id)) continue;
      seen.current.add(item.id);
      navigator.serviceWorker?.ready.then(registration => registration.active?.postMessage({ type: 'closing', data: { eventId: item.id, title: item.title, body: item.message, expiresAt: item.expiresAt } }));
    }
  }, [enabled, reminder, remote, notifications]);

  async function toggle() {
    setBusy(true);
    try {
      if (enabled) { localStorage.setItem(key, 'false'); setEnabled(false); setMessage('Push dinonaktifkan. Pengingat aplikasi tetap tersedia.'); return; }
      if (!('Notification' in window) || !('serviceWorker' in navigator) || !window.isSecureContext) { setMessage('Browser tidak mendukung notifikasi perangkat. Gunakan pengingat aplikasi.'); return; }
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') { setMessage('Izin notifikasi belum diberikan. Pengingat aplikasi tetap tersedia.'); return; }
      await navigator.serviceWorker.register('/notifications-sw.js');
      localStorage.setItem(key, 'true'); setEnabled(true);
      setMessage(demoMode ? 'Notifikasi demo hanya bekerja saat aplikasi terbuka.' : 'Menghubungkan notifikasi perangkat...');
    } catch (error) { setMessage(`Notifikasi perangkat belum tersedia: ${error.message}`); }
    finally { setBusy(false); }
  }
  return <section className="push-controls" aria-label="Pengingat perangkat"><button type="button" className="button secondary" disabled={busy} onClick={toggle}>{busy ? 'Memproses...' : enabled ? 'Nonaktifkan push perangkat ini' : 'Aktifkan push perangkat ini'}</button><p role="status">{message}</p></section>;
}
