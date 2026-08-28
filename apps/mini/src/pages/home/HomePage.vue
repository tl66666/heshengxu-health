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
      <!-- 主视觉区：参考建档页，图片完整显示 -->
      <view class="hero-fullscreen">
        <!-- 背景插画：widthFix 完整显示 -->
        <image
          class="hero-illustration"
          src="/static/illustrations/home-hero-morning.png"
          mode="widthFix"
        />
        <!-- 渐变遮罩：确保底部文字清晰 -->
        <view class="hero-gradient" />
        
        <!-- 底部浮动信息：今日摘要 -->
        <view class="hero-body">
          <view class="today-summary hz-rise">
            <view class="summary-row">
              <text class="summary-label">今日体重</text>
              <view class="summary-value-wrap">
                <text v-if="today.todayRecords?.weight" class="summary-value-num">
                  {{ today.todayRecords.weight.valueKg }}
                </text>
                <text v-else class="summary-value-num summary-value-num--empty">--</text>
                <text class="summary-value-unit">kg</text>
              </view>
            </view>
            <view class="summary-row">
              <text class="summary-label">今日进度</text>
              <text class="summary-value">{{ experience.recording.completed }}/4 已记录</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 今日行动：合并今日记录和快捷记录 -->
      <view class="actions-section">
        <view class="section-title">今日行动</view>
        <view class="actions-grid">
          <button
            v-for="cell in overviewCells"
            :key="cell.key"
            class="action-btn"
            :class="{ 'action-btn--done': cell.done }"
            @tap="go(cell.route)"
          >
            <view class="action-icon-wrap">
              <image class="action-icon" :src="cell.icon" mode="aspectFit" />
            </view>
            <text class="action-label">{{ cell.label }}</text>
            <view v-if="cell.done" class="action-badge">已记录</view>
          </button>
        </view>
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

/* 主视觉区：参考建档页，图片完整显示 */
.hero-fullscreen {
  position: relative;
  width: 100%;
  margin-bottom: 32rpx;
}

.hero-illustration {
  display: block;
  width: 100%;
  height: auto;
}

.hero-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60%;
  background: linear-gradient(
    to top,
    rgba(232, 247, 237, 0.96) 0%,
    rgba(232, 247, 237, 0.88) 35%,
    rgba(232, 247, 237, 0) 100%
  );
  pointer-events: none;
  z-index: 1;
}

.hero-body {
  position: absolute;
  bottom: 32rpx;
  left: 32rpx;
  right: 32rpx;
  z-index: 2;
}

.today-summary {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding: 32rpx 36rpx;
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(24rpx);
  box-shadow: 0 12rpx 40rpx rgba(46, 97, 64, 0.15);
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.summary-label {
  color: #5a9572;
  font-size: 26rpx;
  font-weight: 600;
}

.summary-value-wrap {
  display: flex;
  align-items: baseline;
  gap: 6rpx;
}

.summary-value-num {
  color: #2d6943;
  font-size: 48rpx;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.02em;
}

.summary-value-num--empty {
  color: #a8c4b3;
}

.summary-value-unit {
  color: #5a9572;
  font-size: 24rpx;
  font-weight: 700;
}

.summary-value {
  color: #2d6943;
  font-size: 28rpx;
  font-weight: 700;
}

/* 今日行动：2x2 大按钮 */
.actions-section {
  margin-bottom: 32rpx;
}

.section-title {
  margin-bottom: 20rpx;
  padding: 0 4rpx;
  color: #274a35;
  font-size: 30rpx;
  font-weight: 800;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.action-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 36rpx 20rpx;
  border-radius: 28rpx;
  background: linear-gradient(135deg, #ffffff 0%, #fafcfb 100%);
  box-shadow: 0 6rpx 24rpx rgba(46, 97, 64, 0.08);
  transition: all 0.3s cubic-bezier(0.22, 0.8, 0.36, 1);
}

.action-btn:active {
  transform: translateY(-4rpx) scale(0.97);
  box-shadow: 0 10rpx 32rpx rgba(46, 97, 64, 0.12);
}

.action-btn--done {
  background: linear-gradient(135deg, rgba(127, 204, 143, 0.12) 0%, rgba(232, 244, 234, 0.8) 100%);
  box-shadow: 0 6rpx 24rpx rgba(127, 204, 143, 0.18);
}

.action-icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96rpx;
  height: 96rpx;
  margin-bottom: 16rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(127, 204, 143, 0.15) 0%, rgba(232, 244, 234, 0.9) 100%);
  transition: all 0.3s ease;
}

.action-btn--done .action-icon-wrap {
  background: linear-gradient(135deg, rgba(127, 204, 143, 0.25) 0%, rgba(95, 158, 118, 0.2) 100%);
  box-shadow: 0 6rpx 20rpx rgba(127, 204, 143, 0.25);
}

.action-icon {
  width: 48rpx;
  height: 48rpx;
}

.action-label {
  color: #284d36;
  font-size: 26rpx;
  font-weight: 700;
  margin-bottom: 8rpx;
}

.action-badge {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  padding: 6rpx 12rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #7fcc8f 0%, #67a37b 100%);
  color: #ffffff;
  font-size: 20rpx;
  font-weight: 600;
  box-shadow: 0 4rpx 12rpx rgba(127, 204, 143, 0.3);
}

/* 和序序聊聊：简洁卡片 */
.chat-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  width: 100%;
  margin-bottom: 28rpx;
  padding: 28rpx 32rpx;
  border-radius: 32rpx;
  text-align: left;
  background: linear-gradient(135deg, #fff9e6 0%, #fffdf1 100%);
  box-shadow: 0 8rpx 24rpx rgba(239, 214, 137, 0.18);
  transition: all 0.3s cubic-bezier(0.22, 0.8, 0.36, 1);
}
.chat-card:active {
  transform: translateY(-3rpx) scale(0.98);
  box-shadow: 0 12rpx 32rpx rgba(239, 214, 137, 0.24);
}
.chat-avatar {
  width: 64rpx;
  height: 64rpx;
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
  font-size: 28rpx;
  font-weight: 700;
}
.chat-desc {
  display: block;
  color: #9e8a5e;
  font-size: 22rpx;
}
.chat-arrow {
  width: 28rpx;
  height: 28rpx;
  flex: none;
  opacity: 0.5;
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
