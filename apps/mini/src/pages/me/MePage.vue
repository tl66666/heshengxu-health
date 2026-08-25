<template>
  <view class="page"
    ><view class="profile"
      ><image src="/static/illustrations/xuxu-avatar.jpg" mode="aspectFill" /><view
        ><text>{{ displayName }}</text
        ><text>{{ profileText }}</text></view
      ></view
    ><view class="group"
      ><text class="group-title">健康管理</text
      ><button v-for="item in healthItems" :key="item.label" class="row" @tap="item.action">
        <text>{{ item.icon }}</text
        ><view
          ><text>{{ item.label }}</text
          ><text>{{ item.desc }}</text></view
        ><text>›</text>
      </button></view
    ><view class="group"
      ><text class="group-title">数据与隐私</text
      ><button v-for="item in dataItems" :key="item.label" class="row" @tap="notice(item.label)">
        <text>{{ item.icon }}</text
        ><view
          ><text>{{ item.label }}</text
          ><text>{{ item.desc }}</text></view
        ><text>›</text>
      </button></view
    ><text class="foot">和生序提供健康管理参考，不提供疾病诊断或治疗建议。</text></view
  >
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { healthLoopState } from '../../features/health-loop/health-loop.store.js';
const date = localDate();
const displayName = computed(() => healthLoopState.today.value?.displayName || '健康管理者');
const profileText = computed(() =>
  healthLoopState.today.value?.activePlan?.kind === 'sleep' ? '睡眠与精力计划' : '体重管理计划',
);
const healthItems = [
  {
    icon: '◌',
    label: '我的健康档案',
    desc: '基础资料与健康目标',
    action: () => uni.navigateTo({ url: '/pages/onboarding/OnboardingPage' }),
  },
  {
    icon: '□',
    label: '调整当前计划',
    desc: '目标方向和每日行动',
    action: () => uni.navigateTo({ url: '/pages/plan-setup/PlanSetupPage' }),
  },
  { icon: '⌁', label: '提醒设置', desc: '记录提醒会在后续开放', action: () => notice('提醒设置') },
];
const dataItems = [
  { icon: '◷', label: '我的健康数据', desc: '记录只用于你的健康管理' },
  { icon: '◐', label: '数据导出与删除', desc: '数据管理能力会在后续开放' },
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
  padding: 48rpx 32rpx 166rpx;
  background: #f7fbf8;
  color: #1d3d2a;
}
.profile {
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
  background: #fff8dc;
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
.row > text:first-child {
  color: #5a9970;
  font-size: 32rpx;
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
.row > text:last-child {
  color: #73a27d;
  font-size: 36rpx;
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
