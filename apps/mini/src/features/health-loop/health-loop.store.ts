import { ref } from 'vue';
import type {
  DailyHomeDto,
  PersonalPlanDto,
} from '../../../../../packages/contracts/src/health-loop.js';
import {
  completeTask as completeTaskRequest,
  createRecord as createRecordRequest,
  loadPlan,
  loadToday,
  replaceRecord as replaceRecordRequest,
  savePlan as savePlanRequest,
  type RecordRequest,
} from './health-loop.service.js';
import { completeLocalTask, createLocalDailyHome, saveLocalPlan } from './local-demo.js';

const today = ref<DailyHomeDto | null>(null);
const plan = ref<PersonalPlanDto | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

export const healthLoopState = {
  today,
  plan,
  loading,
  error,
  async loadToday(date: string) {
    loading.value = true;
    error.value = null;
    try {
      today.value = await loadToday(date);
      plan.value = today.value.activePlan;
    } catch (reason) {
      error.value = reason instanceof Error ? reason.message : '暂时无法加载今日状态';
      const localToday = createLocalDailyHome(date);
      if (localToday) {
        today.value = localToday;
        plan.value = localToday.activePlan;
        error.value = null;
      }
    } finally {
      loading.value = false;
    }
  },
  async loadPlan(date: string) {
    plan.value = await loadPlan(date);
  },
  async savePlan(data: Parameters<typeof savePlanRequest>[0], date: string) {
    try {
      plan.value = await savePlanRequest(data);
    } catch {
      plan.value = saveLocalPlan(data);
    }
    await this.loadToday(date);
  },
  async createRecord(request: RecordRequest, date: string) {
    await createRecordRequest(request);
    await this.loadToday(date);
  },
  async replaceRecord(
    type: RecordRequest['type'],
    recordId: string,
    data: Record<string, unknown>,
    date: string,
  ) {
    await replaceRecordRequest(type, recordId, data);
    await this.loadToday(date);
  },
  async completeTask(taskId: string, date: string) {
    try {
      await completeTaskRequest(taskId);
    } catch {
      completeLocalTask(taskId);
    }
    await this.loadToday(date);
  },
};
