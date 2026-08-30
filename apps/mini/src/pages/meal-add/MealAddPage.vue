<template>
  <view class="page">
    <AppNavBar :title="mealTitle" route="/pages/meal-add/MealAddPage" />

    <!-- 搜索框 -->
    <view class="search-section">
      <view class="search-box" @tap="goToSearch">
        <image class="search-icon" src="/static/icons/svg/search.svg" mode="aspectFit" />
        <text class="search-text">请输入食物名称</text>
      </view>
    </view>

    <!-- 快捷操作 -->
    <view class="quick-section">
      <button class="quick-item" @tap="copyRecord">
        <view class="quick-icon">📋</view>
        <text class="quick-label">复制记录</text>
      </button>
      <button class="quick-item" @tap="quickAdd">
        <view class="quick-icon">⚡</view>
        <text class="quick-label">快速记录</text>
      </button>
      <button class="quick-item" @tap="scanBarcode">
        <view class="quick-icon">📱</view>
        <text class="quick-label">扫条形码</text>
      </button>
    </view>

    <!-- 分类标签 -->
    <scroll-view class="category-scroll" scroll-x>
      <view class="category-list">
        <view 
          v-for="cat in categories" 
          :key="cat.id"
          :class="['category-item', { active: selectedCategory === cat.id }]"
          @tap="selectCategory(cat.id)"
        >
          {{ cat.name }}
        </view>
      </view>
    </scroll-view>

    <!-- 常见食物标题 -->
    <view class="section-title">
      <text class="title-text">常见食物</text>
    </view>

    <!-- 食物列表 -->
    <view class="food-section">
      <view v-if="loading" class="loading-state">
        <text>加载中...</text>
      </view>

      <view v-else-if="foodList.length === 0" class="empty-state">
        <text class="empty-icon">🍽️</text>
        <text class="empty-text">暂无食物数据</text>
      </view>

      <view v-else class="food-list">
        <view 
          v-for="food in foodList" 
          :key="food.id"
          class="food-card"
        >
          <!-- 食物图片 -->
          <image 
            v-if="food.thumbImageUrl" 
            :src="food.thumbImageUrl" 
            class="food-img"
            mode="aspectFill"
          />
          <view v-else class="food-img-placeholder">
            <text class="placeholder-emoji">{{ getFoodEmoji(food.name) }}</text>
          </view>

          <!-- 食物信息 -->
          <view class="food-content">
            <text class="food-name">{{ food.name }}</text>
            <view class="food-meta">
              <text class="food-cal">{{ Math.round(food.calories || 0) }}</text>
              <text class="food-unit">千卡</text>
              <text class="food-serving">/{{ food.servingSize || '100克' }}</text>
            </view>
          </view>

          <!-- 添加按钮 -->
          <button 
            :class="['add-btn', { selected: isSelected(food.id) }]"
            @tap="toggleFood(food)"
          >
            <text v-if="isSelected(food.id)" class="btn-text">✓</text>
            <text v-else class="btn-text">+</text>
          </button>
        </view>
      </view>
    </view>

    <!-- 已选食物悬浮栏 -->
    <view v-if="selectedFoods.length > 0" class="float-bar">
      <view class="bar-left">
        <image class="bar-icon" src="/static/icons/svg/restaurant.svg" mode="aspectFit" />
        <text class="bar-meal">{{ mealTypeLabel }}</text>
        <button class="bar-toggle" @tap="toggleMealType">
          <text>▼</text>
        </button>
      </view>
      <button class="bar-confirm" @tap="confirmAdd">
        <text>完成</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AppNavBar from '../../components/AppNavBar.vue';
import { navigateBack } from '../../utils/router.js';

interface FoodItem {
  id: string;
  name: string;
  calories?: number;
  servingSize?: string;
  thumbImageUrl?: string;
  protein?: number;
  fat?: number;
  carbs?: number;
}

const mealType = ref<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
const selectedCategory = ref('common');
const loading = ref(false);
const foodList = ref<FoodItem[]>([]);
const selectedFoods = ref<FoodItem[]>([]);

const categories = [
  { id: 'common', name: '常见' },
  { id: 'custom', name: '自定义' },
  { id: 'purchased', name: '已购' },
  { id: 'recipe', name: '食谱' },
  { id: 'favorite', name: '收藏' },
  { id: 'meal', name: '套餐' },
  { id: 'staple', name: '主食' },
  { id: 'fruit', name: '蔬果' },
  { id: 'meat', name: '肉蛋奶' },
  { id: 'snack', name: '豆类坚果' },
];

const mealTitle = computed(() => {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const mealNames = {
    breakfast: '早餐',
    lunch: '午餐',
    dinner: '晚餐',
    snack: '加餐',
  };
  return `${month}月${day}日${mealNames[mealType.value]}`;
});

const mealTypeLabel = computed(() => {
  const labels = {
    breakfast: '早餐',
    lunch: '午餐',
    dinner: '晚餐',
    snack: '加餐',
  };
  return labels[mealType.value];
});

function getFoodEmoji(name: string): string {
  const emojiMap: Record<string, string> = {
    '米饭': '🍚', '馒头': '🥟', '面条': '🍜', '面包': '🍞',
    '鸡蛋': '🥚', '牛奶': '🥛', '豆浆': '🥤', '咖啡': '☕',
    '鸡肉': '🍗', '牛肉': '🥩', '猪肉': '🥓', '鱼': '🐟',
    '苹果': '🍎', '香蕉': '🍌', '橙子': '🍊', '西瓜': '🍉',
    '番茄': '🍅', '黄瓜': '🥒', '胡萝卜': '🥕', '土豆': '🥔',
    '水': '💧', '茶': '🍵', '果汁': '🧃',
  };

  for (const key in emojiMap) {
    if (name.includes(key)) {
      return emojiMap[key];
    }
  }
  return '🍽️';
}

function selectCategory(catId: string) {
  selectedCategory.value = catId;
  loadFoods();
}

async function loadFoods() {
  loading.value = true;
  
  try {
    const res = await uni.request({
      url: 'http://localhost:3000/api/v1/foods/popular/list',
      method: 'GET',
      timeout: 5000,
    });

    if (res.statusCode === 200 && res.data) {
      foodList.value = (res.data as any).data || [];
    } else {
      throw new Error('加载失败');
    }
  } catch (error) {
    console.error('加载食物失败:', error);
    // 使用示例数据
    foodList.value = [
      { id: '1', name: '米饭', calories: 116, servingSize: '100克' },
      { id: '2', name: '煮鸡蛋', calories: 144, servingSize: '1个(50克)' },
      { id: '3', name: '馒头', calories: 221, servingSize: '100克' },
      { id: '4', name: '全麦面包', calories: 246, servingSize: '100克' },
      { id: '5', name: '牛奶', calories: 54, servingSize: '100毫升' },
      { id: '6', name: '豆浆', calories: 13, servingSize: '100毫升' },
      { id: '7', name: '鸡胸肉', calories: 133, servingSize: '100克' },
      { id: '8', name: '蒸红薯', calories: 86, servingSize: '100克' },
      { id: '9', name: '苹果', calories: 52, servingSize: '1个(中)' },
      { id: '10', name: '香蕉', calories: 89, servingSize: '1根' },
    ];
  } finally {
    loading.value = false;
  }
}

function isSelected(foodId: string): boolean {
  return selectedFoods.value.some(f => f.id === foodId);
}

function toggleFood(food: FoodItem) {
  const index = selectedFoods.value.findIndex(f => f.id === food.id);
  
  if (index > -1) {
    selectedFoods.value.splice(index, 1);
  } else {
    selectedFoods.value.push(food);
    uni.showToast({
      title: '已添加',
      icon: 'success',
      duration: 800,
    });
  }
}

function toggleMealType() {
  uni.showActionSheet({
    itemList: ['早餐', '午餐', '晚餐', '加餐'],
    success: (res) => {
      const types: Array<'breakfast' | 'lunch' | 'dinner' | 'snack'> = ['breakfast', 'lunch', 'dinner', 'snack'];
      mealType.value = types[res.tapIndex];
    },
  });
}

function confirmAdd() {
  if (selectedFoods.value.length === 0) {
    return;
  }

  // TODO: 保存到后端
  const totalCal = selectedFoods.value.reduce((sum, f) => sum + (f.calories || 0), 0);
  
  uni.showToast({
    title: `已记录 ${Math.round(totalCal)}千卡`,
    icon: 'success',
  });

  setTimeout(() => {
    navigateBack();
  }, 1500);
}

function goToSearch() {
  uni.navigateTo({
    url: '/pages/food-search/FoodSearchPage?from=meal-add',
  });
}

function copyRecord() {
  uni.showToast({
    title: '功能开发中',
    icon: 'none',
  });
}

function quickAdd() {
  uni.showToast({
    title: '功能开发中',
    icon: 'none',
  });
}

function scanBarcode() {
  uni.scanCode({
    success: (res) => {
      uni.showToast({
        title: '扫描成功',
        icon: 'success',
      });
    },
  });
}

onLoad((options) => {
  if (options?.mealType) {
    mealType.value = options.mealType as any;
  }
});

onMounted(() => {
  loadFoods();
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding-bottom: 140rpx;
  background: #f5f8f6;
}

/* 搜索区域 */
.search-section {
  padding: 24rpx 32rpx;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx;
  border-radius: 50rpx;
  background: #ffffff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.search-icon {
  width: 32rpx;
  height: 32rpx;
  opacity: 0.4;
}

.search-text {
  flex: 1;
  color: #999;
  font-size: 28rpx;
}

/* 快捷操作 */
.quick-section {
  display: flex;
  gap: 16rpx;
  padding: 0 32rpx 24rpx;
}

.quick-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 20rpx;
  border-radius: 16rpx;
  background: #ffffff;
  border: none;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.04);
}

.quick-item::after {
  border: none;
}

.quick-icon {
  font-size: 40rpx;
  line-height: 1;
}

.quick-label {
  color: #666;
  font-size: 22rpx;
  font-weight: 500;
}

/* 分类滚动 */
.category-scroll {
  padding: 0 32rpx 24rpx;
  white-space: nowrap;
}

.category-list {
  display: inline-flex;
  gap: 12rpx;
}

.category-item {
  display: inline-block;
  padding: 12rpx 24rpx;
  border-radius: 40rpx;
  background: #ffffff;
  color: #666;
  font-size: 24rpx;
  font-weight: 500;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.04);
  transition: all 0.3s;
}

.category-item.active {
  background: linear-gradient(135deg, #7fcc8f 0%, #6bb97d 100%);
  color: #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(127, 204, 143, 0.3);
}

/* 标题 */
.section-title {
  padding: 16rpx 32rpx;
}

.title-text {
  color: #333;
  font-size: 32rpx;
  font-weight: 700;
}

/* 食物区域 */
.food-section {
  padding: 0 32rpx 24rpx;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 20rpx;
  color: #999;
  font-size: 28rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

/* 食物列表 */
.food-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.food-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx;
  border-radius: 20rpx;
  background: #ffffff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  transition: transform 0.2s;
}

.food-card:active {
  transform: scale(0.98);
}

.food-img,
.food-img-placeholder {
  width: 100rpx;
  height: 100rpx;
  border-radius: 16rpx;
  flex-shrink: 0;
  background: #f5f5f5;
}

.food-img-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-emoji {
  font-size: 48rpx;
}

.food-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.food-name {
  color: #333;
  font-size: 30rpx;
  font-weight: 600;
}

.food-meta {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
}

.food-cal {
  color: #ff6b6b;
  font-size: 36rpx;
  font-weight: 800;
}

.food-unit {
  color: #999;
  font-size: 22rpx;
}

.food-serving {
  color: #999;
  font-size: 22rpx;
}

/* 添加按钮 */
.add-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: #f0f0f0;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.add-btn::after {
  border: none;
}

.add-btn.selected {
  background: linear-gradient(135deg, #7fcc8f 0%, #6bb97d 100%);
}

.btn-text {
  color: #666;
  font-size: 36rpx;
  font-weight: 600;
  line-height: 1;
}

.add-btn.selected .btn-text {
  color: #ffffff;
}

/* 悬浮栏 */
.float-bar {
  position: fixed;
  left: 32rpx;
  right: 32rpx;
  bottom: 32rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 24rpx;
  border-radius: 50rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
  z-index: 100;
}

.bar-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex: 1;
}

.bar-icon {
  width: 32rpx;
  height: 32rpx;
}

.bar-meal {
  color: #333;
  font-size: 28rpx;
  font-weight: 600;
}

.bar-toggle {
  width: 32rpx;
  height: 32rpx;
  padding: 0;
  border: none;
  background: transparent;
  color: #999;
  font-size: 20rpx;
  line-height: 1;
}

.bar-toggle::after {
  border: none;
}

.bar-confirm {
  padding: 16rpx 48rpx;
  border-radius: 50rpx;
  background: linear-gradient(135deg, #7fcc8f 0%, #6bb97d 100%);
  border: none;
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 700;
  box-shadow: 0 4rpx 12rpx rgba(127, 204, 143, 0.3);
}

.bar-confirm::after {
  border: none;
}
</style>
