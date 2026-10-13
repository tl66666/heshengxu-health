import { userStorageKey } from '../auth/user-storage.js';
import { weekDates, validDate, shanghaiDate } from './calendar.js';
import { exerciseOptions } from './training.js';
import type { DailyEvidence, Journal, LeanPlan, Session } from './types.js';
const KEY = 'heban.lean-muscle.v1';
function empty(): Journal {
  return {
    version: 1,
    plans: {},
    sessions: [],
    evidence: {},
    reviews: {},
    pausedWeeks: [],
    bookmarks: [],
    readingId: null,
  };
}
export function loadJournal(): Journal {
  try {
    const raw = uni.getStorageSync(userStorageKey(KEY));
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!data || data.version !== 1) return empty();
    const plans: Record<string, LeanPlan> = {};
    for (const [week, plan] of Object.entries(
      data.plans && typeof data.plans === 'object' ? data.plans : {},
    )) {
      try {
        if (validDate(week)) {
          validatePlan(plan as LeanPlan);
          plans[week] = plan as LeanPlan;
        }
      } catch {
        /* preserve other valid entries */
      }
    }
    return {
      ...empty(),
      plans,
      sessions: Array.isArray(data.sessions)
        ? data.sessions
            .filter((s: Session) => {
              try {
                return (
                  validSession(s) &&
                  typeof s.id === 'string' &&
                  s.id.startsWith('lean-') &&
                  typeof s.note === 'string'
                );
              } catch {
                return false;
              }
            })
            .map((s: Session) => ({ ...s, recordedAt: sessionTimestamp(s) }))
        : [],
      evidence: Object.fromEntries(
        Object.entries(data.evidence || {}).filter(([d, v]) => validDate(d) && validEvidence(v)),
      ) as Journal['evidence'],
      reviews: Object.fromEntries(
        Object.entries(data.reviews || {}).filter(
          ([d, v]) =>
            validDate(d) &&
            v &&
            typeof (v as { observation?: unknown }).observation === 'string' &&
            typeof (v as { action?: unknown }).action === 'string',
        ),
      ) as Journal['reviews'],
      pausedWeeks: Array.isArray(data.pausedWeeks)
        ? data.pausedWeeks.filter((v: unknown) => typeof v === 'string')
        : [],
      bookmarks: Array.isArray(data.bookmarks)
        ? data.bookmarks.filter((v: unknown) => typeof v === 'string')
        : [],
      readingId: typeof data.readingId === 'string' ? data.readingId : null,
    };
  } catch {
    return empty();
  }
}
function write(journal: Journal) {
  uni.setStorageSync(userStorageKey(KEY), journal);
  return journal;
}
function sessionTimestamp(s: Session) {
  const timestamp = typeof s.recordedAt === 'string' ? new Date(s.recordedAt) : null;
  return timestamp && Number.isFinite(timestamp.getTime()) && shanghaiDate(timestamp) === s.date
    ? s.recordedAt
    : `${s.date}T12:00:00+08:00`;
}
function validEvidence(value: unknown): value is DailyEvidence {
  if (!value || typeof value !== 'object') return false;
  const e = value as DailyEvidence;
  return (
    (e.activity === undefined || e.activity === 'rest' || e.activity === 'missed') &&
    (e.recovered === undefined || typeof e.recovered === 'boolean') &&
    (e.foodComplete === undefined || typeof e.foodComplete === 'boolean') &&
    (e.foodFingerprint === undefined || typeof e.foodFingerprint === 'string') &&
    (e.mainMeals === undefined ||
      (Number.isInteger(e.mainMeals) && e.mainMeals >= 0 && e.mainMeals <= 6)) &&
    (e.balancedMeals === undefined ||
      (Number.isInteger(e.balancedMeals) &&
        e.balancedMeals >= 0 &&
        e.balancedMeals <= (e.mainMeals ?? 6)))
  );
}
export function getWeekPlan(journal: Journal, date = shanghaiDate()): LeanPlan | null {
  const week = weekDates(date)[0]!;
  const key = Object.keys(journal.plans)
    .filter((key) => key <= week)
    .sort()
    .pop();
  return key ? journal.plans[key]! : null;
}
export function validatePlan(plan: LeanPlan) {
  if (
    !plan ||
    !Array.isArray(plan.trainingDays) ||
    !['strength', 'recompose', 'maintain'].includes(plan.direction) ||
    !['home', 'gym'].includes(plan.location) ||
    !['beginner', 'experienced'].includes(plan.experience)
  )
    throw new Error('计划参数无效，请重新设置');
  if (
    !plan.trainingDays.length ||
    plan.trainingDays.length > 5 ||
    new Set(plan.trainingDays).size !== plan.trainingDays.length ||
    plan.trainingDays.some((d) => !Number.isInteger(d) || d < 1 || d > 7)
  )
    throw new Error('请选择每周 1–5 个训练日，并留出恢复日');
  if (
    !Number.isFinite(plan.durationMinutes) ||
    plan.durationMinutes < 5 ||
    plan.durationMinutes > 180
  )
    throw new Error('训练时长应在 5–180 分钟');
  if (
    plan.proteinG !== null &&
    (!Number.isFinite(plan.proteinG) || plan.proteinG <= 0 || plan.proteinG > 300)
  )
    throw new Error('蛋白目标应在 1–300 g，或留空');
  if (!Number.isFinite(plan.sleepMinutes) || plan.sleepMinutes < 420 || plan.sleepMinutes > 600)
    throw new Error('成人睡眠目标请设置在 7–10 小时');
  if (
    !exerciseOptions.some((e) => e.id === plan.representativeId) ||
    !Number.isInteger(plan.representativeReps) ||
    plan.representativeReps < 1 ||
    plan.representativeReps > 100 ||
    !Number.isFinite(plan.representativeLoadKg) ||
    plan.representativeLoadKg < 0 ||
    plan.representativeLoadKg > 300
  )
    throw new Error('请设置有效的代表动作次数与重量');
}
export function savePlan(plan: LeanPlan, effectiveDate = shanghaiDate()) {
  if (!validDate(effectiveDate)) throw new Error('计划日期无效');
  validatePlan(plan);
  const journal = loadJournal();
  const week = weekDates(effectiveDate)[0]!;
  if (journal.plans[week] && week <= weekDates(shanghaiDate())[0]!)
    throw new Error('本周目标已建立，请将调整安排在下一周');
  journal.plans[week] = JSON.parse(JSON.stringify(plan));
  write(journal);
  return plan;
}
function validSession(s: Omit<Session, 'id' | 'recordedAt'>) {
  return (
    !!s &&
    validDate(s.date) &&
    Number.isFinite(s.durationMinutes) &&
    s.durationMinutes > 0 &&
    s.durationMinutes <= 300 &&
    Array.isArray(s.exercises) &&
    s.exercises.length > 0 &&
    s.exercises.every(
      (e) =>
        !!e &&
        exerciseOptions.some((o) => o.id === e.exerciseId) &&
        Array.isArray(e.sets) &&
        e.sets.length > 0 &&
        e.sets.every(
          (set) =>
            !!set &&
            Number.isInteger(set.reps) &&
            set.reps > 0 &&
            set.reps <= 200 &&
            Number.isFinite(set.loadKg) &&
            set.loadKg >= 0 &&
            set.loadKg <= 300,
        ),
    )
  );
}
export function saveSession(input: Omit<Session, 'id' | 'recordedAt'> & { id?: string }) {
  if (!validSession(input) || input.date > shanghaiDate())
    throw new Error('请填写有效的日期、时长、动作次数与重量');
  const journal = loadJournal();
  if (input.id && !journal.sessions.some((s) => s.id === input.id))
    throw new Error('记录不存在，请重新打开');
  const record: Session = {
    ...input,
    note: input.note.trim().slice(0, 200),
    id: input.id || `lean-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    recordedAt:
      journal.sessions.find((s) => s.id === input.id && s.date === input.date)?.recordedAt ||
      (input.date === shanghaiDate() ? new Date().toISOString() : `${input.date}T12:00:00+08:00`),
  };
  journal.sessions = [record, ...journal.sessions.filter((s) => s.id !== record.id)].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  write(journal);
  return record;
}
export function deleteSession(id: string) {
  const journal = loadJournal();
  journal.sessions = journal.sessions.filter((s) => s.id !== id);
  write(journal);
}
export function saveEvidence(date: string, patch: DailyEvidence) {
  if (!validDate(date) || date > shanghaiDate()) throw new Error('不能确认未来的记录');
  if (
    patch.mainMeals !== undefined &&
    (!Number.isInteger(patch.mainMeals) ||
      patch.mainMeals < 0 ||
      patch.mainMeals > 6 ||
      !Number.isInteger(patch.balancedMeals) ||
      patch.balancedMeals! < 0 ||
      patch.balancedMeals! > patch.mainMeals)
  )
    throw new Error('请核对主要餐次和完整结构餐次数');
  const journal = loadJournal();
  journal.evidence[date] = { ...journal.evidence[date], ...patch };
  return write(journal);
}
export function saveReview(date: string, observation: string, action: string) {
  if (!observation.trim() || !action.trim()) throw new Error('请写下一条观察和下一步行动');
  const journal = loadJournal();
  journal.reviews[weekDates(date)[0]!] = {
    observation: observation.trim().slice(0, 200),
    action: action.trim().slice(0, 200),
  };
  return write(journal);
}
export function togglePaused(date: string) {
  const journal = loadJournal();
  const week = weekDates(date)[0]!;
  journal.pausedWeeks = journal.pausedWeeks.includes(week)
    ? journal.pausedWeeks.filter((w) => w !== week)
    : [...journal.pausedWeeks, week];
  return write(journal);
}
export function saveReading(id: string, bookmark?: boolean) {
  const journal = loadJournal();
  journal.readingId = id;
  if (bookmark !== undefined)
    journal.bookmarks = bookmark
      ? [...new Set([...journal.bookmarks, id])]
      : journal.bookmarks.filter((v) => v !== id);
  return write(journal);
}
export function leanActivityRecords() {
  return loadJournal().sessions.map((s) => ({
    id: s.id,
    type: 'activity' as const,
    sourceSessionId: s.id,
    activityType: '力量训练',
    durationMinutes: s.durationMinutes,
    intensity: 'moderate',
    recordedAt: s.recordedAt,
    note: s.note || '薄肌养成 · 详细动作在训练日志中',
  }));
}
