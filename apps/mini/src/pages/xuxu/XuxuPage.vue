<template>
  <view class="page">
    <XuxuChatComposer />
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
  padding: 24rpx 24rpx 124rpx;
  background: #f7fbf8;
  color: #1d3d2a;
}
</style>
