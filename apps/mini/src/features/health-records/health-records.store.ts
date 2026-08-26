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
  const loadError = ref('');
  const saveError = ref('');
  const timeline = computed<RecordTimelineItem[]>(() =>
    records.value ? timelineFromToday(records.value) : [],
  );

  async function load(date: string) {
    loading.value = true;
    loadError.value = '';
    try {
      records.value = await loadTodayRecords(date);
    } catch (reason) {
      loadError.value = reason instanceof Error ? reason.message : '记录暂时加载失败';
    } finally {
      loading.value = false;
    }
  }

  async function save(
    form: RecordForm,
    date: string,
    editingId: string | null,
  ): Promise<{ fieldErrors: RecordFormErrors; persisted: boolean }> {
    const fieldErrors = validateRecordForm(form);
    if (Object.keys(fieldErrors).length > 0) return { fieldErrors, persisted: false };
    saving.value = true;
    saveError.value = '';
    try {
      const request = formToRequest(form, new Date().toISOString());
      if (editingId)
        await replaceHealthRecord(request.type, editingId, request.data as Record<string, unknown>);
      else await createHealthRecord(request);
      await load(date);
      return { fieldErrors: {}, persisted: true };
    } catch (reason) {
      saveError.value = reason instanceof Error ? reason.message : '保存失败，请检查网络后重试';
      return { fieldErrors: {}, persisted: false };
    } finally {
      saving.value = false;
    }
  }

  function edit(item: RecordTimelineItem): RecordForm | null {
    return records.value ? formFromTimeline(item.type, records.value, item.id) : null;
  }

  return { records, timeline, loading, saving, loadError, saveError, load, save, edit };
}
