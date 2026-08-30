<template>
  <view class="page">
    <AppNavBar title="喝水量推荐" route="/pages/water-goal/WaterGoalPage" />

    <view class="intro">
      <text class="eyebrow">个性化推荐</text>
      <text class="title">你每天需要喝多少水</text>
      <text class="subtitle">根据性别、体重和活动量科学计算</text>
    </view>

    <!-- 表单 -->
    <view class="form-section">
      <view class="form-item" @tap="selectGender">
        <text class="form-label">性别</text>
        <text class="form-value">{{ genderLabel }}</text>
        <image class="form-arrow" src="/static/icons/svg/back.svg" mode="aspectFit" />
      </view>

      <view class="form-item" @tap="selectWeight">
        <text class="form-label">体重</text>
        <text class="form-value">{{ weight }}公斤</text>
        <image class="form-arrow" src="/static/icons/svg/back.svg" mode="aspectFit" />
      </view>

      <view class="form-item" @tap="selectActivity">
        <text class="form-label">活动量</text>
        <text class="form-value">{{ activityLabel }}</text>
        <image class="form-arrow" src="/static/icons/svg/back.svg" mode="aspectFit" />
      </view>
      <view class="form-item custom-goal-item" @tap="selectCustomGoal">
        <view class="custom-goal-copy"><text class="form-label">每日目标</text><text class="form-hint">可按自己的节奏微调</text></view>
        <text class="form-value">{{ customGoal ? `${customGoal}ml` : '使用推荐值' }}</text>
        <image class="form-arrow" src="/static/icons/svg/back.svg" mode="aspectFit" />
      </view>
    </view>

    <!-- 推荐结果 -->
    <view class="result-card card">
      <view class="result-header">
        <text class="result-icon">💧</text>
        <text class="result-title">推荐饮水量</text>
      </view>
      <text class="result-value">{{ selectedDailyGoal }}</text>
      <text class="result-unit">ml/天</text>
      <text class="result-hint">约 {{ cupsCount }} 杯水（每杯200ml）</text>
    </view>

    <!-- 说明 */
    <view class="tips-card card">
      <view class="tips-header">
        <text class="tips-icon">💡</text>
        <text class="tips-title">计算说明</text>
      </view>
      <view class="tips-list">
        <text class="tip-item">• 基础需水量 = 体重(kg) × 30ml</text>
        <text class="tip-item">• 轻度活动额外增加 300ml</text>
        <text class="tip-item">• 中度活动额外增加 500ml</text>
        <text class="tip-item">• 重度活动额外增加 800ml</text>
        <text class="tip-item">• 建议分多次饮用，避免一次大量饮水</text>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-actions">
      <button class="action-btn" @tap="saveGoal">
        <text>获取推荐喝水量</text>
      </button>
    </view>

    <!-- 性别选择器 -->
    <picker 
      v-if="false"
      mode="selector" 
      :range="genderOptions"
      :range-key="'label'"
      :value="genderIndex"
      @change="onGenderChange"
    >
    </picker>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AppNavBar from '../../components/AppNavBar.vue';
import { navigateBack } from '../../utils/router.js';

const gender = ref<'male' | 'female'>('male');
const weight = ref(75);
const activity = ref<'none' | 'light' | 'moderate' | 'heavy'>('none');
const customGoal = ref<number | null>(null);

const genderOptions = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
];

const activityOptions = [
  { value: 'none', label: '无运动习惯', extra: 0 },
  { value: 'light', label: '轻度活动（每周1-2次）', extra: 300 },
  { value: 'moderate', label: '中度活动（每周3-4次）', extra: 500 },
  { value: 'heavy', label: '重度活动（每周5+次）', extra: 800 },
];

const genderIndex = computed(() => {
  return genderOptions.findIndex(o => o.value === gender.value);
});

const genderLabel = computed(() => {
  return genderOptions[genderIndex.value]?.label || '男';
});

const activityLabel = computed(() => {
  return activityOptions.find(o => o.value === activity.value)?.label || '无运动习惯';
});

// 计算推荐量
const recommendedAmount = computed(() => {
  // 基础需水量：体重(kg) × 30ml
  const base = weight.value * 30;
  
  // 活动量额外需水量
  const activityExtra = activityOptions.find(o => o.value === activity.value)?.extra || 0;
  
  // 总量（四舍五入到最近的100）
  const total = base + activityExtra;
  return Math.round(total / 100) * 100;
});

const selectedDailyGoal = computed(() => customGoal.value || recommendedAmount.value);
const cupsCount = computed(() => Math.ceil(selectedDailyGoal.value / 200));

function selectGender() {
  uni.showActionSheet({
    itemList: genderOptions.map(o => o.label),
    success: (res) => {
      const option = genderOptions[res.tapIndex];
      if (option) gender.value = option.value as 'male' | 'female';
    },
  });
}

function selectWeight() {
  uni.showModal({
    title: '输入体重',
    editable: true,
    placeholderText: '请输入体重（公斤）',
    success: (res) => {
      if (res.confirm && res.content) {
        const w = parseFloat(res.content);
        if (!isNaN(w) && w > 0 && w < 300) {
          weight.value = w;
        }
      }
    },
  });
}

function selectActivity() {
  uni.showActionSheet({
    itemList: activityOptions.map(o => o.label),
    success: (res) => {
      const option = activityOptions[res.tapIndex];
      if (option) activity.value = option.value as 'none' | 'light' | 'moderate' | 'heavy';
    },
  });
}

function selectCustomGoal() {
  uni.showModal({
    title: '调整每日目标',
    editable: true,
    content: String(customGoal.value || recommendedAmount.value),
    placeholderText: '输入 500-6000ml',
    success: (res) => {
      if (!res.confirm || !res.content) return;
      const amount = Math.round(Number(res.content) / 50) * 50;
      if (Number.isFinite(amount) && amount >= 500 && amount <= 6000) customGoal.value = amount;
      else uni.showToast({ title: '请输入 500-6000ml', icon: 'none' });
    },
  });
}

function onGenderChange(e: any) {
  const option = genderOptions[e.detail.value];
  if (option) gender.value = option.value as 'male' | 'female';
}

function saveGoal() {
  try {
    // 保存目标
    uni.setStorageSync('water_daily_goal', selectedDailyGoal.value.toString());
    if (customGoal.value) uni.setStorageSync('water_daily_goal_custom', String(customGoal.value));
    else uni.removeStorageSync('water_daily_goal_custom');
    
    // 保存用户信息
    uni.setStorageSync('water_user_info', JSON.stringify({
      gender: gender.value,
      weight: weight.value,
      activity: activity.value,
    }));
    
    uni.showToast({
      title: '设置成功',
      icon: 'success',
    });
    
    setTimeout(() => {
      navigateBack();
    }, 1500);
  } catch (e) {
    console.error('保存失败:', e);
    uni.showToast({
      title: '保存失败',
      icon: 'error',
    });
  }
}

onLoad(() => {
  // 加载用户信息
  try {
    const userInfo = uni.getStorageSync('water_user_info');
    if (userInfo) {
      const data = JSON.parse(userInfo);
      gender.value = data.gender || 'male';
      weight.value = data.weight || 75;
      activity.value = data.activity || 'none';
    }
    const savedCustomGoal = Number(uni.getStorageSync('water_daily_goal_custom'));
    customGoal.value = Number.isFinite(savedCustomGoal) && savedCustomGoal > 0 ? savedCustomGoal : null;
  } catch (e) {
    console.error('加载用户信息失败:', e);
  }
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding-bottom: 140rpx;
  background: linear-gradient(180deg, #f8fdf9 0%, #f5f8f6 100%);
}

.intro {
  padding: 20rpx 32rpx 32rpx;
}

.eyebrow {
  display: block;
  color: #72927b;
  font-size: 21rpx;
  font-weight: 700;
  margin-bottom: 6rpx;
}

.title {
  display: block;
  color: #244735;
  font-size: 39rpx;
  font-weight: 700;
  margin-top: 6rpx;
}

.subtitle {
  display: block;
  color: #829587;
  font-size: 21rpx;
  margin-top: 8rpx;
  line-height: 1.5;
}

.form-section {
  margin: 0 32rpx 24rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 2rpx 12rpx rgba(127, 204, 143, 0.08);
  overflow: hidden;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #e8f3ea;
}

.form-item:last-child {
  border-bottom: none;
}

.form-label {
  color: #5c7a67;
  font-size: 26rpx;
  font-weight: 600;
}

.form-value {
  flex: 1;
  text-align: right;
  color: #244735;
  font-size: 26rpx;
  font-weight: 600;
  margin-right: 12rpx;
}

.form-arrow {
  width: 24rpx;
  height: 24rpx;
  transform: rotate(180deg);
  opacity: 0.5;
}

.card {
  margin: 0 32rpx 16rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 2rpx 12rpx rgba(127, 204, 143, 0.08);
}

.result-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 24rpx;
  background: linear-gradient(135deg, #e8f3ea 0%, #d4e5d4 100%);
}

.result-header {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 24rpx;
}

.result-icon {
  font-size: 32rpx;
}

.result-title {
  color: #2d6943;
  font-size: 24rpx;
  font-weight: 700;
}

.result-value {
  color: #244735;
  font-size: 88rpx;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 8rpx;
}

.result-unit {
  color: #5c7a67;
  font-size: 28rpx;
  font-weight: 600;
  margin-bottom: 16rpx;
}

.result-hint {
  color: #76907d;
  font-size: 22rpx;
}

.tips-card {
}

.tips-header {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 16rpx;
}

.tips-icon {
  font-size: 28rpx;
}

.tips-title {
  color: #2d6943;
  font-size: 24rpx;
  font-weight: 700;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.tip-item {
  color: #5c7a67;
  font-size: 22rpx;
  line-height: 1.6;
}

.bottom-actions {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16rpx 32rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10rpx);
  border-top: 1rpx solid #e8f3ea;
  box-shadow: 0 -4rpx 12rpx rgba(127, 204, 143, 0.05);
}

.action-btn {
  width: 100%;
  padding: 24rpx;
  border: none;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #94c5e8 0%, #7ab2d8 100%);
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 700;
  box-shadow: 0 4rpx 16rpx rgba(148, 197, 232, 0.3);
}

.action-btn::after {
  border: none;
}
</style>
<style scoped>
.page { background: #fff8f2; color: #554b4f; }
.intro { padding: 26rpx 30rpx 30rpx; }.eyebrow { color: #789c8d; }.title { color: #564d51; }.subtitle { color: #9b8e8d; }
.form-section, .result-card, .tips-card { border: 1rpx solid rgba(255, 255, 255, .9); border-radius: 18rpx; background: rgba(255, 253, 251, .82); box-shadow: 0 12rpx 28rpx rgba(126, 104, 94, .07), inset 0 1rpx 0 rgba(255, 255, 255, .95); backdrop-filter: blur(18px); }
.form-item { border-color: #f1e5df; }.form-label { color: #65595d; }.form-value { color: #9b8e8d; }.custom-goal-copy { display: flex; flex: 1; flex-direction: column; gap: 5rpx; }.form-hint { color: #b1a3a1; font-size: 18rpx; }
.result-title, .tips-title { color: #62575b; }.result-value { color: #649889; }.result-unit, .result-hint, .tip-item { color: #9d8f8e; }
.action-btn { border-radius: 42rpx; background: #78b8c7; box-shadow: 0 12rpx 26rpx rgba(94, 157, 176, .2); }
</style>
