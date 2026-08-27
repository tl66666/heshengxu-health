<template>
  <view class="page">
    <AppNavBar title="本周回顾" route="/pages/weekly-review/WeeklyReviewPage" />
    <view class="intro"><text class="eyebrow">一周的真实记录</text></view>
    <view v-if="loading" class="state"><text>正在整理这一周的记录...</text></view>
    <view v-else-if="error" class="state"
      ><text class="state-title">回顾暂时没有加载出来</text
      ><text>你的记录不会丢失，稍后再试一次。</text
      ><button class="primary" @tap="load">重新加载</button></view
    >
    <template v-else-if="review">
      <view v-if="review.coverage.status === 'insufficient'" class="state insufficient"
        ><text class="state-title">本周还在收集节律</text
        ><text
          >目前有 {{ review.coverage.recordedDayCount }} 天真实记录，再坚持几天再来看变化。</text
        ><button class="primary" @tap="goRecords">去记录</button></view
      >
      <template v-else>
        <view class="banner"
          ><image
            class="banner-art"
            src="/static/illustrations/weekly-insight-banner.png"
            mode="aspectFill"
          /><view class="banner-wash" /><view class="banner-copy"
            ><text class="banner-days"
              ><text class="days-num">{{ review.coverage.recordedDayCount }}</text
              ><text class="days-unit">天记录</text></text
            ><text class="banner-range"
              >{{ review.range.startDate }} 至 {{ review.range.endDate }}</text
            ></view
          ></view
        >
        <view class="section card"
          ><text class="section-title">体重记录</text
          ><view v-if="review.weight.recordCount >= 2"
            ><view class="metric-line"
              ><text class="metric">{{ review.weight.lastKg }}</text
              ><text class="metric-unit">kg · 最新体重</text></view
            ><text class="caption"
              >较本周首次记录 {{ signed(review.weight.changeKg) }} kg</text
            ></view
          ><text v-else class="caption"
            >已记录 {{ review.weight.recordCount }} 次，再记录一次后可以对比变化。</text
          ><view class="points"
            ><view v-for="point in review.weight.points" :key="point.date" class="point"
              ><text>{{ point.date.slice(5) }}</text
              ><text>{{ point.valueKg }} kg</text></view
            ></view
          ></view
        >
        <view class="section card"
          ><text class="section-title">这一周的节律</text
          ><view class="facts"
            ><view class="fact"
              ><view class="fact-top"
                ><text class="fact-value">{{ review.food.energyKcal }}</text
                ><text class="fact-unit">kcal</text></view
              ><text class="fact-label">已记录食物</text></view
            ><view class="fact"
              ><view class="fact-top"
                ><text class="fact-value">{{ review.activity.durationMinutes }}</text
                ><text class="fact-unit">分钟</text></view
              ><text class="fact-label">活动</text></view
            ><view class="fact"
              ><view class="fact-top"
                ><text class="fact-value">{{
                  review.sleep.recordCount
                    ? Math.round((review.sleep.durationMinutes / 60) * 10) / 10
                    : '—'
                }}</text
                ><text v-if="review.sleep.recordCount" class="fact-unit">小时</text></view
              ><text class="fact-label"
                >睡眠{{ review.sleep.recordCount ? '' : '未记录' }}</text
              ></view
            ></view
          ></view
        >
        <view class="xuxu"
          ><image src="/static/illustrations/xuxu-complete.png" mode="aspectFit" /><text
            >序序只会根据你已经留下的记录，陪你看见这一周。</text
          ></view
        >
      </template>
    </template>
    <MiniTabBar active="plan" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AppNavBar from '../../components/AppNavBar.vue';
import MiniTabBar from '../../components/MiniTabBar.vue';
import {
  loadWeeklyReview,
  type WeeklyReview,
} from '../../features/weekly-review/weekly-review.service.js';
const review = ref<WeeklyReview | null>(null);
const loading = ref(true);
const error = ref(false);
const date = localDate();
async function load() {
  loading.value = true;
  error.value = false;
  try {
    review.value = await loadWeeklyReview(date);
  } catch {
    error.value = true;
  } finally {
    loading.value = false;
  }
}
function signed(value?: number) {
  return value === undefined ? '' : `${value > 0 ? '+' : ''}${value}`;
}
function goRecords() {
  uni.switchTab({ url: '/pages/records/RecordsPage' });
}
function localDate() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
onLoad(load);
</script>

<style scoped>
.page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 44rpx 32rpx calc(var(--hz-tabbar-height) + var(--hz-tabbar-offset) * 2 + 40rpx);
  background: #f7fbf8;
  color: #244a32;
}
.eyebrow,
.section-title,
.caption {
  display: block;
}
.intro {
  margin: -2rpx 0 24rpx 2rpx;
}
.eyebrow {
  color: #789181;
  font-size: 21rpx;
}
.banner,
.section.card,
.xuxu {
  box-sizing: border-box;
  border-radius: var(--hz-radius-card);
  background: #fff;
  box-shadow: var(--hz-shadow-card);
}
.banner {
  position: relative;
  min-height: 176rpx;
  overflow: hidden;
  background: #fffdf5;
}
.banner-art {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
/* 右侧浅色留白区上的文字保护层，镜像 IllustratedHero 的处理方式 */
.banner-wash {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    270deg,
    rgba(253, 255, 249, 0.95) 0%,
    rgba(253, 255, 249, 0.72) 34%,
    rgba(253, 255, 249, 0) 62%
  );
}
.banner-copy {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  padding: 24rpx 26rpx 20rpx;
}
.banner-days {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
  color: #41684c;
}
.days-num {
  color: #2f6140;
  font-size: 52rpx;
  font-weight: 700;
  line-height: 1.1;
}
.days-unit {
  font-size: 22rpx;
  font-weight: 700;
}
.banner-range {
  display: block;
  margin-top: 8rpx;
  overflow: hidden;
  color: #7b9181;
  font-size: 19rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.section {
  margin-top: 20rpx;
  padding: 26rpx 24rpx;
}
.section-title {
  margin-bottom: 18rpx;
  font-size: 28rpx;
  font-weight: 700;
}
.metric-line {
  display: flex;
  align-items: baseline;
  gap: 10rpx;
}
.metric {
  color: #2f6140;
  font-size: 48rpx;
  font-weight: 700;
  line-height: 1.1;
}
.metric-unit {
  color: #799080;
  font-size: 21rpx;
}
.caption {
  margin-top: 9rpx;
  color: #799080;
  font-size: 22rpx;
  line-height: 1.5;
}
.points,
.facts {
  display: flex;
  gap: 12rpx;
  margin-top: 20rpx;
}
.point,
.fact {
  min-width: 0;
  flex: 1;
  padding: 14rpx 10rpx;
  border-radius: var(--hz-radius-tile);
  background: #f4f9f4;
}
.point text {
  display: block;
  font-size: 19rpx;
  color: #6f8777;
}
.point text:last-child {
  margin-top: 5rpx;
  color: #345a41;
  font-size: 23rpx;
  font-weight: 700;
}
.facts {
  gap: 10rpx;
}
.fact {
  padding: 16rpx 14rpx 18rpx;
}
.fact-top {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
}
.fact-value {
  overflow: hidden;
  max-width: 100%;
  color: #2f6140;
  font-size: 34rpx;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.fact-unit {
  flex: none;
  color: #7d9585;
  font-size: 18rpx;
}
.fact-label {
  display: block;
  margin-top: 6rpx;
  overflow: hidden;
  color: #6f8777;
  font-size: 19rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.state {
  display: flex;
  min-height: 420rpx;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 30rpx;
  color: #718a7a;
  text-align: center;
  font-size: 24rpx;
  line-height: 1.6;
}
.state-title {
  color: #315a40;
  font-size: 31rpx;
  font-weight: 700;
}
.primary {
  margin-top: 26rpx;
  padding: 16rpx 32rpx;
  border-radius: 12rpx;
  color: #fff;
  background: #347c50;
  font-size: 25rpx;
}
.insufficient {
  min-height: 360rpx;
  border-radius: var(--hz-radius-card);
  background: #fffdf5;
  box-shadow: var(--hz-shadow-card);
}
.xuxu {
  display: flex;
  align-items: center;
  gap: 14rpx;
  margin-top: 20rpx;
  padding: 16rpx;
}
.xuxu image {
  width: 74rpx;
  height: 74rpx;
  flex: none;
}
.xuxu text {
  color: #62806b;
  font-size: 22rpx;
  line-height: 1.5;
}
</style>
