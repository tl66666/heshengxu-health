<template>
  <view class="weight-page">
    <AppNavBar title="我的体重" route="weight" />

    <view class="hero-wrap">
      <image
        class="hero-art"
        src="/static/illustrations/weight-weighing-scene.png"
        mode="widthFix"
      />
      <view class="hero-wash" />
      <view class="hero-copy">
        <text class="hero-kicker">慢慢变轻，也慢慢喜欢自己</text>
        <view class="hero-number-row">
          <text class="hero-number">{{ currentWeight ? currentWeight.toFixed(1) : '--' }}</text>
          <text class="hero-unit">kg</text>
        </view>
        <text class="hero-date">{{ latestRecordLabel }}</text>
      </view>
      <view class="hero-bubble">
        <text class="bubble-title">比开始</text>
        <text class="bubble-value">{{ weightDeltaLabel }}</text>
      </view>
    </view>

    <view class="summary-card card">
      <view class="summary-heading">
        <image src="/static/icons/weight-scale.png" mode="aspectFit" />
        <view>
          <text class="summary-heading-title">今天的体重概览</text>
          <text class="summary-heading-note">轻轻记下，就能看见变化</text>
        </view>
        <button class="plan-settings" @tap="openPlanSetup">
          {{ targetWeight ? '调整目标' : '设置目标' }}
        </button>
      </view>
      <view class="summary-main">
        <view class="summary-item">
          <text class="summary-label">BMI</text>
          <text class="summary-value">{{ bmi }}</text>
          <text class="summary-note">{{ bmiStatus }}</text>
        </view>
        <view class="summary-divider" />
        <view class="summary-item">
          <text class="summary-label">目标体重</text>
          <text class="summary-value"
            >{{ targetWeight ? targetWeight.toFixed(1) : '--'
            }}<text class="small-unit"> kg</text></text
          >
          <text class="summary-note">预计 {{ targetDate }}</text>
        </view>
      </view>
      <view class="progress-track">
        <view class="progress-fill" :style="{ width: `${progress}%` }" />
        <view class="progress-marker" :style="{ left: `${progress}%` }" />
      </view>
      <view class="progress-meta">
        <text>开始 {{ startWeight ? startWeight.toFixed(1) : '--' }} kg</text>
        <text class="progress-message">已完成 {{ progress.toFixed(0) }}%</text>
        <text>目标 {{ targetWeight ? targetWeight.toFixed(1) : '--' }} kg</text>
      </view>
      <view class="plan-timeline">
        <text>{{ planWeekLabel }}</text>
        <text>{{ planStartLabel }}</text>
      </view>
    </view>

    <view class="view-switch" aria-label="体重管理视图">
      <button
        v-for="view in viewTabs"
        :key="view.value"
        class="view-tab"
        :class="{ active: activeView === view.value }"
        @tap="activeView = view.value"
      >
        <text class="view-tab-title">{{ view.label }}</text>
        <text class="view-tab-caption">{{ view.caption }}</text>
      </button>
    </view>

    <view v-if="activeView === 'progress'" class="section-heading">
      <view>
        <text class="section-title">体重趋势</text>
        <text class="section-subtitle">看见每一次温柔的坚持</text>
      </view>
      <view class="range-tabs">
        <button
          v-for="tab in rangeTabs"
          :key="tab.value"
          class="range-tab"
          :class="{ active: selectedRange === tab.value }"
          @tap="selectedRange = tab.value"
        >
          {{ tab.label }}
        </button>
      </view>
    </view>

    <view v-if="activeView === 'progress'" class="trend-card card">
      <view class="trend-topline">
        <view>
          <text class="trend-number">{{ hasTrendComparison ? trendChangeLabel : '--' }}</text>
          <text class="trend-caption">{{ trendCaption }}</text>
        </view>
        <view class="trend-meta">
          <view class="trend-legend"><view class="legend-dot" /> <text>体重</text></view>
          <text v-if="hasTrendData" class="trend-count">{{ chartData.length }} 次记录</text>
        </view>
      </view>
      <view v-if="hasTrendData" class="chart-shell">
        <view class="chart-scale">
          <text v-for="label in chartScaleLabels" :key="label">{{ label }}</text>
        </view>
        <svg class="trend-svg" viewBox="0 0 320 150" preserveAspectRatio="none">
          <line
            v-for="line in gridLines"
            :key="line"
            x1="0"
            :y1="line"
            x2="320"
            :y2="line"
            class="grid-line"
          />
          <line v-if="goalY !== null" x1="0" :y1="goalY" x2="320" :y2="goalY" class="goal-line" />
          <path :d="trendAreaPath" class="trend-area" />
          <path :d="trendPath" class="trend-line" />
          <circle
            v-for="point in trendPoints"
            :key="point.id"
            :cx="point.x"
            :cy="point.y"
            r="4"
            :class="['trend-point', { selected: selectedTrendRecord?.id === point.id }]"
            @tap="selectTrendPoint(point.id)"
          />
        </svg>
        <view class="chart-labels">
          <text v-for="point in chartLabels" :key="point.id">{{ point.label }}</text>
        </view>
      </view>
      <view v-if="hasTrendData" class="trend-summary">
        <view class="trend-summary-item">
          <text class="trend-summary-label">区间平均</text>
          <text class="trend-summary-value">{{ averageWeight.toFixed(1) }} kg</text>
        </view>
        <view class="trend-summary-item">
          <text class="trend-summary-label">最低记录</text>
          <text class="trend-summary-value">{{ lowestWeight.toFixed(1) }} kg</text>
        </view>
        <view class="trend-summary-item">
          <text class="trend-summary-label">最高记录</text>
          <text class="trend-summary-value">{{ highestWeight.toFixed(1) }} kg</text>
        </view>
      </view>
      <view v-if="selectedTrendRecord" class="selected-record">
        <view>
          <text class="selected-record-label">选中记录</text>
          <text class="selected-record-date">{{
            formatDateTime(selectedTrendRecord.recordedAt)
          }}</text>
        </view>
        <view class="selected-record-value">
          <text>{{ selectedTrendRecord.weight.toFixed(1) }}</text>
          <text class="small-unit"> kg</text>
        </view>
      </view>
      <view v-if="hasTrendComparison" class="insight-strip">
        <image src="/static/illustrations/xuxu-avatar.png" mode="aspectFill" />
        <text>{{ insightText }}</text>
      </view>
      <view v-if="hasTrendData && !hasTrendComparison" class="trend-single">
        <text>已记录 1 次</text>
        <text>再记录一次，就能看到体重变化趋势</text>
      </view>
      <view v-if="!hasTrendData" class="trend-empty">
        <text class="trend-empty-title">还没有趋势数据</text>
        <text class="trend-empty-copy">记录 2 次以上体重后，这里会显示你的变化曲线</text>
        <button class="trend-empty-action" @tap="openNewRecord">记录第一次体重</button>
      </view>
    </view>

    <view v-if="activeView === 'progress'" class="section-heading compact">
      <view>
        <text class="section-title">小小里程碑</text>
        <text class="section-subtitle">给今天的自己一个肯定</text>
      </view>
    </view>
    <view v-if="activeView === 'progress'" class="milestone-row">
      <view
        v-for="item in milestones"
        :key="item.title"
        class="milestone"
        :class="{ achieved: item.achieved }"
      >
        <view class="milestone-icon">{{ item.achieved ? '✓' : '·' }}</view>
        <text class="milestone-title">{{ item.title }}</text>
        <text class="milestone-note">{{ item.note }}</text>
      </view>
    </view>

    <view v-if="activeView === 'records'" class="section-heading compact history-heading">
      <view>
        <text class="section-title">最近记录</text>
        <text class="section-subtitle">每一次记录，都是在照顾自己</text>
      </view>
      <button class="text-button" @tap="activeView = 'records'">查看全部</button>
    </view>
    <view v-if="activeView === 'records'" class="history-card card">
      <view class="record-filters">
        <button
          v-for="filter in recordFilters"
          :key="filter.value"
          class="record-filter"
          :class="{ active: recordFilter === filter.value }"
          @tap="recordFilter = filter.value"
        >
          {{ filter.label }}
        </button>
      </view>
      <view v-if="loadingRecords" class="history-loading">正在同步真实记录…</view>
      <view v-else-if="!recordList.length" class="history-empty">
        <text>还没有体重记录</text>
        <text>记录第一次体重，开始看见自己的变化</text>
      </view>
      <view
        v-for="(record, index) in recordList"
        :key="record.id"
        class="history-item"
        @tap="editRecord(record)"
      >
        <view class="history-date">
          <text class="history-day">{{ formatDay(record.recordedAt) }}</text>
          <text class="history-time">{{ formatTime(record.recordedAt) }}</text>
        </view>
        <view class="history-note"
          ><text>{{ record.note || '晨起空腹' }}</text></view
        >
        <view class="history-weight"
          ><text>{{ record.weight.toFixed(1) }}</text
          ><text class="small-unit"> kg</text></view
        >
        <text
          v-if="index < recordList.length - 1"
          class="history-change"
          :class="changeClass(record, index)"
          >{{ changeLabel(record, index) }}</text
        >
      </view>
    </view>

    <view v-if="activeView === 'progress'" class="progress-lower">
      <view class="section-heading compact">
        <view>
          <text class="section-title">接下来会怎样</text>
          <text class="section-subtitle">按现在的节奏，给身体一点时间</text>
        </view>
      </view>
      <view class="forecast-card card">
        <view class="forecast-copy">
          <text class="forecast-label">预计到达目标</text>
          <text class="forecast-date">{{ forecastDate }}</text>
          <text class="forecast-note">{{ forecastNote }}</text>
        </view>
        <view class="forecast-ring"
          ><text>{{ progress.toFixed(0) }}<text class="ring-unit">%</text></text
          ><text>进度</text></view
        >
      </view>
      <view class="section-heading compact rhythm-heading">
        <view>
          <text class="section-title">本周节奏</text>
          <text class="section-subtitle">不追求满分，只要持续出现</text>
        </view>
        <text class="rhythm-score">{{ rhythmScore }}/7 天</text>
      </view>
      <view class="rhythm-card card">
        <view
          v-for="day in weeklyRhythm"
          :key="day.label"
          class="rhythm-day"
          :class="{ filled: day.filled, today: day.today }"
        >
          <view class="rhythm-dot">{{ day.filled ? '✓' : '' }}</view>
          <text>{{ day.label }}</text>
        </view>
      </view>
    </view>

    <view v-if="activeView === 'data'" class="data-view">
      <view class="section-heading compact">
        <view>
          <text class="section-title">身体数据</text>
          <text class="section-subtitle">用趋势理解身体，不被单个数字定义</text>
        </view>
      </view>
      <view class="metric-grid">
        <view v-for="metric in bodyMetrics" :key="metric.title" class="metric-card card">
          <view class="metric-head"
            ><text class="metric-title">{{ metric.title }}</text
            ><text class="metric-unit">{{ metric.unit }}</text></view
          >
          <view class="metric-value-row"
            ><text class="metric-value">{{ metric.value }}</text
            ><text class="metric-status" :class="metric.tone">{{ metric.status }}</text></view
          >
          <view class="metric-rail"
            ><view
              class="metric-rail-fill"
              :class="metric.tone"
              :style="{ width: `${metric.percent}%` }"
          /></view>
          <text class="metric-range">{{ metric.range }}</text>
        </view>
      </view>
      <view class="care-card card">
        <image src="/static/illustrations/xuxu-safe-support.png" mode="aspectFit" />
        <view
          ><text class="care-title">小絮的提醒</text
          ><text class="care-copy"
            >体重会因为水分、睡眠和周期轻轻波动。观察 7 天趋势，比盯着某一天更接近真实的你。</text
          ></view
        >
      </view>
    </view>

    <view class="bottom-space" />
    <button class="record-button" hover-class="record-button-hover" @tap="openNewRecord">
      <text class="plus">+</text><text>记录今天体重</text>
    </button>

    <view v-if="showDialog" class="dialog-mask" @tap="closeDialog">
      <view class="dialog" @tap.stop>
        <view class="dialog-handle" />
        <view class="dialog-head">
          <view>
            <text class="dialog-title">{{
              editingRecordId ? '编辑体重记录' : '记录今天的体重'
            }}</text>
            <text class="dialog-subtitle">每天一次，记录身体真实的变化</text>
          </view>
          <button class="dialog-close" aria-label="关闭" @tap="closeDialog">×</button>
        </view>
        <view class="dialog-hint">
          <view class="hint-dot" />
          <text>建议起床后、早餐前记录，变化会更稳定</text>
        </view>
        <view class="field-block weight-field-block">
          <view class="field-label">今天的体重</view>
          <view class="weight-input-wrap">
            <input
              v-model="inputWeight"
              class="weight-input"
              type="digit"
              placeholder="例如 65.5"
            />
            <text class="input-unit">kg</text>
          </view>
        </view>
        <view class="field-block">
          <view class="field-label">记录日期</view>
          <picker mode="date" :value="recordedDate" @change="recordedDate = $event.detail.value">
            <view class="date-picker-value">
              <text>{{ recordedDate || '选择日期' }}</text>
              <text class="picker-chevron">›</text>
            </view>
          </picker>
        </view>
        <view class="field-block">
          <view class="field-label">此刻的状态 <text class="optional-label">可选</text></view>
          <input
            v-model="inputNote"
            class="note-input"
            type="text"
            placeholder="例如：睡得很好，状态轻盈"
          />
        </view>
        <button class="save-button" @tap="saveWeight">保存体重记录</button>
        <button v-if="editingRecordId" class="delete-record-button" @tap="deleteEditingRecord">
          删除这条记录
        </button>
      </view>
    </view>

    <view v-if="showSuccess" class="dialog-mask" @tap="showSuccess = false">
      <view class="success-sheet" @tap.stop>
        <view class="success-mark">✓</view>
        <text class="success-title">已记录 {{ savedWeight.toFixed(1) }} kg</text>
        <text class="success-copy">{{ saveComparisonText }}</text>
        <view class="success-metrics">
          <view
            ><text>{{ bmi }}</text
            ><text>BMI · {{ bmiStatus }}</text></view
          >
          <view
            ><text>{{ progress.toFixed(0) }}%</text><text>目标进度</text></view
          >
        </view>
        <button class="success-done" @tap="showSuccess = false">完成</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import AppNavBar from '../../components/AppNavBar.vue';
import { healthLoopState } from '../../features/health-loop/health-loop.store.js';
import { loadLocalPlan, loadLocalProfile } from '../../features/health-loop/local-demo.js';
import {
  createLocalWeightRecord,
  deleteLocalWeightRecord,
  listLocalWeightRecords,
  updateLocalWeightRecord,
  type LocalWeightRecord,
} from '../../features/weight/weight-records.local.js';

type WeightRecord = LocalWeightRecord;

const records = ref<WeightRecord[]>(listLocalWeightRecords());
const profile = ref<{ heightCm: number | null; weightKg: number | null } | null>(null);
const localPlan = ref(loadLocalPlan());
const loadingRecords = ref(true);
const selectedRange = ref<'7' | '30' | '90'>('30');
const activeView = ref<'progress' | 'data' | 'records'>('progress');
const showDialog = ref(false);
const editingRecordId = ref<string | null>(null);
const inputWeight = ref('');
const inputNote = ref('');
const recordedDate = ref('');
const showSuccess = ref(false);
const savedWeight = ref(0);
const savedDelta = ref<number | null>(null);
const saveComparisonText = computed(() =>
  savedDelta.value === null
    ? '这是你的第一条体重记录'
    : Math.abs(savedDelta.value) < 0.05
      ? '与上一次记录基本持平'
      : `比上一次${savedDelta.value < 0 ? '减少' : '增加'} ${Math.abs(savedDelta.value).toFixed(1)} kg`,
);
const recordFilter = ref<'all' | '30' | '90'>('all');
const recordFilters = [
  { label: '全部', value: 'all' as const },
  { label: '近 30 天', value: '30' as const },
  { label: '近 90 天', value: '90' as const },
];
const rangeTabs = [
  { label: '7天', value: '7' as const },
  { label: '30天', value: '30' as const },
  { label: '90天', value: '90' as const },
];
const viewTabs = [
  { label: '进度', caption: '趋势与目标', value: 'progress' as const },
  { label: '数据', caption: '身体指标', value: 'data' as const },
  { label: '记录', caption: '每一次变化', value: 'records' as const },
];
const startWeight = computed(
  () =>
    localPlan.value?.healthTarget?.startWeightKg ??
    healthLoopState.today.value?.activePlan?.healthTarget?.startWeightKg ??
    records.value[records.value.length - 1]?.weight ??
    profile.value?.weightKg ??
    0,
);
const targetWeight = computed(
  () =>
    localPlan.value?.healthTarget?.targetWeightKg ??
    healthLoopState.today.value?.activePlan?.healthTarget?.targetWeightKg ??
    0,
);
const targetDirection = computed(
  () =>
    localPlan.value?.healthTarget?.direction ??
    healthLoopState.today.value?.activePlan?.healthTarget?.direction ??
    'lose',
);
const heightCm = computed(() => profile.value?.heightCm ?? 0);

const currentWeight = computed(
  () => records.value[0]?.weight ?? healthLoopState.today.value?.todayRecords.weight?.valueKg ?? 0,
);
const bmi = computed(() =>
  currentWeight.value && heightCm.value
    ? (currentWeight.value / (heightCm.value / 100) ** 2).toFixed(1)
    : '--',
);
const bmiStatus = computed(() =>
  bmi.value === '--'
    ? '待完善身高数据'
    : Number(bmi.value) < 18.5
      ? '偏轻'
      : Number(bmi.value) < 24
        ? '健康范围'
        : Number(bmi.value) < 28
          ? '偏高'
          : '较高',
);
const progress = computed(() =>
  startWeight.value > 0 && targetWeight.value > 0 && startWeight.value !== targetWeight.value
    ? Math.max(
        0,
        Math.min(
          100,
          ((targetDirection.value === 'gain'
            ? currentWeight.value - startWeight.value
            : startWeight.value - currentWeight.value) /
            (targetDirection.value === 'gain'
              ? targetWeight.value - startWeight.value
              : startWeight.value - targetWeight.value)) *
            100,
        ),
      )
    : 0,
);
const planStartDate = computed(
  () =>
    localPlan.value?.healthTarget.startDate ||
    healthLoopState.today.value?.activePlan?.healthTarget.startDate ||
    '',
);
const planTotalWeeks = computed(() => {
  if (!startWeight.value || !targetWeight.value) return 0;
  return Math.max(1, Math.ceil(Math.abs(startWeight.value - targetWeight.value) / 0.5));
});
const planCurrentWeek = computed(() => {
  if (!planStartDate.value) return 1;
  const elapsed = Math.max(0, Date.now() - new Date(`${planStartDate.value}T00:00:00`).getTime());
  return Math.min(planTotalWeeks.value || 1, Math.floor(elapsed / (7 * 86400000)) + 1);
});
const planWeekLabel = computed(() =>
  planTotalWeeks.value
    ? `第 ${planCurrentWeek.value}/${planTotalWeeks.value} 周`
    : '尚未设置体重目标',
);
const planStartLabel = computed(() =>
  planStartDate.value
    ? `${planStartDate.value.replaceAll('-', '.')} 开始`
    : '设置目标后开始计算周期',
);
const chronologicalRecords = computed(() =>
  records.value.slice().sort((a, b) => +new Date(a.recordedAt) - +new Date(b.recordedAt)),
);
const observedWeeklyChange = computed(() => {
  if (chronologicalRecords.value.length < 3) return null;
  const first = chronologicalRecords.value[0];
  const last = chronologicalRecords.value[chronologicalRecords.value.length - 1];
  if (!first || !last) return null;
  const weeks = (+new Date(last.recordedAt) - +new Date(first.recordedAt)) / (7 * 86400000);
  if (weeks < 1) return null;
  const change =
    targetDirection.value === 'gain' ? last.weight - first.weight : first.weight - last.weight;
  return change / weeks;
});
const targetDate = computed(() =>
  !targetWeight.value
    ? '先设置目标体重'
    : observedWeeklyChange.value && observedWeeklyChange.value > 0
      ? forecastDate.value
      : '积累 3 次跨周记录后估算',
);
const remainingKg = computed(() =>
  currentWeight.value && targetWeight.value
    ? Math.max(
        0,
        targetDirection.value === 'gain'
          ? targetWeight.value - currentWeight.value
          : currentWeight.value - targetWeight.value,
      )
    : 0,
);
const forecastDate = computed(() =>
  !currentWeight.value
    ? '记录体重后开始预测'
    : targetWeight.value && remainingKg.value <= 0
      ? '已经到达目标'
      : targetWeight.value && observedWeeklyChange.value && observedWeeklyChange.value > 0
        ? formatForecastDate(Math.ceil((remainingKg.value / observedWeeklyChange.value) * 7))
        : targetWeight.value
          ? '等待更多真实记录'
          : '等待目标体重',
);
const forecastNote = computed(() => {
  if (!currentWeight.value) return '记录 3 次以上后，预测会更准确';
  if (!targetWeight.value) return '设置目标体重后，这里会显示预计进度';
  if (remainingKg.value <= 0) return '已达到目标，保持现在的节奏就很好';
  if (!observedWeeklyChange.value || observedWeeklyChange.value <= 0)
    return `还需要 ${remainingKg.value.toFixed(1)} kg，积累跨周记录后再估算速度`;
  return `还需要 ${remainingKg.value.toFixed(1)} kg，最近平均每周变化 ${observedWeeklyChange.value.toFixed(2)} kg`;
});
const latestRecordLabel = computed(() =>
  records.value[0] ? `${formatDate(records.value[0].recordedAt)} 更新` : '还没有记录',
);
const weightDelta = computed(() => currentWeight.value - startWeight.value);
const weightDeltaLabel = computed(() =>
  currentWeight.value
    ? `${weightDelta.value > 0 ? '+' : ''}${weightDelta.value.toFixed(1)} kg`
    : '--',
);
const trendRecords = computed(() => {
  const cutoff = Date.now() - Number(selectedRange.value) * 86400000;
  return records.value
    .filter((item) => +new Date(item.recordedAt) >= cutoff)
    .sort((a, b) => +new Date(a.recordedAt) - +new Date(b.recordedAt));
});
const chartData = computed(() => trendRecords.value);
const hasTrendData = computed(() => chartData.value.length > 0);
const hasTrendComparison = computed(() => chartData.value.length > 1);
const selectedTrendId = ref<string | null>(null);
const selectedTrendRecord = computed(
  () =>
    chartData.value.find((record) => record.id === selectedTrendId.value) ||
    chartData.value[chartData.value.length - 1] ||
    null,
);
const averageWeight = computed(() =>
  chartData.value.length
    ? chartData.value.reduce((total, record) => total + record.weight, 0) / chartData.value.length
    : 0,
);
const lowestWeight = computed(() =>
  chartData.value.length ? Math.min(...chartData.value.map((record) => record.weight)) : 0,
);
const highestWeight = computed(() =>
  chartData.value.length ? Math.max(...chartData.value.map((record) => record.weight)) : 0,
);
const chartBounds = computed(() => {
  const data = chartData.value;
  if (!data.length) return { min: 0, max: 1 };
  const min = Math.min(...data.map((item) => item.weight)) - 0.5;
  const max = Math.max(...data.map((item) => item.weight)) + 0.5;
  return { min, max: Math.max(min + 0.1, max) };
});
const chartScaleLabels = computed(() => {
  const { min, max } = chartBounds.value;
  return [max, (min + max) / 2, min].map((value) => value.toFixed(1));
});
const goalY = computed(() => {
  if (!targetWeight.value || !hasTrendData.value) return null;
  const { min, max } = chartBounds.value;
  if (targetWeight.value < min || targetWeight.value > max) return null;
  return 124 - ((targetWeight.value - min) / (max - min)) * 96;
});
const trendPoints = computed(() => {
  const data = chartData.value;
  if (!data.length) return [];
  if (data.length === 1) {
    const first = data[0];
    return first ? [{ id: first.id, x: 160, y: 76 }] : [];
  }
  const min = Math.min(...data.map((item) => item.weight)) - 0.5;
  const max = Math.max(...data.map((item) => item.weight)) + 0.5;
  const span = Math.max(0.1, max - min);
  return data.map((item, index) => ({
    id: item.id,
    x: data.length === 1 ? 160 : (index / (data.length - 1)) * 320,
    y: 124 - ((item.weight - min) / span) * 96,
  }));
});
const trendPath = computed(() =>
  trendPoints.value.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' '),
);
const trendAreaPath = computed(() =>
  trendPoints.value.length ? `${trendPath.value} L 320 140 L 0 140 Z` : '',
);
const chartLabels = computed(() =>
  chartData.value
    .filter((_, index) => index === 0 || index === chartData.value.length - 1)
    .map((item) => ({ id: item.id, label: formatShortDate(item.recordedAt) })),
);
const trendChange = computed(() => {
  const first = chartData.value[0]?.weight;
  const last = chartData.value[chartData.value.length - 1]?.weight;
  return first !== undefined && last !== undefined ? last - first : 0;
});
const trendChangeLabel = computed(
  () => `${trendChange.value > 0 ? '+' : ''}${trendChange.value.toFixed(1)} kg`,
);
const trendCaption = computed(() =>
  !hasTrendComparison.value
    ? '再记录一次，就能看到变化'
    : trendChange.value <= 0
      ? '比周期开始轻了一点'
      : '这段时间有些波动',
);
const insightText = computed(() =>
  trendChange.value <= 0
    ? '小絮说：曲线在向下走，今天也值得被好好夸奖。'
    : '小絮说：体重有波动很正常，先照顾好今天的自己。',
);
const recordList = computed(() => {
  if (recordFilter.value === 'all') return records.value;
  const cutoff = Date.now() - Number(recordFilter.value) * 86400000;
  return records.value.filter((record) => +new Date(record.recordedAt) >= cutoff);
});
const gridLines = [28, 60, 92, 124];
const milestones = computed(() => [
  {
    title: '连续记录',
    note: `${recordStreak.value} 天`,
    achieved: recordStreak.value >= 3,
  },
  {
    title: targetDirection.value === 'gain' ? '稳步增加 1kg' : '轻盈 1kg',
    note:
      (targetDirection.value === 'gain'
        ? currentWeight.value - startWeight.value
        : startWeight.value - currentWeight.value) >= 1
        ? '已达成'
        : '还差 1kg',
    achieved:
      (targetDirection.value === 'gain'
        ? currentWeight.value - startWeight.value
        : startWeight.value - currentWeight.value) >= 1,
  },
  {
    title: '靠近目标',
    note: `${remainingKg.value.toFixed(1)} kg`,
    achieved: progress.value >= 60,
  },
]);
const recordDates = computed(
  () => new Set(records.value.map((record) => localRecordDate(record.recordedAt))),
);
const recordStreak = computed(() => {
  let streak = 0;
  const cursor = new Date();
  while (recordDates.value.has(localRecordDate(cursor.toISOString()))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
});
const rhythmScore = computed(() => weeklyRhythm.value.filter((day) => day.filled).length);
const weeklyRhythm = computed(() => {
  const labels = ['一', '二', '三', '四', '五', '六', '日'];
  const todayIndex = (new Date().getDay() + 6) % 7;
  return labels.map((label, index) => ({
    label,
    filled: recordDates.value.has(weekDate(index)),
    today: index === todayIndex,
  }));
});
const bodyMetrics = computed(() => [
  {
    title: 'BMI',
    unit: 'kg/m²',
    value: bmi.value,
    status: bmiStatus.value,
    tone: bmi.value === '--' ? 'soft' : bmiStatus.value === '健康范围' ? 'good' : 'warm',
    percent: bmi.value === '--' ? 0 : Math.min(100, (Number(bmi.value) / 30) * 100),
    range: '健康范围 18.5 - 24.0',
  },
  {
    title: '体脂率',
    unit: '%',
    value: '--',
    status: '待记录',
    tone: 'soft',
    percent: 0,
    range: '记录体脂后显示趋势',
  },
  {
    title: '腰围',
    unit: 'cm',
    value: '--',
    status: '待记录',
    tone: 'soft',
    percent: 0,
    range: '记录腰围后显示趋势',
  },
  {
    title: '基础代谢',
    unit: 'kcal',
    value: '--',
    status: '待完善资料',
    tone: 'warm',
    percent: 0,
    range: '完善身高、年龄和性别后估算',
  },
]);

function formatDate(value: string) {
  const d = new Date(value);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}
function formatShortDate(value: string) {
  const d = new Date(value);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
function formatDay(value: string) {
  const d = new Date(value);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}
function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}
function formatDateTime(value: string) {
  return `${formatDate(value)} ${formatTime(value)}`;
}
function selectTrendPoint(id: string) {
  selectedTrendId.value = id;
}
function changeLabel(record: WeightRecord, index: number) {
  const next = records.value[index + 1];
  if (!next) return '';
  const delta = record.weight - next.weight;
  return `${delta > 0 ? '+' : ''}${delta.toFixed(1)}`;
}
function changeClass(record: WeightRecord, index: number) {
  return record.weight - (records.value[index + 1]?.weight || record.weight) <= 0 ? 'down' : 'up';
}
function closeDialog() {
  showDialog.value = false;
  editingRecordId.value = null;
  inputWeight.value = '';
  inputNote.value = '';
  recordedDate.value = '';
}
function openNewRecord() {
  editingRecordId.value = null;
  inputWeight.value = '';
  inputNote.value = '';
  recordedDate.value = localDate();
  showDialog.value = true;
}
function editRecord(record: WeightRecord) {
  editingRecordId.value = record.id;
  inputWeight.value = record.weight.toFixed(1);
  inputNote.value = record.note || '';
  recordedDate.value = new Date(record.recordedAt).toISOString().slice(0, 10);
  showDialog.value = true;
}
function saveWeight() {
  const value = Number(inputWeight.value);
  if (!value || value < 20 || value > 300) {
    uni.showToast({ title: '请输入正确的体重', icon: 'none' });
    return;
  }
  const previous = editingRecordId.value
    ? records.value.find((record) => record.id === editingRecordId.value)
    : undefined;
  const payload = {
    weight: Number(value.toFixed(1)),
    recordedAt: recordedDate.value
      ? new Date(
          `${recordedDate.value}T${previous ? new Date(previous.recordedAt).toTimeString().slice(0, 8) : '08:00:00'}`,
        ).toISOString()
      : new Date().toISOString(),
    note: inputNote.value || undefined,
  };
  const comparison = records.value.find((record) => record.id !== editingRecordId.value);
  savedDelta.value = comparison ? payload.weight - comparison.weight : null;
  const saved = editingRecordId.value
    ? updateLocalWeightRecord(editingRecordId.value, payload)
    : createLocalWeightRecord(payload);
  records.value = listLocalWeightRecords();
  savedWeight.value = saved.weight;
  closeDialog();
  showSuccess.value = true;
  healthLoopState.loadToday(localDate(), { force: true });
}

function deleteEditingRecord() {
  const id = editingRecordId.value;
  if (!id) return;
  uni.showModal({
    title: '删除这条体重记录？',
    content: '删除后趋势和目标进度会同步更新',
    confirmColor: '#b56f66',
    success: (result) => {
      if (!result.confirm) return;
      deleteLocalWeightRecord(id);
      records.value = listLocalWeightRecords();
      closeDialog();
      uni.showToast({ title: '已删除', icon: 'success' });
      healthLoopState.loadToday(localDate(), { force: true });
    },
  });
}

function loadWeightData() {
  records.value = listLocalWeightRecords();
  const localProfile = loadLocalProfile();
  profile.value = localProfile
    ? { heightCm: localProfile.heightCm, weightKg: localProfile.weightKg }
    : null;
  localPlan.value = loadLocalPlan();
  loadingRecords.value = false;
}

function localDate() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function localRecordDate(value: string) {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function weekDate(index: number) {
  const now = new Date();
  const mondayOffset = (now.getDay() + 6) % 7;
  now.setDate(now.getDate() - mondayOffset + index);
  return localRecordDate(now.toISOString());
}

function formatForecastDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function openPlanSetup() {
  uni.navigateTo({ url: '/pages/plan-setup/PlanSetupPage' });
}

onLoad((options) => {
  if (options?.view === 'records') activeView.value = 'records';
  if (options?.view === 'data') activeView.value = 'data';
  if (options?.action === 'new') setTimeout(openNewRecord, 120);
});
onShow(loadWeightData);
</script>

<style scoped>
.weight-page {
  min-height: 100vh;
  padding-bottom: 176rpx;
  background: #f8f1e9;
  color: #51484b;
}
.hero-wrap {
  position: relative;
  min-height: 0;
  padding: 0;
  overflow: hidden;
  background: #f4f1e7;
}
.hero-art {
  position: relative;
  display: block;
  top: auto;
  right: auto;
  bottom: auto;
  left: auto;
  width: 100%;
  height: auto;
  opacity: 1;
  mix-blend-mode: multiply;
}
.hero-wash {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: linear-gradient(
    90deg,
    rgba(255, 252, 245, 0.72) 0%,
    rgba(255, 252, 245, 0.28) 45%,
    rgba(255, 252, 245, 0) 78%
  );
}
.hero-copy,
.hero-bubble {
  position: relative;
  z-index: 1;
}
.hero-copy {
  position: absolute;
  top: 42rpx;
  left: 26rpx;
  width: 55%;
}
.hero-kicker {
  display: block;
  margin-bottom: 18rpx;
  color: #6d9080;
  font-size: 23rpx;
}
.hero-number-row {
  display: flex;
  align-items: baseline;
  gap: 10rpx;
}
.hero-number {
  color: #536b56;
  font-size: 74rpx;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 1rpx;
}
.hero-unit {
  color: #6d9080;
  font-size: 28rpx;
  font-weight: 700;
}
.hero-date {
  display: block;
  margin-top: 14rpx;
  color: #86a094;
  font-size: 21rpx;
}
.hero-bubble {
  position: absolute;
  right: 36rpx;
  top: 48rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 22rpx;
  border-radius: 28rpx;
  background: rgba(255, 253, 247, 0.82);
  box-shadow: 0 8rpx 20rpx rgba(94, 121, 104, 0.1);
}
.bubble-title {
  color: #9b8b7a;
  font-size: 20rpx;
}
.bubble-value {
  margin-top: 6rpx;
  color: #7aa78d;
  font-size: 27rpx;
  font-weight: 800;
}
.card {
  margin: 18rpx 20rpx 0;
  border-radius: 20rpx;
  background: rgba(255, 253, 251, 0.92);
  box-shadow: 0 10rpx 26rpx rgba(139, 102, 89, 0.07);
  border: 1rpx solid rgba(255, 255, 255, 0.95);
}
.summary-card {
  position: relative;
  z-index: 2;
  margin-top: -18rpx;
  padding: 24rpx 22rpx 20rpx;
  border-radius: 20rpx;
  background: rgba(255, 253, 248, 0.96);
}
.summary-heading {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 18rpx;
}
.plan-settings {
  margin-left: auto;
  padding: 0;
  color: #628271;
  border: 0;
  background: transparent;
  font-size: 19rpx;
  line-height: 1;
}
.plan-settings::after {
  border: 0;
}
.summary-heading image {
  width: 68rpx;
  height: 68rpx;
  border-radius: 0;
  mix-blend-mode: multiply;
}
.summary-heading-title {
  display: block;
  color: #665856;
  font-size: 22rpx;
  font-weight: 800;
}
.summary-heading-note {
  display: block;
  margin-top: 4rpx;
  color: #ad9a92;
  font-size: 18rpx;
}
.summary-main {
  display: flex;
  align-items: center;
  justify-content: space-around;
}
.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-width: 0;
}
.summary-label {
  color: #a08d8b;
  font-size: 21rpx;
}
.summary-value {
  margin-top: 8rpx;
  color: #51484b;
  font-size: 38rpx;
  font-weight: 800;
}
.small-unit {
  font-size: 20rpx;
  font-weight: 600;
}
.summary-note {
  margin-top: 5rpx;
  color: #9aa49a;
  font-size: 19rpx;
}
.summary-divider {
  width: 1rpx;
  height: 72rpx;
  background: #f0e6e0;
}
.progress-track {
  position: relative;
  height: 16rpx;
  margin-top: 30rpx;
  border-radius: 99rpx;
  background: #f1e8df;
}
.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #a7d6bb, #74b995);
}
.progress-marker {
  position: absolute;
  top: 50%;
  width: 24rpx;
  height: 24rpx;
  border: 5rpx solid #fffdfb;
  border-radius: 50%;
  background: #6cae89;
  box-shadow: 0 2rpx 8rpx rgba(93, 148, 113, 0.25);
  transform: translate(-50%, -50%);
}
.progress-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 14rpx;
  color: #b09d98;
  font-size: 19rpx;
}
.progress-message {
  color: #73a286;
  font-weight: 700;
}
.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin: 38rpx 28rpx 18rpx;
}
.section-heading.compact {
  margin-top: 34rpx;
}
.section-title {
  display: block;
  color: #584b50;
  font-size: 30rpx;
  font-weight: 800;
}
.section-subtitle {
  display: block;
  margin-top: 6rpx;
  color: #ad9b98;
  font-size: 19rpx;
}
.range-tabs {
  display: flex;
  gap: 8rpx;
  padding: 5rpx;
  border-radius: 16rpx;
  background: #f5ece6;
}
.range-tab {
  padding: 9rpx 16rpx;
  border: 0;
  border-radius: 12rpx;
  background: transparent;
  color: #a99791;
  font-size: 20rpx;
  line-height: 1;
}
.range-tab::after,
.text-button::after,
.dialog-close::after,
.record-button::after,
.save-button::after {
  border: 0;
}
.range-tab.active {
  background: #fffdfb;
  color: #6d9b7e;
  box-shadow: 0 3rpx 8rpx rgba(139, 102, 89, 0.08);
  font-weight: 700;
}
.trend-card {
  padding: 24rpx 20rpx 20rpx;
}
.trend-topline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.trend-number {
  color: #70a587;
  font-size: 36rpx;
  font-weight: 800;
}
.trend-caption {
  display: block;
  margin-top: 4rpx;
  color: #ab9791;
  font-size: 20rpx;
}
.trend-legend {
  display: flex;
  align-items: center;
  gap: 8rpx;
  color: #a79791;
  font-size: 19rpx;
}
.trend-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8rpx;
}
.trend-count {
  color: #b5a49e;
  font-size: 18rpx;
}
.legend-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: #77b48f;
}
.chart-shell {
  position: relative;
  margin-top: 24rpx;
  padding-left: 48rpx;
}
.chart-scale {
  position: absolute;
  top: 2rpx;
  bottom: 34rpx;
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #b5a49e;
  font-size: 17rpx;
}
.trend-svg {
  display: block;
  width: 100%;
  height: 230rpx;
  overflow: visible;
}
.grid-line {
  stroke: #f0e9e1;
  stroke-width: 1;
  stroke-dasharray: 3 5;
}
.goal-line {
  stroke: #d7b86f;
  stroke-width: 1.5;
  stroke-dasharray: 5 5;
}
.trend-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8rpx;
  margin-top: 22rpx;
  padding: 16rpx 12rpx;
  border-radius: 16rpx;
  background: #f8f4ef;
}
.trend-summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5rpx;
}
.trend-summary-label {
  color: #ad9b94;
  font-size: 18rpx;
}
.trend-summary-value {
  color: #6b5d5d;
  font-size: 21rpx;
  font-weight: 700;
}
.selected-record {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16rpx;
  padding: 16rpx 18rpx;
  border: 1rpx solid #eee2da;
  border-radius: 16rpx;
  background: #fffdfb;
}
.selected-record-label,
.selected-record-date {
  display: block;
  color: #a28f88;
  font-size: 18rpx;
}
.selected-record-date {
  margin-top: 4rpx;
  color: #756567;
  font-size: 20rpx;
}
.selected-record-value {
  color: #5d8f6d;
  font-size: 32rpx;
  font-weight: 800;
}
.trend-area {
  fill: url(#trend-fill);
  fill: rgba(169, 218, 190, 0.2);
}
.trend-line {
  fill: none;
  stroke: #72b48d;
  stroke-width: 3.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.trend-point {
  fill: #fffdfb;
  stroke: #72b48d;
  stroke-width: 3;
}
.trend-point.selected {
  fill: #72b48d;
  stroke: #fffdfb;
  stroke-width: 4;
}
.chart-labels {
  display: flex;
  justify-content: space-between;
  margin: 0 3rpx;
  color: #b5a49e;
  font-size: 18rpx;
}
.insight-strip {
  display: flex;
  align-items: center;
  gap: 14rpx;
  margin-top: 22rpx;
  padding: 16rpx 18rpx;
  border-radius: 16rpx;
  background: #fff8e8;
  color: #8e7b70;
  font-size: 20rpx;
  line-height: 1.45;
}
.insight-strip image {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
}

.trend-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  padding: 42rpx 24rpx 34rpx;
  text-align: center;
}
.trend-empty-title {
  color: #6e5c5d;
  font-size: 28rpx;
  font-weight: 700;
}
.trend-empty-copy {
  color: #a28f8c;
  font-size: 22rpx;
}
.trend-empty-action {
  margin-top: 8rpx;
  padding: 12rpx 28rpx;
  border-radius: 999rpx;
  background: #e8f4e9;
  color: #4f8b60;
  font-size: 22rpx;
  font-weight: 700;
}
.trend-single {
  display: flex;
  justify-content: space-between;
  margin-top: 20rpx;
  padding: 16rpx 18rpx;
  border-radius: 16rpx;
  background: #f7f3ec;
  color: #9c8c84;
  font-size: 20rpx;
}
.milestone-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14rpx;
  margin: 0 24rpx;
}
.milestone {
  padding: 20rpx 12rpx;
  border-radius: 20rpx;
  background: #f7f1ec;
  text-align: center;
}
.milestone.achieved {
  background: #e9f5ed;
}
.milestone-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42rpx;
  height: 42rpx;
  margin: 0 auto 10rpx;
  border-radius: 50%;
  background: #e6ddd6;
  color: #afa098;
  font-size: 24rpx;
  font-weight: 800;
}
.achieved .milestone-icon {
  background: #92c9a9;
  color: #fff;
}
.milestone-title {
  display: block;
  color: #6d5f5e;
  font-size: 21rpx;
  font-weight: 700;
}
.milestone-note {
  display: block;
  margin-top: 6rpx;
  color: #a69791;
  font-size: 18rpx;
}
.history-heading {
  align-items: center;
}
.text-button {
  padding: 4rpx 0;
  background: transparent;
  color: #78a58a;
  font-size: 20rpx;
}
.history-card {
  padding: 6rpx 20rpx;
}
.record-filters {
  display: flex;
  gap: 10rpx;
  padding: 14rpx 0 8rpx;
}
.record-filter {
  padding: 10rpx 16rpx;
  border-radius: 999rpx;
  background: #f7f0eb;
  color: #a28f88;
  font-size: 19rpx;
  line-height: 1;
}
.record-filter::after {
  border: 0;
}
.record-filter.active {
  background: #e8f4eb;
  color: #6f9f7d;
  font-weight: 700;
}
.history-loading,
.history-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 44rpx 20rpx;
  color: #8ea392;
  font-size: 22rpx;
  text-align: center;
}
.history-empty text:last-child {
  color: #b5a39e;
  font-size: 19rpx;
}
.history-item {
  display: flex;
  align-items: center;
  min-height: 100rpx;
  border-bottom: 1rpx solid #f2e9e4;
}
.history-item:active {
  background: #fff8f3;
}
.history-item:last-child {
  border-bottom: 0;
}
.history-date {
  width: 145rpx;
}
.history-day {
  display: block;
  color: #66585a;
  font-size: 23rpx;
  font-weight: 700;
}
.history-time {
  display: block;
  margin-top: 5rpx;
  color: #b3a39e;
  font-size: 18rpx;
}
.history-note {
  flex: 1;
  color: #a4928c;
  font-size: 19rpx;
}
.history-weight {
  display: flex;
  align-items: baseline;
  color: #51484b;
  font-size: 30rpx;
  font-weight: 800;
}
.history-change {
  width: 66rpx;
  margin-left: 10rpx;
  text-align: right;
  font-size: 19rpx;
  font-weight: 700;
}
.history-change.down {
  color: #79ae8d;
}
.history-change.up {
  color: #d79786;
}
.bottom-space {
  height: 132rpx;
}
.record-button {
  position: fixed;
  right: 24rpx;
  bottom: calc(20rpx + env(safe-area-inset-bottom));
  left: auto;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  width: 216rpx;
  height: 70rpx;
  border: 1rpx solid #bfd7c4;
  border-radius: 20rpx;
  background: rgba(255, 254, 250, 0.98);
  color: #5d8a6c;
  font-size: 23rpx;
  font-weight: 800;
  box-shadow: 0 8rpx 18rpx rgba(87, 126, 96, 0.14);
}
.plus {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34rpx;
  height: 34rpx;
  border: 2rpx solid #83ad8f;
  border-radius: 50%;
  color: #6d9c7b;
  font-size: 28rpx;
  font-weight: 400;
  line-height: 1;
}
.record-button-hover {
  opacity: 0.9;
  transform: translateY(2rpx);
}
.dialog-mask {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: flex-end;
  background: rgba(74, 59, 55, 0.22);
}
.dialog {
  width: 100%;
  max-height: calc(100vh - 110rpx);
  overflow-y: auto;
  padding: 26rpx 24rpx calc(30rpx + env(safe-area-inset-bottom));
  border-radius: 26rpx 26rpx 0 0;
  background: #fffaf4;
  box-sizing: border-box;
}
.dialog-handle {
  width: 64rpx;
  height: 6rpx;
  margin: 0 auto 22rpx;
  border-radius: 999rpx;
  background: #e6d9cf;
}
.dialog-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.dialog-title {
  color: #584b50;
  font-size: 32rpx;
  font-weight: 800;
}
.dialog-close {
  width: 52rpx;
  height: 52rpx;
  padding: 0;
  background: #f6eee8;
  border-radius: 50%;
  color: #9d8c87;
  font-size: 36rpx;
  line-height: 52rpx;
}
.dialog-hint {
  display: block;
  margin: 12rpx 0 26rpx;
  color: #ad9a95;
  font-size: 20rpx;
}
.field-label {
  margin: 18rpx 0 10rpx;
  color: #6e5f60;
  font-size: 21rpx;
  font-weight: 700;
}
.weight-input,
.note-input {
  width: 100%;
  padding: 22rpx;
  border: 1rpx solid #efe3dc;
  border-radius: 16rpx;
  background: #fff9f5;
  color: #51484b;
  font-size: 26rpx;
  box-sizing: border-box;
}
.date-picker-value {
  width: 100%;
  padding: 22rpx;
  border: 1rpx solid #efe3dc;
  border-radius: 16rpx;
  background: #fff9f5;
  color: #51484b;
  font-size: 26rpx;
  box-sizing: border-box;
}
.save-button {
  width: 100%;
  margin-top: 28rpx;
  height: 78rpx;
  border-radius: 18rpx;
  background: #759b7b;
  color: #fff;
  font-size: 27rpx;
  font-weight: 800;
}
.view-switch {
  display: flex;
  gap: 10rpx;
  margin: 18rpx 20rpx 0;
  padding: 6rpx;
  border-radius: 16rpx;
  background: #f2e9e2;
}
.view-tab {
  flex: 1;
  min-width: 0;
  padding: 14rpx 6rpx 13rpx;
  border-radius: 16rpx;
  background: transparent;
  color: #9e8e89;
  text-align: center;
}
.view-tab::after {
  border: 0;
}
.view-tab.active {
  background: #fffdfb;
  color: #629978;
  box-shadow: 0 5rpx 14rpx rgba(139, 102, 89, 0.08);
}
.section-heading {
  margin-left: 22rpx;
  margin-right: 22rpx;
}
.milestone-row,
.metric-grid {
  margin-left: 20rpx;
  margin-right: 20rpx;
}
.view-tab-title {
  display: block;
  font-size: 24rpx;
  font-weight: 800;
}
.view-tab-caption {
  display: block;
  margin-top: 3rpx;
  font-size: 17rpx;
  opacity: 0.8;
}
.progress-lower {
  margin-top: 2rpx;
}
.forecast-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 26rpx 28rpx;
  background: linear-gradient(135deg, #fffdf8 0%, #fff5e8 100%);
}
.forecast-copy {
  flex: 1;
  padding-right: 20rpx;
}
.forecast-label {
  display: block;
  color: #ae9582;
  font-size: 20rpx;
}
.forecast-date {
  display: block;
  margin-top: 8rpx;
  color: #7c9c83;
  font-size: 35rpx;
  font-weight: 800;
}
.forecast-note {
  display: block;
  margin-top: 8rpx;
  color: #a7948b;
  font-size: 19rpx;
  line-height: 1.45;
}
.forecast-ring {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 126rpx;
  height: 126rpx;
  border: 10rpx solid #cae5d4;
  border-right-color: #74b48d;
  border-radius: 50%;
  color: #6b9d7c;
  font-size: 18rpx;
  transform: rotate(-20deg);
}
.forecast-ring > text {
  transform: rotate(20deg);
}
.forecast-ring > text:first-child {
  font-size: 32rpx;
  font-weight: 800;
}
.ring-unit {
  font-size: 18rpx;
}
.rhythm-heading {
  margin-bottom: 18rpx;
}
.rhythm-score {
  color: #75a486;
  font-size: 22rpx;
  font-weight: 800;
}
.rhythm-card {
  display: flex;
  justify-content: space-between;
  padding: 22rpx 20rpx;
}
.rhythm-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 9rpx;
  color: #b09f99;
  font-size: 18rpx;
}
.rhythm-day.today {
  color: #6d9e7d;
  font-weight: 800;
}
.rhythm-dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44rpx;
  height: 44rpx;
  border: 2rpx solid #ece1d9;
  border-radius: 50%;
  color: #fff;
  font-size: 22rpx;
}
.rhythm-day.filled .rhythm-dot {
  border-color: #8fc8a3;
  background: #8fc8a3;
}
.rhythm-day.today .rhythm-dot {
  box-shadow: 0 0 0 6rpx rgba(143, 200, 163, 0.16);
}
.data-view {
  margin-top: 2rpx;
}
.metric-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14rpx;
  margin: 0 24rpx;
}
.metric-card {
  min-height: 190rpx;
  margin: 0;
  padding: 22rpx 20rpx;
}
.metric-head,
.metric-value-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.metric-title {
  color: #6c5c60;
  font-size: 22rpx;
  font-weight: 800;
}
.metric-unit {
  color: #b2a19b;
  font-size: 17rpx;
}
.metric-value-row {
  margin-top: 18rpx;
}
.metric-value {
  color: #51484b;
  font-size: 35rpx;
  font-weight: 800;
}
.metric-status {
  font-size: 18rpx;
  font-weight: 700;
}
.metric-status.good {
  color: #71a785;
}
.metric-status.warm {
  color: #c79a67;
}
.metric-status.soft {
  color: #8b94b3;
}
.metric-rail {
  height: 10rpx;
  margin-top: 20rpx;
  overflow: hidden;
  border-radius: 99rpx;
  background: #f1e8e1;
}
.metric-rail-fill {
  height: 100%;
  border-radius: inherit;
  background: #8fc8a3;
}
.metric-rail-fill.warm {
  background: #e7c28b;
}
.metric-rail-fill.soft {
  background: #b7c1df;
}
.metric-range {
  display: block;
  margin-top: 12rpx;
  color: #b1a19b;
  font-size: 17rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.care-card {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 22rpx 24rpx;
  background: #eff7f1;
}
.care-card image {
  width: 92rpx;
  height: 92rpx;
  flex: 0 0 auto;
  mix-blend-mode: multiply;
}
.care-title {
  display: block;
  color: #668a73;
  font-size: 22rpx;
  font-weight: 800;
}
.care-copy {
  display: block;
  margin-top: 8rpx;
  color: #8b9e8d;
  font-size: 19rpx;
  line-height: 1.5;
}
@media (max-width: 360px) {
  .hero-wrap {
    min-height: 440rpx;
  }
  .hero-copy {
    width: 60%;
  }
  .hero-number {
    font-size: 68rpx;
  }
  .hero-bubble {
    right: 24rpx;
  }
  .summary-item {
    min-width: 0;
  }
  .metric-grid {
    gap: 10rpx;
  }
  .metric-card {
    padding-left: 16rpx;
    padding-right: 16rpx;
  }
}

/* Product-level polish for the weight workflow. */
.hero-copy {
  top: 34rpx;
  left: 22rpx;
  width: 56%;
  padding: 14rpx 16rpx;
  border-radius: 18rpx;
  background: rgba(255, 252, 244, 0.58);
  box-shadow: 0 8rpx 20rpx rgba(106, 126, 103, 0.08);
  backdrop-filter: blur(8rpx);
}
.hero-kicker {
  margin-bottom: 14rpx;
  color: #5f806f;
  font-size: 22rpx;
  font-weight: 600;
}
.hero-number {
  font-size: 70rpx;
}
.hero-bubble {
  right: 24rpx;
  top: 34rpx;
  padding: 14rpx 18rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.78);
  border-radius: 20rpx;
  background: rgba(255, 253, 247, 0.9);
}
.view-switch {
  margin-top: 20rpx;
  padding: 4rpx;
  border-radius: 18rpx;
  background: #f0e8e1;
}
.view-tab {
  min-height: 66rpx;
  padding: 11rpx 6rpx 10rpx;
  border-radius: 14rpx;
}
.view-tab-title {
  font-size: 23rpx;
}
.view-tab-caption {
  margin-top: 4rpx;
  color: #a7958f;
  font-size: 17rpx;
}
.view-tab.active .view-tab-caption {
  color: #85a892;
}
.range-tab {
  min-width: 60rpx;
  height: 42rpx;
  padding: 0 12rpx;
  line-height: 42rpx;
}
.trend-empty {
  min-height: 168rpx;
  padding: 28rpx 22rpx 26rpx;
  justify-content: center;
}
.trend-empty-title {
  color: #66585a;
  font-size: 27rpx;
}
.trend-empty-copy {
  color: #a3948e;
  font-size: 20rpx;
  line-height: 1.45;
}
.trend-empty-action {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 210rpx;
  height: 62rpx;
  margin-top: 6rpx;
  padding: 0 24rpx;
  border-radius: 16rpx;
  background: #78a886;
  color: #fff;
  font-size: 22rpx;
  font-weight: 700;
  line-height: 62rpx;
}
.milestone-row {
  gap: 10rpx;
  margin: 0 22rpx;
}
.milestone {
  min-height: 120rpx;
  padding: 16rpx 10rpx 14rpx;
  border: 1rpx solid #eee4dc;
  border-radius: 16rpx;
  background: rgba(255, 253, 249, 0.76);
}
.milestone.achieved {
  border-color: #cfe4d5;
  background: #f0f8f1;
}
.milestone-icon {
  width: 38rpx;
  height: 38rpx;
  margin-bottom: 8rpx;
  font-size: 22rpx;
}
.milestone-title {
  font-size: 20rpx;
}
.milestone-note {
  font-size: 17rpx;
}
.dialog-mask {
  padding: 0 14rpx calc(14rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  background: rgba(74, 59, 55, 0.28);
}
.dialog {
  max-height: 82vh;
  margin: 0;
  padding: 18rpx 22rpx calc(22rpx + env(safe-area-inset-bottom));
  border-radius: 28rpx;
  background: #fffaf4;
  box-shadow: 0 12rpx 36rpx rgba(79, 63, 57, 0.16);
}
.dialog-handle {
  width: 60rpx;
  height: 6rpx;
  margin-bottom: 18rpx;
  background: #dfd2c8;
}
.dialog-head {
  align-items: flex-start;
}
.dialog-title {
  font-size: 30rpx;
  line-height: 1.25;
}
.dialog-subtitle {
  display: block;
  margin-top: 8rpx;
  color: #ab9890;
  font-size: 19rpx;
}
.dialog-close {
  width: 46rpx;
  height: 46rpx;
  color: #9e8c85;
  background: #f5ede7;
  font-size: 30rpx;
  line-height: 46rpx;
}
.dialog-hint {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin: 18rpx 0 4rpx;
  color: #958a82;
  font-size: 19rpx;
}
.hint-dot {
  width: 12rpx;
  height: 12rpx;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #87b497;
}
.field-block {
  margin-top: 20rpx;
}
.weight-field-block {
  margin-top: 16rpx;
}
.field-label {
  margin: 0 0 9rpx;
  color: #6c5d5b;
  font-size: 20rpx;
  font-weight: 700;
}
.optional-label {
  margin-left: 6rpx;
  color: #b5a49c;
  font-size: 18rpx;
  font-weight: 400;
}
.weight-input-wrap {
  display: flex;
  align-items: center;
  height: 78rpx;
  padding: 0 20rpx;
  border: 1rpx solid #eadfd7;
  border-radius: 16rpx;
  background: #fffdf9;
  box-sizing: border-box;
}
.weight-input {
  flex: 1;
  width: auto;
  height: 76rpx;
  padding: 0;
  border: 0;
  background: transparent;
  font-size: 34rpx;
  font-weight: 700;
}
.input-unit {
  margin-left: 8rpx;
  color: #7a9a82;
  font-size: 22rpx;
  font-weight: 700;
}
.date-picker-value {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 76rpx;
  padding: 0 20rpx;
  border: 1rpx solid #eadfd7;
  border-radius: 16rpx;
  background: #fffdf9;
  color: #51484b;
  font-size: 24rpx;
  box-sizing: border-box;
}
.picker-chevron {
  color: #b09d94;
  font-size: 34rpx;
  line-height: 1;
}
.note-input {
  height: 76rpx;
  padding: 0 20rpx;
  border: 1rpx solid #eadfd7;
  border-radius: 16rpx;
  background: #fffdf9;
  font-size: 23rpx;
}
.save-button {
  height: 76rpx;
  margin-top: 24rpx;
  border-radius: 18rpx;
  background: #739d7c;
  box-shadow: 0 8rpx 16rpx rgba(106, 150, 116, 0.18);
  font-size: 24rpx;
  line-height: 76rpx;
}
</style>
<style scoped>
.plan-timeline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #eee7df;
  color: #71897b;
  font-size: 18rpx;
}
.plan-timeline text:last-child {
  color: #a1948d;
}
.delete-record-button {
  width: 100%;
  height: 68rpx;
  margin-top: 12rpx;
  border: 0;
  color: #b3766d;
  background: transparent;
  font-size: 21rpx;
  line-height: 68rpx;
}
.delete-record-button::after {
  border: 0;
}
.success-sheet {
  width: 100%;
  box-sizing: border-box;
  padding: 38rpx 28rpx calc(38rpx + env(safe-area-inset-bottom));
  border-radius: 28rpx 28rpx 0 0;
  background: #fbfdf9;
  text-align: center;
}
.success-mark {
  display: flex;
  width: 72rpx;
  height: 72rpx;
  align-items: center;
  justify-content: center;
  margin: 0 auto 18rpx;
  border-radius: 50%;
  color: #fff;
  background: #78a984;
  font-size: 34rpx;
}
.success-title {
  display: block;
  color: #405748;
  font-size: 32rpx;
  font-weight: 750;
}
.success-copy {
  display: block;
  margin-top: 10rpx;
  color: #84968a;
  font-size: 21rpx;
}
.success-metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  margin-top: 28rpx;
  border-top: 1rpx solid #e5ece5;
  border-bottom: 1rpx solid #e5ece5;
}
.success-metrics view {
  padding: 22rpx 12rpx;
}
.success-metrics view + view {
  border-left: 1rpx solid #e5ece5;
}
.success-metrics text {
  display: block;
}
.success-metrics text:first-child {
  color: #496452;
  font-size: 30rpx;
  font-weight: 750;
}
.success-metrics text:last-child {
  margin-top: 6rpx;
  color: #91a096;
  font-size: 18rpx;
}
.success-done {
  width: 100%;
  height: 76rpx;
  margin-top: 28rpx;
  border-radius: 16rpx;
  color: #fff;
  background: #709a79;
  font-size: 23rpx;
  line-height: 76rpx;
}
</style>
