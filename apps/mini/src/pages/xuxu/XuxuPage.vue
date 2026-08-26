<template>
  <view class="page">
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
  height: 100vh;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 24rpx 24rpx 136rpx;
  background: #f7fbf8;
  color: #1d3d2a;
}
.safety {
  display: flex;
  align-items: center;
  gap: 14rpx;
  margin-top: 10rpx;
  padding: 9rpx 12rpx;
  border: 1rpx solid #e0e9e0;
  border-radius: 14rpx;
  background: #f5f9f4;
}
.safety image {
  width: 58rpx;
  height: 58rpx;
  flex: none;
  border-radius: 14rpx;
}
.safety view {
  min-width: 0;
}
.safety text {
  display: block;
  color: #4b6f55;
  font-size: 20rpx;
  font-weight: 700;
}
.safety text:last-child {
  margin-top: 5rpx;
  color: #788e7e;
  font-size: 18rpx;
  font-weight: 400;
  line-height: 1.45;
}
</style>
