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
        <image class="search-icon" src="/static/icons/svg/search.svg" mode="aspectFit" />
        <text class="search-placeholder">请输入食物名称</text>
      </view>
    </view>

    <view class="daily-budget">
      <view
        ><text class="budget-label">今日热量</text
        ><text class="budget-value"
          >{{ budget.consumedKcal }} <text class="budget-unit">千卡</text></text
        ></view
      >
      <view class="budget-meter"
        ><view
          class="budget-meter-fill"
          :style="{
            width: `${Math.min(100, budget.targetKcal ? (budget.consumedKcal / budget.targetKcal) * 100 : 0)}%`,
          }"
      /></view>
      <view class="budget-rest"
        ><text class="budget-rest-label">还可吃</text
        ><text class="budget-rest-value">{{ budget.remainingKcal }} 千卡</text></view
      >
    </view>

    <!-- 快捷按钮 -->
    <view class="quick-btns">
      <view class="quick-btn" @tap="copyRecord">
        <image class="quick-icon" src="/static/icons/svg/review.svg" mode="aspectFit" />
        <text class="quick-text">复制记录</text>
      </view>
      <view class="quick-btn" @tap="quickAdd">
        <image class="quick-icon" src="/static/icons/svg/check.svg" mode="aspectFit" />
        <text class="quick-text">快速记录</text>
      </view>
      <view class="quick-btn" @tap="scanCode">
        <image class="quick-icon" src="/static/icons/svg/camera.svg" mode="aspectFit" />
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
        <view v-for="food in foods" :key="food.id" class="food-item">
          <!-- 左侧图片 -->
          <view class="food-pic">
            <image v-if="food.imageUrl" :src="food.imageUrl" class="food-img" mode="aspectFill" />
            <image
              v-else
              class="food-img food-img--icon"
              :src="getFoodCategoryIcon(categorySlugForFood(food.name), food.name)"
              mode="aspectFit"
            />
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
            <view v-if="isAdded(food.id)" class="quantity-stepper" @tap.stop>
              <button class="stepper-button" @tap="changeQuantity(food.id, -1)">−</button>
              <text class="stepper-value">{{ selectedCount(food.id) }}</text>
              <button class="stepper-button stepper-button--plus" @tap="changeQuantity(food.id, 1)">＋</button>
            </view>
            <button v-else class="add-btn" @tap="toggleFood(food)">
              <text class="add-icon">＋</text>
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部栏 -->
    <view v-if="selectedFoods.length > 0" class="bottom-bar">
      <view class="cart-summary" @tap="cartOpen = !cartOpen">
        <view class="cart-icon-wrap"
          ><image class="meal-icon" :src="mealIcon" mode="aspectFit" /><text class="cart-count">{{
            selectedCountTotal
          }}</text></view
        >
        <view class="cart-copy"
          ><text class="meal-name">{{ mealLabel }} · 已选 {{ selectedCountTotal }} 份</text
          ><text class="cart-kcal"
            >本餐 {{ selectedCalories }} 千卡 · 今日还可吃 {{ remainingAfterSelection }} 千卡</text
          ></view
        >
        <image
          class="cart-chevron"
          :class="{ open: cartOpen }"
          src="/static/icons/svg/forward.svg"
          mode="aspectFit"
        />
      </view>
      <button class="bar-done" @tap="done">完成记录</button>
    </view>
    <view v-if="cartOpen && selectedFoods.length" class="cart-drawer">
      <view class="drawer-head"
        ><text>本餐清单</text><text>{{ selectedCalories }} 千卡</text></view
      >
      <view v-for="food in selectedFoods" :key="food.id" class="drawer-row"
        ><view class="drawer-copy"
          ><text>{{ food.name }}</text
          ><text>{{ food.grams }}g · {{ food.caloriesForGram }} 千卡</text></view
        ><view class="quantity-stepper" @tap.stop
          ><button class="stepper-button" @tap="changeQuantity(food.id, -1)">−</button><text class="stepper-value">{{ food.quantity }}</text
          ><button class="stepper-button stepper-button--plus" @tap="changeQuantity(food.id, 1)">＋</button></view
        ></view
      >
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AppNavBar from '../../components/AppNavBar.vue';
import { navigateBack } from '../../utils/router.js';
import { getFoodCategoryIcon } from '../../features/food/food-icon.js';
import { createMealEntry, loadMealEntries, searchFoods } from '../../features/food/food.service.js';
import { calorieBudget, sumCalories } from '../../features/food/calorie-budget.js';
import type { MealEntry } from '../../features/food/food.summary.js';

interface Food {
  id: string;
  name: string;
  calories: number;
  serving: string;
  imageUrl?: string;
  grams: number;
  quantity: number;
  caloriesForGram: number;
  proteinG?: number;
  fatG?: number;
  carbohydrateG?: number;
  dietaryFiberG?: number | null;
  sodiumMg?: number | null;
}

const mealType = ref<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
const currentCategory = ref('common');
const loading = ref(false);
const foods = ref<Food[]>([]);
const selectedFoods = ref<Food[]>([]);
const cartOpen = ref(false);
const todayEntries = ref<MealEntry[]>([]);
const dailyTarget = ref(1800);
const budget = computed(() => calorieBudget(dailyTarget.value, sumCalories(todayEntries.value)));
const remainingAfterSelection = computed(() =>
  calorieBudget(dailyTarget.value, budget.value.consumedKcal + selectedCalories.value).remainingKcal,
);
const saving = ref(false);
const selectedCalories = computed(() =>
  selectedFoods.value.reduce((sum, food) => sum + food.caloriesForGram, 0),
);
const selectedCountTotal = computed(() =>
  selectedFoods.value.reduce((sum, food) => sum + food.quantity, 0),
);
const mealIcon = computed(
  () =>
    ({
      breakfast: '/static/icons/svg/meal-breakfast.svg',
      lunch: '/static/icons/svg/meal-lunch.svg',
      dinner: '/static/icons/svg/meal-dinner.svg',
      snack: '/static/icons/svg/meal-snack.svg',
    })[mealType.value],
);

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

function categorySlugForFood(name: string) {
  if (/蛋/.test(name)) return 'egg';
  if (/鸡|牛|猪|鱼|虾|肉/.test(name)) return 'protein';
  if (/菜|瓜|茄|萝卜|菠菜|番茄/.test(name)) return 'vegetable';
  if (/果|苹果|香蕉|橙|莓/.test(name)) return 'fruit';
  if (/奶|酸奶|奶酪/.test(name)) return 'dairy';
  if (/豆|腐|花生|核桃|杏仁/.test(name)) return 'soy';
  return 'staple';
}

function switchCategory(id: string) {
  currentCategory.value = id;
  loadFoods();
}

async function loadFoods() {
  loading.value = true;

  try {
    const categoryMap: Record<string, string> = {
      staple: 'cmt9u89tg0000t2ekr5513a7m', vegetable: 'cmt9u89tw0002t2ek60uuvssk',
      'meat-egg': 'cmtebeb1y0001t2fszv4je2kq', soy: 'cmtebeb270002t2fs2nzfveeg',
      dairy: 'cmtebeb2x0005t2fsa2l2t7dw', fruit: 'cmt9u89u10003t2eklb9zmb0m',
      nut: 'cmtguysjq0007t2pwn1qwl7gp', beverage: 'cmtguysk10009t2pwucud7zrl',
    };
    const slug = currentCategory.value === 'veg' ? 'vegetable' : currentCategory.value === 'meat' ? 'meat-egg' : currentCategory.value === 'bean' ? 'soy' : currentCategory.value;
    const result = await searchFoods({ categoryId: categoryMap[slug], pageSize: 20 });
    if (result.items.length) {
      foods.value = result.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        calories: Math.round(item.nutrition?.energyKcal || 0),
        serving: item.servings?.[0]?.label || '100克',
        grams: item.servings?.[0]?.grams || 100,
        quantity: 1,
        proteinG: item.nutrition?.proteinG || 0,
        fatG: item.nutrition?.fatG || 0,
        carbohydrateG: item.nutrition?.carbohydrateG || 0,
        dietaryFiberG: item.nutrition?.dietaryFiberG || null,
        sodiumMg: item.nutrition?.sodiumMg || null,
        caloriesForGram: Math.round(
          ((item.nutrition?.energyKcal || 0) * (item.servings?.[0]?.grams || 100)) / 100,
        ),
      }));
    }
  } catch (err) {
    console.error('加载失败', err);
    // 示例数据
    foods.value = [
      {
        id: '1',
        name: '泉阳泉 天然矿泉水',
        calories: 0,
        serving: '600毫升',
        grams: 600,
        quantity: 1,
        caloriesForGram: 0,
      },
      {
        id: '2',
        name: '米饭',
        calories: 116,
        serving: '1碗',
        grams: 150,
        quantity: 1,
        caloriesForGram: 174,
      },
      {
        id: '3',
        name: '煮鸡蛋',
        calories: 144,
        serving: '1个',
        grams: 50,
        quantity: 1,
        caloriesForGram: 72,
      },
      {
        id: '4',
        name: '馒头',
        calories: 223,
        serving: '1个',
        grams: 100,
        quantity: 1,
        caloriesForGram: 223,
      },
      {
        id: '5',
        name: '蒸红薯',
        calories: 86,
        serving: '1个(小)',
        grams: 150,
        quantity: 1,
        caloriesForGram: 129,
      },
      {
        id: '6',
        name: '煎蛋',
        calories: 190,
        serving: '1个',
        grams: 50,
        quantity: 1,
        caloriesForGram: 95,
      },
    ];
  } finally {
    loading.value = false;
  }
}

function isAdded(id: string): boolean {
  return selectedFoods.value.some((f) => f.id === id);
}

function selectedCount(id: string) {
  return selectedFoods.value.find((food) => food.id === id)?.quantity || 1;
}

function toggleFood(food: Food) {
  const idx = selectedFoods.value.findIndex((f) => f.id === food.id);
  if (idx > -1) {
    selectedFoods.value.splice(idx, 1);
  } else {
    selectedFoods.value.push({ ...food, quantity: 1 });
  }
}

function changeQuantity(id: string, delta: number) {
  const item = selectedFoods.value.find((food) => food.id === id);
  if (!item) return;
  item.quantity = Math.max(0, item.quantity + delta);
  item.caloriesForGram = Math.max(
    0,
    Math.round(((item.calories * item.grams) / 100) * item.quantity),
  );
  if (item.quantity === 0)
    selectedFoods.value = selectedFoods.value.filter((food) => food.id !== id);
}

function changeMeal() {
  uni.showActionSheet({
    itemList: ['早餐', '午餐', '晚餐', '加餐'],
    success: (res) => {
      const types: Array<typeof mealType.value> = ['breakfast', 'lunch', 'dinner', 'snack'];
      const selected = types[res.tapIndex];
      if (selected) mealType.value = selected;
    },
  });
}

async function done() {
  if (saving.value || !selectedFoods.value.length) return;
  saving.value = true;
  try {
    for (const food of selectedFoods.value) {
    await createMealEntry({
      mealType: mealType.value,
      foodId: food.id,
      grams: food.grams * food.quantity,
      recordedAt: new Date().toISOString(),
      foodSnapshot: {
        id: food.id,
        name: food.name,
        brand: null,
        category: null,
        nutrition: {
          basisGrams: 100,
          energyKcal: food.calories,
          proteinG: food.proteinG || 0,
          fatG: food.fatG || 0,
          carbohydrateG: food.carbohydrateG || 0,
          dietaryFiberG: food.dietaryFiberG ?? null,
          sodiumMg: food.sodiumMg ?? null,
        },
        servings: [{ id: `${food.id}-serving`, label: food.serving, grams: food.grams }],
      },
      });
    }
  const total = selectedCalories.value;
  const after = calorieBudget(dailyTarget.value, budget.value.consumedKcal + total);
  uni.showToast({
    title: `已记录 ${Math.round(total)} 千卡，还可吃 ${after.remainingKcal} 千卡`,
    icon: 'none',
  });
    setTimeout(() => navigateBack(), 1500);
  } catch {
    uni.showToast({ title: '保存失败，请重试', icon: 'none' });
  } finally {
    saving.value = false;
  }
}

function goBack() {
  navigateBack();
}

function selectDate() {
  uni.showToast({ title: '功能开发中', icon: 'none' });
}

function goToSearch() {
  uni.navigateTo({ url: `/pages/food-search/FoodSearchPage?mealType=${mealType.value}` });
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
  loadTodayEntries();
});

async function loadTodayEntries() {
  try {
    const date = new Date().toISOString().slice(0, 10);
    todayEntries.value = await loadMealEntries(date);
  } catch {
    todayEntries.value = [];
  }
  const storedTarget = Number(uni.getStorageSync('heban.food.daily-target-kcal'));
  if (storedTarget > 0) dailyTarget.value = storedTarget;
}
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

.nav-back::after {
  border: none;
}
.icon-back {
  color: #333;
}

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

.nav-date::after {
  border: none;
}

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
  width: 32rpx;
  height: 32rpx;
  opacity: 0.58;
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
  width: 44rpx;
  height: 44rpx;
  opacity: 0.72;
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

.quantity-stepper { display:flex; align-items:center; gap:8rpx; padding:6rpx; border:1rpx solid #d7e8dc; border-radius:22rpx; background:#f5faf6; }
.stepper-button { width:48rpx; height:48rpx; line-height:44rpx; padding:0; border:0; border-radius:16rpx; background:#e4f0e6; color:#2e7d4f; font-size:34rpx; font-weight:500; }
.stepper-button--plus { background:#2e7d4f; color:#fff; }
.stepper-value { min-width:28rpx; text-align:center; color:#244735; font-size:25rpx; font-weight:700; }

/* 薄荷式目录布局：分类固定在左侧，右侧专注浏览与加号记录 */
.categories {
  padding: 0;
  position: relative;
  background: transparent;
}
.category-scroll {
  width: 170rpx;
  height: 760rpx;
  white-space: normal;
}
.category-list {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding: 8rpx 0;
}
.category-tag {
  display: block;
  padding: 22rpx 18rpx;
  border-radius: 0 24rpx 24rpx 0;
  background: transparent;
  text-align: left;
}
.category-tag.active {
  background: #fff;
  color: #2e7d4f;
  font-weight: 700;
  box-shadow: 0 6rpx 18rpx rgba(42, 92, 57, 0.06);
}
.section-header,
.food-list {
  margin-left: 170rpx;
  padding-left: 24rpx;
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

.food-img--icon {
  width: 70rpx;
  height: 70rpx;
  opacity: 1;
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

.add-btn::after {
  border: none;
}

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
  box-shadow: 0 -2rpx 20rpx rgba(0, 0, 0, 0.08);
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

.meal-arrow::after {
  border: none;
}

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

.bar-done::after {
  border: none;
}

/* 统一为当前奶油绿设计系统，覆盖旧版灰红样式 */
.page {
  background: #f8f7f1;
  color: #365343;
  padding-bottom: calc(150rpx + env(safe-area-inset-bottom));
}
.navbar,
.search-wrap,
.quick-btns {
  background: #fffdf8;
}
.nav-title,
.food-name,
.section-title {
  color: #365343;
}
.nav-back {
  color: #47745b;
  border: 1rpx solid #d9e6d9;
  background: #fffdf8;
}
.search-box {
  border: 1rpx solid #d9e6d9;
  background: #f4f7f1;
  box-shadow: 0 6rpx 18rpx rgba(73, 112, 84, 0.06);
}
.search-placeholder,
.food-unit,
.food-serving,
.quick-text {
  color: #84988c;
}
.quick-btn {
  border: 1rpx solid #e6eee3;
  background: #fbfcf7;
}
.categories {
  background: #f8f7f1;
}
.category-tag {
  color: #7c9383;
}
.category-tag.active {
  color: #fff;
  background: #6f9f7a;
  box-shadow: 0 8rpx 20rpx rgba(88, 137, 98, 0.18);
}
.food-item {
  border: 1rpx solid #e5ece1;
  background: #fffdf8;
  box-shadow: 0 8rpx 20rpx rgba(76, 108, 82, 0.06);
}
.food-cal {
  color: #4f8a61;
}
.add-btn {
  border: 1rpx solid #cfe1d0;
  background: #f3f8ef;
}
.add-btn.added {
  background: #6f9f7a;
  border-color: #6f9f7a;
}
.add-icon {
  color: #6f9f7a;
}
.bottom-bar {
  z-index: 20;
  gap: 14rpx;
  padding: 14rpx 24rpx;
  padding-bottom: calc(14rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #e1e9dd;
  background: rgba(255, 253, 248, 0.97);
  box-shadow: 0 -8rpx 28rpx rgba(72, 103, 78, 0.1);
}
.cart-summary {
  min-width: 0;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.cart-icon-wrap {
  position: relative;
  width: 50rpx;
  height: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #edf5e8;
}
.cart-count {
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
.cart-copy {
  min-width: 0;
  flex: 1;
}
.meal-name {
  display: block;
  overflow: hidden;
  color: #365343;
  font-size: 22rpx;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cart-kcal {
  display: block;
  margin-top: 4rpx;
  overflow: hidden;
  color: #78907f;
  font-size: 18rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cart-chevron {
  width: 26rpx;
  height: 26rpx;
  transform: rotate(90deg);
  opacity: 0.55;
}
.cart-chevron.open {
  transform: rotate(-90deg);
}
.bar-done {
  flex: none;
  width: 180rpx;
  padding: 18rpx 12rpx;
  border-radius: 14rpx;
  color: #fff;
  font-size: 24rpx;
  background: #6f9f7a;
}
.cart-drawer {
  position: fixed;
  right: 20rpx;
  bottom: calc(112rpx + env(safe-area-inset-bottom));
  left: 20rpx;
  z-index: 19;
  padding: 20rpx 22rpx;
  border: 1rpx solid #e1e9dd;
  border-radius: 18rpx;
  background: #fffdf8;
  box-shadow: 0 10rpx 30rpx rgba(72, 103, 78, 0.14);
}
.daily-budget {
  display: flex;
  align-items: center;
  gap: 18rpx;
  margin: 0 28rpx 14rpx;
  padding: 16rpx 18rpx;
  border: 1rpx solid #e2ebe0;
  border-radius: 16rpx;
  background: #fffdf8;
  box-shadow: 0 6rpx 16rpx rgba(76, 108, 82, 0.05);
}
.budget-label,
.budget-rest-label {
  display: block;
  color: #8ca092;
  font-size: 17rpx;
}
.budget-value {
  display: block;
  margin-top: 3rpx;
  color: #4f8a61;
  font-size: 25rpx;
  font-weight: 700;
}
.budget-unit {
  font-size: 16rpx;
  font-weight: 400;
}
.budget-meter {
  width: 120rpx;
  height: 8rpx;
  overflow: hidden;
  border-radius: 8rpx;
  background: #edf2e9;
}
.budget-meter-fill {
  height: 100%;
  border-radius: 8rpx;
  background: #79ad82;
}
.budget-rest {
  margin-left: auto;
  text-align: right;
}
.budget-rest-value {
  display: block;
  margin-top: 3rpx;
  color: #365343;
  font-size: 20rpx;
  font-weight: 600;
}
.drawer-head,
.drawer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.drawer-head {
  padding-bottom: 12rpx;
  border-bottom: 1rpx solid #edf1e9;
  color: #365343;
  font-size: 22rpx;
  font-weight: 600;
}
.drawer-row {
  padding: 12rpx 0;
}
.drawer-copy text {
  display: block;
}
.drawer-copy text:first-child {
  color: #4e6656;
  font-size: 21rpx;
}
.drawer-copy text:last-child {
  margin-top: 3rpx;
  color: #8da092;
  font-size: 17rpx;
}
.quantity {
  display: flex;
  align-items: center;
  gap: 10rpx;
}
.quantity button {
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
.quantity button::after {
  border: 0;
}
.quantity text {
  min-width: 24rpx;
  color: #4d6555;
  text-align: center;
  font-size: 20rpx;
}

/* Final control pass: compact, centered controls with a clear selected state. */
.food-action { display:flex; align-items:center; justify-content:flex-end; min-width:176rpx; }
.quantity-stepper { display:flex; align-items:center; justify-content:center; gap:8rpx; width:168rpx; height:64rpx; box-sizing:border-box; padding:6rpx; border:1rpx solid #d6e6d9; border-radius:20rpx; background:#f5faf6; }
.stepper-button { display:flex; align-items:center; justify-content:center; width:48rpx; height:48rpx; margin:0; padding:0; border:0; border-radius:14rpx; line-height:48rpx; background:#e3f0e5; color:#47775a; font-size:30rpx; font-weight:600; }
.stepper-button--plus { background:#3d8b5c; color:#fff; }
.stepper-value { display:flex; align-items:center; justify-content:center; min-width:30rpx; height:48rpx; color:#294a36; font-size:26rpx; font-weight:700; line-height:48rpx; }
.stepper-button::after, .add-btn::after, .bar-done::after, .quantity button::after { border:0; }
.add-btn { display:flex; align-items:center; justify-content:center; width:64rpx; height:64rpx; margin:0; padding:0; border:1rpx solid #cfe1d0; border-radius:50%; background:#f3f8ef; line-height:64rpx; }
.add-icon { display:block; color:#4f8a61; font-size:34rpx; line-height:64rpx; }
.bar-done { display:flex; align-items:center; justify-content:center; height:64rpx; padding:0 24rpx; border:0; border-radius:20rpx; line-height:64rpx; }
</style>
