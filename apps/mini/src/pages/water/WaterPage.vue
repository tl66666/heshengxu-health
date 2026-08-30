<template>
  <view class="page">
    <AppNavBar title="喝水记录" route="/pages/water/WaterPage" />

    <!-- 日期切换 -->
    <view class="date-nav">
      <button class="nav-arrow" @tap="prevDay">
        <text>‹</text>
      </button>
      <text class="date-label">{{ dateLabel }}</text>
      <button class="nav-arrow" @tap="nextDay">
        <text>›</text>
      </button>
    </view>

    <!-- 目标和进度 -->
    <view class="goal-bar">
      <view class="goal-item">
        <text class="goal-name">每日目标</text>
        <text class="goal-val">{{ dailyGoal }}ml</text>
      </view>
      <view class="goal-item">
        <text class="goal-name">剩余</text>
        <text class="goal-val">{{ remainingAmount }}ml</text>
      </view>
      <button class="goal-edit" @tap="editGoal">
        <text>调整</text>
      </button>
    </view>

    <!-- 水杯容器 -->
    <view class="cup-container">
      <!-- 水杯外框 -->
      <view class="water-cup">
        <!-- 水位 -->
        <view class="water-fill" :style="{ height: waterHeight + '%' }">
          <view class="water-wave"></view>
        </view>
        
        <!-- 显示数字 -->
        <view class="water-amount-display">
          <text class="amount-num">{{ totalAmount }}</text>
          <text class="amount-unit">ml</text>
          <text class="amount-percent">({{ progressPercent }}%)</text>
        </view>
      </view>
    </view>

    <!-- 快捷记录 -->
    <view class="quick-add">
      <view class="quick-drink">
        <text class="drink-icon">💧</text>
        <view class="drink-info">
          <text class="drink-name">水</text>
          <text class="drink-amount">200ml</text>
        </view>
      </view>
    </view>

    <!-- 添加记录弹窗触发 -->
    <view class="add-section">
      <button class="add-quick-btn" @tap="quickAdd(200)">
        <text class="add-icon">+</text>
        <text class="add-text">快速记录</text>
      </button>
    </view>

    <!-- 记录喝水按钮 -->
    <view class="bottom-actions">
      <button class="record-btn" @tap="showAddDialog">
        <text class="record-icon">💧</text>
        <text class="record-text">记录喝水</text>
      </button>
      <button class="stat-btn" @tap="showStats">
        <text>统计</text>
      </button>
    </view>

    <!-- 今日记录 -->
    <view class="records-area">
      <view class="records-head">
        <text class="records-title">💧 今日喝水 ({{ records.length }}次)</text>
        <button v-if="records.length > 0" class="records-edit" @tap="editMode = !editMode">
          <text>{{ editMode ? '完成' : '编辑' }}</text>
        </button>
      </view>

      <view v-if="records.length === 0" class="records-empty">
        <text class="empty-tip">还没有喝水吗？来一杯吧～</text>
      </view>

      <view v-else class="records-list">
        <view 
          v-for="record in records" 
          :key="record.id"
          class="record-item"
        >
          <text class="record-icon">💧</text>
          <view class="record-detail">
            <text class="record-type">水</text>
            <text class="record-time">{{ formatTime(record.timestamp) }}</text>
          </view>
          <text class="record-amt">{{ record.amount }}ml</text>
          <button v-if="editMode" class="record-del" @tap="deleteRecord(record.id)">
            <text>删除</text>
          </button>
        </view>
      </view>
    </view>

    <!-- 添加喝水弹窗 -->
    <view v-if="showDialog" class="dialog-mask" @tap="hideDialog">
      <view class="dialog-box" @tap.stop>
        <view class="dialog-head">
          <text class="dialog-title">设置快捷记录</text>
          <button class="dialog-close" @tap="hideDialog">
            <text>✕</text>
          </button>
        </view>

        <view class="dialog-body">
          <!-- 数量输入 -->
          <view class="amount-display">
            <text class="amount-big">{{ inputAmount }}</text>
            <text class="amount-unit-big">ml</text>
          </view>

          <!-- 饮品选择 -->
          <view class="drink-types">
            <button 
              v-for="drink in drinkTypes" 
              :key="drink.id"
              :class="['drink-type', selectedDrink === drink.id ? 'active' : '']"
              @tap="selectedDrink = drink.id"
            >
              <text class="drink-emoji">{{ drink.icon }}</text>
              <text class="drink-label">{{ drink.name }}</text>
            </button>
          </view>

          <!-- 数字键盘 -->
          <view class="num-pad">
            <button 
              v-for="num in [1,2,3,4,5,6,7,8,9,0,'00','⌫']" 
              :key="num"
              class="num-btn"
              @tap="handleNum(num)"
            >
              <text>{{ num }}</text>
            </button>
          </view>

          <!-- 确定按钮 -->
          <button class="dialog-confirm" @tap="confirmAdd">
            <text>完成</text>
          </button>
        </view>
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
  timestamp: number;
}

const currentDate = ref(new Date());
const dailyGoal = ref(2000);
const records = ref<WaterRecord[]>([]);
const editMode = ref(false);
const showDialog = ref(false);
const inputAmount = ref('200');
const selectedDrink = ref('water');

const drinkTypes = [
  { id: 'water', name: '水', icon: '💧' },
  { id: 'tea', name: '茶水', icon: '🍵' },
  { id: 'milk', name: '牛奶', icon: '🥛' },
  { id: 'coffee', name: '咖啡', icon: '☕' },
  { id: 'juice', name: '果汁', icon: '🧃' },
  { id: 'soda', name: '苏打水', icon: '🥤' },
];

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
  addRecord(amount);
}

function showAddDialog() {
  inputAmount.value = '200';
  selectedDrink.value = 'water';
  showDialog.value = true;
}

function hideDialog() {
  showDialog.value = false;
}

function handleNum(val: number | string) {
  if (val === '⌫') {
    inputAmount.value = inputAmount.value.slice(0, -1) || '0';
  } else {
    if (inputAmount.value === '0') {
      inputAmount.value = String(val);
    } else {
      inputAmount.value += String(val);
    }
  }
}

function confirmAdd() {
  const amt = parseInt(inputAmount.value);
  if (amt > 0) {
    addRecord(amt);
    hideDialog();
  }
}

function addRecord(amount: number) {
  const record: WaterRecord = {
    id: Date.now().toString(),
    amount,
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
  background: #f7f8fa;
  padding-bottom: 120rpx;
}

/* 日期导航 */
.date-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32rpx;
  padding: 24rpx;
  background: #fff;
}

.nav-arrow {
  width: 56rpx;
  height: 56rpx;
  border: none;
  background: transparent;
  font-size: 40rpx;
  color: #666;
  padding: 0;
  line-height: 1;
}

.nav-arrow::after { border: none; }

.date-label {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  min-width: 140rpx;
  text-align: center;
}

/* 目标栏 */
.goal-bar {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  background: #fff;
  border-top: 1rpx solid #f0f0f0;
}

.goal-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.goal-name {
  font-size: 24rpx;
  color: #999;
}

.goal-val {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.goal-edit {
  padding: 12rpx 28rpx;
  border: none;
  background: #f5f5f5;
  border-radius: 40rpx;
  font-size: 24rpx;
  color: #666;
}

.goal-edit::after { border: none; }

/* 水杯容器 */
.cup-container {
  padding: 60rpx 32rpx;
  display: flex;
  justify-content: center;
  background: #fff;
}

.water-cup {
  position: relative;
  width: 460rpx;
  height: 680rpx;
  background: linear-gradient(180deg, #f5f5f5 0%, #e8e8e8 100%);
  border-radius: 32rpx;
  overflow: hidden;
  box-shadow: 
    inset 0 4rpx 12rpx rgba(0,0,0,0.06),
    0 8rpx 24rpx rgba(0,0,0,0.08);
}

.water-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, #a8d8ff 0%, #4a90e2 100%);
  transition: height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 0 0 32rpx 32rpx;
}

.water-wave {
  position: absolute;
  top: -20rpx;
  left: -100%;
  width: 200%;
  height: 40rpx;
  background: linear-gradient(90deg, 
    transparent,
    rgba(255,255,255,0.3) 50%,
    transparent
  );
  animation: wave 3s linear infinite;
}

@keyframes wave {
  to {
    transform: translateX(50%);
  }
}

.water-amount-display {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: baseline;
  gap: 8rpx;
  z-index: 10;
}

.amount-num {
  font-size: 100rpx;
  font-weight: 800;
  color: #2d7ab8;
  text-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
}

.amount-unit {
  font-size: 32rpx;
  color: #5a9fd8;
}

.amount-percent {
  font-size: 28rpx;
  color: #7eb4dd;
}

/* 快捷记录 */
.quick-add {
  padding: 32rpx;
  background: #fff;
}

.quick-drink {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx;
  background: #f8f9fa;
  border-radius: 20rpx;
}

.drink-icon {
  font-size: 48rpx;
}

.drink-info {
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

.drink-amount {
  font-size: 24rpx;
  color: #999;
}

/* 快速添加 */
.add-section {
  padding: 0 32rpx 32rpx;
  background: #fff;
}

.add-quick-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 24rpx;
  border: none;
  background: #f0f8ff;
  border-radius: 20rpx;
  color: #4a90e2;
  font-size: 28rpx;
  font-weight: 600;
}

.add-quick-btn::after { border: none; }

.add-icon {
  font-size: 32rpx;
}

/* 底部按钮 */
.bottom-actions {
  display: flex;
  gap: 16rpx;
  padding: 32rpx;
  background: #fff;
}

.record-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 28rpx;
  border: none;
  background: linear-gradient(135deg, #4a90e2 0%, #5fb7ff 100%);
  border-radius: 50rpx;
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  box-shadow: 0 6rpx 20rpx rgba(74,144,226,0.3);
}

.record-btn::after { border: none; }

.record-icon {
  font-size: 36rpx;
}

.stat-btn {
  padding: 28rpx 48rpx;
  border: none;
  background: #f5f5f5;
  border-radius: 50rpx;
  color: #666;
  font-size: 28rpx;
}

.stat-btn::after { border: none; }

/* 记录列表 */
.records-area {
  padding: 32rpx;
}

.records-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.records-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.records-edit {
  padding: 8rpx 24rpx;
  border: none;
  background: #f5f5f5;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #666;
}

.records-edit::after { border: none; }

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

.record-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
}

.record-icon {
  font-size: 36rpx;
}

.record-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.record-type {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.record-time {
  font-size: 24rpx;
  color: #999;
}

.record-amt {
  font-size: 32rpx;
  font-weight: 600;
  color: #4a90e2;
}

.record-del {
  padding: 8rpx 20rpx;
  border: none;
  background: #ffe5e5;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #ff4d4f;
}

.record-del::after { border: none; }

/* 弹窗 */
.dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.dialog-box {
  width: 100%;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 40rpx 32rpx;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}

.dialog-head {
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
  line-height: 1;
}

.dialog-close::after { border: none; }

.dialog-body {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.amount-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 12rpx;
  padding: 32rpx;
}

.amount-big {
  font-size: 120rpx;
  font-weight: 800;
  color: #333;
}

.amount-unit-big {
  font-size: 40rpx;
  color: #999;
}

.drink-types {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.drink-type {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 24rpx;
  border: 2rpx solid #e8e8e8;
  background: #fff;
  border-radius: 20rpx;
}

.drink-type::after { border: none; }

.drink-type.active {
  border-color: #4a90e2;
  background: #f0f8ff;
}

.drink-emoji {
  font-size: 48rpx;
}

.drink-label {
  font-size: 24rpx;
  color: #666;
}

.drink-type.active .drink-label {
  color: #4a90e2;
  font-weight: 600;
}

.num-pad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.num-btn {
  height: 100rpx;
  border: none;
  background: #f5f5f5;
  border-radius: 20rpx;
  font-size: 40rpx;
  color: #333;
  font-weight: 500;
}

.num-btn::after { border: none; }

.dialog-confirm {
  width: 100%;
  padding: 32rpx;
  border: none;
  background: linear-gradient(135deg, #4a90e2 0%, #5fb7ff 100%);
  border-radius: 50rpx;
  color: #fff;
  font-size: 36rpx;
  font-weight: 700;
  box-shadow: 0 8rpx 24rpx rgba(74,144,226,0.3);
}

.dialog-confirm::after { border: none; }
</style>
