<template>
  <view class="page">
    <view class="head"
      ><view
        ><text class="date">{{ dateLabel }}</text
        ><text class="title">{{ greeting }}，{{ displayName }}</text></view
      ><image
        class="avatar"
        src="/static/illustrations/xuxu-avatar.jpg"
        mode="aspectFill"
        @tap="toXuxu"
    /></view>
    <view v-if="loading" class="loading">正在整理今天的节律...</view>
    <template v-else-if="today">
      <view class="hero"
        ><image src="/static/illustrations/home-companion-banner.png" mode="aspectFill" /><view
          class="hero-copy"
          ><text class="eyebrow">今日行动</text
          ><text class="hero-title">{{ today.dailyAction.title }}</text
          ><text class="hero-desc">{{ today.dailyAction.description }}</text
          ><button class="hero-button" @tap="go(today.dailyAction.route)">去完成</button></view
        ></view
      >
      <XuxuHint :message="xuxuMessage" action="听序序说" @tap="toXuxu" />
      <view class="section-head"
        ><text class="section-title">今日记录</text
        ><text class="progress"
          >{{ today.recordingProgress.completed }}/{{ today.recordingProgress.total }}</text
        ></view
      >
      <view class="record-grid"
        ><button
          v-for="item in progressItems"
          :key="item.type"
          class="record-item"
          @tap="go(`/pages/records/RecordsPage?type=${item.type}`)"
        >
          <text class="record-icon">{{ item.icon }}</text
          ><text class="record-name">{{ item.label }}</text
          ><text :class="['record-status', { done: item.done }]">{{
            item.done ? '已记录' : '待记录'
          }}</text>
        </button></view
      >
      <view class="plan-card" @tap="toPlan"
        ><view
          ><text class="eyebrow">{{ today.activePlan ? '正在执行' : '从这里开始' }}</text
          ><text class="plan-title">{{ planTitle }}</text
          ><text class="plan-desc">{{ planDescription }}</text></view
        ><text class="arrow">›</text></view
      >
    </template>
    <view v-else class="loading">暂时无法加载今日状态</view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import XuxuHint from '../../components/XuxuHint.vue';
import { healthLoopState } from '../../features/health-loop/health-loop.store.js';
import { onboardingState } from '../../stores/onboarding.js';

const { today, loading } = healthLoopState;
const date = localDate();
const greeting =
  new Date().getHours() < 12 ? '早上好' : new Date().getHours() < 18 ? '下午好' : '晚上好';
const dateLabel = `${new Date().getMonth() + 1} 月 ${new Date().getDate()} 日 · 今日`;
const displayName = computed(() => today.value?.displayName || '朋友');
const planTitle = computed(() =>
  today.value?.activePlan?.kind === 'sleep'
    ? '睡眠与精力计划'
    : today.value?.activePlan
      ? '轻盈节律计划'
      : '设置你的第一个计划',
);
const planDescription = computed(() =>
  today.value?.activePlan
    ? `今天有 ${today.value.todayTasks.length} 件小事在等你`
    : '选一个当前最想照顾的方向',
);
const xuxuMessage = computed(
  () => today.value?.dailyAction.description || '从一个小行动开始就很好。',
);
const progressItems = computed(() => {
  const value = today.value?.recordingProgress;
  return [
    { type: 'weight', label: '体重', icon: '◌', done: value?.hasWeight },
    { type: 'meal-structure', label: '饮食', icon: '◐', done: value?.hasMeal },
    { type: 'activity', label: '活动', icon: '⌁', done: value?.hasActivity },
    { type: 'sleep', label: '睡眠', icon: '☾', done: value?.hasSleep },
  ];
});
function load() {
  if (onboardingState.completed.value) healthLoopState.loadToday(date);
}
function go(url: string) {
  if (url.startsWith('/pages/plan/')) uni.switchTab({ url });
  else uni.navigateTo({ url });
}
function toPlan() {
  today.value?.activePlan
    ? uni.switchTab({ url: '/pages/plan/PlanPage' })
    : uni.navigateTo({ url: '/pages/plan-setup/PlanSetupPage' });
}
function toXuxu() {
  uni.switchTab({ url: '/pages/xuxu/XuxuPage' });
}
onMounted(load);
onShow(() => {
  if (!onboardingState.completed.value) uni.redirectTo({ url: '/pages/onboarding/OnboardingPage' });
  else load();
});
function localDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10);
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 48rpx 32rpx 166rpx;
  background: #f7fbf8;
  color: #1d3d2a;
}
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28rpx;
}
.date,
.title {
  display: block;
}
.date,
.eyebrow {
  color: #69917a;
  font-size: 23rpx;
  font-weight: 700;
}
.title {
  margin-top: 9rpx;
  font-size: 46rpx;
  font-weight: 700;
}
.avatar {
  width: 72rpx;
  height: 72rpx;
  border: 3rpx solid #f2df9b;
  border-radius: 50%;
  background: #fff8df;
}
.hero {
  position: relative;
  height: 284rpx;
  overflow: hidden;
  border-radius: 20rpx;
  background: #eaf5e9;
}
.hero image {
  width: 100%;
  height: 100%;
  opacity: 0.94;
}
.hero-copy {
  position: absolute;
  inset: 0;
  box-sizing: border-box;
  padding: 26rpx;
}
.hero-title,
.hero-desc {
  display: block;
  max-width: 370rpx;
}
.hero-title {
  margin-top: 10rpx;
  font-size: 35rpx;
  line-height: 1.3;
  font-weight: 700;
}
.hero-desc {
  margin-top: 8rpx;
  color: #5a7664;
  font-size: 22rpx;
  line-height: 1.45;
}
.hero-button {
  width: 142rpx;
  height: 54rpx;
  margin: 17rpx 0 0;
  border-radius: 27rpx;
  color: #fff;
  background: #43865a;
  font-size: 22rpx;
  line-height: 54rpx;
}
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 30rpx 0 15rpx;
}
.section-title {
  font-size: 30rpx;
  font-weight: 700;
}
.progress {
  color: #558269;
  font-size: 24rpx;
}
.record-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12rpx;
}
.record-item {
  display: flex;
  height: 132rpx;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7rpx;
  padding: 0;
  border: 2rpx solid #dfecdf;
  border-radius: 16rpx;
  color: #385b45;
  background: #fff;
}
.record-icon {
  color: #5c9a70;
  font-size: 31rpx;
}
.record-name {
  font-size: 23rpx;
}
.record-status {
  color: #93a89a;
  font-size: 20rpx;
}
.record-status.done {
  color: #3d8858;
}
.plan-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 28rpx;
  padding: 24rpx;
  border: 2rpx solid #dcead9;
  border-radius: 18rpx;
  background: #fff;
}
.plan-title,
.plan-desc {
  display: block;
}
.plan-title {
  margin-top: 8rpx;
  font-size: 30rpx;
  font-weight: 700;
}
.plan-desc {
  margin-top: 5rpx;
  color: #718a7b;
  font-size: 22rpx;
}
.arrow {
  color: #4c8b5e;
  font-size: 44rpx;
}
.loading {
  padding: 120rpx 30rpx;
  color: #718a7b;
  text-align: center;
  font-size: 28rpx;
}
</style>
