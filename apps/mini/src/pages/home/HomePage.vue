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
      <!-- 体重卡片：超大数字 -->
      <view class="weight-card hz-rise">
        <view class="weight-main">
          <text class="weight-label">体重</text>
          <view class="weight-display">
            <text v-if="today.todayRecords?.weight" class="weight-number">{{
              today.todayRecords.weight.valueKg
            }}</text>
            <text v-else class="weight-number weight-number--empty">--</text>
            <text class="weight-unit">kg</text>
          </view>
          <text v-if="today.activePlan?.healthTarget?.targetWeightKg" class="weight-target"
            >目标 {{ today.activePlan.healthTarget.targetWeightKg }}kg</text
          >
        </view>
        <button class="weight-btn" @tap="go('/pages/records/RecordsPage?type=weight')">
          <text>记录</text>
        </button>
      </view>

      <!-- 今日记录：四宫格大卡片 -->
      <view class="records-section">
        <view class="section-title">今日记录</view>
        <view class="records-grid">
          <button
            v-for="cell in overviewCells"
            :key="cell.key"
            class="record-card"
            :class="{ 'record-card--done': cell.done }"
            @tap="go(cell.route)"
          >
            <view class="record-icon-wrap">
              <image class="record-icon" :src="cell.icon" mode="aspectFit" />
              <view v-if="cell.done" class="record-check">
                <image src="/static/icons/check.svg" mode="aspectFit" />
              </view>
            </view>
            <text class="record-label">{{ cell.label }}</text>
          </button>
        </view>
      </view>

      <!-- 和序序聊聊：简洁大卡片 -->
      <button class="chat-card hz-rise hz-rise-1" @tap="toXuxu">
        <image class="chat-avatar" src="/static/illustrations/xuxu-avatar.png" mode="aspectFill" />
        <view class="chat-content">
          <text class="chat-title">和序序聊聊</text>
          <text class="chat-desc">分享今天的心情和困惑</text>
        </view>
        <image class="chat-arrow" src="/static/icons/forward.svg" mode="aspectFit" />
      </button>

      <!-- 快捷记录：更大更清晰 -->
      <view class="quick-section">
        <view class="section-title">快捷记录</view>
        <view class="quick-grid">
          <button
            v-for="item in homeQuickActions"
            :key="item.label"
            class="quick-card"
            @tap="go(item.route)"
          >
            <view class="quick-icon-wrap" :class="`tone--${item.tone}`">
              <image class="quick-icon" :src="item.icon" mode="aspectFit" />
            </view>
            <text class="quick-label">{{ item.label }}</text>
          </button>
        </view>
      </view>

      <view class="section-head"
        ><text>今天的小行动</text><text>{{ experience.tasks.length }} 项待完成</text></view
      >
      <view v-if="experience.tasks.length" class="card tasks hz-rise hz-rise-3">
        <button v-for="task in experience.tasks" :key="task.id" class="task" @tap="go(task.route)">
          <view class="task-dot" /><view class="task-copy"
            ><text>{{ task.title }}</text
            ><text>{{ task.subtitle }}</text></view
          ><image class="arrow" src="/static/icons/forward.svg" mode="aspectFit" />
        </button>
      </view>
      <view v-else class="card done hz-rise hz-rise-3"
        ><text>今天的行动已经完成</text><text>保持自己的节律就很好。</text></view
      >

      <view class="section-head"><text>管理进度</text></view>
      <view class="card card--list hz-rise hz-rise-4">
        <button class="summary-row" @tap="go('/pages/records/RecordsPage')">
          <view
            ><text>记录时间线</text><text>{{ experience.recording.message }}</text></view
          ><image class="arrow" src="/static/icons/forward.svg" mode="aspectFit" />
        </button>
        <button class="summary-row summary-row--last" @tap="toPlan">
          <view
            ><text>{{ today.activePlan ? '当前计划' : '设置计划' }}</text
            ><text>{{ planText }}</text></view
          ><image class="arrow" src="/static/icons/forward.svg" mode="aspectFit" />
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

/* 体重卡片：超大数字 */
.weight-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 52rpx 44rpx;
  margin-bottom: 28rpx;
  border-radius: 36rpx;
  background: linear-gradient(135deg, #e8f7ed 0%, #f3fbf6 100%);
  box-shadow: 0 12rpx 40rpx rgba(127, 204, 143, 0.15);
}
.weight-main {
  flex: 1;
}
.weight-label {
  display: block;
  margin-bottom: 16rpx;
  color: #5a9572;
  font-size: 28rpx;
  font-weight: 600;
}
.weight-display {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
  margin-bottom: 20rpx;
}
.weight-number {
  color: #2d6943;
  font-size: 108rpx;
  font-weight: 900;
  line-height: 0.9;
  letter-spacing: -0.03em;
}
.weight-number--empty {
  color: #a8c4b3;
  font-weight: 700;
}
.weight-unit {
  color: #5a9572;
  font-size: 36rpx;
  font-weight: 700;
  margin-bottom: 16rpx;
}
.weight-target {
  display: block;
  color: #76907d;
  font-size: 26rpx;
}
.weight-btn {
  flex: none;
  padding: 28rpx 44rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #7fcc8f 0%, #67a37b 100%);
  box-shadow: 0 10rpx 28rpx rgba(127, 204, 143, 0.35);
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 700;
  transition: all 0.25s cubic-bezier(0.22, 0.8, 0.36, 1);
}
.weight-btn:active {
  transform: scale(0.94);
  box-shadow: 0 6rpx 20rpx rgba(127, 204, 143, 0.4);
}

/* 今日记录：四宫格大卡片 */
.records-section {
  margin-bottom: 36rpx;
}
.section-title {
  margin-bottom: 24rpx;
  padding: 0 4rpx;
  color: #274a35;
  font-size: 34rpx;
  font-weight: 800;
}
.records-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}
.record-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 240rpx;
  padding: 52rpx 28rpx;
  border-radius: 36rpx;
  background: linear-gradient(135deg, #ffffff 0%, #fafcfb 100%);
  box-shadow: 0 8rpx 28rpx rgba(46, 97, 64, 0.08);
  transition: all 0.3s cubic-bezier(0.22, 0.8, 0.36, 1);
}
.record-card:active {
  transform: translateY(-6rpx) scale(0.98);
  box-shadow: 0 16rpx 40rpx rgba(46, 97, 64, 0.12);
}
.record-card--done {
  background: linear-gradient(135deg, rgba(127, 204, 143, 0.1) 0%, rgba(232, 244, 234, 0.7) 100%);
  box-shadow: 0 8rpx 28rpx rgba(127, 204, 143, 0.18);
}
.record-icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 108rpx;
  height: 108rpx;
  margin-bottom: 24rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(127, 204, 143, 0.15) 0%, rgba(232, 244, 234, 0.9) 100%);
  transition: all 0.3s ease;
}
.record-card--done .record-icon-wrap {
  background: linear-gradient(135deg, rgba(127, 204, 143, 0.25) 0%, rgba(95, 158, 118, 0.2) 100%);
  box-shadow: 0 6rpx 20rpx rgba(127, 204, 143, 0.25);
}
.record-icon {
  width: 52rpx;
  height: 52rpx;
}
.record-check {
  position: absolute;
  top: -6rpx;
  right: -6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40rpx;
  height: 40rpx;
  border: 4rpx solid #ffffff;
  border-radius: 50%;
  background: linear-gradient(135deg, #7fcc8f 0%, #67a37b 100%);
  box-shadow: 0 6rpx 16rpx rgba(127, 204, 143, 0.45);
}
.record-check image {
  width: 20rpx;
  height: 20rpx;
  filter: brightness(10);
}
.record-label {
  color: #284d36;
  font-size: 28rpx;
  font-weight: 700;
}

/* 和序序聊聊：简洁大卡片 */
.chat-card {
  display: flex;
  align-items: center;
  gap: 24rpx;
  width: 100%;
  margin-bottom: 36rpx;
  padding: 32rpx 36rpx;
  border-radius: 36rpx;
  text-align: left;
  background: linear-gradient(135deg, #fff9e6 0%, #fffdf1 100%);
  box-shadow: 0 10rpx 32rpx rgba(239, 214, 137, 0.2);
  transition: all 0.3s cubic-bezier(0.22, 0.8, 0.36, 1);
}
.chat-card:active {
  transform: translateY(-4rpx) scale(0.98);
  box-shadow: 0 16rpx 44rpx rgba(239, 214, 137, 0.28);
}
.chat-avatar {
  width: 80rpx;
  height: 80rpx;
  flex: none;
  border: 4rpx solid #f4e3a0;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(239, 214, 137, 0.35);
}
.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.chat-title {
  display: block;
  color: #6f5a27;
  font-size: 32rpx;
  font-weight: 700;
}
.chat-desc {
  display: block;
  color: #9e8a5e;
  font-size: 24rpx;
}
.chat-arrow {
  width: 32rpx;
  height: 32rpx;
  flex: none;
  opacity: 0.5;
}

/* 快捷记录：大图标 */
.quick-section {
  margin-bottom: 36rpx;
}
.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
}
.quick-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  padding: 32rpx 12rpx;
  border-radius: 32rpx;
  background: linear-gradient(135deg, #ffffff 0%, #fafcfb 100%);
  box-shadow: 0 6rpx 24rpx rgba(46, 97, 64, 0.06);
  transition: all 0.3s cubic-bezier(0.22, 0.8, 0.36, 1);
}
.quick-card:active {
  transform: translateY(-6rpx) scale(0.95);
  box-shadow: 0 12rpx 36rpx rgba(46, 97, 64, 0.12);
}
.quick-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.08);
}
.quick-icon {
  width: 48rpx;
  height: 48rpx;
}
.quick-label {
  color: #31543e;
  font-size: 24rpx;
  font-weight: 700;
  text-align: center;
}

/* 色调 */
.tone--mint {
  background: linear-gradient(135deg, #c8eddb 0%, #e3f2e4 100%);
}
.tone--amber {
  background: linear-gradient(135deg, #fde8c3 0%, #fff4dd 100%);
}
.tone--sky {
  background: linear-gradient(135deg, #c5e3f6 0%, #dff0f9 100%);
}
.tone--rose {
  background: linear-gradient(135deg, #f8d8e0 0%, #fceef1 100%);
}

/* 小行动列表 */
.card {
  overflow: hidden;
  border-radius: 36rpx;
  background: linear-gradient(135deg, #ffffff 0%, #fafcfb 100%);
  box-shadow: 0 8rpx 28rpx rgba(46, 97, 64, 0.08);
}
.tasks {
  margin-top: 4rpx;
}
.task {
  display: flex;
  align-items: center;
  gap: 20rpx;
  width: 100%;
  min-height: 112rpx;
  padding: 24rpx 32rpx;
  border-bottom: 2rpx solid rgba(238, 244, 239, 0.6);
  text-align: left;
  transition: background 0.25s ease;
}
.task:active {
  background: rgba(232, 244, 234, 0.4);
}
.task:last-child {
  border-bottom: 0;
}
.task-dot {
  width: 36rpx;
  height: 36rpx;
  flex: none;
  border: 4rpx solid #7fcc8f;
  border-radius: 50%;
  box-shadow: 0 4rpx 12rpx rgba(127, 204, 143, 0.25);
}
.task-copy {
  flex: 1;
  min-width: 0;
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
