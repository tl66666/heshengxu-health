<template>
  <view class="lean-home-card card" @tap="navigateTo('/pages/lean-muscle/LeanMusclePage')">
    <view class="lean-home-top"
      ><text class="card-title">薄肌养成</text
      ><text class="lean-home-label">{{
        plan ? `${trainedDays} / ${plan.trainingDays.length} 天` : '从一次开始'
      }}</text></view
    >
    <text class="lean-home-main">{{ summary }}</text>
    <text class="lean-home-caption">薄肌圣经 · 本周评分 · 力量记录</text>
    <LeanArt class="lean-home-art" />
  </view>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { loadJournal, getWeekPlan } from '../../features/lean-muscle/store.js';
import { weekDates, shanghaiDate, weekday } from '../../features/lean-muscle/calendar.js';
import { navigateTo } from '../../utils/router.js';
import LeanArt from '../lean-muscle/LeanArt.vue';
const journal = ref(loadJournal());
const day = ref(shanghaiDate());
onShow(() => {
  day.value = shanghaiDate();
  journal.value = loadJournal();
});
const plan = computed(() => getWeekPlan(journal.value, day.value));
const trainedDays = computed(
  () =>
    new Set(
      journal.value.sessions
        .filter((s) => weekDates(day.value).includes(s.date))
        .map((s) => s.date),
    ).size,
);
const summary = computed(() =>
  !plan.value
    ? '把力量，慢慢练进生活'
    : journal.value.pausedWeeks.includes(weekDates(day.value)[0]!)
      ? '这周先照顾好恢复'
      : plan.value.trainingDays.includes(weekday(day.value))
        ? `今天力量训练 · ${plan.value.durationMinutes} 分钟`
        : '今天按安排恢复，也是一种进步',
);
</script>
<style scoped>
.lean-home-card {
  position: relative;
  overflow: hidden;
  padding: 28rpx 30rpx;
  min-height: 158rpx;
  border-left: 5rpx solid #bf9366;
  background: linear-gradient(120deg, #fff7e8, #f2e7d3 65%, #e8eeeb);
  border-radius: 28rpx;
  color: #68513c;
  box-sizing: border-box;
  border-top: 1rpx solid #e4d4ba;
  border-right: 1rpx solid #e4d4ba;
  border-bottom: 1rpx solid #e4d4ba;
  margin-bottom: 24rpx;
}
.lean-home-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-title {
  font-size: 29rpx;
  font-weight: 700;
}
.lean-home-label {
  font-size: 21rpx;
  color: #9a764b;
  background: #f0e3cc;
  padding: 6rpx 14rpx;
  border-radius: 20rpx;
}
.lean-home-main {
  display: block;
  font-size: 25rpx;
  margin-top: 20rpx;
  max-width: 75%;
  position: relative;
  z-index: 1;
}
.lean-home-caption {
  display: block;
  font-size: 21rpx;
  color: #7c8d80;
  margin-top: 9rpx;
  position: relative;
  z-index: 1;
}
.lean-home-art {
  position: absolute;
  right: 15rpx;
  bottom: 0;
  width: 115rpx;
  height: 115rpx;
  opacity: 0.78;
}
</style>
