# 首页完全重新设计（第3版）

## 建档页为什么好？

**核心**：图片 + 渐变遮罩 + 底部浮动内容 = **一个整体**，不是堆叠

```vue
<view class="welcome-fullscreen">
  <!-- 1. 背景插画：完整显示 -->
  <image mode="widthFix" />
  
  <!-- 2. 渐变遮罩：确保文字可读 -->
  <view class="welcome-gradient" />
  
  <!-- 3. 内容浮动在底部 -->
  <view class="welcome-body">
    <view class="xuxu-bubble">...</view>
    <view class="welcome-message">...</view>
    <button>开始了解我</button>
  </view>
</view>
```

**关键**：
- 图片不被遮挡（widthFix）
- 渐变遮罩让文字清晰
- 内容在底部，不破坏图片

---

## 首页新设计（完全不同）

### 用户的问题

1. ❌ 背景图被绿色卡片遮挡
2. ❌ 今日记录和快捷记录重复
3. ❌ 底部"今日小行动"太丑
4. ❌ 还在做卡片堆叠

### 新方案：沉浸式主视觉 + 浮动卡片

```
┌─────────────────────────────────┐
│                                 │
│   home-hero-morning.png         │
│   （widthFix 完整显示）          │
│                                 │
│         渐变遮罩                 │
│                                 │
│   ┌─────────────────────┐       │
│   │ 今日体重 72.5kg     │       │
│   │ 已记录 2/4          │       │
│   └─────────────────────┘       │
│                                 │
└─────────────────────────────────┘
        ↓
  【今日行动】4个大按钮
  ┌────┐ ┌────┐ ┌────┐ ┌────┐
  │体重│ │饮食│ │活动│ │睡眠│
  └────┘ └────┘ └────┘ └────┘
        ↓
  【和序序聊聊】横向卡片
  [头像] 分享今天的心情 [>]
        ↓
  底部留白
```

**改进**：
1. ✅ 主视觉图片完整显示（widthFix）
2. ✅ 渐变遮罩 + 底部浮动信息（不遮挡图片）
3. ✅ 合并"今日记录"和"快捷记录"为"今日行动"（4个大按钮）
4. ✅ 移除丑陋的"今日小行动"文字区域
5. ✅ 简洁、有呼吸感

---

## 详细设计

### 1. 主视觉区（参考建档页）

```vue
<view class="hero-fullscreen">
  <!-- 背景插画：完整显示 -->
  <image
    src="/static/illustrations/home-hero-morning.png"
    class="hero-illustration"
    mode="widthFix"
  />
  
  <!-- 渐变遮罩：从透明到薄荷绿 -->
  <view class="hero-gradient" />
  
  <!-- 底部浮动信息 -->
  <view class="hero-body">
    <view class="today-summary">
      <view class="summary-row">
        <text class="summary-label">今日体重</text>
        <view class="summary-value">
          <text class="value-num">72.5</text>
          <text class="value-unit">kg</text>
        </view>
      </view>
      <view class="summary-row">
        <text class="summary-label">今日进度</text>
        <text class="summary-value">2/4 已记录</text>
      </view>
    </view>
  </view>
</view>
```

**关键**：
- widthFix：图片完整显示，不裁切
- 渐变遮罩：底部 60% 高度，确保文字清晰
- 浮动卡片：半透明毛玻璃，不破坏图片美感
- **图片是主角，信息是配角**

### 2. 今日行动（合并今日记录 + 快捷记录）

```vue
<view class="actions-section">
  <text class="section-title">今日行动</text>
  <view class="actions-grid">
    <button class="action-btn">
      <image src="weight-icon.svg" />
      <text>体重</text>
      <view class="action-badge">已记录</view>
    </button>
    <!-- 饮食、活动、睡眠 -->
  </view>
</view>
```

**改进**：
- 合并重复功能
- 2x2 大按钮（不是小卡片）
- 每个 180rpx x 160rpx
- 干净简洁

### 3. 序序卡片（保持简洁）

```vue
<button class="companion-card">
  <image src="xuxu-avatar.png" class="avatar" />
  <view class="content">
    <text class="title">和序序聊聊</text>
    <text class="desc">分享今天的心情</text>
  </view>
  <image src="arrow.svg" />
</button>
```

### 4. 移除的内容

- ❌ 绿色主卡片（遮挡图片）
- ❌ 今日记录横向滑动
- ❌ 快捷记录
- ❌ "今日小行动"文字区域（太丑）
- ❌ 小行动列表

---

## 屏幕占比

```
0-5%    顶部问候（Hello, 用户名）
        ↓
5-55%   【主视觉区】
        - home-hero-morning.png 完整显示
        - 底部浮动：体重 + 进度
        - 图片是主角
        ↓
55-80%  【今日行动】4 个大按钮
        - 体重、饮食、活动、睡眠
        - 2x2 网格
        ↓
80-95%  【序序卡片】
        ↓
95-100% 底部留白
```

---

## 为什么这样设计

### 参考建档页

1. **图片完整显示**：widthFix，不裁切
2. **渐变遮罩**：确保文字可读，不破坏图片
3. **浮动内容**：在底部，不遮挡主体
4. **整体设计**：图片 + 信息 = 一个整体

### 解决问题

1. ✅ 背景图完整显示，不被遮挡
2. ✅ 合并今日记录和快捷记录（功能重复）
3. ✅ 移除丑陋的文字区域
4. ✅ 简洁、有呼吸感
5. ✅ 重要功能（体重、行动按钮）一眼可见

### 用户体验

- **5-55% 主视觉**：一打开就看到美丽的插画 + 核心信息
- **55-80% 今日行动**：4 个大按钮，立即可操作
- **简洁流畅**：不需要滚动太多

---

## 立即实施

1. 移除绿色主卡片
2. 恢复主视觉区（widthFix + 渐变遮罩 + 浮动信息）
3. 合并今日记录和快捷记录为"今日行动"
4. 移除"今日小行动"区域
5. 简化序序卡片

**让图片成为主角，而不是背景！**
