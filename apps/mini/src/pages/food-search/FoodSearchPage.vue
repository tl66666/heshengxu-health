<template>
  <view class="page food-search-page">
    <AppNavBar title="选择食物" route="/pages/food-search/FoodSearchPage" />

    <view class="intro">
      <text class="eyebrow">记下一餐</text>
      <text class="title">从食物目录开始</text>
      <text class="subtitle">常见基础食物优先，品牌食品随后</text>
    </view>

    <view class="meal-switch" aria-label="选择餐次">
      <view
        v-for="item in mealOptions"
        :key="item.value"
        :class="['meal-switch-item', { active: mealType === item.value }]"
        @tap="switchMealType(item.value)"
      >
        <image class="meal-switch-icon" :src="item.icon" mode="aspectFit" />
        <text>{{ item.label }}</text>
      </view>
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

    <view class="budget-strip">
      <view
        ><text>今日摄入</text
        ><text class="budget-number">{{ budget.consumedKcal }} <text>千卡</text></text></view
      >
      <view class="budget-line"
        ><view
          :style="{
            width: `${Math.min(100, budget.targetKcal ? (budget.consumedKcal / budget.targetKcal) * 100 : 0)}%`,
          }"
      /></view>
      <view class="budget-right"
        ><text>还可吃</text
        ><text class="budget-remaining">{{ remainingAfterSelection }} 千卡</text></view
      >
    </view>

    <view class="catalog-shell">
      <scroll-view v-if="categories.length > 0" class="category-tabs" scroll-y>
        <view class="category-list">
          <view
            v-for="cat in allCategories"
            :key="cat.id || 'all'"
            :class="['category-tab', { active: selectedCategory === cat.id }]"
            @tap="selectCategory(cat.id)"
          >
            <text>{{ cat.name }}</text>
            <text v-if="cat.count !== undefined" class="count">{{ cat.count }}</text>
          </view>
        </view>
      </scroll-view>

      <scroll-view
        class="food-results"
        scroll-y
        :scroll-top="resultsScrollTop"
        lower-threshold="160"
        @scrolltolower="loadNextPage"
      >
        <view v-if="catalogSource === 'offline'" class="offline-notice">
          <text class="offline-title">当前为离线常见食物</text>
          <text>暂时显示常见食物，网络恢复后会自动补充完整目录。</text>
        </view>

        <view class="result-heading">
          <view>
            <text class="common-title">{{ query || selectedCategory ? '筛选结果' : '常见食物' }}</text>
            <text class="common-subtitle">{{ getResultText() }}</text>
          </view>
          <button class="photo-compact" aria-label="拍照识别食物" @tap="openRecognition">
            <image src="/static/icons/camera.png" mode="aspectFit" />
          </button>
        </view>

        <view v-if="loading" class="state">
          <text>正在准备食物...</text>
        </view>

        <view v-else-if="error" class="state state--error">
          <text>食物目录暂时无法加载</text>
          <button class="retry" @tap="load(1)">重新加载</button>
        </view>

        <view v-else-if="foods.length === 0" class="state">
          <image class="state-icon" src="/static/icons/svg/search.svg" mode="aspectFit" />
          <text class="state-copy">没有找到相关食物，试试换个关键词</text>
        </view>

        <view v-else class="food-list">
          <view
            v-for="food in foods"
            :key="food.id"
            :class="['food-card', { 'food-card--added': flyingFoodId === food.id }]"
            hover-class="food-card-active"
            @tap="choose(food)"
          >
            <view class="food-main">
              <view class="food-icon">
                <image :src="getFoodCategoryIcon(food.category?.slug, food.name)" mode="aspectFit" />
              </view>
              <view class="food-info">
                <text class="food-name">{{ food.name }}</text>
                <view v-if="getHighlights(food).length > 0" class="food-tags">
                  <text v-for="tag in getHighlights(food)" :key="tag" class="tag">{{ tag }}</text>
                </view>
                <text class="food-calories">{{ food.nutrition?.energyKcal || 0 }} 千卡 / 100g</text>
              </view>
            </view>
            <view v-if="selectedCount(food.id) > 0" class="food-stepper" @tap.stop>
              <button class="stepper-btn stepper-btn--minus" aria-label="减少份数" @tap="changeQuantity(food.id, -1)">−</button>
              <text class="stepper-number">{{ selectedCount(food.id) }}</text>
              <button class="stepper-btn stepper-btn--plus" aria-label="增加份数" @tap="changeQuantity(food.id, 1)">＋</button>
            </view>
            <button v-else class="food-add" aria-label="加入餐次" @tap.stop="toggleCart(food)">
              <text>＋</text>
            </button>
          </view>
          <view class="load-more">
            <text v-if="loadingMore">正在加载更多...</text>
            <text v-else-if="currentPage < totalPages">继续上滑查看更多</text>
            <text v-else>已显示当前分类的全部食物</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <view v-if="selectedFoods.length" class="cart-bar">
      <view class="cart-bar-summary" @tap="cartOpen = !cartOpen">
        <view :class="['cart-badge', { 'cart-badge--pulse': cartPulse }]"
          ><image :src="mealIcon" mode="aspectFit" /><text>{{ selectedCountTotal }}</text></view
        >
        <view class="cart-bar-copy"
          ><text>{{ mealLabel }} · 已选 {{ selectedCountTotal }} 份 · 本餐 {{ selectedCalories }} 千卡</text
          ><text>今日还可吃 {{ remainingAfterSelection }} 千卡</text></view
        >
        <image
          class="cart-arrow"
          :class="{ open: cartOpen }"
          src="/static/icons/svg/forward.svg"
          mode="aspectFit"
        />
      </view>
      <button class="cart-done" :disabled="saving" @tap="saveCart">
        {{ saving ? '保存中' : '完成记录' }}
      </button>
    </view>
    <view v-if="cartOpen && selectedFoods.length" class="cart-panel">
      <view class="cart-panel-head"
        ><text>本餐清单</text><text>{{ selectedCalories }} 千卡</text></view
      >
      <view v-for="item in selectedFoods" :key="item.food.id" class="cart-row">
        <view
          ><text class="cart-food-name">{{ item.food.name }}</text
          ><text class="cart-food-meta"
            >{{ item.grams * item.quantity }}g · {{ item.calories }} 千卡</text
          ></view
        >
        <view class="cart-quantity"
          ><button @tap="changeQuantity(item.food.id, -1)">−</button><text>{{ item.quantity }}</text
          ><button @tap="changeQuantity(item.food.id, 1)">＋</button></view
        >
      </view>
    </view>

  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';
import { ref, computed, nextTick } from 'vue';
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
import { createMealEntry, loadMealEntries } from '../../features/food/food.service.js';
import { calorieBudget, sumCalories } from '../../features/food/calorie-budget.js';
import type { MealEntry } from '../../features/food/food.summary.js';
import { calculateFoodNutrition } from '../../features/food/food.types.js';
import { listUserFoods } from '../../features/food/user-foods.service.js';
import { mergeFoodResults } from '../../features/food/food.service.js';
import { userStorageKey } from '../../features/auth/user-storage.js';

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
const catalogSource = ref<'remote' | 'offline'>('remote');
const loadingMore = ref(false);
const resultsScrollTop = ref(0);
const mealType = ref<MealType>('lunch');
const mealOptions: Array<{ value: MealType; label: string; icon: string }> = [
  { value: 'breakfast', label: '早餐', icon: '/static/icons/breakfast.png' },
  { value: 'lunch', label: '午餐', icon: '/static/icons/lunch.png' },
  { value: 'dinner', label: '晚餐', icon: '/static/icons/dinner.png' },
  { value: 'snack', label: '加餐', icon: '/static/icons/snack.png' },
];
type CartItem = { food: FoodItem; grams: number; quantity: number; calories: number };
const selectedFoods = ref<CartItem[]>([]);
const cartOpen = ref(false);
const saving = ref(false);
const flyingFoodId = ref<string | null>(null);
const cartPulse = ref(false);
const todayEntries = ref<MealEntry[]>([]);
const dailyTarget = ref(1800);
const budget = computed(() => calorieBudget(dailyTarget.value, sumCalories(todayEntries.value)));
const selectedCalories = computed(() =>
  selectedFoods.value.reduce((sum, item) => sum + item.calories, 0),
);
const selectedCountTotal = computed(() =>
  selectedFoods.value.reduce((sum, item) => sum + item.quantity, 0),
);
const remainingAfterSelection = computed(() =>
  calorieBudget(dailyTarget.value, budget.value.consumedKcal + selectedCalories.value).remainingKcal,
);
const mealLabel = computed(() => mealOptions.find((item) => item.value === mealType.value)?.label || '午餐');

const mealIcon = computed(
  () =>
    ({
      breakfast: '/static/icons/breakfast.png',
      lunch: '/static/icons/lunch.png',
      dinner: '/static/icons/dinner.png',
      snack: '/static/icons/snack.png',
    })[mealType.value],
);
let searchTimer: ReturnType<typeof setTimeout> | null = null;

// 所有分类（包含"全部"选项）
const allCategories = computed(() => {
  const all = { id: null, name: '全部', slug: 'all', sortOrder: 0, count: totalCount.value };
  const order = [
    'staple',
    'vegetable',
    'meat-egg',
    'soy',
    'dairy',
    'fruit',
    'nut',
    'beverage',
    'snack',
    'restaurant',
    'oil',
    'seasoning',
  ];
  const rank = (slug: string) => {
    const index = order.indexOf(slug);
    return index < 0 ? 999 : index;
  };
  return [all, ...[...categories.value].sort((a, b) => rank(a.slug) - rank(b.slug))];
});

// 加载分类数据
async function loadCategories() {
  try {
    categories.value = await getCategoryStats();
    if (categories.value[0]?.source) catalogSource.value = categories.value[0].source;
    totalCount.value = categories.value.reduce((sum, cat) => sum + (cat.count || 0), 0);
  } catch (err) {
    console.error('加载分类失败:', err);
  }
}

// 搜索食物
async function load(page = 1, append = false) {
  if (append) loadingMore.value = true;
  else loading.value = true;
  error.value = false;
  try {
    const result = await searchFoods({
      query: query.value || undefined,
      categoryId: selectedCategory.value || undefined,
      page,
      pageSize,
    });

    catalogSource.value = result.source;
    let personalItems: FoodItem[] = [];
    if (page === 1 && !query.value && !selectedCategory.value) {
      try {
        personalItems = mergeFoodResults(await listUserFoods(), []);
      } catch {
        // Personal foods are an enhancement; keep the catalog usable when the API is offline.
      }
    }
    const nextItems = append ? [...foods.value, ...result.items] : [...personalItems, ...result.items];
    const seenNames = new Set<string>();
    foods.value = nextItems.filter((item) => {
      const key = item.name.trim().replace(/\s+/gu, '');
      if (seenNames.has(key)) return false;
      seenNames.add(key);
      return true;
    });
    totalCount.value = result.total;
    currentPage.value = result.page;
    totalPages.value = result.totalPages;

  } catch (err) {
    console.error('搜索失败:', err);
    error.value = true;
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
}

function loadNextPage() {
  if (loading.value || loadingMore.value || currentPage.value >= totalPages.value) return;
  load(currentPage.value + 1, true);
}

async function resetResultsScroll() {
  resultsScrollTop.value = 1;
  await nextTick();
  resultsScrollTop.value = 0;
}

// 搜索输入防抖
function onSearchInput() {
  if (searchTimer) {
    clearTimeout(searchTimer);
  }
  searchTimer = setTimeout(() => {
    currentPage.value = 1;
    resetResultsScroll();
    load(1);
  }, 500);
}

// 搜索确认
function handleSearch() {
  currentPage.value = 1;
  resetResultsScroll();
  load(1);
}

// 清空搜索
function clearQuery() {
  query.value = '';
  selectedCategory.value = null;
  foods.value = [];
  currentPage.value = 1;
  resetResultsScroll();
  load(1);
}

// 选择分类
function selectCategory(categoryId: string | null) {
  selectedCategory.value = categoryId;
  currentPage.value = 1;
  resetResultsScroll();
  load(1);
}

// 选择食物
function choose(food: FoodItem) {
  uni.setStorageSync(userStorageKey('pendingFoodSelection'), food);
  navigateToFoodConfirm(food.id, mealType.value);
  uni.$emit('food-selected', food);
}

function switchMealType(value: MealType) {
  mealType.value = value;
}

function selectedCount(foodId: string) {
  return selectedFoods.value.find((item) => item.food.id === foodId)?.quantity || 0;
}

function toggleCart(food: FoodItem) {
  const existing = selectedFoods.value.find((item) => item.food.id === food.id);
  if (existing) {
    changeQuantity(food.id, 1);
    return;
  }
  const grams = food.servings?.[0]?.grams || 100;
  selectedFoods.value.push({
    food,
    grams,
    quantity: 1,
    calories: calculateFoodNutrition(food, grams).energyKcal,
  });
  flyingFoodId.value = food.id;
  cartPulse.value = true;
  setTimeout(() => { flyingFoodId.value = null; cartPulse.value = false; }, 520);
}

function changeQuantity(foodId: string, delta: number) {
  const item = selectedFoods.value.find((entry) => entry.food.id === foodId);
  if (!item) return;
  item.quantity = Math.max(0, item.quantity + delta);
  item.calories = calculateFoodNutrition(item.food, item.grams * item.quantity).energyKcal;
  if (!item.quantity)
    selectedFoods.value = selectedFoods.value.filter((entry) => entry.food.id !== foodId);
}

async function saveCart() {
  if (!selectedFoods.value.length || saving.value) return;
  saving.value = true;
  try {
    for (const item of selectedFoods.value) {
      await createMealEntry({
        mealType: mealType.value,
        foodId: item.food.id,
        grams: item.grams * item.quantity,
        recordedAt: new Date().toISOString(),
        foodSnapshot: item.food,
      });
    }
    const after = calorieBudget(
      dailyTarget.value,
      budget.value.consumedKcal + selectedCalories.value,
    );
    uni.showToast({
      title: `已记录 ${selectedCalories.value} 千卡，还可吃 ${after.remainingKcal} 千卡`,
      icon: 'none',
    });
    selectedFoods.value = [];
    cartOpen.value = false;
    await loadTodayEntries();
    uni.navigateTo({
      url: `/pages/food-summary/FoodSummaryPage?date=${encodeURIComponent(localDate())}`,
    });
  } catch {
    uni.showToast({ title: '保存失败，请稍后重试', icon: 'none' });
  } finally {
    saving.value = false;
  }
}

async function loadTodayEntries() {
  try {
    const date = localDate();
    todayEntries.value = await loadMealEntries(date);
  } catch {
    todayEntries.value = [];
  }
  const target = Number(uni.getStorageSync(userStorageKey('heban.food.daily-target-kcal')));
  if (target > 0) dailyTarget.value = target;
}

function localDate() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
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
  await loadCategories();
  await loadTodayEntries();
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

.common-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin: 20rpx 2rpx 14rpx;
}
.common-title {
  font-size: 30rpx;
  font-weight: 800;
  color: #244735;
}
.common-subtitle {
  font-size: 22rpx;
  color: #88a092;
}
.common-heading,
.result-caption,
.state,
.food-list,
.pagination {
  margin-left: 184rpx;
}
.photo-entry {
  clear: both;
}

/* 介绍区域 */
.intro {
  padding: 20rpx 2rpx 24rpx;
}

.meal-switch { display:grid; grid-template-columns:repeat(4,1fr); gap:4rpx; margin:0 0 24rpx; padding:8rpx; border:1rpx solid #dfeae1; border-radius:24rpx; background:#f0f6f1; }
.meal-switch-item { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3rpx; min-width:0; height:92rpx; border-radius:18rpx; color:#789180; font-size:21rpx; font-weight:600; transition:all .18s ease; }
.meal-switch-item.active { color:#2d6943; background:#fffdf8; box-shadow:0 4rpx 14rpx rgba(74,104,87,.10); }
.meal-switch-icon { width:52rpx; height:52rpx; opacity:1; flex:none; }
.meal-switch-item.active .meal-switch-icon { transform:translateY(-1rpx) scale(1.03); }
.food-icon image { width:66rpx; height:66rpx; opacity:1; }

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
  float: left;
  position: sticky;
  top: 0;
  width: 164rpx;
  height: 980rpx;
  margin: 0 20rpx 20rpx 0;
  overflow: hidden;
  background: #f3f7f4;
  border-radius: 20rpx;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  padding: 12rpx 0;
}

.category-tab {
  display: flex;
  align-items: center;
  gap: 6rpx;
  min-height: 72rpx;
  padding: 12rpx;
  border: none;
  border-radius: 0 22rpx 22rpx 0;
  background: transparent;
  color: #5c7a67;
  font-size: 24rpx;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.category-tab.active {
  border-left: 6rpx solid #2e7d4f;
  background: #ffffff;
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

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  padding: 24rpx 0 8rpx;
}
.page-button {
  min-width: 150rpx;
  height: 68rpx;
  line-height: 68rpx;
  border: 1rpx solid #d8e7dc;
  border-radius: 18rpx;
  background: #fff;
  color: #4e725a;
  font-size: 24rpx;
}
.page-button[disabled] {
  color: #aab8ad;
  background: #f2f5f2;
  border-color: #e3eae4;
}
.page-number {
  min-width: 90rpx;
  text-align: center;
  color: #6b9478;
  font-size: 24rpx;
  font-weight: 700;
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
  min-width: 0;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  width: 68rpx;
  height: 68rpx;
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
/* 统一食物目录的高级奶油绿质感，去除旧版粉红与厚重分页按钮 */
.page {
  background: #f8f7f1;
  color: #365343;
}
.intro .eyebrow,
.result-caption,
.section-title {
  color: #6f9f7a;
}
.title,
.food-name {
  color: #365343;
}
.subtitle,
.food-calories,
.page-info {
  color: #84988c;
}
.search-box {
  border-color: #d9e6d9;
  background: #fffdf8;
  box-shadow: 0 8rpx 22rpx rgba(73, 112, 84, 0.07);
}
.tag-btn,
.filter-btn {
  border-color: #d9e6d9;
  color: #5f8069;
  background: #fffdf8;
}
.filter-btn.green {
  border-color: #bcd7bf;
  background: #edf5e8;
}
.category-tab {
  color: #789180;
}
.category-tab.active {
  color: #3d7650;
  border-color: #9fc8a4;
  background: #edf5e8;
}
.food-card {
  border-color: #e2ebe0;
  background: #fffdf8;
  box-shadow: 0 8rpx 20rpx rgba(76, 108, 82, 0.06);
}
.food-icon {
  border-color: #dce9df;
  background: #f1f7ee;
}
.food-add {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56rpx;
  height: 56rpx;
  margin-left: 12rpx;
  padding: 0;
  border: 1rpx solid #c8dec9;
  border-radius: 50%;
  color: #5d966a;
  background: #edf5e8;
}
.food-add::after {
  border: 0;
}
.food-add text {
  font-size: 34rpx;
  line-height: 1;
}
.food-add.selected {
  position: relative;
  color: #fff;
  border-color: #6f9f7a;
  background: #6f9f7a;
}
.food-add.selected > text:first-child {
  font-size: 24rpx;
}
.food-add-count {
  position: absolute;
  top: -12rpx;
  right: -10rpx;
  min-width: 28rpx;
  height: 28rpx;
  padding: 0 6rpx;
  border-radius: 16rpx;
  color: #fff;
  text-align: center;
  font-size: 16rpx !important;
  line-height: 28rpx !important;
  background: #d18b72;
}
.pagination {
  gap: 28rpx;
  padding: 28rpx 0 16rpx;
}
.page-button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 64rpx;
  width: 64rpx;
  height: 64rpx;
  padding: 0;
  border: 1rpx solid #d7e5d7;
  border-radius: 50%;
  background: #fffdf8;
}
.page-button image {
  width: 28rpx;
  height: 28rpx;
  opacity: 0.75;
}
.page-button[disabled] {
  opacity: 0.35;
  background: #f1f4ee;
}
.page-progress {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
  color: #4d7458;
  font-size: 24rpx;
  font-weight: 700;
}
.page-divider {
  color: #a4b7a7;
  font-weight: 400;
}

.budget-strip {
  display: flex;
  align-items: center;
  gap: 18rpx;
  margin: 0 0 18rpx;
  padding: 16rpx 20rpx;
  border: 1rpx solid #dfebdf;
  border-radius: 16rpx;
  background: #fffdf8;
  box-shadow: 0 6rpx 18rpx rgba(76, 108, 82, 0.05);
}
.budget-strip text {
  display: block;
  color: #8b9e90;
  font-size: 17rpx;
}
.budget-number {
  margin-top: 4rpx;
  color: #4f8a61 !important;
  font-size: 24rpx !important;
  font-weight: 700;
}
.budget-number text {
  display: inline;
  color: #75917c;
  font-size: 15rpx;
  font-weight: 400;
}
.budget-line {
  width: 130rpx;
  height: 8rpx;
  overflow: hidden;
  border-radius: 8rpx;
  background: #edf2e9;
}
.budget-line view {
  height: 100%;
  border-radius: inherit;
  background: #77ad82;
}
.budget-right {
  margin-left: auto;
  text-align: right;
}
.budget-remaining {
  margin-top: 4rpx;
  color: #365343 !important;
  font-size: 19rpx !important;
  font-weight: 600;
}
.cart-bar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 25;
  display: flex;
  align-items: center;
  gap: 14rpx;
  padding: 14rpx 24rpx;
  padding-bottom: calc(14rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #e1e9dd;
  background: rgba(255, 253, 248, 0.98);
  box-shadow: 0 -10rpx 28rpx rgba(72, 103, 78, 0.12);
}
.cart-bar-summary {
  min-width: 0;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.cart-badge {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 54rpx;
  height: 54rpx;
  border-radius: 50%;
  background: #f0f8f2;
}
.cart-badge image {
  width: 52rpx;
  height: 52rpx;
  opacity: 1;
  filter: none;
}
.cart-badge text {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  min-width: 28rpx;
  height: 28rpx;
  padding: 0 6rpx;
  border-radius: 16rpx;
  color: #fff;
  text-align: center;
  font-size: 16rpx;
  line-height: 28rpx;
  background: #d18b72;
}
.cart-bar-copy {
  min-width: 0;
  flex: 1;
}
.cart-bar-copy text:first-child {
  overflow: hidden;
  color: #365343;
  font-size: 21rpx;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cart-bar-copy text:last-child {
  margin-top: 4rpx;
  color: #78907f;
  font-size: 17rpx;
}
.cart-arrow {
  width: 26rpx;
  height: 26rpx;
  transform: rotate(90deg);
  opacity: 0.55;
}
.cart-arrow.open {
  transform: rotate(-90deg);
}
.cart-done {
  flex: none;
  width: 178rpx;
  height: 72rpx;
  padding: 0;
  border-radius: 38rpx;
  color: #fff;
  font-size: 24rpx;
  font-weight: 600;
  background: #6f9f7a;
}
.cart-done::after {
  border: 0;
}
.cart-done[disabled] {
  opacity: 0.55;
}
.cart-panel {
  position: fixed;
  right: 20rpx;
  bottom: calc(108rpx + env(safe-area-inset-bottom));
  left: 20rpx;
  z-index: 24;
  max-height: 58vh;
  overflow: auto;
  padding: 20rpx 22rpx;
  border: 1rpx solid #e1e9dd;
  border-radius: 20rpx;
  background: #fffdf8;
  box-shadow: 0 12rpx 32rpx rgba(72, 103, 78, 0.16);
}
.cart-panel-head,
.cart-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.cart-panel-head {
  padding-bottom: 12rpx;
  border-bottom: 1rpx solid #edf1e9;
  color: #365343;
  font-size: 22rpx;
  font-weight: 600;
}
.cart-row {
  padding: 14rpx 0;
  border-bottom: 1rpx solid #f0f3ed;
}
.cart-row:last-child {
  border-bottom: 0;
}
.cart-food-name,
.cart-food-meta {
  display: block;
}
.cart-food-name {
  color: #4e6656;
  font-size: 21rpx;
}
.cart-food-meta {
  margin-top: 4rpx;
  color: #8da092;
  font-size: 17rpx;
}
.cart-quantity {
  display: flex;
  align-items: center;
  gap: 10rpx;
}
.cart-quantity button {
  width: 42rpx;
  height: 42rpx;
  padding: 0;
  border: 1rpx solid #d6e5d4;
  border-radius: 50%;
  color: #5c8b67;
  font-size: 24rpx;
  line-height: 40rpx;
  background: #f3f8ef;
}
.cart-quantity button::after {
  border: 0;
}
.cart-quantity text {
  min-width: 24rpx;
  color: #4d6555;
  text-align: center;
  font-size: 20rpx;
}

/* Inline quantity control used directly on every food row. */
.food-stepper { display:flex; align-items:center; justify-content:center; gap:6rpx; width:150rpx; height:58rpx; box-sizing:border-box; padding:5rpx; border:1rpx solid #d7e8dc; border-radius:18rpx; background:#f4faf5; }
.stepper-btn { display:flex; align-items:center; justify-content:center; width:44rpx; height:44rpx; margin:0; padding:0; border:0; border-radius:13rpx; line-height:44rpx; font-size:28rpx; font-weight:600; }
.stepper-btn--minus { background:#e5f0e6; color:#51745b; }
.stepper-btn--plus { background:#3d8b5c; color:#fff; }
.stepper-number { display:flex; align-items:center; justify-content:center; min-width:26rpx; height:44rpx; color:#294a36; font-size:24rpx; font-weight:700; line-height:44rpx; }
.food-add { display:flex; align-items:center; justify-content:center; width:58rpx; height:58rpx; margin:0; padding:0; border:1rpx solid #cfe1d0; border-radius:50%; line-height:58rpx; }
.food-add text { display:block; line-height:58rpx; }
.food-add::after, .stepper-btn::after, .cart-done::after, .cart-quantity button::after { border:0; }
.cart-done { display:flex; align-items:center; justify-content:center; line-height:72rpx; }

/* Keep the camera entry above the fixed cart bar and give selection a quiet tactile response. */
.photo-entry { z-index:30; bottom:calc(178rpx + env(safe-area-inset-bottom)); }
.food-card--added { animation: foodAdded .52s cubic-bezier(.22,.8,.32,1); }
.cart-badge--pulse { animation: cartPulse .52s cubic-bezier(.22,.8,.32,1); }
@keyframes foodAdded { 0% { transform:scale(1); } 35% { transform:translateY(-8rpx) scale(1.015); } 100% { transform:scale(1); } }
@keyframes cartPulse { 0% { transform:scale(1); } 40% { transform:scale(1.12); } 100% { transform:scale(1); } }

/* Refined catalog surface: quiet canvas, crisp hierarchy, no decorative gradients. */
.page { background:#f7faf8; }
.intro { padding-top:28rpx; padding-bottom:18rpx; }
.title { font-size:36rpx; letter-spacing:0; }
.subtitle { color:#8a9890; }
.search-box { border:1rpx solid #dce6de; border-radius:16rpx; background:#fff; box-shadow:0 6rpx 18rpx rgba(40,72,50,.05); }
.meal-switch { border-color:#dce9df; border-radius:18rpx; background:#f0f7f2; }
.meal-switch-item { height:92rpx; border-radius:14rpx; font-size:21rpx; }
.meal-switch-item.active { color:#245f3b; box-shadow:0 5rpx 12rpx rgba(47,91,58,.10); }
.budget-strip { border:1rpx solid #e1e9e3; border-radius:18rpx; background:#fff; box-shadow:0 6rpx 18rpx rgba(40,72,50,.04); }
.category-tabs { top:12rpx; height:calc(100vh - 390rpx); border:1rpx solid #dfeae2; background:#f0f7f2; box-shadow:0 4rpx 14rpx rgba(40,72,50,.04); }
.category-tab { min-height:66rpx; color:#7d9183; font-size:21rpx; }
.category-tab.active { border-left:5rpx solid #2f7b4e; background:#fff; color:#2f7048; }
.food-card { min-height:122rpx; border:1rpx solid #e1ebe4; border-radius:16rpx; background:#fffefa; box-shadow:0 5rpx 14rpx rgba(40,72,50,.045); }
.food-name { font-size:25rpx; color:#315f42; }
.food-calories { font-size:20rpx; color:#8b9b90; }
.food-icon { width:82rpx; height:82rpx; background:#f4faf5; border-color:#d8e8dc; }
.food-icon image { width:72rpx; height:72rpx; opacity:1; }
.food-add, .food-stepper { flex-shrink:0; }
.pagination { padding-top:22rpx; }
.page-button { display:flex; align-items:center; justify-content:center; height:58rpx; min-width:116rpx; border:1rpx solid #dbe7de; border-radius:16rpx; background:#fff; line-height:58rpx; }
.page-button:active { background:#edf5ee; }
.page-progress { color:#668374; font-size:22rpx; }
.cart-bar { border-top:1rpx solid #dfe9e1; background:rgba(255,255,255,.98); box-shadow:0 -8rpx 24rpx rgba(40,72,50,.08); }
.cart-done { height:64rpx; border-radius:18rpx; background:#2f7b4e; font-size:23rpx; }

/* Stable catalog workspace: both columns share one height and scroll independently. */
.page {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  min-height: 0;
  padding: 0 24rpx calc(18rpx + env(safe-area-inset-bottom));
  overflow: hidden;
}
.intro {
  flex: none;
  padding: 12rpx 2rpx 14rpx;
}
.eyebrow { display: none; }
.title { font-size: 31rpx; }
.subtitle { margin-top: 4rpx; font-size: 19rpx; }
.meal-switch {
  flex: none;
  margin-bottom: 12rpx;
  padding: 5rpx;
}
.meal-switch-item { height: 76rpx; }
.meal-switch-icon { width: 44rpx; height: 44rpx; }
.search-box {
  flex: none;
  min-height: 72rpx;
  margin-bottom: 10rpx;
  padding: 14rpx 18rpx;
}
.budget-strip {
  flex: none;
  margin-bottom: 12rpx;
  padding: 12rpx 16rpx;
}
.catalog-shell {
  display: grid;
  grid-template-columns: 158rpx minmax(0, 1fr);
  flex: 1;
  min-height: 360rpx;
  gap: 14rpx;
  overflow: hidden;
}
.category-tabs,
.food-results {
  width: 100%;
  height: 100%;
  min-height: 0;
  margin: 0;
  box-sizing: border-box;
  overflow: hidden;
}
.category-tabs {
  position: static;
  float: none;
  top: auto;
  border: 1rpx solid #e4e7df;
  border-radius: 18rpx;
  background: #f3f6ef;
}
.category-list {
  gap: 2rpx;
  padding: 8rpx 0 120rpx;
}
.category-tab {
  align-items: flex-start;
  flex-direction: column;
  justify-content: center;
  gap: 2rpx;
  min-height: 72rpx;
  padding: 10rpx 12rpx;
  border-left: 5rpx solid transparent;
  border-radius: 0;
  white-space: normal;
}
.category-tab .count {
  font-size: 17rpx;
  line-height: 1.2;
}
.food-results {
  border-top: 1rpx solid #ece8e1;
}
.offline-notice {
  margin: 14rpx 4rpx 10rpx;
  padding: 16rpx 18rpx;
  border: 1rpx solid #eeddbd;
  border-radius: 14rpx;
  color: #8a765b;
  background: #fff9ec;
}
.offline-notice text { display: block; font-size: 19rpx; line-height: 1.5; }
.offline-notice .offline-title { margin-bottom: 3rpx; color: #6f604d; font-size: 21rpx; font-weight: 650; }
.result-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  padding: 14rpx 4rpx 10rpx;
}
.result-heading > view { min-width: 0; }
.result-heading .common-title,
.result-heading .common-subtitle { display: block; }
.result-heading .common-title { font-size: 27rpx; }
.result-heading .common-subtitle { margin-top: 3rpx; font-size: 18rpx; }
.photo-compact {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 62rpx;
  height: 62rpx;
  padding: 0;
  border: 1rpx solid #dfe7dc;
  border-radius: 18rpx;
  background: #fffdf9;
  box-shadow: 0 5rpx 14rpx rgba(92, 78, 70, .05);
}
.photo-compact::after { border: 0; }
.photo-compact image { width: 50rpx; height: 50rpx; }
.common-heading,
.result-caption,
.state,
.food-list { margin-left: 0; }
.food-list {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  padding: 0 2rpx 180rpx;
}
.food-card {
  width: 100%;
  min-height: 116rpx;
  padding: 14rpx;
}
.food-icon { width: 72rpx; height: 72rpx; }
.food-icon image { width: 64rpx; height: 64rpx; }
.food-badge { display: none; }
.load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 72rpx;
  color: #9a938c;
  font-size: 19rpx;
}
.cart-bar { z-index: 60; }
.cart-panel { z-index: 59; }
</style>
