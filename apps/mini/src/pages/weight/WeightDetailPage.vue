<template>
  <view class="weight-page">
    <AppNavBar title="我的体重" route="weight" />

    <view class="hero-wrap">
      <image
        class="hero-art"
        src="/static/illustrations/weight-weighing-scene.png"
        mode="aspectFit"
      />
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
          <text class="trend-number">{{ trendChangeLabel }}</text>
          <text class="trend-caption">{{ trendCaption }}</text>
        </view>
        <view class="trend-legend"><view class="legend-dot" /> <text>体重</text></view>
      </view>
      <view class="chart-shell">
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
          <path :d="trendAreaPath" class="trend-area" />
          <path :d="trendPath" class="trend-line" />
          <circle
            v-for="point in trendPoints"
            :key="point.id"
            :cx="point.x"
            :cy="point.y"
            r="4"
            class="trend-point"
          />
        </svg>
        <view class="chart-labels">
          <text v-for="point in chartLabels" :key="point.id">{{ point.label }}</text>
        </view>
      </view>
      <view class="insight-strip">
        <image src="/static/illustrations/xuxu-avatar.png" mode="aspectFill" />
        <text>{{ insightText }}</text>
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
          <text class="forecast-note"
            >还需要 {{ remainingKg.toFixed(1) }} kg，保持每周 0.4 kg 的舒适节奏</text
          >
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
        <view class="dialog-head"
          ><text class="dialog-title">{{
            editingRecordId ? '编辑体重记录' : '记录今天的体重'
          }}</text
          ><button class="dialog-close" @tap="closeDialog">×</button></view
        >
        <text class="dialog-hint">建议在起床后、早餐前记录，变化会更稳定</text>
        <view class="field-label">体重（kg）</view>
        <input v-model="inputWeight" class="weight-input" type="digit" placeholder="例如 65.5" />
        <view class="field-label">今天的心情（可选）</view>
        <input
          v-model="inputNote"
          class="note-input"
          type="text"
          placeholder="例如：睡得很好，状态轻盈"
        />
        <button class="save-button" @tap="saveWeight">保存记录</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import AppNavBar from '../../components/AppNavBar.vue';
import { healthLoopState } from '../../features/health-loop/health-loop.store.js';
import {
  createWeightRecord,
  loadHealthProfile,
  loadWeightHistory,
  replaceRecord as replaceWeightRecord,
} from '../../features/health-loop/health-loop.service.js';

type WeightRecord = { id: string; weight: number; recordedAt: string; note?: string };
const STORAGE_KEY = 'heban-weight-records';
const readRecords = (): WeightRecord[] => {
  try {
    const value = uni.getStorageSync(STORAGE_KEY);
    if (Array.isArray(value) && value.length) return value as WeightRecord[];
  } catch {
    /* use seed data */
  }
  return [];
};

const records = ref<WeightRecord[]>(
  readRecords().sort((a, b) => +new Date(b.recordedAt) - +new Date(a.recordedAt)),
);
const profile = ref<{ heightCm: number | null; weightKg: number | null } | null>(null);
const loadingRecords = ref(true);
const selectedRange = ref<'7' | '30' | '90'>('30');
const activeView = ref<'progress' | 'data' | 'records'>('progress');
const showDialog = ref(false);
const editingRecordId = ref<string | null>(null);
const inputWeight = ref('');
const inputNote = ref('');
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
    healthLoopState.today.value?.activePlan?.healthTarget?.startWeightKg ??
    records.value[records.value.length - 1]?.weight ??
    profile.value?.weightKg ??
    0,
);
const targetWeight = computed(
  () => healthLoopState.today.value?.activePlan?.healthTarget?.targetWeightKg ?? 0,
);
const heightCm = computed(() => profile.value?.heightCm ?? 0);

const currentWeight = computed(
  () =>
    records.value[0]?.weight ??
    healthLoopState.today.value?.todayRecords.weight?.valueKg ??
    profile.value?.weightKg ??
    0,
);
const bmi = computed(() =>
  currentWeight.value && heightCm.value
    ? (currentWeight.value / (heightCm.value / 100) ** 2).toFixed(1)
    : '--',
);
const bmiStatus = computed(() =>
  bmi.value === '--' ? '待完善身高数据' : Number(bmi.value) < 24 ? '健康范围' : '请继续观察',
);
const progress = computed(() =>
  startWeight.value > 0 && targetWeight.value > 0 && startWeight.value !== targetWeight.value
    ? Math.max(
        0,
        Math.min(
          100,
          ((startWeight.value - currentWeight.value) / (startWeight.value - targetWeight.value)) *
            100,
        ),
      )
    : 0,
);
const targetDate = computed(() => (targetWeight.value ? '根据当前节奏估算' : '先设置目标体重'));
const remainingKg = computed(() => Math.max(0, currentWeight.value - targetWeight.value));
const forecastDate = computed(() =>
  targetWeight.value && remainingKg.value <= 0
    ? '已经到达目标'
    : targetWeight.value
      ? '根据记录动态估算'
      : '等待目标体重',
);
const latestRecordLabel = computed(() =>
  records.value[0] ? `${formatDate(records.value[0].recordedAt)} 更新` : '还没有记录',
);
const weightDelta = computed(() => currentWeight.value - startWeight.value);
const weightDeltaLabel = computed(
  () => `${weightDelta.value > 0 ? '+' : ''}${weightDelta.value.toFixed(1)} kg`,
);
const trendRecords = computed(() => {
  const cutoff = Date.now() - Number(selectedRange.value) * 86400000;
  return records.value
    .filter((item) => +new Date(item.recordedAt) >= cutoff)
    .sort((a, b) => +new Date(a.recordedAt) - +new Date(b.recordedAt));
});
const chartData = computed(() =>
  trendRecords.value.length ? trendRecords.value : records.value.slice(-2).reverse(),
);
const trendPoints = computed(() => {
  const data = chartData.value;
  const min = Math.min(...data.map((item) => item.weight)) - 0.5;
  const max = Math.max(...data.map((item) => item.weight)) + 0.5;
  return data.map((item, index) => ({
    id: item.id,
    x: data.length === 1 ? 160 : (index / (data.length - 1)) * 320,
    y: 124 - ((item.weight - min) / (max - min)) * 96,
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
  trendChange.value <= 0 ? '比周期开始轻了一点' : '这段时间有些波动',
);
const insightText = computed(() =>
  trendChange.value <= 0
    ? '小絮说：曲线在向下走，今天也值得被好好夸奖。'
    : '小絮说：体重有波动很正常，先照顾好今天的自己。',
);
const visibleRecords = computed(() => records.value.slice(0, 4));
const recordList = computed(() => {
  if (recordFilter.value === 'all') return records.value;
  const cutoff = Date.now() - Number(recordFilter.value) * 86400000;
  return records.value.filter((record) => +new Date(record.recordedAt) >= cutoff);
});
const gridLines = [28, 60, 92, 124];
const milestones = computed(() => [
  {
    title: '连续记录',
    note: `${Math.min(records.value.length, 7)} / 7 天`,
    achieved: records.value.length >= 5,
  },
  {
    title: '轻盈 1kg',
    note: startWeight.value - currentWeight.value >= 1 ? '已达成' : '还差 1kg',
    achieved: startWeight.value - currentWeight.value >= 1,
  },
  {
    title: '靠近目标',
    note: `${Math.max(0, targetWeight.value - currentWeight.value).toFixed(1)} kg`,
    achieved: progress.value >= 60,
  },
]);
const rhythmScore = computed(() => Math.min(7, records.value.length));
const weeklyRhythm = computed(() => {
  const labels = ['一', '二', '三', '四', '五', '六', '日'];
  const todayIndex = (new Date().getDay() + 6) % 7;
  return labels.map((label, index) => ({
    label,
    filled: index >= Math.max(0, todayIndex - rhythmScore.value + 1) && index <= todayIndex,
    today: index === todayIndex,
  }));
});
const bodyMetrics = computed(() => [
  {
    title: 'BMI',
    unit: 'kg/m²',
    value: bmi.value,
    status: bmiStatus.value,
    tone: Number(bmi.value) < 24 ? 'good' : 'warm',
    percent: Math.min(100, (Number(bmi.value) / 30) * 100),
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
}
function openNewRecord() {
  editingRecordId.value = null;
  inputWeight.value = '';
  inputNote.value = '';
  showDialog.value = true;
}
function editRecord(record: WeightRecord) {
  editingRecordId.value = record.id;
  inputWeight.value = record.weight.toFixed(1);
  inputNote.value = record.note || '';
  showDialog.value = true;
}
function saveLocalWeight() {
  const value = Number(inputWeight.value);
  if (!value || value < 20 || value > 300) {
    uni.showToast({ title: '请输入正确的体重', icon: 'none' });
    return;
  }
  records.value = [
    {
      id: `r-${Date.now()}`,
      weight: Number(value.toFixed(1)),
      recordedAt: new Date().toISOString(),
      note: inputNote.value || '晨起空腹',
    },
    ...records.value,
  ];
  uni.setStorageSync(STORAGE_KEY, records.value);
  closeDialog();
}
async function saveWeight() {
  const value = Number(inputWeight.value);
  if (!value || value < 20 || value > 300) {
    uni.showToast({ title: '请输入正确的体重', icon: 'none' });
    return;
  }
  const payload = {
    valueKg: Number(value.toFixed(1)),
    recordedAt: new Date().toISOString(),
    note: inputNote.value || undefined,
  };
  try {
    if (editingRecordId.value) {
      const replaced = (await replaceWeightRecord('weight', editingRecordId.value, payload)) as {
        id: string;
        valueKg: number;
        recordedAt: string;
        note: string | null;
      };
      records.value = records.value.map((record) =>
        record.id === editingRecordId.value
          ? {
              id: replaced.id,
              weight: replaced.valueKg,
              recordedAt: replaced.recordedAt,
              note: replaced.note || undefined,
            }
          : record,
      );
      uni.setStorageSync(STORAGE_KEY, records.value);
      uni.showToast({ title: '已更新记录', icon: 'success' });
      closeDialog();
      return;
    }
    const saved = await createWeightRecord(payload);
    records.value = [
      {
        id: saved.id,
        weight: saved.valueKg,
        recordedAt: saved.recordedAt,
        note: saved.note || undefined,
      },
      ...records.value,
    ];
    uni.setStorageSync(STORAGE_KEY, records.value);
    uni.showToast({ title: '记录成功', icon: 'success' });
    closeDialog();
  } catch {
    if (editingRecordId.value) {
      records.value = records.value.map((record) =>
        record.id === editingRecordId.value
          ? {
              ...record,
              weight: payload.valueKg,
              recordedAt: payload.recordedAt,
              note: payload.note,
            }
          : record,
      );
      uni.setStorageSync(STORAGE_KEY, records.value);
      uni.showToast({ title: '网络不可用，已更新本地记录', icon: 'none' });
      closeDialog();
      return;
    }
    saveLocalWeight();
    uni.showToast({ title: '网络不可用，已保存到本地', icon: 'none' });
  }
}

async function loadWeightData() {
  const cached = readRecords();
  if (cached.length)
    records.value = cached.sort((a, b) => +new Date(b.recordedAt) - +new Date(a.recordedAt));
  try {
    const [profileResult, historyResult] = await Promise.all([
      loadHealthProfile().catch(() => null),
      loadWeightHistory().catch(() => null),
      healthLoopState.loadToday(localDate()),
    ]);
    if (profileResult) profile.value = profileResult;
    if (historyResult) {
      records.value = historyResult.map((item) => ({
        id: item.id,
        weight: item.valueKg,
        recordedAt: item.recordedAt,
        note: item.note || undefined,
      }));
      uni.setStorageSync(STORAGE_KEY, records.value);
    }
  } finally {
    loadingRecords.value = false;
  }
}

function localDate() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

onMounted(loadWeightData);
</script>

<style scoped>
.weight-page {
  min-height: 100vh;
  padding-bottom: 140rpx;
  background: #fff7f1;
  color: #51484b;
}
.hero-wrap {
  position: relative;
  min-height: 310rpx;
  padding: 38rpx 36rpx 30rpx;
  overflow: hidden;
  background: linear-gradient(145deg, #dff5eb 0%, #f7fbef 56%, #fff7ed 100%);
}
.hero-wrap::after {
  content: '';
  position: absolute;
  right: -100rpx;
  bottom: -160rpx;
  width: 430rpx;
  height: 280rpx;
  border-radius: 50%;
  background: rgba(255, 244, 212, 0.7);
}
.hero-art {
  position: absolute;
  right: -32rpx;
  bottom: -26rpx;
  width: 360rpx;
  height: 360rpx;
  opacity: 0.96;
  mix-blend-mode: multiply;
}
.hero-copy,
.hero-bubble {
  position: relative;
  z-index: 1;
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
  color: #3f6553;
  font-size: 86rpx;
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
  margin: 22rpx 24rpx 0;
  border-radius: 24rpx;
  background: rgba(255, 253, 251, 0.92);
  box-shadow: 0 10rpx 26rpx rgba(139, 102, 89, 0.07);
  border: 1rpx solid rgba(255, 255, 255, 0.95);
}
.summary-card {
  padding: 30rpx 28rpx 24rpx;
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
  min-width: 210rpx;
}
.summary-label {
  color: #a08d8b;
  font-size: 21rpx;
}
.summary-value {
  margin-top: 8rpx;
  color: #51484b;
  font-size: 42rpx;
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
  font-size: 33rpx;
  font-weight: 800;
}
.section-subtitle {
  display: block;
  margin-top: 6rpx;
  color: #ad9b98;
  font-size: 20rpx;
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
  padding: 28rpx 24rpx 22rpx;
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
.legend-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: #77b48f;
}
.chart-shell {
  margin-top: 24rpx;
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
  padding: 6rpx 24rpx;
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
  height: 80rpx;
}
.record-button {
  position: fixed;
  right: 24rpx;
  bottom: 30rpx;
  left: 24rpx;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  height: 96rpx;
  border-radius: 48rpx;
  background: #72b48d;
  color: #fff;
  font-size: 29rpx;
  font-weight: 800;
  box-shadow: 0 12rpx 28rpx rgba(85, 152, 109, 0.28);
}
.plus {
  font-size: 40rpx;
  font-weight: 300;
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
  background: rgba(74, 59, 55, 0.28);
}
.dialog {
  width: 100%;
  padding: 34rpx 30rpx 42rpx;
  border-radius: 32rpx 32rpx 0 0;
  background: #fffdfb;
  box-sizing: border-box;
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
.save-button {
  width: 100%;
  margin-top: 28rpx;
  height: 84rpx;
  border-radius: 42rpx;
  background: #72b48d;
  color: #fff;
  font-size: 27rpx;
  font-weight: 800;
}
.view-switch {
  display: flex;
  gap: 10rpx;
  margin: 24rpx 24rpx 0;
  padding: 8rpx;
  border-radius: 22rpx;
  background: #f1e8e1;
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
  .hero-number {
    font-size: 76rpx;
  }
  .hero-art {
    right: -72rpx;
    bottom: -18rpx;
    width: 320rpx;
    height: 320rpx;
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
</style>
