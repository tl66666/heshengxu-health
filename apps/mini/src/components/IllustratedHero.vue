<template>
  <view class="hero">
    <image class="hero-image" :src="image" mode="aspectFill" />
    <view class="wash" />
    <view class="copy">
      <text class="eyebrow">{{ eyebrow }}</text>
      <text class="title">{{ title }}</text>
      <text class="description">{{ description }}</text>
    </view>
    <button class="action" @tap="$emit('action')">
      <text>{{ actionLabel }}</text
      ><image class="action-arrow" src="/static/icons/forward.svg" mode="aspectFit" />
    </button>
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
.hero-image,
.wash {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
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
  width: 58%;
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
  font-size: 21rpx;
  line-height: 1.5;
}
.action {
  position: absolute;
  right: 20rpx;
  bottom: 20rpx;
  left: 20rpx;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72rpx;
  padding: 0 22rpx;
  border: 1rpx solid rgba(205, 201, 166, 0.9);
  border-radius: 12rpx;
  color: #5c604d;
  background: rgba(255, 253, 245, 0.72);
  font-size: 24rpx;
  font-weight: 700;
  line-height: 72rpx;
  box-shadow: none;
}
.action-arrow {
  width: 30rpx;
  height: 30rpx;
}
</style>
