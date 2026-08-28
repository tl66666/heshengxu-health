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
      <!-- 1. 体重管理方案卡片：完全照搬薄荷健康 -->
      <view class="weight-management-card hz-rise">
        <view class="card-header-row">
          <view class="card-title-group">
            <text class="card-title">体重管理方案</text>
            <text class="eye-icon">👁</text>
          </view>
          <text class="card-week">第 1 周</text>
        </view>
        
        <view class="circle-progress-wrapper">
          <view class="progress-side">
            <text class="progress-num">{{
              today.activePlan?.healthTarget?.startWeightKg || 72.5
            }}</text>
            <text class="progress-text">初始</text>
          </view>
          
          <view class="progress-circle-view">
            <text v-if="today.todayRecords?.weight && today.activePlan?.healthTarget?.startWeightKg" 
                  class="progress-center-text">
              已减去<br />{{
                (today.activePlan.healthTarget.startWeightKg - today.todayRecords.weight.valueKg).toFixed(2)
              }}<text class="progress-unit-small">公斤</text>
            </text>
            <text v-else class="progress-center-text">开始记录</text>
          </view>
          
          <view class="progress-side">
            <text class="progress-num">{{
              today.activePlan?.healthTarget?.targetWeightKg || 65.0
            }}</text>
            <text class="progress-text">目标</text>
          </view>
        </view>
      </view>

      <!-- 2. 今日记录卡片：完全照搬薄荷饮食热量结构 -->
      <view class="daily-record-big-card hz-rise hz-rise-1">
        <view class="card-header-row">
          <text class="card-title">今日记录</text>
          <view class="record-badge">
            <text class="badge-icon">✓</text>
            <text class="badge-text">{{ experience.recording.completed }}/4</text>
          </view>
        </view>
        
        <!-- 超大数字展示区 -->
        <view class="main-data-display">
          <text class="data-label-small">体重</text>
          <view class="data-big-number">
            <text class="big-num">{{
              today.todayRecords?.weight?.valueKg || '--'
            }}</text>
            <text class="big-unit">kg</text>
          </view>
        </view>
        
        <!-- 3个小数据 -->
        <view class="sub-data-row">
          <view class="sub-item">
            <text class="sub-label">目标</text>
            <text class="sub-val">{{
              today.activePlan?.healthTarget?.targetWeightKg || '--'
            }}kg</text>
          </view>
          <view class="sub-item">
            <text class="sub-label">饮食</text>
            <text class="sub-val">{{
              today.todayRecords?.food ? '1/3' : '0/3'
            }}</text>
          </view>
          <view class="sub-item">
            <text class="sub-label">活动</text>
            <text class="sub-val">{{
              today.todayRecords?.activity?.durationMin || 0
            }}分钟</text>
          </view>
        </view>
        
        <!-- 横向滑动点 -->
        <view class="slide-indicator">
          <view class="dot active-dot" />
          <view class="dot" />
          <view class="dot" />
        </view>
        
        <!-- 5个快捷按钮横向排列 -->
        <view class="five-quick-actions">
          <button class="quick-circle-btn" @tap="go('/pages/records/RecordsPage?type=weight')">
            <view class="quick-icon-circle">
              <text class="icon-emoji">⚖️</text>
            </view>
            <text class="quick-text">体重</text>
          </button>
          <button class="quick-circle-btn" @tap="go('/pages/records/RecordsPage?type=food')">
            <view class="quick-icon-circle">
              <text class="icon-emoji">🍚</text>
            </view>
            <text class="quick-text">饮食</text>
          </button>
          <button class="quick-circle-btn" @tap="go('/pages/records/RecordsPage?type=water')">
            <view class="quick-icon-circle">
              <text class="icon-emoji">💧</text>
            </view>
            <text class="quick-text">水</text>
          </button>
          <button class="quick-circle-btn" @tap="go('/pages/records/RecordsPage?type=activity')">
            <view class="quick-icon-circle">
              <text class="icon-emoji">🏃</text>
            </view>
            <text class="quick-text">活动</text>
          </button>
          <button class="quick-circle-btn" @tap="go('/pages/records/RecordsPage?type=sleep')">
            <view class="quick-icon-circle">
              <text class="icon-emoji">🌙</text>
            </view>
            <text class="quick-text">睡眠</text>
          </button>
        </view>
        
        <!-- 底部按钮 -->
        <button class="big-bottom-btn" @tap="go('/pages/records/RecordsPage')">
          <text class="btn-icon-emoji">📋</text>
          <text class="btn-label">记录时间线</text>
        </button>
      </view>

      <!-- 3. 序序卡片 -->
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

/* 页面背景：浅薄荷绿 */
.page {
  background: #f5f8f6;
}

/* 1. 体重管理方案卡片：完全照搬薄荷 */
.weight-management-card {
  margin-bottom: 24rpx;
  padding: 32rpx;
  border-radius: 32rpx;
  background: #ffffff;
  box-shadow: 0 4rpx 16rpx rgba(127, 204, 143, 0.08);
}

.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28rpx;
}

.card-title-group {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.card-title {
  color: #2d6943;
  font-size: 32rpx;
  font-weight: 800;
}

.eye-icon {
  font-size: 28rpx;
  opacity: 0.6;
}

.card-week {
  color: #76907d;
  font-size: 24rpx;
  font-weight: 600;
}

.circle-progress-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
}

.progress-side {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.progress-num {
  color: #2d6943;
  font-size: 52rpx;
  font-weight: 900;
  line-height: 1;
}

.progress-text {
  color: #76907d;
  font-size: 22rpx;
}

.progress-circle-view {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 260rpx;
  height: 260rpx;
  border: 14rpx solid #e8f7ed;
  border-top-color: #7fcc8f;
  border-right-color: #7fcc8f;
  border-radius: 50%;
  background: #fafcfb;
}

.progress-center-text {
  color: #5a9572;
  font-size: 24rpx;
  font-weight: 600;
  text-align: center;
  line-height: 1.5;
}

.progress-unit-small {
  font-size: 20rpx;
}

/* 2. 今日记录大卡片：完全照搬薄荷饮食热量 */
.daily-record-big-card {
  margin-bottom: 24rpx;
  padding: 32rpx;
  border-radius: 32rpx;
  background: #ffffff;
  box-shadow: 0 4rpx 16rpx rgba(127, 204, 143, 0.08);
}

.record-badge {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, rgba(127, 204, 143, 0.15) 0%, rgba(232, 247, 237, 0.8) 100%);
}

.badge-icon {
  color: #7fcc8f;
  font-size: 20rpx;
  font-weight: 700;
}

.badge-text {
  color: #5a9572;
  font-size: 22rpx;
  font-weight: 700;
}

/* 超大数字展示区（像薄荷的1787） */
.main-data-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32rpx 0;
}

.data-label-small {
  color: #76907d;
  font-size: 24rpx;
  font-weight: 600;
  margin-bottom: 12rpx;
}

.data-big-number {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.big-num {
  color: #2d6943;
  font-size: 120rpx;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.03em;
}

.big-unit {
  color: #5a9572;
  font-size: 36rpx;
  font-weight: 700;
  margin-bottom: 12rpx;
}

/* 3个小数据（像薄荷的0饮食、0运动） */
.sub-data-row {
  display: flex;
  justify-content: space-around;
  padding: 24rpx 0;
  border-top: 2rpx solid rgba(232, 247, 237, 0.6);
  border-bottom: 2rpx solid rgba(232, 247, 237, 0.6);
  margin: 20rpx 0;
}

.sub-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.sub-label {
  color: #9ba8a0;
  font-size: 22rpx;
}

.sub-val {
  color: #5a9572;
  font-size: 28rpx;
  font-weight: 700;
}

/* 横向滑动点 */
.slide-indicator {
  display: flex;
  justify-content: center;
  gap: 12rpx;
  margin: 20rpx 0;
}

.dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #d4e8db;
  transition: all 0.3s;
}

.active-dot {
  background: #7fcc8f;
  width: 16rpx;
}

/* 5个快捷按钮横向排列（像薄荷的早午晚加运动） */
.five-quick-actions {
  display: flex;
  justify-content: space-around;
  padding: 28rpx 0;
}

.quick-circle-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 0;
  background: transparent;
  border: 0;
}

.quick-icon-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(127, 204, 143, 0.08) 0%, rgba(232, 247, 237, 0.6) 100%);
  transition: all 0.3s;
}

.quick-circle-btn:active .quick-icon-circle {
  transform: scale(0.95);
  background: linear-gradient(135deg, rgba(127, 204, 143, 0.15) 0%, rgba(232, 247, 237, 0.8) 100%);
}

.icon-emoji {
  font-size: 40rpx;
}

.quick-text {
  color: #4a6b56;
  font-size: 24rpx;
  font-weight: 600;
}

/* 底部大按钮（像薄荷的"薄荷相机"） */
.big-bottom-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  width: 100%;
  padding: 24rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, rgba(127, 204, 143, 0.12) 0%, rgba(232, 247, 237, 0.6) 100%);
  transition: all 0.3s;
}

.big-bottom-btn:active {
  transform: scale(0.98);
  background: linear-gradient(135deg, rgba(127, 204, 143, 0.18) 0%, rgba(232, 247, 237, 0.8) 100%);
}

.btn-icon-emoji {
  font-size: 28rpx;
}

.btn-label {
  color: #5a9572;
  font-size: 28rpx;
  font-weight: 700;
}

/* 3. 序序卡片：白卡片风格 */
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
