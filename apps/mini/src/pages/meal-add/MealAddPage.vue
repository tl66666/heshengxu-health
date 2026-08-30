<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="navbar">
      <button class="nav-back" @tap="goBack">
        <text class="icon-back">←</text>
      </button>
      <view class="nav-title-wrap">
        <text class="nav-title">{{ mealTitle }}</text>
        <button class="nav-date" @tap="selectDate">
          <text class="icon-date">▼</text>
        </button>
      </view>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 搜索框 -->
    <view class="search-wrap">
      <view class="search-box" @tap="goToSearch">
        <text class="search-icon">🔍</text>
        <text class="search-placeholder">请输入食物名称</text>
      </view>
    </view>

    <!-- 快捷按钮 -->
    <view class="quick-btns">
      <view class="quick-btn" @tap="copyRecord">
        <text class="quick-icon">📋</text>
        <text class="quick-text">复制记录</text>
      </view>
      <view class="quick-btn" @tap="quickAdd">
        <text class="quick-icon">⚡</text>
        <text class="quick-text">快速记录</text>
      </view>
      <view class="quick-btn" @tap="scanCode">
        <text class="quick-icon">📷</text>
        <text class="quick-text">扫条形码</text>
      </view>
    </view>

    <!-- 分类 -->
    <view class="categories">
      <scroll-view class="category-scroll" scroll-x show-scrollbar="{{false}}">
        <view class="category-list">
          <text 
            v-for="cat in categories" 
            :key="cat.id"
            :class="['category-tag', currentCategory === cat.id ? 'active' : '']"
            @tap="switchCategory(cat.id)"
          >
            {{ cat.name }}
          </text>
        </view>
      </scroll-view>
    </view>

    <!-- 标题 -->
    <view class="section-header">
      <text class="section-title">常见食物</text>
    </view>

    <!-- 食物列表 -->
    <view class="food-list">
      <view v-if="loading" class="list-loading">
        <text>加载中...</text>
      </view>
      
      <view v-else-if="!foods || foods.length === 0" class="list-empty">
        <text class="empty-text">暂无食物</text>
      </view>
      
      <view v-else class="food-items">
        <view 
          v-for="food in foods" 
          :key="food.id"
          class="food-item"
        >
          <!-- 左侧图片 -->
          <view class="food-pic">
            <image 
              v-if="food.imageUrl" 
              :src="food.imageUrl" 
              class="food-img" 
              mode="aspectFill"
            />
            <text v-else class="food-emoji">{{ getEmoji(food.name) }}</text>
          </view>

          <!-- 中间信息 -->
          <view class="food-info">
            <text class="food-name">{{ food.name }}</text>
            <view class="food-stats">
              <text class="food-cal">{{ food.calories || 0 }}</text>
              <text class="food-unit">千卡/</text>
              <text class="food-serving">{{ food.serving }}</text>
            </view>
          </view>

          <!-- 右侧按钮 -->
          <view class="food-action">
            <button 
              :class="['add-btn', isAdded(food.id) ? 'added' : '']"
              @tap="toggleFood(food)"
            >
              <text class="add-icon">{{ isAdded(food.id) ? '✓' : '+' }}</text>
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部栏 -->
    <view v-if="selectedFoods.length > 0" class="bottom-bar">
      <view class="bar-meal">
        <image class="meal-icon" src="/static/icons/svg/restaurant.svg" mode="aspectFit" />
        <text class="meal-name">{{ mealLabel }}</text>
        <button class="meal-arrow" @tap="changeMeal">
          <text>▼</text>
        </button>
      </view>
      <button class="bar-done" @tap="done">
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
  imageUrl?: string;
}

const mealType = ref<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
const currentCategory = ref('common');
const loading = ref(false);
const foods = ref<Food[]>([]);
const selectedFoods = ref<Food[]>([]);

const categories = [
  { id: 'common', name: '常见' },
  { id: 'custom', name: '自定义' },
  { id: 'bought', name: '已购' },
  { id: 'recipe', name: '食谱' },
  { id: 'fav', name: '收藏' },
  { id: 'package', name: '套餐' },
  { id: 'upload', name: '我的上传' },
  { id: 'dish', name: '我的菜肴' },
  { id: 'staple', name: '主食' },
  { id: 'veg', name: '蔬果' },
  { id: 'meat', name: '肉蛋奶' },
  { id: 'bean', name: '豆类坚果' },
];

const mealTitle = computed(() => {
  const d = new Date();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const meals: Record<string, string> = {
    breakfast: '早餐',
    lunch: '午餐',
    dinner: '晚餐',
    snack: '加餐',
  };
  return `${m}月${day}日${meals[mealType.value]}`;
});

const mealLabel = computed(() => {
  const meals: Record<string, string> = {
    breakfast: '早餐',
    lunch: '午餐',
    dinner: '晚餐',
    snack: '加餐',
  };
  return meals[mealType.value];
});

function getEmoji(name: string): string {
  const map: Record<string, string> = {
    '泉阳泉': '💧',
    '水': '💧',
    '米饭': '🍚',
    '煮鸡蛋': '🥚',
    '鸡蛋': '🥚',
    '馒头': '🥟',
    '蒸红薯': '🍠',
    '红薯': '🍠',
    '煎蛋': '🍳',
    '牛奶': '🥛',
    '豆浆': '🥤',
    '面包': '🍞',
    '鸡肉': '🍗',
    '苹果': '🍎',
  };
  
  for (const key in map) {
    if (name.includes(key)) return map[key];
  }
  return '🍽️';
}

function switchCategory(id: string) {
  currentCategory.value = id;
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
      const data: any = res.data;
      foods.value = (data.data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        calories: Math.round(item.calories || 0),
        serving: item.servingSize || '100克',
      }));
    }
  } catch (err) {
    console.error('加载失败', err);
    // 示例数据
    foods.value = [
      { id: '1', name: '泉阳泉 天然矿泉水', calories: 0, serving: '600毫升' },
      { id: '2', name: '米饭', calories: 209, serving: '1碗' },
      { id: '3', name: '煮鸡蛋', calories: 74, serving: '1个(中)带壳' },
      { id: '4', name: '馒头', calories: 114, serving: '1个' },
      { id: '5', name: '蒸红薯', calories: 84, serving: '1个(小)' },
      { id: '6', name: '煎蛋', calories: 117, serving: '1个' },
    ];
  } finally {
    loading.value = false;
  }
}

function isAdded(id: string): boolean {
  return selectedFoods.value.some(f => f.id === id);
}

function toggleFood(food: Food) {
  const idx = selectedFoods.value.findIndex(f => f.id === food.id);
  if (idx > -1) {
    selectedFoods.value.splice(idx, 1);
  } else {
    selectedFoods.value.push(food);
  }
}

function changeMeal() {
  uni.showActionSheet({
    itemList: ['早餐', '午餐', '晚餐', '加餐'],
    success: (res) => {
      const types: Array<typeof mealType.value> = ['breakfast', 'lunch', 'dinner', 'snack'];
      mealType.value = types[res.tapIndex];
    },
  });
}

function done() {
  const total = selectedFoods.value.reduce((sum, f) => sum + f.calories, 0);
  uni.showToast({
    title: `已记录 ${Math.round(total)}千卡`,
    icon: 'success',
  });
  setTimeout(() => navigateBack(), 1500);
}

function goBack() {
  navigateBack();
}

function selectDate() {
  uni.showToast({ title: '功能开发中', icon: 'none' });
}

function goToSearch() {
  uni.navigateTo({ url: '/pages/food-search/FoodSearchPage' });
}

function copyRecord() {
  uni.showToast({ title: '功能开发中', icon: 'none' });
}

function quickAdd() {
  uni.showToast({ title: '功能开发中', icon: 'none' });
}

function scanCode() {
  uni.scanCode({
    success: () => uni.showToast({ title: '扫描成功', icon: 'success' }),
  });
}

onLoad((opts) => {
  if (opts?.mealType) mealType.value = opts.mealType as any;
});

onMounted(() => {
  loadFoods();
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

/* 顶部导航 */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 32rpx;
  padding-top: calc(20rpx + env(safe-area-inset-top));
  background: #fff;
}

.nav-back {
  width: 64rpx;
  height: 64rpx;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 40rpx;
  line-height: 1;
}

.nav-back::after { border: none; }
.icon-back { color: #333; }

.nav-title-wrap {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.nav-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.nav-date {
  width: 48rpx;
  height: 48rpx;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 24rpx;
  line-height: 1;
  color: #999;
}

.nav-date::after { border: none; }

.nav-placeholder {
  width: 64rpx;
}

/* 搜索 */
.search-wrap {
  padding: 24rpx 32rpx;
  background: #fff;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 32rpx;
  border-radius: 60rpx;
  background: #f5f5f5;
}

.search-icon {
  font-size: 32rpx;
}

.search-placeholder {
  font-size: 28rpx;
  color: #999;
}

/* 快捷按钮 */
.quick-btns {
  display: flex;
  padding: 24rpx 32rpx;
  gap: 24rpx;
  background: #fff;
}

.quick-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  background: #f8f9fa;
}

.quick-icon {
  font-size: 44rpx;
}

.quick-text {
  font-size: 24rpx;
  color: #666;
}

/* 分类 */
.categories {
  background: #fff;
  padding: 0 32rpx 24rpx;
}

.category-scroll {
  white-space: nowrap;
}

.category-list {
  display: inline-flex;
  gap: 16rpx;
}

.category-tag {
  display: inline-block;
  padding: 12rpx 28rpx;
  border-radius: 40rpx;
  font-size: 26rpx;
  color: #666;
  background: #f5f5f5;
}

.category-tag.active {
  background: #5fbe7a;
  color: #fff;
}

/* 标题 */
.section-header {
  padding: 32rpx 32rpx 24rpx;
}

.section-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}

/* 食物列表 */
.food-list {
  padding: 0 32rpx;
}

.list-loading,
.list-empty {
  padding: 120rpx 0;
  text-align: center;
  color: #999;
  font-size: 28rpx;
}

.food-items {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.food-item {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 20rpx;
}

.food-pic {
  width: 100rpx;
  height: 100rpx;
  border-radius: 16rpx;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.food-img {
  width: 100%;
  height: 100%;
  border-radius: 16rpx;
}

.food-emoji {
  font-size: 56rpx;
}

.food-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.food-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
}

.food-stats {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
}

.food-cal {
  font-size: 36rpx;
  font-weight: 600;
  color: #ff6b6b;
}

.food-unit,
.food-serving {
  font-size: 24rpx;
  color: #999;
}

.food-action {
  flex-shrink: 0;
}

.add-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  padding: 0;
  border: none;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-btn::after { border: none; }

.add-btn.added {
  background: #5fbe7a;
}

.add-icon {
  font-size: 40rpx;
  font-weight: 600;
  color: #999;
  line-height: 1;
}

.add-btn.added .add-icon {
  color: #fff;
}

/* 底部栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -2rpx 20rpx rgba(0,0,0,0.08);
}

.bar-meal {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 24rpx;
  border-radius: 50rpx;
  background: #f5f5f5;
}

.meal-icon {
  width: 32rpx;
  height: 32rpx;
}

.meal-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
}

.meal-arrow {
  width: 32rpx;
  height: 32rpx;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 20rpx;
  color: #999;
}

.meal-arrow::after { border: none; }

.bar-done {
  flex: 1;
  padding: 20rpx;
  border-radius: 50rpx;
  border: none;
  background: #5fbe7a;
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
}

.bar-done::after { border: none; }
</style>
