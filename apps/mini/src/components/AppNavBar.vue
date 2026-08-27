<template>
  <view class="nav-bar">
    <button v-if="!backDisabled" class="icon-action" aria-label="返回" @tap="back">
      <image class="icon-image" src="/static/icons/back.svg" mode="aspectFit" />
    </button>
    <view v-else class="placeholder" />
    <text class="title">{{ title }}</text>
    <button v-if="closeLabel" class="icon-action close" aria-label="退出" @tap="close">
      <image class="icon-image" src="/static/icons/close.svg" mode="aspectFit" />
    </button>
    <view v-else class="placeholder" />
  </view>
</template>

<script setup lang="ts">
import { ordinaryBackTarget } from './navigation.js';

const props = defineProps<{
  title: string;
  route: string;
  closeLabel?: string;
  backDisabled?: boolean;
  backMode?: 'navigate' | 'emit';
}>();
const emit = defineEmits<{ close: []; back: [] }>();

function back() {
  if (props.backMode === 'emit') {
    emit('back');
    return;
  }
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
  height: 76rpx;
  margin: -8rpx -8rpx 18rpx;
}
.icon-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  padding: 0;
  border: 1rpx solid #dfe8df;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 3rpx 9rpx rgba(41, 66, 50, 0.05);
}
.icon-image {
  width: 32rpx;
  height: 32rpx;
}
.title {
  color: #244735;
  font-size: 31rpx;
  font-weight: 700;
}
.placeholder {
  width: 64rpx;
}
</style>
