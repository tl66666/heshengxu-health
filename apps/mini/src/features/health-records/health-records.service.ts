import type { TodayRecordsDto } from '../../../../../packages/contracts/src/health-loop.js';
import type { HealthRecordRequest } from './health-records.mapper.js';
import { userStorageKey } from '../auth/user-storage.js';

const LOCAL_RECORDS_KEY = 'heban.health.records.v1';
type LocalRecordFor<T extends HealthRecordRequest> = T extends HealthRecordRequest
  ? T['data'] & {
  id: string;
      type: T['type'];
    }
  : never;
type LocalRecord = LocalRecordFor<HealthRecordRequest>;

function readLocalRecords(): LocalRecord[] {
  try {
    const value = uni.getStorageSync(userStorageKey(LOCAL_RECORDS_KEY));
    return Array.isArray(value) ? (value as LocalRecord[]) : [];
  } catch {
    return [];
  }
}

function writeLocalRecords(records: LocalRecord[]) {
  try {
    uni.setStorageSync(userStorageKey(LOCAL_RECORDS_KEY), records);
  } catch {
    // Keep the in-memory request successful when storage is temporarily unavailable.
  }
}

function recordDate(record: LocalRecord) {
  const timestamp = new Date(record.recordedAt).getTime();
  return Number.isNaN(timestamp)
    ? ''
    : new Date(timestamp + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function localId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function emptyTodayRecords(): TodayRecordsDto {
  return { weight: null, meals: [], activities: [], sleep: null, timeZone: 'Asia/Shanghai' };
}

function localTodayRecords(date: string): TodayRecordsDto {
  const today = emptyTodayRecords();
  for (const record of readLocalRecords().filter((item) => recordDate(item) === date)) {
    if (record.type === 'weight') {
      today.weight = {
        id: record.id,
        valueKg: record.valueKg,
        recordedAt: record.recordedAt,
        note: record.note || null,
      };
    }
    if (record.type === 'meal-structure') {
      today.meals.push({
        id: record.id,
        mealType: record.mealType,
        hasStaple: record.hasStaple,
        hasProtein: record.hasProtein,
        hasVegetable: record.hasVegetable,
        recordedAt: record.recordedAt,
        note: record.note || null,
      });
    }
    if (record.type === 'activity') {
      today.activities.push({
        id: record.id,
        activityType: record.activityType,
        durationMinutes: record.durationMinutes,
        intensity: record.intensity || null,
        recordedAt: record.recordedAt,
        note: record.note || null,
      });
    }
    if (record.type === 'sleep') {
      today.sleep = {
        id: record.id,
        durationMinutes: record.durationMinutes,
        quality: record.quality,
        sleepAt: record.sleepAt || null,
        wakeAt: record.wakeAt || null,
        recordedAt: record.recordedAt,
        note: record.note || null,
      };
    }
  }
  today.meals.sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
  today.activities.sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
  return today;
}

export function loadTodayRecords(date: string) {
  return Promise.resolve(localTodayRecords(date));
}

export function createHealthRecord(request: HealthRecordRequest) {
  const record = { id: localId(), type: request.type, ...request.data } as LocalRecord;
  const records = readLocalRecords();
  records.push(record);
  writeLocalRecords(records);
  return Promise.resolve(record);
}

export function replaceHealthRecord(
  type: HealthRecordRequest['type'],
  recordId: string,
  data: Record<string, unknown>,
) {
  const records = readLocalRecords();
  const index = records.findIndex((record) => record.id === recordId && record.type === type);
  if (index >= 0) {
    records[index] = { ...records[index], ...data, type } as LocalRecord;
    writeLocalRecords(records);
    return Promise.resolve(records[index]);
  }
  return Promise.reject(new Error('记录不存在'));
}
