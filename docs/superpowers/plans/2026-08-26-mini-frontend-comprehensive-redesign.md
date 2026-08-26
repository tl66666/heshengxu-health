# 和生序小程序前端全面重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 按全面重构设计统一八个小程序页面的视觉、交互、资源和导航，并交付可在微信开发者工具中连续验证的前端闭环。

**Architecture:** 保留现有 uni-app + Vue 3 + TypeScript。新增共享视觉令牌和小型页面壳组件，页面只负责业务组合；本地演示适配器与 API 请求层保持分离，避免后续切换微信云开发时修改页面结构。

**Tech Stack:** uni-app、Vue 3、TypeScript、Vitest、SVG、微信小程序构建工具。

---

## 文件边界

- Modify: `apps/mini/src/App.vue`，只保留全局基础字体、按钮、页面背景和通用令牌。
- Create: `apps/mini/src/styles/mini-tokens.css`，唯一共享视觉令牌文件，使用原生 CSS 变量，不新增 Sass 依赖。
- Modify: `apps/mini/src/components/AppNavBar.vue`，统一非 Tab 页面导航。
- Modify: `apps/mini/src/components/MiniTabBar.vue`，统一五栏导航和安全区。
- Modify: `apps/mini/src/components/IllustratedHero.vue`，只承载主视觉，不允许页面叠加重复标题。
- Modify: `apps/mini/src/components/XuxuChatComposer.vue`，固定聊天输入区和消息滚动区。
- Modify: `apps/mini/src/pages/bootstrap/BootstrapPage.vue`、`OnboardingPage.vue`、`PlanSetupPage.vue`、`HomePage.vue`、`RecordsPage.vue`、`XuxuPage.vue`、`PlanPage.vue`、`MePage.vue`，按设计逐页重排。
- Modify: `apps/mini/src/components/*.spec.ts` 与各页面 `*.spec.ts`，补齐导航和关键交互契约。
- Modify: `docs/engineering/mini-frontend-implementation.md`、`apps/mini/README.md`，同步开发和验收流程。
- Keep: `assets/illustrations/hero.jpg`，继续作为建档欢迎页已确认主视觉，不进行替换。

## 阶段 A：视觉基础与资源治理

### Task 1: 建立共享视觉令牌

**Files:**
- Create: `apps/mini/src/styles/mini-tokens.css`
- Modify: `apps/mini/src/App.vue`

- [ ] **Step 1:** 写令牌结构，包含背景、表面、主文字、次文字、主色、边界、状态色、间距、圆角和 TabBar 高度。
- [ ] **Step 2:** 将 `App.vue` 中的全局样式改为引用令牌，保留微信小程序兼容的 `rpx` 和系统字体回退。
- [ ] **Step 3:** 运行 `npm exec -- vue-tsc --noEmit --pretty false`，确认没有全局样式引入错误。
- [ ] **Step 4:** 提交 `refactor: add mini program visual tokens`。

### Task 2: 收敛图标与页面导航

**Files:**
- Modify: `apps/mini/src/components/AppNavBar.vue`
- Modify: `apps/mini/src/components/MiniTabBar.vue`
- Create or modify: `apps/mini/src/static/icons/*.svg`
- Test: `apps/mini/src/components/navigation-contract.spec.ts`

- [ ] **Step 1:** 列出页面实际需要的图标：home、journal、plan、profile、back、close、forward、check、edit、lock；缺失图标使用同一线宽 SVG 补齐。
- [ ] **Step 2:** AppNavBar 使用固定左右槽位、居中标题和安全区，不使用微信原生 `<icon>`。
- [ ] **Step 3:** MiniTabBar 固定五栏宽度，序序按钮只突出一次，内容底部统一预留 220rpx。
- [ ] **Step 4:** 为 Tab 路由、次级页返回目标和建档退出行为补测试。
- [ ] **Step 5:** 运行 `npm exec -- vitest run src/components/navigation-contract.spec.ts`，提交 `refactor: unify mini navigation icons`。

### Task 3: 整理页面图片使用规则

**Files:**
- Modify: `apps/mini/src/pages/bootstrap/BootstrapPage.vue`
- Modify: `apps/mini/src/pages/onboarding/OnboardingPage.vue`
- Modify: `apps/mini/src/pages/home/HomePage.vue`
- Modify: `apps/mini/src/pages/plan/PlanPage.vue`
- Modify: `scripts/sync-illustrations.mjs`

- [ ] **Step 1:** 保留建档页 `hero.jpg`，明确它只负责欢迎页主视觉，页面文字、按钮和导航不写入图片。
- [ ] **Step 2:** 为首页、计划、记录、序序、我的建立图片使用清单：每个页面最多一个主视觉，空状态和完成状态才使用第二张插画。
- [ ] **Step 3:** 检查图片 `mode`、容器比例、裁切位置和加载失败状态，避免图片挤压文字或撑高布局。
- [ ] **Step 4:** 运行资源同步脚本，确认构建缓存只由脚本生成，提交 `refactor: normalize mini illustration usage`。

## 阶段 B：建档与导航闭环

### Task 4: 重做 Bootstrap 和 Onboarding 首屏

**Files:**
- Modify: `apps/mini/src/pages/bootstrap/BootstrapPage.vue`
- Modify: `apps/mini/src/pages/onboarding/OnboardingPage.vue`
- Test: `apps/mini/src/pages/onboarding/onboarding-flow.spec.ts`

- [ ] **Step 1:** 把 Onboarding 页面拆成“导航区、步骤内容区、操作区”三层，移除大图负边距覆盖导航的布局。
- [ ] **Step 2:** 欢迎步骤只保留序序介绍、品牌标题、短说明和一个主按钮；后续步骤保留进度条和单一主任务。
- [ ] **Step 3:** 保持 BMI 实时计算、输入与滑块同步、返回/退出确认、本地保存兜底。
- [ ] **Step 4:** 添加“网络失败仍进入首页”的流程测试和“退出后回到 Bootstrap”的导航测试。
- [ ] **Step 5:** 运行小程序测试和 `vue-tsc`，提交 `feat: rebuild onboarding flow shell`。

### Task 5: 重做 PlanSetup

**Files:**
- Modify: `apps/mini/src/pages/plan-setup/PlanSetupPage.vue`
- Test: `apps/mini/src/features/health-loop/plan-presentation.spec.ts`

- [ ] **Step 1:** 将两个方向改为单列选择行，统一选中态和插画缩略图尺寸。
- [ ] **Step 2:** 将体重方向和目标体重字段放进同一开放表单区，保存按钮固定在内容末尾并避开系统安全区。
- [ ] **Step 3:** API 和本地演示计划使用同一个页面状态，不让保存失败停留在错误页面。
- [ ] **Step 4:** 运行类型、测试和微信构建，提交 `feat: rebuild plan setup flow`。

## 阶段 C：首页与序序工作区

**执行顺序约束：** 先执行 Task 7 的序序 Demo 等价迁移，再执行 Task 6 的首页重排；首页入口联动依赖序序页的最终消息接口。

### Task 6: 重做 Home

**Files:**
- Modify: `apps/mini/src/pages/home/HomePage.vue`
- Modify: `apps/mini/src/components/IllustratedHero.vue`
- Test: `apps/mini/src/pages/home/home-experience.spec.ts`

- [ ] **Step 1:** 首屏按“问候、主视觉、主行动、序序入口”排序，移除重复摘要卡片。
- [ ] **Step 2:** 今日行动改为开放时间线列表，空状态使用完成插画和一条反馈。
- [ ] **Step 3:** 记录与计划入口统一为列表行，所有跳转按 Tab/非 Tab 规则执行。
- [ ] **Step 4:** 验证已有计划、无计划、API 失败和今日完成四种状态。
- [ ] **Step 5:** 提交 `feat: rebuild health home experience`。

### Task 7: 重做 Xuxu 聊天工作区

**Files:**
- Modify: `apps/mini/src/pages/xuxu/XuxuPage.vue`
- Modify: `apps/mini/src/components/XuxuChatComposer.vue`
- Test: `apps/mini/src/components/xuxu-chat.spec.ts`

- [ ] **Step 1:** 对照 `prototypes/web-demo/index.html#view-chat` 建立 Vue 结构：`chat-head`、`chat-profile`、`messages`、`quick`、`composer`、`disclaimer` 六个区域，保持顺序不变。
- [ ] **Step 2:** 对照 `prototypes/web-demo/app.js` 迁移四类交互：入口带问题进入聊天、健康画像收起/展开、快捷问题发送、输入框确认键发送。
- [ ] **Step 3:** 将 Demo 的 `addMsg` 数据模型改为 `ChatMessage` 类型，assistant 消息支持头像和可选知识来源，user 消息右对齐；不复制 HTML 字符串拼接。
- [ ] **Step 4:** 增加风险问题安全回复测试：输入“胸痛”时返回就医/急救提示，不返回诊断结论；语音按钮只显示后续开放提示。
- [ ] **Step 5:** 在 390x844 和 430x932 下验证消息滚动、快捷问题横向滚动、键盘弹起和底部输入区不被 TabBar 遮挡。
- [ ] **Step 6:** 运行 `npm exec -- vitest run src/components/xuxu-chat.spec.ts`，提交 `feat: migrate demo-equivalent xuxu chat workspace`。

## 阶段 D：记录与计划闭环

### Task 8: 重做 Records

**Files:**
- Modify: `apps/mini/src/pages/records/RecordsPage.vue`
- Modify: `apps/mini/src/features/health-records/health-records.store.ts`
- Test: `apps/mini/src/pages/records/records-experience.spec.ts`

- [ ] **Step 1:** 保留分段控件、单一表单和时间线三层结构，统一字段、错误和保存状态。
- [ ] **Step 2:** 体重、饮食、活动、睡眠四种表单使用相同的标题、字段间距和主按钮。
- [ ] **Step 3:** 修改记录时回填、取消修改、网络失败保留输入，保存成功后刷新时间线。
- [ ] **Step 4:** 提交 `feat: complete health records experience`。

### Task 9: 重做 Plan

**Files:**
- Modify: `apps/mini/src/pages/plan/PlanPage.vue`
- Modify: `apps/mini/src/features/health-loop/local-demo.ts`
- Test: `apps/mini/src/features/health-loop/plan-presentation.spec.ts`

- [ ] **Step 1:** 当前计划摘要只保留一张主视觉区域，进度使用轻量线性进度。
- [ ] **Step 2:** 任务使用开放时间线，完成态使用 `check.svg`，不可用方向使用低对比度但保持可读。
- [ ] **Step 3:** 无计划、计划加载失败、本地计划和全部完成四种状态分别验收。
- [ ] **Step 4:** 提交 `feat: complete health plan experience`。

## 阶段 E：我的页与全量验收

### Task 10: 重做 Me

**Files:**
- Modify: `apps/mini/src/pages/me/MePage.vue`
- Test: `apps/mini/src/components/navigation-contract.spec.ts`

- [ ] **Step 1:** 移除装饰叶片和绿色大 Profile 卡，改为档案摘要行和分组列表。
- [ ] **Step 2:** 健康档案、调整计划、提醒设置、数据隐私入口使用统一 SVG 和前进图标。
- [ ] **Step 3:** 未开放能力统一显示“即将开放”，不可产生误跳转。
- [ ] **Step 4:** 提交 `feat: simplify profile and settings page`。

### Task 11: 全量构建与真机尺寸验收

**Files:**
- Modify: `docs/engineering/mini-frontend-implementation.md`
- Modify: `apps/mini/README.md`
- Test: all mini tests and build checks

- [ ] **Step 1:** 清理构建目录并启动唯一开发监听：`pnpm --filter @heban/mini clean:dist`、`./scripts/dev-mini.ps1`。
- [ ] **Step 2:** 运行 `pnpm --filter @heban/mini test`，预期 30+ 测试全部通过。
- [ ] **Step 3:** 运行 `pnpm --filter @heban/mini typecheck`，预期退出码 0。
- [ ] **Step 4:** 运行 `npm exec -- prettier --check src`，预期所有源码通过。
- [ ] **Step 5:** 关闭开发监听，运行 `./scripts/build-mini.ps1` 和 `node scripts/verify-mini-build.mjs`。
- [ ] **Step 6:** 在微信开发者工具中验证 390x844 和 430x932 两个尺寸：建档闭环、五栏 Tab、聊天输入、记录保存、计划完成和返回/退出。
- [ ] **Step 7:** 确认 `git status --short` 只有文档或源码变更，没有 `dist`、日志、密钥和本地配置。
- [ ] **Step 8:** 提交 `chore: verify mini frontend redesign`。
