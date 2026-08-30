<template>
  <view class="page">
    <AppNavBar title="喝水记录" route="/pages/water/WaterPage" />

    <!-- 日期切换 -->
    <view class="date-bar">
      <button class="date-btn" @tap="prevDay">
        <text>←</text>
      </button>
      <text class="date-text">{{ dateLabel }}</text>
      <button class="date-btn" @tap="nextDay">
        <text>→</text>
      </button>
    </view>

    <!-- 喝水统计卡片 -->
    <view class="stat-card">
      <view class="stat-main">
        <image class="water-icon" src="/static/icons/svg/water.svg" mode="aspectFit" />
        <view class="stat-info">
          <text class="stat-current">{{ totalAmount }}</text>
          <text class="stat-unit">ml</text>
          <text class="stat-target">/ {{ dailyGoal }}ml</text>
        </view>
      </view>
      
      <view class="stat-progress">
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: progressPercent + '%' }" />
        </view>
        <text class="progress-text">{{ progressPercent }}%</text>
      </view>
      
      <button class="stat-edit" @tap="editGoal">
        <text>调整目标</text>
      </button>
    </view>

    <!-- 快捷添加 -->
    <view class="quick-section">
      <view class="quick-title">
        <text>快速记录</text>
      </view>
      <view class="quick-btns">
        <button 
          v-for="item in quickItems" 
          :key="item.amount"
          class="quick-item"
          @tap="addWater(item.amount, 'water')"
        >
          <text class="quick-icon">💧</text>
          <text class="quick-label">{{ item.amount }}ml</text>
        </button>
        <button class="quick-item custom" @tap="showCustomInput">
          <text class="quick-icon">✏️</text>
          <text class="quick-label">自定义</text>
        </button>
      </view>
    </view>

    <!-- 今日记录列表 -->
    <view class="records-section">
      <view class="records-header">
        <text class="records-title">今日记录</text>
        <text class="records-count">({{ records.length }}次)</text>
      </view>

      <view v-if="records.length === 0" class="empty">
        <text class="empty-icon">🥤</text>
        <text class="empty-text">还没有记录，点击上方快速添加吧</text>
      </view>

      <view v-else class="records-list">
        <view 
          v-for="record in records" 
          :key="record.id"
          class="record-row"
        >
          <view class="record-left">
            <text class="record-icon">💧</text>
            <view class="record-info">
              <text class="record-name">水</text>
              <text class="record-time">{{ formatTime(record.timestamp) }}</text>
            </view>
          </view>
          <view class="record-right">
            <text class="record-amount">{{ record.amount }}ml</text>
            <button class="record-del" @tap="deleteRecord(record.id)">
              <text>×</text>
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- 自定义输入弹窗 -->
    <view v-if="showInput" class="modal" @tap="hideCustomInput">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">添加喝水记录</text>
          <button class="modal-close" @tap="hideCustomInput">
            <text>×</text>
          </button>
        </view>
        
        <view class="input-section">
          <input 
            class="amount-input" 
            type="number" 
            v-model="customAmount" 
            placeholder="请输入毫升数"
          />
          <text class="input-unit">ml</text>
        </view>

        <view class="preset-amounts">
          <button 
            v-for="amt in [100, 200, 250, 300, 500]" 
            :key="amt"
            class="preset-btn"
            @tap="customAmount = amt"
          >
            {{ amt }}
          </button>
        </view>

        <button class="modal-confirm" @tap="confirmCustom">
          <text>确定</text>
        </button>
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
  type: string;
  timestamp: number;
}

const currentDate = ref(new Date());
const dailyGoal = ref(2000);
const records = ref<WaterRecord[]>([]);
const showInput = ref(false);
const customAmount = ref<number | string>('');

const quickItems = [
  { amount: 100 },
  { amount: 200 },
  { amount: 250 },
  { amount: 300 },
  { amount: 500 },
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

const progressPercent = computed(() => {
  const percent = Math.round((totalAmount.value / dailyGoal.value) * 100);
  return Math.min(percent, 100);
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
          saveGoal();
        }
      }
    },
  });
}

function addWater(amount: number, type: string) {
  const record: WaterRecord = {
    id: Date.now().toString(),
    amount,
    type,
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

function showCustomInput() {
  customAmount.value = '';
  showInput.value = true;
}

function hideCustomInput() {
  showInput.value = false;
}

function confirmCustom() {
  const amt = parseInt(String(customAmount.value));
  if (!amt || amt <= 0) {
    uni.showToast({
      title: '请输入有效数字',
      icon: 'none',
    });
    return;
  }
  
  addWater(amt, 'water');
  hideCustomInput();
}

function deleteRecord(id: string) {
  uni.showModal({
    title: '删除记录',
    content: '确定要删除这条记录吗？',
    success: (res) => {
      if (res.confirm) {
        records.value = records.value.filter(r => r.id !== id);
        saveRecords();
        uni.showToast({
          title: '已删除',
          icon: 'success',
        });
      }
    },
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
  return `water_${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
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

function saveGoal() {
  uni.setStorageSync('water_daily_goal', dailyGoal.value);
}

function loadGoal() {
  try {
    const goal = uni.getStorageSync('water_daily_goal');
    if (goal) dailyGoal.value = goal;
  } catch (e) {
    // ignore
  }
}

onMounted(() => {
  loadGoal();
  loadRecords();
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f8f6;
  padding-bottom: 40rpx;
}

/* 日期栏 */
.date-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40rpx;
  padding: 24rpx;
  background: #fff;
}

.date-btn {
  width: 60rpx;
  height: 60rpx;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  font-size: 28rpx;
  color: #666;
  padding: 0;
  line-height: 1;
}

.date-btn::after { border: none; }

.date-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  min-width: 160rpx;
  text-align: center;
}

/* 统计卡片 */
.stat-card {
  margin: 24rpx 32rpx;
  padding: 32rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
}

.stat-main {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 24rpx;
}

.water-icon {
  width: 80rpx;
  height: 80rpx;
}

.stat-info {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.stat-current {
  font-size: 56rpx;
  font-weight: 700;
  color: #4a90e2;
}

.stat-unit {
  font-size: 24rpx;
  color: #999;
}

.stat-target {
  font-size: 28rpx;
  color: #666;
}

.stat-progress {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.progress-bar {
  flex: 1;
  height: 16rpx;
  background: #e8f4fd;
  border-radius: 8rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4a90e2 0%, #5fb7ff 100%);
  border-radius: 8rpx;
  transition: width 0.3s;
}

.progress-text {
  font-size: 24rpx;
  color: #4a90e2;
  font-weight: 600;
  min-width: 80rpx;
  text-align: right;
}

.stat-edit {
  width: 100%;
  padding: 20rpx;
  border: none;
  background: #f5f8fa;
  border-radius: 16rpx;
  color: #666;
  font-size: 28rpx;
}

.stat-edit::after { border: none; }

/* 快捷记录 */
.quick-section {
  margin: 0 32rpx 24rpx;
}

.quick-title {
  padding: 24rpx 0 16rpx;
  font-size: 28rpx;
  color: #666;
}

.quick-btns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 28rpx;
  background: #fff;
  border-radius: 20rpx;
  border: none;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
}

.quick-item::after { border: none; }

.quick-item.custom {
  background: #f5f8fa;
}

.quick-icon {
  font-size: 40rpx;
}

.quick-label {
  font-size: 26rpx;
  color: #666;
  font-weight: 500;
}

/* 记录列表 */
.records-section {
  margin: 0 32rpx;
}

.records-header {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
  padding: 24rpx 0 16rpx;
}

.records-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.records-count {
  font-size: 24rpx;
  color: #999;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 20rpx;
  background: #fff;
  border-radius: 20rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 26rpx;
  color: #999;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.record-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  background: #fff;
  border-radius: 20rpx;
}

.record-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.record-icon {
  font-size: 40rpx;
}

.record-info {
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

.record-right {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.record-amount {
  font-size: 32rpx;
  font-weight: 600;
  color: #4a90e2;
}

.record-del {
  width: 48rpx;
  height: 48rpx;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  font-size: 32rpx;
  color: #999;
  padding: 0;
  line-height: 1;
}

.record-del::after { border: none; }

/* 弹窗 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 600rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32rpx;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.modal-close {
  width: 48rpx;
  height: 48rpx;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  font-size: 32rpx;
  color: #999;
  padding: 0;
  line-height: 1;
}

.modal-close::after { border: none; }

.input-section {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.amount-input {
  flex: 1;
  padding: 20rpx 24rpx;
  background: #f5f8fa;
  border-radius: 16rpx;
  font-size: 32rpx;
  text-align: center;
}

.input-unit {
  font-size: 28rpx;
  color: #999;
}

.preset-amounts {
  display: flex;
  gap: 12rpx;
  margin-bottom: 32rpx;
}

.preset-btn {
  flex: 1;
  padding: 16rpx;
  border: none;
  background: #f5f8fa;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #666;
}

.preset-btn::after { border: none; }

.modal-confirm {
  width: 100%;
  padding: 24rpx;
  border: none;
  background: linear-gradient(135deg, #4a90e2 0%, #5fb7ff 100%);
  border-radius: 16rpx;
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
}

.modal-confirm::after { border: none; }
</style>
