# 首页重新设计方案 V4（参考薄荷健康首页）

## 薄荷健康首页布局分析

### 布局结构（图1）

```
顶部导航栏
  ↓
【体重管理方案卡片】
- 圆形进度图（初始76→已减1→目标68）
- 白卡片
  ↓
【饮食热量卡片】
- 还可吃 1787 千卡（大数字）
- 5个快捷按钮（早餐、午餐、晚餐、加餐、运动）
- 底部"薄荷相机"按钮
  ↓
【体重记录卡片】
- 75.00公斤 + 折线图
  ↓
【运动记录卡片】
```

### 布局结构（图2 - 向下滚动）

```
【运动记录卡片】
- 本周达成 + 每日平均 + 图表
  ↓
【2x2 功能卡片】
- 轻断食（16:8模式，打卡徽章）
- 喝水（0毫升）
- 睡眠（月亮图标）
- 便便（图标）
  ↓
【血糖记录】
  ↓
【编辑首页卡片】虚线框
```

---

## 核心设计特点

1. **白卡片为主**：每个功能独立白卡片
2. **大数据展示**：重要数字很大（1787、75.00）
3. **圆形进度图**：可视化展示体重进度
4. **快捷按钮行**：5个圆形图标
5. **2x2 功能卡片**：4个小卡片平铺
6. **浅灰色背景**：卡片之间有间距

---

## 和生序首页新设计（完全照搬布局）

### 布局结构

```
顶部问候（Hello, 用户名）
  ↓
【体重进度卡片】（照搬薄荷的圆形进度图）
- 初始体重 → 当前体重 → 目标体重
- 圆形进度可视化
- 白卡片 + 治愈系绿色
  ↓
【今日记录卡片】（照搬饮食热量卡片结构）
- 已记录 2/4 项（大数字）
- 4个快捷按钮（体重、饮食、活动、睡眠）
- 底部"查看记录时间线"按钮
  ↓
【和序序聊聊卡片】（横向卡片）
  ↓
【其他功能】（可选）
```

---

## 详细设计

### 1. 体重进度卡片（照搬圆形进度图）

```vue
<view class="weight-progress-card">
  <view class="card-header">
    <text class="card-title">体重管理</text>
    <text class="card-subtitle">第 1 周</text>
  </view>
  
  <!-- 圆形进度图 -->
  <view class="circle-progress">
    <view class="progress-left">
      <text class="progress-value">72.5</text>
      <text class="progress-label">初始</text>
    </view>
    
    <view class="progress-circle">
      <!-- SVG 圆形进度条 -->
      <text class="progress-center">已减 2.5kg</text>
    </view>
    
    <view class="progress-right">
      <text class="progress-value">65.0</text>
      <text class="progress-label">目标</text>
    </view>
  </view>
</view>
```

**样式**：
- 白卡片
- 圆形进度条：薄荷绿色（#7fcc8f）
- 大数字：72.5、65.0
- 中心文字：已减 2.5kg

### 2. 今日记录卡片（照搬饮食热量结构）

```vue
<view class="daily-record-card">
  <view class="card-header">
    <text class="card-title">今日记录</text>
  </view>
  
  <!-- 大数字展示 -->
  <view class="record-summary">
    <view class="summary-item">
      <text class="summary-label">已记录</text>
      <text class="summary-value">2 <text class="summary-unit">/4 项</text></text>
    </view>
  </view>
  
  <!-- 快捷按钮行 -->
  <view class="quick-actions">
    <button class="quick-btn" v-for="item in 4">
      <image class="quick-icon" />
      <text class="quick-label">体重</text>
    </button>
  </view>
  
  <!-- 底部按钮 -->
  <button class="card-bottom-btn">
    <image class="btn-icon" src="timeline-icon.svg" />
    <text>查看记录时间线</text>
  </button>
</view>
```

**样式**：
- 白卡片
- 大数字"2"（96rpx）
- 5个圆形快捷按钮（像薄荷的早餐、午餐等）
- 底部淡绿色按钮

### 3. 和序序聊聊卡片（保持简洁）

```vue
<button class="companion-card">
  <image class="avatar" />
  <view class="content">
    <text class="title">和序序聊聊</text>
    <text class="desc">分享今天的心情</text>
  </view>
  <image class="arrow" />
</button>
```

---

## 样式设计（治愈系水彩风格）

### 整体配色

```css
/* 背景 */
background: #f5f8f6; /* 浅薄荷绿背景（类似薄荷的浅灰） */

/* 卡片 */
background: linear-gradient(135deg, #ffffff 0%, #fafcfb 100%);
box-shadow: 0 8rpx 28rpx rgba(127, 204, 143, 0.12);
border-radius: 32rpx;

/* 主色调 */
--primary: #7fcc8f; /* 薄荷绿 */
--primary-light: #e8f7ed;
--text-dark: #2d6943;
--text-gray: #5a9572;
```

### 圆形进度图

```css
.progress-circle {
  position: relative;
  width: 400rpx;
  height: 400rpx;
  /* SVG 圆形进度条 */
}

.progress-value {
  font-size: 60rpx;
  font-weight: 900;
  color: #2d6943;
}

.progress-label {
  font-size: 24rpx;
  color: #5a9572;
}
```

### 快捷按钮

```css
.quick-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.quick-icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(127, 204, 143, 0.15) 0%, rgba(232, 247, 237, 0.9) 100%);
}

.quick-label {
  font-size: 24rpx;
  color: #284d36;
}
```

---

## 与薄荷健康对比

### 薄荷健康
- 圆形进度图：灰色 + 绿色
- 快捷按钮：早餐🥚、午餐🍔、晚餐🍜、加餐🍎、运动👟
- 底部按钮：蓝色"薄荷相机"
- 2x2卡片：轻断食、喝水、睡眠、便便

### 和生序
- 圆形进度图：薄荷绿（#7fcc8f）+ 水彩风格
- 快捷按钮：体重⚖️、饮食🍚、活动🏃、睡眠🌙
- 底部按钮：绿色"查看记录时间线"
- 和序序聊聊：横向卡片

---

## 屏幕占比

```
0-5%    顶部问候
        ↓
5-35%   【体重进度卡片】圆形进度图
        ↓
35-70%  【今日记录卡片】大数字 + 快捷按钮
        ↓
70-85%  【序序卡片】
        ↓
85-100% 底部留白
```

---

## 移除的内容

- ❌ 主视觉插画区（太占空间）
- ❌ 2x2 功能卡片（简化）

---

## 需要的插画资源

### 1. 快捷按钮图标（4个）

使用现有的图标即可：
- 体重：weight-icon.svg
- 饮食：food-icon.svg
- 活动：activity-icon.svg
- 睡眠：sleep-icon.svg

### 2. 圆形进度图（可选）

如果需要更漂亮的进度图，可以生成：

**提示词**：
```
A circular progress indicator for weight management app,
- Mint green arc showing progress from start to goal
- Soft watercolor style
- Clean and minimal
- Healing Japanese aesthetic
- Transparent background
- 512x512px PNG
```

---

## 实施步骤

1. ✅ 移除主视觉插画区
2. ✅ 创建体重进度卡片（圆形进度图）
3. ✅ 创建今日记录卡片（大数字 + 快捷按钮）
4. ✅ 保持序序卡片简洁
5. ✅ 整体使用白卡片 + 浅绿背景

---

**立即开始实施！**
