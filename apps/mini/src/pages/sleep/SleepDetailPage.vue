<template>
  <view class="page">
    <view class="nav"
      ><button class="back" @tap="goBack">‹</button
      ><view
        ><text class="title">睡眠记录</text><text class="date">{{ dateLabel }}</text></view
      ><view class="nav-space"
    /></view>
    <view class="hero"
      ><view class="art-stage"
        ><image src="/static/illustrations/xuxu-sleep-reminder-crop.png" mode="aspectFit" /></view
      ><view class="hero-copy"
        ><text>把昨晚的安稳，留给今天</text><text>序序会帮你把作息和梦境轻轻收好</text></view
      ></view
    >
    <view class="section"
      ><text class="section-title">昨晚的作息</text
      ><text class="section-sub">选好入睡和起床时间，睡眠时长会自动算好</text>
      <view class="time-pair"
        ><picker mode="time" :value="bedtime" @change="setBedtime"
          ><view class="time-cell"
            ><text>入睡时间</text><strong>{{ bedtime }}</strong
            ><text>›</text></view
          ></picker
        ><view class="dash">—</view
        ><picker mode="time" :value="wakeTime" @change="setWakeTime"
          ><view class="time-cell"
            ><text>起床时间</text><strong>{{ wakeTime }}</strong
            ><text>›</text></view
          ></picker
        ></view
      >
      <view class="duration"
        ><text>预计睡眠时长</text><strong>{{ formatSleepDuration(sleepMinutes) }}</strong></view
      >
    </view>
    <view class="section"
      ><text class="section-title">睡眠质量</text
      ><view class="quality-row"
        ><button
          v-for="item in qualities"
          :key="item.value"
          :class="['quality', { selected: quality === item.value }]"
          @tap="quality = item.value"
        >
          {{ item.label }}
        </button></view
      ></view
    >
    <view class="section"
      ><view class="section-title-row"
        ><text class="section-title">给梦留一句话</text><text class="optional">选填</text></view
      ><textarea
        v-model="dream"
        class="dream"
        maxlength="160"
        placeholder="比如：梦见和序序在花园里吃早餐"
      />
    </view>
    <button class="save" @tap="save">保存睡眠记录</button>
    <view class="history"
      ><view class="history-head"
        ><text>睡眠小档案</text><text>{{ history.length }} 条记录</text></view
      ><view v-if="history.length" v-for="item in history" :key="item.date" class="history-row"
        ><view class="history-main"
          ><text class="history-date">{{ item.date }}</text
          ><text class="history-meta"
            >{{ item.sleep?.bedtime || '--:--' }} - {{ item.sleep?.wakeTime || '--:--' }} ·
            {{ formatSleepDuration(item.sleep?.durationMinutes || 0) }} ·
            {{ qualityLabel(item.sleep?.quality) }}</text
          ></view
        ><text class="dream-preview">{{ item.sleep?.dream || '这晚没有留下梦境文字' }}</text></view
      ><view v-else class="empty">保存后，这里会出现你的睡眠记录。</view></view
    >
  </view>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import {
  formatSleepDuration,
  listWellnessJournals,
  loadWellnessJournal,
  saveSleep,
  sleepDuration,
  type SleepQuality,
} from '../../features/wellness/wellness-journal.js';
const now = new Date();
const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const dateLabel = `${now.getMonth() + 1}月${now.getDate()}日`;
const bedtime = ref(loadWellnessJournal().sleep?.bedtime || '23:00');
const wakeTime = ref(loadWellnessJournal().sleep?.wakeTime || '07:00');
const quality = ref<SleepQuality>(loadWellnessJournal().sleep?.quality || 'good');
const dream = ref(loadWellnessJournal().sleep?.dream || '');
const history = ref(listWellnessJournals().filter((item) => item.sleep));
const sleepMinutes = computed(() => sleepDuration(bedtime.value, wakeTime.value));
const qualities = [
  { value: 'poor', label: '不太好' },
  { value: 'fair', label: '一般' },
  { value: 'good', label: '挺好' },
] as const;
function setBedtime(e: { detail: { value: string } }) {
  bedtime.value = e.detail.value;
}
function setWakeTime(e: { detail: { value: string } }) {
  wakeTime.value = e.detail.value;
}
function qualityLabel(value?: SleepQuality) {
  return value === 'good' ? '挺好' : value === 'fair' ? '一般' : '不太好';
}
function save() {
  saveSleep(
    {
      bedtime: bedtime.value,
      wakeTime: wakeTime.value,
      quality: quality.value,
      dream: dream.value.trim(),
    },
    today,
  );
  history.value = listWellnessJournals().filter((item) => item.sleep);
  uni.showToast({ title: '睡眠已保存', icon: 'success' });
}
function goBack() {
  uni.navigateBack();
}
onShow(() => {
  history.value = listWellnessJournals().filter((item) => item.sleep);
});
</script>
<style scoped>
.page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: calc(112rpx + env(safe-area-inset-top)) 28rpx calc(40rpx + env(safe-area-inset-bottom));
  background: #f7fbf7;
  color: #45564f;
}
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}
.back,
.nav-space {
  width: 64rpx;
  height: 64rpx;
}
.back {
  padding: 0;
  color: #43554d;
  border: 0;
  background: transparent;
  font-size: 56rpx;
  line-height: 64rpx;
}
.title {
  display: block;
  text-align: center;
  font-size: 34rpx;
  font-weight: 700;
}
.date {
  display: block;
  margin-top: 4rpx;
  color: #9aa9a2;
  font-size: 19rpx;
  text-align: center;
}
.hero {
  overflow: hidden;
  border-radius: 28rpx;
  background: #f4f1e6;
  box-shadow: 0 10rpx 24rpx rgba(77, 112, 89, 0.07);
}
.art-stage {
  width: 100%;
  height: 330rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f4f1e6;
}
.art-stage image {
  width: 100%;
  height: 100%;
  opacity: 0.98;
}
.hero-copy {
  padding: 18rpx 22rpx 20rpx;
  background: #fffdf8;
}
.hero-copy text {
  display: block;
}
.hero-copy text:first-child {
  color: #4c5f54;
  font-size: 27rpx;
  font-weight: 700;
}
.hero-copy text:last-child {
  margin-top: 7rpx;
  color: #98a59f;
  font-size: 19rpx;
}
.section {
  margin-top: 20rpx;
  padding: 26rpx 24rpx;
  border: 1rpx solid #e5eee7;
  border-radius: 24rpx;
  background: #fff;
  box-shadow: 0 8rpx 24rpx rgba(77, 112, 89, 0.06);
}
.section-title {
  display: block;
  color: #4a5c53;
  font-size: 26rpx;
  font-weight: 700;
}
.section-sub {
  display: block;
  margin-top: 6rpx;
  color: #9aa8a1;
  font-size: 19rpx;
}
.time-pair {
  display: flex;
  align-items: center;
  margin-top: 20rpx;
}
.time-pair picker {
  flex: 1;
}
.dash {
  padding: 0 10rpx;
  color: #b0bdb5;
}
.time-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx;
  border: 1rpx solid #e4ece6;
  border-radius: 16rpx;
  background: #fbfdf9;
}
.time-cell text:first-child {
  color: #8b9a93;
  font-size: 18rpx;
}
.time-cell strong {
  margin-left: auto;
  margin-right: 10rpx;
  color: #42564b;
  font-size: 27rpx;
}
.time-cell text:last-child {
  color: #a5b1aa;
  font-size: 26rpx;
}
.duration {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #eef2ee;
  color: #899891;
  font-size: 20rpx;
}
.duration strong {
  color: #70a98d;
  font-size: 24rpx;
}
.quality-row {
  display: flex;
  gap: 10rpx;
  margin-top: 18rpx;
}
.quality {
  flex: 1;
  height: 66rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid #e4ece6;
  border-radius: 16rpx;
  color: #7f9088;
  background: #fff;
  font-size: 20rpx;
}
.quality.selected {
  color: #5d9b7d;
  border-color: #8bc8a7;
  background: #edf8f0;
}
.section-title-row {
  display: flex;
  justify-content: space-between;
}
.optional {
  color: #aab5ae;
  font-size: 18rpx;
}
.dream {
  width: 100%;
  min-height: 150rpx;
  box-sizing: border-box;
  margin-top: 16rpx;
  padding: 16rpx;
  border: 1rpx solid #e4ece6;
  border-radius: 16rpx;
  color: #53655c;
  background: #fbfdf9;
  font-size: 20rpx;
  line-height: 1.5;
}
.save {
  width: 100%;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 24rpx;
  border-radius: 24rpx;
  color: #fff;
  background: #6bc49a;
  font-size: 25rpx;
  font-weight: 600;
}
.history {
  margin-top: 28rpx;
}
.history-head {
  display: flex;
  justify-content: space-between;
  color: #52655b;
  font-size: 24rpx;
  font-weight: 700;
}
.history-head text:last-child {
  color: #a4b1aa;
  font-size: 19rpx;
  font-weight: 400;
}
.history-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
  margin-top: 12rpx;
  padding: 18rpx 12rpx;
  border: 1rpx solid #e6eee8;
  border-radius: 18rpx;
  background: #fff;
}
.history-row text {
  display: block;
}
.history-main {
  flex: 1;
}
.history-date {
  color: #617269;
  font-size: 20rpx;
}
.history-meta {
  margin-top: 6rpx;
  color: #98a69e;
  font-size: 18rpx;
  line-height: 1.4;
}
.dream-preview {
  max-width: 45%;
  color: #71857b;
  font-size: 18rpx;
  line-height: 1.45;
  word-break: break-all;
}
.empty {
  margin-top: 14rpx;
  padding: 22rpx 0;
  color: #a2afa8;
  font-size: 19rpx;
  text-align: center;
}
</style>
<style scoped>
.page {
  padding: calc(96rpx + env(safe-area-inset-top)) 24rpx calc(44rpx + env(safe-area-inset-bottom));
  background: #f4f7f1;
  color: #3f5147;
}
.nav {
  margin-bottom: 18rpx;
}
.back {
  width: 58rpx;
  height: 58rpx;
  color: #52695a;
  font-size: 48rpx;
  line-height: 58rpx;
}
.nav-space {
  width: 58rpx;
  height: 58rpx;
}
.title {
  color: #3b5143;
  font-size: 32rpx;
  letter-spacing: 0;
}
.date {
  color: #9aaa9e;
  font-size: 18rpx;
}
.hero {
  border: 1rpx solid #e0e9df;
  border-radius: 22rpx;
  background: #e9f0e5;
  box-shadow: 0 8rpx 22rpx rgba(67, 92, 70, 0.06);
}
.art-stage {
  height: 580rpx;
  background: #e9f0e5;
}
.art-stage image {
  width: 100%;
  height: 100%;
  mix-blend-mode: multiply;
}
.hero-copy {
  padding: 20rpx 22rpx 22rpx;
  background: #fffdf8;
}
.hero-copy text:first-child {
  color: #405848;
  font-size: 28rpx;
}
.hero-copy text:last-child {
  margin-top: 8rpx;
  color: #899a8d;
  font-size: 19rpx;
}
.section {
  margin-top: 16rpx;
  padding: 24rpx 22rpx;
  border: 1rpx solid #e2e9e0;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: none;
}
.section-title {
  color: #405548;
  font-size: 25rpx;
}
.section-sub {
  color: #91a095;
  font-size: 18rpx;
}
.time-pair {
  margin-top: 18rpx;
}
.time-cell {
  min-height: 82rpx;
  padding: 14rpx 15rpx;
  border: 1rpx solid #dce7dc;
  border-radius: 14rpx;
  background: #f9fcf7;
}
.time-cell text:first-child {
  color: #8a9a8e;
  font-size: 17rpx;
}
.time-cell strong {
  color: #3e5947;
  font-size: 28rpx;
}
.time-cell text:last-child {
  color: #93a399;
  font-size: 24rpx;
}
.dash {
  color: #a8b6aa;
}
.duration {
  border-top-color: #edf2eb;
  color: #87988b;
  font-size: 19rpx;
}
.duration strong {
  color: #5e9570;
  font-size: 24rpx;
}
.quality-row {
  gap: 9rpx;
  margin-top: 16rpx;
}
.quality {
  height: 62rpx;
  border-color: #dce7dc;
  border-radius: 14rpx;
  color: #778a7d;
  background: #fbfdf9;
  font-size: 19rpx;
}
.quality.selected {
  border-color: #9dbda3;
  color: #4e7a5b;
  background: #edf5ea;
}
.dream {
  min-height: 138rpx;
  border-color: #dce7dc;
  border-radius: 14rpx;
  background: #f9fcf7;
  font-size: 19rpx;
}
.save {
  height: 78rpx;
  margin-top: 18rpx;
  border-radius: 17rpx;
  background: #709a79;
  box-shadow: 0 8rpx 18rpx rgba(92, 137, 101, 0.18);
  font-size: 24rpx;
}
.history {
  margin-top: 28rpx;
}
.history-head {
  padding: 0 2rpx 12rpx;
  border-bottom: 1rpx solid #dfe8df;
  color: #486050;
  font-size: 23rpx;
}
.history-head text:last-child {
  color: #95a399;
  font-size: 18rpx;
}
.history-row {
  margin-top: 0;
  padding: 18rpx 2rpx;
  border: 0;
  border-bottom: 1rpx solid #e2e9e1;
  border-radius: 0;
  background: transparent;
}
.history-date {
  color: #587060;
  font-size: 19rpx;
}
.history-meta {
  color: #8d9e92;
  font-size: 17rpx;
}
.dream-preview {
  max-width: 42%;
  color: #73857a;
  font-size: 17rpx;
}
.empty {
  color: #95a49a;
  font-size: 18rpx;
}
</style>
<style scoped>
button {
  box-sizing: border-box;
  line-height: 1;
  white-space: nowrap;
}
</style>
