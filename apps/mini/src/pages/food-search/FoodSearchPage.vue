<template>
  <view class="page">
    <AppNavBar title="选择食物" route="/pages/food-search/FoodSearchPage" />

    <view class="intro">
      <text class="eyebrow">记下一餐</text>
      <text class="title">从食物目录开始</text>
      <text class="subtitle">选择食物和份量后，再确认保存到今天的记录。</text>
    </view>

    <view class="search-box">
      <image class="search-icon" src="/static/icons/svg/search.svg" mode="aspectFit" />
      <input
        v-model="query"
        confirm-type="search"
        placeholder="搜索米饭、鸡蛋、西兰花或拼音"
        @input="onSearchInput"
        @confirm="load"
      />
      <button v-if="query" class="clear" aria-label="清空搜索" @tap="clearQuery">
        <image src="/static/icons/svg/close.svg" mode="aspectFit" />
      </button>
    </view>

    <!-- 分类筛选 -->
    <scroll-view v-if="categories.length > 0" class="category-tabs" scroll-x>
      <view class="category-list">
        <view 
          v-for="cat in allCategories" 
          :key="cat.id" 
          :class="['category-tab', { active: selectedCategory === cat.id }]"
          @tap="selectCategory(cat.id)"
        >
          <text>{{ cat.name }}</text>
          <text v-if="cat.count !== undefined" class="count">({{ cat.count }})</text>
        </view>
      </view>
    </scroll-view>

    <view class="result-caption">
      <text>{{ getResultText() }}</text>
      <text v-if="totalPages > 1" class="page-info">第 {{ currentPage }}/{{ totalPages }} 页</text>
    </view>t>营养值按每 100 克展示</text>
    </view>

    <view v-if="loading" class="state">正在整理食物...</view>
    <view v-else-if="error" class="state state--error">
      <text>食物目录暂时没有连接上</text>
      <button class="retry" @tap="load">重新加载</button>
    </view>
    <view v-else-if="!foods.length" class="state">
      <text>还没有找到这份食物</text>
      <text class="state-copy">可以试试更短的关键词，或换一个常用名称。</text>
    </view>
    <view v-else class="food-list">
      <button v-for="food in foods" :key="food.id" class="food-row" @tap="choose(food)">
        <view class="food-mark">{{ food.name.slice(0, 1) }}</view>
        <view class="food-copy">
          <text class="food-name">{{ food.name }}</text>
          <text class="food-meta"
            >{{ food.category?.name || '日常食物' }} · {{ food.nutrition.energyKcal }} 千卡 /
            100g</text
          >
        </view>
        <image class="forward" src="/static/icons/svg/forward.svg" mode="aspectFit" />
      </button>
    </view>

    <button class="photo-entry" @tap="openRecognition">
      <view class="camera-mark">
        <image src="/static/icons/svg/camera.svg" mode="aspectFit" />
      </view>
      <view class="photo-copy">
        <text>拍照识别食物</text>
        <text>识别后先确认食物和份量，再保存记录</text>
      </view>
      <image class="forward" src="/static/icons/svg/forward.svg" mode="aspectFit" />
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

let searchTimer: number | null = null;

// 所有分类（包含"全部"选项）
const allCategories = computed(() => {
  const all = { id: null, name: '全部', slug: 'all', sortOrder: 0, count: totalCount.value };
  return [all, ...categories.value];
});

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
    currentPage.value = 1;
    load(1);
  }, 500);
}

// 清空搜索
function clearQuery() {
  query.value = '';
  currentPage.value = 1;
  load(1);
}

// 选择分类
function selectCategory(categoryId: string | null) {
  selectedCategory.value = categoryId;
  currentPage.value = 1;
  load(1);
}

// 加载更多（分页）
function loadMore() {
  if (currentPage.value < totalPages.value && !loading.value) {
    load(currentPage.value + 1);
  }
}

// 选择食物
function choose(food: FoodItem) {
  uni.navigateTo({
    url: `/pages/food-confirm/FoodConfirmPage?foodId=${encodeURIComponent(food.id)}`,
  });
  uni.$emit('food-selected', food);
}

// 打开拍照识别
function openRecognition() {
  uni.navigateTo({ url: '/pages/food-recognition/FoodRecognitionPage' });
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
  await loadCategories();
  await load(1);
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 28rpx 32rpx 70rpx;
  background: #f6faf7;
  color: #244735;
}
.intro {
  padding: 10rpx 2rpx 24rpx;
}
.eyebrow,
.title,
.subtitle,
.result-caption text,
.food-name,
.food-meta,
.photo-copy text,
.state text {
  display: block;
}
.eyebrow {
  color: #72927b;
  font-size: 21rpx;
  font-weight: 700;
}
.title {
  margin-top: 6rpx;
  color: #244735;
  font-size: 39rpx;
  font-weight: 700;
}
.subtitle {
  margin-top: 8rpx;
  color: #829587;
  font-size: 21rpx;
  line-height: 1.5;
}
.search-box {
  display: flex;
  align-items: center;
  height: 82rpx;
  padding: 0 16rpx;
  border: 1rpx solid #d8e7da;
  border-radius: 16rpx;
  background: #fff;
}
.search-icon {
  width: 34rpx;
  height: 34rpx;
  flex: none;
  margin-right: 12rpx;
}
.search-box input {
  min-width: 0;
  flex: 1;
  font-size: 25rpx;
}
.clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
  flex: none;
  margin: 0;
  padding: 0;
  border: 1rpx solid #dfe8df;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.72);
}
.clear image {
  width: 25rpx;
  height: 25rpx;
}
.result-caption {
  margin: 16rpx 2rpx 12rpx;
}
.result-caption text:first-child {
  color: #547561;
  font-size: 22rpx;
  font-weight: 700;
}
.result-caption text:last-child {
  margin-top: 4rpx;
  color: #91a696;
  font-size: 19rpx;
}
.food-list {
  border-top: 1rpx solid #deebe0;
}
.food-row,
.photo-entry {
  display: flex;
  align-items: center;
  width: 100%;
  text-align: left;
  background: transparent;
}
.food-row {
  min-height: 112rpx;
  padding: 16rpx 2rpx;
  border-bottom: 1rpx solid #e2ece3;
}
.food-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70rpx;
  height: 70rpx;
  flex: none;
  margin-right: 16rpx;
  border-radius: 18rpx;
  color: #fff;
  background: #7eae86;
  font-size: 30rpx;
  font-weight: 700;
}
.food-copy,
.photo-copy {
  min-width: 0;
  flex: 1;
}
.food-name {
  overflow: hidden;
  color: #31543e;
  font-size: 27rpx;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.food-meta {
  margin-top: 7rpx;
  overflow: hidden;
  color: #789080;
  font-size: 20rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.forward {
  width: 32rpx;
  height: 32rpx;
  flex: none;
  margin-left: 14rpx;
  opacity: 0.72;
}
.photo-entry {
  margin-top: 26rpx;
  padding: 18rpx 2rpx;
  border-top: 1rpx solid #dceadd;
  border-bottom: 1rpx solid #dceadd;
}
.camera-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  flex: none;
  margin-right: 14rpx;
  border: 1rpx solid #dceadd;
  border-radius: 18rpx;
  background: #eff6eb;
}
.camera-mark image {
  width: 32rpx;
  height: 32rpx;
}
.photo-copy text:first-child {
  color: #426d50;
  font-size: 24rpx;
  font-weight: 700;
}
.photo-copy text:last-child {
  margin-top: 5rpx;
  color: #859a8b;
  font-size: 19rpx;
  line-height: 1.4;
}
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
.page-info {
  color: #99b3a0;
  font-size: 22rpx;
  font-weight: 500;
}
</style>
