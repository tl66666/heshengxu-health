<template>
  <view class="page">
    <AppNavBar title="喝水记录" route="/pages/water/WaterPage" />

    <!-- 日期选择 -->
    <view class="date-section">
      <button class="date-btn" @tap="prevDay">‹</button>
      <text class="date-text">{{ dateLabel }}</text>
      <button class="date-btn" @tap="nextDay">›</button>
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
        <view class="water-wrapper" :style="{ height: waterHeight + '%' }">
          <image 
            class="water-texture" 
            src="/static/illustrations/water-ripple-texture.png" 
            mode="aspectFill"
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
        <image class="header-icon" src="/static/icons/watercolor/water-drop.jpg" mode="aspectFit" />
        <text class="header-text">快速记录</text>
      </view>
      
      <view class="quick-buttons">
        <button 
          v-for="amt in quickAmounts" 
          :key="amt"
          class="quick-btn"
          @tap="quickAdd(amt)"
        >
          <image class="btn-icon" src="/static/icons/watercolor/water-drop.jpg" mode="aspectFit" />
          <text class="btn-text">{{ amt }}ml</text>
        </button>
      </view>
    </view>

    <!-- 记录喝水按钮 -->
    <view class="action-section">
      <button class="record-btn" @tap="openDialog">
        <image class="record-icon" src="/static/icons/watercolor/water-drop.jpg" mode="aspectFit" />
        <text class="record-text">记录喝水</text>
      </button>
    </view>

    <!-- 今日记录 -->
    <view class="history-section">
      <view class="history-header">
        <image class="history-icon" src="/static/icons/watercolor/water-drop.jpg" mode="aspectFit" />
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
          <image class="record-img" src="/static/icons/watercolor/water-drop.jpg" mode="aspectFit" />
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
          <text class="dialog-title">添加饮水记录</text>
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
              <text class="drink-emoji">{{ drink.icon }}</text>
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
import AppNavBar from '../../components/AppNavBar.vue';
import { navigateBack } from '../../utils/router.js';

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
    const userInfo = uni.getStorageSync('water_user_info') as UserInfo | null;
    if (userInfo && userInfo.weight) {
      const recommended = calculateRecommendedWater(userInfo);
      dailyGoal.value = recommended;
      isPersonalized.value = true;
    } else {
      const savedGoal = uni.getStorageSync('water_daily_goal');
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
  uni.navigateTo({
    url: '/pages/water-goal/WaterGoalPage'
  });
}

function quickAdd(amount: number) {
  addRecord(amount, 'water');
}

function openDialog() {
  inputAmount.value = '200';
  selectedDrink.value = 'water';
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
  return `water_${d.getFullYear()}_${d.getMonth() + 1}_${d.getDate()}`;
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
  width: 700rpx;
  height: 850rpx;
}

.cup-empty {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

.water-wrapper {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 76%;
  max-height: 82%;
  overflow: hidden;
  transition: height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 1;
  border-radius: 0 0 40rpx 40rpx;
  clip-path: polygon(
    0% 0%,
    100% 0%,
    100% 88%,
    96% 94%,
    4% 94%,
    0% 88%
  );
}

.water-texture {
  width: 100%;
  height: 850rpx;
  position: absolute;
  bottom: 0;
  left: 0;
  object-fit: cover;
}

.amount-display {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: baseline;
  gap: 8rpx;
  z-index: 3;
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
  gap: 8rpx;
  margin-bottom: 12rpx;
}

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
