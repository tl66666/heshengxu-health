<template>
  <view class="nav-bar">
    <button v-if="!backDisabled" class="back" aria-label="返回" @tap="back">
      <image src="/static/icons/back.svg" mode="aspectFit" /><text>返回</text>
    </button>
    <view v-else class="placeholder" />
    <text class="title">{{ title }}</text>
    <button v-if="closeLabel" class="close" aria-label="退出" @tap="close">
      <image src="/static/icons/close.svg" mode="aspectFit" /><text>{{ closeLabel }}</text>
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
.back,
.close {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  min-width: 104rpx;
  height: 56rpx;
  padding: 0 12rpx;
  border-radius: 14rpx;
  color: #397651;
  background: transparent;
  font-size: 23rpx;
  line-height: 56rpx;
}
.close {
  color: #8d685b;
  background: #fff4ef;
}
.back image,
.close image {
  width: 34rpx;
  height: 34rpx;
}
.title {
  color: #244735;
  font-size: 31rpx;
  font-weight: 700;
}
.placeholder {
  width: 104rpx;
}
</style>
