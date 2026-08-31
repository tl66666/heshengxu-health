<template>
  <view class="page">
    <AppNavBar title="今日饮食" route="/pages/food-summary/FoodSummaryPage" />
    <view class="date-row"
      ><button class="day-arrow" @tap="shiftDate(-1)">‹</button
      ><text class="date-title">{{ dateTitle }}</text
      ><button class="day-arrow" @tap="shiftDate(1)">›</button></view
    >

    <view class="summary-card">
      <view class="summary-top"
        ><view
          ><text class="summary-caption">今日还可以吃</text
          ><text class="remaining">{{ budget.remainingKcal }}</text
          ><text class="unit">千卡</text></view
        ><view class="ring" :style="{ '--progress': `${progress}%` }"
          ><view class="ring-inner"
            ><text>{{ budget.consumedKcal }}</text
            ><text>已摄入</text></view
          ></view
        ></view
      >
      <view class="budget-meta"
        ><text>目标 {{ budget.targetKcal }} 千卡</text
        ><text v-if="budget.overByKcal">已超出 {{ budget.overByKcal }} 千卡</text
        ><text v-else>还剩 {{ budget.remainingKcal }} 千卡</text></view
      >
      <view class="macro-row"
        ><view
          ><text>碳水化合物</text><text>{{ summary.carbohydrateG }}g</text></view
        ><view
          ><text>蛋白质</text><text>{{ summary.proteinG }}g</text></view
        ><view
          ><text>脂肪</text><text>{{ summary.fatG }}g</text></view
        ></view
      >
    </view>

    <view class="section-head"
      ><text>今天的餐次</text><text>{{ entries.length }} 份记录</text></view
    >
    <view v-if="!entries.length" class="empty"
      ><text>还没有记录，从一顿饭开始吧</text><button @tap="addMeal">添加一餐</button></view
    >
    <view v-for="meal in mealGroups" :key="meal.type" class="meal-card"
      ><view class="meal-head"
        ><view class="meal-title-wrap"
          ><image :src="meal.icon" mode="aspectFit" /><text>{{ meal.label }}</text></view
        ><text class="meal-total">{{ meal.total }} 千卡</text></view
      ><view v-for="entry in meal.entries" :key="entry.id" class="entry-row"
        ><view class="entry-icon"
          ><image :src="getFoodCategoryIconForEntry(entry)" mode="aspectFit" /></view
        ><view class="entry-copy"
          ><text>{{ entry.foodNameSnapshot }}</text
          ><text>{{ entry.grams }}g</text></view
        ><text class="entry-kcal">{{ entry.energyKcal }} 千卡</text></view
      ><button class="meal-add" @tap="addMeal(meal.type)">＋ 添加食物</button></view
    >
    <button v-if="entries.length" class="add-more" @tap="addMeal()">＋ 记录下一餐</button>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AppNavBar from '../../components/AppNavBar.vue';
import { loadMealEntries } from '../../features/food/food.service.js';
import type { MealEntry } from '../../features/food/food.summary.js';
import { summarizeFoodEntries } from '../../features/food/food.summary.js';
import { calorieBudget, sumCalories } from '../../features/food/calorie-budget.js';
import { getFoodCategoryIcon } from '../../features/food/food-icon.js';
import type { MealType } from '../../features/food/food.types.js';

const date = ref(localDate());
const entries = ref<MealEntry[]>([]);
const target = ref(1800);
const summary = computed(() => summarizeFoodEntries(entries.value));
const budget = computed(() => calorieBudget(target.value, sumCalories(entries.value)));
const progress = computed(() =>
  budget.value.targetKcal
    ? Math.min(100, Math.round((budget.value.consumedKcal / budget.value.targetKcal) * 100))
    : 0,
);
const dateTitle = computed(() => {
  const d = new Date(`${date.value}T12:00:00`);
  return `${d.getMonth() + 1}月${d.getDate()}日${date.value === localDate() ? ' · 今天' : ''}`;
});
const meals: Array<{ type: MealType; label: string; icon: string }> = [
  { type: 'breakfast', label: '早餐', icon: '/static/icons/svg/meal-breakfast.svg' },
  { type: 'lunch', label: '午餐', icon: '/static/icons/svg/meal-lunch.svg' },
  { type: 'dinner', label: '晚餐', icon: '/static/icons/svg/meal-dinner.svg' },
  { type: 'snack', label: '加餐', icon: '/static/icons/svg/meal-snack.svg' },
];
const mealGroups = computed(() =>
  meals
    .map((meal) => ({
      ...meal,
      entries: entries.value.filter((entry) => entry.mealType === meal.type),
      total: entries.value
        .filter((entry) => entry.mealType === meal.type)
        .reduce((sum, entry) => sum + entry.energyKcal, 0),
    }))
    .filter((meal) => meal.entries.length),
);

function localDate() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
async function load() {
  entries.value = await loadMealEntries(date.value);
  const saved = Number(uni.getStorageSync('heban.food.daily-target-kcal'));
  if (saved > 0) target.value = saved;
}
function addMeal(mealType?: MealType) {
  uni.navigateTo({ url: `/pages/food-search/FoodSearchPage?mealType=${mealType || 'snack'}` });
}
function shiftDate(offset: number) {
  const d = new Date(`${date.value}T12:00:00`);
  d.setDate(d.getDate() + offset);
  date.value = d.toISOString().slice(0, 10);
  load();
}
function categoryForEntry(entry: MealEntry) {
  const name = entry.foodNameSnapshot;
  if (/蛋|鸡|牛|猪|鱼|虾|肉/.test(name)) return 'protein';
  if (/菜|瓜|茄|萝卜|菠菜|西兰花/.test(name)) return 'vegetable';
  if (/果|苹果|香蕉|橙|莓/.test(name)) return 'fruit';
  if (/奶|酸奶|奶酪/.test(name)) return 'dairy';
  if (/豆|腐|花生|核桃|杏仁/.test(name)) return 'soy';
  return 'staple';
}
function getFoodCategoryIconForEntry(entry: MealEntry) {
  return getFoodCategoryIcon(categoryForEntry(entry));
}
onLoad((options) => {
  if (options?.date) date.value = options.date;
  load();
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 0 28rpx 44rpx;
  background: #f7f8f4;
  color: #30473b;
}
.date-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12rpx 4rpx 24rpx;
}
.date-title {
  color: #30473b;
  font-size: 31rpx;
  font-weight: 700;
}
.day-arrow {
  width: 58rpx;
  height: 58rpx;
  padding: 0;
  border: 1rpx solid #dce7dc;
  border-radius: 50%;
  color: #6c9277;
  font-size: 40rpx;
  line-height: 52rpx;
  background: #fffdf8;
}
.day-arrow::after {
  border: 0;
}
.summary-card,
.meal-card {
  border: 1rpx solid #e1e9df;
  border-radius: 24rpx;
  background: #fffdf9;
  box-shadow: 0 10rpx 26rpx rgba(61, 91, 66, 0.06);
}
.summary-card {
  padding: 26rpx 24rpx 22rpx;
}
.summary-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.summary-caption {
  display: block;
  color: #8a9c8e;
  font-size: 20rpx;
}
.remaining {
  display: inline-block;
  margin-top: 7rpx;
  color: #30473b;
  font-size: 64rpx;
  font-weight: 700;
  line-height: 1;
}
.unit {
  margin-left: 6rpx;
  color: #78917e;
  font-size: 19rpx;
}
.ring {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 182rpx;
  height: 182rpx;
  border-radius: 50%;
  background: conic-gradient(#72b886 var(--progress), #edf1ec 0);
}
.ring-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 146rpx;
  height: 146rpx;
  border-radius: 50%;
  background: #fffdf9;
}
.ring-inner text:first-child {
  color: #4d8d61;
  font-size: 31rpx;
  font-weight: 700;
}
.ring-inner text:last-child {
  margin-top: 4rpx;
  color: #9aaa9d;
  font-size: 17rpx;
}
.budget-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 18rpx;
  color: #91a294;
  font-size: 18rpx;
}
.macro-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10rpx;
  margin-top: 20rpx;
  padding-top: 18rpx;
  border-top: 1rpx solid #edf1eb;
}
.macro-row view {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}
.macro-row text:first-child {
  color: #8b9d90;
  font-size: 17rpx;
}
.macro-row text:last-child {
  color: #4f8a61;
  font-size: 23rpx;
  font-weight: 700;
}
.section-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin: 28rpx 4rpx 14rpx;
}
.section-head text:first-child {
  color: #30473b;
  font-size: 28rpx;
  font-weight: 700;
}
.section-head text:last-child {
  color: #94a296;
  font-size: 18rpx;
}
.meal-card {
  margin-bottom: 16rpx;
  padding: 20rpx;
}
.meal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 13rpx;
  border-bottom: 1rpx solid #edf1eb;
}
.meal-title-wrap {
  display: flex;
  align-items: center;
  gap: 10rpx;
}
.meal-title-wrap image {
  width: 36rpx;
  height: 36rpx;
}
.meal-title-wrap text {
  color: #30473b;
  font-size: 26rpx;
  font-weight: 700;
}
.meal-total {
  color: #5f9970;
  font-size: 21rpx;
  font-weight: 600;
}
.entry-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #f0f3ee;
}
.entry-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 58rpx;
  height: 58rpx;
  border-radius: 17rpx;
  background: #f0f6ec;
}
.entry-icon image {
  width: 40rpx;
  height: 40rpx;
}
.entry-copy {
  flex: 1;
}
.entry-copy text {
  display: block;
}
.entry-copy text:first-child {
  color: #4a6252;
  font-size: 21rpx;
  font-weight: 600;
}
.entry-copy text:last-child {
  margin-top: 4rpx;
  color: #9aaa9d;
  font-size: 17rpx;
}
.entry-kcal {
  color: #5f9970;
  font-size: 20rpx;
  font-weight: 600;
}
.meal-add,
.add-more {
  width: 100%;
  margin-top: 14rpx;
  padding: 12rpx;
  border: 1rpx dashed #cfe0cf;
  border-radius: 13rpx;
  color: #60956d;
  font-size: 19rpx;
  background: #f7fbf4;
}
.meal-add::after,
.add-more::after {
  border: 0;
}
.add-more {
  margin-top: 6rpx;
  border-style: solid;
  background: #fffdf8;
}
.empty {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 60rpx 20rpx;
  color: #91a294;
  font-size: 21rpx;
}
.empty button {
  margin-top: 18rpx;
  padding: 12rpx 22rpx;
  border: 1rpx solid #cfe0cf;
  border-radius: 999rpx;
  color: #5f9970;
  font-size: 20rpx;
  background: #f0f7ec;
}
.empty button::after {
  border: 0;
}
</style>
