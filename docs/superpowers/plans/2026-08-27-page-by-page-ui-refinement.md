# 小程序逐页视觉打磨实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 回应“界面像 AI 生成、排版不合理”的反馈，按页面逐个打磨视觉与交互细节，并把 gpt-image2 的配图需求一次性规划到位，避免无计划的零散改样式。

**Background:** 用户指出三类问题：① 按钮和图标廉价、一眼 AI 生成；② 底部导航不在屏幕最底部、层级混乱；③ 首页深绿色“去做”按钮压在插画上非常突兀。③②已于本计划创建时修复（见下 P0 已完成项），其余按页面顺序继续。

---

## 设计硬规则（所有页面必须遵守）

1. **品牌绿 `#347c50` 只允许出现在三处**：整宽主按钮、选中态文字/图标、进度条填充。**禁止任何元素覆盖在插画或照片之上**（按钮、角标、徽章均不允许）。
2. **插画上不叠加任何可交互元素和文字**。`IllustratedHero` 的文案区域由组件自身的浅色 wash 承载。
3. **自定义 TabBar 必须贴住屏幕最底部**，iPhone 安全区高度在栏内部消化；页面内容用 `--hz-tabbar-height + env(safe-area-inset-bottom)` 计算底部留白。层级只有一个来源：TabBar `z-index: 99`，页面内容不得再设更高值。
4. **卡片与砖块**：圆角唯一来自令牌 `--hz-radius-card`(22rpx)/`--hz-radius-tile`(16rpx)，阴影唯一来自 `--hz-shadow-card`；禁止页面私写边框色 `#dceadd` 旧值。
5. **新增 UI 图标必须**：24 viewBox、stroke 1.8、stroke-linecap round、颜色 `#789181`，先查 `static/icons/` 是否已有语义相近的，不允许引入多色或面性图标。
6. **数字层级**：关键指标 ≥34rpx 加粗 + 单位小字分节点排；辅助说明 ≤20rpx 浅灰绿 `#7d9585`。
7. **不再局部试错**：每页改动前在本文件勾选范围 → 实现 → 全量测试/typecheck/build/prettier 通过才提交。

## 配图资产盘点与需求（gpt-image2 待办）

### 现有素材判定（assets/illustrations/）

| 文件 | 尺寸 | 当前用途 | 判定 |
| --- | --- | --- | --- |
| xuxu-avatar.jpg | 1254² | TabBar 圆环、聊天头像、首页 | ⚠️ 可用但缩小后发糊，建议重生成 PNG |
| onboarding-hero-vertical/square.png | 1024×1536 / 1254² | 启动页、建档欢迎页 | ✅ 够用 |
| program-weight/sleep/mood/metabolic/digestive.png | 1024² | 计划方向卡、我的计划头图 | ✅ 够用 |
| record-desk-banner.png | 1536×1024 | 记录页横幅 | ✅ 够用 |
| xuxu-record-reminder.png | 1254² | 记录页提示 | ✅ 够用 |
| xuxu-ai-empty.png | 1024² | 聊天空态 | ✅ 够用 |
| xuxu-safe-support.png | 1024² | 计划页陪伴条 | ✅ 够用 |
| xuxu-complete.png | 1024² | 周回顾尾卡、计划完成态 | ✅ 够用 |
| insight-report-banner.png | 1536×1024 | 周回顾横幅 | ⚠️ 横图裁切严重，建议宽幅重生成 |
| home-companion-banner.png | 1536×1024 | 首页主视觉 | ❌ 横图竖用裁切差，需重生成 |
| leaf-corner-decoration.png、hero.jpg | — | 未使用 | 保持闲置 |

### 需要生成的图（按优先级，文件放 assets/illustrations/ 后自动同步）

统一风格关键词：**治愈系日系清新水彩、低饱和薄荷绿+奶油白+暖米黄、线条圆润、动物/植物软元素点缀、无文字无边框无真人**；背景统一 `#FFFDF5` 纯色（便于融入卡片），特殊注明除外。

1. `xuxu-avatar.png` —— 序序圆形头像特写。**1:1，800×800 以上**，头部占画面 70%，居中，背景单一浅色；用于 TabBar 40~82rpx 小尺寸仍清晰。完成后全局替换对 `.jpg` 的 6 处引用。
2. `home-hero-morning.png` —— 首页主视觉。**4:5 竖构图，1200×1500**，序序在晨光窗边书桌，主体偏左下；右上 40% 面积留浅色负空间供现有 wash 文案区使用。替换 `home-companion-banner.png` 引用。
3. `weekly-insight-banner.png` —— 周回顾横幅。**10:3 超宽幅，1200×360**，序序抱着周报纸卷/日历，主体靠左，右侧留白。替换 `insight-report-banner.png` 引用。
4. （可选 P2）`records-week-empty.png` —— 周回顾“记录不足”状态插画，**1:1，900×900**，序序撒种子发芽的隐喻；当前该状态只有文字略空。
5. （可选 P2）`me-profile-cover.png` —— 我的页头部背景条，**10:3，1200×360**，极简花草地平线，上部留白。

## 逐页任务清单

### P0 本轮已完成

- [x] TabBar 贴底重排：去浮动离底间距，安全区内消化，去掉伪元素负 z-index 层级 hack，激活态直接用按钮背景胶囊
- [x] 移除首页主视觉上的深绿「去做」覆盖按钮，整卡保持可点
- [x] 重绘 home/journal/plan/profile/camera 五个高频 SVG 图标（圆润门窗、相机镜头、日历点阵）
- [x] 首页今日概览真实数据卡 + 四宫格工具 + records-focus 直达表单（上一轮成果保留）

### Task A：记录页 RecordsPage（下一轮首先执行）

**Files:** Modify `apps/mini/src/pages/records/RecordsPage.vue`
- [ ] 分段控件改胶囊组（白卡内嵌灰底滑块式选中），四个类型等宽
- [ ] 表单区包进白卡：输入框统一 78rpx 高、#fbfdfb 底、focus 描边 #82ad8b
- [ ] 时间线白卡化：日期组标题 sticky 样式、记录行右缘 kcal/时长数值 26rpx 加粗
- [ ] 今日营养汇总改为顶部摘要条（数字大字+单位小字，参照薄荷详情页层级）
- [ ] 食物入口行使用 forward.svg 契约保持不变（records-experience.spec 有断言）

### Task B：序序聊天页 XuxuPage

**Files:** Modify `apps/mini/src/pages/xuxu/XuxuPage.vue`、`XuxuChatComposer.vue`
- [ ] 顶部品牌区高度压缩，健康画像默认收起为一行
- [ ] 消息气泡：assistant 白卡 22rpx 圆角带头像，user 浅绿 #e3f2e4 深字
- [ ] 快捷问题 chips 胶囊化、横向滚动加 fade 渐隐
- [ ] 输入区保持固定底部，发送键改绿色圆形 44rpx（send.svg 反白可用 filter 或重绘白色变体）
- [ ] 依赖 `xuxu-avatar.png` 到位后替换 6 处引用

### Task C：建档链路 Onboarding/Bootstrap/PlanSetup

- [ ] Bootstrap 排版复核（垂直 hero + 标题层距）
- [ ] Onboarding 步骤进度条改圆角轨道 + 绿色填充，目标多选行间距放宽
- [ ] PlanSetup 方向选择行插画缩略统一 96rpx 圆角方块，保存按钮实心绿全宽
- [ ] 回归 onboarding-flow.spec 全部断言

### Task D：计划页 Plan 与食品四页

- [ ] Plan 任务行完成态 check 使用品牌绿圆形而非线性勾
- [ ] FoodSearch/FoodConfirm/FoodCandidates：结果行分隔线改分组卡、份量选择胶囊化、确认按钮实心绿
- [ ] food-*-presentation.spec 中类名契约不动只调样式

### Task E：配图接入（阻塞于 gpt-image2）

- [ ] 收到图后逐一核对风格关键词与本文件规格
- [ ] 替换引用 → 同步脚本 → 双尺寸真机截图对比
- [ ] 更新 roadmap-status.md

## 验收门禁

每 Task 完成必须通过：`verify-repository-layout.mjs`、小程序 vitest 全量、`vue-tsc --noEmit`、微信构建产物检查、全仓 `prettier --check`。提交主题遵循"一次一事"。
