import { DEFAULT_OPERATIONS, localParts, periodWindow } from '../../shared/operations.js';
export const students = [
  { nim: "23101001", name: "Adrian Matthew", faculty: "Informatika", residence: "Penghuni Asrama", email: "adrianmatthew@unklab.ac.id" },
  { nim: "23101002", name: "Clara Elizabeth", faculty: "Sistem Informasi", residence: "Non-penghuni", email: "claraelizabeth@unklab.ac.id" },
  { nim: "23101003", name: "Nathaniel Joseph", faculty: "Informatika", residence: "Penghuni Asrama", email: "nathanieljoseph@unklab.ac.id" },
  { nim: "23101004", name: "Michelle Grace", faculty: "Akuntansi", residence: "Non-penghuni", email: "michellegrace@unklab.ac.id" },
  { nim: "23101005", name: "Daniel Samuel", faculty: "Teknik Sipil", residence: "Penghuni Asrama", email: "danielsamuel@unklab.ac.id" }
];

export const mealPeriods = Object.keys(DEFAULT_OPERATIONS.schedules).map(id => {
  const window = periodWindow(id);
  return { id, label: window.label, time: `${window.open}–${window.close}`, active: window.active };
});

export const initialQueue = [
  { id: 1, nim: "23101002", periodId: "morning", status: "waiting", joinedAt: "06:12" },
  { id: 2, nim: "23101003", periodId: "morning", status: "waiting", joinedAt: "06:14" },
  { id: 3, nim: "23101004", periodId: "morning", status: "waiting", joinedAt: "06:15" }
];

export const initialRecords = [
  { id: 1, nim: "23101005", periodId: "morning", period: "Pagi", date: localParts().date, time: "07:03", staff: "Staff Demo", verificationToken: "demo-receipt-1" }
];

// Ringkasan demo mingguan untuk mensimulasikan pola kebutuhan porsi Dining Hall.
// Nilai ini tidak menggantikan mealRecords Firebase; hanya dipakai saat mode demo.
export const demoWeeklyHistory = [
  { daysAgo: 6, morning: 286, afternoon: 574, evening: 592 },
  { daysAgo: 5, morning: 301, afternoon: 612, evening: 603 },
  { daysAgo: 4, morning: 318, afternoon: 598, evening: 621 },
  { daysAgo: 3, morning: 277, afternoon: 563, evening: 580 },
  { daysAgo: 2, morning: 295, afternoon: 608, evening: 614 },
  { daysAgo: 1, morning: 309, afternoon: 621, evening: 637 },
  { daysAgo: 0, morning: 300, afternoon: 600, evening: 600 },
];
