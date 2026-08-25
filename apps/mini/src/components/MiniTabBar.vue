<template>
  <view class="mini-tabbar" role="navigation">
    <button
      v-for="item in items.slice(0, 2)"
      :key="item.path"
      class="tab"
      :class="{ active: active === item.key }"
      @tap="switchTab(item.path)"
    >
      <icon class="native-icon" :type="item.icon" size="23" />
      <text>{{ item.label }}</text>
    </button>
    <button
      class="tab tab--xuxu"
      :class="{ active: active === 'xuxu' }"
      @tap="switchTab(xuxu.path)"
    >
      <view class="xuxu-orbit">
        <image src="/static/illustrations/xuxu-avatar.jpg" mode="aspectFill" />
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
      <icon class="native-icon" :type="item.icon" size="23" />
      <text>{{ item.label }}</text>
    </button>
  </view>
</template>

<script setup lang="ts">
defineProps<{ active: 'home' | 'records' | 'xuxu' | 'plan' | 'me' }>();

const items = [
  { key: 'home', path: '/pages/home/HomePage', label: '首页', icon: 'info_circle' },
  { key: 'records', path: '/pages/records/RecordsPage', label: '记录', icon: 'waiting' },
  { key: 'plan', path: '/pages/plan/PlanPage', label: '计划', icon: 'success_no_circle' },
  { key: 'me', path: '/pages/me/MePage', label: '我的', icon: 'clear' },
] as const;
const xuxu = { path: '/pages/xuxu/XuxuPage' };

function switchTab(url: string) {
  uni.switchTab({ url });
}
</script>

<style scoped>
.mini-tabbar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 99;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  align-items: end;
  height: 118rpx;
  padding: 10rpx 10rpx env(safe-area-inset-bottom);
  background: rgba(251, 253, 249, 0.98);
  border-top: 1rpx solid #dfe9df;
  box-shadow: 0 -8rpx 24rpx rgba(47, 79, 55, 0.08);
}
.tab {
  display: flex;
  min-width: 0;
  height: 94rpx;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5rpx;
  padding: 0;
  border: 0;
  color: #708779;
  background: transparent;
  font-size: 20rpx;
  line-height: 1;
}
.native-icon {
  opacity: 0.65;
}
.active .native-icon {
  opacity: 1;
}
.active {
  color: #28744d;
  font-weight: 700;
}
.tab--xuxu {
  transform: translateY(-34rpx);
  color: #54705a;
}
.xuxu-orbit {
  width: 82rpx;
  height: 82rpx;
  padding: 5rpx;
  border: 4rpx solid #f0da8c;
  border-radius: 50%;
  background: #fffdf1;
  box-shadow: 0 8rpx 18rpx rgba(90, 74, 27, 0.16);
}
.xuxu-orbit image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}
</style>
