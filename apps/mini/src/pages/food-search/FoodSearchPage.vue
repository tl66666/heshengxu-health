<template>
  <view class="page">
    <AppNavBar title="选择食物" route="/pages/food-search/FoodSearchPage" />

    <view class="intro">
      <text class="eyebrow">记下一餐</text>
      <text class="title">从食物目录开始</text>
      <text class="subtitle">支持中文、拼音搜索，9000+ 种食物任你选</text>
    </view>

    <!-- 搜索框 -->
    <view class="search-box">
      <image class="search-icon" src="/static/icons/svg/search.svg" mode="aspectFit" />
      <input
        v-model="query"
        confirm-type="search"
        placeholder="搜索食物、菜品或拼音"
        @input="onSearchInput"
        @confirm="handleSearch"
      />
      <button v-if="query" class="clear" aria-label="清空搜索" @tap="clearQuery">
        <image src="/static/icons/svg/close.svg" mode="aspectFit" />
      </button>
    </view>

    <!-- 热门搜索 - 仅在未搜索时显示 -->
    <view v-if="!query && !selectedCategory" class="hot-searches">
      <view class="section-header">
        <text class="section-icon">🔥</text>
        <text class="section-title">热门搜索</text>
      </view>
      <view class="tag-list">
        <button
          v-for="keyword in hotKeywords"
          :key="keyword"
          class="tag-btn"
          @tap="searchByKeyword(keyword)"
        >
          {{ keyword }}
        </button>
      </view>
    </view>

    <!-- 搜索历史 - 仅在未搜索时显示 -->
    <view v-if="!query && !selectedCategory && searchHistory.length > 0" class="search-history">
      <view class="section-header">
        <view class="section-left">
          <text class="section-icon">📚</text>
          <text class="section-title">搜索历史</text>
        </view>
        <button class="clear-history" @tap="clearHistory">清空</button>
      </view>
      <view class="history-list">
        <button
          v-for="(item, index) in searchHistory"
          :key="index"
          class="history-item"
          @tap="searchByKeyword(item)"
        >
          <text class="history-text">{{ item }}</text>
        </button>
      </view>
    </view>

    <!-- 快捷筛选 -->
    <view v-if="!query && !selectedCategory" class="quick-filters">
      <button class="filter-btn green" @tap="filterByHealthLight(1)">
        <text class="filter-icon">🟢</text>
        <text class="filter-text">绿灯食物</text>
      </button>
      <button class="filter-btn" @tap="selectCategory(null)">
        <text class="filter-icon">🍽️</text>
        <text class="filter-text">浏览全部</text>
      </button>
    </view>

    <!-- 分类筛选 -->
    <scroll-view v-if="categories.length > 0 && (query || selectedCategory)" class="category-tabs" scroll-x>
      <view class="category-list">
        <view 
          v-for="cat in allCategories" 
          :key="cat.id || 'all'" 
          :class="['category-tab', { active: selectedCategory === cat.id }]"
          @tap="selectCategory(cat.id)"
        >
          <text>{{ cat.name }}</text>
          <text v-if="cat.count !== undefined" class="count">({{ cat.count }})</text>
        </view>
      </view>
    </scroll-view>

    <!-- 结果统计 -->
    <view v-if="query || selectedCategory" class="result-caption">
      <text>{{ getResultText() }}</text>
      <text v-if="totalPages > 1" class="page-info">第 {{ currentPage }}/{{ totalPages }} 页</text>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="state">
      <text>正在搜索...</text>
    </view>

    <!-- 错误状态 -->
    <view v-else-if="error" class="state state--error">
      <text>搜索出错了</text>
      <text class="state-copy">请检查网络连接</text>
      <button class="retry" @tap="load">重新加载</button>
    </view>

    <!-- 空状态 -->
    <view v-else-if="(query || selectedCategory) && foods.length === 0" class="state">
      <text>🔍</text>
      <text class="state-copy">没有找到相关食物</text>
      <text class="state-copy">试试换个关键词</text>
    </view>

    <!-- 食物列表 -->
    <view v-else-if="foods.length > 0" class="food-list">
      <button
        v-for="food in foods"
        :key="food.id"
        class="food-card"
        hover-class="food-card-active"
        @tap="choose(food)"
      >
        <view class="food-main">
          <view class="food-icon">{{ getFoodEmoji(food.name, food.category?.slug) }}</view>
          <view class="food-info">
            <text class="food-name">{{ food.name }}</text>
            <view v-if="getHighlights(food).length > 0" class="food-tags">
              <text v-for="tag in getHighlights(food)" :key="tag" class="tag">{{ tag }}</text>
            </view>
            <text class="food-calories">
              {{ food.nutrition?.energyKcal || 0 }} 千卡 / 100g
            </text>
          </view>
        </view>
        <view :class="['food-badge', 'badge-' + food.healthLight]">
          {{ getHealthLabel(food.healthLight) }}
        </view>
      </button>
    </view>

    <!-- 拍照识别入口 -->
    <button class="photo-entry" @tap="openRecognition">
      <view class="camera-mark">
        <image src="/static/icons/svg/camera.svg" mode="aspectFit" />
      </view>
      <view class="photo-copy">
        <text>拍照识别食物</text>
        <text>快速记录，AI 帮你识别</text>
      </view>
    </button>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';
import { ref, computed } from 'vue';
import AppNavBar from '../../components/AppNavBar.vue';
import { 
  searchFoods, 
  getCategoryStats,
  type FoodCategory 
} from '../../features/food/food.service.js';
import type { FoodItem } from '../../features/food/food.types.js';
import { 
  getFoodEmoji, 
  generateNutritionHighlights, 
  getHealthLightLabel 
} from '../../utils/nutrition.js';
import { 
  navigateToFoodConfirm,
  navigateToFoodRecognition 
} from '../../utils/router.js';

const query = ref('');
const foods = ref<FoodItem[]>([]);
const loading = ref(false);
const error = ref(false);
const categories = ref<FoodCategory[]>([]);
const selectedCategory = ref<string | null>(null);
const totalCount = ref(0);
const currentPage = ref(1);
const totalPages = ref(1);
const pageSize = 20;

// 搜索历史（localStorage）
const searchHistory = ref<string[]>([]);
const MAX_HISTORY = 10;

// 热门搜索关键词
const hotKeywords = [
  '鸡胸肉', '鸡蛋', '燕麦', '西兰花', '苹果',
  '牛奶', '香蕉', '番茄', '豆腐', '牛肉'
];

let searchTimer: number | null = null;

// 所有分类（包含"全部"选项）
const allCategories = computed(() => {
  const all = { id: null, name: '全部', slug: 'all', sortOrder: 0, count: totalCount.value };
  return [all, ...categories.value];
});

// 加载搜索历史
function loadSearchHistory() {
  try {
    const history = uni.getStorageSync('searchHistory');
    if (history) {
      searchHistory.value = JSON.parse(history);
    }
  } catch (e) {
    console.error('加载搜索历史失败:', e);
  }
}

// 保存搜索历史
function saveSearchHistory(keyword: string) {
  if (!keyword || keyword.trim() === '') return;
  
  const trimmed = keyword.trim();
  const history = searchHistory.value.filter(item => item !== trimmed);
  history.unshift(trimmed);
  
  // 限制数量
  searchHistory.value = history.slice(0, MAX_HISTORY);
  
  try {
    uni.setStorageSync('searchHistory', JSON.stringify(searchHistory.value));
  } catch (e) {
    console.error('保存搜索历史失败:', e);
  }
}

// 清空搜索历史
function clearHistory() {
  uni.showModal({
    title: '清空搜索历史',
    content: '确定要清空所有搜索历史吗？',
    success: (res) => {
      if (res.confirm) {
        searchHistory.value = [];
        try {
          uni.removeStorageSync('searchHistory');
        } catch (e) {
          console.error('清空搜索历史失败:', e);
        }
      }
    }
  });
}

// 加载分类数据
async function loadCategories() {
  try {
    categories.value = await getCategoryStats();
    totalCount.value = categories.value.reduce((sum, cat) => sum + (cat.count || 0), 0);
  } catch (err) {
    console.error('加载分类失败:', err);
  }
}

// 搜索食物
async function load(page = 1) {
  loading.value = true;
  error.value = false;
  try {
    const result = await searchFoods({
      query: query.value || undefined,
      categoryId: selectedCategory.value || undefined,
      page,
      pageSize,
    });
    
    foods.value = result.items;
    totalCount.value = result.total;
    currentPage.value = result.page;
    totalPages.value = result.totalPages;
    
    // 保存搜索历史
    if (query.value && query.value.trim()) {
      saveSearchHistory(query.value.trim());
    }
  } catch (err) {
    console.error('搜索失败:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
}

// 搜索输入防抖
function onSearchInput() {
  if (searchTimer) {
    clearTimeout(searchTimer);
  }
  searchTimer = setTimeout(() => {
    if (query.value || selectedCategory.value) {
      currentPage.value = 1;
      load(1);
    }
  }, 500);
}

// 搜索确认
function handleSearch() {
  if (query.value || selectedCategory.value) {
    currentPage.value = 1;
    load(1);
  }
}

// 清空搜索
function clearQuery() {
  query.value = '';
  selectedCategory.value = null;
  foods.value = [];
  currentPage.value = 1;
}

// 通过关键词搜索
function searchByKeyword(keyword: string) {
  query.value = keyword;
  selectedCategory.value = null;
  currentPage.value = 1;
  load(1);
}

// 选择分类
function selectCategory(categoryId: string | null) {
  selectedCategory.value = categoryId;
  currentPage.value = 1;
  load(1);
}

// 按健康等级筛选
function filterByHealthLight(level: number) {
  // 这里可以扩展，暂时跳转到全部绿灯食物
  selectedCategory.value = null;
  currentPage.value = 1;
  // TODO: 添加 healthLight 参数到搜索
  load(1);
}

// 选择食物
function choose(food: FoodItem) {
  navigateToFoodConfirm(food.id);
  uni.$emit('food-selected', food);
}

// 打开拍照识别
function openRecognition() {
  navigateToFoodRecognition();
}

// 获取营养亮点
function getHighlights(food: FoodItem): string[] {
  if (!food.nutrition) return [];
  return generateNutritionHighlights(food.nutrition);
}

// 获取健康标签
function getHealthLabel(level: number): string {
  return getHealthLightLabel(level);
}

// 获取结果文本
function getResultText() {
  if (loading.value) return '搜索中...';
  if (error.value) return '搜索失败';
  if (query.value) {
    return `找到 ${totalCount.value} 种相关食物`;
  }
  if (selectedCategory.value) {
    const cat = categories.value.find(c => c.id === selectedCategory.value);
    return cat ? `${cat.name} - ${totalCount.value} 种食物` : `${totalCount.value} 种食物`;
  }
  return `共 ${totalCount.value} 种食物`;
}

// 页面加载
onLoad(async () => {
  loadSearchHistory();
  await loadCategories();
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 0 32rpx 140rpx;
  background: linear-gradient(180deg, #f8fdf9 0%, #f5f8f6 100%);
}

/* 介绍区域 */
.intro {
  padding: 20rpx 2rpx 24rpx;
}

.eyebrow {
  display: block;
  color: #72927b;
  font-size: 21rpx;
  font-weight: 700;
  margin-bottom: 6rpx;
}

.title {
  display: block;
  margin-top: 6rpx;
  color: #244735;
  font-size: 39rpx;
  font-weight: 700;
}

.subtitle {
  display: block;
  margin-top: 8rpx;
  color: #829587;
  font-size: 21rpx;
  line-height: 1.5;
}

/* 搜索框 */
.search-box {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
  padding: 20rpx 24rpx;
  border: 2rpx solid #c8dcc8;
  border-radius: 20rpx;
  background: #fff;
  box-shadow: 0 4rpx 12rpx rgba(127, 204, 143, 0.08);
}

.search-icon {
  width: 36rpx;
  height: 36rpx;
  margin-right: 16rpx;
  opacity: 0.6;
}

.search-box input {
  flex: 1;
  color: #244735;
  font-size: 28rpx;
}

.search-box input::placeholder {
  color: #99b3a0;
}

.clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40rpx;
  height: 40rpx;
  margin-left: 12rpx;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: #e8f3ea;
  line-height: 1;
}

.clear::after {
  border: none;
}

.clear image {
  width: 20rpx;
  height: 20rpx;
  opacity: 0.6;
}

/* 区块标题 */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.section-left {
  display: flex;
  align-items: center;
}

.section-icon {
  font-size: 28rpx;
  margin-right: 8rpx;
}

.section-title {
  color: #2d6943;
  font-size: 26rpx;
  font-weight: 700;
}

/* 热门搜索 */
.hot-searches {
  margin-bottom: 28rpx;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.tag-btn {
  padding: 14rpx 24rpx;
  border: 2rpx solid #d4e5d4;
  border-radius: 30rpx;
  background: #fff;
  color: #5c7a67;
  font-size: 24rpx;
  font-weight: 500;
  line-height: 1;
}

.tag-btn::after {
  border: none;
}

.tag-btn:active {
  background: #e8f3ea;
  border-color: #6b9478;
}

/* 搜索历史 */
.search-history {
  margin-bottom: 28rpx;
}

.clear-history {
  padding: 6rpx 16rpx;
  border: none;
  background: transparent;
  color: #99b3a0;
  font-size: 22rpx;
  line-height: 1;
}

.clear-history::after {
  border: none;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 14rpx 20rpx;
  border: none;
  border-radius: 12rpx;
  background: #fff;
  text-align: left;
  line-height: 1;
}

.history-item::after {
  border: none;
}

.history-text {
  color: #5c7a67;
  font-size: 24rpx;
  font-weight: 500;
}

/* 快捷筛选 */
.quick-filters {
  display: flex;
  gap: 12rpx;
  margin-bottom: 28rpx;
}

.filter-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 20rpx;
  border: 2rpx solid #d4e5d4;
  border-radius: 16rpx;
  background: #fff;
  line-height: 1;
}

.filter-btn::after {
  border: none;
}

.filter-btn.green {
  border-color: #7fcc8f;
  background: linear-gradient(135deg, #e8f3ea 0%, #d4e5d4 100%);
}

.filter-icon {
  font-size: 32rpx;
}

.filter-text {
  color: #2d6943;
  font-size: 26rpx;
  font-weight: 600;
}

/* 分类筛选 */
.category-tabs {
  margin-bottom: 20rpx;
  white-space: nowrap;
}

.category-list {
  display: inline-flex;
  gap: 12rpx;
  padding: 0 4rpx 12rpx;
}

.category-tab {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  padding: 14rpx 24rpx;
  border: 2rpx solid #d4e5d4;
  border-radius: 30rpx;
  background: #fff;
  color: #5c7a67;
  font-size: 24rpx;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.category-tab.active {
  border-color: #6b9478;
  background: linear-gradient(135deg, #e8f3ea 0%, #d4e5d4 100%);
  color: #244735;
  font-weight: 600;
}

.category-tab .count {
  color: #99b3a0;
  font-size: 20rpx;
}

.category-tab.active .count {
  color: #5c7a67;
}

/* 结果统计 */
.result-caption {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
  color: #6b9478;
  font-size: 23rpx;
  font-weight: 600;
}

.page-info {
  color: #99b3a0;
  font-size: 22rpx;
  font-weight: 500;
}

/* 食物列表 */
.food-list {
  margin-bottom: 100rpx;
}

.food-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18rpx 20rpx;
  margin-bottom: 12rpx;
  border-radius: 16rpx;
  background: #ffffff;
  border: 2rpx solid #e8f3ea;
  text-align: left;
  transition: all 0.2s ease;
}

.food-card::after {
  border: none;
}

.food-card-active {
  transform: scale(0.98);
  background: #f8fdf9;
  border-color: #7fcc8f;
}

.food-main {
  display: flex;
  align-items: center;
  flex: 1;
}

.food-icon {
  width: 48rpx;
  height: 48rpx;
  margin-right: 16rpx;
  font-size: 32rpx;
  line-height: 48rpx;
  text-align: center;
}

.food-info {
  flex: 1;
}

.food-name {
  display: block;
  color: #2d6943;
  font-size: 26rpx;
  font-weight: 700;
  margin-bottom: 6rpx;
}

.food-tags {
  display: flex;
  gap: 8rpx;
  margin-bottom: 6rpx;
}

.tag {
  padding: 2rpx 8rpx;
  border-radius: 6rpx;
  background: #e8f3ea;
  color: #5a9572;
  font-size: 18rpx;
  font-weight: 600;
}

.food-calories {
  display: block;
  color: #76907d;
  font-size: 22rpx;
}

.food-badge {
  padding: 6rpx 12rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  font-weight: 700;
}

.badge-1 {
  background: rgba(127, 204, 143, 0.15);
  color: #5a9572;
}

.badge-2 {
  background: rgba(245, 217, 154, 0.15);
  color: #d4a748;
}

.badge-0 {
  background: rgba(232, 155, 143, 0.15);
  color: #d46a56;
}

/* 状态 */
.state {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 120rpx 20rpx;
  color: #70897a;
  text-align: center;
  font-size: 25rpx;
}

.state-copy {
  margin-top: 10rpx;
  color: #9aaca0;
  font-size: 21rpx;
}

.state--error {
  color: #ad624e;
}

.retry {
  margin-top: 20rpx;
  padding: 12rpx 24rpx;
  border: 1rpx solid #bfd6c1;
  border-radius: 12rpx;
  color: #426a4e;
  background: #eef6ee;
  font-size: 22rpx;
}

.retry::after {
  border: none;
}

/* 拍照入口 */
.photo-entry {
  position: fixed;
  right: 32rpx;
  bottom: 120rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 24rpx;
  border: none;
  border-radius: 40rpx;
  background: linear-gradient(135deg, #7fcc8f 0%, #6bb97d 100%);
  box-shadow: 0 8rpx 24rpx rgba(127, 204, 143, 0.4);
  line-height: 1;
}

.photo-entry::after {
  border: none;
}

.camera-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
}

.camera-mark image {
  width: 24rpx;
  height: 24rpx;
  filter: brightness(0) invert(1);
}

.photo-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.photo-copy text:first-child {
  color: #ffffff;
  font-size: 24rpx;
  font-weight: 700;
  margin-bottom: 2rpx;
}

.photo-copy text:last-child {
  color: rgba(255, 255, 255, 0.85);
  font-size: 18rpx;
}
</style>
