<template>
  <view class="nav-bar">
    <button class="back" aria-label="返回" @tap="back">返回</button>
    <text class="title">{{ title }}</text>
    <button v-if="closeLabel" class="close" aria-label="退出" @tap="close">{{ closeLabel }}</button>
    <view v-else class="placeholder" />
  </view>
</template>

<script setup lang="ts">
import { ordinaryBackTarget } from './navigation.js';

const props = defineProps<{ title: string; route: string; closeLabel?: string }>();
const emit = defineEmits<{ close: [] }>();

function back() {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
    return;
  }
  uni.switchTab({ url: ordinaryBackTarget(props.route) });
}
function close() {
  emit('close');
}
</script>

<style scoped>
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  margin: -12rpx -8rpx 18rpx;
}
.back,
.close {
  min-width: 112rpx;
  height: 64rpx;
  padding: 0 18rpx;
  border-radius: 32rpx;
  color: #397651;
  background: #edf6ee;
  font-size: 24rpx;
  line-height: 64rpx;
}
.close {
  color: #8d685b;
  background: #fff2ed;
}
.title {
  color: #244735;
  font-size: 31rpx;
  font-weight: 700;
}
.placeholder {
  width: 112rpx;
}
</style>
