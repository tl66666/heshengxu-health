<template>
  <view class="page home-page">
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
      <view class="header-right">
        <view
          v-if="bubbleTip"
          :key="bubbleTip"
          class="xuxu-bubble hz-rise"
          aria-label="序序的健康小贴士"
          @tap="toXuxu"
        >
          <text class="bubble-text">{{ bubbleTip }}</text>
        </view>
        <button class="avatar-wrapper" aria-label="和序序聊聊" @tap="toXuxu">
          <image class="avatar" src="/static/illustrations/xuxu-avatar.png" mode="aspectFill" />
        </button>
      </view>
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
          <view class="weight-card-actions">
            <text class="week-badge">{{ planWeekLabel }}</text>
            <button class="weight-visibility" aria-label="显示或隐藏体重" @tap.stop="toggleWeightVisibility">
              <image src="/static/icons/svg/eye.svg" mode="aspectFit" />
            </button>
          </view>
        </view>

        <view class="weight-visual">
          <view class="weight-arc-stage">
            <view class="weight-arc-ring" :style="{ background: weightArcBackground }" />
            <view
              v-if="weightPlanHasTarget"
              class="weight-arc-node"
              :style="{ left: `${weightArcNode.x}%`, top: `${weightArcNode.y}%` }"
            />
            <view class="weight-progress-copy">
              <text class="weight-progress-value">{{ weightProgressAmount }}</text>
              <text class="weight-progress-label">{{ weightPlanHasTarget ? '已减去（kg）' : '设置目标后开始记录' }}</text>
              <text class="weight-gap-label">{{ weightPlanHasTarget ? weightGapLabel : '记录目标后，这里会显示你的进度' }}</text>
            </view>
          </view>
          <view class="weight-row">
            <view class="weight-col">
              <text class="num">{{ weightValuesHidden ? '••' : startWeight }}</text>
              <text class="label">初始</text>
            </view>
            <view class="weight-col main">
              <text class="num">{{ weightValuesHidden ? '••' : currentWeight }}</text>
              <text class="label">当前</text>
            </view>
            <view class="weight-col">
              <text class="num">{{ weightValuesHidden ? '••' : targetWeight }}</text>
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

        <view class="camera-slot">
          <button class="xuxu-camera-card" hover-class="button-hover" @tap.stop="goToXuxuCamera">
            <view class="camera-copy">
              <text class="camera-title">序序相机</text>
              <text class="camera-subtitle">拍照识别 · 轻松记录</text>
            </view>
            <image class="camera-decoration" src="/static/icons/camera.png" mode="aspectFit" />
          </button>
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
          <button class="weight-add" aria-label="记录体重" @tap.stop="openHomeWeightSheet">记录</button>
        </view>
        <view class="record-content">
          <view class="big-value">
            <text class="value">{{ currentWeight }}</text>
            <text class="value-unit">公斤</text>
          </view>
          <view class="mini-chart">
            <view v-if="miniChartGeom" class="mini-chart-view">
              <view
                v-for="seg in miniChartGeom.segments"
                :key="seg.id"
                class="mini-seg"
                :style="{
                  left: seg.x + 'rpx',
                  top: seg.y + 'rpx',
                  width: seg.len + 'rpx',
                  transform: 'rotate(' + seg.angle + 'deg)',
                }"
              />
              <view
                v-for="pt in miniChartGeom.pts"
                :key="pt.id"
                class="mini-dot"
                :class="{ latest: pt.isLatest }"
                :style="{ left: pt.x + 'rpx', top: pt.y + 'rpx' }"
              />
            </view>
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

    <view v-if="weightSheet" class="weight-record-scrim" @tap="closeHomeWeightSheet">
      <view class="weight-record-sheet" @tap.stop>
        <view class="sheet-handle" />
        <view class="weight-record-head">
          <view>
            <text class="weight-record-title">记录今天的体重</text>
            <text class="weight-record-subtitle">留下真实的一次变化，序序会帮你看趋势</text>
          </view>
          <button class="sheet-close" aria-label="关闭" @tap="closeHomeWeightSheet">×</button>
        </view>
        <view class="weight-record-time"><text>{{ homeWeightDateLabel }}</text><text>{{ homeWeightTimeLabel }}</text></view>
        <view class="home-weight-input-wrap"><input v-model="homeWeightDraft" type="digit" placeholder="例如 59.0" /><text>kg</text></view>
        <picker mode="date" :value="homeWeightDate" @change="homeWeightDate = $event.detail.value">
          <view class="home-weight-date"><text>记录日期</text><text>{{ homeWeightDate }}</text><image src="/static/icons/svg/forward.svg" mode="aspectFit" /></view>
        </picker>
        <input v-model="homeWeightNote" class="home-weight-note" type="text" placeholder="可以写下此刻的状态（选填）" />
        <button class="home-weight-save" @tap="saveHomeWeight">保存体重记录</button>
      </view>
    </view>

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

    <view v-else-if="!today" class="home-empty-state">
      <image
        class="home-empty-art"
        src="/static/illustrations/onboarding-guide-vertical.png"
        mode="aspectFit"
      />
      <text class="home-empty-title">先完成健康档案</text>
      <text class="home-empty-copy">填写身高、体重和目标后，首页会开始记录你的真实变化。</text>
      <button class="home-empty-action" @tap="goToOnboarding">开始建档</button>
    </view>

    <MiniTabBar v-if="!wellnessSheet && !weightSheet" active="home" />
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { onHide, onShow } from '@dcloudio/uni-app';
import MiniTabBar from '../../components/MiniTabBar.vue';
import { healthLoopState } from '../../features/health-loop/health-loop.store.js';
import { createLocalWeightRecord, listLocalWeightRecords } from '../../features/weight/weight-records.local.js';
import { deriveDailyExperience } from '../../features/health-loop/daily-experience.js';
import { requestRecordTypeFocus } from '../../features/health-records/records-focus.js';
import { foodRecordActions, mealRecordIcons } from './home-actions.js';
import { loadHomeCardVisibility, type HomeCardId } from './home-card-settings.js';
import { navigateTo, navigateToXuxu } from '../../utils/router.js';
import { elapsedSeconds, finishFasting, formatDuration, loadFastingPlan, remainingSeconds, type FastingPlan } from '../../features/fasting/fasting-store.js';
import { loadWellnessJournal, saveMood, saveSleep, type MoodTone, type WellnessJournal } from '../../features/wellness/wellness-journal.js';
import { loadUserProfile } from '../../features/user-profile/user-profile.js';
import { userStorageKey } from '../../features/auth/user-storage.js';

// 序序小贴士：右上角气泡随机轮换的健康常识
const healthTips = [
  '饭后走一走，血糖更平稳',
  '睡前三小时，放下手机',
  '喝水小口多次，更解渴',
  '久坐 1 小时，起身伸展 2 分钟',
  '晒晒太阳，补充维生素 D',
  '细嚼慢咽，饱腹感更准时',
  '深呼吸 4 秒，给情绪降温',
  '今晚试试 23 点前入睡',
  '来一把深色蔬菜吧',
  '晨起一杯温水，唤醒肠胃',
] as const;
const bubbleTip = ref('');
function rotateBubble() {
  const pool = healthTips.filter((tip) => tip !== bubbleTip.value);
  const next = pool[Math.floor(Math.random() * pool.length)];
  if (next) bubbleTip.value = next;
}

const { today, loading, error } = healthLoopState;

function localDate(now = new Date()) {
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

const greeting = computed(() => {
  const hour = new Date().getHours();
  return hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好';
});

const dateLabel = computed(() => {
  const now = new Date();
  return `${now.getMonth() + 1} 月 ${now.getDate()} 日 · 今天`;
});

const displayName = computed(() => loadUserProfile().displayName || today.value?.displayName || '新朋友');
const menstruationCycle = ref<{ lastPeriodStart?: string; cycleLength?: number } | null>(null);
const medicationStats = ref({ total: 0, done: 0 });
const cardVisibility = ref(loadHomeCardVisibility());
const weightValuesHidden = ref(false);
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
const weightSheet = ref(false);
const homeWeightDraft = ref('');
const homeWeightNote = ref('');
const homeWeightDate = ref(localDate());
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
const homeWeightDateLabel = computed(() => homeWeightDate.value === localDate() ? '今天' : homeWeightDate.value.replaceAll('-', '.'));
const homeWeightTimeLabel = computed(() => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
});

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
const miniWeightData = computed(() => {
  const byDay = new Map<string, { id: string; valueKg: number; recordedAt: string }>();
  for (const record of weightHistory.value) {
    byDay.set(record.recordedAt.slice(0, 10), record); // 当天最后一次覆盖前面的
  }
  return [...byDay.values()]
    .sort((a, b) => +new Date(a.recordedAt) - +new Date(b.recordedAt))
    .slice(-7);
});
const miniWeightPoints = computed(() => {
  const data = miniWeightData.value;
  if (!data.length) return [];
  const values = data.map((item) => item.valueKg);
  const min = Math.min(...values) - 0.3;
  const max = Math.max(...values) + 0.3;
  const span = Math.max(0.1, max - min);
  if (data.length === 1) {
    const item = data[0];
    if (!item) return [];
    const y = 48 - ((item.valueKg - min) / span) * 36;
    return [
      { id: `${item.id}-guide`, x: 8, y },
      { id: item.id, x: 112, y },
    ];
  }
  return data.map((item, index) => ({
    id: item.id,
    x: data.length === 1 ? 60 : (index / (data.length - 1)) * 120,
    y: 48 - ((item.valueKg - min) / span) * 36,
  }));
});
// 迷你折线：svg 不可用，映射到 148x120 rpx 的 view 线段
const miniChartGeom = computed(() => {
  const pts = miniWeightPoints.value;
  if (pts.length < 2) return null;
  const px = (x: number) => 8 + (x / 120) * 132;
  const py = (y: number) => 14 + ((y - 8) / 40) * 92;
  const mapped = pts.map((point) => ({
    id: point.id,
    x: px(point.x),
    y: py(point.y),
    isLatest: point.id === pts[pts.length - 1]?.id,
  }));
  const segments: Array<{ id: string; x: number; y: number; len: number; angle: number }> = [];
  for (let i = 0; i < mapped.length - 1; i += 1) {
    const a = mapped[i];
    const b = mapped[i + 1];
    if (!a || !b) continue;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    segments.push({
      id: `${a.id}-${i}`,
      x: a.x,
      y: a.y,
      len: Math.hypot(dx, dy),
      angle: (Math.atan2(dy, dx) * 180) / Math.PI,
    });
  }
  return { pts: mapped, segments };
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
const weightPlanHasTarget = computed(() => {
  const target = today.value?.activePlan?.healthTarget?.targetWeightKg;
  return Number.isFinite(target) && Number(target) > 0;
});
const weightGapLabel = computed(() => {
  if (!weightPlanHasTarget.value) return '记录目标后，这里会显示你的进度';
  const current = Number(currentWeight.value);
  const target = Number(targetWeight.value);
  if (!Number.isFinite(current) || !Number.isFinite(target)) return '等待一次体重记录';
  const gap = Math.abs(current - target);
  return gap < 0.05 ? '已到达目标附近' : `距离目标 ${gap.toFixed(1)} kg`;
});
const weightProgressAmount = computed(() => {
  if (!weightPlanHasTarget.value) return '--';
  const start = Number(startWeight.value);
  const current = Number(currentWeight.value);
  if (!Number.isFinite(start) || !Number.isFinite(current)) return '--';
  const direction = today.value?.activePlan?.healthTarget?.direction;
  const amount = direction === 'gain' ? current - start : start - current;
  return amount > 0 ? amount.toFixed(1) : '0.0';
});
const weightArcNode = computed(() => {
  const progressRatio = Math.max(0, Math.min(1, progress.value / 100));
  const angle = Math.PI * progressRatio;
  return {
    // Match the node to the ring's actual circle instead of interpolating a straight line.
    x: 2.5 + 95 * ((1 - Math.cos(angle)) / 2),
    y: 104 - 98.8 * Math.sin(angle),
  };
});
const weightArcBackground = computed(() => {
  const angle = Math.max(0, Math.min(100, progress.value)) * 1.8;
  return `conic-gradient(from 270deg, #4f9d77 0deg ${angle}deg, #a8cdb8 ${Math.max(angle - 26, 0)}deg ${angle}deg, #e3ebe4 ${angle}deg 180deg, transparent 180deg 360deg)`;
});
function toggleWeightVisibility() {
  weightValuesHidden.value = !weightValuesHidden.value;
}

const todayWaterTotal = computed(() => {
  try {
    const now = new Date();
    const value = uni.getStorageSync(
      userStorageKey(`water_${now.getFullYear()}_${now.getMonth() + 1}_${now.getDate()}`),
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
const mealSummaryText = computed(() =>
  mealCount.value === 0
    ? '还没有记录，先记下今天的一餐'
    : `今天已记录 ${mealCount.value} 餐`,
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

  const direction = today.value.activePlan.healthTarget.direction;
  const prog = direction === 'gain'
    ? ((current - start) / (target - start)) * 100
    : ((start - current) / (start - target)) * 100;
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
const goToOnboarding = () => {
  uni.reLaunch({ url: '/pages/onboarding/OnboardingPage' });
};
function openHomeWeightSheet() {
  homeWeightDraft.value = '';
  homeWeightNote.value = '';
  homeWeightDate.value = localDate();
  weightSheet.value = true;
}
function closeHomeWeightSheet() {
  weightSheet.value = false;
}
function saveHomeWeight() {
  const value = Number(homeWeightDraft.value);
  if (!Number.isFinite(value) || value < 20 || value > 300) {
    uni.showToast({ title: '请输入 20–300 kg 之间的体重', icon: 'none' });
    return;
  }
  const now = new Date();
  const time = homeWeightDate.value === localDate()
    ? `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    : '08:00:00';
  createLocalWeightRecord({
    weight: Number(value.toFixed(1)),
    recordedAt: new Date(`${homeWeightDate.value}T${time}`).toISOString(),
    note: homeWeightNote.value.trim() || undefined,
  });
  weightHistory.value = listLocalWeightRecords().map((record) => ({ id: record.id, valueKg: record.weight, recordedAt: record.recordedAt }));
  weightSheet.value = false;
  healthLoopState.loadToday(localDate(), { force: true });
  uni.showToast({ title: '体重已记录', icon: 'success' });
}

const goToFoodDetail = () => {
  // The summary page reads the user's saved meal entries. The legacy food
  // detail page contains a static demo layout and must not be the home flow.
  navigateTo('/pages/food-summary/FoodSummaryPage');
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
    // Keep the home entry on the same real catalog/cart flow used by records.
    // The legacy MealAddPage is retained for compatibility but must not be the
    // default user path because it has a separate, less complete data model.
    url: '/pages/food-search/FoodSearchPage?mealType=lunch',
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

const load = (force = false) => {
  const today = getTodayDate();
  healthLoopState.loadToday(today, { force });
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
    const cycleRaw = uni.getStorageSync(userStorageKey('heban_menstruation_cycle'));
    menstruationCycle.value = cycleRaw
      ? typeof cycleRaw === 'string'
        ? JSON.parse(cycleRaw)
        : cycleRaw
      : null;
    const remindersRaw = uni.getStorageSync(userStorageKey('heban_medication_reminders'));
    const checkinsRaw = uni.getStorageSync(userStorageKey('heban_medication_checkins'));
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
  if (today.value) load(true);
  cardVisibility.value = loadHomeCardVisibility();
  loadWeightTrend();
  loadPersonalSignals();
  startFastingTicker();
  wellnessJournal.value = loadWellnessJournal();
  rotateBubble(); // 每次回到首页，序序随机说一句
});
onHide(stopFastingTicker);
onUnmounted(stopFastingTicker);
</script>

<style scoped>
/* ============================================================
 * 首页 · 晨雾玻璃 v3
 * 材质（卡片玻璃/按钮/插画混合模式）由全局 visual-system.css 提供；
 * 这里只负责首页特有的布局与首屏信息层级。
 * ============================================================ */
.page {
  position: relative;
  min-height: 100vh;
  padding: 0 var(--hz-gutter) calc(var(--hz-tabbar-height) + env(safe-area-inset-bottom) + 42rpx);
  background: transparent;
  color: var(--hz-ink);
}

/* 角落叶影：极淡水彩氛围 */
.bg-leaf {
  position: fixed;
  top: 0;
  right: 0;
  width: 360rpx;
  height: 360rpx;
  opacity: 0.05;
  pointer-events: none;
  z-index: 0;
  mix-blend-mode: multiply;
}

/* ---------- 右上角：序序 + 健康小贴士气泡 ---------- */
.header-right {
  display: flex;
  align-items: center;
  gap: 14rpx;
  flex: none;
}
.xuxu-bubble {
  position: relative;
  max-width: 236rpx;
  padding: 13rpx 17rpx;
  border: 1rpx solid rgba(159, 195, 173, 0.45);
  border-radius: 18rpx 4rpx 18rpx 18rpx;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 8rpx 20rpx rgba(29, 55, 41, 0.09), inset 0 1rpx 0 rgba(255, 255, 255, 0.95);
  -webkit-backdrop-filter: blur(14px) saturate(1.4);
  backdrop-filter: blur(14px) saturate(1.4);
}
.xuxu-bubble::after {
  content: '';
  position: absolute;
  right: -7rpx;
  bottom: 15rpx;
  width: 14rpx;
  height: 14rpx;
  border-right: 1rpx solid rgba(159, 195, 173, 0.45);
  border-top: 1rpx solid rgba(159, 195, 173, 0.45);
  border-radius: 0 4rpx 0 0;
  background: #ffffff;
  transform: rotate(45deg);
}
.bubble-text {
  display: -webkit-box;
  overflow: hidden;
  color: var(--hz-ink-soft);
  font-size: 19rpx;
  line-height: 1.5;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

/* ---------- 首屏：体重管理方案（唯一核心数据块） ---------- */
.weight-card {
  padding: 28rpx 28rpx 24rpx;
}
.weight-card-actions {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.week-badge {
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  background: var(--hz-green-soft);
  color: var(--hz-green);
  font-size: 18rpx;
  font-weight: 650;
}
.weight-visibility {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 58rpx;
  height: 42rpx;
  border: 1rpx solid var(--hz-rule-glass);
  border-radius: 14rpx;
  background: rgba(255, 255, 255, 0.7);
}
.weight-visibility image {
  width: 25rpx;
  height: 25rpx;
  opacity: 0.72;
}

/* 半圆进度：安静的晨绿 */
.weight-visual {
  min-height: 270rpx;
  padding-top: 0;
}
.weight-arc-stage {
  position: relative;
  width: 520rpx;
  max-width: 100%;
  height: 250rpx;
  margin: 0 auto;
  overflow: hidden;
}
.weight-arc-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 520rpx;
  border-radius: 50%;
  background: #dfe5e1;
}
/* 内圆挖空：把实心圆变成等宽圆环，只露出上半段弧 */
.weight-arc-ring::after {
  content: '';
  position: absolute;
  inset: 26rpx;
  border-radius: 50%;
  background: #ffffff;
}
.weight-arc-node {
  position: absolute;
  z-index: 2;
  width: 34rpx;
  height: 34rpx;
  margin-left: -17rpx;
  margin-top: -17rpx;
  border: 6rpx solid #ffffff;
  border-radius: 50%;
  background: var(--hz-green-bright);
  box-shadow: 0 0 0 3rpx rgba(255, 255, 255, 0.72), 0 5rpx 14rpx rgba(72, 163, 119, 0.28);
}
.weight-progress-copy {
  position: absolute;
  top: 46%;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  flex-direction: column;
  transform: translateY(-42%);
  pointer-events: none;
}
.weight-progress-value {
  color: var(--hz-ink);
  font-size: 44rpx;
  font-weight: 800;
  line-height: 1.05;
}
.weight-progress-label {
  margin-top: 8rpx;
  color: var(--hz-muted);
  font-size: 22rpx;
  font-weight: 600;
}
.weight-gap-label {
  margin-top: 8rpx;
  color: var(--hz-faint);
  font-size: 21rpx;
  font-weight: 500;
}
.weight-row {
  display: flex;
  justify-content: space-around;
  margin-top: 12rpx;
  padding-top: 18rpx;
  border-top: 1rpx solid var(--hz-rule-glass);
}
.weight-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}
.weight-col .num {
  color: var(--hz-muted);
  font-size: 30rpx;
  font-weight: 700;
}
.weight-col.main .num {
  color: var(--hz-green);
  font-size: 38rpx;
  font-weight: 800;
}
.weight-col .label {
  color: var(--hz-faint);
  font-size: 20rpx;
}

/* ---------- 饮食记录卡片 ---------- */
.calorie-card {
  padding: 28rpx;
}
.calorie-main {
  padding: 14rpx 0 10rpx;
  text-align: center;
}
.hint-text {
  color: var(--hz-muted);
  font-size: 20rpx;
}
.big-number .number {
  color: var(--hz-ink);
  font-size: 72rpx;
  font-weight: 700;
}
.big-number .unit {
  color: var(--hz-green);
  font-size: 24rpx;
}
.meal-summary {
  color: var(--hz-muted);
  font-size: 20rpx;
}
.camera-slot {
  margin-top: 12rpx;
  padding-top: 14rpx;
  border-top: 1rpx solid var(--hz-rule-glass);
}
.xuxu-camera-card {
  display: flex;
  align-items: center;
  min-height: 128rpx;
  padding: 16rpx 18rpx 16rpx 26rpx;
}
.xuxu-camera-card .camera-copy {
  flex: 1;
  min-width: 0;
}
.camera-title {
  color: #62585c;
  font-size: 29rpx;
  font-weight: 700;
}
.camera-subtitle {
  display: block;
  margin-top: 8rpx;
  color: #9b8d88;
  font-size: 19rpx;
}
.camera-decoration {
  flex: none;
  width: 190rpx;
  height: 132rpx;
  margin-left: 10rpx;
  mix-blend-mode: multiply;
}
.camera-decoration image,
image.camera-decoration {
  max-width: 190rpx;
  max-height: 132rpx;
}
.meal-progress {
  display: flex;
  gap: 8rpx;
  margin: 16rpx 6rpx 12rpx;
}
.meal-progress-segment {
  flex: 1;
  height: 8rpx;
  border-radius: 4rpx;
  background: var(--hz-rule-light);
}
.meal-progress-segment.filled {
  background: linear-gradient(90deg, #7db294 0%, var(--hz-green-bright) 100%);
}
.meals {
  display: flex;
  justify-content: space-between;
  padding: 10rpx 4rpx 6rpx;
}
.meal-item {
  display: flex;
  min-width: 112rpx;
  min-height: 120rpx;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 8rpx 4rpx 6rpx;
  border-radius: 18rpx;
}
.meal-item:active {
  background: var(--hz-surface-soft);
}
.meal-icon {
  width: 76rpx;
  height: 76rpx;
}
/* 四餐插画保持原色亮度：不叠加旧版的统一透明处理 */
.meal-item:nth-child(1) .meal-icon,
.meal-item:nth-child(2) .meal-icon,
.meal-item:nth-child(3) .meal-icon,
.meal-item:nth-child(4) .meal-icon {
  opacity: 1;
  animation: none;
}
.camera-decoration { filter: none; }
.meal-name {
  margin-top: 6rpx;
  color: var(--hz-ink-soft);
  font-size: 20rpx;
  font-weight: 600;
}

/* ---------- 体重记录卡片 ---------- */
.record-card {
  padding: 26rpx 28rpx;
}
.record-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 124rpx;
}
.big-value .value {
  color: var(--hz-green);
  font-size: 56rpx;
  font-weight: 700;
}
.value-unit {
  color: var(--hz-muted);
}
.time-text {
  color: var(--hz-faint);
}
.weight-add {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 76rpx;
  height: 48rpx;
  padding: 0 16rpx;
  border: 1rpx solid rgba(159, 195, 173, 0.55);
  border-radius: 999rpx;
  color: var(--hz-green);
  background: rgba(237, 247, 240, 0.82);
  font-size: 20rpx;
  font-weight: 650;
}
.mini-chart {
  width: 148rpx;
  height: 110rpx;
}
.mini-chart-view {
  position: relative;
  width: 100%;
  height: 100%;
}
.mini-seg {
  position: absolute;
  height: 5rpx;
  margin-top: -2.5rpx;
  border-radius: 2.5rpx;
  background: linear-gradient(90deg, #86bda0 0%, #48a377 100%);
  transform-origin: 0 50%;
}
.mini-dot {
  position: absolute;
  width: 12rpx;
  height: 12rpx;
  margin: -6rpx 0 0 -6rpx;
  border: 3rpx solid #48a377;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 2rpx 6rpx rgba(47, 107, 77, 0.18);
}
.mini-dot.latest {
  width: 16rpx;
  height: 16rpx;
  margin: -8rpx 0 0 -8rpx;
  border-color: #2f6b4d;
  background: #48a377;
}
.chart-icon {
  width: 112rpx;
  height: 112rpx;
  border-radius: 0;
}

/* ---------- 轻断食 / 经期 / 用药：同构行卡 ---------- */
.fasting-card,
.period-card,
.medication-card {
  position: relative;
  overflow: hidden;
  min-height: 168rpx;
  margin-bottom: 18rpx;
  padding: 24rpx 28rpx;
}
.fasting-content,
.period-content,
.medication-content {
  position: relative;
  z-index: 1;
  max-width: 66%;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.fasting-label,
.period-hint,
.medication-hint {
  color: var(--hz-muted);
  font-size: 20rpx;
}
.fasting-time {
  color: var(--hz-green);
  font-size: 40rpx;
  font-weight: 700;
}
.fasting-summary {
  color: var(--hz-muted);
  font-size: 20rpx;
}
.period-days {
  color: var(--hz-blush);
  font-size: 26rpx;
  font-weight: 700;
}
.medication-item {
  color: var(--hz-ink-soft);
  font-size: 23rpx;
  font-weight: 600;
}
.fasting-icon-img,
.period-icon-img,
.medication-icon-img {
  position: absolute;
  right: 20rpx;
  bottom: 14rpx;
  width: 116rpx;
  height: 116rpx;
  border-radius: 0;
}

/* ---------- 加载态 ---------- */
.loading-state {
  position: relative;
  display: flex;
  min-height: 68vh;
  align-items: flex-end;
  justify-content: center;
  overflow: hidden;
  margin: 0 calc(var(--hz-gutter) * -1);
  border-radius: 0 0 32rpx 32rpx;
  background: var(--hz-bg-tint);
}
.loading-art {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.85;
}
.loading-wash {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(244, 248, 244, 0.1) 26%, rgba(255, 253, 249, 0.96) 88%);
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
  color: var(--hz-ink);
  font-size: 34rpx;
  font-weight: 750;
}
.loading-subtitle {
  display: block;
  margin-top: 12rpx;
  color: var(--hz-muted);
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
  background: var(--hz-green-bright);
  animation: loading-breathe 1.35s ease-in-out infinite;
}
.loading-dots view:nth-child(2) { animation-delay: 0.15s; }
.loading-dots view:nth-child(3) { animation-delay: 0.3s; }
@keyframes loading-breathe {
  0%, 100% { transform: translateY(0); opacity: 0.42; }
  50% { transform: translateY(-7rpx); opacity: 1; }
}

/* ---------- 空状态 / 错误态 ---------- */
.home-empty-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx var(--hz-gutter) 140rpx;
  text-align: center;
}
.home-empty-art {
  width: 300rpx;
  height: 260rpx;
  margin-bottom: 18rpx;
  opacity: 0.92;
}
.home-empty-title {
  color: var(--hz-ink);
  font-size: 34rpx;
  font-weight: 750;
}
.home-empty-copy {
  max-width: 520rpx;
  margin-top: 12rpx;
  color: var(--hz-muted);
  font-size: 23rpx;
  line-height: 1.6;
}
.home-empty-action {
  display: flex;
  width: 260rpx;
  height: 80rpx;
  align-items: center;
  justify-content: center;
  margin-top: 28rpx;
  border: 1rpx solid rgba(159, 195, 173, 0.55);
  border-radius: var(--hz-radius-control);
  background: rgba(237, 247, 240, 0.85);
  color: #2f5f4a;
  font-size: 26rpx;
  font-weight: 700;
}
.error-state text {
  margin-top: 14rpx;
  color: var(--hz-muted);
  font-size: 24rpx;
}
.error-state button {
  margin-top: 18rpx;
  padding: 14rpx 26rpx;
  border: 1rpx solid rgba(159, 195, 173, 0.55);
  border-radius: var(--hz-radius-control);
  background: rgba(237, 247, 240, 0.85);
  color: #2f5f4a;
  font-size: 24rpx;
  font-weight: 650;
}

/* ---------- 记录体重 / 身心弹层 ---------- */
.weight-record-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.weight-record-title {
  display: block;
  color: var(--hz-ink);
  font-size: 31rpx;
  font-weight: 750;
  line-height: 1.25;
}
.weight-record-subtitle {
  display: block;
  margin-top: 7rpx;
  color: var(--hz-faint);
  font-size: 19rpx;
  line-height: 1.4;
}
.sheet-close {
  display: flex;
  width: 58rpx;
  height: 58rpx;
  align-items: center;
  justify-content: center;
  color: var(--hz-muted);
  font-size: 40rpx;
}
.weight-record-time {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14rpx;
  margin: 20rpx -30rpx 0;
  padding: 14rpx 0;
  border-top: 1rpx solid var(--hz-rule-glass);
  border-bottom: 1rpx solid var(--hz-rule-glass);
  color: var(--hz-muted);
  font-size: 20rpx;
}
.weight-record-time text:last-child {
  color: var(--hz-green);
  font-size: 27rpx;
  font-weight: 700;
}
.home-weight-input-wrap {
  display: flex;
  align-items: center;
  height: 94rpx;
  margin-top: 22rpx;
  padding: 0 22rpx;
  border: 1rpx solid var(--hz-rule-glass);
  border-radius: var(--hz-radius-control);
  background: rgba(255, 255, 255, 0.86);
}
.home-weight-input-wrap input {
  flex: 1;
  height: 92rpx;
  color: var(--hz-ink);
  font-size: 44rpx;
  font-weight: 800;
}
.home-weight-input-wrap text {
  color: var(--hz-muted);
  font-size: 22rpx;
  font-weight: 700;
}
.home-weight-date {
  display: flex;
  align-items: center;
  gap: 12rpx;
  height: 70rpx;
  margin-top: 16rpx;
  padding: 0 4rpx;
  border-bottom: 1rpx solid var(--hz-rule-glass);
  color: var(--hz-muted);
  font-size: 20rpx;
}
.home-weight-date text:nth-child(2) {
  margin-left: auto;
  color: var(--hz-ink-soft);
  font-size: 22rpx;
}
.home-weight-date image {
  width: 26rpx;
  height: 26rpx;
  opacity: 0.42;
}
.home-weight-note {
  width: 100%;
  height: 70rpx;
  margin-top: 14rpx;
  padding: 0 4rpx;
  border-bottom: 1rpx solid var(--hz-rule-glass);
  color: var(--hz-ink-soft);
  background: transparent;
  font-size: 21rpx;
  box-sizing: border-box;
}
.wellness-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding-top: 2rpx;
}
.wellness-title {
  display: block;
  color: var(--hz-ink);
  font-size: 34rpx;
  font-weight: 700;
  line-height: 1.3;
}
.wellness-subtitle {
  display: block;
  margin-top: 8rpx;
  color: var(--hz-muted);
  font-size: 21rpx;
}
.sleep-art {
  width: 100%;
  height: 184rpx;
  margin: 16rpx 0 8rpx;
  border-radius: 20rpx;
  object-fit: cover;
  object-position: center 58%;
}
.field-label {
  display: block;
  margin: 26rpx 0 12rpx;
  color: var(--hz-ink-soft);
  font-size: 21rpx;
}
.optional {
  margin-left: 8rpx;
  color: var(--hz-faint);
  font-size: 18rpx;
}
.duration-field {
  display: flex;
  align-items: center;
  padding: 0 18rpx;
}
.duration-field input {
  flex: 1;
  height: 78rpx;
  color: var(--hz-ink);
  font-size: 28rpx;
}
.duration-field text {
  color: var(--hz-muted);
  font-size: 20rpx;
}
.tone-row {
  display: flex;
  gap: 10rpx;
}
.tone-choice {
  flex: 1;
  min-height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8rpx;
  font-size: 20rpx;
}
.dream-input {
  width: 100%;
  min-height: 150rpx;
  padding: 18rpx;
  color: var(--hz-ink-soft);
  font-size: 21rpx;
  line-height: 1.5;
}
.wellness-save {
  width: 100%;
  min-height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 28rpx;
  border-radius: var(--hz-radius-control);
  font-size: 25rpx;
}
.mood-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
}
.mood-choice {
  min-height: 68rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  font-size: 20rpx;
}
.mood-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: #a9b8e7;
}
.mood-dot.bright { background: #f4c979; }
.mood-dot.tired { background: #b9c3cb; }
.mood-dot.low { background: #d99cab; }
.mood-dot.anxious { background: #9ecdc1; }

/* 交互反馈 */
.avatar-wrapper,
.meal-item,
.weight-add,
.weight-visibility,
.edit-card,
.sheet-close,
.tone-choice,
.mood-choice {
  transition: transform 0.16s ease, background-color 0.16s ease, border-color 0.16s ease;
}
.button-hover,
.meal-item:active,
.avatar-wrapper:active,
.weight-add:active,
.sheet-close:active,
.tone-choice:active,
.mood-choice:active {
  transform: scale(0.975);
  opacity: 0.92;
}

/* 窄屏：小机型保持网格与半圆可读 */
@media (max-width: 360px) {
  .xuxu-bubble { max-width: 196rpx; }
  .weight-arc-stage { height: 210rpx; }
  .weight-progress-copy { top: 44%; }
}
</style>
