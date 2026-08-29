# 和生序小程序完整重新设计方案

## 从薄荷健康学到的核心设计规律

### 布局分析结果

通过对 8 张薄荷健康截图的程序化分析，发现：

**屏幕占比规律**：
- 0-20%：页面顶部区域（标题、头像）
- 20-40%：**主要内容区**（绿色大卡片或核心功能）
- 40-70%：功能列表（白卡片）
- 70-100%：次要功能或底部导航

**关键设计原则**：
1. **重要功能在前 40%**：用户无需滚动就能看到核心内容
2. **绿色占据大面积**：20-40% 区域是绿色主卡片，作为视觉焦点
3. **白卡片干净简洁**：充足间距，不拥挤
4. **层次清晰**：主卡片 → 功能卡片 → 次要功能

---

## 当前问题诊断

### 首页问题

1. **主视觉区太大**：home-hero-morning.png 是竖图（1024x1280），widthFix 后占据 50-60% 屏幕
   - ❌ 用户看不到今日记录四宫格（需要滚动）
   - ❌ 重要功能被挤到下方

2. **今日记录四宫格太大**：每个卡片 240rpx 高 + 间距
   - ❌ 占用太多空间
   - ❌ 不符合薄荷健康的紧凑设计

3. **体重信息被隐藏**：整合到主视觉区底部
   - ❌ 体重是核心数据，应该醒目
   - ❌ 现在要滚动到主视觉才能看到

4. **缺乏视觉焦点**：没有明显的"绿色大卡片"
   - ❌ 不符合薄荷健康的设计语言

### 记录页、聊天页问题

- 按钮太像 AI 生成
- 缺少视觉吸引力
- 布局单调

---

## 完整重新设计方案

### 首页（HomePage）

#### 屏幕占比规划（参考薄荷健康）

```
0-8%    顶部问候（Hello, 用户名）
        ↓
8-35%   【绿色主卡片】体重 + 今日进度 + 插画装饰
        - 左侧：体重 72.5kg（大字）+ 目标 65kg
        - 右侧：小插画装饰（home-companion-banner 局部）
        - 底部：进度条（2/4 已记录）
        ↓
35-60%  【今日记录】横向滑动卡片（不是 2x2 网格）
        - 4 个卡片横向排列
        - 用户滑动查看
        - 节省纵向空间
        ↓
60-75%  【和序序聊聊】简洁横向卡片
        ↓
75-90%  【快捷记录】4 列小图标
        ↓
90-100% 底部留白
```

#### 设计细节

**1. 绿色主卡片（20-35% 占比）**
```vue
<view class="main-card">
  <!-- 左侧：体重数据 -->
  <view class="main-card-data">
    <text class="label">体重</text>
    <view class="value-row">
      <text class="value">72.5</text>
      <text class="unit">kg</text>
    </view>
    <text class="target">目标 65kg</text>
  </view>
  
  <!-- 右侧：装饰插画 -->
  <image 
    class="main-card-deco"
    src="/static/illustrations/home-companion-banner.png"
    mode="aspectFill"
  />
  
  <!-- 底部：进度条 -->
  <view class="progress-bar">
    <view class="progress-fill" style="width: 50%" />
  </view>
  <text class="progress-text">今日已记录 2/4 项</text>
</view>
```

**样式**：
- 高度：固定 420rpx（占屏幕约 27%）
- 背景：渐变绿色 #e8f7ed → #d4f0dd
- 圆角：32rpx
- 投影：柔和
- 体重数字：96rpx（醒目但不夸张）

**2. 今日记录（横向滑动）**
```vue
<scroll-view scroll-x class="records-scroll">
  <view class="record-item" v-for="item in 4">
    <image class="record-icon" />
    <text class="record-label">体重</text>
    <view class="record-badge">已记录</view>
  </view>
</scroll-view>
```

**样式**：
- 每个卡片：200rpx 宽 x 180rpx 高
- 横向滑动，节省纵向空间
- 白卡片 + 绿色徽章

**3. 序序卡片（保持简洁）**
- 64rpx 头像（从 80rpx 缩小）
- 28rpx 标题
- 更紧凑

**4. 快捷记录（缩小）**
- 每个图标 72rpx（从 96rpx 缩小）
- 4 列布局
- 更紧凑

---

### 记录页（RecordsPage）

#### 重新设计记录按钮

**当前问题**：
- 表单式设计，像 AI 生成
- 缺少视觉吸引力

**新设计**：
```
顶部横幅（record-desk-banner.png）
  ↓
记录类型大卡片（2x2 网格）
┌──────────┐ ┌──────────┐
│  [秤图标] │ │ [碗图标]  │
│   体重    │ │   饮食    │
└──────────┘ └──────────┘
┌──────────┐ ┌──────────┐
│ [人图标]  │ │ [月图标]  │
│   活动    │ │   睡眠    │
└──────────┘ └──────────┘
```

**使用插画**：
- program-weight.png → 体重卡片背景
- program-digestive.png → 饮食卡片背景
- 其他类似

**样式**：
- 每个卡片 320rpx x 280rpx
- 插画 50% 透明度作为背景
- 大图标 + 大标题
- 点击后展开表单

---

### 聊天页（XuxuPage）

#### 添加温暖的视觉元素

```
顶部装饰卡片
┌─────────────────────────┐
│  [xuxu-safe-support.png] │
│  序序在这里陪伴你          │
└─────────────────────────┘
  ↓
对话气泡（优化）
  ↓
输入框（大圆角渐变）
```

---

## 需要生成的新图片

### 1. 记录类型图标（4 个）

由于现有插画太复杂，需要简洁图标：

**提示词**：
```
A set of 4 minimalist watercolor icons for health tracking,
Icon 1: Simple weighing scale
Icon 2: Simple food bowl with chopsticks  
Icon 3: Simple running person silhouette
Icon 4: Simple crescent moon

Style: 
- Soft watercolor texture
- Mint green (#7fcc8f) and white
- Clean geometric shapes
- Healing Japanese aesthetic
- Suitable for 160x160px cards
- Transparent background
- Each icon 512x512px PNG

Four separate icons, consistent style
```

### 2. 主卡片装饰元素（可选）

如果 home-companion-banner 不合适，生成：

**提示词**：
```
A small decorative watercolor illustration for health dashboard card,
- Soft mint green leaves and abstract shapes
- Light and airy composition
- Suitable for card corner decoration
- Healing and calming Japanese style
- 400x300px, transparent background, PNG
```

---

## 实施步骤

### Phase 1：首页核心重构
1. ✅ 移除大主视觉区（太占空间）
2. ✅ 创建绿色主卡片（体重 + 进度 + 装饰）
3. ✅ 今日记录改为横向滑动
4. ✅ 缩小序序卡片和快捷记录

### Phase 2：记录页重构
1. 重新设计记录类型选择（2x2 大卡片）
2. 使用 program-*.png 作为背景
3. 优化表单展开交互

### Phase 3：聊天页优化
1. 添加顶部装饰卡片
2. 优化对话气泡样式
3. 增强输入框设计

---

## 关键原则

1. **重要功能在前 40%**：无需滚动就能看到核心内容
2. **绿色主卡片占 20-30%**：视觉焦点
3. **紧凑不臃肿**：横向滑动 > 纵向堆叠
4. **图片完整显示**：widthFix 或控制尺寸
5. **按钮不遮挡图片**：合理布局

---

**立即开始实施 Phase 1：首页核心重构**
