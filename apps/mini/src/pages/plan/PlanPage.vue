<template>
  <view class="page">
    <view v-if="pageState === 'loading'" class="page-loading">正在整理你的计划...</view>

    <view v-else-if="pageState === 'error'" class="empty-state error-state">
      <image class="empty-art" src="/static/illustrations/xuxu-safe-support.png" mode="aspectFit" />
      <text class="empty-title">计划暂时没有加载出来</text>
      <text class="empty-copy">检查网络后再试一次，已经设置的计划不会丢失。</text>
      <button class="primary-button" @tap="load">重新加载</button>
    </view>

    <view v-else-if="pageState === 'empty'" class="empty-state">
      <image class="empty-art" src="/static/illustrations/program-weight.png" mode="aspectFit" />
      <text class="empty-title">从一份小计划开始</text>
      <text class="empty-copy">把想照顾的方向交给序序，一步一步来。</text>
      <button class="primary-button" @tap="setup">设置我的计划</button>
    </view>

    <template v-else-if="plan">
      <view class="page-header">
        <view>
          <text class="date-label">今天的节律</text>
          <text class="page-title">我的计划</text>
        </view>
        <button class="text-button" @tap="setup">调整计划</button>
      </view>

      <view class="plan-intro">
        <image
          class="plan-intro-art"
          :src="
            plan.kind === 'sleep'
              ? '/static/illustrations/program-sleep.png'
              : '/static/illustrations/program-weight.png'
          "
          mode="aspectFill"
        />
        <view class="plan-intro-copy">
          <text class="plan-kicker">正在执行</text>
          <text class="plan-name">{{
            plan.kind === 'sleep' ? '睡眠与精力计划' : '轻盈节律计划'
          }}</text>
          <text class="plan-description">{{ targetText }}</text>
        </view>
      </view>

      <view class="progress-line">
        <view class="progress-copy"
          ><text>今日节律</text
          ><text>{{ presentation.completedCount }}/{{ plan.tasks.length }} 已完成</text></view
        >
        <view class="progress-track"
          ><view class="progress-fill" :style="{ width: `${progress}%` }"
        /></view>
      </view>

      <view class="section-heading"><text>今天的小行动</text><text>完成一点就很好</text></view>
      <view class="tasks">
        <view v-for="task in plan.tasks" :key="task.id" class="task-row">
          <button
            class="task-check"
            :class="{ done: task.status === 'completed' }"
            :disabled="task.status !== 'pending'"
            @tap="complete(task.id)"
          >
            <image
              v-if="task.status === 'completed'"
              src="/static/icons/check.svg"
              mode="aspectFit"
            />
          </button>
          <view class="task-copy">
            <text class="task-title">{{ taskTitle(task.actionType) }}</text>
            <text class="task-note">{{
              task.status === 'completed' ? '已完成，给自己一点肯定' : '今天完成就很好'
            }}</text>
          </view>
        </view>
      </view>

      <view
        v-if="presentation.completedCount === plan.tasks.length && plan.tasks.length > 0"
        class="complete-note"
      >
        <image src="/static/illustrations/xuxu-complete.png" mode="aspectFill" />
        <view><text>今天的行动都完成了</text><text>序序已经记下这份稳定的节律。</text></view>
      </view>

      <view class="section-heading programs-heading"
        ><view><text>可照顾的方向</text><text>先专注一个重点，其他方向慢慢加入</text></view
        ><text>更多方向</text></view
      >
      <scroll-view class="programs" scroll-x="true" show-scrollbar="false">
        <button
          v-for="item in programs"
          :key="item.kind"
          class="program-item"
          :class="{ active: item.kind === plan.kind, disabled: !item.available }"
          @tap="selectProgram(item)"
        >
          <image :src="item.image" mode="aspectFill" />
          <view
            ><text>{{ item.label }}</text
            ><text>{{
              item.available ? (item.kind === plan.kind ? '当前计划' : '可调整') : '后续开放'
            }}</text></view
          >
        </button>
      </scroll-view>
    </template>
    <MiniTabBar active="plan" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import MiniTabBar from '../../components/MiniTabBar.vue';
import { healthLoopState } from '../../features/health-loop/health-loop.store.js';
import { planPageState, planPresentation } from '../../features/health-loop/plan-presentation.js';

const date = localDate();
const plan = computed(() => healthLoopState.today.value?.activePlan || healthLoopState.plan.value);
const pageState = computed(() =>
  planPageState(plan.value, healthLoopState.error.value || '', healthLoopState.loading.value),
);
const presentation = computed(() => planPresentation(plan.value?.tasks || []));
const progress = computed(() => {
  const total = plan.value?.tasks.length || 0;
  return total ? Math.round((presentation.value.completedCount / total) * 100) : 0;
});
const programs = [
  {
    kind: 'weight' as const,
    label: '减脂与体重',
    image: '/static/illustrations/program-weight.png',
    available: true,
  },
  {
    kind: 'sleep' as const,
    label: '睡眠与精力',
    image: '/static/illustrations/program-sleep.png',
    available: true,
  },
  {
    kind: 'mood' as const,
    label: '压力与情绪',
    image: '/static/illustrations/program-mood.png',
    available: false,
  },
  {
    kind: 'metabolic' as const,
    label: '代谢管理',
    image: '/static/illustrations/program-metabolic.png',
    available: false,
  },
  {
    kind: 'digestive' as const,
    label: '肠胃生活方式',
    image: '/static/illustrations/program-digestive.png',
    available: false,
  },
];
const targetText = computed(() => {
  const target = plan.value?.healthTarget;
  if (!target) return '';
  if (target.kind === 'sleep') return '从今晚开始，给自己留一点更规律的休息时间。';
  const direction = { lose: '温和减重', maintain: '保持状态', gain: '稳步增重' }[
    target.direction || 'maintain'
  ];
  return `目标：${direction}${target.targetWeightKg ? ` · ${target.targetWeightKg} kg` : ''}`;
});
function taskTitle(type: string) {
  return (
    {
      record_weight: '记录今天体重',
      record_meal: '记录一餐饮食',
      walk_15_minutes: '步行 15 分钟',
      record_sleep: '补记昨晚睡眠',
    }[type] || type
  );
}
async function complete(id: string) {
  await healthLoopState.completeTask(id, date);
}
function setup() {
  uni.navigateTo({ url: '/pages/plan-setup/PlanSetupPage' });
}
function load() {
  healthLoopState.loadToday(date);
}
function selectProgram(item: (typeof programs)[number]) {
  if (!item.available) {
    uni.showToast({ title: '这个方向正在准备中', icon: 'none' });
    return;
  }
  setup();
}
function localDate() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
onShow(load);
</script>

<style scoped>
.page {
  min-height: 100vh;
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;
  padding: 50rpx 32rpx 220rpx;
  background: #f7fbf8;
  color: #1d3d2a;
}
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 24rpx;
}
.date-label {
  display: block;
  color: #789181;
  font-size: 22rpx;
}
.page-title {
  display: block;
  margin-top: 7rpx;
  color: #214632;
  font-size: 40rpx;
  font-weight: 700;
}
.text-button {
  color: #43835b;
  font-size: 23rpx;
}
.plan-intro {
  display: flex;
  align-items: center;
  min-height: 184rpx;
  overflow: hidden;
  border: 2rpx solid #dbeadd;
  border-radius: 20rpx;
  background: #fffdf5;
}
.plan-intro-art {
  width: 188rpx;
  height: 184rpx;
  flex: none;
}
.plan-intro-copy {
  padding: 22rpx 24rpx;
}
.plan-kicker {
  display: block;
  color: #5f916c;
  font-size: 21rpx;
  font-weight: 700;
}
.plan-name {
  display: block;
  margin-top: 8rpx;
  color: #244a32;
  font-size: 30rpx;
  font-weight: 700;
}
.plan-description {
  display: block;
  margin-top: 10rpx;
  color: #708779;
  font-size: 22rpx;
  line-height: 1.45;
}
.progress-line {
  margin-top: 28rpx;
}
.progress-copy {
  display: flex;
  justify-content: space-between;
  color: #5d7866;
  font-size: 23rpx;
}
.progress-copy text:last-child {
  color: #789181;
  font-size: 21rpx;
}
.progress-track {
  height: 10rpx;
  margin-top: 12rpx;
  overflow: hidden;
  border-radius: 10rpx;
  background: #e1eee3;
}
.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: #5b9b70;
  transition: width 0.2s ease;
}
.section-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin: 34rpx 2rpx 12rpx;
}
.section-heading > text:first-child,
.programs-heading > view text:first-child {
  display: block;
  color: #244a32;
  font-size: 29rpx;
  font-weight: 700;
}
.section-heading > text:last-child,
.programs-heading > view text:last-child {
  color: #7b9181;
  font-size: 21rpx;
}
.programs-heading {
  align-items: flex-start;
}
.programs-heading > text {
  padding-top: 4rpx;
  color: #5d9169;
}
.tasks {
  border-top: 1rpx solid #e1ebe2;
}
.task-row {
  display: flex;
  align-items: center;
  gap: 18rpx;
  min-height: 102rpx;
  border-bottom: 1rpx solid #e1ebe2;
}
.task-check {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44rpx;
  height: 44rpx;
  flex: none;
  border: 2rpx solid #84aa8c;
  border-radius: 50%;
  background: #fff;
}
.task-check image {
  width: 44rpx;
  height: 44rpx;
}
.task-copy {
  flex: 1;
}
.task-title,
.task-note {
  display: block;
}
.task-title {
  color: #2b5239;
  font-size: 27rpx;
  font-weight: 700;
}
.task-note {
  margin-top: 5rpx;
  color: #7b9181;
  font-size: 21rpx;
}
.complete-note {
  display: flex;
  align-items: center;
  gap: 14rpx;
  margin-top: 18rpx;
  padding: 16rpx 0;
  border-top: 1rpx solid #cfe3d3;
  border-bottom: 1rpx solid #cfe3d3;
}
.complete-note image {
  width: 78rpx;
  height: 78rpx;
  border-radius: 50%;
}
.complete-note text {
  display: block;
  color: #315d41;
  font-size: 25rpx;
  font-weight: 700;
}
.complete-note text:last-child {
  margin-top: 5rpx;
  color: #71897a;
  font-size: 21rpx;
  font-weight: 400;
}
.programs {
  width: calc(100% + 32rpx);
  margin-left: -16rpx;
  white-space: nowrap;
}
.program-item {
  display: inline-flex;
  align-items: center;
  width: 290rpx;
  height: 112rpx;
  margin: 0 8rpx;
  overflow: hidden;
  border: 2rpx solid #dceadd;
  border-radius: 16rpx;
  text-align: left;
  background: #fff;
}
.program-item:first-child {
  margin-left: 16rpx;
}
.program-item:last-child {
  margin-right: 16rpx;
}
.program-item image {
  width: 102rpx;
  height: 112rpx;
  flex: none;
}
.program-item view {
  padding: 0 14rpx;
}
.program-item view text {
  display: block;
  color: #31543e;
  font-size: 23rpx;
  font-weight: 700;
}
.program-item view text:last-child {
  margin-top: 7rpx;
  color: #7b9181;
  font-size: 19rpx;
  font-weight: 400;
}
.program-item.active {
  border-color: #71a97b;
  background: #f2f8f1;
}
.program-item.disabled {
  opacity: 0.58;
}
.empty-state {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 80rpx 16rpx;
  text-align: center;
}
.empty-art {
  width: 250rpx;
  height: 250rpx;
  border-radius: 20rpx;
  background: #fffdf5;
}
.empty-title {
  margin-top: 20rpx;
  color: #315a40;
  font-size: 31rpx;
  font-weight: 700;
}
.empty-copy {
  margin-top: 9rpx;
  color: #718a7a;
  font-size: 23rpx;
}
.primary-button {
  margin-top: 28rpx;
  padding: 18rpx 34rpx;
  border-radius: 14rpx;
  color: #fff;
  background: #347c50;
  font-size: 26rpx;
}
.error-state .empty-art {
  background: #f3f9f3;
}
.page-loading {
  padding: 180rpx 20rpx;
  color: #718a7a;
  text-align: center;
  font-size: 26rpx;
}
</style>
