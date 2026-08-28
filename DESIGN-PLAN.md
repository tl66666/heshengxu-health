# 和生序小程序完整重构规划

## 当前问题分析

你的反馈：
1. 之前生成的图片都没用上（22 张插画资源）
2. 首页、记录页、聊天页等都太丑像 AI 生成
3. 排版、布局、图片、按键样式都有问题
4. 不要被旧代码束缚

## 设计目标

- 参考薄荷健康的设计
- 参考苹果官网的高级感
- 保持治愈系日系清新水彩风格
- 充分使用已生成的插画资源

---

## 一、资源盘点

### 已生成的插画资源（22 张）

#### 序序相关（6 张）
- xuxu-avatar.png/jpg - 序序头像
- xuxu-ai-empty.png - 空状态
- xuxu-complete.png - 完成状态
- xuxu-record-reminder.png - 记录提醒
- xuxu-safe-support.png - 安全支持
- xuxu-sleep-reminder.png - 睡眠提醒

#### 欢迎引导（4 张）
- onboarding-guide-vertical.png - 引导页竖版
- onboarding-hero-square.png - 引导页方形
- onboarding-hero-vertical.png - 引导页竖版主视觉

#### 首页 Hero（3 张）
- home-hero-morning.png - 首页晨间主视觉
- home-companion-banner.png - 陪伴横幅
- hero.jpg - 主视觉

#### 计划方案（5 张）
- program-weight.png - 体重管理
- program-sleep.png - 睡眠管理
- program-metabolic.png - 代谢健康
- program-digestive.png - 消化健康
- program-mood.png - 情绪管理

#### 记录与洞察（4 张）
- record-desk-banner.png - 记录页横幅
- insight-report-banner.png - 洞察报告横幅
- weekly-insight-banner.png - 每周洞察横幅
- leaf-corner-decoration.png - 叶子角落装饰

---

## 二、页面重构优先级与规划

### P0（立即重构）

#### 1. 首页（HomePage）
**当前问题**：
- 缺少主视觉插画
- 和序序聊聊太简单

**重构方案**：
- ✅ 体重卡片：108rpx 超大数字（已完成）
- ✅ 今日记录：2x2 四宫格（已完成）
- 🔲 添加首页 Hero：使用 home-hero-morning.png
- 🔲 序序卡片：使用 xuxu-avatar.png + 更丰富内容
- 🔲 底部装饰：使用 leaf-corner-decoration.png

#### 2. 记录页（RecordsPage）
**当前问题**：
- 按钮太丑像 AI
- 缺少插画装饰
- 布局拥挤

**重构方案**：
- 🔲 顶部横幅：使用 record-desk-banner.png
- 🔲 记录按钮：大卡片设计（参考首页今日记录）
- 🔲 空状态：使用 xuxu-record-reminder.png
- 🔲 完成态：使用 xuxu-complete.png

#### 3. 聊天页（XuxuPage）
**当前问题**：
- 界面太简单
- 缺少插画

**重构方案**：
- 🔲 顶部装饰：使用 xuxu-safe-support.png
- 🔲 空状态：使用 xuxu-ai-empty.png
- 🔲 气泡样式：更圆润、有投影
- 🔲 输入框：大圆角、渐变背景

### P1（后续优化）

#### 4. 我的页（MePage）
**重构方案**：
- 🔲 顶部卡片：个人信息 + 头像
- 🔲 功能列表：大卡片设计
- 🔲 底部装饰：leaf-corner-decoration.png

#### 5. 计划页（PlanPage）
**重构方案**：
- 🔲 方案卡片：使用 program-*.png 插画
- 🔲 大卡片布局：2 列网格
- 🔲 选择态：渐变背景 + 投影

#### 6. 每周回顾（WeeklyReviewPage）
**重构方案**：
- 🔲 顶部横幅：weekly-insight-banner.png
- 🔲 数据可视化：大数字 + 图表
- 🔲 洞察卡片：使用 insight-report-banner.png

---

## 三、设计系统规范

### 色彩系统
```
主色（薄荷绿）：
- #7fcc8f（主色）
- #67a37b（深色）
- #e8f7ed（浅色背景）

辅助色：
- 金色：#f4e3a0, #fff9e6
- 天空蓝：#c5e3f6, #dff0f9
- 玫瑰粉：#f8d8e0, #fceef1

背景：
- 页面背景：#f6faf7
- 卡片背景：#ffffff → #fafcfb（渐变）

文字：
- 标题：#2d6943
- 正文：#284d36
- 辅助：#76907d
```

### 尺寸系统
```
字号：
- 超大数字：108rpx（体重等关键数据）
- 页面标题：48rpx
- 区块标题：34rpx
- 卡片标题：32rpx
- 正文：28rpx
- 辅助文字：24-26rpx

图标：
- 大圆形图标：108rpx（今日记录）
- 中圆形图标：96rpx（快捷记录）
- 小圆形图标：80rpx（头像）
- 图标内容：48-52rpx

圆角：
- 大卡片：36rpx
- 中卡片：32rpx
- 小卡片/按钮：28rpx
- 圆形按钮：999rpx

间距：
- 区块间距：32-36rpx
- 卡片间距：20-24rpx
- 网格间距：16-20rpx
- 内容内间距：24-32rpx
```

### 投影系统
```
轻投影：0 6rpx 24rpx rgba(46, 97, 64, 0.06)
标准投影：0 8rpx 28rpx rgba(46, 97, 64, 0.08)
强投影：0 12rpx 40rpx rgba(127, 204, 143, 0.15)
金色投影：0 10rpx 32rpx rgba(239, 214, 137, 0.2)
```

### 动效系统
```
缓动：cubic-bezier(0.22, 0.8, 0.36, 1)
时长：0.25-0.3s
上移：translateY(-4 ~ -6rpx)
缩放：scale(0.94 ~ 0.98)
```

---

## 四、实施计划

### 第一阶段：首页完善（当前）
1. ✅ 重构体重卡片、今日记录、和序序聊聊、快捷记录
2. 🔲 添加首页 Hero（home-hero-morning.png）
3. 🔲 优化序序卡片（添加更多内容）
4. 🔲 添加角落装饰（leaf-corner-decoration.png）

### 第二阶段：记录页重构
1. 🔲 添加顶部横幅（record-desk-banner.png）
2. 🔲 重新设计记录按钮（大卡片样式）
3. 🔲 添加空状态和完成态插画

### 第三阶段：聊天页重构
1. 🔲 添加顶部装饰
2. 🔲 重新设计对话气泡
3. 🔲 优化输入框

### 第四阶段：其他页面优化
1. 🔲 我的页
2. 🔲 计划页
3. 🔲 每周回顾页

---

## 五、关键设计原则

1. **不被旧代码束缚**：完全重新设计布局和样式
2. **插画优先**：每个页面都要用上合适的插画
3. **大尺寸**：按钮、图标、间距都要大（参考薄荷健康）
4. **柔和投影**：所有卡片都要有柔和的双层投影
5. **渐变背景**：卡片、按钮都用渐变而非纯色
6. **动效反馈**：所有可点击元素都要有动效
7. **呼吸感**：更多留白、更大间距
8. **统一性**：所有页面使用统一的设计系统

---

## 当前状态

- ✅ 启动页：已重构（去透明 + 纯色渐变）
- ✅ 建档页：已优化（背景上移 + 气泡透明度）
- ✅ 首页：已完成布局重构（体重卡片 + 今日记录 + 快捷记录）
- 🔲 首页：待添加插画和装饰
- 🔲 记录页：待重构
- 🔲 聊天页：待重构
- 🔲 其他页面：待优化

---

**接下来立即开始：首页添加插画 + 记录页重构**
