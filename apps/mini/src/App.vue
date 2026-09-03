<script lang="ts">
import { loginWithWechat } from './features/auth/auth-store.js';

export default {
  onLaunch() {
    const env = (import.meta as unknown as { env?: Record<string, string> }).env || {};
    if (env.VITE_MINI_API_BASE_URL && !uni.getStorageSync('heban.auth.access-token')) {
      loginWithWechat().catch(() => undefined);
    }
  },
};
</script>

<style>
@import './styles/mini-tokens.css';

page {
  background: #fffdf9;
  color: #21372c;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', sans-serif;
  font-size: 28rpx;
  -webkit-font-smoothing: antialiased;
}
view,
text,
button,
input,
image,
scroll-view {
  box-sizing: border-box;
}
image {
  display: block;
}
button {
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 0;
  color: inherit;
  background: transparent;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', sans-serif;
  line-height: normal;
  transition:
    transform 0.16s ease,
    opacity 0.16s ease,
    background-color 0.16s ease,
    box-shadow 0.16s ease;
}
button[disabled] {
  opacity: 1;
}
input {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', sans-serif;
}
button::after {
  border: 0;
}
/* 统一按压反馈：所有 button 默认 hover-class 即 button-hover */
.button-hover {
  transform: scale(0.97);
  opacity: 0.88;
}
/* 入场动效：区块上浮淡入，配 hz-rise-1..4 做阶梯延迟 */
@keyframes hz-rise {
  from {
    opacity: 0;
    transform: translateY(18rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.hz-rise {
  animation: hz-rise 0.45s cubic-bezier(0.22, 0.8, 0.36, 1) both;
}
.hz-rise-1 {
  animation-delay: 0.06s;
}
.hz-rise-2 {
  animation-delay: 0.12s;
}
.hz-rise-3 {
  animation-delay: 0.18s;
}
.hz-rise-4 {
  animation-delay: 0.24s;
}
/* 轻浮动：只用于无文字承载的插画元素 */
@keyframes hz-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10rpx);
  }
}
.hz-float {
  animation: hz-float 3.4s ease-in-out infinite;
}
</style>

<style>
/* ============================================================
 * 全局画布与页面骨架：晨雾玻璃 v3
 * 这里只定义"骨架级"的公共布局（页面容器、安全区、导航、按钮、
 * 输入框、tabbar），细粒度材质全部交给最后加载的 visual-system.css。
 * ============================================================ */

/* 页面容器：统一 gutter 与底部导航安全距离 */
.page {
  min-height: 100vh;
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;
  padding: 0 var(--hz-gutter) calc(var(--hz-tabbar-height) + env(safe-area-inset-bottom) + 36rpx);
  background: var(--hz-bg);
  color: var(--hz-ink);
}

/* 顶栏（sticky 磨砂由 visual-system 提供材质，这里只管几何） */
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  min-height: 92rpx;
  padding: calc(env(safe-area-inset-top) + 48rpx) var(--hz-gutter) 18rpx;
  border-bottom: 1rpx solid var(--hz-rule-glass);
  background: rgba(255, 253, 249, 0.86);
  -webkit-backdrop-filter: var(--hz-blur);
  backdrop-filter: var(--hz-blur);
}
.nav .title {
  color: var(--hz-ink);
  font-size: 32rpx;
  font-weight: 700;
}
.back,
.nav-space {
  display: flex;
  width: 56rpx;
  height: 56rpx;
  align-items: center;
  justify-content: center;
  border: 1rpx solid var(--hz-rule-glass);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 4rpx 12rpx rgba(29, 55, 41, 0.05);
}

/* 头部：问候语区，页面顶部的一口"新鲜空气" */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(env(safe-area-inset-top) + 48rpx) 0 24rpx;
}
.header-left {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  gap: 10rpx;
}
.date-chip {
  padding: 6rpx 14rpx;
  border: 1rpx solid rgba(159, 195, 173, 0.4);
  border-radius: 999rpx;
  background: var(--hz-green-soft);
  color: var(--hz-green);
  font-size: 20rpx;
  line-height: 1.3;
}
.greeting {
  color: var(--hz-ink);
  font-size: 38rpx;
  font-weight: 700;
  line-height: 1.25;
}
.avatar-wrapper {
  position: relative;
  display: flex;
  width: 88rpx;
  height: 88rpx;
  align-items: center;
  justify-content: center;
  padding: 4rpx;
  border: 1rpx solid rgba(159, 195, 173, 0.6);
  border-radius: 50%;
  background: linear-gradient(160deg, #ffffff 0%, #eef5ef 100%);
  box-shadow: 0 10rpx 22rpx rgba(29, 55, 41, 0.12), inset 0 1rpx 0 rgba(255, 255, 255, 0.95);
}
.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}
.avatar-hint {
  display: none;
}

/* 卡片间距节奏 */
.card {
  margin: 0 0 22rpx;
}
.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18rpx;
}

/* 首页追踪网格：等尺寸 2×2 */
.grid-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  margin-bottom: 22rpx;
}
.grid-item {
  position: relative;
  overflow: hidden;
  min-height: 166rpx;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
}
.grid-top {
  width: 100%;
  display: flex;
  align-items: center;
}
.grid-data {
  display: flex;
  align-items: baseline;
  gap: 6rpx;
}
.grid-icon {
  position: absolute;
  right: 8rpx;
  bottom: 6rpx;
  width: 104rpx;
  height: 104rpx;
}

/* 编辑首页卡片入口：虚线轻按钮 */
.edit-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 86rpx;
  margin: 6rpx 0 16rpx;
  padding: 18rpx 22rpx 18rpx 26rpx;
  border: 1rpx dashed rgba(159, 178, 165, 0.55);
  border-radius: var(--hz-radius-control);
  background: rgba(255, 255, 255, 0.5);
}
.edit-text {
  color: var(--hz-ink-soft);
  font-size: 23rpx;
  font-weight: 650;
}
.edit-caption {
  color: var(--hz-faint);
  font-size: 18rpx;
}
.edit-arrow {
  width: 28rpx;
  height: 28rpx;
  opacity: 0.55;
}

/* 弹层骨架（材质由 visual-system 提供） */
.wellness-scrim,
.weight-record-scrim {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: flex-end;
  background: rgba(35, 52, 44, 0.3);
}
.wellness-sheet,
.weight-record-sheet {
  width: 100%;
  max-height: 82vh;
  overflow: auto;
  box-sizing: border-box;
  padding: 20rpx 30rpx calc(36rpx + env(safe-area-inset-bottom));
}
.sheet-handle {
  width: 72rpx;
  height: 8rpx;
  margin: 0 auto 24rpx;
  border-radius: 8rpx;
  background: rgba(125, 144, 133, 0.35);
}

/* 底部导航几何（磨砂材质由 visual-system 提供） */
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
.tab-icon {
  width: 44rpx;
  height: 44rpx;
  opacity: 0.52;
}
.active:not(.tab--xuxu) {
  color: var(--hz-green);
  font-weight: 650;
}
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
.xuxu-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

/* 窄屏（安卓小机/iPhone SE）：收窄 gutter，内容不挤不溢 */
@media (max-width: 360px) {
  .page {
    padding-right: 24rpx;
    padding-left: 24rpx;
  }
}

/* 宽屏预览（开发工具 / iPad）：内容居中 */
@media (min-width: 700px) {
  .page {
    max-width: 720px;
    margin: 0 auto;
    padding-right: 48rpx;
    padding-left: 48rpx;
  }
}
</style>

<style>
/* ============================================================
 * 页面级历史样式的收束层：把各页面自带底色统一回晨雾画布。
 * 细粒度覆盖（卡片/按钮/导航材质）由最后的 visual-system.css 完成。
 * ============================================================ */
.home-page,
.records-page,
.food-search-page,
.food-summary-page,
.food-recognition-page,
.food-detail-page,
.food-detail-catalog-page,
.bootstrap-page,
.onboarding-container,
.chat-shell,
.weight-page,
.activity-page,
.sleep-page,
.mood-page,
.fasting-page,
.water-page,
.period-page,
.period-setup-page,
.medication-page {
  background: var(--hz-bg) !important;
  color: var(--hz-ink) !important;
}
</style>

<style>
/* 视觉系统最后加载：统一材质、色彩与控件语言 */
@import './styles/visual-system.css';
</style>
