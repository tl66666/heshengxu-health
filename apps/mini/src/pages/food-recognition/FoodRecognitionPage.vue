<template>
  <view class="page">
    <AppNavBar title="序序相机" route="/pages/food-recognition/FoodRecognitionPage" />
    
    <!-- 序序引导气泡 -->
    <view class="xuxu-bubble">
      <image class="xuxu-avatar" src="/static/illustrations/xuxu-avatar.png" mode="aspectFit" />
      <view class="bubble-content">
        <text class="bubble-text">拍一拍，我来帮你识别食物的营养～</text>
      </view>
    </view>

    <!-- 图片选择区域 -->
    <view v-if="!imagePath" class="image-picker card" @tap="chooseImage">
      <view class="picker-icon-wrap">
        <image class="picker-icon" src="/static/icons/camera.jpg" mode="aspectFit" />
      </view>
      <text class="picker-title">点击拍摄或选择照片</text>
      <text class="picker-hint">支持 JPG, PNG, WebP 格式</text>
    </view>

    <!-- 图片预览 -->
    <view v-else class="image-preview card">
      <image class="preview-img" :src="imagePath" mode="aspectFill" />
      <button class="replace-btn" @tap="chooseImage">
        <text class="replace-icon">🔄</text>
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
          <text class="tip-icon">💡</text>
          <text class="tip-text">光线充足，避免阴影</text>
        </view>
        <view class="tip-item">
          <text class="tip-icon">📸</text>
          <text class="tip-text">食物居中，距离适中</text>
        </view>
        <view class="tip-item">
          <text class="tip-icon">✨</text>
          <text class="tip-text">避免手指遮挡</text>
        </view>
      </view>
    </view>

    <!-- 错误提示 -->
    <view v-if="error" class="error-banner">
      <text class="error-icon">⚠️</text>
      <text class="error-text">{{ error }}</text>
    </view>

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
import AppNavBar from '../../components/AppNavBar.vue';
import {
  canStartRecognition,
  completeRecognitionUpload,
  createRecognitionUpload,
  createRecognitionJob,
  grantFoodRecognitionConsent,
  imageContentType,
} from '../../features/food/food-recognition.js';

const imagePath = ref('');
const imageSize = ref(0);
const processing = ref(false);
const error = ref('');
const hasConsent = ref(false);

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

async function recognize() {
  if (!canRecognize.value) return;
  
  processing.value = true;
  error.value = '';
  
  try {
    await grantFoodRecognitionConsent();
    
    const upload = await createRecognitionUpload({
      contentType: imageContentType(imagePath.value),
      sizeBytes: Math.max(1, imageSize.value),
    });
    
    await completeRecognitionUpload(upload.id);
    
    const job = await createRecognitionJob(upload.id);
    
    uni.navigateTo({
      url: `/pages/food-candidates/FoodCandidatesPage?jobId=${encodeURIComponent(job.id)}&imagePath=${encodeURIComponent(imagePath.value)}`,
    });
  } catch (err) {
    error.value = '暂时无法识别，请检查网络或稍后重试';
    console.error('识别失败:', err);
  } finally {
    processing.value = false;
  }
}
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

/* 序序气泡 */
.xuxu-bubble {
  display: flex;
  align-items: flex-start;
  gap: 24rpx;
  margin-bottom: 32rpx;
  animation: fadeIn 0.4s ease 0.1s backwards;
}

.xuxu-avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.bubble-content {
  flex: 1;
  padding: 24rpx 28rpx;
  background: #e8f2ea;
  border-radius: 32rpx 32rpx 32rpx 8rpx;
}

.bubble-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #23382b;
  line-height: 1.6;
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
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  mix-blend-mode: multiply;
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
  font-size: 32rpx;
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
  font-size: 32rpx;
  flex-shrink: 0;
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
  font-size: 32rpx;
  flex-shrink: 0;
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
</style>
