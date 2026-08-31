<template>
  <view class="onboarding-container">
    <!-- 欢迎屏：薄荷式全屏沉浸 -->
    <template v-if="step === 0">
      <view class="welcome-fullscreen">
        <!-- 背景插画：完整显示不裁切 -->
        <image
          src="/static/illustrations/onboarding-guide-vertical.png"
          class="welcome-illustration"
          mode="widthFix"
        />
        <!-- 渐变遮罩：确保文字可读 -->
        <view class="welcome-gradient" />

        <!-- 内容区：底部浮动 -->
        <view class="welcome-body">
          <!-- 序序介绍：小气泡 -->
          <view class="xuxu-bubble hz-rise">
            <image
              src="/static/illustrations/xuxu-avatar.png"
              class="xuxu-avatar"
              mode="aspectFill"
            />
            <view class="bubble-content">
              <text class="bubble-greeting">你好，我是序序</text>
              <text class="bubble-role">你的健康陪伴助手</text>
            </view>
          </view>

          <!-- 品牌 + 标语 -->
          <view class="welcome-message hz-rise hz-rise-1">
            <text class="brand-name">和生序</text>
            <text class="brand-slogan">让健康回到自己的节律</text>
            <text class="brand-desc">花一点时间认识你，之后每一步都会围绕你的真实生活展开。</text>
          </view>

          <!-- 开始按钮 -->
          <button class="btn-large btn-primary hz-rise hz-rise-2" @tap="startOnboarding">
            开始了解我
          </button>

          <!-- 声明 -->
          <text class="legal-disclaimer hz-rise hz-rise-3">
            和生序提供健康管理与生活方式参考，不替代医生诊疗。
          </text>
        </view>
      </view>
    </template>

    <!-- 步骤页：薄荷式轻盈卡片 -->
    <template v-else>
      <!-- 顶部导航 -->
      <AppNavBar
        title="完善资料"
        close-label="退出"
        :back-disabled="false"
        route="/pages/onboarding/OnboardingPage"
        back-mode="emit"
        @back="prevStep"
        @close="confirmExit"
      />

      <view class="steps-container">
        <!-- 进度指示 -->
        <view class="step-indicator">
          <view class="indicator-dots">
            <view
              v-for="i in 4"
              :key="i"
              :class="['dot', { active: step === i, completed: step > i }]"
            />
          </view>
          <text class="indicator-text">{{ step }}/4</text>
        </view>

        <scroll-view scroll-y class="step-scroll">
          <!-- Step 1: 性别 -->
          <view v-if="step === 1" class="step-content hz-rise">
            <view class="step-header">
              <text class="step-title">你的性别</text>
              <text class="step-subtitle">帮助计算更准确的健康指标</text>
            </view>

            <view class="sex-grid">
              <button
                v-for="option in sexOptions"
                :key="option.value"
                :class="['sex-card', { selected: form.sex === option.value }]"
                @tap="form.sex = option.value"
              >
                <view class="sex-icon-wrap">
                  <text class="sex-icon">{{ option.icon }}</text>
                </view>
                <text class="sex-label">{{ option.label }}</text>
              </button>
            </view>
          </view>

          <!-- Step 2: 身高体重 + BMI 可视化 -->
          <view v-else-if="step === 2" class="step-content hz-rise">
            <view class="step-header">
              <text class="step-title">身高和体重</text>
              <text class="step-subtitle">用于计算 BMI 和推荐每日目标</text>
            </view>

            <!-- 身高输入 -->
            <view class="input-group">
              <view class="input-label-row">
                <text class="input-label">身高</text>
                <view class="input-value-wrap">
                  <input
                    v-model="form.heightCm"
                    type="number"
                    placeholder="168"
                    class="input-field"
                  />
                  <text class="input-unit">cm</text>
                </view>
              </view>
              <slider
                :value="Number(form.heightCm) || 168"
                min="140"
                max="210"
                step="1"
                activeColor="#7fcc8f"
                backgroundColor="#e8f4ea"
                block-color="#ffffff"
                block-size="24"
                @changing="updateHeight"
                @change="updateHeight"
              />
            </view>

            <!-- 体重输入 -->
            <view class="input-group">
              <view class="input-label-row">
                <text class="input-label">体重</text>
                <view class="input-value-wrap">
                  <input
                    v-model="form.weightKg"
                    type="digit"
                    placeholder="60.0"
                    class="input-field"
                  />
                  <text class="input-unit">kg</text>
                </view>
              </view>
              <slider
                :value="Number(form.weightKg) || 60"
                min="35"
                max="150"
                step="0.1"
                activeColor="#7fcc8f"
                backgroundColor="#e8f4ea"
                block-color="#ffffff"
                block-size="24"
                @changing="updateWeight"
                @change="updateWeight"
              />
            </view>

            <!-- BMI 可视化：薄荷风格 -->
            <view v-if="bmi" class="bmi-visual">
              <view class="bmi-header">
                <text class="bmi-title">你的 BMI</text>
                <view class="bmi-value-group">
                  <text class="bmi-number">{{ bmi }}</text>
                  <text :class="['bmi-status', `bmi-status--${bmiCategory}`]">{{ bmiLabel }}</text>
                </view>
              </view>

              <!-- 彩色刻度尺：4段式 -->
              <view class="bmi-ruler">
                <view class="ruler-track">
                  <view class="ruler-segment segment-underweight" />
                  <view class="ruler-segment segment-normal" />
                  <view class="ruler-segment segment-overweight" />
                  <view class="ruler-segment segment-obese" />
                </view>
                <view class="ruler-pointer" :style="{ left: bmiPointerLeft }" />
              </view>

              <!-- 刻度标签 -->
              <view class="bmi-labels">
                <text class="bmi-label-item">偏瘦</text>
                <text class="bmi-label-item">正常</text>
                <text class="bmi-label-item">超重</text>
                <text class="bmi-label-item">肥胖</text>
              </view>

              <text class="bmi-hint">BMI 是参考指标，不代表健康的全部</text>
            </view>
          </view>

          <!-- Step 3: 生日 -->
          <view v-else-if="step === 3" class="step-content hz-rise">
            <view class="step-header">
              <text class="step-title">你的生日</text>
              <text class="step-subtitle">用于计算年龄相关的健康建议</text>
            </view>

            <picker mode="date" :value="form.birthDate" :end="todayStr" @change="updateBirthDate">
              <view class="date-picker-btn">
                <text v-if="form.birthDate" class="date-picked">{{ form.birthDate }}</text>
                <text v-else class="date-placeholder">选择生日</text>
                <image src="/static/icons/svg/forward.svg" class="date-arrow" mode="aspectFit" />
              </view>
            </picker>

            <text v-if="age" class="age-display">今年 {{ age }} 岁</text>
          </view>

          <!-- Step 4: 健康目标 -->
          <view v-else class="step-content hz-rise">
            <view class="step-header">
              <text class="step-title">你的健康目标</text>
              <text class="step-subtitle">可以多选，随时调整</text>
            </view>

            <view class="goal-list">
              <button
                v-for="goal in goalOptions"
                :key="goal.value"
                :class="['goal-item', { selected: form.goals.includes(goal.value) }]"
                @tap="toggleGoal(goal.value)"
              >
                <view class="goal-check-wrap">
                  <view :class="['goal-check', { checked: form.goals.includes(goal.value) }]">
                    <image
                      v-if="form.goals.includes(goal.value)"
                      src="/static/icons/svg/check.svg"
                      class="check-icon"
                      mode="aspectFit"
                    />
                  </view>
                </view>
                <view class="goal-text">
                  <text class="goal-name">{{ goal.label }}</text>
                  <text class="goal-detail">{{ goal.detail }}</text>
                </view>
              </button>
            </view>

            <!-- 档案预览 -->
            <view class="profile-preview">
              <text class="preview-title">档案预览</text>
              <view class="preview-row">
                <text class="preview-label">基本信息</text>
                <text class="preview-value"
                  >{{ sexLabel }} · {{ form.birthDate }} ({{ age }}岁)</text
                >
              </view>
              <view class="preview-row">
                <text class="preview-label">身体数据</text>
                <text class="preview-value"
                  >{{ form.heightCm }}cm · {{ form.weightKg }}kg · BMI {{ bmi }}</text
                >
              </view>
              <view class="preview-row">
                <text class="preview-label">健康目标</text>
                <text class="preview-value">{{ selectedGoalsText }}</text>
              </view>
            </view>

            <text v-if="error" class="error-message">{{ error }}</text>
          </view>
        </scroll-view>

        <!-- 底部按钮 -->
        <view class="step-footer">
          <button class="btn-large btn-primary" :disabled="!canProceed || saving" @tap="nextStep">
            {{ saving ? '保存中...' : step === 4 ? '完成并进入首页' : '继续' }}
          </button>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onboardingState } from '../../stores/onboarding.js';
import { toggleOnboardingGoal } from './onboarding-flow.js';
import AppNavBar from '../../components/AppNavBar.vue';
import { shouldConfirmOnboardingExit } from '../../components/navigation.js';
import { saveLocalProfile } from '../../features/health-loop/local-demo.js';

const { form, bmi, bmiCategory } = onboardingState;
const step = ref(0);
const saving = ref(false);
const error = ref('');

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
  { value: 'muscle_gain' as const, label: '增肌塑形', detail: '通过运动和营养增强体质' },
  { value: 'sleep' as const, label: '改善睡眠', detail: '建立规律作息和睡眠习惯' },
];

const todayStr = computed(() => new Date().toISOString().slice(0, 10));

const age = computed(() => {
  if (!form.birthDate) return null;
  const birth = new Date(form.birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age;
});

const sexLabel = computed(() => sexOptions.find((s) => s.value === form.sex)?.label || '');

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

const bmiPointerLeft = computed(() => {
  if (!bmi.value) return '0%';
  const value = bmi.value;
  // BMI: <18.5 偏瘦 | 18.5-23.9 正常 | 24-27.9 超重 | ≥28 肥胖
  if (value < 18.5) {
    return `${Math.max(0, ((value - 15) / 3.5) * 25)}%`;
  } else if (value < 24) {
    return `${25 + ((value - 18.5) / 5.5) * 25}%`;
  } else if (value < 28) {
    return `${50 + ((value - 24) / 4) * 25}%`;
  } else {
    return `${Math.min(100, 75 + ((value - 28) / 7) * 25)}%`;
  }
});

const selectedGoalsText = computed(() => {
  return (
    form.goals
      .map((g) => goalOptions.find((opt) => opt.value === g)?.label)
      .filter(Boolean)
      .join('、') || '未选择'
  );
});

const canProceed = computed(() => {
  if (step.value === 1) return !!form.sex;
  if (step.value === 2) return bmi.value !== null;
  if (step.value === 3) return !!form.birthDate;
  if (step.value === 4) return form.goals.length > 0;
  return true;
});

function updateHeight(e: any) {
  form.heightCm = String(e.detail.value);
}
function updateWeight(e: any) {
  const value = Number(e.detail.value);
  form.weightKg = String(Math.round(value * 10) / 10);
}
function updateBirthDate(e: any) {
  form.birthDate = e.detail.value;
}
function toggleGoal(goal: (typeof goalOptions)[0]['value']) {
  const result = toggleOnboardingGoal(form.goals, goal);
  form.goals = result.goals as any;
}

function startOnboarding() {
  // 初始化默认身高体重，确保 BMI 立即显示
  if (!form.heightCm) form.heightCm = '168';
  if (!form.weightKg) form.weightKg = '60.0';
  step.value = 1;
}

function prevStep() {
  if (step.value > 1) step.value -= 1;
}

async function nextStep() {
  if (step.value < 4) {
    step.value += 1;
    return;
  }

  saving.value = true;
  error.value = '';

  try {
    await saveLocalProfile({
      displayName: form.displayName || '新朋友',
      heightCm: Number(form.heightCm),
      weightKg: Number(form.weightKg),
      primaryGoal: form.primaryGoal || form.goals[0] || '',
      goals: form.goals as string[],
    });

    onboardingState.step.value = 5;
    onboardingState.completed.value = true;
    uni.switchTab({ url: '/pages/home/HomePage' });
  } catch (err: any) {
    error.value = err.message || '保存失败，请重试';
    saving.value = false;
  }
}

function confirmExit() {
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
/* === 全局容器 === */
.onboarding-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f9fcfa 0%, #f3f8f4 100%);
}

/* === 欢迎屏：全屏沉浸 === */
.welcome-fullscreen {
  position: relative;
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
  background: linear-gradient(180deg, #e8f4ea 0%, #f7fbf8 100%);
}
.welcome-illustration {
  position: absolute;
  top: -120rpx;
  left: 50%;
  width: 100%;
  transform: translateX(-50%);
  z-index: 0;
}
.welcome-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 68%;
  background: linear-gradient(180deg, rgba(247, 251, 248, 0) 0%, rgba(247, 251, 248, 0.94) 78%);
  z-index: 1;
}
.welcome-body {
  position: relative;
  z-index: 2;
  padding: 0 36rpx 88rpx;
}
.xuxu-bubble {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  margin-bottom: 32rpx;
}
.xuxu-avatar {
  width: 92rpx;
  height: 92rpx;
  border: 4rpx solid #f4e3a0;
  border-radius: 50%;
  box-shadow: 0 8rpx 28rpx rgba(239, 214, 137, 0.45);
}
.bubble-content {
  flex: 1;
  padding: 24rpx 28rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(32rpx);
  box-shadow: 0 8rpx 32rpx rgba(46, 97, 64, 0.15);
}
.bubble-greeting {
  display: block;
  color: #2d6943;
  font-size: 30rpx;
  font-weight: 700;
  line-height: 1.4;
}
.bubble-role {
  display: block;
  margin-top: 6rpx;
  color: #6f8879;
  font-size: 25rpx;
  line-height: 1.5;
}
.welcome-message {
  margin-bottom: 36rpx;
}
.brand-name {
  display: block;
  margin-bottom: 12rpx;
  color: #5a9572;
  font-size: 28rpx;
  font-weight: 600;
  letter-spacing: 0.12em;
}
.brand-slogan {
  display: block;
  margin-bottom: 20rpx;
  color: #183425;
  font-size: 56rpx;
  font-weight: 800;
  line-height: 1.28;
  letter-spacing: -0.02em;
}
.brand-desc {
  display: block;
  color: #4a6853;
  font-size: 28rpx;
  line-height: 1.72;
}
.btn-large {
  width: 100%;
  height: 112rpx;
  border-radius: 999rpx;
  font-size: 36rpx;
  font-weight: 700;
  line-height: 112rpx;
}
.btn-primary {
  color: var(--hz-primary-ink);
  background: var(--hz-primary-soft);
  border: 2rpx solid var(--hz-primary-border);
  box-shadow: 0 12rpx 40rpx rgba(47, 124, 80, 0.2);
}
.legal-disclaimer {
  display: block;
  margin-top: 24rpx;
  color: #96a89d;
  font-size: 22rpx;
  line-height: 1.6;
  text-align: center;
}

/* === 步骤页 === */
.steps-container {
  display: flex;
  min-height: calc(100vh - var(--status-bar-height) - 88rpx);
  flex-direction: column;
  padding-top: 24rpx;
}
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 36rpx 24rpx;
}
.indicator-dots {
  display: flex;
  gap: 12rpx;
}
.dot {
  width: 36rpx;
  height: 10rpx;
  border-radius: 10rpx;
  background: #dfe9e1;
  transition: all 0.35s cubic-bezier(0.22, 0.8, 0.36, 1);
}
.dot.active {
  width: 72rpx;
  background: linear-gradient(90deg, #7fcc8f, #5f9e76);
}
.dot.completed {
  background: #b8d8c1;
}
.indicator-text {
  color: #6f8879;
  font-size: 25rpx;
  font-weight: 600;
}
.step-scroll {
  flex: 1;
  padding: 0 36rpx;
}
.step-content {
  padding: 44rpx 40rpx;
  border-radius: 32rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 48rpx rgba(46, 97, 64, 0.09);
}
.step-header {
  margin-bottom: 40rpx;
}
.step-title {
  display: block;
  margin-bottom: 12rpx;
  color: #183425;
  font-size: 52rpx;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: -0.02em;
}
.step-subtitle {
  display: block;
  color: #6f8879;
  font-size: 27rpx;
  line-height: 1.68;
}

/* 性别选择 */
.sex-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18rpx;
}
.sex-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 148rpx;
  padding: 28rpx 20rpx;
  border: 3rpx solid #e8f0e9;
  border-radius: 26rpx;
  background: #fafcfb;
  transition: all 0.28s cubic-bezier(0.22, 0.8, 0.36, 1);
}
.sex-card.selected {
  border-color: #9ec6ab;
  background: var(--hz-primary-soft);
  transform: translateY(-6rpx) scale(1.02);
  box-shadow: 0 16rpx 40rpx rgba(46, 125, 79, 0.18);
}
.sex-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  margin-bottom: 14rpx;
  border-radius: 50%;
  background: #f3f8f4;
  transition: all 0.28s ease;
}
.sex-card.selected .sex-icon-wrap {
  background: #fff;
}
.sex-icon {
  font-size: 40rpx;
  color: #5a9572;
}
.sex-label {
  color: #355b41;
  font-size: 27rpx;
  font-weight: 600;
}

/* 身高体重输入 */
.input-group {
  margin-bottom: 36rpx;
  padding: 32rpx 32rpx 28rpx;
  border-radius: 26rpx;
  background: #f9fcfa;
}
.input-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}
.input-label {
  color: #355b41;
  font-size: 30rpx;
  font-weight: 600;
}
.input-value-wrap {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.input-field {
  width: 180rpx;
  height: 80rpx;
  padding: 0 24rpx;
  border: 3rpx solid #e8f0e9;
  border-radius: 20rpx;
  background: #fff;
  font-size: 34rpx;
  font-weight: 600;
  text-align: right;
  transition: all 0.25s ease;
}
.input-field:focus {
  border-color: #b9d6c3;
  box-shadow: 0 6rpx 24rpx rgba(46, 97, 64, 0.12);
}
.input-unit {
  color: #6f8879;
  font-size: 29rpx;
}

/* BMI 可视化 */
.bmi-visual {
  margin-top: 48rpx;
  padding: 40rpx 36rpx;
  border-radius: 28rpx;
  background: linear-gradient(135deg, rgba(232, 247, 237, 0.8), rgba(225, 241, 230, 0.5));
}
.bmi-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32rpx;
}
.bmi-title {
  color: #4a6853;
  font-size: 28rpx;
  font-weight: 600;
}
.bmi-value-group {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.bmi-number {
  background: linear-gradient(135deg, #4a8f5e, #347c50);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 64rpx;
  font-weight: 900;
  line-height: 1;
}
.bmi-status {
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  font-weight: 700;
}
.bmi-status--underweight {
  color: #4a8fb7;
  background: #ddf2fb;
}
.bmi-status--normal {
  color: #3f7953;
  background: #e3f2e6;
}
.bmi-status--overweight {
  color: #c98640;
  background: #fff6e8;
}
.bmi-status--obese {
  color: #c86060;
  background: #ffe8e8;
}
.bmi-ruler {
  position: relative;
  margin-bottom: 16rpx;
}
.ruler-track {
  display: flex;
  height: 20rpx;
  border-radius: 20rpx;
  overflow: hidden;
}
.ruler-segment {
  flex: 1;
}
.segment-underweight {
  background: linear-gradient(90deg, #a8d5e2, #89c7da);
}
.segment-normal {
  background: linear-gradient(90deg, #7fcc8f, #6bbe7f);
}
.segment-overweight {
  background: linear-gradient(90deg, #f9c66b, #f7b84f);
}
.segment-obese {
  background: linear-gradient(90deg, #f28c8c, #ee7070);
}
.ruler-pointer {
  position: absolute;
  top: -14rpx;
  width: 0;
  height: 0;
  margin-left: -14rpx;
  border-left: 14rpx solid transparent;
  border-right: 14rpx solid transparent;
  border-top: 24rpx solid #2d6943;
  transition: left 0.5s cubic-bezier(0.22, 0.8, 0.36, 1);
}
.bmi-labels {
  display: flex;
  justify-content: space-around;
  margin-bottom: 16rpx;
}
.bmi-label-item {
  flex: 1;
  color: #8a9b90;
  font-size: 21rpx;
  text-align: center;
}
.bmi-hint {
  display: block;
  color: #96a89d;
  font-size: 22rpx;
  line-height: 1.6;
  text-align: center;
}

/* 生日选择 */
.date-picker-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 112rpx;
  padding: 0 36rpx;
  border: 3rpx solid #e8f0e9;
  border-radius: 26rpx;
  background: #fafcfb;
  transition: all 0.25s ease;
}
.date-picked {
  color: #183425;
  font-size: 34rpx;
  font-weight: 600;
}
.date-placeholder {
  color: #96a89d;
  font-size: 34rpx;
}
.date-arrow {
  width: 36rpx;
  height: 36rpx;
  opacity: 0.35;
}
.age-display {
  display: block;
  margin-top: 28rpx;
  color: #4a6853;
  font-size: 27rpx;
  text-align: center;
}

/* 健康目标 */
.goal-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  margin-bottom: 40rpx;
}
.goal-item {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  padding: 32rpx 28rpx;
  border: 3rpx solid #e8f0e9;
  border-radius: 26rpx;
  background: #fafcfb;
  text-align: left;
  transition: all 0.28s cubic-bezier(0.22, 0.8, 0.36, 1);
}
.goal-item.selected {
  border-color: #9ec6ab;
  background: var(--hz-primary-soft);
  transform: translateY(-4rpx);
  box-shadow: 0 12rpx 36rpx rgba(46, 125, 79, 0.16);
}
.goal-check-wrap {
  flex-shrink: 0;
  padding-top: 4rpx;
}
.goal-check {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44rpx;
  height: 44rpx;
  border: 3rpx solid #d4e2d7;
  border-radius: 50%;
  background: #fff;
  transition: all 0.28s ease;
}
.goal-check.checked {
  border-color: #79ac8c;
  background: #79ac8c;
}
.check-icon {
  width: 24rpx;
  height: 24rpx;
  filter: brightness(10);
}
.goal-text {
  flex: 1;
}
.goal-name {
  display: block;
  margin-bottom: 8rpx;
  color: #183425;
  font-size: 30rpx;
  font-weight: 700;
  line-height: 1.4;
}
.goal-detail {
  display: block;
  color: #6f8879;
  font-size: 24rpx;
  line-height: 1.6;
}

/* 档案预览 */
.profile-preview {
  padding: 32rpx 36rpx;
  border-radius: 24rpx;
  background: #f9fcfa;
}
.preview-title {
  display: block;
  margin-bottom: 20rpx;
  color: #5a9572;
  font-size: 24rpx;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.preview-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16rpx;
}
.preview-label {
  color: #6f8879;
  font-size: 27rpx;
}
.preview-value {
  color: #355b41;
  font-size: 27rpx;
  font-weight: 600;
}
.error-message {
  display: block;
  margin-top: 28rpx;
  padding: 24rpx 32rpx;
  border: 2rpx solid #fcd9cd;
  border-radius: 22rpx;
  color: #a85f4b;
  background: #fff8f5;
  font-size: 25rpx;
  line-height: 1.6;
}

/* 底部按钮 */
.step-footer {
  padding: 24rpx 36rpx 88rpx;
}
.btn-primary[disabled] {
  opacity: 0.4;
  filter: grayscale(0.5);
}
</style>
<style scoped>
/* Onboarding uses the same sage-and-cream action language as the rest of the app. */
.btn-primary { display:flex; align-items:center; justify-content:center; box-sizing:border-box; color:#fff; background:#71bd8f; border:2rpx solid #71bd8f; box-shadow:0 12rpx 34rpx rgba(90,168,119,.22); line-height:1; }
.btn-primary:active { background:#5fa97b; border-color:#5fa97b; }
.btn-primary[disabled] { color:#fff; background:#b9d7c2; border-color:#b9d7c2; }
.welcome-fullscreen .btn-primary { color:#52745f; background:#f7e9e5; border-color:#eccdc6; box-shadow:0 12rpx 34rpx rgba(198,145,132,.18); }
.welcome-fullscreen .btn-primary:active { background:#f0dcd7; border-color:#e4bcb2; }
</style>
