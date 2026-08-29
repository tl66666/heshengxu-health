<template>
  <view class="weight-detail-page">
    <AppNavBar title="体重记录" />
    
    <!-- 当前体重 -->
    <view class="current-weight">
      <text class="label">当前体重</text>
      <view class="weight-value">
        <text class="value">65.5</text>
        <text class="unit">kg</text>
      </view>
      <text class="date">2024-08-29 更新</text>
    </view>

    <!-- 趋势图 -->
    <view class="chart-card card">
      <view class="card-header">
        <text class="card-title">30天趋势</text>
        <view class="tabs">
          <text class="tab active">30天</text>
          <text class="tab">90天</text>
          <text class="tab">全部</text>
        </view>
      </view>
      <view class="chart-container">
        <!-- 临时占位，后续实现图表 -->
        <view class="chart-placeholder">
          <text class="placeholder-text">📈 体重趋势图</text>
          <text class="placeholder-hint">（图表组件开发中）</text>
        </view>
      </view>
    </view>

    <!-- 历史记录 -->
    <view class="history-card card">
      <view class="card-header">
        <text class="card-title">历史记录</text>
      </view>
      <view class="history-list">
        <view class="history-item">
          <view class="item-left">
            <text class="item-date">今天 08:30</text>
            <text class="item-note">早起称重</text>
          </view>
          <view class="item-right">
            <text class="item-weight">65.5 kg</text>
            <text class="item-change down">-0.3</text>
          </view>
        </view>
        
        <view class="history-item">
          <view class="item-left">
            <text class="item-date">昨天 08:25</text>
            <text class="item-note">空腹</text>
          </view>
          <view class="item-right">
            <text class="item-weight">65.8 kg</text>
            <text class="item-change down">-0.2</text>
          </view>
        </view>

        <view class="history-item">
          <view class="item-left">
            <text class="item-date">08-27 08:30</text>
          </view>
          <view class="item-right">
            <text class="item-weight">66.0 kg</text>
            <text class="item-change up">+0.1</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 添加记录按钮 -->
    <view class="add-button-container">
      <button class="add-button" hover-class="button-hover" @tap="showAddDialog">
        <text class="add-icon">+</text>
        <text class="add-text">记录体重</text>
      </button>
    </view>

    <!-- 添加记录弹窗 -->
    <view v-if="showDialog" class="dialog-mask" @tap="hideAddDialog">
      <view class="dialog-content" @tap.stop>
        <view class="dialog-header">
          <text class="dialog-title">记录体重</text>
          <button class="dialog-close" @tap="hideAddDialog">×</button>
        </view>
        <view class="dialog-body">
          <view class="input-group">
            <text class="input-label">体重（kg）</text>
            <input 
              class="weight-input" 
              type="digit"
              placeholder="请输入体重"
              v-model="inputWeight"
            />
          </view>
          <view class="input-group">
            <text class="input-label">备注（可选）</text>
            <input 
              class="note-input" 
              type="text"
              placeholder="如：早起空腹"
              v-model="inputNote"
            />
          </view>
        </view>
        <view class="dialog-footer">
          <button class="dialog-button cancel" hover-class="button-hover" @tap="hideAddDialog">取消</button>
          <button class="dialog-button confirm" hover-class="button-hover" @tap="saveWeight">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppNavBar from '../../components/AppNavBar.vue';

const showDialog = ref(false);
const inputWeight = ref('');
const inputNote = ref('');

const showAddDialog = () => {
  showDialog.value = true;
};

const hideAddDialog = () => {
  showDialog.value = false;
  inputWeight.value = '';
  inputNote.value = '';
};

const saveWeight = () => {
  if (!inputWeight.value) {
    uni.showToast({
      title: '请输入体重',
      icon: 'none'
    });
    return;
  }
  
  // TODO: 保存体重记录
  uni.showToast({
    title: '记录成功',
    icon: 'success'
  });
  
  hideAddDialog();
};
</script>

<style scoped>
.weight-detail-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #e8f4ea 0%, #f7fbf8 50%, #ffffff 100%);
  padding-bottom: 120rpx;
}

/* 当前体重 */
.current-weight {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 24rpx;
}

.label {
  color: #5a9572;
  font-size: 24rpx;
  margin-bottom: 16rpx;
}

.weight-value {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.value {
  color: #2d6943;
  font-size: 80rpx;
  font-weight: 900;
  line-height: 1;
}

.unit {
  color: #5a9572;
  font-size: 32rpx;
  font-weight: 600;
}

.date {
  color: #9ba8a0;
  font-size: 22rpx;
  margin-top: 12rpx;
}

/* 卡片通用样式 */
.card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin: 0 24rpx 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(46, 97, 64, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.card-title {
  color: #2d6943;
  font-size: 28rpx;
  font-weight: 700;
}

/* Tab切换 */
.tabs {
  display: flex;
  gap: 16rpx;
}

.tab {
  color: #9ba8a0;
  font-size: 22rpx;
  padding: 6rpx 16rpx;
  border-radius: 12rpx;
}

.tab.active {
  color: #2d6943;
  background: #e8f4ea;
  font-weight: 600;
}

/* 图表 */
.chart-container {
  height: 400rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #f7fbf8 0%, #ffffff 100%);
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.placeholder-text {
  font-size: 40rpx;
}

.placeholder-hint {
  color: #9ba8a0;
  font-size: 20rpx;
}

/* 历史记录 */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f4f2;
}

.history-item:last-child {
  border-bottom: none;
}

.item-left {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.item-date {
  color: #2d6943;
  font-size: 26rpx;
  font-weight: 600;
}

.item-note {
  color: #9ba8a0;
  font-size: 22rpx;
}

.item-right {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
}

.item-weight {
  color: #2d6943;
  font-size: 32rpx;
  font-weight: 700;
}

.item-change {
  font-size: 22rpx;
  font-weight: 600;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.item-change.down {
  color: #7fcc8f;
  background: rgba(127, 204, 143, 0.1);
}

.item-change.up {
  color: #ff8c42;
  background: rgba(255, 140, 66, 0.1);
}

/* 添加按钮 */
.add-button-container {
  position: fixed;
  bottom: 40rpx;
  left: 24rpx;
  right: 24rpx;
  z-index: 10;
}

.add-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  width: 100%;
  padding: 32rpx;
  background: linear-gradient(135deg, #7fcc8f 0%, #5a9572 100%);
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(127, 204, 143, 0.4);
}

.add-icon {
  color: #ffffff;
  font-size: 36rpx;
  font-weight: 700;
}

.add-text {
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 700;
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
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.dialog-content {
  width: 600rpx;
  background: #ffffff;
  border-radius: 24rpx;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f4f2;
}

.dialog-title {
  color: #2d6943;
  font-size: 32rpx;
  font-weight: 700;
}

.dialog-close {
  width: 48rpx;
  height: 48rpx;
  padding: 0;
  background: transparent;
  color: #9ba8a0;
  font-size: 48rpx;
  line-height: 1;
}

.dialog-body {
  padding: 32rpx;
}

.input-group {
  margin-bottom: 32rpx;
}

.input-group:last-child {
  margin-bottom: 0;
}

.input-label {
  display: block;
  color: #2d6943;
  font-size: 24rpx;
  font-weight: 600;
  margin-bottom: 16rpx;
}

.weight-input,
.note-input {
  width: 100%;
  padding: 24rpx;
  background: #f7fbf8;
  border-radius: 16rpx;
  color: #2d6943;
  font-size: 28rpx;
}

.dialog-footer {
  display: flex;
  gap: 16rpx;
  padding: 24rpx 32rpx 32rpx;
}

.dialog-button {
  flex: 1;
  padding: 24rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 600;
}

.dialog-button.cancel {
  background: #f0f4f2;
  color: #5a9572;
}

.dialog-button.confirm {
  background: linear-gradient(135deg, #7fcc8f 0%, #5a9572 100%);
  color: #ffffff;
}
</style>
