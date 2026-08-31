export type MoodTone = 'calm' | 'bright' | 'tired' | 'low' | 'anxious';
export type SleepQuality = 'poor' | 'fair' | 'good';
export type WellnessJournal = {
  date: string;
  mood?: { tone: MoodTone; note: string; recordedAt: string };
  sleep?: { durationMinutes: number; quality: SleepQuality; dream: string; bedtime?: string; wakeTime?: string; recordedAt: string };
};

const KEY = 'heban.local.wellness-journal.v2';
const LEGACY_KEY = 'heban.local.wellness-journal.v1';
function today() { const now = new Date(); return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }
function readMap(): Record<string, WellnessJournal> {
  const raw = uni.getStorageSync(KEY) || uni.getStorageSync(LEGACY_KEY);
  if (!raw) return {};
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (parsed?.journals && typeof parsed.journals === 'object') return parsed.journals;
    if (parsed?.date) return { [parsed.date]: parsed };
  } catch { /* ignore malformed local data */ }
  return {};
}
function writeMap(map: Record<string, WellnessJournal>) { uni.setStorageSync(KEY, { journals: map }); }
export function loadWellnessJournal(date = today()): WellnessJournal { return readMap()[date] || { date }; }
export function listWellnessJournals(limit = 7) { return Object.values(readMap()).sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit); }
export function saveMood(input: { tone: MoodTone; note: string }, date = today()) { const map = readMap(); const next = { ...loadWellnessJournal(date), date, mood: { ...input, recordedAt: new Date().toISOString() } }; map[date] = next; writeMap(map); return next; }
export function saveSleep(input: { durationMinutes?: number; quality: SleepQuality; dream: string; bedtime?: string; wakeTime?: string }, date = today()) { const map = readMap(); const durationMinutes = input.durationMinutes ?? sleepDuration(input.bedtime || '23:00', input.wakeTime || '07:00'); const next = { ...loadWellnessJournal(date), date, sleep: { ...input, durationMinutes, recordedAt: new Date().toISOString() } }; map[date] = next; writeMap(map); return next; }
export function clearMood(date = today()) { const map = readMap(); const next = loadWellnessJournal(date); delete next.mood; map[date] = next; writeMap(map); return next; }
export function clearSleep(date = today()) { const map = readMap(); const next = loadWellnessJournal(date); delete next.sleep; map[date] = next; writeMap(map); return next; }
export function sleepDuration(bedtime: string, wakeTime: string) { const [bh, bm] = bedtime.split(':').map(Number); const [wh, wm] = wakeTime.split(':').map(Number); const start = (bh || 0) * 60 + (bm || 0); const end = (wh || 0) * 60 + (wm || 0); return ((end - start + 1440) % 1440) || 1440; }
export function formatSleepDuration(minutes: number) { return `${Math.floor(minutes / 60)}小时${minutes % 60 ? ` ${minutes % 60}分` : ''}`; }
