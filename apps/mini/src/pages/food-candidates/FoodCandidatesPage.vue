<template>
  <view class="page">
    <AppNavBar title="确认识别结果" route="/pages/food-candidates/FoodCandidatesPage" />
    <view v-if="loading" class="state">正在整理候选食物…</view>
    <template v-else-if="job">
      <view class="image-strip"
        ><image v-if="imagePath" :src="imagePath" mode="aspectFill" /><view
          ><text>识别出的候选</text><text>请确认食物和份量，再保存到记录</text></view
        ></view
      >
      <view v-if="job.status === 'failed'" class="empty failure-state">
        <text class="failure-title">这次识别没有完成</text>
        <text class="failure-copy"
          >图片不会自动记入饮食记录，你可以重新拍摄，或改用食物目录手动记录。</text
        >
        <view class="recovery-actions">
          <button class="primary-action" @tap="retry">重新拍摄</button>
          <button class="secondary-action" @tap="manualRecord">手动记录</button>
        </view>
      </view>
      <view v-else-if="!job.candidates.length" class="empty">
        <text>这张照片还没有找到可确认的食物</text>
        <view class="recovery-actions">
          <button class="primary-action" @tap="retry">换一张照片</button>
          <button class="secondary-action" @tap="manualRecord">手动记录</button>
        </view>
      </view>
      <template v-else
        ><view class="candidates"
          ><button
            v-for="candidate in job.candidates"
            :key="candidate.id"
            :class="['candidate', { selected: candidate.id === candidateId }]"
            @tap="select(candidate)"
          >
            <view class="candidate-mark">{{ candidate.name.slice(0, 1) }}</view
            ><view
              ><text>{{ candidate.name }}</text
              ><text
                >匹配度 {{ Math.round(candidate.confidence * 100) }}% · 估算
                {{ candidate.estimatedGrams }}g</text
              ></view
            ><image
              v-if="candidate.id === candidateId"
              src="/static/icons/check.svg"
              mode="aspectFit"
            /></button
        ></view>
        <view class="panel"
          ><text class="label">实际吃了多少？</text
          ><view class="gram"><input v-model="grams" type="digit" /><text>克</text></view
          ><text class="label">这是什么时候吃的？</text
          ><view class="meals"
            ><button
              v-for="item in meals"
              :key="item.value"
              :class="{ selected: mealType === item.value }"
              @tap="mealType = item.value"
            >
              {{ item.label }}
            </button></view
          ></view
        ><text v-if="error" class="error">{{ error }}</text
        ><button class="primary" :disabled="saving || !candidateId" @tap="confirm">
          {{ saving ? '保存中…' : '确认并保存' }}
        </button></template
      >
    </template>
    <view v-else class="state"
      ><text>识别结果加载失败</text><button @tap="back">返回重试</button></view
    >
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
    error.value = '保存失败，请检查 API 服务是否已启动';
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
  load(options?.jobId || '');
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 28rpx 32rpx 70rpx;
  background: #f7fbf8;
  color: #244735;
}
.image-strip {
  display: flex;
  align-items: center;
  gap: 14rpx;
  margin: 10rpx 0 22rpx;
  padding: 12rpx;
  border: 1rpx solid #dceadd;
  border-radius: 17rpx;
  background: #fff;
}
.image-strip image {
  width: 84rpx;
  height: 84rpx;
  border-radius: 13rpx;
}
.image-strip view {
  flex: 1;
}
.image-strip text {
  display: block;
}
.image-strip text:first-child {
  color: #31543e;
  font-size: 25rpx;
  font-weight: 700;
}
.image-strip text:last-child {
  margin-top: 5rpx;
  color: #819486;
  font-size: 19rpx;
}
.candidates {
  border-top: 1rpx solid #dceadd;
}
.candidate {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 14rpx;
  padding: 16rpx 2rpx;
  border-bottom: 1rpx solid #e1ebe2;
  text-align: left;
  background: transparent;
}
.candidate.selected {
  background: #eff8ef;
}
.candidate-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 58rpx;
  height: 58rpx;
  border-radius: 18rpx;
  color: #fff;
  background: #7eae86;
  font-size: 26rpx;
  font-weight: 700;
}
.candidate view {
  flex: 1;
}
.candidate text {
  display: block;
}
.candidate text:first-child {
  color: #31543e;
  font-size: 25rpx;
  font-weight: 700;
}
.candidate text:last-child {
  margin-top: 5rpx;
  color: #819486;
  font-size: 19rpx;
}
.candidate image {
  width: 32rpx;
  height: 32rpx;
}
.panel {
  margin-top: 22rpx;
  padding: 20rpx;
  border: 1rpx solid #dceadd;
  border-radius: 17rpx;
  background: #fff;
}
.label {
  display: block;
  margin-bottom: 10rpx;
  color: #567463;
  font-size: 22rpx;
  font-weight: 700;
}
.label:not(:first-child) {
  margin-top: 20rpx;
}
.gram {
  display: flex;
  align-items: center;
  height: 76rpx;
  border: 1rpx solid #d7e6d9;
  border-radius: 12rpx;
  background: #fbfdfb;
}
.gram input {
  flex: 1;
  height: 100%;
  padding: 0 18rpx;
  font-size: 25rpx;
}
.gram text {
  padding-right: 18rpx;
  color: #789080;
  font-size: 21rpx;
}
.meals {
  display: flex;
  gap: 8rpx;
}
.meals button {
  flex: 1;
  padding: 12rpx 3rpx;
  border: 1rpx solid #dceadd;
  border-radius: 10rpx;
  color: #5d7a68;
  background: #fff;
  font-size: 20rpx;
}
.meals .selected {
  border-color: #6da57c;
  color: #286b47;
  background: #e8f4e8;
}
.primary {
  width: 100%;
  height: 80rpx;
  margin-top: 22rpx;
  border-radius: 14rpx;
  color: #fff;
  background: #2e7d4f;
  font-size: 26rpx;
  line-height: 80rpx;
}
.primary[disabled] {
  opacity: 0.55;
}
.state,
.empty {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 150rpx 20rpx;
  color: #70897a;
  text-align: center;
  font-size: 24rpx;
}
.state button,
.empty button {
  margin-top: 20rpx;
  padding: 12rpx 22rpx;
  border-radius: 12rpx;
  color: #fff;
  background: #357c50;
  font-size: 22rpx;
}
.error {
  display: block;
  margin-top: 14rpx;
  padding: 12rpx 14rpx;
  border-radius: 11rpx;
  color: #ad624e;
  background: #fff1ed;
  font-size: 20rpx;
}
.failure-title {
  color: #31543e;
  font-size: 30rpx;
  font-weight: 700;
}
.failure-copy {
  display: block;
  margin-top: 12rpx;
  color: #789080;
  font-size: 21rpx;
  line-height: 1.55;
}
.recovery-actions {
  display: flex;
  width: 100%;
  gap: 14rpx;
  margin-top: 24rpx;
}
.recovery-actions button {
  flex: 1;
  margin: 0;
  padding: 14rpx 8rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
  line-height: 1.3;
}
.primary-action {
  color: #fff;
  background: #357c50;
}
.secondary-action {
  border: 1rpx solid #b9d2bd;
  color: #39704d;
  background: #f4faf4;
}
</style>
