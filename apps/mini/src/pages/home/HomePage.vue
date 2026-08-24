<template>
  <view class="page">
    <text class="eyebrow">和生序 · 今日</text>
    <text class="title">{{ greeting }}，{{ displayName }}</text>
    <text class="hint">从一个小动作开始，让健康回到自己的节律。</text>
    <view class="card"><text class="card-title">今日状态</text><text class="card-value">{{ bmiText }}</text><text class="card-note">继续记录，明天会更清晰</text></view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { createApiClient } from '../../services/api-client.js';
import { onboardingState } from '../../stores/onboarding.js';

const displayName = ref('朋友');
const bmiText = ref('完善档案后显示 BMI');
const greeting = new Date().getHours() < 12 ? '早上好' : new Date().getHours() < 18 ? '下午好' : '晚上好';

onShow(async () => {
  if (!onboardingState.completed.value) {
    uni.redirectTo({ url: '/pages/onboarding/OnboardingPage' });
    return;
  }
  const baseUrl = 'http://localhost:3000/api/v1';
  const client = createApiClient({
    baseUrl,
    request: ({ url, method, data }) =>
      new Promise((resolve, reject) => {
        uni.request({
          url,
          method,
          data: data as Record<string, unknown>,
          header: { Authorization: 'Bearer dev-mini-user' },
          success: (response) => resolve({ statusCode: response.statusCode, data: response.data as never }),
          fail: reject,
        });
      }),
  });
  try {
    const profile = await client.get<{ displayName: string | null; bmi?: number | null }>('/health-profiles/me');
    displayName.value = profile.displayName || '朋友';
    bmiText.value = profile.bmi ? `BMI ${profile.bmi.toFixed(1)}` : '今天先从记录开始';
  } catch {
    bmiText.value = '暂时无法加载状态';
  }
});
</script>

<style scoped>
.page { min-height: 100vh; padding: 72rpx 44rpx; box-sizing: border-box; background: #f7fbf8; color: #183425; }
.eyebrow { display: block; color: #5c8b6c; font-size: 25rpx; font-weight: 700; margin-bottom: 22rpx; }
.title { display: block; font-size: 48rpx; font-weight: 700; line-height: 1.3; margin-bottom: 18rpx; }
.hint { display: block; color: #668071; font-size: 28rpx; line-height: 1.6; }
.card { margin-top: 70rpx; padding: 34rpx; border-radius: 22rpx; background: #e7f4ea; }
.card-title, .card-value, .card-note { display: block; }
.card-title { color: #5a8065; font-size: 25rpx; }
.card-value { margin-top: 20rpx; color: #24653c; font-size: 40rpx; font-weight: 700; }
.card-note { margin-top: 14rpx; color: #6d8b76; font-size: 24rpx; }
</style>
