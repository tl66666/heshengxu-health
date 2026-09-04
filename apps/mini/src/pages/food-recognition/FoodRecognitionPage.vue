<template>
  <view class="page">
    <AppNavBar title="序序相机" route="/pages/food-recognition/FoodRecognitionPage" />
    
    <view class="camera-intro">
      <image
        class="camera-intro-art"
        src="/static/illustrations/home-companion-banner.png"
        mode="aspectFill"
      />
      <view class="camera-intro-copy">
        <text class="camera-kicker">序序相机</text>
        <text class="camera-title">拍下食物，先看热量再记录</text>
        <text class="camera-caption">结果需要你亲自确认，不会自动写入</text>
      </view>
    </view>

    <!-- 图片选择区域 -->
    <view v-if="!imagePath" class="image-picker card" @tap="chooseImage">
      <view class="picker-icon-wrap">
        <image class="picker-icon" src="/static/icons/svg/camera.svg" mode="aspectFit" />
      </view>
      <text class="picker-title">点击拍摄或选择照片</text>
      <text class="picker-hint">支持 JPG, PNG, WebP 格式</text>
    </view>

    <!-- 图片预览 -->
    <view v-else class="image-preview card">
      <image class="preview-img" :src="imagePath" mode="aspectFill" />
      <button class="replace-btn" @tap="chooseImage">
        <image class="replace-icon" src="/static/icons/svg/camera.svg" mode="aspectFit" />
        <text class="replace-text">重新选择</text>
      </button>
      <view v-if="imageSize" class="image-info">
        <text class="info-text">{{ formatFileSize(imageSize) }}</text>
      </view>
    </view>

    <!-- 同意条款 -->
    <view class="consent-section card">
      <checkbox-group @change="updateConsent">
        <label class="consent-label">
          <checkbox 
            value="agree" 
            :checked="hasConsent" 
            color="#2e7d4f"
            class="consent-checkbox"
          />
          <text class="consent-text">我已阅读并同意《食物识别使用协议》</text>
        </label>
      </checkbox-group>
      <text class="consent-note">识别结果需要你确认后才会保存到记录</text>
    </view>

    <!-- 使用提示 -->
    <view class="tips-section card">
      <text class="tips-title">拍摄技巧</text>
      <view class="tips-list">
        <view class="tip-item">
          <image class="tip-icon" src="/static/icons/svg/check.svg" mode="aspectFit" />
          <text class="tip-text">光线充足，避免阴影</text>
        </view>
        <view class="tip-item">
          <image class="tip-icon" src="/static/icons/svg/check.svg" mode="aspectFit" />
          <text class="tip-text">食物居中，距离适中</text>
        </view>
        <view class="tip-item">
          <image class="tip-icon" src="/static/icons/svg/check.svg" mode="aspectFit" />
          <text class="tip-text">避免手指遮挡</text>
        </view>
      </view>
    </view>

    <!-- 错误提示 -->
    <view v-if="error" class="error-banner">
      <image class="error-icon" src="/static/icons/svg/close.svg" mode="aspectFit" />
      <text class="error-text">{{ error }}</text>
    </view>

    <button v-if="error" class="manual-search" @tap="manualSearch">
      <image src="/static/icons/svg/search.svg" mode="aspectFit" />
      <text>改用食物库手动记录</text>
    </button>

    <!-- 识别按钮 -->
    <button 
      class="recognize-btn" 
      :class="{ 'disabled': !canRecognize || processing }"
      :disabled="!canRecognize || processing" 
      @tap="recognize"
    >
      <text class="btn-text">{{ processing ? '正在识别…' : '开始识别' }}</text>
    </button>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AppNavBar from '../../components/AppNavBar.vue';
import {
  analyzeFoodImage,
  canStartRecognition,
  grantFoodRecognitionConsent,
  imageContentType,
} from '../../features/food/food-recognition.js';
import type { MealType } from '../../features/food/food.types.js';

const imagePath = ref('');
const imageSize = ref(0);
const processing = ref(false);
const error = ref('');
const hasConsent = ref(false);
const mealType = ref<MealType>('lunch');

const canRecognize = computed(() => 
  canStartRecognition(imagePath.value, hasConsent.value)
);

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + 'B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
  return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
}

function chooseImage() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['camera', 'album'],
    success: ({ tempFilePaths, tempFiles }) => {
      imagePath.value = tempFilePaths[0] || '';
      const firstFile = Array.isArray(tempFiles) ? tempFiles[0] : tempFiles;
      imageSize.value = Number((firstFile as { size?: number } | undefined)?.size || 0);
      error.value = '';
    },
  });
}

function updateConsent(event: { detail: { value: string[] } }) {
  hasConsent.value = event.detail.value.includes('agree');
}

function manualSearch() {
  uni.navigateTo({ url: `/pages/food-search/FoodSearchPage?mealType=${mealType.value}` });
}

async function recognize() {
  if (!canRecognize.value) return;
  
  processing.value = true;
  error.value = '';
  
  try {
    await grantFoodRecognitionConsent();
    const contentType = imageContentType(imagePath.value);
    const imageBase64 = await readImageBase64(imagePath.value);
    const job = await analyzeFoodImage({ contentType, imageBase64 });
    
    uni.navigateTo({
      url: `/pages/food-candidates/FoodCandidatesPage?jobId=${encodeURIComponent(job.id)}&imagePath=${encodeURIComponent(imagePath.value)}&mealType=${mealType.value}`,
    });
  } catch (err) {
    error.value = '暂时无法识别，请检查网络或稍后重试';
    console.error('识别失败:', err);
  } finally {
    processing.value = false;
  }
}

function readImageBase64(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    uni.getFileSystemManager().readFile({
      filePath: path,
      encoding: 'base64',
      success: ({ data }) => resolve(String(data)),
      fail: reject,
    });
  });
}

onLoad((options) => {
  if (options?.mealType && ['breakfast', 'lunch', 'dinner', 'snack'].includes(options.mealType)) {
    mealType.value = options.mealType as MealType;
  }
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

.camera-intro {
  position: relative;
  min-height: 236rpx;
  margin-bottom: 32rpx;
  overflow: hidden;
  border: 1rpx solid rgba(111, 146, 119, 0.18);
  border-radius: 20rpx;
  background: #f8f6ed;
  animation: fadeIn 0.4s ease 0.1s backwards;
}
.camera-intro-art {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.camera-intro-copy {
  position: relative;
  z-index: 1;
  width: 54%;
  min-width: 250rpx;
  padding: 34rpx 0 30rpx 28rpx;
}
.camera-kicker,
.camera-title,
.camera-caption {
  display: block;
}
.camera-kicker {
  color: #66846f;
  font-size: 19rpx;
  font-weight: 700;
}
.camera-title {
  margin-top: 8rpx;
  color: #294a36;
  font-size: 30rpx;
  font-weight: 800;
  line-height: 1.35;
}
.camera-caption {
  margin-top: 10rpx;
  color: #748679;
  font-size: 19rpx;
  line-height: 1.5;
}

/* 图片选择器 */
.image-picker {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 48rpx;
  cursor: pointer;
  transition: transform 0.12s ease;
  animation: fadeIn 0.4s ease 0.2s backwards;
}

.image-picker:active {
  transform: scale(0.97);
}

.picker-icon-wrap {
  width: 240rpx;
  height: 240rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4rpx dashed #dce7db;
  border-radius: 50%;
  margin-bottom: 32rpx;
  animation: breathe 1.6s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
}

.picker-icon {
  width: 88rpx;
  height: 88rpx;
  opacity: 0.72;
}

.picker-title {
  font-size: 32rpx;
  font-weight: 800;
  color: #23382b;
  margin-bottom: 16rpx;
}

.picker-hint {
  font-size: 24rpx;
  font-weight: 600;
  color: #68796d;
}

/* 图片预览 */
.image-preview {
  position: relative;
  padding: 24rpx;
  animation: fadeIn 0.4s ease 0.2s backwards;
}

.preview-img {
  width: 100%;
  height: 600rpx;
  border-radius: 24rpx;
  object-fit: cover;
}

.replace-btn {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 32rpx;
  margin-top: 24rpx;
  border: none;
  background: #f2f7f1;
  border-radius: 28rpx;
  transition: transform 0.12s ease;
}

.replace-btn::after { border: none; }

.replace-btn:active {
  transform: scale(0.97);
}

.replace-icon {
  width: 28rpx;
  height: 28rpx;
}

.replace-text {
  font-size: 26rpx;
  font-weight: 800;
  color: #2e7d4f;
}

.image-info {
  margin-top: 16rpx;
  text-align: center;
}

.info-text {
  font-size: 20rpx;
  font-weight: 600;
  color: #68796d;
}

/* 同意条款 */
.consent-section {
  padding: 32rpx 28rpx;
  animation: fadeIn 0.4s ease 0.3s backwards;
}

.consent-label {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.consent-checkbox {
  margin-top: 4rpx;
  transform: scale(1.2);
}

.consent-text {
  flex: 1;
  font-size: 26rpx;
  font-weight: 600;
  color: #23382b;
  line-height: 1.5;
}

.consent-note {
  font-size: 20rpx;
  font-weight: 600;
  color: #68796d;
  line-height: 1.5;
  padding-left: 52rpx;
}

/* 使用提示 */
.tips-section {
  padding: 32rpx 28rpx;
  animation: fadeIn 0.4s ease 0.4s backwards;
}

.tips-title {
  font-size: 28rpx;
  font-weight: 800;
  color: #23382b;
  margin-bottom: 24rpx;
  display: block;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.tip-icon {
  width: 26rpx;
  height: 26rpx;
  flex-shrink: 0;
  opacity: 0.62;
}

.tip-text {
  font-size: 24rpx;
  font-weight: 600;
  color: #68796d;
  line-height: 1.5;
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
  animation: fadeIn 0.3s ease;
}

.error-icon {
  width: 28rpx;
  height: 28rpx;
  flex-shrink: 0;
  opacity: 0.65;
}

.error-text {
  flex: 1;
  font-size: 24rpx;
  font-weight: 600;
  color: #c08826;
  line-height: 1.5;
}

/* 识别按钮 */
.recognize-btn {
  width: 100%;
  padding: 28rpx;
  border: none;
  background: #2e7d4f;
  border-radius: 28rpx;
  box-shadow: 0 16rpx 40rpx rgba(46, 125, 79, 0.35);
  transition: all 0.12s ease;
  animation: fadeIn 0.4s ease 0.5s backwards;
}

.recognize-btn::after { border: none; }

.recognize-btn:active {
  transform: scale(0.97);
}

.recognize-btn.disabled {
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

.recognize-btn.disabled .btn-text {
  color: #9aaca0;
}
.manual-search {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  width: 100%;
  margin: 0 0 20rpx;
  padding: 20rpx;
  border: 1rpx solid #cfded1;
  border-radius: 16rpx;
  background: #fff;
  color: #3c6f50;
  font-size: 24rpx;
}
.manual-search::after {
  border: none;
}
.manual-search image {
  width: 28rpx;
  height: 28rpx;
  opacity: 0.65;
}
</style>
