<template>
  <view class="nav-bar-wrapper">
    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }" />
    
    <!-- 导航栏 -->
    <view class="nav-bar">
      <button v-if="!backDisabled" class="icon-action" aria-label="返回" @tap="back">
        <image class="icon-image" src="/static/icons/svg/back.svg" mode="aspectFit" />
      </button>
      <view v-else class="placeholder" />
      <text class="title">{{ title }}</text>
      <button v-if="closeLabel" class="icon-action close" aria-label="退出" @tap="close">
        <image class="icon-image" src="/static/icons/svg/close.svg" mode="aspectFit" />
      </button>
      <view v-else class="placeholder" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ordinaryBackTarget } from './navigation.js';

const props = defineProps<{
  title: string;
  route: string;
  closeLabel?: string;
  backDisabled?: boolean;
  backMode?: 'navigate' | 'emit';
}>();
const emit = defineEmits<{ close: []; back: [] }>();

const statusBarHeight = ref(0);

onMounted(() => {
  // 获取系统状态栏高度
  const systemInfo = uni.getSystemInfoSync();
  statusBarHeight.value = systemInfo.statusBarHeight || 0;
});

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
  uni.reLaunch({ url: ordinaryBackTarget(props.route) });
}
function close() {
  emit('close');
}
</script>

<style scoped>
.nav-bar-wrapper {
  position: relative;
  background: linear-gradient(180deg, #f8fdf9 0%, #f5f8f6 100%);
}

.status-bar {
  width: 100%;
  background: linear-gradient(180deg, #f8fdf9 0%, #f5f8f6 100%);
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 24rpx;
  background: transparent;
}

.icon-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  padding: 0;
  border: 2rpx solid #d4e5d4;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2rpx 8rpx rgba(41, 66, 50, 0.08);
  transition: all 0.2s ease;
}

.icon-action::after {
  border: none;
}

.icon-action:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 1);
}

.icon-image {
  width: 32rpx;
  height: 32rpx;
}

.title {
  flex: 1;
  color: #244735;
  font-size: 32rpx;
  font-weight: 700;
  text-align: center;
  line-height: 1.2;
}

.placeholder {
  width: 64rpx;
  height: 64rpx;
}
</style>
