<template>
  <view class="page">
    <AppNavBar title="设置健康计划" route="/pages/plan-setup/PlanSetupPage" />
    <text class="eyebrow">从一个方向开始</text>
    <text class="title">设置我的健康计划</text>
    <text class="hint">之后随时可以调整，不需要一次决定全部。</text>
    <view class="cards">
      <button :class="['choice', { selected: kind === 'weight' }]" @tap="kind = 'weight'">
        <image src="/static/illustrations/program-weight.png" mode="aspectFill" />
        <view><text>体重管理</text><text>从规律记录与小行动开始</text></view>
      </button>
      <button :class="['choice', { selected: kind === 'sleep' }]" @tap="kind = 'sleep'">
        <image src="/static/illustrations/program-sleep.png" mode="aspectFill" />
        <view><text>睡眠与精力</text><text>先找回更稳定的作息</text></view>
      </button>
    </view>
    <view v-if="kind === 'weight'" class="panel">
      <text class="label">目标方向</text>
      <view class="directions"
        ><button
          v-for="item in directions"
          :key="item.value"
          :class="{ selected: direction === item.value }"
          @tap="direction = item.value"
        >
          {{ item.label }}
        </button></view
      >
      <text class="label">目标体重（选填）</text>
      <view class="input-row"
        ><input v-model="targetWeightKg" type="digit" placeholder="例如 58" /><text>kg</text></view
      >
    </view>
    <text v-if="error" class="error">{{ error }}</text>
    <button class="submit" :loading="saving" @tap="save">开始我的计划</button>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type {
  PlanKind,
  WeightDirection,
} from '../../../../../packages/contracts/src/health-loop.js';
import AppNavBar from '../../components/AppNavBar.vue';
import { healthLoopState } from '../../features/health-loop/health-loop.store.js';

const kind = ref<PlanKind>('weight');
const direction = ref<WeightDirection>('lose');
const targetWeightKg = ref('');
const saving = ref(false);
const error = ref('');
const directions: Array<{ value: WeightDirection; label: string }> = [
  { value: 'lose', label: '减重' },
  { value: 'maintain', label: '保持' },
  { value: 'gain', label: '增重' },
];
async function save() {
  error.value = '';
  saving.value = true;
  const date = localDate();
  try {
    await healthLoopState.savePlan(
      {
        kind: kind.value,
        direction: kind.value === 'weight' ? direction.value : undefined,
        targetWeightKg:
          kind.value === 'weight' && targetWeightKg.value
            ? Number(targetWeightKg.value)
            : undefined,
        startDate: date,
      },
      date,
    );
    uni.switchTab({ url: '/pages/plan/PlanPage' });
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : '暂时无法保存计划';
  } finally {
    saving.value = false;
  }
}
function localDate() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 44rpx 32rpx 96rpx;
  background: #f7fbf8;
  color: #1d3d2a;
}
.eyebrow,
.title,
.hint {
  display: block;
}
.eyebrow {
  color: #659078;
  font-size: 23rpx;
  font-weight: 700;
}
.title {
  margin-top: 10rpx;
  font-size: 40rpx;
  font-weight: 700;
}
.hint {
  margin-top: 10rpx;
  color: #70897a;
  font-size: 24rpx;
}
.cards {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-top: 28rpx;
}
.choice {
  display: flex;
  align-items: center;
  gap: 18rpx;
  overflow: hidden;
  min-height: 122rpx;
  padding: 0;
  border: 0;
  border-bottom: 1rpx solid #e0ebe1;
  text-align: left;
  background: #fff;
}
.choice.selected {
  background: #f1f8f1;
}
.choice image {
  width: 170rpx;
  height: 122rpx;
  flex: none;
}
.choice view text {
  display: block;
  color: #31543e;
  font-size: 27rpx;
  font-weight: 700;
}
.choice view text:last-child {
  margin-top: 6rpx;
  color: #778e80;
  font-size: 21rpx;
  font-weight: 400;
}
.panel {
  margin-top: 24rpx;
  padding: 4rpx 0 18rpx;
  border-top: 1rpx solid #dceadd;
  border-bottom: 1rpx solid #dceadd;
  background: transparent;
}
.label {
  display: block;
  margin-bottom: 12rpx;
  color: #567463;
  font-size: 24rpx;
}
.directions {
  display: flex;
  gap: 12rpx;
}
.directions button {
  flex: 1;
  padding: 16rpx 8rpx;
  border: 2rpx solid #dceadd;
  border-radius: 14rpx;
  color: #557463;
  background: #fff;
  font-size: 24rpx;
}
.directions .selected {
  border-color: #70a57c;
  color: #286b47;
  background: #e7f4e9;
}
.input-row {
  display: flex;
  align-items: center;
  height: 82rpx;
  border: 2rpx solid #dce9dd;
  border-radius: 14rpx;
}
.input-row input {
  flex: 1;
  height: 100%;
  padding: 0 20rpx;
  font-size: 27rpx;
}
.input-row text {
  padding-right: 20rpx;
  color: #6f8b79;
}
.error {
  display: block;
  margin-top: 18rpx;
  color: #b85e43;
  font-size: 23rpx;
}
.submit {
  width: 100%;
  height: 84rpx;
  margin-top: 28rpx;
  border-radius: 15rpx;
  color: #fff;
  background: #40865a;
  font-size: 28rpx;
  line-height: 84rpx;
}
</style>
