<template>
  <view class="page">
    <AppNavBar title="首页卡片" route="/pages/home/HomePage" />

    <view class="intro">
      <text class="eyebrow">只留下你常用的</text>
      <text class="title">整理首页</text>
      <text class="subtitle">隐藏的卡片不会删除记录，之后随时可以重新打开。</text>
    </view>

    <view class="summary-line">
      <view>
        <text class="summary-value">{{ visibleCount }}</text>
        <text class="summary-label">张卡片显示中</text>
      </view>
      <button class="reset-button" @tap="reset">恢复默认</button>
    </view>

    <view v-for="group in groups" :key="group" class="settings-group">
      <text class="group-title">{{ group }}</text>
      <view class="settings-list">
        <view v-for="card in cardsByGroup(group)" :key="card.id" class="setting-row">
          <view class="row-mark">
            <image class="row-icon" :src="card.icon" mode="aspectFit" />
          </view>
          <view class="row-copy">
            <text class="row-title">{{ card.title }}</text>
            <text class="row-description">{{ card.description }}</text>
          </view>
          <switch
            :checked="visibility[card.id]"
            color="#78aaa0"
            @change="toggleFromEvent(card.id, $event)"
          />
        </view>
      </view>
    </view>

    <view class="quiet-note">
      <text>首页只展示入口，所有记录都会继续保存在你的健康档案里。</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import AppNavBar from '../../../components/AppNavBar.vue';
import {
  HOME_CARD_DEFINITIONS,
  loadHomeCardVisibility,
  resetHomeCardVisibility,
  saveHomeCardVisibility,
  type HomeCardId,
} from '../home-card-settings.js';

const cards = HOME_CARD_DEFINITIONS;
const groups = [...new Set(cards.map((card) => card.group))];
const visibility = ref(loadHomeCardVisibility());
const visibleCount = computed(() => Object.values(visibility.value).filter(Boolean).length);

function cardsByGroup(group: string) {
  return cards.filter((card) => card.group === group);
}

function toggle(id: HomeCardId, checked: boolean) {
  visibility.value = { ...visibility.value, [id]: checked };
  saveHomeCardVisibility(visibility.value);
}

function toggleFromEvent(id: HomeCardId, event: Event) {
  toggle(id, Boolean((event as unknown as { detail?: { value?: boolean } }).detail?.value));
}

function reset() {
  visibility.value = resetHomeCardVisibility();
  uni.showToast({ title: '已恢复默认', icon: 'none' });
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 0 28rpx calc(64rpx + env(safe-area-inset-bottom));
  background: #f8f8f5;
  color: #3d4a47;
}
.intro {
  padding: 28rpx 4rpx 24rpx;
}
.eyebrow {
  display: block;
  color: #7aa096;
  font-size: 20rpx;
  font-weight: 700;
  letter-spacing: 1rpx;
}
.title {
  display: block;
  margin-top: 8rpx;
  color: #344541;
  font-size: 40rpx;
  font-weight: 700;
  letter-spacing: 0;
}
.subtitle {
  display: block;
  max-width: 620rpx;
  margin-top: 10rpx;
  color: #84918e;
  font-size: 21rpx;
  line-height: 1.55;
}
.summary-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22rpx 24rpx;
  border: 1rpx solid #e6ebe8;
  border-radius: 20rpx;
  background: #fff;
  box-shadow: 0 10rpx 24rpx rgba(71, 93, 86, 0.06);
}
.summary-value {
  color: #416e67;
  font-size: 40rpx;
  font-weight: 700;
  line-height: 1;
}
.summary-label {
  margin-left: 8rpx;
  color: #8a9894;
  font-size: 20rpx;
}
.reset-button {
  padding: 12rpx 18rpx;
  border: 1rpx solid #d9e5e0;
  border-radius: 18rpx;
  color: #668b83;
  background: #f4f8f6;
  font-size: 20rpx;
}
.settings-group {
  margin-top: 30rpx;
}
.group-title {
  display: block;
  margin: 0 4rpx 12rpx;
  color: #7f8f8a;
  font-size: 20rpx;
  font-weight: 700;
  letter-spacing: 1rpx;
}
.settings-list {
  overflow: hidden;
  border: 1rpx solid #e6ebe8;
  border-radius: 20rpx;
  background: #fff;
  box-shadow: 0 10rpx 24rpx rgba(71, 93, 86, 0.045);
}
.setting-row {
  display: flex;
  align-items: center;
  min-height: 112rpx;
  padding: 18rpx 20rpx;
}
.setting-row + .setting-row {
  border-top: 1rpx solid #edf1ef;
}
.row-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  flex: none;
  margin-right: 16rpx;
  border-radius: 18rpx;
  background: #f5f8f6;
  border: 1rpx solid #e8eeeb;
}
.row-icon {
  width: 64rpx;
  height: 64rpx;
  opacity: 0.9;
  mix-blend-mode: multiply;
}
.row-copy {
  min-width: 0;
  flex: 1;
}
.row-title,
.row-description {
  display: block;
}
.row-title {
  color: #465550;
  font-size: 25rpx;
  font-weight: 700;
}
.row-description {
  margin-top: 6rpx;
  overflow: hidden;
  color: #98a49f;
  font-size: 19rpx;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.setting-row switch {
  flex: none;
  transform: scale(0.8);
  transform-origin: right center;
}
.quiet-note {
  margin: 26rpx 4rpx 0;
  color: #99a39f;
  font-size: 18rpx;
  line-height: 1.5;
}
</style>
