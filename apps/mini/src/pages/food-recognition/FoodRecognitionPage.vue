<template>
  <view class="page">
    <AppNavBar title="拍照识别食物" route="/pages/food-recognition/FoodRecognitionPage" />
    <view class="intro"><text class="eyebrow">拍一拍，再确认</text><text class="title">让序序帮你找食物</text><text class="hint">识别结果只是候选。你确认食物和份量后，才会保存到当天记录。</text></view>
    <view v-if="imagePath" class="preview"><image :src="imagePath" mode="aspectFill" /><button class="replace" @tap="chooseImage">重新选择</button></view>
    <button v-else class="picker" @tap="chooseImage"><view class="picker-mark">+</view><text>拍照或从相册选择</text><text>选择后会进入候选确认，不会自动记入饮食</text></button>
    <view class="tips"><view><text>1</text><text>选择一张清晰的食物照片</text></view><view><text>2</text><text>查看并修改候选食物和估算份量</text></view><view><text>3</text><text>确认后才保存为餐食记录</text></view></view>
    <text v-if="error" class="error">{{ error }}</text><button class="primary" :disabled="!imagePath || processing" @tap="recognize">{{ processing ? '正在识别…' : '开始识别' }}</button>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppNavBar from '../../components/AppNavBar.vue';
import { createRecognitionJob } from '../../features/food/food-recognition.js';
const imagePath = ref(''); const processing = ref(false); const error = ref('');
function chooseImage() { uni.chooseImage({ count: 1, sizeType: ['compressed'], sourceType: ['camera', 'album'], success: ({ tempFilePaths }) => { imagePath.value = tempFilePaths[0] || ''; error.value = ''; } }); }
async function recognize() { if (!imagePath.value) return; processing.value = true; error.value = ''; try { const job = await createRecognitionJob(imagePath.value); uni.navigateTo({ url: `/pages/food-candidates/FoodCandidatesPage?jobId=${encodeURIComponent(job.id)}&imagePath=${encodeURIComponent(imagePath.value)}` }); } catch { error.value = '暂时无法识别，请检查 API 服务后重试'; } finally { processing.value = false; } }
</script>

<style scoped>
.page{min-height:100vh;box-sizing:border-box;padding:28rpx 32rpx 70rpx;background:#f7fbf8;color:#244735}.intro{padding:10rpx 2rpx 25rpx}.eyebrow{display:block;color:#659078;font-size:22rpx;font-weight:700}.title{display:block;margin-top:8rpx;font-size:36rpx;font-weight:700}.hint{display:block;margin-top:9rpx;color:#809587;font-size:21rpx;line-height:1.55}.picker{display:flex;align-items:center;flex-direction:column;justify-content:center;width:100%;height:400rpx;border:2rpx dashed #bbd7bf;border-radius:22rpx;background:#f0f8f0}.picker-mark{display:flex;align-items:center;justify-content:center;width:82rpx;height:82rpx;border-radius:28rpx;color:#fff;background:#78a97f;font-size:48rpx}.picker text{display:block}.picker text:nth-child(2){margin-top:18rpx;color:#365c43;font-size:27rpx;font-weight:700}.picker text:last-child{margin:8rpx 36rpx 0;color:#819587;font-size:20rpx;line-height:1.45}.preview{position:relative;height:400rpx;overflow:hidden;border-radius:22rpx;background:#e8f1e8}.preview image{width:100%;height:100%}.replace{position:absolute;right:14rpx;bottom:14rpx;padding:11rpx 16rpx;border-radius:12rpx;color:#315d42;background:rgba(255,255,255,.94);font-size:21rpx}.tips{margin-top:22rpx;border-top:1rpx solid #dceadd}.tips view{display:flex;align-items:center;gap:12rpx;padding:13rpx 2rpx;border-bottom:1rpx solid #e1ebe2}.tips text:first-child{display:flex;align-items:center;justify-content:center;width:30rpx;height:30rpx;border-radius:50%;color:#2e7149;background:#e7f3e8;font-size:18rpx;font-weight:700}.tips text:last-child{color:#668171;font-size:21rpx}.error{display:block;margin-top:14rpx;padding:12rpx 14rpx;border-radius:11rpx;color:#ad624e;background:#fff1ed;font-size:20rpx}.primary{width:100%;height:80rpx;margin-top:26rpx;border-radius:14rpx;color:#fff;background:#2e7d4f;font-size:26rpx;line-height:80rpx}.primary[disabled]{opacity:.55}
</style>
