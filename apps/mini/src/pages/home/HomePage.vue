<template>
  <view class="page">
    <!-- 背景装饰 -->
    <image
      class="bg-leaf"
      src="/static/illustrations/leaf-corner-decoration.png"
      mode="aspectFit"
    />

    <!-- 顶部 -->
    <view class="header">
      <view class="header-left">
        <text class="date-chip">{{ dateLabel }}</text>
        <text class="greeting">{{ greeting }}，{{ displayName }}</text>
      </view>
      <button class="avatar-wrapper" @tap="toXuxu">
        <image class="avatar" src="/static/illustrations/xuxu-avatar.png" mode="aspectFill" />
        <text class="avatar-hint">和序序聊聊</text>
      </button>
    </view>

    <view v-if="loading" class="loading-state">
      <image class="loading-art" src="/static/illustrations/onboarding-guide-vertical.png" mode="aspectFill" />
      <view class="loading-wash" />
      <view class="loading-copy">
        <text class="loading-title">让健康回到自己的节律</text>
        <text class="loading-subtitle">序序正在把今天的记录整理好</text>
        <view class="loading-dots"><view /><view /><view /></view>
      </view>
    </view>

    <template v-else-if="today && experience">
      <!-- 1. 体重管理卡片 - 紧凑SVG半圆 -->
      <view v-if="isCardVisible('weight-plan')" class="weight-card card" @tap="goToWeightProgress">
        <view class="card-top">
          <text class="card-title">体重管理方案</text>
          <text class="week-badge">{{ planWeekLabel }}</text>
        </view>

        <view class="weight-visual">
          <svg class="semicircle-svg" viewBox="0 0 160 85" preserveAspectRatio="xMidYMid meet">
            <path
              class="track"
              d="M 10,80 A 70,70 0 0,1 150,80"
              fill="none"
              stroke="#e8f7ed"
              stroke-width="8"
              stroke-linecap="round"
            />
            <path
              class="progress"
              d="M 10,80 A 70,70 0 0,1 150,80"
              fill="none"
              stroke="#7fcc8f"
              stroke-width="8"
              stroke-linecap="round"
              :stroke-dasharray="`${Math.min(progress, 100) * 2.2} 220`"
              stroke-dashoffset="0"
            />
          </svg>
          <text class="weight-progress-label">已完成 {{ progress.toFixed(0) }}%</text>
          <view class="weight-row">
            <view class="weight-col">
              <text class="num">{{ startWeight }}</text>
              <text class="label">初始</text>
            </view>
            <view class="weight-col main">
              <text class="num">{{ currentWeight }}</text>
              <text class="label">当前</text>
            </view>
            <view class="weight-col">
              <text class="num">{{ targetWeight }}</text>
              <text class="label">目标</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 2. 饮食热量卡片 - 真正紧凑 -->
      <view v-if="isCardVisible('food')" class="calorie-card card" @tap="goToFoodDetail">
        <view class="card-top">
          <text class="card-title">饮食记录</text>
          <view class="mode-tag">今日概览</view>
        </view>

        <view class="calorie-main">
          <text class="hint-text">今日已记录</text>
          <view class="big-number">
            <text class="number">{{ mealCount }}</text>
            <text class="unit">餐</text>
          </view>
          <text class="meal-summary">{{ mealSummaryText }}</text>
        </view>

        <view class="calorie-stats">
          <view class="stat">
            <text class="stat-num">{{ balancedMealCount }}</text>
            <text class="stat-label">结构完整</text>
          </view>
          <view class="stat">
            <text class="stat-num">{{ mealCount - balancedMealCount }}</text>
            <text class="stat-label">待补充</text>
          </view>
        </view>

        <view class="meal-progress" aria-label="今日饮食记录进度">
          <view
            v-for="slot in 4"
            :key="slot"
            :class="['meal-progress-segment', slot <= mealCount ? 'filled' : '']"
          />
        </view>

        <view class="meals">
          <button
            v-for="action in foodRecordActions"
            :key="action.label"
            class="meal-item"
            hover-class="button-hover"
            @tap.stop="openRecordAction(action.route)"
          >
            <view class="meal-icon-wrap">
              <image class="meal-icon" :src="mealRecordIcons[action.label]" mode="aspectFit" />
            </view>
            <text class="meal-name">{{ action.label }}</text>
          </button>
        </view>

        <!-- 序序相机 -->
        <button class="xuxu-camera-card card" hover-class="button-hover" @tap="goToXuxuCamera">
          <view class="camera-copy">
            <text class="camera-title">序序相机</text>
            <text class="camera-subtitle">拍照识别 · 轻松记录</text>
          </view>
          <image class="camera-decoration" src="/static/icons/camera.jpg" mode="aspectFit" />
          <text class="camera-arrow">›</text>
        </button>
      </view>

      <!-- 3. 体重记录卡片 -->
      <view v-if="isCardVisible('weight-record')" class="record-card card" @tap="goToWeightRecords">
        <view class="card-top">
          <view class="title-group">
            <text class="card-title">体重记录</text>
            <text v-if="latestWeightRecord" class="time-text">
              {{ formatTime(latestWeightRecord.recordedAt) }} 更新
            </text>
          </view>
          <button class="weight-add" aria-label="记录体重" @tap.stop="openWeightRecorder">＋</button>
        </view>
        <view class="record-content">
          <view class="big-value">
            <text class="value">{{ currentWeight }}</text>
            <text class="value-unit">公斤</text>
          </view>
          <view class="mini-chart">
            <svg
              v-if="miniWeightPoints.length"
              class="mini-trend-svg"
              viewBox="0 0 120 52"
              preserveAspectRatio="none"
            >
              <path :d="miniWeightPath" class="mini-trend-line" />
              <circle
                v-for="point in miniWeightPoints"
                :key="point.id"
                :cx="point.x"
                :cy="point.y"
                r="2.6"
                class="mini-trend-point"
              />
            </svg>
            <image v-else class="chart-icon" src="/static/icons/weight.jpg" mode="aspectFill" />
          </view>
        </view>
      </view>

      <!-- 4. 健康追踪网格 -->
      <view v-if="isCardVisible('tracking')" class="grid-cards">
        <button class="grid-item card water-card" hover-class="button-hover" @tap="goToWater">
          <view class="grid-top">
            <text class="grid-title">喝水</text>
          </view>
          <view class="grid-data">
            <text class="grid-num">{{ todayWaterTotal }}</text>
            <text class="grid-unit">ml</text>
          </view>
          <image class="grid-icon" src="/static/icons/watercolor/water-drop.png" mode="aspectFit" />
        </button>

        <button
          class="grid-item card sleep-card"
          hover-class="button-hover"
          @tap="go('/pages/sleep/SleepDetailPage')"
        >
          <view class="grid-top">
            <text class="grid-title">睡眠</text>
          </view>
          <view class="grid-data">
            <text class="grid-num">{{ sleepCardValue }}</text>
            <text class="grid-unit">{{ sleepCardUnit }}</text>
          </view>
          <image class="grid-icon" src="/static/icons/watercolor/sleep.png" mode="aspectFit" />
        </button>

        <button
          class="grid-item card activity-card"
          hover-class="button-hover"
          @tap="go('/pages/activity/ActivityDetailPage')"
        >
          <view class="grid-top">
            <text class="grid-title">运动</text>
          </view>
          <view class="grid-data">
            <text class="grid-num">{{ todayActivityMinutes }}</text>
            <text class="grid-unit">分钟</text>
          </view>
          <image class="grid-icon" src="/static/icons/watercolor/activity.png" mode="aspectFit" />
        </button>

        <button class="grid-item card mood-card" hover-class="button-hover" @tap="go('/pages/mood/MoodDetailPage')">
          <view class="grid-top">
            <text class="grid-title">心情</text>
          </view>
          <view class="grid-data">
            <text class="grid-hint">{{ moodCardValue }}</text>
          </view>
          <image class="grid-icon" src="/static/icons/watercolor/mood-smile.png" mode="aspectFit" />
        </button>
      </view>

      <!-- 5. 轻断食卡片 -->
      <view
        v-if="isCardVisible('fasting')"
        class="fasting-card card"
        @tap="go('/pages/fasting/FastingDetailPage')"
      >
        <view class="card-top">
          <text class="card-title">轻断食</text>
          <view class="mode-tag blue">{{ fastingPlan.mode }} 模式</view>
        </view>
        <view class="fasting-content">
          <text class="fasting-label">{{ fastingPlan.active ? '断食计时中' : '今日用餐窗口' }}</text>
          <text class="fasting-time">{{ fastingPlan.active ? fastingElapsed : '尚未开始计时' }}</text>
          <text class="fasting-summary">{{ fastingPlan.active ? `已开始于 ${fastingStartedLabel}` : `${fastingPlan.eatingStart} - ${fastingPlan.eatingEnd} · 点击开始` }}</text>
        </view>
        <image
          class="fasting-icon-img"
          src="/static/icons/watercolor/fasting-clock.png"
          mode="aspectFit"
        />
      </view>

      <!-- 6. 经期记录卡片 -->
      <view v-if="isCardVisible('period')" class="period-card card" @tap="openMenstruation">
        <view class="card-top">
          <text class="card-title">经期</text>
        </view>
        <view class="period-content">
          <text class="period-hint">{{ periodStatusText }}</text>
          <text class="period-days">{{ periodDaysText }}</text>
        </view>
        <image
          class="period-icon-img"
          src="/static/icons/watercolor/menstruation.png"
          mode="aspectFit"
        />
      </view>

      <!-- 7. 用药打卡卡片 -->
      <view v-if="isCardVisible('medication')" class="medication-card card" @tap="openMedication">
        <view class="card-top">
          <text class="card-title">用药打卡</text>
        </view>
        <view class="medication-content">
          <text class="medication-hint">{{ medicationStatusText }}</text>
          <view class="medication-list">
            <text class="medication-item">{{ medicationPlanText }}</text>
          </view>
        </view>
        <image
          class="medication-icon-img"
          src="/static/icons/watercolor/medication.png"
          mode="aspectFit"
        />
      </view>

      <!-- 8. 编辑首页卡片 -->
      <button
        class="edit-card"
        hover-class="button-hover"
        @tap="go('/pages/home/edit-cards/EditCardsPage')"
      >
        <view class="edit-card-copy">
          <text class="edit-text">编辑首页卡片</text>
          <text class="edit-caption">只保留你每天会用到的内容</text>
        </view>
        <image class="edit-arrow" src="/static/icons/svg/forward.svg" mode="aspectFit" />
      </button>
    </template>

    <view v-if="wellnessSheet" class="wellness-scrim" @tap="closeWellnessSheet">
      <view class="wellness-sheet" @tap.stop>
        <view class="sheet-handle" />
        <view class="wellness-head"><view><text class="wellness-title">{{ wellnessSheet === 'sleep' ? '记下昨晚的睡眠' : '记录此刻的心情' }}</text><text class="wellness-subtitle">{{ wellnessSheet === 'sleep' ? '不用完美，先留下真实感受' : '给今天的自己一个温柔标记' }}</text></view><button class="sheet-close" @tap="closeWellnessSheet">×</button></view>
        <template v-if="wellnessSheet === 'sleep'">
          <image class="sleep-art" src="/static/illustrations/xuxu-sleep-reminder.png" mode="aspectFill" />
          <text class="field-label">睡了多久</text>
          <view class="duration-field"><input v-model="sleepDurationDraft" type="number" placeholder="例如 450" /><text>分钟</text></view>
          <text class="field-label">睡眠质量</text>
          <view class="tone-row"><button v-for="item in sleepQualities" :key="item.value" :class="['tone-choice', { selected: sleepQualityDraft === item.value }]" @tap="sleepQualityDraft = item.value">{{ item.label }}</button></view>
          <text class="field-label">昨晚做了什么梦？<text class="optional">选填</text></text>
          <textarea v-model="dreamDraft" class="dream-input" maxlength="160" placeholder="记下一点画面、情绪，或只写一句话" />
          <button class="wellness-save" @tap="saveWellnessSleep">保存睡眠记录</button>
        </template>
        <template v-else>
          <text class="field-label">现在的状态</text>
          <view class="mood-grid"><button v-for="item in moodOptions" :key="item.value" :class="['mood-choice', { selected: moodToneDraft === item.value }]" @tap="moodToneDraft = item.value"><text class="mood-dot" :class="item.value" />{{ item.label }}</button></view>
          <text class="field-label">想说点什么？<text class="optional">选填</text></text>
          <textarea v-model="moodNoteDraft" class="dream-input" maxlength="160" placeholder="今天发生了什么，让你有这样的感觉？" />
          <button class="wellness-save mood-save" @tap="saveWellnessMood">保存心情</button>
        </template>
      </view>
    </view>

    <view v-else-if="error" class="error-state">
      <text>今天的状态还没有加载出来</text>
      <text>检查服务连接后，再试一次就好</text>
      <button @tap="load">重新加载</button>
    </view>

    <MiniTabBar v-if="!wellnessSheet" active="home" />
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { onHide, onShow } from '@dcloudio/uni-app';
import MiniTabBar from '../../components/MiniTabBar.vue';
import { healthLoopState } from '../../features/health-loop/health-loop.store.js';
import { listLocalWeightRecords } from '../../features/weight/weight-records.local.js';
import { deriveDailyExperience } from '../../features/health-loop/daily-experience.js';
import { requestRecordTypeFocus } from '../../features/health-records/records-focus.js';
import { foodRecordActions, mealRecordIcons } from './home-actions.js';
import { loadHomeCardVisibility, type HomeCardId } from './home-card-settings.js';
import { navigateTo, navigateToXuxu } from '../../utils/router.js';
import { elapsedSeconds, finishFasting, formatDuration, loadFastingPlan, remainingSeconds, type FastingPlan } from '../../features/fasting/fasting-store.js';
import { loadWellnessJournal, saveMood, saveSleep, type MoodTone, type WellnessJournal } from '../../features/wellness/wellness-journal.js';

const { today, loading, error } = healthLoopState;

const greeting = computed(() => {
  const hour = new Date().getHours();
  return hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好';
});

const dateLabel = computed(() => {
  const now = new Date();
  return `${now.getMonth() + 1} 月 ${now.getDate()} 日 · 今天`;
});

const displayName = computed(() => today.value?.displayName || '朋友');
const menstruationCycle = ref<{ lastPeriodStart?: string; cycleLength?: number } | null>(null);
const medicationStats = ref({ total: 0, done: 0 });
const cardVisibility = ref(loadHomeCardVisibility());
const isCardVisible = (id: HomeCardId) => cardVisibility.value[id] !== false;
const periodStatusText = computed(() =>
  menstruationCycle.value?.lastPeriodStart
    ? `上次经期 ${menstruationCycle.value.lastPeriodStart.slice(5).replace('-', '月')}日开始`
    : '还没有记录经期',
);
const periodDaysText = computed(() => {
  const start = menstruationCycle.value?.lastPeriodStart;
  if (!start) return '点击记录你的周期';
  const next = new Date(`${start}T00:00:00`);
  next.setDate(next.getDate() + (menstruationCycle.value?.cycleLength || 28));
  return `距离下次预计 ${Math.max(0, Math.ceil((next.getTime() - Date.now()) / 86400000))} 天`;
});
const medicationStatusText = computed(() =>
  medicationStats.value.total
    ? `今日已完成 ${medicationStats.value.done}/${medicationStats.value.total}`
    : '还没有用药提醒',
);
const medicationPlanText = computed(() =>
  medicationStats.value.total ? '按医嘱设置提醒时间' : '添加一条提醒，按时照顾自己',
);

const wellnessJournal = ref<WellnessJournal>(loadWellnessJournal());
const wellnessSheet = ref<'sleep' | 'mood' | null>(null);
const sleepDurationDraft = ref('');
const sleepQualityDraft = ref<'poor' | 'fair' | 'good'>('good');
const dreamDraft = ref('');
const moodToneDraft = ref<MoodTone>('calm');
const moodNoteDraft = ref('');
const sleepQualities = [{ value: 'poor', label: '不太好' }, { value: 'fair', label: '一般' }, { value: 'good', label: '挺好' }] as const;
const moodOptions: Array<{ value: MoodTone; label: string }> = [{ value: 'calm', label: '平静' }, { value: 'bright', label: '开心' }, { value: 'tired', label: '疲惫' }, { value: 'low', label: '低落' }, { value: 'anxious', label: '有点焦虑' }];
const sleepCardValue = computed(() => wellnessJournal.value.sleep ? (wellnessJournal.value.sleep.durationMinutes / 60).toFixed(1) : today.value?.todayRecords?.sleep ? formatSleepHours(today.value.todayRecords.sleep) : '--');
const sleepCardUnit = computed(() => sleepCardValue.value === '--' ? '待记录' : '小时');
const moodCardValue = computed(() => wellnessJournal.value.mood ? moodOptions.find((item) => item.value === wellnessJournal.value.mood?.tone)?.label || '已记录' : '记录今天');

const fastingPlan = ref<FastingPlan>(loadFastingPlan());
const fastingNow = ref(new Date());
let fastingTicker: ReturnType<typeof setInterval> | undefined;
const fastingElapsed = computed(() => formatDuration(elapsedSeconds(fastingPlan.value, fastingNow.value)));
const fastingStartedLabel = computed(() => {
  if (!fastingPlan.value.startedAt) return '--:--';
  const date = new Date(fastingPlan.value.startedAt);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
});
function refreshFasting() { fastingPlan.value = loadFastingPlan(); fastingNow.value = new Date(); }
function startFastingTicker() {
  refreshFasting();
  if (!fastingTicker) fastingTicker = setInterval(() => { fastingNow.value = new Date(); if (fastingPlan.value.active) fastingPlan.value = remainingSeconds(fastingPlan.value, fastingNow.value) <= 0 ? finishFasting(fastingNow.value) : loadFastingPlan(); }, 1000);
}
function stopFastingTicker() { if (fastingTicker) { clearInterval(fastingTicker); fastingTicker = undefined; } }
function openWellnessSheet(type: 'sleep' | 'mood') {
  wellnessJournal.value = loadWellnessJournal();
  wellnessSheet.value = type;
  if (type === 'sleep') {
    sleepDurationDraft.value = wellnessJournal.value.sleep ? String(wellnessJournal.value.sleep.durationMinutes) : today.value?.todayRecords?.sleep ? String(today.value.todayRecords.sleep.durationMinutes) : '';
    sleepQualityDraft.value = wellnessJournal.value.sleep?.quality || 'good';
    dreamDraft.value = wellnessJournal.value.sleep?.dream || '';
  } else {
    moodToneDraft.value = wellnessJournal.value.mood?.tone || 'calm';
    moodNoteDraft.value = wellnessJournal.value.mood?.note || '';
  }
}
function closeWellnessSheet() { wellnessSheet.value = null; }
function saveWellnessSleep() {
  const duration = Number(sleepDurationDraft.value);
  if (!Number.isFinite(duration) || duration < 30 || duration > 1440) { uni.showToast({ title: '请输入 30–1440 分钟', icon: 'none' }); return; }
  wellnessJournal.value = saveSleep({ durationMinutes: Math.round(duration), quality: sleepQualityDraft.value, dream: dreamDraft.value.trim() });
  wellnessSheet.value = null;
  uni.showToast({ title: '睡眠已记录', icon: 'success' });
}
function saveWellnessMood() { wellnessJournal.value = saveMood({ tone: moodToneDraft.value, note: moodNoteDraft.value.trim() }); wellnessSheet.value = null; uni.showToast({ title: '心情已记录', icon: 'success' }); }

const experience = computed(() => (today.value ? deriveDailyExperience(today.value) : null));

const startWeight = computed(
  () => today.value?.activePlan?.healthTarget?.startWeightKg?.toFixed(1) || '--',
);

const weightHistory = ref<Array<{ id: string; valueKg: number; recordedAt: string }>>([]);
const currentWeight = computed(
  () =>
    weightHistory.value[0]?.valueKg.toFixed(1) ||
    today.value?.todayRecords?.weight?.valueKg?.toFixed(1) ||
    '--',
);
const latestWeightRecord = computed(() => weightHistory.value[0] || today.value?.todayRecords?.weight || null);
const miniWeightData = computed(() =>
  weightHistory.value
    .slice()
    .sort((a, b) => +new Date(a.recordedAt) - +new Date(b.recordedAt))
    .slice(-7),
);
const miniWeightPoints = computed(() => {
  const data = miniWeightData.value;
  if (!data.length) return [];
  const values = data.map((item) => item.valueKg);
  const min = Math.min(...values) - 0.3;
  const max = Math.max(...values) + 0.3;
  const span = Math.max(0.1, max - min);
  return data.map((item, index) => ({
    id: item.id,
    x: data.length === 1 ? 60 : (index / (data.length - 1)) * 120,
    y: 48 - ((item.valueKg - min) / span) * 36,
  }));
});
const miniWeightPath = computed(() =>
  miniWeightPoints.value
    .map((point, index) => `${index ? 'L' : 'M'}${point.x},${point.y}`)
    .join(' '),
);

const planStartDate = computed(() => today.value?.activePlan?.healthTarget?.startDate || '');
const planTotalWeeks = computed(() => {
  const start = today.value?.activePlan?.healthTarget?.startWeightKg;
  const target = today.value?.activePlan?.healthTarget?.targetWeightKg;
  if (start == null || target == null) return 0;
  return Math.max(1, Math.ceil(Math.abs(start - target) / 0.5));
});
const planCurrentWeek = computed(() => {
  if (!planStartDate.value) return 1;
  const elapsed = Math.max(0, Date.now() - new Date(`${planStartDate.value}T00:00:00`).getTime());
  return Math.min(planTotalWeeks.value || 1, Math.floor(elapsed / (7 * 86400000)) + 1);
});
const planWeekLabel = computed(() =>
  planTotalWeeks.value ? `第 ${planCurrentWeek.value}/${planTotalWeeks.value} 周` : '设置目标',
);

const targetWeight = computed(
  () => today.value?.activePlan?.healthTarget?.targetWeightKg?.toFixed(1) || '--',
);

const todayWaterTotal = computed(() => {
  try {
    const now = new Date();
    const value = uni.getStorageSync(
      `water_${now.getFullYear()}_${now.getMonth() + 1}_${now.getDate()}`,
    );
    return Array.isArray(value)
      ? value.reduce((total, item) => total + Number(item.amount || 0), 0)
      : 0;
  } catch {
    return 0;
  }
});

const todayActivityMinutes = computed(
  () =>
    today.value?.todayRecords.activities.reduce((total, item) => total + item.durationMinutes, 0) ||
    0,
);

const mealRecords = computed(() => today.value?.todayRecords?.meals || []);
const mealCount = computed(() => mealRecords.value.length);
const balancedMealCount = computed(
  () =>
    mealRecords.value.filter((meal) => meal.hasStaple && meal.hasProtein && meal.hasVegetable)
      .length,
);
const mealSummaryText = computed(() =>
  mealCount.value === 0
    ? '还没有记录，先记下今天的一餐'
    : `${balancedMealCount.value}/${mealCount.value} 餐结构完整`,
);
const recordingCompleted = computed(() => today.value?.recordingProgress.completed || 0);
const recordingTotal = computed(() => today.value?.recordingProgress.total || 0);
const recordingMessage = computed(
  () => experience.value?.recording.message || '完成一件小事，就已经是在照顾自己',
);

const progress = computed(() => {
  if (currentWeight.value === '--' || !today.value?.activePlan?.healthTarget) {
    return 0;
  }
  const start = today.value.activePlan.healthTarget.startWeightKg;
  const current = Number(currentWeight.value);
  const target = today.value.activePlan.healthTarget.targetWeightKg;
  if (start == null || target == null || start === target) return 0;

  const prog = ((start - current) / (start - target)) * 100;
  return Math.max(0, Math.min(100, prog));
});

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const go = (url: string) => {
  navigateTo(url);
};

const goToWeightProgress = () => navigateTo('/pages/weight/WeightDetailPage?view=progress');
const goToWeightRecords = () => navigateTo('/pages/weight/WeightDetailPage?view=records');
const openWeightRecorder = () => navigateTo('/pages/weight/WeightDetailPage?view=records&action=new');

const goToFoodDetail = () => {
  navigateTo('/pages/food/FoodDetailPage');
};

const openRecordAction = (route: string) => {
  const [path, query = ''] = route.split('?');
  if (path === '/pages/records/RecordsPage') {
    const type = decodeURIComponent(
      query
        .split('&')
        .find((part) => part.startsWith('type='))
        ?.slice('type='.length) || '',
    );
    if (type === 'activity' || type === 'weight' || type === 'sleep' || type === 'meal-structure') {
      requestRecordTypeFocus(type);
    }
    navigateTo('/pages/records/RecordsPage');
    return;
  }
  navigateTo(route);
};

const openMenstruation = () => {
  navigateTo('/pages/menstruation/MenstruationDetailPage');
};

const openMedication = () => {
  navigateTo('/pages/medication/MedicationManagePage');
};

const showWaterDialog = () => {
  navigateTo('/pages/water/WaterPage', {
    fail: () => {
      uni.redirectTo({ url: '/pages/water/WaterPage' });
    },
  });
};

const toXuxu = () => {
  navigateToXuxu();
};

const goToXuxuCamera = () => {
  uni.navigateTo({
    url: '/pages/food-recognition/FoodRecognitionPage',
  });
};

const goToMealAdd = () => {
  uni.navigateTo({
    url: '/pages/meal-add/MealAddPage?mealType=lunch',
  });
};

const goToWater = () => {
  navigateTo('/pages/water/WaterPage', {
    fail: () => {
      uni.redirectTo({ url: '/pages/water/WaterPage' });
    },
  });
};

const formatSleepHours = (sleep: any) => {
  if (!sleep?.durationMinutes) return '0';
  const hours = (sleep.durationMinutes / 60).toFixed(1);
  return hours;
};

const getTodayDate = () => {
  return new Date().toISOString().slice(0, 10);
};

const load = () => {
  const today = getTodayDate();
  healthLoopState.loadToday(today);
};

const loadWeightTrend = () => {
  weightHistory.value = listLocalWeightRecords().map((record) => ({
    id: record.id,
    valueKg: record.weight,
    recordedAt: record.recordedAt,
  }));
};

const loadPersonalSignals = () => {
  try {
    const cycleRaw = uni.getStorageSync('heban_menstruation_cycle');
    menstruationCycle.value = cycleRaw
      ? typeof cycleRaw === 'string'
        ? JSON.parse(cycleRaw)
        : cycleRaw
      : null;
    const remindersRaw = uni.getStorageSync('heban_medication_reminders');
    const checkinsRaw = uni.getStorageSync('heban_medication_checkins');
    const medications = remindersRaw
      ? typeof remindersRaw === 'string'
        ? JSON.parse(remindersRaw)
        : remindersRaw
      : [];
    const checkins = checkinsRaw
      ? typeof checkinsRaw === 'string'
        ? JSON.parse(checkinsRaw)
        : checkinsRaw
      : [];
    const today = getTodayDate();
    medicationStats.value = {
      total: Array.isArray(medications) ? medications.length : 0,
      done: Array.isArray(checkins)
        ? checkins.filter((item: { date?: string }) => item.date === today).length
        : 0,
    };
  } catch {
    menstruationCycle.value = null;
    medicationStats.value = { total: 0, done: 0 };
  }
};

// 修复：首次进入立即加载
onMounted(() => {
  load();
  loadWeightTrend();
  loadPersonalSignals();
  startFastingTicker();
});

// 每次显示时刷新
onShow(() => {
  if (today.value) {
    load();
  }
  cardVisibility.value = loadHomeCardVisibility();
  loadWeightTrend();
  loadPersonalSignals();
  startFastingTicker();
  wellnessJournal.value = loadWellnessJournal();
});
onHide(stopFastingTicker);
onUnmounted(stopFastingTicker);
</script>

<style scoped>
/* 页面 - 治愈系背景 */
.page {
  position: relative;
  min-height: 100vh;
  padding: 28rpx 24rpx 160rpx;
  background: linear-gradient(180deg, #f8fdf9 0%, #f5f8f6 100%);
  overflow: hidden;
}

/* 背景装饰 */
.bg-leaf {
  position: fixed;
  top: 0;
  right: 0;
  width: 360rpx;
  height: 360rpx;
  opacity: 0.08;
  pointer-events: none;
  z-index: 0;
}

/* 顶部 */
.header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.header-left {
  flex: 1;
}

.date-chip {
  display: inline-block;
  padding: 6rpx 14rpx;
  margin-bottom: 8rpx;
  border-radius: 999rpx;
  background: rgba(127, 204, 143, 0.12);
  color: #5a9572;
  font-size: 20rpx;
  font-weight: 600;
}

.greeting {
  display: block;
  color: #2d6943;
  font-size: 32rpx;
  font-weight: 800;
}

.avatar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
  padding: 0;
  background: transparent;
  border: 0;
}

.avatar {
  width: 64rpx;
  height: 64rpx;
  border: 3rpx solid #7fcc8f;
  border-radius: 50%;
}

.avatar-hint {
  color: #76907d;
  font-size: 18rpx;
  font-weight: 600;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 40rpx;
  text-align: center;
  min-height: 60vh;
}

.loading text {
  color: #2d6943;
  font-size: 32rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* 通用卡片样式 */
.card {
  margin-bottom: 32rpx;
  padding: 24rpx 28rpx;
  border-radius: 32rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(127, 204, 143, 0.07);
  border: 1rpx solid rgba(127, 204, 143, 0.08);
  backdrop-filter: blur(20rpx);
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.card-title {
  color: #2d6943;
  font-size: 26rpx;
  font-weight: 800;
}

/* 1. 体重卡片 */
.weight-card {
  position: relative;
  overflow: hidden;
  padding: 20rpx 24rpx 16rpx;
}
.week-badge {
  color: #76907d;
  font-size: 20rpx;
  font-weight: 600;
}

.weight-visual {
  position: relative;
}

.semicircle-svg {
  width: 160rpx;
  height: 85rpx;
  margin: 0 auto;
  display: block;
}

.weight-row {
  display: flex;
  justify-content: space-around;
  margin-top: 12rpx;
}

.weight-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}

.weight-col .num {
  color: #5a9572;
  font-size: 30rpx;
  font-weight: 900;
  line-height: 1;
}

.weight-col.main .num {
  color: #2d6943;
  font-size: 36rpx;
}

.weight-col .label {
  color: #9ba8a0;
  font-size: 18rpx;
}

/* 2. 饮食热量卡片 - 紧凑 */
.calorie-card {
  padding: 20rpx 24rpx;
}

.mode-tag {
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  background: rgba(127, 204, 143, 0.12);
  color: #5a9572;
  font-size: 18rpx;
  font-weight: 700;
}

.mode-tag.blue {
  background: rgba(100, 149, 237, 0.12);
  color: #5a8fd6;
}

.calorie-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 0;
}

.hint-text {
  color: #76907d;
  font-size: 20rpx;
  margin-bottom: 8rpx;
}

.big-number {
  display: flex;
  align-items: baseline;
  gap: 6rpx;
}

.big-number .number {
  color: #2d6943;
  font-size: 64rpx;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.02em;
}

.big-number .unit {
  color: #5a9572;
  font-size: 24rpx;
  font-weight: 700;
  margin-bottom: 6rpx;
}

.meal-summary {
  margin-top: 10rpx;
  color: #9a8b84;
  font-size: 20rpx;
}

.calorie-stats {
  display: flex;
  justify-content: center;
  gap: 24rpx;
  padding: 14rpx 0;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
  padding: 12rpx 24rpx;
  border-radius: 12rpx;
  background: rgba(232, 247, 237, 0.4);
}

.stat-num {
  color: #2d6943;
  font-size: 28rpx;
  font-weight: 900;
}

.stat-label {
  color: #9ba8a0;
  font-size: 18rpx;
}

.meal-progress {
  display: flex;
  justify-content: center;
  gap: 10rpx;
  margin: 14rpx 18rpx 8rpx;
}

.meal-progress-segment {
  flex: 1;
  height: 8rpx;
  border-radius: 999rpx;
  background: #e8eee8;
  transition: background 0.2s ease;
}

.meal-progress-segment.filled {
  background: linear-gradient(90deg, #9ccfb0, #78b9a7);
}

.meals {
  display: flex;
  justify-content: space-around;
  padding: 14rpx 0;
}

.meal-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  min-width: 112rpx;
  padding: 0;
  background: transparent;
  border: 0;
}

.meal-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 76rpx;
  height: 76rpx;
  border-radius: 50%;
  background: rgba(255, 240, 243, 0.7);
  box-shadow:
    inset 0 1rpx 0 rgba(255, 255, 255, 0.95),
    0 6rpx 14rpx rgba(182, 109, 128, 0.08);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.meal-icon {
  width: 64rpx;
  height: 64rpx;
}

.meal-item:active .meal-icon-wrap {
  transform: translateY(2rpx) scale(0.96);
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.95);
}

.meal-name {
  color: #4a6b56;
  font-size: 20rpx;
  font-weight: 600;
}

.meal-item:nth-child(2) .meal-icon-wrap {
  animation: meal-breathe 4.8s ease-in-out 0.4s infinite;
}

.meal-item:nth-child(3) .meal-icon-wrap {
  animation: meal-breathe 4.8s ease-in-out 0.8s infinite;
}

.meal-item:nth-child(4) .meal-icon-wrap {
  animation: meal-breathe 4.8s ease-in-out 1.2s infinite;
}

@keyframes meal-breathe {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3rpx);
  }
}

/* 序序相机卡片 */
.xuxu-camera-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 148rpx;
  gap: 16rpx;
  padding: 24rpx 24rpx 24rpx 28rpx;
  margin-top: 24rpx;
  background: linear-gradient(135deg, rgba(255, 248, 236, 0.96) 0%, rgba(238, 248, 246, 0.94) 100%);
  border: 1rpx solid rgba(255, 255, 255, 0.92);
  box-shadow:
    0 12rpx 28rpx rgba(147, 126, 108, 0.1),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.95);
  overflow: hidden;
  transition: all 0.2s ease;
}

.xuxu-camera-card:active {
  transform: scale(0.98);
  box-shadow:
    0 6rpx 14rpx rgba(147, 126, 108, 0.08),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.95);
}

.camera-copy {
  position: relative;
  z-index: 2;
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  gap: 10rpx;
}

.camera-decoration {
  width: 188rpx;
  height: 122rpx;
  margin-right: -10rpx;
  mix-blend-mode: multiply;
  flex-shrink: 0;
  opacity: 0.9;
}

.camera-title {
  color: #526d68;
  font-size: 30rpx;
  font-weight: 700;
  letter-spacing: 0;
}

.camera-subtitle {
  color: #9a8b84;
  font-size: 21rpx;
  line-height: 1.3;
}

.camera-arrow {
  position: relative;
  z-index: 2;
  margin-left: -8rpx;
  color: #9ab4ae;
  font-size: 42rpx;
  font-weight: 300;
  line-height: 1;
}

/* 3. 体重记录卡片 */
.title-group {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.time-text {
  color: #9ba8a0;
  font-size: 18rpx;
}

.record-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.big-value {
  display: flex;
  align-items: baseline;
  gap: 6rpx;
}

.value {
  color: #2d6943;
  font-size: 52rpx;
  font-weight: 900;
  line-height: 1;
}

.value-unit {
  color: #76907d;
  font-size: 22rpx;
  font-weight: 600;
}

.mini-chart {
  width: 140rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  background: rgba(232, 247, 237, 0.3);
}

.chart-icon {
  width: 112rpx;
  height: 112rpx;
  opacity: 1;
  border-radius: 0;
  mix-blend-mode: multiply;
}
.mini-trend-svg {
  width: 132rpx;
  height: 58rpx;
  overflow: visible;
}
.mini-trend-line {
  fill: none;
  stroke: #74b58b;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.mini-trend-point {
  fill: #fffdfb;
  stroke: #74b58b;
  stroke-width: 2.2;
}

/* 4. 健康追踪网格 */
.grid-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.grid-item {
  position: relative;
  padding: 24rpx;
  min-height: 150rpx;
  text-align: left;
  border: 0;
  overflow: hidden;
  transition: transform 0.12s ease;
}

.grid-item:active {
  transform: scale(0.97);
}

.grid-top {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 16rpx;
}

.grid-title {
  color: #2d6943;
  font-size: 26rpx;
  font-weight: 700;
}

.grid-data {
  display: flex;
  align-items: baseline;
  gap: 6rpx;
  margin-bottom: 12rpx;
  position: relative;
  z-index: 2;
}

.grid-num {
  color: #2d6943;
  font-size: 48rpx;
  font-weight: 900;
  line-height: 1;
}

.grid-unit {
  color: #76907d;
  font-size: 22rpx;
  font-weight: 600;
}

.grid-hint {
  color: #9aaca0;
  font-size: 22rpx;
  font-weight: 600;
}

.grid-art {
  position: absolute;
  bottom: -8rpx;
  right: -8rpx;
  width: 120rpx;
  height: 120rpx;
  opacity: 0.7;
  pointer-events: none;
  z-index: 1;
  mix-blend-mode: multiply;
}

.grid-icon {
  position: absolute;
  bottom: 8rpx;
  right: 8rpx;
  width: 100rpx;
  height: 100rpx;
  opacity: 0.75;
  pointer-events: none;
  z-index: 1;
  mix-blend-mode: multiply;
  border-radius: 50%;
}

.grid-icon-img {
  position: absolute;
  bottom: 8rpx;
  right: 8rpx;
  width: 80rpx;
  height: 80rpx;
  opacity: 0.6;
  border-radius: 12rpx;
}

/* 5. 轻断食卡片 */
.fasting-card {
  position: relative;
  overflow: hidden;
}

.fasting-content {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.fasting-label {
  color: #9ba8a0;
  font-size: 20rpx;
}

.fasting-time {
  color: #2d6943;
  font-size: 44rpx;
  font-weight: 900;
  line-height: 1;
}

.fasting-summary {
  max-width: 70%;
  color: #84978b;
  font-size: 21rpx;
  line-height: 1.45;
}

.fasting-icon {
  position: absolute;
  bottom: 12rpx;
  right: 12rpx;
  font-size: 64rpx;
  opacity: 0.5;
}

.fasting-icon-img {
  position: absolute;
  bottom: 8rpx;
  right: 8rpx;
  width: 100rpx;
  height: 100rpx;
  opacity: 0.75;
  border-radius: 50%;
  mix-blend-mode: multiply;
}

/* 6. 经期记录卡片 */
.period-card {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #fff5f8 0%, #ffffff 100%);
}

.period-content {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.period-hint {
  color: #9ba8a0;
  font-size: 20rpx;
}

.period-days {
  color: #e06c9f;
  font-size: 28rpx;
  font-weight: 700;
}

.period-icon-img {
  position: absolute;
  bottom: 8rpx;
  right: 8rpx;
  width: 100rpx;
  height: 100rpx;
  opacity: 0.75;
  border-radius: 50%;
  mix-blend-mode: multiply;
}

/* 7. 用药打卡卡片 */
.medication-card {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f0f8ff 0%, #ffffff 100%);
}

.medication-content {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.medication-hint {
  color: #9ba8a0;
  font-size: 20rpx;
}

.medication-list {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.medication-item {
  color: #6495ed;
  font-size: 24rpx;
  font-weight: 600;
}

.medication-icon-img {
  position: absolute;
  bottom: 8rpx;
  right: 8rpx;
  width: 100rpx;
  height: 100rpx;
  opacity: 0.75;
  border-radius: 50%;
  mix-blend-mode: multiply;
}

/* 8. 编辑卡片 */
.edit-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  width: 100%;
  padding: 32rpx;
  margin-bottom: 16rpx;
  border: 3rpx dashed #c8e6d0;
  border-radius: 24rpx;
  background: transparent;
  z-index: 10;
}

.edit-card:active {
  border-color: #7fcc8f;
  background: rgba(232, 247, 237, 0.2);
}

.edit-icon {
  font-size: 36rpx;
  color: #7fcc8f;
}

.edit-text {
  color: #5a9572;
  font-size: 24rpx;
  font-weight: 700;
}

/* 错误状态 */
.error-state {
  padding: 80rpx 24rpx;
  text-align: center;
}

.error-state text {
  display: block;
  color: #9ba8a0;
  font-size: 24rpx;
  margin-bottom: 12rpx;
}

.error-state button {
  margin-top: 20rpx;
  padding: 14rpx 28rpx;
  border-radius: 999rpx;
  background: rgba(127, 204, 143, 0.12);
  color: #5a9572;
  font-size: 24rpx;
  font-weight: 700;
}
</style>
<style scoped>
.loading-state {
  position: relative;
  display: flex;
  min-height: 68vh;
  align-items: flex-end;
  justify-content: center;
  overflow: hidden;
  margin: 0 -24rpx;
  border-radius: 0 0 32rpx 32rpx;
  background: #eef6ef;
}
.loading-art {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.82;
}
.loading-wash {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(244, 249, 244, 0.12) 26%, rgba(244, 249, 244, 0.94) 86%);
}
.loading-copy {
  position: relative;
  z-index: 1;
  width: 100%;
  box-sizing: border-box;
  padding: 0 32rpx 74rpx;
  text-align: center;
}
.loading-title {
  display: block;
  color: #315b45;
  font-size: 34rpx;
  font-weight: 750;
  letter-spacing: 0;
}
.loading-subtitle {
  display: block;
  margin-top: 12rpx;
  color: #76917f;
  font-size: 21rpx;
}
.loading-dots {
  display: flex;
  justify-content: center;
  gap: 12rpx;
  margin-top: 24rpx;
}
.loading-dots view {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #79aa88;
  animation: loading-breathe 1.35s ease-in-out infinite;
}
.loading-dots view:nth-child(2) { animation-delay: 0.15s; }
.loading-dots view:nth-child(3) { animation-delay: 0.3s; }
@keyframes loading-breathe {
  0%, 100% { transform: translateY(0); opacity: 0.42; }
  50% { transform: translateY(-7rpx); opacity: 1; }
}
.chart-icon {
  width: 116rpx;
  height: 116rpx;
  opacity: 0.92;
  mix-blend-mode: multiply;
}
</style>
<style scoped>
.wellness-scrim { position:fixed; inset:0; z-index:40; display:flex; align-items:flex-end; background:rgba(47,61,56,.46); }
.wellness-sheet { width:100%; box-sizing:border-box; max-height:82vh; overflow:auto; padding:20rpx 30rpx calc(36rpx + env(safe-area-inset-bottom)); border-radius:34rpx 34rpx 0 0; background:#fffdf8; box-shadow:0 -14rpx 44rpx rgba(67,87,79,.2); }
.sheet-handle { width:72rpx; height:8rpx; margin:0 auto 24rpx; border-radius:8rpx; background:#d5dfd9; }
.wellness-head { display:flex; align-items:flex-start; justify-content:space-between; padding-top:2rpx; }.wellness-title { display:block; color:#3f5049; font-size:34rpx; font-weight:700; line-height:1.3; }.wellness-subtitle { display:block; margin-top:8rpx; color:#95a39d; font-size:21rpx; }.sheet-close { width:58rpx; height:58rpx; display:flex; align-items:center; justify-content:center; color:#8e9e98; border:0; background:transparent; font-size:40rpx; }
.sleep-art { width:100%; height:184rpx; margin:16rpx 0 8rpx; border-radius:20rpx; object-fit:cover; object-position:center 58%; opacity:.96; }
.field-label { display:block; margin:26rpx 0 12rpx; color:#73827c; font-size:21rpx; }.optional { margin-left:8rpx; color:#aeb8b2; font-size:18rpx; }
.duration-field { display:flex; align-items:center; padding:0 18rpx; border:1rpx solid #e3ebe6; border-radius:16rpx; background:#fbfdf9; }.duration-field input { flex:1; height:78rpx; color:#41544c; font-size:28rpx; }.duration-field text { color:#94a39c; font-size:20rpx; }
.tone-row { display:flex; gap:10rpx; }.tone-choice { flex:1; min-height:64rpx; display:flex; align-items:center; justify-content:center; padding:0 8rpx; border:1rpx solid #e2ebe5; border-radius:16rpx; color:#809089; background:#fff; font-size:20rpx; }.tone-choice.selected { color:#5d9b7d; border-color:#8ac8a7; background:#edf8f0; }
.dream-input { width:100%; min-height:150rpx; box-sizing:border-box; padding:18rpx; border:1rpx solid #e3ebe6; border-radius:16rpx; color:#52645d; background:#fbfdf9; font-size:21rpx; line-height:1.5; }
.wellness-save { width:100%; min-height:88rpx; display:flex; align-items:center; justify-content:center; margin-top:28rpx; border-radius:24rpx; color:#fff; background:#6bc49a; font-size:25rpx; font-weight:600; box-shadow:0 10rpx 22rpx rgba(95,186,143,.2); }.mood-save { background:#8498d1; box-shadow:0 10rpx 22rpx rgba(119,139,200,.18); }
.mood-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12rpx; }.mood-choice { min-height:68rpx; display:flex; align-items:center; justify-content:center; gap:8rpx; border:1rpx solid #e2ebe5; border-radius:16rpx; color:#7d8c86; background:#fff; font-size:20rpx; }.mood-choice.selected { color:#6f85c2; border-color:#aebce6; background:#f3f5fe; }.mood-dot { width:14rpx; height:14rpx; border-radius:50%; background:#a9b8e7; }.mood-dot.bright { background:#f4c979; }.mood-dot.tired { background:#b9c3cb; }.mood-dot.low { background:#d99cab; }.mood-dot.anxious { background:#9ecdc1; }
</style>
<style scoped>
/* Unified home surface: a quiet sage canvas with warm white content planes. */
.page {
  background: #f2f6f3;
  color: #29453c;
}

.bg-leaf {
  width: 320rpx;
  height: 320rpx;
  opacity: 0.035;
}

.header {
  margin-bottom: 24rpx;
}

.date-chip {
  padding: 6rpx 12rpx;
  border-radius: 10rpx;
  background: #e6f0ea;
  color: #5b7d6f;
  font-size: 19rpx;
  letter-spacing: 0;
}

.greeting {
  color: #25473a;
  font-size: 34rpx;
  letter-spacing: 0;
}

.avatar {
  border-color: #d4e4db;
}

.avatar-hint {
  color: #718b7f;
}

.card {
  margin-bottom: 20rpx;
  border: 1rpx solid #e0eae3;
  border-radius: 24rpx;
  background: #fffefa;
  box-shadow: 0 10rpx 26rpx rgba(44, 73, 61, 0.055);
  backdrop-filter: none;
}

.card-top {
  margin-bottom: 18rpx;
}

.card-title {
  color: #315547;
  font-size: 27rpx;
  font-weight: 750;
  letter-spacing: 0;
}

.week-badge,
.time-text {
  color: #879b91;
}

.weight-card {
  padding: 24rpx 26rpx 20rpx;
  background: #fffefa;
}

.weight-col .num,
.weight-col.main .num,
.big-number .number,
.value,
.grid-num,
.fasting-time {
  color: #2f6b52;
}

.weight-col .label,
.stat-label,
.hint-text,
.value-unit,
.grid-unit,
.fasting-label,
.period-hint,
.medication-hint {
  color: #8a9d94;
}

.semicircle-svg .track {
  stroke: #e4eee7;
}

.semicircle-svg .progress {
  stroke: #77ad91;
}

.calorie-card {
  padding: 24rpx 26rpx 22rpx;
}

.mode-tag,
.mode-tag.blue {
  background: #e8f1eb;
  color: #5a806e;
}

.calorie-main {
  padding: 14rpx 0 12rpx;
}

.big-number .number {
  font-size: 66rpx;
  letter-spacing: 0;
}

.big-number .unit {
  color: #628675;
}

.meal-summary {
  color: #8b9b92;
}

.calorie-stats {
  gap: 18rpx;
  padding: 12rpx 0;
}

.stat {
  min-width: 150rpx;
  padding: 12rpx 18rpx;
  border: 1rpx solid #e6eee8;
  border-radius: 14rpx;
  background: #f4f8f5;
}

.stat-num {
  color: #3b765d;
}

.meal-progress {
  gap: 8rpx;
  margin: 14rpx 12rpx 8rpx;
}

.meal-progress-segment {
  height: 7rpx;
  background: #e6eee8;
}

.meal-progress-segment.filled {
  background: #84b39b;
}

.meals {
  padding: 12rpx 0 10rpx;
}

.meal-item {
  min-width: 112rpx;
}

.meal-icon-wrap {
  width: 78rpx;
  height: 78rpx;
  border: 1rpx solid #e0ebe3;
  border-radius: 22rpx;
  background: #f4f8f5;
  box-shadow: 0 6rpx 14rpx rgba(55, 91, 73, 0.06);
}

.meal-name {
  color: #557668;
  font-size: 20rpx;
}

.xuxu-camera-card {
  min-height: 142rpx;
  margin-top: 20rpx;
  padding: 22rpx 22rpx 22rpx 26rpx;
  border: 1rpx solid #dce9e0;
  border-radius: 20rpx;
  background: #f5f9f5;
  box-shadow: none;
}

.camera-title {
  color: #396b57;
  font-size: 29rpx;
}

.camera-subtitle {
  color: #82988d;
  font-size: 20rpx;
}

.camera-decoration {
  width: 174rpx;
  height: 112rpx;
  opacity: 0.92;
}

.camera-arrow {
  color: #7da38e;
  font-size: 38rpx;
}

.record-card {
  padding: 24rpx 26rpx;
}

.mini-chart {
  width: 142rpx;
  height: 62rpx;
  border: 1rpx solid #e5eee8;
  border-radius: 14rpx;
  background: #f5f9f5;
}

.mini-trend-line {
  stroke: #78ad91;
}

.mini-trend-point {
  fill: #fffefa;
  stroke: #78ad91;
}

.grid-cards {
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.grid-item {
  min-height: 148rpx;
  padding: 22rpx 24rpx;
  border: 1rpx solid #e0eae3;
  border-radius: 22rpx;
  background: #fffefa;
  box-shadow: 0 8rpx 18rpx rgba(44, 73, 61, 0.045);
}

.grid-title {
  color: #3b6655;
  font-size: 25rpx;
}

.grid-data {
  margin-bottom: 8rpx;
}

.grid-num {
  font-size: 44rpx;
}

.grid-icon {
  width: 92rpx;
  height: 92rpx;
  right: 8rpx;
  bottom: 8rpx;
  opacity: 0.48;
  border-radius: 0;
  mix-blend-mode: multiply;
}

.fasting-card,
.period-card,
.medication-card {
  min-height: 164rpx;
  padding: 24rpx 26rpx;
  border: 1rpx solid #e0eae3;
  border-left-width: 4rpx;
  border-radius: 22rpx;
  background: #fffefa;
  box-shadow: 0 8rpx 20rpx rgba(44, 73, 61, 0.045);
}

.fasting-card {
  border-left-color: #85ae98;
}

.period-card {
  border-left-color: #d79a9f;
}

.medication-card {
  border-left-color: #76a99a;
}

.fasting-card .fasting-time {
  color: #356c55;
}

.period-days {
  color: #b66f7d;
}

.medication-item {
  color: #477b6c;
}

.fasting-icon-img,
.period-icon-img,
.medication-icon-img {
  right: 20rpx;
  bottom: 16rpx;
  width: 104rpx;
  height: 104rpx;
  opacity: 0.46;
  border-radius: 0;
  background: transparent;
  mix-blend-mode: multiply;
}

.fasting-summary {
  color: #85988f;
}

.edit-card {
  min-height: 82rpx;
  margin: 4rpx 0 16rpx;
  padding: 18rpx 22rpx 18rpx 24rpx;
  border: 1rpx solid #dfe9e2;
  border-radius: 18rpx;
  background: rgba(255, 254, 250, 0.76);
  box-shadow: none;
}

.edit-text {
  color: #537c6c;
  font-size: 23rpx;
}

.edit-caption {
  color: #91a199;
}

.edit-arrow {
  opacity: 0.5;
}

.error-state button {
  background: #e7f1ea;
  color: #527d69;
}
</style>
<style scoped>
/* Lower cards use quiet editorial surfaces instead of full-bleed pastel fills. */
.fasting-card,
.period-card,
.medication-card {
  margin-bottom: 18rpx;
  border: 1rpx solid #e8eeeb;
  border-radius: 22rpx;
  background: #fff;
  box-shadow: 0 8rpx 22rpx rgba(71, 93, 86, 0.06);
}

.fasting-card {
  min-height: 188rpx;
  padding: 24rpx 26rpx;
  border-left: 6rpx solid #8bb8a8;
}

.fasting-card .card-top {
  margin-bottom: 14rpx;
}

.fasting-card .fasting-time {
  color: #3f7164;
  font-size: 40rpx;
  letter-spacing: 1rpx;
}

.fasting-card .fasting-summary {
  max-width: 64%;
  color: #8b9893;
}

.fasting-card .fasting-icon-img {
  right: 22rpx;
  bottom: 20rpx;
  width: 112rpx;
  height: 112rpx;
  opacity: 0.55;
  border-radius: 24rpx;
  background: transparent;
}

.period-card,
.medication-card {
  display: flex;
  flex-direction: column;
  min-height: 154rpx;
  padding: 22rpx 24rpx;
}

.period-card {
  border-left: 6rpx solid #d49a9f;
  background: #fff;
}

.medication-card {
  border-left: 6rpx solid #86b6ac;
  background: #fff;
}

.period-card .card-top,
.medication-card .card-top {
  margin-bottom: 12rpx;
}

.period-card .card-title,
.medication-card .card-title {
  color: #4a5b56;
  font-size: 27rpx;
}

.period-content,
.medication-content {
  position: relative;
  z-index: 1;
  padding-right: 112rpx;
}

.period-hint,
.medication-hint {
  color: #899792;
  font-size: 20rpx;
}

.period-days {
  margin-top: 8rpx;
  color: #bd737f;
  font-size: 26rpx;
  font-weight: 700;
}

.medication-item {
  margin-top: 8rpx;
  color: #4e8179;
  font-size: 23rpx;
  font-weight: 600;
}

.period-icon-img,
.medication-icon-img {
  right: 22rpx;
  bottom: 22rpx;
  width: 112rpx;
  height: 112rpx;
  opacity: 0.58;
  border-radius: 0;
  mix-blend-mode: multiply;
}

.period-icon-img {
  background: transparent;
}

.medication-icon-img {
  background: transparent;
}

.edit-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 86rpx;
  padding: 18rpx 22rpx 18rpx 26rpx;
  margin: 6rpx 0 16rpx;
  border: 1rpx solid #e6ece9;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 8rpx 18rpx rgba(71, 93, 86, 0.04);
}

.edit-card-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5rpx;
}

.edit-text {
  color: #547d75;
  font-size: 23rpx;
  font-weight: 700;
}

.edit-caption {
  color: #9aa7a2;
  font-size: 18rpx;
}

.edit-arrow {
  width: 28rpx;
  height: 28rpx;
  opacity: 0.55;
}
</style>
<style scoped>
/* Final visual tokens. Keep all home surfaces in one restrained palette. */
.page { background: #f2f6f3; color: #29453c; }
.chart-icon { width: 116rpx; height: 116rpx; opacity: 0.92; border-radius: 0; mix-blend-mode: multiply; }
.bg-leaf { width: 320rpx; height: 320rpx; opacity: 0.035; }
.header { margin-bottom: 24rpx; }
.date-chip { padding: 6rpx 12rpx; border-radius: 10rpx; background: #e6f0ea; color: #5b7d6f; font-size: 19rpx; }
.greeting { color: #25473a; font-size: 34rpx; }
.avatar { border-color: #d4e4db; }
.avatar-hint { color: #718b7f; }
.card { margin-bottom: 20rpx; border: 1rpx solid #e0eae3; border-radius: 24rpx; background: #fffefa; box-shadow: 0 10rpx 26rpx rgba(44, 73, 61, 0.055); backdrop-filter: none; }
.card-top { margin-bottom: 18rpx; }
.card-title { color: #315547; font-size: 27rpx; font-weight: 750; }
.week-badge, .time-text { color: #879b91; }
.weight-card, .calorie-card, .record-card { background: #fffefa; }
.weight-card { padding: 24rpx 26rpx 20rpx; }
.weight-col .num, .weight-col.main .num, .big-number .number, .value, .grid-num, .fasting-time { color: #2f6b52; }
.weight-col .label, .stat-label, .hint-text, .value-unit, .grid-unit, .fasting-label, .period-hint, .medication-hint { color: #8a9d94; }
.semicircle-svg .track { stroke: #e4eee7; }
.semicircle-svg .progress { stroke: #77ad91; }
.mode-tag, .mode-tag.blue { background: #e8f1eb; color: #5a806e; }
.calorie-card { padding: 24rpx 26rpx 22rpx; }
.calorie-main { padding: 14rpx 0 12rpx; }
.big-number .number { font-size: 66rpx; letter-spacing: 0; }
.big-number .unit { color: #628675; }
.meal-summary { color: #8b9b92; }
.calorie-stats { gap: 18rpx; padding: 12rpx 0; }
.stat { min-width: 150rpx; padding: 12rpx 18rpx; border: 1rpx solid #e6eee8; border-radius: 14rpx; background: #f4f8f5; }
.stat-num { color: #3b765d; }
.meal-progress { gap: 8rpx; margin: 14rpx 12rpx 8rpx; }
.meal-progress-segment { height: 7rpx; background: #e6eee8; }
.meal-progress-segment.filled { background: #84b39b; }
.meals { padding: 12rpx 0 10rpx; }
.meal-icon-wrap { width: 78rpx; height: 78rpx; border: 1rpx solid #e0ebe3; border-radius: 22rpx; background: #f4f8f5; box-shadow: 0 6rpx 14rpx rgba(55, 91, 73, 0.06); }
.meal-name { color: #557668; font-size: 20rpx; }
.xuxu-camera-card { min-height: 142rpx; margin-top: 20rpx; padding: 22rpx 22rpx 22rpx 26rpx; border: 1rpx solid #dce9e0; border-radius: 20rpx; background: #f5f9f5; box-shadow: none; }
.camera-title { color: #396b57; font-size: 29rpx; }
.camera-subtitle { color: #82988d; font-size: 20rpx; }
.camera-decoration { width: 174rpx; height: 112rpx; opacity: 0.92; }
.camera-arrow { color: #7da38e; font-size: 38rpx; }
.record-card { padding: 24rpx 26rpx; }
.record-content { min-height: 112rpx; }
.mini-chart { width: 128rpx; height: 112rpx; border: 0; border-radius: 0; background: transparent; }
.mini-trend-line { stroke: #78ad91; }
.mini-trend-point { fill: #fffefa; stroke: #78ad91; }
.grid-cards { gap: 16rpx; margin-bottom: 20rpx; }
.grid-item { min-height: 154rpx; padding: 24rpx; border: 1rpx solid #dce8e0; border-radius: 22rpx; background: #fffefa; box-shadow: 0 9rpx 20rpx rgba(44, 73, 61, 0.05); }
.grid-title { color: #3b6655; font-size: 26rpx; font-weight: 650; }
.grid-num { font-size: 46rpx; }
.grid-icon { width: 108rpx; height: 108rpx; right: 6rpx; bottom: 4rpx; opacity: 0.78; border-radius: 0; mix-blend-mode: multiply; }
.chart-icon { width: 112rpx; height: 112rpx; opacity: 1; border-radius: 0; mix-blend-mode: multiply; }
.fasting-card, .period-card, .medication-card { min-height: 170rpx; padding: 25rpx 26rpx; border: 1rpx solid #dce8e0; border-left-width: 4rpx; border-radius: 22rpx; background: #fffefa; box-shadow: 0 9rpx 20rpx rgba(44, 73, 61, 0.05); }
.fasting-card { border-left-color: #85ae98; }
.period-card { border-left-color: #d79a9f; }
.medication-card { border-left-color: #76a99a; }
.fasting-card .fasting-time { color: #356c55; }
.period-days { color: #b66f7d; }
.medication-item { color: #477b6c; }
.fasting-icon-img, .period-icon-img, .medication-icon-img { right: 18rpx; bottom: 12rpx; width: 120rpx; height: 120rpx; opacity: 0.72; border-radius: 0; background: transparent; mix-blend-mode: multiply; }
.fasting-summary { color: #85988f; }
.edit-card { min-height: 82rpx; margin: 4rpx 0 16rpx; padding: 18rpx 22rpx 18rpx 24rpx; border: 1rpx solid #dfe9e2; border-radius: 18rpx; background: rgba(255, 254, 250, 0.76); box-shadow: none; }
.edit-text { color: #537c6c; font-size: 23rpx; }
.edit-caption { color: #91a199; }
.error-state button { background: #e7f1ea; color: #527d69; }
.chart-icon { width: 116rpx; height: 116rpx; opacity: 0.92; border-radius: 0; mix-blend-mode: multiply; }
</style>
<style scoped>
.chart-icon { width: 116rpx; height: 116rpx; opacity: 0.92; border-radius: 0; mix-blend-mode: multiply; }
</style>
<style scoped>
.page {
  background: #fff7f1;
}
.date-chip {
  border-radius: 12rpx;
  background: #fff0f3;
  color: #b66d80;
}
.greeting {
  color: #5a4c52;
}
.card {
  border: 1rpx solid rgba(255, 255, 255, 0.9);
  border-radius: 18rpx;
  background: rgba(255, 253, 251, 0.82);
  box-shadow:
    0 12rpx 28rpx rgba(139, 102, 89, 0.07),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(18px);
}
.card-title,
.grid-title {
  color: #66545a;
}
.weight-card,
.calorie-card,
.record-card,
.fasting-card {
  background: #fffdfb;
}
.mode-tag {
  background: #fff0f3;
  color: #b66d80;
}
.mode-tag.blue {
  background: #f0effb;
  color: #7c76b2;
}
.period-card {
  border-color: #efcbd4;
  background: #fff0f3;
}
.period-hint,
.medication-hint {
  color: #9f858b;
}
.period-days {
  color: #c26f84;
}
.medication-card {
  border-color: #d9e5ed;
  background: #f1f6fb;
}
.medication-item {
  color: #6a88a5;
}
.edit-card {
  border-color: #e9cfd1;
}
.edit-icon,
.edit-text {
  color: #b66d80;
}
.error-state button {
  background: #fff0f3;
  color: #b66d80;
}
</style>
<style scoped>
/* Final surface pass keeps the lower cards quiet after the legacy theme overrides. */
.fasting-card,
.period-card,
.medication-card {
  border-color: #e8eeeb;
  border-radius: 22rpx;
  background: #fff;
  box-shadow: 0 8rpx 22rpx rgba(71, 93, 86, 0.06);
}
.fasting-card {
  min-height: 188rpx;
  border-left: 6rpx solid #8bb8a8;
}
.fasting-card .fasting-time {
  color: #3f7164;
}
.fasting-card .fasting-summary {
  color: #8b9893;
}
.fasting-card .fasting-icon-img {
  width: 112rpx;
  height: 112rpx;
  right: 22rpx;
  bottom: 20rpx;
  border-radius: 0;
  background: transparent;
  opacity: 0.55;
}
.period-card,
.medication-card {
  min-height: 154rpx;
  padding: 22rpx 24rpx;
  border-left-width: 6rpx;
  border-left-style: solid;
}
.period-card {
  border-left-color: #d49a9f;
}
.medication-card {
  border-left-color: #86b6ac;
}
.period-card .card-title,
.medication-card .card-title {
  color: #4a5b56;
  font-size: 27rpx;
}
.period-content,
.medication-content {
  padding-right: 112rpx;
}
.period-hint,
.medication-hint {
  color: #899792;
}
.period-days {
  margin-top: 8rpx;
  color: #bd737f;
  font-size: 26rpx;
}
.medication-item {
  margin-top: 8rpx;
  color: #4e8179;
  font-size: 23rpx;
}
.period-icon-img,
.medication-icon-img {
  width: 112rpx;
  height: 112rpx;
  right: 22rpx;
  bottom: 22rpx;
  border-radius: 0;
  opacity: 0.58;
}
.period-icon-img {
  background: transparent;
}
.medication-icon-img {
  background: transparent;
}
.edit-card {
  min-height: 86rpx;
  margin: 6rpx 0 16rpx;
  padding: 18rpx 22rpx 18rpx 26rpx;
  border: 1rpx solid #e6ece9;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 8rpx 18rpx rgba(71, 93, 86, 0.04);
}
.edit-card-copy {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  gap: 5rpx;
}
.edit-text {
  color: #547d75;
  font-size: 23rpx;
}
.edit-caption {
  color: #9aa7a2;
  font-size: 18rpx;
}
.edit-arrow {
  width: 28rpx;
  height: 28rpx;
  opacity: 0.55;
}
</style>
<style scoped>
/* Last rule wins: keep the page coherent after legacy theme blocks. */
.page { background: #f2f6f3; color: #29453c; }
.bg-leaf { width: 320rpx; height: 320rpx; opacity: 0.035; }
.date-chip { border-radius: 10rpx; background: #e6f0ea; color: #5b7d6f; }
.greeting { color: #25473a; font-size: 34rpx; }
.avatar { border-color: #d4e4db; }
.avatar-hint { color: #718b7f; }
.card { margin-bottom: 20rpx; border: 1rpx solid #e0eae3; border-radius: 24rpx; background: #fffefa; box-shadow: 0 10rpx 26rpx rgba(44, 73, 61, 0.055); backdrop-filter: none; }
.card-title { color: #315547; font-size: 27rpx; font-weight: 750; }
.weight-card, .calorie-card, .record-card { background: #fffefa; }
.weight-card { padding: 24rpx 26rpx 20rpx; }
.week-badge, .time-text { color: #879b91; }
.weight-col .num, .weight-col.main .num, .big-number .number, .value, .grid-num, .fasting-time { color: #2f6b52; }
.weight-col .label, .stat-label, .hint-text, .value-unit, .grid-unit, .fasting-label, .period-hint, .medication-hint { color: #8a9d94; }
.semicircle-svg .track { stroke: #e4eee7; }
.semicircle-svg .progress { stroke: #77ad91; }
.mode-tag, .mode-tag.blue { background: #e8f1eb; color: #5a806e; }
.calorie-card { padding: 24rpx 26rpx 22rpx; }
.big-number .number { font-size: 66rpx; letter-spacing: 0; }
.big-number .unit { color: #628675; }
.meal-summary { color: #8b9b92; }
.calorie-stats { gap: 18rpx; padding: 12rpx 0; }
.stat { min-width: 150rpx; padding: 12rpx 18rpx; border: 1rpx solid #e6eee8; border-radius: 14rpx; background: #f4f8f5; }
.stat-num { color: #3b765d; }
.meal-progress { gap: 8rpx; margin: 14rpx 12rpx 8rpx; }
.meal-progress-segment { height: 7rpx; background: #e6eee8; }
.meal-progress-segment.filled { background: #84b39b; }
.meals { padding: 12rpx 0 10rpx; }
.meal-icon-wrap { width: 78rpx; height: 78rpx; border: 1rpx solid #e0ebe3; border-radius: 22rpx; background: #f4f8f5; box-shadow: 0 6rpx 14rpx rgba(55, 91, 73, 0.06); }
.meal-name { color: #557668; font-size: 20rpx; }
.xuxu-camera-card { min-height: 142rpx; margin-top: 20rpx; padding: 22rpx 22rpx 22rpx 26rpx; border: 1rpx solid #dce9e0; border-radius: 20rpx; background: #f5f9f5; box-shadow: none; }
.camera-title { color: #396b57; font-size: 29rpx; }
.camera-subtitle { color: #82988d; font-size: 20rpx; }
.camera-decoration { width: 174rpx; height: 112rpx; opacity: 0.92; }
.camera-arrow { color: #7da38e; font-size: 38rpx; }
.record-card { padding: 24rpx 26rpx; }
.mini-chart { width: 128rpx; height: 112rpx; border: 0; border-radius: 0; background: transparent; }
.mini-trend-line { stroke: #78ad91; }
.mini-trend-point { fill: #fffefa; stroke: #78ad91; }
.grid-cards { gap: 16rpx; margin-bottom: 20rpx; }
.grid-item { min-height: 154rpx; padding: 24rpx; border: 1rpx solid #dce8e0; border-radius: 22rpx; background: #fffefa; box-shadow: 0 9rpx 20rpx rgba(44, 73, 61, 0.05); }
.grid-title { color: #3b6655; font-size: 26rpx; font-weight: 650; }
.grid-num { font-size: 46rpx; }
.grid-icon { width: 108rpx; height: 108rpx; right: 6rpx; bottom: 4rpx; opacity: 0.78; border-radius: 0; mix-blend-mode: multiply; }
.chart-icon { width: 112rpx; height: 112rpx; opacity: 1; border-radius: 0; mix-blend-mode: multiply; }
.fasting-card, .period-card, .medication-card { min-height: 170rpx; padding: 25rpx 26rpx; border: 1rpx solid #dce8e0; border-left-width: 4rpx; border-radius: 22rpx; background: #fffefa; box-shadow: 0 9rpx 20rpx rgba(44, 73, 61, 0.05); }
.fasting-card { border-left-color: #85ae98; }
.period-card { border-left-color: #d79a9f; }
.medication-card { border-left-color: #76a99a; }
.fasting-card .fasting-time { color: #356c55; }
.period-days { color: #b66f7d; }
.medication-item { color: #477b6c; }
.fasting-icon-img, .period-icon-img, .medication-icon-img { right: 18rpx; bottom: 12rpx; width: 120rpx; height: 120rpx; opacity: 0.72; border-radius: 0; background: transparent; mix-blend-mode: multiply; }
.fasting-summary { color: #85988f; }
.edit-card { min-height: 82rpx; margin: 4rpx 0 16rpx; padding: 18rpx 22rpx 18rpx 24rpx; border: 1rpx solid #dfe9e2; border-radius: 18rpx; background: rgba(255, 254, 250, 0.76); box-shadow: none; }
.edit-text { color: #537c6c; font-size: 23rpx; }
.edit-caption { color: #91a199; }
.error-state button { background: #e7f1ea; color: #527d69; }
.weight-visual { position: relative; }
.weight-progress-label { position: absolute; top: 46rpx; left: 50%; transform: translateX(-50%); color: #688476; font-size: 19rpx; white-space: nowrap; }
.weight-add { display: flex; width: 52rpx; height: 52rpx; align-items: center; justify-content: center; padding: 0; border: 1rpx solid #d9e9df; border-radius: 50%; color: #47745f; background: #edf6f0; font-size: 32rpx; line-height: 52rpx; }
.weight-add::after { border: 0; }
</style>
