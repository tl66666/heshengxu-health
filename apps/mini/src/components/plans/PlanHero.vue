<template>
  <view class="hero">
    <view class="hero-copy">
      <text class="eyebrow">{{ dateLabel }} · 今日节奏</text>
      <text class="title">把想做的事，变成小小的日常</text>
      <text class="subtitle">完成一点点，就已经在照顾自己了。</text>
      <view class="hero-metrics">
        <view><text class="metric-value">{{ completed }}</text><text class="metric-label">今日完成</text></view>
        <view><text class="metric-value">{{ streak }}</text><text class="metric-label">连续天数</text></view>
        <view><text class="metric-value">{{ weekCheckins }}</text><text class="metric-label">本周完成</text></view>
      </view>
    </view>
    <image class="hero-art" src="/static/illustrations/xuxu-avatar.png" mode="aspectFit" />
  </view>
</template>

<script setup lang="ts">
defineProps<{ completed: number; streak: number; weekCheckins: number }>();
const now = new Date();
const dateLabel = `${now.getMonth() + 1} 月 ${now.getDate()} 日`;
</script>

<style scoped>
.hero { display:flex; justify-content:space-between; min-height:240rpx; padding:30rpx 28rpx 22rpx; overflow:hidden; border:1rpx solid #e2ebe1; border-radius:24rpx; background:#ffffff; box-shadow:0 12rpx 30rpx rgba(54,83,67,.08); }
.hero-copy { min-width:0; padding-top:4rpx; }
.eyebrow { display:block; color:#6f9f7a; font-size:21rpx; }
.title { display:block; max-width:440rpx; margin-top:14rpx; color:#365343; font-size:36rpx; font-weight:700; line-height:1.25; }
.subtitle { display:block; margin-top:10rpx; color:#84988c; font-size:22rpx; }
.hero-metrics { display:flex; gap:24rpx; margin-top:24rpx; }
.hero-metrics view { display:flex; align-items:baseline; gap:8rpx; }
.metric-value { color:#5f8d68; font-size:33rpx; font-weight:700; }
.metric-label { color:#8ba092; font-size:20rpx; }
.hero-art { align-self:flex-end; width:176rpx; height:176rpx; margin-right:-10rpx; margin-bottom:-8rpx; }
</style>
