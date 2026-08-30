<template>
  <view class="page">
    <AppNavBar title="生理期记录" route="/pages/menstruation/MenstruationDetailPage" />

    <view class="hero-card hz-rise">
      <view class="hero-copy">
        <text class="eyebrow">温柔了解自己的节律</text>
        <text class="hero-title">下次经期还有 {{ daysUntilNext }} 天</text>
        <text class="hero-note">预计 {{ nextPeriodLabel }} 开始 · 仅供生活记录参考</text>
      </view>
      <view class="cycle-ring" aria-label="周期进度">
        <view class="ring-inner">
          <text class="ring-number">{{ cycleDay }}</text>
          <text class="ring-label">周期日</text>
        </view>
      </view>
    </view>

    <view class="section-heading">
      <view>
        <text class="section-title">{{ calendarTitle }}</text>
        <text class="section-caption">点选日期，补记经期或症状</text>
      </view>
      <view class="month-actions">
        <button class="month-button" aria-label="上个月" @tap="changeMonth(-1)">‹</button>
        <button class="month-button" aria-label="下个月" @tap="changeMonth(1)">›</button>
      </view>
    </view>

    <view class="calendar-card hz-rise hz-rise-1">
      <view class="week-row">
        <text v-for="day in weekLabels" :key="day">{{ day }}</text>
      </view>
      <view class="calendar-grid">
        <button
          v-for="cell in calendarCells"
          :key="cell.key"
          class="day-cell"
          :class="{
            muted: !cell.inMonth,
            selected: cell.key === selectedDate,
            period: isPeriodDay(cell.key),
            predicted: isPredictedDay(cell.key),
            today: cell.key === todayKey,
          }"
          @tap="selectDate(cell.key)"
        >
          <text>{{ cell.day }}</text>
          <view v-if="isPeriodDay(cell.key)" class="day-dot" />
          <view v-else-if="isPredictedDay(cell.key)" class="predicted-dot" />
        </button>
      </view>
      <view class="legend">
        <view><view class="legend-dot period-dot" /><text>经期</text></view>
        <view><view class="legend-dot predicted-dot" /><text>预测经期</text></view>
        <view><view class="legend-dot today-dot" /><text>今天</text></view>
      </view>
    </view>

    <view class="section-heading section-heading-spaced">
      <view>
        <text class="section-title">{{ selectedDateLabel }}</text>
        <text class="section-caption">记录这一天的身体感受</text>
      </view>
      <button class="ghost-button" @tap="markPeriodDay">{{ isPeriodDay(selectedDate) ? '取消经期' : '标记经期' }}</button>
    </view>

    <view class="symptom-card hz-rise hz-rise-2">
      <view class="symptom-group">
        <text class="group-label">疼痛程度</text>
        <view class="option-row">
          <button
            v-for="item in painOptions"
            :key="item.value"
            class="option-chip"
            :class="{ active: daily.pain === item.value }"
            @tap="daily.pain = item.value"
          >
            <text class="option-emoji">{{ item.emoji }}</text><text>{{ item.label }}</text>
          </button>
        </view>
      </view>
      <view class="symptom-group">
        <text class="group-label">身体感受</text>
        <view class="option-row">
          <button
            v-for="item in symptomOptions"
            :key="item"
            class="option-chip"
            :class="{ active: daily.symptoms.includes(item) }"
            @tap="toggleSymptom(item)"
          >{{ item }}</button>
        </view>
      </view>
      <input v-model="daily.note" class="note-input" maxlength="80" placeholder="写下今天想记住的一句话（选填）" />
    </view>

    <view class="cycle-editor hz-rise hz-rise-3">
      <view class="editor-copy">
        <text class="section-title">本次经期</text>
        <text class="section-caption">用于生成更贴近你的周期预测</text>
      </view>
      <view class="editor-row">
        <view><text class="editor-label">开始</text><text class="editor-value">{{ cycle.start || '未设置' }}</text></view>
        <button class="small-action" @tap="setCycleStart">{{ cycle.start ? '修改' : '设置' }}</button>
      </view>
      <view class="editor-row">
        <view><text class="editor-label">结束</text><text class="editor-value">{{ cycle.end || '未设置' }}</text></view>
        <button class="small-action" @tap="setCycleEnd">{{ cycle.end ? '修改' : '设置' }}</button>
      </view>
      <view class="cycle-hint"><text>当前按 {{ cycleLength }} 天周期、{{ periodLength }} 天经期估算</text><button @tap="editCycleSettings">调整</button></view>
    </view>

    <button class="primary-button" @tap="saveAll">保存今天的记录</button>
    <text class="disclaimer">生理期预测会受压力、睡眠和身体状态影响，如有持续不适请咨询专业医生。</text>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import AppNavBar from '../../components/AppNavBar.vue';
import { loadCycleSettings, saveCycleSettings, loadPeriodDay, savePeriodDay } from '../../features/menstruation/menstruation.service.js';
import type { PainLevel } from '../../features/menstruation/menstruation.types.js';

type DailyRecord = { pain: string; symptoms: string[]; note: string };
type Cycle = { start: string; end: string; cycleLength: number; periodLength: number };
type CalendarCell = { key: string; day: number; inMonth: boolean };

const todayKey = formatDate(new Date());
const selectedDate = ref(todayKey);
const visibleMonth = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
const cycle = reactive<Cycle>({ start: '', end: '', cycleLength: 28, periodLength: 5 });
const daily = reactive<DailyRecord>({ pain: '', symptoms: [], note: '' });
const weekLabels = ['日', '一', '二', '三', '四', '五', '六'];
const painOptions = [
  { value: 'none', label: '不痛', emoji: '☁️' },
  { value: 'mild', label: '轻微痛', emoji: '🌸' },
  { value: 'moderate', label: '比较痛', emoji: '🌧️' },
  { value: 'severe', label: '非常痛', emoji: '🌙' },
];
const symptomOptions = ['乏力', '腰酸', '腹胀', '头痛', '情绪波动', '食欲变化'];

const calendarTitle = computed(() => `${visibleMonth.value.getFullYear()}年${visibleMonth.value.getMonth() + 1}月`);
const calendarCells = computed<CalendarCell[]>(() => {
  const year = visibleMonth.value.getFullYear();
  const month = visibleMonth.value.getMonth();
  const first = new Date(year, month, 1).getDay();
  const count = new Date(year, month + 1, 0).getDate();
  const previousCount = new Date(year, month, 0).getDate();
  const cells: CalendarCell[] = [];
  for (let i = first - 1; i >= 0; i -= 1) {
    const date = new Date(year, month - 1, previousCount - i);
    cells.push({ key: formatDate(date), day: date.getDate(), inMonth: false });
  }
  for (let day = 1; day <= count; day += 1) {
    const date = new Date(year, month, day);
    cells.push({ key: formatDate(date), day, inMonth: true });
  }
  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    const date = new Date(year, month + 1, nextDay);
    cells.push({ key: formatDate(date), day: nextDay, inMonth: false });
    nextDay += 1;
  }
  return cells;
});
const selectedDateLabel = computed(() => {
  const date = parseDate(selectedDate.value);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
});
const cycleLength = computed(() => cycle.cycleLength);
const periodLength = computed(() => cycle.periodLength);
const cycleDay = computed(() => {
  if (!cycle.start) return '--';
  const delta = Math.floor((parseDate(todayKey).getTime() - parseDate(cycle.start).getTime()) / 86400000);
  return delta >= 0 ? (delta % cycle.cycleLength) + 1 : '--';
});
const nextPeriodDate = computed(() => cycle.start ? new Date(parseDate(cycle.start).getTime() + cycle.cycleLength * 86400000) : null);
const daysUntilNext = computed(() => nextPeriodDate.value ? Math.max(0, Math.ceil((nextPeriodDate.value.getTime() - parseDate(todayKey).getTime()) / 86400000)) : '--');
const nextPeriodLabel = computed(() => nextPeriodDate.value ? `${nextPeriodDate.value.getMonth() + 1}月${nextPeriodDate.value.getDate()}日` : '设置后生成');

function formatDate(date: Date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function parseDate(value: string) {
  const [y = 1970, m = 1, d = 1] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function changeMonth(delta: number) {
  visibleMonth.value = new Date(visibleMonth.value.getFullYear(), visibleMonth.value.getMonth() + delta, 1);
}
function selectDate(key: string) {
  selectedDate.value = key;
  const record = loadPeriodDay(key);
  Object.assign(daily, record || { pain: '', symptoms: [], note: '' });
}
function isPeriodDay(key: string) {
  if (!cycle.start) return false;
  const start = parseDate(cycle.start).getTime();
  const end = cycle.end ? parseDate(cycle.end).getTime() : start + (cycle.periodLength - 1) * 86400000;
  const value = parseDate(key).getTime();
  return value >= start && value <= end;
}
function isPredictedDay(key: string) {
  if (!nextPeriodDate.value) return false;
  const next = nextPeriodDate.value.getTime();
  const value = parseDate(key).getTime();
  return value >= next && value < next + cycle.periodLength * 86400000;
}
function toggleSymptom(item: string) {
  const index = daily.symptoms.indexOf(item);
  if (index >= 0) daily.symptoms.splice(index, 1);
  else daily.symptoms.push(item);
}
function markPeriodDay() {
  if (isPeriodDay(selectedDate.value)) {
    if (cycle.start === selectedDate.value) cycle.start = '';
    else if (cycle.end === selectedDate.value) cycle.end = '';
    uni.showToast({ title: '已取消这一天', icon: 'none' });
    return;
  }
  if (!cycle.start || selectedDate.value < cycle.start) cycle.start = selectedDate.value;
  else cycle.end = selectedDate.value;
  uni.showToast({ title: '已标记经期', icon: 'success' });
}
function setCycleStart() {
  cycle.start = selectedDate.value;
}
function setCycleEnd() {
  cycle.end = selectedDate.value;
}
function editCycleSettings() {
  uni.showModal({
    title: '调整周期',
    editable: true,
    placeholderText: `${cycle.cycleLength},${cycle.periodLength}`,
    content: `${cycle.cycleLength},${cycle.periodLength}`,
    success: ({ confirm, content }) => {
      if (!confirm) return;
      const [cycleValue = cycle.cycleLength, periodValue = cycle.periodLength] = (content || '').split(',').map(Number);
      if (Number.isFinite(cycleValue) && cycleValue >= 20 && cycleValue <= 45) cycle.cycleLength = cycleValue;
      if (Number.isFinite(periodValue) && periodValue >= 2 && periodValue <= 10) cycle.periodLength = periodValue;
      saveCycle();
    },
  });
}
function saveCycle() {
  saveCycleSettings({ cycleLength: cycle.cycleLength, periodLength: cycle.periodLength, lastPeriodStart: cycle.start, lastPeriodEnd: cycle.end || undefined, updatedAt: new Date().toISOString() });
}
function saveAll() {
  saveCycle();
  savePeriodDay({ date: selectedDate.value, isPeriod: isPeriodDay(selectedDate.value), pain: daily.pain ? (daily.pain as PainLevel) : undefined, symptoms: [...daily.symptoms], note: daily.note });
  uni.showToast({ title: '已保存', icon: 'success' });
}
function load() {
  const settings = loadCycleSettings();
  if (!settings) {
    uni.redirectTo({ url: '/pages/menstruation/MenstruationSetupPage' });
    return;
  }
  cycle.start = settings.lastPeriodStart;
  cycle.end = settings.lastPeriodEnd || '';
  cycle.cycleLength = settings.cycleLength;
  cycle.periodLength = settings.periodLength;
  selectDate(selectedDate.value);
}
onShow(load);
</script>

<style scoped>
.page { min-height: 100vh; padding: 0 32rpx 64rpx; background: linear-gradient(180deg, #fff6fb 0%, #f7fbf8 58%, #f5f9f6 100%); color: #263b35; }
.hero-card { display: flex; align-items: center; justify-content: space-between; gap: 18rpx; margin-top: 24rpx; padding: 30rpx 26rpx; border: 2rpx solid #f1dce8; border-radius: 24rpx; background: rgba(255,255,255,.84); box-shadow: 0 10rpx 24rpx rgba(214, 152, 185, .11); }
.hero-copy { min-width: 0; }
.eyebrow { display: block; color: #bd7798; font-size: 21rpx; }
.hero-title { display: block; margin-top: 10rpx; color: #49384b; font-size: 34rpx; font-weight: 700; }
.hero-note { display: block; margin-top: 10rpx; color: #8d8792; font-size: 21rpx; }
.cycle-ring { display: flex; align-items: center; justify-content: center; width: 164rpx; height: 164rpx; flex: none; border-radius: 50%; background: conic-gradient(#ee8fb3 0 35%, #c8c6ee 35% 72%, #f2e5eb 72% 100%); }
.ring-inner { display: flex; align-items: center; justify-content: center; flex-direction: column; width: 126rpx; height: 126rpx; border-radius: 50%; background: #fff8fb; }
.ring-number { color: #50374e; font-size: 44rpx; font-weight: 700; line-height: 1; }
.ring-label { margin-top: 8rpx; color: #9b7b91; font-size: 20rpx; }
.section-heading { display: flex; align-items: flex-end; justify-content: space-between; margin: 34rpx 2rpx 14rpx; }
.section-heading-spaced { margin-top: 38rpx; }
.section-title { display: block; color: #2e4940; font-size: 29rpx; font-weight: 700; }
.section-caption { display: block; margin-top: 6rpx; color: #87988f; font-size: 20rpx; }
.month-actions { display: flex; gap: 10rpx; }
.month-button { width: 54rpx; height: 54rpx; border: 1rpx solid #ebd8e2; border-radius: 50%; color: #9e7690; background: #fff; font-size: 38rpx; line-height: 48rpx; }
.calendar-card, .symptom-card, .cycle-editor { padding: 22rpx; border: 1rpx solid #e0ece4; border-radius: 22rpx; background: rgba(255,255,255,.9); box-shadow: 0 8rpx 20rpx rgba(50, 93, 67, .06); }
.week-row, .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); }
.week-row text { padding-bottom: 12rpx; color: #a0aaa5; font-size: 20rpx; text-align: center; }
.day-cell { position: relative; display: flex; align-items: center; justify-content: center; flex-direction: column; width: 70rpx; height: 70rpx; margin: 3rpx auto; border-radius: 50%; color: #53655e; background: transparent; font-size: 23rpx; line-height: 1; }
.day-cell::after { border: 0; }
.day-cell.muted { color: #c3cbc7; }
.day-cell.period { color: #fff; background: #ee8fb3; box-shadow: 0 4rpx 10rpx rgba(238,143,179,.22); }
.day-cell.predicted { color: #706ec5; background: #efefff; }
.day-cell.selected { outline: 3rpx solid #e8b5cc; outline-offset: 2rpx; }
.day-cell.today text:first-child { font-weight: 800; }
.day-dot, .predicted-dot { width: 7rpx; height: 7rpx; margin-top: 5rpx; border-radius: 50%; background: rgba(255,255,255,.9); }
.predicted-dot { background: #8e8bdf; }
.legend { display: flex; gap: 22rpx; margin-top: 16rpx; padding-top: 14rpx; border-top: 1rpx solid #edf3ee; }
.legend view { display: flex; align-items: center; gap: 7rpx; color: #82928a; font-size: 18rpx; }
.legend-dot { width: 14rpx; height: 14rpx; border-radius: 50%; }
.period-dot { background: #ee8fb3; }.legend .predicted-dot { background: #aaa7eb; }.today-dot { border: 2rpx solid #e8b5cc; background: #fff; }
.ghost-button, .small-action { padding: 10rpx 14rpx; border-radius: 12rpx; color: #b45f86; background: #fff0f6; font-size: 21rpx; }
.symptom-group + .symptom-group { margin-top: 22rpx; }
.group-label { display: block; margin-bottom: 12rpx; color: #4c6158; font-size: 23rpx; font-weight: 700; }
.option-row { display: flex; flex-wrap: wrap; gap: 10rpx; }
.option-chip { display: inline-flex; align-items: center; gap: 6rpx; padding: 11rpx 14rpx; border: 1rpx solid #e5ece7; border-radius: 999rpx; color: #75857d; background: #fbfdfb; font-size: 20rpx; }
.option-chip.active { border-color: #e99bb9; color: #a84f78; background: #fff0f6; }
.option-emoji { font-size: 22rpx; }
.note-input { width: 100%; height: 72rpx; margin-top: 20rpx; padding: 0 16rpx; border: 1rpx solid #e3ece6; border-radius: 14rpx; color: #3f554a; background: #fbfdfb; font-size: 21rpx; }
.editor-copy { margin-bottom: 14rpx; }.editor-row { display: flex; align-items: center; justify-content: space-between; min-height: 76rpx; border-top: 1rpx solid #edf2ee; }
.editor-label, .editor-value { display: block; }.editor-label { color: #8a9a91; font-size: 20rpx; }.editor-value { margin-top: 4rpx; color: #385449; font-size: 24rpx; font-weight: 700; }
.cycle-hint { display: flex; align-items: center; justify-content: space-between; margin-top: 12rpx; padding-top: 12rpx; border-top: 1rpx dashed #e0e9e3; color: #8a9a91; font-size: 19rpx; }.cycle-hint button { color: #ad6889; font-size: 19rpx; }
.primary-button { width: 100%; height: 84rpx; margin-top: 28rpx; border-radius: 18rpx; color: #fff; background: linear-gradient(135deg, #ef91b4, #d983ac); box-shadow: 0 10rpx 20rpx rgba(221, 126, 169, .2); font-size: 28rpx; line-height: 84rpx; }.disclaimer { display: block; margin: 18rpx 12rpx 0; color: #9aa7a0; font-size: 18rpx; line-height: 1.5; text-align: center; }
</style>
