<template>
  <view class="page">
    <AppNavBar title="识别结果" route="/pages/food-candidates/FoodCandidatesPage" />

    <view v-if="loading" class="loading-state">
      <view class="scanner"><view /><view /><view /></view>
      <text class="loading-title">序序正在整理这份餐食</text>
      <text class="loading-copy">辨认菜品、份量和营养组成</text>
    </view>

    <template v-else-if="job">
      <view v-if="imagePath" class="photo-stage">
        <image class="preview-img" :src="imagePath" mode="aspectFit" />
        <view class="photo-status"><view class="status-dot" /><text>已完成识别</text></view>
      </view>

      <view v-if="job.status === 'failed' || !job.candidates.length" class="empty-state">
        <image class="state-art" src="/static/illustrations/xuxu-ai-empty.png" mode="aspectFit" />
        <text class="state-title">这张照片还看不太清</text>
        <text class="state-copy">换一张光线更好、食物更完整的照片，或直接从食物库记录。</text>
        <view class="empty-actions">
          <button class="secondary-action" @tap="manualRecord">去食物库</button>
          <button class="primary-action" @tap="retry">重新拍摄</button>
        </view>
      </view>

      <template v-else-if="selectedCandidate">
        <view class="result-heading">
          <view class="heading-copy">
            <text class="eyebrow">序序判断这份是</text>
            <text class="dish-name">{{ selectedCandidate.name }}</text>
          </view>
          <view class="confidence"><text>{{ confidenceLabel }}</text><text>可信度</text></view>
        </view>

        <scroll-view v-if="job.candidates.length > 1" class="alternatives" scroll-x show-scrollbar="false">
          <button
            v-for="candidate in job.candidates"
            :key="candidate.id"
            :class="['alternative', { selected: candidate.id === candidateId }]"
            @tap="select(candidate)"
          >
            {{ candidate.name }}
          </button>
        </scroll-view>

        <view class="nutrition-band">
          <view class="energy-block">
            <text class="energy-value">{{ round(selectedCandidate.estimatedEnergyKcal) }}</text>
            <text class="energy-unit">千卡</text>
            <text class="energy-caption">整份约 {{ round(selectedCandidate.estimatedGrams) }} 克</text>
          </view>
          <view class="macro-grid">
            <view><text>{{ round(selectedCandidate.estimatedProteinG, 1) }}g</text><text>蛋白质</text></view>
            <view><text>{{ round(selectedCandidate.estimatedFatG, 1) }}g</text><text>脂肪</text></view>
            <view><text>{{ round(selectedCandidate.estimatedCarbohydrateG, 1) }}g</text><text>碳水</text></view>
          </view>
        </view>

        <view v-if="selectedCandidate?.components?.length" class="components-section">
          <view class="section-heading">
            <text class="section-title">看见的食材</text>
            <text class="section-note">份量均可在下一步修改</text>
          </view>
          <view class="component-list">
            <view v-for="component in selectedCandidate.components" :key="component.name" class="component-row">
              <view class="component-mark" />
              <text class="component-name">{{ component.name }}</text>
              <text class="component-amount">约 {{ round(component.estimatedGrams) }}g</text>
              <text class="component-energy">{{ round(component.estimatedEnergyKcal) }} 千卡</text>
            </view>
          </view>
        </view>

        <view v-if="selectedCandidate.uncertaintyNote" class="estimate-note">
          <text class="note-title">估算说明</text>
          <text>{{ selectedCandidate.uncertaintyNote }}</text>
        </view>

        <text v-if="error" class="error-text">{{ error }}</text>
        <view class="action-dock">
          <button class="retake-button" @tap="retry">重拍</button>
          <button class="confirm-button" @tap="continueToConfirm">调整内容与份量</button>
        </view>
      </template>
    </template>

    <view v-else class="empty-state">
      <text class="state-title">识别结果没有加载出来</text>
      <button class="primary-action" @tap="back">返回重试</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AppNavBar from '../../components/AppNavBar.vue';
import {
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
const mealType = ref<MealType>('lunch');
const error = ref('');
const selectedCandidate = computed(() =>
  job.value?.candidates.find((candidate) => candidate.id === candidateId.value),
);
const confidenceLabel = computed(() => {
  const score = selectedCandidate.value?.confidence ?? 0;
  if (score >= 0.85) return '较高';
  if (score >= 0.65) return '中等';
  return '待确认';
});

function round(value?: number | null, digits = 0) {
  if (value == null || !Number.isFinite(value)) return '--';
  const power = 10 ** digits;
  return String(Math.round(value * power) / power);
}

function select(candidate: RecognitionCandidate) {
  candidateId.value = candidate.id;
  error.value = '';
}

async function load(jobId: string) {
  loading.value = true;
  try {
    job.value = await loadRecognitionJob(jobId);
    candidateId.value = defaultRecognitionCandidateId(job.value.candidates);
  } catch {
    job.value = null;
  } finally {
    loading.value = false;
  }
}

function continueToConfirm() {
  const candidate = selectedCandidate.value;
  if (!candidate) {
    error.value = '暂时没有可确认的结果';
    return;
  }
  uni.navigateTo({
    url: `/pages/food-confirm/FoodConfirmPage?jobId=${encodeURIComponent(job.value?.id || '')}&candidateId=${encodeURIComponent(candidate.id)}&source=photo&grams=${candidate.estimatedGrams}&mealType=${mealType.value}&imagePath=${encodeURIComponent(imagePath.value)}`,
  });
}

function back() { uni.navigateBack(); }
function retry() {
  uni.redirectTo({ url: `/pages/food-recognition/FoodRecognitionPage?mealType=${mealType.value}` });
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
  box-sizing: border-box;
  padding: 18rpx 32rpx 190rpx;
  color: #283b31;
  background: #fffdf9;
}
button::after { border: 0; }
.loading-state, .empty-state {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 150rpx 34rpx 60rpx;
  text-align: center;
}
.scanner { display: flex; align-items: flex-end; gap: 10rpx; height: 54rpx; margin-bottom: 28rpx; }
.scanner view { width: 10rpx; border-radius: 10rpx; background: #8bb59a; animation: scan 1s ease-in-out infinite; }
.scanner view:nth-child(1) { height: 26rpx; }
.scanner view:nth-child(2) { height: 48rpx; animation-delay: .14s; }
.scanner view:nth-child(3) { height: 34rpx; animation-delay: .28s; }
@keyframes scan { 50% { opacity: .35; transform: scaleY(.62); } }
.loading-title, .state-title { color: #2d4538; font-size: 31rpx; font-weight: 750; }
.loading-copy, .state-copy { margin-top: 12rpx; color: #7f8d84; font-size: 22rpx; line-height: 1.65; }
.state-art { width: 230rpx; height: 190rpx; margin-bottom: 24rpx; }
.photo-stage {
  position: relative;
  width: 100%;
  height: 410rpx;
  margin-top: 8rpx;
  overflow: hidden;
  border: 1rpx solid #ece6dc;
  border-radius: 24rpx;
  background: #f7f1e8;
  box-shadow: 0 16rpx 42rpx rgba(68, 73, 63, .08);
}
.preview-img { width: 100%; height: 100%; }
.photo-status {
  position: absolute;
  right: 18rpx;
  bottom: 18rpx;
  display: flex;
  align-items: center;
  gap: 9rpx;
  padding: 11rpx 18rpx;
  border: 1rpx solid rgba(255,255,255,.85);
  border-radius: 999rpx;
  color: #385545;
  background: rgba(255,253,249,.9);
  box-shadow: 0 8rpx 24rpx rgba(41,58,48,.1);
  font-size: 20rpx;
  backdrop-filter: blur(14px);
}
.status-dot { width: 12rpx; height: 12rpx; border-radius: 50%; background: #7fad8e; box-shadow: 0 0 0 5rpx rgba(127,173,142,.16); }
.result-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 24rpx; padding: 38rpx 6rpx 22rpx; }
.heading-copy { min-width: 0; }
.heading-copy { flex: 1; }
.eyebrow { display: block; margin-bottom: 8rpx; color: #879189; font-size: 21rpx; }
.dish-name { display: block; color: #263b30; font-size: 44rpx; font-weight: 780; line-height: 1.25; }
.confidence { flex: none; padding: 10rpx 16rpx; border-radius: 14rpx; background: #edf4ed; text-align: center; }
.confidence text { display: block; color: #4d765d; font-size: 20rpx; font-weight: 700; }
.confidence text:last-child { margin-top: 2rpx; color: #819087; font-size: 16rpx; font-weight: 500; }
.alternatives { width: 100%; margin-bottom: 24rpx; white-space: nowrap; }
.alternative { display: inline-flex; align-items: center; justify-content: center; height: 58rpx; margin-right: 12rpx; padding: 0 22rpx; border: 1rpx solid #e3e8e1; border-radius: 999rpx; color: #697a70; background: #fff; font-size: 21rpx; line-height: 1; }
.alternative.selected { border-color: #a9c7b2; color: #395c47; background: #eff6ef; }
.nutrition-band { display: grid; grid-template-columns: 1.05fr 1.65fr; align-items: center; gap: 22rpx; padding: 28rpx; border: 1rpx solid #ebe6dd; border-radius: 22rpx; background: linear-gradient(135deg,#fff9ef,#fff 72%); box-shadow: 0 10rpx 30rpx rgba(75,68,54,.06); }
.energy-block { padding-right: 20rpx; border-right: 1rpx solid #ebe5da; }
.energy-value { color: #bc7554; font-size: 52rpx; font-weight: 780; line-height: 1; }
.energy-unit { margin-left: 6rpx; color: #7c746b; font-size: 19rpx; }
.energy-caption { display: block; margin-top: 10rpx; color: #938b82; font-size: 18rpx; }
.macro-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 8rpx; }
.macro-grid view { text-align: center; }
.macro-grid text { display: block; color: #3e5749; font-size: 22rpx; font-weight: 700; }
.macro-grid text:last-child { margin-top: 6rpx; color: #909991; font-size: 16rpx; font-weight: 500; }
.components-section { padding: 34rpx 6rpx 8rpx; }
.section-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 18rpx; margin-bottom: 10rpx; }
.section-title { color: #30483a; font-size: 27rpx; font-weight: 750; }
.section-note { color: #9a9f9a; font-size: 18rpx; }
.component-row { display: grid; grid-template-columns: 14rpx minmax(0,1fr) auto auto; align-items: center; gap: 14rpx; min-height: 72rpx; border-bottom: 1rpx solid #eeeae3; }
.component-mark { width: 10rpx; height: 10rpx; border-radius: 50%; background: #d4aa77; }
.component-name { color: #405247; font-size: 23rpx; }
.component-amount { color: #8b958e; font-size: 20rpx; }
.component-energy { min-width: 88rpx; color: #6a786f; font-size: 20rpx; text-align: right; }
.estimate-note { margin-top: 24rpx; padding: 20rpx 22rpx; border-left: 5rpx solid #dfbd8b; border-radius: 4rpx 16rpx 16rpx 4rpx; color: #7b746b; background: #fff9ef; font-size: 20rpx; line-height: 1.6; }
.note-title { display: block; margin-bottom: 4rpx; color: #6f6559; font-weight: 700; }
.error-text { display: block; margin-top: 20rpx; color: #b26455; font-size: 21rpx; }
.action-dock { position: fixed; right: 0; bottom: 0; left: 0; z-index: 50; display: grid; grid-template-columns: 132rpx 1fr; gap: 14rpx; padding: 18rpx 32rpx calc(env(safe-area-inset-bottom) + 18rpx); border-top: 1rpx solid rgba(232,228,220,.9); background: rgba(255,253,249,.96); backdrop-filter: blur(18px); }
.retake-button, .confirm-button, .secondary-action, .primary-action { display: flex; align-items: center; justify-content: center; height: 82rpx; border-radius: 18rpx; font-size: 24rpx; line-height: 1; }
.retake-button, .secondary-action { border: 1rpx solid #dce5dc; color: #587061; background: #f8fbf7; }
.confirm-button, .primary-action { color: #fff; background: linear-gradient(135deg,#7eaa8c,#668f76); box-shadow: 0 12rpx 26rpx rgba(77,118,91,.2); }
.empty-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 14rpx; width: 100%; margin-top: 32rpx; }
</style>
