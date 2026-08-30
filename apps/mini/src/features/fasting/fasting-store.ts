export type FastingMode = '16:8' | '14:10' | '12:12';
export type FastingPlan = { mode: FastingMode; eatingStart: string; eatingEnd: string; active: boolean; startedAt?: string; endedAt?: string; checkins: string[] };

const KEY = 'heban.local.fasting.v1';
const DEFAULT_PLAN: FastingPlan = { mode: '16:8', eatingStart: '09:00', eatingEnd: '17:00', active: false, checkins: [] };

export function loadFastingPlan(): FastingPlan {
  const value = uni.getStorageSync(KEY);
  if (!value) return { ...DEFAULT_PLAN };
  try { return { ...DEFAULT_PLAN, ...(typeof value === 'string' ? JSON.parse(value) : value) }; } catch { return { ...DEFAULT_PLAN }; }
}
export function saveFastingPlan(patch: Partial<FastingPlan>) { const next = { ...loadFastingPlan(), ...patch }; uni.setStorageSync(KEY, next); return next; }
export function toggleFasting(date = localDate()) { const plan = loadFastingPlan(); const checkins = plan.checkins.includes(date) ? plan.checkins.filter((item) => item !== date) : [...plan.checkins, date]; return saveFastingPlan({ checkins }); }
export function minutes(value: string) { const [hour, minute] = value.split(':').map(Number); return (hour || 0) * 60 + (minute || 0); }
export function durationMinutes(plan: FastingPlan) { const start = minutes(plan.eatingStart); const end = minutes(plan.eatingEnd); return (end - start + 1440) % 1440 || 1440; }
export function progress(plan: FastingPlan, now = new Date()) { const eating = durationMinutes(plan); const current = now.getHours() * 60 + now.getMinutes(); const elapsed = (current - minutes(plan.eatingStart) + 1440) % 1440; return Math.max(0, Math.min(1, elapsed / eating)); }
export function isEatingNow(plan: FastingPlan, now = new Date()) { const current = now.getHours() * 60 + now.getMinutes(); const start = minutes(plan.eatingStart); const end = minutes(plan.eatingEnd); return start < end ? current >= start && current < end : current >= start || current < end; }
export function phaseProgress(plan: FastingPlan, now = new Date()) { const current = now.getHours() * 60 + now.getMinutes(); const start = minutes(plan.eatingStart); const end = minutes(plan.eatingEnd); if (isEatingNow(plan, now)) return Math.max(0, Math.min(1, ((current - start + 1440) % 1440) / durationMinutes(plan))); const fasting = 1440 - durationMinutes(plan); return Math.max(0, Math.min(1, ((current - end + 1440) % 1440) / fasting)); }
export function formatRemaining(plan: FastingPlan, now = new Date()) { const current = now.getHours() * 60 + now.getMinutes(); const target = isEatingNow(plan, now) ? minutes(plan.eatingEnd) : minutes(plan.eatingStart); const remaining = (target - current + 1440) % 1440; return `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}:00`; }
export function localDate() { const now = new Date(); return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }
