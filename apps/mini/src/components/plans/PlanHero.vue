<template>
  <view class="hero">
    <image class="hero-bg" src="/static/illustrations/plan-hero-banner.png" mode="widthFix" />
    <view class="hero-wash" />
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
  </view>
</template>

<script setup lang="ts">
defineProps<{ completed: number; streak: number; weekCheckins: number }>();
const now = new Date();
const dateLabel = `${now.getMonth() + 1} 月 ${now.getDate()} 日`;
</script>

<style scoped>
.hero {
  position: relative;
  min-height: 0;
  overflow: hidden;
  margin: 0 calc(var(--hz-gutter) * -1);
  border: 0;
  border-radius: 0;
  background: #ffffff;
  box-shadow: 0 16rpx 34rpx rgba(54, 83, 67, .08);
}
.hero-bg {
  display: block;
  width: 100%;
  height: auto;
  background: #f8f4ea;
}
.hero-wash {
  display: none;
}
.hero-copy {
  position: relative;
  z-index: 1;
  margin-top: -28rpx;
  padding: 40rpx 26rpx 22rpx;
  border-radius: 24rpx 24rpx 0 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, .78) 0%, #ffffff 42rpx);
}
.eyebrow { display:block; color:#7f9c82; font-size:20rpx; }
.title { display:block; margin-top:10rpx; color:#3e5d48; font-size:32rpx; font-weight:700; line-height:1.25; }
.subtitle { display:block; margin-top:7rpx; color:#7f9184; font-size:19rpx; line-height:1.45; }
.hero-metrics { display:flex; gap:22rpx; margin-top:16rpx; }
.hero-metrics view { display:flex; align-items:baseline; gap:6rpx; }
.metric-value { color:#5f8d68; font-size:28rpx; font-weight:700; }
.metric-label { color:#8c9d8f; font-size:17rpx; }
@media (max-width: 360px) {
  .hero-copy { padding-right: 20rpx; padding-left: 20rpx; }
  .hero-metrics { gap: 14rpx; }
}
</style>
