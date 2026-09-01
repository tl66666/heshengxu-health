<template>
  <view class="section">
    <view class="section-head"
      ><view
        ><text class="section-title">正在进行</text
        ><text class="section-note">今天完成一点点即可</text></view
      ><text class="count">{{ completedTotal }}/{{ totalTasks }}</text></view
    >
    <scroll-view scroll-x class="filters" show-scrollbar="false">
      <button
        v-for="item in filters"
        :key="item.value"
        :class="{ active: filter === item.value }"
        @tap="filter = item.value"
      >
        {{ item.label }}
      </button>
    </scroll-view>
    <view v-if="!plans.length" class="empty-inline"><text>还没有计划，去下面挑一个吧</text></view>
    <view
      v-for="plan in sortedPlans"
      :key="plan.id"
      class="plan-card"
      :style="{ '--tint': planTint(plan) }"
    >
      <view class="plan-head">
        <image :src="plan.icon" mode="aspectFit" />
        <view class="plan-head-copy"
          ><text class="plan-title">{{ plan.title }}</text
          ><text class="plan-subtitle">{{ plan.subtitle }}</text
          ><view class="progress-line"
            ><view class="progress-track"
              ><view
                class="progress-fill"
                :style="{ width: `${planStats(plan).progress}%` }" /></view
            ><text>{{ planStats(plan).completed }}/{{ planStats(plan).total }}</text></view
          ></view
        >
        <view class="plan-head-actions"
          ><text class="plan-frequency">{{ plan.frequency }}</text
          ><button class="manage" aria-label="管理计划" @tap="$emit('manage', plan.id)">
            ···
          </button></view
        >
      </view>
      <view class="task-list">
        <view
          v-for="task in visibleTasks(plan)"
          :key="task.id"
          class="task-row"
          :class="{ done: done(task) }"
        >
          <button
            class="check"
            :class="{ checked: done(task) }"
            :aria-label="done(task) ? '取消打卡' : '完成打卡'"
            @tap="$emit('toggle', plan.id, task.id)"
          >
            <text v-if="done(task)">✓</text>
          </button>
          <view class="task-copy"
            ><text class="task-title">{{ task.title }}</text
            ><text class="task-note">{{
              done(task) ? '今天已经完成，做得很好' : task.note
            }}</text></view
          >
        </view>
      </view>
      <view v-if="!visibleTasks(plan).length" class="filtered-empty"
        ><text>{{ filter === 'done' ? '今天还没有完成的行动' : '今天的行动都完成啦' }}</text></view
      >
      <view
        v-if="plan.tasks.length > 0 && planStats(plan).completed === plan.tasks.length"
        class="celebrate"
      >
        <image src="/static/illustrations/xuxu-complete.png" mode="aspectFit" />
        <text>今天的节奏完成啦，给自己一个拥抱</text>
      </view>
      <view class="week-dots"
        ><text
          v-for="day in weekDays"
          :key="day.key"
          :class="{ active: plan.tasks.every((task) => task.doneDates.includes(day.key)) }"
          >{{ day.label }}</text
        ></view
      >
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { HabitPlan, HabitTask } from '../../features/plans/plan-types.js';
import { isTaskDone, planStats } from '../../features/plans/plan-store.js';
const props = defineProps<{ plans: HabitPlan[] }>();
defineEmits<{ toggle: [planId: string, taskId: string]; manage: [planId: string] }>();
const completedTotal = computed(() =>
  props.plans.reduce((sum, plan) => sum + planStats(plan).completed, 0),
);
const totalTasks = computed(() => props.plans.reduce((sum, plan) => sum + plan.tasks.length, 0));
const filter = ref<'all' | 'pending' | 'done'>('all');
const filters = [
  { value: 'all', label: '全部计划' },
  { value: 'pending', label: '待完成' },
  { value: 'done', label: '已完成' },
] as const;
const done = (task: HabitTask) => isTaskDone(task);
const visibleTasks = (plan: HabitPlan) =>
  [...plan.tasks]
    .sort((a, b) => Number(done(a)) - Number(done(b)))
    .filter(
      (task) => filter.value === 'all' || (filter.value === 'done' ? done(task) : !done(task)),
    );
const sortedPlans = computed(() =>
  [...props.plans].sort((a, b) => planStats(a).progress - planStats(b).progress),
);
const planTint = (plan: HabitPlan) => {
  const palette: Record<string, string> = {
    weight: '#e7f0ea',
    food: '#f1eee5',
    drink: '#e6f0f2',
    study: '#eef2ed',
    exercise: '#edf1e8',
    sleep: '#e9eef2',
    mood: '#e7f0ea',
    custom: '#f1eee5',
  };
  return palette[plan.category] || '#f1f5ef';
};
const weekDays = computed(() => {
  const labels = ['日', '一', '二', '三', '四', '五', '六'];
  const list = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    const key = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
    list.push({ key, label: labels[date.getDay()] });
  }
  return list;
});
</script>

<style scoped>
.section {
  margin-top: 34rpx;
}
.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin: 0 2rpx 14rpx;
}
.section-title {
  display: block;
  color: #365343;
  font-size: 30rpx;
  font-weight: 700;
}
.section-note {
  display: block;
  margin-top: 5rpx;
  color: #84988c;
  font-size: 20rpx;
}
.count {
  color: #5f8d68;
  font-size: 22rpx;
}
.filters {
  width: 100%;
  margin-bottom: 12rpx;
  white-space: nowrap;
}
.filters button {
  display: inline-block;
  margin-right: 8rpx;
  padding: 8rpx 15rpx;
  border: 1rpx solid #dfe9df;
  border-radius: 999rpx;
  color: #84988c;
  font-size: 19rpx;
  background: #ffffff;
}
.filters button.active {
  border-color: #9fc8a4;
  color: #4f8a61;
  background: #edf5e8;
}
.empty-inline {
  padding: 30rpx;
  border: 1rpx dashed #dfe9df;
  border-radius: 18rpx;
  color: #84988c;
  text-align: center;
  font-size: 22rpx;
  background: #ffffff;
}
.plan-card {
  margin-bottom: 18rpx;
  padding: 20rpx;
  border: 1rpx solid #e2ebe1;
  border-radius: 20rpx;
  background: linear-gradient(135deg, var(--tint), #ffffff 72%);
  box-shadow: 0 8rpx 24rpx rgba(54, 83, 67, 0.06);
}
.plan-head {
  display: flex;
  align-items: center;
  gap: 14rpx;
}
.plan-head image {
  width: 148rpx;
  height: 148rpx;
  flex: none;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.86);
}
.plan-head-copy {
  min-width: 0;
  flex: 1;
}
.plan-title {
  display: block;
  color: #365343;
  font-size: 27rpx;
  font-weight: 700;
}
.plan-subtitle {
  display: block;
  margin-top: 5rpx;
  overflow: hidden;
  color: #84988c;
  font-size: 20rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.progress-line {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 12rpx;
  color: #6f9f7a;
  font-size: 17rpx;
}
.progress-track {
  width: 118rpx;
  height: 8rpx;
  overflow: hidden;
  border-radius: 8rpx;
  background: rgba(255, 255, 255, 0.8);
}
.progress-fill {
  height: 100%;
  border-radius: 8rpx;
  background: #79ad82;
  transition: width 0.25s ease;
}
.plan-frequency {
  flex: none;
  color: #6f9f7a;
  font-size: 18rpx;
}
.plan-head-actions {
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex: none;
}
.manage {
  width: 44rpx;
  height: 44rpx;
  color: #a88180;
  font-size: 26rpx;
  line-height: 38rpx;
}
.task-list {
  margin-top: 14rpx;
  border-top: 1rpx solid rgba(197, 218, 199, 0.6);
}
.task-row {
  display: flex;
  align-items: center;
  gap: 14rpx;
  min-height: 80rpx;
  border-bottom: 1rpx solid rgba(197, 218, 199, 0.55);
}
.task-row:last-child {
  border-bottom: 0;
}
.check {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42rpx;
  height: 42rpx;
  flex: none;
  border: 2rpx solid #a9c7ab;
  border-radius: 50%;
  color: #fff;
  font-size: 26rpx;
  background: #ffffff;
}
.check.checked {
  border-color: #6f9f7a;
  background: #6f9f7a;
}
.task-copy {
  min-width: 0;
  flex: 1;
}
.filtered-empty {
  padding: 18rpx 0 6rpx;
  color: #84988c;
  text-align: center;
  font-size: 19rpx;
}
.task-title,
.task-note {
  display: block;
}
.task-title {
  color: #4f6756;
  font-size: 24rpx;
  font-weight: 600;
}
.task-note {
  margin-top: 4rpx;
  overflow: hidden;
  color: #8ba092;
  font-size: 19rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.done .task-title {
  color: #91a297;
  text-decoration: line-through;
}
.week-dots {
  display: flex;
  gap: 10rpx;
  margin-top: 14rpx;
}
.week-dots text {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34rpx;
  height: 34rpx;
  border-radius: 50%;
  color: #8ba092;
  font-size: 17rpx;
  background: rgba(237, 245, 232, 0.72);
}
.week-dots text.active {
  color: #fff;
  background: #6f9f7a;
}
.celebrate {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-top: 12rpx;
  padding: 10rpx 12rpx;
  border-radius: 12rpx;
  color: #5f8d68;
  font-size: 19rpx;
  background: rgba(237, 245, 232, 0.72);
}
.celebrate image {
  width: 42rpx;
  height: 42rpx;
  flex: none;
}
</style>
