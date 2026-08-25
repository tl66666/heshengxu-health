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
    <template v-else-if="today && experience">
      <IllustratedHero
        image="/static/illustrations/home-companion-banner.png"
        :eyebrow="experience.hero.eyebrow"
        :title="experience.hero.title"
        :description="experience.hero.description"
        action-label="开始这一步"
        @action="go(experience.hero.route)"
      />
      <XuxuHint
        class="hint"
        variant="sunny"
        :message="xuxuMessage"
        action="听序序说"
        @tap="toXuxu"
      />
      <view class="section-head"
        ><text>今天只做这几件小事</text><text>{{ experience.tasks.length }} 件待完成</text></view
      >
      <view v-if="experience.tasks.length" class="tasks"
        ><button v-for="task in experience.tasks" :key="task.id" class="task" @tap="go(task.route)">
          <view class="task-dot" /><view class="task-copy"
            ><text>{{ task.title }}</text
            ><text>{{ task.subtitle }}</text></view
          ><text>›</text>
        </button></view
      >
      <view v-else class="done"
        ><image src="/static/illustrations/xuxu-complete.png" mode="aspectFill" /><view
          ><text>今天的行动已完成</text><text>不必额外加码，保持自己的节律就好。</text></view
        ></view
      >
      <button class="record-summary" @tap="go('/pages/records/RecordsPage')">
        <view
          ><text>今天的记录</text
          ><text
            >{{ experience.recording.completed }}/{{ experience.recording.total }} 已完成 ·
            {{ experience.recording.message }}</text
          ></view
        ><image
          :src="
            experience.recording.image === 'complete'
              ? '/static/illustrations/xuxu-complete.png'
              : '/static/illustrations/xuxu-record-reminder.png'
          "
          mode="aspectFill"
        />
      </button>
      <button class="plan-summary" @tap="toPlan">
        <view
          ><text>{{ today.activePlan ? '正在执行的计划' : '从这里设置计划' }}</text
          ><text>{{ planText }}</text></view
        ><text>›</text>
      </button>
    </template>
    <view v-else-if="error" class="load-failed"
      ><image src="/static/illustrations/xuxu-record-reminder.png" mode="aspectFill" /><text
        >今天的状态还没加载出来</text
      ><text>检查服务连接后，再试一次就好。</text><button @tap="load">重新加载</button></view
    >
    <view v-else class="loading">正在准备今天的节律...</view>
    <MiniTabBar active="home" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import IllustratedHero from '../../components/IllustratedHero.vue';
import XuxuHint from '../../components/XuxuHint.vue';
import MiniTabBar from '../../components/MiniTabBar.vue';
import { deriveDailyExperience } from '../../features/health-loop/daily-experience.js';
import { healthLoopState } from '../../features/health-loop/health-loop.store.js';
import { onboardingState } from '../../stores/onboarding.js';

const { today, loading, error } = healthLoopState;
const date = localDate();
const greeting =
  new Date().getHours() < 12 ? '早上好' : new Date().getHours() < 18 ? '下午好' : '晚上好';
const dateLabel = `${new Date().getMonth() + 1} 月 ${new Date().getDate()} 日 · 今天`;
const displayName = computed(() => today.value?.displayName || '朋友');
const experience = computed(() => (today.value ? deriveDailyExperience(today.value) : null));
const xuxuMessage = computed(
  () => experience.value?.recording.message || '从一件小事开始，就很好。',
);
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
  padding: 48rpx 32rpx 172rpx;
  background: #f7fbf8;
  color: #183425;
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
.date {
  color: #718a7a;
  font-size: 22rpx;
}
.title {
  margin-top: 8rpx;
  font-size: 44rpx;
  font-weight: 700;
}
.avatar {
  width: 72rpx;
  height: 72rpx;
  border: 3rpx solid #efd98d;
  border-radius: 50%;
}
.hint {
  margin-top: 18rpx;
}
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 30rpx 4rpx 14rpx;
  font-size: 30rpx;
  font-weight: 700;
}
.section-head text:last-child {
  color: #668a73;
  font-size: 22rpx;
  font-weight: 400;
}
.tasks {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.task {
  display: flex;
  align-items: center;
  gap: 16rpx;
  width: 100%;
  padding: 20rpx;
  border: 2rpx solid #dceadd;
  border-radius: 16rpx;
  text-align: left;
  color: #284d36;
  background: #fff;
}
.task-dot {
  width: 34rpx;
  height: 34rpx;
  border: 2rpx solid #70a77d;
  border-radius: 50%;
}
.task-copy {
  flex: 1;
}
.task view text {
  display: block;
  font-size: 26rpx;
  font-weight: 700;
}
.task view text:last-child {
  margin-top: 4rpx;
  color: #758c7d;
  font-size: 21rpx;
  font-weight: 400;
}
.task > text {
  color: #5c956d;
  font-size: 36rpx;
}
.done {
  display: flex;
  align-items: center;
  gap: 14rpx;
  padding: 16rpx;
  border: 2rpx solid #d5e8d9;
  border-radius: 16rpx;
  background: #fff;
}
.done image {
  width: 92rpx;
  height: 92rpx;
  border-radius: 50%;
}
.done text {
  display: block;
  font-size: 26rpx;
  font-weight: 700;
}
.done text:last-child {
  margin-top: 5rpx;
  color: #71897a;
  font-size: 21rpx;
  font-weight: 400;
}
.record-summary,
.plan-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 22rpx;
  padding: 20rpx;
  border: 2rpx solid #dceadd;
  border-radius: 17rpx;
  text-align: left;
  color: #31543e;
  background: #fff;
}
.record-summary view,
.plan-summary view {
  flex: 1;
}
.record-summary text,
.plan-summary text {
  display: block;
  font-size: 27rpx;
  font-weight: 700;
}
.record-summary text:last-child,
.plan-summary text:last-child {
  margin-top: 6rpx;
  color: #728a7b;
  font-size: 21rpx;
  font-weight: 400;
  line-height: 1.45;
}
.record-summary image {
  width: 76rpx;
  height: 76rpx;
  margin-left: 16rpx;
  border-radius: 50%;
}
.plan-summary > text {
  color: #5e966f;
  font-size: 38rpx;
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
  padding: 110rpx 32rpx;
  text-align: center;
}
.load-failed image {
  width: 180rpx;
  height: 180rpx;
  border-radius: 50%;
}
.load-failed text {
  display: block;
  margin-top: 18rpx;
  color: #466a52;
  font-size: 28rpx;
  font-weight: 700;
}
.load-failed text:nth-of-type(2) {
  margin-top: 8rpx;
  color: #7a9080;
  font-size: 22rpx;
  font-weight: 400;
}
.load-failed button {
  width: 230rpx;
  height: 70rpx;
  margin-top: 24rpx;
  border-radius: 35rpx;
  color: #fff;
  background: #2e7d4f;
  font-size: 24rpx;
  line-height: 70rpx;
}
</style>
