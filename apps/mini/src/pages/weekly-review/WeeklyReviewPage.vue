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
          ><image src="/static/illustrations/insight-report-banner.png" mode="aspectFit" /><view
            ><text>本周覆盖 {{ review.coverage.recordedDayCount }} 天</text
            ><text>{{ review.range.startDate }} 至 {{ review.range.endDate }}</text></view
          ></view
        >
        <view class="section"
          ><text class="section-title">体重记录</text
          ><view v-if="review.weight.recordCount >= 2"
            ><text class="metric">{{ review.weight.lastKg }} kg</text
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
        <view class="section"
          ><text class="section-title">这一周的节律</text
          ><view class="facts"
            ><view
              ><text>{{ review.food.energyKcal }} kcal</text><text>已记录食物</text></view
            ><view
              ><text>{{ review.activity.durationMinutes }} 分钟</text><text>活动</text></view
            ><view
              ><text>{{
                review.sleep.recordCount
                  ? `${Math.round((review.sleep.durationMinutes / 60) * 10) / 10} 小时`
                  : '未记录'
              }}</text
              ><text>睡眠</text></view
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
  uni.navigateTo({ url: '/pages/records/RecordsPage' });
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
  padding: 44rpx 32rpx 150rpx;
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
.section,
.xuxu {
  box-sizing: border-box;
  border: 1rpx solid #dceadd;
  border-radius: 16rpx;
  background: #fff;
}
.banner {
  display: flex;
  align-items: center;
  min-height: 160rpx;
  overflow: hidden;
  background: #fffdf5;
}
.banner image {
  width: 230rpx;
  height: 160rpx;
  flex: none;
}
.banner view text {
  display: block;
  color: #41684c;
  font-size: 25rpx;
  font-weight: 700;
}
.banner view text:last-child {
  margin-top: 9rpx;
  color: #7b9181;
  font-size: 20rpx;
  font-weight: 400;
}
.section {
  margin-top: 20rpx;
  padding: 24rpx;
}
.section-title {
  margin-bottom: 18rpx;
  font-size: 28rpx;
  font-weight: 700;
}
.metric {
  font-size: 42rpx;
  font-weight: 700;
}
.caption {
  margin-top: 7rpx;
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
.facts view {
  min-width: 0;
  flex: 1;
  padding: 14rpx 10rpx;
  border-radius: 10rpx;
  background: #f1f7f1;
}
.point text,
.facts text {
  display: block;
  font-size: 19rpx;
  color: #6f8777;
}
.point text:last-child,
.facts text:first-child {
  margin-top: 5rpx;
  color: #345a41;
  font-size: 23rpx;
  font-weight: 700;
}
.facts {
  gap: 10rpx;
}
.facts view {
  padding: 16rpx 12rpx;
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
  border: 1rpx solid #dceadd;
  border-radius: 16rpx;
  background: #fffdf5;
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
