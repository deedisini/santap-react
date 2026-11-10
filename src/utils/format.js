export function todayKey() {
  const date = new Date();
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function currentTime() {
  return new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
}
