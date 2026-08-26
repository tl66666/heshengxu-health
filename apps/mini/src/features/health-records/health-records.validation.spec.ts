import { describe, expect, it } from 'vitest';
import { validateRecordForm } from './health-records.validation.js';
import type { RecordForm } from './health-records.types.js';

describe('validateRecordForm', () => {
  it('requires a realistic weight', () => {
    const form: RecordForm = { type: 'weight', valueKg: '', note: '' };
    expect(validateRecordForm(form)).toEqual({ valueKg: '请填写体重' });
    expect(validateRecordForm({ ...form, valueKg: '301' })).toEqual({
      valueKg: '体重应在 20 到 300 kg 之间',
    });
  });

  it('requires one meal structure item', () => {
    const form: RecordForm = {
      type: 'meal-structure',
      mealType: 'lunch',
      hasStaple: false,
      hasProtein: false,
      hasVegetable: false,
      note: '',
    };
    expect(validateRecordForm(form)).toEqual({ structure: '至少选择一项餐盘结构' });
  });

  it('validates activity and sleep ranges', () => {
    expect(
      validateRecordForm({ type: 'activity', activityType: '', durationMinutes: '', note: '' }),
    ).toEqual({ activityType: '请填写活动类型', durationMinutes: '请填写活动时长' });
    expect(
      validateRecordForm({ type: 'sleep', durationMinutes: '20', quality: 'good', note: '' }),
    ).toEqual({ durationMinutes: '睡眠时长应在 30 到 1440 分钟之间' });
  });

  it('accepts complete forms', () => {
    expect(validateRecordForm({ type: 'weight', valueKg: '61.8', note: '' })).toEqual({});
    expect(
      validateRecordForm({
        type: 'meal-structure',
        mealType: 'dinner',
        hasStaple: false,
        hasProtein: true,
        hasVegetable: true,
        note: '',
      }),
    ).toEqual({});
  });
});
