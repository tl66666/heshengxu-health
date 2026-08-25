<template>
  <view class="page">
    <view v-if="!plan" class="empty"
      ><image src="/static/illustrations/program-weight.png" mode="aspectFill" /><text
        >从一份小计划开始</text
      ><text>把想照顾的方向交给序序，一步一步来。</text
      ><button @tap="setup">设置我的计划</button></view
    >
    <template v-else>
      <IllustratedHero
        :image="
          plan.kind === 'sleep'
            ? '/static/illustrations/program-sleep.png'
            : '/static/illustrations/program-weight.png'
        "
        eyebrow="正在执行"
        :title="plan.kind === 'sleep' ? '睡眠与精力计划' : '轻盈节律计划'"
        :description="targetText"
        action-label="调整计划"
        @action="setup"
      />
      <view class="program-section">
        <view class="section-head program-head"
          ><view
            ><text>我的健康方案</text><text>按一个重点开始，其他习惯也会被温和照顾。</text></view
          ><text>可叠加</text></view
        >
        <view class="program-grid"
          ><button
            v-for="item in programs"
            :key="item.kind"
            :class="[
              'program-tile',
              { active: item.kind === plan.kind, disabled: !item.available },
            ]"
            @tap="selectProgram(item)"
          >
            <image :src="item.image" mode="aspectFill" /><view
              ><text>{{ item.label }}</text
              ><text>{{ item.available ? '可调整' : '后续开放' }}</text></view
            >
          </button></view
        >
      </view>
      <view
        v-if="presentation.completedCount === plan.tasks.length && plan.tasks.length > 0"
        class="complete"
        ><image src="/static/illustrations/xuxu-complete.png" mode="aspectFill" /><view
          ><text>今天的行动都完成了</text><text>序序已经记下这份稳定的节律。</text></view
        ></view
      >
      <view class="section-head"
        ><text>今天的小行动</text
        ><text>{{ presentation.completedCount }}/{{ plan.tasks.length }}</text></view
      >
      <view class="tasks"
        ><view v-for="task in plan.tasks" :key="task.id" class="task"
          ><button
            :class="['check', { done: task.status === 'completed' }]"
            :disabled="task.status !== 'pending'"
            @tap="complete(task.id)"
          >
            {{ task.status === 'completed' ? '✓' : '' }}</button
          ><view
            ><text>{{ taskTitle(task.actionType) }}</text
            ><text>{{ task.status === 'completed' ? '已完成' : '今天完成就很好' }}</text></view
          ></view
        ></view
      >
      <XuxuHint
        v-if="presentation.completedCount > 0 && !presentation.showCompleteArt"
        variant="note"
        message="每完成一件小事，都会让之后的回顾更了解你的真实节律。"
      />
    </template>
    <MiniTabBar active="plan" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import IllustratedHero from '../../components/IllustratedHero.vue';
import MiniTabBar from '../../components/MiniTabBar.vue';
import XuxuHint from '../../components/XuxuHint.vue';
import { healthLoopState } from '../../features/health-loop/health-loop.store.js';
import { planPresentation } from '../../features/health-loop/plan-presentation.js';
const date = localDate();
const plan = computed(() => healthLoopState.today.value?.activePlan || healthLoopState.plan.value);
const presentation = computed(() => planPresentation(plan.value?.tasks || []));
const programs = [
  {
    kind: 'weight' as const,
    label: '减脂与体重',
    image: '/static/illustrations/program-weight.png',
    available: true,
  },
  {
    kind: 'sleep' as const,
    label: '睡眠与精力',
    image: '/static/illustrations/program-sleep.png',
    available: true,
  },
  {
    kind: 'mood' as const,
    label: '压力与情绪',
    image: '/static/illustrations/program-mood.png',
    available: false,
  },
  {
    kind: 'metabolic' as const,
    label: '代谢管理',
    image: '/static/illustrations/program-metabolic.png',
    available: false,
  },
  {
    kind: 'digestive' as const,
    label: '肠胃生活方式',
    image: '/static/illustrations/program-digestive.png',
    available: false,
  },
];
const targetText = computed(() => {
  const target = plan.value?.healthTarget;
  if (!target) return '';
  return target.kind === 'sleep'
    ? '从今晚开始，给自己留一点更规律的休息时间。'
    : `${{ lose: '目标：温和减重', maintain: '目标：保持状态', gain: '目标：稳步增重' }[target.direction || 'maintain']}${target.targetWeightKg ? ` · ${target.targetWeightKg} kg` : ''}`;
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
function selectProgram(item: (typeof programs)[number]) {
  if (!item.available) {
    uni.showToast({ title: '这个方向正在准备中', icon: 'none' });
    return;
  }
  setup();
}
function localDate() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
onShow(() => healthLoopState.loadToday(date));
</script>

<style scoped>
.page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 40rpx 32rpx 172rpx;
  background: #f7fbf8;
  color: #1d3d2a;
}
.section-head {
  display: flex;
  justify-content: space-between;
  margin: 30rpx 4rpx 15rpx;
  font-size: 30rpx;
  font-weight: 700;
}
.section-head text:last-child {
  color: #5b8d6e;
  font-size: 24rpx;
}
.program-section {
  margin-top: 28rpx;
}
.program-head {
  align-items: flex-start;
  margin: 0 4rpx 14rpx;
}
.program-head > view text {
  display: block;
}
.program-head > view text:first-child {
  font-size: 30rpx;
  font-weight: 700;
}
.program-head > view text:last-child {
  margin-top: 7rpx;
  color: #748b7d;
  font-size: 21rpx;
  font-weight: 400;
  line-height: 1.45;
}
.program-head > text {
  padding-top: 4rpx;
  color: #6a9275;
  font-size: 21rpx;
  font-weight: 400;
}
.program-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}
.program-tile {
  display: flex;
  align-items: center;
  width: calc(50% - 7rpx);
  min-height: 126rpx;
  overflow: hidden;
  border: 2rpx solid #dceadd;
  border-radius: 18rpx;
  text-align: left;
  background: #fff;
}
.program-tile image {
  width: 116rpx;
  height: 126rpx;
  flex: none;
}
.program-tile view {
  min-width: 0;
  padding: 0 12rpx;
}
.program-tile view text {
  display: block;
  color: #31543e;
  font-size: 23rpx;
  font-weight: 700;
  line-height: 1.3;
}
.program-tile view text:last-child {
  margin-top: 8rpx;
  color: #799081;
  font-size: 19rpx;
  font-weight: 400;
}
.program-tile.active {
  border-color: #77aa83;
  background: #f1f8ef;
}
.program-tile.disabled {
  opacity: 0.65;
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
  border: 2rpx solid #dceadd;
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
  line-height: 40rpx;
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
.complete {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 20rpx;
  padding: 18rpx;
  border: 2rpx solid #cae4d0;
  border-radius: 17rpx;
  background: #eaf6ec;
}
.complete image {
  width: 98rpx;
  height: 98rpx;
  border-radius: 50%;
}
.complete text {
  display: block;
  color: #315d41;
  font-size: 27rpx;
  font-weight: 700;
}
.complete text:last-child {
  margin-top: 5rpx;
  color: #648170;
  font-size: 21rpx;
  font-weight: 400;
}
.empty {
  padding: 70rpx 16rpx;
  text-align: center;
}
.empty image {
  width: 310rpx;
  height: 310rpx;
  border-radius: 50%;
}
.empty text {
  display: block;
  margin-top: 20rpx;
  color: #315a40;
  font-size: 32rpx;
  font-weight: 700;
}
.empty text:nth-of-type(2) {
  margin-top: 8rpx;
  color: #718a7a;
  font-size: 23rpx;
  font-weight: 400;
}
.empty button {
  margin-top: 28rpx;
  padding: 18rpx 32rpx;
  border-radius: 15rpx;
  color: #fff;
  background: #2e7d4f;
  font-size: 27rpx;
}
</style>
