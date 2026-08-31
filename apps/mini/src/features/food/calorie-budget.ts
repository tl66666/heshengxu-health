export type CalorieEntry = { energyKcal: number };

export function sumCalories(entries: readonly CalorieEntry[]) {
  return Math.round(
    entries.reduce((sum, entry) => sum + Math.max(0, Number(entry.energyKcal) || 0), 0),
  );
}

export function calorieBudget(targetKcal: number, consumedKcal: number) {
  const target = Math.max(0, Math.round(Number(targetKcal) || 0));
  const consumed = Math.max(0, Math.round(Number(consumedKcal) || 0));
  return {
    targetKcal: target,
    consumedKcal: consumed,
    remainingKcal: Math.max(0, target - consumed),
    overByKcal: Math.max(0, consumed - target),
  };
}
