<template>
  <view class="mini-tabbar" role="navigation">
    <button
      v-for="item in items.slice(0, 2)"
      :key="item.path"
      class="tab"
      :class="{ active: active === item.key }"
      hover-class="button-hover"
      @tap="switchTab(item.path)"
    >
      <image class="tab-icon" :src="item.icon" mode="aspectFit" />
      <text class="tab-label">{{ item.label }}</text>
    </button>
    <button
      class="tab tab--xuxu"
      :class="{ active: active === 'xuxu' }"
      hover-class="button-hover"
      @tap="switchTab(xuxu.path)"
    >
      <view class="xuxu-orbit">
        <image class="xuxu-avatar" src="/static/illustrations/xuxu-avatar.png" mode="aspectFill" />
      </view>
      <text class="tab-label">序序</text>
    </button>
    <button
      v-for="item in items.slice(2)"
      :key="item.path"
      class="tab"
      :class="{ active: active === item.key }"
      hover-class="button-hover"
      @tap="switchTab(item.path)"
    >
      <image class="tab-icon" :src="item.icon" mode="aspectFit" />
      <text class="tab-label">{{ item.label }}</text>
    </button>
  </view>
</template>

<script setup lang="ts">
defineProps<{ active: 'home' | 'xuxu' | 'community' | 'plan' | 'me' }>();

const items = [
  { key: 'home', path: '/pages/home/HomePage', label: '首页', icon: '/static/icons/svg/home.svg' },
  {
    key: 'community',
    path: '/pages/community/CommunityPage',
    label: '社区',
    icon: '/static/icons/svg/community.svg',
  },
  { key: 'plan', path: '/pages/plan/PlanPage', label: '计划', icon: '/static/icons/svg/plan.svg' },
  { key: 'me', path: '/pages/me/MePage', label: '我的', icon: '/static/icons/svg/profile.svg' },
] as const;
const xuxu = { path: '/pages/xuxu/XuxuPage' };

function switchTab(url: string) {
  uni.switchTab({ url });
}
</script>

<style scoped>
/* 玻璃拟态底部导航：半透明磨砂 + 顶部高光 + 单层上浮阴影；安全区在栏内消化 */
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
  border-top: 1rpx solid rgba(255, 255, 255, 0.65);
  background: rgba(255, 253, 249, 0.88);
  box-shadow: 0 -10rpx 30rpx rgba(29, 55, 41, 0.08), inset 0 1rpx 0 rgba(255, 255, 255, 0.9);
  -webkit-backdrop-filter: blur(18px) saturate(1.5);
  backdrop-filter: blur(18px) saturate(1.5);
}
.tab {
  display: flex;
  min-width: 0;
  height: var(--hz-tabbar-height);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  overflow: visible;
  border-radius: 20rpx;
  color: #8b9a90;
  font-size: 19rpx;
  line-height: 1;
}
.tab-label {
  line-height: 1;
}
.tab-icon {
  width: 44rpx;
  height: 44rpx;
  opacity: 0.52;
  transition: opacity 0.16s ease, transform 0.16s ease;
}
.active .tab-icon {
  opacity: 1;
  transform: translateY(-2rpx);
}
.active:not(.tab--xuxu) {
  color: var(--hz-green);
  font-weight: 650;
}
/* 选中态柔光：径向渐变衬底，不改变布局尺寸 */
.active:not(.tab--xuxu) .tab-icon {
  background: radial-gradient(
    circle at 50% 42%,
    rgba(125, 178, 148, 0.16) 0%,
    rgba(125, 178, 148, 0.05) 68%,
    transparent 100%
  );
  border-radius: 14rpx;
}
.tab--xuxu {
  position: relative;
  overflow: visible;
  color: #6d8577;
}
.active.tab--xuxu {
  color: var(--hz-green);
  font-weight: 650;
}
/* 头像圈上浮出栏外：按钮必须 overflow visible，否则微信端会裁掉圆环顶部 */
.xuxu-orbit {
  width: 84rpx;
  height: 84rpx;
  margin-top: -30rpx;
  padding: 5rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  background: linear-gradient(160deg, #ffffff 0%, #f2f7f1 100%);
  box-shadow: 0 10rpx 22rpx rgba(47, 107, 77, 0.16), inset 0 1rpx 0 rgba(255, 255, 255, 0.95);
}
.active .xuxu-orbit {
  box-shadow: 0 12rpx 26rpx rgba(47, 107, 77, 0.22), 0 0 0 4rpx rgba(125, 178, 148, 0.18),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.95);
}
.xuxu-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}
</style>
