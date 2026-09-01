<template>
  <view class="page">
    <AppNavBar title="识别结果" route="/pages/food-candidates/FoodCandidatesPage" />

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-state">
      <image class="loading-icon" src="/static/icons/svg/search.svg" mode="aspectFit" />
      <text class="loading-text">正在整理候选食物…</text>
    </view>

    <template v-else-if="job">
      <!-- 图片预览 -->
      <view v-if="imagePath" class="image-preview card">
        <image class="preview-img" :src="imagePath" mode="aspectFill" />
        <view class="success-badge">
          <text class="badge-icon">✓</text>
          <text class="badge-text">识别成功</text>
        </view>
      </view>

      <!-- 失败状态 -->
      <view v-if="job.status === 'failed'" class="failure-state card">
        <view class="failure-icon" />
        <text class="failure-title">这次识别没有完成</text>
        <text class="failure-desc"
          >图片不会自动记入饮食记录，你可以重新拍摄，或改用食物目录手动记录。</text
        >
        <view class="action-btns">
          <button class="retry-btn" @tap="retry">重新拍摄</button>
          <button class="manual-btn" @tap="manualRecord">手动记录</button>
        </view>
      </view>

      <!-- 无结果状态 -->
      <view v-else-if="!job.candidates.length" class="empty-state card">
        <image class="empty-icon" src="/static/icons/svg/search.svg" mode="aspectFit" />
        <text class="empty-title">还没有找到可确认的食物</text>
        <text class="empty-desc">试试换一张更清晰的照片</text>
        <view class="action-btns">
          <button class="retry-btn" @tap="retry">换一张照片</button>
          <button class="manual-btn" @tap="manualRecord">手动记录</button>
        </view>
      </view>

      <!-- 候选列表 -->
      <template v-else>
        <view class="section-title">
          <text class="title-text">找到 {{ job.candidates.length }} 个候选</text>
          <text class="title-hint">请选择最匹配的食物</text>
        </view>

        <view class="candidates-list">
          <button
            v-for="candidate in job.candidates"
            :key="candidate.id"
            :class="['candidate-card', 'card', { selected: candidate.id === candidateId }]"
            @tap="select(candidate)"
          >
            <view class="candidate-icon">
              <image class="icon-image" src="/static/icons/svg/food-staple.svg" mode="aspectFit" />
            </view>
            <view class="candidate-copy">
              <text class="candidate-name">{{ candidate.name }}</text>
              <view class="candidate-meta">
                <view class="confidence-badge">
                  <text class="confidence-text">{{ Math.round(candidate.confidence * 100) }}%</text>
                </view>
                <text class="estimate-text">估算 {{ candidate.estimatedGrams }}g</text>
              </view>
              <view v-if="candidate.estimatedEnergyKcal != null" class="nutrition-row">
                <text class="nutrition-pill energy"
                  >{{ Math.round(candidate.estimatedEnergyKcal) }} kcal</text
                >
                <text v-if="candidate.estimatedProteinG != null" class="nutrition-pill protein"
                  >蛋白质 {{ formatOptional(candidate.estimatedProteinG) }}g</text
                >
                <text v-if="candidate.estimatedFatG != null" class="nutrition-pill fat"
                  >脂肪 {{ formatOptional(candidate.estimatedFatG) }}g</text
                >
                <text v-if="candidate.estimatedCarbohydrateG != null" class="nutrition-pill carb"
                  >碳水 {{ formatOptional(candidate.estimatedCarbohydrateG) }}g</text
                >
              </view>
            </view>
            <view v-if="candidate.id === candidateId" class="check-icon">
              <text>✓</text>
            </view>
          </button>
        </view>

        <!-- 输入面板 -->
        <view class="input-panel card">
          <view class="input-section">
            <text class="input-label">实际吃了多少？</text>
            <view class="gram-input">
              <input v-model="grams" type="digit" placeholder="输入克数" class="gram-field" />
              <text class="gram-unit">克</text>
            </view>
          </view>

          <view class="meal-section">
            <text class="input-label">这是什么时候吃的？</text>
            <view class="meal-options">
              <button
                v-for="item in meals"
                :key="item.value"
                :class="['meal-option', { selected: mealType === item.value }]"
                @tap="mealType = item.value"
              >
                {{ item.label }}
              </button>
            </view>
          </view>
        </view>

        <!-- 错误提示 -->
        <view v-if="error" class="error-banner">
          <view class="error-icon" />
          <text class="error-text">{{ error }}</text>
        </view>

        <!-- 确认按钮 -->
        <button
          class="confirm-btn"
          :class="{ disabled: saving || !candidateId }"
          :disabled="saving || !candidateId"
          @tap="confirm"
        >
          <text class="btn-text">{{ saving ? '保存中…' : '确认并保存' }}</text>
        </button>
      </template>
    </template>

    <!-- 加载失败 -->
    <view v-else class="error-state card">
      <view class="error-icon" />
      <text class="error-title">识别结果加载失败</text>
      <button class="retry-btn" @tap="back">返回重试</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AppNavBar from '../../components/AppNavBar.vue';
import {
  confirmRecognition,
  defaultRecognitionCandidateId,
  loadRecognitionJob,
  type RecognitionCandidate,
  type RecognitionJob,
} from '../../features/food/food-recognition.js';
import type { MealType } from '../../features/food/food.types.js';

const loading = ref(true);
const job = ref<RecognitionJob | null>(null);
const imagePath = ref('');
const candidateId = ref('');
const grams = ref('');
const mealType = ref<MealType>('lunch');
const saving = ref(false);
const error = ref('');

const meals: Array<{ value: MealType; label: string }> = [
  { value: 'breakfast', label: '早餐' },
  { value: 'lunch', label: '午餐' },
  { value: 'dinner', label: '晚餐' },
  { value: 'snack', label: '加餐' },
];

function select(candidate: RecognitionCandidate) {
  candidateId.value = candidate.id;
  grams.value = String(candidate.estimatedGrams);
}

function formatOptional(value?: number) {
  return value == null ? '--' : value.toFixed(1);
}

async function load(jobId: string) {
  loading.value = true;
  try {
    job.value = await loadRecognitionJob(jobId);
    candidateId.value = defaultRecognitionCandidateId(job.value.candidates);
    const first = job.value.candidates.find((item) => item.id === candidateId.value);
    grams.value = String(first?.estimatedGrams || '');
  } catch {
    job.value = null;
  } finally {
    loading.value = false;
  }
}

async function confirm() {
  if (!candidateId.value || Number(grams.value) <= 0) {
    error.value = '请输入大于 0 克的份量';
    return;
  }

  saving.value = true;
  error.value = '';

  try {
    await confirmRecognition({
      candidateId: candidateId.value,
      mealType: mealType.value,
      grams: Number(grams.value),
      recordedAt: new Date().toISOString(),
    });

    uni.showToast({ title: '已记录这份食物', icon: 'success' });
    setTimeout(() => uni.navigateBack({ delta: 2 }), 450);
  } catch {
    error.value = '保存失败，请检查网络连接';
  } finally {
    saving.value = false;
  }
}

function back() {
  uni.navigateBack();
}

function retry() {
  uni.redirectTo({ url: '/pages/food-recognition/FoodRecognitionPage' });
}

function manualRecord() {
  uni.redirectTo({ url: '/pages/food-search/FoodSearchPage' });
}

onLoad((options) => {
  imagePath.value = options?.imagePath ? decodeURIComponent(options.imagePath) : '';
  const jobId = options?.jobId ? decodeURIComponent(options.jobId) : '';
  if (jobId) load(jobId);
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 28rpx 48rpx 140rpx;
  background: #f2f7f1;
  animation: fadeIn 0.28s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 通用卡片 */
.card {
  background: #ffffff;
  border-radius: 36rpx;
  box-shadow: 0 12rpx 40rpx rgba(46, 125, 79, 0.08);
  margin-bottom: 28rpx;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 48rpx;
}

.loading-icon {
  font-size: 96rpx;
  margin-bottom: 32rpx;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #68796d;
}

/* 图片预览 */
.image-preview {
  position: relative;
  padding: 24rpx;
  animation: fadeIn 0.4s ease 0.1s backwards;
}

.preview-img {
  width: 100%;
  height: 360rpx;
  border-radius: 24rpx;
  object-fit: cover;
}

.success-badge {
  position: absolute;
  top: 48rpx;
  right: 48rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  background: rgba(46, 125, 79, 0.95);
  border-radius: 99rpx;
  backdrop-filter: blur(10rpx);
}

.badge-icon {
  font-size: 24rpx;
  color: #ffffff;
}

.badge-text {
  font-size: 22rpx;
  font-weight: 800;
  color: #ffffff;
}

/* 失败/空状态 */
.failure-state,
.empty-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 48rpx;
  text-align: center;
}

.failure-icon,
.empty-icon,
.error-icon {
  font-size: 96rpx;
  margin-bottom: 24rpx;
}

.failure-title,
.empty-title,
.error-title {
  font-size: 32rpx;
  font-weight: 800;
  color: #23382b;
  margin-bottom: 16rpx;
}

.failure-desc,
.empty-desc {
  font-size: 24rpx;
  font-weight: 600;
  color: #68796d;
  line-height: 1.6;
  margin-bottom: 32rpx;
}

.action-btns {
  display: flex;
  gap: 16rpx;
  width: 100%;
}

.retry-btn,
.manual-btn {
  flex: 1;
  padding: 24rpx;
  border: none;
  border-radius: 28rpx;
  font-size: 26rpx;
  font-weight: 800;
  transition: transform 0.12s ease;
}

.retry-btn {
  background: #2e7d4f;
  color: #ffffff;
}

.manual-btn {
  background: #f2f7f1;
  color: #2e7d4f;
}

.retry-btn::after,
.manual-btn::after {
  border: none;
}

.retry-btn:active,
.manual-btn:active {
  transform: scale(0.97);
}

/* 标题区域 */
.section-title {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-bottom: 24rpx;
  animation: fadeIn 0.4s ease 0.2s backwards;
}

.title-text {
  font-size: 34rpx;
  font-weight: 800;
  color: #23382b;
}

.title-hint {
  font-size: 24rpx;
  font-weight: 600;
  color: #68796d;
}

/* 候选列表 */
.candidates-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 28rpx;
}

.candidate-card {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 28rpx;
  border: 3rpx solid transparent;
  transition: all 0.12s ease;
  animation: fadeIn 0.4s ease backwards;
}

.candidate-card:nth-child(1) {
  animation-delay: 0.25s;
}
.candidate-card:nth-child(2) {
  animation-delay: 0.3s;
}
.candidate-card:nth-child(3) {
  animation-delay: 0.35s;
}

.candidate-card::after {
  border: none;
}

.candidate-card:active {
  transform: scale(0.97);
}

.candidate-card.selected {
  border-color: #2e7d4f;
  background: #e8f2ea;
}

.candidate-icon {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f2f7f1;
  border-radius: 50%;
  flex-shrink: 0;
}

.candidate-card.selected .candidate-icon {
  background: rgba(46, 125, 79, 0.12);
}

.icon-text {
  font-size: 36rpx;
  font-weight: 800;
  color: #2e7d4f;
}

.candidate-copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.candidate-name {
  font-size: 30rpx;
  font-weight: 800;
  color: #23382b;
}

.candidate-meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.confidence-badge {
  padding: 6rpx 16rpx;
  background: rgba(46, 125, 79, 0.12);
  border-radius: 99rpx;
}

.confidence-text {
  font-size: 20rpx;
  font-weight: 800;
  color: #2e7d4f;
}

.estimate-text {
  font-size: 22rpx;
  font-weight: 600;
  color: #68796d;
}

.nutrition-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.nutrition-pill {
  padding: 6rpx 12rpx;
  border-radius: 12rpx;
  font-size: 20rpx;
  font-weight: 700;
}

.nutrition-pill.energy {
  color: #a76536;
  background: #fff1e5;
}

.nutrition-pill.protein {
  color: #4f6f87;
  background: #eaf3f9;
}

.nutrition-pill.fat {
  color: #8b6e43;
  background: #f8f0df;
}

.nutrition-pill.carb {
  color: #6a5c8c;
  background: #f1ecfb;
}

.check-icon {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2e7d4f;
  border-radius: 50%;
  font-size: 28rpx;
  color: #ffffff;
  flex-shrink: 0;
}

/* 输入面板 */
.input-panel {
  padding: 32rpx 28rpx;
  animation: fadeIn 0.4s ease 0.4s backwards;
}

.input-section,
.meal-section {
  margin-bottom: 32rpx;
}

.meal-section {
  margin-bottom: 0;
}

.input-label {
  display: block;
  font-size: 26rpx;
  font-weight: 800;
  color: #23382b;
  margin-bottom: 16rpx;
}

.gram-input {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 24rpx;
  background: #f2f7f1;
  border-radius: 28rpx;
}

.gram-field {
  flex: 1;
  font-size: 32rpx;
  font-weight: 800;
  color: #23382b;
}

.gram-unit {
  font-size: 28rpx;
  font-weight: 700;
  color: #68796d;
}

.meal-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12rpx;
}

.meal-option {
  padding: 20rpx 8rpx;
  border: 3rpx solid #f2f7f1;
  background: #ffffff;
  border-radius: 28rpx;
  font-size: 24rpx;
  font-weight: 800;
  color: #68796d;
  transition: all 0.12s ease;
}

.meal-option::after {
  border: none;
}

.meal-option.selected {
  border-color: #2e7d4f;
  background: #e8f2ea;
  color: #2e7d4f;
}

/* 错误提示 */
.error-banner {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx 28rpx;
  background: rgba(224, 169, 62, 0.12);
  border-radius: 24rpx;
  margin-bottom: 28rpx;
}

.error-text {
  flex: 1;
  font-size: 24rpx;
  font-weight: 600;
  color: #c08826;
}

/* 确认按钮 */
.confirm-btn {
  width: 100%;
  padding: 28rpx;
  border: none;
  background: #2e7d4f;
  border-radius: 28rpx;
  box-shadow: 0 16rpx 40rpx rgba(46, 125, 79, 0.35);
  transition: all 0.12s ease;
  animation: fadeIn 0.4s ease 0.5s backwards;
}

.confirm-btn::after {
  border: none;
}

.confirm-btn:active {
  transform: scale(0.97);
}

.confirm-btn.disabled {
  background: #dce7db;
  box-shadow: none;
  transform: none;
}

.btn-text {
  font-size: 32rpx;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 1rpx;
}

.confirm-btn.disabled .btn-text {
  color: #9aaca0;
}
</style>
