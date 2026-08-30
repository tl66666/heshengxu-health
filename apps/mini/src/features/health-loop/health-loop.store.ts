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
const HOME_CACHE_PREFIX = 'heshengxu.daily-home.';
const pendingLoads = new Map<string, Promise<void>>();
let offlineUntil = 0;

export const healthLoopState = {
  today,
  plan,
  loading,
  error,
  async loadToday(date: string, options: { force?: boolean } = {}) {
    if (!options.force && today.value?.date === date) return;
    if (!options.force && Date.now() < offlineUntil) {
      const fallback =
        (uni.getStorageSync(`${HOME_CACHE_PREFIX}${date}`) as DailyHomeDto | null) ||
        createLocalDailyHome(date);
      if (fallback) {
        today.value = fallback;
        plan.value = fallback.activePlan;
      }
      return;
    }
    const pending = pendingLoads.get(date);
    if (pending) return pending;
    const task = this.loadTodayInternal(date);
    pendingLoads.set(date, task);
    try {
      await task;
    } finally {
      pendingLoads.delete(date);
    }
  },
  async loadTodayInternal(date: string) {
    const cachedToday = uni.getStorageSync(`${HOME_CACHE_PREFIX}${date}`) as DailyHomeDto | null;
    const localToday = cachedToday || createLocalDailyHome(date);
    if (!today.value && localToday) {
      today.value = localToday;
      plan.value = localToday.activePlan;
    }
    loading.value = !today.value;
    error.value = null;
    try {
      today.value = await loadToday(date);
      plan.value = today.value.activePlan;
      uni.setStorageSync(`${HOME_CACHE_PREFIX}${date}`, today.value);
    } catch (reason) {
      offlineUntil = Date.now() + 30_000;
      error.value = reason instanceof Error ? reason.message : '暂时无法加载今日状态';
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
    await this.loadToday(date, { force: true });
  },
  async createRecord(request: RecordRequest, date: string) {
    await createRecordRequest(request);
    await this.loadToday(date, { force: true });
  },
  async replaceRecord(
    type: RecordRequest['type'],
    recordId: string,
    data: Record<string, unknown>,
    date: string,
  ) {
    await replaceRecordRequest(type, recordId, data);
    await this.loadToday(date, { force: true });
  },
  async completeTask(taskId: string, date: string) {
    try {
      await completeTaskRequest(taskId);
    } catch {
      completeLocalTask(taskId);
    }
    await this.loadToday(date, { force: true });
  },
};
