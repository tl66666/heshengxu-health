<template>
  <view class="page">
    <view class="nav">
      <button class="back" aria-label="返回" @tap="goBack">‹</button>
      <view class="nav-copy"
        ><text class="title">运动记录</text><text class="date">{{ dateLabel }}</text></view
      >
      <view class="nav-space" />
    </view>

    <view class="hero">
      <view class="hero-copy">
        <text class="hero-kicker">今天也为自己动一动</text>
        <view class="hero-total"
          ><text>{{ totalMinutes }}</text
          ><text>分钟</text></view
        >
        <text class="hero-note">{{
          recordCount ? `已记录 ${recordCount} 次活动` : '从 10 分钟开始也很好'
        }}</text>
      </view>
      <image class="hero-art" src="/static/icons/watercolor/activity-crop.png" mode="aspectFit" />
    </view>

    <view class="section form-section">
      <view class="section-head"
        ><view
          ><text class="section-title">记下一次活动</text
          ><text class="section-subtitle">选择运动，再填上舒服的时长</text></view
        ></view
      >
      <text class="field-label">运动类型</text>
      <view class="activity-grid">
        <button
          v-for="item in activityOptions"
          :key="item"
          :class="['activity-choice', { selected: activityType === item }]"
          @tap="activityType = item"
        >
          {{ item }}
        </button>
      </view>
      <view class="field-label-row"
        ><text class="field-label">活动时长</text><text class="unit">分钟</text></view
      >
      <view class="duration-wrap"
        ><input
          v-model="duration"
          class="duration-input"
          type="number"
          placeholder="例如 30"
        /><text>分钟</text></view
      >
      <view class="duration-options"
        ><button
          v-for="item in durationOptions"
          :key="item"
          :class="['duration-choice', { selected: duration === String(item) }]"
          @tap="duration = String(item)"
        >
          {{ item }}
        </button></view
      >
      <input v-model="note" class="note-input" maxlength="120" placeholder="补充一点感受（选填）" />
      <button class="save-button" :disabled="saving" @tap="save">
        {{ saving ? '保存中…' : '保存运动记录' }}
      </button>
      <text v-if="error" class="error">{{ error }}</text>
    </view>

    <view class="history-section">
      <view class="history-head"
        ><text class="section-title">今天的活动</text
        ><text class="history-count">{{ recordCount }} 次</text></view
      >
      <view v-if="history.length" class="history-list"
        ><view v-for="item in history" :key="item.id" class="history-row"
          ><view class="history-icon">✓</view
          ><view class="history-copy"
            ><text class="history-title">{{ item.activityType }}</text
            ><text class="history-meta"
              >{{ item.durationMinutes }} 分钟 · {{ formatTime(item.recordedAt) }}</text
            ></view
          ><text class="history-arrow">›</text></view
        ></view
      >
      <view v-else class="empty"
        ><image src="/static/icons/watercolor/activity-crop.png" mode="aspectFit" /><text
          >还没有今天的活动记录</text
        ><text>记录一次轻量活动，身体会记得这份照顾</text></view
      >
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import {
  createHealthRecord,
  loadTodayRecords,
} from '../../features/health-records/health-records.service.js';

const now = new Date();
const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const dateLabel = `${now.getMonth() + 1}月${now.getDate()}日`;
const activityOptions = ['步行', '拉伸', '瑜伽', '跑步', '骑行', '力量训练'];
const durationOptions = [10, 20, 30, 45, 60];
const activityType = ref('步行');
const duration = ref('');
const note = ref('');
const history = ref<
  Array<{ id: string; activityType: string; durationMinutes: number; recordedAt: string }>
>([]);
const saving = ref(false);
const error = ref('');
const recordCount = computed(() => history.value.length);
const totalMinutes = computed(() =>
  history.value.reduce((sum, item) => sum + item.durationMinutes, 0),
);

async function load() {
  const records = await loadTodayRecords(today);
  history.value = records.activities;
}
async function save() {
  const minutes = Number(duration.value);
  if (!activityType.value.trim() || !Number.isFinite(minutes) || minutes <= 0) {
    error.value = '请填写运动类型和有效时长';
    return;
  }
  saving.value = true;
  error.value = '';
  try {
    await createHealthRecord({
      type: 'activity',
      data: {
        activityType: activityType.value.trim(),
        durationMinutes: minutes,
        recordedAt: new Date().toISOString(),
        note: note.value.trim() || undefined,
      },
    });
    duration.value = '';
    note.value = '';
    await load();
    uni.showToast({ title: '运动已记录', icon: 'success' });
  } catch {
    error.value = '保存失败，请稍后再试';
  } finally {
    saving.value = false;
  }
}
function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}
function goBack() {
  uni.navigateBack();
}
onShow(() => {
  load();
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: calc(112rpx + env(safe-area-inset-top)) 24rpx calc(48rpx + env(safe-area-inset-bottom));
  background: #f5f9f5;
  color: #40574a;
}
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22rpx;
}
.back,
.nav-space {
  width: 64rpx;
  height: 64rpx;
}
.back {
  padding: 0;
  border: 0;
  background: transparent;
  color: #55705f;
  font-size: 56rpx;
  line-height: 64rpx;
}
.nav-copy {
  text-align: center;
}
.title {
  display: block;
  color: #3d5647;
  font-size: 34rpx;
  font-weight: 750;
}
.date {
  display: block;
  margin-top: 4rpx;
  color: #9aaa9f;
  font-size: 18rpx;
}
.hero {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 250rpx;
  overflow: hidden;
  padding: 28rpx 26rpx;
  border: 1rpx solid #e2ede3;
  border-radius: 26rpx;
  background: #edf7ef;
  box-shadow: 0 10rpx 24rpx rgba(73, 111, 82, 0.07);
}
.hero-copy {
  position: relative;
  z-index: 1;
}
.hero-kicker {
  display: block;
  color: #6e9177;
  font-size: 21rpx;
}
.hero-total {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
  margin-top: 10rpx;
  color: #3f7653;
}
.hero-total text:first-child {
  font-size: 68rpx;
  font-weight: 800;
  line-height: 1;
}
.hero-total text:last-child {
  font-size: 22rpx;
  font-weight: 700;
}
.hero-note {
  display: block;
  margin-top: 10rpx;
  color: #8da196;
  font-size: 19rpx;
}
.hero-art {
  position: absolute;
  right: 2rpx;
  bottom: -8rpx;
  width: 270rpx;
  height: 240rpx;
  opacity: 0.86;
  mix-blend-mode: multiply;
}
.section {
  margin-top: 18rpx;
  padding: 24rpx 22rpx;
  border: 1rpx solid #e4ede5;
  border-radius: 22rpx;
  background: #fff;
  box-shadow: 0 8rpx 20rpx rgba(67, 95, 75, 0.05);
}
.section-head {
  margin-bottom: 20rpx;
}
.section-title {
  display: block;
  color: #445c4c;
  font-size: 27rpx;
  font-weight: 750;
}
.section-subtitle {
  display: block;
  margin-top: 5rpx;
  color: #98a89d;
  font-size: 19rpx;
}
.field-label {
  display: block;
  margin-bottom: 10rpx;
  color: #637c6a;
  font-size: 20rpx;
  font-weight: 700;
}
.activity-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10rpx;
}
.activity-choice,
.duration-choice {
  height: 56rpx;
  padding: 0;
  border: 1rpx solid #dfeae1;
  border-radius: 14rpx;
  background: #fbfdfb;
  color: #64806c;
  font-size: 20rpx;
  line-height: 56rpx;
}
.activity-choice.selected,
.duration-choice.selected {
  border-color: #8fbea0;
  background: #edf7ef;
  color: #39704c;
  font-weight: 700;
}
.field-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 22rpx;
}
.field-label-row .field-label {
  margin-bottom: 10rpx;
}
.unit {
  color: #9aaa9f;
  font-size: 18rpx;
}
.duration-wrap {
  display: flex;
  align-items: center;
  height: 76rpx;
  padding: 0 18rpx;
  border: 1rpx solid #dfeae1;
  border-radius: 15rpx;
  background: #fbfdfb;
}
.duration-input {
  flex: 1;
  height: 74rpx;
  padding: 0;
  border: 0;
  background: transparent;
  color: #3f5748;
  font-size: 30rpx;
  font-weight: 700;
}
.duration-wrap > text {
  color: #78917f;
  font-size: 20rpx;
}
.duration-options {
  display: flex;
  gap: 8rpx;
  margin-top: 10rpx;
}
.duration-choice {
  flex: 1;
  height: 48rpx;
  font-size: 18rpx;
  line-height: 48rpx;
}
.note-input {
  width: 100%;
  height: 72rpx;
  box-sizing: border-box;
  margin-top: 20rpx;
  padding: 0 18rpx;
  border: 1rpx solid #dfeae1;
  border-radius: 15rpx;
  background: #fbfdfb;
  color: #40574a;
  font-size: 21rpx;
}
.save-button {
  width: 100%;
  height: 76rpx;
  margin-top: 22rpx;
  border-radius: 17rpx;
  background: #72a982;
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
  line-height: 76rpx;
}
.save-button[disabled] {
  opacity: 0.55;
}
.error {
  display: block;
  margin-top: 10rpx;
  color: #b46758;
  font-size: 19rpx;
}
.history-section {
  margin-top: 28rpx;
}
.history-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.history-count {
  color: #92a49a;
  font-size: 19rpx;
}
.history-list {
  margin-top: 12rpx;
  border-top: 1rpx solid #e4ede5;
}
.history-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 17rpx 4rpx;
  border-bottom: 1rpx solid #e7efe8;
}
.history-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42rpx;
  height: 42rpx;
  border-radius: 50%;
  background: #e8f5ea;
  color: #5d9e70;
  font-size: 20rpx;
}
.history-copy {
  flex: 1;
}
.history-title {
  display: block;
  color: #4b6352;
  font-size: 22rpx;
  font-weight: 700;
}
.history-meta {
  display: block;
  margin-top: 5rpx;
  color: #9aaa9f;
  font-size: 18rpx;
}
.history-arrow {
  color: #a2b0a7;
  font-size: 30rpx;
}
.empty {
  display: flex;
  align-items: center;
  flex-direction: column;
  margin-top: 14rpx;
  padding: 24rpx 0;
  color: #8fa097;
  font-size: 20rpx;
  text-align: center;
}
.empty image {
  width: 110rpx;
  height: 100rpx;
  margin-bottom: 8rpx;
  opacity: 0.72;
  mix-blend-mode: multiply;
}
.empty text:last-child {
  margin-top: 6rpx;
  color: #a5b1aa;
  font-size: 18rpx;
}
</style>
