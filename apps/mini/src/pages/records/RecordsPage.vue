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
        <image src="/static/illustrations/xuxu-record-reminder.png" mode="aspectFit" />
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

      <button class="food-entry" @tap="openFoodSearch">
        <view class="food-entry-mark">+</view>
        <view class="food-entry-copy"
          ><text>记一份具体食物</text><text>搜索食物并按份量计算热量与营养</text></view
        >
        <image class="food-entry-arrow" src="/static/icons/svg/forward.svg" mode="aspectFit" />
      </button>

      <view v-if="foodEntries.length" class="food-summary">
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
          <view class="activity-banner">
            <image src="/static/illustrations/record-desk-banner.png" mode="aspectFit" />
            <view class="activity-banner-copy">
              <text>今天动了什么？</text>
              <text>选项目和时长，消耗仅作参考</text>
            </view>
          </view>

          <scroll-view class="activity-categories" scroll-x>
            <view class="activity-category-row">
              <button
                v-for="category in activityCategories"
                :key="category"
                :class="['activity-category', { selected: activityCategory === category }]"
                @tap="activityCategory = category"
              >
                {{ category }}
              </button>
            </view>
          </scroll-view>

          <view class="activity-list">
            <button
              v-for="activity in filteredActivities"
              :key="activity.id"
              :class="['activity-item', { selected: activityId === activity.id }]"
              @tap="selectActivity(activity)"
            >
              <view class="activity-item-copy">
                <text>{{ activity.name }}</text>
                <text>{{ activity.category }} · {{ intensityLabel(activity.intensity) }}</text>
              </view>
              <image
                v-if="activityId === activity.id"
                src="/static/icons/svg/check.svg"
                mode="aspectFit"
              />
            </button>
          </view>
          <text v-if="fieldError('activityType')" class="field-error">{{
            fieldError('activityType')
          }}</text>

          <text class="field-label field-label-spaced">强度</text>
          <view class="intensity-control">
            <button
              v-for="item in intensityOptions"
              :key="item.value"
              :class="{ selected: activityIntensity === item.value }"
              @tap="activityIntensity = item.value"
            >
              {{ item.label }}
            </button>
          </view>

          <text class="field-label field-label-spaced">运动时长</text>
          <view class="input-wrap" :class="{ invalid: fieldError('durationMinutes') }">
            <input v-model="activityMinutes" type="number" placeholder="例如 30" />
            <text>分钟</text>
          </view>
          <text v-if="fieldError('durationMinutes')" class="field-error">{{
            fieldError('durationMinutes')
          }}</text>

          <view class="activity-estimate">
            <view>
              <text>估算消耗</text>
              <text>按项目、强度、时长和当前体重计算</text>
            </view>
            <view class="activity-estimate-value">
              <text>{{ estimatedActivityCalories }}</text>
              <text>千卡</text>
            </view>
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
            <text class="timeline-desc">{{ timelineDescription(item) }}</text>
          </view>
          <button class="edit-action" @tap="startEdit(item)">修改</button>
        </view>
      </view>
      <view v-else class="empty-line">保存后，记录会出现在这里。</view>
    </template>

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
import MiniTabBar from '../../components/MiniTabBar.vue';
import {
  activityCatalog,
  estimateActivityCalories,
  getActivityById,
  type ActivityCatalogItem,
  type ActivityIntensity,
} from '../../features/activity/activity-catalog.js';
import { healthLoopState } from '../../features/health-loop/health-loop.store.js';
import { loadLocalProfile } from '../../features/health-loop/local-demo.js';
import { loadHealthProfile } from '../../features/health-profile/health-profile.service.js';
import { loadProfileForDisplay } from '../../features/health-profile/profile-loader.js';
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
const activityId = ref('walk');
const activityType = ref('步行');
const activityIntensity = ref<ActivityIntensity>('low');
const activityCategory = ref('全部');
const activityMinutes = ref('');
const sleepMinutes = ref('');
const sleepQuality = ref<SleepQuality>('good');
const note = ref('');
const foodEntries = ref<MealEntry[]>([]);
type ActivitySnapshot = {
  recordId: string;
  activityId: string;
  activityType: string;
  intensity: ActivityIntensity;
  durationMinutes: number;
  estimatedCalories: number;
  source: 'directory';
  recordedAt: string;
};
const activitySnapshots = ref<ActivitySnapshot[]>([]);
const profileWeightKg = ref<number | undefined>();
const foodSummary = computed(() => summarizeFoodEntries(foodEntries.value));
const activityCategories = ['全部', ...new Set(activityCatalog.map((item) => item.category))];
const filteredActivities = computed(() =>
  activityCategory.value === '全部'
    ? activityCatalog
    : activityCatalog.filter((item) => item.category === activityCategory.value),
);
const selectedActivity = computed(() => getActivityById(activityId.value));
const estimatedActivityCalories = computed(() => {
  const durationMinutes = Number(activityMinutes.value);
  if (!selectedActivity.value || !Number.isFinite(durationMinutes) || durationMinutes <= 0)
    return 0;
  const multiplier =
    activityIntensity.value === 'high' ? 1.2 : activityIntensity.value === 'low' ? 0.8 : 1;
  return estimateActivityCalories({
    met: selectedActivity.value.met * multiplier,
    weightKg:
      healthLoopState.today.value?.todayRecords?.weight?.valueKg ||
      profileWeightKg.value ||
      undefined,
    durationMinutes,
  });
});

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
const intensityOptions: Array<{ value: ActivityIntensity; label: string }> = [
  { value: 'low', label: '轻松' },
  { value: 'medium', label: '适中' },
  { value: 'high', label: '较强' },
];
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
      activityId: activityId.value,
      activityType: activityType.value,
      intensity: activityIntensity.value,
      durationMinutes: activityMinutes.value,
      estimatedCalories: estimatedActivityCalories.value,
      source: 'directory' as const,
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
function selectActivity(activity: ActivityCatalogItem) {
  activityId.value = activity.id;
  activityType.value = activity.name;
  activityIntensity.value = activity.intensity;
  clearErrors();
}
function intensityLabel(value: ActivityIntensity) {
  return intensityOptions.find((item) => item.value === value)?.label || '适中';
}
async function submit() {
  const activitySnapshot =
    activeType.value === 'activity'
      ? {
          activityId: activityId.value,
          activityType: activityType.value,
          intensity: activityIntensity.value,
          durationMinutes: Number(activityMinutes.value),
          estimatedCalories: estimatedActivityCalories.value,
          source: 'directory' as const,
        }
      : null;
  const previousEditingId = editingId.value;
  const result = await store.save(currentForm(), date, editingId.value);
  errors.value = result.fieldErrors;
  if (!result.persisted) return;
  if (activitySnapshot) persistActivitySnapshot(activitySnapshot, previousEditingId);
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
    activityId.value = form.activityId;
    activityType.value = form.activityType;
    activityIntensity.value = form.intensity;
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
function activitySnapshotCalories(recordId: string) {
  return activitySnapshots.value.find((item) => item.recordId === recordId)?.estimatedCalories || 0;
}
function timelineDescription(item: RecordTimelineItem) {
  const calories = activitySnapshotCalories(item.id);
  return `${item.description} · ${timeLabel(item.recordedAt)}${calories ? ` · 估算 ${calories} 千卡` : ''}`;
}
function loadActivitySnapshots() {
  try {
    const raw = uni.getStorageSync(`heban_activity_snapshots:${date}`);
    activitySnapshots.value = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
  } catch {
    activitySnapshots.value = [];
  }
}
async function loadProfileWeight() {
  const result = await loadProfileForDisplay(loadHealthProfile, loadLocalProfile);
  profileWeightKg.value = result.profile?.weightKg || undefined;
}
function persistActivitySnapshot(
  snapshot: Omit<ActivitySnapshot, 'recordId' | 'recordedAt'>,
  previousRecordId: string | null,
) {
  const records = store.records.value?.activities || [];
  const matchingRecord = [...records]
    .reverse()
    .find(
      (item) =>
        item.activityType === snapshot.activityId &&
        item.durationMinutes === snapshot.durationMinutes &&
        item.intensity === snapshot.intensity,
    );
  const recordId = matchingRecord?.id || previousRecordId;
  if (!recordId) return;
  const next: ActivitySnapshot = {
    ...snapshot,
    recordId,
    recordedAt: matchingRecord?.recordedAt || new Date().toISOString(),
  };
  activitySnapshots.value = [
    ...activitySnapshots.value.filter(
      (item) => item.recordId !== recordId && item.recordId !== previousRecordId,
    ),
    next,
  ];
  uni.setStorageSync(`heban_activity_snapshots:${date}`, JSON.stringify(activitySnapshots.value));
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
        if (!entry.foodId && !entry.userFoodId) {
          uni.showToast({ title: '原食品不可用，请重新记录', icon: 'none' });
          return;
        }
        const foodReference = entry.userFoodId
          ? `userFoodId=${encodeURIComponent(entry.userFoodId)}`
          : `foodId=${encodeURIComponent(entry.foodId || '')}`;
        uni.navigateTo({
          url: `/pages/food-confirm/FoodConfirmPage?entryId=${encodeURIComponent(entry.id)}&${foodReference}&grams=${entry.grams}&mealType=${entry.mealType}&note=${encodeURIComponent(entry.note || '')}`,
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
  loadActivitySnapshots();
  loadProfileWeight();
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
  padding: 44rpx 32rpx calc(var(--hz-tabbar-height) + env(safe-area-inset-bottom) + 44rpx);
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
.activity-banner {
  position: relative;
  min-height: 190rpx;
  overflow: hidden;
  margin: 0 0 20rpx;
  border: 1rpx solid #d8e5da;
  border-radius: 16rpx;
  background: #f8f7ef;
}
.activity-banner > image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.activity-banner-copy {
  position: relative;
  z-index: 1;
  width: 48%;
  min-width: 240rpx;
  padding: 32rpx 0 28rpx 26rpx;
}
.activity-banner-copy text {
  display: block;
}
.activity-banner-copy text:first-child {
  color: #31543e;
  font-size: 28rpx;
  font-weight: 700;
}
.activity-banner-copy text:last-child {
  margin-top: 8rpx;
  color: #75897b;
  font-size: 19rpx;
  line-height: 1.5;
}
.activity-categories {
  width: 100%;
  margin-bottom: 14rpx;
  white-space: nowrap;
}
.activity-category-row {
  display: inline-flex;
  gap: 8rpx;
  padding-bottom: 4rpx;
}
.activity-category {
  height: 54rpx;
  padding: 0 20rpx;
  border: 1rpx solid #dce7de;
  border-radius: 10rpx;
  background: #fff;
  color: #637d6b;
  font-size: 21rpx;
  line-height: 54rpx;
}
.activity-category.selected {
  border-color: #77a884;
  background: #eaf4eb;
  color: #286b47;
  font-weight: 700;
}
.activity-list {
  border-top: 1rpx solid #e2ebe3;
}
.activity-item {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 76rpx;
  padding: 12rpx 8rpx;
  border: 0;
  border-bottom: 1rpx solid #e7eee8;
  background: transparent;
  text-align: left;
}
.activity-item.selected {
  background: #f0f7f1;
}
.activity-item-copy {
  min-width: 0;
  flex: 1;
}
.activity-item-copy text {
  display: block;
}
.activity-item-copy text:first-child {
  color: #345b41;
  font-size: 24rpx;
  font-weight: 700;
}
.activity-item-copy text:last-child {
  margin-top: 4rpx;
  color: #829589;
  font-size: 18rpx;
}
.activity-item > image {
  width: 28rpx;
  height: 28rpx;
  flex: none;
  margin-left: 12rpx;
  opacity: 0.7;
}
.intensity-control {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4rpx;
  padding: 5rpx;
  border-radius: 12rpx;
  background: #eaf2eb;
}
.intensity-control button {
  height: 58rpx;
  border: 0;
  border-radius: 9rpx;
  background: transparent;
  color: #657d6c;
  font-size: 22rpx;
  line-height: 58rpx;
}
.intensity-control button.selected {
  background: #fff;
  color: #286b47;
  box-shadow: 0 3rpx 9rpx rgba(54, 103, 68, 0.08);
  font-weight: 700;
}
.activity-estimate {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  margin-top: 18rpx;
  padding: 18rpx 20rpx;
  border: 1rpx solid #d7e5d9;
  border-radius: 12rpx;
  background: #f8fbf8;
}
.activity-estimate > view:first-child {
  min-width: 0;
  flex: 1;
}
.activity-estimate text {
  display: block;
}
.activity-estimate > view:first-child text:first-child {
  color: #44684f;
  font-size: 23rpx;
  font-weight: 700;
}
.activity-estimate > view:first-child text:last-child {
  margin-top: 5rpx;
  color: #83968a;
  font-size: 18rpx;
  line-height: 1.4;
}
.activity-estimate-value {
  display: flex;
  align-items: baseline;
  gap: 5rpx;
  flex: none;
}
.activity-estimate-value text:first-child {
  color: #2c744a;
  font-size: 35rpx;
  font-weight: 800;
}
.activity-estimate-value text:last-child {
  color: #71877a;
  font-size: 18rpx;
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
