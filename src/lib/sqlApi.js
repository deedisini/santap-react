const apiBaseUrl = import.meta.env.VITE_SQL_API_URL || "";

export const sqlEnabled = Boolean(apiBaseUrl);

async function request(path, options = {}, user) {
  if (!user?.getIdToken) throw new Error("Silakan masuk kembali.");
  for (const forceRefresh of [false, true]) {
    const token = await user.getIdToken(forceRefresh);
    let response;
    try {
      response = await fetch(`${apiBaseUrl}${path}`, {
        ...options,
        headers: { "Content-Type": "application/json", ...(options.headers || {}), Authorization: `Bearer ${token}` },
      });
    } catch {
      throw new Error("Server data MySQL tidak dapat dihubungi. Jalankan npm run sql-server, lalu periksa MariaDB dan VITE_SQL_API_URL.");
    }
    let data;
    try { data = await response.json(); }
    catch { throw new Error(`Server data MySQL mengembalikan respons tidak valid (HTTP ${response.status}).`); }
    if (response.status === 401 && data?.code === 'unauthorized' && !forceRefresh) continue;
    if (!response.ok) throw new Error(data.message || "Permintaan ke server data MySQL gagal.");
    return data;
  }
  throw new Error("Silakan masuk kembali untuk memperbarui sesi.");
}

export const loadSqlData = (user) => request("/api/sql/bootstrap", {}, user);
export const createSqlQueueEntry = (data, user) => request("/api/sql/queues", { method: "POST", body: JSON.stringify(data) }, user);
export const createSqlMealRecord = (data, user) => request("/api/sql/meal-records", { method: "POST", body: JSON.stringify(data) }, user);
export const updateSqlMealPeriod = (periodId, active, user) => request(`/api/sql/meal-periods/${periodId}`, { method: "PATCH", body: JSON.stringify({ active }) }, user);
export const cancelSqlQueue = (id, user) => request('/api/sql/cancel', { method: 'POST', body: JSON.stringify({ id }) }, user);
