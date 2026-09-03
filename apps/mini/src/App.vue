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
  background: #f5f2eb;
  color: #1e2d25;
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
/* Final cascade: these tokens intentionally load last so legacy page rules cannot reintroduce
   the dark green/white/cream split that made the visual system feel disconnected. */
page, body { background: #faf7f1 !important; color: #5c5558 !important; }
.home-page, .food-search-page, .food-summary-page, .food-recognition-page { background: #faf7f1 !important; color: #5c5558 !important; }
.home-page .header { background: #eef5ef !important; border-bottom-color: #e3ebe3 !important; }
.home-page .card, .home-page .grid-item, .home-page .fasting-card, .home-page .period-card, .home-page .medication-card, .home-page .record-card, .home-page .calorie-card, .home-page .weight-card,
.food-search-page .meal-switch, .food-search-page .budget-strip, .food-search-page .search-box, .food-search-page .food-card, .food-search-page .cart-panel, .food-summary-page .summary-card, .food-summary-page .meal-card, .food-recognition-page .card {
  border: 1rpx solid #ebe4dc !important; border-left: 1rpx solid #ebe4dc !important; border-radius: 20rpx !important; background: #fffdf9 !important; box-shadow: 0 8rpx 20rpx rgba(92,78,70,.05) !important;
}
.home-page .card-title, .home-page .grid-title, .food-search-page .title, .food-search-page .food-name { color: #625960 !important; }
.home-page .weight-col .num, .home-page .grid-num, .home-page .big-number .number, .home-page .value { color: #628b7e !important; }
.home-page .xuxu-camera-card { border: 1rpx solid #dfe8df !important; border-radius: 20rpx !important; background: linear-gradient(110deg,#f1f7f0 0%,#f8f4e9 100%) !important; box-shadow: inset 0 1rpx 0 rgba(255,255,255,.94),0 8rpx 18rpx rgba(109,99,84,.06) !important; }
.home-page .xuxu-camera-card .camera-title { color: #5d6962 !important; }
.home-page .xuxu-camera-card .camera-subtitle { color: #a09388 !important; }
.home-page .xuxu-camera-card .camera-decoration { width: 178rpx !important; height: 116rpx !important; }
.food-search-page .meal-switch { background: #f1f6ef !important; box-shadow: none !important; }
.food-search-page .meal-switch-item.active { color: #5d8172 !important; background: #fffdf9 !important; }
.food-search-page .category-tabs { border-color: #e7e6dc !important; background: #f2f5ee !important; box-shadow: none !important; }
.food-search-page .category-tab.active { border-left-color: #9ab9a6 !important; color: #5f8275 !important; background: #fffdf9 !important; }
.food-search-page .food-card { display: flex !important; align-items: center !important; min-height: 126rpx !important; }
.food-search-page .food-main { display: flex !important; align-items: center !important; min-width: 0 !important; }
.food-search-page .food-icon { border-color: #e4e8de !important; background: #f5f7f0 !important; }
.food-search-page .food-icon image { width: 74rpx !important; height: 74rpx !important; object-fit: contain !important; }
.food-search-page .food-add, .food-search-page .cart-done, .food-recognition-page .recognize-btn { color: #5b756b !important; border-color: #cfe0d5 !important; background: #eaf4ec !important; }
.food-recognition-page .preview-img { width: 100% !important; height: 460rpx !important; object-fit: contain !important; background: #f5f1e9 !important; }
.food-summary-page .ring { background: conic-gradient(#91b9a6 var(--progress),#eee9e1 0) !important; }
.food-summary-page .ring-inner { background: #fffdf9 !important; }
.food-summary-page .remaining, .food-summary-page .ring-inner text:first-child { color: #628b7e !important; }
.period-setup-page .primary-button { opacity: 1 !important; color: #5b756b !important; background: #eaf4ec !important; border-color: #cfe0d5 !important; }
.chat-shell { background: #faf7f1 !important; color: #5c5558 !important; }
.chat-head, .quick { background: rgba(255,253,249,.96) !important; border-color: #ebe4dc !important; }
.chat-name, .empty-title { color: #5c5558 !important; }
.send.enabled { background: #e8f3e9 !important; border-color: #d1e2d4 !important; }
.food-detail-page, .food-detail-catalog-page { background: #faf7f1 !important; color: #5c5558 !important; }
.food-detail-page .calorie-summary, .food-detail-page .meal-section,
.food-detail-catalog-page .card { border-color: #ebe4dc !important; border-radius: 20rpx !important; background: #fffdf9 !important; box-shadow: 0 8rpx 20rpx rgba(92,78,70,.05) !important; }
.food-detail-catalog-page .content { padding-top: 18rpx !important; }
.food-detail-catalog-page .food-icon-large { border-color: #e4e8de !important; background: #f5f7f0 !important; }
.food-detail-catalog-page .food-icon-large image { width: 96rpx !important; height: 96rpx !important; object-fit: contain !important; }

</style>

<style>
/* 2026-09 visual consolidation: one bright cream canvas, one quiet sage accent. */
page,
body { background: #faf7f1 !important; color: #5c5558 !important; }

.nav-bar-wrapper {
  background: rgba(255, 253, 249, .96) !important;
  border-bottom-color: #ebe4dc !important;
}
.nav-bar-wrapper .status-bar { background: #faf7f1 !important; }
.nav-bar-wrapper .nav-bar { height: 72rpx !important; padding: 0 24rpx !important; }
.nav-bar-wrapper .icon-action {
  width: 52rpx !important; height: 52rpx !important;
  border-color: #dfe8df !important; background: #fffdf9 !important; box-shadow: 0 3rpx 10rpx rgba(92, 78, 70, .06) !important;
}
.nav-bar-wrapper .title { color: #5c5558 !important; font-size: 30rpx !important; }

/* Homepage: sage belongs to the header only; content rests on warm ivory. */
.home-page { background: #faf7f1 !important; color: #5c5558 !important; }
.home-page .header {
  background: #eef5ef !important;
  border-bottom: 1rpx solid #e3ebe3 !important;
}
.home-page .card,
.home-page .grid-item,
.home-page .fasting-card,
.home-page .period-card,
.home-page .medication-card,
.home-page .record-card,
.home-page .calorie-card,
.home-page .weight-card {
  border: 1rpx solid #ebe4dc !important;
  border-left: 1rpx solid #ebe4dc !important;
  border-radius: 22rpx !important;
  background: rgba(255, 253, 249, .94) !important;
  box-shadow: 0 8rpx 22rpx rgba(92, 78, 70, .055) !important;
}
.home-page .card-title,
.home-page .grid-title { color: #625960 !important; }
.home-page .weight-col .num,
.home-page .grid-num,
.home-page .big-number .number,
.home-page .value { color: #628b7e !important; }
.home-page .weight-col .label,
.home-page .hint-text,
.home-page .meal-summary,
.home-page .stat-label,
.home-page .grid-unit,
.home-page .grid-hint,
.home-page .camera-subtitle { color: #9a908c !important; }
.home-page .xuxu-camera-card {
  min-height: 142rpx !important;
  border: 1rpx solid #dfe8df !important;
  border-radius: 20rpx !important;
  background: linear-gradient(110deg, #f1f7f0 0%, #f8f4e9 100%) !important;
  box-shadow: inset 0 1rpx 0 rgba(255,255,255,.94), 0 8rpx 18rpx rgba(109, 99, 84, .06) !important;
}
.home-page .xuxu-camera-card .camera-title { color: #5d6962 !important; }
.home-page .xuxu-camera-card .camera-subtitle { color: #a09388 !important; }
.home-page .xuxu-camera-card .camera-decoration { width: 178rpx !important; height: 116rpx !important; }
.home-page .mode-tag { background: #f5eee1 !important; color: #9a7f55 !important; }
.home-page .meal-progress-segment.filled { background: #91b9a6 !important; }

/* Food catalogue/detail pages use the same canvas and image-safe rows. */
.food-search-page,
.food-summary-page,
.food-recognition-page {
  background: #faf7f1 !important;
  color: #5c5558 !important;
}
.food-search-page .intro { padding-top: 24rpx !important; }
.food-search-page .meal-switch,
.food-search-page .budget-strip,
.food-search-page .search-box,
.food-search-page .food-card,
.food-search-page .cart-panel {
  border-color: #ebe4dc !important;
  border-radius: 18rpx !important;
  background: #fffdf9 !important;
  box-shadow: 0 7rpx 18rpx rgba(92, 78, 70, .045) !important;
}
.food-search-page .meal-switch { background: #f1f6ef !important; box-shadow: none !important; }
.food-search-page .meal-switch-item.active { color: #5d8172 !important; background: #fffdf9 !important; }
.food-search-page .category-tabs { border-color: #e7e6dc !important; background: #f2f5ee !important; box-shadow: none !important; }
.food-search-page .category-tab.active { border-left-color: #9ab9a6 !important; color: #5f8275 !important; background: #fffdf9 !important; }
.food-search-page .food-icon { border-color: #e4e8de !important; background: #f5f7f0 !important; }
.food-search-page .food-icon image { width: 74rpx !important; height: 74rpx !important; object-fit: contain !important; }
.food-search-page .food-card { display: flex !important; align-items: center !important; min-height: 126rpx !important; }
.food-search-page .food-main { display: flex !important; align-items: center !important; min-width: 0 !important; }
.food-search-page .food-add { color: #688c7c !important; border-color: #cfe0d5 !important; background: #eef6f0 !important; }
.food-search-page .cart-done { color: #5b756b !important; border: 1rpx solid #cfe0d5 !important; background: #eaf4ec !important; }
.food-summary-page .summary-card,
.food-summary-page .meal-card { border-color: #ebe4dc !important; background: #fffdf9 !important; box-shadow: 0 8rpx 20rpx rgba(92,78,70,.05) !important; }
.food-summary-page .ring { background: conic-gradient(#91b9a6 var(--progress), #eee9e1 0) !important; }
.food-summary-page .ring-inner { background: #fffdf9 !important; }
.food-summary-page .remaining,
.food-summary-page .ring-inner text:first-child { color: #628b7e !important; }
.food-recognition-page .card { border-color: #ebe4dc !important; border-radius: 22rpx !important; background: #fffdf9 !important; box-shadow: 0 8rpx 20rpx rgba(92,78,70,.05) !important; }
.food-recognition-page .preview-img { width: 100% !important; height: 460rpx !important; object-fit: contain !important; background: #f5f1e9 !important; }
.food-recognition-page .recognize-btn { color: #5b756b !important; background: #eaf4ec !important; border: 1rpx solid #cfe0d5 !important; }

/* Chat keeps the API status visible and uses the same cream/sage language. */
.chat-shell { background: #faf7f1 !important; color: #5c5558 !important; }
.chat-head, .quick { background: rgba(255,253,249,.96) !important; border-color: #ebe4dc !important; }
.chat-name, .empty-title { color: #5c5558 !important; }
.chat-status, .head-mark, .empty-copy, .quick-label { color: #9a908c !important; }
.profile-title { color: #63776e !important; }
.profile-tag, .quick button { color: #6d8e7f !important; border-color: #dfe8df !important; background: #f4f8f1 !important; }
.message-text { color: #5c5558 !important; border-color: #e7e1da !important; background: #fffdf9 !important; }
.message.user .message-text { color: #60757a !important; border-color: #dfebeb !important; background: #f1f7f6 !important; }
.composer input { color: #5c5558 !important; border-color: #e7e1da !important; background: #fffdf9 !important; }
.send.enabled { background: #e8f3e9 !important; border-color: #d1e2d4 !important; box-shadow: 0 6rpx 14rpx rgba(93,130,101,.1) !important; }

/* The setup action must remain tappable so validation can explain what is missing. */
.period-setup-page .primary-button { opacity: 1 !important; color: #5b756b !important; background: #eaf4ec !important; border-color: #cfe0d5 !important; }
.period-setup-page .primary-button[disabled] { opacity: .72 !important; }
</style>

<style>
/* Final homepage polish: no decorative rails and clearer, lighter surfaces. */
.home-page {
  background: #f8f9f6 !important;
}
.home-page .header {
  background: #eff6f1 !important;
}
.home-page .card,
.home-page .weight-card,
.home-page .calorie-card,
.home-page .record-card,
.home-page .grid-item,
.home-page .fasting-card,
.home-page .period-card,
.home-page .medication-card {
  border: 1rpx solid #e1e8e2 !important;
  border-left-width: 1rpx !important;
  border-left-style: solid !important;
  border-left-color: #e1e8e2 !important;
  background: #ffffff !important;
  box-shadow: 0 5rpx 16rpx rgba(28, 55, 40, 0.05) !important;
}
.home-page .grid-item:nth-child(1),
.home-page .grid-item:nth-child(2),
.home-page .grid-item:nth-child(3),
.home-page .grid-item:nth-child(4) {
  background: #ffffff !important;
}
.home-page .grid-icon,
.home-page .fasting-icon-img,
.home-page .period-icon-img,
.home-page .medication-icon-img,
.home-page .chart-icon {
  opacity: 1 !important;
}
.home-page .xuxu-camera-card {
  display: flex !important;
  align-items: center !important;
  min-height: 132rpx !important;
  margin-top: 20rpx !important;
  padding: 20rpx 18rpx 20rpx 24rpx !important;
  border: 1rpx solid #cfe1d4 !important;
  border-radius: 18rpx !important;
  background: #e9f4ec !important;
  box-shadow: none !important;
}
.home-page .xuxu-camera-card .camera-copy {
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 0;
}
.home-page .xuxu-camera-card .camera-title {
  color: #173f30 !important;
  font-size: 28rpx !important;
  font-weight: 750 !important;
}
.home-page .xuxu-camera-card .camera-subtitle {
  display: block;
  margin-top: 8rpx;
  color: #4d765f !important;
  font-size: 19rpx !important;
}
.home-page .xuxu-camera-card .camera-decoration {
  flex: none;
  width: 148rpx !important;
  height: 96rpx !important;
  margin: 0 4rpx 0 8rpx;
  opacity: 1 !important;
}
.home-page .xuxu-camera-card .camera-arrow {
  display: flex;
  flex: none;
  width: 44rpx;
  height: 44rpx;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #1f6b4c !important;
  background: #ffffff !important;
  font-size: 28rpx;
  line-height: 44rpx;
}
.home-page .card-title,
.home-page .grid-title,
.home-page .fasting-time,
.home-page .period-days,
.home-page .medication-item {
  color: #173f30 !important;
}
.home-page .weight-col .label,
.home-page .stat-label,
.home-page .hint-text,
.home-page .meal-summary,
.home-page .value-unit,
.home-page .grid-unit,
.home-page .grid-hint,
.home-page .fasting-label,
.home-page .fasting-summary,
.home-page .period-hint,
.home-page .medication-hint,
.home-page .time-text,
.home-page .camera-subtitle {
  color: #63736a !important;
}
</style>

<style>
/* 和生序 mini global visual pass. Component-scoped styles inherit these
   tokens; !important is limited to legacy hard-coded surfaces. */
page,
body {
  background: #f5f2eb !important;
  color: #1e2d25 !important;
}

.page {
  min-height: 100vh;
  padding: 0 32rpx calc(var(--hz-tabbar-height) + 36rpx);
  background: #f5f2eb !important;
  color: #1e2d25 !important;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 56rpx 0 28rpx;
}

.header-left {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
  gap: 10rpx;
}

.date-chip {
  padding: 6rpx 14rpx;
  border: 1rpx solid #dce8df;
  border-radius: 10rpx;
  background: #e7f0e9 !important;
  color: #1f6b4c !important;
  font-size: 20rpx;
  line-height: 1.3;
}

.greeting {
  color: #173f30 !important;
  font-size: 38rpx !important;
  font-weight: 700;
  line-height: 1.25;
}

.avatar-wrapper {
  display: flex;
  width: 72rpx;
  height: 72rpx;
  align-items: center;
  justify-content: center;
  padding: 5rpx;
  border: 1rpx solid #dce8df !important;
  border-radius: 50%;
  background: #fffdf9 !important;
  box-shadow: 0 8rpx 18rpx rgba(32, 55, 42, 0.08);
}

.avatar {
  width: 100%;
  height: 100%;
  border: 0 !important;
  border-radius: 50%;
}

.avatar-hint {
  display: none;
}

.card {
  margin: 0 0 24rpx !important;
  border: 1rpx solid #e2e5dc !important;
  border-radius: 18rpx !important;
  background: #fffdf9 !important;
  box-shadow: 0 10rpx 28rpx rgba(32, 55, 42, 0.08) !important;
}

.card-top {
  margin-bottom: 20rpx !important;
}

.card-title,
.grid-title {
  color: #173f30 !important;
  font-weight: 700 !important;
}

.weight-card,
.calorie-card,
.record-card {
  padding: 28rpx !important;
}

.weight-col .num,
.weight-col.main .num,
.big-number .number,
.value,
.grid-num,
.fasting-time {
  color: #1f6b4c !important;
  font-weight: 700;
}

.weight-col .label,
.stat-label,
.hint-text,
.value-unit,
.grid-unit,
.fasting-label,
.period-hint,
.medication-hint,
.time-text {
  color: #748078 !important;
}

.mode-tag,
.mode-tag.blue {
  border-radius: 8rpx;
  background: #e7f0e9 !important;
  color: #1f6b4c !important;
}

.stat {
  border: 1rpx solid #e2e5dc !important;
  border-radius: 12rpx !important;
  background: #f8faf6 !important;
}

.meal-icon-wrap {
  border: 0 !important;
  border-radius: 16rpx !important;
  background: transparent !important;
  box-shadow: none !important;
}

.meal-icon {
  width: 78rpx;
  height: 78rpx;
}

.meal-name {
  color: #48675a !important;
  font-weight: 600;
}

.xuxu-camera-card,
.edit-card,
.grid-item,
.fasting-card,
.period-card,
.medication-card {
  border: 1rpx solid #e2e5dc !important;
  border-radius: 16rpx !important;
  background: #fffdf9 !important;
  box-shadow: 0 8rpx 22rpx rgba(32, 55, 42, 0.07) !important;
}

.xuxu-camera-card {
  background: #edf3ee !important;
}

.camera-title {
  color: #173f30 !important;
  font-weight: 700;
}

.camera-subtitle,
.edit-caption,
.fasting-summary {
  color: #748078 !important;
}

.grid-cards {
  gap: 18rpx !important;
  margin-bottom: 24rpx !important;
}

.grid-item {
  min-height: 166rpx !important;
  padding: 24rpx !important;
}

.grid-icon,
.fasting-icon-img,
.period-icon-img,
.medication-icon-img {
  opacity: 0.82 !important;
  mix-blend-mode: normal !important;
}

.weight-add,
.sheet-close {
  width: 52rpx;
  height: 52rpx;
  border: 1rpx solid #c9ddcf !important;
  border-radius: 50%;
  color: #1f6b4c !important;
  background: #e7f0e9 !important;
}

.wellness-sheet {
  border-radius: 28rpx 28rpx 0 0 !important;
  background: #fffdf9 !important;
  box-shadow: 0 -14rpx 34rpx rgba(32, 55, 42, 0.16) !important;
}

.wellness-save,
.mood-save,
.error-state button {
  min-height: 92rpx;
  border: 0 !important;
  border-radius: 14rpx !important;
  color: #fff !important;
  background: #173f30 !important;
  box-shadow: 0 8rpx 18rpx rgba(23, 63, 48, 0.16) !important;
}

.mini-tabbar {
  height: calc(112rpx + env(safe-area-inset-bottom)) !important;
  padding: 0 16rpx env(safe-area-inset-bottom) !important;
  border-top: 1rpx solid #e2e5dc !important;
  background: rgba(255, 253, 249, 0.97) !important;
  box-shadow: 0 -10rpx 24rpx rgba(32, 55, 42, 0.08) !important;
}

.tab {
  height: 112rpx !important;
  border-radius: 14rpx !important;
  color: #87928a !important;
  font-size: 20rpx !important;
}

.tab-icon {
  width: 42rpx !important;
  height: 42rpx !important;
}

.active:not(.tab--xuxu) {
  color: #1f6b4c !important;
  background: #e7f0e9 !important;
}

.xuxu-orbit {
  width: 84rpx !important;
  height: 84rpx !important;
  margin-top: -30rpx !important;
  padding: 4rpx !important;
  border: 1rpx solid #dce9df !important;
  background: #fffdf9 !important;
  box-shadow: 0 8rpx 18rpx rgba(76, 109, 87, 0.1) !important;
}

.tab--xuxu {
  color: #1f6b4c !important;
}

/* Shared detail-page language used by weight, sleep, activity and fasting. */
.nav {
  min-height: 92rpx !important;
  padding: 48rpx 32rpx 18rpx !important;
  border-bottom: 1rpx solid #e2e5dc !important;
  background: #f5f2eb !important;
}

.nav .title,
.nav-copy .title {
  color: #173f30 !important;
  font-size: 32rpx !important;
  font-weight: 700 !important;
}

.back,
.nav-space {
  color: #1f6b4c !important;
}

.hero,
.hero-card,
.summary-card,
.trend-card,
.history-card,
.section.card,
.section {
  border-color: #e2e5dc !important;
  border-radius: 18rpx !important;
  background: #fffdf9 !important;
  box-shadow: 0 10rpx 28rpx rgba(32, 55, 42, 0.08) !important;
}

.hero {
  margin: 20rpx 32rpx !important;
  overflow: hidden;
}

.hero-art,
.art-stage image,
.hero-wrap .hero-art {
  opacity: 1 !important;
  mix-blend-mode: normal !important;
}

.hero-kicker,
.hero-label,
.section-subtitle,
.section-sub,
.caption,
.date {
  color: #748078 !important;
}

.hero-number,
.hero-total,
.metric,
.metric-value,
.amount-num,
.duration strong {
  color: #173f30 !important;
  font-weight: 700 !important;
}

.range-tab,
.view-tab,
.activity-choice,
.duration-choice,
.quality,
.mode-card,
.record-filter {
  border: 1rpx solid #e2e5dc !important;
  border-radius: 10rpx !important;
  color: #48675a !important;
  background: #fffdf9 !important;
}

.range-tab.active,
.view-tab.active,
.activity-choice.selected,
.duration-choice.selected,
.quality.selected,
.record-filter.active {
  border-color: #9fc3ad !important;
  color: #173f30 !important;
  background: #e7f0e9 !important;
}

.save-button,
.record-button,
.confirm-btn,
.save {
  border: 0 !important;
  border-radius: 14rpx !important;
  color: #fff !important;
  background: #173f30 !important;
  box-shadow: 0 8rpx 18rpx rgba(23, 63, 48, 0.16) !important;
}

.weight-input,
.duration-input,
.note-input,
.dream,
.text-input,
.input-display {
  border: 1rpx solid #d8e4da !important;
  border-radius: 12rpx !important;
  color: #1e2d25 !important;
  background: #fbfcf8 !important;
}

.dialog,
.dialog-content,
.settings-sheet {
  border-radius: 28rpx 28rpx 0 0 !important;
  background: #fffdf9 !important;
  box-shadow: 0 -14rpx 34rpx rgba(32, 55, 42, 0.16) !important;
}

/* Plan page hierarchy: one hero, quiet task rows, and a single accent. */
.topbar {
  padding: 54rpx 0 24rpx !important;
  margin-bottom: 0 !important;
}
.top-eyebrow { color: #748078 !important; font-size: 19rpx !important; letter-spacing: 0 !important; }
.top-title { color: #173f30 !important; font-size: 38rpx !important; }
.history { color: #1f6b4c !important; }
.api-plan {
  margin-top: 16rpx !important;
  padding: 18rpx 20rpx !important;
  border: 1rpx solid #dfe8df !important;
  border-radius: 14rpx !important;
  background: #edf3ee !important;
}
.api-title { color: #173f30 !important; }
.api-note { color: #748078 !important; }
.api-plan button { border-radius: 10rpx !important; color: #1f6b4c !important; background: #e7f0e9 !important; }
.hero {
  min-height: 252rpx !important;
  padding: 28rpx !important;
  border-top: 6rpx solid #1f6b4c !important;
}
.hero .title { color: #173f30 !important; font-size: 34rpx !important; }
.hero .subtitle { color: #748078 !important; }
.hero .metric-value { color: #1f6b4c !important; font-size: 34rpx !important; }
.hero .metric-label { color: #748078 !important; }
.hero-art { width: 172rpx !important; height: 172rpx !important; }
.plan-card {
  border: 1rpx solid #e2e5dc !important;
  border-radius: 16rpx !important;
  background: #fffdf9 !important;
  box-shadow: 0 8rpx 22rpx rgba(32, 55, 42, 0.07) !important;
}
.plan-head image { border-radius: 14rpx !important; background: #f4f3ec !important; }
.plan-title { color: #173f30 !important; }
.plan-subtitle,
.plan-frequency,
.section-note,
.count,
.task-note { color: #748078 !important; }
.progress-track { background: #e7eee9 !important; }
.progress-fill { background: #1f6b4c !important; }
.filters button { border-radius: 10rpx !important; border-color: #e2e5dc !important; color: #748078 !important; background: #fffdf9 !important; }
.filters button.active { border-color: #9fc3ad !important; color: #173f30 !important; background: #e7f0e9 !important; }
.task-row { border-bottom-color: #e7eee9 !important; }
.task-title { color: #1e2d25 !important; }
.check { border-color: #b8cdbd !important; }
.check.checked { border-color: #1f6b4c !important; background: #1f6b4c !important; }
.template { border-color: #e2e5dc !important; border-radius: 14rpx !important; background: #fffdf9 !important; }
.template-title { color: #173f30 !important; }
.template-note { color: #748078 !important; }

/* 序序页：让对话区域成为安静、可持续使用的工作台。 */
.chat-shell {
  background: #f5f2eb !important;
  color: #1e2d25 !important;
}
.chat-head {
  padding-right: 32rpx !important;
  padding-left: 32rpx !important;
  border-bottom-color: #e2e5dc !important;
  background: #f5f2eb !important;
}
.chat-name { color: #173f30 !important; font-size: 34rpx !important; letter-spacing: 0 !important; }
.chat-status,
.head-mark { color: #748078 !important; letter-spacing: 0 !important; }
.status-chip { border-radius: 10rpx !important; color: #1f6b4c !important; background: #e7f0e9 !important; }
.chat-profile {
  margin-right: 32rpx !important;
  margin-left: 32rpx !important;
  border-color: #dfe8df !important;
  border-radius: 16rpx !important;
  background: #fffdf9 !important;
  box-shadow: 0 8rpx 18rpx rgba(32, 55, 42, 0.06) !important;
}
.profile-title { color: #173f30 !important; }
.profile-subtitle { color: #748078 !important; }
.profile-tag { border-color: #dfe8df !important; border-radius: 10rpx !important; color: #1f6b4c !important; background: #e7f0e9 !important; }
.messages { padding-right: 32rpx !important; padding-left: 32rpx !important; }
.empty-illustration { mix-blend-mode: normal !important; }
.empty-kicker { color: #1f6b4c !important; }
.empty-title { color: #173f30 !important; }
.empty-copy { color: #748078 !important; }
.message-text { border-color: #dfe8df !important; color: #1e2d25 !important; background: #fffdf9 !important; box-shadow: 0 6rpx 14rpx rgba(32, 55, 42, 0.06) !important; }
.message.user .message-text { border-color: #d9e5ea !important; color: #315468 !important; background: #e9f1f4 !important; }
.quick { padding-right: 32rpx !important; padding-left: 32rpx !important; border-top-color: #e2e5dc !important; background: #fffdf9 !important; }
.quick button { border-color: #dfe8df !important; border-radius: 10rpx !important; color: #1f6b4c !important; background: #fffdf9 !important; box-shadow: none !important; }
.composer { padding-right: 32rpx !important; padding-left: 32rpx !important; }
.composer input { border-color: #dfe5de !important; border-radius: 14rpx !important; background: #fffdf9 !important; box-shadow: none !important; }
.send { border-radius: 14rpx !important; background: #dfe8df !important; }
.send.enabled { background: #173f30 !important; box-shadow: 0 8rpx 18rpx rgba(23, 63, 48, 0.16) !important; }
.disclaimer { color: #8d978f !important; }

/* 详情页共同规则，保证从首页下钻后仍然是同一套视觉语言。 */
.weight-page,
.activity-page,
.sleep-page,
.fasting-page,
.water-page,
.period-page,
.medication-page {
  background: #f5f2eb !important;
  color: #1e2d25 !important;
}
.weight-page .card,
.activity-page .section,
.sleep-page .section,
.fasting-page .plan-card,
.period-page .calendar-card,
.medication-page .section {
  border-color: #e2e5dc !important;
  border-radius: 18rpx !important;
  background: #fffdf9 !important;
  box-shadow: 0 10rpx 28rpx rgba(32, 55, 42, 0.08) !important;
}
.weight-page .hero-wrap {
  border-radius: 18rpx !important;
  background: #edf3ee !important;
  box-shadow: 0 10rpx 28rpx rgba(32, 55, 42, 0.08) !important;
}
.weight-page .hero-art { mix-blend-mode: normal !important; opacity: 1 !important; }
.weight-page .hero-number,
.weight-page .summary-value,
.weight-page .trend-number { color: #173f30 !important; }
.weight-page .summary-card,
.weight-page .trend-card,
.weight-page .history-card { background: #fffdf9 !important; border-color: #e2e5dc !important; }
.weight-page .record-button,
.weight-page .save-button,
.activity-page .save-button,
.sleep-page .save,
.fasting-page .save,
.water-page .confirm-btn,
.medication-page .primary-button { border-radius: 14rpx !important; background: #173f30 !important; color: #fff !important; }
.activity-page .hero,
.sleep-page .hero { margin-right: 32rpx !important; margin-left: 32rpx !important; background: #fffdf9 !important; }
.activity-page .hero-art,
.sleep-page .art-stage image { mix-blend-mode: normal !important; opacity: 1 !important; }
.activity-page .activity-choice.selected,
.activity-page .duration-choice.selected,
.sleep-page .quality.selected { border-color: #9fc3ad !important; color: #173f30 !important; background: #e7f0e9 !important; }

.period-page .date-strip { background: #f2eee6 !important; }
.period-page .date-pill { border-color: #e2e5dc !important; border-radius: 14rpx !important; color: #748078 !important; background: #fffdf9 !important; }
.period-page .date-pill.active { border-color: #1f6b4c !important; color: #fff !important; background: #1f6b4c !important; box-shadow: 0 8rpx 18rpx rgba(31, 107, 76, .18) !important; }
.period-page .hero-card,
.period-page .calendar-card,
.period-page .symptom-card,
.period-page .cycle-editor { border-color: #e2e5dc !important; border-radius: 18rpx !important; background: #fffdf9 !important; box-shadow: 0 10rpx 28rpx rgba(32, 55, 42, .08) !important; }
.period-page .cycle-ring { background: conic-gradient(#1f6b4c 0 32%, #e5d4c6 32% 54%, #b9b5d8 54% 76%, #f4ebe5 76% 100%) !important; box-shadow: 0 16rpx 30rpx rgba(32, 55, 42, .12) !important; }
.period-page .ring-inner { background: #fffdf9 !important; }
.period-page .ring-number { color: #173f30 !important; }
.period-page .month-button { border-color: #d8e4da !important; color: #1f6b4c !important; background: #e7f0e9 !important; }
.period-page .primary,
.period-page .save-button { border: 0 !important; border-radius: 14rpx !important; color: #fff !important; background: #173f30 !important; }

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
/* Homepage polish overrides must load after legacy page styles. */
.home-page { background: #f8f9f6 !important; }
.home-page .header { background: #eff6f1 !important; }
.home-page .card,
.home-page .weight-card,
.home-page .calorie-card,
.home-page .record-card,
.home-page .grid-item,
.home-page .fasting-card,
.home-page .period-card,
.home-page .medication-card {
  border: 1rpx solid #e1e8e2 !important;
  border-left-width: 1rpx !important;
  border-left-style: solid !important;
  border-left-color: #e1e8e2 !important;
  background: #ffffff !important;
  box-shadow: 0 5rpx 16rpx rgba(28, 55, 40, 0.05) !important;
}
.home-page .grid-item:nth-child(1),
.home-page .grid-item:nth-child(2),
.home-page .grid-item:nth-child(3),
.home-page .grid-item:nth-child(4) { background: #ffffff !important; }
.home-page .grid-icon,
.home-page .fasting-icon-img,
.home-page .period-icon-img,
.home-page .medication-icon-img,
.home-page .chart-icon { opacity: 1 !important; }
.home-page .xuxu-camera-card {
  display: flex !important;
  align-items: center !important;
  min-height: 132rpx !important;
  margin-top: 20rpx !important;
  padding: 20rpx 18rpx 20rpx 24rpx !important;
  border: 1rpx solid #cfe1d4 !important;
  border-radius: 18rpx !important;
  background: #e9f4ec !important;
  box-shadow: none !important;
}
.home-page .xuxu-camera-card .camera-copy { position: relative; z-index: 1; flex: 1; min-width: 0; }
.home-page .xuxu-camera-card .camera-title { color: #173f30 !important; font-size: 28rpx !important; font-weight: 750 !important; }
.home-page .xuxu-camera-card .camera-subtitle { display: block; margin-top: 8rpx; color: #4d765f !important; font-size: 19rpx !important; }
.home-page .xuxu-camera-card .camera-decoration { flex: none; width: 148rpx !important; height: 96rpx !important; margin: 0 4rpx 0 8rpx; opacity: 1 !important; }
.home-page .xuxu-camera-card .camera-arrow {
  display: flex; flex: none; width: 44rpx; height: 44rpx; align-items: center; justify-content: center;
  border-radius: 50%; color: #1f6b4c !important; background: #ffffff !important; font-size: 28rpx; line-height: 44rpx;
}
.home-page .card-title,
.home-page .grid-title,
.home-page .fasting-time,
.home-page .period-days,
.home-page .medication-item { color: #173f30 !important; }
.home-page .weight-col .label,
.home-page .stat-label,
.home-page .hint-text,
.home-page .meal-summary,
.home-page .value-unit,
.home-page .grid-unit,
.home-page .grid-hint,
.home-page .fasting-label,
.home-page .fasting-summary,
.home-page .period-hint,
.home-page .medication-hint,
.home-page .time-text,
.home-page .camera-subtitle { color: #63736a !important; }

/* Keep the original weight illustration visible in the first viewport. */
.weight-page .hero-wrap {
  height: calc(100vw - 56rpx) !important;
  min-height: 0 !important;
  background: #eef5ef !important;
}
.weight-page .hero-art {
  position: absolute !important;
  inset: 0 !important;
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  object-position: center center !important;
  filter: saturate(1.08) contrast(1.04) brightness(1.01) !important;
  opacity: 1 !important;
  mix-blend-mode: normal !important;
}
.weight-page .hero-wash {
  background: linear-gradient(90deg, rgba(248, 251, 247, 0.3) 0%, rgba(248, 251, 247, 0.12) 46%, rgba(248, 251, 247, 0) 78%) !important;
}
.weight-page .hero-copy {
  top: 28rpx !important;
  left: 22rpx !important;
  width: 43% !important;
  padding: 18rpx 18rpx !important;
  border-radius: 16rpx !important;
  background: rgba(255, 253, 249, 0.9) !important;
  box-shadow: 0 8rpx 20rpx rgba(29, 58, 42, 0.08) !important;
}
</style>

<style>
/* Shared save action: layered translucent surfaces create a restrained glass finish. */
.home-page .wellness-save,
.mood-page .save,
.sleep-page .save,
.activity-page .save-button,
.fasting-page .save,
.water-page .confirm-btn,
.period-page .primary-button,
.period-page .save-button,
.period-setup-page .primary-button,
.medication-page .primary-button {
  min-height: 78rpx !important;
  height: 78rpx !important;
  border: 1rpx solid rgba(159, 195, 173, 0.62) !important;
  border-radius: 18rpx !important;
  color: #2f5f4a !important;
  background: rgba(237, 247, 240, 0.78) !important;
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.95), 0 8rpx 20rpx rgba(54, 104, 78, 0.14) !important;
  backdrop-filter: blur(14rpx) !important;
  font-size: 24rpx !important;
  font-weight: 600 !important;
  line-height: 78rpx !important;
}
.home-page .wellness-save.mood-save { color: #6f5260 !important; background: rgba(252, 240, 243, 0.82) !important; border-color: rgba(214, 171, 185, 0.56) !important; }
.home-page .wellness-save:active,
.mood-page .save:active,
.sleep-page .save:active,
.activity-page .save-button:active,
.fasting-page .save:active,
.water-page .confirm-btn:active,
.period-page .primary-button:active,
.period-setup-page .primary-button:active,
.medication-page .primary-button:active {
  background: rgba(214, 235, 221, 0.9) !important;
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.8), 0 4rpx 12rpx rgba(54, 104, 78, 0.12) !important;
  transform: scale(0.985);
}
/* Cross-page action language for save/confirm controls. */
button.save,
button.save-button,
button.primary-button,
button.confirm-btn,
button.primary,
button.btn-primary,
button.recognize-btn,
button.bar-done,
button.add-button,
button.action-btn.primary {
  min-height: 78rpx !important;
  border: 1rpx solid rgba(159, 195, 173, 0.62) !important;
  border-radius: 18rpx !important;
  color: #2f5f4a !important;
  background: rgba(237, 247, 240, 0.78) !important;
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.95), 0 8rpx 20rpx rgba(54, 104, 78, 0.14) !important;
  backdrop-filter: blur(14rpx) !important;
  font-size: 24rpx !important;
  font-weight: 650 !important;
  letter-spacing: 0 !important;
}
button.save:active,
button.save-button:active,
button.primary-button:active,
button.confirm-btn:active,
button.primary:active,
button.btn-primary:active,
button.recognize-btn:active,
button.bar-done:active,
button.add-button:active,
button.action-btn.primary:active {
  background: rgba(214, 235, 221, 0.9) !important;
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.8), 0 4rpx 12rpx rgba(54, 104, 78, 0.12) !important;
  transform: scale(0.985);
}
.period-page .primary-button,
.period-setup-page .primary-button { color: #765565 !important; background: rgba(252, 240, 244, 0.84) !important; border-color: rgba(214, 171, 185, 0.58) !important; box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.95), 0 8rpx 20rpx rgba(177, 105, 126, 0.14) !important; }
.period-page .primary-button:active,
.period-setup-page .primary-button:active { background: rgba(246, 220, 228, 0.92) !important; }

/* Water uses a blue-teal action that reads clearly against the cream watercolor surface. */
.water-page .record-btn {
  min-height: 84rpx !important;
  height: 84rpx !important;
  border: 1rpx solid rgba(151, 193, 203, 0.64) !important;
  border-radius: 18rpx !important;
  color: #3f7180 !important;
  background: rgba(230, 246, 249, 0.82) !important;
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.95), 0 8rpx 20rpx rgba(84, 143, 161, 0.16) !important;
  backdrop-filter: blur(14rpx) !important;
}
.water-page .record-btn::before { display: none !important; }
.water-page .record-btn:active { background: rgba(207, 235, 241, 0.94) !important; }
.water-page .record-text { color: #3f7180 !important; font-size: 24rpx !important; font-weight: 600 !important; }
.water-page .record-icon-wrap { background: rgba(255, 255, 255, 0.52) !important; }
.water-page .confirm-btn {
  border-color: rgba(151, 193, 203, 0.64) !important;
  color: #3f7180 !important;
  background: rgba(230, 246, 249, 0.84) !important;
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.9), 0 8rpx 20rpx rgba(84, 143, 161, 0.15) !important;
}
.water-page .confirm-btn:active { background: rgba(207, 235, 241, 0.94) !important; }
.water-page .setup-btn,
.water-page .reset-btn {
  border: 1rpx solid rgba(151, 193, 203, 0.58) !important;
  border-radius: 14rpx !important;
  color: #3f7180 !important;
  background: rgba(230, 246, 249, 0.72) !important;
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.88), 0 5rpx 14rpx rgba(84, 143, 161, 0.1) !important;
  font-size: 21rpx !important;
  font-weight: 600 !important;
}
.water-page .setup-btn:active,
.water-page .reset-btn:active { background: rgba(207, 235, 241, 0.9) !important; }
.water-page .drink-option {
  min-height: 142rpx !important;
  justify-content: center !important;
  padding: 14rpx 8rpx !important;
  border: 1rpx solid #dce9eb !important;
  border-radius: 16rpx !important;
  background: rgba(255, 255, 255, 0.82) !important;
}
.water-page .drink-option.active {
  border-color: #a8cfd5 !important;
  background: rgba(230, 246, 249, 0.82) !important;
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.9), 0 5rpx 12rpx rgba(84, 143, 161, 0.1) !important;
}
.water-page .drink-option .drink-image,
.water-page .drink-option .drink-emoji {
  display: flex !important;
  width: 48rpx !important;
  height: 48rpx !important;
  align-items: center !important;
  justify-content: center !important;
  margin: 0 auto !important;
  text-align: center !important;
}
.water-page .drink-option .drink-emoji { font-size: 34rpx !important; line-height: 48rpx !important; }
.water-page .drink-option .drink-name { display: block !important; width: 100% !important; margin-top: 8rpx !important; color: #59717a !important; font-size: 20rpx !important; font-weight: 600 !important; line-height: 1.25 !important; text-align: center !important; }
.water-page .drink-option.active .drink-name { color: #3f7180 !important; }
.water-page .confirm-btn { display: flex !important; align-items: center !important; justify-content: center !important; padding: 0 !important; line-height: 1 !important; }
.water-page .stat-label,
.water-page .info-desc,
.water-page .btn-text,
.water-page .record-time,
.water-page .history-count { color: #6b7f86 !important; }
.water-page .stat-value,
.water-page .stat-value.primary,
.water-page .amount-num { color: #3f7180 !important; }
.water-page .date-text,
.water-page .header-text,
.water-page .history-title,
.water-page .dialog-title { color: #365c68 !important; }
.weight-page .record-button,
.error-state button {
  border: 1rpx solid rgba(159, 195, 173, 0.62) !important;
  color: #2f5f4a !important;
  background: rgba(245, 250, 246, 0.86) !important;
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.92), 0 6rpx 16rpx rgba(54, 104, 78, 0.12) !important;
  backdrop-filter: blur(12rpx) !important;
}

/* Type hierarchy: high-contrast ink for headings, softer slate for supporting copy. */
.home-page,
.weight-page,
.sleep-page,
.mood-page,
.activity-page,
.fasting-page,
.water-page,
.period-page,
.period-setup-page,
.medication-page {
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif !important;
  color: #263a30 !important;
  -webkit-font-smoothing: antialiased;
}
.home-page .card-title,
.home-page .grid-title,
.weight-page .section-title,
.weight-page .history-heading,
.sleep-page .section-title,
.sleep-page .history-head,
.mood-page .section-title,
.mood-page .history-head,
.activity-page .section-title,
.activity-page .history-title,
.fasting-page .section-title,
.fasting-page .record-title,
.water-page .header-text,
.water-page .history-title,
.period-page .section-title,
.period-setup-page .title,
.medication-page .section-title {
  color: #274537 !important;
  font-weight: 700 !important;
  letter-spacing: 0 !important;
}
.weight-page .hero-date,
.sleep-page .section-sub,
.mood-page .section-sub,
.activity-page .section-subtitle,
.fasting-page .section-caption,
.period-page .section-caption,
.medication-page .section-caption,
.home-page .hint-text,
.home-page .stat-label,
.home-page .grid-hint {
  color: #6c7c73 !important;
  font-size: 20rpx !important;
  line-height: 1.5 !important;
}

/* Secondary controls: translucent white surfaces with a quiet, readable selected state. */
.home-page .tone-choice,
.home-page .mood-choice,
.mood-page .mood-choice,
.sleep-page .quality,
.activity-page .activity-choice,
.activity-page .duration-choice {
  border: 1rpx solid #dce8df !important;
  border-radius: 14rpx !important;
  color: #526a5c !important;
  background: rgba(255, 255, 255, 0.82) !important;
  box-shadow: 0 3rpx 10rpx rgba(44, 78, 57, 0.035) !important;
  font-size: 20rpx !important;
  font-weight: 500 !important;
}
.home-page .tone-choice.selected,
.home-page .mood-choice.selected,
.mood-page .mood-choice.selected,
.sleep-page .quality.selected,
.activity-page .activity-choice.selected,
.activity-page .duration-choice.selected {
  border-color: #9fc8ae !important;
  color: #1f6b4c !important;
  background: #edf6f0 !important;
  box-shadow: 0 5rpx 12rpx rgba(70, 130, 96, 0.1) !important;
  font-weight: 650 !important;
}
</style>

<style>
/* Detail pages share one open editorial layout: full-bleed navigation, calm bands,
   and separators instead of stacked floating cards. */
.activity-page.page,
.sleep-page.page,
.mood-page.page,
.fasting-page.page {
  padding-top: 0 !important;
  background: #fffaf5 !important;
  overflow: visible !important;
}
.fasting-page .leaf { max-width: 100vw !important; }
.activity-page .nav,
.sleep-page .nav,
.mood-page .nav,
.fasting-page .nav {
  position: sticky !important;
  top: 0 !important;
  z-index: 100 !important;
  left: calc((100% - 100vw) / 2) !important;
  width: 100vw !important;
  min-height: 76rpx !important;
  margin: 0 0 12rpx !important;
  padding: calc(env(safe-area-inset-top) + 10rpx) 32rpx 10rpx !important;
  box-sizing: border-box !important;
  border-bottom: 1rpx solid rgba(224, 214, 208, .76) !important;
  background: rgba(255, 253, 250, .9) !important;
  -webkit-backdrop-filter: blur(18px) !important;
  backdrop-filter: blur(18px) !important;
}
.activity-page .nav .title,
.sleep-page .nav .title,
.mood-page .nav .title,
.fasting-page .nav-title {
  color: #5c5358 !important;
  font-size: 29rpx !important;
  font-weight: 650 !important;
  letter-spacing: 0 !important;
}
.activity-page .nav .date,
.sleep-page .nav .date,
.mood-page .nav .date,
.fasting-page .nav-date {
  color: #9c918f !important;
  font-size: 18rpx !important;
}
.activity-page .nav .back,
.sleep-page .nav .back,
.mood-page .nav .back,
.fasting-page .nav .icon-button {
  width: 52rpx !important;
  height: 52rpx !important;
  border: 1rpx solid #e6d9d2 !important;
  border-radius: 50% !important;
  color: #7c8f92 !important;
  background: rgba(255, 255, 255, .8) !important;
  box-shadow: none !important;
  line-height: 1 !important;
}
.activity-page .hero,
.sleep-page .hero,
.mood-page .intro {
  width: calc(100% + 64rpx) !important;
  margin: 0 0 0 -32rpx !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}
.activity-page .hero { width: calc(100% + 48rpx) !important; margin-left: -24rpx !important; }
.sleep-page .hero,
.mood-page .intro { width: calc(100% + 56rpx) !important; margin-left: -28rpx !important; }
.activity-page .hero-visual,
.sleep-page .art-stage,
.mood-page .art-stage {
  border-radius: 0 !important;
}
.activity-page .section,
.sleep-page .section,
.mood-page .section {
  margin-top: 28rpx !important;
  padding: 24rpx 0 26rpx !important;
  border: 0 !important;
  border-top: 1rpx solid #e6ddd7 !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}
.activity-page .section:first-of-type,
.sleep-page .section:first-of-type,
.mood-page .section:first-of-type { border-top: 0 !important; }
.activity-page .history-section,
.sleep-page .history,
.mood-page .history { margin-top: 24rpx !important; }
.activity-page .history-row,
.sleep-page .history-row,
.mood-page .history-row {
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}
.fasting-page .calendar {
  width: calc(100% + 56rpx) !important;
  margin: 0 0 22rpx -28rpx !important;
  padding: 0 28rpx 10rpx !important;
  box-sizing: border-box !important;
  border-bottom: 1rpx solid #e1e5df !important;
  background: rgba(255, 253, 250, .68) !important;
}
.fasting-page .plan-card {
  margin: 0 !important;
  padding: 26rpx 0 28rpx !important;
  border: 0 !important;
  border-top: 1rpx solid #e1e5df !important;
  border-bottom: 1rpx solid #e1e5df !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}
.fasting-page .settings-card,
.fasting-page .tips-card,
.fasting-page .schedule-card,
.fasting-page .history-card {
  border: 0 !important;
  border-top: 1rpx solid #e1e5df !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}
.period-page .hero-card {
  border: 0 !important;
  border-radius: 0 !important;
  background: linear-gradient(180deg, #fff3ee 0%, #fffaf5 100%) !important;
  box-shadow: none !important;
}
.period-page .calendar-card,
.period-page .symptom-card,
.period-page .cycle-editor {
  border: 0 !important;
  border-top: 1rpx solid #eaded8 !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}
.period-page .calendar-card,
.period-page .symptom-card,
.period-page .cycle-editor { margin-right: 28rpx !important; margin-left: 28rpx !important; }
.medication-page .page-head { padding-top: 18rpx !important; }
.medication-page .companion-banner { border-radius: 20rpx !important; box-shadow: 0 12rpx 26rpx rgba(126, 104, 94, .07) !important; }
.medication-page .summary-line {
  margin-right: 0 !important; margin-left: 0 !important;
  padding-right: 0 !important; padding-left: 0 !important;
  border: 0 !important; border-top: 1rpx solid #e6ddd7 !important; border-bottom: 1rpx solid #e6ddd7 !important;
  border-radius: 0 !important; background: transparent !important; box-shadow: none !important;
}
.medication-page .timeline { gap: 0 !important; }
.medication-page .med-row {
  border: 0 !important; border-bottom: 1rpx solid #e6ddd7 !important; border-radius: 0 !important;
  background: transparent !important; box-shadow: none !important;
}
@media (min-width: 700px) {
  .activity-page .nav,
  .sleep-page .nav,
  .mood-page .nav,
  .fasting-page .nav { width: 100vw !important; margin-left: 0 !important; padding-right: 48rpx !important; padding-left: 48rpx !important; }
  .activity-page .hero,
  .sleep-page .hero,
  .mood-page .intro { width: calc(100% + 96rpx) !important; margin-left: -48rpx !important; padding-right: 0 !important; padding-left: 0 !important; }
  .fasting-page .calendar { width: calc(100% + 96rpx) !important; margin-left: -48rpx !important; padding-right: 48rpx !important; padding-left: 48rpx !important; }
}
</style>

<style>
/* Final home camera treatment: one quiet watercolor surface, never the legacy dark tile. */
.home-page .xuxu-camera-card {
  display: flex !important;
  align-items: center !important;
  min-height: 164rpx !important;
  margin-top: 22rpx !important;
  padding: 22rpx 22rpx 22rpx 28rpx !important;
  border: 1rpx solid #d6e5df !important;
  border-radius: 22rpx !important;
  background: #fff8ef !important;
  box-shadow: 0 10rpx 24rpx rgba(125, 103, 82, .07), inset 0 1rpx 0 rgba(255,255,255,.88) !important;
  overflow: hidden !important;
}
.home-page .xuxu-camera-card .camera-copy { flex: 1; min-width: 0; }
.home-page .xuxu-camera-card .camera-title {
  color: #625960 !important;
  font-size: 31rpx !important;
  font-weight: 700 !important;
  letter-spacing: 0 !important;
}
.home-page .xuxu-camera-card .camera-subtitle {
  margin-top: 8rpx !important;
  color: #9b8d88 !important;
  font-size: 20rpx !important;
}
.home-page .xuxu-camera-card .camera-decoration {
  flex: none !important;
  width: 188rpx !important;
  height: 124rpx !important;
  margin: 0 0 0 12rpx !important;
  opacity: 1 !important;
  mix-blend-mode: multiply !important;
}
.home-page .xuxu-camera-card:active {
  background: #fff3e6 !important;
  box-shadow: 0 6rpx 16rpx rgba(125, 103, 82, .06), inset 0 1rpx 0 rgba(255,255,255,.88) !important;
}
.sleep-page .nav .back image,
.mood-page .nav .back image,
.fasting-page .nav .back image {
  display: block !important;
  width: 26rpx !important;
  height: 26rpx !important;
  opacity: .72 !important;
}
</style>

<style>
/* Final cascade loaded after every page style. */
/* Mini-program image components need a concrete box; auto height can collapse them. */
.page.sleep-page.page .art-stage,
.page.mood-page.page .art-stage { height: 640rpx !important; min-height: 640rpx !important; }
.page.sleep-page.page .art-stage image,
.page.mood-page.page .art-stage image { width: 100% !important; height: 100% !important; object-fit: cover !important; object-position: center center !important; opacity: 1 !important; }
.page.activity-page.page .hero-visual { height: 430rpx !important; min-height: 0 !important; }
.page.activity-page.page .hero-image { width: 100% !important; height: 100% !important; object-fit: cover !important; object-position: center center !important; opacity: 1 !important; }
/* Every visible action has a stable box and centered label/icon baseline. */
.page.sleep-page.page .back,
.page.sleep-page.page .quality,
.page.sleep-page.page .save,
.page.activity-page.page .back,
.page.activity-page.page .activity-choice,
.page.activity-page.page .duration-choice,
.page.activity-page.page .save-button,
.page.mood-page.page .back,
.page.mood-page.page .mood-choice,
.page.mood-page.page .save,
.period-page .month-button,
.period-page .ghost-button,
.period-page .small-action,
.period-page .primary-button {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  line-height: 1 !important;
  box-sizing: border-box !important;
}
.page.sleep-page.page .back image,
.page.activity-page.page .back image,
.page.mood-page.page .back image,
.period-page .month-button image { width: 28rpx !important; height: 28rpx !important; margin: 0 !important; }
/* Detail-page geometry: one safe-area offset, equal gutters, and no negative-width heroes. */
.page.sleep-page.page,
.page.activity-page.page,
.page.mood-page.page { padding-top: 0 !important; padding-right: 24rpx !important; padding-left: 24rpx !important; overflow-x: hidden !important; background: #faf7f1 !important; }
.page.sleep-page.page .nav,
.page.activity-page.page .nav,
.page.mood-page.page .nav {
  position: sticky !important; top: 0 !important; z-index: 100 !important; width: calc(100% + 48rpx) !important; min-height: 0 !important;
  margin: 0 0 16rpx -24rpx !important; padding: calc(44rpx + env(safe-area-inset-top)) 24rpx 12rpx !important;
  box-sizing: border-box !important; border-bottom: 1rpx solid #ebe4dc !important; background: rgba(255,253,249,.96) !important;
  -webkit-backdrop-filter: blur(18px) !important; backdrop-filter: blur(18px) !important;
}
.page.sleep-page.page .nav .title,
.page.activity-page.page .nav .title,
.page.mood-page.page .nav .title { color: #5c5558 !important; font-size: 29rpx !important; line-height: 1.2 !important; }
.page.sleep-page.page .nav .date,
.page.activity-page.page .nav .date,
.page.mood-page.page .nav .date { color: #9a908c !important; font-size: 18rpx !important; }
.page.sleep-page.page .hero,
.page.activity-page.page .hero,
.page.mood-page.page .intro { width: 100% !important; margin-right: 0 !important; margin-left: 0 !important; border-radius: 22rpx !important; transform: none !important; box-sizing: border-box !important; }
.page.sleep-page.page .section,
.page.activity-page.page .section,
.page.mood-page.page .section { width: 100% !important; margin-right: 0 !important; margin-left: 0 !important; box-sizing: border-box !important; }
.page.sleep-page.page .save,
.page.activity-page.page .save-button,
.page.mood-page.page .save { width: 100% !important; margin-right: 0 !important; margin-left: 0 !important; }
page, body { background: #faf7f1 !important; color: #5c5558 !important; }
.home-page, .food-search-page, .food-summary-page, .food-recognition-page { background: #faf7f1 !important; color: #5c5558 !important; }
.home-page .header { background: #eef5ef !important; border-bottom-color: #e3ebe3 !important; }
.home-page .card, .home-page .grid-item, .home-page .fasting-card, .home-page .period-card, .home-page .medication-card, .home-page .record-card, .home-page .calorie-card, .home-page .weight-card,
.food-search-page .meal-switch, .food-search-page .budget-strip, .food-search-page .search-box, .food-search-page .food-card, .food-search-page .cart-panel, .food-summary-page .summary-card, .food-summary-page .meal-card, .food-recognition-page .card {
  border: 1rpx solid #ebe4dc !important; border-left: 1rpx solid #ebe4dc !important; border-radius: 20rpx !important; background: #fffdf9 !important; box-shadow: 0 8rpx 20rpx rgba(92,78,70,.05) !important;
}
.home-page .card-title, .home-page .grid-title, .food-search-page .title, .food-search-page .food-name { color: #625960 !important; }
.home-page .weight-col .num, .home-page .grid-num, .home-page .big-number .number, .home-page .value { color: #628b7e !important; }
.home-page .xuxu-camera-card { border: 1rpx solid #dfe8df !important; border-radius: 20rpx !important; background: linear-gradient(110deg,#f1f7f0 0%,#f8f4e9 100%) !important; box-shadow: inset 0 1rpx 0 rgba(255,255,255,.94),0 8rpx 18rpx rgba(109,99,84,.06) !important; }
.home-page .xuxu-camera-card .camera-title { color: #5d6962 !important; }
.home-page .xuxu-camera-card .camera-subtitle { color: #a09388 !important; }
.home-page .xuxu-camera-card .camera-decoration { width: 178rpx !important; height: 116rpx !important; }
.food-search-page .meal-switch { background: #f1f6ef !important; box-shadow: none !important; }
.food-search-page .meal-switch-item.active { color: #5d8172 !important; background: #fffdf9 !important; }
.food-search-page .category-tabs { border-color: #e7e6dc !important; background: #f2f5ee !important; box-shadow: none !important; }
.food-search-page .category-tab.active { border-left-color: #9ab9a6 !important; color: #5f8275 !important; background: #fffdf9 !important; }
.food-search-page .food-card { display: flex !important; align-items: center !important; min-height: 126rpx !important; }
.food-search-page .food-main { display: flex !important; align-items: center !important; min-width: 0 !important; }
.food-search-page .food-icon { border-color: #e4e8de !important; background: #f5f7f0 !important; }
.food-search-page .food-icon image { width: 74rpx !important; height: 74rpx !important; object-fit: contain !important; }
.food-search-page .food-add, .food-search-page .cart-done, .food-recognition-page .recognize-btn { color: #5b756b !important; border-color: #cfe0d5 !important; background: #eaf4ec !important; }
.food-recognition-page .preview-img { width: 100% !important; height: 460rpx !important; object-fit: contain !important; background: #f5f1e9 !important; }
.food-summary-page .ring { background: conic-gradient(#91b9a6 var(--progress),#eee9e1 0) !important; }
.food-summary-page .ring-inner { background: #fffdf9 !important; }
.food-summary-page .remaining, .food-summary-page .ring-inner text:first-child { color: #628b7e !important; }
.period-setup-page .primary-button { opacity: 1 !important; color: #5b756b !important; background: #eaf4ec !important; border-color: #cfe0d5 !important; }
.chat-shell { background: #faf7f1 !important; color: #5c5558 !important; }
.chat-head, .quick { background: rgba(255,253,249,.96) !important; border-color: #ebe4dc !important; }
.chat-name, .empty-title { color: #5c5558 !important; }
.send.enabled { background: #e8f3e9 !important; border-color: #d1e2d4 !important; }
.food-detail-page, .food-detail-catalog-page { background: #faf7f1 !important; color: #5c5558 !important; }
.food-detail-page .calorie-summary, .food-detail-page .meal-section,
.food-detail-catalog-page .card { border-color: #ebe4dc !important; border-radius: 20rpx !important; background: #fffdf9 !important; box-shadow: 0 8rpx 20rpx rgba(92,78,70,.05) !important; }
.food-detail-catalog-page .content { padding-top: 18rpx !important; }
.food-detail-catalog-page .food-icon-large { border-color: #e4e8de !important; background: #f5f7f0 !important; }
.food-detail-catalog-page .food-icon-large image { width: 96rpx !important; height: 96rpx !important; object-fit: contain !important; }

/* Shared control geometry. Every label/icon sits in the same flex-centered box
   so the WeChat renderer does not apply inconsistent line-height baselines. */
button.back,
button.nav-back,
button.nav-date,
button.icon-button,
button.icon-action,
button.close-button,
button.close,
button.save,
button.save-button,
button.primary-button,
button.record-button,
button.primary,
button.secondary,
button.checkin,
button.reminder,
button.mode-card,
button.activity-choice,
button.duration-choice,
button.quality,
button.mood-choice,
button.history-action,
button.day-arrow,
button.date-arrow,
button.cart-arrow,
button.photo-arrow,
button.month-button,
button.ghost-button,
button.small-action,
button.text-action,
button.empty-action,
button.retry,
button.retry-btn,
button.manual-btn,
button.food-add,
button.cart-done,
button.page-button,
button.meal-add,
button.add-more,
button.action-btn {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-sizing: border-box !important;
  line-height: 1 !important;
}
button.back image,
button.nav-back image,
button.icon-button image,
button.icon-action image,
button.day-arrow image,
button.date-arrow image,
button.cart-arrow image,
button.photo-arrow image,
button.month-button image {
  display: block !important;
  flex: none !important;
  margin: 0 !important;
}
.activity-page .intensity-choice {
  align-items: center !important;
  text-align: center !important;
}
</style>

<style>
/* Bright canvas shared by every health detail page. Feature colors stay on their artwork and controls. */
page,
body {
  background: #fffdf9 !important;
}

.page,
.food-detail-page,
.bootstrap-page,
.onboarding-container,
.chat-shell {
  background-color: #fffdf9 !important;
}

.page .card,
.page .section,
.page .plan-card,
.page .record-section,
.page .history-section,
.page .summary-card,
.page .meal-card,
.page .settings-sheet {
  background-color: #ffffff !important;
  border-color: #e9e9e3 !important;
  box-shadow: 0 7rpx 18rpx rgba(93, 83, 72, 0.035) !important;
}
</style>

<style>
/* Last-loaded visual system. The explicit final import prevents legacy
 * per-page cascades from leaking into shared controls. */
@import './styles/visual-system.css';
</style>
