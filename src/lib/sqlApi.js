const apiBaseUrl = import.meta.env.VITE_SQL_API_URL || "";

export const sqlEnabled = Boolean(apiBaseUrl);

async function request(path, options = {}, user) {
  if (!user?.getIdToken) throw new Error("Silakan masuk kembali.");
  const token = await user.getIdToken();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}), Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "SQL API request gagal.");
  return data;
}

export const loadSqlData = (user) => request("/api/sql/bootstrap", {}, user);
export const createSqlQueueEntry = (data, user) => request("/api/sql/queues", { method: "POST", body: JSON.stringify(data) }, user);
export const createSqlMealRecord = (data, user) => request("/api/sql/meal-records", { method: "POST", body: JSON.stringify(data) }, user);
export const updateSqlMealPeriod = (periodId, active, user) => request(`/api/sql/meal-periods/${periodId}`, { method: "PATCH", body: JSON.stringify({ active }) }, user);
