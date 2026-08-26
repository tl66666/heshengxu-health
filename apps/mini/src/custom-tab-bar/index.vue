<template>
  <view class="tabbar">
    <button
      v-for="item in sideItems.slice(0, 2)"
      :key="item.path"
      class="tab"
      :class="{ active: activePath === item.path }"
      @tap="go(item.path)"
    >
      <image class="icon" :src="item.icon" mode="aspectFit" /><text>{{ item.label }}</text>
    </button>
    <button class="xuxu" :class="{ active: activePath === xuxu.path }" @tap="go(xuxu.path)">
      <view class="xuxu-orbit"
        ><image src="/static/illustrations/xuxu-avatar.jpg" mode="aspectFill" /></view
      ><text>序序</text>
    </button>
    <button
      v-for="item in sideItems.slice(2)"
      :key="item.path"
      class="tab"
      :class="{ active: activePath === item.path }"
      @tap="go(item.path)"
    >
      <image class="icon" :src="item.icon" mode="aspectFit" /><text>{{ item.label }}</text>
    </button>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const sideItems = [
  { path: '/pages/home/HomePage', label: '首页', icon: '/static/icons/home.svg' },
  { path: '/pages/records/RecordsPage', label: '记录', icon: '/static/icons/journal.svg' },
  { path: '/pages/plan/PlanPage', label: '计划', icon: '/static/icons/plan.svg' },
  { path: '/pages/me/MePage', label: '我的', icon: '/static/icons/profile.svg' },
];
const xuxu = { path: '/pages/xuxu/XuxuPage' };
const activePath = computed(() => {
  const page = getCurrentPages().at(-1) as { route?: string } | undefined;
  return page?.route ? `/${page.route}` : (sideItems[0]?.path ?? '/pages/home/HomePage');
});
function go(path: string) {
  uni.switchTab({ url: path });
}
</script>

<style scoped>
.tabbar {
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
  box-sizing: content-box;
  background: rgba(251, 253, 249, 0.98);
  border-top: 1rpx solid #e2ece2;
  box-shadow: 0 -8rpx 24rpx rgba(47, 79, 55, 0.06);
}
.tab,
.xuxu {
  display: flex;
  min-width: 0;
  height: 94rpx;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  padding: 0;
  border: 0;
  color: #708779;
  background: transparent;
  font-size: 20rpx;
  line-height: 1;
}
.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 42rpx;
  border-radius: 15rpx;
  opacity: 0.68;
}
.active {
  color: #28744d;
  font-weight: 700;
}
.active .icon {
  opacity: 1;
}
.xuxu {
  transform: translateY(-34rpx);
  color: #54705a;
}
.xuxu-orbit {
  width: 82rpx;
  height: 82rpx;
  padding: 5rpx;
  border: 4rpx solid #f0da8c;
  border-radius: 50%;
  box-sizing: border-box;
  background: #fffdf1;
  box-shadow: 0 8rpx 18rpx rgba(90, 74, 27, 0.16);
}
.xuxu-orbit image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}
.xuxu text:last-child {
  margin-top: 3rpx;
}
</style>
