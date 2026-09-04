# 禾伴健康 - 前端完善开发计划

**项目**：禾伴健康管理系统  
**版本**：v2.0  
**日期**：2026-08-29  
**设计风格**：治愈系日系清新水彩风格  
**设计基准**：和生序自有视觉与交互规范

---

## 📋 目录

1. [设计系统分析](#设计系统分析)
2. [现有页面盘点](#现有页面盘点)
3. [开发优先级](#开发优先级)
4. [详细开发计划](#详细开发计划)
5. [设计规范](#设计规范)
6. [技术规范](#技术规范)

---

## 🎨 设计系统分析

### 当前设计风格

**核心特点**：
- ✅ 治愈系日系清新水彩风格
- ✅ 柔和的绿色系配色
- ✅ 圆角卡片设计
- ✅ 轻盈的阴影效果
- ✅ 水彩插图元素

### 配色方案

```css
/* 主色调 - 绿色系 */
--primary-green: #7fcc8f;
--primary-green-light: #e8f3ea;
--primary-green-dark: #5a9572;
--primary-green-bg: rgba(127, 204, 143, 0.12);

/* 文字颜色 */
--text-primary: #2d6943;
--text-secondary: #76907d;
--text-tertiary: #9aaca0;

/* 背景色 */
--bg-gradient-start: #f8fdf9;
--bg-gradient-end: #f5f8f6;
--card-bg: #ffffff;

/* 功能色 */
--success: #7fcc8f;
--warning: #f5d99a;
--danger: #e89b8f;
--info: #94c5e8;
```

### 视觉元素

1. **卡片样式**
   - 圆角：24rpx
   - 阴影：0 2rpx 12rpx rgba(127, 204, 143, 0.08)
   - 间距：16rpx
   - 内边距：20rpx 24rpx

2. **字体规范**
   - 标题：26rpx / 700-800
   - 正文：24rpx / 500-600
   - 辅助：20-22rpx / 500

3. **图标系统**
   - SVG 图标（纯色）
   - 水彩图标（jpg 插图）
   - Emoji 表情符号

---

## 📱 现有页面盘点

### 核心页面（已实现）

| 页面 | 路径 | 状态 | 完成度 | 需优化 |
|------|------|------|--------|--------|
| **首页** | HomePage.vue | ✅ 完成 | 90% | 营养统计 |
| **食物搜索** | FoodSearchPage.vue | ✅ 完成 | 85% | UI美化 |
| **食物详情** | FoodDetailPage.vue | ⚠️ 基础 | 60% | 完整重做 |
| **食物确认** | FoodConfirmPage.vue | ✅ 完成 | 80% | 份量选择 |
| **食物识别** | FoodRecognitionPage.vue | ✅ 完成 | 85% | - |
| **记录页** | RecordsPage.vue | ✅ 完成 | 85% | - |
| **我的** | MePage.vue | ✅ 完成 | 80% | - |
| **体重详情** | WeightDetailPage.vue | ✅ 完成 | 80% | - |

### 待开发/优化页面

| 优先级 | 页面 | 说明 |
|--------|------|------|
| 🔴 P0 | 食物详情页 | 需完整重做 |
| 🔴 P0 | 食物搜索页 UI | 美化升级 |
| 🟠 P1 | 首页营养统计 | 增强卡片 |
| 🟠 P1 | 饮食记录详情 | 新增页面 |
| 🟡 P2 | 营养分析页 | 新增功能 |
| 🟡 P2 | 数据可视化 | 图表展示 |

---

## 🎯 开发优先级

### Phase 1: 核心功能优化（本次重点）

#### 1.1 食物搜索页面升级 🔴 P0

**目标**：打造符合和生序节奏的流畅搜索体验

**功能点**：
- ✅ 分类筛选（已完成）
- ✅ 实时搜索（已完成）
- ✅ 拼音搜索（已完成）
- 🔲 热门搜索词
- 🔲 搜索历史
- 🔲 快捷筛选（绿灯食物）
- 🔲 食物卡片美化
- 🔲 加载状态优化

**UI 改进**：
```
┌────────────────────────────────────┐
│ 🔍 搜索食物、菜品或拼音            │
└────────────────────────────────────┘

🔥 热门搜索
[鸡胸肉] [鸡蛋] [燕麦] [西兰花] [苹果]

📚 搜索历史
[番茄炒蛋] [牛奶] ...                [清空]

[全部] [主食] [肉蛋] [蔬菜] [水果] ...
  ↓
┌────────────────────────────────────┐
│ 🍗 鸡胸肉（水煮）         133千卡  │
│    蛋白质 19.4g  低脂肪        [绿灯]│
│                                    │
│ 🥚 鸡蛋（水煮）           144千卡  │
│    蛋白质 13.3g  优质蛋白      [绿灯]│
└────────────────────────────────────┘
```

**技术要点**：
- 搜索历史存储（localStorage）
- 防抖优化（已完成）
- 虚拟滚动（大列表）
- 骨架屏加载

---

#### 1.2 食物详情页面重做 🔴 P0

**目标**：展示和生序定义的完整营养信息

**页面结构**：

```
┌────────────────────────────────────┐
│ 🍗 鸡胸肉（水煮）                  │
│                                    │
│ ┌──────────────────────────────┐  │
│ │                              │  │
│ │     [食物图片]               │  │
│ │                              │  │
│ └──────────────────────────────┘  │
│                                    │
│ 📊 营养概览                        │
│ ┌──────────────────────────────┐  │
│ │  133      19.4g     5.0g     │  │
│ │  千卡     蛋白质    脂肪     │  │
│ │                              │  │
│ │  2.5g     0g                 │  │
│ │  碳水     膳食纤维           │  │
│ └──────────────────────────────┘  │
│                                    │
│ 💡 营养亮点                        │
│ • 高蛋白低脂肪，适合增肌减脂      │
│ • 含优质蛋白质，易于吸收          │
│ • 绿灯食物，可以放心吃            │
│                                    │
│ 📏 常见份量                        │
│ ○ 1小块 (100g)                    │
│ ○ 1大块 (150g)                    │
│ ○ 半块 (50g)                      │
│                                    │
│ 🔬 详细营养成分（每100g）          │
│ ┌──────────────────────────────┐  │
│ │ 矿物质                        │  │
│ │ 钠        63.3mg              │  │
│ │ 钙         9mg                │  │
│ │ 铁        0.7mg               │  │
│ │ 钾       251mg                │  │
│ │                               │  │
│ │ 维生素                        │  │
│ │ 维生素A    9μg                │  │
│ │ 维生素B1  0.05mg              │  │
│ │ 维生素B2  0.11mg              │  │
│ │ 维生素C    1mg                │  │
│ └──────────────────────────────┘  │
│                                    │
│ 🍽️ 推荐吃法                        │
│ • 水煮：最健康，保留营养          │
│ • 煎：少油煎制，外焦里嫩          │
│ • 炒：搭配蔬菜，营养均衡          │
│                                    │
│ 🔗 相似食物                        │
│ [鸡腿肉] [牛肉] [鱼肉] [豆腐]    │
│                                    │
│ [添加到今天的记录]                │
└────────────────────────────────────┘
```

**功能模块**：

1. **顶部信息**
   - 食物名称
   - 食物图片（水彩风格）
   - 健康等级标签

2. **营养概览卡片**
   - 核心营养素（能量、蛋白质、脂肪、碳水）
   - 可视化进度条
   - 占每日推荐量百分比

3. **营养亮点**
   - 自动生成营养建议
   - 健康等级说明
   - 适用人群

4. **份量选择器**
   - 常见份量列表
   - 自定义克数
   - 实时计算营养

5. **详细营养成分**
   - 可折叠分组（矿物质、维生素）
   - 完整的30+营养素
   - 每日推荐量对比

6. **推荐吃法**
   - 健康烹饪方式
   - 搭配建议

7. **相似食物**
   - 同类食物推荐
   - 营养对比

8. **底部操作**
   - 添加到记录
   - 收藏功能

**技术实现**：
```typescript
// 营养亮点自动生成
function generateNutritionHighlights(nutrition: FoodNutrition) {
  const highlights = [];
  
  if (nutrition.proteinG > 15) {
    highlights.push('高蛋白食物，适合增肌');
  }
  
  if (nutrition.fatG < 5) {
    highlights.push('低脂肪，适合减脂');
  }
  
  if (nutrition.dietaryFiberG > 3) {
    highlights.push('富含膳食纤维，促进消化');
  }
  
  return highlights;
}

// 每日推荐量百分比
function getDailyPercentage(value: number, nutrient: string) {
  const daily = {
    energy: 2000,      // 千卡
    protein: 60,       // 克
    fat: 60,           // 克
    carbohydrate: 300, // 克
  };
  
  return (value / daily[nutrient]) * 100;
}
```

---

#### 1.3 首页营养统计增强 🟠 P1

**目标**：实时展示今日营养摄入

**当前状态**：
```vue
<!-- 现有：简单的饮食记录卡片 -->
<view class="meal-card card">
  <view class="card-top">
    <text class="card-title">饮食</text>
  </view>
  <view class="meal-grid">
    <button class="meal-item">
      <view class="meal-icon">🥚</view>
      <text class="meal-name">早餐</text>
    </button>
    <!-- ... -->
  </view>
</view>
```

**升级后**：
```vue
<!-- 升级：完整的营养统计 -->
<view class="nutrition-card card">
  <view class="card-top">
    <text class="card-title">今日营养</text>
    <text class="card-subtitle">已摄入 {{ totalCalories }} / 1800 千卡</text>
  </view>
  
  <!-- 环形进度图 -->
  <view class="nutrition-chart">
    <canvas canvas-id="nutritionRing" class="ring-canvas" />
    <view class="chart-center">
      <text class="percentage">{{ caloriePercentage }}%</text>
      <text class="label">完成度</text>
    </view>
  </view>
  
  <!-- 三大营养素 -->
  <view class="macro-nutrients">
    <view class="macro-item">
      <text class="macro-label">蛋白质</text>
      <view class="macro-bar">
        <view class="macro-progress" :style="{ width: proteinPercentage + '%' }" />
      </view>
      <text class="macro-value">{{ proteinG }}g / {{ targetProteinG }}g</text>
    </view>
    
    <view class="macro-item">
      <text class="macro-label">脂肪</text>
      <view class="macro-bar">
        <view class="macro-progress" :style="{ width: fatPercentage + '%' }" />
      </view>
      <text class="macro-value">{{ fatG }}g / {{ targetFatG }}g</text>
    </view>
    
    <view class="macro-item">
      <text class="macro-label">碳水</text>
      <view class="macro-bar">
        <view class="macro-progress" :style="{ width: carbsPercentage + '%' }" />
      </view>
      <text class="macro-value">{{ carbsG }}g / {{ targetCarbsG }}g</text>
    </view>
  </view>
  
  <!-- 各餐快捷入口 -->
  <view class="meal-quick-entry">
    <button class="meal-btn" @tap="addMeal('breakfast')">
      <view class="meal-icon">🥚</view>
      <text class="meal-name">早餐</text>
      <text class="meal-kcal">{{ breakfastKcal }} kcal</text>
    </button>
    <!-- ... 其他餐次 -->
  </view>
</view>
```

**数据计算**：
```typescript
// 统计今日营养
function calculateDailyNutrition(mealEntries: MealEntry[]) {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalCarbs = 0;
  
  mealEntries.forEach(entry => {
    const nutrition = entry.food.nutrition;
    const ratio = entry.grams / nutrition.basisGrams;
    
    totalCalories += nutrition.energyKcal * ratio;
    totalProtein += nutrition.proteinG * ratio;
    totalFat += nutrition.fatG * ratio;
    totalCarbs += nutrition.carbohydrateG * ratio;
  });
  
  return {
    totalCalories: Math.round(totalCalories),
    totalProtein: Math.round(totalProtein * 10) / 10,
    totalFat: Math.round(totalFat * 10) / 10,
    totalCarbs: Math.round(totalCarbs * 10) / 10,
  };
}

// 按餐次分组
function groupByMealType(mealEntries: MealEntry[]) {
  return {
    breakfast: mealEntries.filter(e => e.mealType === 'breakfast'),
    lunch: mealEntries.filter(e => e.mealType === 'lunch'),
    dinner: mealEntries.filter(e => e.mealType === 'dinner'),
    snack: mealEntries.filter(e => e.mealType === 'snack'),
  };
}
```

---

### Phase 2: 新增功能（下一阶段）

#### 2.1 饮食记录详情页 🟠 P1

**路由**：`/pages/meal-detail/MealDetailPage`

**功能**：
- 查看单次饮食记录详情
- 编辑食物份量
- 删除食物
- 添加备注
- 查看营养汇总

#### 2.2 营养分析页面 🟡 P2

**路由**：`/pages/nutrition-analysis/NutritionAnalysisPage`

**功能**：
- 周营养趋势图
- 月营养趋势图
- 营养均衡分析
- 缺乏营养提醒
- 饮食建议

#### 2.3 数据可视化 🟡 P2

**技术选型**：
- ECharts for uni-app
- 或 uCharts

**图表类型**：
- 折线图：体重趋势、热量趋势
- 柱状图：各餐热量对比
- 饼图：三大营养素占比
- 雷达图：营养均衡度

---

## 🎨 设计规范

### 组件设计规范

#### 1. 卡片组件

**基础卡片**：
```vue
<view class="card">
  <view class="card-header">
    <text class="card-title">标题</text>
    <text class="card-subtitle">副标题</text>
  </view>
  <view class="card-body">
    <!-- 内容 -->
  </view>
  <view class="card-footer">
    <!-- 底部操作 -->
  </view>
</view>
```

**样式**：
```css
.card {
  margin-bottom: 16rpx;
  padding: 20rpx 24rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 2rpx 12rpx rgba(127, 204, 143, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.card-title {
  color: #2d6943;
  font-size: 26rpx;
  font-weight: 800;
}

.card-subtitle {
  color: #76907d;
  font-size: 22rpx;
  font-weight: 600;
}
```

#### 2. 食物卡片

**设计**：
```
┌────────────────────────────────────┐
│ 🍗 鸡胸肉（水煮）                  │
│    蛋白质 19.4g · 低脂肪      [绿灯]│
│    133 千卡 / 100g                 │
└────────────────────────────────────┘
```

**代码**：
```vue
<view class="food-card" @tap="viewDetail(food)">
  <view class="food-main">
    <view class="food-icon">{{ getFoodEmoji(food) }}</view>
    <view class="food-info">
      <text class="food-name">{{ food.name }}</text>
      <view class="food-tags">
        <text v-if="food.nutrition.proteinG > 15" class="tag">高蛋白</text>
        <text v-if="food.nutrition.fatG < 5" class="tag">低脂</text>
      </view>
      <text class="food-calories">
        {{ food.nutrition.energyKcal }} 千卡 / {{ food.nutrition.basisGrams }}g
      </text>
    </view>
  </view>
  <view class="food-badge" :class="'badge-' + food.healthLight">
    {{ getHealthLabel(food.healthLight) }}
  </view>
</view>
```

**样式**：
```css
.food-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 20rpx;
  margin-bottom: 12rpx;
  border-radius: 16rpx;
  background: #ffffff;
  border: 2rpx solid #e8f3ea;
  transition: all 0.2s ease;
}

.food-card:active {
  transform: scale(0.98);
  background: #f8fdf9;
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

.badge-1 { /* 绿灯 */
  background: rgba(127, 204, 143, 0.15);
  color: #5a9572;
}

.badge-2 { /* 黄灯 */
  background: rgba(245, 217, 154, 0.15);
  color: #d4a748;
}

.badge-0 { /* 红灯 */
  background: rgba(232, 155, 143, 0.15);
  color: #d46a56;
}
```

#### 3. 营养进度条

**设计**：
```
蛋白质
▓▓▓▓▓▓▓▓▓▓░░░░░  68%
45.2g / 60g
```

**代码**：
```vue
<view class="nutrition-progress">
  <view class="progress-header">
    <text class="progress-label">{{ label }}</text>
    <text class="progress-percentage">{{ percentage }}%</text>
  </view>
  <view class="progress-bar">
    <view 
      class="progress-fill" 
      :style="{ 
        width: percentage + '%',
        background: getProgressColor(percentage)
      }"
    />
  </view>
  <text class="progress-value">{{ current }}g / {{ target }}g</text>
</view>
```

**样式**：
```css
.nutrition-progress {
  margin-bottom: 16rpx;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.progress-label {
  color: #2d6943;
  font-size: 24rpx;
  font-weight: 600;
}

.progress-percentage {
  color: #76907d;
  font-size: 22rpx;
  font-weight: 600;
}

.progress-bar {
  height: 12rpx;
  border-radius: 6rpx;
  background: #e8f3ea;
  overflow: hidden;
  margin-bottom: 6rpx;
}

.progress-fill {
  height: 100%;
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.progress-value {
  display: block;
  color: #76907d;
  font-size: 20rpx;
}
```

#### 4. 健康标签

**绿灯**：
```vue
<view class="health-tag green">
  <text>✓ 可以放心吃</text>
</view>
```

**黄灯**：
```vue
<view class="health-tag yellow">
  <text>⚠ 适量食用</text>
</view>
```

**红灯**：
```vue
<view class="health-tag red">
  <text>⚠ 尽量少吃</text>
</view>
```

**样式**：
```css
.health-tag {
  display: inline-flex;
  align-items: center;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
  font-weight: 600;
}

.health-tag.green {
  background: linear-gradient(135deg, #e8f3ea 0%, #d4e5d4 100%);
  color: #5a9572;
}

.health-tag.yellow {
  background: linear-gradient(135deg, #fef6e6 0%, #f5e8c8 100%);
  color: #d4a748;
}

.health-tag.red {
  background: linear-gradient(135deg, #fceee6 0%, #f5d8cf 100%);
  color: #d46a56;
}
```

---

## 💻 技术规范

### Vue 3 组件规范

**推荐结构**：
```vue
<template>
  <!-- 模板 -->
</template>

<script setup lang="ts">
// 1. 导入
import { ref, computed, onMounted } from 'vue';
import { useXxx } from '@/composables/useXxx';

// 2. Props & Emits
interface Props {
  foodId: string;
}
const props = defineProps<Props>();

interface Emits {
  (e: 'update', value: any): void;
}
const emit = defineEmits<Emits>();

// 3. 状态
const loading = ref(false);
const data = ref<FoodItem | null>(null);

// 4. 计算属性
const displayName = computed(() => data.value?.name || '');

// 5. 方法
async function loadData() {
  loading.value = true;
  try {
    data.value = await fetchFood(props.foodId);
  } finally {
    loading.value = false;
  }
}

// 6. 生命周期
onMounted(() => {
  loadData();
});
</script>

<style scoped>
/* 样式 */
</style>
```

### 状态管理规范

**使用 Composables**：
```typescript
// composables/useFoodSearch.ts
import { ref, computed } from 'vue';
import { searchFoods, type SearchFoodsOptions } from '@/services/food.service';

export function useFoodSearch() {
  const query = ref('');
  const foods = ref([]);
  const loading = ref(false);
  
  async function search(options: SearchFoodsOptions = {}) {
    loading.value = true;
    try {
      const result = await searchFoods({
        ...options,
        query: query.value,
      });
      foods.value = result.items;
    } finally {
      loading.value = false;
    }
  }
  
  return {
    query,
    foods,
    loading,
    search,
  };
}
```

### 工具函数规范

**营养计算**：
```typescript
// utils/nutrition.ts

/** 计算营养素占比 */
export function calculatePercentage(current: number, target: number): number {
  return Math.round((current / target) * 100);
}

/** 获取进度条颜色 */
export function getProgressColor(percentage: number): string {
  if (percentage < 50) return '#7fcc8f';
  if (percentage < 90) return '#f5d99a';
  return '#e89b8f';
}

/** 生成营养亮点 */
export function generateNutritionHighlights(nutrition: FoodNutrition): string[] {
  const highlights: string[] = [];
  
  if (nutrition.proteinG > 15) {
    highlights.push('高蛋白食物');
  }
  
  if (nutrition.fatG < 5) {
    highlights.push('低脂肪');
  }
  
  if (nutrition.dietaryFiberG && nutrition.dietaryFiberG > 3) {
    highlights.push('富含膳食纤维');
  }
  
  return highlights;
}

/** 获取健康等级文本 */
export function getHealthLightLabel(level: number): string {
  const labels = ['尽量少吃', '可以放心吃', '适量食用'];
  return labels[level] || '未知';
}

/** 格式化营养素数值 */
export function formatNutrient(value: number | null, unit: string): string {
  if (value === null || value === 0) return '--';
  return `${value}${unit}`;
}
```

---

## 📅 开发时间表

### 本次会话计划（4-6小时）

| 时间 | 任务 | 预计 |
|------|------|------|
| 00:00-00:30 | ✅ 分析现状 + 制定计划 | 30min |
| 00:30-02:00 | 🔲 优化食物搜索页面 UI | 90min |
| 02:00-04:00 | 🔲 重做食物详情页面 | 120min |
| 04:00-05:00 | 🔲 增强首页营养统计 | 60min |
| 05:00-06:00 | 🔲 测试 + 文档 + 提交 | 60min |

### 下次会话计划

- 饮食记录详情页
- 营养分析页面
- 数据可视化功能
- 图表集成

---

## ✅ 验收标准

### 视觉标准
- ✅ 符合日系水彩风格
- ✅ 配色与现有页面一致
- ✅ 圆角、阴影统一
- ✅ 字体大小规范

### 功能标准
- ✅ 搜索响应快速（< 500ms）
- ✅ 数据展示完整
- ✅ 交互流畅无卡顿
- ✅ 边界情况处理完善

### 代码标准
- ✅ TypeScript 类型完整
- ✅ 代码注释清晰
- ✅ 组件可复用
- ✅ 性能优化到位

---

## 📝 总结

本文档制定了前端完善的完整计划，包括：

1. **设计系统分析** - 明确当前风格
2. **页面盘点** - 清楚现状和优先级
3. **详细方案** - 每个页面的具体设计
4. **设计规范** - 统一的组件和样式
5. **技术规范** - 代码编写标准
6. **时间计划** - 合理的开发安排

**核心原则**：
- 🎨 保持治愈系日系水彩风格
- 📱 持续完善和生序的优秀设计
- 💻 使用 Vue 3 + TypeScript
- 🚀 注重性能和用户体验
- 📚 完善的文档和注释

**现在开始实施！** 🚀

---

**文档创建时间**：2026-08-29  
**版本**：v1.0  
**下一步**：开始优化食物搜索页面
