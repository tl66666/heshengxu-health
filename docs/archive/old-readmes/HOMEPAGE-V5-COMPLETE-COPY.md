# 首页完全照搬薄荷健康方案（V5）

## 薄荷健康首页完整布局分析

### 第1屏详细元素

#### 1. 顶部导航栏（暂不实现，保持现有）

#### 2. 体重管理方案卡片
- 标题：体重管理方案 + 眼睛图标 + 第 1/16 周
- 圆形进度图：76.00 初始 → 1.00 已减 → 68.00 目标
- 白卡片，padding: 36rpx

#### 3. 饮食热量卡片 → **改为"今日记录卡片"**
- 标题：今日记录 + 右上角"2/4"标签
- **大数字展示**：
  - 主数据：体重 72.5kg（超大）
  - 下方3个数据：目标65kg、饮食0/3、活动0分钟
- **横向滑动点**（如果有多页）
- **5个快捷按钮横向排列**：
  - 早餐 → 体重⚖️
  - 午餐 → 饮食🍚
  - 晚餐 → 水💧
  - 加餐 → 活动🏃
  - 运动 → 睡眠🌙
- **底部按钮**：📷 序序相机 → 📋 记录时间线

#### 4. 和序序聊聊卡片
- 横向卡片
- 头像 + 文字 + 箭头

---

## 完全照搬的要点

### 1. 圆形进度图（完全一样）
```
┌─────────────────────────────────┐
│ 体重管理方案    👁  第 1/16 周   │
│                                 │
│   76.00    【圆形进度】   68.00  │
│   初始      已减1.00kg     目标  │
│                                 │
└─────────────────────────────────┘
```

### 2. 今日记录卡片（照搬饮食热量结构）
```
┌─────────────────────────────────┐
│ 今日记录              2/4 ✓     │
│                                 │
│         体重                     │
│        72.5 kg                  │
│       （超大数字）                │
│                                 │
│  目标65kg    饮食0/3    活动0min │
│                                 │
│  ● ● ●  ← 横向滑动点             │
│                                 │
│  [⚖️]  [🍚]  [💧]  [🏃]  [🌙]   │
│  体重   饮食   水    活动   睡眠  │
│                                 │
│  [📋 记录时间线]                 │
│                                 │
└─────────────────────────────────┘
```

**关键细节**：
- 标题右上角"2/4"标签（像薄荷的"16:8饮食"）
- **超大数字**：72.5kg（像薄荷的 1787）
- 下方3个小数据（像薄荷的 0饮食、0运动）
- 横向滑动点（3个点）
- 5个快捷按钮（像薄荷的早午晚加运动）
- 底部按钮（像薄荷的"薄荷相机"）

---

## 需要的元素

### 1. 右上角标签（2/4）

**样式**：
- 淡绿色背景
- 圆角胶囊形
- 小图标 + 文字

### 2. 横向滑动点（3个点）

**如果有多页内容**：
- 3个小圆点
- 当前页绿色，其他灰色

### 3. 5个快捷按钮

**和生序版本**：
- 体重⚖️
- 饮食🍚
- 水💧
- 活动🏃
- 睡眠🌙

### 4. 底部按钮

**薄荷健康**：📷 薄荷相机
**和生序**：📋 记录时间线

---

## 需要生成的图片

### 1. 快捷按钮图标（5个）

**现有资源检查**：
- weight-icon.svg ✅
- food-icon.svg ✅
- activity-icon.svg ✅
- sleep-icon.svg ✅
- 水的图标 ❓

**需要生成：水滴图标**

**提示词**：
```
A minimalist water drop icon for health tracking app,
- Single water drop shape
- Soft watercolor style
- Light blue color (#A5D8F3)
- Clean and simple
- Healing Japanese aesthetic
- Transparent background
- 128x128px PNG
- Suitable for 88rpx circular button
```

### 2. 标签徽章背景（可选）

如果需要更漂亮的"2/4"标签：

**提示词**：
```
A soft pill-shaped badge background for progress indicator,
- Horizontal capsule shape
- Light mint green gradient
- Subtle watercolor texture
- Healing and gentle style
- Transparent edges
- 200x60px PNG
```

---

## 完整实现方案

### HTML 结构

```vue
<template>
  <view class="page">
    <!-- 1. 体重管理方案卡片 -->
    <view class="weight-management-card">
      <view class="card-header">
        <text class="card-title">体重管理方案</text>
        <text class="card-week">第 1/16 周</text>
      </view>
      
      <view class="circle-progress-section">
        <view class="progress-item">
          <text class="progress-value">76.00</text>
          <text class="progress-label">初始</text>
        </view>
        
        <view class="progress-circle">
          <text class="progress-center">已减 1.00kg</text>
        </view>
        
        <view class="progress-item">
          <text class="progress-value">68.00</text>
          <text class="progress-label">目标</text>
        </view>
      </view>
    </view>
    
    <!-- 2. 今日记录卡片（完全照搬饮食热量） -->
    <view class="daily-record-card">
      <view class="card-header">
        <text class="card-title">今日记录</text>
        <view class="card-badge">
          <text>2/4 ✓</text>
        </view>
      </view>
      
      <!-- 超大数字展示 -->
      <view class="main-data-section">
        <text class="data-label">体重</text>
        <view class="data-value-wrap">
          <text class="data-value">72.5</text>
          <text class="data-unit">kg</text>
        </view>
      </view>
      
      <!-- 3个小数据 -->
      <view class="sub-data-section">
        <view class="sub-data-item">
          <text class="sub-label">目标</text>
          <text class="sub-value">65kg</text>
        </view>
        <view class="sub-data-item">
          <text class="sub-label">饮食</text>
          <text class="sub-value">0/3</text>
        </view>
        <view class="sub-data-item">
          <text class="sub-label">活动</text>
          <text class="sub-value">0分钟</text>
        </view>
      </view>
      
      <!-- 横向滑动点 -->
      <view class="slide-dots">
        <view class="dot dot--active" />
        <view class="dot" />
        <view class="dot" />
      </view>
      
      <!-- 5个快捷按钮 -->
      <view class="quick-actions-row">
        <button class="quick-btn">
          <image src="weight-icon.svg" />
          <text>体重</text>
        </button>
        <button class="quick-btn">
          <image src="food-icon.svg" />
          <text>饮食</text>
        </button>
        <button class="quick-btn">
          <image src="water-icon.svg" />
          <text>水</text>
        </button>
        <button class="quick-btn">
          <image src="activity-icon.svg" />
          <text>活动</text>
        </button>
        <button class="quick-btn">
          <image src="sleep-icon.svg" />
          <text>睡眠</text>
        </button>
      </view>
      
      <!-- 底部按钮 -->
      <button class="card-bottom-action">
        <image src="timeline-icon.svg" />
        <text>记录时间线</text>
      </button>
    </view>
    
    <!-- 3. 序序卡片 -->
    <button class="companion-card">
      <image class="avatar" src="xuxu-avatar.png" />
      <view class="content">
        <text class="title">和序序聊聊</text>
        <text class="desc">分享今天的心情</text>
      </view>
      <image class="arrow" src="forward.svg" />
    </button>
  </view>
</template>
```

---

## 样式细节

### 超大数字（像薄荷的 1787）

```css
.data-value {
  font-size: 120rpx;  /* 超大 */
  font-weight: 900;
  color: #2d6943;
  line-height: 1;
  letter-spacing: -0.03em;
}
```

### 3个小数据（像薄荷的 0饮食、0运动）

```css
.sub-data-section {
  display: flex;
  justify-content: space-around;
  padding: 24rpx 0;
}

.sub-data-item {
  text-align: center;
}

.sub-label {
  font-size: 22rpx;
  color: #76907d;
}

.sub-value {
  font-size: 28rpx;
  font-weight: 700;
  color: #5a9572;
}
```

### 横向滑动点

```css
.slide-dots {
  display: flex;
  justify-content: center;
  gap: 12rpx;
  margin: 20rpx 0;
}

.dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #d4e8db;
}

.dot--active {
  background: #7fcc8f;
}
```

### 5个快捷按钮（横向排列）

```css
.quick-actions-row {
  display: flex;
  justify-content: space-around;
  padding: 28rpx 0;
}

.quick-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.quick-btn image {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(127, 204, 143, 0.12) 0%, rgba(232, 247, 237, 0.8) 100%);
}
```

---

## 对比总结

| 元素 | 薄荷健康 | 和生序（完全照搬） |
|------|----------|-------------------|
| 卡片1 | 体重管理方案 | 体重管理方案 ✅ |
| 圆形进度图 | 76→1→68 | 76→1→68 ✅ |
| 卡片2 | 饮食热量 | 今日记录 |
| 大数字 | 1787千卡 | 72.5kg ✅ |
| 小数据 | 0饮食、0运动 | 目标65kg、饮食0/3、活动0min ✅ |
| 滑动点 | ●●● | ●●● ✅ |
| 快捷按钮 | 5个横向 | 5个横向 ✅ |
| 底部按钮 | 📷薄荷相机 | 📋记录时间线 ✅ |

---

**立即实施完全照搬版本！**
