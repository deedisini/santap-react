function parseClock(value) {
  const match = String(value || "").match(/(\d{1,2})[.:](\d{2})/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function localDateKey(date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

export function getPeriodWindow(period, now) {
  const times = String(period.time || period.servingTime || "").split(/\s*(?:–|-|to)\s*/i);
  const start = parseClock(times[0]);
  const end = parseClock(times[1]);
  if (start === null || end === null) return null;
  const startAt = new Date(now);
  startAt.setHours(Math.floor(start / 60), start % 60, 0, 0);
  const endAt = new Date(now);
  endAt.setHours(Math.floor(end / 60), end % 60, 0, 0);
  if (end <= start) endAt.setDate(endAt.getDate() + 1);
  return { startAt, endAt };
}

export function buildNotifications(periods, now = new Date(), reminderEnabled = true) {
  if (!reminderEnabled) return [];
  const notifications = [];
  for (const period of periods || []) {
    const window = getPeriodWindow(period, now);
    if (!window) continue;
    const minutesUntilClose = Math.ceil((window.endAt.getTime() - now.getTime()) / 60000);
    const dateKey = localDateKey(now);
    if (period.active && minutesUntilClose > 0 && minutesUntilClose <= 15) {
      notifications.push({
        id: `${dateKey}-${period.id}-closing`,
        tone: "warning",
        title: `${period.label} segera ditutup`,
        message: `Periode makan berakhir dalam ${minutesUntilClose} menit.`,
      });
    }
    if (period.active && minutesUntilClose <= 0) {
      notifications.push({
        id: `${dateKey}-${period.id}-overdue`,
        tone: "error",
        title: `${period.label} melewati jadwal`,
        message: "Periode perlu ditutup sebelum menerima pengambilan baru.",
      });
    }
  }
  return notifications;
}

export function isPeriodExpired(period, now = new Date()) {
  const window = getPeriodWindow(period, now);
  return Boolean(window && window.endAt.getTime() <= now.getTime());
}
