<template>
  <view class="page">
    <view class="topbar"><button class="back" @tap="back">‹</button><view><text class="eyebrow">记下一餐</text><text class="title">选一份食物</text></view></view>
    <view class="search-box"><text class="search-icon">⌕</text><input v-model="query" confirm-type="search" placeholder="搜索米饭、鸡蛋、西兰花…" @confirm="load" /><button v-if="query" class="clear" @tap="query = ''">×</button></view>
    <view class="hint-row"><text>{{ query ? `找到 ${foods.length} 种相关食物` : '从常见食物开始记录' }}</text><text class="hint">营养值按每 100 克展示</text></view>
    <view v-if="loading" class="state">正在整理食物…</view>
    <view v-else-if="error" class="state error"><text>食物目录暂时没连接上</text><button @tap="load">重新加载</button></view>
    <view v-else-if="!foods.length" class="state"><text>还没有找到这份食物</text><text class="muted">可以试试更短的关键词</text></view>
    <view v-else class="food-list">
      <button v-for="food in foods" :key="food.id" class="food-row" @tap="choose(food)">
        <view class="food-mark">{{ food.name.slice(0, 1) }}</view>
        <view class="food-copy"><text class="food-name">{{ food.name }}</text><text class="food-meta">{{ food.category?.name || '日常食物' }} · {{ food.nutrition.energyKcal }} 千卡 / 100g</text></view>
        <text class="arrow">›</text>
      </button>
    </view>
    <button class="photo-entry" @tap="photoComing"><view class="photo-icon">✦</view><view><text>以后也可以拍照识别</text><text>先用目录记录，识别结果会让你确认后再保存</text></view><text class="arrow">›</text></button>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { searchFoods } from '../../features/food/food.service.js';
import type { FoodItem } from '../../features/food/food.types.js';
const query = ref('');
const foods = ref<FoodItem[]>([]);
const loading = ref(false);
const error = ref(false);
async function load() { loading.value = true; error.value = false; try { foods.value = await searchFoods(query.value); } catch { error.value = true; } finally { loading.value = false; } }
function choose(food: FoodItem) { uni.navigateTo({ url: `/pages/food-confirm/FoodConfirmPage?foodId=${encodeURIComponent(food.id)}` }); uni.$emit('food-selected', food); }
function back() { uni.navigateBack(); }
function photoComing() { uni.showToast({ title: '拍照识别将在下一阶段接入', icon: 'none' }); }
onLoad(load);
</script>

<style scoped>
.page{min-height:100vh;box-sizing:border-box;padding:38rpx 32rpx 60rpx;background:#f6faf7;color:#244735}.topbar{display:flex;align-items:center;gap:16rpx}.back{width:64rpx;height:64rpx;margin:0;padding:0;border:0;border-radius:20rpx;color:#315f42;background:#eaf3eb;font-size:48rpx;line-height:55rpx}.eyebrow,.title{display:block}.eyebrow{color:#72927b;font-size:21rpx}.title{margin-top:5rpx;font-size:39rpx;font-weight:700}.search-box{display:flex;align-items:center;height:82rpx;margin-top:28rpx;padding:0 18rpx;border:1rpx solid #d8e7da;border-radius:18rpx;background:#fff}.search-icon{margin-right:12rpx;color:#7da184;font-size:38rpx}.search-box input{flex:1;font-size:25rpx}.clear{width:44rpx;height:44rpx;margin:0;padding:0;border-radius:50%;color:#6f8a78;background:#edf5ee;font-size:30rpx;line-height:40rpx}.hint-row{display:flex;justify-content:space-between;margin:18rpx 4rpx 12rpx;color:#547561;font-size:22rpx}.hint{color:#91a696;font-size:19rpx}.food-list{border-top:1rpx solid #deebe0}.food-row{display:flex;align-items:center;width:100%;min-height:112rpx;padding:16rpx 4rpx;border-bottom:1rpx solid #e2ece3;text-align:left;background:transparent}.food-mark{display:flex;align-items:center;justify-content:center;width:70rpx;height:70rpx;margin-right:16rpx;border-radius:22rpx;color:#fff;background:#7eae86;font-size:30rpx;font-weight:700}.food-copy{flex:1;min-width:0}.food-name,.food-meta{display:block}.food-name{color:#31543e;font-size:27rpx;font-weight:700}.food-meta{margin-top:7rpx;color:#789080;font-size:20rpx}.arrow{padding-left:14rpx;color:#78a17f;font-size:40rpx}.state{display:flex;align-items:center;flex-direction:column;padding:120rpx 20rpx;color:#70897a;text-align:center;font-size:25rpx}.state .muted{margin-top:10rpx;color:#9aaca0;font-size:21rpx}.state button{margin-top:20rpx;padding:12rpx 24rpx;border-radius:12rpx;color:#fff;background:#357c50;font-size:22rpx}.photo-entry{display:flex;align-items:center;width:100%;margin-top:28rpx;padding:18rpx 4rpx;border-top:1rpx solid #dceadd;border-bottom:1rpx solid #dceadd;text-align:left;background:transparent}.photo-icon{display:flex;align-items:center;justify-content:center;width:64rpx;height:64rpx;margin-right:14rpx;border-radius:20rpx;color:#507c5b;background:#e8f2e8;font-size:30rpx}.photo-entry view{flex:1}.photo-entry text{display:block}.photo-entry text:first-child{color:#426d50;font-size:24rpx;font-weight:700}.photo-entry text:last-child{margin-top:5rpx;color:#859a8b;font-size:19rpx;line-height:1.4}
</style>
