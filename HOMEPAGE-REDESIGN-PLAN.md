# 首页重新设计方案（参考建档页优秀设计）

## 建档页为什么设计得好？

### 核心设计原则分析

#### 1. 图片完整显示，不裁切
```vue
<image 
  src="/static/illustrations/onboarding-guide-vertical.png"
  mode="widthFix"  <!-- 关键：宽度适配，高度自动，图片完整 -->
/>
```

#### 2. 渐变遮罩确保文字可读
```vue
<view class="welcome-gradient" />
<!-- 68% 高度渐变遮罩，从 rgba(232, 244, 234, 0) 到 rgba(232, 244, 234, 0.94) -->
```

#### 3. 内容浮动在底部，不遮挡插画
```css
.welcome-body {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2;
  /* 内容在底部浮动，插画主体在上方完整展示 */
}
```

#### 4. 层次清晰
```
背景插画（z-index: 0）
  ↓
渐变遮罩（z-index: 1，确保文字可读）
  ↓
内容层（z-index: 2，气泡、按钮等）
```

#### 5. 整体协调，不是简单堆叠
- 插画背景 + 遮罩 + 内容 = **一个整体设计**
- 不是"卡片1 + 卡片2 + 卡片3"的堆叠
- 每个元素都有明确的作用和位置

---

## 当前首页的问题分析

### 问题 1：晨间问候卡片
```vue
<!-- 当前设计 -->
<view class="morning-hero">
  <image class="morning-hero-img" mode="aspectFill" /> <!-- 裁切！ -->
  <view class="morning-hero-content">...</view>
</view>
```

**问题**：
- ❌ `mode="aspectFill"` 会裁切图片
- ❌ 480rpx 固定高度，图片可能显示不完整
- ❌ 毛玻璃卡片遮挡插画
- ❌ 整体像"卡片套卡片"，不够协调

### 问题 2：序序卡片
```vue
<button class="chat-card">
  <image class="chat-bg" mode="aspectFill" /> <!-- 裁切！ -->
  <image class="chat-avatar" />
  <view class="chat-content">...</view>
</button>
```

**问题**：
- ❌ 背景插画被裁切
- ❌ 20% 透明度太淡，插画浪费
- ❌ 按钮内部层级复杂

### 问题 3：整体布局
- ❌ 卡片堆叠：问候卡片 → 体重卡片 → 记录卡片 → 序序卡片 → 快捷记录
- ❌ 缺乏整体感，像"功能列表"
- ❌ 没有主次关系
- ❌ 插画和内容关系混乱

---

## 全新设计方案（参考建档页）

### 方案：首页作为"一天的开始"整体设计

#### 布局结构
```
┌─────────────────────────────────┐
│  顶部问候区（简洁）              │
│  Hello, 用户名                   │
│  今天是美好的一天                │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│                                 │
│   主视觉插画区（完整显示）        │
│   home-hero-morning.png         │
│   使用 widthFix，不裁切          │
│                                 │
│   ┌───────────────────────┐     │
│   │  底部浮动：今日重点    │     │
│   │  体重 72.5kg          │     │
│   │  已记录 2/4           │     │
│   └───────────────────────┘     │
│                                 │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│  今日行动卡片（2x2 网格）        │
│  ┌──────┐ ┌──────┐             │
│  │ 体重  │ │ 饮食  │             │
│  └──────┘ └──────┘             │
│  ┌──────┐ ┌──────┐             │
│  │ 活动  │ │ 睡眠  │             │
│  └──────┘ └──────┘             │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│  和序序聊聊（横向卡片）          │
│  [头像] 分享今天的心情和困惑 [>] │
└─────────────────────────────────┘
```

#### 核心改进

**1. 主视觉区域（参考建档页）**
```vue
<view class="hero-section">
  <!-- 插画完整显示 -->
  <image 
    src="/static/illustrations/home-hero-morning.png"
    class="hero-illustration"
    mode="widthFix"  <!-- 关键：不裁切 -->
  />
  
  <!-- 渐变遮罩（从透明到薄荷绿） -->
  <view class="hero-gradient" />
  
  <!-- 底部浮动信息卡 -->
  <view class="hero-info">
    <view class="today-summary">
      <text class="summary-main">体重 72.5kg</text>
      <text class="summary-sub">已记录 2/4 项</text>
    </view>
    <button class="quick-record-btn">快速记录</button>
  </view>
</view>
```

**设计说明**：
- ✅ `mode="widthFix"`：图片完整显示
- ✅ 渐变遮罩：确保底部文字清晰
- ✅ 浮动信息卡：不遮挡插画主体
- ✅ 整体协调：像建档页一样，是"一个设计"而非"卡片堆叠"

**2. 今日行动（简化）**
```vue
<view class="daily-actions">
  <text class="section-title">今日行动</text>
  <view class="actions-grid">
    <!-- 2x2 大卡片，带图标 -->
  </view>
</view>
```

**改进**：
- ✅ 去掉"今日概览"冗余标题
- ✅ 直接展示 4 个行动卡片
- ✅ 简洁明了

**3. 序序卡片（简化）**
```vue
<button class="companion-card">
  <image class="companion-avatar" src="xuxu-avatar.png" />
  <view class="companion-text">
    <text class="companion-title">和序序聊聊</text>
    <text class="companion-desc">分享今天的心情</text>
  </view>
  <image class="arrow" />
</button>
```

**改进**：
- ✅ 去掉背景插画（太复杂）
- ✅ 简洁横向卡片
- ✅ 专注功能本身

---

## 设计原则总结

### 从建档页学到的

1. **图片优先**：
   - 使用 `widthFix` 确保完整显示
   - 不要用 `aspectFill` 裁切

2. **渐变遮罩是好朋友**：
   - 确保文字可读
   - 不需要毛玻璃

3. **浮动布局 > 绝对定位堆叠**：
   - 内容浮动在底部
   - 不遮挡主体

4. **整体设计 > 卡片堆叠**：
   - 首页应该是"一天的开始"
   - 不是"功能列表"

5. **简化、简化、再简化**：
   - 去掉不必要的装饰
   - 每个元素都有明确作用

---

## 实施计划

### 第一步：重构首页主视觉区
1. 移除当前的"晨间问候卡片"
2. 创建"主视觉区"（参考建档页结构）
3. 使用 widthFix，图片完整显示
4. 添加渐变遮罩
5. 底部浮动今日摘要

### 第二步：简化序序卡片
1. 移除背景插画
2. 简洁横向卡片设计

### 第三步：整体调整
1. 检查所有间距
2. 确保主次分明
3. 确保图片不被遮挡
4. 确保按钮大小合适

---

**接下来：立即实施首页重构**
