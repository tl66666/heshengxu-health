export type WeeklyReviewInput = {
  anchorDate: string;
  weights: ReadonlyArray<{ recordedAt: string; valueKg: number }>;
  meals: ReadonlyArray<{ recordedAt: string; energyKcal: number }>;
  activities: ReadonlyArray<{ recordedAt: string; durationMinutes: number }>;
  sleeps: ReadonlyArray<{ recordedAt: string; durationMinutes: number }>;
  tasks: ReadonlyArray<{ status: string }>;
};

type WeeklyRange = { startDate: string; endDate: string };

export type WeeklyReview = {
  timeZone: 'Asia/Shanghai';
  range: WeeklyRange;
  coverage: { recordedDayCount: number; requiredDayCount: 3; status: 'insufficient' | 'ready' };
  weight: {
    recordCount: number;
    firstKg?: number;
    lastKg?: number;
    changeKg?: number;
    points: Array<{ date: string; valueKg: number }>;
  };
  food: { recordedDayCount: number; entryCount: number; energyKcal: number };
  activity: { recordCount: number; durationMinutes: number };
  sleep: { recordCount: number; durationMinutes: number };
  plan: { taskCount: number; completedTaskCount: number };
};

export function buildWeeklyReview(input: WeeklyReviewInput): WeeklyReview {
  const range = weekRangeForShanghai(input.anchorDate);
  const weights = inWeek(input.weights, range).sort((left, right) => left.recordedAt.localeCompare(right.recordedAt));
  const meals = inWeek(input.meals, range);
  const activities = inWeek(input.activities, range);
  const sleeps = inWeek(input.sleeps, range);
  const recordedDays = new Set([
    ...weights.map((item) => shanghaiDate(item.recordedAt)),
    ...meals.map((item) => shanghaiDate(item.recordedAt)),
    ...activities.map((item) => shanghaiDate(item.recordedAt)),
    ...sleeps.map((item) => shanghaiDate(item.recordedAt)),
  ]);
  const firstWeight = weights[0];
  const lastWeight = weights.at(-1);
  const weight = {
    recordCount: weights.length,
    points: weights.map((item) => ({ date: shanghaiDate(item.recordedAt), valueKg: item.valueKg })),
    ...(weights.length >= 2 && firstWeight && lastWeight
      ? {
          firstKg: firstWeight.valueKg,
          lastKg: lastWeight.valueKg,
          changeKg: round(lastWeight.valueKg - firstWeight.valueKg),
        }
      : {}),
  };

  return {
    timeZone: 'Asia/Shanghai',
    range,
    coverage: {
      recordedDayCount: recordedDays.size,
      requiredDayCount: 3,
      status: recordedDays.size >= 3 ? 'ready' : 'insufficient',
    },
    weight,
    food: {
      recordedDayCount: new Set(meals.map((item) => shanghaiDate(item.recordedAt))).size,
      entryCount: meals.length,
      energyKcal: round(meals.reduce((total, item) => total + item.energyKcal, 0)),
    },
    activity: {
      recordCount: activities.length,
      durationMinutes: activities.reduce((total, item) => total + item.durationMinutes, 0),
    },
    sleep: {
      recordCount: sleeps.length,
      durationMinutes: sleeps.reduce((total, item) => total + item.durationMinutes, 0),
    },
    plan: {
      taskCount: input.tasks.length,
      completedTaskCount: input.tasks.filter((item) => item.status === 'completed').length,
    },
  };
}

function inWeek<T extends { recordedAt: string }>(items: ReadonlyArray<T>, range: WeeklyRange) {
  return items.filter((item) => {
    const date = shanghaiDate(item.recordedAt);
    return date >= range.startDate && date <= range.endDate;
  });
}

export function weekRangeForShanghai(anchorDate: string): WeeklyRange {
  const anchor = parseDate(anchorDate);
  const mondayOffset = (anchor.getUTCDay() + 6) % 7;
  anchor.setUTCDate(anchor.getUTCDate() - mondayOffset);
  const end = new Date(anchor);
  end.setUTCDate(end.getUTCDate() + 6);
  return { startDate: dateOnly(anchor), endDate: dateOnly(end) };
}

function shanghaiDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error('recordedAt must be an ISO date');
  return dateOnly(new Date(date.getTime() + 8 * 60 * 60 * 1000));
}

function parseDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new Error('anchorDate must use YYYY-MM-DD');
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
}

function dateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}
