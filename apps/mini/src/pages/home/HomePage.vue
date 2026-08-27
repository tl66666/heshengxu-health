<template>
  <view class="page">
    <view class="head">
      <view
        ><text class="date">{{ dateLabel }}</text
        ><text class="title">{{ greeting }}，{{ displayName }}</text></view
      >
      <image
        class="avatar"
        src="/static/illustrations/xuxu-avatar.jpg"
        mode="aspectFill"
        @tap="toXuxu"
      />
    </view>

    <view v-if="loading" class="loading">正在整理今天的节律…</view>
    <template v-else-if="today && experience">
      <IllustratedHero
        image="/static/illustrations/home-companion-banner.png"
        :eyebrow="experience.hero.eyebrow"
        :title="experience.hero.title"
        :description="experience.hero.description"
      />

      <button class="today-action" @tap="go(experience.hero.route)">
        <view
          ><text>今天先做</text><text>{{ experience.hero.title }}</text></view
        >
        <image src="/static/icons/forward.svg" mode="aspectFit" />
      </button>

      <button class="chat-entry" @tap="toXuxu">
        <image class="chat-avatar" src="/static/illustrations/xuxu-avatar.jpg" mode="aspectFill" />
        <view><text>和序序聊聊</text><text>把今天的困惑说给序序听</text></view>
        <image class="arrow" src="/static/icons/forward.svg" mode="aspectFit" />
      </button>

      <view class="section-head"><text>饮食记录</text><text>选择一种方式</text></view>
      <view class="quick-grid">
        <button
          v-for="item in homeQuickActions"
          :key="item.label"
          class="quick-action"
          @tap="go(item.route)"
        >
          <view class="quick-icon"><image :src="item.icon" mode="aspectFit" /></view>
          <view
            ><text>{{ item.label }}</text
            ><text>{{ item.detail }}</text></view
          >
        </button>
      </view>

      <view class="section-head"
        ><text>今天的小行动</text><text>{{ experience.tasks.length }} 项待完成</text></view
      >
      <view v-if="experience.tasks.length" class="tasks">
        <button v-for="task in experience.tasks" :key="task.id" class="task" @tap="go(task.route)">
          <view class="task-dot" /><view class="task-copy"
            ><text>{{ task.title }}</text
            ><text>{{ task.subtitle }}</text></view
          ><image class="arrow" src="/static/icons/forward.svg" mode="aspectFit" />
        </button>
      </view>
      <view v-else class="done"
        ><text>今天的行动已经完成</text><text>保持自己的节律就很好。</text></view
      >

      <view class="section-head"><text>管理进度</text></view>
      <button class="summary-row" @tap="go('/pages/records/RecordsPage')">
        <view
          ><text>今日记录</text
          ><text
            >{{ experience.recording.completed }}/{{ experience.recording.total }} 已完成 ·
            {{ experience.recording.message }}</text
          ></view
        ><image class="arrow" src="/static/icons/forward.svg" mode="aspectFit" />
      </button>
      <button class="summary-row" @tap="toPlan">
        <view
          ><text>{{ today.activePlan ? '当前计划' : '设置计划' }}</text
          ><text>{{ planText }}</text></view
        ><image class="arrow" src="/static/icons/forward.svg" mode="aspectFit" />
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
import { onboardingState } from '../../stores/onboarding.js';
import { homeQuickActions } from './home-actions.js';

const { today, loading, error } = healthLoopState;
const date = localDate();
const greeting =
  new Date().getHours() < 12 ? '早上好' : new Date().getHours() < 18 ? '下午好' : '晚上好';
const dateLabel = `${new Date().getMonth() + 1} 月 ${new Date().getDate()} 日 · 今天`;
const displayName = computed(() => today.value?.displayName || '朋友');
const experience = computed(() => (today.value ? deriveDailyExperience(today.value) : null));
const planText = computed(() =>
  today.value?.activePlan
    ? '今天的小行动正在等你慢慢完成。'
    : '选择体重或睡眠方向，从一个小目标开始。',
);

function load() {
  if (onboardingState.completed.value) healthLoopState.loadToday(date);
}
function go(url: string) {
  if (isTabPath(url)) uni.switchTab({ url: url.split('?')[0] || url });
  else uni.navigateTo({ url });
}
function isTabPath(url: string) {
  return ['/pages/home/', '/pages/records/', '/pages/xuxu/', '/pages/plan/', '/pages/me/'].some(
    (prefix) => url.startsWith(prefix),
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
  padding: 50rpx 32rpx 150rpx;
  background: #f6faf7;
  color: #183425;
}
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}
.date,
.title,
.section-head text,
.today-action text,
.chat-entry text,
.quick-action text,
.task-copy text,
.done text,
.summary-row text,
.load-failed text {
  display: block;
}
.date {
  color: #718a7a;
  font-size: 22rpx;
}
.title {
  margin-top: 8rpx;
  font-size: 40rpx;
  font-weight: 700;
}
.avatar {
  width: 72rpx;
  height: 72rpx;
  border: 3rpx solid #efd98d;
  border-radius: 50%;
}
.today-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 14rpx;
  padding: 17rpx 2rpx;
  border: 0;
  border-bottom: 1rpx solid #dfe9df;
  text-align: left;
  background: transparent;
}
.today-action text:first-child {
  color: #758a78;
  font-size: 20rpx;
}
.today-action text:last-child {
  margin-top: 5rpx;
  color: #31543e;
  font-size: 26rpx;
  font-weight: 700;
}
.today-action image {
  width: 34rpx;
  height: 34rpx;
}
.chat-entry {
  display: flex;
  align-items: center;
  gap: 14rpx;
  width: 100%;
  padding: 18rpx 2rpx;
  border: 0;
  border-bottom: 1rpx solid #e5e4ca;
  text-align: left;
  background: transparent;
}
.chat-avatar {
  width: 58rpx;
  height: 58rpx;
  flex: none;
  border: 3rpx solid #f0da8c;
  border-radius: 50%;
}
.chat-entry view {
  flex: 1;
  min-width: 0;
}
.chat-entry text:first-child {
  color: #5d563e;
  font-size: 25rpx;
  font-weight: 700;
}
.chat-entry text:last-child {
  margin-top: 5rpx;
  color: #8a8060;
  font-size: 20rpx;
}
.arrow {
  width: 30rpx;
  height: 30rpx;
  flex: none;
  margin-left: 14rpx;
  opacity: 0.68;
}
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 30rpx 2rpx 12rpx;
}
.section-head text:first-child {
  color: #274a35;
  font-size: 29rpx;
  font-weight: 700;
}
.section-head text:last-child {
  color: #76907d;
  font-size: 20rpx;
}
.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10rpx;
}
.quick-action {
  display: flex;
  align-items: center;
  gap: 10rpx;
  min-width: 0;
  min-height: 94rpx;
  padding: 12rpx;
  border: 1rpx solid #dfeae0;
  border-radius: 12rpx;
  text-align: left;
  background: #fff;
}
.quick-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
  flex: none;
  border-radius: 12rpx;
  background: #edf6ee;
}
.quick-icon image {
  width: 30rpx;
  height: 30rpx;
  opacity: 0.78;
}
.quick-action view:last-child {
  min-width: 0;
}
.quick-action text:first-child {
  overflow: hidden;
  color: #31543e;
  font-size: 22rpx;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.quick-action text:last-child {
  margin-top: 5rpx;
  overflow: hidden;
  color: #82988a;
  font-size: 18rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tasks {
  border-top: 1rpx solid #e1ebe2;
}
.task {
  display: flex;
  align-items: center;
  gap: 14rpx;
  width: 100%;
  min-height: 92rpx;
  padding: 15rpx 2rpx;
  border: 0;
  border-bottom: 1rpx solid #e1ebe2;
  text-align: left;
  background: transparent;
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
  padding: 20rpx 2rpx;
  border-top: 1rpx solid #dbe9dc;
  border-bottom: 1rpx solid #dbe9dc;
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
.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 92rpx;
  padding: 15rpx 2rpx;
  border: 0;
  border-bottom: 1rpx solid #e1ebe2;
  text-align: left;
  background: transparent;
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
