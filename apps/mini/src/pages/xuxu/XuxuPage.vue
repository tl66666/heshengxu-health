<template>
  <view class="page">
    <view class="chat-area">
      <XuxuChatComposer class="chat-composer-host" />
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
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 0;
  background: #fffdf5;
  color: #1d3d2a;
}
.chat-area {
  display: flex;
  flex: none;
  width: 100%;
  height: calc(
    100vh - var(--hz-tabbar-height) - var(--hz-tabbar-offset) * 2 - env(safe-area-inset-bottom)
  );
  min-height: 0;
  min-width: 0;
  overflow: hidden;
}
.chat-composer-host {
  display: flex;
  flex: 1 1 auto;
  width: 100%;
  max-width: 100%;
  min-height: 0;
  min-width: 0;
  box-sizing: border-box;
}
</style>
