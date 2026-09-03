<template>
  <view class="food-detail-page">
    <AppNavBar title="饮食记录" route="/pages/food/FoodDetailPage" />
    
    <!-- 今日热量统计 -->
    <view class="calorie-summary">
      <view class="calorie-item">
        <text class="calorie-label">已摄入</text>
        <text class="calorie-value green">1450</text>
        <text class="calorie-unit">千卡</text>
      </view>
      <view class="calorie-divider"></view>
      <view class="calorie-item">
        <text class="calorie-label">目标</text>
        <text class="calorie-value">1800</text>
        <text class="calorie-unit">千卡</text>
      </view>
      <view class="calorie-divider"></view>
      <view class="calorie-item">
        <text class="calorie-label">剩余</text>
        <text class="calorie-value orange">350</text>
        <text class="calorie-unit">千卡</text>
      </view>
    </view>

    <!-- 今日饮食列表 -->
    <view class="meal-list">
      <!-- 早餐 -->
      <view class="meal-section">
        <view class="meal-header">
          <view class="meal-title-group">
            <text class="meal-icon">🥚</text>
            <text class="meal-title">早餐</text>
            <text class="meal-time">08:30</text>
          </view>
          <text class="meal-calories">420千卡</text>
        </view>
        <view class="food-list">
          <view class="food-item">
            <view class="food-info">
              <text class="food-name">燕麦粥</text>
              <text class="food-detail">200g</text>
            </view>
            <text class="food-calories">180千卡</text>
          </view>
          <view class="food-item">
            <view class="food-info">
              <text class="food-name">煮鸡蛋</text>
              <text class="food-detail">1个</text>
            </view>
            <text class="food-calories">80千卡</text>
          </view>
          <view class="food-item">
            <view class="food-info">
              <text class="food-name">牛奶</text>
              <text class="food-detail">250ml</text>
            </view>
            <text class="food-calories">160千卡</text>
          </view>
        </view>
      </view>

      <!-- 午餐 -->
      <view class="meal-section">
        <view class="meal-header">
          <view class="meal-title-group">
            <text class="meal-icon">🍔</text>
            <text class="meal-title">午餐</text>
            <text class="meal-time">12:30</text>
          </view>
          <text class="meal-calories">680千卡</text>
        </view>
        <view class="food-list">
          <view class="food-item">
            <view class="food-info">
              <text class="food-name">米饭</text>
              <text class="food-detail">150g</text>
            </view>
            <text class="food-calories">210千卡</text>
          </view>
          <view class="food-item">
            <view class="food-info">
              <text class="food-name">清蒸鲈鱼</text>
              <text class="food-detail">150g</text>
            </view>
            <text class="food-calories">180千卡</text>
          </view>
          <view class="food-item">
            <view class="food-info">
              <text class="food-name">炒青菜</text>
              <text class="food-detail">200g</text>
            </view>
            <text class="food-calories">90千卡</text>
          </view>
          <view class="food-item">
            <view class="food-info">
              <text class="food-name">苹果</text>
              <text class="food-detail">1个</text>
            </view>
            <text class="food-calories">80千卡</text>
          </view>
        </view>
      </view>

      <!-- 加餐 -->
      <view class="meal-section">
        <view class="meal-header">
          <view class="meal-title-group">
            <text class="meal-icon">🍎</text>
            <text class="meal-title">加餐</text>
            <text class="meal-time">16:00</text>
          </view>
          <text class="meal-calories">120千卡</text>
        </view>
        <view class="food-list">
          <view class="food-item">
            <view class="food-info">
              <text class="food-name">坚果</text>
              <text class="food-detail">20g</text>
            </view>
            <text class="food-calories">120千卡</text>
          </view>
        </view>
      </view>

      <!-- 晚餐 -->
      <view class="meal-section">
        <view class="meal-header">
          <view class="meal-title-group">
            <text class="meal-icon">🍜</text>
            <text class="meal-title">晚餐</text>
            <text class="meal-time">18:30</text>
          </view>
          <text class="meal-calories">230千卡</text>
        </view>
        <view class="food-list">
          <view class="food-item">
            <view class="food-info">
              <text class="food-name">蔬菜沙拉</text>
              <text class="food-detail">300g</text>
            </view>
            <text class="food-calories">150千卡</text>
          </view>
          <view class="food-item">
            <view class="food-info">
              <text class="food-name">鸡胸肉</text>
              <text class="food-detail">80g</text>
            </view>
            <text class="food-calories">80千卡</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 添加按钮 -->
    <view class="add-button-container">
      <button class="add-button" hover-class="button-hover" @tap="goToRecognition">
        <text class="add-icon">📷</text>
        <text class="add-text">拍照识别</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import AppNavBar from '../../components/AppNavBar.vue';

const goToRecognition = () => {
  uni.navigateTo({ url: '/pages/food-recognition/FoodRecognitionPage' });
};
</script>

<style scoped>
.food-detail-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #fff8f0 0%, #f7fbf8 50%, #ffffff 100%);
  padding-bottom: 120rpx;
}

/* 热量统计 */
.calorie-summary {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 24rpx;
  padding: 40rpx 24rpx;
  background: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(255, 140, 66, 0.08);
}

.calorie-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.calorie-label {
  color: #9ba8a0;
  font-size: 22rpx;
}

.calorie-value {
  color: #2d6943;
  font-size: 48rpx;
  font-weight: 900;
  line-height: 1;
}

.calorie-value.green {
  color: #7fcc8f;
}

.calorie-value.orange {
  color: #ff8c42;
}

.calorie-unit {
  color: #9ba8a0;
  font-size: 20rpx;
}

.calorie-divider {
  width: 1rpx;
  height: 60rpx;
  background: #e8f4ea;
}

/* 餐次列表 */
.meal-list {
  padding: 0 24rpx;
}

.meal-section {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(46, 97, 64, 0.04);
}

.meal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f4f2;
}

.meal-title-group {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.meal-icon {
  font-size: 32rpx;
}

.meal-title {
  color: #2d6943;
  font-size: 28rpx;
  font-weight: 700;
}

.meal-time {
  color: #9ba8a0;
  font-size: 22rpx;
  margin-left: 8rpx;
}

.meal-calories {
  color: #ff8c42;
  font-size: 28rpx;
  font-weight: 700;
}

/* 食物列表 */
.food-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.food-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 20rpx;
  background: linear-gradient(135deg, #f7fbf8 0%, #ffffff 100%);
  border-radius: 16rpx;
}

.food-info {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.food-name {
  color: #2d6943;
  font-size: 26rpx;
  font-weight: 600;
}

.food-detail {
  color: #9ba8a0;
  font-size: 22rpx;
}

.food-calories {
  color: #5a9572;
  font-size: 24rpx;
  font-weight: 600;
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
  background: linear-gradient(135deg, #ff8c42 0%, #f4a460 100%);
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(255, 140, 66, 0.4);
}

.add-icon {
  font-size: 36rpx;
}

.add-text {
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 700;
}
</style>
