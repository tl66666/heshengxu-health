import { computed, ref } from 'vue';
import type { TodayRecordsDto } from '../../../../../packages/contracts/src/health-loop.js';
import {
  formToRequest,
  formFromTimeline,
  timelineFromToday,
  type HealthRecordRequest,
} from './health-records.mapper.js';
import type { RecordForm, RecordFormErrors, RecordTimelineItem } from './health-records.types.js';
import { validateRecordForm } from './health-records.validation.js';
import {
  createHealthRecord,
  loadTodayRecords,
  replaceHealthRecord,
} from './health-records.service.js';

export function createHealthRecordsStore() {
  const records = ref<TodayRecordsDto | null>(null);
  const loading = ref(false);
  const saving = ref(false);
  const error = ref('');
  const timeline = computed<RecordTimelineItem[]>(() =>
    records.value ? timelineFromToday(records.value) : [],
  );

  async function load(date: string) {
    loading.value = true;
    error.value = '';
    try {
      records.value = await loadTodayRecords(date);
    } catch (reason) {
      error.value = reason instanceof Error ? reason.message : '记录暂时加载失败';
    } finally {
      loading.value = false;
    }
  }

  async function save(
    form: RecordForm,
    date: string,
    editingId: string | null,
  ): Promise<RecordFormErrors> {
    const errors = validateRecordForm(form);
    if (Object.keys(errors).length > 0) return errors;
    saving.value = true;
    error.value = '';
    try {
      const request = formToRequest(form, new Date().toISOString());
      if (editingId)
        await replaceHealthRecord(request.type, editingId, request.data as Record<string, unknown>);
      else await createHealthRecord(request);
      await load(date);
      return {};
    } catch (reason) {
      error.value = reason instanceof Error ? reason.message : '保存失败，请检查网络后重试';
      return { valueKg: error.value };
    } finally {
      saving.value = false;
    }
  }

  function edit(item: RecordTimelineItem): RecordForm | null {
    return records.value ? formFromTimeline(item.type, records.value, item.id) : null;
  }

  return { records, timeline, loading, saving, error, load, save, edit };
}
