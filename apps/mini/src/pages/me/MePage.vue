<template>
  <view class="page">
    <image class="leaf" src="/static/illustrations/leaf-corner-decoration.png" mode="aspectFill" />
    <view class="page-head"
      ><text class="eyebrow">我的节律</text
      ><text class="title">照顾好自己，也照顾好生活</text></view
    >
    <view class="profile"
      ><image src="/static/illustrations/xuxu-avatar.jpg" mode="aspectFill" /><view
        ><text>{{ displayName }}</text
        ><text>{{ profileText }}</text></view
      ></view
    >
    <view class="group"
      ><text class="group-title">健康管理</text>
      <button v-for="item in healthItems" :key="item.label" class="row" @tap="item.action">
        <icon type="info_circle" size="18" class="row-icon" /><view
          ><text>{{ item.label }}</text
          ><text>{{ item.desc }}</text></view
        ><image class="forward-icon" src="/static/icons/forward.svg" mode="aspectFit" />
      </button>
    </view>
    <view class="group"
      ><text class="group-title">数据与隐私</text>
      <view v-for="item in dataItems" :key="item.label" class="row row--pending">
        <icon type="info_circle" size="18" class="row-icon" /><view
          ><text>{{ item.label }}</text
          ><text>{{ item.desc }}</text></view
        ><text class="pending">即将开放</text>
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
  if (!plan) return '还没有设置计划';
  return plan.kind === 'sleep' ? '睡眠与精力计划' : '体重管理计划';
});
const healthItems = [
  {
    label: '我的健康档案',
    desc: '基础资料与健康目标',
    action: () => uni.navigateTo({ url: '/pages/onboarding/OnboardingPage' }),
  },
  {
    label: '调整当前计划',
    desc: '目标方向和每日行动',
    action: () => uni.navigateTo({ url: '/pages/plan-setup/PlanSetupPage' }),
  },
  { label: '提醒设置', desc: '记录提醒会在后续开放', action: () => notice('提醒设置') },
];
const dataItems = [
  { label: '我的健康数据', desc: '记录只用于你的健康管理' },
  { label: '数据导出与删除', desc: '数据管理能力会在后续开放' },
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
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  box-sizing: border-box;
  padding: 48rpx 32rpx 190rpx;
  background: #f7fbf8;
  color: #1d3d2a;
}
.leaf {
  position: absolute;
  top: -120rpx;
  right: -180rpx;
  width: 520rpx;
  height: 520rpx;
  opacity: 0.42;
  pointer-events: none;
}
.page-head {
  position: relative;
  z-index: 1;
  margin-bottom: 24rpx;
}
.eyebrow,
.title {
  display: block;
}
.eyebrow {
  color: #6a9275;
  font-size: 22rpx;
  font-weight: 700;
}
.title {
  margin-top: 8rpx;
  color: #254735;
  font-size: 34rpx;
  font-weight: 700;
  line-height: 1.35;
}
.profile {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 26rpx;
  border-radius: 20rpx;
  background: #e8f4e8;
}
.profile image {
  width: 90rpx;
  height: 90rpx;
  border: 3rpx solid #f0db92;
  border-radius: 50%;
}
.profile view text {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
}
.profile view text:last-child {
  margin-top: 6rpx;
  color: #668176;
  font-size: 22rpx;
  font-weight: 400;
}
.group {
  margin-top: 30rpx;
}
.group-title {
  display: block;
  margin: 0 0 12rpx 8rpx;
  color: #5d806a;
  font-size: 23rpx;
  font-weight: 700;
}
.row {
  display: flex;
  align-items: center;
  gap: 17rpx;
  width: 100%;
  margin-top: 10rpx;
  padding: 21rpx;
  border-radius: 16rpx;
  text-align: left;
  background: #fff;
}
.row-icon {
  opacity: 0.75;
}
.forward-icon {
  width: 32rpx;
  height: 32rpx;
  opacity: 0.7;
}
.row view {
  flex: 1;
}
.row view text {
  display: block;
  color: #31543e;
  font-size: 27rpx;
}
.row view text:last-child {
  margin-top: 5rpx;
  color: #778f80;
  font-size: 22rpx;
}
.pending {
  color: #84978a;
  font-size: 21rpx;
}
.row--pending {
  opacity: 0.72;
}
.foot {
  display: block;
  margin: 38rpx 16rpx 0;
  color: #91a496;
  text-align: center;
  font-size: 21rpx;
  line-height: 1.6;
}
</style>
