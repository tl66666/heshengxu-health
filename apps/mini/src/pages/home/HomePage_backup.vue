<template>
  <view class="page">
    <view class="head">
      <view
        ><text class="date-chip">{{ dateLabel }}</text
        ><text class="title">{{ greeting }}，{{ displayName }}</text></view
      >
      <button class="avatar-btn" @tap="toXuxu">
        <image
          class="avatar"
          src="/static/illustrations/xuxu-avatar.png"
          mode="aspectFill"
        />
        <text class="avatar-hint">和序序聊聊</text>
      </button>
    </view>

    <view v-if="loading" class="loading">正在整理今天的节律…</view>
    <template v-else-if="today && experience">
      <!-- 1. 体重管理方案卡片：缩小，半圆进度条 -->
      <view class="weight-management-card hz-rise">
        <view class="card-header-row">
          <text class="card-title-compact">体重管理</text>
          <text class="card-week">第 1 周</text>
        </view>
        
        <view class="semicircle-progress">
          <view class="progress-data-row">
            <view class="progress-data-item">
              <text class="data-num">{{
                today.activePlan?.healthTarget?.startWeightKg?.toFixed(1) || '--'
              }}</text>
              <text class="data-text">初始</text>
            </view>
            <view class="progress-data-item">
              <text class="data-num highlight">{{
                today.todayRecords?.weight?.valueKg?.toFixed(1) || '--'
              }}</text>
              <text class="data-text">当前</text>
            </view>
            <view class="progress-data-item">
              <text class="data-num">{{
                today.activePlan?.healthTarget?.targetWeightKg?.toFixed(1) || '--'
              }}</text>
              <text class="data-text">目标</text>
            </view>
          </view>
          <!-- 半圆进度条 -->
          <view class="semicircle-track">
            <view class="semicircle-fill" :style="`transform: rotate(${calculateProgress()}deg)`"></view>
          </view>
        </view>
      </view>

      <!-- 2. 饮食热量卡片：完全照搬薄荷 -->
      <view class="food-calorie-card hz-rise hz-rise-1">
        <view class="card-header-row">
          <text class="card-title">饮食热量</text>
        </view>
        
        <!-- 还可吃大数字 -->
        <view class="calorie-main">
          <text class="calorie-label">还可吃</text>
          <view class="calorie-big">
            <text class="calorie-num">1500</text>
            <text class="calorie-unit">千卡</text>
          </view>
        </view>
        
        <!-- 3个小数据 -->
        <view class="calorie-stats">
          <view class="stat-box">
            <text class="stat-val">0</text>
            <text class="stat-label">饮食</text>
          </view>
          <view class="stat-box">
            <text class="stat-val">0</text>
            <text class="stat-label">运动</text>
          </view>
        </view>
        
        <!-- 5个快捷按钮 -->
        <view class="meal-actions">
          <button class="meal-btn" @tap="go('/pages/records/RecordsPage?type=food')">
            <view class="meal-icon">
              <view class="icon-svg icon-breakfast"></view>
            </view>
            <text class="meal-text">早餐</text>
          </button>
          <button class="meal-btn" @tap="go('/pages/records/RecordsPage?type=food')">
            <view class="meal-icon">
              <view class="icon-svg icon-lunch"></view>
            </view>
            <text class="meal-text">午餐</text>
          </button>
          <button class="meal-btn" @tap="go('/pages/records/RecordsPage?type=food')">
            <view class="meal-icon">
              <view class="icon-svg icon-dinner"></view>
            </view>
            <text class="meal-text">晚餐</text>
          </button>
          <button class="meal-btn" @tap="go('/pages/records/RecordsPage?type=food')">
            <view class="meal-icon">
              <view class="icon-svg icon-snack"></view>
            </view>
            <text class="meal-text">加餐</text>
          </button>
          <button class="meal-btn" @tap="go('/pages/records/RecordsPage?type=activity')">
            <view class="meal-icon">
              <view class="icon-svg icon-exercise"></view>
            </view>
            <text class="meal-text">运动</text>
          </button>
        </view>
        
        <!-- 底部按钮：序序相机 -->
        <button class="camera-btn" @tap="toXuxu">
          <view class="camera-icon"></view>
          <text class="camera-text">序序相机</text>
        </button>
      </view>

      <!-- 3. 体重记录卡片 -->
      <view class="weight-record-card hz-rise hz-rise-2">
        <view class="card-header-row">
          <view class="title-with-time">
            <text class="card-title">体重记录</text>
            <text v-if="today.todayRecords?.weight" class="update-time">
              {{ new Date(today.todayRecords.weight.recordedAt).toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'}) }} 更新
            </text>
          </view>
          <button class="add-round-btn" @tap="go('/pages/records/RecordsPage?type=weight')">+</button>
        </view>
        
        <view class="weight-display-row">
          <view class="weight-value-large">
            <text class="large-num">{{
              today.todayRecords?.weight?.valueKg?.toFixed(2) || '--'
            }}</text>
            <text class="large-unit">公斤</text>
          </view>
          <view class="mini-chart"></view>
        </view>
      </view>

      <!-- 4. 2x2功能卡片区域（参考图2） -->
      <view class="feature-grid hz-rise hz-rise-3">
        <!-- 水分记录 -->
        <button class="feature-card" @tap="go('/pages/records/RecordsPage?type=water')">
          <view class="feature-header">
            <text class="feature-title">喝水</text>
            <view class="feature-add-btn">+</view>
          </view>
          <view class="feature-body">
            <text class="feature-value">0</text>
            <text class="feature-unit">毫升</text>
          </view>
          <view class="feature-icon icon-water-large"></view>
        </button>
        
        <!-- 睡眠记录 -->
        <button class="feature-card" @tap="go('/pages/records/RecordsPage?type=sleep')">
          <view class="feature-header">
            <text class="feature-title">睡眠</text>
            <view class="feature-add-btn">+</view>
          </view>
          <view class="feature-body">
            <text class="feature-hint">没有记录</text>
          </view>
          <view class="feature-icon icon-sleep-large"></view>
        </button>
        
        <!-- 活动记录 -->
        <button class="feature-card" @tap="go('/pages/records/RecordsPage?type=activity')">
          <view class="feature-header">
            <text class="feature-title">活动</text>
            <view class="feature-add-btn">+</view>
          </view>
          <view class="feature-body">
            <text class="feature-value">{{
              today.todayRecords?.activity?.durationMin || 0
            }}</text>
            <text class="feature-unit">分钟</text>
          </view>
          <view class="feature-icon icon-activity-large"></view>
        </button>
        
        <!-- 心情记录 -->
        <button class="feature-card" @tap="toXuxu">
          <view class="feature-header">
            <text class="feature-title">心情</text>
          </view>
          <view class="feature-body">
            <text class="feature-hint">记录今天</text>
          </view>
          <view class="feature-icon icon-mood-large"></view>
        </button>
      </view>

      <!-- 5. 轻断食卡片（参考图2） -->
      <view class="intermittent-fasting-card hz-rise hz-rise-4">
        <view class="card-header-row">
          <text class="card-title">轻断食</text>
          <view class="if-badge">16:8模式</view>
        </view>
        <view class="if-body">
          <text class="if-label">用餐时间剩余</text>
          <text class="if-countdown">01:04:08</text>
        </view>
        <view class="if-icon"></view>
      </view>

      <!-- 6. 血糖卡片 -->
      <view class="blood-sugar-card hz-rise hz-rise-5">
        <view class="card-header-row">
          <text class="card-title">血糖</text>
          <button class="add-round-btn" @tap="go('/pages/records/RecordsPage?type=blood-sugar')">+</button>
        </view>
        <view class="bs-body">
          <text class="bs-hint">暂无记录</text>
          <text class="bs-value">-- mmol/L</text>
        </view>
        <view class="bs-icon"></view>
      </view>

      <!-- 7. 编辑首页卡片（虚线框） -->
      <button class="edit-home-card hz-rise hz-rise-6" @tap="go('/pages/home/edit-cards')">
        <view class="edit-icon">✎</view>
        <text class="edit-text">编辑首页卡片</text>
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
      icon: '/static/icons/svg/scale.svg',
      tone: 'mint',
      route: '/pages/records/RecordsPage?type=weight',
    },
    {
      key: 'meal',
      label: '饮食',
      done: progress.hasMeal,
      icon: '/static/icons/svg/meal.svg',
      tone: 'amber',
      route: '/pages/records/RecordsPage?type=meal-structure',
    },
    {
      key: 'activity',
      label: '活动',
      done: progress.hasActivity,
      icon: '/static/icons/svg/activity.svg',
      tone: 'blush',
      route: '/pages/records/RecordsPage?type=activity',
    },
    {
      key: 'sleep',
      label: '睡眠',
      done: progress.hasSleep,
      icon: '/static/icons/svg/sleep.svg',
      tone: 'sky',
      route: '/pages/records/RecordsPage?type=sleep',
    },
  ];
});

// 计算进度条角度（半圆180度）
const calculateProgress = () => {
  if (!today.value?.todayRecords?.weight || !today.value?.activePlan?.healthTarget) {
    return 0;
  }
  const start = today.value.activePlan.healthTarget.startWeightKg;
  const current = today.value.todayRecords.weight.valueKg;
  const target = today.value.activePlan.healthTarget.targetWeightKg;
  
  if (start === target) return 0;
  
  const progress = (start - current) / (start - target);
  const clampedProgress = Math.max(0, Math.min(1, progress));
  return clampedProgress * 180; // 180度半圆
};

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
/* 页面背景 */
.page {
  background: #f5f8f6;
  min-height: 100vh;
  padding: 32rpx;
  padding-bottom: 200rpx; /* 修复：增加底部padding */
}

/* 顶部样式 */
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.date-chip {
  display: inline-block;
  padding: 6rpx 16rpx;
  margin-bottom: 8rpx;
  border-radius: 999rpx;
  background: rgba(127, 204, 143, 0.12);
  color: #5a9572;
  font-size: 22rpx;
  font-weight: 600;
}

.title {
  display: block;
  color: #2d6943;
  font-size: 36rpx;
  font-weight: 800;
}

.avatar-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
  padding: 0;
  background: transparent;
  border: 0;
}

.avatar {
  width: 72rpx;
  height: 72rpx;
  border: 3rpx solid #7fcc8f;
  border-radius: 50%;
}

.avatar-hint {
  color: #76907d;
  font-size: 20rpx;
  font-weight: 600;
}

.loading {
  padding: 120rpx 32rpx;
  text-align: center;
  color: #9ba8a0;
  font-size: 28rpx;
}

/* 1. 体重管理卡片 */
.weight-management-card {
  margin-bottom: 20rpx;
  padding: 24rpx 28rpx 20rpx;
  border-radius: 28rpx;
  background: #ffffff;
  box-shadow: 0 4rpx 16rpx rgba(127, 204, 143, 0.08);
}

.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.card-title-compact {
  color: #2d6943;
  font-size: 28rpx;
  font-weight: 800;
}

.card-title {
  color: #2d6943;
  font-size: 32rpx;
  font-weight: 800;
}

.card-week {
  color: #76907d;
  font-size: 22rpx;
  font-weight: 600;
}

.semicircle-progress {
  position: relative;
  padding: 16rpx 0 0;
}

.progress-data-row {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20rpx;
}

.progress-data-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
}

.data-num {
  color: #5a9572;
  font-size: 36rpx;
  font-weight: 900;
  line-height: 1;
}

.data-num.highlight {
  color: #2d6943;
  font-size: 44rpx;
}

.data-text {
  color: #9ba8a0;
  font-size: 20rpx;
}

.semicircle-track {
  position: relative;
  width: 200rpx;
  height: 100rpx;
  margin: 0 auto;
  overflow: hidden;
}

.semicircle-track::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 200rpx;
  height: 100rpx;
  border: 12rpx solid #e8f7ed;
  border-radius: 200rpx 200rpx 0 0;
  border-bottom: 0;
}

.semicircle-fill {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 200rpx;
  height: 100rpx;
  transform-origin: 50% 100%;
  transform: translateX(-50%) rotate(0deg);
  transition: transform 0.6s ease;
}

.semicircle-fill::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 200rpx;
  height: 100rpx;
  border: 12rpx solid #7fcc8f;
  border-radius: 200rpx 200rpx 0 0;
  border-bottom: 0;
  border-right-color: transparent;
}

/* 2. 饮食热量卡片 - 缩小 */
.food-calorie-card {
  margin-bottom: 20rpx;
  padding: 28rpx; /* 从32rpx缩小 */
  border-radius: 28rpx;
  background: #ffffff;
  box-shadow: 0 4rpx 16rpx rgba(127, 204, 143, 0.08);
}

.calorie-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 0 24rpx; /* 从24rpx 0 32rpx缩小 */
}

.calorie-label {
  color: #76907d;
  font-size: 22rpx; /* 从24rpx缩小 */
  font-weight: 600;
  margin-bottom: 10rpx; /* 从12rpx缩小 */
}

.calorie-big {
  display: flex;
  align-items: baseline;
  gap: 6rpx;
}

.calorie-num {
  color: #2d6943;
  font-size: 80rpx; /* 从96rpx缩小 */
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.03em;
}

.calorie-unit {
  color: #5a9572;
  font-size: 28rpx; /* 从32rpx缩小 */
  font-weight: 700;
  margin-bottom: 8rpx;
}

.calorie-stats {
  display: flex;
  justify-content: center;
  gap: 32rpx;
  padding: 20rpx 0;
  margin-bottom: 24rpx;
}

.stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 32rpx;
  border-radius: 16rpx;
  background: rgba(232, 247, 237, 0.4);
}

.stat-val {
  color: #2d6943;
  font-size: 36rpx;
  font-weight: 900;
}

.stat-label {
  color: #9ba8a0;
  font-size: 22rpx;
}

.meal-actions {
  display: flex;
  justify-content: space-around;
  padding: 20rpx 0;
  margin-bottom: 20rpx;
}

.meal-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  padding: 0;
  background: transparent;
  border: 0;
}

.meal-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(127, 204, 143, 0.08) 0%, rgba(232, 247, 237, 0.6) 100%);
}

.meal-text {
  color: #4a6b56;
  font-size: 22rpx;
  font-weight: 600;
}

/* CSS图标 */
.icon-svg {
  width: 36rpx;
  height: 36rpx;
  position: relative;
}

.icon-breakfast {
  width: 28rpx;
  height: 32rpx;
  border: 3rpx solid #7fcc8f;
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  background: linear-gradient(180deg, rgba(127, 204, 143, 0.2) 0%, rgba(127, 204, 143, 0.1) 100%);
}

.icon-lunch {
  width: 32rpx;
  height: 28rpx;
  border: 3rpx solid #7fcc8f;
  border-radius: 8rpx;
  background: linear-gradient(180deg, rgba(127, 204, 143, 0.2) 0%, rgba(127, 204, 143, 0.1) 100%);
}

.icon-dinner {
  width: 28rpx;
  height: 28rpx;
  border: 3rpx solid #7fcc8f;
  border-radius: 0 0 50% 50%;
  border-top: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(127, 204, 143, 0.2) 100%);
}

.icon-snack {
  width: 24rpx;
  height: 28rpx;
  border: 3rpx solid #7fcc8f;
  border-radius: 50% 50% 40% 60%;
  background: linear-gradient(135deg, rgba(127, 204, 143, 0.2) 0%, rgba(127, 204, 143, 0.1) 100%);
}

.icon-exercise {
  width: 32rpx;
  height: 36rpx;
}

.icon-exercise::before {
  content: '';
  position: absolute;
  width: 12rpx;
  height: 12rpx;
  border: 3rpx solid #7fcc8f;
  border-radius: 50%;
  top: 0;
  left: 6rpx;
}

.icon-exercise::after {
  content: '';
  position: absolute;
  width: 3rpx;
  height: 20rpx;
  background: #7fcc8f;
  top: 12rpx;
  left: 10rpx;
  border-radius: 2rpx;
  transform: rotate(10deg);
}

.camera-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  width: 100%;
  padding: 20rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, rgba(127, 204, 143, 0.12) 0%, rgba(232, 247, 237, 0.6) 100%);
  transition: all 0.3s;
}

.camera-btn:active {
  transform: scale(0.98);
}

.camera-icon {
  width: 24rpx;
  height: 20rpx;
  border: 3rpx solid #7fcc8f;
  border-radius: 6rpx;
  position: relative;
}

.camera-icon::before {
  content: '';
  position: absolute;
  width: 8rpx;
  height: 8rpx;
  border: 2rpx solid #7fcc8f;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.camera-text {
  color: #5a9572;
  font-size: 26rpx;
  font-weight: 700;
}

/* 3. 体重记录卡片 */
.weight-record-card {
  margin-bottom: 20rpx;
  padding: 28rpx 32rpx;
  border-radius: 28rpx;
  background: #ffffff;
  box-shadow: 0 4rpx 16rpx rgba(127, 204, 143, 0.08);
}

.title-with-time {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.update-time {
  color: #9ba8a0;
  font-size: 22rpx;
}

.add-round-btn {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(127, 204, 143, 0.12) 0%, rgba(232, 247, 237, 0.6) 100%);
  color: #7fcc8f;
  font-size: 32rpx;
  font-weight: 300;
  line-height: 52rpx;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.weight-display-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16rpx;
}

.weight-value-large {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.large-num {
  color: #2d6943;
  font-size: 64rpx;
  font-weight: 900;
  line-height: 1;
}

.large-unit {
  color: #76907d;
  font-size: 26rpx;
  font-weight: 600;
}

.mini-chart {
  width: 180rpx;
  height: 70rpx;
  border: 2rpx solid #e8f7ed;
  border-radius: 12rpx;
  background: linear-gradient(135deg, rgba(127, 204, 143, 0.05) 0%, rgba(232, 247, 237, 0.3) 100%);
  position: relative;
  overflow: hidden;
}

.mini-chart::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 2rpx;
  background: linear-gradient(90deg, transparent 0%, #7fcc8f 20%, #7fcc8f 80%, transparent 100%);
  top: 50%;
  left: 0;
  transform: translateY(-50%);
}

/* 4. 2x2功能卡片 */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.feature-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 24rpx 20rpx;
  min-height: 160rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 4rpx 16rpx rgba(127, 204, 143, 0.08);
  text-align: left;
  overflow: hidden;
  transition: all 0.3s;
}

.feature-card:active {
  transform: scale(0.97);
}

.feature-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.feature-title {
  color: #2d6943;
  font-size: 26rpx;
  font-weight: 700;
}

.feature-add-btn {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(127, 204, 143, 0.12) 0%, rgba(232, 247, 237, 0.6) 100%);
  color: #7fcc8f;
  font-size: 28rpx;
  font-weight: 300;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-body {
  display: flex;
  align-items: baseline;
  gap: 6rpx;
  margin-bottom: 12rpx;
}

.feature-value {
  color: #2d6943;
  font-size: 48rpx;
  font-weight: 900;
  line-height: 1;
}

.feature-unit {
  color: #76907d;
  font-size: 22rpx;
  font-weight: 600;
}

.feature-hint {
  color: #9ba8a0;
  font-size: 22rpx;
}

.feature-icon {
  position: absolute;
  bottom: 16rpx;
  right: 16rpx;
  width: 60rpx;
  height: 60rpx;
  opacity: 0.3;
}

.icon-water-large {
  width: 40rpx;
  height: 56rpx;
  border: 4rpx solid #7fcc8f;
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  background: linear-gradient(180deg, rgba(165, 216, 243, 0.2) 0%, rgba(127, 204, 143, 0.2) 100%);
}

.icon-sleep-large {
  width: 48rpx;
  height: 54rpx;
  border: 4rpx solid #C5B8E8;
  border-radius: 50%;
  border-right-color: transparent;
  background: linear-gradient(90deg, rgba(197, 184, 232, 0.2) 0%, transparent 100%);
}

.icon-activity-large {
  width: 54rpx;
  height: 60rpx;
}

.icon-activity-large::before {
  content: '';
  position: absolute;
  width: 20rpx;
  height: 20rpx;
  border: 4rpx solid #7fcc8f;
  border-radius: 50%;
  top: 0;
  left: 10rpx;
}

.icon-activity-large::after {
  content: '';
  position: absolute;
  width: 4rpx;
  height: 32rpx;
  background: #7fcc8f;
  top: 20rpx;
  left: 18rpx;
  border-radius: 2rpx;
  transform: rotate(15deg);
}

.icon-mood-large {
  width: 50rpx;
  height: 50rpx;
  border: 4rpx solid #f4a460;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(244, 164, 96, 0.2) 0%, rgba(244, 164, 96, 0.1) 100%);
  position: relative;
}

.icon-mood-large::before {
  content: '';
  position: absolute;
  width: 16rpx;
  height: 8rpx;
  border: 3rpx solid #f4a460;
  border-top: 0;
  border-radius: 0 0 16rpx 16rpx;
  bottom: 12rpx;
  left: 50%;
  transform: translateX(-50%);
}

.load-failed {
  padding: 80rpx 32rpx;
  text-align: center;
}

.load-failed text {
  display: block;
  color: #9ba8a0;
  font-size: 26rpx;
  margin-bottom: 12rpx;
}

.load-failed button {
  margin-top: 24rpx;
  padding: 16rpx 32rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, rgba(127, 204, 143, 0.12) 0%, rgba(232, 247, 237, 0.6) 100%);
  color: #5a9572;
  font-size: 26rpx;
  font-weight: 700;
}

@keyframes hz-rise {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
}

.hz-rise {
  animation: hz-rise 0.6s cubic-bezier(0.22, 0.8, 0.36, 1) both;
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

.hz-rise-4 {
  animation-delay: 0.4s;
}

.hz-rise-5 {
  animation-delay: 0.5s;
}

.hz-rise-6 {
  animation-delay: 0.6s;
}

/* 5. 轻断食卡片 */
.intermittent-fasting-card {
  margin-bottom: 20rpx;
  padding: 28rpx 32rpx;
  border-radius: 28rpx;
  background: #ffffff;
  box-shadow: 0 4rpx 16rpx rgba(127, 204, 143, 0.08);
  position: relative;
  overflow: hidden;
}

.if-badge {
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, rgba(100, 149, 237, 0.15) 0%, rgba(135, 206, 250, 0.1) 100%);
  color: #5a8fd6;
  font-size: 20rpx;
  font-weight: 700;
}

.if-body {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-top: 20rpx;
}

.if-label {
  color: #9ba8a0;
  font-size: 22rpx;
}

.if-countdown {
  color: #2d6943;
  font-size: 52rpx;
  font-weight: 900;
  font-family: 'Courier New', monospace;
  letter-spacing: 2rpx;
}

.if-icon {
  position: absolute;
  bottom: 20rpx;
  right: 20rpx;
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid rgba(100, 149, 237, 0.3);
  border-radius: 50%;
  opacity: 0.3;
}

.if-icon::before {
  content: '';
  position: absolute;
  width: 3rpx;
  height: 24rpx;
  background: rgba(100, 149, 237, 0.5);
  top: 8rpx;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 2rpx;
}

/* 6. 血糖卡片 */
.blood-sugar-card {
  margin-bottom: 20rpx;
  padding: 28rpx 32rpx;
  border-radius: 28rpx;
  background: #ffffff;
  box-shadow: 0 4rpx 16rpx rgba(127, 204, 143, 0.08);
  position: relative;
  overflow: hidden;
}

.bs-body {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-top: 16rpx;
}

.bs-hint {
  color: #9ba8a0;
  font-size: 22rpx;
}

.bs-value {
  color: #2d6943;
  font-size: 40rpx;
  font-weight: 900;
}

.bs-icon {
  position: absolute;
  bottom: 20rpx;
  right: 20rpx;
  width: 50rpx;
  height: 56rpx;
  border: 4rpx solid rgba(220, 100, 100, 0.3);
  border-radius: 12rpx;
  opacity: 0.3;
}

.bs-icon::before {
  content: '';
  position: absolute;
  width: 8rpx;
  height: 8rpx;
  background: rgba(220, 100, 100, 0.5);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 7. 编辑首页卡片 */
.edit-home-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  width: 100%;
  padding: 40rpx 32rpx;
  margin-bottom: 20rpx;
  border: 3rpx dashed #c8e6d0;
  border-radius: 28rpx;
  background: transparent;
  transition: all 0.3s;
}

.edit-home-card:active {
  transform: scale(0.98);
  border-color: #7fcc8f;
  background: rgba(232, 247, 237, 0.3);
}

.edit-icon {
  font-size: 44rpx;
  color: #7fcc8f;
}

.edit-text {
  color: #5a9572;
  font-size: 26rpx;
  font-weight: 700;
}
</style>
