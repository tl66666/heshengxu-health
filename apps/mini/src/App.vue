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
/* Detail pages keep their navigation visible while the record content scrolls. */
.activity-page .nav,
.sleep-page .nav,
.mood-page .nav,
.fasting-page .nav {
  position: sticky !important;
  top: 0 !important;
  z-index: 50 !important;
  box-sizing: border-box !important;
  margin-bottom: 18rpx !important;
  border-bottom: 1rpx solid rgba(221, 231, 222, 0.82) !important;
  background: rgba(248, 250, 244, 0.96) !important;
  -webkit-backdrop-filter: blur(16px) !important;
  backdrop-filter: blur(16px) !important;
}
.activity-page .nav {
  margin-top: calc(-96rpx - env(safe-area-inset-top)) !important;
  padding: calc(96rpx + env(safe-area-inset-top)) 24rpx 14rpx !important;
}
.sleep-page .nav,
.mood-page .nav {
  margin-top: calc(-112rpx - env(safe-area-inset-top)) !important;
  padding: calc(112rpx + env(safe-area-inset-top)) 28rpx 14rpx !important;
}
.fasting-page .nav {
  margin-top: calc(-104rpx - env(safe-area-inset-top)) !important;
  padding: calc(104rpx + env(safe-area-inset-top)) 32rpx 14rpx !important;
}
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
  border: 4rpx solid #c78a3b !important;
  background: #fffdf9 !important;
  box-shadow: 0 8rpx 18rpx rgba(199, 138, 59, 0.2) !important;
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
.water-page .card,
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

.water-page .goal-card,
.water-page .quick-btn,
.water-page .record-item {
  border-color: #e2e5dc !important;
  border-radius: 16rpx !important;
  background: #fffdf9 !important;
  box-shadow: 0 8rpx 22rpx rgba(32, 55, 42, 0.07) !important;
}
.water-page .stat-value,
.water-page .amount-num { color: #173f30 !important; }
.water-page .record-btn { border: 0 !important; border-radius: 14rpx !important; background: #173f30 !important; box-shadow: 0 8rpx 18rpx rgba(23, 63, 48, .16) !important; }
.water-page .header-text,
.water-page .history-title { color: #173f30 !important; }
.water-page .date-btn { border-radius: 10rpx !important; color: #1f6b4c !important; background: #e7f0e9 !important; }

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
