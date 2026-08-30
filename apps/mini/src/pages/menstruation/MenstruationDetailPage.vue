<template>
  <view class="page">
    <AppNavBar title="生理期记录" route="/pages/menstruation/MenstruationDetailPage" />

    <scroll-view class="date-strip" scroll-x show-scrollbar="false">
      <view v-for="item in dateStrip" :key="item.key" class="date-pill" :class="{ active: item.key === selectedDate, period: isPeriodDay(item.key) }" @tap="selectDate(item.key)">
        <text>{{ item.week }}</text><text>{{ item.day }}</text>
      </view>
    </scroll-view>
    <view class="hero-card hz-rise">
      <view class="hero-caption">{{ cycle.start ? '当前周期' : '还没有周期记录' }}</view>
      <view class="cycle-ring" aria-label="周期进度">
        <view class="ring-inner"><text class="ring-overline">距离经期还有</text><text class="ring-number">{{ daysUntilNext }}</text><text class="ring-label">天</text><text class="ring-date">{{ nextPeriodDate ? `预计${nextPeriodLabel}开始` : '完成设置后生成预测' }}</text></view>
      </view>
      <view class="cycle-meta"><text>{{ cycleDay === '--' ? '设置周期后开始追踪' : `周期第 ${cycleDay} 天` }}</text><text>{{ cycle.start ? `经期 ${cycle.periodLength} 天 · 周期 ${cycle.cycleLength} 天` : '' }}</text></view>
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

    <button class="primary-button sticky-action" @tap="saveAll">{{ isPeriodDay(selectedDate) ? '保存今天的记录' : '记录今天的经期' }}</button>
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
const dateStrip = computed(() => {
  const base = parseDate(todayKey);
  return Array.from({ length: 9 }, (_, index) => {
    const date = new Date(base);
    date.setDate(base.getDate() + index - 4);
    return { key: formatDate(date), day: date.getDate(), week: index === 4 ? '今' : weekLabels[date.getDay()] };
  });
});
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
.page { min-height: 100vh; padding: 0 0 154rpx; background: #fff7f1; color: #4b4547; }
.date-strip { width: 100%; padding: 18rpx 28rpx 6rpx; white-space: nowrap; background: #fff1ec; }
.date-pill { display: inline-flex; align-items: center; justify-content: center; flex-direction: column; width: 82rpx; height: 104rpx; margin-right: 12rpx; border: 1rpx solid #f1ddd9; border-radius: 20rpx; color: #9e9596; background: #fffdfb; font-size: 19rpx; }
.date-pill text + text { margin-top: 9rpx; color: #62595b; font-size: 28rpx; font-weight: 700; }
.date-pill.active { border-color: #e8a0ac; color: #fff; background: #e994a6; box-shadow: 0 8rpx 18rpx rgba(216, 135, 150, .22); }
.date-pill.active text + text { color: #fff; }
.date-pill.period:not(.active) { border-color: #efc5d0; color: #c26d80; background: #fff0f3; }
.hero-card { margin: 0; padding: 28rpx 28rpx 24rpx; text-align: center; background: #fff1ec; }
.hero-caption { color: #9d777e; font-size: 21rpx; }
.cycle-ring { display: flex; align-items: center; justify-content: center; width: 430rpx; height: 430rpx; margin: 18rpx auto 0; border-radius: 50%; background: conic-gradient(#e98fa1 0 32%, #f4d9c8 32% 54%, #c5c2eb 54% 76%, #f9ece7 76% 100%); box-shadow: 0 18rpx 34rpx rgba(207, 154, 164, .18); }
.ring-inner { display: flex; align-items: center; justify-content: center; flex-direction: column; width: 344rpx; height: 344rpx; border-radius: 50%; background: #fffaf7; }
.ring-overline { color: #a58c91; font-size: 21rpx; }
.ring-number { margin-top: 8rpx; color: #4e464b; font-size: 78rpx; line-height: 1; font-weight: 700; }
.ring-label { margin-top: 4rpx; color: #786a70; font-size: 24rpx; }
.ring-date { margin-top: 16rpx; color: #a58f95; font-size: 20rpx; }
.cycle-meta { display: flex; justify-content: center; gap: 26rpx; margin-top: 18rpx; color: #8c7b82; font-size: 20rpx; }
.section-heading { display: flex; align-items: flex-end; justify-content: space-between; margin: 28rpx 28rpx 12rpx; }
.section-heading-spaced { margin-top: 30rpx; }
.section-title { display: block; color: #564d51; font-size: 28rpx; font-weight: 700; }
.section-caption { display: block; margin-top: 6rpx; color: #a29395; font-size: 19rpx; }
.month-actions { display: flex; gap: 10rpx; }
.month-button { width: 50rpx; height: 50rpx; border: 1rpx solid #ead4d2; border-radius: 50%; color: #bd7f8c; background: #fffdfb; font-size: 34rpx; line-height: 44rpx; }
.calendar-card, .symptom-card, .cycle-editor { margin: 0 28rpx; padding: 22rpx 18rpx; border: 1rpx solid #f0e0dc; border-radius: 18rpx; background: #fffdfb; box-shadow: 0 8rpx 22rpx rgba(119, 91, 79, .06); }
.week-row, .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); }
.week-row text { padding-bottom: 12rpx; color: #b2a3a0; font-size: 19rpx; text-align: center; }
.day-cell { position: relative; display: flex; align-items: center; justify-content: center; flex-direction: column; width: 66rpx; height: 66rpx; margin: 3rpx auto; border-radius: 50%; color: #625b5e; background: transparent; font-size: 22rpx; line-height: 1; }
.day-cell::after { border: 0; }
.day-cell.muted { color: #d3c7c3; }
.day-cell.period { color: #fff; background: #e994a6; box-shadow: 0 4rpx 10rpx rgba(222, 136, 153, .2); }
.day-cell.predicted { color: #7f79bd; background: #f0effb; }
.day-cell.selected { outline: 3rpx solid #e6b5bc; outline-offset: 2rpx; }
.day-cell.today text:first-child { font-weight: 800; }
.day-dot, .predicted-dot { width: 7rpx; height: 7rpx; margin-top: 5rpx; border-radius: 50%; background: rgba(255, 255, 255, .9); }
.predicted-dot { background: #8f89ce; }
.legend { display: flex; gap: 20rpx; margin-top: 16rpx; padding-top: 14rpx; border-top: 1rpx solid #f2e7e3; }
.legend view { display: flex; align-items: center; gap: 7rpx; color: #9b8e8d; font-size: 18rpx; }
.legend-dot { width: 14rpx; height: 14rpx; border-radius: 50%; }
.period-dot { background: #e994a6; }.legend .predicted-dot { background: #aaa6de; }.today-dot { border: 2rpx solid #df9eaa; background: #fffdfb; }
.ghost-button, .small-action { padding: 10rpx 14rpx; border-radius: 12rpx; color: #b9647c; background: #fff0f3; font-size: 20rpx; }
.symptom-group + .symptom-group { margin-top: 22rpx; }
.group-label { display: block; margin-bottom: 12rpx; color: #6d5e64; font-size: 22rpx; font-weight: 700; }
.option-row { display: flex; flex-wrap: wrap; gap: 10rpx; }
.option-chip { display: inline-flex; align-items: center; gap: 6rpx; padding: 11rpx 14rpx; border: 1rpx solid #efdfdf; border-radius: 12rpx; color: #8e8082; background: #fffaf8; font-size: 20rpx; }
.option-chip.active { border-color: #e5a0af; color: #b45d78; background: #fff0f3; }
.option-emoji { font-size: 22rpx; }
.note-input { width: 100%; height: 72rpx; margin-top: 20rpx; padding: 0 16rpx; border: 1rpx solid #efdfdf; border-radius: 12rpx; color: #5f5559; background: #fffaf8; font-size: 20rpx; }
.cycle-editor { margin-top: 22rpx; }
.editor-copy { margin-bottom: 14rpx; }.editor-row { display: flex; align-items: center; justify-content: space-between; min-height: 72rpx; border-top: 1rpx solid #f2e7e3; }
.editor-label, .editor-value { display: block; }.editor-label { color: #a29395; font-size: 19rpx; }.editor-value { margin-top: 4rpx; color: #63565c; font-size: 23rpx; font-weight: 700; }
.cycle-hint { display: flex; align-items: center; justify-content: space-between; margin-top: 12rpx; padding-top: 12rpx; border-top: 1rpx dashed #eadbd7; color: #a29395; font-size: 18rpx; }.cycle-hint button { color: #b66c82; font-size: 18rpx; }
.primary-button { width: 100%; height: 82rpx; margin-top: 28rpx; border-radius: 40rpx; color: #fff; background: #e58fa3; box-shadow: 0 10rpx 20rpx rgba(214, 123, 143, .22); font-size: 27rpx; line-height: 82rpx; }
.sticky-action { position: fixed; right: 44rpx; bottom: 28rpx; left: 44rpx; z-index: 20; width: auto; margin: 0; }
.disclaimer { display: block; margin: 18rpx 36rpx 0; color: #ad9e9d; font-size: 17rpx; line-height: 1.5; text-align: center; }
@media (min-width: 700px) { .page { max-width: 760px; margin: 0 auto; } }
</style>
