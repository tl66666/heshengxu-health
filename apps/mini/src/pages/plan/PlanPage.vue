<template>
  <view class="page"
    ><view v-if="!plan" class="empty"
      ><image src="/static/illustrations/program-weight.png" mode="aspectFill" /><text
        >先设置一个健康计划</text
      ><button @tap="setup">开始设置</button></view
    ><template v-else
      ><view class="hero"
        ><image
          :src="
            plan.kind === 'sleep'
              ? '/static/illustrations/program-sleep.png'
              : '/static/illustrations/program-weight.png'
          "
          mode="aspectFill"
        /><view
          ><text class="eyebrow">正在执行</text
          ><text class="title">{{ plan.kind === 'sleep' ? '睡眠与精力计划' : '轻盈节律计划' }}</text
          ><text class="desc">{{ targetText }}</text></view
        ></view
      ><view class="section-head"
        ><text>今天的小行动</text><text>{{ completedCount }}/{{ plan.tasks.length }}</text></view
      ><view class="tasks"
        ><view v-for="task in plan.tasks" :key="task.id" class="task"
          ><button
            :class="['check', { done: task.status === 'completed' }]"
            :disabled="task.status !== 'pending'"
            @tap="complete(task.id)"
          >
            {{ task.status === 'completed' ? '✓' : ' ' }}</button
          ><view
            ><text>{{ taskTitle(task.actionType) }}</text
            ><text>{{ task.status === 'completed' ? '已完成' : '今天完成就很好' }}</text></view
          ></view
        ></view
      ><XuxuHint
        v-if="completedCount"
        message="你已经完成了一些小事，节律就是这样慢慢长出来的。"
      /><button class="adjust" @tap="setup">调整我的计划</button></template
    ></view
  >
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import XuxuHint from '../../components/XuxuHint.vue';
import { healthLoopState } from '../../features/health-loop/health-loop.store.js';
const date = localDate();
const plan = computed(() => healthLoopState.today.value?.activePlan || healthLoopState.plan.value);
const completedCount = computed(
  () => plan.value?.tasks.filter((x) => x.status === 'completed').length || 0,
);
const targetText = computed(() => {
  const t = plan.value?.healthTarget;
  if (!t) return '';
  if (t.kind === 'sleep') return '从今晚开始，给自己留一点更规律的休息时间。';
  return `${{ lose: '目标：温和减重', maintain: '目标：保持状态', gain: '目标：稳步增重' }[t.direction || 'maintain']}${t.targetWeightKg ? ` · ${t.targetWeightKg} kg` : ''}`;
});
function taskTitle(type: string) {
  return (
    {
      record_weight: '记录今天体重',
      record_meal: '记录一餐饮食',
      walk_15_minutes: '步行 15 分钟',
      record_sleep: '补记昨晚睡眠',
    }[type] || type
  );
}
async function complete(id: string) {
  await healthLoopState.completeTask(id, date);
}
function setup() {
  uni.navigateTo({ url: '/pages/plan-setup/PlanSetupPage' });
}
function localDate() {
  const n = new Date();
  return new Date(n.getTime() - n.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
onShow(() => healthLoopState.loadToday(date));
</script>
<style scoped>
.page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 40rpx 32rpx 166rpx;
  background: #f7fbf8;
  color: #1d3d2a;
}
.hero {
  position: relative;
  overflow: hidden;
  height: 286rpx;
  border-radius: 20rpx;
  background: #eaf5e8;
}
.hero image {
  width: 100%;
  height: 100%;
  opacity: 0.8;
}
.hero view {
  position: absolute;
  inset: 0;
  padding: 28rpx;
}
.eyebrow,
.title,
.desc {
  display: block;
}
.eyebrow {
  color: #5a8970;
  font-size: 23rpx;
  font-weight: 700;
}
.title {
  margin-top: 10rpx;
  font-size: 39rpx;
  font-weight: 700;
}
.desc {
  max-width: 340rpx;
  margin-top: 10rpx;
  color: #5e7968;
  font-size: 23rpx;
  line-height: 1.5;
}
.section-head {
  display: flex;
  justify-content: space-between;
  margin: 30rpx 0 16rpx;
  font-size: 30rpx;
  font-weight: 700;
}
.section-head text:last-child {
  color: #5c8c70;
  font-size: 24rpx;
}
.tasks {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.task {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 22rpx;
  border-radius: 16rpx;
  background: #fff;
}
.check {
  width: 46rpx;
  height: 46rpx;
  padding: 0;
  border: 2rpx solid #75a881;
  border-radius: 50%;
  color: #fff;
  background: #fff;
  line-height: 42rpx;
}
.check.done {
  background: #59a070;
}
.task view text {
  display: block;
  font-size: 27rpx;
  font-weight: 700;
}
.task view text:last-child {
  margin-top: 5rpx;
  color: #748d7d;
  font-size: 22rpx;
  font-weight: 400;
}
.adjust {
  width: 100%;
  height: 82rpx;
  margin-top: 30rpx;
  border-radius: 14rpx;
  color: #467657;
  background: #e9f3e9;
  font-size: 27rpx;
}
.empty {
  padding-top: 80rpx;
  text-align: center;
}
.empty image {
  width: 300rpx;
  height: 300rpx;
  border-radius: 50%;
}
.empty text {
  display: block;
  margin: 20rpx 0;
  color: #45644f;
  font-size: 30rpx;
  font-weight: 700;
}
.empty button {
  padding: 18rpx 36rpx;
  border-radius: 14rpx;
  color: #fff;
  background: #40865a;
  font-size: 27rpx;
}
</style>
