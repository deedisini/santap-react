export const TIME_ZONE = 'Asia/Makassar';
export const DEFAULT_OPERATIONS = {
  schedules: {
    morning: { label: 'Pagi', open: '05:30', close: '08:00' },
    afternoon: { label: 'Siang', open: '11:30', close: '13:00' },
    evening: { label: 'Malam', open: '17:00', close: '18:30', weekendOpen: '16:30', weekendClose: '18:00' },
  },
  sabbath: { enabled: true, startTime: '18:00', endTime: '18:00', windows: [] },
};

export function localParts(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23', weekday: 'short',
  }).formatToParts(now).map(part => [part.type, part.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, clock: `${parts.hour}:${parts.minute}:${parts.second}`, weekday: parts.weekday };
}

export function periodWindow(id, now = new Date(), config = DEFAULT_OPERATIONS) {
  const schedule = config.schedules[id];
  if (!schedule) return null;
  const local = localParts(now);
  const exception = id === 'evening' && ['Fri', 'Sat'].includes(local.weekday);
  const open = exception ? schedule.weekendOpen : schedule.open;
  const close = exception ? schedule.weekendClose : schedule.close;
  const startAt = new Date(`${local.date}T${open}:00+08:00`);
  const endAt = new Date(`${local.date}T${close}:00+08:00`);
  return { id, label: schedule.label, date: local.date, open, close, startAt, endAt,
    active: now >= startAt && now < endAt,
    warning: now >= new Date(endAt.getTime() - 600000) && now < endAt,
    eventId: `${local.date}-${id}-${close.replace(':', '')}` };
}

export function activePeriod(now = new Date(), config = DEFAULT_OPERATIONS) {
  return Object.keys(config.schedules).map(id => periodWindow(id, now, config)).find(window => window.active) || null;
}

export function assertServing(id, now, config, pausedDate) {
  const window = periodWindow(id, now, config);
  if (!window?.active || pausedDate === window.date) throw Object.assign(new Error('Periode makan belum dibuka, sedang dijeda, atau sudah ditutup.'), { status: 409, code: 'period_closed' });
  return window;
}

export function validateOperations(input) {
  const clock = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
  const schedules = {};
  for (const [id, defaults] of Object.entries(DEFAULT_OPERATIONS.schedules)) {
    const value = input?.schedules?.[id];
    const keys = id === 'evening' ? ['open', 'close', 'weekendOpen', 'weekendClose'] : ['open', 'close'];
    if (!value || keys.some(key => !clock.test(value[key])) || value.open >= value.close || (id === 'evening' && value.weekendOpen >= value.weekendClose)) throw new Error('Jam layanan tidak valid.');
    schedules[id] = { label: defaults.label, ...Object.fromEntries(keys.map(key => [key, value[key]])) };
  }
  for (const pair of [['open', 'close'], ['weekendOpen', 'weekendClose']]) {
    const ranges = Object.values(schedules).map(value => ({ open: value[pair[0]] || value.open, close: value[pair[1]] || value.close })).sort((a, b) => a.open.localeCompare(b.open));
    if (ranges.some((value, index) => index && value.open < ranges[index - 1].close)) throw new Error('Periode makan tidak boleh tumpang tindih.');
  }
  const sabbath = input?.sabbath;
  if (typeof sabbath?.enabled !== 'boolean' || !Array.isArray(sabbath.windows) || sabbath.windows.length > 60) throw new Error('Konfigurasi Sabat tidak valid.');
  const startTime = sabbath.startTime ?? DEFAULT_OPERATIONS.sabbath.startTime;
  const endTime = sabbath.endTime ?? DEFAULT_OPERATIONS.sabbath.endTime;
  if (!clock.test(startTime) || !clock.test(endTime)) throw new Error('Jam Sabat tidak valid.');
  const windows = sabbath.windows.map(value => {
    const valid = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00\+08:00$/;
    const start = new Date(value.start), end = new Date(value.end);
    if (!valid.test(value.start) || !valid.test(value.end) || !Number.isFinite(+start) || !Number.isFinite(+end) || start >= end || +end - +start > 36 * 3600000 || localParts(start).date !== value.start.slice(0, 10) || localParts(end).date !== value.end.slice(0, 10) || localParts(start).weekday !== 'Fri' || localParts(end).weekday !== 'Sat' || typeof value.source !== 'string' || !value.source.trim() || value.source.length > 500) throw new Error('Masukkan waktu matahari terbenam Jumat dan Sabtu beserta sumbernya.');
    return { start: value.start, end: value.end, source: value.source.trim() };
  }).sort((a, b) => a.start.localeCompare(b.start));
  if (windows.some((value, index) => index && value.start < windows[index - 1].end)) throw new Error('Rentang Sabat tidak boleh tumpang tindih.');
  return { schedules, sabbath: { enabled: sabbath.enabled, startTime, endTime, windows } };
}

export function isSabbath(now, config = DEFAULT_OPERATIONS) {
  const sabbath = config.sabbath ?? DEFAULT_OPERATIONS.sabbath;
  if (!sabbath.enabled) return false;
  if (sabbath.windows.length) return sabbath.windows.some(window => now >= new Date(window.start) && now < new Date(window.end));
  const local = localParts(now);
  return (local.weekday === 'Fri' && local.clock >= `${sabbath.startTime ?? DEFAULT_OPERATIONS.sabbath.startTime}:00`)
    || (local.weekday === 'Sat' && local.clock < `${sabbath.endTime ?? DEFAULT_OPERATIONS.sabbath.endTime}:00`);
}
