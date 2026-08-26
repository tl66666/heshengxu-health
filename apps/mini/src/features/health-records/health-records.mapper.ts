import type {
  ActivityRecordDto,
  CreateActivityRecordRequest,
  CreateMealStructureRecordRequest,
  CreateSleepRecordRequest,
  CreateWeightRecordRequest,
  MealStructureRecordDto,
  SleepRecordDto,
  TodayRecordsDto,
  WeightRecordDto,
} from '../../../../../packages/contracts/src/health-loop.js';
import type { RecordForm, RecordTimelineItem } from './health-records.types.js';

export type HealthRecordRequest =
  | { type: 'weight'; data: CreateWeightRecordRequest }
  | { type: 'meal-structure'; data: CreateMealStructureRecordRequest }
  | { type: 'activity'; data: CreateActivityRecordRequest }
  | { type: 'sleep'; data: CreateSleepRecordRequest };

export function formToRequest(form: RecordForm, recordedAt: string): HealthRecordRequest {
  if (form.type === 'weight')
    return {
      type: form.type,
      data: { valueKg: Number(form.valueKg), recordedAt, note: form.note || undefined },
    };
  if (form.type === 'meal-structure')
    return {
      type: form.type,
      data: {
        mealType: form.mealType,
        hasStaple: form.hasStaple,
        hasProtein: form.hasProtein,
        hasVegetable: form.hasVegetable,
        recordedAt,
        note: form.note || undefined,
      },
    };
  if (form.type === 'activity')
    return {
      type: form.type,
      data: {
        activityType: form.activityType.trim(),
        durationMinutes: Number(form.durationMinutes),
        recordedAt,
        note: form.note || undefined,
      },
    };
  return {
    type: form.type,
    data: {
      durationMinutes: Number(form.durationMinutes),
      quality: form.quality,
      recordedAt,
      note: form.note || undefined,
    },
  };
}

export function timelineFromToday(records: TodayRecordsDto): RecordTimelineItem[] {
  const items: RecordTimelineItem[] = [];
  if (records.weight) items.push(weightTimeline(records.weight));
  items.push(...records.meals.map(mealTimeline));
  items.push(...records.activities.map(activityTimeline));
  if (records.sleep) items.push(sleepTimeline(records.sleep));
  return items.sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
}

export function formFromTimeline(
  type: RecordTimelineItem['type'],
  records: TodayRecordsDto,
  id: string,
): RecordForm | null {
  if (type === 'weight' && records.weight?.id === id)
    return { type, valueKg: String(records.weight.valueKg), note: records.weight.note || '' };
  if (type === 'meal-structure') {
    const record = records.meals.find((item) => item.id === id);
    if (record)
      return {
        type,
        mealType: record.mealType,
        hasStaple: record.hasStaple,
        hasProtein: record.hasProtein,
        hasVegetable: record.hasVegetable,
        note: record.note || '',
      };
  }
  if (type === 'activity') {
    const record = records.activities.find((item) => item.id === id);
    if (record)
      return {
        type,
        activityType: record.activityType,
        durationMinutes: String(record.durationMinutes),
        note: record.note || '',
      };
  }
  if (type === 'sleep' && records.sleep?.id === id)
    return {
      type,
      durationMinutes: String(records.sleep.durationMinutes),
      quality: records.sleep.quality,
      note: records.sleep.note || '',
    };
  return null;
}

function weightTimeline(record: WeightRecordDto): RecordTimelineItem {
  return {
    id: record.id,
    type: 'weight',
    title: `体重 ${record.valueKg} kg`,
    description: '今天记录',
    recordedAt: record.recordedAt,
  };
}
function mealTimeline(record: MealStructureRecordDto): RecordTimelineItem {
  const parts = [
    record.hasStaple && '主食',
    record.hasProtein && '蛋白质',
    record.hasVegetable && '蔬菜',
  ].filter(Boolean);
  return {
    id: record.id,
    type: 'meal-structure',
    title: mealLabel(record.mealType),
    description: parts.join(' · '),
    recordedAt: record.recordedAt,
  };
}
function activityTimeline(record: ActivityRecordDto): RecordTimelineItem {
  return {
    id: record.id,
    type: 'activity',
    title: record.activityType,
    description: `${record.durationMinutes} 分钟`,
    recordedAt: record.recordedAt,
  };
}
function sleepTimeline(record: SleepRecordDto): RecordTimelineItem {
  return {
    id: record.id,
    type: 'sleep',
    title: '睡眠',
    description: `${record.durationMinutes} 分钟 · ${qualityLabel(record.quality)}`,
    recordedAt: record.recordedAt,
  };
}
function mealLabel(type: MealStructureRecordDto['mealType']) {
  return { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '加餐' }[type];
}
function qualityLabel(value: SleepRecordDto['quality']) {
  return { poor: '不太好', fair: '一般', good: '挺好' }[value];
}
