<template>
  <view class="page">
    <AppNavBar title="确认这份食物" route="/pages/food-confirm/FoodConfirmPage" />

    <view v-if="!food" class="state">正在准备食物信息...</view>
    <template v-else>
      <view class="food-hero">
        <image v-if="imagePath" class="food-photo" :src="imagePath" mode="aspectFill" />
        <view v-else class="food-mark">
          <image
            :src="getFoodCategoryIcon(food.category?.slug, food.name)"
            mode="aspectFit"
          />
        </view>
        <view class="food-copy">
          <text class="food-name">{{ food.name }}</text>
          <text class="food-meta">{{ sourceLabel }}</text>
        </view>
      </view>

      <view
        v-if="canSaveToLibrary"
        class="library-option"
        data-testid="save-to-library"
      >
        <view class="library-copy">
          <text class="library-title">保存到我的食物</text>
          <text class="library-hint">下次搜索名称就能直接记录</text>
        </view>
        <switch
          :checked="saveToLibrary"
          color="#5c946f"
          @change="updateSaveToLibrary"
        />
      </view>

      <view class="section">
        <text class="section-title">实际吃了多少？</text>
        <view class="portion-row">
          <button
            v-for="serving in food.servings"
            :key="serving.id"
            :class="['serving', { selected: grams === serving.grams }]"
            @tap="chooseServing(serving.grams)"
          >
            <text>{{ serving.label }}</text>
            <text>{{ serving.grams }}g</text>
          </button>
        </view>
        <view class="gram-input">
          <input v-model="gramsText" type="digit" @input="syncGrams" />
          <text>克</text>
        </view>
      </view>

      <view class="section">
        <view class="section-title-row">
          <text class="section-title">这是哪一餐？</text>
          <text class="selected-label">{{ mealLabel }}</text>
        </view>
        <view class="meal-row">
          <button
            v-for="item in meals"
            :key="item.value"
            :class="['meal', { selected: mealType === item.value }]"
            @tap="mealType = item.value"
          >
            {{ item.label }}
          </button>
        </view>
      </view>

      <view class="nutrition">
        <view class="calorie">
          <text class="calorie-value">{{ preview.energyKcal }}</text>
          <text class="calorie-unit">千卡</text>
          <text class="calorie-caption">按当前份量估算</text>
        </view>
        <view class="macros">
          <view
            ><text>{{ preview.proteinG }}g</text><text>蛋白质</text></view
          >
          <view
            ><text>{{ preview.fatG }}g</text><text>脂肪</text></view
          >
          <view
            ><text>{{ preview.carbohydrateG }}g</text><text>碳水</text></view
          >
        </view>
      </view>

      <input v-model="note" class="note" maxlength="280" placeholder="给这餐留一句备注（选填）" />
      <text v-if="error" class="error">{{ error }}</text>
      <button class="save" :disabled="saving" @tap="save">
        {{ saving ? '保存中...' : mode === 'edit' ? '保存修改' : '确认并保存' }}
      </button>
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AppNavBar from '../../components/AppNavBar.vue';
import {
  createMealEntry,
  getFoodById,
  replaceMealEntry,
  userFoodToSearchItem,
} from '../../features/food/food.service.js';
import { confirmRecognition, loadRecognitionJob } from '../../features/food/food-recognition.js';
import { createUserFood, listUserFoods } from '../../features/food/user-foods.service.js';
import type { UserFoodSource } from '../../features/food/user-foods.types.js';
import {
  calculateFoodNutrition,
  type FoodItem,
  type MealType,
} from '../../features/food/food.types.js';
import { foodConfirmMode } from '../../features/food/food-entry-form.js';
import { getFoodCategoryIcon } from '../../features/food/food-icon.js';

const food = ref<FoodItem | null>(null);
const grams = ref(100);
const gramsText = ref('100');
const mealType = ref<MealType>('lunch');
const note = ref('');
const saving = ref(false);
const error = ref('');
const entryId = ref('');
const userFoodId = ref('');
const candidateId = ref('');
const jobId = ref('');
const source = ref<UserFoodSource>('catalog');
const imagePath = ref('');
const saveToLibrary = ref(true);
const savedUserFoodId = ref('');
const mode = computed(() => foodConfirmMode(entryId.value));
const canSaveToLibrary = computed(
  () => mode.value === 'create' && source.value === 'photo' && !userFoodId.value,
);
const sourceLabel = computed(() => {
  if (userFoodId.value) return '我的食物 · 使用已保存的营养数据';
  if (source.value === 'photo') return '序序相机识别 · 请确认份量';
  return `${food.value?.category?.name || '日常食物'} · 营养值来自食物库`;
});
const meals: Array<{ value: MealType; label: string }> = [
  { value: 'breakfast', label: '早餐' },
  { value: 'lunch', label: '午餐' },
  { value: 'dinner', label: '晚餐' },
  { value: 'snack', label: '加餐' },
];
const mealLabel = computed(
  () => meals.find((item) => item.value === mealType.value)?.label || '午餐',
);
const preview = computed(() =>
  food.value
    ? calculateFoodNutrition(food.value, Number(gramsText.value) || 0)
    : { energyKcal: 0, proteinG: 0, fatG: 0, carbohydrateG: 0 },
);

function syncGrams() {
  grams.value = Number(gramsText.value) || 0;
}
function chooseServing(value: number) {
  grams.value = value;
  gramsText.value = String(value);
}
function updateSaveToLibrary(event: Event) {
  saveToLibrary.value = Boolean(
    (event as unknown as { detail?: { value?: boolean } }).detail?.value,
  );
}
async function load(options?: Record<string, string>) {
  entryId.value = options?.entryId || '';
  userFoodId.value = options?.userFoodId || '';
  candidateId.value = options?.candidateId || '';
  jobId.value = options?.jobId || '';
  source.value = (options?.source as UserFoodSource) || 'catalog';
  imagePath.value = options?.imagePath ? decodeURIComponent(options.imagePath) : '';
  gramsText.value = options?.grams || '100';
  grams.value = Number(gramsText.value);
  mealType.value = (options?.mealType as MealType) || 'lunch';
  note.value = options?.note ? decodeURIComponent(options.note) : '';
  try {
    if (userFoodId.value) {
      const personalFoods = await listUserFoods();
      const personalFood = personalFoods.find((item) => item.id === userFoodId.value);
      food.value = personalFood ? userFoodToSearchItem(personalFood) : null;
    } else if (options?.foodId) {
      food.value = await getFoodById(options.foodId);
    } else if (candidateId.value) {
      const job = await loadRecognitionJob(jobId.value);
      const candidate = job.candidates.find((item) => item.id === candidateId.value);
      if (candidate && candidate.estimatedEnergyKcal != null && candidate.estimatedProteinG != null && candidate.estimatedFatG != null && candidate.estimatedCarbohydrateG != null) {
        const scale = 100 / Math.max(1, candidate.estimatedGrams);
        food.value = {
          id: `recognized-${candidate.id}`,
          name: candidate.name,
          brand: null,
          category: null,
          nutrition: {
            basisGrams: 100,
            energyKcal: Math.round(candidate.estimatedEnergyKcal * scale * 10) / 10,
            proteinG: Math.round(candidate.estimatedProteinG * scale * 10) / 10,
            fatG: Math.round(candidate.estimatedFatG * scale * 10) / 10,
            carbohydrateG: Math.round(candidate.estimatedCarbohydrateG * scale * 10) / 10,
            dietaryFiberG: null,
            sodiumMg: null,
          },
          servings: [{ id: `recognized-serving-${candidate.id}`, label: '识别份量', grams: candidate.estimatedGrams }],
        };
      }
    } else {
      food.value = null;
    }
    if (!food.value) error.value = '没有找到这份食物';
  } catch {
    error.value = '食物信息加载失败，请返回重试';
  }
}
async function save() {
  syncGrams();
  if (!food.value || grams.value <= 0) {
    error.value = '请输入大于 0 克的份量';
    return;
  }
  saving.value = true;
  error.value = '';
  try {
    if (canSaveToLibrary.value && saveToLibrary.value && !savedUserFoodId.value) {
      const saved = await createUserFood({
        name: food.value.name,
        imageUrl: null,
        source: 'photo',
        energyKcal: food.value.nutrition.energyKcal,
        proteinG: food.value.nutrition.proteinG,
        fatG: food.value.nutrition.fatG,
        carbohydrateG: food.value.nutrition.carbohydrateG,
        defaultServingLabel: '1 份',
        defaultServingGrams: grams.value,
      });
      savedUserFoodId.value = saved.id;
    }

    const commonInput = {
      mealType: mealType.value,
      grams: grams.value,
      recordedAt: new Date().toISOString(),
      note: note.value || undefined,
    };
    if (candidateId.value) {
      await confirmRecognition({ candidateId: candidateId.value, ...commonInput });
    } else {
      const foodReference = userFoodId.value
        ? { userFoodId: userFoodId.value }
        : { foodId: food.value.id };
      if (mode.value === 'edit') {
        await replaceMealEntry(entryId.value, { ...commonInput, ...foodReference });
      } else {
        await createMealEntry({ ...commonInput, ...foodReference });
      }
    }
    uni.showToast({
      title: mode.value === 'edit' ? '记录已更新' : '已记录这份食物',
      icon: 'success',
    });
    setTimeout(() => uni.navigateBack(), 450);
  } catch {
    error.value = '保存失败，请检查 API 服务是否已启动';
  } finally {
    saving.value = false;
  }
}

onLoad((options) => load(options as Record<string, string>));
</script>

<style scoped>
.page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 28rpx 32rpx 70rpx;
  background: #f6faf7;
  color: #244735;
}
.food-hero {
  display: flex;
  align-items: center;
  margin-top: 12rpx;
  padding: 22rpx;
  border: 1rpx solid #dceadd;
  border-radius: 18rpx;
  background: #fff;
}
.food-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 82rpx;
  height: 82rpx;
  flex: none;
  margin-right: 18rpx;
  border-radius: 22rpx;
  color: #fff;
  background: #7eae86;
  font-size: 36rpx;
  font-weight: 700;
}
.food-mark image {
  width: 100%;
  height: 100%;
}
.food-photo {
  width: 96rpx;
  height: 96rpx;
  flex: none;
  margin-right: 18rpx;
  border-radius: 14rpx;
  background: #edf4ee;
}
.food-copy {
  min-width: 0;
  flex: 1;
}
.food-name,
.food-meta,
.section-title,
.calorie-caption,
.macros text,
.error {
  display: block;
}
.food-name {
  color: #2f553d;
  font-size: 30rpx;
  font-weight: 700;
}
.food-meta {
  margin-top: 7rpx;
  overflow: hidden;
  color: #809787;
  font-size: 20rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.section {
  margin-top: 24rpx;
  padding: 22rpx 0;
  border-bottom: 1rpx solid #dceadd;
}
.section-title {
  color: #3d6249;
  font-size: 25rpx;
  font-weight: 700;
}
.portion-row,
.meal-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 16rpx;
}
.serving,
.meal {
  min-width: 120rpx;
  padding: 12rpx 16rpx;
  border: 1rpx solid #d8e7da;
  border-radius: 11rpx;
  color: #60806a;
  background: #fff;
  font-size: 22rpx;
}
.serving text {
  display: block;
}
.serving text:last-child {
  margin-top: 3rpx;
  color: #91a295;
  font-size: 18rpx;
}
.serving.selected,
.meal.selected {
  border-color: #6da57c;
  color: #286b47;
  background: #e8f4e8;
}
.gram-input {
  display: flex;
  align-items: center;
  height: 76rpx;
  margin-top: 14rpx;
  border: 1rpx solid #d8e7da;
  border-radius: 12rpx;
  background: #fff;
}
.gram-input input {
  min-width: 0;
  height: 100%;
  flex: 1;
  padding: 0 18rpx;
  font-size: 25rpx;
}
.gram-input text {
  padding-right: 18rpx;
  color: #789080;
  font-size: 21rpx;
}
.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.selected-label {
  color: #4f8a5f;
  font-size: 21rpx;
}
.library-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
  margin-top: 22rpx;
  padding: 22rpx;
  border: 1rpx solid #d9e8db;
  border-radius: 14rpx;
  background: #fff;
}
.library-copy {
  min-width: 0;
  flex: 1;
}
.library-title,
.library-hint {
  display: block;
}
.library-title {
  color: #315b42;
  font-size: 24rpx;
  font-weight: 700;
}
.library-hint {
  margin-top: 5rpx;
  color: #839789;
  font-size: 19rpx;
}
.nutrition {
  margin-top: 26rpx;
  padding: 24rpx;
  border-radius: 18rpx;
  background: #eaf4ea;
}
.calorie {
  text-align: center;
}
.calorie-value {
  color: #276b45;
  font-size: 58rpx;
  font-weight: 700;
}
.calorie-unit {
  margin-left: 8rpx;
  color: #4c8060;
  font-size: 22rpx;
}
.calorie-caption {
  margin-top: 2rpx;
  color: #779080;
  font-size: 19rpx;
}
.macros {
  display: flex;
  justify-content: space-around;
  margin-top: 20rpx;
  padding-top: 18rpx;
  border-top: 1rpx solid #d1e4d3;
}
.macros view {
  text-align: center;
}
.macros text:first-child {
  color: #355f43;
  font-size: 24rpx;
  font-weight: 700;
}
.macros text:last-child {
  margin-top: 4rpx;
  color: #789080;
  font-size: 18rpx;
}
.note {
  width: 100%;
  height: 76rpx;
  box-sizing: border-box;
  margin-top: 20rpx;
  padding: 0 18rpx;
  border: 1rpx solid #d8e7da;
  border-radius: 12rpx;
  background: #fff;
  font-size: 22rpx;
}
.error {
  margin-top: 12rpx;
  color: #b85e43;
  font-size: 20rpx;
}
.save {
  width: 100%;
  height: 80rpx;
  margin-top: 20rpx;
  border-radius: 14rpx;
  background: var(--hz-primary-soft);
  border: 2rpx solid var(--hz-primary-border);
  color: var(--hz-primary-ink);
  box-shadow: 0 8rpx 20rpx rgba(47, 124, 80, 0.1);
  font-size: 26rpx;
  line-height: 80rpx;
}
.save[disabled] {
  opacity: 0.55;
}
.state {
  padding: 150rpx 20rpx;
  color: #70897a;
  text-align: center;
  font-size: 24rpx;
}
</style>
