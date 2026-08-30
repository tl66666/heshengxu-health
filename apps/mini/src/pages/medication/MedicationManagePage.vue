<template>
  <view class="page">
    <AppNavBar title="用药管理" route="/pages/medication/MedicationManagePage" />

    <view class="hero-card hz-rise">
      <view>
        <text class="eyebrow">今天也按自己的节奏来</text>
        <text class="hero-title">今日用药 {{ completedCount }}/{{ medications.length }}</text>
        <text class="hero-note">按医嘱记录提醒，不替代医生建议</text>
      </view>
      <view class="progress-ring"><text>{{ progress }}%</text></view>
    </view>

    <view class="progress-track"><view class="progress-fill" :style="{ width: `${progress}%` }" /></view>

    <view class="section-heading">
      <view><text class="section-title">今天的提醒</text><text class="section-caption">完成后轻轻点一下即可打卡</text></view>
      <button class="add-button" @tap="showForm = !showForm">＋ 添加</button>
    </view>

    <view v-if="medications.length" class="med-list hz-rise hz-rise-1">
      <view v-for="item in medications" :key="item.id" class="med-row" :class="{ done: item.checked }">
        <button class="check-button" :class="{ checked: item.checked }" :aria-label="item.checked ? '取消打卡' : '完成打卡'" @tap="toggleChecked(item)">
          <image v-if="item.checked" src="/static/icons/svg/check.svg" mode="aspectFit" />
        </button>
        <view class="med-icon"><image src="/static/icons/watercolor/medication.jpg" mode="aspectFit" /></view>
        <view class="med-copy"><text class="med-name">{{ item.name }}</text><text class="med-meta">{{ item.dose }} · {{ item.frequency }} · {{ item.time }}</text></view>
        <button class="more-button" aria-label="删除用药" @tap="removeMedication(item.id)">⋯</button>
      </view>
    </view>

    <view v-else class="empty-state hz-rise hz-rise-1">
      <image src="/static/illustrations/xuxu-record-reminder.png" mode="aspectFit" />
      <text class="empty-title">还没有用药提醒</text>
      <text class="empty-copy">把医生交代的用药时间记下来，今天会更安心。</text>
      <button class="soft-button" @tap="showForm = true">添加第一条提醒</button>
    </view>

    <view v-if="showForm" class="form-card hz-rise hz-rise-2">
      <view class="form-head"><text class="section-title">添加用药提醒</text><button class="close-button" @tap="showForm = false">×</button></view>
      <input v-model="draft.name" class="field" maxlength="24" placeholder="药品或提醒名称" />
      <view class="field-row"><input v-model="draft.dose" class="field" maxlength="16" placeholder="剂量（如：按医嘱）" /><input v-model="draft.time" class="field time-field" type="time" /></view>
      <view class="option-row"><button v-for="frequency in frequencies" :key="frequency" class="option-chip" :class="{ active: draft.frequency === frequency }" @tap="draft.frequency = frequency">{{ frequency }}</button></view>
      <button class="primary-button" @tap="addMedication">保存提醒</button>
    </view>

    <view class="safety-note"><text class="safety-title">小提示</text><text>请以处方、药品说明书和医生指导为准；漏服、重复服用或不适时，及时联系专业人员。</text></view>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import AppNavBar from '../../components/AppNavBar.vue';

type Medication = { id: string; name: string; dose: string; frequency: string; time: string; checked: boolean; date: string };
const STORAGE_KEY = 'heban_medications';
const medications = ref<Medication[]>([]);
const showForm = ref(false);
const frequencies = ['每日', '每周', '按需'];
const draft = reactive({ name: '', dose: '按医嘱', frequency: '每日', time: '08:00' });
const completedCount = computed(() => medications.value.filter(item => item.checked).length);
const progress = computed(() => medications.value.length ? Math.round((completedCount.value / medications.value.length) * 100) : 0);

function load() {
  const raw = uni.getStorageSync(STORAGE_KEY) as Medication[] | string | null;
  const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
  medications.value = Array.isArray(data) ? data : [];
}
function persist() {
  uni.setStorageSync(STORAGE_KEY, JSON.stringify(medications.value));
}
function toggleChecked(item: Medication) {
  item.checked = !item.checked;
  persist();
  uni.showToast({ title: item.checked ? '已完成今天的提醒' : '已取消打卡', icon: 'none' });
}
function addMedication() {
  if (!draft.name.trim()) {
    uni.showToast({ title: '先写一个提醒名称', icon: 'none' });
    return;
  }
  medications.value.push({ id: `${Date.now()}`, name: draft.name.trim(), dose: draft.dose.trim() || '按医嘱', frequency: draft.frequency, time: draft.time || '08:00', checked: false, date: new Date().toISOString().slice(0, 10) });
  persist();
  draft.name = '';
  draft.dose = '按医嘱';
  draft.frequency = '每日';
  draft.time = '08:00';
  showForm.value = false;
  uni.showToast({ title: '提醒已添加', icon: 'success' });
}
function removeMedication(id: string) {
  uni.showModal({ title: '删除这条提醒？', content: '只会删除本地记录，不影响实际用药。', confirmColor: '#c76b8d', success: ({ confirm }) => { if (!confirm) return; medications.value = medications.value.filter(item => item.id !== id); persist(); } });
}
onShow(load);
</script>

<style scoped>
.page { min-height: 100vh; padding: 0 32rpx 64rpx; background: linear-gradient(180deg, #f4f8ff 0%, #f7fbf8 62%, #f5f9f6 100%); color: #263b35; }
.hero-card { display: flex; align-items: center; justify-content: space-between; margin-top: 24rpx; padding: 30rpx 26rpx; border: 2rpx solid #dce8f4; border-radius: 24rpx; background: rgba(255,255,255,.9); box-shadow: 0 10rpx 24rpx rgba(111, 151, 193, .1); }
.eyebrow { display: block; color: #6e98bd; font-size: 21rpx; }.hero-title { display: block; margin-top: 10rpx; color: #30475b; font-size: 34rpx; font-weight: 700; }.hero-note { display: block; margin-top: 10rpx; color: #82919f; font-size: 21rpx; }
.progress-ring { display: flex; align-items: center; justify-content: center; width: 132rpx; height: 132rpx; flex: none; border-radius: 50%; background: conic-gradient(#79acd2 0 0%, #e4edf5 0 100%); position: relative; }.progress-ring::before { content: ''; position: absolute; inset: 12rpx; border-radius: 50%; background: #f8fbfe; }.progress-ring text { position: relative; color: #4b759b; font-size: 28rpx; font-weight: 700; }
.progress-track { height: 12rpx; margin-top: 18rpx; overflow: hidden; border-radius: 12rpx; background: #e2edf5; }.progress-fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg, #98c7e4, #78a9d0); transition: width .25s ease; }
.section-heading { display: flex; align-items: flex-end; justify-content: space-between; margin: 34rpx 2rpx 14rpx; }.section-title { display: block; color: #2e4940; font-size: 29rpx; font-weight: 700; }.section-caption { display: block; margin-top: 6rpx; color: #87988f; font-size: 20rpx; }.add-button { padding: 10rpx 14rpx; border-radius: 12rpx; color: #4b82a8; background: #eaf3fb; font-size: 21rpx; }
.med-list { border-top: 1rpx solid #e3ecef; }.med-row { display: flex; align-items: center; gap: 14rpx; min-height: 112rpx; border-bottom: 1rpx solid #e3ecef; }.med-row.done { opacity: .62; }.check-button { display: flex; align-items: center; justify-content: center; width: 44rpx; height: 44rpx; flex: none; border: 2rpx solid #9abdd7; border-radius: 50%; background: #fff; }.check-button.checked { border-color: #78a9d0; background: #78a9d0; }.check-button image { width: 28rpx; height: 28rpx; filter: brightness(0) invert(1); }.med-icon { width: 64rpx; height: 64rpx; flex: none; overflow: hidden; border-radius: 18rpx; background: #edf5fb; }.med-icon image { width: 100%; height: 100%; }.med-copy { min-width: 0; flex: 1; }.med-name, .med-meta { display: block; }.med-name { color: #34536b; font-size: 26rpx; font-weight: 700; }.med-meta { margin-top: 6rpx; color: #8295a3; font-size: 20rpx; }.more-button { width: 46rpx; height: 46rpx; color: #8ca0ad; font-size: 30rpx; }
.empty-state { display: flex; align-items: center; flex-direction: column; padding: 62rpx 24rpx; text-align: center; }.empty-state image { width: 190rpx; height: 150rpx; }.empty-title { margin-top: 12rpx; color: #38536a; font-size: 27rpx; font-weight: 700; }.empty-copy { margin-top: 8rpx; color: #8a9aa5; font-size: 21rpx; line-height: 1.5; }.soft-button { margin-top: 20rpx; padding: 14rpx 22rpx; border-radius: 14rpx; color: #4b82a8; background: #eaf3fb; font-size: 22rpx; }
.form-card { margin-top: 22rpx; padding: 22rpx; border: 1rpx solid #dce8f2; border-radius: 20rpx; background: #fff; }.form-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16rpx; }.close-button { width: 48rpx; height: 48rpx; border-radius: 50%; color: #7d94a3; background: #f2f7fa; font-size: 32rpx; line-height: 44rpx; }.field { width: 100%; height: 74rpx; margin-bottom: 12rpx; padding: 0 16rpx; border: 1rpx solid #dfe9ef; border-radius: 13rpx; color: #375269; background: #fbfdfe; font-size: 22rpx; }.field-row { display: flex; gap: 12rpx; }.field-row .field:first-child { flex: 1; }.time-field { width: 190rpx; }.option-row { display: flex; flex-wrap: wrap; gap: 10rpx; margin-top: 4rpx; }.option-chip { padding: 10rpx 15rpx; border: 1rpx solid #dce8ef; border-radius: 999rpx; color: #7c91a0; background: #fbfdff; font-size: 20rpx; }.option-chip.active { border-color: #8bb7d8; color: #477ca4; background: #eaf3fb; }.primary-button { width: 100%; height: 82rpx; margin-top: 20rpx; border-radius: 17rpx; color: #fff; background: linear-gradient(135deg, #91c1e2, #6f9fc8); box-shadow: 0 10rpx 20rpx rgba(102, 150, 192, .2); font-size: 27rpx; line-height: 82rpx; }
.safety-note { margin-top: 28rpx; padding: 18rpx 20rpx; border-left: 5rpx solid #9ac3df; border-radius: 0 14rpx 14rpx 0; background: #eef6fb; }.safety-title { display: block; margin-bottom: 5rpx; color: #4c789d; font-size: 21rpx; font-weight: 700; }.safety-note text:last-child { color: #8095a3; font-size: 19rpx; line-height: 1.5; }
</style>
