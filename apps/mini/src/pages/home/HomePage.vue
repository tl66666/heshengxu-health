<template>
  <view class="page">
    <!-- 顶部 -->
    <view class="header">
      <view class="header-left">
        <text class="date-chip">{{ dateLabel }}</text>
        <text class="greeting">{{ greeting }}，{{ displayName }}</text>
      </view>
      <button class="avatar-wrapper" @tap="toXuxu">
        <image class="avatar" src="/static/illustrations/xuxu-avatar.png" mode="aspectFill" />
        <text class="avatar-hint">和序序聊聊</text>
      </button>
    </view>

    <view v-if="loading" class="loading">正在整理今天的节律…</view>
    
    <template v-else-if="today && experience">
      <!-- 1. 体重管理卡片 - 紧凑SVG半圆 -->
      <view class="weight-card card">
        <view class="card-top">
          <text class="card-title">体重管理方案</text>
          <text class="week-badge">第 1/16 周</text>
        </view>
        
        <view class="weight-visual">
          <svg class="semicircle-svg" viewBox="0 0 160 85" preserveAspectRatio="xMidYMid meet">
            <path class="track" d="M 10,80 A 70,70 0 0,1 150,80" fill="none" stroke="#e8f7ed" stroke-width="8" stroke-linecap="round"/>
            <path class="progress" d="M 10,80 A 70,70 0 0,1 150,80" fill="none" stroke="#7fcc8f" stroke-width="8" stroke-linecap="round" 
                  :stroke-dasharray="`${Math.min(progress, 100) * 2.2} 220`" stroke-dashoffset="0"/>
          </svg>
          <view class="weight-row">
            <view class="weight-col">
              <text class="num">{{ startWeight }}</text>
              <text class="label">初始</text>
            </view>
            <view class="weight-col main">
              <text class="num">{{ currentWeight }}</text>
              <text class="label">当前</text>
            </view>
            <view class="weight-col">
              <text class="num">{{ targetWeight }}</text>
              <text class="label">目标</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 2. 饮食热量卡片 - 真正紧凑 -->
      <view class="calorie-card card" @tap="goToFoodDetail">
        <view class="card-top">
          <text class="card-title">饮食热量</text>
          <view class="mode-tag">16:8饮食</view>
        </view>
        
        <view class="calorie-main">
          <text class="hint-text">还可吃</text>
          <view class="big-number">
            <text class="number">1500</text>
            <text class="unit">千卡</text>
          </view>
        </view>
        
        <view class="calorie-stats">
          <view class="stat">
            <text class="stat-num">0</text>
            <text class="stat-label">饮食</text>
          </view>
          <view class="stat">
            <text class="stat-num">0</text>
            <text class="stat-label">运动×0.9</text>
          </view>
        </view>
        
        <view class="dots">
          <view class="dot active"></view>
          <view class="dot"></view>
          <view class="dot"></view>
        </view>
        
        <view class="meals">
          <button class="meal-item" hover-class="button-hover" @tap.stop="goToFoodRecognition()">
            <text class="meal-name">早餐</text>
          </button>
          <button class="meal-item" hover-class="button-hover" @tap.stop="goToFoodRecognition()">
            <text class="meal-name">午餐</text>
          </button>
          <button class="meal-item" hover-class="button-hover" @tap.stop="goToFoodRecognition()">
            <text class="meal-name">晚餐</text>
          </button>
          <button class="meal-item" hover-class="button-hover" @tap.stop="goToFoodRecognition()">
            <text class="meal-name">加餐</text>
          </button>
          <button class="meal-item" hover-class="button-hover" @tap="goToRecord('activity')">
            <text class="meal-name">运动</text>
          </button>
        </view>
        
        <button class="camera-btn" hover-class="button-hover" @tap="goToXuxuCamera">
          <image class="camera-icon" src="/static/icons/camera.jpg" mode="aspectFit" />
          <view class="camera-label">
            <text class="camera-main">序序相机</text>
            <text class="camera-sub">拍照识别食物</text>
          </view>
        </button>
      </view>

      <!-- 3. 体重记录卡片 -->
      <view class="record-card card" @tap="goToWeightDetail">
        <view class="card-top">
          <view class="title-group">
            <text class="card-title">体重记录</text>
            <text v-if="today.todayRecords?.weight" class="time-text">
              {{ formatTime(today.todayRecords.weight.recordedAt) }} 更新
            </text>
          </view>
          <button class="add-btn" hover-class="button-hover" @tap.stop="goToWeightDetail()">+</button>
        </view>
        <view class="record-content">
          <view class="big-value">
            <text class="value">{{ currentWeight }}</text>
            <text class="value-unit">公斤</text>
          </view>
          <view class="mini-chart">
            <image class="chart-icon" src="/static/icons/svg/scale.svg" mode="aspectFit" />
          </view>
        </view>
      </view>

      <!-- 4. 2x2功能卡片 -->
      <view class="grid-cards">
        <button class="grid-item card" hover-class="button-hover" @tap="showWaterDialog()">
          <view class="grid-top">
            <text class="grid-title">喝水</text>
            <text class="grid-add">+</text>
          </view>
          <view class="grid-data">
            <text class="grid-num">0</text>
            <text class="grid-unit">毫升</text>
          </view>
          <image class="grid-icon-img" src="/static/icons/watercolor/water-drop.png" mode="aspectFit" />
        </button>
        
        <button class="grid-item card" hover-class="button-hover" @tap="goToRecord('sleep')">
          <view class="grid-top">
            <text class="grid-title">睡眠</text>
            <text class="grid-add">+</text>
          </view>
          <view class="grid-data">
            <text class="grid-hint">没有记录</text>
          </view>
          <image class="grid-icon-img" src="/static/icons/watercolor/sleep.png" mode="aspectFit" />
        </button>
        
        <button class="grid-item card" hover-class="button-hover" @tap="goToRecord('activity')">
          <view class="grid-top">
            <text class="grid-title">活动</text>
            <text class="grid-add">+</text>
          </view>
          <view class="grid-data">
            <text class="grid-num">{{ today.todayRecords?.activity?.durationMin || 0 }}</text>
            <text class="grid-unit">分钟</text>
          </view>
          <image class="grid-icon-img" src="/static/icons/watercolor/activity.png" mode="aspectFit" />
        </button>
        
        <button class="grid-item card" hover-class="button-hover" @tap="toXuxu">
          <view class="grid-top">
            <text class="grid-title">心情</text>
          </view>
          <view class="grid-data">
            <text class="grid-hint">记录今天</text>
          </view>
          <image class="grid-icon-img" src="/static/icons/watercolor/mood-smile.png" mode="aspectFit" />
        </button>
      </view>

      <!-- 5. 轻断食卡片 -->
      <view class="fasting-card card">
        <view class="card-top">
          <text class="card-title">轻断食</text>
          <view class="mode-tag blue">16:8模式</view>
        </view>
        <view class="fasting-content">
          <text class="fasting-label">用餐时间剩余</text>
          <text class="fasting-time">01:04:08</text>
        </view>
        <image class="fasting-icon-img" src="/static/icons/watercolor/fasting-clock.png" mode="aspectFit" />
      </view>

      <!-- 6. 经期记录卡片 -->
      <view class="period-card card" @tap="openMenstruation">
        <view class="card-top">
          <text class="card-title">经期</text>
          <button class="add-btn" hover-class="button-hover" @tap.stop="openMenstruation">+</button>
        </view>
        <view class="period-content">
          <text class="period-hint">{{ periodStatusText }}</text>
          <text class="period-days">{{ periodDaysText }}</text>
        </view>
        <image class="period-icon-img" src="/static/icons/watercolor/menstruation.png" mode="aspectFit" />
      </view>

      <!-- 7. 用药打卡卡片 -->
      <view class="medication-card card" @tap="openMedication">
        <view class="card-top">
          <text class="card-title">用药打卡</text>
          <button class="add-btn" hover-class="button-hover" @tap.stop="openMedication">+</button>
        </view>
        <view class="medication-content">
          <text class="medication-hint">{{ medicationStatusText }}</text>
          <view class="medication-list">
            <text class="medication-item">{{ medicationPlanText }}</text>
          </view>
        </view>
        <image class="medication-icon-img" src="/static/icons/watercolor/medication.png" mode="aspectFit" />
      </view>

      <!-- 8. 编辑首页卡片 -->
      <button 
        class="edit-card" 
        hover-class="button-hover"
        @tap="go('/pages/home/edit-cards')"
      >
        <text class="edit-text">+ 编辑首页卡片</text>
      </button>
    </template>

    <view v-else-if="error" class="error-state">
      <text>今天的状态还没有加载出来</text>
      <text>检查服务连接后，再试一次就好</text>
      <button @tap="load">重新加载</button>
    </view>
    
    <MiniTabBar active="home" />
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import MiniTabBar from '../../components/MiniTabBar.vue';
import { healthLoopState } from '../../features/health-loop/health-loop.store.js';
import { deriveDailyExperience } from '../../features/health-loop/daily-experience.js';
import { 
  navigateTo,
  navigateToFoodRecognition,
  navigateToWeightDetail,
  navigateToXuxu,
} from '../../utils/router.js';

const { today, loading, error } = healthLoopState;

const greeting = computed(() => {
  const hour = new Date().getHours();
  return hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好';
});

const dateLabel = computed(() => {
  const now = new Date();
  return `${now.getMonth() + 1} 月 ${now.getDate()} 日 · 今天`;
});

const displayName = computed(() => today.value?.displayName || '朋友');
const menstruationCycle = ref<{ lastPeriodStart?: string; cycleLength?: number } | null>(null);
const medicationStats = ref({ total: 0, done: 0 });
const periodStatusText = computed(() =>
  menstruationCycle.value?.lastPeriodStart ? `上次经期 ${menstruationCycle.value.lastPeriodStart.slice(5).replace('-', '月')}日开始` : '还没有记录经期',
);
const periodDaysText = computed(() => {
  const start = menstruationCycle.value?.lastPeriodStart;
  if (!start) return '点击记录你的周期';
  const next = new Date(`${start}T00:00:00`);
  next.setDate(next.getDate() + (menstruationCycle.value?.cycleLength || 28));
  return `距离下次预计 ${Math.max(0, Math.ceil((next.getTime() - Date.now()) / 86400000))} 天`;
});
const medicationStatusText = computed(() => medicationStats.value.total ? `今日已完成 ${medicationStats.value.done}/${medicationStats.value.total}` : '还没有用药提醒');
const medicationPlanText = computed(() => medicationStats.value.total ? '按医嘱设置提醒时间' : '添加一条提醒，按时照顾自己');

const experience = computed(() => 
  today.value ? deriveDailyExperience(today.value) : null
);

const startWeight = computed(() => 
  today.value?.activePlan?.healthTarget?.startWeightKg?.toFixed(1) || '--'
);

const currentWeight = computed(() => 
  today.value?.todayRecords?.weight?.valueKg?.toFixed(1) || '--'
);

const targetWeight = computed(() => 
  today.value?.activePlan?.healthTarget?.targetWeightKg?.toFixed(1) || '--'
);

const progress = computed(() => {
  if (!today.value?.todayRecords?.weight || !today.value?.activePlan?.healthTarget) {
    return 0;
  }
  const start = today.value.activePlan.healthTarget.startWeightKg;
  const current = today.value.todayRecords.weight.valueKg;
  const target = today.value.activePlan.healthTarget.targetWeightKg;
  
  if (start === target) return 0;
  
  const prog = ((start - current) / (start - target)) * 100;
  return Math.max(0, Math.min(100, prog));
});

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const go = (url: string) => {
  navigateTo(url);
};

const goToWeightDetail = () => {
  navigateToWeightDetail();
};

const goToFoodDetail = () => {
  navigateTo('/pages/food/FoodDetailPage');
};

const goToFoodRecognition = () => {
  navigateToFoodRecognition();
};

const goToRecord = (type: string) => {
  navigateTo(`/pages/records/RecordsPage?type=${type}`);
};

const openMenstruation = () => {
  navigateTo('/pages/menstruation/MenstruationDetailPage');
};

const openMedication = () => {
  navigateTo('/pages/medication/MedicationManagePage');
};

const showWaterDialog = () => {
  uni.navigateTo({
    url: '/pages/water/WaterPage'
  });
};

const toXuxu = () => {
  navigateToXuxu();
};

const goToXuxuCamera = () => {
  uni.navigateTo({
    url: '/pages/food-recognition/FoodRecognitionPage'
  });
};

const getTodayDate = () => {
  return new Date().toISOString().slice(0, 10);
};

const load = () => {
  const today = getTodayDate();
  healthLoopState.loadToday(today);
};

const loadPersonalSignals = () => {
  try {
    const cycleRaw = uni.getStorageSync('heban_menstruation_cycle');
    menstruationCycle.value = cycleRaw ? (typeof cycleRaw === 'string' ? JSON.parse(cycleRaw) : cycleRaw) : null;
    const remindersRaw = uni.getStorageSync('heban_medication_reminders');
    const checkinsRaw = uni.getStorageSync('heban_medication_checkins');
    const medications = remindersRaw ? (typeof remindersRaw === 'string' ? JSON.parse(remindersRaw) : remindersRaw) : [];
    const checkins = checkinsRaw ? (typeof checkinsRaw === 'string' ? JSON.parse(checkinsRaw) : checkinsRaw) : [];
    const today = getTodayDate();
    medicationStats.value = {
      total: Array.isArray(medications) ? medications.length : 0,
      done: Array.isArray(checkins) ? checkins.filter((item: { date?: string }) => item.date === today).length : 0,
    };
  } catch {
    menstruationCycle.value = null;
    medicationStats.value = { total: 0, done: 0 };
  }
};

// 修复：首次进入立即加载
onMounted(() => {
  load();
  loadPersonalSignals();
});

// 每次显示时刷新
onShow(() => {
  if (today.value) {
    load();
  }
  loadPersonalSignals();
});
</script>

<style scoped>
/* 页面 - 治愈系背景 */
.page {
  min-height: 100vh;
  padding: 28rpx 24rpx 160rpx;
  background: linear-gradient(180deg, #f8fdf9 0%, #f5f8f6 100%);
}

/* 顶部 */
.header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.header-left {
  flex: 1;
}

.date-chip {
  display: inline-block;
  padding: 6rpx 14rpx;
  margin-bottom: 8rpx;
  border-radius: 999rpx;
  background: rgba(127, 204, 143, 0.12);
  color: #5a9572;
  font-size: 20rpx;
  font-weight: 600;
}

.greeting {
  display: block;
  color: #2d6943;
  font-size: 32rpx;
  font-weight: 800;
}

.avatar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
  padding: 0;
  background: transparent;
  border: 0;
}

.avatar {
  width: 64rpx;
  height: 64rpx;
  border: 3rpx solid #7fcc8f;
  border-radius: 50%;
}

.avatar-hint {
  color: #76907d;
  font-size: 18rpx;
  font-weight: 600;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 40rpx;
  text-align: center;
  min-height: 60vh;
}

.loading text {
  color: #2d6943;
  font-size: 32rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* 通用卡片样式 */
.card {
  margin-bottom: 16rpx;
  padding: 20rpx 24rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 2rpx 12rpx rgba(127, 204, 143, 0.08);
}

.card-top {
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

/* 1. 体重卡片 */
.weight-card {
  padding: 20rpx 24rpx 16rpx;
}

.week-badge {
  color: #76907d;
  font-size: 20rpx;
  font-weight: 600;
}

.weight-visual {
  position: relative;
}

.semicircle-svg {
  width: 160rpx;
  height: 85rpx;
  margin: 0 auto;
  display: block;
}

.weight-row {
  display: flex;
  justify-content: space-around;
  margin-top: 12rpx;
}

.weight-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}

.weight-col .num {
  color: #5a9572;
  font-size: 30rpx;
  font-weight: 900;
  line-height: 1;
}

.weight-col.main .num {
  color: #2d6943;
  font-size: 36rpx;
}

.weight-col .label {
  color: #9ba8a0;
  font-size: 18rpx;
}

/* 2. 饮食热量卡片 - 紧凑 */
.calorie-card {
  padding: 20rpx 24rpx;
}

.mode-tag {
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  background: rgba(127, 204, 143, 0.12);
  color: #5a9572;
  font-size: 18rpx;
  font-weight: 700;
}

.mode-tag.blue {
  background: rgba(100, 149, 237, 0.12);
  color: #5a8fd6;
}

.calorie-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 0;
}

.hint-text {
  color: #76907d;
  font-size: 20rpx;
  margin-bottom: 8rpx;
}

.big-number {
  display: flex;
  align-items: baseline;
  gap: 6rpx;
}

.big-number .number {
  color: #2d6943;
  font-size: 64rpx;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.02em;
}

.big-number .unit {
  color: #5a9572;
  font-size: 24rpx;
  font-weight: 700;
  margin-bottom: 6rpx;
}

.calorie-stats {
  display: flex;
  justify-content: center;
  gap: 24rpx;
  padding: 14rpx 0;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
  padding: 12rpx 24rpx;
  border-radius: 12rpx;
  background: rgba(232, 247, 237, 0.4);
}

.stat-num {
  color: #2d6943;
  font-size: 28rpx;
  font-weight: 900;
}

.stat-label {
  color: #9ba8a0;
  font-size: 18rpx;
}

.dots {
  display: flex;
  justify-content: center;
  gap: 8rpx;
  margin: 14rpx 0;
}

.dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: #d4e8db;
}

.dot.active {
  background: #7fcc8f;
  width: 14rpx;
}

.meals {
  display: flex;
  justify-content: space-around;
  padding: 14rpx 0;
}

.meal-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 0;
  background: transparent;
  border: 0;
}

.meal-icon {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(232, 247, 237, 0.4);
  font-size: 28rpx;
}

.meal-name {
  color: #4a6b56;
  font-size: 20rpx;
  font-weight: 600;
}

.camera-btn {
  display: flex;
  align-items: center;
  gap: 24rpx;
  width: 100%;
  padding: 32rpx 48rpx;
  margin-top: 28rpx;
  border-radius: 56rpx;
  background: #ffffff;
  box-shadow: 0 12rpx 40rpx rgba(46, 125, 79, 0.08);
  border: none;
  transition: transform 0.12s ease;
}

.camera-btn:active {
  transform: scale(0.97);
}

.camera-icon {
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  flex-shrink: 0;
  mix-blend-mode: multiply;
}

.camera-label {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8rpx;
}

.camera-main {
  font-size: 52rpx;
  font-weight: 800;
  color: #23382b;
  line-height: 1;
}

.camera-sub {
  font-size: 40rpx;
  font-weight: 600;
  color: #68796d;
  line-height: 1;
}

.camera-text {
  color: #5a9572;
  font-size: 24rpx;
  font-weight: 700;
}

/* 3. 体重记录卡片 */
.title-group {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.time-text {
  color: #9ba8a0;
  font-size: 18rpx;
}

.add-btn {
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(232, 247, 237, 0.6);
  color: #7fcc8f;
  font-size: 28rpx;
  font-weight: 300;
  padding: 0;
  border: 0;
}

.record-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.big-value {
  display: flex;
  align-items: baseline;
  gap: 6rpx;
}

.value {
  color: #2d6943;
  font-size: 52rpx;
  font-weight: 900;
  line-height: 1;
}

.value-unit {
  color: #76907d;
  font-size: 22rpx;
  font-weight: 600;
}

.mini-chart {
  width: 140rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  background: rgba(232, 247, 237, 0.3);
}

.chart-icon {
  width: 40rpx;
  height: 40rpx;
  opacity: 0.4;
}

/* 4. 2x2网格卡片 */
.grid-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.grid-item {
  position: relative;
  padding: 18rpx 20rpx;
  min-height: 130rpx;
  text-align: left;
  border: 0;
  overflow: hidden;
}

.grid-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.grid-title {
  color: #2d6943;
  font-size: 22rpx;
  font-weight: 700;
}

.grid-add {
  width: 34rpx;
  height: 34rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(232, 247, 237, 0.6);
  color: #7fcc8f;
  font-size: 24rpx;
  font-weight: 300;
}

.grid-data {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
  margin-bottom: 8rpx;
}

.grid-num {
  color: #2d6943;
  font-size: 40rpx;
  font-weight: 900;
  line-height: 1;
}

.grid-unit {
  color: #76907d;
  font-size: 18rpx;
}

.grid-hint {
  color: #9ba8a0;
  font-size: 18rpx;
}

.grid-icon {
  position: absolute;
  bottom: 12rpx;
  right: 12rpx;
  font-size: 44rpx;
  opacity: 0.2;
}

.grid-icon-img {
  position: absolute;
  bottom: 8rpx;
  right: 8rpx;
  width: 80rpx;
  height: 80rpx;
  opacity: 0.6;
  border-radius: 12rpx;
}

/* 5. 轻断食卡片 */
.fasting-card {
  position: relative;
  overflow: hidden;
}

.fasting-content {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.fasting-label {
  color: #9ba8a0;
  font-size: 20rpx;
}

.fasting-time {
  color: #2d6943;
  font-size: 44rpx;
  font-weight: 900;
  font-family: 'Courier New', monospace;
  letter-spacing: 2rpx;
}

.fasting-icon {
  position: absolute;
  bottom: 12rpx;
  right: 12rpx;
  font-size: 64rpx;
  opacity: 0.5;
}

.fasting-icon-img {
  position: absolute;
  bottom: 8rpx;
  right: 8rpx;
  width: 80rpx;
  height: 80rpx;
  opacity: 0.6;
  border-radius: 12rpx;
}

/* 6. 经期记录卡片 */
.period-card {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #fff5f8 0%, #ffffff 100%);
}

.period-content {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.period-hint {
  color: #9ba8a0;
  font-size: 20rpx;
}

.period-days {
  color: #e06c9f;
  font-size: 28rpx;
  font-weight: 700;
}

.period-icon-img {
  position: absolute;
  bottom: 8rpx;
  right: 8rpx;
  width: 80rpx;
  height: 80rpx;
  opacity: 0.6;
  border-radius: 12rpx;
}

/* 7. 用药打卡卡片 */
.medication-card {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f0f8ff 0%, #ffffff 100%);
}

.medication-content {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.medication-hint {
  color: #9ba8a0;
  font-size: 20rpx;
}

.medication-list {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.medication-item {
  color: #6495ed;
  font-size: 24rpx;
  font-weight: 600;
}

.medication-icon-img {
  position: absolute;
  bottom: 8rpx;
  right: 8rpx;
  width: 80rpx;
  height: 80rpx;
  opacity: 0.6;
  border-radius: 12rpx;
}

/* 8. 编辑卡片 */
.edit-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  width: 100%;
  padding: 32rpx;
  margin-bottom: 16rpx;
  border: 3rpx dashed #c8e6d0;
  border-radius: 24rpx;
  background: transparent;
  z-index: 10;
}

.edit-card:active {
  border-color: #7fcc8f;
  background: rgba(232, 247, 237, 0.2);
}

.edit-icon {
  font-size: 36rpx;
  color: #7fcc8f;
}

.edit-text {
  color: #5a9572;
  font-size: 24rpx;
  font-weight: 700;
}

/* 错误状态 */
.error-state {
  padding: 80rpx 24rpx;
  text-align: center;
}

.error-state text {
  display: block;
  color: #9ba8a0;
  font-size: 24rpx;
  margin-bottom: 12rpx;
}

.error-state button {
  margin-top: 20rpx;
  padding: 14rpx 28rpx;
  border-radius: 999rpx;
  background: rgba(127, 204, 143, 0.12);
  color: #5a9572;
  font-size: 24rpx;
  font-weight: 700;
}
</style>
<style scoped>
.page { background: #fff7f1; }
.date-chip { border-radius: 12rpx; background: #fff0f3; color: #b66d80; }
.greeting { color: #5a4c52; }
.card { border: 1rpx solid rgba(255, 255, 255, .9); border-radius: 18rpx; background: rgba(255, 253, 251, .82); box-shadow: 0 12rpx 28rpx rgba(139, 102, 89, .07), inset 0 1rpx 0 rgba(255, 255, 255, .95); backdrop-filter: blur(18px); }
.card-title, .grid-title { color: #66545a; }
.weight-card, .calorie-card, .record-card, .fasting-card { background: #fffdfb; }
.mode-tag { background: #fff0f3; color: #b66d80; }
.mode-tag.blue { background: #f0effb; color: #7c76b2; }
.period-card { border-color: #efcbd4; background: #fff0f3; }
.period-hint, .medication-hint { color: #9f858b; }
.period-days { color: #c26f84; }
.medication-card { border-color: #d9e5ed; background: #f1f6fb; }
.medication-item { color: #6a88a5; }
.period-icon-img, .medication-icon-img { width: 96rpx; height: 96rpx; opacity: .9; border-radius: 0; mix-blend-mode: normal; }
.edit-card { border-color: #e9cfd1; }.edit-icon, .edit-text { color: #b66d80; }
.error-state button { background: #fff0f3; color: #b66d80; }
</style>
