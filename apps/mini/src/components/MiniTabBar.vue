<template>
  <view class="mini-tabbar" role="navigation">
    <button
      v-for="item in items.slice(0, 2)"
      :key="item.path"
      class="tab"
      :class="{ active: active === item.key }"
      @tap="switchTab(item.path)"
    >
      <image class="tab-icon" :src="item.icon" mode="aspectFit" />
      <text>{{ item.label }}</text>
    </button>
    <button
      class="tab tab--xuxu"
      :class="{ active: active === 'xuxu' }"
      @tap="switchTab(xuxu.path)"
    >
      <view class="xuxu-orbit">
        <image class="xuxu-avatar" src="/static/illustrations/xuxu-avatar.jpg" mode="aspectFill" />
      </view>
      <text>序序</text>
    </button>
    <button
      v-for="item in items.slice(2)"
      :key="item.path"
      class="tab"
      :class="{ active: active === item.key }"
      @tap="switchTab(item.path)"
    >
      <image class="tab-icon" :src="item.icon" mode="aspectFit" />
      <text>{{ item.label }}</text>
    </button>
  </view>
</template>

<script setup lang="ts">
defineProps<{ active: 'home' | 'records' | 'xuxu' | 'plan' | 'me' }>();

const items = [
  { key: 'home', path: '/pages/home/HomePage', label: '首页', icon: '/static/icons/home.svg' },
  {
    key: 'records',
    path: '/pages/records/RecordsPage',
    label: '记录',
    icon: '/static/icons/journal.svg',
  },
  { key: 'plan', path: '/pages/plan/PlanPage', label: '计划', icon: '/static/icons/plan.svg' },
  { key: 'me', path: '/pages/me/MePage', label: '我的', icon: '/static/icons/profile.svg' },
] as const;
const xuxu = { path: '/pages/xuxu/XuxuPage' };

function switchTab(url: string) {
  uni.switchTab({ url });
}
</script>

<style scoped>
/* 浮动胶囊导航：参照主流健康 App 的悬浮 TabBar，保留中间序序头像的突出位 */
.mini-tabbar {
  position: fixed;
  right: var(--hz-tabbar-offset);
  bottom: calc(var(--hz-tabbar-offset) + env(safe-area-inset-bottom));
  left: var(--hz-tabbar-offset);
  z-index: 99;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  align-items: end;
  height: var(--hz-tabbar-height);
  padding: 0 8rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: var(--hz-shadow-float);
}
.tab {
  display: flex;
  min-width: 0;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  padding: 12rpx 0;
  border: 0;
  color: #708779;
  background: transparent;
  font-size: 20rpx;
  line-height: 1;
}
.tab-icon {
  width: 42rpx;
  height: 42rpx;
  opacity: 0.55;
}
.active .tab-icon {
  opacity: 1;
}
.active:not(.tab--xuxu) {
  position: relative;
  color: #28744d;
  font-weight: 700;
}
.active:not(.tab--xuxu)::before {
  position: absolute;
  top: 10rpx;
  right: 14rpx;
  bottom: 6rpx;
  left: 14rpx;
  z-index: -1;
  border-radius: 999rpx;
  background: #e3f2e4;
  content: '';
}
.tab--xuxu {
  transform: translateY(-18rpx);
  color: #54705a;
}
.xuxu-orbit {
  width: 76rpx;
  height: 76rpx;
  padding: 5rpx;
  border: 4rpx solid #f0da8c;
  border-radius: 50%;
  background: #fffdf1;
  box-shadow: 0 6rpx 16rpx rgba(90, 74, 27, 0.16);
}
.xuxu-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}
</style>
