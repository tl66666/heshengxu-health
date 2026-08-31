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
      <text class="label">出生日期</text>
      <picker mode="date" :value="form.birthDate" @change="form.birthDate = $event.detail.value">
        <view class="date-picker"
          ><text>{{ form.birthDate || '请选择出生日期' }}</text
          ><text>›</text></view
        >
      </picker>
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
      <text class="label">你想关注什么？</text>
      <text class="goal-hint">最多选择 3 项，第一项作为首页主要方向</text>
      <view class="goal-list">
        <button
          v-for="item in goals"
          :key="item.value"
          :class="['goal', { selected: form.goals.includes(item.value) }]"
          @tap="toggleGoal(item.value)"
        >
          <view
            ><text>{{ item.label }}</text
            ><text>{{ item.detail }}</text></view
          >
          <view v-if="form.goals.includes(item.value)" class="goal-state">
            <text v-if="form.primaryGoal === item.value">主要</text>
            <image src="/static/icons/svg/check.svg" mode="aspectFit" />
          </view>
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
import {
  syncHabitPlansForGoals,
  syncPrimaryHealthPlan,
} from '../../features/health-profile/health-goal-sync.js';
import { loadProfileForDisplay } from '../../features/health-profile/profile-loader.js';
import { localProfileFromEdit } from '../../features/health-profile/profile-save.js';
import {
  loadHealthProfile,
  saveHealthProfile,
} from '../../features/health-profile/health-profile.service.js';
import {
  goalLabels,
  goalDetails,
  sexLabels,
  type HealthGoal,
  type HealthProfile,
} from '../../features/health-profile/health-profile.types.js';
import {
  createLocalWeightRecord,
  listLocalWeightRecords,
} from '../../features/weight/weight-records.local.js';

const section = ref<'basic' | 'body' | 'goal'>('basic');
const saving = ref(false);
const error = ref('');
const showLocalHint = ref(false);
const form = reactive({
  displayName: '',
  sex: 'unspecified' as HealthProfile['sex'],
  birthDate: '',
  heightCm: '',
  weightKg: '',
  primaryGoal: null as HealthGoal | null,
  goals: [] as HealthGoal[],
});
const sexes = Object.entries(sexLabels).map(([value, label]) => ({
  value: value as HealthProfile['sex'],
  label,
}));
const goals = Object.entries(goalLabels).map(([value, label]) => ({
  value: value as HealthGoal,
  label,
  detail: goalDetails[value as HealthGoal],
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
  form.birthDate = profile.birthDate || '';
  form.heightCm = profile.heightCm ? String(profile.heightCm) : '';
  form.weightKg = profile.weightKg ? String(profile.weightKg) : '';
  form.primaryGoal = profile.primaryGoal;
  form.goals = profile.goals?.length
    ? [...profile.goals]
    : profile.primaryGoal
      ? [profile.primaryGoal]
      : [];
}
function toggleGoal(goal: HealthGoal) {
  if (form.goals.includes(goal)) {
    form.goals = form.goals.filter((item) => item !== goal);
  } else if (form.goals.length < 3) {
    form.goals = [...form.goals, goal];
  } else {
    uni.showToast({ title: '最多选择 3 项', icon: 'none' });
    return;
  }
  form.primaryGoal = form.goals[0] || null;
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
  if (!fallback) {
    error.value = '请完整填写身高、体重并选择至少一个健康目标。';
    saving.value = false;
    return;
  }
  const previousWeight = loadLocalProfile()?.weightKg;
  saveLocalProfile(fallback);
  syncPrimaryHealthPlan(fallback.primaryGoal);
  syncHabitPlansForGoals(fallback.goals);
  if (section.value === 'body' && previousWeight !== fallback.weightKg) {
    createLocalWeightRecord({
      weight: fallback.weightKg,
      recordedAt: new Date().toISOString(),
      note: '健康档案更新',
    });
  } else if (!listLocalWeightRecords().length) {
    createLocalWeightRecord({
      weight: fallback.weightKg,
      recordedAt: new Date().toISOString(),
      note: '档案初始体重',
    });
  }
  saveHealthProfile({
    displayName: form.displayName || null,
    sex: form.sex,
    birthDate: form.birthDate || null,
    heightCm: Number(form.heightCm) || null,
    weightKg: Number(form.weightKg) || null,
    primaryGoal: form.primaryGoal,
  }).catch(() => null);
  uni.showToast({ title: '档案已更新', icon: 'success' });
  saving.value = false;
  setTimeout(() => uni.navigateBack(), 450);
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
.date-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 78rpx;
  padding: 0 18rpx;
  border: 1rpx solid #d7e6d9;
  border-radius: 12rpx;
  color: #4d6857;
  background: #fbfdfb;
  font-size: 23rpx;
}
.goal-hint {
  display: block;
  margin: -2rpx 0 14rpx;
  color: #8b9c91;
  font-size: 19rpx;
}
.goal-state {
  display: flex;
  align-items: center;
  gap: 7rpx;
  color: #5d8069;
  font-size: 17rpx;
}
.goal-state image {
  width: 28rpx;
  height: 28rpx;
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
  height: 84rpx;
  margin-top: 24rpx;
  border-radius: 14rpx;
  background: var(--hz-primary-soft);
  border: 2rpx solid var(--hz-primary-border);
  color: var(--hz-primary-ink);
  box-shadow: 0 8rpx 20rpx rgba(47, 124, 80, 0.1);
  box-shadow: 0 8rpx 20rpx rgba(40, 92, 60, 0.2);
  font-size: 27rpx;
  font-weight: 600;
  line-height: 84rpx;
}
.save[disabled] {
  opacity: 0.55;
}
</style>
