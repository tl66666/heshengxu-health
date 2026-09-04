<template>
  <view class="page community-page">
    <view class="ambient ambient-a" />
    <view class="ambient ambient-b" />

    <!-- Hero：图在上、文案在下，互不遮挡 -->
    <view class="hero hz-rise">
      <view class="hero-art-wrap">
        <image
          class="hero-art"
          src="/static/illustrations/xuxu-safe-support.png"
          mode="widthFix"
        />
        <view class="hero-fade" />
      </view>
      <view class="hero-copy">
        <text class="hero-kicker">COMPANION COMMUNITY</text>
        <view class="hero-title-row">
          <text class="hero-title">同伴社区</text>
          <view class="hero-chip">
            <view class="hero-chip-dot" />
            <text class="hero-chip-text">即将开启</text>
          </view>
        </view>
        <text class="hero-subtitle">和同样认真生活的人，一起把健康坚持下去</text>
      </view>
    </view>

    <view class="notice hz-rise hz-rise-1">
      <view class="notice-badge">
        <text class="notice-badge-text">建设中</text>
      </view>
      <view class="notice-copy">
        <text class="notice-title">社区功能正在精心打磨</text>
        <text class="notice-desc">打卡陪伴、经验分享、小组挑战都在路上，敬请期待后续版本。</text>
      </view>
    </view>

    <view class="preview hz-rise hz-rise-2">
      <text class="preview-eyebrow">即将上线</text>
      <view class="preview-grid">
        <view v-for="item in previews" :key="item.title" class="preview-card">
          <view class="preview-icon-wrap">
            <image class="preview-icon" :src="item.icon" mode="aspectFit" />
          </view>
          <text class="preview-title">{{ item.title }}</text>
          <text class="preview-desc">{{ item.desc }}</text>
        </view>
      </view>
    </view>

    <MiniTabBar active="community" />
  </view>
</template>

<script setup lang="ts">
import MiniTabBar from '../../components/MiniTabBar.vue';

const previews = [
  { title: '打卡陪伴', desc: '互相看见每一份坚持', icon: '/static/icons/svg/journal.svg' },
  { title: '经验分享', desc: '真实的改变故事与心得', icon: '/static/icons/svg/meal.svg' },
  { title: '小组挑战', desc: '和朋友一起完成小目标', icon: '/static/icons/svg/activity.svg' },
] as const;
</script>

<style scoped>
.page {
  position: relative;
  box-sizing: border-box;
  min-height: 100vh;
  min-width: 0;
  overflow-x: hidden;
  padding: 0 32rpx calc(var(--hz-tabbar-height) + env(safe-area-inset-bottom) + 44rpx);
  background: transparent;
  color: var(--hz-ink);
}

/* 顶部柔和光晕：只负责氛围，不承载内容 */
.ambient {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.ambient-a {
  top: -160rpx;
  right: -140rpx;
  width: 520rpx;
  height: 520rpx;
  background: radial-gradient(closest-side, rgba(125, 178, 148, 0.15), transparent);
}
.ambient-b {
  top: 360rpx;
  left: -200rpx;
  width: 460rpx;
  height: 460rpx;
  background: radial-gradient(closest-side, rgba(140, 176, 196, 0.12), transparent);
}

/* ---------- Hero：图片通栏铺满，文案在下 ---------- */
.hero {
  position: relative;
  z-index: 1;
  margin: 0 calc(var(--hz-gutter) * -1);
  padding-top: 0;
}
/* 整幅原图按宽度通栏展示：铺满且完整，高度随原图比例 */
.hero-art-wrap {
  position: relative;
  width: 100%;
}
.hero-art {
  display: block;
  width: 100%;
  height: auto;
}
/* 图片底部渐隐进画布，文字区与图自然衔接 */
.hero-fade {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 120rpx;
  background: linear-gradient(180deg, rgba(255, 253, 249, 0) 0%, var(--hz-bg) 100%);
}
.hero-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 8rpx var(--hz-gutter) 0;
}
.hero-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: 4rpx;
}
.hero-kicker {
  color: var(--hz-faint);
  font-size: 17rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
}
.hero-title-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 10rpx;
}
.hero-title {
  color: var(--hz-ink);
  font-size: 44rpx;
  font-weight: 800;
  line-height: 1.2;
}
.hero-chip {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 18rpx;
  border: 1rpx solid rgba(159, 195, 173, 0.5);
  border-radius: 999rpx;
  background: var(--hz-green-soft);
}
.hero-chip-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: var(--hz-green-bright);
  box-shadow: 0 0 0 4rpx rgba(72, 163, 119, 0.16);
}
.hero-chip-text {
  color: var(--hz-green);
  font-size: 19rpx;
  font-weight: 650;
}
.hero-subtitle {
  margin-top: 12rpx;
  color: var(--hz-muted);
  font-size: 21rpx;
  line-height: 1.55;
}

/* ---------- 建设中提示 ---------- */
.notice {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  margin-top: 36rpx;
  padding: 24rpx 26rpx;
  border: 1rpx solid var(--hz-rule-glass);
  border-radius: var(--hz-radius-card);
  background: var(--hz-surface-glass);
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.85), var(--hz-shadow-card);
  -webkit-backdrop-filter: var(--hz-blur);
  backdrop-filter: var(--hz-blur);
}
.notice-badge {
  display: flex;
  align-items: center;
  flex: none;
  padding: 8rpx 18rpx;
  border: 1rpx solid rgba(159, 195, 173, 0.6);
  border-radius: 999rpx;
  background: var(--hz-primary-soft);
}
.notice-badge-text {
  color: var(--hz-green);
  font-size: 20rpx;
  font-weight: 700;
}
.notice-copy {
  min-width: 0;
  flex: 1;
}
.notice-title {
  display: block;
  color: var(--hz-ink);
  font-size: 27rpx;
  font-weight: 700;
}
.notice-desc {
  display: block;
  margin-top: 8rpx;
  color: var(--hz-muted);
  font-size: 21rpx;
  line-height: 1.55;
}

/* ---------- 即将上线预览 ---------- */
.preview {
  margin-top: 34rpx;
}
.preview-eyebrow {
  display: block;
  margin: 0 4rpx 16rpx;
  color: var(--hz-muted);
  font-size: 20rpx;
  font-weight: 600;
}
.preview-grid {
  display: grid;
  gap: 16rpx;
  grid-template-columns: repeat(3, 1fr);
}
.preview-card {
  padding: 26rpx 16rpx 24rpx;
  border: 1rpx solid var(--hz-rule-glass);
  border-radius: var(--hz-radius-card);
  background: var(--hz-surface-glass);
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.85), var(--hz-shadow-card);
  -webkit-backdrop-filter: var(--hz-blur);
  backdrop-filter: var(--hz-blur);
  text-align: center;
}
.preview-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 78rpx;
  height: 78rpx;
  margin: 0 auto 14rpx;
  border: 1rpx solid rgba(159, 195, 173, 0.5);
  border-radius: 24rpx;
  background: linear-gradient(150deg, rgba(237, 247, 240, 0.95), rgba(233, 241, 244, 0.85));
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.9), 0 6rpx 14rpx rgba(47, 107, 77, 0.08);
}
.preview-icon {
  width: 40rpx;
  height: 40rpx;
}
.preview-title {
  display: block;
  color: var(--hz-ink);
  font-size: 23rpx;
  font-weight: 700;
}
.preview-desc {
  display: block;
  margin-top: 8rpx;
  color: var(--hz-muted);
  font-size: 18rpx;
  line-height: 1.5;
}

@media (max-width: 360px) {
  .page {
    padding-right: 24rpx;
    padding-left: 24rpx;
  }
  .preview-grid {
    gap: 12rpx;
  }
  .preview-card {
    padding: 20rpx 12rpx 18rpx;
  }
}
</style>
