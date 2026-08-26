<template>
  <view class="hero">
    <image :src="image" mode="aspectFit" />
    <view class="wash" />
    <view class="copy">
      <text class="eyebrow">{{ eyebrow }}</text>
      <text class="title">{{ title }}</text>
      <text class="description">{{ description }}</text>
      <button class="action" @tap="$emit('action')">{{ actionLabel }}</button>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  image: string;
  eyebrow: string;
  title: string;
  description: string;
  actionLabel: string;
}>();
defineEmits<{ action: [] }>();
</script>

<style scoped>
.hero {
  position: relative;
  height: 456rpx;
  overflow: hidden;
  border: 2rpx solid #d9e8da;
  border-radius: 24rpx;
  background: #fffdf5;
  box-shadow: 0 10rpx 26rpx rgba(46, 125, 79, 0.08);
}
.hero image,
.wash {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.hero image {
  background: #fffdf5;
}
.wash {
  background: linear-gradient(
    90deg,
    rgba(253, 255, 249, 0.97) 0%,
    rgba(253, 255, 249, 0.75) 47%,
    rgba(253, 255, 249, 0) 82%
  );
}
.copy {
  position: absolute;
  top: 28rpx;
  left: 26rpx;
  z-index: 1;
  width: 53%;
}
.eyebrow,
.title,
.description {
  display: block;
}
.eyebrow {
  color: #3a7e59;
  font-size: 22rpx;
  font-weight: 700;
}
.title {
  margin-top: 8rpx;
  color: #1d3d2a;
  font-size: 36rpx;
  font-weight: 700;
  line-height: 1.3;
}
.description {
  margin-top: 8rpx;
  color: #587362;
  font-size: 22rpx;
  line-height: 1.5;
}
.action {
  display: inline-block;
  width: auto;
  height: 54rpx;
  margin: 16rpx 0 0;
  padding: 0 22rpx;
  border-radius: 27rpx;
  color: #fff;
  background: #2e7d4f;
  font-size: 22rpx;
  line-height: 54rpx;
  box-shadow: 0 6rpx 12rpx rgba(46, 125, 79, 0.16);
}
</style>
