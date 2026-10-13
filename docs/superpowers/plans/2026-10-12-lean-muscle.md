# 薄肌养成 Implementation Plan

> 执行方式：当前会话按任务执行，使用 writing-plans、test-driven-development、frontend-design 和 verification-before-completion；用户已授权设计与实施，不增加审批停顿。

**Goal:** 男性首页默认显示薄肌养成，交付真实评分、训练日志、圣经与周复盘。

**Architecture:** 首页共用账号隔离的可见性规则；lean-muscle 领域模块保存计划、日志、日确认和复盘，派生透明评分。页面使用已有 uni-app 组件、饮食与睡眠服务，公共章节静态化，图片使用现有资源管线。

**Tech Stack:** Vue 3、uni-app、TypeScript、Vitest、本地账号命名空间。

## Task 1：首页适配

- [x] 在 home-card-settings.spec.ts 验证男性 `period=false / lean-muscle=true`、女性反向、未说明不展示经期、账号隔离、手动开关和恢复默认。
- [x] 执行 `npm --prefix apps/mini test -- src/pages/home/home-card-settings.spec.ts`，确认新规则失败。
- [x] home-card-settings.ts 增加独立 lean-muscle ID、按 sex 默认值与偏好覆盖。HomePage.vue 和 EditCardsPage.vue 从同一规则读取，onShow 更新健康档案，异步返回需校验当前账号。

```ts
expect(defaultHomeCardVisibility('male').period).toBe(false);
expect(defaultHomeCardVisibility('male')['lean-muscle']).toBe(true);
```

## Task 2：真实记录与评分

- [x] 新建 features/lean-muscle/{types,calendar,training,store,score,signals}.ts 与行为测试。测试重复训练不重复计天、实际组数校验、按账号保存、存储失败显式报错、周日期、缺失与零、目标冻结、食物修改使完整确认失效、分数上限与恢复周。
- [x] 先运行测试看到失败，再写实现；训练日志作为唯一来源，为通用运动记录提供派生视图，增删改自动一致。
- [x] 评分输入计划快照、实际训练、饮食摘要、睡眠和日确认；输出分项 confirmed/max/coverage，缺失显示区间，不重新分配权重。

```ts
expect(score.dimensions.map((item) => item.weight)).toEqual([35, 25, 25, 15]);
expect(score.total).toBeNull(); // 数据缺失不会变成身体零分
```

## Task 3：功能与阅读页面

- [x] 新建 pages/lean-muscle/LeanMusclePage.vue（总览/训练/圣经）、TrainingPage.vue（动作组数与历史编辑）、BiblePage.vue（八章正文、收藏、来源）、SettingsPage.vue（计划/代表动作/目标）。页面注册到 pages.json。
- [x] 新建 ScorePanel、DailyEvidence、ReviewPanel 可复用组件，明确提示存储/网络失败。普通页面返回首页有安全 fallback。
- [x] 复用 loadMealEntries / loadWellnessJournal，缓存命名空间与食物指纹一致。主页返回时刷新，旧账号请求不能写入新账号。
- [x] 圣经正文从 docs/product/lean-muscle-bible.md 整理为类型化内容；来源链接、行动入口与章节关联，AI 解释跳转现有序序，不声称已注入不存在的聊天上下文。

## Task 4：素材与验证

- [x] 接入三个已生成透明水彩图标；仅需要时新增模型装饰。原图保留并可按原资源流程导出，160px 派生图随页面加载，配有 SVG fallback，避免依赖新增 CDN 部署。
- [x] 完成针对性测试、完整客户端测试、vue-tsc、微信正式构建与 App 构建。浏览器可用时对实际页面截图和流程检查；未有可用实机时明确实际验证范围。
- [x] 检查差异，不混入用户已有认证改动；更新工程交接与计划完成状态。

## 实际验证

80 个客户端测试文件，235 个测试通过、1 个原有测试跳过；vue-tsc、定向 ESLint、git diff --check 与仓库布局检查通过。正式微信构建 1.00 MB，App CLI 构建通过。浏览器使用实际组件和独立测试夹具验证手机布局、训练保存返回刷新、目标设置、圣经阅读与收藏；实机发布仍走现有项目流程。
