<template>
  <view class="page">
    <view class="page-header"><text>我的</text><text>健康管理</text></view>

    <button class="profile-summary" @tap="openProfile">
      <view class="avatar-ring" @tap.stop="changeAvatar">
        <image class="avatar-img" :src="userAvatar" mode="aspectFill" />
        <view class="avatar-badge">
          <image class="avatar-badge-icon" src="/static/icons/svg/camera.svg" mode="aspectFit" />
        </view>
      </view>
      <view class="profile-copy">
        <view class="name-row" @tap.stop="editName">
          <text class="profile-name">{{ displayName }}</text>
          <image class="name-edit-icon" src="/static/icons/svg/forward.svg" mode="aspectFit" />
        </view>
        <text class="profile-sub">{{ profileText }}</text>
      </view>
      <image class="arrow" src="/static/icons/svg/forward.svg" mode="aspectFit" />
    </button>

    <view class="section">
      <text class="section-title">账号资料</text>
      <view class="card">
        <button class="row" @tap="changeAvatar">
          <view class="row-copy"
            ><text>更换头像</text
            ><text>从相册选择或拍一张，作为你的头像</text></view
          >
          <image class="arrow" src="/static/icons/svg/camera.svg" mode="aspectFit" />
        </button>
        <button class="row row--last" @tap="editName">
          <view class="row-copy"
            ><text>修改昵称</text
            ><text>首页问候语将显示这个称呼</text></view
          >
          <image class="arrow" src="/static/icons/svg/forward.svg" mode="aspectFit" />
        </button>
      </view>
    </view>

    <view class="section">
      <text class="section-title">健康管理</text>
      <view class="card">
        <button
          v-for="(item, index) in mePrimaryActions"
          :key="item.label"
          class="row"
          :class="{ 'row--last': index === mePrimaryActions.length - 1 }"
          @tap="openAction(item)"
        >
          <view class="row-copy"
            ><text>{{ item.label }}</text
            ><text>{{ item.detail }}</text></view
          >
          <image class="arrow" src="/static/icons/svg/forward.svg" mode="aspectFit" />
        </button>
      </view>
    </view>

    <view class="section">
      <text class="section-title">数据与隐私</text>
      <view class="card">
        <button class="row" @tap="manageData">
          <view class="row-copy"
            ><text>数据管理说明</text><text>当前可以查看和修改自己的健康记录</text></view
          >
          <image class="arrow" src="/static/icons/svg/forward.svg" mode="aspectFit" />
        </button>
        <button class="row" @tap="resetDemo">
          <view class="row-copy"
            ><text class="reset-title">重置本机数据</text
            ><text>清除本机保存的全部健康记录，登录状态会保留</text></view
          >
          <image class="arrow" src="/static/icons/svg/forward.svg" mode="aspectFit" />
        </button>
        <view class="row row--last row--disabled">
          <view class="row-copy"
            ><text>记录提醒</text><text>将在账号与通知能力接入后开放</text></view
          >
          <text class="coming">准备中</text>
        </view>
      </view>
    </view>

    <text class="foot">和生序提供健康管理参考，不提供疾病诊断或治疗建议。</text>
    <MiniTabBar active="me" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import MiniTabBar from '../../components/MiniTabBar.vue';
import { loadLocalProfile, resetLocalDemoData } from '../../features/health-loop/local-demo.js';
import {
  loadUserProfile,
  pickAndSaveAvatar,
  saveUserProfile,
} from '../../features/user-profile/user-profile.js';
import { healthLoopState } from '../../features/health-loop/health-loop.store.js';
import { goalLabels, type HealthGoal } from '../../features/health-profile/health-profile.types.js';
import { resetOnboarding } from '../../stores/onboarding.js';
import { mePrimaryActions } from './me-actions.js';

const date = localDate();
const localProfile = ref(loadLocalProfile());
const userProfile = ref(loadUserProfile());
const displayName = computed(
  () =>
    userProfile.value.displayName ||
    healthLoopState.today.value?.displayName ||
    localProfile.value?.displayName ||
    '健康管理者',
);
const userAvatar = computed(
  () => userProfile.value.avatarPath || '/static/illustrations/default-user-avatar.png',
);

async function changeAvatar() {
  try {
    const avatarPath = await pickAndSaveAvatar();
    userProfile.value = saveUserProfile({ avatarPath });
    uni.showToast({ title: '头像已更新', icon: 'success' });
  } catch {
    /* 用户取消选择，不提示 */
  }
}

function editName() {
  uni.showModal({
    title: '修改昵称',
    editable: true,
    placeholderText: '输入新的昵称（最长 12 字）',
    content: userProfile.value.displayName || '',
    success: ({ confirm, content }) => {
      if (!confirm) return;
      const name = (content || '').trim().slice(0, 12);
      if (!name) {
        uni.showToast({ title: '昵称不能为空', icon: 'none' });
        return;
      }
      userProfile.value = saveUserProfile({ displayName: name });
      uni.showToast({ title: '昵称已更新', icon: 'success' });
    },
  });
}
const profileText = computed(() => {
  const goals = (localProfile.value?.goals || []).filter(
    (goal): goal is HealthGoal => goal in goalLabels,
  );
  if (goals.length) return goals.map((goal) => goalLabels[goal]).join(' · ');
  const plan = healthLoopState.today.value?.activePlan;
  if (plan) return plan.kind === 'sleep' ? '睡眠与精力计划进行中' : '体重管理计划进行中';
  return '查看并调整自己的健康档案';
});

function openProfile() {
  uni.navigateTo({ url: '/pages/profile/ProfilePage' });
}
function openAction(item: (typeof mePrimaryActions)[number]) {
  uni.navigateTo({ url: item.route });
}
function manageData() {
  uni.showModal({
    title: '数据管理',
    content: '当前版本支持查看和修改自己的健康记录。数据导出与彻底删除会在真实微信身份接入后开放。',
    showCancel: false,
  });
}
function resetDemo() {
  uni.showModal({
    title: '重置本机数据',
    content: '将清除本机保存的建档、计划、体重、饮食、喝水、睡眠、经期和用药记录，并重新进入建档流程。登录状态会保留，仅影响当前设备。',
    confirmText: '重置',
    success: (result) => {
      if (!result.confirm) return;
      resetLocalDemoData();
      resetOnboarding();
      uni.reLaunch({ url: '/pages/onboarding/OnboardingPage' });
    },
  });
}
function localDate() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
onShow(() => {
  localProfile.value = loadLocalProfile();
  userProfile.value = loadUserProfile();
  healthLoopState.loadToday(date, { force: true });
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;
  padding: calc(env(safe-area-inset-top) + 44rpx) 32rpx calc(var(--hz-tabbar-height) + env(safe-area-inset-bottom) + 44rpx);
  background: transparent;
  color: var(--hz-ink);
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
  align-self: flex-start;
  margin-top: 12rpx;
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  color: #4c7d5a;
  background: #e3f2e4;
  font-size: 20rpx;
  font-weight: 600;
}
.profile-summary {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 28rpx 26rpx;
  border: 1rpx solid var(--hz-rule-glass);
  border-radius: var(--hz-radius-card);
  text-align: left;
  background: var(--hz-surface-glass);
  box-shadow: var(--hz-highlight), var(--hz-shadow-card);
  -webkit-backdrop-filter: var(--hz-blur);
  backdrop-filter: var(--hz-blur);
}
.avatar-ring {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 108rpx;
  height: 108rpx;
  flex: none;
  padding: 5rpx;
  border: 1rpx solid rgba(159, 195, 173, 0.6);
  border-radius: 50%;
  background: linear-gradient(160deg, #ffffff 0%, #eef5ef 100%);
  box-shadow: 0 10rpx 22rpx rgba(29, 55, 41, 0.12), inset 0 1rpx 0 rgba(255, 255, 255, 0.95);
}
.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}
.avatar-badge {
  position: absolute;
  right: -2rpx;
  bottom: -2rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #ffffff;
  border-radius: 50%;
  background: var(--hz-green);
  box-shadow: 0 4rpx 10rpx rgba(47, 107, 77, 0.3);
}
.avatar-badge-icon {
  width: 22rpx;
  height: 22rpx;
}
.profile-copy {
  min-width: 0;
  flex: 1;
  margin-left: 20rpx;
}
.name-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
  min-width: 0;
}
.profile-name {
  overflow: hidden;
  color: var(--hz-ink);
  font-size: 32rpx;
  font-weight: 750;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.name-edit-icon {
  width: 24rpx;
  height: 24rpx;
  flex: none;
  opacity: 0.45;
}
.profile-sub {
  display: block;
  margin-top: 8rpx;
  overflow: hidden;
  color: var(--hz-muted);
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
  margin-top: 30rpx;
}
.section-title {
  display: block;
  margin: 0 4rpx 12rpx;
  color: var(--hz-muted);
  font-size: 22rpx;
  font-weight: 700;
}
.card {
  overflow: hidden;
  border: 1rpx solid var(--hz-rule-glass);
  border-radius: var(--hz-radius-card);
  background: var(--hz-surface-glass);
  box-shadow: var(--hz-highlight), var(--hz-shadow-card);
  -webkit-backdrop-filter: var(--hz-blur);
  backdrop-filter: var(--hz-blur);
}
.row {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 102rpx;
  padding: 16rpx 24rpx;
  border-bottom: 1rpx solid #eef4ef;
  text-align: left;
  background: transparent;
}
.row--last {
  border-bottom: 0;
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
.reset-title {
  color: #b85e43;
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
