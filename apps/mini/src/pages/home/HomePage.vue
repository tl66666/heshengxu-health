<template>
  <view class="page">
    <view class="head">
      <view
        ><text class="date-chip">{{ dateLabel }}</text
        ><text class="title">{{ greeting }}，{{ displayName }}</text></view
      >
      <image
        class="avatar"
        src="/static/illustrations/xuxu-avatar.png"
        mode="aspectFill"
        @tap="toXuxu"
      />
    </view>

    <view v-if="loading" class="loading">正在整理今天的节律…</view>
    <template v-else-if="today && experience">
      <!-- 体重进度卡片：照搬薄荷健康的圆形进度图 -->
      <view class="weight-progress-card hz-rise">
        <view class="card-header">
          <text class="card-title">体重管理</text>
          <text v-if="today.activePlan" class="card-subtitle">第 1 周</text>
        </view>
        
        <view class="circle-progress-section">
          <view class="progress-start">
            <text class="progress-value">{{
              today.activePlan?.healthTarget?.startWeightKg || '--'
            }}</text>
            <text class="progress-label">初始</text>
          </view>
          
          <view class="progress-circle">
            <text v-if="today.todayRecords?.weight && today.activePlan?.healthTarget?.startWeightKg" class="progress-center">
              已减 {{ (today.activePlan.healthTarget.startWeightKg - today.todayRecords.weight.valueKg).toFixed(1) }}kg
            </text>
            <text v-else class="progress-center">开始记录</text>
          </view>
          
          <view class="progress-end">
            <text class="progress-value">{{
              today.activePlan?.healthTarget?.targetWeightKg || '--'
            }}</text>
            <text class="progress-label">目标</text>
          </view>
        </view>
      </view>

      <!-- 今日记录卡片：照搬薄荷饮食热量卡片结构 -->
      <view class="daily-record-card hz-rise hz-rise-1">
        <view class="card-header">
          <text class="card-title">今日记录</text>
        </view>
        
        <view class="record-summary">
          <text class="summary-label">已记录</text>
          <view class="summary-value-wrap">
            <text class="summary-value">{{ experience.recording.completed }}</text>
            <text class="summary-unit">/4 项</text>
          </view>
        </view>
        
        <view class="quick-actions">
          <button
            v-for="cell in overviewCells"
            :key="cell.key"
            class="quick-action-btn"
            @tap="go(cell.route)"
          >
            <view class="quick-icon-wrap" :class="{ 'quick-icon-wrap--done': cell.done }">
              <image class="quick-icon" :src="cell.icon" mode="aspectFit" />
            </view>
            <text class="quick-label">{{ cell.label }}</text>
          </button>
        </view>
        
        <button class="card-bottom-btn" @tap="go('/pages/records/RecordsPage')">
          <image class="btn-icon" src="/static/icons/timeline.svg" mode="aspectFit" />
          <text class="btn-text">查看记录时间线</text>
        </button>
      </view>

      <!-- 和序序聊聊：简洁卡片 -->
      <button class="chat-card hz-rise hz-rise-1" @tap="toXuxu">
        <image class="chat-avatar" src="/static/illustrations/xuxu-avatar.png" mode="aspectFill" />
        <view class="chat-content">
          <text class="chat-title">和序序聊聊</text>
          <text class="chat-desc">分享今天的心情和困惑</text>
        </view>
        <image class="chat-arrow" src="/static/icons/forward.svg" mode="aspectFit" />
      </button>
    </template>
    <view v-else-if="error" class="load-failed"
      ><text>今天的状态还没有加载出来</text><text>检查服务连接后，再试一次就好。</text
      ><button @tap="load">重新加载</button></view
    >
    <view v-else class="loading">正在准备今天的节律…</view>
    <MiniTabBar active="home" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import IllustratedHero from '../../components/IllustratedHero.vue';
import MiniTabBar from '../../components/MiniTabBar.vue';
import { deriveDailyExperience } from '../../features/health-loop/daily-experience.js';
import { healthLoopState } from '../../features/health-loop/health-loop.store.js';
import type { HealthRecordType } from '../../../../../packages/contracts/src/health-loop.js';
import { requestRecordTypeFocus } from '../../features/health-records/records-focus.js';
import { onboardingState } from '../../stores/onboarding.js';
import { homeQuickActions } from './home-actions.js';
import { pickHomeHeroArt } from './home-hero-art.js';

const { today, loading, error } = healthLoopState;
const date = localDate();
const heroArt = computed(() => pickHomeHeroArt(date));
const greeting =
  new Date().getHours() < 12 ? '早上好' : new Date().getHours() < 18 ? '下午好' : '晚上好';
const dateLabel = `${new Date().getMonth() + 1} 月 ${new Date().getDate()} 日 · 今天`;
const displayName = computed(() => today.value?.displayName || '朋友');
const experience = computed(() => (today.value ? deriveDailyExperience(today.value) : null));
const overviewCells = computed(() => {
  const progress = today.value?.recordingProgress;
  if (!progress) return [];
  return [
    {
      key: 'weight',
      label: '体重',
      done: progress.hasWeight,
      icon: '/static/icons/scale.svg',
      tone: 'mint',
      route: '/pages/records/RecordsPage?type=weight',
    },
    {
      key: 'meal',
      label: '饮食',
      done: progress.hasMeal,
      icon: '/static/icons/meal.svg',
      tone: 'amber',
      route: '/pages/records/RecordsPage?type=meal-structure',
    },
    {
      key: 'activity',
      label: '活动',
      done: progress.hasActivity,
      icon: '/static/icons/activity.svg',
      tone: 'blush',
      route: '/pages/records/RecordsPage?type=activity',
    },
    {
      key: 'sleep',
      label: '睡眠',
      done: progress.hasSleep,
      icon: '/static/icons/sleep.svg',
      tone: 'sky',
      route: '/pages/records/RecordsPage?type=sleep',
    },
  ];
});
const planText = computed(() =>
  today.value?.activePlan
    ? '今天的小行动正在等你慢慢完成。'
    : '选择体重或睡眠方向，从一个小目标开始。',
);

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function load() {
  if (onboardingState.completed.value) healthLoopState.loadToday(date);
}
function go(url: string) {
  const splitAt = url.indexOf('?');
  const path = splitAt === -1 ? url : url.slice(0, splitAt);
  const query = splitAt === -1 ? '' : url.slice(splitAt + 1);
  if (isTabPath(path)) {
    const type = queryParam(query, 'type');
    if (path.startsWith('/pages/records/') && isRecordType(type)) requestRecordTypeFocus(type);
    uni.switchTab({ url: path });
    return;
  }
  uni.navigateTo({ url });
}
function queryParam(query: string, key: string) {
  for (const pair of query.split('&')) {
    const [name, value = ''] = pair.split('=');
    if (name === key) return decodeURIComponent(value);
  }
  return null;
}
function isTabPath(url: string) {
  return ['/pages/home/', '/pages/records/', '/pages/xuxu/', '/pages/plan/', '/pages/me/'].some(
    (prefix) => url.startsWith(prefix),
  );
}
function isRecordType(value: string | null): value is HealthRecordType {
  return (
    value === 'weight' || value === 'meal-structure' || value === 'activity' || value === 'sleep'
  );
}
function toPlan() {
  today.value?.activePlan
    ? uni.switchTab({ url: '/pages/plan/PlanPage' })
    : uni.navigateTo({ url: '/pages/plan-setup/PlanSetupPage' });
}
function toXuxu() {
  uni.switchTab({ url: '/pages/xuxu/XuxuPage' });
}
function localDate() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
onShow(() => {
  if (!onboardingState.completed.value) uni.redirectTo({ url: '/pages/onboarding/OnboardingPage' });
  else load();
});
</script>

<style scoped>
/* 页面基础 */
.page {
  min-height: 100vh;
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;
  padding: 44rpx 32rpx calc(var(--hz-tabbar-height) + env(safe-area-inset-bottom) + 44rpx);
  background: #f6faf7;
  color: #183425;
}

/* 顶部区域 */
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32rpx;
}
.date-chip {
  display: block;
  align-self: flex-start;
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  color: #4c7d5a;
  background: #e3f2e4;
  font-size: 22rpx;
  font-weight: 600;
}
.title {
  display: block;
  margin-top: 12rpx;
  color: #2d6943;
  font-size: 48rpx;
  font-weight: 800;
}
.avatar {
  width: 88rpx;
  height: 88rpx;
  border: 4rpx solid #efd98d;
  border-radius: 50%;
  box-shadow: 0 8rpx 20rpx rgba(239, 214, 137, 0.3);
  transition: transform 0.25s ease;
}
.avatar:active {
  transform: scale(0.95);
}

/* 加载状态 */
.loading {
  padding: 120rpx 32rpx;
  text-align: center;
  color: #76907d;
  font-size: 28rpx;
}

/* 页面背景：浅薄荷绿（照搬薄荷的浅灰背景） */
.page {
  background: #f5f8f6;
}

/* 体重进度卡片：照搬薄荷健康的圆形进度图 */
.weight-progress-card {
  margin-bottom: 24rpx;
  padding: 36rpx 32rpx;
  border-radius: 32rpx;
  background: linear-gradient(135deg, #ffffff 0%, #fafcfb 100%);
  box-shadow: 0 8rpx 28rpx rgba(127, 204, 143, 0.12);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32rpx;
}

.card-title {
  color: #2d6943;
  font-size: 32rpx;
  font-weight: 800;
}

.card-subtitle {
  color: #76907d;
  font-size: 24rpx;
  font-weight: 600;
}

.circle-progress-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
}

.progress-start,
.progress-end {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.progress-value {
  color: #2d6943;
  font-size: 56rpx;
  font-weight: 900;
  line-height: 1;
}

.progress-label {
  color: #76907d;
  font-size: 22rpx;
  font-weight: 600;
}

.progress-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 280rpx;
  height: 280rpx;
  border: 16rpx solid #e8f7ed;
  border-top-color: #7fcc8f;
  border-right-color: #7fcc8f;
  border-radius: 50%;
  background: #fafcfb;
}

.progress-center {
  color: #5a9572;
  font-size: 26rpx;
  font-weight: 700;
  text-align: center;
}

/* 今日记录卡片：照搬薄荷饮食热量结构 */
.daily-record-card {
  margin-bottom: 24rpx;
  padding: 36rpx 32rpx;
  border-radius: 32rpx;
  background: linear-gradient(135deg, #ffffff 0%, #fafcfb 100%);
  box-shadow: 0 8rpx 28rpx rgba(127, 204, 143, 0.12);
}

.record-summary {
  display: flex;
  align-items: baseline;
  gap: 16rpx;
  margin-bottom: 36rpx;
  padding: 0 8rpx;
}

.summary-label {
  color: #76907d;
  font-size: 26rpx;
  font-weight: 600;
}

.summary-value-wrap {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
}

.summary-value {
  color: #2d6943;
  font-size: 88rpx;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.02em;
}

.summary-unit {
  color: #5a9572;
  font-size: 32rpx;
  font-weight: 700;
}

.quick-actions {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-bottom: 28rpx;
  padding: 20rpx 0;
}

.quick-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 0;
  background: transparent;
  border: 0;
}

.quick-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(127, 204, 143, 0.12) 0%, rgba(232, 247, 237, 0.8) 100%);
  transition: all 0.3s ease;
}

.quick-icon-wrap--done {
  background: linear-gradient(135deg, rgba(127, 204, 143, 0.25) 0%, rgba(95, 158, 118, 0.2) 100%);
  box-shadow: 0 4rpx 16rpx rgba(127, 204, 143, 0.25);
}

.quick-icon {
  width: 44rpx;
  height: 44rpx;
}

.quick-label {
  color: #284d36;
  font-size: 24rpx;
  font-weight: 700;
}

.card-bottom-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  width: 100%;
  padding: 24rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, rgba(127, 204, 143, 0.12) 0%, rgba(232, 247, 237, 0.6) 100%);
  transition: all 0.3s cubic-bezier(0.22, 0.8, 0.36, 1);
}

.card-bottom-btn:active {
  transform: scale(0.98);
  background: linear-gradient(135deg, rgba(127, 204, 143, 0.18) 0%, rgba(232, 247, 237, 0.8) 100%);
}

.btn-icon {
  width: 32rpx;
  height: 32rpx;
}

.btn-text {
  color: #5a9572;
  font-size: 26rpx;
  font-weight: 700;
}

/* 和序序聊聊：白卡片风格 */
.chat-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  width: 100%;
  margin-bottom: 24rpx;
  padding: 32rpx;
  border-radius: 32rpx;
  text-align: left;
  background: linear-gradient(135deg, #ffffff 0%, #fafcfb 100%);
  box-shadow: 0 8rpx 28rpx rgba(127, 204, 143, 0.12);
  transition: all 0.3s cubic-bezier(0.22, 0.8, 0.36, 1);
}
.chat-card:active {
  transform: translateY(-2rpx) scale(0.99);
  box-shadow: 0 12rpx 36rpx rgba(127, 204, 143, 0.16);
}
.chat-avatar {
  width: 72rpx;
  height: 72rpx;
  flex: none;
  border: 3rpx solid #e8f7ed;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 4rpx 16rpx rgba(127, 204, 143, 0.2);
}
.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}
.chat-title {
  display: block;
  color: #2d6943;
  font-size: 28rpx;
  font-weight: 700;
}
.chat-desc {
  display: block;
  color: #76907d;
  font-size: 22rpx;
}
.chat-arrow {
  width: 28rpx;
  height: 28rpx;
  flex: none;
  opacity: 0.4;
}

.task-copy text {
  display: block;
}
.task-copy text:first-child {
  color: #284d36;
  font-size: 28rpx;
  font-weight: 700;
  margin-bottom: 6rpx;
}
.task-copy text:last-child {
  color: #758c7d;
  font-size: 24rpx;
}
.arrow {
  width: 32rpx;
  height: 32rpx;
  flex: none;
  opacity: 0.4;
}

/* 区块标题 */
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 36rpx 4rpx 20rpx;
}
.section-head text:first-child {
  color: #274a35;
  font-size: 34rpx;
  font-weight: 800;
}
.section-head text:last-child {
  color: #76907d;
  font-size: 24rpx;
}

/* 入场动画 */
.hz-rise {
  animation: riseIn 0.7s cubic-bezier(0.22, 0.8, 0.36, 1) forwards;
  opacity: 0;
}
.hz-rise-1 {
  animation-delay: 0.1s;
}
.hz-rise-2 {
  animation-delay: 0.2s;
}
.hz-rise-3 {
  animation-delay: 0.3s;
}
@keyframes riseIn {
  from {
    opacity: 0;
    transform: translateY(32rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 浮动动画 */
@keyframes hz-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6rpx);
  }
}
</style>
