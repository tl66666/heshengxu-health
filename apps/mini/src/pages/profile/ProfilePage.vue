<template>
  <view class="page">
    <AppNavBar title="健康档案" route="/pages/profile/ProfilePage" />

    <view v-if="loading" class="state state--loading">
      <view class="state-line state-line--wide" />
      <view class="state-line" />
      <view class="state-line" />
    </view>

    <view v-else-if="source === 'unavailable'" class="state state--empty">
      <text class="state-title">暂时没有读取到健康档案</text>
      <text class="state-copy">检查网络后重试，或从“我的”重新开始建档。</text>
      <button class="retry" @tap="load">重新加载</button>
    </view>

    <template v-else-if="profile">
      <view v-if="source === 'local'" class="local-note">
        <text>当前显示本机保存的建档信息</text>
        <button @tap="load">重新连接</button>
      </view>

      <view class="profile-summary">
        <view class="initial-avatar"
          ><image src="/static/illustrations/default-user-avatar.png" mode="aspectFill" /></view
        >
        <view class="identity-copy">
          <text class="name">{{ profile.displayName || '健康管理者' }}</text>
          <text class="sub">{{ profile.primaryGoal ? goalLabel : '先补充你的健康目标' }}</text>
        </view>
        <view class="completion"
          ><text>完整度</text><text>{{ completion }}%</text></view
        >
      </view>

      <view class="completion-track"
        ><view class="completion-fill" :style="{ width: `${completion}%` }"
      /></view>

      <view class="metrics" aria-label="身体指标">
        <view class="metric"
          ><text>{{ profile.heightCm || '--' }}</text
          ><text>身高 cm</text></view
        >
        <view class="metric"
          ><text>{{ profile.weightKg || '--' }}</text
          ><text>体重 kg</text></view
        >
        <view class="metric"
          ><text>{{ bmi === null ? '--' : bmi.toFixed(1) }}</text
          ><text>BMI 参考</text></view
        >
      </view>

      <view class="section goal-section">
        <view class="section-head"
          ><text class="section-title">我的健康方向</text
          ><button @tap="edit('goal')">调整</button></view
        >
        <view class="goal-cards">
          <button v-for="goal in profileGoals" :key="goal" class="goal-card" @tap="openGoal(goal)">
            <view
              ><text>{{ goalLabels[goal] }}</text
              ><text>{{ goalDetails[goal] }}</text></view
            >
            <image class="arrow" src="/static/icons/svg/forward.svg" mode="aspectFit" />
          </button>
        </view>
      </view>

      <view class="section">
        <text class="section-title">档案信息</text>
        <view class="card">
          <button class="row" @tap="edit('basic')">
            <view class="row-copy"
              ><text>基础资料</text
              ><text>{{ sexLabel }} · {{ profile.displayName || '未填写称呼' }}</text></view
            >
            <image class="arrow" src="/static/icons/svg/forward.svg" mode="aspectFit" />
          </button>
          <button class="row" @tap="edit('body')">
            <view class="row-copy"
              ><text>身体指标</text><text>{{ bodySummary }}</text></view
            >
            <image class="arrow" src="/static/icons/svg/forward.svg" mode="aspectFit" />
          </button>
          <button class="row row--last" @tap="edit('goal')">
            <view class="row-copy"
              ><text>健康目标</text><text>{{ goalLabel }}</text></view
            >
            <image class="arrow" src="/static/icons/svg/forward.svg" mode="aspectFit" />
          </button>
        </view>
      </view>

      <view class="privacy-note">
        <text>你的档案只用于生成健康管理参考，不提供疾病诊断或治疗建议。</text>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { calculateBmi } from '../../../../../packages/domain/src/bmi.js';
import AppNavBar from '../../components/AppNavBar.vue';
import { loadLocalProfile } from '../../features/health-loop/local-demo.js';
import { loadProfileForDisplay } from '../../features/health-profile/profile-loader.js';
import { loadHealthProfile } from '../../features/health-profile/health-profile.service.js';
import {
  goalLabels,
  goalDetails,
  goalRoutes,
  sexLabels,
  type HealthGoal,
  type HealthProfile,
} from '../../features/health-profile/health-profile.types.js';

const loading = ref(true);
const source = ref<'remote' | 'local' | 'unavailable'>('unavailable');
const profile = ref<HealthProfile | null>(null);
const bmi = computed(() =>
  profile.value?.heightCm && profile.value.weightKg
    ? calculateBmi(profile.value.heightCm, profile.value.weightKg)
    : null,
);
const completion = computed(() => {
  if (!profile.value) return 0;
  const fields = [
    profile.value.displayName,
    profile.value.sex !== 'unspecified',
    profile.value.heightCm,
    profile.value.weightKg,
    profile.value.primaryGoal,
  ];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
});
const sexLabel = computed(() => (profile.value ? sexLabels[profile.value.sex] : '暂不说明'));
const profileGoals = computed(() =>
  profile.value?.goals?.length
    ? profile.value.goals
    : profile.value?.primaryGoal
      ? [profile.value.primaryGoal]
      : [],
);
const goalLabel = computed(() =>
  profileGoals.value.length
    ? profileGoals.value.map((goal) => goalLabels[goal]).join(' · ')
    : '还没有设置目标',
);
const bodySummary = computed(() => {
  if (profile.value?.heightCm && profile.value.weightKg) {
    return `${profile.value.heightCm} cm · ${profile.value.weightKg} kg`;
  }
  return '补充身高和体重，查看 BMI 参考';
});

function edit(section: 'basic' | 'body' | 'goal') {
  uni.navigateTo({ url: `/pages/profile-edit/ProfileEditPage?section=${section}` });
}
function openGoal(goal: HealthGoal) {
  uni.navigateTo({ url: goalRoutes[goal] });
}

async function load() {
  loading.value = true;
  const result = await loadProfileForDisplay(loadHealthProfile, loadLocalProfile);
  source.value = result.source;
  profile.value = result.profile;
  loading.value = false;
}

onShow(load);
</script>

<style scoped>
.page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 28rpx 32rpx 70rpx;
  background: #f7fbf8;
  color: #244735;
}
.local-note {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 18rpx;
  padding: 13rpx 14rpx;
  border: 1rpx solid #e5ddbb;
  border-radius: 10rpx;
  color: #756b47;
  background: #fffdf5;
  font-size: 20rpx;
}
.local-note button {
  margin: 0;
  padding: 0 0 0 16rpx;
  border: 0;
  color: #6f7c59;
  background: transparent;
  font-size: 20rpx;
}
.profile-summary {
  display: flex;
  align-items: center;
  padding: 12rpx 0 22rpx;
}
.initial-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 86rpx;
  height: 86rpx;
  border: 2rpx solid #d9e7d8;
  border-radius: 50%;
  color: #52745c;
  background: #edf5ea;
  font-size: 34rpx;
  font-weight: 700;
}
.initial-avatar image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}
.identity-copy {
  flex: 1;
  min-width: 0;
  margin-left: 18rpx;
}
.name,
.sub,
.completion text,
.metric text,
.row-copy text,
.privacy-note text {
  display: block;
}
.name {
  color: #244735;
  font-size: 32rpx;
  font-weight: 700;
}
.sub {
  margin-top: 7rpx;
  overflow: hidden;
  color: #778d7b;
  font-size: 21rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.completion {
  min-width: 76rpx;
  text-align: right;
}
.completion text:first-child {
  color: #829789;
  font-size: 18rpx;
}
.completion text:last-child {
  margin-top: 3rpx;
  color: #4c7d5a;
  font-size: 26rpx;
  font-weight: 700;
}
.completion-track {
  height: 8rpx;
  overflow: hidden;
  border-radius: 8rpx;
  background: #e4eee4;
}
.completion-fill {
  height: 100%;
  min-width: 6rpx;
  border-radius: inherit;
  background: #90b889;
}
.metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12rpx;
  margin: 24rpx 0 30rpx;
}
.metric {
  min-width: 0;
  padding: 22rpx 8rpx 20rpx;
  border-radius: var(--hz-radius-tile);
  background: #f4f9f4;
  text-align: center;
}
.metric text:first-child {
  overflow: hidden;
  color: #2f6140;
  font-size: 33rpx;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.metric text:last-child {
  margin-top: 7rpx;
  color: #819586;
  font-size: 18rpx;
}
.section {
  margin-top: 4rpx;
}
.section-title {
  display: block;
  margin: 0 4rpx 12rpx;
  color: #63806d;
  font-size: 22rpx;
  font-weight: 700;
}
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 4rpx 12rpx;
}
.section-head .section-title {
  margin: 0;
}
.section-head button {
  padding: 0;
  border: 0;
  color: #648470;
  background: transparent;
  font-size: 20rpx;
  line-height: 1;
}
.goal-cards {
  border-top: 1rpx solid #e7eee8;
}
.goal-card {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 92rpx;
  padding: 16rpx 4rpx;
  border: 0;
  border-bottom: 1rpx solid #edf2ee;
  background: transparent;
  text-align: left;
}
.goal-card > view {
  flex: 1;
  min-width: 0;
}
.goal-card text {
  display: block;
}
.goal-card text:first-child {
  color: #315641;
  font-size: 24rpx;
  font-weight: 700;
}
.goal-card text:last-child {
  margin-top: 5rpx;
  color: #829387;
  font-size: 19rpx;
  line-height: 1.45;
}
.card {
  overflow: hidden;
  border-radius: var(--hz-radius-card);
  background: #fff;
  box-shadow: var(--hz-shadow-card);
}
.row {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 104rpx;
  padding: 16rpx 24rpx;
  border-bottom: 1rpx solid #eef4ef;
  text-align: left;
  background: transparent;
}
.row--last {
  border-bottom: 0;
}
.row-copy {
  flex: 1;
  min-width: 0;
}
.row-copy text:first-child {
  color: #31543e;
  font-size: 26rpx;
  font-weight: 700;
}
.row-copy text:last-child {
  margin-top: 6rpx;
  overflow: hidden;
  color: #819586;
  font-size: 20rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.arrow {
  width: 30rpx;
  height: 30rpx;
  margin-left: 16rpx;
  opacity: 0.65;
}
.privacy-note {
  margin: 30rpx 4rpx 0;
  padding-top: 16rpx;
  border-top: 1rpx solid #e2ebe3;
}
.privacy-note text {
  color: #8a9b90;
  font-size: 19rpx;
  line-height: 1.55;
}
.state {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  min-height: 420rpx;
}
.state--loading {
  align-items: stretch;
  gap: 16rpx;
  padding: 0 30rpx;
}
.state-line {
  height: 22rpx;
  border-radius: 10rpx;
  background: #eaf2eb;
}
.state-line--wide {
  width: 72%;
  height: 32rpx;
}
.state--empty {
  text-align: center;
}
.state-title {
  color: #486855;
  font-size: 29rpx;
  font-weight: 700;
}
.state-copy {
  display: block;
  margin-top: 12rpx;
  color: #7d9383;
  font-size: 22rpx;
  line-height: 1.55;
}
.retry {
  height: 70rpx;
  margin-top: 28rpx;
  padding: 0 28rpx;
  border: 1rpx solid #d8e6d8;
  border-radius: 12rpx;
  color: #4f765a;
  background: #fff;
  font-size: 23rpx;
  line-height: 70rpx;
}
</style>
