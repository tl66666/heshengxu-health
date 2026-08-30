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
          <image class="badge-icon" src="/static/icons/svg/check.svg" mode="aspectFit" />
          <text class="badge-text">识别成功</text>
        </view>
      </view>

      <!-- 失败状态 -->
      <view v-if="job.status === 'failed'" class="failure-state card">
        <image class="state-art" src="/static/illustrations/xuxu-ai-empty.png" mode="aspectFit" />
        <text class="failure-title">这次识别没有完成</text>
        <text class="failure-desc">图片不会自动记入饮食记录，你可以重新拍摄，或改用食物目录手动记录。</text>
        <view class="action-btns">
          <button class="retry-btn" @tap="retry">重新拍摄</button>
          <button class="manual-btn" @tap="manualRecord">手动记录</button>
        </view>
      </view>

      <!-- 无结果状态 -->
      <view v-else-if="!job.candidates.length" class="empty-state card">
        <image class="state-art" src="/static/illustrations/xuxu-ai-empty.png" mode="aspectFit" />
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
            :class="['candidate-card', 'card', { 'selected': candidate.id === candidateId }]"
            @tap="select(candidate)"
          >
            <view class="candidate-icon">
              <text class="icon-text">{{ candidate.name.slice(0, 1) }}</text>
            </view>
            <view class="candidate-copy">
              <text class="candidate-name">{{ candidate.name }}</text>
              <view class="candidate-meta">
                <view class="confidence-badge">
                  <text class="confidence-text">{{ Math.round(candidate.confidence * 100) }}%</text>
                </view>
                <text class="estimate-text">估算 {{ candidate.estimatedGrams }}g</text>
              </view>
            </view>
            <view v-if="candidate.id === candidateId" class="check-icon">
              <image src="/static/icons/svg/check.svg" mode="aspectFit" />
            </view>
          </button>
        </view>

        <view class="selection-note">
          <text v-if="!candidateId">请选择最接近照片的食物，再继续确认份量</text>
          <text v-else-if="!selectedCandidate?.foodId">这个候选还没有营养数据，请改用手动搜索</text>
          <text v-else>下一步可调整份量和餐次，不会自动写入记录</text>
        </view>

        <!-- 错误提示 -->
        <view v-if="error" class="error-banner">
          <image class="error-icon" src="/static/icons/svg/close.svg" mode="aspectFit" />
          <text class="error-text">{{ error }}</text>
        </view>

        <!-- 确认按钮 -->
        <button 
          class="confirm-btn" 
          :class="{ 'disabled': !canContinue }"
          :disabled="!canContinue"
          @tap="continueToConfirm"
        >
          <text class="btn-text">继续确认</text>
        </button>
      </template>
    </template>

    <!-- 加载失败 -->
    <view v-else class="error-state card">
      <image class="state-art" src="/static/illustrations/xuxu-ai-empty.png" mode="aspectFit" />
      <text class="error-title">识别结果加载失败</text>
      <button class="retry-btn" @tap="back">返回重试</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AppNavBar from '../../components/AppNavBar.vue';
import {
  loadRecognitionJob,
  type RecognitionCandidate,
  type RecognitionJob,
} from '../../features/food/food-recognition.js';
import type { MealType } from '../../features/food/food.types.js';

const loading = ref(true);
const job = ref<RecognitionJob | null>(null);
const imagePath = ref('');
const candidateId = ref('');
const mealType = ref<MealType>('lunch');
const error = ref('');
const selectedCandidate = computed(() =>
  job.value?.candidates.find((candidate) => candidate.id === candidateId.value),
);
const canContinue = computed(() => Boolean(selectedCandidate.value?.foodId));

function select(candidate: RecognitionCandidate) {
  candidateId.value = candidate.id;
  error.value = '';
}

async function load(jobId: string) {
  loading.value = true;
  try {
    job.value = await loadRecognitionJob(jobId);
    candidateId.value = '';
  } catch {
    job.value = null;
  } finally {
    loading.value = false;
  }
}

function continueToConfirm() {
  const candidate = selectedCandidate.value;
  if (!candidate?.foodId) {
    error.value = '请选择有营养数据的候选食物';
    return;
  }
  uni.navigateTo({
    url: `/pages/food-confirm/FoodConfirmPage?foodId=${encodeURIComponent(candidate.foodId)}&candidateId=${encodeURIComponent(candidate.id)}&source=photo&grams=${candidate.estimatedGrams}&mealType=${mealType.value}&imagePath=${encodeURIComponent(imagePath.value)}`,
  });
}

function back() {
  uni.navigateBack();
}

function retry() {
  uni.redirectTo({
    url: `/pages/food-recognition/FoodRecognitionPage?mealType=${mealType.value}`,
  });
}

function manualRecord() {
  uni.redirectTo({ url: `/pages/food-search/FoodSearchPage?mealType=${mealType.value}` });
}

onLoad((options) => {
  if (options?.mealType && ['breakfast', 'lunch', 'dinner', 'snack'].includes(options.mealType)) {
    mealType.value = options.mealType as MealType;
  }
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
  width: 72rpx;
  height: 72rpx;
  margin-bottom: 32rpx;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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
  width: 24rpx;
  height: 24rpx;
  filter: brightness(0) invert(1);
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

.state-art {
  width: 180rpx;
  height: 150rpx;
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

.candidate-card:nth-child(1) { animation-delay: 0.25s; }
.candidate-card:nth-child(2) { animation-delay: 0.3s; }
.candidate-card:nth-child(3) { animation-delay: 0.35s; }

.candidate-card::after { border: none; }

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
  min-width: 0;
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

.check-icon {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2e7d4f;
  border-radius: 50%;
  flex-shrink: 0;
}
.check-icon image {
  width: 24rpx;
  height: 24rpx;
  filter: brightness(0) invert(1);
}

.selection-note {
  margin: 8rpx 0 24rpx;
  color: #718579;
  font-size: 22rpx;
  line-height: 1.55;
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
.error-icon {
  width: 28rpx;
  height: 28rpx;
  flex: none;
  opacity: 0.65;
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

.confirm-btn::after { border: none; }

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
