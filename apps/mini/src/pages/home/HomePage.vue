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
      <!-- 体重卡片：薄荷风格 -->
      <view class="weight-card hz-rise">
        <view class="weight-header">
          <view class="weight-title-group">
            <text class="weight-label">当前体重</text>
            <text v-if="today.todayRecords?.weight" class="weight-value"
              >{{ today.todayRecords.weight.valueKg }}<text class="weight-unit">kg</text></text
            >
            <text v-else class="weight-empty">未记录</text>
          </view>
          <button class="weight-record-btn" @tap="go('/pages/records/RecordsPage?type=weight')">
            <image src="/static/icons/add.svg" class="btn-icon" mode="aspectFit" />
            <text>记录</text>
          </button>
        </view>
        <view v-if="today.todayRecords?.weight" class="weight-meta">
          <text class="meta-item">记录于 {{ formatTime(today.todayRecords.weight.recordedAt) }}</text>
          <text v-if="today.activePlan?.healthTarget?.targetWeightKg" class="meta-item"
            >目标: {{ today.activePlan.healthTarget.targetWeightKg }}kg</text
          >
        </view>
        <view v-else class="weight-prompt">
          <text>开始记录体重，追踪你的健康节律</text>
        </view>
      </view>

      <!-- 今日概览：只呈现真实记录状态，点击直达对应记录表单 -->
      <button class="overview hz-rise" @tap="go('/pages/records/RecordsPage')">
        <view class="overview-head">
          <text class="overview-title">今日概览</text>
          <text class="overview-count">{{ experience.recording.completed }}/4 已记录</text>
        </view>
        <view class="overview-track"
          ><view
            class="overview-fill"
            :style="{ width: `${(experience.recording.completed / 4) * 100}%` }"
        /></view>
        <view class="cells">
          <button
            v-for="cell in overviewCells"
            :key="cell.key"
            class="cell"
            @tap.stop="go(cell.route)"
          >
            <view class="cell-tile" :class="[`tone--${cell.tone}`, { 'tile--done': cell.done }]">
              <image :src="cell.icon" mode="aspectFit" />
              <view v-if="cell.done" class="cell-badge">
                <image src="/static/icons/check.svg" mode="aspectFit" />
              </view>
            </view>
            <text class="cell-label">{{ cell.label }}</text>
            <text class="cell-state" :class="{ 'cell-state--done': cell.done }">
              {{ cell.done ? '已记' : '待记' }}
            </text>
          </button>
        </view>
      </button>

      <!-- 今日主行动：整卡可进入，不再重复展示标题行；主视觉按天轮换且完整显示 -->
      <view class="hero-host hz-rise hz-rise-1" @tap="go(experience.hero.route)">
        <IllustratedHero
          :image="heroArt.image"
          :copy-side="heroArt.copySide"
          :alt="heroArt.alt"
          :eyebrow="experience.hero.eyebrow"
          :title="experience.hero.title"
          :description="experience.hero.description"
        />
      </view>

      <button class="chat-entry hz-rise hz-rise-2" @tap="toXuxu">
        <image class="chat-avatar" src="/static/illustrations/xuxu-avatar.png" mode="aspectFill" />
        <view><text>和序序聊聊</text><text>把今天的困惑说给序序听</text></view>
        <image class="arrow" src="/static/icons/forward.svg" mode="aspectFit" />
      </button>

      <view class="section-head"><text>快捷记录</text></view>
      <view class="quick-grid hz-rise hz-rise-2">
        <button
          v-for="item in homeQuickActions"
          :key="item.label"
          class="quick-action"
          @tap="go(item.route)"
        >
          <view class="quick-icon" :class="`tone--${item.tone}`">
            <image :src="item.icon" mode="aspectFit" />
          </view>
          <text>{{ item.label }}</text>
          <text>{{ item.detail }}</text>
        </button>
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
.page {
  min-height: 100vh;
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;
  padding: 44rpx 32rpx calc(var(--hz-tabbar-height) + env(safe-area-inset-bottom) + 44rpx);
  background: #f6faf7;
  color: #183425;
}
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 26rpx;
}
.date-chip,
.title,
.overview-title,
.overview-count,
.cell-label,
.cell-state,
.quick-action text,
.task-copy text,
.done text,
.summary-row text,
.chat-entry text,
.load-failed text {
  display: block;
}
.date-chip {
  align-self: flex-start;
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  color: #4c7d5a;
  background: #e3f2e4;
  font-size: 20rpx;
  font-weight: 600;
}
.title {
  margin-top: 12rpx;
  font-size: 42rpx;
  font-weight: 700;
}
.avatar {
  width: 84rpx;
  height: 84rpx;
  border: 3rpx solid #efd98d;
  border-radius: 50%;
  box-shadow: 0 6rpx 14rpx rgba(90, 74, 27, 0.14);
}
.card {
  overflow: hidden;
  border-radius: 32rpx;
  background: linear-gradient(135deg, #ffffff 0%, #fafcfb 100%);
  box-shadow:
    0 8rpx 28rpx rgba(46, 97, 64, 0.08),
    0 2rpx 8rpx rgba(127, 204, 143, 0.06);
}
/* 今日概览：水彩卡片 */
.overview {
  width: 100%;
  padding: 28rpx 26rpx 12rpx;
  border-radius: 32rpx;
  text-align: left;
  background: linear-gradient(135deg, #ffffff 0%, #fafcfb 100%);
  box-shadow:
    0 8rpx 28rpx rgba(46, 97, 64, 0.08),
    0 2rpx 8rpx rgba(127, 204, 143, 0.06);
}
.overview-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.overview-title {
  color: #274a35;
  font-size: 30rpx;
  font-weight: 700;
}
.overview-count {
  color: #76907d;
  font-size: 22rpx;
  font-weight: 600;
}
.overview-track {
  height: 12rpx;
  margin-top: 16rpx;
  overflow: hidden;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #edf4ee 0%, #e8f0e9 100%);
}
.overview-fill {
  height: 100%;
  min-width: 12rpx;
  border-radius: inherit;
  background: linear-gradient(90deg, #7fcc8f 0%, #5f9e76 100%);
  box-shadow: inset 0 -2rpx 4rpx rgba(95, 158, 118, 0.3);
  transition: width 0.5s cubic-bezier(0.22, 0.8, 0.36, 1);
}
.cells {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  margin-top: 8rpx;
}
.cell {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 8rpx;
  padding: 20rpx 0 24rpx;
  color: inherit;
  line-height: 1;
  transition: transform 0.25s ease;
}
.cell:active {
  transform: scale(0.95);
}
.cell-tile {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 76rpx;
  height: 76rpx;
  border-radius: 28rpx;
  transition: all 0.3s cubic-bezier(0.22, 0.8, 0.36, 1);
}
.cell-tile image {
  width: 40rpx;
  height: 40rpx;
  opacity: 0.85;
  filter: drop-shadow(0 2rpx 4rpx rgba(0, 0, 0, 0.06));
}
.tile--done {
  background: linear-gradient(135deg, rgba(127, 204, 143, 0.12) 0%, rgba(95, 158, 118, 0.08) 100%);
  box-shadow:
    0 4rpx 12rpx rgba(127, 204, 143, 0.15),
    inset 0 0 0 2rpx rgba(159, 198, 171, 0.4);
  transform: scale(1.05);
}
.cell-badge {
  position: absolute;
  top: -6rpx;
  right: -6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32rpx;
  height: 32rpx;
  border: 3rpx solid #ffffff;
  border-radius: 50%;
  background: linear-gradient(135deg, #7fcc8f 0%, #67a37b 100%);
  box-shadow: 0 4rpx 12rpx rgba(127, 204, 143, 0.4);
}
.cell-badge image {
  width: 16rpx;
  height: 16rpx;
  filter: brightness(10);
  opacity: 1;
}
.cell-label {
  color: #284d36;
  font-size: 24rpx;
  font-weight: 600;
}
.cell-state {
  color: #8ba191;
  font-size: 20rpx;
  font-weight: 500;
}
.cell-state--done {
  color: #5a9572;
  font-weight: 600;
}
/* 主视觉与序序入口：整卡可点，不在插画上叠加任何按钮或角标 */
.hero-host {
  position: relative;
  margin-top: 24rpx;
  border-radius: 32rpx;
  box-shadow:
    0 8rpx 28rpx rgba(46, 97, 64, 0.08),
    0 2rpx 8rpx rgba(127, 204, 143, 0.06);
  overflow: hidden;
}
.chat-entry {
  display: flex;
  align-items: center;
  gap: 18rpx;
  width: 100%;
  margin-top: 20rpx;
  padding: 24rpx 26rpx;
  border-radius: 32rpx;
  text-align: left;
  background: linear-gradient(135deg, #fff9e6 0%, #fffdf1 100%);
  box-shadow:
    0 8rpx 28rpx rgba(239, 214, 137, 0.15),
    0 2rpx 8rpx rgba(244, 227, 160, 0.1);
  transition: transform 0.25s ease;
}
.chat-entry:active {
  transform: scale(0.98);
}
.chat-avatar {
  animation: hz-float 3.4s ease-in-out infinite;
  width: 68rpx;
  height: 68rpx;
  flex: none;
  border: 4rpx solid #f4e3a0;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 6rpx 18rpx rgba(239, 214, 137, 0.3);
}
.chat-entry view {
  flex: 1;
  min-width: 0;
}
.chat-entry text:first-child {
  color: #5d563e;
  font-size: 26rpx;
  font-weight: 700;
}
.chat-entry text:last-child {
  margin-top: 5rpx;
  color: #96875f;
  font-size: 20rpx;
}
.arrow {
  width: 30rpx;
  height: 30rpx;
  flex: none;
  margin-left: 14rpx;
  opacity: 0.68;
}
/* 区块标题 */
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 32rpx 4rpx 14rpx;
}
.section-head text:first-child {
  color: #274a35;
  font-size: 30rpx;
  font-weight: 700;
}
.section-head text:last-child {
  color: #76907d;
  font-size: 20rpx;
}
/* 快捷工具四宫格：水彩卡片 */
.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14rpx;
}
.quick-action {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 6rpx;
  min-width: 0;
  padding: 24rpx 10rpx 20rpx;
  border-radius: 28rpx;
  background: linear-gradient(135deg, #ffffff 0%, #fafcfb 100%);
  box-shadow:
    0 6rpx 20rpx rgba(46, 97, 64, 0.06),
    0 2rpx 6rpx rgba(127, 204, 143, 0.04);
  transition: all 0.25s cubic-bezier(0.22, 0.8, 0.36, 1);
}
.quick-action:active {
  transform: translateY(-4rpx) scale(0.98);
  box-shadow:
    0 10rpx 28rpx rgba(46, 97, 64, 0.1),
    0 4rpx 12rpx rgba(127, 204, 143, 0.08);
}
.quick-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88rpx;
  height: 88rpx;
  margin-bottom: 12rpx;
  border-radius: 50%;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}
.tone--mint {
  background: var(--hz-mint);
}
.tone--sky {
  background: var(--hz-sky);
}
.tone--amber {
  background: var(--hz-amber);
}
.tone--blush {
  background: var(--hz-blush);
}
.quick-icon image {
  width: 38rpx;
  height: 38rpx;
}
.quick-action text:first-of-type {
  overflow: hidden;
  max-width: 100%;
  color: #31543e;
  font-size: 22rpx;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.quick-action text:last-of-type {
  color: #93a89a;
  font-size: 17rpx;
}
/* 小行动与管理进度列表卡：水彩风格 */
.tasks {
  margin-top: 2rpx;
}
.task {
  display: flex;
  align-items: center;
  gap: 16rpx;
  width: 100%;
  min-height: 100rpx;
  padding: 18rpx 26rpx;
  border-bottom: 1rpx solid rgba(238, 244, 239, 0.8);
  text-align: left;
  transition: background 0.25s ease;
}
.task:active {
  background: rgba(232, 244, 234, 0.3);
}
.task:last-child {
  border-bottom: 0;
}
.task-dot {
  width: 32rpx;
  height: 32rpx;
  flex: none;
  border: 3rpx solid #7fcc8f;
  border-radius: 50%;
  box-shadow: 0 2rpx 8rpx rgba(127, 204, 143, 0.2);
}
.task-copy {
  flex: 1;
  min-width: 0;
}
.task-copy text:first-child {
  color: #284d36;
  font-size: 26rpx;
  font-weight: 700;
}
.task-copy text:last-child {
  margin-top: 5rpx;
  color: #758c7d;
  font-size: 22rpx;
}
.done {
  padding: 26rpx 24rpx;
}
.done text:first-child {
  color: #315e41;
  font-size: 26rpx;
  font-weight: 700;
}
.done text:last-child {
  margin-top: 6rpx;
  color: #789080;
  font-size: 21rpx;
}
.card--list {
  margin-top: 2rpx;
}
.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 96rpx;
  padding: 15rpx 24rpx;
  border-bottom: 1rpx solid #eef4ef;
  text-align: left;
}
.summary-row--last {
  border-bottom: 0;
}
.summary-row view {
  flex: 1;
  min-width: 0;
}
.summary-row text:first-child {
  color: #31543e;
  font-size: 25rpx;
  font-weight: 700;
}
.summary-row text:last-child {
  margin-top: 5rpx;
  color: #758c7d;
  font-size: 20rpx;
  line-height: 1.4;
}

/* 体重卡片：薄荷风格 */
.weight-card {
  margin: 0 20rpx 24rpx;
  padding: 36rpx 32rpx;
  border-radius: 28rpx;
  background: linear-gradient(135deg, #e8f7ed 0%, #f3fbf6 100%);
  box-shadow: 0 8rpx 32rpx rgba(46, 97, 64, 0.08);
}
.weight-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24rpx;
}
.weight-title-group {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.weight-label {
  color: #5a9572;
  font-size: 26rpx;
  font-weight: 600;
  letter-spacing: 0.05em;
}
.weight-value {
  color: #2d6943;
  font-size: 72rpx;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.02em;
}
.weight-unit {
  margin-left: 8rpx;
  color: #6f8879;
  font-size: 32rpx;
  font-weight: 600;
}
.weight-empty {
  color: #96a89d;
  font-size: 34rpx;
  font-weight: 600;
}
.weight-record-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  height: 64rpx;
  padding: 0 24rpx;
  border: 2rpx solid #9ec6ab;
  border-radius: 999rpx;
  color: #3f7953;
  background: #ffffff;
  font-size: 28rpx;
  font-weight: 700;
  transition: all 0.25s ease;
}
.weight-record-btn:active {
  transform: scale(0.96);
  background: #f9fcfa;
}
.btn-icon {
  width: 28rpx;
  height: 28rpx;
}
.weight-meta {
  display: flex;
  gap: 24rpx;
  padding-top: 20rpx;
  border-top: 2rpx solid rgba(158, 198, 171, 0.2);
}
.meta-item {
  color: #6f8879;
  font-size: 25rpx;
  line-height: 1.5;
}
.weight-prompt {
  padding-top: 20rpx;
  border-top: 2rpx solid rgba(158, 198, 171, 0.2);
}
.weight-prompt text {
  color: #8a9b90;
  font-size: 26rpx;
  line-height: 1.6;
}

.loading {
  padding: 160rpx 20rpx;
  color: #70897a;
  text-align: center;
  font-size: 27rpx;
}
.load-failed {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 150rpx 32rpx;
  text-align: center;
}
.load-failed text:first-child {
  color: #466a52;
  font-size: 28rpx;
  font-weight: 700;
}
.load-failed text:nth-child(2) {
  margin-top: 9rpx;
  color: #7a9080;
  font-size: 22rpx;
}
.load-failed button {
  height: 70rpx;
  margin-top: 26rpx;
  padding: 0 28rpx;
  border: 1rpx solid #bfd6c1;
  border-radius: 12rpx;
  color: #426a4e;
  background: #eef6ee;
  font-size: 24rpx;
  line-height: 70rpx;
}
</style>
