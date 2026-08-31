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
        <image class="section-icon" src="/static/icons/svg/search.svg" mode="aspectFit" />
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
          <image class="section-icon" src="/static/icons/svg/review.svg" mode="aspectFit" />
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
        <image class="filter-icon" src="/static/icons/svg/check.svg" mode="aspectFit" />
        <text class="filter-text">绿灯食物</text>
      </button>
      <button class="filter-btn" @tap="selectCategory(null)">
        <image class="filter-icon" src="/static/icons/svg/meal.svg" mode="aspectFit" />
        <text class="filter-text">浏览全部</text>
      </button>
    </view>

    <!-- 分类筛选：进入页面即展示，搜索时继续作为筛选条件 -->
    <scroll-view
      v-if="categories.length > 0"
      class="category-tabs"
      scroll-x
    >
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

    <view v-if="!query && !selectedCategory && !selectedHealthLight" class="common-heading">
      <text class="common-title">常见食物</text>
      <text class="common-subtitle">按分类快速记录这一餐</text>
    </view>

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
      <image class="state-icon" src="/static/icons/svg/search.svg" mode="aspectFit" />
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
          <view class="food-icon">
            <image :src="getFoodCategoryIcon(food.category?.slug)" mode="aspectFit" />
          </view>
          <view class="food-info">
            <text class="food-name">{{ food.name }}</text>
            <view v-if="getHighlights(food).length > 0" class="food-tags">
              <text v-for="tag in getHighlights(food)" :key="tag" class="tag">{{ tag }}</text>
            </view>
            <text class="food-calories"> {{ food.nutrition?.energyKcal || 0 }} 千卡 / 100g </text>
          </view>
        </view>
        <view
          v-if="food.healthLight !== undefined && food.healthLight !== null"
          :class="['food-badge', 'badge-' + food.healthLight]"
        >
          {{ getHealthLabel(food.healthLight) }}
        </view>
      </button>
      <view v-if="totalPages > 1" class="pagination">
        <button class="page-button" :disabled="currentPage <= 1" @tap="goToPage(currentPage - 1)">上一页</button>
        <text class="page-number">{{ currentPage }} / {{ totalPages }}</text>
        <button class="page-button page-button--primary" :disabled="currentPage >= totalPages" @tap="goToPage(currentPage + 1)">下一页</button>
      </view>
    </view>

    <!-- 拍照识别入口 -->
    <button class="photo-entry" @tap="openRecognition">
      <view class="camera-mark">
        <image src="/static/icons/camera.jpg" mode="aspectFit" />
      </view>
      <view class="photo-copy">
        <text>拍照识别食物</text>
        <text>让序序先帮你看看</text>
      </view>
      <image class="photo-arrow" src="/static/icons/svg/forward.svg" mode="aspectFit" />
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
  type FoodCategory,
} from '../../features/food/food.service.js';
import type { FoodItem, MealType } from '../../features/food/food.types.js';
import { getFoodCategoryIcon } from '../../features/food/food-icon.js';
import { generateNutritionHighlights, getHealthLightLabel } from '../../utils/nutrition.js';
import { navigateToFoodConfirm, navigateToFoodRecognition } from '../../utils/router.js';

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
const mealType = ref<MealType>('lunch');
const selectedHealthLight = ref<number | undefined>(undefined);

// 搜索历史（localStorage）
const searchHistory = ref<string[]>([]);
const MAX_HISTORY = 10;

// 热门搜索关键词
const hotKeywords = [
  '鸡胸肉',
  '鸡蛋',
  '燕麦',
  '西兰花',
  '苹果',
  '牛奶',
  '香蕉',
  '番茄',
  '豆腐',
  '牛肉',
];

let searchTimer: number | null = null;

// 所有分类（包含"全部"选项）
const allCategories = computed(() => {
  const all = { id: null, name: '全部', slug: 'all', sortOrder: 0, count: totalCount.value };
  const order = ['staple', 'vegetable', 'meat-egg', 'soy', 'dairy', 'fruit', 'nut', 'beverage', 'snack', 'restaurant', 'oil', 'seasoning'];
  const rank = (slug: string) => { const index = order.indexOf(slug); return index < 0 ? 999 : index; };
  return [all, ...[...categories.value].sort((a, b) => rank(a.slug) - rank(b.slug))];
});

const commonFoodKeywords = ['米饭', '鸡蛋', '鸡胸肉', '西兰花', '苹果', '牛奶', '香蕉', '豆腐', '燕麦', '红薯'];

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
  const history = searchHistory.value.filter((item) => item !== trimmed);
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
    },
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
      healthLight: selectedHealthLight.value,
    });

    if (page === 1 && !query.value && !selectedCategory.value && !selectedHealthLight.value) {
      const commonResults = await Promise.all(commonFoodKeywords.map((keyword) => searchFoods({ query: keyword, pageSize: 2 })));
      const common = commonResults.flatMap((item) => item.items);
      const seen = new Set<string>();
      foods.value = [...common, ...result.items].filter((item) => !seen.has(item.id) && seen.add(item.id)).slice(0, pageSize);
    } else {
      foods.value = result.items;
    }
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

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value || loading.value) return;
  load(page);
  uni.pageScrollTo({ scrollTop: 0, duration: 180 });
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
  selectedHealthLight.value = level;
  currentPage.value = 1;
  // TODO: 添加 healthLight 参数到搜索
  load(1);
}

// 选择食物
function choose(food: FoodItem) {
  navigateToFoodConfirm(food.id, mealType.value);
  uni.$emit('food-selected', food);
}

// 打开拍照识别
function openRecognition() {
  navigateToFoodRecognition(mealType.value);
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
    const cat = categories.value.find((c) => c.id === selectedCategory.value);
    return cat ? `${cat.name} - ${totalCount.value} 种食物` : `${totalCount.value} 种食物`;
  }
  return `共 ${totalCount.value} 种食物`;
}

// 页面加载
onLoad(async (options) => {
  const requestedMealType = options?.mealType;
  if (
    requestedMealType === 'breakfast' ||
    requestedMealType === 'lunch' ||
    requestedMealType === 'dinner' ||
    requestedMealType === 'snack'
  ) {
    mealType.value = requestedMealType;
  }
  loadSearchHistory();
  await loadCategories();
  // 进入餐次记录页时直接展示目录；接口不可用时 searchFoods 会返回本地目录兜底。
  await load(1);
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 0 32rpx 140rpx;
  background: linear-gradient(180deg, #f8fdf9 0%, #f5f8f6 100%);
}

.common-heading { display:flex; align-items:baseline; justify-content:space-between; margin: 20rpx 2rpx 14rpx; }
.common-title { font-size: 30rpx; font-weight: 800; color: #244735; }
.common-subtitle { font-size: 22rpx; color: #88a092; }

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
  width: 28rpx;
  height: 28rpx;
  margin-right: 10rpx;
  opacity: 0.62;
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
  width: 30rpx;
  height: 30rpx;
  opacity: 0.72;
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
  display: flex;
  align-items: center;
  justify-content: center;
  width: 76rpx;
  height: 76rpx;
  flex: none;
  margin-right: 18rpx;
  border: 1rpx solid #dce9e0;
  border-radius: 22rpx;
  background: #f1f6f2;
}

.food-icon image {
  width: 62rpx;
  height: 62rpx;
  opacity: 1;
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

.state-icon {
  width: 54rpx;
  height: 54rpx;
  margin-bottom: 10rpx;
  opacity: 0.56;
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
  min-width: 300rpx;
  padding: 12rpx 16rpx 12rpx 12rpx;
  border: 1rpx solid #e4ece6;
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.96);
  box-shadow:
    0 12rpx 28rpx rgba(74, 104, 87, 0.14),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.98);
  line-height: 1.2;
}

.photo-entry::after {
  border: none;
}

.camera-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  flex: none;
  overflow: hidden;
  border-radius: 18rpx;
  background: #fff8eb;
}

.camera-mark image {
  width: 64rpx;
  height: 64rpx;
  mix-blend-mode: multiply;
}

.photo-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.photo-copy text:first-child {
  color: #40594f;
  font-size: 23rpx;
  font-weight: 700;
  margin-bottom: 2rpx;
}

.photo-copy text:last-child {
  color: #91a09a;
  font-size: 18rpx;
}

.photo-arrow {
  width: 28rpx;
  height: 28rpx;
  margin-left: auto;
  opacity: 0.56;
}
</style>
