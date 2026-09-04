<template>
  <view class="review">
    <view class="review-head"><view><text class="review-title">这一周的节奏</text><text class="review-note">不追求满分，只看见自己的坚持</text></view><text class="review-total">{{ total }} 次完成</text></view>
    <view class="bars"><view v-for="day in summary" :key="day.key" class="bar-column"><view class="bar-track"><view class="bar-fill" :style="{ height: `${barHeight(day.completed)}%` }" /></view><text class="bar-value">{{ day.completed || '' }}</text><text class="bar-label">{{ day.label }}</text></view></view>
    <view class="review-foot"><text>{{ insight }}</text><text class="best-day">{{ bestDay }}</text></view>
  </view>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import type { HabitPlan } from '../../features/plans/plan-types.js';
import { weekSummary } from '../../features/plans/plan-store.js';
const props = defineProps<{ plans: HabitPlan[] }>();
const summary = computed(() => weekSummary(props.plans));
const total = computed(() => summary.value.reduce((sum, day) => sum + day.completed, 0));
const max = computed(() => Math.max(1, ...summary.value.map((day) => day.completed)));
const barHeight = (value: number) => Math.max(8, Math.round((value / max.value) * 100));
const bestDay = computed(() => {
  let best: (typeof summary.value)[number] | undefined;
  for (const day of summary.value) {
    if (!best || day.completed > best.completed) best = day;
  }
  return best?.completed ? `最有能量的是周${best.label}` : '从今天开始，写下第一个小点';
});
const insight = computed(() => total.value === 0 ? '还没有完成记录，先挑一个最轻松的行动吧' : total.value >= 12 ? '你正在建立很稳定的节奏' : '每一次勾选，都是在给自己积累底气');
</script>
<style scoped>
.review { margin-top:28rpx; padding:22rpx 22rpx 18rpx; border:1rpx solid #e2ebe1; border-radius:20rpx; background:#ffffff; box-shadow:0 8rpx 22rpx rgba(54,83,67,.06); }
.review-head,.review-foot { display:flex; align-items:flex-end; justify-content:space-between; }.review-title { display:block; color:#4f6756; font-size:28rpx; font-weight:700; }.review-note { display:block; margin-top:5rpx; color:#8ba092; font-size:19rpx; }.review-total { color:#5f8d68; font-size:20rpx; }
.bars { display:flex; align-items:flex-end; justify-content:space-around; height:170rpx; margin-top:20rpx; padding:0 10rpx; border-bottom:1rpx solid #e8efe6; }.bar-column { display:flex; align-items:center; flex-direction:column; justify-content:flex-end; width:42rpx; height:100%; }.bar-track { display:flex; align-items:flex-end; width:20rpx; height:105rpx; border-radius:12rpx; background:#edf5e8; }.bar-fill { width:100%; min-height:8rpx; border-radius:12rpx; background:#79ad82; transition:height .25s ease; }.bar-value { height:24rpx; color:#5f8d68; font-size:16rpx; }.bar-label { margin-top:8rpx; color:#8ba092; font-size:18rpx; }
.review-foot { align-items:center; margin-top:15rpx; color:#78907f; font-size:19rpx; }.best-day { color:#5f8d68; }
</style>
