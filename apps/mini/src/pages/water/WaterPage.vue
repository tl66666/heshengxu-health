<template>
  <view class="page">
    <AppNavBar title="喝水记录" route="/pages/water/WaterPage" />

    <!-- 日期切换 -->
    <view class="date-selector">
      <button class="date-arrow" @tap="prevDay">
        <image src="/static/icons/svg/back.svg" mode="aspectFit" />
      </button>
      <text class="date-text">{{ dateLabel }}</text>
      <button class="date-arrow" @tap="nextDay">
        <image src="/static/icons/svg/back.svg" mode="aspectFit" style="transform: rotate(180deg)" />
      </button>
      <button class="date-today" @tap="goToday">
        <image src="/static/icons/svg/calendar.svg" mode="aspectFit" />
      </button>
    </view>

    <!-- 喝水目标和进度 -->
    <view class="water-goal card">
      <view class="goal-header">
        <text class="goal-label">喝水目标</text>
        <text class="goal-value">{{ dailyGoal }}ml</text>
        <text class="goal-remain">剩余 {{ remainingAmount }}ml</text>
        <button class="goal-edit" @tap="editGoal">调整</button>
      </view>
    </view>

    <!-- 水杯动画 -->
    <view class="water-glass-container">
      <view class="glass-wrapper">
        <!-- 玻璃杯 -->
        <view class="glass">
          <!-- 水 -->
          <view 
            class="water" 
            :style="{ 
              height: waterHeight + '%',
              background: waterGradient
            }"
          >
            <!-- 水波动画 -->
            <view class="wave wave1" :style="{ bottom: waterHeight + '%' }" />
            <view class="wave wave2" :style="{ bottom: waterHeight + '%' }" />
          </view>
          
          <!-- 进度文字 -->
          <view class="progress-text">
            <text class="current-amount">{{ totalAmount }}</text>
            <text class="unit">ml</text>
            <text class="progress-percent">({{ progressPercent }}%)</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 快捷记录 -->
    <view class="quick-actions">
      <button 
        v-for="action in quickActions" 
        :key="action.type"
        class="quick-btn"
        @tap="quickAdd(action)"
      >
        <view class="quick-icon">{{ action.icon }}</view>
        <text class="quick-label">{{ action.label }}</text>
        <text class="quick-amount">{{ action.amount }}ml</text>
      </button>
      
      <!-- 添加自定义快捷方式 -->
      <button class="quick-btn add" @tap="addCustomQuick">
        <view class="quick-icon">➕</view>
        <text class="quick-label">添加饮品快捷记录</text>
      </button>
    </view>

    <!-- 今日喝水记录 -->
    <view class="records-section">
      <view class="section-header">
        <text class="section-icon">💧</text>
        <text class="section-title">今日喝水 ({{ records.length }}次)</text>
        <button v-if="records.length > 0" class="section-action" @tap="editRecords">编辑</button>
      </view>

      <view v-if="records.length === 0" class="empty-state">
        <text class="empty-icon">🥤</text>
        <text class="empty-text">还没有喝水吗？来一杯吧～</text>
      </view>

      <view v-else class="records-list">
        <view 
          v-for="(record, index) in records" 
          :key="record.id"
          class="record-item"
        >
          <view class="record-icon">{{ getBeverageIcon(record.type) }}</view>
          <view class="record-info">
            <text class="record-type">{{ getBeverageName(record.type) }}</text>
            <text class="record-time">{{ formatTime(record.timestamp) }}</text>
          </view>
          <text class="record-amount">{{ record.amount }}ml</text>
          <button v-if="editMode" class="record-delete" @tap="deleteRecord(record.id)">
            <image src="/static/icons/svg/close.svg" mode="aspectFit" />
          </button>
        </view>
      </view>
    </view>

    <!-- 底部记录按钮 -->
    <view class="bottom-actions">
      <button class="record-btn" @tap="showRecordDialog">
        <text class="btn-icon">💧</text>
        <text>记录喝水</text>
      </button>
      <button class="stats-btn" @tap="viewStats">
        <image src="/static/icons/svg/chart.svg" mode="aspectFit" />
        <text>统计</text>
      </button>
    </view>

    <!-- 记录弹窗 -->
    <view v-if="recordDialogVisible" class="dialog-mask" @tap="hideRecordDialog">
      <view class="dialog-content" @tap.stop>
        <view class="dialog-header">
          <text class="dialog-title">{{ editingRecord ? '修改饮品快捷记录' : '设置快捷记录' }}</text>
          <button class="dialog-close" @tap="hideRecordDialog">
            <image src="/static/icons/svg/close.svg" mode="aspectFit" />
          </button>
        </view>

        <!-- 数量输入 -->
        <view class="amount-input">
          <text class="amount-value">{{ tempAmount }}</text>
          <text class="amount-unit">ml</text>
        </view>

        <!-- 饮品类型选择 -->
        <view class="beverage-types">
          <button 
            v-for="bev in beverageTypes" 
            :key="bev.type"
            :class="['beverage-btn', { active: tempType === bev.type }]"
            @tap="selectType(bev.type)"
          >
            <text class="beverage-icon">{{ bev.icon }}</text>
            <text class="beverage-name">{{ bev.name }}</text>
          </button>
        </view>

        <!-- 数字键盘 -->
        <view class="number-keyboard">
          <button 
            v-for="num in [1, 2, 3, 4, 5, 6, 7, 8, 9]" 
            :key="num"
            class="key-btn"
            @tap="inputNumber(num)"
          >
            {{ num }}
          </button>
          <button class="key-btn" @tap="inputNumber(0)">0</button>
          <button class="key-btn" @tap="inputNumber('00')">00</button>
          <button class="key-btn delete" @tap="deleteNumber">
            <text>×</text>
          </button>
        </view>

        <!-- 确认按钮 -->
        <button class="confirm-btn" @tap="confirmRecord">
          <text>完成</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import AppNavBar from '../../components/AppNavBar.vue';
import { navigateBack } from '../../utils/router.js';

interface WaterRecord {
  id: string;
  type: string;
  amount: number;
  timestamp: number;
  date: string;
}

interface QuickAction {
  type: string;
  icon: string;
  label: string;
  amount: number;
}

const currentDate = ref(new Date());
const dailyGoal = ref(2000);
const records = ref<WaterRecord[]>([]);
const editMode = ref(false);

const recordDialogVisible = ref(false);
const editingRecord = ref<WaterRecord | null>(null);
const tempAmount = ref(200);
const tempType = ref('water');

// 饮品类型
const beverageTypes = [
  { type: 'water', icon: '💧', name: '水' },
  { type: 'tea', icon: '🍵', name: '茶水' },
  { type: 'milk', icon: '🥛', name: '牛奶' },
  { type: 'coffee', icon: '☕', name: '咖啡' },
  { type: 'juice', icon: '🧃', name: '果汁' },
  { type: 'soda', icon: '🥤', name: '苏打水' },
  { type: 'sports', icon: '🏃', name: '运动饮料' },
  { type: 'coconut', icon: '🥥', name: '椰子水' },
  { type: 'lemon', icon: '🍋', name: '柠檬水' },
  { type: 'cola', icon: '🥤', name: '可乐' },
  { type: 'redbull', icon: '🔋', name: '红糖水' },
  { type: 'yogurt', icon: '🥛', name: '豆浆' },
];

// 快捷操作
const quickActions = ref<QuickAction[]>([
  { type: 'water', icon: '💧', label: '水', amount: 200 },
]);

// 日期标签
const dateLabel = computed(() => {
  const today = new Date();
  const current = currentDate.value;
  
  if (current.toDateString() === today.toDateString()) {
    return '今天';
  }
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (current.toDateString() === yesterday.toDateString()) {
    return '昨天';
  }
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (current.toDateString() === tomorrow.toDateString()) {
    return '明天';
  }
  
  return `${current.getMonth() + 1}月${current.getDate()}日`;
});

// 总喝水量
const totalAmount = computed(() => {
  return records.value.reduce((sum, r) => sum + r.amount, 0);
});

// 剩余量
const remainingAmount = computed(() => {
  const remain = dailyGoal.value - totalAmount.value;
  return Math.max(0, remain);
});

// 进度百分比
const progressPercent = computed(() => {
  const percent = (totalAmount.value / dailyGoal.value) * 100;
  return Math.min(100, Math.round(percent));
});

// 水位高度
const waterHeight = computed(() => {
  return Math.min(100, progressPercent.value);
});

// 水的渐变色
const waterGradient = computed(() => {
  if (progressPercent.value >= 100) {
    return 'linear-gradient(180deg, #7fcc8f 0%, #6bb97d 100%)';
  }
  return 'linear-gradient(180deg, #94c5e8 0%, #7ab2d8 100%)';
});

// 日期切换
function prevDay() {
  const date = new Date(currentDate.value);
  date.setDate(date.getDate() - 1);
  currentDate.value = date;
  loadRecords();
}

function nextDay() {
  const date = new Date(currentDate.value);
  date.setDate(date.getDate() + 1);
  currentDate.value = date;
  loadRecords();
}

function goToday() {
  currentDate.value = new Date();
  loadRecords();
}

// 快速添加
function quickAdd(action: QuickAction) {
  addRecord(action.type, action.amount);
}

// 添加记录
function addRecord(type: string, amount: number) {
  const record: WaterRecord = {
    id: Date.now().toString(),
    type,
    amount,
    timestamp: Date.now(),
    date: formatDate(currentDate.value),
  };
  
  records.value.unshift(record);
  saveRecords();
  
  // 显示成功提示
  uni.showToast({
    title: '记录成功',
    icon: 'success',
    duration: 1500,
  });
}

// 显示记录弹窗
function showRecordDialog() {
  tempAmount.value = 200;
  tempType.value = 'water';
  editingRecord.value = null;
  recordDialogVisible.value = true;
}

function hideRecordDialog() {
  recordDialogVisible.value = false;
}

// 选择类型
function selectType(type: string) {
  tempType.value = type;
}

// 数字输入
function inputNumber(num: number | string) {
  const current = tempAmount.value.toString();
  const newValue = current === '0' ? num.toString() : current + num;
  const numValue = parseInt(newValue);
  
  if (numValue <= 9999) {
    tempAmount.value = numValue;
  }
}

function deleteNumber() {
  const current = tempAmount.value.toString();
  if (current.length > 1) {
    tempAmount.value = parseInt(current.slice(0, -1));
  } else {
    tempAmount.value = 0;
  }
}

// 确认记录
function confirmRecord() {
  if (tempAmount.value <= 0) {
    uni.showToast({
      title: '请输入喝水量',
      icon: 'none',
    });
    return;
  }
  
  addRecord(tempType.value, tempAmount.value);
  hideRecordDialog();
}

// 删除记录
function deleteRecord(id: string) {
  uni.showModal({
    title: '删除记录',
    content: '确定删除这条记录吗？',
    success: (res) => {
      if (res.confirm) {
        records.value = records.value.filter(r => r.id !== id);
        saveRecords();
      }
    },
  });
}

// 编辑模式
function editRecords() {
  editMode.value = !editMode.value;
}

// 编辑目标
function editGoal() {
  uni.navigateTo({
    url: '/pages/water-goal/WaterGoalPage',
  });
}

// 添加自定义快捷方式
function addCustomQuick() {
  showRecordDialog();
}

// 查看统计
function viewStats() {
  uni.navigateTo({
    url: '/pages/water-stats/WaterStatsPage',
  });
}

// 获取饮品图标
function getBeverageIcon(type: string): string {
  const bev = beverageTypes.find(b => b.type === type);
  return bev?.icon || '💧';
}

// 获取饮品名称
function getBeverageName(type: string): string {
  const bev = beverageTypes.find(b => b.type === type);
  return bev?.name || '水';
}

// 格式化时间
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

// 格式化日期
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// 加载记录
function loadRecords() {
  try {
    const key = `water_records_${formatDate(currentDate.value)}`;
    const data = uni.getStorageSync(key);
    if (data) {
      records.value = JSON.parse(data);
    } else {
      records.value = [];
    }
  } catch (e) {
    console.error('加载记录失败:', e);
    records.value = [];
  }
}

// 保存记录
function saveRecords() {
  try {
    const key = `water_records_${formatDate(currentDate.value)}`;
    uni.setStorageSync(key, JSON.stringify(records.value));
  } catch (e) {
    console.error('保存记录失败:', e);
  }
}

// 加载目标
function loadGoal() {
  try {
    const goal = uni.getStorageSync('water_daily_goal');
    if (goal) {
      dailyGoal.value = parseInt(goal);
    }
  } catch (e) {
    console.error('加载目标失败:', e);
  }
}

// 加载快捷方式
function loadQuickActions() {
  try {
    const actions = uni.getStorageSync('water_quick_actions');
    if (actions) {
      quickActions.value = JSON.parse(actions);
    }
  } catch (e) {
    console.error('加载快捷方式失败:', e);
  }
}

onMounted(() => {
  loadGoal();
  loadQuickActions();
  loadRecords();
});

onShow(() => {
  loadGoal();
  loadRecords();
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding-bottom: 140rpx;
  background: linear-gradient(180deg, #f8fdf9 0%, #f5f8f6 100%);
}

/* 日期选择器 */
.date-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  padding: 20rpx 32rpx;
}

.date-arrow,
.date-today {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  padding: 0;
  border: 2rpx solid #d4e5d4;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 2rpx 8rpx rgba(127, 204, 143, 0.08);
}

.date-arrow::after,
.date-today::after {
  border: none;
}

.date-arrow image,
.date-today image {
  width: 32rpx;
  height: 32rpx;
}

.date-text {
  flex: 1;
  color: #244735;
  font-size: 32rpx;
  font-weight: 700;
  text-align: center;
}

/* 喝水目标 */
.water-goal {
  margin: 0 32rpx 24rpx;
  padding: 20rpx 24rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 2rpx 12rpx rgba(127, 204, 143, 0.08);
}

.goal-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.goal-label {
  color: #76907d;
  font-size: 22rpx;
  font-weight: 600;
}

.goal-value {
  color: #2d6943;
  font-size: 28rpx;
  font-weight: 800;
}

.goal-remain {
  flex: 1;
  color: #9aaca0;
  font-size: 20rpx;
}

.goal-edit {
  padding: 8rpx 16rpx;
  border: 2rpx solid #d4e5d4;
  border-radius: 12rpx;
  background: #f8fdf9;
  color: #5c7a67;
  font-size: 22rpx;
  font-weight: 600;
  line-height: 1;
}

.goal-edit::after {
  border: none;
}

/* 水杯容器 */
.water-glass-container {
  display: flex;
  justify-content: center;
  padding: 40rpx 32rpx;
}

.glass-wrapper {
  position: relative;
  width: 400rpx;
  height: 600rpx;
}

.glass {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 40rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.6) 100%);
  box-shadow: 
    inset 0 0 40rpx rgba(127, 204, 143, 0.1),
    0 8rpx 32rpx rgba(127, 204, 143, 0.15);
  overflow: hidden;
}

.water {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  transition: height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 0 0 40rpx 40rpx;
}

.wave {
  position: absolute;
  left: -100%;
  width: 300%;
  height: 100rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: wave 3s infinite linear;
}

.wave1 {
  animation-duration: 3s;
}

.wave2 {
  animation-duration: 5s;
  animation-delay: -2s;
}

@keyframes wave {
  0% {
    transform: translateX(0) translateY(0);
  }
  50% {
    transform: translateX(-25%) translateY(-10rpx);
  }
  100% {
    transform: translateX(-50%) translateY(0);
  }
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
}

.current-amount {
  color: #2d6943;
  font-size: 80rpx;
  font-weight: 800;
  line-height: 1;
}

.unit {
  color: #76907d;
  font-size: 32rpx;
  font-weight: 600;
  margin-top: 8rpx;
}

.progress-percent {
  color: #9aaca0;
  font-size: 24rpx;
  font-weight: 600;
  margin-top: 8rpx;
}

/* 快捷操作 */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12rpx;
  padding: 0 32rpx 24rpx;
}

.quick-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 24rpx;
  border: 2rpx solid #d4e5d4;
  border-radius: 20rpx;
  background: #ffffff;
  box-shadow: 0 2rpx 8rpx rgba(127, 204, 143, 0.06);
  transition: all 0.2s ease;
}

.quick-btn::after {
  border: none;
}

.quick-btn:active {
  transform: scale(0.98);
  background: #f8fdf9;
  border-color: #7fcc8f;
}

.quick-btn.add {
  grid-column: span 2;
  border-style: dashed;
}

.quick-icon {
  font-size: 48rpx;
}

.quick-label {
  color: #2d6943;
  font-size: 24rpx;
  font-weight: 600;
}

.quick-amount {
  color: #76907d;
  font-size: 22rpx;
}

/* 记录部分 */
.records-section {
  padding: 0 32rpx 24rpx;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 16rpx;
}

.section-icon {
  font-size: 28rpx;
}

.section-title {
  flex: 1;
  color: #2d6943;
  font-size: 26rpx;
  font-weight: 800;
}

.section-action {
  padding: 6rpx 16rpx;
  border: none;
  background: transparent;
  color: #7fcc8f;
  font-size: 22rpx;
  font-weight: 600;
  line-height: 1;
}

.section-action::after {
  border: none;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 20rpx;
}

.empty-icon {
  font-size: 64rpx;
  margin-bottom: 16rpx;
}

.empty-text {
  color: #9aaca0;
  font-size: 24rpx;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.record-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 20rpx;
  border-radius: 16rpx;
  background: #ffffff;
  box-shadow: 0 2rpx 8rpx rgba(127, 204, 143, 0.06);
}

.record-icon {
  font-size: 32rpx;
}

.record-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.record-type {
  color: #2d6943;
  font-size: 24rpx;
  font-weight: 600;
}

.record-time {
  color: #9aaca0;
  font-size: 20rpx;
}

.record-amount {
  color: #7fcc8f;
  font-size: 24rpx;
  font-weight: 700;
}

.record-delete {
  width: 48rpx;
  height: 48rpx;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: #fceee6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.record-delete::after {
  border: none;
}

.record-delete image {
  width: 20rpx;
  height: 20rpx;
}

/* 底部操作 */
.bottom-actions {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  gap: 16rpx;
  padding: 16rpx 32rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10rpx);
  border-top: 1rpx solid #e8f3ea;
  box-shadow: 0 -4rpx 12rpx rgba(127, 204, 143, 0.05);
}

.record-btn,
.stats-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 20rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 1;
}

.record-btn::after,
.stats-btn::after {
  border: none;
}

.record-btn {
  flex: 1;
  border: none;
  background: linear-gradient(135deg, #94c5e8 0%, #7ab2d8 100%);
  color: #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(148, 197, 232, 0.3);
}

.stats-btn {
  width: 120rpx;
  border: 2rpx solid #d4e5d4;
  background: #ffffff;
  color: #5c7a67;
}

.stats-btn image {
  width: 32rpx;
  height: 32rpx;
}

.btn-icon {
  font-size: 32rpx;
}

/* 弹窗 */
.dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 9999;
}

.dialog-content {
  width: 100%;
  max-height: 80vh;
  padding: 32rpx;
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
  border-radius: 40rpx 40rpx 0 0;
  background: #ffffff;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.dialog-title {
  color: #244735;
  font-size: 32rpx;
  font-weight: 700;
}

.dialog-close {
  width: 56rpx;
  height: 56rpx;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: #f8fdf9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-close::after {
  border: none;
}

.dialog-close image {
  width: 24rpx;
  height: 24rpx;
}

.amount-input {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8rpx;
  padding: 40rpx 0;
}

.amount-value {
  color: #244735;
  font-size: 80rpx;
  font-weight: 800;
  line-height: 1;
}

.amount-unit {
  color: #76907d;
  font-size: 32rpx;
  font-weight: 600;
}

.beverage-types {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
  margin-bottom: 24rpx;
  max-height: 300rpx;
  overflow-y: auto;
}

.beverage-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx;
  border: 2rpx solid #e8f3ea;
  border-radius: 16rpx;
  background: #f8fdf9;
  transition: all 0.2s ease;
}

.beverage-btn::after {
  border: none;
}

.beverage-btn.active {
  border-color: #7fcc8f;
  background: #e8f3ea;
}

.beverage-icon {
  font-size: 32rpx;
}

.beverage-name {
  color: #5c7a67;
  font-size: 20rpx;
  font-weight: 600;
}

.number-keyboard {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.key-btn {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #e8f3ea;
  border-radius: 16rpx;
  background: #f8fdf9;
  color: #244735;
  font-size: 32rpx;
  font-weight: 700;
  transition: all 0.2s ease;
}

.key-btn::after {
  border: none;
}

.key-btn:active {
  background: #e8f3ea;
  transform: scale(0.95);
}

.key-btn.delete {
  background: #fceee6;
  color: #d46a56;
}

.confirm-btn {
  width: 100%;
  padding: 24rpx;
  border: none;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #94c5e8 0%, #7ab2d8 100%);
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 700;
  box-shadow: 0 4rpx 16rpx rgba(148, 197, 232, 0.3);
}

.confirm-btn::after {
  border: none;
}
</style>
