<template>
  <view class="water-page">
    <!-- 自定义导航栏 -->
    <view class="nav-bar">
      <button class="nav-back-btn" @tap="goBack">
        <text class="back-arrow">←</text>
      </button>
      <text class="nav-title">喝水记录</text>
      <view class="nav-space"></view>
    </view>

    <!-- 日期选择 -->
    <view class="date-section">
      <button class="date-btn" @tap="prevDay">‹</button>
      <text class="date-text">{{ dateLabel }}</text>
      <button class="date-btn" @tap="nextDay">›</button>
    </view>

    <!-- 目标信息卡片 -->
    <view class="goal-section">
      <view class="goal-row">
        <view class="goal-box">
          <text class="goal-label">每日目标</text>
          <text class="goal-number">{{ dailyGoal }}ml</text>
        </view>
        <view class="goal-box">
          <text class="goal-label">剩余</text>
          <text class="goal-number remaining">{{ remainingAmount }}ml</text>
        </view>
      </view>
      <button class="adjust-goal-btn" @tap="editGoal">调整目标</button>
    </view>

    <!-- 进度徽章 -->
    <view class="progress-indicator">
      <text class="progress-text">{{ progressPercent }}%</text>
    </view>

    <!-- 水杯展示区域 -->
    <view class="cup-section">
      <view class="cup-wrapper">
        <!-- 水杯图片（放大） -->
        <image 
          class="cup-image" 
          src="/static/illustrations/water-cup-empty.png" 
          mode="aspectFit"
        />
        
        <!-- 水位（用clip-path裁剪成杯子形状） -->
        <view class="water-fill" :style="{ height: waterHeight + '%' }">
          <image 
            class="water-image" 
            src="/static/illustrations/water-ripple-texture.png" 
            mode="aspectFill"
          />
        </view>
        
        <!-- 数字显示 -->
        <view class="water-amount">
          <text class="amount-value">{{ totalAmount }}</text>
          <text class="amount-unit">ml</text>
        </view>
      </view>
    </view>

    <!-- 快捷记录 -->
    <view class="quick-section">
      <view class="section-title">
        <image class="title-icon" src="/static/icons/watercolor/water-drop.jpg" mode="aspectFit" />
        <text class="title-text">快速记录</text>
      </view>
      
      <view class="quick-grid">
        <button 
          v-for="amt in quickAmounts" 
          :key="amt"
          class="quick-item"
          @tap="quickAdd(amt)"
        >
          <image class="item-icon" src="/static/icons/watercolor/water-drop.jpg" mode="aspectFit" />
          <text class="item-text">{{ amt }}ml</text>
        </button>
      </view>
    </view>

    <!-- 记录喝水按钮 -->
    <view class="action-section">
      <button class="record-water-btn" @tap="openDialog">
        <image class="btn-icon" src="/static/icons/watercolor/water-drop.jpg" mode="aspectFit" />
        <text class="btn-label">记录喝水</text>
      </button>
    </view>

    <!-- 今日记录 -->
    <view class="history-section">
      <view class="history-header">
        <image class="header-icon" src="/static/icons/watercolor/water-drop.jpg" mode="aspectFit" />
        <text class="header-title">今日记录</text>
        <text class="header-count">({{ records.length }}次)</text>
        <button v-if="records.length > 0" class="header-edit" @tap="toggleEdit">
          {{ editMode ? '完成' : '编辑' }}
        </button>
      </view>

      <view v-if="records.length === 0" class="history-empty">
        <text class="empty-emoji">🥤</text>
        <text class="empty-tip">还没有记录哦，快来喝一杯吧～</text>
      </view>

      <view v-else class="history-list">
        <view 
          v-for="record in records" 
          :key="record.id"
          class="history-item"
        >
          <image class="item-img" src="/static/icons/watercolor/water-drop.jpg" mode="aspectFit" />
          <view class="item-content">
            <text class="item-name">{{ getDrinkName(record.drinkType) }}</text>
            <text class="item-time">{{ formatTime(record.timestamp) }}</text>
          </view>
          <text class="item-amount">{{ record.amount }}ml</text>
          <button v-if="editMode" class="item-delete" @tap="deleteRecord(record.id)">
            删除
          </button>
        </view>
      </view>
    </view>

    <!-- 添加弹窗 -->
    <view v-if="dialogVisible" class="modal-mask" @tap="closeDialog">
      <view class="modal-box" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">添加饮水记录</text>
          <button class="modal-close" @tap="closeDialog">✕</button>
        </view>

        <view class="modal-body">
          <!-- 输入显示 -->
          <view class="input-show">
            <text class="show-value">{{ inputAmount }}</text>
            <text class="show-unit">ml</text>
          </view>

          <!-- 饮品选择 -->
          <view class="drink-grid">
            <button 
              v-for="drink in drinkOptions" 
              :key="drink.id"
              :class="['drink-item', selectedDrink === drink.id ? 'active' : '']"
              @tap="selectedDrink = drink.id"
            >
              <text class="drink-emoji">{{ drink.icon }}</text>
              <text class="drink-label">{{ drink.name }}</text>
            </button>
          </view>

          <!-- 数字键盘 -->
          <view class="keyboard">
            <button 
              v-for="key in numberKeys" 
              :key="key"
              class="key"
              @tap="handleKey(key)"
            >
              {{ key }}
            </button>
          </view>

          <!-- 确定 -->
          <button class="modal-confirm" @tap="confirmAdd">完成</button>
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
  background: linear-gradient(180deg, #fef9f5 0%, #f9f4ef 50%, #f5f0eb 100%);
  padding-bottom: 120rpx;
}

/* 导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 32rpx;
  padding-top: calc(20rpx + env(safe-area-inset-top));
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20rpx);
  border-bottom: 1rpx solid rgba(245, 240, 235, 0.6);
}

.nav-back-btn {
  width: 60rpx;
  height: 60rpx;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 40rpx;
  color: #8b7355;
  line-height: 1;
}

.nav-back-btn::after { border: none; }

.nav-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #5d4a3a;
}

.nav-space {
  width: 60rpx;
}

/* 日期 */
.date-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28rpx;
  padding: 28rpx;
  background: rgba(255, 255, 255, 0.7);
}

.date-btn {
  width: 52rpx;
  height: 52rpx;
  padding: 0;
  border: none;
  background: rgba(215, 196, 180, 0.15);
  border-radius: 50%;
  font-size: 32rpx;
  color: #a89080;
  line-height: 1;
}

.date-btn::after { border: none; }

.date-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #6d5a47;
  min-width: 130rpx;
  text-align: center;
}

/* 目标 */
.goal-section {
  margin: 24rpx 32rpx;
  padding: 28rpx;
  background: #ffffff;
  border-radius: 28rpx;
  box-shadow: 0 8rpx 24rpx rgba(139, 115, 85, 0.06);
}

.goal-row {
  display: flex;
  margin-bottom: 24rpx;
}

.goal-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.goal-label {
  font-size: 24rpx;
  color: #b5a090;
}

.goal-number {
  font-size: 36rpx;
  font-weight: 800;
  color: #8fa898;
}

.goal-number.remaining {
  color: #b8c9a8;
}

.adjust-goal-btn {
  width: 100%;
  padding: 20rpx;
  border: none;
  background: linear-gradient(135deg, #f0ebe5 0%, #ebe4db 100%);
  border-radius: 16rpx;
  font-size: 26rpx;
  color: #8b7355;
  font-weight: 600;
}

.adjust-goal-btn::after { border: none; }

/* 进度徽章 */
.progress-indicator {
  position: absolute;
  top: 320rpx;
  right: 60rpx;
  padding: 12rpx 24rpx;
  background: rgba(184, 201, 168, 0.2);
  border-radius: 40rpx;
  backdrop-filter: blur(10rpx);
  z-index: 10;
}

.progress-text {
  font-size: 24rpx;
  font-weight: 700;
  color: #8fa898;
}

/* 水杯区域 */
.cup-section {
  padding: 40rpx 32rpx 60rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.cup-wrapper {
  position: relative;
  width: 520rpx;
  height: 680rpx;
}

.cup-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

.water-fill {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 85%;
  max-height: 88%;
  overflow: hidden;
  transition: height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 1;
  border-radius: 0 0 40rpx 40rpx;
}

.water-image {
  width: 100%;
  height: 680rpx;
  position: absolute;
  bottom: 0;
  left: 0;
  object-fit: cover;
}

.water-amount {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: baseline;
  gap: 10rpx;
  z-index: 3;
}

.amount-value {
  font-size: 110rpx;
  font-weight: 900;
  color: #5d7a6a;
  text-shadow: 0 4rpx 12rpx rgba(255, 255, 255, 0.8);
}

.amount-unit {
  font-size: 36rpx;
  color: #8fa898;
}

/* 快捷记录 */
.quick-section {
  margin: 0 32rpx 28rpx;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.title-icon {
  width: 36rpx;
  height: 36rpx;
  border-radius: 8rpx;
}

.title-text {
  font-size: 28rpx;
  font-weight: 700;
  color: #6d5a47;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14rpx;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  padding: 22rpx 10rpx;
  border: none;
  background: #ffffff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(139, 115, 85, 0.04);
}

.quick-item::after { border: none; }

.item-icon {
  width: 36rpx;
  height: 36rpx;
  border-radius: 6rpx;
}

.item-text {
  font-size: 22rpx;
  color: #8fa898;
  font-weight: 600;
}

/* 记录按钮 */
.action-section {
  padding: 0 32rpx 32rpx;
}

.record-water-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: 32rpx;
  border: none;
  background: linear-gradient(135deg, #a8c9a1 0%, #8fa898 100%);
  border-radius: 60rpx;
  box-shadow: 0 12rpx 32rpx rgba(143, 168, 152, 0.3);
}

.record-water-btn::after { border: none; }

.btn-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 8rpx;
  filter: brightness(1.2);
}

.btn-label {
  font-size: 32rpx;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 2rpx;
}

/* 历史记录 */
.history-section {
  padding: 0 32rpx;
}

.history-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.header-icon {
  width: 32rpx;
  height: 32rpx;
  border-radius: 6rpx;
}

.header-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #6d5a47;
}

.header-count {
  font-size: 24rpx;
  color: #b5a090;
  margin-right: auto;
}

.header-edit {
  padding: 10rpx 24rpx;
  border: none;
  background: rgba(215, 196, 180, 0.15);
  border-radius: 24rpx;
  font-size: 24rpx;
  color: #8b7355;
}

.header-edit::after { border: none; }

.history-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 20rpx;
  background: #ffffff;
  border-radius: 24rpx;
}

.empty-emoji {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-tip {
  font-size: 26rpx;
  color: #b5a090;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx;
  background: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(139, 115, 85, 0.04);
}

.item-img {
  width: 48rpx;
  height: 48rpx;
  border-radius: 8rpx;
  flex-shrink: 0;
}

.item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.item-name {
  font-size: 28rpx;
  color: #6d5a47;
  font-weight: 600;
}

.item-time {
  font-size: 24rpx;
  color: #b5a090;
}

.item-amount {
  font-size: 32rpx;
  font-weight: 800;
  color: #8fa898;
}

.item-delete {
  padding: 10rpx 20rpx;
  border: none;
  background: rgba(232, 155, 143, 0.12);
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #d48873;
}

.item-delete::after { border: none; }

/* 弹窗 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(93, 74, 58, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.modal-box {
  width: 100%;
  background: #ffffff;
  border-radius: 40rpx 40rpx 0 0;
  padding: 40rpx 32rpx;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 36rpx;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 800;
  color: #5d4a3a;
}

.modal-close {
  width: 52rpx;
  height: 52rpx;
  padding: 0;
  border: none;
  background: rgba(215, 196, 180, 0.15);
  border-radius: 50%;
  font-size: 28rpx;
  color: #8b7355;
  line-height: 1;
}

.modal-close::after { border: none; }

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.input-show {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 12rpx;
  padding: 36rpx;
}

.show-value {
  font-size: 120rpx;
  font-weight: 900;
  color: #5d4a3a;
}

.show-unit {
  font-size: 40rpx;
  color: #b5a090;
}

.drink-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.drink-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 26rpx;
  border: 2rpx solid #f0ebe5;
  background: #ffffff;
  border-radius: 24rpx;
}

.drink-item::after { border: none; }

.drink-item.active {
  border-color: #a8c9a1;
  background: rgba(168, 201, 161, 0.06);
}

.drink-emoji {
  font-size: 48rpx;
}

.drink-label {
  font-size: 24rpx;
  color: #8b7355;
}

.drink-item.active .drink-label {
  color: #6d7a5d;
  font-weight: 700;
}

.keyboard {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.key {
  height: 100rpx;
  border: none;
  background: #f9f6f2;
  border-radius: 20rpx;
  font-size: 40rpx;
  color: #6d5a47;
  font-weight: 600;
}

.key::after { border: none; }

.modal-confirm {
  width: 100%;
  padding: 32rpx;
  border: none;
  background: linear-gradient(135deg, #a8c9a1 0%, #8fa898 100%);
  border-radius: 60rpx;
  color: #ffffff;
  font-size: 36rpx;
  font-weight: 800;
  letter-spacing: 2rpx;
  box-shadow: 0 12rpx 32rpx rgba(143, 168, 152, 0.3);
}

.modal-confirm::after { border: none; }
</style>
