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
      <!-- 1. 体重管理方案卡片 -->
      <view class="weight-management-card hz-rise">
        <view class="card-header-row">
          <view class="card-title-group">
            <text class="card-title">体重管理方案</text>
            <view class="eye-icon-svg"></view>
          </view>
          <text class="card-week">第 1 周</text>
        </view>
        
        <view class="circle-progress-wrapper">
          <view class="progress-side">
            <text class="progress-num">{{
              today.activePlan?.healthTarget?.startWeightKg?.toFixed(2) || '--'
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
              today.activePlan?.healthTarget?.targetWeightKg?.toFixed(2) || '--'
            }}</text>
            <text class="progress-text">目标</text>
          </view>
        </view>
      </view>

      <!-- 2. 今日记录大卡片 -->
      <view class="daily-record-big-card hz-rise hz-rise-1">
        <view class="card-header-row">
          <text class="card-title">今日记录</text>
          <view class="record-badge">
            <text class="badge-check">✓</text>
            <text class="badge-text">{{ experience.recording.completed }}/4</text>
          </view>
        </view>
        
        <!-- 当前体重大数字 -->
        <view class="main-data-display">
          <text class="data-label-small">当前体重</text>
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
              today.todayRecords?.food ? '1' : '0'
            }}/3</text>
          </view>
          <view class="sub-item">
            <text class="sub-label">活动</text>
            <text class="sub-val">{{
              today.todayRecords?.activity?.durationMin || 0
            }}分钟</text>
          </view>
        </view>
        
        <!-- 5个快捷按钮：用CSS绘制精致图标 -->
        <view class="five-quick-actions">
          <button class="quick-circle-btn" @tap="go('/pages/records/RecordsPage?type=weight')">
            <view class="quick-icon-circle">
              <view class="icon-svg icon-weight"></view>
            </view>
            <text class="quick-text">体重</text>
          </button>
          <button class="quick-circle-btn" @tap="go('/pages/records/RecordsPage?type=food')">
            <view class="quick-icon-circle">
              <view class="icon-svg icon-food"></view>
            </view>
            <text class="quick-text">饮食</text>
          </button>
          <button class="quick-circle-btn" @tap="go('/pages/records/RecordsPage?type=water')">
            <view class="quick-icon-circle">
              <view class="icon-svg icon-water"></view>
            </view>
            <text class="quick-text">水</text>
          </button>
          <button class="quick-circle-btn" @tap="go('/pages/records/RecordsPage?type=activity')">
            <view class="quick-icon-circle">
              <view class="icon-svg icon-activity"></view>
            </view>
            <text class="quick-text">活动</text>
          </button>
          <button class="quick-circle-btn" @tap="go('/pages/records/RecordsPage?type=sleep')">
            <view class="quick-icon-circle">
              <view class="icon-svg icon-sleep"></view>
            </view>
            <text class="quick-text">睡眠</text>
          </button>
        </view>
        
        <!-- 底部按钮 -->
        <button class="big-bottom-btn" @tap="go('/pages/records/RecordsPage')">
          <view class="btn-icon-svg"></view>
          <text class="btn-label">记录时间线</text>
        </button>
      </view>

      <!-- 3. 体重记录卡片（参考图1） -->
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

      <!-- 4. 序序陪伴卡片（参考图2的轻断食卡片） -->
      <view class="companion-big-card hz-rise hz-rise-3">
        <view class="card-header-row">
          <text class="card-title">序序陪伴</text>
        </view>
        <button class="companion-content" @tap="toXuxu">
          <image class="companion-avatar" src="/static/illustrations/xuxu-avatar.png" mode="aspectFill" />
          <view class="companion-text">
            <text class="companion-title">和序序聊聊</text>
            <text class="companion-desc">分享今天的心情和困惑</text>
          </view>
          <image class="companion-arrow" src="/static/icons/forward.svg" mode="aspectFit" />
        </button>
      </view>
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

/* 页面背景 */
.page {
  background: #f5f8f6;
}

/* 1. 体重管理方案卡片 */
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

/* CSS绘制眼睛图标 */
.eye-icon-svg {
  width: 28rpx;
  height: 16rpx;
  border: 3rpx solid #7fcc8f;
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  position: relative;
  opacity: 0.6;
}

.eye-icon-svg::after {
  content: '';
  position: absolute;
  width: 8rpx;
  height: 8rpx;
  background: #7fcc8f;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
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

/* 2. 今日记录大卡片 */
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

.badge-check {
  color: #7fcc8f;
  font-size: 20rpx;
  font-weight: 700;
}

.badge-text {
  color: #5a9572;
  font-size: 22rpx;
  font-weight: 700;
}

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

/* 5个快捷按钮 */
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

/* CSS绘制图标 */
.icon-svg {
  width: 44rpx;
  height: 44rpx;
  position: relative;
}

/* 体重秤图标 */
.icon-weight {
  border: 3rpx solid #7fcc8f;
  border-radius: 8rpx;
  background: linear-gradient(180deg, rgba(127, 204, 143, 0.1) 0%, rgba(127, 204, 143, 0.2) 100%);
}

.icon-weight::after {
  content: '';
  position: absolute;
  width: 20rpx;
  height: 3rpx;
  background: #7fcc8f;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 2rpx;
}

/* 饮食碗图标 */
.icon-food {
  border: 3rpx solid #7fcc8f;
  border-radius: 0 0 50% 50%;
  border-top: 0;
  background: linear-gradient(180deg, rgba(127, 204, 143, 0.1) 0%, rgba(127, 204, 143, 0.2) 100%);
}

.icon-food::before {
  content: '';
  position: absolute;
  width: 3rpx;
  height: 20rpx;
  background: #7fcc8f;
  top: -8rpx;
  left: 8rpx;
  border-radius: 2rpx;
}

.icon-food::after {
  content: '';
  position: absolute;
  width: 3rpx;
  height: 20rpx;
  background: #7fcc8f;
  top: -8rpx;
  right: 8rpx;
  border-radius: 2rpx;
}

/* 水滴图标 */
.icon-water {
  width: 32rpx;
  height: 44rpx;
  border: 3rpx solid #7fcc8f;
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  background: linear-gradient(180deg, rgba(165, 216, 243, 0.2) 0%, rgba(127, 204, 143, 0.2) 100%);
}

/* 跑步图标 */
.icon-activity {
  width: 40rpx;
  height: 44rpx;
}

.icon-activity::before {
  content: '';
  position: absolute;
  width: 16rpx;
  height: 16rpx;
  border: 3rpx solid #7fcc8f;
  border-radius: 50%;
  top: 0;
  left: 8rpx;
}

.icon-activity::after {
  content: '';
  position: absolute;
  width: 3rpx;
  height: 24rpx;
  background: #7fcc8f;
  top: 16rpx;
  left: 14rpx;
  border-radius: 2rpx;
  transform: rotate(15deg);
}

/* 月亮图标 */
.icon-sleep {
  width: 36rpx;
  height: 40rpx;
  border: 3rpx solid #C5B8E8;
  border-radius: 50%;
  border-right-color: transparent;
  background: linear-gradient(90deg, rgba(197, 184, 232, 0.2) 0%, transparent 100%);
}

.quick-text {
  color: #4a6b56;
  font-size: 24rpx;
  font-weight: 600;
}

/* 底部按钮 */
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
}

.btn-icon-svg {
  width: 28rpx;
  height: 28rpx;
  border: 3rpx solid #7fcc8f;
  border-radius: 6rpx;
  position: relative;
}

.btn-icon-svg::before {
  content: '';
  position: absolute;
  width: 18rpx;
  height: 3rpx;
  background: #7fcc8f;
  top: 6rpx;
  left: 2rpx;
  border-radius: 2rpx;
}

.btn-icon-svg::after {
  content: '';
  position: absolute;
  width: 18rpx;
  height: 3rpx;
  background: #7fcc8f;
  top: 14rpx;
  left: 2rpx;
  border-radius: 2rpx;
}

.btn-label {
  color: #5a9572;
  font-size: 28rpx;
  font-weight: 700;
}

/* 3. 体重记录卡片 */
.weight-record-card {
  margin-bottom: 24rpx;
  padding: 32rpx;
  border-radius: 32rpx;
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
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(127, 204, 143, 0.12) 0%, rgba(232, 247, 237, 0.6) 100%);
  color: #7fcc8f;
  font-size: 36rpx;
  font-weight: 300;
  line-height: 56rpx;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.weight-display-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20rpx;
}

.weight-value-large {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.large-num {
  color: #2d6943;
  font-size: 72rpx;
  font-weight: 900;
  line-height: 1;
}

.large-unit {
  color: #76907d;
  font-size: 28rpx;
  font-weight: 600;
}

.mini-chart {
  width: 200rpx;
  height: 80rpx;
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
  height: 3rpx;
  background: linear-gradient(90deg, transparent 0%, #7fcc8f 20%, #7fcc8f 80%, transparent 100%);
  top: 50%;
  left: 0;
  transform: translateY(-50%);
}

/* 4. 序序陪伴卡片 */
.companion-big-card {
  margin-bottom: 24rpx;
  padding: 32rpx;
  border-radius: 32rpx;
  background: #ffffff;
  box-shadow: 0 4rpx 16rpx rgba(127, 204, 143, 0.08);
}

.companion-content {
  display: flex;
  align-items: center;
  gap: 20rpx;
  width: 100%;
  padding: 24rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, rgba(255, 249, 230, 0.4) 0%, rgba(255, 253, 241, 0.2) 100%);
  border: 2rpx solid rgba(244, 227, 160, 0.3);
  text-align: left;
  transition: all 0.3s;
}

.companion-content:active {
  transform: scale(0.98);
  background: linear-gradient(135deg, rgba(255, 249, 230, 0.6) 0%, rgba(255, 253, 241, 0.4) 100%);
}

.companion-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  border: 3rpx solid #f4e3a0;
  flex: none;
}

.companion-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.companion-title {
  color: #6f5a27;
  font-size: 28rpx;
  font-weight: 700;
}

.companion-desc {
  color: #9e8a5e;
  font-size: 22rpx;
}

.companion-arrow {
  width: 28rpx;
  height: 28rpx;
  opacity: 0.4;
  flex: none;
}

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
