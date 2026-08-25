<template>
  <view class="page">
    <view class="brand">和生序 · 健康管理</view>
    <view class="progress"><view class="progress-fill" :style="{ width: `${((step + 1) / 4) * 100}%` }" /></view>

    <view v-if="step === 0" class="step">
      <text class="eyebrow">先认识一下你</text>
      <text class="title">从今天开始，照顾好自己</text>
      <text class="hint">这些信息只用于生成更适合你的健康建议。</text>
      <input v-model="form.displayName" class="input" maxlength="40" placeholder="怎么称呼你？（选填）" />
      <view class="label">性别</view>
      <view class="choices">
        <button v-for="item in sexOptions" :key="item.value" :class="['choice', { selected: form.sex === item.value }]" @tap="form.sex = item.value">{{ item.label }}</button>
      </view>
    </view>

    <view v-else-if="step === 1" class="step">
      <text class="eyebrow">了解身体基础</text>
      <text class="title">你的 BMI 会实时变化</text>
      <text class="hint">输入身高和体重，看看当前身体状态。</text>
      <view class="input-row"><input v-model="form.heightCm" class="input" type="number" placeholder="身高（cm）" /><text class="unit">cm</text></view>
      <view class="input-row"><input v-model="form.weightKg" class="input" type="digit" placeholder="体重（kg）" /><text class="unit">kg</text></view>
      <view v-if="bmi !== null" class="bmi-card"><text class="bmi-value">{{ bmi.toFixed(1) }}</text><text class="bmi-label">BMI · {{ bmiLabel }}</text><text class="bmi-note">这是健康管理参考，不是医疗诊断</text></view>
      <view v-else class="empty-card">填写身高和体重后查看 BMI</view>
    </view>

    <view v-else-if="step === 2" class="step">
      <text class="eyebrow">选一个现在最想改善的方向</text>
      <text class="title">从一个小目标开始</text>
      <text class="hint">之后可以随时调整，不需要一次决定全部。</text>
      <view class="goal-list"><button v-for="item in goalOptions" :key="item.value" :class="['goal', { selected: form.primaryGoal === item.value }]" @tap="form.primaryGoal = item.value"><text>{{ item.icon }}</text><text>{{ item.label }}</text><text class="goal-arrow">›</text></button></view>
    </view>

    <view v-else class="step">
      <text class="eyebrow">最后确认一下</text>
      <text class="title">你的健康画像准备好了</text>
      <view class="summary"><text>{{ form.displayName || '新朋友' }}</text><text>{{ form.heightCm || '--' }} cm · {{ form.weightKg || '--' }} kg</text><text>{{ selectedGoalLabel }}</text><text v-if="bmi !== null">BMI {{ bmi.toFixed(1) }} · {{ bmiLabel }}</text></view>
      <text class="hint">保存后会解锁和生序首页，之后每天记录一点点就好。</text>
    </view>

    <view class="actions"><button v-if="step > 0" class="back" @tap="step -= 1">上一步</button><button class="next" :disabled="!canNext || saving" @tap="next">{{ saving ? '保存中…' : step === 3 ? '保存并开始' : '继续' }}</button></view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { createApiClient } from '../../services/api-client.js';
import { onboardingState } from '../../stores/onboarding.js';

const { form, bmi, bmiCategory } = onboardingState;
const step = ref(onboardingState.step.value);
const saving = ref(false);
const sexOptions = [
  { value: 'female' as const, label: '女性' },
  { value: 'male' as const, label: '男性' },
  { value: 'unspecified' as const, label: '不方便说' },
];
const goalOptions = [
  { value: 'weight_management' as const, label: '减脂与体重管理', icon: '◌' },
  { value: 'weight_maintenance' as const, label: '保持当前状态', icon: '○' },
  { value: 'muscle_gain' as const, label: '力量与体能', icon: '△' },
  { value: 'sleep' as const, label: '睡眠与精力', icon: '☾' },
  { value: 'energy' as const, label: '饮食与活力', icon: '✦' },
  { value: 'mood' as const, label: '压力与情绪', icon: '♡' },
];
const bmiLabel = computed(() => {
  if (bmiCategory.value === 'underweight') return '偏瘦';
  if (bmiCategory.value === 'overweight') return '偏重';
  if (bmiCategory.value === 'obesity') return '肥胖';
  return '正常';
});
const selectedGoalLabel = computed(() => goalOptions.find((item) => item.value === form.primaryGoal)?.label ?? '还没有选择目标');
const canNext = computed(() => {
  if (step.value === 1) return bmi.value !== null;
  if (step.value === 2) return form.primaryGoal !== '';
  return true;
});

function next() {
  if (!canNext.value) return;
  if (step.value < 3) {
    step.value += 1;
    onboardingState.step.value = step.value;
    return;
  }
  save();
}

async function save() {
  saving.value = true;
  try {
    const baseUrl = 'http://localhost:3000/api/v1';
    const client = createApiClient({
      baseUrl,
      request: ({ url, method, data }) =>
        new Promise((resolve, reject) => {
          uni.request({
            url,
          method: method as never,
            data: data as Record<string, unknown>,
            header: { Authorization: 'Bearer dev-mini-user' },
            success: (response) => resolve({ statusCode: response.statusCode, data: response.data as never }),
            fail: reject,
          });
        }),
    });
    await client.update('/health-profiles/me', {
      displayName: form.displayName || undefined,
      sex: form.sex,
      heightCm: Number(form.heightCm),
      weightKg: Number(form.weightKg),
      primaryGoal: form.primaryGoal,
    });
    onboardingState.completed.value = true;
    uni.switchTab({ url: '/pages/home/HomePage' });
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.page { min-height: 100vh; box-sizing: border-box; padding: 56rpx 44rpx 48rpx; background: #f7fbf8; color: #183425; }
.brand { color: #2e7d4f; font-size: 25rpx; font-weight: 700; margin-bottom: 28rpx; }
.progress { height: 8rpx; border-radius: 8rpx; background: #e2eee6; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 8rpx; background: #65a77b; transition: width .2s ease; }
.step { padding-top: 72rpx; }
.eyebrow { display: block; color: #5c8b6c; font-size: 25rpx; font-weight: 700; margin-bottom: 18rpx; }
.title { display: block; font-size: 48rpx; line-height: 1.25; font-weight: 700; margin-bottom: 20rpx; }
.hint { display: block; color: #668071; font-size: 27rpx; line-height: 1.65; margin-bottom: 44rpx; }
.input { box-sizing: border-box; flex: 1; height: 96rpx; padding: 0 28rpx; border: 2rpx solid #d9e8dd; border-radius: 18rpx; background: #fff; font-size: 30rpx; }
.input-row { display: flex; align-items: center; margin-bottom: 22rpx; background: #fff; border-radius: 18rpx; }
.input-row .input { border: 0; }
.unit { padding-right: 28rpx; color: #7d9785; font-size: 26rpx; }
.label { color: #4f6f5a; font-size: 26rpx; margin: 34rpx 0 16rpx; }
.choices { display: flex; gap: 16rpx; }
.choice { flex: 1; padding: 22rpx 8rpx; border-radius: 16rpx; color: #547361; background: #fff; font-size: 27rpx; line-height: 1.2; }
.choice.selected, .goal.selected { color: #24653c; background: #e1f1e5; border: 2rpx solid #85bd94; }
.bmi-card, .summary, .empty-card { padding: 34rpx; margin-top: 28rpx; border-radius: 22rpx; background: #e7f4ea; }
.bmi-value { display: block; font-size: 64rpx; font-weight: 700; color: #24653c; }
.bmi-label { display: block; margin-top: 8rpx; color: #3f7450; font-size: 28rpx; }
.bmi-note { display: block; margin-top: 18rpx; color: #6d8b76; font-size: 22rpx; }
.empty-card { color: #789080; background: #fff; font-size: 27rpx; }
.goal-list { display: flex; flex-direction: column; gap: 16rpx; }
.goal { display: flex; align-items: center; gap: 18rpx; padding: 24rpx 26rpx; border-radius: 18rpx; color: #355b41; background: #fff; font-size: 28rpx; text-align: left; }
.goal > text:first-child { width: 34rpx; color: #61a276; font-size: 32rpx; text-align: center; }
.goal-arrow { margin-left: auto; color: #9ab4a1; font-size: 34rpx; }
.summary { display: flex; flex-direction: column; gap: 16rpx; margin-bottom: 28rpx; color: #355b41; font-size: 30rpx; }
.actions { display: flex; gap: 18rpx; margin-top: 60rpx; }
.back, .next { height: 96rpx; border-radius: 18rpx; font-size: 30rpx; line-height: 96rpx; }
.back { width: 30%; color: #52715d; background: #e6f0e8; }
.next { flex: 1; color: #fff; background: #3f8658; }
.next[disabled] { opacity: .45; }
</style>
