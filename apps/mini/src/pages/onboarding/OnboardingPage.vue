<template>
  <view class="page">
    <AppNavBar
      title="开始了解自己"
      close-label="退出"
      :back-disabled="step === 0"
      route="/pages/onboarding/OnboardingPage"
      back-mode="emit"
      @back="back"
      @close="exitOnboarding"
    />
    <template v-if="step === 0">
      <view class="welcome-screen">
        <view class="welcome-art-frame">
          <image class="welcome-art" :src="heroImage" mode="aspectFit" @error="useFallbackHero" />
        </view>
        <view class="welcome-copy">
          <view class="xuxu"
            ><image src="/static/illustrations/xuxu-avatar.png" mode="aspectFill" /><view
              ><text>你好，我是序序</text><text>你的健康陪伴助手</text></view
            ></view
          >
          <text class="brand">和生序</text>
          <text class="welcome-title">让健康回到自己的节律</text>
          <text class="hint">花一点时间认识你，之后每一步都会围绕你的真实生活展开。</text>
          <button class="primary" @tap="next">开始了解我</button>
          <text class="disclaimer">和生序提供健康管理与生活方式参考，不替代医生诊疗。</text>
        </view>
      </view>
    </template>
    <template v-else>
      <view class="head"
        ><text class="brand">和生序 · 健康管理</text
        ><view class="progress"
          ><view class="progress-fill" :style="{ width: `${progress}%` }" /></view
      ></view>
      <view v-if="step === 1" class="step">
        <text class="eyebrow">先认识一下你</text><text class="title">从今天开始，照顾好自己</text
        ><text class="hint">这些信息只用于生成更适合你的健康管理参考。</text>
        <input
          v-model="form.displayName"
          class="input"
          maxlength="40"
          placeholder="怎么称呼你？（选填）"
        />
        <text class="label">性别</text
        ><view class="choices"
          ><button
            v-for="item in sexOptions"
            :key="item.value"
            :class="['choice', { selected: form.sex === item.value }]"
            @tap="form.sex = item.value"
          >
            {{ item.label }}
          </button></view
        >
      </view>
      <view v-else-if="step === 2" class="step">
        <text class="eyebrow">了解身体基础</text><text class="title">你的 BMI 会实时变化</text
        ><text class="hint">输入身高和体重，看看当前身体状态。</text>
        <view class="input-row"
          ><input
            v-model="form.heightCm"
            class="input"
            type="number"
            placeholder="身高（cm）"
          /><text>cm</text></view
        >
        <view class="measure-slider"
          ><view class="measure-label"
            ><text>身高</text><text>{{ form.heightCm || '--' }} cm</text></view
          ><slider
            :value="Number(form.heightCm) || 168"
            min="140"
            max="210"
            step="1"
            activeColor="#5b9b70"
            backgroundColor="#dceadd"
            block-color="#ffffff"
            block-size="22"
            @changing="setHeight"
        /></view>
        <view class="input-row"
          ><input
            v-model="form.weightKg"
            class="input"
            type="digit"
            placeholder="体重（kg）"
          /><text>kg</text></view
        >
        <view class="measure-slider"
          ><view class="measure-label"
            ><text>体重</text><text>{{ form.weightKg || '--' }} kg</text></view
          ><slider
            :value="Number(form.weightKg) || 62"
            min="35"
            max="150"
            step="0.1"
            activeColor="#5b9b70"
            backgroundColor="#dceadd"
            block-color="#ffffff"
            block-size="22"
            @changing="setWeight"
        /></view>
        <view v-if="bmi !== null" class="bmi-card"
          ><text class="bmi-value">{{ bmi.toFixed(1) }}</text
          ><text class="bmi-label">BMI · {{ bmiLabel }}</text
          ><text class="bmi-advice">{{ bmiAdvice }}</text
          ><view class="bmi-scale"
            ><view class="bmi-scale-fill" :style="{ width: `${bmiProgress}%` }" /></view
          ><view class="bmi-scale-labels"
            ><text>偏瘦</text><text>正常</text><text>偏重</text><text>肥胖</text></view
          ><text class="bmi-note">这是健康管理参考，不是医疗诊断</text></view
        ><view v-else class="empty-card">填写身高和体重后查看 BMI</view>
      </view>
      <view v-else-if="step === 3" class="step">
        <text class="eyebrow">选你现在最想改善的方向</text
        ><text class="title">给生活设定 1—3 个小目标</text
        ><text class="hint">可以多选，序序会按第一个目标安排优先建议，之后随时都能调整。</text>
        <view class="goal-meta"
          ><text>已选择 {{ form.goals.length }}/3</text><text>可多选</text></view
        >
        <view class="goal-list"
          ><button
            v-for="item in goalOptions"
            :key="item.value"
            :class="[
              'goal',
              { selected: form.goals.includes(item.value), blocked: isGoalBlocked(item.value) },
            ]"
            @tap="toggleGoal(item.value)"
          >
            <view class="goal-copy"
              ><text class="goal-label">{{ item.label }}</text
              ><text class="goal-detail">{{ item.detail }}</text></view
            >
            <image
              v-if="form.goals.includes(item.value)"
              src="/static/icons/check.svg"
              mode="aspectFit"
              class="goal-check"
            /><view v-else class="goal-radio" /></button
        ></view>
      </view>
      <view v-else class="step">
        <text class="eyebrow">最后确认一下</text><text class="title">你的健康画像准备好了</text>
        <view class="summary"
          ><text>{{ form.displayName || '新朋友' }}</text
          ><text>{{ form.heightCm }} cm · {{ form.weightKg }} kg</text
          ><text>目标：{{ selectedGoalLabel }}</text
          ><text>BMI {{ bmi?.toFixed(1) }} · {{ bmiLabel }}</text></view
        >
        <text class="hint">保存后会解锁首页，之后每天记下一点真实生活就好。</text>
        <text v-if="error" class="error">{{ error }}</text>
      </view>
      <view class="actions"
        ><button v-if="step > 1" class="back" @tap="back">上一步</button
        ><button class="primary" :disabled="!canAdvance || saving" @tap="next">
          {{ saving ? '保存中...' : step === 4 ? '保存并进入首页' : '继续' }}
        </button></view
      >
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { createMiniApiClient } from '../../services/mini-api.js';
import { onboardingState } from '../../stores/onboarding.js';
import {
  canAdvanceOnboarding,
  onboardingProgress,
  toggleOnboardingGoal,
} from './onboarding-flow.js';
import AppNavBar from '../../components/AppNavBar.vue';
import { shouldConfirmOnboardingExit } from '../../components/navigation.js';
import { saveLocalProfile } from '../../features/health-loop/local-demo.js';

const { form, bmi, bmiCategory } = onboardingState;
const step = ref(onboardingState.step.value);
const saving = ref(false);
const error = ref('');
const heroImage = ref('/static/illustrations/onboarding-hero-square.png');
const sexOptions = [
  { value: 'female' as const, label: '女性' },
  { value: 'male' as const, label: '男性' },
  { value: 'unspecified' as const, label: '不方便说' },
];
const goalOptions = [
  {
    value: 'weight_management' as const,
    label: '减脂与体重管理',
    detail: '建立更轻松的饮食与活动节奏',
  },
  {
    value: 'weight_maintenance' as const,
    label: '保持当前状态',
    detail: '稳定体重，也稳定生活的节律',
  },
  { value: 'muscle_gain' as const, label: '力量与体能', detail: '让身体更有力量，行动更有底气' },
  { value: 'sleep' as const, label: '睡眠与精力', detail: '找回更规律的作息和白天状态' },
  { value: 'energy' as const, label: '饮食与活动', detail: '吃得更明白，动得更自然' },
  { value: 'mood' as const, label: '压力与情绪', detail: '给情绪留出被看见和照顾的空间' },
];
const bmiLabel = computed(
  () =>
    ({ underweight: '偏瘦', normal: '正常', overweight: '偏重', obesity: '肥胖' })[
      bmiCategory.value || 'normal'
    ],
);
const bmiAdvice = computed(() => {
  return (
    {
      underweight: '可以把规律吃饭和充足休息放在第一位。',
      normal: '你的身高体重处于较舒适的范围，继续保持规律节奏。',
      overweight: '先从一件容易坚持的小行动开始，不需要急着改变全部。',
      obesity: '建议优先建立规律记录，必要时咨询专业人士获得帮助。',
    } as Record<string, string>
  )[bmiCategory.value || 'normal'];
});
const bmiProgress = computed(() => {
  if (bmi.value === null) return 0;
  return Math.max(4, Math.min(100, ((bmi.value - 14) / 22) * 100));
});
const selectedGoalLabel = computed(
  () =>
    form.goals
      .map((goal) => goalOptions.find((item) => item.value === goal)?.label)
      .filter(Boolean)
      .join('、') || '还没有选择目标',
);
const progress = computed(() => onboardingProgress(step.value));
const canAdvance = computed(() => canAdvanceOnboarding(step.value, bmi.value, form.goals));
function useFallbackHero() {
  if (heroImage.value !== '/static/illustrations/onboarding-hero-vertical.png') {
    heroImage.value = '/static/illustrations/onboarding-hero-vertical.png';
  }
}
function isGoalBlocked(value: (typeof goalOptions)[number]['value']) {
  return form.goals.length >= 3 && !form.goals.includes(value);
}
function toggleGoal(value: (typeof goalOptions)[number]['value']) {
  const result = toggleOnboardingGoal(form.goals, value);
  if (result.limited) {
    uni.showToast({ title: '最多选择 3 个方向', icon: 'none' });
    return;
  }
  form.goals.splice(0, form.goals.length, ...(result.goals as typeof form.goals));
  form.primaryGoal = form.goals[0] || '';
}
function back() {
  step.value -= 1;
  onboardingState.step.value = step.value;
}
function exitOnboarding() {
  if (!shouldConfirmOnboardingExit(step.value)) return;
  uni.showModal({
    title: '退出建档？',
    content: '已填写的内容不会保存，之后仍可以重新开始。',
    confirmText: '退出',
    cancelText: '继续填写',
    success: ({ confirm }) => {
      if (confirm) uni.redirectTo({ url: '/pages/bootstrap/BootstrapPage' });
    },
  });
}
function setHeight(event: { detail: { value: number } }) {
  form.heightCm = String(event.detail.value);
}
function setWeight(event: { detail: { value: number } }) {
  form.weightKg = Number(event.detail.value).toFixed(1);
}
function next() {
  if (!canAdvance.value) return;
  if (step.value < 4) {
    step.value += 1;
    onboardingState.step.value = step.value;
    return;
  }
  save();
}
async function save() {
  error.value = '';
  saving.value = true;
  saveLocalProfile({
    displayName: form.displayName || '新朋友',
    heightCm: Number(form.heightCm),
    weightKg: Number(form.weightKg),
    primaryGoal: form.primaryGoal,
    goals: form.goals,
  });
  try {
    const client = createMiniApiClient();
    await client.update('/health-profiles/me', {
      displayName: form.displayName || undefined,
      sex: form.sex,
      heightCm: Number(form.heightCm),
      weightKg: Number(form.weightKg),
      primaryGoal: form.primaryGoal,
    });
    onboardingState.completed.value = true;
    uni.switchTab({ url: '/pages/home/HomePage' });
  } catch (reason) {
    onboardingState.completed.value = true;
    uni.showToast({ title: '已保存到本机', icon: 'success' });
    uni.switchTab({ url: '/pages/home/HomePage' });
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  box-sizing: border-box;
  overflow-x: hidden;
  padding: 92rpx 32rpx 48rpx;
  background: #f7fbf8;
  color: #183425;
}
.welcome-screen {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 190rpx);
}
.welcome-art-frame {
  width: 100%;
  height: 420rpx;
  overflow: hidden;
  border-radius: 26rpx;
  background: #fffdf5;
  box-shadow: 0 18rpx 42rpx rgba(54, 102, 66, 0.08);
}
.welcome-art {
  display: block;
  width: 100%;
  height: 100%;
}
.welcome-copy {
  display: flex;
  flex: none;
  flex-direction: column;
  padding: 22rpx 12rpx 0;
  background: #f7fbf8;
  position: relative;
}
.xuxu {
  display: flex;
  align-items: center;
  gap: 14rpx;
  color: #566e5c;
  font-size: 22rpx;
}
.xuxu image {
  width: 64rpx;
  height: 64rpx;
  border: 3rpx solid #efd689;
  border-radius: 50%;
}
.xuxu text {
  display: block;
  font-weight: 700;
}
.xuxu text:last-child {
  margin-top: 3rpx;
  color: #778a7d;
  font-weight: 400;
}
.brand,
.eyebrow,
.title,
.hint,
.label {
  display: block;
}
.brand,
.eyebrow {
  color: #3f805a;
  font-size: 24rpx;
  font-weight: 700;
}
.welcome-copy .brand {
  margin-top: 18rpx;
}
.title {
  margin-top: 13rpx;
  font-size: 42rpx;
  font-weight: 700;
  line-height: 1.28;
}
.welcome-title {
  display: block;
  margin-top: 12rpx;
  font-size: 42rpx;
  font-weight: 700;
  line-height: 1.24;
}
.welcome-copy .primary {
  width: 100%;
  height: 86rpx;
  flex: none;
  margin-top: 24rpx;
  line-height: 86rpx;
}
.hint {
  margin-top: 16rpx;
  color: #687f71;
  font-size: 24rpx;
  line-height: 1.6;
}
.disclaimer {
  display: block;
  margin-top: 12rpx;
  color: #8a9b90;
  font-size: 20rpx;
  line-height: 1.55;
}
.head {
  margin-bottom: 32rpx;
}
.progress {
  height: 8rpx;
  margin-top: 24rpx;
  overflow: hidden;
  border-radius: 8rpx;
  background: #dfebe1;
}
.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: #67a67c;
}
.input,
.input-row {
  box-sizing: border-box;
  width: 100%;
  height: 88rpx;
  border: 2rpx solid #d9e8dc;
  border-radius: 16rpx;
  background: #fff;
}
.input {
  padding: 0 22rpx;
  font-size: 28rpx;
}
.label {
  margin: 32rpx 0 14rpx;
  color: #506e5a;
  font-size: 25rpx;
}
.choices {
  display: flex;
  gap: 12rpx;
}
.choice {
  flex: 1;
  padding: 19rpx 6rpx;
  border: 2rpx solid #dceadd;
  border-radius: 14rpx;
  color: #587362;
  background: #fff;
  font-size: 24rpx;
}
.selected {
  border-color: #6daa7b !important;
  color: #286d48 !important;
  background: #e9f5ea !important;
}
.input-row {
  display: flex;
  align-items: center;
  margin-top: 18rpx;
}
.input-row .input {
  border: 0;
}
.input-row text {
  padding-right: 22rpx;
  color: #6d8879;
}
.measure-slider {
  margin: 18rpx 2rpx 6rpx;
  padding: 16rpx 18rpx 8rpx;
  border-radius: 16rpx;
  background: #f1f8f1;
}
.measure-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #557260;
  font-size: 22rpx;
}
.measure-label text:last-child {
  color: #2f7d50;
  font-size: 25rpx;
  font-weight: 700;
}
.measure-slider slider {
  margin: 3rpx 0 0;
}
.bmi-card,
.empty-card,
.summary {
  margin-top: 24rpx;
  padding: 22rpx;
  border-radius: 18rpx;
  background: #e8f4e8;
}
.bmi-value,
.bmi-label,
.bmi-note {
  display: block;
}
.bmi-value {
  color: #2c774d;
  font-size: 60rpx;
  font-weight: 700;
}
.bmi-label {
  margin-top: 4rpx;
  color: #447b59;
  font-size: 27rpx;
}
.bmi-advice {
  display: block;
  margin-top: 12rpx;
  color: #4f735a;
  font-size: 23rpx;
  line-height: 1.5;
}
.bmi-scale {
  height: 10rpx;
  margin-top: 20rpx;
  overflow: hidden;
  border-radius: 10rpx;
  background: linear-gradient(90deg, #9dc7a5 0 27%, #62a57b 27% 58%, #d3b76d 58% 78%, #d18a6b 78%);
}
.bmi-scale-fill {
  height: 100%;
  border-radius: inherit;
  background: rgba(28, 75, 44, 0.16);
}
.bmi-scale-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 7rpx;
  color: #7a9180;
  font-size: 19rpx;
}
.bmi-note {
  margin-top: 14rpx;
  color: #718a7b;
  font-size: 21rpx;
}
.empty-card {
  color: #748b7b;
  background: #fff;
  font-size: 25rpx;
}
.goal-list {
  display: flex;
  flex-direction: column;
  gap: 13rpx;
  margin-top: 26rpx;
}
.goal {
  display: flex;
  align-items: center;
  gap: 18rpx;
  min-height: 96rpx;
  padding: 18rpx 20rpx;
  border: 2rpx solid #dceadd;
  border-radius: 17rpx;
  color: #31543e;
  text-align: left;
  background: #fff;
  font-size: 27rpx;
}
.goal-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 5rpx;
}
.goal-label {
  color: #31543e;
  font-size: 27rpx;
  font-weight: 700;
}
.goal-detail {
  color: #7a9180;
  font-size: 21rpx;
  line-height: 1.35;
}
.goal-check,
.goal-radio {
  width: 36rpx;
  height: 36rpx;
  flex: 0 0 36rpx;
}
.goal-radio {
  box-sizing: border-box;
  border: 2rpx solid #c6d9c9;
  border-radius: 50%;
}
.goal.blocked {
  opacity: 0.46;
}
.goal-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 22rpx;
  color: #6f8777;
  font-size: 22rpx;
}
.goal-meta text:first-child {
  color: #36794f;
  font-weight: 700;
}
.goal-check {
  margin-left: auto;
}
.summary {
  display: flex;
  flex-direction: column;
  gap: 11rpx;
  color: #355b41;
  font-size: 28rpx;
}
.actions {
  display: flex;
  gap: 16rpx;
  margin-top: 34rpx;
}
.error {
  display: block;
  margin-top: 22rpx;
  padding: 16rpx 18rpx;
  border-radius: 14rpx;
  color: #a85f4b;
  background: #fff1ed;
  font-size: 22rpx;
  line-height: 1.5;
}
.primary,
.back {
  height: 86rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  line-height: 86rpx;
}
.primary {
  flex: 1;
  color: #fff;
  background: #2e7d4f;
}
.back {
  width: 190rpx;
  color: #4d6e58;
  background: #e7f0e8;
}
.primary[disabled] {
  opacity: 0.45;
}
</style>
