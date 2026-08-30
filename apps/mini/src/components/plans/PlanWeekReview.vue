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
const bestDay = computed(() => { const best = summary.value.reduce((current, day) => day.completed > current.completed ? day : current, summary.value[0]); return best?.completed ? `最有能量的是周${best.label}` : '从今天开始，写下第一个小点'; });
const insight = computed(() => total.value === 0 ? '还没有完成记录，先挑一个最轻松的行动吧' : total.value >= 12 ? '你正在建立很稳定的节奏' : '每一次勾选，都是在给自己积累底气');
</script>
<style scoped>
.review { margin-top:28rpx; padding:22rpx 22rpx 18rpx; border:1rpx solid #eadfd8; border-radius:20rpx; background:#fffdf9; box-shadow:0 8rpx 22rpx rgba(139,102,89,.05); }
.review-head,.review-foot { display:flex; align-items:flex-end; justify-content:space-between; }.review-title { display:block; color:#63545a; font-size:28rpx; font-weight:700; }.review-note { display:block; margin-top:5rpx; color:#a18f92; font-size:19rpx; }.review-total { color:#b66d80; font-size:20rpx; }
.bars { display:flex; align-items:flex-end; justify-content:space-around; height:170rpx; margin-top:20rpx; padding:0 10rpx; border-bottom:1rpx solid #f0e5df; }.bar-column { display:flex; align-items:center; flex-direction:column; justify-content:flex-end; width:42rpx; height:100%; }.bar-track { display:flex; align-items:flex-end; width:20rpx; height:105rpx; border-radius:12rpx; background:#f7efeb; }.bar-fill { width:100%; min-height:8rpx; border-radius:12rpx; background:#dba4a9; transition:height .25s ease; }.bar-value { height:24rpx; color:#b67d82; font-size:16rpx; }.bar-label { margin-top:8rpx; color:#a38e91; font-size:18rpx; }
.review-foot { align-items:center; margin-top:15rpx; color:#927d82; font-size:19rpx; }.best-day { color:#b66d80; }
</style>
