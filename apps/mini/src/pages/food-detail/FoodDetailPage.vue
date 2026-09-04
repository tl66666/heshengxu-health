<template>
  <view class="page food-detail-catalog-page">
    <AppNavBar :title="food?.name || '食物详情'" route="/pages/food-detail/FoodDetailPage" />

    <!-- 加载状态 -->
    <view v-if="loading" class="state">
      <text>正在加载...</text>
    </view>

    <!-- 错误状态 -->
    <view v-else-if="error" class="state state--error">
      <text>加载失败</text>
      <text class="state-copy">请检查网络连接</text>
      <button class="retry" @tap="loadFood">重新加载</button>
    </view>

    <!-- 食物详情 -->
    <view v-else-if="food" class="content">
      <!-- 顶部信息卡片 -->
      <view class="food-header card">
        <view class="food-icon-large">
          <image :src="getFoodCategoryIcon(food.category?.slug, food.name)" mode="aspectFit" />
        </view>
        <text class="food-name">{{ food.name }}</text>
        <view v-if="food.category" class="food-category">{{ food.category.name }}</view>
        <view :class="['health-tag', 'health-' + (food.healthLight ?? 0)]">
          <view class="health-icon" :class="'health-icon-' + (food.healthLight ?? 0)" />
          <text>{{ getHealthLabel(food.healthLight ?? 0) }}</text>
        </view>
      </view>

      <!-- 营养概览卡片 -->
      <view class="nutrition-overview card">
        <view class="card-title">营养概览</view>
        <text class="card-subtitle">每 {{ nutrition?.basisGrams || 100 }}g</text>

        <view class="macro-grid">
          <view class="macro-item main">
            <text class="macro-value">{{ nutrition?.energyKcal || 0 }}</text>
            <text class="macro-label">千卡</text>
          </view>
          <view class="macro-item">
            <text class="macro-value">{{ formatNutrient(nutrition?.proteinG) }}</text>
            <text class="macro-label">蛋白质</text>
          </view>
          <view class="macro-item">
            <text class="macro-value">{{ formatNutrient(nutrition?.fatG) }}</text>
            <text class="macro-label">脂肪</text>
          </view>
          <view class="macro-item">
            <text class="macro-value">{{ formatNutrient(nutrition?.carbohydrateG) }}</text>
            <text class="macro-label">碳水</text>
          </view>
        </view>

        <!-- 营养素进度条 -->
        <view v-if="nutrition" class="nutrition-bars">
          <view class="nutrition-bar">
            <view class="bar-header">
              <text class="bar-label">蛋白质</text>
              <text class="bar-value">{{ formatNutrient(nutrition.proteinG) }}g</text>
            </view>
            <view class="bar-track">
              <view class="bar-fill protein" :style="{ width: getProteinPercentage() + '%' }" />
            </view>
          </view>

          <view class="nutrition-bar">
            <view class="bar-header">
              <text class="bar-label">脂肪</text>
              <text class="bar-value">{{ formatNutrient(nutrition.fatG) }}g</text>
            </view>
            <view class="bar-track">
              <view class="bar-fill fat" :style="{ width: getFatPercentage() + '%' }" />
            </view>
          </view>

          <view class="nutrition-bar">
            <view class="bar-header">
              <text class="bar-label">碳水化合物</text>
              <text class="bar-value">{{ formatNutrient(nutrition.carbohydrateG) }}g</text>
            </view>
            <view class="bar-track">
              <view class="bar-fill carbs" :style="{ width: getCarbsPercentage() + '%' }" />
            </view>
          </view>
        </view>
      </view>

      <!-- 营养亮点 -->
      <view v-if="highlights.length > 0" class="highlights card">
        <view class="card-title">营养亮点</view>
        <view class="highlight-list">
          <view v-for="(highlight, index) in highlights" :key="index" class="highlight-item">
            <text class="highlight-dot">•</text>
            <text class="highlight-text">{{ highlight }}</text>
          </view>
        </view>
      </view>

      <!-- 常见份量 -->
      <view v-if="food.servings && food.servings.length > 0" class="servings card">
        <view class="card-title">常见份量</view>
        <view class="serving-list">
          <view v-for="serving in food.servings" :key="serving.id" class="serving-item">
            <text class="serving-label">{{ serving.label }}</text>
            <text class="serving-grams">{{ serving.grams }}g</text>
            <text class="serving-kcal">{{ calculateCalories(serving.grams) }} 千卡</text>
          </view>
        </view>
      </view>

      <!-- 详细营养成分 -->
      <view v-if="nutrition" class="detailed-nutrition card">
        <view class="card-title">详细营养成分</view>
        <text class="card-subtitle">每 100g</text>

        <!-- 矿物质 -->
        <view class="nutrient-section">
          <view class="section-title">矿物质</view>
          <view class="nutrient-grid">
            <view v-if="nutrition.sodiumMg" class="nutrient-item">
              <text class="nutrient-name">钠</text>
              <text class="nutrient-value">{{ formatNutrient(nutrition.sodiumMg, 'mg') }}</text>
            </view>
            <view v-if="nutrition.calciumMg" class="nutrient-item">
              <text class="nutrient-name">钙</text>
              <text class="nutrient-value">{{ formatNutrient(nutrition.calciumMg, 'mg') }}</text>
            </view>
            <view v-if="nutrition.ironMg" class="nutrient-item">
              <text class="nutrient-name">铁</text>
              <text class="nutrient-value">{{ formatNutrient(nutrition.ironMg, 'mg') }}</text>
            </view>
            <view v-if="nutrition.potassiumMg" class="nutrient-item">
              <text class="nutrient-name">钾</text>
              <text class="nutrient-value">{{ formatNutrient(nutrition.potassiumMg, 'mg') }}</text>
            </view>
            <view v-if="nutrition.zincMg" class="nutrient-item">
              <text class="nutrient-name">锌</text>
              <text class="nutrient-value">{{ formatNutrient(nutrition.zincMg, 'mg') }}</text>
            </view>
            <view v-if="nutrition.seleniumUg" class="nutrient-item">
              <text class="nutrient-name">硒</text>
              <text class="nutrient-value">{{ formatNutrient(nutrition.seleniumUg, 'μg') }}</text>
            </view>
            <view v-if="nutrition.magnesiumMg" class="nutrient-item">
              <text class="nutrient-name">镁</text>
              <text class="nutrient-value">{{ formatNutrient(nutrition.magnesiumMg, 'mg') }}</text>
            </view>
            <view v-if="nutrition.copperMg" class="nutrient-item">
              <text class="nutrient-name">铜</text>
              <text class="nutrient-value">{{ formatNutrient(nutrition.copperMg, 'mg') }}</text>
            </view>
            <view v-if="nutrition.manganeseMg" class="nutrient-item">
              <text class="nutrient-name">锰</text>
              <text class="nutrient-value">{{ formatNutrient(nutrition.manganeseMg, 'mg') }}</text>
            </view>
            <view v-if="nutrition.phosphorusMg" class="nutrient-item">
              <text class="nutrient-name">磷</text>
              <text class="nutrient-value">{{ formatNutrient(nutrition.phosphorusMg, 'mg') }}</text>
            </view>
          </view>
        </view>

        <!-- 维生素 -->
        <view class="nutrient-section">
          <view class="section-title">维生素</view>
          <view class="nutrient-grid">
            <view v-if="nutrition.vitaminAUg" class="nutrient-item">
              <text class="nutrient-name">维生素A</text>
              <text class="nutrient-value">{{ formatNutrient(nutrition.vitaminAUg, 'μg') }}</text>
            </view>
            <view v-if="nutrition.thiamineMg" class="nutrient-item">
              <text class="nutrient-name">维生素B1</text>
              <text class="nutrient-value">{{ formatNutrient(nutrition.thiamineMg, 'mg') }}</text>
            </view>
            <view v-if="nutrition.riboflavinMg" class="nutrient-item">
              <text class="nutrient-name">维生素B2</text>
              <text class="nutrient-value">{{ formatNutrient(nutrition.riboflavinMg, 'mg') }}</text>
            </view>
            <view v-if="nutrition.vitaminB6Mg" class="nutrient-item">
              <text class="nutrient-name">维生素B6</text>
              <text class="nutrient-value">{{ formatNutrient(nutrition.vitaminB6Mg, 'mg') }}</text>
            </view>
            <view v-if="nutrition.vitaminCMg" class="nutrient-item">
              <text class="nutrient-name">维生素C</text>
              <text class="nutrient-value">{{ formatNutrient(nutrition.vitaminCMg, 'mg') }}</text>
            </view>
            <view v-if="nutrition.vitaminEMg" class="nutrient-item">
              <text class="nutrient-name">维生素E</text>
              <text class="nutrient-value">{{ formatNutrient(nutrition.vitaminEMg, 'mg') }}</text>
            </view>
            <view v-if="nutrition.niacinMg" class="nutrient-item">
              <text class="nutrient-name">烟酸</text>
              <text class="nutrient-value">{{ formatNutrient(nutrition.niacinMg, 'mg') }}</text>
            </view>
            <view v-if="nutrition.folateMcg" class="nutrient-item">
              <text class="nutrient-name">叶酸</text>
              <text class="nutrient-value">{{ formatNutrient(nutrition.folateMcg, 'μg') }}</text>
            </view>
          </view>
        </view>

        <!-- 其他成分 -->
        <view class="nutrient-section">
          <view class="section-title">其他成分</view>
          <view class="nutrient-grid">
            <view v-if="nutrition.dietaryFiberG" class="nutrient-item">
              <text class="nutrient-name">膳食纤维</text>
              <text class="nutrient-value">{{ formatNutrient(nutrition.dietaryFiberG, 'g') }}</text>
            </view>
            <view v-if="nutrition.cholesterolMg" class="nutrient-item">
              <text class="nutrient-name">胆固醇</text>
              <text class="nutrient-value">{{
                formatNutrient(nutrition.cholesterolMg, 'mg')
              }}</text>
            </view>
            <view v-if="nutrition.saturatedFatG" class="nutrient-item">
              <text class="nutrient-name">饱和脂肪</text>
              <text class="nutrient-value">{{ formatNutrient(nutrition.saturatedFatG, 'g') }}</text>
            </view>
            <view v-if="nutrition.sugarG" class="nutrient-item">
              <text class="nutrient-name">糖</text>
              <text class="nutrient-value">{{ formatNutrient(nutrition.sugarG, 'g') }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部操作按钮 -->
      <view class="bottom-actions">
        <button class="action-btn secondary" @tap="goBack">返回</button>
        <button class="action-btn primary" @tap="addToRecord">添加到记录</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';
import { ref, computed } from 'vue';
import AppNavBar from '../../components/AppNavBar.vue';
import { getFoodById } from '../../features/food/food.service.js';
import type { FoodItem, FoodNutrition } from '../../features/food/food.types.js';
import { getFoodCategoryIcon } from '../../features/food/food-icon.js';
import {
  generateNutritionHighlights,
  getHealthLightLabel,
  formatNutrient,
} from '../../utils/nutrition.js';
import { navigateBack, navigateToFoodConfirm } from '../../utils/router.js';

const food = ref<FoodItem | null>(null);
const loading = ref(false);
const error = ref(false);
const foodId = ref('');

const nutrition = computed(() => food.value?.nutrition);

const highlights = computed(() => {
  if (!nutrition.value) return [];
  const list = generateNutritionHighlights(nutrition.value);

  // 添加更多亮点
  const extras: string[] = [];

  if (food.value?.healthLight === 1) {
    extras.push('绿灯食物，可以放心吃');
  } else if (food.value?.healthLight === 2) {
    extras.push('黄灯食物，建议适量食用');
  }

  if (nutrition.value.energyKcal < 50) {
    extras.push('热量极低，适合减脂期');
  }

  if (nutrition.value.proteinG && nutrition.value.proteinG > 20) {
    extras.push('蛋白质含量丰富，适合增肌');
  }

  return [...list, ...extras];
});

async function loadFood() {
  if (!foodId.value) return;

  loading.value = true;
  error.value = false;

  try {
    food.value = await getFoodById(foodId.value);
    if (!food.value) {
      const pending = uni.getStorageSync('pendingFoodSelection') as FoodItem | undefined;
      if (pending?.id === foodId.value) food.value = pending;
    }
    if (!food.value) error.value = true;
  } catch (err) {
    console.error('加载食物详情失败:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
}

function getHealthLabel(level: number): string {
  return getHealthLightLabel(level);
}

function getProteinPercentage(): number {
  if (!nutrition.value?.proteinG) return 0;
  return Math.min((nutrition.value.proteinG / 30) * 100, 100);
}

function getFatPercentage(): number {
  if (!nutrition.value?.fatG) return 0;
  return Math.min((nutrition.value.fatG / 20) * 100, 100);
}

function getCarbsPercentage(): number {
  if (!nutrition.value?.carbohydrateG) return 0;
  return Math.min((nutrition.value.carbohydrateG / 50) * 100, 100);
}

function calculateCalories(grams: number): number {
  if (!nutrition.value) return 0;
  const ratio = grams / (nutrition.value.basisGrams || 100);
  return Math.round(nutrition.value.energyKcal * ratio);
}

function goBack() {
  navigateBack();
}

function addToRecord() {
  if (!food.value) return;
  navigateToFoodConfirm(food.value.id);
}

onLoad((options: any) => {
  if (options.foodId) {
    foodId.value = options.foodId;
    loadFood();
  }
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fdf9 0%, #f5f8f6 100%);
}

.content {
  padding: 0 32rpx 140rpx;
}

.card {
  margin-bottom: 16rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 2rpx 12rpx rgba(127, 204, 143, 0.08);
}

.card-title {
  display: block;
  color: #2d6943;
  font-size: 26rpx;
  font-weight: 800;
  margin-bottom: 8rpx;
}

.card-subtitle {
  display: block;
  color: #76907d;
  font-size: 22rpx;
  margin-bottom: 16rpx;
}

/* 顶部信息 */
.food-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 32rpx 24rpx;
}

.food-icon-large {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid #dce9e0;
  border-radius: 28rpx;
  background: #f1f6f2;
}

.food-icon-large image {
  width: 96rpx;
  height: 96rpx;
}

.food-name {
  color: #244735;
  font-size: 36rpx;
  font-weight: 800;
  margin-bottom: 8rpx;
}

.food-category {
  padding: 6rpx 16rpx;
  border-radius: 12rpx;
  background: #e8f3ea;
  color: #5a9572;
  font-size: 22rpx;
  font-weight: 600;
  margin-bottom: 12rpx;
}

.health-tag {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  padding: 10rpx 20rpx;
  border-radius: 16rpx;
  font-size: 24rpx;
  font-weight: 700;
}

.health-1 {
  background: linear-gradient(135deg, #e8f3ea 0%, #d4e5d4 100%);
  color: #5a9572;
}

.health-2 {
  background: linear-gradient(135deg, #fef6e6 0%, #f5e8c8 100%);
  color: #d4a748;
}

.health-0 {
  background: linear-gradient(135deg, #fceee6 0%, #f5d8cf 100%);
  color: #d46a56;
}

.health-icon {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: currentColor;
}

.health-icon-1 {
  color: #6ca982;
}
.health-icon-2 {
  color: #c59a54;
}
.health-icon-0,
.health-icon-3 {
  color: #c67b6d;
}

.card-title {
  color: #315547;
  font-size: 27rpx;
  font-weight: 750;
}

/* 营养概览 */
.macro-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.macro-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx;
  border-radius: 16rpx;
  background: #f8fdf9;
}

.macro-item.main {
  grid-column: span 4;
  background: linear-gradient(135deg, #e8f3ea 0%, #d4e5d4 100%);
}

.macro-value {
  display: block;
  color: #244735;
  font-size: 32rpx;
  font-weight: 800;
  margin-bottom: 4rpx;
}

.macro-item.main .macro-value {
  font-size: 48rpx;
}

.macro-label {
  display: block;
  color: #76907d;
  font-size: 20rpx;
  font-weight: 600;
}

/* 营养素进度条 */
.nutrition-bars {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.nutrition-bar {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.bar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bar-label {
  color: #2d6943;
  font-size: 22rpx;
  font-weight: 600;
}

.bar-value {
  color: #76907d;
  font-size: 20rpx;
  font-weight: 600;
}

.bar-track {
  height: 12rpx;
  border-radius: 6rpx;
  background: #e8f3ea;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.bar-fill.protein {
  background: linear-gradient(90deg, #7fcc8f 0%, #6bb97d 100%);
}

.bar-fill.fat {
  background: linear-gradient(90deg, #f5d99a 0%, #e8c66f 100%);
}

.bar-fill.carbs {
  background: linear-gradient(90deg, #94c5e8 0%, #7ab2d8 100%);
}

/* 营养亮点 */
.highlight-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.highlight-item {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
}

.highlight-dot {
  color: #7fcc8f;
  font-size: 24rpx;
  font-weight: 800;
  line-height: 1.4;
}

.highlight-text {
  flex: 1;
  color: #5c7a67;
  font-size: 24rpx;
  line-height: 1.6;
}

/* 常见份量 */
.serving-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.serving-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14rpx 16rpx;
  border-radius: 12rpx;
  background: #f8fdf9;
}

.serving-label {
  flex: 1;
  color: #2d6943;
  font-size: 24rpx;
  font-weight: 600;
}

.serving-grams {
  color: #76907d;
  font-size: 22rpx;
  margin-right: 16rpx;
}

.serving-kcal {
  color: #5a9572;
  font-size: 22rpx;
  font-weight: 700;
}

/* 详细营养 */
.nutrient-section {
  margin-bottom: 24rpx;
}

.section-title {
  color: #2d6943;
  font-size: 24rpx;
  font-weight: 700;
  margin-bottom: 12rpx;
}

.nutrient-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12rpx;
}

.nutrient-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 16rpx;
  border-radius: 10rpx;
  background: #f8fdf9;
}

.nutrient-name {
  color: #5c7a67;
  font-size: 22rpx;
}

.nutrient-value {
  color: #2d6943;
  font-size: 22rpx;
  font-weight: 700;
}

/* 状态 */
.state {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 120rpx 32rpx;
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

/* 底部操作 */
.bottom-actions {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  gap: 16rpx;
  padding: 16rpx 32rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10rpx);
  border-top: 1rpx solid #e8f3ea;
  box-shadow: 0 -4rpx 12rpx rgba(127, 204, 143, 0.05);
}

.action-btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 1;
}

.action-btn::after {
  border: none;
}

.action-btn.secondary {
  border: 2rpx solid #d4e5d4;
  background: #fff;
  color: #5c7a67;
}

.action-btn.primary {
  border: none;
  background: linear-gradient(135deg, #7fcc8f 0%, #6bb97d 100%);
  color: #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(127, 204, 143, 0.3);
}
</style>
