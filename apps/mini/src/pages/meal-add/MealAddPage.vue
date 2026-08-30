<template>
  <view class="page">
    <AppNavBar :title="mealTitle" route="/pages/meal-add/MealAddPage" />

    <!-- 搜索框 -->
    <view class="search-bar">
      <view class="search-input" @tap="goToSearch">
        <image class="search-icon" src="/static/icons/svg/search.svg" mode="aspectFit" />
        <text class="search-placeholder">请输入食物名称</text>
      </view>
    </view>

    <!-- 快捷操作 -->
    <view class="quick-actions">
      <button class="quick-btn" @tap="copyRecord">
        <image class="btn-icon" src="/static/icons/svg/copy.svg" mode="aspectFit" />
        <text>复制记录</text>
      </button>
      <button class="quick-btn" @tap="quickAdd">
        <image class="btn-icon" src="/static/icons/svg/flash.svg" mode="aspectFit" />
        <text>快速记录</text>
      </button>
      <button class="quick-btn" @tap="scanBarcode">
        <image class="btn-icon" src="/static/icons/svg/qrcode.svg" mode="aspectFit" />
        <text>扫条形码</text>
      </button>
    </view>

    <!-- 分类标签 -->
    <view class="category-tabs">
      <button 
        v-for="cat in categories" 
        :key="cat.id"
        :class="['category-tab', { active: selectedCategory === cat.id }]"
        @tap="selectCategory(cat.id)"
      >
        {{ cat.name }}
      </button>
    </view>

    <!-- 食物列表 -->
    <view class="food-list">
      <view v-if="loading" class="loading">
        <text>加载中...</text>
      </view>

      <view v-else-if="foods.length === 0" class="empty">
        <text class="empty-icon">🍽️</text>
        <text class="empty-text">暂无食物</text>
      </view>

      <view v-else class="food-items">
        <view 
          v-for="food in foods" 
          :key="food.id"
          class="food-item"
        >
          <image 
            v-if="food.image" 
            :src="food.image" 
            class="food-image"
            mode="aspectFill"
          />
          <view v-else class="food-image-placeholder">
            <text>{{ food.emoji || '🍽️' }}</text>
          </view>

          <view class="food-info">
            <text class="food-name">{{ food.name }}</text>
            <view class="food-nutrition">
              <text class="calories">{{ food.calories }}</text>
              <text class="unit">千卡</text>
              <text class="serving">/ {{ food.serving }}</text>
            </view>
          </view>

          <view class="food-actions">
            <button 
              v-if="isInMeal(food.id)"
              class="action-btn selected"
              @tap="removeFromMeal(food.id)"
            >
              <image src="/static/icons/svg/check-circle.svg" mode="aspectFit" />
            </button>
            <button 
              v-else
              class="action-btn"
              @tap="addToMeal(food)"
            >
              <image src="/static/icons/svg/plus-circle.svg" mode="aspectFit" />
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar" v-if="selectedFoods.length > 0">
      <view class="meal-summary">
        <image class="meal-icon" src="/static/icons/svg/restaurant.svg" mode="aspectFit" />
        <text class="meal-label">{{ mealTypeLabel }}</text>
        <button class="meal-toggle" @tap="toggleMealType">
          <image src="/static/icons/svg/chevron-down.svg" mode="aspectFit" />
        </button>
      </view>

      <button class="complete-btn" @tap="completeMeal">
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

interface Food {
  id: string;
  name: string;
  calories: number;
  serving: string;
  image?: string;
  emoji?: string;
  protein?: number;
  fat?: number;
  carbs?: number;
}

interface Category {
  id: string;
  name: string;
}

const mealType = ref<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
const selectedCategory = ref('common');
const loading = ref(false);
const foods = ref<Food[]>([]);
const selectedFoods = ref<Food[]>([]);

const categories: Category[] = [
  { id: 'common', name: '常见' },
  { id: 'custom', name: '自定义' },
  { id: 'purchased', name: '已购' },
  { id: 'recipe', name: '食谱' },
  { id: 'favorite', name: '收藏' },
  { id: 'meal', name: '套餐' },
  { id: 'uploaded', name: '我的上传' },
  { id: 'vegetable', name: '我的菜肴' },
  { id: 'staple', name: '主食' },
  { id: 'fruit', name: '蔬果' },
  { id: 'meat', name: '肉蛋奶' },
  { id: 'snack', name: '豆类坚果' },
];

const mealTitle = computed(() => {
  const titles = {
    breakfast: '8月30日早餐',
    lunch: '8月30日午餐',
    dinner: '8月30日晚餐',
    snack: '8月30日加餐',
  };
  return titles[mealType.value];
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

// 常见食物数据（示例）
const commonFoods: Food[] = [
  { id: '1', name: '泉阳泉 天然矿泉水', calories: 0, serving: '600毫升', emoji: '💧' },
  { id: '2', name: '米饭', calories: 209, serving: '1碗', emoji: '🍚' },
  { id: '3', name: '煮鸡蛋', calories: 74, serving: '1个(中)带壳', emoji: '🥚' },
  { id: '4', name: '馒头', calories: 114, serving: '1个', emoji: '🍞' },
  { id: '5', name: '蒸红薯', calories: 84, serving: '1个(小)', emoji: '🍠' },
  { id: '6', name: '煎蛋', calories: 117, serving: '1个', emoji: '🍳' },
  { id: '7', name: '全麦面包', calories: 246, serving: '100克', emoji: '🍞' },
  { id: '8', name: '牛奶', calories: 54, serving: '100毫升', emoji: '🥛' },
  { id: '9', name: '豆浆', calories: 13, serving: '100毫升', emoji: '🥤' },
  { id: '10', name: '鸡胸肉', calories: 133, serving: '100克', emoji: '🍗' },
];

function selectCategory(catId: string) {
  selectedCategory.value = catId;
  loadFoods();
}

function loadFoods() {
  loading.value = true;
  
  setTimeout(() => {
    if (selectedCategory.value === 'common') {
      foods.value = commonFoods;
    } else {
      foods.value = [];
    }
    loading.value = false;
  }, 300);
}

function isInMeal(foodId: string): boolean {
  return selectedFoods.value.some(f => f.id === foodId);
}

function addToMeal(food: Food) {
  selectedFoods.value.push(food);
  
  uni.showToast({
    title: '已添加',
    icon: 'success',
    duration: 1000,
  });
}

function removeFromMeal(foodId: string) {
  selectedFoods.value = selectedFoods.value.filter(f => f.id !== foodId);
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

function completeMeal() {
  if (selectedFoods.value.length === 0) {
    uni.showToast({
      title: '请选择食物',
      icon: 'none',
    });
    return;
  }

  // TODO: 保存到后端
  uni.showToast({
    title: '记录成功',
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
    fail: () => {
      uni.showToast({
        title: '扫描失败',
        icon: 'none',
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
  background: linear-gradient(180deg, #f8fdf9 0%, #f5f8f6 100%);
}

/* 搜索框 */
.search-bar {
  padding: 24rpx 32rpx;
}

.search-input {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 24rpx;
  border-radius: 50rpx;
  background: #ffffff;
  border: 2rpx solid #d4e5d4;
  box-shadow: 0 2rpx 8rpx rgba(127, 204, 143, 0.08);
}

.search-icon {
  width: 32rpx;
  height: 32rpx;
  opacity: 0.5;
}

.search-placeholder {
  flex: 1;
  color: #9aaca0;
  font-size: 26rpx;
}

/* 快捷操作 */
.quick-actions {
  display: flex;
  gap: 16rpx;
  padding: 0 32rpx 24rpx;
}

.quick-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 20rpx 16rpx;
  border-radius: 16rpx;
  background: #f8fdf9;
  border: 2rpx solid #e8f3ea;
  color: #5c7a67;
  font-size: 22rpx;
  font-weight: 600;
  line-height: 1;
}

.quick-btn::after {
  border: none;
}

.btn-icon {
  width: 40rpx;
  height: 40rpx;
}

/* 分类标签 */
.category-tabs {
  display: flex;
  gap: 16rpx;
  padding: 0 32rpx 24rpx;
  overflow-x: auto;
  white-space: nowrap;
}

.category-tab {
  padding: 12rpx 24rpx;
  border-radius: 40rpx;
  background: #f8fdf9;
  border: 2rpx solid #e8f3ea;
  color: #5c7a67;
  font-size: 24rpx;
  font-weight: 600;
  line-height: 1;
  flex-shrink: 0;
}

.category-tab::after {
  border: none;
}

.category-tab.active {
  background: #7fcc8f;
  border-color: #7fcc8f;
  color: #ffffff;
}

/* 食物列表 */
.food-list {
  padding: 0 32rpx 24rpx;
}

.loading,
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 20rpx;
  color: #9aaca0;
  font-size: 24rpx;
}

.empty-icon {
  font-size: 64rpx;
  margin-bottom: 16rpx;
}

.food-items {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.food-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx;
  border-radius: 20rpx;
  background: #ffffff;
  box-shadow: 0 2rpx 8rpx rgba(127, 204, 143, 0.08);
}

.food-image,
.food-image-placeholder {
  width: 96rpx;
  height: 96rpx;
  border-radius: 16rpx;
  flex-shrink: 0;
}

.food-image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fdf9;
  font-size: 48rpx;
}

.food-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.food-name {
  color: #244735;
  font-size: 28rpx;
  font-weight: 600;
}

.food-nutrition {
  display: flex;
  align-items: baseline;
  gap: 6rpx;
}

.calories {
  color: #e89b8f;
  font-size: 32rpx;
  font-weight: 800;
}

.unit {
  color: #76907d;
  font-size: 20rpx;
}

.serving {
  color: #9aaca0;
  font-size: 20rpx;
}

.food-actions {
  flex-shrink: 0;
}

.action-btn {
  width: 56rpx;
  height: 56rpx;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn::after {
  border: none;
}

.action-btn image {
  width: 48rpx;
  height: 48rpx;
}

.action-btn.selected image {
  opacity: 1;
}

/* 底部操作栏 */
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 32rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10rpx);
  border-top: 1rpx solid #e8f3ea;
  box-shadow: 0 -4rpx 12rpx rgba(127, 204, 143, 0.05);
}

.meal-summary {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 20rpx;
  border-radius: 50rpx;
  background: #f8fdf9;
  border: 2rpx solid #d4e5d4;
}

.meal-icon {
  width: 32rpx;
  height: 32rpx;
}

.meal-label {
  color: #2d6943;
  font-size: 26rpx;
  font-weight: 700;
}

.meal-toggle {
  width: 32rpx;
  height: 32rpx;
  padding: 0;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}

.meal-toggle::after {
  border: none;
}

.meal-toggle image {
  width: 24rpx;
  height: 24rpx;
}

.complete-btn {
  flex: 1;
  padding: 20rpx;
  border: none;
  border-radius: 50rpx;
  background: linear-gradient(135deg, #7fcc8f 0%, #6bb97d 100%);
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 700;
  box-shadow: 0 4rpx 12rpx rgba(127, 204, 143, 0.3);
}

.complete-btn::after {
  border: none;
}
</style>
