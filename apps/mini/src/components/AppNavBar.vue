<template>
  <view
    :class="['nav-bar-wrapper', `nav-tone-${tone}`]"
    :style="{ '--nav-height': layout.barHeight + 'px', '--nav-right': layout.rightInset + 'px' }"
  >
    <view class="status-bar" :style="{ height: layout.statusBarHeight + 'px' }" />
    <view class="nav-bar">
      <button
        v-if="!backDisabled"
        class="icon-action"
        aria-label="返回"
        hover-class="nav-action-pressed"
        @tap="back"
      >
        <image class="icon-image" src="/static/icons/svg/back.svg" mode="aspectFit" />
      </button>
      <view v-else class="placeholder" />
      <view class="nav-title-group"
        ><text v-if="tone !== 'default'" class="nav-caption">{{
          tone === 'paper' ? '阅读手记' : '和生序 · 生活指南'
        }}</text
        ><text class="title">{{ title }}</text></view
      >
      <button v-if="closeLabel" class="icon-action close" aria-label="退出" @tap="close">
        <image class="icon-image" src="/static/icons/svg/close.svg" mode="aspectFit" />
      </button>
    </view>
  </view>
</template>
<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { ordinaryBackTarget } from './navigation.js';
import { navigationLayout } from './navigation-layout.js';
const props = defineProps<{
  title: string;
  route: string;
  closeLabel?: string;
  backDisabled?: boolean;
  backMode?: 'navigate' | 'emit';
}>();
const emit = defineEmits<{ close: []; back: [] }>();
const tone = computed(() =>
  /GuidePage|BiblePage/.test(props.route)
    ? 'paper'
    : /version-answer|lean-muscle/.test(props.route)
      ? 'library'
      : 'default',
);
function readLayout() {
  try {
    const system = uni.getSystemInfoSync();
    let capsule;
    try {
      capsule = uni.getMenuButtonBoundingClientRect?.();
    } catch {
      /* App has no native capsule. */
    }
    return navigationLayout(system, capsule);
  } catch {
    return navigationLayout();
  }
}
const layout = ref(readLayout());
onMounted(() => {
  layout.value = readLayout();
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
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100vw;
  margin-left: calc(50% - 50vw);
  --app-nav-surface: rgba(255, 253, 249, 0.9);
  --app-nav-ink: #405447;
  --app-nav-rule: rgba(90, 105, 89, 0.06);
  background: var(--app-nav-surface);
  border-bottom: 1rpx solid var(--app-nav-rule);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.nav-tone-library {
  --app-nav-surface: rgba(247, 242, 232, 0.94);
  --app-nav-ink: #685a45;
  --app-nav-rule: rgba(157, 124, 77, 0.1);
  --app-nav-button: rgba(245, 235, 216, 0.65);
}
.nav-tone-paper {
  --app-nav-surface: rgba(240, 231, 213, 0.95);
  --app-nav-ink: #755b3c;
  --app-nav-rule: rgba(157, 124, 77, 0.14);
  --app-nav-button: rgba(242, 229, 205, 0.7);
}
.status-bar {
  width: 100%;
  background: transparent;
}
.nav-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  min-height: var(--nav-height, 44px);
  padding: 0 var(--nav-right, 12px) 0 20rpx;
}
.icon-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  padding: 0;
  border: 1rpx solid #dfe8df;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.72);
  background: var(--app-nav-button, rgba(255, 255, 255, 0.65));
  border-color: var(--app-nav-rule, #dfe8df);
  box-shadow: none;
  transition:
    transform 0.18s ease,
    background-color 0.18s ease;
}
.icon-action::after {
  border: none;
}
.nav-action-pressed,
.icon-action:active {
  transform: translateX(-3rpx) scale(0.94);
  background: #eee5d4;
}
.icon-image {
  width: 29rpx;
  height: 29rpx;
  opacity: 0.8;
}
.nav-title-group {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rpx;
}
.nav-caption {
  font-size: 17rpx;
  line-height: 1.4;
  color: #998268;
  letter-spacing: 2rpx;
}
.title {
  display: block;
  color: var(--app-nav-ink);
  font-size: 30rpx;
  font-weight: 600;
  text-align: left;
  line-height: 1.45;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.nav-tone-library .title,
.nav-tone-paper .title {
  font-family: 'Songti SC', 'STSong', 'SimSun', serif;
  letter-spacing: 1rpx;
}
.placeholder {
  width: 8rpx;
}
@media (prefers-reduced-motion: reduce) {
  .icon-action {
    transition: none;
  }
}
</style>
