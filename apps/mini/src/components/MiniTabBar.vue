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
        <image class="xuxu-avatar" src="/static/illustrations/xuxu-avatar.png" mode="aspectFill" />
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
/* 贴底导航栏：与微信原生习惯一致，占满最底部，安全区在栏内消化 */
.mini-tabbar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 99;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  align-items: stretch;
  height: calc(var(--hz-tabbar-height) + env(safe-area-inset-bottom));
  padding: 0 10rpx env(safe-area-inset-bottom);
  background: rgba(255, 255, 255, 0.99);
  border-top: 1rpx solid #e6efe7;
  box-shadow: 0 -6rpx 20rpx rgba(31, 74, 48, 0.05);
}
.tab {
  display: flex;
  min-width: 0;
  height: var(--hz-tabbar-height);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5rpx;
  overflow: visible;
  border-radius: 20rpx;
  color: #708779;
  font-size: 20rpx;
  line-height: 1;
}
.tab-icon {
  width: 44rpx;
  height: 44rpx;
  opacity: 0.55;
}
.active .tab-icon {
  opacity: 1;
}
.active:not(.tab--xuxu) {
  color: #28744d;
  font-weight: 700;
  background: #e3f2e4;
}
.tab--xuxu {
  position: relative;
  overflow: visible;
  color: #54705a;
}
/* 头像圈上浮出栏外：按钮必须 overflow visible，否则微信端会裁掉圆环顶部 */
.xuxu-orbit {
  width: 82rpx;
  height: 82rpx;
  margin-top: -26rpx;
  padding: 5rpx;
  border: 4rpx solid #f0da8c;
  border-radius: 50%;
  background: #fffdf1;
  box-shadow: 0 6rpx 16rpx rgba(90, 74, 27, 0.18);
}
.xuxu-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}
</style>
