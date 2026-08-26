<template>
  <view class="page">
    <image class="hero" src="/static/illustrations/hero.jpg" mode="aspectFit" />
    <view class="wash" />
    <view class="copy">
      <view class="xuxu"
        ><image src="/static/illustrations/xuxu-avatar.jpg" mode="aspectFill" /><text
          >序序</text
        ></view
      >
      <text class="eyebrow">和生序 · 健康管理</text>
      <text class="title">让健康回到自己的节律</text>
      <text class="hint">正在为你准备一段更适合自己的健康旅程。</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { createApiClient } from '../../services/api-client.js';
import { onboardingState } from '../../stores/onboarding.js';
import { loadLocalProfile } from '../../features/health-loop/local-demo.js';

onShow(async () => {
  const client = createApiClient({
    baseUrl: 'http://localhost:3000/api/v1',
    request: ({ url, method, data }) =>
      new Promise((resolve, reject) => {
        uni.request({
          url,
          method: method as never,
          data: data as Record<string, unknown>,
          header: { Authorization: 'Bearer dev-mini-user' },
          success: (response) =>
            resolve({ statusCode: response.statusCode, data: response.data as never }),
          fail: reject,
        });
      }),
  });
  try {
    const profile = await client.get<{
      heightCm: number | null;
      weightKg: number | null;
      primaryGoal?: string | null;
    }>('/health-profiles/me');
    if (profile.heightCm && profile.weightKg && profile.primaryGoal) {
      onboardingState.completed.value = true;
      uni.switchTab({ url: '/pages/home/HomePage' });
      return;
    }
  } catch {
    if (loadLocalProfile()) {
      onboardingState.completed.value = true;
      uni.switchTab({ url: '/pages/home/HomePage' });
      return;
    }
  }
  uni.redirectTo({ url: '/pages/onboarding/OnboardingPage' });
});
</script>

<style scoped>
.page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: #eef5ec;
}
.hero,
.wash {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.hero {
  background: #fffdf5;
}
.wash {
  background: linear-gradient(180deg, rgba(248, 253, 246, 0.2), rgba(248, 253, 246, 0.94) 84%);
}
.copy {
  position: absolute;
  right: 52rpx;
  bottom: 130rpx;
  left: 52rpx;
}
.xuxu {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 22rpx;
  color: #496b55;
  font-size: 23rpx;
  font-weight: 700;
}
.xuxu image {
  width: 58rpx;
  height: 58rpx;
  border: 3rpx solid #f0d98a;
  border-radius: 50%;
}
.eyebrow,
.title,
.hint {
  display: block;
}
.eyebrow {
  color: #3d805a;
  font-size: 24rpx;
  font-weight: 700;
}
.title {
  margin-top: 14rpx;
  color: #173625;
  font-size: 52rpx;
  font-weight: 700;
  line-height: 1.24;
}
.hint {
  margin-top: 18rpx;
  color: #577261;
  font-size: 27rpx;
  line-height: 1.6;
}
</style>
