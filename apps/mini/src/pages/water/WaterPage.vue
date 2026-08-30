<template>
  <view class="page">
    <AppNavBar title="喝水记录" route="/pages/water/WaterPage" />

    <!-- 日期切换 -->
    <view class="date-bar">
      <button class="date-btn" @tap="prevDay">‹</button>
      <text class="date-text">{{ dateLabel }}</text>
      <button class="date-btn" @tap="nextDay">›</button>
    </view>

    <!-- 目标信息 -->
    <view class="goal-info">
      <view class="goal-item">
        <text class="goal-label">每日目标</text>
        <text class="goal-value">{{ dailyGoal }}ml</text>
      </view>
      <view class="goal-item">
        <text class="goal-label">剩余</text>
        <text class="goal-value">{{ remainingAmount }}ml</text>
      </view>
      <button class="goal-adjust" @tap="editGoal">调整</button>
    </view>

    <!-- 水杯展示区 -->
    <view class="cup-area">
      <!-- 水杯图片容器 -->
      <view class="cup-wrapper">
        <!-- 水杯图片 -->
        <image 
          class="cup-image" 
          src="/static/illustrations/water-cup-watercolor.png" 
          mode="aspectFit"
        />
        
        <!-- 水位遮罩 -->
        <view class="water-mask" :style="{ height: (100 - waterHeight) + '%' }"></view>
        
        <!-- 数字显示 -->
        <view class="amount-display">
          <text class="amount-number">{{ totalAmount }}</text>
          <text class="amount-unit">ml</text>
          <text class="amount-progress">({{ progressPercent }}%)</text>
        </view>
      </view>
    </view>

    <!-- 快捷饮品 -->
    <view class="quick-drink">
      <image class="drink-icon" src="/static/icons/watercolor/water-drop.jpg" mode="aspectFit" />
      <view class="drink-detail">
        <text class="drink-name">水</text>
        <text class="drink-volume">200ml</text>
      </view>
    </view>

    <!-- 添加按钮组 -->
    <view class="action-group">
      <button class="action-quick" @tap="quickAddWater">
        <text class="action-icon">+</text>
        <text>快速记录</text>
      </button>
    </view>

    <!-- 主操作按钮 -->
    <view class="main-actions">
      <button class="btn-record" @tap="openDialog">
        <image class="btn-icon" src="/static/icons/watercolor/water-drop.jpg" mode="aspectFit" />
        <text>记录喝水</text>
      </button>
      <button class="btn-stats" @tap="showStats">统计</button>
    </view>

    <!-- 今日记录 -->
    <view class="records-section">
      <view class="records-title">
        <text class="title-text">💧 今日喝水 ({{ records.length }}次)</text>
        <button v-if="records.length > 0" class="title-edit" @tap="toggleEdit">
          {{ editMode ? '完成' : '编辑' }}
        </button>
      </view>

      <view v-if="records.length === 0" class="records-empty">
        <text>还没有喝水吗？来一杯吧～</text>
      </view>

      <view v-else class="records-list">
        <view 
          v-for="record in records" 
          :key="record.id"
          class="record-card"
        >
          <text class="record-emoji">{{ getDrinkIcon(record.drinkType) }}</text>
          <view class="record-info">
            <text class="record-name">{{ getDrinkName(record.drinkType) }}</text>
            <text class="record-time">{{ formatTime(record.timestamp) }}</text>
          </view>
          <text class="record-amount">{{ record.amount }}ml</text>
          <button v-if="editMode" class="record-delete" @tap="deleteRecord(record.id)">
            删除
          </button>
        </view>
      </view>
    </view>

    <!-- 添加弹窗 -->
    <view v-if="dialogVisible" class="dialog-overlay" @tap="closeDialog">
      <view class="dialog-content" @tap.stop>
        <view class="dialog-header">
          <text class="dialog-title">设置快捷记录</text>
          <button class="dialog-close" @tap="closeDialog">✕</button>
        </view>

        <!-- 数量显示 -->
        <view class="input-display">
          <text class="input-number">{{ inputAmount }}</text>
          <text class="input-unit">ml</text>
        </view>

        <!-- 饮品类型 -->
        <view class="drink-types">
          <button 
            v-for="drink in drinkOptions" 
            :key="drink.id"
            :class="['drink-option', selectedDrink === drink.id ? 'active' : '']"
            @tap="selectedDrink = drink.id"
          >
            <text class="option-icon">{{ drink.icon }}</text>
            <text class="option-name">{{ drink.name }}</text>
          </button>
        </view>

        <!-- 数字键盘 -->
        <view class="number-pad">
          <button 
            v-for="key in numberKeys" 
            :key="key"
            class="pad-key"
            @tap="handleKeyPress(key)"
          >
            {{ key }}
          </button>
        </view>

        <!-- 确定按钮 -->
        <button class="dialog-confirm" @tap="confirmAdd">完成</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AppNavBar from '../../components/AppNavBar.vue';

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
  return Math.min(percent, 100); // 修复：限制最大100%
});

const waterHeight = computed(() => {
  return Math.min((totalAmount.value / dailyGoal.value) * 100, 100); // 修复：限制最大100%
});

function getDrinkIcon(type: string): string {
  const drink = drinkOptions.find(d => d.id === type);
  return drink?.icon || '💧';
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

function quickAddWater() {
  addRecord(200, 'water');
}

function openDialog() {
  inputAmount.value = '200';
  selectedDrink.value = 'water';
  dialogVisible.value = true;
}

function closeDialog() {
  dialogVisible.value = false;
}

function handleKeyPress(key: number | string) {
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
    drinkType, // 修复：正确存储饮品类型
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

function showStats() {
  uni.showToast({
    title: '统计功能开发中',
    icon: 'none',
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
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fbfd 0%, #f0f6f9 100%);
  padding-bottom: 120rpx;
}

/* 日期栏 */
.date-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32rpx;
  padding: 24rpx;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10rpx);
}

.date-btn {
  width: 56rpx;
  height: 56rpx;
  border: none;
  background: transparent;
  font-size: 36rpx;
  color: #666;
  padding: 0;
}

.date-btn::after { border: none; }

.date-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  min-width: 140rpx;
  text-align: center;
}

/* 目标信息 */
.goal-info {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  background: rgba(255, 255, 255, 0.9);
  border-top: 1rpx solid rgba(240, 246, 249, 0.8);
}

.goal-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.goal-label {
  font-size: 24rpx;
  color: #999;
}

.goal-value {
  font-size: 28rpx;
  font-weight: 600;
  color: #4a90e2;
}

.goal-adjust {
  padding: 12rpx 28rpx;
  border: none;
  background: rgba(74, 144, 226, 0.1);
  border-radius: 40rpx;
  font-size: 24rpx;
  color: #4a90e2;
}

.goal-adjust::after { border: none; }

/* 水杯区域 */
.cup-area {
  position: relative;
  padding: 60rpx 32rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.cup-wrapper {
  position: relative;
  width: 420rpx;
  height: 600rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.cup-image {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
}

.water-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, #f8fbfd 0%, #f0f6f9 100%);
  transition: height 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}

.amount-display {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: baseline;
  gap: 8rpx;
  z-index: 10;
}

.amount-number {
  font-size: 100rpx;
  font-weight: 800;
  color: #2d7ab8;
  text-shadow: 0 2rpx 8rpx rgba(255, 255, 255, 0.9);
}

.amount-unit {
  font-size: 32rpx;
  color: #5a9fd8;
}

.amount-progress {
  font-size: 28rpx;
  color: #7eb4dd;
}

/* 快捷饮品 */
.quick-drink {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin: 0 32rpx 24rpx;
  padding: 24rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(74, 144, 226, 0.06);
}

.drink-icon {
  width: 64rpx;
  height: 64rpx;
}

.drink-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.drink-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.drink-volume {
  font-size: 24rpx;
  color: #999;
}

/* 操作按钮组 */
.action-group {
  padding: 0 32rpx 24rpx;
}

.action-quick {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 24rpx;
  border: none;
  background: rgba(74, 144, 226, 0.08);
  border-radius: 24rpx;
  font-size: 28rpx;
  color: #4a90e2;
  font-weight: 600;
}

.action-quick::after { border: none; }

.action-icon {
  font-size: 32rpx;
}

/* 主操作按钮 */
.main-actions {
  display: flex;
  gap: 16rpx;
  padding: 0 32rpx 32rpx;
}

.btn-record {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 28rpx;
  border: none;
  background: linear-gradient(135deg, #5fb7ff 0%, #4a90e2 100%);
  border-radius: 50rpx;
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  box-shadow: 
    0 8rpx 24rpx rgba(74, 144, 226, 0.3),
    0 4rpx 12rpx rgba(74, 144, 226, 0.2);
}

.btn-record::after { border: none; }

.btn-icon {
  width: 48rpx;
  height: 48rpx;
  filter: brightness(0) invert(1);
}

.btn-stats {
  padding: 28rpx 48rpx;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50rpx;
  color: #666;
  font-size: 28rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.btn-stats::after { border: none; }

/* 记录区域 */
.records-section {
  padding: 0 32rpx;
}

.records-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.title-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.title-edit {
  padding: 8rpx 24rpx;
  border: none;
  background: rgba(74, 144, 226, 0.08);
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #4a90e2;
}

.title-edit::after { border: none; }

.records-empty {
  text-align: center;
  padding: 80rpx 20rpx;
  color: #999;
  font-size: 26rpx;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.record-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(74, 144, 226, 0.06);
}

.record-emoji {
  font-size: 40rpx;
}

.record-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.record-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.record-time {
  font-size: 24rpx;
  color: #999;
}

.record-amount {
  font-size: 32rpx;
  font-weight: 600;
  color: #4a90e2;
}

.record-delete {
  padding: 8rpx 20rpx;
  border: none;
  background: rgba(255, 77, 79, 0.1);
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #ff4d4f;
}

.record-delete::after { border: none; }

/* 弹窗 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.dialog-content {
  width: 100%;
  background: #fff;
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
  font-weight: 600;
  color: #333;
}

.dialog-close {
  width: 48rpx;
  height: 48rpx;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  font-size: 28rpx;
  color: #999;
  padding: 0;
}

.dialog-close::after { border: none; }

.input-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 12rpx;
  padding: 32rpx;
}

.input-number {
  font-size: 120rpx;
  font-weight: 800;
  color: #333;
}

.input-unit {
  font-size: 40rpx;
  color: #999;
}

.drink-types {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.drink-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 24rpx;
  border: 2rpx solid #e8e8e8;
  background: #fff;
  border-radius: 20rpx;
}

.drink-option::after { border: none; }

.drink-option.active {
  border-color: #4a90e2;
  background: rgba(74, 144, 226, 0.05);
}

.option-icon {
  font-size: 48rpx;
}

.option-name {
  font-size: 24rpx;
  color: #666;
}

.drink-option.active .option-name {
  color: #4a90e2;
  font-weight: 600;
}

.number-pad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.pad-key {
  height: 100rpx;
  border: none;
  background: #f5f5f5;
  border-radius: 20rpx;
  font-size: 40rpx;
  color: #333;
  font-weight: 500;
}

.pad-key::after { border: none; }

.dialog-confirm {
  width: 100%;
  padding: 32rpx;
  border: none;
  background: linear-gradient(135deg, #5fb7ff 0%, #4a90e2 100%);
  border-radius: 50rpx;
  color: #fff;
  font-size: 36rpx;
  font-weight: 700;
  box-shadow: 0 8rpx 24rpx rgba(74, 144, 226, 0.3);
}

.dialog-confirm::after { border: none; }
</style>
