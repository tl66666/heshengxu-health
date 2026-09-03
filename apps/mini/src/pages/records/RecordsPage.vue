<template>
  <view class="page">
    <view class="page-head">
      <text class="eyebrow">今天的记录</text>
      <text class="title">轻松记一下</text>
      <text class="subtitle">记录真实生活，不需要算得完美。</text>
    </view>

    <view v-if="store.loading" class="status">正在整理今天的记录...</view>
    <view v-else-if="loadError && !timeline.length" class="error-state">
      <image src="/static/illustrations/xuxu-record-reminder.png" mode="aspectFit" />
      <text>记录暂时没有加载出来</text>
      <button class="secondary-action" @tap="load">重新加载</button>
    </view>

    <template v-else>
      <view v-if="!timeline.length" class="welcome-strip">
        <image src="/static/illustrations/record-desk-banner.png" mode="aspectFit" />
        <view>
          <text>从一件小事开始</text>
          <text>记录不需要完美，真实就已经足够。</text>
        </view>
      </view>

      <view class="type-tabs">
        <button
          v-for="item in types"
          :key="item.type"
          :class="['type-tab', { active: activeType === item.type }]"
          @tap="selectType(item.type)"
        >
          {{ item.label }}
        </button>
      </view>

      <button v-if="activeType === 'meal-structure'" class="food-entry" @tap="openFoodSearch">
        <view class="food-entry-mark">+</view>
        <view class="food-entry-copy"
          ><text>记一份具体食物</text><text>搜索食物并按份量计算热量与营养</text></view
        >
        <image class="food-entry-arrow" src="/static/icons/svg/forward.svg" mode="aspectFit" />
      </button>

      <view v-if="activeType === 'meal-structure' && foodEntries.length" class="food-summary">
        <view class="food-summary-head"
          ><view
            ><text class="food-summary-title">今天的食物</text
            ><text class="food-summary-caption"
              >已记录 {{ foodEntries.length }} 份 · 以保存时的营养快照为准</text
            ></view
          ><text class="food-kcal">{{ foodSummary.energyKcal }} 千卡</text></view
        >
        <view class="macro-strip"
          ><view
            ><text>{{ foodSummary.proteinG }}g</text><text>蛋白质</text></view
          ><view
            ><text>{{ foodSummary.fatG }}g</text><text>脂肪</text></view
          ><view
            ><text>{{ foodSummary.carbohydrateG }}g</text><text>碳水</text></view
          ></view
        >
        <view class="food-list"
          ><view v-for="entry in foodEntries" :key="entry.id" class="food-item"
            ><view class="food-dot" /><view class="food-copy"
              ><text>{{ entry.foodNameSnapshot }}</text
              ><text>{{ mealLabel(entry.mealType) }} · {{ entry.grams }}g</text></view
            ><view class="food-actions"
              ><text class="food-item-kcal">{{ entry.energyKcal }} kcal</text
              ><button class="food-more" @tap="manageFood(entry)">管理</button></view
            ></view
          ></view
        >
      </view>

      <view class="form-section">
        <view class="form-heading">
          <view>
            <text class="form-title">{{ editingId ? '修改这条记录' : formTitle }}</text>
            <text class="form-caption">{{ formCaption }}</text>
          </view>
          <button v-if="editingId" class="cancel-edit" @tap="cancelEdit">取消修改</button>
        </view>

        <template v-if="activeType === 'weight'">
          <view class="field-label"><text>体重</text><text class="unit">kg</text></view>
          <view class="input-wrap" :class="{ invalid: fieldError('valueKg') }">
            <input v-model="weight" type="digit" placeholder="例如 61.8" @input="clearErrors" />
            <text>kg</text>
          </view>
          <text v-if="fieldError('valueKg')" class="field-error">{{ fieldError('valueKg') }}</text>
        </template>

        <template v-else-if="activeType === 'meal-structure'">
          <text class="field-label">哪一餐？</text>
          <view class="choice-row">
            <button
              v-for="item in mealTypes"
              :key="item.value"
              :class="['choice', { selected: mealType === item.value }]"
              @tap="mealType = item.value"
            >
              {{ item.label }}
            </button>
          </view>
          <text class="field-label field-label-spaced">这一餐有这些吗？</text>
          <view class="choice-row">
            <button
              v-for="item in mealFlags"
              :key="item.key"
              :class="['choice', { selected: meal[item.key] }]"
              @tap="meal[item.key] = !meal[item.key]"
            >
              {{ item.label }}
            </button>
          </view>
          <text v-if="fieldError('structure')" class="field-error">{{
            fieldError('structure')
          }}</text>
        </template>

        <template v-else-if="activeType === 'activity'">
          <view class="activity-overview">
            <view>
              <text class="activity-overview-value">{{ activityTotalMinutes }}</text>
              <text class="activity-overview-unit">分钟</text>
            </view>
            <text>今天已记录 {{ activityRecordCount }} 次活动</text>
          </view>
          <text class="field-label">选择运动</text>
          <view class="activity-options">
            <button
              v-for="item in activityOptions"
              :key="item"
              :class="['activity-option', { selected: activityType === item }]"
              @tap="selectActivity(item)"
            >
              {{ item }}
            </button>
          </view>
          <text class="field-label field-label-spaced">其他运动</text>
          <input v-model="activityType" class="text-input" placeholder="例如 步行、拉伸、瑜伽" />
          <text v-if="fieldError('activityType')" class="field-error">{{
            fieldError('activityType')
          }}</text>
          <text class="field-label field-label-spaced">活动时长</text>
          <view class="input-wrap" :class="{ invalid: fieldError('durationMinutes') }">
            <input v-model="activityMinutes" type="number" placeholder="例如 30" />
            <text>分钟</text>
          </view>
          <text v-if="fieldError('durationMinutes')" class="field-error">{{
            fieldError('durationMinutes')
          }}</text>
          <view class="duration-options">
            <button
              v-for="minutes in activityDurationOptions"
              :key="minutes"
              :class="['duration-option', { selected: activityMinutes === String(minutes) }]"
              @tap="selectActivityMinutes(minutes)"
            >
              {{ minutes }} 分钟
            </button>
          </view>
        </template>

        <template v-else>
          <text class="field-label">睡眠时长</text>
          <view class="input-wrap" :class="{ invalid: fieldError('durationMinutes') }">
            <input v-model="sleepMinutes" type="number" placeholder="例如 450" />
            <text>分钟</text>
          </view>
          <text v-if="fieldError('durationMinutes')" class="field-error">{{
            fieldError('durationMinutes')
          }}</text>
          <text class="field-label field-label-spaced">睡眠质量</text>
          <view class="choice-row">
            <button
              v-for="item in qualities"
              :key="item.value"
              :class="['choice', { selected: sleepQuality === item.value }]"
              @tap="sleepQuality = item.value"
            >
              {{ item.label }}
            </button>
          </view>
        </template>

        <input
          v-model="note"
          class="text-input note-input"
          maxlength="280"
          placeholder="补充一点感受（选填）"
        />
        <text v-if="saveError" class="submit-error">{{ saveError }}</text>
        <button class="primary-action" :loading="saving" :disabled="saving" @tap="submit">
          {{ saving ? '保存中...' : editingId ? '保存修改' : '保存记录' }}
        </button>
      </view>

      <view class="timeline-head">
        <text>今天已记录</text>
        <text>{{ timeline.length }} 条</text>
      </view>
      <view v-if="timeline.length" class="timeline">
        <view v-for="item in timeline" :key="item.id" class="timeline-item">
          <view class="timeline-marker" />
          <view class="timeline-copy">
            <text class="timeline-title">{{ item.title }}</text>
            <text class="timeline-desc"
              >{{ item.description }} · {{ timeLabel(item.recordedAt) }}</text
            >
          </view>
          <button class="edit-action" @tap="startEdit(item)">修改</button>
        </view>
      </view>
      <view v-else class="empty-line">保存后，记录会出现在这里。</view>
    </template>

    
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
import { healthLoopState } from '../../features/health-loop/health-loop.store.js';
import { createHealthRecordsStore } from '../../features/health-records/health-records.store.js';
import { consumeRecordTypeFocus } from '../../features/health-records/records-focus.js';
import { deleteMealEntry, loadMealEntries } from '../../features/food/food.service.js';
import { summarizeFoodEntries, type MealEntry } from '../../features/food/food.summary.js';
import type {
  RecordFormErrors,
  RecordTimelineItem,
} from '../../features/health-records/health-records.types.js';

const store = createHealthRecordsStore();
const timeline = store.timeline;
const saving = store.saving;
const loadError = store.loadError;
const saveError = store.saveError;
const date = localDate();
const activeType = ref<HealthRecordType>('weight');
const editingId = ref<string | null>(null);
const errors = ref<RecordFormErrors>({});
const weight = ref('');
const mealType = ref<MealType>('lunch');
const meal = ref({ hasStaple: false, hasProtein: false, hasVegetable: false });
const activityType = ref('步行');
const activityMinutes = ref('');
const sleepMinutes = ref('');
const sleepQuality = ref<SleepQuality>('good');
const note = ref('');
const foodEntries = ref<MealEntry[]>([]);
const foodSummary = computed(() => summarizeFoodEntries(foodEntries.value));
const activityRecordCount = computed(() => store.records.value?.activities.length || 0);
const activityTotalMinutes = computed(() =>
  (store.records.value?.activities || []).reduce(
    (total, activity) => total + activity.durationMinutes,
    0,
  ),
);

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
const activityOptions = ['步行', '拉伸', '瑜伽', '跑步', '骑行', '力量训练'];
const activityDurationOptions = [10, 20, 30, 45, 60];
const formTitle = computed(
  () =>
    ({
      weight: '记录今天的体重',
      'meal-structure': '看看这一餐的结构',
      activity: '记下今天的活动',
      sleep: '补记昨晚的睡眠',
    })[activeType.value],
);
const formCaption = computed(
  () =>
    ({
      weight: '同一时间记录，更容易看见变化',
      'meal-structure': '只看结构，不需要计算热量',
      activity: '短暂的活动也值得被记下来',
      sleep: '了解睡眠，才能理解今天的精力',
    })[activeType.value],
);
function currentForm() {
  if (activeType.value === 'weight')
    return { type: 'weight' as const, valueKg: weight.value, note: note.value };
  if (activeType.value === 'meal-structure')
    return {
      type: 'meal-structure' as const,
      mealType: mealType.value,
      ...meal.value,
      note: note.value,
    };
  if (activeType.value === 'activity')
    return {
      type: 'activity' as const,
      activityType: activityType.value,
      durationMinutes: activityMinutes.value,
      note: note.value,
    };
  return {
    type: 'sleep' as const,
    durationMinutes: sleepMinutes.value,
    quality: sleepQuality.value,
    note: note.value,
  };
}
function fieldError(key: keyof RecordFormErrors) {
  return errors.value[key];
}
function clearErrors() {
  errors.value = {};
}
function selectType(type: HealthRecordType) {
  if (!editingId.value) {
    activeType.value = type;
    errors.value = {};
  }
}
function selectActivity(value: string) {
  activityType.value = value;
  clearErrors();
}
function selectActivityMinutes(value: number) {
  activityMinutes.value = String(value);
  clearErrors();
}
async function submit() {
  const result = await store.save(currentForm(), date, editingId.value);
  errors.value = result.fieldErrors;
  if (!result.persisted) return;
  resetForm();
  await healthLoopState.loadToday(date);
  uni.showToast({ title: '已保存', icon: 'success' });
}
function startEdit(item: RecordTimelineItem) {
  const form = store.edit(item);
  if (!form) return;
  activeType.value = form.type;
  editingId.value = item.id;
  errors.value = {};
  if (form.type === 'weight') {
    weight.value = form.valueKg;
    note.value = form.note;
  }
  if (form.type === 'meal-structure') {
    mealType.value = form.mealType;
    meal.value = {
      hasStaple: form.hasStaple,
      hasProtein: form.hasProtein,
      hasVegetable: form.hasVegetable,
    };
    note.value = form.note;
  }
  if (form.type === 'activity') {
    activityType.value = form.activityType;
    activityMinutes.value = form.durationMinutes;
    note.value = form.note;
  }
  if (form.type === 'sleep') {
    sleepMinutes.value = form.durationMinutes;
    sleepQuality.value = form.quality;
    note.value = form.note;
  }
  uni.pageScrollTo({ scrollTop: 0, duration: 180 });
}
function cancelEdit() {
  editingId.value = null;
  resetForm();
}
function resetForm() {
  weight.value = '';
  activityMinutes.value = '';
  sleepMinutes.value = '';
  note.value = '';
  errors.value = {};
}
function load() {
  store.load(date);
}
function timeLabel(value: string) {
  return new Date(value).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}
function localDate() {
  const n = new Date();
  return new Date(n.getTime() - n.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
function openFoodSearch() {
  uni.navigateTo({ url: '/pages/food-search/FoodSearchPage' });
}
async function loadFoods() {
  try {
    foodEntries.value = await loadMealEntries(date);
  } catch {
    foodEntries.value = [];
  }
}
function mealLabel(type: MealEntry['mealType']) {
  return { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '加餐' }[type];
}
function manageFood(entry: MealEntry) {
  uni.showActionSheet({
    itemList: ['编辑这份记录', '删除这份记录'],
    success: ({ tapIndex }) => {
      if (tapIndex === 0) {
        if (!entry.foodId) {
          uni.showToast({ title: '原食品不可用，请重新记录', icon: 'none' });
          return;
        }
        uni.navigateTo({
          url: `/pages/food-confirm/FoodConfirmPage?entryId=${encodeURIComponent(entry.id)}&foodId=${encodeURIComponent(entry.foodId)}&grams=${entry.grams}&mealType=${entry.mealType}&note=${encodeURIComponent(entry.note || '')}`,
        });
        return;
      }
      uni.showModal({
        title: '删除这份记录？',
        content: '删除后不会出现在当天营养汇总中。',
        confirmColor: '#b85e43',
        success: async ({ confirm }) => {
          if (!confirm) return;
          try {
            await deleteMealEntry(entry.id);
            await loadFoods();
            uni.showToast({ title: '已删除', icon: 'success' });
          } catch {
            uni.showToast({ title: '删除失败，请稍后重试', icon: 'none' });
          }
        },
      });
    },
  });
}
onLoad((options) => {
  if (options?.type && types.some((item) => item.type === options.type))
    activeType.value = options.type as HealthRecordType;
});
onShow(() => {
  const requested = consumeRecordTypeFocus();
  if (requested) activeType.value = requested;
  load();
  loadFoods();
  healthLoopState.loadToday(date);
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;
  padding: calc(env(safe-area-inset-top) + 44rpx) 32rpx calc(env(safe-area-inset-bottom) + 44rpx);
  background: #f6faf7;
  color: #244735;
}
.page-head,
.eyebrow,
.title,
.subtitle,
.field-label {
  display: block;
}
.eyebrow {
  color: #6a9275;
  font-size: 22rpx;
  font-weight: 700;
}
.title {
  margin-top: 8rpx;
  font-size: 42rpx;
  font-weight: 700;
}
.subtitle {
  margin-top: 10rpx;
  color: #70897a;
  font-size: 23rpx;
}
.welcome-strip {
  display: flex;
  align-items: center;
  gap: 16rpx;
  overflow: hidden;
  margin-top: 22rpx;
  border: 1rpx solid #dceadd;
  border-radius: 18rpx;
  background: #fff;
}
.welcome-strip image {
  width: 183rpx;
  height: 122rpx;
  flex: none;
}
.welcome-strip view {
  padding-right: 18rpx;
}
.welcome-strip text {
  display: block;
}
.welcome-strip text:first-child {
  color: #31543e;
  font-size: 26rpx;
  font-weight: 700;
}
.welcome-strip text:last-child {
  margin-top: 6rpx;
  color: #7b9281;
  font-size: 21rpx;
  line-height: 1.45;
}
.type-tabs {
  display: flex;
  gap: 10rpx;
  margin: 26rpx 0 18rpx;
  padding: 6rpx;
  border-radius: 16rpx;
  background: #eaf3eb;
}
.type-tab {
  flex: 1;
  height: 60rpx;
  border: 0;
  border-radius: 12rpx;
  color: #64806e;
  background: transparent;
  font-size: 24rpx;
  line-height: 60rpx;
}
.type-tab.active {
  color: #286b47;
  background: #fff;
  box-shadow: 0 3rpx 10rpx rgba(52, 111, 71, 0.08);
  font-weight: 700;
}
.food-entry {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 92rpx;
  margin: 2rpx 0 22rpx;
  padding: 12rpx 4rpx;
  border-top: 1rpx solid #dceadd;
  border-bottom: 1rpx solid #dceadd;
  text-align: left;
  background: transparent;
}
.food-entry-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52rpx;
  height: 52rpx;
  flex: none;
  margin-right: 14rpx;
  border-radius: 17rpx;
  color: #fff;
  background: #76a77d;
  font-size: 34rpx;
}
.food-entry-copy {
  min-width: 0;
  flex: 1;
}
.food-entry text {
  display: block;
}
.food-entry text:first-child {
  color: #31543e;
  font-size: 25rpx;
  font-weight: 700;
}
.food-entry text:last-child {
  margin-top: 5rpx;
  color: #7d9584;
  font-size: 20rpx;
}
.food-entry-arrow {
  width: 32rpx;
  height: 32rpx;
  flex: none;
  margin-left: 14rpx;
  opacity: 0.68;
}
.food-summary {
  margin: 0 0 24rpx;
  padding: 20rpx 18rpx;
  border: 1rpx solid #dceadd;
  border-radius: 18rpx;
  background: #fff;
}
.food-summary-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.food-summary-title,
.food-summary-caption {
  display: block;
}
.food-summary-title {
  color: #31543e;
  font-size: 27rpx;
  font-weight: 700;
}
.food-summary-caption {
  margin-top: 5rpx;
  color: #82968a;
  font-size: 19rpx;
}
.food-kcal {
  color: #2e7d4f;
  font-size: 26rpx;
  font-weight: 700;
}
.macro-strip {
  display: flex;
  justify-content: space-around;
  margin-top: 18rpx;
  padding: 14rpx 0;
  border-top: 1rpx solid #e3eee4;
  border-bottom: 1rpx solid #e3eee4;
}
.macro-strip view {
  text-align: center;
}
.macro-strip text {
  display: block;
}
.macro-strip text:first-child {
  color: #466d50;
  font-size: 23rpx;
  font-weight: 700;
}
.macro-strip text:last-child {
  margin-top: 4rpx;
  color: #8a9d90;
  font-size: 18rpx;
}
.food-list {
  margin-top: 4rpx;
}
.food-item {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 14rpx 0;
  border-bottom: 1rpx solid #edf3ed;
}
.food-item:last-child {
  border-bottom: 0;
}
.food-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #7eae86;
}
.food-copy {
  flex: 1;
  min-width: 0;
}
.food-copy text {
  display: block;
}
.food-copy text:first-child {
  color: #46664e;
  font-size: 23rpx;
  font-weight: 700;
}
.food-copy text:last-child {
  margin-top: 4rpx;
  color: #8a9d90;
  font-size: 18rpx;
}
.food-item-kcal {
  color: #658570;
  font-size: 20rpx;
}
.food-actions {
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  gap: 6rpx;
}
.food-more {
  padding: 4rpx 8rpx;
  color: #4d7f5a;
  background: #edf6ee;
  font-size: 18rpx;
}
.form-section {
  padding: 6rpx 0 24rpx;
  border-top: 1rpx solid #dceadd;
  border-bottom: 1rpx solid #dceadd;
  background: transparent;
}
.form-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 22rpx;
}
.form-title {
  display: block;
  color: #294d38;
  font-size: 29rpx;
  font-weight: 700;
}
.form-caption {
  display: block;
  margin-top: 6rpx;
  color: #7a9180;
  font-size: 20rpx;
}
.cancel-edit {
  padding: 8rpx 12rpx;
  color: #4f7d5c;
  background: #edf6ee;
  font-size: 21rpx;
}
.field-label {
  margin-bottom: 10rpx;
  color: #5a7864;
  font-size: 23rpx;
  font-weight: 700;
}
.field-label-spaced {
  margin-top: 22rpx;
}
.unit {
  float: right;
  color: #88a091;
  font-size: 20rpx;
  font-weight: 400;
}
.input-wrap,
.text-input {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  height: 78rpx;
  border: 1rpx solid #d6e5d8;
  border-radius: 10rpx;
  color: #2d523a;
  background: #fbfdfb;
  font-size: 25rpx;
}
.input-wrap input {
  flex: 1;
  height: 100%;
  padding: 0 18rpx;
}
.input-wrap > text {
  padding-right: 18rpx;
  color: #718a7a;
  font-size: 22rpx;
}
.text-input {
  display: block;
  padding: 0 18rpx;
}
.note-input {
  margin-top: 20rpx;
}
.invalid {
  border-color: #cf8a73;
  background: #fff8f5;
}
.choice-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}
.choice {
  min-width: 124rpx;
  padding: 13rpx 16rpx;
  border: 1rpx solid #dceadd;
  border-radius: 10rpx;
  color: #597463;
  background: #fff;
  font-size: 22rpx;
}
.choice.selected {
  border-color: #6da57c;
  color: #286b47;
  background: #e8f4e8;
}
.activity-overview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
  padding: 18rpx 20rpx;
  border: 1rpx solid #dbe9de;
  border-radius: 16rpx;
  background: #f2f8f2;
  color: #7a9180;
  font-size: 20rpx;
}
.activity-overview > view {
  display: flex;
  align-items: baseline;
  gap: 5rpx;
}
.activity-overview-value {
  color: #3d7450;
  font-size: 38rpx;
  font-weight: 750;
  line-height: 1;
}
.activity-overview-unit {
  color: #6f8d78;
  font-size: 19rpx;
}
.activity-options,
.duration-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}
.activity-option,
.duration-option {
  min-width: 104rpx;
  height: 58rpx;
  padding: 0 18rpx;
  border: 1rpx solid #dce9df;
  border-radius: 14rpx;
  background: #fff;
  color: #597463;
  font-size: 21rpx;
  line-height: 58rpx;
}
.activity-option.selected,
.duration-option.selected {
  border-color: #86b595;
  background: #eaf5ec;
  color: #306b47;
  font-weight: 700;
}
.duration-options {
  margin-top: 12rpx;
}
.duration-option {
  min-width: 112rpx;
  height: 52rpx;
  color: #6f8878;
  font-size: 19rpx;
  line-height: 52rpx;
}
.field-error,
.submit-error {
  display: block;
  margin-top: 8rpx;
  color: #b85e43;
  font-size: 20rpx;
  line-height: 1.45;
}
.primary-action {
  width: 100%;
  height: 78rpx;
  margin-top: 20rpx;
  border-radius: 14rpx;
  background: var(--hz-primary-soft);
  border: 2rpx solid var(--hz-primary-border);
  color: var(--hz-primary-ink);
  box-shadow: 0 8rpx 20rpx rgba(47, 124, 80, 0.1);
  font-size: 26rpx;
  line-height: 78rpx;
}
.primary-action[disabled] {
  opacity: 0.55;
}
.timeline-head {
  display: flex;
  justify-content: space-between;
  margin: 28rpx 2rpx 12rpx;
  font-size: 28rpx;
  font-weight: 700;
}
.timeline-head text:last-child {
  color: #71907c;
  font-size: 21rpx;
  font-weight: 400;
}
.timeline {
  border-top: 1rpx solid #e4eee5;
}
.timeline-item {
  display: flex;
  align-items: center;
  gap: 14rpx;
  padding: 18rpx 4rpx;
  border-bottom: 1rpx solid #e8f0e9;
}
.timeline-marker {
  width: 14rpx;
  height: 14rpx;
  border: 3rpx solid #7db18a;
  border-radius: 50%;
  background: #f6faf7;
}
.timeline-copy {
  flex: 1;
  min-width: 0;
}
.timeline-title,
.timeline-desc {
  display: block;
}
.timeline-title {
  color: #31543e;
  font-size: 25rpx;
  font-weight: 700;
}
.timeline-desc {
  margin-top: 5rpx;
  color: #7a9180;
  font-size: 20rpx;
}
.edit-action,
.secondary-action {
  color: #3f7d52;
  background: #edf6ee;
  font-size: 21rpx;
}
.edit-action {
  padding: 8rpx 12rpx;
}
.empty-line,
.status {
  padding: 30rpx 0;
  color: #82988a;
  text-align: center;
  font-size: 22rpx;
}
.error-state {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 70rpx 20rpx;
  text-align: center;
}
.error-state image {
  width: 150rpx;
  height: 150rpx;
}
.error-state text {
  margin-top: 14rpx;
  color: #5e7c68;
  font-size: 24rpx;
}
.secondary-action {
  margin-top: 18rpx;
  padding: 14rpx 22rpx;
}
</style>
