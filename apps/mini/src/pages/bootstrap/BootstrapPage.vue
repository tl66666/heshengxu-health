<template>
  <view class="bootstrap-page">
    <text class="eyebrow">和生序 · 健康管理</text>
    <text class="title">让健康回到自己的节律</text>
    <text class="description">开发环境已连接。正式建档、健康记录与 AI 助手将在产品确认后接入。</text>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { createApiClient } from '../../services/api-client.js';
import { onboardingState } from '../../stores/onboarding.js';

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
          success: (response) => resolve({ statusCode: response.statusCode, data: response.data as never }),
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
    // The onboarding page remains available when the local API is offline.
  }
  uni.redirectTo({ url: '/pages/onboarding/OnboardingPage' });
});
</script>

<style scoped>
.bootstrap-page {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  justify-content: center;
  gap: 20rpx;
  padding: 80rpx 56rpx;
}

.eyebrow {
  color: #2e7d4f;
  font-size: 24rpx;
  font-weight: 700;
}

.title {
  color: #183425;
  font-size: 48rpx;
  font-weight: 700;
}

.description {
  color: #668071;
  font-size: 28rpx;
  line-height: 1.7;
}
</style>
