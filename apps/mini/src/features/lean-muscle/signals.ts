import { loadMealEntriesWithSource } from '../food/food.service.js';
import type { MealEntry } from '../food/food.summary.js';
import { loadWellnessJournal } from '../wellness/wellness-journal.js';
import { userStorageKey } from '../auth/user-storage.js';
import { weekDates } from './calendar.js';
import type { WeekSignals } from './types.js';
export function foodFingerprint(entries: readonly MealEntry[]) {
  return JSON.stringify(
    entries
      .map((e) => [
        e.id,
        e.recordedAt,
        e.mealType,
        e.grams,
        e.proteinG,
        e.energyKcal,
        e.foodNameSnapshot,
      ])
      .sort((a, b) => String(a[0]).localeCompare(String(b[0]))),
  );
}
export function loadCachedSignals(): WeekSignals {
  try {
    const value = uni.getStorageSync(userStorageKey('heban.lean-muscle.signals.v1'));
    return value && typeof value === 'object'
      ? (Object.fromEntries(
          Object.entries(value).filter(([, v]) => {
            if (!v || typeof v !== 'object') return false;
            const s = v as WeekSignals[string];
            return (
              (s.proteinG === undefined || (Number.isFinite(s.proteinG) && s.proteinG >= 0)) &&
              (s.sleepMinutes === undefined ||
                (Number.isFinite(s.sleepMinutes) && s.sleepMinutes >= 0)) &&
              (s.foodFingerprint === undefined || typeof s.foodFingerprint === 'string')
            );
          }),
        ) as WeekSignals)
      : {};
  } catch {
    return {};
  }
}
export async function loadWeekSignals(date: string): Promise<WeekSignals | null> {
  const account = userStorageKey('lean-signals');
  const results = await Promise.all(
    weekDates(date).map(async (d) => {
      const sleepMinutes = loadWellnessJournal(d).sleep?.durationMinutes;
      try {
        const { entries, complete } = await loadMealEntriesWithSource(d);
        if (!complete) return [d, { sleepMinutes, foodError: true, foodValid: false }] as const;
        return [
          d,
          {
            proteinG: entries.reduce(
              (v, e) => v + (Number.isFinite(e.proteinG) ? e.proteinG : 0),
              0,
            ),
            energyKcal: entries.reduce((v, e) => v + e.energyKcal, 0),
            mealCount: new Set(entries.filter((e) => e.mealType !== 'snack').map((e) => e.mealType))
              .size,
            foodFingerprint: foodFingerprint(entries),
            foodValid: entries.every((e) => Number.isFinite(e.proteinG) && e.proteinG >= 0),
            sleepMinutes,
          },
        ] as const;
      } catch {
        return [d, { sleepMinutes, foodError: true }] as const;
      }
    }),
  );
  if (account !== userStorageKey('lean-signals')) return null;
  const next = Object.fromEntries(results);
  try {
    uni.setStorageSync(userStorageKey('heban.lean-muscle.signals.v1'), {
      ...loadCachedSignals(),
      ...next,
    });
  } catch {
    /* signals remain usable in memory */
  }
  return next;
}
