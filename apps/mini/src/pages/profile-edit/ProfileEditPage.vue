<template>
  <view class="page">
    <AppNavBar title="编辑健康档案" route="/pages/profile-edit/ProfileEditPage" />

    <view class="intro">
      <text class="eyebrow">{{ sectionTitle }}</text>
      <text class="title">只调整你现在在意的部分</text>
      <text class="hint">保存后会更新健康档案，之后仍然可以随时修改。</text>
    </view>

    <view v-if="showLocalHint" class="local-note">当前编辑的是本机保存的建档信息</view>

    <view v-if="section === 'basic'" class="panel">
      <text class="label">怎么称呼你？</text>
      <input v-model="form.displayName" class="input" maxlength="40" placeholder="例如：小禾" />
      <text class="label">性别</text>
      <view class="choices">
        <button
          v-for="item in sexes"
          :key="item.value"
          :class="['choice', { selected: form.sex === item.value }]"
          @tap="form.sex = item.value"
        >
          {{ item.label }}
        </button>
      </view>
    </view>

    <view v-else-if="section === 'body'" class="panel">
      <text class="label">身高</text>
      <view class="input-row"
        ><input
          v-model="form.heightCm"
          class="input"
          type="digit"
          placeholder="例如 168"
          @input="clearError"
        /><text>cm</text></view
      >
      <text class="label">体重</text>
      <view class="input-row"
        ><input
          v-model="form.weightKg"
          class="input"
          type="digit"
          placeholder="例如 62"
          @input="clearError"
        /><text>kg</text></view
      >
      <view v-if="bmi !== null" class="bmi"
        ><text>{{ bmi.toFixed(1) }}</text
        ><text>BMI 参考值 · {{ bmiLabel }}</text
        ><text>这是健康管理参考，不是医疗诊断。</text></view
      >
    </view>

    <view v-else class="panel">
      <text class="label">你想先关注什么？</text>
      <view class="goal-list">
        <button
          v-for="item in goals"
          :key="item.value"
          :class="['goal', { selected: form.primaryGoal === item.value }]"
          @tap="form.primaryGoal = item.value"
        >
          <view
            ><text>{{ item.label }}</text
            ><text>{{ item.detail }}</text></view
          >
          <image
            v-if="form.primaryGoal === item.value"
            src="/static/icons/check.svg"
            mode="aspectFit"
          />
        </button>
      </view>
    </view>

    <text v-if="error" class="error">{{ error }}</text>
    <button class="save" :disabled="saving" @tap="save">
      {{ saving ? '保存中…' : '保存修改' }}
    </button>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { calculateBmi, classifyBmi } from '../../../../../packages/domain/src/bmi.js';
import AppNavBar from '../../components/AppNavBar.vue';
import { loadLocalProfile, saveLocalProfile } from '../../features/health-loop/local-demo.js';
import { loadProfileForDisplay } from '../../features/health-profile/profile-loader.js';
import { localProfileFromEdit } from '../../features/health-profile/profile-save.js';
import {
  loadHealthProfile,
  saveHealthProfile,
} from '../../features/health-profile/health-profile.service.js';
import {
  goalLabels,
  sexLabels,
  type HealthGoal,
  type HealthProfile,
} from '../../features/health-profile/health-profile.types.js';

const section = ref<'basic' | 'body' | 'goal'>('basic');
const saving = ref(false);
const error = ref('');
const showLocalHint = ref(false);
const form = reactive({
  displayName: '',
  sex: 'unspecified' as HealthProfile['sex'],
  heightCm: '',
  weightKg: '',
  primaryGoal: null as HealthGoal | null,
});
const sexes = Object.entries(sexLabels).map(([value, label]) => ({
  value: value as HealthProfile['sex'],
  label,
}));
const goals = Object.entries(goalLabels).map(([value, label]) => ({
  value: value as HealthGoal,
  label,
  detail:
    value === 'weight_management' ? '建立更轻松的饮食与活动节奏' : '从一个容易坚持的小行动开始',
}));
const sectionTitle = computed(
  () => ({ basic: '基础资料', body: '身体指标', goal: '健康目标' })[section.value],
);
const bmi = computed(() =>
  Number(form.heightCm) > 0 && Number(form.weightKg) > 0
    ? calculateBmi(Number(form.heightCm), Number(form.weightKg))
    : null,
);
const bmiLabel = computed(() =>
  bmi.value === null
    ? ''
    : { underweight: '偏瘦', normal: '正常', overweight: '偏重', obesity: '肥胖' }[
        classifyBmi(bmi.value)
      ],
);

function clearError() {
  error.value = '';
}
function fillForm(profile: HealthProfile) {
  form.displayName = profile.displayName || '';
  form.sex = profile.sex;
  form.heightCm = profile.heightCm ? String(profile.heightCm) : '';
  form.weightKg = profile.weightKg ? String(profile.weightKg) : '';
  form.primaryGoal = profile.primaryGoal;
}
async function load() {
  error.value = '';
  const result = await loadProfileForDisplay(loadHealthProfile, loadLocalProfile);
  showLocalHint.value = result.source === 'local';
  if (!result.profile) {
    error.value = '档案暂时无法加载，请检查网络后重试。';
    return;
  }
  fillForm(result.profile);
}
async function save() {
  error.value = '';
  saving.value = true;
  const fallback = localProfileFromEdit(form);
  try {
    await saveHealthProfile({
      displayName: form.displayName || null,
      sex: form.sex,
      heightCm: Number(form.heightCm) || null,
      weightKg: Number(form.weightKg) || null,
      primaryGoal: form.primaryGoal,
    });
    if (fallback) saveLocalProfile(fallback);
    uni.showToast({ title: '档案已更新', icon: 'success' });
    setTimeout(() => uni.navigateBack(), 450);
  } catch {
    if (!fallback) {
      error.value = '网络不可用时，需要完整的身高、体重和健康目标才能保存到本机。';
      return;
    }
    saveLocalProfile(fallback);
    uni.showToast({ title: '已保存到本机', icon: 'success' });
    setTimeout(() => uni.navigateBack(), 450);
  } finally {
    saving.value = false;
  }
}
onLoad((options) => {
  const requested = options?.section;
  if (requested === 'body' || requested === 'goal') section.value = requested;
  load();
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 28rpx 32rpx 70rpx;
  background: #f7fbf8;
  color: #244735;
}
.intro {
  padding: 10rpx 2rpx 22rpx;
}
.eyebrow {
  display: block;
  color: #667f6e;
  font-size: 22rpx;
  font-weight: 700;
}
.title {
  display: block;
  margin-top: 9rpx;
  color: #244735;
  font-size: 35rpx;
  font-weight: 700;
}
.hint {
  display: block;
  margin-top: 8rpx;
  color: #809687;
  font-size: 21rpx;
  line-height: 1.55;
}
.local-note {
  margin: 0 0 16rpx;
  padding: 12rpx 14rpx;
  border: 1rpx solid #e5ddbb;
  border-radius: 10rpx;
  color: #756b47;
  background: #fffdf5;
  font-size: 20rpx;
}
.panel {
  padding: 22rpx;
  border: 1rpx solid #dceadd;
  border-radius: 16rpx;
  background: #fff;
}
.label {
  display: block;
  margin-bottom: 10rpx;
  color: #567463;
  font-size: 23rpx;
  font-weight: 700;
}
.panel > .label:not(:first-child) {
  margin-top: 24rpx;
}
.input,
.input-row {
  box-sizing: border-box;
  width: 100%;
  height: 78rpx;
  border: 1rpx solid #d7e6d9;
  border-radius: 12rpx;
  background: #fbfdfb;
  font-size: 25rpx;
}
.input {
  padding: 0 18rpx;
}
.input-row {
  display: flex;
  align-items: center;
}
.input-row .input {
  border: 0;
}
.input-row > text {
  padding-right: 18rpx;
  color: #789080;
  font-size: 21rpx;
}
.choices {
  display: flex;
  gap: 10rpx;
}
.choice {
  flex: 1;
  padding: 14rpx 6rpx;
  border: 1rpx solid #dceadd;
  border-radius: 11rpx;
  color: #5d7a68;
  background: #fff;
  font-size: 22rpx;
}
.choice.selected {
  border-color: #82ad8b;
  color: #315f43;
  background: #eff7ef;
}
.bmi {
  margin-top: 20rpx;
  padding: 18rpx;
  border-radius: 14rpx;
  background: #eff7ef;
}
.bmi text {
  display: block;
}
.bmi text:first-child {
  color: #3f7650;
  font-size: 48rpx;
  font-weight: 700;
}
.bmi text:nth-child(2) {
  margin-top: 2rpx;
  color: #5b7e64;
  font-size: 22rpx;
}
.bmi text:last-child {
  margin-top: 9rpx;
  color: #809586;
  font-size: 18rpx;
}
.goal-list {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}
.goal {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 16rpx;
  border: 1rpx solid #dceadd;
  border-radius: 13rpx;
  text-align: left;
  background: #fff;
}
.goal.selected {
  border-color: #82ad8b;
  background: #eff7ef;
}
.goal view {
  min-width: 0;
}
.goal text {
  display: block;
}
.goal text:first-child {
  color: #31543e;
  font-size: 24rpx;
  font-weight: 700;
}
.goal text:last-child {
  margin-top: 5rpx;
  color: #819486;
  font-size: 19rpx;
}
.goal image {
  width: 32rpx;
  height: 32rpx;
}
.error {
  display: block;
  margin-top: 14rpx;
  padding: 12rpx 14rpx;
  border-radius: 11rpx;
  color: #9d5c49;
  background: #fff1ed;
  font-size: 20rpx;
  line-height: 1.5;
}
.save {
  width: 100%;
  height: 80rpx;
  margin-top: 22rpx;
  border: 1rpx solid #b9d2bb;
  border-radius: 14rpx;
  color: #426a4e;
  background: #eef6ee;
  font-size: 26rpx;
  line-height: 80rpx;
}
.save[disabled] {
  opacity: 0.55;
}
</style>
