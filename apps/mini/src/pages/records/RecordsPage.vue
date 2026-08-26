<template>
  <view class="page">
    <view class="head"
      ><text class="eyebrow">今天的记录</text><text class="title">轻松记一下</text
      ><text class="hint">不用算热量，记下生活里的真实节律。</text></view
    >
    <view v-if="presentation.isEmpty" class="record-welcome"
      ><image src="/static/illustrations/record-desk-banner.png" mode="aspectFill" /><view
        ><text>从一件小事开始</text><text>记录不需要完美，真实就已经足够。</text></view
      ></view
    >
    <view class="tabs"
      ><button
        v-for="item in types"
        :key="item.type"
        :class="['tab', { active: activeType === item.type }]"
        @tap="activeType = item.type"
      >
        <text>{{ item.label }}</text>
      </button></view
    >
    <XuxuHint
      v-if="!presentation.showReminder"
      class="record-reminder"
      variant="note"
      message="这条记录会帮助你在回顾时看见自己的真实节律。"
    />
    <view v-if="presentation.showReminder" class="scene-reminder"
      ><image src="/static/illustrations/xuxu-record-reminder.png" mode="aspectFill" /><view
        ><text>序序的小提醒</text><text>{{ reminderMessage }}</text></view
      ></view
    >
    <view class="form-card">
      <template v-if="activeType === 'weight'"
        ><text class="form-title">今天的体重</text
        ><view class="input-row"
          ><input v-model="weight" type="digit" placeholder="例如 61.8" /><text>kg</text></view
        ></template
      >
      <template v-else-if="activeType === 'meal-structure'"
        ><text class="form-title">这一餐吃了什么结构？</text
        ><view class="chips"
          ><button
            v-for="item in mealTypes"
            :key="item.value"
            :class="['chip', { selected: mealType === item.value }]"
            @tap="mealType = item.value"
          >
            {{ item.label }}
          </button></view
        ><view class="switches"
          ><button
            v-for="item in mealFlags"
            :key="item.key"
            :class="['switch', { selected: meal[item.key] }]"
            @tap="meal[item.key] = !meal[item.key]"
          >
            <icon :type="meal[item.key] ? 'success_no_circle' : 'circle'" size="16" />
            <text>{{ item.label }}</text>
          </button></view
        ></template
      >
      <template v-else-if="activeType === 'activity'"
        ><text class="form-title">今天做了什么活动？</text
        ><input v-model="activityType" placeholder="例如 步行" /><view class="input-row"
          ><input v-model="activityMinutes" type="number" placeholder="时长" /><text
            >分钟</text
          ></view
        ></template
      >
      <template v-else
        ><text class="form-title">昨晚睡得怎么样？</text
        ><view class="input-row"
          ><input v-model="sleepMinutes" type="number" placeholder="睡眠时长" /><text
            >分钟</text
          ></view
        ><view class="chips"
          ><button
            v-for="item in qualities"
            :key="item.value"
            :class="['chip', { selected: sleepQuality === item.value }]"
            @tap="sleepQuality = item.value"
          >
            {{ item.label }}
          </button></view
        ></template
      >
      <input v-model="note" class="note" maxlength="280" placeholder="想补充一点感受吗？（选填）" />
      <text v-if="formError" class="error">{{ formError }}</text
      ><button class="submit" :loading="saving" @tap="submit">保存记录</button>
    </view>
    <view class="section-head"
      ><text>今天已记录</text><text>{{ timeline.length }} 条</text></view
    >
    <view v-if="timeline.length" class="timeline"
      ><view v-for="item in timeline" :key="item.id" class="timeline-item"
        ><view
          ><text class="timeline-title">{{ item.title }}</text
          ><text class="timeline-desc">{{ item.desc }}</text></view
        ><button class="edit" @tap="edit(item)">修改</button></view
      ></view
    >
    <view v-else-if="!presentation.isEmpty" class="empty"
      ><image src="/static/illustrations/record-desk-banner.png" mode="aspectFill" /><text
        >今天还没有记录</text
      ><text>从一件最容易的小事开始就好。</text></view
    >
    <MiniTabBar active="records" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import type {
  HealthRecordType,
  MealType,
  SleepQuality,
} from '../../../../../packages/contracts/src/health-loop.js';
import XuxuHint from '../../components/XuxuHint.vue';
import MiniTabBar from '../../components/MiniTabBar.vue';
import { recordPresentation } from '../../features/health-loop/record-presentation.js';
import { healthLoopState } from '../../features/health-loop/health-loop.store.js';

const date = localDate();
const activeType = ref<HealthRecordType>('weight');
const saving = ref(false);
const formError = ref('');
const note = ref('');
const weight = ref('');
const mealType = ref<MealType>('lunch');
const meal = ref({ hasStaple: false, hasProtein: false, hasVegetable: false });
const activityType = ref('步行');
const activityMinutes = ref('');
const sleepMinutes = ref('');
const sleepQuality = ref<SleepQuality>('good');
const editingId = ref<string | null>(null);
const types: Array<{ type: HealthRecordType; label: string }> = [
  { type: 'weight', label: '体重' },
  { type: 'meal-structure', label: '饮食' },
  { type: 'activity', label: '活动' },
  { type: 'sleep', label: '睡眠' },
];
const mealTypes: Array<{ value: MealType; label: string }> = [
  { value: 'breakfast', label: '早餐' },
  { value: 'lunch', label: '午餐' },
  { value: 'dinner', label: '晚餐' },
  { value: 'snack', label: '加餐' },
];
const mealFlags: Array<{ key: keyof typeof meal.value; label: string }> = [
  { key: 'hasStaple', label: '主食' },
  { key: 'hasProtein', label: '蛋白质' },
  { key: 'hasVegetable', label: '蔬菜' },
];
const qualities: Array<{ value: SleepQuality; label: string }> = [
  { value: 'poor', label: '不太好' },
  { value: 'fair', label: '一般' },
  { value: 'good', label: '挺好' },
];
const presentation = computed(() => {
  const progress = healthLoopState.today.value?.recordingProgress;
  return recordPresentation(
    activeType.value,
    progress || {
      hasWeight: false,
      hasMeal: false,
      hasActivity: false,
      hasSleep: false,
    },
  );
});
const reminderMessage = computed(() => {
  return {
    weight: '今天还没有体重记录，想记的时候再记一条就好。',
    'meal-structure': '这一餐可以只看看有没有主食、蛋白质和蔬菜。',
    activity: '短暂的步行也值得被记录下来。',
    sleep: '补记昨晚睡眠，会帮助理解今天的精力。',
  }[activeType.value];
});
const timeline = computed(() => {
  const r = healthLoopState.today.value?.todayRecords;
  if (!r) return [];
  return [
    r.weight && {
      id: r.weight.id,
      type: 'weight' as const,
      title: `体重 ${r.weight.valueKg} kg`,
      desc: '今天记录',
    },
    ...r.meals.map((x) => ({
      id: x.id,
      type: 'meal-structure' as const,
      title: mealLabel(x.mealType),
      desc: `${x.hasStaple ? '主食 ' : ' '}${x.hasProtein ? '蛋白质 ' : ''}${x.hasVegetable ? '蔬菜' : ''}`.trim(),
    })),
    ...r.activities.map((x) => ({
      id: x.id,
      type: 'activity' as const,
      title: x.activityType,
      desc: `${x.durationMinutes} 分钟`,
    })),
    r.sleep && {
      id: r.sleep.id,
      type: 'sleep' as const,
      title: '睡眠',
      desc: `${r.sleep.durationMinutes} 分钟 · ${qualityLabel(r.sleep.quality)}`,
    },
  ].filter(Boolean) as Array<{ id: string; type: HealthRecordType; title: string; desc: string }>;
});
function now() {
  return new Date().toISOString();
}
async function submit() {
  formError.value = '';
  const data = buildData();
  if (!data) return;
  saving.value = true;
  try {
    if (editingId.value)
      await healthLoopState.replaceRecord(activeType.value, editingId.value, data, date);
    else await healthLoopState.createRecord({ type: activeType.value, data } as never, date);
    reset();
    uni.showToast({ title: '已保存', icon: 'success' });
  } catch (e) {
    formError.value = e instanceof Error ? e.message : '保存失败，请稍后再试';
  } finally {
    saving.value = false;
  }
}
function buildData(): Record<string, unknown> | null {
  if (activeType.value === 'weight') {
    if (!Number(weight.value)) {
      formError.value = '请填写体重';
      return null;
    }
    return { valueKg: Number(weight.value), recordedAt: now(), note: note.value || undefined };
  }
  if (activeType.value === 'meal-structure')
    return {
      mealType: mealType.value,
      ...meal.value,
      recordedAt: now(),
      note: note.value || undefined,
    };
  if (activeType.value === 'activity') {
    if (!activityType.value || !Number(activityMinutes.value)) {
      formError.value = '请填写活动和时长';
      return null;
    }
    return {
      activityType: activityType.value,
      durationMinutes: Number(activityMinutes.value),
      recordedAt: now(),
      note: note.value || undefined,
    };
  }
  if (!Number(sleepMinutes.value)) {
    formError.value = '请填写睡眠时长';
    return null;
  }
  return {
    durationMinutes: Number(sleepMinutes.value),
    quality: sleepQuality.value,
    recordedAt: now(),
    note: note.value || undefined,
  };
}
function edit(item: { id: string; type: HealthRecordType }) {
  activeType.value = item.type;
  editingId.value = item.id;
  const r = healthLoopState.today.value?.todayRecords;
  if (item.type === 'weight' && r?.weight) weight.value = String(r.weight.valueKg);
  if (item.type === 'sleep' && r?.sleep) {
    sleepMinutes.value = String(r.sleep.durationMinutes);
    sleepQuality.value = r.sleep.quality;
  }
  uni.pageScrollTo({ scrollTop: 0, duration: 200 });
}
function reset() {
  editingId.value = null;
  note.value = '';
  weight.value = '';
  activityMinutes.value = '';
  sleepMinutes.value = '';
}
function load() {
  healthLoopState.loadToday(date);
}
function mealLabel(type: MealType) {
  return { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '加餐' }[type];
}
function qualityLabel(value: SleepQuality) {
  return { poor: '不太好', fair: '一般', good: '挺好' }[value];
}
function localDate() {
  const n = new Date();
  return new Date(n.getTime() - n.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
onLoad((options) => {
  if (options?.type && types.some((x) => x.type === options.type))
    activeType.value = options.type as HealthRecordType;
});
onShow(load);
</script>

<style scoped>
.page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 48rpx 32rpx 198rpx;
  background: #f6faf7;
  color: #1d3d2a;
}
.eyebrow,
.title,
.hint {
  display: block;
}
.eyebrow {
  color: #659078;
  font-size: 23rpx;
  font-weight: 700;
}
.title {
  margin-top: 10rpx;
  font-size: 46rpx;
  font-weight: 700;
}
.hint {
  margin-top: 10rpx;
  color: #70897a;
  font-size: 24rpx;
}
.record-welcome {
  display: flex;
  align-items: center;
  gap: 18rpx;
  overflow: hidden;
  margin: 22rpx 0 6rpx;
  border: 2rpx solid #dceadd;
  border-radius: 18rpx;
  background: #fff;
}
.record-welcome image {
  width: 174rpx;
  height: 142rpx;
}
.record-welcome view {
  flex: 1;
  padding-right: 16rpx;
}
.record-welcome text {
  display: block;
  color: #31543e;
  font-size: 26rpx;
  font-weight: 700;
}
.record-welcome text:last-child {
  margin-top: 6rpx;
  color: #728a7b;
  font-size: 21rpx;
  font-weight: 400;
  line-height: 1.45;
}
.record-reminder {
  margin-bottom: 12rpx;
}
.scene-reminder {
  display: flex;
  align-items: center;
  gap: 14rpx;
  margin: 0 0 18rpx;
  padding: 14rpx 16rpx;
  border: 2rpx solid #d9e8dc;
  border-radius: 16rpx;
  background: #f1f8f1;
}
.scene-reminder image {
  width: 78rpx;
  height: 78rpx;
  flex: none;
  border-radius: 50%;
}
.scene-reminder view {
  min-width: 0;
}
.scene-reminder text {
  display: block;
  color: #3d7050;
  font-size: 22rpx;
  font-weight: 700;
}
.scene-reminder text:last-child {
  margin-top: 5rpx;
  color: #6d8876;
  font-size: 21rpx;
  font-weight: 400;
  line-height: 1.45;
}
.tabs {
  display: flex;
  gap: 10rpx;
  margin: 28rpx 0 18rpx;
  overflow: auto;
  padding-bottom: 2rpx;
}
.tab {
  display: inline-flex;
  align-items: center;
  gap: 7rpx;
  flex: none;
  padding: 14rpx 18rpx;
  border: 2rpx solid #dceadd;
  border-radius: 30rpx;
  color: #597463;
  background: #fff;
  font-size: 23rpx;
}
.tab.active {
  border-color: #75aa81;
  color: #286b47;
  background: #e7f4e9;
}
.tab icon {
  opacity: 0.7;
}
.tab.active icon {
  opacity: 1;
}
.form-card {
  padding: 24rpx;
  border: 2rpx solid #dceade;
  border-radius: 20rpx;
  background: #fff;
}
.form-title {
  display: block;
  margin-bottom: 20rpx;
  font-size: 29rpx;
  font-weight: 700;
}
.input-row,
input {
  box-sizing: border-box;
  width: 100%;
  height: 84rpx;
  padding: 0 22rpx;
  border: 2rpx solid #dce9dd;
  border-radius: 14rpx;
  color: #2b5039;
  background: #fff;
  font-size: 27rpx;
}
.input-row {
  display: flex;
  align-items: center;
  padding: 0;
}
.input-row input {
  border: 0;
}
.input-row text {
  padding-right: 22rpx;
  color: #6f8b79;
  font-size: 24rpx;
}
.chips,
.switches {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}
.chip,
.switch {
  display: inline-flex;
  align-items: center;
  gap: 7rpx;
  padding: 16rpx 18rpx;
  border: 2rpx solid #dce9dd;
  border-radius: 14rpx;
  color: #55735f;
  background: #fff;
  font-size: 24rpx;
}
.selected {
  border-color: #74aa80 !important;
  color: #246d47 !important;
  background: #e6f4e8 !important;
}
.switches {
  margin-top: 16rpx;
}
.note {
  margin-top: 18rpx;
}
.error {
  display: block;
  margin-top: 14rpx;
  color: #b85e43;
  font-size: 23rpx;
}
.submit {
  width: 100%;
  height: 84rpx;
  margin-top: 20rpx;
  border-radius: 15rpx;
  color: #fff;
  background: #40865a;
  font-size: 28rpx;
  line-height: 84rpx;
}
.section-head {
  display: flex;
  justify-content: space-between;
  margin: 30rpx 0 16rpx;
  font-size: 29rpx;
  font-weight: 700;
}
.section-head text:last-child {
  color: #6c8977;
  font-size: 23rpx;
  font-weight: 400;
}
.timeline-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12rpx;
  padding: 20rpx;
  border-radius: 16rpx;
  background: #fff;
}
.timeline-title,
.timeline-desc {
  display: block;
}
.timeline-title {
  font-size: 27rpx;
  font-weight: 700;
}
.timeline-desc {
  margin-top: 5rpx;
  color: #718a7a;
  font-size: 22rpx;
}
.edit {
  padding: 9rpx 15rpx;
  color: #387b50;
  background: #edf6ee;
  font-size: 22rpx;
}
.empty {
  overflow: hidden;
  border: 2rpx solid #dceadd;
  border-radius: 20rpx;
  background: #fff;
  text-align: center;
}
.empty image {
  width: 100%;
  height: 200rpx;
}
.empty text {
  display: block;
  margin: 8rpx 0;
  color: #557363;
  font-size: 27rpx;
}
.empty text:last-child {
  margin-bottom: 24rpx;
  color: #829a8b;
  font-size: 22rpx;
}
</style>
