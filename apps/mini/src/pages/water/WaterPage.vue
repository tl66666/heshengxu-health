<template>
  <view class="page">
    <AppNavBar title="喝水记录" route="/pages/water/WaterPage" />

    <!-- 日期选择 -->
    <view class="date-section">
      <button class="date-btn" aria-label="前一天" @tap="prevDay">
        <image class="date-arrow-icon" src="/static/icons/svg/back.svg" mode="aspectFit" />
      </button>
      <text class="date-text">{{ dateLabel }}</text>
      <button class="date-btn" aria-label="后一天" @tap="nextDay">
        <image class="date-arrow-icon" src="/static/icons/svg/forward.svg" mode="aspectFit" />
      </button>
    </view>

    <!-- 目标信息卡片 -->
    <view class="goal-card card">
      <view class="goal-stats">
        <view class="stat-item">
          <text class="stat-label">每日目标</text>
          <text class="stat-value">{{ dailyGoal }}<text class="stat-unit">ml</text></text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-label">已喝</text>
          <text class="stat-value primary">{{ totalAmount }}<text class="stat-unit">ml</text></text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-label">剩余</text>
          <text class="stat-value">{{ remainingAmount }}<text class="stat-unit">ml</text></text>
        </view>
      </view>
      <view class="goal-progress" aria-label="今日饮水进度">
        <view class="goal-progress-track">
          <view class="goal-progress-fill" :style="{ width: progressPercent + '%' }" />
        </view>
        <text class="goal-progress-text">{{ progressPercent }}%</text>
      </view>
      
      <!-- 个性化推荐信息 -->
      <view v-if="isPersonalized" class="personalized-info">
        <view class="info-badge">
          <text class="badge-icon">✓</text>
          <text class="badge-text">个性化推荐</text>
        </view>
        <text class="info-desc">根据你的体重和活动量计算</text>
        <button class="reset-btn" @tap="goToSetup">重新设置</button>
      </view>
      <button v-else class="setup-btn" @tap="goToSetup">
        <text class="setup-icon">⚙</text>
        <text class="setup-text">设置个性化目标</text>
      </button>
    </view>

    <!-- 水杯展示区 -->
    <view class="cup-display">
      <!-- 进度徽章 -->
      <view class="progress-badge">
        <text>{{ progressPercent }}%</text>
      </view>
      
      <view class="cup-container">
        <!-- 空杯子 -->
        <image 
          class="cup-empty" 
          src="/static/illustrations/water-cup-empty.png" 
          mode="aspectFit"
        />
        
        <!-- 水位 -->
        <view class="water-wrapper" :style="{ height: cupWaterHeight }">
          <view class="water-surface">
            <view class="surface-wave wave-one" />
            <view class="surface-wave wave-two" />
            <view class="surface-glint" />
          </view>
          <image 
            class="water-texture" 
            src="/static/illustrations/water-ripple-texture.png" 
            mode="scaleToFill"
          />
        </view>
        
        <!-- 数字显示 -->
        <view class="amount-display">
          <text class="amount-num">{{ totalAmount }}</text>
          <text class="amount-unit">ml</text>
        </view>
      </view>
    </view>

    <!-- 快捷记录 -->
    <view class="quick-section">
      <view class="section-header">
        <view class="section-heading-copy">
          <image class="header-icon" src="/static/icons/watercolor/water-drop.png" mode="aspectFit" />
          <text class="header-text">快捷记录</text>
        </view>
        <button class="quick-drink-picker" @tap="selectQuickDrink">
          <image v-if="quickDrink.id === 'water'" class="quick-drink-icon" src="/static/icons/watercolor/water-drop.png" mode="aspectFit" />
          <text v-else class="quick-drink-emoji">{{ quickDrink.icon }}</text>
          <text>{{ quickDrink.name }}</text>
          <text class="quick-drink-chevron">⌄</text>
        </button>
      </view>
      
      <view class="quick-buttons">
        <button 
          v-for="amt in quickAmounts" 
          :key="amt"
          class="quick-btn"
          @tap="quickAdd(amt)"
        >
          <image v-if="quickDrink.id === 'water'" class="btn-icon" src="/static/icons/watercolor/water-drop.png" mode="aspectFit" />
          <text v-else class="btn-drink-icon">{{ quickDrink.icon }}</text>
          <text class="btn-text">{{ amt }}ml</text>
        </button>
      </view>
    </view>

    <!-- 记录喝水按钮 -->
    <view class="action-section">
      <button class="record-btn" @tap="openDialog">
        <view class="record-icon-wrap">
          <image v-if="quickDrink.id === 'water'" class="record-icon" src="/static/icons/watercolor/water-drop.png" mode="aspectFit" />
          <text v-else class="record-btn-emoji">{{ quickDrink.icon }}</text>
        </view>
        <text class="record-text">记录{{ quickDrink.name }}</text>
      </button>
    </view>

    <!-- 今日记录 -->
    <view class="history-section">
      <view class="history-header">
        <image class="history-icon" src="/static/icons/watercolor/water-drop.png" mode="aspectFit" />
        <text class="history-title">今日记录</text>
        <text class="history-count">({{ records.length }}次)</text>
        <button v-if="records.length > 0" class="edit-btn" @tap="toggleEdit">
          {{ editMode ? '完成' : '编辑' }}
        </button>
      </view>

      <view v-if="records.length === 0" class="empty-state">
        <text class="empty-icon">🥤</text>
        <text class="empty-text">还没有记录哦，快来喝一杯吧～</text>
      </view>

      <view v-else class="record-list">
        <view 
          v-for="record in records" 
          :key="record.id"
          class="record-item card"
        >
          <view class="record-drink-icon">
            <image v-if="record.drinkType === 'water'" class="record-water-icon" src="/static/icons/watercolor/water-drop.png" mode="aspectFit" />
            <text v-else>{{ getDrinkIcon(record.drinkType) }}</text>
          </view>
          <view class="record-info">
            <text class="record-name">{{ getDrinkName(record.drinkType) }}</text>
            <text class="record-time">{{ formatTime(record.timestamp) }}</text>
          </view>
          <text class="record-amount">{{ record.amount }}<text class="amount-unit-sm">ml</text></text>
          <button v-if="editMode" class="delete-btn" @tap="deleteRecord(record.id)">
            删除
          </button>
        </view>
      </view>
    </view>

    <!-- 添加弹窗 -->
    <view v-if="dialogVisible" class="dialog-mask" @tap="closeDialog">
      <view class="dialog-content" @tap.stop>
        <view class="dialog-header">
          <text class="dialog-title">添加{{ getDrinkName(selectedDrink) }}记录</text>
          <button class="close-btn" @tap="closeDialog">✕</button>
        </view>

        <view class="dialog-body">
          <!-- 数量显示 -->
          <view class="input-display">
            <text class="input-num">{{ inputAmount }}</text>
            <text class="input-unit">ml</text>
          </view>

          <!-- 饮品选择 -->
          <view class="drink-options">
            <button 
              v-for="drink in drinkOptions" 
              :key="drink.id"
              :class="['drink-option', selectedDrink === drink.id ? 'active' : '']"
              @tap="selectedDrink = drink.id"
            >
              <image v-if="drink.id === 'water'" class="drink-image" src="/static/icons/watercolor/water-drop.png" mode="aspectFit" />
              <text v-else class="drink-emoji">{{ drink.icon }}</text>
              <text class="drink-name">{{ drink.name }}</text>
            </button>
          </view>

          <!-- 数字键盘 -->
          <view class="keyboard">
            <button 
              v-for="key in numberKeys" 
              :key="key"
              class="key-btn"
              @tap="handleKey(key)"
            >
              {{ key }}
            </button>
          </view>

          <!-- 确定 -->
          <button class="confirm-btn" @tap="confirmAdd">完成</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import AppNavBar from '../../components/AppNavBar.vue';
import { navigateBack, navigateTo } from '../../utils/router.js';
import { userStorageKey } from '../../features/auth/user-storage.js';

interface WaterRecord {
  id: string;
  amount: number;
  drinkType: string;
  timestamp: number;
}

interface UserInfo {
  gender: 'male' | 'female';
  weight: number;
  activity: 'none' | 'light' | 'moderate' | 'heavy';
}

const currentDate = ref(new Date());
const dailyGoal = ref(2000);
const records = ref<WaterRecord[]>([]);
const editMode = ref(false);
const dialogVisible = ref(false);
const inputAmount = ref('200');
const selectedDrink = ref('water');
const quickDrinkId = ref('water');
const isPersonalized = ref(false);

const quickAmounts = [100, 200, 250, 300, 500];

const drinkOptions = [
  { id: 'water', name: '水', icon: '💧' },
  { id: 'tea', name: '茶水', icon: '🍵' },
  { id: 'milk', name: '牛奶', icon: '🥛' },
  { id: 'coffee', name: '咖啡', icon: '☕' },
  { id: 'juice', name: '果汁', icon: '🧃' },
  { id: 'soda', name: '苏打水', icon: '🥤' },
];

const numberKeys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, '00', '⌫'];
const defaultDrink = { id: 'water', name: '水', icon: '💧' };
const quickDrink = computed(() => drinkOptions.find((drink) => drink.id === quickDrinkId.value) || defaultDrink);

const dateLabel = computed(() => {
  const d = currentDate.value;
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return '今天';
  }
  return `${d.getMonth() + 1}月${d.getDate()}日`;
});

const totalAmount = computed(() => {
  return records.value.reduce((sum, r) => sum + r.amount, 0);
});

const remainingAmount = computed(() => {
  const remain = dailyGoal.value - totalAmount.value;
  return Math.max(remain, 0);
});

const progressPercent = computed(() => {
  const percent = Math.round((totalAmount.value / dailyGoal.value) * 100);
  return Math.min(percent, 100);
});

const waterHeight = computed(() => {
  const percent = (totalAmount.value / dailyGoal.value) * 100;
  return Math.min(percent, 95); // 限制最大95%，留顶部空间
});
// 玻璃内壁净高 570rpx：水位换算成 rpx，保证水始终落在杯子轮廓里
const cupWaterHeight = computed(() => `${(waterHeight.value * 570) / 100}rpx`);

function calculateRecommendedWater(userInfo: UserInfo): number {
  const base = userInfo.weight * 30;
  const activityExtra = {
    'none': 0,
    'light': 300,
    'moderate': 500,
    'heavy': 800
  }[userInfo.activity] || 0;
  
  return Math.round((base + activityExtra) / 100) * 100;
}

function loadUserInfo() {
  try {
    const rawUserInfo = uni.getStorageSync(userStorageKey('water_user_info')) as UserInfo | string | null;
    const userInfo = typeof rawUserInfo === 'string' ? (JSON.parse(rawUserInfo) as UserInfo) : rawUserInfo;
    if (userInfo && userInfo.weight) {
      const recommended = calculateRecommendedWater(userInfo);
      const customGoal = Number(uni.getStorageSync(userStorageKey('water_daily_goal_custom')));
      dailyGoal.value = Number.isFinite(customGoal) && customGoal > 0 ? customGoal : recommended;
      isPersonalized.value = true;
    } else {
      const savedGoal = uni.getStorageSync(userStorageKey('water_daily_goal'));
      dailyGoal.value = savedGoal || 2000;
      isPersonalized.value = false;
    }
  } catch (e) {
    dailyGoal.value = 2000;
    isPersonalized.value = false;
  }
}

function getDrinkName(type: string): string {
  const drink = drinkOptions.find(d => d.id === type);
  return drink?.name || '水';
}

function getDrinkIcon(type: string): string {
  return drinkOptions.find((drink) => drink.id === type)?.icon || '💧';
}

function prevDay() {
  const d = new Date(currentDate.value);
  d.setDate(d.getDate() - 1);
  currentDate.value = d;
  loadRecords();
}

function nextDay() {
  const d = new Date(currentDate.value);
  d.setDate(d.getDate() + 1);
  currentDate.value = d;
  loadRecords();
}

function goToSetup() {
  navigateTo('/pages/water-goal/WaterGoalPage', {
    fail: () => {
      uni.redirectTo({ url: '/pages/water-goal/WaterGoalPage' });
    },
  });
}

function quickAdd(amount: number) {
  addRecord(amount, quickDrink.value.id);
}

function selectQuickDrink() {
  uni.showActionSheet({
    itemList: drinkOptions.map((drink) => `${drink.icon} ${drink.name}`),
    success: ({ tapIndex }) => {
      const drink = drinkOptions[tapIndex];
      if (drink) quickDrinkId.value = drink.id;
    },
  });
}

function openDialog() {
  inputAmount.value = '200';
  selectedDrink.value = quickDrinkId.value;
  dialogVisible.value = true;
}

function closeDialog() {
  dialogVisible.value = false;
}

function handleKey(key: number | string) {
  if (key === '⌫') {
    inputAmount.value = inputAmount.value.slice(0, -1) || '0';
  } else {
    if (inputAmount.value === '0') {
      inputAmount.value = String(key);
    } else {
      inputAmount.value += String(key);
    }
  }
}

function confirmAdd() {
  const amt = parseInt(inputAmount.value);
  if (amt > 0) {
    addRecord(amt, selectedDrink.value);
    closeDialog();
  }
}

function addRecord(amount: number, drinkType: string) {
  const record: WaterRecord = {
    id: Date.now().toString(),
    amount,
    drinkType,
    timestamp: Date.now(),
  };
  
  records.value.unshift(record);
  saveRecords();
  
  uni.showToast({
    title: `已记录 ${amount}ml`,
    icon: 'success',
    duration: 1000,
  });
}

function toggleEdit() {
  editMode.value = !editMode.value;
}

function deleteRecord(id: string) {
  records.value = records.value.filter(r => r.id !== id);
  saveRecords();
  uni.showToast({
    title: '已删除',
    icon: 'success',
  });
}

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

function getStorageKey(): string {
  const d = currentDate.value;
  return userStorageKey(`water_${d.getFullYear()}_${d.getMonth() + 1}_${d.getDate()}`);
}

function saveRecords() {
  uni.setStorageSync(getStorageKey(), records.value);
}

function loadRecords() {
  try {
    const data = uni.getStorageSync(getStorageKey());
    records.value = data || [];
  } catch (e) {
    records.value = [];
  }
}

onMounted(() => {
  loadUserInfo();
  loadRecords();
});

onShow(() => {
  loadUserInfo();
  loadRecords();
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fdf9 0%, #f5f8f6 100%);
  padding-bottom: 160rpx;
}

/* 通用卡片 */
.card {
  background: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(127, 204, 143, 0.08);
}

/* 日期选择 */
.date-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
  padding: 20rpx 24rpx;
  background: #ffffff;
}

.date-btn {
  width: 44rpx;
  height: 44rpx;
  padding: 0;
  border: none;
  background: rgba(127, 204, 143, 0.12);
  border-radius: 50%;
  font-size: 28rpx;
  color: #5a9572;
  line-height: 1;
}

.date-btn::after { border: none; }

.date-text {
  font-size: 26rpx;
  font-weight: 800;
  color: #2d6943;
  min-width: 120rpx;
  text-align: center;
}

/* 目标卡片 */
.goal-card {
  margin: 16rpx 24rpx;
  padding: 20rpx 24rpx;
}

.goal-stats {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
}

.stat-label {
  font-size: 22rpx;
  color: #9aaca0;
  font-weight: 600;
}

.stat-value {
  font-size: 32rpx;
  font-weight: 900;
  color: #5a9572;
  line-height: 1;
}

.stat-value.primary {
  color: #2d6943;
}

.stat-unit {
  font-size: 20rpx;
  font-weight: 600;
  margin-left: 2rpx;
}

.stat-divider {
  width: 2rpx;
  height: 32rpx;
  background: rgba(127, 204, 143, 0.2);
}

/* 个性化信息 */
.personalized-info {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 12rpx 16rpx;
  background: rgba(127, 204, 143, 0.08);
  border-radius: 12rpx;
}

.info-badge {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 4rpx 12rpx;
  background: rgba(127, 204, 143, 0.2);
  border-radius: 999rpx;
}

.badge-icon {
  font-size: 18rpx;
  color: #5a9572;
}

.badge-text {
  font-size: 20rpx;
  color: #5a9572;
  font-weight: 800;
}

.info-desc {
  flex: 1;
  font-size: 20rpx;
  color: #76907d;
  font-weight: 600;
}

.reset-btn {
  padding: 6rpx 16rpx;
  border: none;
  background: #ffffff;
  border-radius: 999rpx;
  font-size: 20rpx;
  color: #5a9572;
  font-weight: 800;
}

.reset-btn::after { border: none; }

.setup-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 16rpx;
  border: 2rpx dashed rgba(127, 204, 143, 0.3);
  background: rgba(127, 204, 143, 0.05);
  border-radius: 12rpx;
  font-size: 24rpx;
  color: #5a9572;
  font-weight: 800;
}

.setup-btn::after { border: none; }

.setup-icon {
  font-size: 26rpx;
}

/* 水杯展示 */
.cup-display {
  position: relative;
  padding: 20rpx 0 40rpx;
  display: flex;
  justify-content: center;
}

.progress-badge {
  position: absolute;
  top: 40rpx;
  right: 40rpx;
  padding: 8rpx 20rpx;
  background: rgba(127, 204, 143, 0.15);
  border-radius: 999rpx;
  font-size: 22rpx;
  font-weight: 800;
  color: #5a9572;
  z-index: 10;
}

.cup-container {
  position: relative;
  width: 600rpx;
  height: 680rpx;
}

/* 杯子插画：原图四周大量留白，放大 2 倍并按杯体中心（49.3%,50.3%）对齐容器中心 */
.cup-empty {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 1200rpx;
  height: 1200rpx;
  transform: translate(-49.3%, -50.3%);
  z-index: 2;
  pointer-events: none;
}

/* 水位：精确落在玻璃内壁（x 98-502，底部离容器底 70rpx，内壁净高 570rpx）。
   水层叠在杯图上方，半透明水色让水彩杯壁透出来，才是"水在杯子里" */
.water-wrapper {
  position: absolute;
  bottom: 70rpx;
  left: 100rpx;
  width: 400rpx;
  overflow: hidden;
  border-radius: 14rpx 14rpx 46rpx 46rpx;
  transition: height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 3;
  background: rgba(157, 206, 226, 0.4);
}

.water-texture {
  width: 100%;
  height: 570rpx;
  position: absolute;
  bottom: 0;
  left: 0;
  object-fit: cover;
}

.amount-display {
  position: absolute;
  top: 44%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: baseline;
  gap: 8rpx;
  z-index: 5;
}

.amount-num {
  font-size: 96rpx;
  font-weight: 900;
  color: #2d6943;
  line-height: 1;
  text-shadow: 0 2rpx 8rpx rgba(255, 255, 255, 0.8);
}

.amount-unit {
  font-size: 32rpx;
  font-weight: 800;
  color: #5a9572;
}

/* 快捷记录 */
.quick-section {
  margin: 0 24rpx 16rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.section-heading-copy { display: flex; align-items: center; gap: 8rpx; }

.header-icon {
  width: 28rpx;
  height: 28rpx;
  border-radius: 6rpx;
  mix-blend-mode: multiply;
}

.header-text {
  font-size: 26rpx;
  font-weight: 800;
  color: #2d6943;
}

.quick-drink-picker { display: inline-flex; align-items: center; gap: 6rpx; min-height: 44rpx; padding: 6rpx 12rpx; border: 1rpx solid #dce9e5; border-radius: 999rpx; color: #71818a; background: rgba(255, 253, 251, .84); font-size: 19rpx; }
.quick-drink-emoji { font-size: 22rpx; }.quick-drink-chevron { margin-left: 3rpx; color: #a8b9b2; font-size: 18rpx; }

.quick-buttons {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12rpx;
}

.quick-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 20rpx 8rpx;
  border: none;
  background: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(127, 204, 143, 0.08);
}

.quick-btn::after { border: none; }

.btn-icon {
  width: 32rpx;
  height: 32rpx;
  border-radius: 6rpx;
  mix-blend-mode: multiply;
}

.btn-drink-icon { display: flex; align-items: center; justify-content: center; width: 34rpx; height: 34rpx; font-size: 27rpx; line-height: 1; }

.btn-text {
  font-size: 20rpx;
  font-weight: 800;
  color: #5a9572;
}

/* 记录按钮 */
.action-section {
  padding: 0 24rpx 16rpx;
}

.record-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 28rpx;
  border: none;
  background: linear-gradient(135deg, #7fcc8f 0%, #6bb97d 100%);
  border-radius: 50rpx;
  box-shadow: 0 8rpx 24rpx rgba(127, 204, 143, 0.25);
}

.record-btn::after { border: none; }

.record-icon {
  width: 40rpx;
  height: 40rpx;
  border-radius: 8rpx;
  mix-blend-mode: multiply;
  filter: brightness(1.2);
}

.record-btn-emoji { font-size: 28rpx; line-height: 1; }

.record-text {
  font-size: 32rpx;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 1rpx;
}

/* 历史记录 */
.history-section {
  padding: 0 24rpx;
}

.history-header {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 12rpx;
}

.history-icon {
  width: 28rpx;
  height: 28rpx;
  border-radius: 6rpx;
  mix-blend-mode: multiply;
}

.history-title {
  font-size: 26rpx;
  font-weight: 800;
  color: #2d6943;
}

.history-count {
  font-size: 20rpx;
  color: #9aaca0;
  font-weight: 600;
  margin-right: auto;
}

.edit-btn {
  padding: 6rpx 16rpx;
  border: none;
  background: rgba(127, 204, 143, 0.12);
  border-radius: 999rpx;
  font-size: 20rpx;
  color: #5a9572;
  font-weight: 800;
}

.edit-btn::after { border: none; }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 20rpx;
  background: #ffffff;
  border-radius: 24rpx;
}

.empty-icon {
  font-size: 64rpx;
  margin-bottom: 16rpx;
}

.empty-text {
  font-size: 24rpx;
  color: #9aaca0;
  font-weight: 600;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.record-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 24rpx;
}

.record-img {
  width: 40rpx;
  height: 40rpx;
  border-radius: 8rpx;
  mix-blend-mode: multiply;
  flex-shrink: 0;
}

.record-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.record-name {
  font-size: 26rpx;
  font-weight: 800;
  color: #2d6943;
}

.record-time {
  font-size: 20rpx;
  color: #9aaca0;
  font-weight: 600;
}

.record-amount {
  font-size: 30rpx;
  font-weight: 900;
  color: #5a9572;
  line-height: 1;
}

.amount-unit-sm {
  font-size: 18rpx;
  margin-left: 2rpx;
}

.delete-btn {
  padding: 8rpx 16rpx;
  border: none;
  background: rgba(232, 155, 143, 0.12);
  border-radius: 999rpx;
  font-size: 20rpx;
  color: #d48873;
  font-weight: 800;
}

.delete-btn::after { border: none; }

/* 弹窗 */
.dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(45, 105, 67, 0.4);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.dialog-content {
  width: 100%;
  background: #ffffff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 32rpx 24rpx;
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28rpx;
}

.dialog-title {
  font-size: 30rpx;
  font-weight: 800;
  color: #2d6943;
}

.close-btn {
  width: 48rpx;
  height: 48rpx;
  padding: 0;
  border: none;
  background: rgba(127, 204, 143, 0.12);
  border-radius: 50%;
  font-size: 28rpx;
  color: #5a9572;
  line-height: 1;
}

.close-btn::after { border: none; }

.dialog-body {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.input-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8rpx;
  padding: 24rpx;
}

.input-num {
  font-size: 100rpx;
  font-weight: 900;
  color: #2d6943;
  line-height: 1;
}

.input-unit {
  font-size: 36rpx;
  font-weight: 800;
  color: #9aaca0;
}

.drink-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
}

.drink-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 20rpx;
  border: 2rpx solid #f0f4f0;
  background: #ffffff;
  border-radius: 16rpx;
}

.drink-option::after { border: none; }

.drink-option.active {
  border-color: #7fcc8f;
  background: rgba(127, 204, 143, 0.05);
}

.drink-emoji {
  font-size: 40rpx;
}

.drink-name {
  font-size: 22rpx;
  font-weight: 800;
  color: #76907d;
}

.drink-option.active .drink-name {
  color: #2d6943;
}

.keyboard {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
}

.key-btn {
  height: 88rpx;
  border: none;
  background: #f8faf8;
  border-radius: 16rpx;
  font-size: 36rpx;
  font-weight: 800;
  color: #2d6943;
}

.key-btn::after { border: none; }

.confirm-btn {
  width: 100%;
  padding: 28rpx;
  border: none;
  background: linear-gradient(135deg, #7fcc8f 0%, #6bb97d 100%);
  border-radius: 50rpx;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 800;
  letter-spacing: 1rpx;
  box-shadow: 0 8rpx 24rpx rgba(127, 204, 143, 0.25);
}

.confirm-btn::after { border: none; }
</style>
<style scoped>
.page { background: #fff8f2; }
.card { border: 1rpx solid rgba(255, 255, 255, .9); background: rgba(255, 253, 251, .78); box-shadow: 0 14rpx 34rpx rgba(126, 104, 94, .08), inset 0 1rpx 0 rgba(255, 255, 255, .9); backdrop-filter: blur(18px); }
.date-section { margin: 0; padding: 14rpx 28rpx 12rpx; border-radius: 0; border-bottom: 1rpx solid #ebe4dc; background: transparent; }
.date-btn { display: flex; align-items: center; justify-content: center; width: 44rpx; height: 44rpx; border: 1rpx solid #dce9e5; border-radius: 12rpx; color: #7898a5; background: #f1f7f5; }
.date-arrow-icon { width: 24rpx; height: 24rpx; opacity: .72; }
.date-text { color: #766b73; }
.goal-card { margin: 0 28rpx; padding: 18rpx 0 14rpx; border: 0; border-bottom: 1rpx solid #ebe4dc; border-radius: 0; background: transparent; box-shadow: none; }
.stat-label { color: #9d908f; }.stat-value { color: #789aa4; }.stat-value.primary { color: #5d8796; }.stat-divider { background: #e6eeea; }
.personalized-info { background: #eef6f2; }.info-badge { background: #dcefe4; }.badge-icon, .badge-text { color: #75878d; }.info-desc { color: #969093; }.reset-btn { color: #7d878c; background: #fffdfb; }
.setup-btn { display: flex; align-items: center; justify-content: center; width: 100%; min-height: 54rpx; padding: 0 16rpx; border: 1rpx solid #c9e0df; border-radius: 12rpx; color: #5f8790; background: #eaf6f5; font-size: 21rpx; line-height: 1; }
.cup-display { padding: 12rpx 0 30rpx; }
.progress-badge { top: 32rpx; right: 42rpx; color: #748e98; background: #e7f3ee; }
.cup-container { width: 600rpx; height: 680rpx; overflow: hidden; }
.cup-empty { top: 50%; left: 50%; width: 1200rpx; height: 1200rpx; transform: translate(-49.3%, -50.3%); z-index: 2; }
.water-wrapper { width: 400rpx; left: 100rpx; bottom: 70rpx; border-radius: 14rpx 14rpx 46rpx 46rpx; background: rgba(157, 206, 226, .4); z-index: 3; }
.water-wrapper::before { content: ''; position: absolute; top: -2rpx; right: -4%; left: -4%; height: 30rpx; background: rgba(226, 246, 249, .7); clip-path: polygon(0 42%, 8% 23%, 16% 39%, 25% 9%, 34% 34%, 44% 15%, 53% 38%, 63% 8%, 73% 31%, 83% 13%, 92% 36%, 100% 19%, 100% 100%, 0 100%); z-index: 2; animation: water-breathe 3.8s ease-in-out infinite; }
.water-wrapper::after { content: ''; position: absolute; top: 7rpx; right: -8%; left: -8%; height: 16rpx; border: 2rpx solid rgba(204, 235, 241, .7); border-radius: 50%; opacity: .7; z-index: 2; animation: water-ripple 4.6s ease-in-out infinite; }
.water-texture { top: auto; bottom: 0; width: 100%; height: 570rpx; opacity: .9; animation: water-drift 7s ease-in-out infinite alternate; transform-origin: center bottom; }
.water-surface { position: absolute; top: -8rpx; left: -6%; z-index: 4; width: 112%; height: 40rpx; border-radius: 48% 52% 45% 55% / 68% 52% 48% 32%; background: rgba(225, 247, 250, .66); box-shadow: 0 3rpx 10rpx rgba(100, 170, 190, .16); animation: surface-swell 3.2s ease-in-out infinite; }
.surface-wave { position: absolute; left: -6%; width: 112%; height: 18rpx; border-top: 3rpx solid rgba(194, 231, 239, .8); border-radius: 50%; pointer-events: none; }
.wave-one { top: 7rpx; animation: wave-one 2.35s ease-in-out infinite; }
.wave-two { top: 18rpx; border-top-color: rgba(255, 255, 255, .62); animation: wave-two 3.6s ease-in-out infinite reverse; }
.surface-glint { position: absolute; top: 9rpx; right: 14%; left: 14%; height: 5rpx; border-radius: 50%; background: rgba(255, 255, 255, .78); animation: surface-glint 2.7s ease-in-out infinite alternate; }
@keyframes water-drift { from { transform: translateX(-3%) scaleX(1.03); } to { transform: translateX(3%) scaleX(1.08); } }
@keyframes water-breathe { 0%, 100% { transform: translateX(-2%) scaleX(.96) skewX(-1deg); opacity: .56; } 50% { transform: translateX(2%) scaleX(1.04) skewX(1deg); opacity: .84; } }
@keyframes water-ripple { 0%, 100% { transform: translateX(-4%) scaleX(.92); opacity: .38; } 50% { transform: translateX(5%) scaleX(1.04); opacity: .78; } }
@keyframes surface-swell { 0%, 100% { transform: translateX(-2%) rotate(-1deg) scaleX(.96); border-radius: 48% 52% 45% 55% / 68% 52% 48% 32%; } 50% { transform: translateX(3%) rotate(1deg) scaleX(1.04); border-radius: 55% 45% 52% 48% / 52% 68% 32% 48%; } }
@keyframes surface-glint { from { transform: translateX(-10%); opacity: .38; } to { transform: translateX(12%); opacity: .82; } }
@keyframes wave-one { 0%, 100% { transform: translateX(-7%) scaleX(.9) rotate(-1deg); opacity: .46; } 50% { transform: translateX(8%) scaleX(1.08) rotate(1deg); opacity: .96; } }
@keyframes wave-two { 0%, 100% { transform: translateX(8%) scaleX(1.08) rotate(1deg); opacity: .3; } 50% { transform: translateX(-8%) scaleX(.88) rotate(-1deg); opacity: .78; } }
.amount-display { top: 46%; }.amount-num { color: #477b8d; text-shadow: 0 2rpx 10rpx rgba(255, 255, 255, .9); }.amount-unit { color: #789daa; }
.quick-section, .history-section { margin-right: 28rpx; margin-left: 28rpx; }.header-text, .history-title { color: #6c626a; }.quick-btn { padding: 18rpx 8rpx; border: 1rpx solid rgba(255, 255, 255, .9); border-radius: 16rpx; background: rgba(255, 253, 251, .78); box-shadow: 0 10rpx 22rpx rgba(126, 104, 94, .06); }.btn-text { color: #7d8e96; }
.quick-drink-picker { padding: 5rpx 12rpx 5rpx 8rpx; color: #71818a; }
.quick-drink-icon { width: 28rpx; height: 28rpx; }
.record-btn { position: relative; padding: 22rpx 28rpx; border: 1rpx solid rgba(255,255,255,.66); border-radius: 24rpx; background: linear-gradient(135deg, #83c5d2 0%, #69adbe 100%); box-shadow: 0 14rpx 28rpx rgba(94,157,176,.2), inset 0 2rpx 0 rgba(255,255,255,.42); overflow: hidden; }
.record-btn::before { content: ''; position: absolute; top: 2rpx; right: 10%; left: 10%; height: 18rpx; border-radius: 50%; background: rgba(255,255,255,.18); }
.record-btn:active { transform: translateY(2rpx) scale(.985); box-shadow: 0 8rpx 16rpx rgba(94,157,176,.18), inset 0 2rpx 0 rgba(255,255,255,.34); }
.record-text { position: relative; z-index: 1; letter-spacing: 0; color: #fffdfb; }
.record-icon-wrap { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; width: 42rpx; height: 42rpx; border-radius: 50%; background: rgba(255,255,255,.24); }
.record-item { border-radius: 16rpx; }.record-name { color: #675d67; }.record-time, .history-count { color: #a39391; }.record-amount { color: #6d9aaa; }
.record-drink-icon { display: flex; align-items: center; justify-content: center; width: 56rpx; height: 56rpx; margin-right: 14rpx; border-radius: 16rpx; background: #edf7f4; font-size: 29rpx; line-height: 1; }
.record-water-icon { width: 36rpx; height: 36rpx; }
.drink-image { width: 42rpx; height: 42rpx; }
.dialog-mask { background: rgba(75, 56, 61, .26); }.dialog-content { border: 1rpx solid rgba(255, 255, 255, .9); border-radius: 28rpx 28rpx 0 0; background: rgba(255, 253, 251, .96); box-shadow: 0 -14rpx 36rpx rgba(100, 76, 75, .16); backdrop-filter: blur(20px); }.dialog-title { color: #5b4f54; }.close-btn { color: #9b8589; background: #f8efec; }.input-num { color: #5c8ca0; }.input-unit { color: #a39391; }.drink-option { border-color: #efe1da; background: #fffaf7; }.drink-option.active { border-color: #b8d8d5; background: #edf7f4; }.drink-name { color: #9b8889; }.drink-option.active .drink-name { color: #5f8997; }.key-btn { color: #667d87; background: #f7f2ee; }.confirm-btn { background: #76b7c7; box-shadow: 0 10rpx 22rpx rgba(94, 157, 176, .2); }
@media (min-width: 700px) { .page { max-width: 760px; margin: 0 auto; } }
</style>

<style scoped>
/* Restore the stable water/cup composition from the morning build. */
.cup-display .cup-container {
  width: 600rpx !important;
  height: 680rpx !important;
  overflow: hidden !important;
}
.cup-display .cup-empty {
  top: 50% !important;
  left: 50% !important;
  width: 1200rpx !important;
  height: 1200rpx !important;
  transform: translate(-49.3%, -50.3%) scale(2.05) !important;
}
.cup-display .water-wrapper {
  bottom: 70rpx !important;
  left: 100rpx !important;
  width: 400rpx !important;
  max-height: 570rpx !important;
  transform: none !important;
  border-radius: 14rpx 14rpx 46rpx 46rpx !important;
  overflow: hidden !important;
  z-index: 1 !important;
}
.cup-display .water-texture {
  top: -52% !important;
  bottom: auto !important;
  left: 0 !important;
  width: 100% !important;
  height: 150% !important;
}
.cup-display .water-surface { left: -6% !important; width: 112% !important; }
.cup-display .surface-wave { left: -6% !important; width: 112% !important; }
.cup-display .cup-empty { z-index: 2 !important; }
</style>

<style scoped>
/* ============================================================
 * 喝水页 v3 精修（杯与水的绘制逻辑不动）
 * 青蓝水色系 + 玻璃表面 + 发丝分隔，去掉旧版的拼贴感
 * ============================================================ */
.water-page .date-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
  border-bottom: 0;
  background: transparent;
}
.water-page .date-btn {
  width: 60rpx;
  height: 60rpx;
  border: 1rpx solid var(--hz-rule-glass);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 4rpx 12rpx rgba(29, 55, 41, 0.05), inset 0 1rpx 0 rgba(255, 255, 255, 0.9);
}
.water-page .date-text {
  min-width: 180rpx;
  color: var(--hz-ink);
  font-size: 27rpx;
  font-weight: 750;
  text-align: center;
}
.water-page .goal-card {
  padding: 26rpx 8rpx;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.9), 0 10rpx 30rpx rgba(29, 55, 41, 0.06);
}
.water-page .goal-card .stat-label {
  color: var(--hz-muted);
  font-size: 19rpx;
  font-weight: 600;
  letter-spacing: 1rpx;
}
.water-page .goal-card .stat-value {
  margin-top: 6rpx;
  color: #2e5e6b;
  font-size: 38rpx;
  font-weight: 800;
}
.water-page .goal-card .stat-value.primary { color: #23808f; }
.water-page .stat-divider {
  width: 1rpx;
  height: 48rpx;
  background: rgba(125, 178, 190, 0.28);
}
.water-page .personalized-info {
  margin-top: 14rpx;
  padding: 12rpx 18rpx;
  border: 1rpx solid rgba(125, 178, 190, 0.3);
  border-radius: 999rpx;
  background: rgba(233, 244, 246, 0.7);
}
.water-page .badge-icon { color: #4f8794; }
.water-page .badge-text { color: #4f8794; font-weight: 650; }
.water-page .info-desc { color: #6d8a92; }
.water-page .setup-btn {
  height: 46rpx;
  padding: 0 18rpx;
  border: 0;
  border-radius: 999rpx;
  color: #23808f;
  background: rgba(255, 255, 255, 0.85);
  font-size: 20rpx;
  font-weight: 700;
  box-shadow: 0 3rpx 8rpx rgba(35, 128, 143, 0.12);
}
.water-page .section-header { margin-bottom: 16rpx; }
.water-page .header-text { color: var(--hz-ink); font-size: 27rpx; font-weight: 750; }
.water-page .header-icon { mix-blend-mode: multiply; }
.water-page .quick-drink-picker {
  height: 54rpx;
  padding: 0 18rpx;
  border: 1rpx solid var(--hz-rule-glass);
  border-radius: 999rpx;
  color: #2e5e6b;
  background: rgba(255, 255, 255, 0.85);
  font-size: 20rpx;
  font-weight: 650;
  box-shadow: 0 4rpx 12rpx rgba(29, 55, 41, 0.05);
}
.water-page .quick-drink-chevron { color: var(--hz-muted); }
.water-page .quick-buttons { gap: 12rpx; }
.water-page .quick-btn {
  padding: 20rpx 6rpx;
  border: 1rpx solid var(--hz-rule-glass);
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.95), 0 5rpx 14rpx rgba(29, 55, 41, 0.04);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.water-page .quick-btn:active {
  transform: scale(0.95);
  background: rgba(233, 244, 246, 0.95);
  box-shadow: 0 3rpx 8rpx rgba(35, 128, 143, 0.12);
}
.water-page .btn-icon { width: 34rpx; height: 34rpx; mix-blend-mode: multiply; }
.water-page .btn-drink-icon { font-size: 32rpx; }
.water-page .btn-text { margin-top: 8rpx; color: var(--hz-ink-soft); font-size: 20rpx; font-weight: 650; }
.water-page .history-section {
  padding: 22rpx 24rpx 8rpx;
  border: 1rpx solid var(--hz-rule-glass);
  border-radius: var(--hz-radius-card);
  background: rgba(255, 255, 255, 0.82);
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.9), 0 10rpx 30rpx rgba(29, 55, 41, 0.05);
}
.water-page .history-title { color: var(--hz-ink); font-size: 26rpx; font-weight: 750; }
.water-page .history-count { color: var(--hz-muted); }
.water-page .record-item { padding: 18rpx 4rpx; border-bottom: 1rpx solid var(--hz-rule-glass); }
.water-page .record-item:last-child { border-bottom: 0; }
.water-page .record-drink-icon {
  background: rgba(233, 244, 246, 0.9);
  border-radius: 16rpx;
}
.water-page .record-name { color: var(--hz-ink); font-size: 25rpx; font-weight: 650; }
.water-page .record-time { color: var(--hz-faint); }
.water-page .record-amount { color: #23808f; font-size: 28rpx; font-weight: 800; }
.water-page .swap { color: #4f8794; font-weight: 650; }
</style>

<style scoped>
/* ---- 统计卡进度条：已喝/目标的直观比例 ---- */
.goal-progress {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin: 20rpx 6rpx 4rpx;
}
.goal-progress-track {
  position: relative;
  flex: 1;
  height: 10rpx;
  border-radius: 999rpx;
  background: rgba(125, 178, 190, 0.18);
  overflow: hidden;
}
.goal-progress-fill {
  height: 100%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #7cc3d4 0%, #3d93a8 100%);
  box-shadow: 0 0 8rpx rgba(61, 147, 168, 0.35);
  transition: width 0.6s cubic-bezier(0.22, 0.8, 0.36, 1);
}
.goal-progress-text {
  flex: none;
  min-width: 64rpx;
  color: #23808f;
  font-size: 20rpx;
  font-weight: 800;
  text-align: right;
}

/* ---- 记录水 CTA：深青渐变实底，白色图标+文字，唯一的页面焦点 ---- */
.record-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14rpx;
  height: 96rpx;
  border: 0 !important;
  border-radius: 999rpx !important;
  background: linear-gradient(135deg, #52aec3 0%, #2e7f95 100%) !important;
  box-shadow: 0 14rpx 30rpx rgba(46, 127, 149, 0.32), inset 0 2rpx 0 rgba(255, 255, 255, 0.35) !important;
  overflow: hidden;
}
.record-btn::before {
  content: '';
  position: absolute;
  top: 0;
  right: 12%;
  left: 12%;
  height: 24rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
}
.record-btn:active {
  transform: scale(0.985);
  background: linear-gradient(135deg, #479fb4 0%, #276f83 100%) !important;
  box-shadow: 0 8rpx 18rpx rgba(46, 127, 149, 0.28) !important;
}
.record-icon-wrap {
  background: rgba(255, 255, 255, 0.28) !important;
  border-radius: 50%;
}
.record-icon { mix-blend-mode: normal; }
.record-text {
  color: #ffffff !important;
  font-size: 28rpx !important;
  font-weight: 750 !important;
  letter-spacing: 2rpx;
}
</style>
