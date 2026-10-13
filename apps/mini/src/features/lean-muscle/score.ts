import { getWeekPlan } from './store.js';
import { weekDates, weekday } from './calendar.js';
import type { Journal, ScoreDimension, WeekSignals } from './types.js';
const cap = (v: number) => Math.min(1, Math.max(0, v));
const dimension = (
  id: string,
  title: string,
  weight: number,
  points: number,
  upper: number,
  coverage: number,
  detail: string,
  formula: string,
): ScoreDimension => ({
  id,
  title,
  weight,
  points: Math.round(points * 100) / 100,
  upper: Math.min(weight, Math.round(upper * 100) / 100),
  coverage: cap(coverage),
  detail,
  formula,
});
export function scoreWeek(journal: Journal, signals: WeekSignals, date: string) {
  const dates = weekDates(date);
  const week = dates[0]!;
  const plan = getWeekPlan(journal, date);
  const sessions = journal.sessions.filter((s) => dates.includes(s.date));
  const trained = new Set(sessions.map((s) => s.date));
  const knownActivity = dates.filter((d) => trained.has(d) || !!journal.evidence[d]?.activity);
  const target = plan?.trainingDays.length || 2;
  const trainingPoints = 35 * cap(trained.size / target);
  const trainingUpper = 35 * cap((trained.size + 7 - knownActivity.length) / target);
  let food = 0,
    foodKnown = 0,
    sleep = 0,
    sleepKnown = 0;
  for (const d of dates) {
    const evidence = journal.evidence[d];
    const signal = signals[d];
    if (
      plan?.proteinG &&
      evidence?.foodComplete &&
      evidence.foodFingerprint === signal?.foodFingerprint &&
      signal?.foodValid !== false &&
      Number.isFinite(signal?.proteinG) &&
      evidence.mainMeals !== undefined &&
      evidence.balancedMeals !== undefined
    ) {
      food +=
        (15 * cap(signal!.proteinG! / plan.proteinG)) / 7 +
        (10 * (evidence.mainMeals > 0 ? cap(evidence.balancedMeals / evidence.mainMeals) : 0)) / 7;
      foodKnown++;
    }
    if (plan && Number.isFinite(signal?.sleepMinutes) && signal!.sleepMinutes! >= 0) {
      sleep += (20 * cap(signal!.sleepMinutes! / plan.sleepMinutes)) / 7;
      sleepKnown++;
    }
  }
  const restDates = dates.filter((d) => !plan?.trainingDays.includes(weekday(d)));
  const knownRecovery = restDates.filter(
    (d) => trained.has(d) || typeof journal.evidence[d]?.recovered === 'boolean',
  );
  const goodRecovery = knownRecovery.filter(
    (d) => journal.evidence[d]?.recovered && !trained.has(d),
  );
  const recovery = restDates.length ? (5 * goodRecovery.length) / restDates.length : 0;
  const recoveryUpper =
    recovery +
    (restDates.length ? (5 * (restDates.length - knownRecovery.length)) / restDates.length : 5);
  const representative = plan
    ? sessions.flatMap((s) =>
        s.exercises
          .filter((e) => e.exerciseId === plan.representativeId)
          .map((e) => e.sets[0]!)
          .filter((s) => s.loadKg === plan.representativeLoadKg),
      )
    : [];
  const representativePoints =
    plan && representative.length
      ? 10 * cap(Math.max(...representative.map((s) => s.reps)) / plan.representativeReps)
      : 0;
  const representativeKnown = !!plan && (representative.length > 0 || knownActivity.length === 7);
  const representativePotential =
    representativeKnown && date >= dates[6]! && knownActivity.length === 7
      ? representativePoints
      : 10;
  const review = journal.reviews[week];
  const reviewPoints = review?.observation && review.action ? 5 : 0;
  const dimensions = [
    dimension(
      'training',
      '力量训练',
      35,
      trainingPoints,
      trainingUpper,
      trainingPoints === 35 ? 1 : knownActivity.length / 7,
      `${trained.size} / ${target} 个训练日，同一天只计一次`,
      '35 × 实际训练日数 / 目标日数，最高 35 分',
    ),
    dimension(
      'food',
      '饮食支持',
      25,
      food,
      food + (25 * (7 - foodKnown)) / 7,
      foodKnown / 7,
      plan?.proteinG
        ? `${foodKnown} / 7 天饮食已确认完整 · 蛋白目标 ${plan.proteinG} g`
        : '先在目标设置中确认个人蛋白目标',
      '蛋白目标完成度 15 分 + 主要餐次结构 10 分，七天平均',
    ),
    dimension(
      'recovery',
      '睡眠恢复',
      25,
      sleep + recovery,
      sleep + (20 * (7 - sleepKnown)) / 7 + recoveryUpper,
      ((sleepKnown / 7) * 20 +
        (restDates.length ? knownRecovery.length / restDates.length : 0) * 5) /
        25,
      `${sleepKnown} / 7 夜睡眠 · ${goodRecovery.length} 个恢复日已确认`,
      '睡眠目标完成度 20 分 + 计划恢复日 5 分，超额不加分',
    ),
    dimension(
      'progress',
      '个人进步',
      15,
      representativePoints + reviewPoints,
      representativePotential + (reviewPoints || 5),
      ((representativeKnown ? 10 : 0) + reviewPoints) / 15,
      representativeKnown
        ? `代表动作 ${representativePoints.toFixed(1)} / 10 · 周复盘 ${reviewPoints} / 5`
        : '完成代表动作第一组，建立个人基线',
      '同一变式、器械和重量的指定第一组目标 10 分 + 周复盘 5 分',
    ),
  ];
  const paused = journal.pausedWeeks.includes(week);
  const coverage = Math.round(dimensions.reduce((v, d) => v + d.coverage * d.weight, 0));
  const lower = Math.floor(dimensions.reduce((v, d) => v + d.points, 0));
  const upper = Math.ceil(dimensions.reduce((v, d) => v + d.upper, 0));
  const complete =
    !!plan && !paused && date >= dates[6]! && dimensions.every((d) => d.coverage >= 1);
  const total = complete ? Math.round(dimensions.reduce((v, d) => v + d.points, 0)) : null;
  return {
    week,
    dates,
    plan,
    sessions,
    trainedDays: trained.size,
    dimensions,
    coverage,
    lower,
    upper,
    total,
    paused,
    label: paused
      ? '恢复周'
      : !plan || coverage === 0
        ? '建立记录中'
        : total !== null
          ? `${total}`
          : `${lower}–${upper}`,
    tier:
      total === null ? '' : total >= 80 ? '节律较稳定' : total >= 50 ? '正在形成节律' : '刚开始',
  };
}
