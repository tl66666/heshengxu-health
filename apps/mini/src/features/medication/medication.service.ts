import type { MedicationCheckin, MedicationReminder } from './medication.types.js';

const REMINDERS_KEY = 'heban_medication_reminders';
const CHECKINS_KEY = 'heban_medication_checkins';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = uni.getStorageSync(key) as T | string | null;
    if (!raw) return fallback;
    return (typeof raw === 'string' ? JSON.parse(raw) : raw) as T;
  } catch {
    return fallback;
  }
}

export function loadMedicationReminders() {
  const records = read<MedicationReminder[]>(REMINDERS_KEY, []);
  return Array.isArray(records) ? records.filter((item) => item && item.active !== false) : [];
}

export function saveMedicationReminder(reminder: MedicationReminder) {
  const records = read<MedicationReminder[]>(REMINDERS_KEY, []).filter((item) => item.id !== reminder.id);
  records.push(reminder);
  uni.setStorageSync(REMINDERS_KEY, JSON.stringify(records));
}

export function deleteMedicationReminder(id: string) {
  const records = read<MedicationReminder[]>(REMINDERS_KEY, []).filter((item) => item.id !== id);
  uni.setStorageSync(REMINDERS_KEY, JSON.stringify(records));
}

export function loadCheckinsForDate(date: string) {
  const records = read<MedicationCheckin[]>(CHECKINS_KEY, []);
  return Array.isArray(records) ? records.filter((item) => item.date === date) : [];
}

export function setMedicationCheckin(reminderId: string, date: string, checked: boolean) {
  const records = read<MedicationCheckin[]>(CHECKINS_KEY, []).filter(
    (item) => !(item.reminderId === reminderId && item.date === date),
  );
  if (checked) records.push({ reminderId, date, checkedAt: new Date().toISOString() });
  uni.setStorageSync(CHECKINS_KEY, JSON.stringify(records));
}
