<template>
  <view class="page">
    <AppNavBar title="确认这份食物" route="/pages/food-confirm/FoodConfirmPage" />

    <view v-if="loading" class="state loading-state">
      <view class="loading-pulse"><view /><view /><view /></view>
      <text>正在准备这份餐食</text>
    </view>
    <view v-else-if="loadError" class="state error-state">
      <image src="/static/illustrations/xuxu-ai-empty.png" mode="aspectFit" />
      <text class="state-title">这份结果需要重新确认</text>
      <text class="state-copy">{{ loadError }}</text>
      <view class="state-actions">
        <button class="state-secondary" @tap="openFoodLibrary">去食物库</button>
        <button class="state-primary" @tap="restartRecognition">重新识别</button>
      </view>
    </view>
    <template v-else-if="food">
      <view v-if="imagePath" class="photo-hero">
        <image class="food-photo" :src="imagePath" mode="aspectFit" />
        <text class="photo-caption">照片仅用于本次识别确认</text>
      </view>

      <view class="identity-section">
        <text class="field-label">食物名称</text>
        <input v-if="source === 'photo'" v-model="foodName" class="name-input" maxlength="120" />
        <view v-else class="catalog-title">
          <view class="food-mark"><image :src="$asset(getFoodCategoryIcon(food.category?.slug, food.name))" mode="aspectFit" /></view>
          <view><text class="food-name">{{ food.name }}</text><text class="food-meta">{{ sourceLabel }}</text></view>
        </view>
        <text v-if="source === 'photo'" class="field-help">识别不准确时，可以直接改成你熟悉的菜名</text>
      </view>

      <view class="portion-section">
        <view class="section-heading"><text>这份吃了多少</text><text>营养会随份量更新</text></view>
        <view class="portion-control">
          <button aria-label="减少份量" @tap="adjustGrams(-10)">−</button>
          <view class="gram-value"><input v-model="gramsText" type="digit" @input="syncGrams" /><text>克</text></view>
          <button aria-label="增加份量" @tap="adjustGrams(10)">＋</button>
        </view>
        <scroll-view v-if="food.servings.length" class="serving-row" scroll-x show-scrollbar="false">
          <button v-for="serving in food.servings" :key="serving.id" :class="['serving', { selected: grams === serving.grams }]" @tap="chooseServing(serving.grams)">
            {{ serving.label }} · {{ serving.grams }}g
          </button>
        </scroll-view>
      </view>

      <view v-if="source === 'photo' && components.length" class="components-section">
        <view class="section-heading"><text>这份餐里有什么</text><text>点开即可修正</text></view>
        <view class="component-list">
          <view v-for="(component, index) in components" :key="`${index}-${component.name}`" class="component-editor">
            <view class="component-dot" />
            <input v-model="component.name" class="component-name-input" maxlength="60" @blur="recalculateFromComponents" />
            <view class="component-grams"><input v-model="component.estimatedGrams" type="digit" @input="recalculateFromComponents" /><text>g</text></view>
            <button aria-label="移除食材" @tap="removeComponent(index)">×</button>
          </view>
        </view>
        <button class="add-component" @tap="addComponent">＋ 添加漏掉的食材</button>
      </view>

      <view class="nutrition-section">
        <view class="calorie-copy"><text class="calorie-value">{{ preview.energyKcal }}</text><text class="calorie-unit">千卡</text><text class="calorie-note">当前份量估算</text></view>
        <view class="macro-grid">
          <view><text>{{ preview.proteinG }}g</text><text>蛋白质</text></view>
          <view><text>{{ preview.fatG }}g</text><text>脂肪</text></view>
          <view><text>{{ preview.carbohydrateG }}g</text><text>碳水</text></view>
        </view>
      </view>

      <view class="meal-section">
        <view class="section-heading"><text>记到哪一餐</text><text>{{ mealLabel }}</text></view>
        <view class="meal-row">
          <button v-for="item in meals" :key="item.value" :class="['meal', { selected: mealType === item.value }]" @tap="mealType = item.value">{{ item.label }}</button>
        </view>
      </view>

      <view v-if="canSaveToLibrary" class="library-option" data-testid="save-to-library">
        <view class="library-copy"><text class="library-title">保存到我的食物</text><text class="library-hint">以后搜索“{{ foodName || '这份食物' }}”就能直接记录</text></view>
        <switch :checked="saveToLibrary" color="#7fa78b" @change="updateSaveToLibrary" />
      </view>

      <view class="note-section">
        <text class="field-label">补充说明（选填）</text>
        <textarea v-model="note" maxlength="280" placeholder="例如：少饭、没有喝汤" auto-height />
      </view>

      <text v-if="error" class="error">{{ error }}</text>
      <view class="save-dock">
        <button class="save" :disabled="saving" @tap="save">{{ saving ? '正在保存...' : mode === 'edit' ? '保存修改' : saveToLibrary ? '保存到我的食物并记下这餐' : '只记下这餐' }}</button>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AppNavBar from '../../components/AppNavBar.vue';
import { createMealEntry, getFoodById, replaceMealEntry, userFoodToSearchItem } from '../../features/food/food.service.js';
import {
  confirmRecognition,
  getCachedRecognitionJob,
  loadRecognitionJob,
  recognitionCandidateToFood,
  type RecognitionCandidate,
} from '../../features/food/food-recognition.js';
import { listUserFoods, persistUserFoodPhoto } from '../../features/food/user-foods.service.js';
import type { UserFoodSource } from '../../features/food/user-foods.types.js';
import { calculateFoodNutrition, type FoodItem, type MealType } from '../../features/food/food.types.js';
import { foodConfirmMode } from '../../features/food/food-entry-form.js';
import { getFoodCategoryIcon } from '../../features/food/food-icon.js';

const food = ref<FoodItem | null>(null);
const loading = ref(true);
const loadError = ref('');
const foodName = ref('');
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
const components = ref<NonNullable<RecognitionCandidate['components']>>([]);
const mode = computed(() => foodConfirmMode(entryId.value));
const canSaveToLibrary = computed(() => mode.value === 'create' && source.value === 'photo');
const sourceLabel = computed(() => userFoodId.value ? '我的食物' : `${food.value?.category?.name || '日常食物'} · 食物库营养数据`);
const meals: Array<{ value: MealType; label: string }> = [
  { value: 'breakfast', label: '早餐' }, { value: 'lunch', label: '午餐' },
  { value: 'dinner', label: '晚餐' }, { value: 'snack', label: '加餐' },
];
const mealLabel = computed(() => meals.find((item) => item.value === mealType.value)?.label || '午餐');
const preview = computed(() => food.value
  ? calculateFoodNutrition(food.value, Number(gramsText.value) || 0)
  : { energyKcal: 0, proteinG: 0, fatG: 0, carbohydrateG: 0 });

function syncGrams() { grams.value = Math.max(0, Number(gramsText.value) || 0); }
function adjustGrams(change: number) { chooseServing(Math.max(10, grams.value + change)); }
function chooseServing(value: number) { grams.value = value; gramsText.value = String(Math.round(value)); }
function updateSaveToLibrary(event: Event) { saveToLibrary.value = Boolean((event as unknown as { detail?: { value?: boolean } }).detail?.value); }
function recalculateFromComponents() {
  const total = components.value.reduce((sum, item) => sum + Math.max(0, Number(item.estimatedGrams) || 0), 0);
  if (total > 0) chooseServing(total);
}
function removeComponent(index: number) { components.value.splice(index, 1); recalculateFromComponents(); }
function addComponent() { components.value.push({ name: '其他食材', estimatedGrams: 50, estimatedEnergyKcal: 0 }); recalculateFromComponents(); }
function restartRecognition() { uni.redirectTo({ url: `/pages/food-recognition/FoodRecognitionPage?mealType=${mealType.value}` }); }
function openFoodLibrary() { uni.redirectTo({ url: `/pages/food-search/FoodSearchPage?mealType=${mealType.value}` }); }

async function load(options?: Record<string, string>) {
  loading.value = true;
  loadError.value = '';
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
      const personalFood = (await listUserFoods()).find((item) => item.id === userFoodId.value);
      food.value = personalFood ? userFoodToSearchItem(personalFood) : null;
    } else if (options?.foodId && !candidateId.value) {
      food.value = await getFoodById(options.foodId);
    } else if (candidateId.value) {
      const job = getCachedRecognitionJob(jobId.value) ?? await loadRecognitionJob(jobId.value);
      const candidate = job.candidates.find((item) => item.id === candidateId.value);
      if (!candidate) {
        loadError.value = '没有找到刚才的识别结果，可以重新拍摄或手动记录。';
      } else {
        foodName.value = candidate.name;
        components.value = (candidate.components ?? []).map((item) => ({ ...item }));
        food.value = recognitionCandidateToFood(candidate);
        if (!food.value && candidate.foodId) food.value = await getFoodById(candidate.foodId);
        if (!food.value) loadError.value = '旧识别结果缺少营养估算，请重新识别一次，新的结果会给出完整热量和食材组成。';
      }
    }
    if (food.value && !foodName.value) foodName.value = food.value.name;
    if (!food.value && !loadError.value) loadError.value = '没有找到这份食物，可以重新识别或从食物库选择。';
  } catch {
    loadError.value = '读取识别结果时网络有波动，可以重试识别或从食物库手动记录。';
  } finally {
    loading.value = false;
  }
}

async function save() {
  syncGrams();
  if (!food.value || grams.value <= 0 || !foodName.value.trim()) { error.value = '请填写食物名称和有效份量'; return; }
  saving.value = true;
  error.value = '';
  let savedToLibrary = false;
  try {
    const commonInput = { mealType: mealType.value, grams: grams.value, recordedAt: new Date().toISOString(), note: note.value || undefined };
    if (candidateId.value) {
      // createUserFood is intentionally handled server-side by confirmRecognition
      // estimatedEnergyKcal: preview.energyKcal is sent as the visible-portion snapshot.
      const result = await confirmRecognition({
        candidateId: candidateId.value, ...commonInput, saveToLibrary: saveToLibrary.value,
        name: foodName.value.trim(), estimatedEnergyKcal: preview.value.energyKcal,
        estimatedProteinG: preview.value.proteinG, estimatedFatG: preview.value.fatG,
        estimatedCarbohydrateG: preview.value.carbohydrateG,
      });
      savedToLibrary = result.savedToLibrary;
      if (saveToLibrary.value && result.userFoodId && imagePath.value) {
        await persistUserFoodPhoto(result.userFoodId, imagePath.value);
      }
    } else {
      const foodReference = userFoodId.value ? { userFoodId: userFoodId.value } : { foodId: food.value.id };
      if (mode.value === 'edit') await replaceMealEntry(entryId.value, { ...commonInput, ...foodReference });
      else await createMealEntry({ ...commonInput, ...foodReference });
    }
      const toastTitle = mode.value === 'edit'
        ? '记录已更新'
        : savedToLibrary
          ? '已保存到我的食物'
          : '这餐已经记好';
      uni.showToast({ title: toastTitle, icon: 'success' });
    setTimeout(() => uni.navigateBack({ delta: candidateId.value ? 2 : 1 }), 450);
  } catch { error.value = '暂时没有保存成功，请稍后再试'; }
  finally { saving.value = false; }
}

onLoad((options) => load(options as Record<string, string>));
</script>

<style scoped>
.page { min-height: 100vh; box-sizing: border-box; padding: 16rpx 32rpx 178rpx; color: #2b4034; background: #fffdf9; }
button::after { border: 0; }
.state { display: flex; align-items: center; flex-direction: column; padding: 180rpx 24rpx; color: #7d8c82; text-align: center; font-size: 24rpx; }
.loading-pulse { display: flex; align-items: flex-end; gap: 8rpx; height: 46rpx; margin-bottom: 22rpx; }
.loading-pulse view { width: 9rpx; height: 26rpx; border-radius: 8rpx; background: #8caf98; animation: load-wave 1s ease-in-out infinite; }
.loading-pulse view:nth-child(2) { height: 42rpx; animation-delay: .14s; }
.loading-pulse view:nth-child(3) { height: 32rpx; animation-delay: .28s; }
@keyframes load-wave { 50% { opacity: .35; transform: scaleY(.58); } }
.error-state { padding-top: 100rpx; }
.error-state > image { width: 240rpx; height: 190rpx; margin-bottom: 24rpx; }
.state-title { color: #31483b; font-size: 31rpx; font-weight: 750; }
.state-copy { max-width: 560rpx; margin-top: 12rpx; color: #849087; font-size: 21rpx; line-height: 1.65; }
.state-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 14rpx; width: 100%; margin-top: 30rpx; }
.state-actions button { display: flex; align-items: center; justify-content: center; height: 78rpx; border-radius: 18rpx; font-size: 23rpx; line-height: 1; }
.state-secondary { border: 1rpx solid #dce5dd; color: #587062; background: #f7faf6; }
.state-primary { color: #fff; background: #71977e; box-shadow: 0 10rpx 24rpx rgba(72,111,83,.18); }
.photo-hero { position: relative; height: 330rpx; margin-top: 8rpx; overflow: hidden; border: 1rpx solid #ece5da; border-radius: 24rpx; background: #f7f0e7; }
.food-photo { width: 100%; height: 100%; }
.photo-caption { position: absolute; right: 16rpx; bottom: 14rpx; padding: 8rpx 14rpx; border-radius: 999rpx; color: #77736c; background: rgba(255,253,249,.88); font-size: 17rpx; }
.identity-section, .portion-section, .components-section, .meal-section, .note-section { padding: 30rpx 4rpx; border-bottom: 1rpx solid #eee9e1; }
.field-label { display: block; margin-bottom: 14rpx; color: #66766c; font-size: 20rpx; }
.name-input { width: 100%; height: 76rpx; box-sizing: border-box; padding: 0 18rpx; border: 1rpx solid #e3e5de; border-radius: 16rpx; color: #263c30; background: #fff; font-size: 30rpx; font-weight: 700; }
.field-help { display: block; margin-top: 10rpx; color: #929b95; font-size: 18rpx; }
.catalog-title { display: flex; align-items: center; gap: 18rpx; }
.food-mark { display: flex; align-items: center; justify-content: center; width: 78rpx; height: 78rpx; overflow: hidden; border-radius: 18rpx; background: #edf4ed; }
.food-mark image { width: 100%; height: 100%; }
.food-name, .food-meta { display: block; }
.food-name { font-size: 30rpx; font-weight: 730; }
.food-meta { margin-top: 6rpx; color: #8d9891; font-size: 19rpx; }
.section-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 16rpx; margin-bottom: 20rpx; }
.section-heading text:first-child { color: #32483b; font-size: 26rpx; font-weight: 730; }
.section-heading text:last-child { color: #929a95; font-size: 18rpx; }
.portion-control { display: grid; grid-template-columns: 76rpx 1fr 76rpx; align-items: center; gap: 18rpx; }
.portion-control > button { display: flex; align-items: center; justify-content: center; width: 76rpx; height: 76rpx; border: 1rpx solid #dfe7df; border-radius: 50%; color: #56715f; background: #f7faf6; font-size: 34rpx; line-height: 1; }
.gram-value { display: flex; align-items: baseline; justify-content: center; height: 76rpx; border-bottom: 2rpx solid #a8c0ad; }
.gram-value input { width: 150rpx; height: 76rpx; color: #294334; text-align: center; font-size: 42rpx; font-weight: 750; }
.gram-value text { color: #7b8980; font-size: 22rpx; }
.serving-row { width: 100%; margin-top: 20rpx; white-space: nowrap; }
.serving { display: inline-flex; align-items: center; justify-content: center; height: 54rpx; margin-right: 10rpx; padding: 0 18rpx; border: 1rpx solid #e2e7e1; border-radius: 999rpx; color: #738178; background: #fff; font-size: 19rpx; line-height: 1; }
.serving.selected { border-color: #aac5b1; color: #3f684e; background: #eff6ef; }
.component-list { border-top: 1rpx solid #eee9e1; }
.component-editor { display: grid; grid-template-columns: 12rpx minmax(0,1fr) 112rpx 52rpx; align-items: center; gap: 12rpx; min-height: 78rpx; border-bottom: 1rpx solid #eee9e1; }
.component-dot { width: 9rpx; height: 9rpx; border-radius: 50%; background: #d7aa75; }
.component-name-input { height: 70rpx; color: #405247; font-size: 22rpx; }
.component-grams { display: flex; align-items: center; border-bottom: 1rpx solid #d9dfd8; }
.component-grams input { width: 76rpx; height: 58rpx; text-align: right; font-size: 21rpx; }
.component-grams text { color: #8a948d; font-size: 19rpx; }
.component-editor > button { display: flex; align-items: center; justify-content: center; width: 48rpx; height: 48rpx; border-radius: 50%; color: #a18b7f; background: #faf3ed; font-size: 26rpx; line-height: 1; }
.add-component { display: flex; align-items: center; justify-content: center; height: 60rpx; margin-top: 14rpx; color: #607b68; background: transparent; font-size: 20rpx; line-height: 1; }
.nutrition-section { display: grid; grid-template-columns: 1fr 1.7fr; align-items: center; gap: 20rpx; margin: 28rpx 0 4rpx; padding: 28rpx; border: 1rpx solid #eee5d8; border-radius: 22rpx; background: linear-gradient(135deg,#fff7eb,#fffdf9); }
.calorie-copy { padding-right: 18rpx; border-right: 1rpx solid #ebe2d6; }
.calorie-value { color: #b96e50; font-size: 50rpx; font-weight: 760; }
.calorie-unit { margin-left: 5rpx; color: #756e67; font-size: 19rpx; }
.calorie-note { display: block; margin-top: 8rpx; color: #968f88; font-size: 17rpx; }
.macro-grid { display: grid; grid-template-columns: repeat(3,1fr); }
.macro-grid view { text-align: center; }
.macro-grid text { display: block; color: #405649; font-size: 21rpx; font-weight: 700; }
.macro-grid text:last-child { margin-top: 5rpx; color: #939b95; font-size: 16rpx; font-weight: 500; }
.meal-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 10rpx; padding: 6rpx; border-radius: 18rpx; background: #f1f3ef; }
.meal { display: flex; align-items: center; justify-content: center; height: 64rpx; border-radius: 14rpx; color: #7a867e; background: transparent; font-size: 21rpx; line-height: 1; }
.meal.selected { color: #3a6048; background: #fff; box-shadow: 0 5rpx 16rpx rgba(66,78,68,.09); font-weight: 700; }
.library-option { display: flex; align-items: center; justify-content: space-between; gap: 20rpx; margin: 26rpx 0 0; padding: 24rpx; border: 1rpx solid #dfe8df; border-radius: 20rpx; background: #f6faf5; }
.library-copy { min-width: 0; flex: 1; }
.library-title, .library-hint { display: block; }
.library-title { color: #385542; font-size: 23rpx; font-weight: 700; }
.library-hint { margin-top: 6rpx; overflow: hidden; color: #87948b; font-size: 18rpx; text-overflow: ellipsis; white-space: nowrap; }
.note-section textarea { width: 100%; min-height: 104rpx; box-sizing: border-box; padding: 18rpx; border: 1rpx solid #e4e4de; border-radius: 16rpx; color: #34483c; background: #fff; font-size: 21rpx; line-height: 1.6; }
.error { display: block; margin: 18rpx 4rpx; color: #b25f52; font-size: 20rpx; }
.save-dock { position: fixed; right: 0; bottom: 0; left: 0; z-index: 50; padding: 18rpx 32rpx calc(env(safe-area-inset-bottom) + 18rpx); border-top: 1rpx solid rgba(231,228,220,.9); background: rgba(255,253,249,.96); backdrop-filter: blur(18px); }
.save { display: flex; align-items: center; justify-content: center; width: 100%; height: 84rpx; border-radius: 18rpx; color: #fff; background: linear-gradient(135deg,#7faa8c,#668e75); box-shadow: 0 12rpx 28rpx rgba(77,116,90,.2); font-size: 25rpx; font-weight: 700; line-height: 1; }
.save[disabled] { opacity: .55; }
</style>
