# 插画资源使用规划

## 现有资源分析（22张）

### 横向横幅（2张）- 适合做页面顶部 Hero
1. **hero.jpg** (1672x941) - 通用 Hero，宽高比 1.78
2. **weekly-insight-banner.png** (1200x360) - 周报横幅，超宽比例 3.33

### 方形/近方形（15张）- 适合做卡片内插图
**序序系列（6张）**：
- xuxu-avatar.jpg/png (1254x1254) - 头像
- xuxu-ai-empty.png (1024x1024) - 空状态
- xuxu-complete.png (1024x1024) - 完成庆祝
- xuxu-record-reminder.png (1254x1254) - 记录提醒
- xuxu-safe-support.png (1024x1024) - 安全陪伴
- xuxu-sleep-reminder.png (1254x1254) - 睡眠提醒

**计划方案（5张）**：
- program-weight.png (1024x1024) - 体重管理
- program-sleep.png (1024x1024) - 睡眠管理
- program-metabolic.png (1024x1024) - 代谢健康
- program-digestive.png (1024x1024) - 消化健康
- program-mood.png (1024x1024) - 情绪管理

**其他方形（4张）**：
- home-companion-banner.png (1536x1024, 1.5) - 首页陪伴横幅
- home-hero-morning.png (1024x1280, 0.8) - 首页晨间（竖向）
- insight-report-banner.png (1536x1024, 1.5) - 洞察报告
- record-desk-banner.png (1536x1024, 1.5) - 记录页横幅
- leaf-corner-decoration.png (1254x1254) - 叶子装饰

### 竖向海报（2张）- 适合做引导页
- onboarding-guide-vertical.png (1024x1536)
- onboarding-hero-vertical.png (1024x1536)
- onboarding-hero-square.png (1254x1254)

---

## 页面使用方案

### 首页（HomePage）

#### 当前状态
✅ 体重卡片：108rpx 超大数字
✅ 今日记录：2x2 四宫格大卡片
✅ 和序序聊聊：简洁横向卡片
✅ 快捷记录：96rpx 大图标

#### 需要改进
🔲 缺少主视觉 Hero 区域
🔲 序序卡片太简单，没有插画装饰
🔲 缺少角落装饰元素

#### 插画使用方案

**方案 A：顶部 Hero 横幅**
```
使用：hero.jpg (1672x941)
位置：页面顶部，问候语下方
尺寸：全宽 x 400rpx 高
设计：圆角 36rpx + 柔和投影
作用：建立情感连接，营造氛围
```

**方案 B：序序陪伴卡片**
```
使用：home-companion-banner.png (1536x1024)
位置：和序序聊聊卡片内，左侧或背景
尺寸：180rpx x 120rpx（左侧）或全宽背景
设计：作为卡片装饰，不抢主题
作用：增强陪伴感
```

**方案 C：晨间问候卡片**
```
使用：home-hero-morning.png (1024x1280)
位置：顶部独立卡片，显示问候语 + 插画
尺寸：全宽 x 460rpx
设计：左侧插画 + 右侧文字，或上下布局
作用：温暖的早晨问候
```

**方案 D：角落装饰**
```
使用：leaf-corner-decoration.png (1254x1254)
位置：页面右下角或底部
尺寸：200rpx x 200rpx，透明度 0.15
设计：固定定位，不影响布局
作用：增加水彩自然感
```

**推荐组合**：C（晨间问候卡片）+ B（序序卡片装饰）+ D（角落装饰）

---

### 记录页（RecordsPage）

#### 当前状态
✅ 已使用 record-desk-banner.png 作为欢迎横幅
❌ 记录按钮太像 AI，样式问题

#### 需要改进
🔲 重新设计记录类型按钮（大卡片样式）
🔲 空状态需要插画
🔲 完成态需要庆祝插画

#### 插画使用方案

**空状态**
```
使用：xuxu-record-reminder.png (1254x1254)
位置：无记录时页面中央
尺寸：320rpx x 320rpx
设计：柔和投影 + 下方文字
```

**完成态**
```
使用：xuxu-complete.png (1024x1024)
位置：记录提交成功后的反馈
尺寸：240rpx x 240rpx
设计：弹窗或页面顶部
```

---

### 聊天页（XuxuPage）

#### 当前状态
❌ 界面太简单
❌ 缺少插画装饰

#### 需要改进
🔲 顶部添加陪伴感插画
🔲 空状态使用专门插画
🔲 气泡样式优化

#### 插画使用方案

**顶部装饰**
```
使用：xuxu-safe-support.png (1024x1024)
位置：聊天页顶部卡片
尺寸：全宽 x 280rpx
设计：柔和渐变背景 + 插画
作用：营造安全陪伴氛围
```

**空状态**
```
使用：xuxu-ai-empty.png (1024x1024)
位置：无对话历史时
尺寸：280rpx x 280rpx
设计：居中 + 引导文字
```

---

### 计划页（PlanPage）

#### 插画使用方案

**方案卡片**
```
使用：program-*.png 系列（5张）
- program-weight.png - 体重管理
- program-sleep.png - 睡眠管理
- program-metabolic.png - 代谢健康
- program-digestive.png - 消化健康
- program-mood.png - 情绪管理

位置：方案选择卡片顶部或左侧
尺寸：每个 160rpx x 160rpx
设计：2列网格布局，大卡片
```

---

### 每周回顾（WeeklyReviewPage）

#### 插画使用方案

**顶部横幅**
```
使用：weekly-insight-banner.png (1200x360)
位置：页面顶部
尺寸：全宽 x 240rpx
设计：超宽横幅，圆角 28rpx
```

**洞察报告卡片**
```
使用：insight-report-banner.png (1536x1024)
位置：数据洞察区域
尺寸：全宽 x 400rpx
设计：卡片内背景或左侧装饰
```

---

### 建档页（OnboardingPage）

#### 插画使用方案
✅ 已使用 onboarding-guide-vertical.png 作为背景
✅ 设计良好，无需改动

---

## 缺失的插画资源（需要生成）

### 1. 首页快捷记录图标装饰
**需求**：快捷记录 4 个按钮需要更丰富的背景装饰
**建议**：可以用现有图标，不需要新生成

### 2. 今日记录四宫格的背景装饰
**需求**：今日记录 4 个卡片可以有轻微的背景插画
**建议**：
- 体重：小秤图案
- 饮食：小碗图案
- 活动：小人图案
- 睡眠：月亮图案

**提示词**（如需生成）：
```
A minimalist watercolor illustration of [small scale/bowl/person/moon], 
soft pastel mint green and white color palette, 
gentle and calming style, 
very light opacity suitable for card background decoration,
simple geometric shape,
healing Japanese aesthetic,
transparent background,
1024x1024px
```

### 3. 记录页类型选择按钮背景
**需求**：体重、饮食、运动、睡眠等记录类型按钮的背景插画
**建议**：可以用 program-*.png 系列

---

## 实施优先级

### P0（立即实施）
1. ✅ 首页：添加晨间问候卡片（home-hero-morning.png）
2. ✅ 首页：序序卡片添加装饰（home-companion-banner.png）
3. ✅ 记录页：优化按钮样式（使用现有设计系统）

### P1（后续优化）
4. 聊天页：添加顶部装饰（xuxu-safe-support.png）
5. 聊天页：空状态（xuxu-ai-empty.png）
6. 计划页：方案卡片（program-*.png）

### P2（可选）
7. 角落装饰（leaf-corner-decoration.png）
8. 生成轻量级背景装饰图案

---

**接下来立即开始：首页添加晨间问候卡片 + 序序卡片装饰**
