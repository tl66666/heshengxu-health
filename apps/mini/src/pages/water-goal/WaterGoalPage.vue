<template>
  <view class="page water-goal-page">
    <AppNavBar title="喝水量推荐" route="/pages/water-goal/WaterGoalPage" />

    <view class="intro">
      <text class="eyebrow">个性化推荐</text>
      <text class="title">你每天需要喝多少水</text>
      <text class="subtitle">根据性别、体重和活动量科学计算</text>
    </view>

    <!-- 表单 -->
    <view class="form-section">
      <view class="form-item" @tap="selectGender">
        <text class="form-label">性别</text>
        <text class="form-value">{{ genderLabel }}</text>
        <image class="form-arrow" src="/static/icons/svg/back.svg" mode="aspectFit" />
      </view>

      <view class="form-item" @tap="selectWeight">
        <text class="form-label">体重</text>
        <text class="form-value">{{ weight }}公斤</text>
        <image class="form-arrow" src="/static/icons/svg/back.svg" mode="aspectFit" />
      </view>

      <view class="form-item" @tap="selectActivity">
        <text class="form-label">活动量</text>
        <text class="form-value">{{ activityLabel }}</text>
        <image class="form-arrow" src="/static/icons/svg/back.svg" mode="aspectFit" />
      </view>
      <view class="form-item custom-goal-item" @tap="selectCustomGoal">
        <view class="custom-goal-copy"><text class="form-label">每日目标</text><text class="form-hint">可按自己的节奏微调</text></view>
        <text class="form-value">{{ customGoal ? `${customGoal}ml` : '使用推荐值' }}</text>
        <image class="form-arrow" src="/static/icons/svg/back.svg" mode="aspectFit" />
      </view>
    </view>

    <!-- 推荐结果 -->
    <view class="result-card card">
      <view class="result-header">
        <image class="result-icon-image" src="/static/icons/watercolor/water-drop.png" mode="aspectFit" />
        <text class="result-title">推荐饮水量</text>
      </view>
      <text class="result-value">{{ selectedDailyGoal }}</text>
      <text class="result-unit">ml/天</text>
      <text class="result-hint">约 {{ cupsCount }} 杯水（每杯200ml）</text>
    </view>

    <!-- 说明 */
    <view class="tips-card card">
      <view class="tips-header">
        <text class="tips-icon">💡</text>
        <text class="tips-title">计算说明</text>
      </view>
      <view class="tips-list">
        <text class="tip-item">• 基础需水量 = 体重(kg) × 30ml</text>
        <text class="tip-item">• 轻度活动额外增加 300ml</text>
        <text class="tip-item">• 中度活动额外增加 500ml</text>
        <text class="tip-item">• 重度活动额外增加 800ml</text>
        <text class="tip-item">• 建议分多次饮用，避免一次大量饮水</text>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-actions">
      <button class="action-btn" @tap="saveGoal">
        <text class="action-label">保存并应用目标</text>
        <text>获取推荐喝水量</text>
      </button>
    </view>

    <!-- 性别选择器 -->
    <picker 
      v-if="false"
      mode="selector" 
      :range="genderOptions"
      :range-key="'label'"
      :value="genderIndex"
      @change="onGenderChange"
    >
    </picker>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AppNavBar from '../../components/AppNavBar.vue';
import { navigateBack } from '../../utils/router.js';
import { userStorageKey } from '../../features/auth/user-storage.js';

const gender = ref<'male' | 'female'>('male');
const weight = ref(75);
const activity = ref<'none' | 'light' | 'moderate' | 'heavy'>('none');
const customGoal = ref<number | null>(null);

const genderOptions = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
];

const activityOptions = [
  { value: 'none', label: '无运动习惯', extra: 0 },
  { value: 'light', label: '轻度活动（每周1-2次）', extra: 300 },
  { value: 'moderate', label: '中度活动（每周3-4次）', extra: 500 },
  { value: 'heavy', label: '重度活动（每周5+次）', extra: 800 },
];

const genderIndex = computed(() => {
  return genderOptions.findIndex(o => o.value === gender.value);
});

const genderLabel = computed(() => {
  return genderOptions[genderIndex.value]?.label || '男';
});

const activityLabel = computed(() => {
  return activityOptions.find(o => o.value === activity.value)?.label || '无运动习惯';
});

// 计算推荐量
const recommendedAmount = computed(() => {
  // 基础需水量：体重(kg) × 30ml
  const base = weight.value * 30;
  
  // 活动量额外需水量
  const activityExtra = activityOptions.find(o => o.value === activity.value)?.extra || 0;
  
  // 总量（四舍五入到最近的100）
  const total = base + activityExtra;
  return Math.round(total / 100) * 100;
});

const selectedDailyGoal = computed(() => customGoal.value || recommendedAmount.value);
const cupsCount = computed(() => Math.ceil(selectedDailyGoal.value / 200));

function selectGender() {
  uni.showActionSheet({
    itemList: genderOptions.map(o => o.label),
    success: (res) => {
      const option = genderOptions[res.tapIndex];
      if (option) gender.value = option.value as 'male' | 'female';
    },
  });
}

function selectWeight() {
  uni.showModal({
    title: '输入体重',
    editable: true,
    placeholderText: '请输入体重（公斤）',
    success: (res) => {
      if (res.confirm && res.content) {
        const w = parseFloat(res.content);
        if (!isNaN(w) && w > 0 && w < 300) {
          weight.value = w;
        }
      }
    },
  });
}

function selectActivity() {
  uni.showActionSheet({
    itemList: activityOptions.map(o => o.label),
    success: (res) => {
      const option = activityOptions[res.tapIndex];
      if (option) activity.value = option.value as 'none' | 'light' | 'moderate' | 'heavy';
    },
  });
}

function selectCustomGoal() {
  uni.showModal({
    title: '调整每日目标',
    editable: true,
    content: String(customGoal.value || recommendedAmount.value),
    placeholderText: '输入 500-6000ml',
    success: (res) => {
      if (!res.confirm || !res.content) return;
      const amount = Math.round(Number(res.content) / 50) * 50;
      if (Number.isFinite(amount) && amount >= 500 && amount <= 6000) customGoal.value = amount;
      else uni.showToast({ title: '请输入 500-6000ml', icon: 'none' });
    },
  });
}

function onGenderChange(e: any) {
  const option = genderOptions[e.detail.value];
  if (option) gender.value = option.value as 'male' | 'female';
}

function saveGoal() {
  try {
    // 保存目标
    uni.setStorageSync(userStorageKey('water_daily_goal'), selectedDailyGoal.value.toString());
    if (customGoal.value) uni.setStorageSync(userStorageKey('water_daily_goal_custom'), String(customGoal.value));
    else uni.removeStorageSync(userStorageKey('water_daily_goal_custom'));
    
    // 保存用户信息
    uni.setStorageSync(userStorageKey('water_user_info'), JSON.stringify({
      gender: gender.value,
      weight: weight.value,
      activity: activity.value,
    }));
    
    uni.showToast({
      title: '设置成功',
      icon: 'success',
    });
    
    setTimeout(() => {
      navigateBack();
    }, 650);
  } catch (e) {
    console.error('保存失败:', e);
    uni.showToast({
      title: '保存失败',
      icon: 'error',
    });
  }
}

onLoad(() => {
  // 加载用户信息
  try {
    const userInfo = uni.getStorageSync(userStorageKey('water_user_info'));
    if (userInfo) {
      const data = typeof userInfo === 'string' ? JSON.parse(userInfo) : userInfo;
      gender.value = data.gender || 'male';
      weight.value = data.weight || 75;
      activity.value = data.activity || 'none';
    }
    const savedCustomGoal = Number(uni.getStorageSync(userStorageKey('water_daily_goal_custom')));
    customGoal.value = Number.isFinite(savedCustomGoal) && savedCustomGoal > 0 ? savedCustomGoal : null;
  } catch (e) {
    console.error('加载用户信息失败:', e);
  }
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding-bottom: 140rpx;
  background: linear-gradient(180deg, #f8fdf9 0%, #f5f8f6 100%);
}

.intro {
  padding: 20rpx 32rpx 32rpx;
}

.eyebrow {
  display: block;
  color: #72927b;
  font-size: 21rpx;
  font-weight: 700;
  margin-bottom: 6rpx;
}

.title {
  display: block;
  color: #244735;
  font-size: 39rpx;
  font-weight: 700;
  margin-top: 6rpx;
}

.subtitle {
  display: block;
  color: #829587;
  font-size: 21rpx;
  margin-top: 8rpx;
  line-height: 1.5;
}

.form-section {
  margin: 0 32rpx 24rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 2rpx 12rpx rgba(127, 204, 143, 0.08);
  overflow: hidden;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #e8f3ea;
}

.form-item:last-child {
  border-bottom: none;
}

.form-label {
  color: #5c7a67;
  font-size: 26rpx;
  font-weight: 600;
}

.form-value {
  flex: 1;
  text-align: right;
  color: #244735;
  font-size: 26rpx;
  font-weight: 600;
  margin-right: 12rpx;
}

.form-arrow {
  width: 24rpx;
  height: 24rpx;
  transform: rotate(180deg);
  opacity: 0.5;
}

.card {
  margin: 0 32rpx 16rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 2rpx 12rpx rgba(127, 204, 143, 0.08);
}

.result-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 24rpx;
  background: linear-gradient(135deg, #e8f3ea 0%, #d4e5d4 100%);
}

.result-header {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 24rpx;
}

.result-icon {
  font-size: 32rpx;
}

.result-title {
  color: #2d6943;
  font-size: 24rpx;
  font-weight: 700;
}

.result-value {
  color: #244735;
  font-size: 88rpx;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 8rpx;
}

.result-unit {
  color: #5c7a67;
  font-size: 28rpx;
  font-weight: 600;
  margin-bottom: 16rpx;
}

.result-hint {
  color: #76907d;
  font-size: 22rpx;
}

.tips-card {
}

.tips-header {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 16rpx;
}

.tips-icon {
  font-size: 28rpx;
}

.tips-title {
  color: #2d6943;
  font-size: 24rpx;
  font-weight: 700;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.tip-item {
  color: #5c7a67;
  font-size: 22rpx;
  line-height: 1.6;
}

.bottom-actions {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16rpx 32rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10rpx);
  border-top: 1rpx solid #e8f3ea;
  box-shadow: 0 -4rpx 12rpx rgba(127, 204, 143, 0.05);
}

.action-btn {
  width: 100%;
  padding: 24rpx;
  border: none;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #94c5e8 0%, #7ab2d8 100%);
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 700;
  box-shadow: 0 4rpx 16rpx rgba(148, 197, 232, 0.3);
}

.action-btn::after {
  border: none;
}
</style>

<style scoped>
/* Open settings flow: the recommendation remains the only framed result. */
.water-goal-page {
  min-height: 100vh;
  padding-bottom: 152rpx;
  background: #fffaf5 !important;
  color: #5f5659;
  overflow-x: hidden;
}
.water-goal-page .intro { padding: 28rpx 28rpx 30rpx; }
.water-goal-page .eyebrow { color: #8ba59a; font-size: 20rpx; letter-spacing: 1rpx; }
.water-goal-page .title { color: #5b5358; font-size: 39rpx; font-weight: 650; }
.water-goal-page .subtitle { color: #a19796; }
.water-goal-page .form-section {
  margin: 0 28rpx;
  border-top: 1rpx solid #e9dfda;
  border-bottom: 1rpx solid #e9dfda;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  overflow: visible;
}
.water-goal-page .form-item { min-height: 94rpx; padding: 22rpx 0; border-bottom: 1rpx solid #eee5e0 !important; background: transparent !important; }
.water-goal-page .form-item:last-child { border-bottom: 0; }
.water-goal-page .form-item:active { background: rgba(239, 247, 246, .62); }
.water-goal-page .form-label { color: #655d61; font-size: 25rpx; }
.water-goal-page .form-value { color: #78918f; font-size: 24rpx; font-weight: 600; }
.water-goal-page .form-hint { color: #aaa09e; }
.water-goal-page .form-arrow { width: 22rpx; height: 22rpx; opacity: .42; }
.water-goal-page .result-card {
  margin: 30rpx 28rpx 0;
  min-height: 286rpx;
  border: 1rpx solid rgba(255,255,255,.92) !important;
  border-radius: 28rpx !important;
  background: linear-gradient(145deg, rgba(242, 250, 248, .98), rgba(255, 245, 237, .98)) !important;
  box-shadow: 0 16rpx 34rpx rgba(126, 104, 94, .08), inset 0 1rpx 0 rgba(255,255,255,.96) !important;
}
.water-goal-page .result-title { color: #625a61; }
.water-goal-page .result-value { color: #668d96; font-size: 92rpx; }
.water-goal-page .result-unit,
.water-goal-page .result-hint { color: #9d9290; }
.water-goal-page .tips-card {
  margin: 28rpx 28rpx 0;
  padding: 26rpx 0 0;
  border: 0 !important;
  border-top: 1rpx solid #e9dfda;
  border-radius: 0;
  background: transparent !important;
  box-shadow: none !important;
}
.water-goal-page .tips-title { color: #625a61; }
.water-goal-page .tips-list { gap: 10rpx; }
.water-goal-page .tip-item { color: #9b918f; font-size: 21rpx; }
.water-goal-page .bottom-actions {
  padding: 14rpx 28rpx;
  padding-bottom: calc(14rpx + env(safe-area-inset-bottom));
  background: rgba(255, 253, 250, .92);
  border-top: 1rpx solid rgba(235, 221, 214, .82);
  box-shadow: 0 -8rpx 22rpx rgba(126,104,94,.06);
}
.water-goal-page .action-btn {
  min-height: 86rpx;
  border-radius: 22rpx;
  background: #78b8c7;
  box-shadow: 0 12rpx 26rpx rgba(94,157,176,.2), inset 0 2rpx 0 rgba(255,255,255,.38);
  color: #fffdfb;
  font-size: 29rpx;
  line-height: 86rpx;
}
@media (min-width: 700px) {
  .water-goal-page .intro,
  .water-goal-page .form-section,
  .water-goal-page .result-card,
  .water-goal-page .tips-card { margin-right: 48rpx; margin-left: 48rpx; }
  .water-goal-page .intro { padding-right: 48rpx; padding-left: 48rpx; }
  .water-goal-page .bottom-actions { padding-right: 48rpx; padding-left: 48rpx; }
}
</style>
<style scoped>
.page {
  background:
    radial-gradient(circle at 84% 16%, rgba(226, 241, 235, .72), transparent 34%),
    linear-gradient(180deg, #fffaf6 0%, #f6f5f2 100%);
  color: #5e565b;
}
.intro { padding: 24rpx 30rpx 28rpx; }
.eyebrow { color: #8aa59b; letter-spacing: 1rpx; }
.title { color: #5a5259; font-size: 38rpx; letter-spacing: 0; }
.subtitle { color: #a19796; }
.form-section, .result-card, .tips-card { border: 1rpx solid rgba(255, 255, 255, .92); background: rgba(255, 253, 251, .78); box-shadow: 0 16rpx 34rpx rgba(128, 108, 99, .09), inset 0 1rpx 0 rgba(255,255,255,.96); backdrop-filter: blur(20rpx); }
.form-section { margin-bottom: 22rpx; }
.form-item { min-height: 92rpx; padding: 22rpx 24rpx; border-color: rgba(237, 225, 218, .9); }
.form-label { color: #686168; font-size: 25rpx; }
.form-value { color: #718992; font-size: 25rpx; }
.form-hint { color: #aba0a0; }
.form-arrow { opacity: .38; }
.result-card { position: relative; min-height: 286rpx; padding: 38rpx 26rpx 32rpx; background: linear-gradient(145deg, rgba(241, 249, 247, .95), rgba(255, 244, 236, .96)); overflow: hidden; }
.result-card::after { content: ''; position: absolute; right: -58rpx; bottom: -78rpx; width: 220rpx; height: 220rpx; border: 1rpx solid rgba(119, 174, 181, .18); border-radius: 50%; box-shadow: 0 0 0 18rpx rgba(119,174,181,.06), 0 0 0 36rpx rgba(119,174,181,.035); pointer-events: none; }
.result-header { position: relative; z-index: 1; gap: 10rpx; margin-bottom: 20rpx; }
.result-icon { display: none; }
.result-icon-image { width: 42rpx; height: 42rpx; mix-blend-mode: multiply; }
.result-title, .tips-title { color: #625a61; }
.result-value { position: relative; z-index: 1; color: #5f8793; font-size: 92rpx; letter-spacing: 0; text-shadow: 0 4rpx 16rpx rgba(95,135,147,.12); }
.result-unit, .result-hint, .tip-item { color: #9e9291; }
.tips-card { padding: 28rpx 26rpx; }
.tips-header { margin-bottom: 18rpx; }
.tips-icon { opacity: .62; }
.bottom-actions { padding: 14rpx 28rpx; padding-bottom: calc(14rpx + env(safe-area-inset-bottom)); background: rgba(255,253,251,.9); border-top: 1rpx solid rgba(235,221,214,.8); box-shadow: 0 -8rpx 22rpx rgba(126,104,94,.06); }
.action-btn { min-height: 88rpx; border-radius: 24rpx; background: linear-gradient(135deg, #79b8c7 0%, #609eaf 100%); box-shadow: 0 14rpx 28rpx rgba(94,157,176,.22), inset 0 2rpx 0 rgba(255,255,255,.38); color: #fffdfb; font-size: 30rpx; letter-spacing: 0; }
.action-btn > text:not(.action-label) { display: none; }
</style>

<style scoped>
/* Final open-layout override; kept last so legacy page rules cannot re-stack cards. */
.water-goal-page { background: #fffaf5 !important; padding-bottom: 152rpx !important; overflow-x: hidden !important; }
.water-goal-page .intro { padding: 28rpx 28rpx 30rpx !important; }
.water-goal-page .form-section { margin: 0 28rpx !important; border-top: 1rpx solid #e9dfda !important; border-bottom: 1rpx solid #e9dfda !important; border-radius: 0 !important; background: transparent !important; box-shadow: none !important; }
.water-goal-page .form-item { min-height: 94rpx !important; padding: 22rpx 0 !important; border-bottom: 1rpx solid #eee5e0 !important; border-radius: 0 !important; background: transparent !important; box-shadow: none !important; }
.water-goal-page .form-item:last-child { border-bottom: 0 !important; }
.water-goal-page .result-card { margin: 30rpx 28rpx 0 !important; border: 1rpx solid rgba(255,255,255,.92) !important; border-radius: 28rpx !important; background: linear-gradient(145deg, rgba(242,250,248,.98), rgba(255,245,237,.98)) !important; box-shadow: 0 16rpx 34rpx rgba(126,104,94,.08), inset 0 1rpx 0 rgba(255,255,255,.96) !important; }
.water-goal-page .tips-card { margin: 28rpx 28rpx 0 !important; padding: 26rpx 0 0 !important; border: 0 !important; border-top: 1rpx solid #e9dfda !important; border-radius: 0 !important; background: transparent !important; box-shadow: none !important; }
.water-goal-page .bottom-actions { padding: 14rpx 28rpx !important; padding-bottom: calc(14rpx + env(safe-area-inset-bottom)) !important; background: rgba(255,253,250,.92) !important; border-top: 1rpx solid rgba(235,221,214,.82) !important; box-shadow: 0 -8rpx 22rpx rgba(126,104,94,.06) !important; }
.water-goal-page .action-btn { min-height: 86rpx !important; border-radius: 22rpx !important; background: #78b8c7 !important; box-shadow: 0 12rpx 26rpx rgba(94,157,176,.2), inset 0 2rpx 0 rgba(255,255,255,.38) !important; font-size: 29rpx !important; line-height: 86rpx !important; }
@media (min-width: 700px) {
  .water-goal-page .intro { padding-right: 48rpx !important; padding-left: 48rpx !important; }
  .water-goal-page .form-section, .water-goal-page .result-card, .water-goal-page .tips-card { margin-right: 48rpx !important; margin-left: 48rpx !important; }
  .water-goal-page .bottom-actions { padding-right: 48rpx !important; padding-left: 48rpx !important; }
}
</style>
<style scoped>
.page { background: #fff8f2; color: #554b4f; }
.intro { padding: 26rpx 30rpx 30rpx; }.eyebrow { color: #789c8d; }.title { color: #564d51; }.subtitle { color: #9b8e8d; }
.form-section, .result-card, .tips-card { border: 1rpx solid rgba(255, 255, 255, .9); border-radius: 18rpx; background: rgba(255, 253, 251, .82); box-shadow: 0 12rpx 28rpx rgba(126, 104, 94, .07), inset 0 1rpx 0 rgba(255, 255, 255, .95); backdrop-filter: blur(18px); }
.form-item { border-color: #f1e5df; }.form-label { color: #65595d; }.form-value { color: #9b8e8d; }.custom-goal-copy { display: flex; flex: 1; flex-direction: column; gap: 5rpx; }.form-hint { color: #b1a3a1; font-size: 18rpx; }
.result-title, .tips-title { color: #62575b; }.result-value { color: #649889; }.result-unit, .result-hint, .tip-item { color: #9d8f8e; }
.action-btn { border-radius: 42rpx; background: #78b8c7; box-shadow: 0 12rpx 26rpx rgba(94, 157, 176, .2); }
</style>
<style scoped>
.page { background: radial-gradient(circle at 84% 16%, rgba(226, 241, 235, .72), transparent 34%), linear-gradient(180deg, #fffaf6 0%, #f6f5f2 100%); color: #5e565b; }
.intro { padding: 24rpx 30rpx 28rpx; }.eyebrow { color: #8aa59b; letter-spacing: 1rpx; }.title { color: #5a5259; font-size: 38rpx; letter-spacing: 0; }.subtitle { color: #a19796; }
.form-section, .result-card, .tips-card { border: 1rpx solid rgba(255, 255, 255, .92); background: rgba(255, 253, 251, .78); box-shadow: 0 16rpx 34rpx rgba(128, 108, 99, .09), inset 0 1rpx 0 rgba(255,255,255,.96); backdrop-filter: blur(20rpx); }.form-section { margin-bottom: 22rpx; }.form-item { min-height: 92rpx; padding: 22rpx 24rpx; border-color: rgba(237, 225, 218, .9); transition: background .18s ease, transform .18s ease; }.form-item:active { background: rgba(239, 247, 246, .72); transform: scale(.995); }.form-label { color: #686168; font-size: 25rpx; }.form-value { color: #718992; font-size: 25rpx; }.form-hint { color: #aba0a0; }.form-arrow { opacity: .38; }
.result-card { position: relative; min-height: 286rpx; padding: 38rpx 26rpx 32rpx; background: linear-gradient(145deg, rgba(241, 249, 247, .95), rgba(255, 244, 236, .96)); overflow: hidden; }.result-card::after { content: ''; position: absolute; right: -58rpx; bottom: -78rpx; width: 220rpx; height: 220rpx; border: 1rpx solid rgba(119, 174, 181, .18); border-radius: 50%; box-shadow: 0 0 0 18rpx rgba(119,174,181,.06), 0 0 0 36rpx rgba(119,174,181,.035); pointer-events: none; }.result-header { position: relative; z-index: 1; gap: 10rpx; margin-bottom: 20rpx; }.result-icon { display: none; }.result-icon-image { width: 42rpx; height: 42rpx; mix-blend-mode: multiply; }.result-title, .tips-title { color: #625a61; }.result-value { position: relative; z-index: 1; color: #5f8793; font-size: 92rpx; letter-spacing: 0; text-shadow: 0 4rpx 16rpx rgba(95,135,147,.12); }.result-unit, .result-hint, .tip-item { color: #9e9291; }
.tips-card { padding: 28rpx 26rpx; }.tips-header { margin-bottom: 18rpx; }.tips-icon { opacity: .62; }.bottom-actions { padding: 14rpx 28rpx; padding-bottom: calc(14rpx + env(safe-area-inset-bottom)); background: rgba(255,253,251,.9); border-top: 1rpx solid rgba(235,221,214,.8); box-shadow: 0 -8rpx 22rpx rgba(126,104,94,.06); }.action-btn { min-height: 88rpx; border-radius: 24rpx; background: linear-gradient(135deg, #79b8c7 0%, #609eaf 100%); box-shadow: 0 14rpx 28rpx rgba(94,157,176,.22), inset 0 2rpx 0 rgba(255,255,255,.38); color: #fffdfb; font-size: 30rpx; letter-spacing: 0; }.action-btn > text:not(.action-label) { display: none; }
</style>
