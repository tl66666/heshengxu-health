<template>
  <view class="hero">
    <image class="hero-image" :src="image" mode="aspectFill" />
    <view class="wash" :class="{ 'wash--right': copySide === 'right' }" />
    <view class="copy" :class="{ 'copy--right': copySide === 'right' }">
      <text class="eyebrow">{{ eyebrow }}</text>
      <text class="title">{{ title }}</text>
      <text class="description">{{ description }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    image: string;
    eyebrow: string;
    title: string;
    description: string;
    copySide?: 'left' | 'right';
  }>(),
  { copySide: 'left' },
);
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
.wash--right {
  background: linear-gradient(
    270deg,
    rgba(253, 255, 249, 0.97) 0%,
    rgba(253, 255, 249, 0.78) 45%,
    rgba(253, 255, 249, 0) 80%
  );
}
.copy {
  position: absolute;
  top: 28rpx;
  left: 26rpx;
  z-index: 1;
  width: 58%;
}
.copy--right {
  right: 26rpx;
  left: auto;
  width: 52%;
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
</style>
