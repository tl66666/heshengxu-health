<template>
  <view class="page">
    <view class="page-header"><text>我的</text><text>健康管理</text></view>

    <button class="profile-summary" @tap="openProfile">
      <view class="initial-avatar"
        ><text>{{ initial }}</text></view
      >
      <view class="profile-copy"
        ><text>{{ displayName }}</text
        ><text>{{ profileText }}</text></view
      >
      <image class="arrow" src="/static/icons/forward.svg" mode="aspectFit" />
    </button>

    <view class="section">
      <text class="section-title">健康管理</text>
      <button
        v-for="item in mePrimaryActions"
        :key="item.label"
        class="row"
        @tap="openAction(item)"
      >
        <view class="row-copy"
          ><text>{{ item.label }}</text
          ><text>{{ item.detail }}</text></view
        >
        <image class="arrow" src="/static/icons/forward.svg" mode="aspectFit" />
      </button>
    </view>

    <view class="section">
      <text class="section-title">数据与隐私</text>
      <button class="row" @tap="manageData">
        <view class="row-copy"
          ><text>数据管理说明</text><text>当前可以查看和修改自己的健康记录</text></view
        >
        <image class="arrow" src="/static/icons/forward.svg" mode="aspectFit" />
      </button>
      <view class="row row--disabled">
        <view class="row-copy"><text>记录提醒</text><text>将在账号与通知能力接入后开放</text></view>
        <text class="coming">准备中</text>
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
import { loadLocalProfile } from '../../features/health-loop/local-demo.js';
import { healthLoopState } from '../../features/health-loop/health-loop.store.js';
import { mePrimaryActions } from './me-actions.js';

const date = localDate();
const localProfile = computed(() => loadLocalProfile());
const displayName = computed(
  () => healthLoopState.today.value?.displayName || localProfile.value?.displayName || '健康管理者',
);
const initial = computed(() => displayName.value.trim().slice(0, 1) || '我');
const profileText = computed(() => {
  const plan = healthLoopState.today.value?.activePlan;
  if (plan) return plan.kind === 'sleep' ? '睡眠与精力计划进行中' : '体重管理计划进行中';
  return '查看并调整自己的健康档案';
});

function openProfile() {
  uni.navigateTo({ url: '/pages/profile/ProfilePage' });
}
function openAction(item: (typeof mePrimaryActions)[number]) {
  if (item.mode === 'tab') uni.switchTab({ url: item.route });
  else uni.navigateTo({ url: item.route });
}
function manageData() {
  uni.showModal({
    title: '数据管理',
    content: '当前版本支持查看和修改自己的健康记录。数据导出与彻底删除会在真实微信身份接入后开放。',
    showCancel: false,
  });
}
function localDate() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
onShow(() => healthLoopState.loadToday(date));
</script>

<style scoped>
.page {
  min-height: 100vh;
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;
  padding: 50rpx 32rpx 150rpx;
  background: #f7fbf8;
  color: #1d3d2a;
}
.page-header {
  display: flex;
  flex-direction: column;
  margin-bottom: 24rpx;
}
.page-header text:first-child {
  color: #244735;
  font-size: 40rpx;
  font-weight: 700;
}
.page-header text:last-child {
  margin-top: 6rpx;
  color: #809486;
  font-size: 21rpx;
}
.profile-summary {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 0 24rpx;
  border: 0;
  border-bottom: 1rpx solid #dfeae0;
  text-align: left;
  background: transparent;
}
.initial-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 82rpx;
  height: 82rpx;
  border: 2rpx solid #d9e7d8;
  border-radius: 50%;
  color: #52745c;
  background: #edf5ea;
  font-size: 32rpx;
  font-weight: 700;
}
.profile-copy {
  min-width: 0;
  flex: 1;
  margin-left: 18rpx;
}
.profile-copy text,
.row-copy text {
  display: block;
}
.profile-copy text:first-child {
  overflow: hidden;
  color: #284d36;
  font-size: 30rpx;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.profile-copy text:last-child {
  margin-top: 7rpx;
  overflow: hidden;
  color: #748b7d;
  font-size: 21rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.arrow {
  width: 30rpx;
  height: 30rpx;
  flex: none;
  margin-left: 16rpx;
  opacity: 0.66;
}
.section {
  margin-top: 32rpx;
}
.section-title {
  display: block;
  margin: 0 0 7rpx 2rpx;
  color: #63806d;
  font-size: 22rpx;
  font-weight: 700;
}
.row {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 102rpx;
  padding: 16rpx 2rpx;
  border: 0;
  border-bottom: 1rpx solid #e2ebe3;
  text-align: left;
  background: transparent;
}
.row-copy {
  min-width: 0;
  flex: 1;
}
.row-copy text:first-child {
  color: #31543e;
  font-size: 26rpx;
  font-weight: 700;
}
.row-copy text:last-child {
  margin-top: 6rpx;
  overflow: hidden;
  color: #7b9181;
  font-size: 20rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.row--disabled {
  opacity: 0.62;
}
.coming {
  padding: 6rpx 10rpx;
  border: 1rpx solid #d8e2d8;
  border-radius: 8rpx;
  color: #7f9384;
  font-size: 18rpx;
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
