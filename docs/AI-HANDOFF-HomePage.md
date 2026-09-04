# AI 交接文档 - 首页开发现状与规范

> 本文档用于AI间交接，描述当前首页开发状态、设计规范和后续开发指南

**文档更新时间**：2024-08-28 18:33  
**当前版本**：首页 V9.2  
**最后提交**：f43b8b8 - fix: improve icon visibility and loading state

---

## 📋 目录

1. [当前开发状态](#当前开发状态)
2. [设计规范](#设计规范)
3. [首页架构](#首页架构)
4. [待开发功能](#待开发功能)
5. [开发流程](#开发流程)
6. [常见问题](#常见问题)

---

## 当前开发状态

### ✅ 已完成功能

#### 首页 (HomePage.vue)
**路径**：`apps/mini/src/pages/home/HomePage.vue`  
**最后更新**：2024-08-28 18:33  
**版本**：V9.2

**已实现卡片**：
1. ✅ **体重管理方案卡片**
   - SVG半圆进度条（正确实现）
   - 三个数字：初始、当前（高亮）、目标
   - 动态进度计算
   - 紧凑布局（不占太多空间）

2. ✅ **饮食热量卡片**
   - 还可吃千卡大数字（64rpx）
   - 2个小数据框：饮食、运动×0.9
   - 横向滑动点（●●●装饰）
   - 5个快捷按钮：早餐🥚、午餐🍔、晚餐🍜、加餐🍎、运动👟
   - 序序相机按钮
   - 16:8饮食标签

3. ✅ **体重记录卡片**
   - 当前体重大数字（52rpx）
   - 更新时间显示
   - +按钮跳转记录
   - 迷你图表装饰

4. ✅ **2x2功能卡片**
   - 喝水（water-drop.jpg图标，80rpx）
   - 睡眠（sleep.jpg图标，80rpx）
   - 活动（activity.jpg图标，80rpx）
   - 心情（mood-smile.jpg图标，80rpx）
   - 所有图标60%不透明度，清晰可见

5. ✅ **轻断食卡片**
   - 16:8模式标签（蓝色）
   - 倒计时：01:04:08
   - 时钟emoji装饰（⏰，64rpx，50%透明）

6. ✅ **血糖卡片**
   - 暂无记录状态
   - -- mmol/L显示
   - 血糖emoji装饰（🩸，56rpx，50%透明）

7. ✅ **编辑首页卡片按钮**
   - 虚线边框（绿色）
   - ✎ 编辑图标
   - z-index: 10（可点击）
   - 点击跳转到 `/pages/home/edit-cards`（待创建）

**其他功能**：
- ✅ 顶部头像："和序序聊聊"提示
- ✅ 加载状态：白色卡片背景，深色文字
- ✅ 错误状态处理
- ✅ 治愈系动画（hz-rise）

### ❌ 待开发功能

1. **编辑首页卡片页面** - 优先级：🔴 高
   - 路径：`/pages/home/edit-cards`
   - 依据：和生序首页交互规范
   - 功能：拖拽排序、显示/隐藏卡片、保存设置

2. **更多图标生成** - 优先级：🟡 中
   - 轻断食时钟图标（替换⏰）
   - 血糖仪图标（替换🩸）
   - 生理期图标（新功能）
   - 其他健康功能图标

3. **运动记录卡片** - 优先级：🟡 中
   - 依据和生序体重管理卡片规范
   - 本周达成天数
   - 每日平均千卡
   - 7天柱状图

4. **更多可选卡片** - 优先级：🟢 低
   - 便便记录
   - 用药记录
   - 步数记录
   - 跳绳记录
   - 生理期记录
   - 健康习惯

---

## 设计规范

### 🎨 设计风格

**核心理念**：治愈系、日系、清新水彩风

**关键词**：
- 柔和
- 温暖
- 陪伴感
- 自然
- 呼吸感

### 🎨 颜色系统

```css
/* ===== 主色调 - 治愈绿 ===== */
--primary: #7fcc8f;              /* 主绿色 */
--primary-dark: #5a9572;         /* 深绿 */
--primary-darker: #2d6943;       /* 更深绿 */
--primary-light: #e8f7ed;        /* 浅绿背景 */
--primary-lighter: rgba(127, 204, 143, 0.12);  /* 超淡绿 */

/* ===== 背景色 ===== */
--bg-page: linear-gradient(180deg, #f8fdf9 0%, #f5f8f6 100%);  /* 页面渐变背景 */
--bg-card: #ffffff;              /* 卡片背景 */
--bg-input: rgba(232, 247, 237, 0.4);  /* 输入框/数据框背景 */

/* ===== 文字色 ===== */
--text-primary: #2d6943;         /* 主要文字（标题、数字） */
--text-secondary: #5a9572;       /* 次要文字（标签、单位） */
--text-tertiary: #76907d;        /* 辅助文字（提示） */
--text-hint: #9ba8a0;            /* 灰色提示文字 */

/* ===== 功能色 ===== */
--accent-blue: #6495ed;          /* 蓝色（轻断食） */
--accent-orange: #f4a460;        /* 橙色（心情） */
--accent-red: #dc6464;           /* 红色（血糖） */
--accent-purple: #c5b8e8;        /* 紫色（睡眠） */
```

### 📏 尺寸规范

#### 圆角
```css
--radius-sm: 12rpx;    /* 小圆角（输入框、小按钮） */
--radius-md: 16rpx;    /* 中圆角 */
--radius-lg: 24rpx;    /* 大圆角（卡片主圆角） */
--radius-xl: 28rpx;    /* 超大圆角 */
--radius-full: 999rpx; /* 完全圆角（胶囊按钮） */
```

#### 间距
```css
--space-xs: 8rpx;      /* 最小间距 */
--space-sm: 12rpx;     /* 小间距 */
--space-md: 16rpx;     /* 中间距（卡片间距） */
--space-lg: 20rpx;     /* 大间距 */
--space-xl: 24rpx;     /* 超大间距 */
--space-xxl: 32rpx;    /* 页面边距 */
```

#### 卡片规范
```css
.card {
  margin-bottom: 16rpx;           /* 卡片间距 */
  padding: 20rpx 24rpx;           /* 卡片内边距 */
  border-radius: 24rpx;           /* 卡片圆角 */
  background: #ffffff;            /* 卡片背景 */
  box-shadow: 0 2rpx 12rpx rgba(127, 204, 143, 0.08);  /* 柔和投影 */
}
```

### ✏️ 字体规范

#### 字号
```css
/* 标题 */
--font-title-lg: 32rpx;   /* 大标题（页面标题） */
--font-title-md: 28rpx;   /* 中标题 */
--font-title-sm: 26rpx;   /* 小标题（卡片标题） */

/* 正文 */
--font-body-lg: 24rpx;    /* 大正文（按钮） */
--font-body-md: 22rpx;    /* 中正文（普通文字） */
--font-body-sm: 20rpx;    /* 小正文（标签） */
--font-caption: 18rpx;    /* 说明文字 */

/* 数字 */
--font-number-xl: 64rpx;  /* 超大数字（饮食热量） */
--font-number-lg: 52rpx;  /* 大数字（体重） */
--font-number-md: 40rpx;  /* 中数字（2x2卡片） */
--font-number-sm: 30rpx;  /* 小数字（三个体重数据） */
```

#### 字重
```css
--font-weight-regular: 400;  /* 常规 */
--font-weight-medium: 600;   /* 中等（提示文字） */
--font-weight-bold: 700;     /* 粗体（按钮、标签） */
--font-weight-black: 900;    /* 超粗（大数字） */
```

### 🖼️ 图标规范

#### 尺寸
```css
/* 功能图标（2x2卡片装饰图标） */
--icon-size-decoration: 80rpx;      /* 装饰图标（右下角） */
--icon-opacity-decoration: 0.6;     /* 装饰图标透明度 */

/* 快捷按钮图标 */
--icon-size-action: 56rpx;          /* 圆形快捷按钮中的图标 */

/* 小图标 */
--icon-size-sm: 40rpx;              /* 小图标 */
```

#### 格式要求
- **格式**：JPG或PNG（带透明背景更佳）
- **源文件尺寸**：200x200px或更大
- **风格**：治愈系水彩风格
- **配色**：与主题色协调
- **命名**：kebab-case，如 `water-drop.jpg`

#### 已有图标
```
static/icons/
├── water-drop.jpg      # 喝水（80rpx, 水彩风格）
├── sleep.jpg           # 睡眠（80rpx）
├── activity.jpg        # 活动（80rpx）
├── mood-smile.jpg      # 心情（80rpx）
├── scale.svg           # 体重秤（40rpx）
└── [其他SVG图标]
```

#### 待生成图标
根据 `IMAGE-RESOURCES-PLAN.md`：

1. **轻断食时钟图标** (`fasting-clock.jpg`)
   ```
   提示词：
   A minimalist clock icon for intermittent fasting,
   Simple clock face with subtle hands,
   Soft watercolor style with light blue gradient,
   Healing Japanese aesthetic,
   Clean and modern,
   Transparent background,
   200x200px
   ```

2. **血糖仪图标** (`blood-sugar.jpg`)
   ```
   提示词：
   A minimalist blood glucose meter icon,
   Simple rectangular device shape,
   Soft watercolor style with light red/pink gradient,
   Healing Japanese aesthetic,
   Medical but gentle,
   Transparent background,
   200x200px
   ```

3. **生理期图标** (`menstruation.jpg`)
   ```
   提示词：
   A minimalist menstruation period icon,
   Gentle flower or calendar symbol,
   Soft watercolor style with pink gradient,
   Healing Japanese aesthetic,
   Warm and comforting,
   Transparent background,
   200x200px
   ```

---

## 首页架构

### 📁 文件结构

```
apps/mini/src/pages/home/
├── HomePage.vue              # 首页主文件（V9.2）
├── HomePage_backup.vue       # 备份文件（V8版本）
├── HomePage.spec.ts          # 单元测试
├── edit-cards.vue           # 编辑卡片页面（待创建）
└── README.md                # 本地文档（可选）
```

### 🧩 组件结构

```vue
<template>
  <view class="page">
    <!-- 顶部 -->
    <view class="header">头像 + 问候语</view>
    
    <!-- 加载/错误状态 -->
    <view v-if="loading" class="loading">...</view>
    
    <!-- 主内容 -->
    <template v-else-if="today && experience">
      <!-- 1. 体重管理卡片 -->
      <view class="weight-card card">...</view>
      
      <!-- 2. 饮食热量卡片 -->
      <view class="calorie-card card">...</view>
      
      <!-- 3. 体重记录卡片 -->
      <view class="record-card card">...</view>
      
      <!-- 4. 2x2功能卡片 -->
      <view class="grid-cards">
        <button class="grid-item card">喝水</button>
        <button class="grid-item card">睡眠</button>
        <button class="grid-item card">活动</button>
        <button class="grid-item card">心情</button>
      </view>
      
      <!-- 5. 轻断食卡片 -->
      <view class="fasting-card card">...</view>
      
      <!-- 6. 血糖卡片 -->
      <view class="sugar-card card">...</view>
      
      <!-- 7. 编辑首页卡片按钮 -->
      <button class="edit-card">...</button>
    </template>
    
    <!-- 底部导航 -->
    <MiniTabBar active="home" />
  </view>
</template>
```

### 🔄 数据流

```typescript
// 数据来源
healthLoopState.today        // 今日健康数据
healthLoopState.loading      // 加载状态
healthLoopState.error        // 错误信息

// 计算属性
greeting                     // 问候语（早上好/下午好/晚上好）
dateLabel                    // 日期标签
displayName                  // 用户昵称
startWeight                  // 初始体重
currentWeight                // 当前体重
targetWeight                 // 目标体重
progress                     // 进度百分比（0-100）
```

### 🎬 动画

```css
@keyframes hz-rise {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
}

.hz-rise {
  animation: hz-rise 0.6s cubic-bezier(0.22, 0.8, 0.36, 1) both;
}

.hz-rise-1 { animation-delay: 0.1s; }
.hz-rise-2 { animation-delay: 0.2s; }
.hz-rise-3 { animation-delay: 0.3s; }
/* ... 以此类推 */
```

---

## 待开发功能

### 🔴 优先级 1：编辑首页卡片功能

#### 功能描述
依据和生序首页规范，实现卡片的显示/隐藏和拖拽排序。

#### 文件路径
`apps/mini/src/pages/home/edit-cards.vue`

#### 页面结构
```vue
<template>
  <view class="page">
    <!-- 顶部 -->
    <view class="header">
      <button class="back-btn" @tap="goBack">←</button>
      <text class="title">编辑首页卡片</text>
      <button class="save-btn" @tap="save">保存</button>
    </view>
    
    <!-- 展示在首页的卡片 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">展示在首页的卡片</text>
        <text class="section-hint">长按拖拽调整卡片</text>
      </view>
      
      <view class="card-list">
        <view
          v-for="card in visibleCards"
          :key="card.id"
          class="card-item"
          @longpress="startDrag(card)"
        >
          <button class="remove-btn" @tap="hideCard(card)">-</button>
          <image class="card-icon" :src="card.icon" />
          <text class="card-name">{{ card.name }}</text>
          <view class="drag-handle">☰</view>
        </view>
      </view>
    </view>
    
    <!-- 隐藏的卡片 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">隐藏的卡片</text>
      </view>
      
      <view class="card-list">
        <view
          v-for="card in hiddenCards"
          :key="card.id"
          class="card-item"
        >
          <button class="add-btn" @tap="showCard(card)">+</button>
          <image class="card-icon" :src="card.icon" />
          <text class="card-name">{{ card.name }}</text>
        </view>
      </view>
    </view>
    
    <!-- 底部保存按钮 -->
    <button class="save-big-btn" @tap="save">保存编辑</button>
  </view>
</template>
```

#### 数据结构
```typescript
interface Card {
  id: string;            // 唯一标识
  name: string;          // 卡片名称
  icon: string;          // 图标路径
  visible: boolean;      // 是否显示在首页
  order: number;         // 排序序号
  type: CardType;        // 卡片类型
}

enum CardType {
  WEIGHT_MANAGEMENT = 'weight-management',
  CALORIE = 'calorie',
  WEIGHT_RECORD = 'weight-record',
  WATER = 'water',
  SLEEP = 'sleep',
  ACTIVITY = 'activity',
  MOOD = 'mood',
  FASTING = 'fasting',
  BLOOD_SUGAR = 'blood-sugar',
  MENSTRUATION = 'menstruation',    // 新增：生理期
  MEDICATION = 'medication',         // 新增：用药
  STEPS = 'steps',                   // 新增：步数
  ROPE_JUMPING = 'rope-jumping',     // 新增：跳绳
  HABIT = 'habit',                   // 新增：健康习惯
  STOOL = 'stool',                   // 新增：便便
}
```

#### 默认卡片配置
```typescript
const defaultCards: Card[] = [
  { id: '1', name: '饮食热量', icon: '🍎', visible: true, order: 1, type: CardType.CALORIE },
  { id: '2', name: '体重记录', icon: '⚖️', visible: true, order: 2, type: CardType.WEIGHT_RECORD },
  { id: '3', name: '喝水', icon: '/static/icons/water-drop.jpg', visible: true, order: 3, type: CardType.WATER },
  { id: '4', name: '睡眠', icon: '/static/icons/sleep.jpg', visible: true, order: 4, type: CardType.SLEEP },
  { id: '5', name: '活动', icon: '/static/icons/activity.jpg', visible: true, order: 5, type: CardType.ACTIVITY },
  { id: '6', name: '心情', icon: '/static/icons/mood-smile.jpg', visible: true, order: 6, type: CardType.MOOD },
  { id: '7', name: '轻断食', icon: '⏰', visible: true, order: 7, type: CardType.FASTING },
  { id: '8', name: '血糖', icon: '🩸', visible: true, order: 8, type: CardType.BLOOD_SUGAR },
  
  // 隐藏的卡片
  { id: '9', name: '用药', icon: '💊', visible: false, order: 9, type: CardType.MEDICATION },
  { id: '10', name: '步数', icon: '👟', visible: false, order: 10, type: CardType.STEPS },
  { id: '11', name: '跳绳', icon: '🏃', visible: false, order: 11, type: CardType.ROPE_JUMPING },
  { id: '12', name: '生理期', icon: '🌸', visible: false, order: 12, type: CardType.MENSTRUATION },
  { id: '13', name: '健康习惯', icon: '📋', visible: false, order: 13, type: CardType.HABIT },
  { id: '14', name: '便便', icon: '💩', visible: false, order: 14, type: CardType.STOOL },
];
```

#### 功能实现要点

1. **数据持久化**
   ```typescript
   // 使用 uni.setStorageSync 保存配置
   const saveCardConfig = () => {
     uni.setStorageSync('home-card-config', cards.value);
   };
   
   // 页面加载时读取配置
   const loadCardConfig = () => {
     const saved = uni.getStorageSync('home-card-config');
     if (saved) {
       cards.value = saved;
     } else {
       cards.value = defaultCards;
     }
   };
   ```

2. **拖拽排序**
   ```typescript
   // 使用movable-view或第三方库实现拖拽
   // 或者简单实现：上移/下移按钮
   const moveUp = (card: Card) => {
     // 与前一个卡片交换order
   };
   
   const moveDown = (card: Card) => {
     // 与后一个卡片交换order
   };
   ```

3. **显示/隐藏切换**
   ```typescript
   const showCard = (card: Card) => {
     card.visible = true;
     card.order = Math.max(...visibleCards.value.map(c => c.order)) + 1;
   };
   
   const hideCard = (card: Card) => {
     card.visible = false;
   };
   ```

4. **HomePage读取配置**
   ```typescript
   // 在HomePage.vue中
   const cardConfig = ref<Card[]>([]);
   
   onMounted(() => {
     const saved = uni.getStorageSync('home-card-config');
     cardConfig.value = saved || defaultCards;
   });
   
   // 根据配置动态渲染卡片
   const visibleCards = computed(() => 
     cardConfig.value.filter(c => c.visible).sort((a, b) => a.order - b.order)
   );
   ```

#### 样式参考
```css
.card-item {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  margin-bottom: 16rpx;
  border-radius: 20rpx;
  background: #ffffff;
  box-shadow: 0 2rpx 12rpx rgba(127, 204, 143, 0.08);
}

.remove-btn, .add-btn {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
}

.remove-btn {
  background: #ffebee;
  color: #ef5350;
}

.add-btn {
  background: #e8f7ed;
  color: #7fcc8f;
}

.save-big-btn {
  position: fixed;
  bottom: calc(env(safe-area-inset-bottom) + 32rpx);
  left: 32rpx;
  right: 32rpx;
  height: 88rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #7fcc8f 0%, #5a9572 100%);
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 700;
  box-shadow: 0 8rpx 24rpx rgba(127, 204, 143, 0.3);
}
```

---

### 🟡 优先级 2：运动记录卡片

依据和生序数据层级规范，添加运动统计卡片。

**文件位置**：在 `HomePage.vue` 中添加

**设计要点**：
- 本周达成天数
- 每日平均千卡
- 7天柱状图（可以用SVG或Canvas）
- 插在体重记录和2x2卡片之间

---

### 🟢 优先级 3：更多可选卡片

根据编辑功能，逐步添加新卡片：
- 便便记录卡片
- 用药记录卡片
- 步数记录卡片
- 跳绳记录卡片
- 生理期记录卡片
- 健康习惯卡片

每个卡片的结构类似现有卡片，参考设计规范统一风格。

---

## 开发流程

### 🔧 本地开发

1. **启动开发服务器**
   ```bash
   cd apps/mini
   npx uni -p mp-weixin
   ```

2. **微信开发者工具导入**
   ```
   D:\禾伴\heban-ai-health-demo\apps\mini\dist\dev\mp-weixin\project.config.json
   ```

3. **修改代码**
   - 修改 `src/pages/home/HomePage.vue`
   - 保存后自动编译
   - 微信开发者工具点击"编译"查看效果

### 🧪 测试

```bash
# 运行所有测试
cd apps/mini
npx vitest run

# 运行首页测试
npx vitest run src/pages/home/*.spec.ts

# 监听模式
npx vitest watch
```

### 📦 构建

```bash
# 开发构建
npx uni -p mp-weixin

# 生产构建
npx uni build -p mp-weixin
```

### 📝 提交规范

```bash
# feat: 新功能
git commit -m "feat: add edit cards page"

# fix: 修复bug
git commit -m "fix: icon visibility issue"

# style: 样式调整
git commit -m "style: adjust card spacing"

# refactor: 重构
git commit -m "refactor: simplify card component"

# docs: 文档
git commit -m "docs: update development guide"
```

### 🔄 开发流程建议

1. **阅读本文档** - 了解当前状态和规范
2. **查看参考图片** - 理解设计意图
   - 和生序首页整体布局
   - 和生序下半屏卡片
   - 和生序编辑功能
3. **创建功能分支** - `git checkout -b feat/edit-cards`
4. **编写代码** - 遵循设计规范
5. **本地测试** - 确保功能正常
6. **提交代码** - 使用规范的commit message
7. **更新文档** - 更新本文档的"已完成"部分

---

## 常见问题

### Q1: 构建后页面空白？

**原因**：
- 微信开发者工具缓存
- 构建出错

**解决方案**：
1. 关闭微信开发者工具
2. 删除 `dist/dev/mp-weixin` 目录
3. 重新构建：`npx uni -p mp-weixin`
4. 重新打开微信开发者工具
5. 点击"清除缓存" → "清除全部缓存"

### Q2: 图标不显示？

**原因**：
- 图标路径错误
- 图标文件不存在

**解决方案**：
1. 检查图标是否在 `src/static/icons/` 目录
2. 检查路径是否正确：`/static/icons/xxx.jpg`
3. 检查文件名大小写
4. 重新构建

### Q3: SVG不显示？

**原因**：
- 微信小程序对SVG支持有限
- 只能用内联SVG

**解决方案**：
```vue
<!-- ✅ 正确：内联SVG -->
<svg viewBox="0 0 200 110">
  <path d="..." />
</svg>

<!-- ❌ 错误：引用SVG文件 -->
<image src="/static/icons/xxx.svg" />
```

### Q4: 如何调整卡片顺序？

在 `HomePage.vue` 的模板中直接调整卡片的顺序，或者等编辑功能完成后通过编辑页面调整。

### Q5: 如何添加新的卡片？

1. 在模板中添加新卡片结构
2. 参考现有卡片的样式
3. 确保类名遵循规范
4. 添加动画延迟类（hz-rise-X）
5. 测试并提交

### Q6: 颜色不对怎么办？

参考本文档"设计规范 → 颜色系统"，使用统一的颜色变量或直接使用颜色值。

### Q7: 如何生成新图标？

1. 参考"待生成图标"部分的提示词
2. 使用 AI 图像生成工具（如 GPT-image2）
3. 生成 200x200px 的水彩风格图标
4. 保存为 JPG 或 PNG
5. 放入 `assets/icon/` 目录
6. 告知 AI 进行配置

---

## 参考资料

### 项目文档
- [项目交接说明](../../docs/engineering/handoff.md)
- [项目结构规范](../../docs/engineering/project-structure.md)
- [本地开发说明](../../docs/engineering/local-development.md)

### 设计参考
- 和生序产品交互截图（图1-4）
- 项目插画资源：`assets/illustrations/`

### 技术文档
- [Vue 3 文档](https://cn.vuejs.org/)
- [UniApp 文档](https://uniapp.dcloud.net.cn/)
- [微信小程序文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)

---

## 更新日志

### 2024-08-28 18:33 - V9.2
- 修复图标可见性（80rpx, 60%不透明度）
- 修复加载状态背景
- 创建本文档

### 2024-08-28 18:04 - V9.1
- 添加4个水彩风格自定义图标
- 修复CSS语法错误

### 2024-08-28 17:41 - V9.0
- 完整重写首页
- SVG半圆进度条
- 治愈系设计风格
- 紧凑卡片布局

---

## 联系方式

如有问题，请：
1. 查看本文档
2. 查看项目根目录 `README.md`
3. 查看 `docs/` 目录下的其他文档

---

**文档维护**：每次重大更新后，请更新本文档的"当前开发状态"和"更新日志"部分。
