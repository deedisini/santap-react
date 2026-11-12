export async function serviceRequest(path, data, user) {
  if (typeof user?.getIdToken !== "function") {
    throw new Error("Silakan masuk kembali untuk melanjutkan.");
  }
  for (const forceRefresh of [false, true]) {
    const token = await user.getIdToken(forceRefresh);
    if (!token) throw new Error("Sesi tidak valid. Silakan masuk kembali.");
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    let result;
    try {
      result = await response.json();
    } catch {
      throw new Error(`Server mengembalikan respons yang tidak valid (HTTP ${response.status}). Periksa hasil operasi sebelum mencoba kembali.`);
    }
    if (response.status === 401 && result?.code === 'unauthorized' && !forceRefresh) continue;
    if (!response.ok) {
      throw Object.assign(new Error(typeof result?.message === "string" && result.message.trim()
        ? result.message : `Permintaan gagal (HTTP ${response.status}).`), { status: response.status, code: result?.code });
    }
    if (!result || typeof result !== "object" || Array.isArray(result)) {
      throw new Error("Respons server tidak valid. Periksa hasil operasi sebelum mencoba kembali.");
    }
    return result;
  }
  throw new Error("Silakan masuk kembali untuk melanjutkan.");
}
