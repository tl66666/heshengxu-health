# 周健康回顾实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为计划页提供基于当前版本真实记录的七日回顾，并在样本不足时清楚说明限制。

**Architecture:** `@heban/domain` 以纯函数生成周聚合，NestJS `health-insights` 模块查询当前版本记录并调用该聚合，小程序 feature 层只处理请求和展示状态。回顾页放在计划页入口之后，不增加底部 Tab，也不使用 AI 或客户端计算规则。

**Tech Stack:** TypeScript、Vitest、NestJS、Prisma/PostgreSQL、uni-app/Vue 3。

---

### Task 1: 周回顾领域聚合

**Files:**
- Create: `packages/domain/src/weekly-review.ts`
- Create: `packages/domain/src/weekly-review.spec.ts`
- Modify: `packages/domain/src/index.ts`

- [ ] **Step 1: 写一个失败的领域测试**

```ts
import { describe, expect, it } from 'vitest';
import { buildWeeklyReview } from './weekly-review.js';

describe('buildWeeklyReview', () => {
  it('keeps actual current records and reports ready after three recorded days', () => {
    const review = buildWeeklyReview({
      anchorDate: '2026-08-26',
      weights: [
        { recordedAt: '2026-08-24T00:00:00.000Z', valueKg: 62 },
        { recordedAt: '2026-08-26T00:00:00.000Z', valueKg: 61.6 },
      ],
      meals: [{ recordedAt: '2026-08-25T00:00:00.000Z', energyKcal: 420 }],
      activities: [{ recordedAt: '2026-08-26T00:00:00.000Z', durationMinutes: 30 }],
      sleeps: [],
      tasks: [{ status: 'completed' }, { status: 'pending' }],
    });
    expect(review.coverage).toMatchObject({ recordedDayCount: 3, status: 'ready' });
    expect(review.weight).toMatchObject({ firstKg: 62, lastKg: 61.6, changeKg: -0.4 });
    expect(review.food).toMatchObject({ recordedDayCount: 1, energyKcal: 420 });
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm --filter @heban/domain test -- weekly-review.spec.ts`

Expected: `buildWeeklyReview` 尚未导出导致失败。

- [ ] **Step 3: 最小实现领域函数**

在 `weekly-review.ts` 定义 `buildWeeklyReview(input)`：用上海自然日把输入记录聚为周一至周日；`recordedDayCount` 是体重、餐食、活动、睡眠、任务日期并集；少于 `3` 天为 `insufficient`。体重点按真实时间排序，只有至少两个点才产生 `firstKg`、`lastKg` 和一位小数的 `changeKg`。餐食能量、活动时长、睡眠时长和计划已完成数分别求和。不得产生任何缺失日期的虚假点。

```ts
export function buildWeeklyReview(input: WeeklyReviewInput): WeeklyReview {
  const range = weekRangeForShanghai(input.anchorDate);
  const inRange = <T extends { recordedAt?: string; scheduledFor?: string }>(items: readonly T[]) =>
    items.filter((item) => withinRange(item.recordedAt ?? item.scheduledFor!, range));
  // 分别聚合真实条目，最后以 Set 计算覆盖日期。
}
```

- [ ] **Step 4: 补齐不足样本与跨周的测试，再运行领域测试**

补充断言：周日后的记录不进入本周、两天记录保持 `insufficient`、一条体重记录没有 `changeKg`。 

Run: `pnpm --filter @heban/domain test -- weekly-review.spec.ts`

Expected: 全部断言通过。

- [ ] **Step 5: 提交领域规则**

```bash
git add packages/domain/src/weekly-review.ts packages/domain/src/weekly-review.spec.ts packages/domain/src/index.ts
git commit -m "feat: add weekly review aggregation"
```

### Task 2: 健康洞察 API

**Files:**
- Create: `apps/api/src/modules/health-insights/health-insights.dto.ts`
- Create: `apps/api/src/modules/health-insights/health-insights.service.ts`
- Create: `apps/api/src/modules/health-insights/health-insights.controller.ts`
- Create: `apps/api/src/modules/health-insights/health-insights.module.ts`
- Create: `apps/api/test/health-insights.e2e-spec.ts`
- Modify: `apps/api/src/app.module.ts`
- Modify: `apps/api/src/openapi.ts`

- [ ] **Step 1: 写失败的 API 端到端测试**

测试使用不同 Bearer token 创建两位用户的体重、餐食和活动记录，并请求：

```ts
const response = await client
  .get('/api/v1/health-insights/weekly?date=2026-08-26')
  .set({ Authorization: token })
  .expect(200);

expect(response.body.data.coverage).toEqual(
  expect.objectContaining({ requiredDayCount: 3, status: 'ready' }),
);
expect(response.body.data.food.energyKcal).toBe(420);
```

同时断言另一用户记录不计入结果；把一个餐食替换或软删除后，旧版本不进入 `entryCount`。

- [ ] **Step 2: 运行测试确认失败**

Run: `node ..\\mini\\node_modules\\vitest\\vitest.mjs run --config vitest.config.ts test/health-insights.e2e-spec.ts`

Expected: `GET /health-insights/weekly` 返回 `404`。

- [ ] **Step 3: 实现只读 `HealthInsightsService`**

`WeeklyInsightsQueryDto` 只接受 ISO 日期字段 `date`。服务用同一周的起止时间并行读取：

```ts
const current = { userId, isCurrent: true, recordedAt: { gte: start, lt: end } };
const [weights, meals, activities, sleeps, tasks] = await Promise.all([
  this.prisma.weightRecord.findMany({ where: current }),
  this.prisma.mealEntry.findMany({ where: current }),
  this.prisma.activityRecord.findMany({ where: current }),
  this.prisma.sleepRecord.findMany({ where: current }),
  this.prisma.planTask.findMany({ where: { plan: { userId }, scheduledFor: { gte: start, lt: end } } }),
]);
return buildWeeklyReview({ anchorDate: date, weights, meals, activities, sleeps, tasks });
```

Controller 保持项目既有 envelope 和 `AuthGuard` 写法。模块只导出自身 service；在 `AppModule` 导入模块；在 `openapi.ts` 添加 `GET /health-insights/weekly`。

- [ ] **Step 4: 运行 API 测试和类型检查**

Run: `node ..\\mini\\node_modules\\vitest\\vitest.mjs run --config vitest.config.ts test/health-insights.e2e-spec.ts`

Expected: 端到端测试通过。

Run: `node node_modules/.pnpm/typescript@5.9.3/node_modules/typescript/bin/tsc -p apps/api/tsconfig.build.json --noEmit`

Expected: 退出码 `0`。

- [ ] **Step 5: 提交 API**

```bash
git add apps/api/src/app.module.ts apps/api/src/openapi.ts apps/api/src/modules/health-insights apps/api/test/health-insights.e2e-spec.ts
git commit -m "feat: add weekly health insights API"
```

### Task 3: 计划页入口与周回顾小程序页面

**Files:**
- Create: `apps/mini/src/features/weekly-review/weekly-review.service.ts`
- Create: `apps/mini/src/features/weekly-review/weekly-review.presentation.ts`
- Create: `apps/mini/src/features/weekly-review/weekly-review.presentation.spec.ts`
- Create: `apps/mini/src/pages/weekly-review/WeeklyReviewPage.vue`
- Modify: `apps/mini/src/pages/plan/PlanPage.vue`
- Modify: `apps/mini/src/pages.json`

- [ ] **Step 1: 写展示状态的失败测试**

```ts
import { weeklyReviewEntry } from './weekly-review.presentation.js';

it('explains insufficient data without inventing a trend', () => {
  expect(weeklyReviewEntry({ coverage: { recordedDayCount: 1, requiredDayCount: 3, status: 'insufficient' } }))
    .toMatchObject({ title: '本周还在收集节律', action: '去记录' });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm exec -- vitest run src/features/weekly-review/weekly-review.presentation.spec.ts`

Expected: 找不到 `weeklyReviewEntry`。

- [ ] **Step 3: 实现 feature 层和页面**

`weekly-review.service.ts` 调用 `createMiniClient().get('/health-insights/weekly?date=...')`；`weekly-review.presentation.ts` 将 `ready` 和 `insufficient` 转换为固定中文文案与可导航动作，不能根据数值做健康判断。

在 `WeeklyReviewPage.vue` 实现四种完整状态：加载、失败重试、数据不足和完整回顾。完整回顾必须显示日期范围、覆盖天数、实际体重点列表、已记录食物总能量、活动分钟、睡眠分钟和计划完成数。所有长数字使用可换行的 `text`，页面底部预留 `150rpx` 给 `MiniTabBar`。数据不足的“去记录”跳转 `/pages/records/RecordsPage`。

在 `PlanPage.vue` 增加一张无嵌套卡片的入口，加载周回顾后展示真实覆盖状态并跳转该页；入口失败时不影响原有计划页面。

在 `pages.json` 注册 `pages/weekly-review/WeeklyReviewPage`，不是 tabBar 项。

- [ ] **Step 4: 运行测试、构建与视觉检查**

Run: `npm exec -- vitest run src/features/weekly-review/weekly-review.presentation.spec.ts src/features/food/food.summary.spec.ts src/services/api-client.spec.ts`

Expected: 全部通过。

Run: `npm exec -- uni build -p mp-weixin`

Expected: `DONE Build complete.`

在微信开发者工具以 375px 宽度检查：数据不足无图表/无空白；完整页文字不被截断；返回按钮和自定义底部导航都可用。

- [ ] **Step 5: 提交小程序界面并更新路线状态**

```bash
git add apps/mini/src/features/weekly-review apps/mini/src/pages/weekly-review apps/mini/src/pages/plan/PlanPage.vue apps/mini/src/pages.json docs/engineering/roadmap-status.md
git commit -m "feat: add weekly health review page"
```
