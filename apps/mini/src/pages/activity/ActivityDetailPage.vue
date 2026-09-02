<template>
  <view class="page activity-page">
    <view class="nav">
      <button class="back" aria-label="返回" @tap="goBack">
        <image src="/static/icons/svg/back.svg" mode="aspectFit" />
      </button>
      <view class="nav-copy">
        <text class="title">运动记录</text>
        <text class="date">{{ dateLabel }}</text>
      </view>
      <view class="nav-space" />
    </view>

    <view class="hero">
      <view class="hero-visual">
        <image class="hero-image" src="/static/illustrations/hero.jpg" mode="aspectFill" />
        <view class="hero-overlay-copy">
          <text class="hero-kicker">今天也为自己动一动</text>
          <view class="hero-total">
            <text class="hero-total-number">{{ totalMinutes }}</text>
            <text class="hero-total-unit">分钟</text>
          </view>
          <text class="hero-note">{{ recordCount ? `今天已记录 ${recordCount} 次活动` : '从 10 分钟轻松活动开始也很好' }}</text>
        </view>
      </view>
      <view class="hero-summary">
        <view class="summary-copy">
          <text class="summary-title">活动记录</text>
          <text class="summary-note">每一次活动都算数，慢慢积累就很好</text>
        </view>
        <view class="summary-stamp">
          <text class="stamp-number">{{ recordCount }}</text>
          <text class="stamp-label">次记录</text>
        </view>
      </view>
    </view>

    <view class="section form-section">
      <view class="section-head">
        <text class="section-title">记下今天的活动</text>
        <text class="section-subtitle">选好运动，再填上让身体舒服的时长</text>
      </view>

      <text class="field-label">做了什么</text>
      <view class="activity-grid">
        <button
          v-for="item in activityOptions"
          :key="item.value"
          :class="['activity-choice', { selected: activityType === item.value }]"
          @tap="activityType = item.value"
        >
          <view class="choice-mark"><image :src="item.icon" mode="aspectFit" /></view>
          <text>{{ item.label }}</text>
          <image v-if="activityType === item.value" class="choice-check" src="/static/icons/svg/check.svg" mode="aspectFit" />
        </button>
      </view>

      <view class="field-label-row">
        <text class="field-label">活动时长</text>
        <text class="unit">分钟</text>
      </view>
      <view class="duration-wrap">
        <input v-model="duration" class="duration-input" type="number" inputmode="numeric" placeholder="输入时长" />
        <text>分钟</text>
      </view>
      <view class="duration-options">
        <button
          v-for="item in durationOptions"
          :key="item"
          :class="['duration-choice', { selected: duration === String(item) }]"
          @tap="duration = String(item)"
        >
          {{ item }} 分钟
        </button>
      </view>

      <text class="field-label intensity-label">体感强度</text>
      <view class="intensity-options">
        <button
          v-for="item in intensityOptions"
          :key="item.value"
          :class="['intensity-choice', { selected: intensity === item.value }]"
          @tap="intensity = item.value"
        >
          <text>{{ item.label }}</text>
          <text>{{ item.description }}</text>
        </button>
      </view>

      <textarea v-model="note" class="note-input" maxlength="120" placeholder="想记下当时的感受吗？（选填）" />
      <text class="note-count">{{ note.length }}/120</text>
      <button class="save-button" :disabled="saving" @tap="save">
        {{ saving ? '保存中…' : '保存这次活动' }}
      </button>
      <text v-if="error" class="error">{{ error }}</text>
    </view>

    <view class="history-section">
      <view class="history-head">
        <view>
          <text class="section-title">今天的活动</text>
          <text class="history-subtitle">只显示你今天真实记录的内容</text>
        </view>
        <text class="history-count">{{ recordCount }} 次</text>
      </view>
      <view v-if="history.length" class="history-list">
        <view v-for="item in history" :key="item.id" class="history-row">
          <view class="history-icon"><image :src="activityIcon(item.activityType)" mode="aspectFit" /></view>
          <view class="history-copy">
            <text class="history-title">{{ activityLabel(item.activityType) }}</text>
            <text class="history-meta">{{ item.durationMinutes }} 分钟 · {{ formatTime(item.recordedAt) }}<text v-if="item.intensity"> · {{ intensityLabel(item.intensity) }}</text></text>
            <text v-if="item.note" class="history-note">{{ item.note }}</text>
          </view>
        </view>
      </view>
      <view v-else class="empty">
        <text>还没有今天的活动记录</text>
        <text>记录一次轻松活动，序序会帮你把这份坚持留存下来。</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { createHealthRecord, loadTodayRecords } from '../../features/health-records/health-records.service.js';

const now = new Date();
const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const dateLabel = `${now.getMonth() + 1} 月 ${now.getDate()} 日`;

const activityOptions = [
  { value: 'walking', label: '散步', icon: '/static/icons/svg/activity-walk.svg' },
  { value: 'stretching', label: '拉伸', icon: '/static/icons/svg/activity-stretch.svg' },
  { value: 'yoga', label: '瑜伽', icon: '/static/icons/svg/activity-yoga.svg' },
  { value: 'running', label: '跑步', icon: '/static/icons/svg/activity-run.svg' },
  { value: 'cycling', label: '骑行', icon: '/static/icons/svg/activity-cycle.svg' },
  { value: 'strength', label: '力量训练', icon: '/static/icons/svg/activity-strength.svg' },
] as const;
const durationOptions = [10, 20, 30, 45, 60];
const intensityOptions = [
  { value: 'easy', label: '轻松', description: '可以自在聊天' },
  { value: 'moderate', label: '适中', description: '微微出汗' },
  { value: 'challenging', label: '有挑战', description: '需要专注呼吸' },
] as const;

const activityType = ref<(typeof activityOptions)[number]['value']>('walking');
const duration = ref('');
const intensity = ref<(typeof intensityOptions)[number]['value']>('easy');
const note = ref('');
const history = ref<Array<{ id: string; activityType: string; durationMinutes: number; recordedAt: string; intensity?: string | null; note?: string | null }>>([]);
const saving = ref(false);
const error = ref('');
const recordCount = computed(() => history.value.length);
const totalMinutes = computed(() => history.value.reduce((sum, item) => sum + item.durationMinutes, 0));

async function load() {
  const records = await loadTodayRecords(today);
  history.value = records.activities;
}

async function save() {
  const minutes = Number(duration.value);
  if (!Number.isFinite(minutes) || minutes <= 0 || minutes > 1440) {
    error.value = '请输入 1–1440 分钟之间的有效时长';
    return;
  }
  saving.value = true;
  error.value = '';
  try {
    await createHealthRecord({
      type: 'activity',
      data: {
        activityType: activityType.value,
        durationMinutes: minutes,
        intensity: intensity.value,
        recordedAt: new Date().toISOString(),
        note: note.value.trim() || undefined,
      },
    });
    duration.value = '';
    note.value = '';
    await load();
    uni.showToast({ title: '活动已记录', icon: 'success' });
  } catch {
    error.value = '保存失败，请稍后再试';
  } finally {
    saving.value = false;
  }
}

function activityLabel(value: string) {
  return activityOptions.find((item) => item.value === value)?.label || value;
}
function activityIcon(value: string) {
  return activityOptions.find((item) => item.value === value)?.icon || '/static/icons/svg/activity-walk.svg';
}
function intensityLabel(value: string) {
  return intensityOptions.find((item) => item.value === value)?.label || value;
}
function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}
function goBack() {
  uni.navigateBack();
}
onShow(load);
</script>

<style scoped>
.page{min-height:100vh;box-sizing:border-box;overflow-x:hidden;padding:calc(96rpx + env(safe-area-inset-top)) 24rpx calc(46rpx + env(safe-area-inset-bottom));background:#f8faf4;color:#44564c}
.nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:18rpx}.back,.nav-space{width:58rpx;height:58rpx}.back{display:flex;align-items:center;justify-content:center}.back image{width:30rpx;height:30rpx;opacity:.7}.nav-copy{text-align:center}.title{display:block;color:#3d5647;font-size:32rpx;font-weight:750}.date{display:block;margin-top:4rpx;color:#98a69d;font-size:18rpx}
.hero{width:calc(100% + 48rpx);margin:0 -24rpx;border-bottom:1rpx solid #e7eee3;background:#fffdf7}.hero-visual{position:relative;width:100%;height:430rpx;overflow:hidden;background:#edf4ed}.hero-image{display:block;width:100%;height:100%;object-fit:cover;object-position:center center}.hero-overlay-copy{position:absolute;top:68rpx;left:34rpx;width:42%;color:#3f5b49}.hero-kicker{display:block;color:#6d8e73;font-size:23rpx;font-weight:700;line-height:1.4}.hero-total{display:flex;align-items:baseline;gap:8rpx;margin-top:9rpx;color:#3f7050}.hero-total-number{font-size:76rpx;font-weight:800;line-height:1}.hero-total-unit{font-size:22rpx;font-weight:700}.hero-note{display:block;margin-top:10rpx;color:#78907f;font-size:18rpx;line-height:1.45}.hero-summary{display:flex;align-items:center;justify-content:space-between;padding:20rpx 26rpx 22rpx;background:#fffdf7}.summary-title{display:block;color:#58725e;font-size:22rpx;font-weight:700}.summary-note{display:block;margin-top:5rpx;color:#98a69b;font-size:17rpx}.summary-stamp{display:flex;align-items:center;justify-content:center;flex-direction:column;width:106rpx;height:106rpx;border:1rpx solid #e1ebd9;border-radius:50%;background:#f7fbf0}.stamp-number{color:#6c9877;font-size:34rpx;font-weight:800;line-height:1}.stamp-label{margin-top:7rpx;color:#91a18f;font-size:17rpx}
.section{margin-top:18rpx;padding:24rpx 22rpx;border:1rpx solid #e5ede3;border-radius:20rpx;background:rgba(255,255,255,.94);box-shadow:0 8rpx 22rpx rgba(68,94,73,.05)}.section-head{margin-bottom:20rpx}.section-title{display:block;color:#425b4b;font-size:26rpx;font-weight:750}.section-subtitle{display:block;margin-top:6rpx;color:#97a79c;font-size:19rpx}.field-label{display:block;margin-bottom:10rpx;color:#607968;font-size:20rpx;font-weight:700}.activity-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10rpx}.activity-choice{position:relative;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:5rpx;height:104rpx;border:1rpx solid #e0eade;border-radius:15rpx;color:#668071;background:#fbfdf9;font-size:19rpx}.activity-choice.selected{border-color:#9fc3a4;background:#f0f8ee;color:#4b7958;box-shadow:0 5rpx 12rpx rgba(105,151,108,.1)}.choice-mark{display:flex;align-items:center;justify-content:center;width:40rpx;height:40rpx;border-radius:13rpx;background:#eef6e9}.choice-mark image{width:29rpx;height:29rpx;opacity:.68}.choice-check{position:absolute;top:9rpx;right:9rpx;width:22rpx;height:22rpx;opacity:.8}.field-label-row{display:flex;align-items:center;justify-content:space-between;margin-top:22rpx}.field-label-row .field-label{margin-bottom:10rpx}.unit{color:#9aa99e;font-size:18rpx}.duration-wrap{display:flex;align-items:center;height:74rpx;padding:0 18rpx;border:1rpx solid #dfe9df;border-radius:15rpx;background:#fbfdf9}.duration-input{flex:1;height:72rpx;padding:0;border:0;background:transparent;color:#3f5748;font-size:30rpx;font-weight:700}.duration-wrap>text{color:#78917f;font-size:20rpx}.duration-options{display:flex;gap:8rpx;margin-top:10rpx}.duration-choice{flex:1;height:48rpx;border:1rpx solid #e5ede4;border-radius:12rpx;color:#789080;background:#fcfefa;font-size:17rpx;line-height:48rpx}.duration-choice.selected{border-color:#b1ceb1;color:#547b5e;background:#eef7ec}.intensity-label{margin-top:22rpx}.intensity-options{display:flex;gap:8rpx}.intensity-choice{display:flex;align-items:flex-start;justify-content:center;flex:1;flex-direction:column;height:68rpx;padding:0 12rpx;border:1rpx solid #e2ebe1;border-radius:14rpx;color:#778b7f;background:#fcfefa;text-align:left}.intensity-choice text:first-child{font-size:19rpx;font-weight:700}.intensity-choice text:last-child{margin-top:4rpx;color:#a0ada3;font-size:15rpx}.intensity-choice.selected{border-color:#b4cdb4;background:#f1f8ee}.intensity-choice.selected text:first-child{color:#567e61}.note-input{width:100%;min-height:110rpx;box-sizing:border-box;margin-top:18rpx;padding:14rpx 16rpx;border:1rpx solid #e1eae1;border-radius:14rpx;color:#4d6253;background:#fbfdf9;font-size:20rpx;line-height:1.5}.note-count{display:block;margin-top:6rpx;color:#a4b0a7;font-size:16rpx;text-align:right}.save-button{display:flex;align-items:center;justify-content:center;width:100%;height:78rpx;margin-top:18rpx;border-radius:18rpx;color:#fffdf8;background:#739d7b;box-shadow:0 8rpx 18rpx rgba(92,137,101,.17);font-size:24rpx;font-weight:700;line-height:1}.save-button[disabled]{opacity:.62}.error{display:block;margin-top:10rpx;color:#b36f61;font-size:19rpx}
.history-section{margin-top:28rpx}.history-head{display:flex;align-items:flex-end;justify-content:space-between;padding:0 2rpx 12rpx;border-bottom:1rpx solid #e2eae0}.history-subtitle{display:block;margin-top:5rpx;color:#9aa99e;font-size:17rpx}.history-count{color:#90a099;font-size:18rpx}.history-list{border-bottom:1rpx solid #e2eae0}.history-row{display:flex;align-items:flex-start;gap:12rpx;padding:17rpx 2rpx;border-bottom:1rpx solid #e8eee6}.history-row:last-child{border-bottom:0}.history-icon{display:flex;align-items:center;justify-content:center;width:46rpx;height:46rpx;flex:none;border-radius:15rpx;background:#eef6e9}.history-icon image{width:30rpx;height:30rpx;opacity:.72}.history-copy{flex:1;min-width:0}.history-title{display:block;color:#516a59;font-size:21rpx;font-weight:700}.history-meta{display:block;margin-top:5rpx;color:#94a399;font-size:17rpx}.history-note{display:block;margin-top:6rpx;color:#718379;font-size:18rpx;line-height:1.4;word-break:break-all}.empty{display:flex;align-items:center;flex-direction:column;padding:22rpx 0;color:#94a299;text-align:center;font-size:19rpx}.empty image{width:190rpx;height:90rpx;margin-bottom:10rpx;opacity:.55}.empty text:last-child{margin-top:6rpx;color:#a4afa8;font-size:17rpx}
button{box-sizing:border-box;line-height:1;white-space:nowrap}
</style>

<style scoped>
/* Keep the photographic hero exactly inside the device viewport on mini-program builds. */
.hero {
  position: relative;
  left: auto;
  width: 100%;
  margin: 0 !important;
  box-sizing: border-box;
  transform: none;
  min-height: 0 !important;
  padding: 0 !important;
  border: 0 !important;
  border-radius: 22rpx !important;
  box-shadow: none !important;
  overflow: hidden !important;
}
.hero-visual {
  height: calc(56.25vw - 27rpx);
  min-height: 360rpx;
  max-height: 490rpx;
}
.hero-overlay-copy {
  left: 8%;
  width: 40%;
}
.choice-mark {
  width: 44rpx;
  height: 44rpx;
}
.choice-mark image {
  width: 34rpx;
  height: 34rpx;
  opacity: 0.9;
}
.empty {
  padding: 28rpx 0;
}
.empty image {
  display: none;
}
.hero-summary {
  box-sizing: border-box;
  padding-right: 38rpx;
}
.summary-stamp {
  flex: none;
}
</style>
