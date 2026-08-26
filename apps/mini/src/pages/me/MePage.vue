<template>
  <view class="page">
    <view class="page-header">
      <view><text class="date-label">和生序</text><text class="page-title">我的</text></view>
      <image class="header-avatar" src="/static/illustrations/xuxu-avatar.jpg" mode="aspectFill" />
    </view>

    <view class="profile-line">
      <image class="profile-avatar" src="/static/illustrations/xuxu-avatar.jpg" mode="aspectFill" />
      <view class="profile-copy"
        ><text class="profile-name">{{ displayName }}</text
        ><text class="profile-subtitle">{{ profileText }}</text></view
      >
      <image class="forward-icon" src="/static/icons/forward.svg" mode="aspectFit" />
    </view>

    <view class="group">
      <text class="group-title">健康管理</text>
      <button v-for="item in healthItems" :key="item.label" class="row" @tap="item.action">
        <view class="row-icon"><image :src="item.icon" mode="aspectFit" /></view>
        <view class="row-copy"
          ><text class="row-title">{{ item.label }}</text
          ><text class="row-desc">{{ item.desc }}</text></view
        >
        <image class="forward-icon" src="/static/icons/forward.svg" mode="aspectFit" />
      </button>
    </view>

    <view class="group">
      <text class="group-title">数据与隐私</text>
      <view v-for="item in dataItems" :key="item.label" class="row row-disabled">
        <view class="row-icon"><image :src="item.icon" mode="aspectFit" /></view>
        <view class="row-copy"
          ><text class="row-title">{{ item.label }}</text
          ><text class="row-desc">{{ item.desc }}</text></view
        >
        <text class="pending">即将开放</text>
      </view>
    </view>

    <text class="foot">和生序提供健康管理参考，不提供疾病诊断或治疗建议。</text>
    <MiniTabBar active="me" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import MiniTabBar from '../../components/MiniTabBar.vue';
import { healthLoopState } from '../../features/health-loop/health-loop.store.js';

const date = localDate();
const displayName = computed(() => healthLoopState.today.value?.displayName || '健康管理者');
const profileText = computed(() => {
  const plan = healthLoopState.today.value?.activePlan;
  return plan ? (plan.kind === 'sleep' ? '睡眠与精力计划' : '体重管理计划') : '还没有设置计划';
});
const healthItems = [
  {
    label: '我的健康档案',
    desc: '基础资料与健康目标',
    icon: '/static/icons/profile.svg',
    action: () => uni.navigateTo({ url: '/pages/onboarding/OnboardingPage' }),
  },
  {
    label: '调整当前计划',
    desc: '目标方向和每日行动',
    icon: '/static/icons/plan.svg',
    action: () => uni.navigateTo({ url: '/pages/plan-setup/PlanSetupPage' }),
  },
  {
    label: '提醒设置',
    desc: '记录提醒会在后续开放',
    icon: '/static/icons/journal.svg',
    action: () => notice('提醒设置'),
  },
];
const dataItems = [
  { label: '我的健康数据', desc: '记录只用于你的健康管理', icon: '/static/icons/journal.svg' },
  { label: '数据导出与删除', desc: '数据管理能力会在后续开放', icon: '/static/icons/profile.svg' },
];
function notice(label: string) {
  uni.showToast({ title: `${label}正在准备中`, icon: 'none' });
}
function localDate() {
  const n = new Date();
  return new Date(n.getTime() - n.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
onShow(() => healthLoopState.loadToday(date));
</script>

<style scoped>
.page {
  min-height: 100vh;
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;
  padding: 50rpx 32rpx 220rpx;
  background: #f7fbf8;
  color: #1d3d2a;
}
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 26rpx;
}
.date-label {
  display: block;
  color: #789181;
  font-size: 22rpx;
}
.page-title {
  display: block;
  margin-top: 7rpx;
  color: #214632;
  font-size: 40rpx;
  font-weight: 700;
}
.header-avatar {
  width: 64rpx;
  height: 64rpx;
  border: 3rpx solid #efd98d;
  border-radius: 50%;
}
.profile-line {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 20rpx 0 26rpx;
  border-bottom: 1rpx solid #dfeae0;
}
.profile-avatar {
  width: 86rpx;
  height: 86rpx;
  border: 3rpx solid #efd98d;
  border-radius: 50%;
}
.profile-copy {
  flex: 1;
}
.profile-name,
.profile-subtitle {
  display: block;
}
.profile-name {
  color: #284d36;
  font-size: 30rpx;
  font-weight: 700;
}
.profile-subtitle {
  margin-top: 7rpx;
  color: #748b7d;
  font-size: 22rpx;
}
.forward-icon {
  width: 30rpx;
  height: 30rpx;
  opacity: 0.68;
}
.group {
  margin-top: 30rpx;
}
.group-title {
  display: block;
  margin: 0 0 8rpx 2rpx;
  color: #5f806b;
  font-size: 22rpx;
  font-weight: 700;
}
.row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  width: 100%;
  min-height: 88rpx;
  padding: 14rpx 2rpx;
  border-bottom: 1rpx solid #e2ebe3;
  text-align: left;
}
.row-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42rpx;
  height: 42rpx;
  flex: none;
}
.row-icon image {
  width: 38rpx;
  height: 38rpx;
  opacity: 0.72;
}
.row-copy {
  flex: 1;
  min-width: 0;
}
.row-title,
.row-desc {
  display: block;
}
.row-title {
  color: #31543e;
  font-size: 26rpx;
}
.row-desc {
  margin-top: 4rpx;
  color: #7b9181;
  font-size: 21rpx;
}
.pending {
  color: #9aa99d;
  font-size: 20rpx;
}
.row-disabled {
  opacity: 0.68;
}
.foot {
  display: block;
  margin: 38rpx 16rpx 0;
  color: #91a496;
  text-align: center;
  font-size: 20rpx;
  line-height: 1.6;
}
</style>
