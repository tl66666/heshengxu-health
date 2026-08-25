<template>
  <view class="page">
    <view class="page-head">
      <view>
        <text class="eyebrow">序序 · 健康陪伴</text>
        <text class="title">今天想从哪里开始照顾自己？</text>
      </view>
      <image class="avatar" src="/static/illustrations/xuxu-avatar.jpg" mode="aspectFill" />
    </view>
    <XuxuChatComposer />
    <view class="safety">
      <image src="/static/illustrations/xuxu-safe-support.png" mode="aspectFill" />
      <view>
        <text>需要专业帮助时</text>
        <text>如果出现持续不适或紧急症状，请及时联系医生或当地急救服务。</text>
      </view>
    </view>
    <MiniTabBar active="xuxu" />
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import MiniTabBar from '../../components/MiniTabBar.vue';
import XuxuChatComposer from '../../components/XuxuChatComposer.vue';
import { healthLoopState } from '../../features/health-loop/health-loop.store.js';

const date = localDate();
onShow(() => healthLoopState.loadToday(date));

function localDate() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 44rpx 32rpx 190rpx;
  background: #f7fbf8;
  color: #1d3d2a;
}
.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.eyebrow,
.title {
  display: block;
}
.eyebrow {
  color: #668e76;
  font-size: 22rpx;
  font-weight: 700;
}
.title {
  margin-top: 9rpx;
  color: #244735;
  font-size: 38rpx;
  font-weight: 700;
  line-height: 1.3;
}
.avatar {
  width: 72rpx;
  height: 72rpx;
  border: 3rpx solid #f0da8c;
  border-radius: 50%;
}
.safety {
  display: flex;
  align-items: center;
  gap: 14rpx;
  margin-top: 22rpx;
  padding: 14rpx 16rpx;
  border: 2rpx solid #e0e9e0;
  border-radius: 16rpx;
  background: #f5f9f4;
}
.safety image {
  width: 76rpx;
  height: 76rpx;
  flex: none;
  border-radius: 14rpx;
}
.safety view {
  min-width: 0;
}
.safety text {
  display: block;
  color: #4b6f55;
  font-size: 22rpx;
  font-weight: 700;
}
.safety text:last-child {
  margin-top: 5rpx;
  color: #788e7e;
  font-size: 20rpx;
  font-weight: 400;
  line-height: 1.45;
}
</style>
