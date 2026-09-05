export type FastingMode = '16:8' | '14:10' | '12:12' | '18:6';
export type FastingSession = { id: string; date: string; startedAt: string; endedAt?: string; plannedEndAt?: string; plannedMinutes: number };
export type MealLog = { id: string; date: string; recordedAt: string };
export type FastingPlan = {
  mode: FastingMode;
  eatingStart: string;
  eatingEnd: string;
  active: boolean;
  startedAt?: string;
  endedAt?: string;
  checkins: string[];
  sessions: FastingSession[];
  mealLogs: MealLog[];
};

const KEY = 'heban.local.fasting.v1';
const DEFAULT_PLAN: FastingPlan = { mode: '16:8', eatingStart: '09:00', eatingEnd: '17:00', active: false, checkins: [], sessions: [], mealLogs: [] };

function normalize(value: unknown): FastingPlan {
  if (!value || typeof value !== 'object') return { ...DEFAULT_PLAN };
  const raw = value as Partial<FastingPlan>;
  const sessions = Array.isArray(raw.sessions) ? raw.sessions.filter((item): item is FastingSession => Boolean(item && typeof item.id === 'string' && typeof item.startedAt === 'string')) : [];
  if (!sessions.length && raw.active && raw.startedAt) { const plannedMinutes = 1440 - durationMinutes({ ...DEFAULT_PLAN, ...raw } as FastingPlan); sessions.push({ id: `fast-migrated-${new Date(raw.startedAt).getTime()}`, date: localDate(new Date(raw.startedAt)), startedAt: raw.startedAt, endedAt: raw.endedAt, plannedEndAt: new Date(new Date(raw.startedAt).getTime() + plannedMinutes * 60000).toISOString(), plannedMinutes }); }
  const mealLogs = Array.isArray(raw.mealLogs) ? raw.mealLogs.filter((item): item is MealLog => Boolean(item && typeof item.id === 'string' && typeof item.recordedAt === 'string')) : [];
  const activeSession = sessions.find((item) => !item.endedAt);
  return { ...DEFAULT_PLAN, ...raw, sessions, mealLogs, checkins: Array.isArray(raw.checkins) ? raw.checkins : [], active: Boolean(activeSession || raw.active), startedAt: activeSession?.startedAt ?? raw.startedAt, endedAt: raw.endedAt };
}

export function loadFastingPlan(): FastingPlan {
  const value = uni.getStorageSync(userStorageKey(KEY));
  if (!value) return { ...DEFAULT_PLAN, sessions: [], mealLogs: [] };
  try { return normalize(typeof value === 'string' ? JSON.parse(value) : value); } catch { return { ...DEFAULT_PLAN, sessions: [], mealLogs: [] }; }
}

export function saveFastingPlan(patch: Partial<FastingPlan>) { const next = normalize({ ...loadFastingPlan(), ...patch }); uni.setStorageSync(userStorageKey(KEY), next); return next; }

export function startFasting(at = new Date()) {
  const plan = loadFastingPlan();
  if (plan.active) return plan;
  const plannedMinutes = 1440 - durationMinutes(plan);
  const session: FastingSession = { id: `fast-${at.getTime()}`, date: localDate(at), startedAt: at.toISOString(), plannedEndAt: new Date(at.getTime() + plannedMinutes * 60000).toISOString(), plannedMinutes };
  return saveFastingPlan({ active: true, startedAt: session.startedAt, endedAt: undefined, sessions: [...plan.sessions, session] });
}

export function finishFasting(at = new Date()) {
  const plan = loadFastingPlan();
  const active = [...plan.sessions].reverse().find((item) => !item.endedAt);
  if (!active) return saveFastingPlan({ active: false, endedAt: at.toISOString() });
  const sessions = plan.sessions.map((item) => item.id === active.id ? { ...item, endedAt: at.toISOString() } : item);
  return saveFastingPlan({ active: false, startedAt: active.startedAt, endedAt: at.toISOString(), sessions });
}

export function recordMeal(at = new Date()) {
  const plan = loadFastingPlan();
  const date = localDate(at);
  if (plan.mealLogs.some((item) => item.date === date)) return plan;
  const meal: MealLog = { id: `meal-${at.getTime()}`, date, recordedAt: at.toISOString() };
  return saveFastingPlan({ mealLogs: [...plan.mealLogs, meal], checkins: [...new Set([...plan.checkins, date])] });
}

export function removeMeal(date: string) {
  const plan = loadFastingPlan();
  return saveFastingPlan({ mealLogs: plan.mealLogs.filter((item) => item.date !== date), checkins: plan.checkins.filter((item) => item !== date) });
}

export function toggleFasting(date = localDate()) {
  const plan = loadFastingPlan();
  return plan.mealLogs.some((item) => item.date === date) ? removeMeal(date) : recordMeal(new Date(`${date}T12:00:00`));
}

export function minutes(value: string) { const [hour, minute] = value.split(':').map(Number); return (hour || 0) * 60 + (minute || 0); }
export function durationMinutes(plan: FastingPlan) { const start = minutes(plan.eatingStart); const end = minutes(plan.eatingEnd); return (end - start + 1440) % 1440 || 1440; }
export function progress(plan: FastingPlan, now = new Date()) { const eating = durationMinutes(plan); const current = now.getHours() * 60 + now.getMinutes(); const elapsed = (current - minutes(plan.eatingStart) + 1440) % 1440; return Math.max(0, Math.min(1, elapsed / eating)); }
export function isEatingNow(plan: FastingPlan, now = new Date()) { const current = now.getHours() * 60 + now.getMinutes(); const start = minutes(plan.eatingStart); const end = minutes(plan.eatingEnd); return start < end ? current >= start && current < end : current >= start || current < end; }
export function phaseProgress(plan: FastingPlan, now = new Date()) { const current = now.getHours() * 60 + now.getMinutes(); const start = minutes(plan.eatingStart); const end = minutes(plan.eatingEnd); if (isEatingNow(plan, now)) return Math.max(0, Math.min(1, ((current - start + 1440) % 1440) / durationMinutes(plan))); const fasting = 1440 - durationMinutes(plan); return Math.max(0, Math.min(1, ((current - end + 1440) % 1440) / fasting)); }
export function elapsedSeconds(plan: FastingPlan, now = new Date()) { const session = [...plan.sessions].reverse().find((item) => plan.active ? !item.endedAt : Boolean(item.endedAt)); if (!session) return 0; const end = session.endedAt ? new Date(session.endedAt) : now; return Math.max(0, Math.floor((end.getTime() - new Date(session.startedAt).getTime()) / 1000)); }
export function remainingSeconds(plan: FastingPlan, now = new Date()) { const active = [...plan.sessions].reverse().find((item) => !item.endedAt); if (!active) return 0; const end = active.plannedEndAt ? new Date(active.plannedEndAt).getTime() : new Date(active.startedAt).getTime() + active.plannedMinutes * 60000; return Math.max(0, Math.floor((end - now.getTime()) / 1000)); }
export function formatDuration(totalSeconds: number) { const seconds = Math.max(0, Math.floor(totalSeconds)); return `${String(Math.floor(seconds / 3600)).padStart(2, '0')}:${String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`; }
export function formatRemaining(plan: FastingPlan, now = new Date()) { if (plan.active) return formatDuration(remainingSeconds(plan, now)); const current = now.getHours() * 60 + now.getMinutes(); const target = isEatingNow(plan, now) ? minutes(plan.eatingEnd) : minutes(plan.eatingStart); const remaining = (target - current + 1440) % 1440; return `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}:00`; }
export function localDate(now = new Date()) { return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }
import { userStorageKey } from '../auth/user-storage.js';
