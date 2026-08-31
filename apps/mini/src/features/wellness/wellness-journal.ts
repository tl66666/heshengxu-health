export type MoodTone = 'calm' | 'bright' | 'tired' | 'low' | 'anxious';
export type WellnessJournal = {
  date: string;
  mood?: { tone: MoodTone; note: string; recordedAt: string };
  sleep?: { durationMinutes: number; quality: 'poor' | 'fair' | 'good'; dream: string; recordedAt: string };
};

const KEY = 'heban.local.wellness-journal.v1';
function today() { const now = new Date(); return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }
export function loadWellnessJournal(date = today()): WellnessJournal { const raw = uni.getStorageSync(KEY); if (!raw) return { date }; try { const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw; return parsed?.date === date ? parsed : { date }; } catch { return { date }; } }
export function saveMood(input: { tone: MoodTone; note: string }, date = today()) { const next = { ...loadWellnessJournal(date), date, mood: { ...input, recordedAt: new Date().toISOString() } }; uni.setStorageSync(KEY, next); return next; }
export function saveSleep(input: { durationMinutes: number; quality: 'poor' | 'fair' | 'good'; dream: string }, date = today()) { const next = { ...loadWellnessJournal(date), date, sleep: { ...input, recordedAt: new Date().toISOString() } }; uni.setStorageSync(KEY, next); return next; }
export function clearMood(date = today()) { const next = loadWellnessJournal(date); delete next.mood; uni.setStorageSync(KEY, next); return next; }
export function clearSleep(date = today()) { const next = loadWellnessJournal(date); delete next.sleep; uni.setStorageSync(KEY, next); return next; }
