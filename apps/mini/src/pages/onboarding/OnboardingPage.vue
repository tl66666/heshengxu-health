<template>
  <view class="onboarding-page">
    <!-- 欢迎屏：全屏沉浸插画 + 底部浮动文案卡 -->
    <template v-if="step === 0">
      <view class="welcome-immersive">
        <image
          src="/static/illustrations/onboarding-guide-vertical.png"
          class="welcome-bg"
          mode="aspectFill"
        />
        <view class="welcome-overlay" />
        <view class="welcome-content hz-rise">
          <view class="xuxu-intro hz-rise-1">
            <image src="/static/illustrations/xuxu-avatar.png" mode="aspectFill" />
            <view class="xuxu-speech">
              <text class="xuxu-greeting">你好，我是序序</text>
              <text class="xuxu-subtitle">你的健康陪伴助手</text>
            </view>
          </view>
          <text class="brand hz-rise-2">和生序</text>
          <text class="welcome-slogan hz-rise-2">让健康回到自己的节律</text>
          <text class="welcome-desc hz-rise-3"
            >花一点时间认识你，之后每一步都会围绕你的真实生活展开。</text
          >
          <button class="btn-start hz-rise-3" @tap="next">开始了解我</button>
          <text class="disclaimer hz-rise-4"
            >和生序提供健康管理与生活方式参考，不替代医生诊疗。</text
          >
        </view>
      </view>
    </template>

    <!-- 步骤页：纯色渐变背景 + 清爽表单卡 -->
    <template v-else>
      <AppNavBar
        title="开始了解自己"
        close-label="退出"
        :back-disabled="false"
        route="/pages/onboarding/OnboardingPage"
        back-mode="emit"
        @back="back"
        @close="exitOnboarding"
      />

      <view class="step-container">
        <view class="step-progress">
          <view class="progress-dots">
            <view v-for="i in 4" :key="i" :class="['dot', { active: step >= i }]" />
          </view>
          <text class="progress-text">第 {{ step }}/4 步</text>
        </view>

        <!-- Step 1: 性别 -->
        <view v-if="step === 1" class="step-form hz-rise">
          <view class="form-head">
            <text class="form-label">基本信息</text>
            <text class="form-title">先从性别开始</text>
            <text class="form-hint">这会影响基础代谢率和健康建议的准确性</text>
          </view>
          <view class="sex-options">
            <button
              v-for="option in sexOptions"
              :key="option.value"
              :class="['sex-btn', { selected: form.sex === option.value }]"
              @tap="form.sex = option.value"
            >
              <view :class="['sex-icon', `sex-icon--${option.value}`]">
                <text>{{ option.icon }}</text>
              </view>
              <text class="sex-label">{{ option.label }}</text>
            </button>
          </view>
        </view>

        <!-- Step 2: 身高体重 -->
        <view v-else-if="step === 2" class="step-form hz-rise">
          <view class="form-head">
            <text class="form-label">了解身体基础</text>
            <text class="form-title">你的 BMI 会实时变化</text>
            <text class="form-hint">输入身高和体重，看看当前身体状态</text>
          </view>

          <view class="measure-card">
            <view class="measure-item">
              <text class="measure-name">身高</text>
              <view class="measure-input-wrap">
                <input
                  v-model="form.heightCm"
                  type="number"
                  placeholder="168"
                  class="measure-input"
                />
                <text class="measure-unit">cm</text>
              </view>
            </view>
            <slider
              :value="Number(form.heightCm) || 168"
              min="140"
              max="210"
              step="1"
              activeColor="#79ac8c"
              backgroundColor="#eef4ef"
              block-color="#ffffff"
              block-size="24"
              @changing="setHeight"
              @change="setHeight"
            />
          </view>

          <view class="measure-card">
            <view class="measure-item">
              <text class="measure-name">体重</text>
              <view class="measure-input-wrap">
                <input
                  v-model="form.weightKg"
                  type="digit"
                  placeholder="60.0"
                  class="measure-input"
                />
                <text class="measure-unit">kg</text>
              </view>
            </view>
            <slider
              :value="Number(form.weightKg) || 60"
              min="35"
              max="150"
              step="0.1"
              activeColor="#79ac8c"
              backgroundColor="#eef4ef"
              block-color="#ffffff"
              block-size="24"
              @changing="setWeight"
              @change="setWeight"
            />
          </view>

          <view v-if="bmi" class="bmi-result">
            <view class="bmi-main">
              <text class="bmi-value">{{ bmi }}</text>
              <view class="bmi-badge">
                <text>{{ bmiLabel }}</text>
              </view>
            </view>
            <text class="bmi-hint">当前 BMI · {{ bmiCategory }}</text>
          </view>
        </view>

        <!-- Step 3: 生日 -->
        <view v-else-if="step === 3" class="step-form hz-rise">
          <view class="form-head">
            <text class="form-label">生日</text>
            <text class="form-title">记录时光的起点</text>
            <text class="form-hint">用于计算年龄相关的健康参考范围</text>
          </view>
          <picker mode="date" :value="form.birthdate" :end="today" @change="setBirthdate">
            <view class="date-selector">
              <text v-if="form.birthdate" class="date-value">{{ form.birthdate }}</text>
              <text v-else class="date-placeholder">选择生日</text>
              <image src="/static/icons/forward.svg" class="date-arrow" mode="aspectFit" />
            </view>
          </picker>
          <text v-if="age" class="age-result">你今年 {{ age }} 岁</text>
        </view>

        <!-- Step 4: 健康目标 -->
        <view v-else class="step-form hz-rise">
          <view class="form-head">
            <text class="form-label">健康目标</text>
            <text class="form-title">想在哪个方向开始</text>
            <text class="form-hint">可以多选，之后随时调整</text>
          </view>
          <view class="goal-grid">
            <button
              v-for="goal in goalOptions"
              :key="goal.value"
              :class="['goal-tile', { selected: form.goals.includes(goal.value) }]"
              @tap="toggleGoal(goal.value)"
            >
              <view class="goal-check">
                <image
                  v-if="form.goals.includes(goal.value)"
                  src="/static/icons/check.svg"
                  mode="aspectFit"
                />
              </view>
              <text class="goal-name">{{ goal.label }}</text>
              <text class="goal-desc">{{ goal.detail }}</text>
            </button>
          </view>

          <view class="profile-summary">
            <text class="summary-title">你的档案</text>
            <text class="summary-row"
              >{{ sexOptions.find((s) => s.value === form.sex)?.label }} · {{ form.birthdate }}（{{
                age
              }}岁）</text
            >
            <text class="summary-row"
              >{{ form.heightCm }} cm · {{ form.weightKg }} kg · BMI {{ bmi }} ·
              {{ bmiLabel }}</text
            >
          </view>
          <text class="form-hint">保存后会解锁首页，之后每天记下一点真实生活就好。</text>
          <text v-if="error" class="error-box">{{ error }}</text>
        </view>

        <view class="step-actions">
          <button v-if="step > 1" class="btn-back" @tap="back">上一步</button>
          <button class="btn-next" :disabled="!canAdvance || saving" @tap="next">
            {{ saving ? '保存中...' : step === 4 ? '保存并进入首页' : '继续' }}
          </button>
        </view>
      </view>
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
const heroImage = ref('/static/illustrations/onboarding-guide-vertical.png');

function useFallbackHero() {
  heroImage.value = '/static/illustrations/onboarding-hero-vertical.png';
}

const sexOptions = [
  { value: 'female' as const, label: '女性', icon: '♀' },
  { value: 'male' as const, label: '男性', icon: '♂' },
  { value: 'unspecified' as const, label: '不方便说', icon: '·' },
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
  { value: 'fitness' as const, label: '增强体能', detail: '通过日常活动提升身体活力' },
  { value: 'health_monitoring' as const, label: '健康监测', detail: '观察生活方式对身体的影响' },
];

const today = computed(() => new Date().toISOString().slice(0, 10));
const age = computed(() => {
  if (!form.birthdate) return null;
  const birth = new Date(form.birthdate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age;
});

const canAdvance = computed(() => canAdvanceOnboarding(form, step.value));
const bmiLabel = computed(() => {
  if (!bmiCategory.value) return '';
  const labels: Record<string, string> = {
    underweight: '偏瘦',
    normal: '正常',
    overweight: '超重',
    obese: '肥胖',
  };
  return labels[bmiCategory.value] || '';
});

function setHeight(e: any) {
  form.heightCm = String(e.detail.value);
}
function setWeight(e: any) {
  form.weightKg = String(e.detail.value);
}
function setBirthdate(e: any) {
  form.birthdate = e.detail.value;
}
function toggleGoal(goal: (typeof goalOptions)[0]['value']) {
  toggleOnboardingGoal(form, goal);
}

function back() {
  if (step.value > 1) step.value -= 1;
}

async function next() {
  if (step.value < 4) {
    step.value += 1;
    return;
  }

  saving.value = true;
  error.value = '';

  try {
    await saveLocalProfile({
      sex: form.sex,
      birthdate: form.birthdate,
      heightCm: Number(form.heightCm),
      weightKg: Number(form.weightKg),
      goals: form.goals,
      consentTimestamp: new Date().toISOString(),
    });

    onboardingState.step.value = 5;
    uni.reLaunch({ url: '/pages/home/HomePage' });
  } catch (err: any) {
    error.value = err.message || '保存失败，请重试';
    saving.value = false;
  }
}

function exitOnboarding() {
  if (shouldConfirmOnboardingExit(step.value)) {
    uni.showModal({
      title: '确定退出？',
      content: '当前填写的信息不会保存',
      confirmText: '退出',
      cancelText: '继续填写',
      success: (res) => {
        if (res.confirm) {
          uni.reLaunch({ url: '/pages/bootstrap/BootstrapPage' });
        }
      },
    });
  } else {
    uni.reLaunch({ url: '/pages/bootstrap/BootstrapPage' });
  }
}
</script>

<style scoped>
.onboarding-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f9fcfa 0%, #f3f8f4 100%);
}

/* ===== 欢迎屏：全屏沉浸插画 ===== */
.welcome-immersive {
  position: relative;
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
}
.welcome-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}
.welcome-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, rgba(247, 251, 248, 0) 0%, rgba(247, 251, 248, 0.92) 60%);
  z-index: 1;
}
.welcome-content {
  position: relative;
  z-index: 2;
  padding: 0 36rpx 88rpx;
}
.xuxu-intro {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  margin-bottom: 32rpx;
}
.xuxu-intro image {
  width: 88rpx;
  height: 88rpx;
  border: 4rpx solid #f4e3a0;
  border-radius: 50%;
  box-shadow: 0 8rpx 24rpx rgba(239, 214, 137, 0.4);
}
.xuxu-speech {
  flex: 1;
  padding: 20rpx 24rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(20rpx);
}
.xuxu-greeting {
  display: block;
  color: #2d6943;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 1.4;
}
.xuxu-subtitle {
  display: block;
  margin-top: 4rpx;
  color: #6f8879;
  font-size: 24rpx;
  line-height: 1.5;
}
.brand {
  display: block;
  margin-bottom: 12rpx;
  color: #5a9572;
  font-size: 26rpx;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.welcome-slogan {
  display: block;
  margin-bottom: 16rpx;
  color: #183425;
  font-size: 52rpx;
  font-weight: 800;
  line-height: 1.28;
  letter-spacing: -0.02em;
}
.welcome-desc {
  display: block;
  margin-bottom: 32rpx;
  color: #4a6853;
  font-size: 28rpx;
  line-height: 1.68;
}
.btn-start {
  width: 100%;
  height: 104rpx;
  border-radius: 999rpx;
  color: var(--hz-primary-ink);
  background: var(--hz-primary-soft);
  border: 2rpx solid var(--hz-primary-border);
  box-shadow: 0 12rpx 32rpx rgba(47, 124, 80, 0.18);
  font-size: 34rpx;
  font-weight: 700;
  line-height: 104rpx;
}
.disclaimer {
  display: block;
  margin-top: 20rpx;
  color: #96a89d;
  font-size: 22rpx;
  line-height: 1.6;
  text-align: center;
}

/* ===== 步骤页：清爽表单卡 ===== */
.step-container {
  min-height: calc(100vh - var(--status-bar-height) - 88rpx);
  padding: 32rpx 32rpx 88rpx;
}
.step-progress {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32rpx;
}
.progress-dots {
  display: flex;
  gap: 12rpx;
}
.dot {
  width: 32rpx;
  height: 8rpx;
  border-radius: 8rpx;
  background: #dfe9e1;
  transition: all 0.3s ease;
}
.dot.active {
  width: 64rpx;
  background: linear-gradient(90deg, #79ac8c, #5f9e76);
}
.progress-text {
  color: #6f8879;
  font-size: 24rpx;
  font-weight: 600;
}

.step-form {
  padding: 44rpx 36rpx;
  border-radius: 32rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 40rpx rgba(46, 97, 64, 0.08);
}
.form-head {
  margin-bottom: 40rpx;
}
.form-label {
  display: block;
  margin-bottom: 12rpx;
  color: #5a9572;
  font-size: 24rpx;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.form-title {
  display: block;
  margin-bottom: 16rpx;
  color: #183425;
  font-size: 48rpx;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: -0.02em;
}
.form-hint {
  display: block;
  color: #6f8879;
  font-size: 26rpx;
  line-height: 1.68;
}

/* 性别选择 */
.sex-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}
.sex-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 140rpx;
  padding: 24rpx;
  border: 3rpx solid #e8f0e9;
  border-radius: 24rpx;
  background: #fafcfb;
  transition: all 0.25s ease;
}
.sex-btn.selected {
  border-color: #9ec6ab;
  background: var(--hz-primary-soft);
  transform: translateY(-4rpx);
  box-shadow: 0 12rpx 32rpx rgba(46, 125, 79, 0.16);
}
.sex-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  margin-bottom: 12rpx;
  border-radius: 50%;
  background: #f3f8f4;
  font-size: 36rpx;
  transition: all 0.25s ease;
}
.sex-btn.selected .sex-icon {
  background: #fff;
}
.sex-label {
  color: #355b41;
  font-size: 26rpx;
  font-weight: 600;
}

/* 身高体重 */
.measure-card {
  margin-bottom: 32rpx;
  padding: 32rpx 28rpx;
  border-radius: 24rpx;
  background: #f9fcfa;
}
.measure-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}
.measure-name {
  color: #355b41;
  font-size: 28rpx;
  font-weight: 600;
}
.measure-input-wrap {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.measure-input {
  width: 160rpx;
  height: 72rpx;
  padding: 0 20rpx;
  border: 2rpx solid #e8f0e9;
  border-radius: 20rpx;
  background: #fff;
  font-size: 32rpx;
  font-weight: 600;
  text-align: right;
  transition: all 0.2s ease;
}
.measure-input:focus {
  border-color: #b9d6c3;
  box-shadow: 0 4rpx 20rpx rgba(46, 97, 64, 0.1);
}
.measure-unit {
  color: #6f8879;
  font-size: 28rpx;
}

.bmi-result {
  margin-top: 40rpx;
  padding: 36rpx 32rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, rgba(232, 247, 237, 0.7), rgba(225, 241, 230, 0.5));
  text-align: center;
}
.bmi-main {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}
.bmi-value {
  background: linear-gradient(135deg, #4a8f5e, #347c50);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 88rpx;
  font-weight: 900;
  line-height: 1;
}
.bmi-badge {
  padding: 12rpx 20rpx;
  border-radius: 999rpx;
  background: #e3f2e6;
  color: #3f7953;
  font-size: 26rpx;
  font-weight: 700;
}
.bmi-hint {
  color: #6f8879;
  font-size: 24rpx;
}

/* 生日 */
.date-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 108rpx;
  padding: 0 32rpx;
  border: 3rpx solid #e8f0e9;
  border-radius: 24rpx;
  background: #fafcfb;
  transition: all 0.2s ease;
}
.date-value {
  color: #183425;
  font-size: 32rpx;
  font-weight: 600;
}
.date-placeholder {
  color: #96a89d;
  font-size: 32rpx;
}
.date-arrow {
  width: 32rpx;
  height: 32rpx;
  opacity: 0.3;
}
.age-result {
  display: block;
  margin-top: 24rpx;
  color: #4a6853;
  font-size: 26rpx;
  text-align: center;
}

/* 健康目标 */
.goal-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  margin-bottom: 32rpx;
}
.goal-tile {
  position: relative;
  padding: 28rpx 24rpx;
  border: 3rpx solid #e8f0e9;
  border-radius: 24rpx;
  background: #fafcfb;
  text-align: left;
  transition: all 0.25s ease;
}
.goal-tile.selected {
  border-color: #9ec6ab;
  background: var(--hz-primary-soft);
  transform: translateY(-4rpx);
  box-shadow: 0 12rpx 32rpx rgba(46, 125, 79, 0.16);
}
.goal-check {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40rpx;
  height: 40rpx;
  border: 3rpx solid #d4e2d7;
  border-radius: 50%;
  background: #fff;
  transition: all 0.25s ease;
}
.goal-tile.selected .goal-check {
  border-color: #79ac8c;
  background: #79ac8c;
}
.goal-check image {
  width: 20rpx;
  height: 20rpx;
  filter: brightness(10);
}
.goal-name {
  display: block;
  margin-bottom: 8rpx;
  color: #183425;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 1.4;
}
.goal-desc {
  display: block;
  color: #6f8879;
  font-size: 22rpx;
  line-height: 1.6;
}

.profile-summary {
  margin-bottom: 24rpx;
  padding: 28rpx 32rpx;
  border-radius: 20rpx;
  background: #f9fcfa;
}
.summary-title {
  display: block;
  margin-bottom: 12rpx;
  color: #5a9572;
  font-size: 22rpx;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.summary-row {
  display: block;
  margin-bottom: 6rpx;
  color: #355b41;
  font-size: 26rpx;
  line-height: 1.6;
}
.error-box {
  display: block;
  margin-top: 24rpx;
  padding: 24rpx 28rpx;
  border: 2rpx solid #fcd9cd;
  border-radius: 20rpx;
  color: #a85f4b;
  background: #fff8f5;
  font-size: 24rpx;
  line-height: 1.6;
}

.step-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 32rpx;
}
.btn-back,
.btn-next {
  height: 104rpx;
  border-radius: 999rpx;
  font-size: 32rpx;
  font-weight: 700;
  line-height: 104rpx;
}
.btn-back {
  width: 180rpx;
  color: #4d6e58;
  background: #ffffff;
  border: 3rpx solid #dfe9e1;
}
.btn-next {
  flex: 1;
  color: var(--hz-primary-ink);
  background: var(--hz-primary-soft);
  border: 2rpx solid var(--hz-primary-border);
  box-shadow: 0 12rpx 32rpx rgba(47, 124, 80, 0.18);
}
.btn-next[disabled] {
  opacity: 0.5;
  filter: grayscale(0.4);
}
</style>
