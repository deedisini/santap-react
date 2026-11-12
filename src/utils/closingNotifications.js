import { DEFAULT_OPERATIONS, periodWindow } from '../../shared/operations.js';
export function buildNotifications(periods, now = new Date(), enabled = true, config = DEFAULT_OPERATIONS) {
  if (!enabled) return [];
  return periods.flatMap(period => {
    const window = periodWindow(period.id, now, config);
    return window?.warning && period.pausedDate !== window.date ? [{ id: window.eventId, expiresAt: window.endAt.toISOString(), tone: 'warning', title: `${window.label} segera ditutup`, message: `Layanan ditutup pukul ${window.close} WITA.` }] : [];
  });
}
