export type LocalWeightRecord = {
  id: string;
  weight: number;
  recordedAt: string;
  note?: string;
};

const LEGACY_KEY = 'heban-weight-records';
const HEALTH_RECORDS_KEY = 'heban.health.records.v1';

function readArray(key: string): Array<Record<string, unknown>> {
  try {
    const value = uni.getStorageSync(key);
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function normalize(record: Record<string, unknown>): LocalWeightRecord | null {
  const weight = Number(record.weight ?? record.valueKg);
  const recordedAt = String(record.recordedAt || '');
  if (!Number.isFinite(weight) || weight <= 0 || Number.isNaN(new Date(recordedAt).getTime())) {
    return null;
  }
  return {
    id: String(record.id || `weight-${recordedAt}`),
    weight,
    recordedAt,
    note: typeof record.note === 'string' && record.note.trim() ? record.note.trim() : undefined,
  };
}

function persist(records: LocalWeightRecord[]) {
  const sorted = records.slice().sort((a, b) => +new Date(b.recordedAt) - +new Date(a.recordedAt));
  uni.setStorageSync(LEGACY_KEY, sorted);

  const healthRecords = readArray(HEALTH_RECORDS_KEY).filter((record) => record.type !== 'weight');
  const weights = sorted.map((record) => ({
    id: record.id,
    type: 'weight',
    valueKg: record.weight,
    recordedAt: record.recordedAt,
    note: record.note,
  }));
  uni.setStorageSync(HEALTH_RECORDS_KEY, [...healthRecords, ...weights]);
}

export function listLocalWeightRecords(): LocalWeightRecord[] {
  const candidates = [
    ...readArray(LEGACY_KEY),
    ...readArray(HEALTH_RECORDS_KEY).filter((record) => record.type === 'weight'),
  ];
  const byId = new Map<string, LocalWeightRecord>();
  for (const candidate of candidates) {
    const record = normalize(candidate);
    if (record) byId.set(record.id, record);
  }
  return [...byId.values()].sort((a, b) => +new Date(b.recordedAt) - +new Date(a.recordedAt));
}

export function createLocalWeightRecord(input: Omit<LocalWeightRecord, 'id'>) {
  const record = { ...input, id: `weight-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` };
  persist([...listLocalWeightRecords(), record]);
  return record;
}

export function updateLocalWeightRecord(id: string, input: Omit<LocalWeightRecord, 'id'>) {
  const records = listLocalWeightRecords();
  const index = records.findIndex((record) => record.id === id);
  if (index < 0) throw new Error('体重记录不存在');
  const record = { ...input, id };
  records[index] = record;
  persist(records);
  return record;
}

export function deleteLocalWeightRecord(id: string) {
  const records = listLocalWeightRecords();
  persist(records.filter((record) => record.id !== id));
}
