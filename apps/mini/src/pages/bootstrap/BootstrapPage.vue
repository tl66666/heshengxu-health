<template>
  <view class="bootstrap-page">
    <!-- 背景插画：完整显示 -->
    <image
      class="bg-illustration"
      src="/static/illustrations/onboarding-guide-vertical.png"
      mode="widthFix"
    />

    <!-- 渐变遮罩 -->
    <view class="bg-overlay" />

    <!-- 内容区 -->
    <view class="content-wrapper">
      <!-- 序序头像 + 品牌 -->
      <view class="brand-section hz-rise">
        <image src="/static/illustrations/xuxu-avatar.png" class="xuxu-avatar" mode="aspectFill" />
        <view class="brand-text">
          <text class="app-name">和生序</text>
          <text class="app-tagline">让健康回到自己的节律</text>
        </view>
      </view>

      <!-- 加载提示 -->
      <view class="loading-section hz-rise hz-rise-1">
        <view class="loading-spinner">
          <view class="spinner-dot" />
          <view class="spinner-dot" />
          <view class="spinner-dot" />
        </view>
        <text class="loading-text">正在为你准备健康旅程...</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { createMiniApiClient } from '../../services/mini-api.js';
import { onboardingState } from '../../stores/onboarding.js';
import { loadLocalProfile } from '../../features/health-loop/local-demo.js';

onShow(async () => {
  const client = createMiniApiClient();

  // 先检查本地档案
  const localProfile = loadLocalProfile();
  if (localProfile && localProfile.heightCm && localProfile.weightKg) {
    onboardingState.completed.value = true;
    setTimeout(() => {
      uni.switchTab({ url: '/pages/home/HomePage' });
    }, 800);
    return;
  }

  // 再检查远程档案
  try {
    const profile = await client.get<{
      heightCm: number | null;
      weightKg: number | null;
      primaryGoal?: string | null;
    }>('/health-profiles/me');

    if (profile.heightCm && profile.weightKg && profile.primaryGoal) {
      onboardingState.completed.value = true;
      setTimeout(() => {
        uni.switchTab({ url: '/pages/home/HomePage' });
      }, 800);
      return;
    }
  } catch {
    // 远程检查失败，继续到建档页
  }

  // 没有档案，进入建档流程
  setTimeout(() => {
    uni.redirectTo({ url: '/pages/onboarding/OnboardingPage' });
  }, 1200);
});
</script>

<style scoped>
.bootstrap-page {
  position: relative;
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(180deg, #e8f4ea 0%, #f7fbf8 100%);
}

/* 背景插画 */
.bg-illustration {
  position: absolute;
  top: 0;
  left: 50%;
  width: 100%;
  transform: translateX(-50%);
  opacity: 0.6;
  z-index: 0;
}

.bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, rgba(247, 251, 248, 0.4) 0%, rgba(247, 251, 248, 0.95) 100%);
  z-index: 1;
}

/* 内容区 */
.content-wrapper {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 64rpx;
  padding: 0 48rpx;
}

/* 品牌区 */
.brand-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32rpx;
}

.xuxu-avatar {
  width: 128rpx;
  height: 128rpx;
  border: 5rpx solid #f4e3a0;
  border-radius: 50%;
  box-shadow: 0 12rpx 36rpx rgba(239, 214, 137, 0.5);
}

.brand-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.app-name {
  color: #2d6943;
  font-size: 48rpx;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.app-tagline {
  color: #5a9572;
  font-size: 28rpx;
  font-weight: 600;
  letter-spacing: 0.08em;
}

/* 加载区 */
.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
}

.loading-spinner {
  display: flex;
  gap: 16rpx;
}

.spinner-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #7fcc8f;
  animation: bounce 1.4s infinite ease-in-out;
}

.spinner-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.spinner-dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

.loading-text {
  color: #6f8879;
  font-size: 26rpx;
  line-height: 1.6;
}

/* 入场动画 */
.hz-rise {
  animation: riseIn 0.8s cubic-bezier(0.22, 0.8, 0.36, 1) forwards;
  opacity: 0;
}

.hz-rise-1 {
  animation-delay: 0.2s;
}

@keyframes riseIn {
  from {
    opacity: 0;
    transform: translateY(40rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
