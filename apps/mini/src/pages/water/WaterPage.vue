<template>
  <view class="water-page">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <button class="nav-back" @tap="goBack">
        <text class="back-icon">‹</text>
      </button>
      <text class="nav-title">喝水记录</text>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 日期选择 -->
    <view class="date-selector">
      <button class="date-arrow" @tap="prevDay">‹</button>
      <text class="current-date">{{ dateLabel }}</text>
      <button class="date-arrow" @tap="nextDay">›</button>
    </view>

    <!-- 目标卡片 -->
    <view class="goal-card">
      <view class="goal-row">
        <view class="goal-item">
          <text class="goal-label">每日目标</text>
          <text class="goal-value">{{ dailyGoal }}ml</text>
        </view>
        <view class="goal-divider"></view>
        <view class="goal-item">
          <text class="goal-label">剩余</text>
          <text class="goal-value remaining">{{ remainingAmount }}ml</text>
        </view>
      </view>
      <button class="adjust-btn" @tap="editGoal">
        <text>调整目标</text>
      </button>
    </view>

    <!-- 水杯展示 -->
    <view class="cup-display">
      <view class="cup-container">
        <!-- 空杯子图片 -->
        <image 
          class="cup-empty" 
          src="/static/illustrations/water-cup-empty.png" 
          mode="aspectFit"
        />
        
        <!-- 水位图片 -->
        <view class="water-container" :style="{ height: waterHeight + '%' }">
          <image 
            class="water-texture" 
            src="/static/illustrations/water-ripple-texture.png" 
            mode="aspectFill"
          />
        </view>
        
        <!-- 数字显示 -->
        <view class="amount-text">
          <text class="amount-num">{{ totalAmount }}</text>
          <text class="amount-unit">ml</text>
        </view>
        
        <!-- 进度百分比 -->
        <view class="progress-badge">
          <text>{{ progressPercent }}%</text>
        </view>
      </view>
    </view>

    <!-- 快捷添加 -->
    <view class="quick-add-section">
      <view class="section-label">
        <image class="label-icon" src="/static/icons/watercolor/water-drop.jpg" mode="aspectFit" />
        <text class="label-text">快速记录</text>
      </view>
      
      <view class="quick-buttons">
        <button 
          v-for="item in quickAmounts" 
          :key="item"
          class="quick-btn"
          @tap="quickAdd(item)"
        >
          <image class="quick-icon" src="/static/icons/watercolor/water-drop.jpg" mode="aspectFit" />
          <text class="quick-amount">{{ item }}ml</text>
        </button>
      </view>
    </view>

    <!-- 主操作按钮 -->
    <view class="main-action">
      <button class="record-button" @tap="openDialog">
        <image class="btn-icon" src="/static/icons/watercolor/water-drop.jpg" mode="aspectFit" />
        <text class="btn-text">记录喝水</text>
      </button>
    </view>

    <!-- 今日记录 -->
    <view class="records-section">
      <view class="section-header">
        <image class="section-icon" src="/static/icons/watercolor/water-drop.jpg" mode="aspectFit" />
        <text class="section-title">今日记录</text>
        <text class="record-count">({{ records.length }}次)</text>
        <button v-if="records.length > 0" class="edit-toggle" @tap="toggleEdit">
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
          class="record-item"
        >
          <view class="record-left">
            <image class="record-icon" src="/static/icons/watercolor/water-drop.jpg" mode="aspectFit" />
            <view class="record-detail">
              <text class="record-name">{{ getDrinkName(record.drinkType) }}</text>
              <text class="record-time">{{ formatTime(record.timestamp) }}</text>
            </view>
          </view>
          <view class="record-right">
            <text class="record-amount">{{ record.amount }}ml</text>
            <button v-if="editMode" class="delete-btn" @tap="deleteRecord(record.id)">
              <text>删除</text>
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- 添加弹窗 -->
    <view v-if="dialogVisible" class="dialog-overlay" @tap="closeDialog">
      <view class="dialog-container" @tap.stop>
        <view class="dialog-header">
          <text class="dialog-title">添加饮水记录</text>
          <button class="close-btn" @tap="closeDialog">✕</button>
        </view>

        <view class="dialog-content">
          <!-- 数量输入显示 -->
          <view class="input-display">
            <text class="input-value">{{ inputAmount }}</text>
            <text class="input-unit">ml</text>
          </view>

          <!-- 饮品类型选择 -->
          <view class="drink-selector">
            <button 
              v-for="drink in drinkOptions" 
              :key="drink.id"
              :class="['drink-option', selectedDrink === drink.id ? 'selected' : '']"
              @tap="selectedDrink = drink.id"
            >
              <text class="drink-emoji">{{ drink.icon }}</text>
              <text class="drink-name">{{ drink.name }}</text>
            </button>
          </view>

          <!-- 数字键盘 -->
          <view class="number-keyboard">
            <button 
              v-for="key in numberKeys" 
              :key="key"
              class="key-btn"
              @tap="handleKey(key)"
            >
              <text>{{ key }}</text>
            </button>
          </view>

          <!-- 确定按钮 -->
          <button class="confirm-btn" @tap="confirmAdd">
            <text>完成</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { navigateBack } from '../../utils/router.js';

interface WaterRecord {
  id: string;
  amount: number;
  drinkType: string;
  timestamp: number;
}

const currentDate = ref(new Date());
const dailyGoal = ref(2000);
const records = ref<WaterRecord[]>([]);
const editMode = ref(false);
const dialogVisible = ref(false);
const inputAmount = ref('200');
const selectedDrink = ref('water');

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
  return Math.min((totalAmount.value / dailyGoal.value) * 100, 100);
});

function getDrinkIcon(type: string): string {
  const drink = drinkOptions.find(d => d.id === type);
  return drink?.icon || '💧';
}

function getDrinkName(type: string): string {
  const drink = drinkOptions.find(d => d.id === type);
  return drink?.name || '水';
}

function goBack() {
  navigateBack();
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

function editGoal() {
  uni.showModal({
    title: '设置每日目标',
    editable: true,
    placeholderText: String(dailyGoal.value),
    success: (res) => {
      if (res.confirm && res.content) {
        const val = parseInt(res.content);
        if (val > 0) {
          dailyGoal.value = val;
          uni.setStorageSync('water_daily_goal', val);
        }
      }
    },
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
  try {
    const goal = uni.getStorageSync('water_daily_goal');
    if (goal) dailyGoal.value = goal;
  } catch (e) {}
  
  loadRecords();
});
</script>

<style scoped>
.water-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5faf7 0%, #eef5f1 100%);
  padding-bottom: 120rpx;
}

/* 自定义导航栏 */
.custom-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 32rpx;
  padding-top: calc(20rpx + env(safe-area-inset-top));
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10rpx);
}

.nav-back {
  width: 64rpx;
  height: 64rpx;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 44rpx;
  color: #2d6943;
  line-height: 1;
}

.nav-back::after { border: none; }

.nav-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #2d6943;
}

.nav-placeholder {
  width: 64rpx;
}

/* 日期选择 */
.date-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32rpx;
  padding: 24rpx;
  background: rgba(255, 255, 255, 0.8);
}

.date-arrow {
  width: 56rpx;
  height: 56rpx;
  padding: 0;
  border: none;
  background: rgba(127, 204, 143, 0.1);
  border-radius: 50%;
  font-size: 36rpx;
  color: #5a9572;
  line-height: 1;
}

.date-arrow::after { border: none; }

.current-date {
  font-size: 30rpx;
  font-weight: 600;
  color: #2d6943;
  min-width: 140rpx;
  text-align: center;
}

/* 目标卡片 */
.goal-card {
  margin: 24rpx 32rpx;
  padding: 28rpx;
  background: #ffffff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(127, 204, 143, 0.08);
}

.goal-row {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.goal-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.goal-label {
  font-size: 24rpx;
  color: #9aaca0;
}

.goal-value {
  font-size: 32rpx;
  font-weight: 700;
  color: #5a9572;
}

.goal-value.remaining {
  color: #7fcc8f;
}

.goal-divider {
  width: 2rpx;
  height: 40rpx;
  background: rgba(127, 204, 143, 0.2);
  margin: 0 24rpx;
}

.adjust-btn {
  width: 100%;
  padding: 18rpx;
  border: none;
  background: rgba(127, 204, 143, 0.08);
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #5a9572;
  font-weight: 600;
}

.adjust-btn::after { border: none; }

/* 水杯展示 */
.cup-display {
  padding: 40rpx 32rpx 60rpx;
  display: flex;
  justify-content: center;
}

.cup-container {
  position: relative;
  width: 380rpx;
  height: 540rpx;
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

.water-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 100%;
  overflow: hidden;
  transition: height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
  border-radius: 0 0 20rpx 20rpx;
}

.water-texture {
  width: 100%;
  height: 540rpx;
  position: absolute;
  bottom: 0;
  left: 0;
  object-fit: cover;
}

.amount-text {
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
  font-weight: 800;
  color: #2d6943;
  text-shadow: 0 2rpx 8rpx rgba(255, 255, 255, 0.95);
}

.amount-unit {
  font-size: 32rpx;
  color: #5a9572;
}

.progress-badge {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  padding: 8rpx 20rpx;
  background: rgba(127, 204, 143, 0.15);
  border-radius: 40rpx;
  font-size: 24rpx;
  font-weight: 600;
  color: #5a9572;
  z-index: 3;
}

/* 快捷添加 */
.quick-add-section {
  margin: 0 32rpx 24rpx;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.label-icon {
  width: 40rpx;
  height: 40rpx;
  border-radius: 8rpx;
}

.label-text {
  font-size: 28rpx;
  font-weight: 600;
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
  box-shadow: 0 2rpx 8rpx rgba(127, 204, 143, 0.06);
}

.quick-btn::after { border: none; }

.quick-icon {
  width: 32rpx;
  height: 32rpx;
  border-radius: 6rpx;
}

.quick-amount {
  font-size: 22rpx;
  color: #5a9572;
  font-weight: 600;
}

/* 主操作按钮 */
.main-action {
  padding: 0 32rpx 32rpx;
}

.record-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: 32rpx;
  border: none;
  background: linear-gradient(135deg, #7fcc8f 0%, #6bb97d 100%);
  border-radius: 50rpx;
  box-shadow: 0 8rpx 24rpx rgba(127, 204, 143, 0.35);
}

.record-button::after { border: none; }

.btn-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 8rpx;
}

.btn-text {
  font-size: 32rpx;
  font-weight: 700;
  color: #ffffff;
}

/* 记录列表 */
.records-section {
  padding: 0 32rpx;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.section-icon {
  width: 32rpx;
  height: 32rpx;
  border-radius: 6rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #2d6943;
}

.record-count {
  font-size: 24rpx;
  color: #9aaca0;
}

.edit-toggle {
  padding: 8rpx 20rpx;
  border: none;
  background: rgba(127, 204, 143, 0.1);
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #5a9572;
}

.edit-toggle::after { border: none; }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 20rpx;
  background: #ffffff;
  border-radius: 20rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 26rpx;
  color: #9aaca0;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.record-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  background: #ffffff;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(127, 204, 143, 0.06);
}

.record-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
  flex: 1;
}

.record-emoji {
  font-size: 40rpx;
}

.record-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 8rpx;
}

.record-detail {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.record-name {
  font-size: 28rpx;
  color: #2d6943;
  font-weight: 500;
}

.record-time {
  font-size: 24rpx;
  color: #9aaca0;
}

.record-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.record-amount {
  font-size: 32rpx;
  font-weight: 700;
  color: #5a9572;
}

.delete-btn {
  padding: 8rpx 20rpx;
  border: none;
  background: rgba(255, 77, 79, 0.1);
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #ff4d4f;
}

.delete-btn::after { border: none; }

/* 弹窗 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(45, 105, 67, 0.6);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.dialog-container {
  width: 100%;
  background: #ffffff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 40rpx 32rpx;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32rpx;
}

.dialog-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #2d6943;
}

.close-btn {
  width: 48rpx;
  height: 48rpx;
  padding: 0;
  border: none;
  background: rgba(127, 204, 143, 0.1);
  border-radius: 50%;
  font-size: 28rpx;
  color: #5a9572;
  line-height: 1;
}

.close-btn::after { border: none; }

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.input-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 12rpx;
  padding: 32rpx;
}

.input-value {
  font-size: 120rpx;
  font-weight: 800;
  color: #2d6943;
}

.input-unit {
  font-size: 40rpx;
  color: #9aaca0;
}

.drink-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.drink-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 24rpx;
  border: 2rpx solid #e8f3ea;
  background: #ffffff;
  border-radius: 20rpx;
}

.drink-option::after { border: none; }

.drink-option.selected {
  border-color: #7fcc8f;
  background: rgba(127, 204, 143, 0.05);
}

.drink-emoji {
  font-size: 48rpx;
}

.drink-name {
  font-size: 24rpx;
  color: #5a9572;
}

.drink-option.selected .drink-name {
  color: #2d6943;
  font-weight: 600;
}

.number-keyboard {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.key-btn {
  height: 100rpx;
  border: none;
  background: #f5faf7;
  border-radius: 20rpx;
  font-size: 40rpx;
  color: #2d6943;
  font-weight: 500;
}

.key-btn::after { border: none; }

.confirm-btn {
  width: 100%;
  padding: 32rpx;
  border: none;
  background: linear-gradient(135deg, #7fcc8f 0%, #6bb97d 100%);
  border-radius: 50rpx;
  color: #ffffff;
  font-size: 36rpx;
  font-weight: 700;
  box-shadow: 0 8rpx 24rpx rgba(127, 204, 143, 0.35);
}

.confirm-btn::after { border: none; }
</style>
