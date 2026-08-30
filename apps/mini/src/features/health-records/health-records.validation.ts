import type { RecordForm, RecordFormErrors } from './health-records.types.js';

export function validateRecordForm(form: RecordForm): RecordFormErrors {
  if (form.type === 'weight') {
    const value = Number(form.valueKg);
    if (!form.valueKg.trim()) return { valueKg: '请填写体重' };
    if (!Number.isFinite(value) || value < 20 || value > 300)
      return { valueKg: '体重应在 20 到 300 kg 之间' };
    return {};
  }
  if (form.type === 'meal-structure') {
    if (!form.hasStaple && !form.hasProtein && !form.hasVegetable)
      return { structure: '至少选择一项餐盘结构' };
    return {};
  }
  if (form.type === 'activity') {
    const errors: RecordFormErrors = {};
    const duration = Number(form.durationMinutes);
    if (!form.activityId.trim()) errors.activityType = '请选择运动项目';
    if (!form.durationMinutes.trim()) errors.durationMinutes = '请填写运动时长';
    else if (!Number.isFinite(duration) || duration <= 0)
      errors.durationMinutes = '运动时长需要大于 0 分钟';
    else if (duration > 1440) errors.durationMinutes = '运动时长不能超过 24 小时';
    return errors;
  }
  const duration = Number(form.durationMinutes);
  if (!form.durationMinutes.trim()) return { durationMinutes: '请填写睡眠时长' };
  if (!Number.isFinite(duration) || duration < 30 || duration > 1440)
    return { durationMinutes: '睡眠时长应在 30 到 1440 分钟之间' };
  return {};
}
