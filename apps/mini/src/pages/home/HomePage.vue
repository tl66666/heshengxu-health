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
            <text v-if="today.records?.weight" class="weight-value"
              >{{ today.records.weight.weightKg }}<text class="weight-unit">kg</text></text
            >
            <text v-else class="weight-empty">未记录</text>
          </view>
          <button class="weight-record-btn" @tap="go('/pages/records/RecordsPage?type=weight')">
            <image src="/static/icons/add.svg" class="btn-icon" mode="aspectFit" />
            <text>记录</text>
          </button>
        </view>
        <view v-if="today.records?.weight" class="weight-meta">
          <text class="meta-item">目标: {{ today.records.weight.weightKg - 2 }}kg</text>
          <text class="meta-item">BMI: {{ currentBmi }}</text>
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

const currentBmi = computed(() => {
  const weight = today.value?.records?.weight;
  if (!weight || !weight.heightCm || !weight.weightKg) return null;
  const heightM = weight.heightCm / 100;
  const bmi = weight.weightKg / (heightM * heightM);
  return bmi.toFixed(1);
});

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
  border-radius: var(--hz-radius-card);
  background: #fff;
  box-shadow: var(--hz-shadow-card);
}
/* 今日概览 */
.overview {
  width: 100%;
  padding: 24rpx 24rpx 8rpx;
  border-radius: var(--hz-radius-card);
  text-align: left;
  background: #fff;
  box-shadow: var(--hz-shadow-card);
}
.overview-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.overview-title {
  color: #274a35;
  font-size: 29rpx;
  font-weight: 700;
}
.overview-count {
  color: #76907d;
  font-size: 21rpx;
}
.overview-track {
  height: 10rpx;
  margin-top: 14rpx;
  overflow: hidden;
  border-radius: 999rpx;
  background: #edf4ee;
}
.overview-fill {
  height: 100%;
  min-width: 12rpx;
  border-radius: inherit;
  background: linear-gradient(90deg, #67a37b, #347c50);
  transition: width 0.5s cubic-bezier(0.22, 0.8, 0.36, 1);
}
.cells {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  margin-top: 6rpx;
}
.cell {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 7rpx;
  padding: 18rpx 0 22rpx;
  color: inherit;
  line-height: 1;
}
.cell-tile {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  border-radius: 24rpx;
}
.cell-tile image {
  width: 38rpx;
  height: 38rpx;
  opacity: 0.82;
}
.tile--done {
  box-shadow: inset 0 0 0 2rpx #9fc6ab;
}
.cell-badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30rpx;
  height: 30rpx;
  border: 2rpx solid #fff;
  border-radius: 50%;
  background: #67a37b;
}
.cell-badge image {
  width: 16rpx;
  height: 16rpx;
  filter: brightness(4);
  opacity: 1;
}
.cell-label {
  color: #284d36;
  font-size: 23rpx;
  font-weight: 600;
}
.cell-state {
  color: #8ba191;
  font-size: 18rpx;
}
.cell-state--done {
  color: #4c7d5a;
}
/* 主视觉与序序入口：整卡可点，不在插画上叠加任何按钮或角标 */
.hero-host {
  position: relative;
  margin-top: 22rpx;
  border-radius: var(--hz-radius-card);
  box-shadow: var(--hz-shadow-card);
}
.chat-entry {
  display: flex;
  align-items: center;
  gap: 16rpx;
  width: 100%;
  margin-top: 18rpx;
  padding: 20rpx 22rpx;
  border-radius: var(--hz-radius-card);
  text-align: left;
  background: var(--hz-amber);
  box-shadow: var(--hz-shadow-card);
}
.chat-avatar {
  animation: hz-float 3.4s ease-in-out infinite;
  width: 64rpx;
  height: 64rpx;
  flex: none;
  border: 3rpx solid #f0da8c;
  border-radius: 50%;
  background: #fffdf1;
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
/* 快捷工具四宫格 */
.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12rpx;
}
.quick-action {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 4rpx;
  min-width: 0;
  padding: 22rpx 8rpx 18rpx;
  border-radius: var(--hz-radius-tile);
  background: #fff;
  box-shadow: var(--hz-shadow-card);
}
.quick-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 84rpx;
  height: 84rpx;
  margin-bottom: 10rpx;
  border-radius: 50%;
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
/* 小行动与管理进度列表卡 */
.tasks {
  margin-top: 2rpx;
}
.task {
  display: flex;
  align-items: center;
  gap: 14rpx;
  width: 100%;
  min-height: 96rpx;
  padding: 15rpx 24rpx;
  border-bottom: 1rpx solid #eef4ef;
  text-align: left;
}
.task:last-child {
  border-bottom: 0;
}
.task-dot {
  width: 30rpx;
  height: 30rpx;
  flex: none;
  border: 2rpx solid #7cad88;
  border-radius: 50%;
}
.task-copy {
  flex: 1;
  min-width: 0;
}
.task-copy text:first-child {
  color: #284d36;
  font-size: 25rpx;
  font-weight: 700;
}
.task-copy text:last-child {
  margin-top: 4rpx;
  color: #758c7d;
  font-size: 20rpx;
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
