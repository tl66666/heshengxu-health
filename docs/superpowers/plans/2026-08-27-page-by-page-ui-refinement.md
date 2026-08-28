# 小程序逐页视觉打磨实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 回应“界面像 AI 生成、排版不合理”的反馈，按页面逐个打磨视觉与交互细节，并把 gpt-image2 的配图需求一次性规划到位，避免无计划的零散改样式。

**Background:** 用户指出三类问题：① 按钮和图标廉价、一眼 AI 生成；② 底部导航不在屏幕最底部、层级混乱；③ 首页深绿色“去做”按钮压在插画上非常突兀。③②已于本计划创建时修复（见下 P0 已完成项），其余按页面顺序继续。

---

## 设计硬规则（所有页面必须遵守）

1. **主按钮坚决不用实心深绿**（用户明确要求）。统一柔和体系：底 `var(--hz-primary-soft)`(#e9f5ec)、字 `var(--hz-primary-ink)`(#2f6140)、细边 `var(--hz-primary-border)`(#cbe3d2)、圆角 999rpx、投影 `0 8rpx 20rpx rgba(47,124,80,.1)`。品牌绿只允许出现在：文字/图标选中态、进度条与滑杆填充。**禁止任何元素覆盖在插画或照片之上**。
2. **插画上不叠加任何可交互元素和文字**。`IllustratedHero` 的文案区域由组件自身的浅色 wash 承载。
3. **自定义 TabBar 必须贴住屏幕最底部**，iPhone 安全区高度在栏内部消化；页面内容用 `--hz-tabbar-height + env(safe-area-inset-bottom)` 计算底部留白。层级只有一个来源：TabBar `z-index: 99`，页面内容不得再设更高值。
4. **卡片与砖块**：圆角唯一来自令牌 `--hz-radius-card`(22rpx)/`--hz-radius-tile`(16rpx)，阴影唯一来自 `--hz-shadow-card`；禁止页面私写边框色 `#dceadd` 旧值。
5. **新增 UI 图标必须**：24 viewBox、stroke 1.8、stroke-linecap round、颜色 `#789181`，先查 `static/icons/` 是否已有语义相近的，不允许引入多色或面性图标。
6. **数字层级**：关键指标 ≥34rpx 加粗 + 单位小字分节点排；辅助说明 ≤20rpx 浅灰绿 `#7d9585`。
7. **不再局部试错**：每页改动前在本文件勾选范围 → 实现 → 全量测试/typecheck/build/prettier 通过才提交。
8.5 **微动效基线**：全局 `hz-rise` 入场（0.45s 上浮淡入，`hz-rise-1..4` 阶梯延迟）、`hz-float` 轻浮动（仅用于无文字的插画元素）、按钮统一 `button-hover` 按压缩放 0.97；进度条/滑杆宽度变化带 0.4–0.5s 缓动。不做常驻大动画，避免喧闹。
8. **图片一律完整显示**：插画容器必须 `aspectFit`，且容器底色用画面同色 `#fffdf5`（留白不可见）；**禁止用 `aspectFill` 展示插画**。仅两类例外：圆形头像掩膜（方形脸特写裁成圆，主体完整）与多张同比例图的轮播位。每张生成图必须声明专用比例槽位，不得跨比例槽位复用。

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

### 角色基准卡（生图必须保持一致的形象，参考 `hero.jpg` 与 `program-mood.png`）

**序序**：云朵状圆润小生物；身体上半奶白、下半淡青蓝渐变；头顶两片嫩绿新芽，一根浅绿藤蔓环身；黑色豆点眼 + 浅浅微笑 + 淡橙腮红；可漂浮，整体软糯治愈。

**女生（用户化身，暂称“小禾”）**：棕色头发低丸子头 + 空气刘海；奶白色宽松毛衣或白 T 恤 + 鼠尾草绿阔腿裤；闭眼浅笑、神态放松；赤足或白色居家鞋；日系水彩插画质感，与序序同画面时序序高度约到她的腰部。

### 角色使用矩阵（什么时候只要序序、什么时候双角色）

| 场景 | 用谁 | 理由 |
| --- | --- | --- |
| TabBar 头像、聊天气泡头像、全局品牌角标 | 仅序序 | 头像级尺寸放双角色会糊 |
| 聊天空态、错误/重试、记录提醒 | 仅序序 | 序序是服务角色，独自出现代表“陪伴中” |
| 首页主视觉、周回顾横幅 | 仅序序（当前版） | 信息工具属性，保持安静；如后续要加温度可换双角色版 |
| **建档/引导流程（欢迎页、填信息页）** | **双角色** | 小禾“正在填写”，序序在旁指引——传达“像你的人在做这件事” |
| 计划方向卡 program-*.png | 按方向已有插画 | 保持现有五张 |
| 我的页封面、周回顾记录不足空态（待生成） | 双角色 | 情感化页面，用人物增强代入感 |

### 需要生成的图（按优先级，文件放 assets/illustrations/ 后自动同步）

统一风格关键词：**治愈系日系清新水彩、低饱和薄荷绿+奶油白+暖米黄、线条圆润、动物/植物软元素点缀、无文字无边框**；背景统一 `#FFFDF5` 纯色（便于融入卡片），特殊注明除外。人物与序序严格遵循上方基准卡。

1. `xuxu-avatar.png` —— ✅ 已生成已接入（1:1 头像特写）。
2. `home-hero-morning.png` —— ✅ 已生成已接入（4:5 竖构图，文案区在右上）。
3. `weekly-insight-banner.png` —— ✅ 已生成已接入（10:3 超宽横幅，右侧文字区）。
4. **`onboarding-guide-vertical.png`（下一批首选）** —— 建档指引双角色图。**2:3 竖构图，1024×1536**，与现有 onboarding-hero-vertical 同槽位：小禾坐在书桌前拿笔在健康手册/卡片上填写，序序漂浮在她右上方、伸藤蔓指点纸面；主体集中在画面**下半部**，上部 45% 留浅色负空间放欢迎语；完成后替换 `OnboardingPage` 欢迎步的 `onboarding-hero-square.png` 展示位（保持现有 vertical 兜底逻辑）。
5. （可选 P2）`me-profile-cover.png` —— 我的页头部背景条，**10:3，1200×360**，小禾与序序并肩看远处的极简花草地平线，人物偏左，右侧留白。
6. （可选 P2）`records-week-empty.png` —— 周回顾“记录不足”空态，**1:1，900×900**，双角色一起埋种子等发芽。

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

- [x] 收到图后逐一核对风格关键词与本文件规格：`xuxu-avatar.png`、`home-hero-morning.png`、`weekly-insight-banner.png` 已生成，角色身份、比例和留白通过静态验收
- [x] 替换引用：头像 9 处切到 `.png`；首页主视觉切 `home-hero-morning.png`（文案区改右侧 wash）；周回顾横幅改整卡背景 + 右侧文字区；同步脚本通过（21 个资产）
- [x] 全站去裁切：首页主视觉/周回顾横幅/建档欢迎图/启动页/计划页头部与方向缩略全部改 `aspectFit` + 同色底（修复首页新图被裁、TabBar 序序圆环被按钮 overflow 裁顶）；设计规则新增第 8 条“图片一律完整显示”
- [x] 首页主视觉改为按日轮换图池（`home-hero-art.ts`）：`home-hero-morning` 与原 `home-companion-banner` 隔天轮换、各自带文案侧，测试覆盖池覆盖性与当日稳定性
- [x] 接入 `onboarding-guide-vertical.png`（双角色书桌指引场景，2:3 竖构图，1.8MB）
- [x] 建档页 Apple 风格打磨：欢迎大图 640rpx + 留白扩大 + 标题字号放大到 48rpx（欢迎）/46rpx（步骤）+ letter-spacing 呼吸感 + 输入框增高到 98rpx 圆角 20rpx 柔和投影 + 滑杆卡片化 + BMI 数字渐变 78rpx + 选中态抬升投影 + 单选框内嵌白圈动效 + 序序头像放大到 72rpx 金边投影
- [ ] 双尺寸真机截图对比（390x844 / 430x932）
- [ ] 接入 `onboarding-guide-vertical.png`（等下一批生图）
- [x] 更新 roadmap-status.md

## 验收门禁

每 Task 完成必须通过：`verify-repository-layout.mjs`、小程序 vitest 全量、`vue-tsc --noEmit`、微信构建产物检查、全仓 `prettier --check`。提交主题遵循"一次一事"。
