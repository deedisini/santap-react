import { serviceRequest } from './serviceApi.js';
export async function unregisterDevicePush(user) {
  if (!user?.getIdToken) return;
  const key = `santap-push-${user.uid}-token`;
  try {
    const token = localStorage.getItem(key);
    if (token) { await serviceRequest('/api/push/register', { token, enabled: false }, user); localStorage.removeItem(key); }
  } catch { /* Signing out must remain possible if the server is unreachable. */ }
}
