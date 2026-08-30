<template>
  <view class="section">
    <view class="section-head"><view><text class="section-title">正在进行</text><text class="section-note">今天完成一点点即可</text></view><text class="count">{{ completedTotal }}/{{ totalTasks }}</text></view>
    <view v-if="!plans.length" class="empty-inline"><text>还没有计划，去下面挑一个吧</text></view>
    <view v-for="plan in plans" :key="plan.id" class="plan-card" :style="{ '--tint': plan.tint }">
      <view class="plan-head">
        <image :src="plan.icon" mode="aspectFit" />
        <view class="plan-head-copy"><text class="plan-title">{{ plan.title }}</text><text class="plan-subtitle">{{ plan.subtitle }}</text></view>
        <view class="plan-head-actions"><text class="plan-frequency">{{ plan.frequency }}</text><button class="manage" aria-label="管理计划" @tap="$emit('manage', plan.id)">···</button></view>
      </view>
      <view class="task-list">
        <view v-for="task in plan.tasks" :key="task.id" class="task-row" :class="{ done: done(task) }">
          <button class="check" :class="{ checked: done(task) }" :aria-label="done(task) ? '取消打卡' : '完成打卡'" @tap="$emit('toggle', plan.id, task.id)"><text v-if="done(task)">✓</text></button>
          <view class="task-copy"><text class="task-title">{{ task.title }}</text><text class="task-note">{{ done(task) ? '今天已经完成，做得很好' : task.note }}</text></view>
        </view>
      </view>
      <view v-if="plan.tasks.length > 0 && planStats(plan).completed === plan.tasks.length" class="celebrate">
        <image src="/static/illustrations/xuxu-complete.png" mode="aspectFit" />
        <text>今天的节奏完成啦，给自己一个拥抱</text>
      </view>
      <view class="week-dots"><text v-for="day in weekDays" :key="day.key" :class="{ active: plan.tasks.every((task) => task.doneDates.includes(day.key)) }">{{ day.label }}</text></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { HabitPlan, HabitTask } from '../../features/plans/plan-types.js';
import { isTaskDone, planStats } from '../../features/plans/plan-store.js';
const props = defineProps<{ plans: HabitPlan[] }>();
defineEmits<{ toggle: [planId: string, taskId: string]; manage: [planId: string] }>();
const completedTotal = computed(() => props.plans.reduce((sum, plan) => sum + planStats(plan).completed, 0));
const totalTasks = computed(() => props.plans.reduce((sum, plan) => sum + plan.tasks.length, 0));
const done = (task: HabitTask) => isTaskDone(task);
const weekDays = computed(() => {
  const labels = ['日', '一', '二', '三', '四', '五', '六'];
  const list = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(); date.setDate(date.getDate() - offset);
    const key = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    list.push({ key, label: labels[date.getDay()] });
  }
  return list;
});
</script>

<style scoped>
.section { margin-top:34rpx; }
.section-head { display:flex; align-items:flex-end; justify-content:space-between; margin:0 2rpx 14rpx; }
.section-title { display:block; color:#5d4f53; font-size:30rpx; font-weight:700; }
.section-note { display:block; margin-top:5rpx; color:#9b888d; font-size:20rpx; }
.count { color:#b66d80; font-size:22rpx; }
.empty-inline { padding:30rpx; border:1rpx dashed #ead8d2; border-radius:18rpx; color:#9d8c90; text-align:center; font-size:22rpx; background:#fffdf8; }
.plan-card { margin-bottom:18rpx; padding:20rpx; border:1rpx solid #efe2dc; border-radius:20rpx; background:linear-gradient(135deg,var(--tint),#fffdfb 72%); box-shadow:0 8rpx 24rpx rgba(139,102,89,.05); }
.plan-head { display:flex; align-items:center; gap:14rpx; }
.plan-head image { width:76rpx; height:76rpx; flex:none; border-radius:16rpx; }
.plan-head-copy { min-width:0; flex:1; }
.plan-title { display:block; color:#5b4d52; font-size:27rpx; font-weight:700; }
.plan-subtitle { display:block; margin-top:5rpx; overflow:hidden; color:#927f84; font-size:20rpx; text-overflow:ellipsis; white-space:nowrap; }
.plan-frequency { flex:none; color:#b07d72; font-size:18rpx; }
.plan-head-actions { display:flex; align-items:center; gap:8rpx; flex:none; }.manage { width:44rpx; height:44rpx; color:#a88180; font-size:26rpx; line-height:38rpx; }
.task-list { margin-top:14rpx; border-top:1rpx solid rgba(214,188,181,.35); }
.task-row { display:flex; align-items:center; gap:14rpx; min-height:80rpx; border-bottom:1rpx solid rgba(214,188,181,.3); }
.task-row:last-child { border-bottom:0; }
.check { display:flex; align-items:center; justify-content:center; width:42rpx; height:42rpx; flex:none; border:2rpx solid #c59a94; border-radius:50%; color:#fff; font-size:26rpx; background:#fffdfb; }
.check.checked { border-color:#b66d80; background:#b66d80; }
.task-copy { min-width:0; flex:1; }
.task-title,.task-note { display:block; }
.task-title { color:#63545a; font-size:24rpx; font-weight:600; }
.task-note { margin-top:4rpx; overflow:hidden; color:#9b898e; font-size:19rpx; text-overflow:ellipsis; white-space:nowrap; }
.done .task-title { color:#9d858b; text-decoration:line-through; }
.week-dots { display:flex; gap:10rpx; margin-top:14rpx; }
.week-dots text { display:flex; align-items:center; justify-content:center; width:34rpx; height:34rpx; border-radius:50%; color:#ae9698; font-size:17rpx; background:rgba(255,255,255,.66); }
.week-dots text.active { color:#fff; background:#b66d80; }
.celebrate { display:flex; align-items:center; gap:10rpx; margin-top:12rpx; padding:10rpx 12rpx; border-radius:12rpx; color:#a86a76; font-size:19rpx; background:rgba(255,255,255,.58); }
.celebrate image { width:42rpx; height:42rpx; flex:none; }
</style>
