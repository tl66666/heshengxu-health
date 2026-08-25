# 和生序阶段 2A：每日健康闭环 Implementation Plan

> **状态：已完成。** 对应实现提交为 `90de97f`、`6b60e80`、`2a3c79b`、`732f46e`、`b911197`、`1fbb805`；验收提交同时修复了共享领域包的 API 运行时导出。完整验收见 [阶段 2A 验收记录](../../engineering/stage-2a-acceptance.md)。文中复选框保留为历史实施步骤，不是当前待办。

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让已完成建档的用户可以建立体重或睡眠计划，记录体重、饮食结构、活动和睡眠，并通过“首页 / 记录 / 序序 / 计划 / 我的”完成每日闭环。

**Architecture:** NestJS 继续使用模块化单体。`health-records` 保存版本化的原始事实；`health-plans` 保存当前计划和每日任务；`daily-home` 只调用这两个模块的公开服务，计算“今天最重要的一件事”。uni-app 的页面只调用 API 和本地 store，不计算健康规则。序序在本阶段只展示确定性的场景解释，不调用真实模型；自由对话留给阶段 2C。

**Tech Stack:** uni-app、Vue 3、TypeScript、Pinia、NestJS、Prisma、PostgreSQL、Vitest、Supertest、微信小程序构建。

**Scope:** 不实现热量、食物库、扫码、拍照识别、健康总分、周回顾、真实 AI Provider、情绪/肠胃/代谢记录、设备接入或社区内容。

---

## 文件边界

| 路径 | 职责 |
| --- | --- |
| `packages/contracts/src/health-loop.ts` | 前后端共享的每日记录、计划和首页 DTO |
| `packages/domain/src/daily-action.ts` | 无框架依赖的“今日优先行动”规则 |
| `apps/api/prisma/schema.prisma` | 目标、记录、计划、任务及版本关系的数据库模型 |
| `apps/api/src/modules/health-records/` | 四类原始记录的校验、版本化写入与查询 |
| `apps/api/src/modules/health-plans/` | 计划设置、每日任务生成和完成状态 |
| `apps/api/src/modules/daily-home/` | 聚合用户、记录与计划，返回首页唯一数据源 |
| `apps/mini/src/features/health-loop/` | API service、Pinia store、页面可复用类型 |
| `apps/mini/src/components/XuxuHint.vue` | 不调用模型的序序场景提示 |
| `apps/mini/src/custom-tab-bar/index.vue` | 五栏自定义导航，中间突出序序 |
| `apps/mini/src/pages/*/` | 首页、记录、序序、计划、我的和计划设置页面入口 |
| `assets/illustrations/` | 从原型正式提升的已审核插画唯一源目录；构建前同步到小程序静态目录 |

## API 与数据约定

所有端点带 `/api/v1` 前缀、需要 `Authorization`，并返回现有 `{ data, meta: { requestId } }` envelope。

```text
PUT  /health-plans/current
GET  /health-plans/current
PATCH /health-plans/tasks/:taskId

POST /health-records/weights
POST /health-records/meal-structures
POST /health-records/activities
POST /health-records/sleeps
PATCH /health-records/:recordType/:recordId
GET  /health-records/today?date=YYYY-MM-DD

GET  /daily-home/today?date=YYYY-MM-DD
```

记录修改不覆盖旧行：旧行设置 `isCurrent=false` 与 `supersededAt`，再插入带 `previousRecordId` 的新行。页面与首页只读取 `isCurrent=true` 的记录。

### Task 1: 定义共享 DTO 与今日行动规则

**Files:**
- Create: `packages/contracts/src/health-loop.ts`
- Modify: `packages/contracts/src/index.ts`
- Create: `packages/domain/src/daily-action.ts`
- Create: `packages/domain/src/daily-action.spec.ts`
- Modify: `packages/domain/src/index.ts`

- [ ] **Step 1: 写今日行动的失败测试。**

```ts
import { describe, expect, it } from 'vitest';
import { selectDailyAction } from './daily-action.js';

describe('selectDailyAction', () => {
  it('asks to record yesterday sleep before other work', () => {
    expect(selectDailyAction({ planKind: 'weight', hasSleepForPreviousNight: false, hasWeightToday: false, hasMealToday: false, hasActivityToday: false }))
      .toMatchObject({ type: 'record_sleep' });
  });

  it('asks a weight-plan user for weight after sleep exists', () => {
    expect(selectDailyAction({ planKind: 'weight', hasSleepForPreviousNight: true, hasWeightToday: false, hasMealToday: false, hasActivityToday: false }))
      .toMatchObject({ type: 'record_weight' });
  });

  it('never invents an action when all four facts exist', () => {
    expect(selectDailyAction({ planKind: 'sleep', hasSleepForPreviousNight: true, hasWeightToday: true, hasMealToday: true, hasActivityToday: true }))
      .toMatchObject({ type: 'review_today' });
  });
});
```

- [ ] **Step 2: 运行测试，确认失败。**

Run: `vitest run packages/domain/src/daily-action.spec.ts`

Expected: FAIL，因为 `daily-action.ts` 不存在。

- [ ] **Step 3: 实现共享类型和确定性规则。**

`health-loop.ts` 必须导出以下稳定字面量类型：

```ts
export type PlanKind = 'weight' | 'sleep';
export type WeightDirection = 'lose' | 'maintain' | 'gain';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type SleepQuality = 'poor' | 'fair' | 'good';
export type DailyActionType = 'record_sleep' | 'record_weight' | 'record_meal' | 'record_activity' | 'review_today';

export type DailyActionDto = { type: DailyActionType; title: string; description: string; route: string };
export type TodayRecordsDto = { weight: WeightRecordDto | null; meals: MealStructureRecordDto[]; activities: ActivityRecordDto[]; sleep: SleepRecordDto | null };
```

`daily-action.ts` 的优先级必须固定为：缺少昨夜睡眠 -> 体重计划缺少今日体重 -> 缺少饮食结构 -> 缺少活动 -> 回顾今天。睡眠计划跳过“体重计划缺少今日体重”这一步。规则只返回文案、路由和类型，不生成医学判断。

- [ ] **Step 4: 运行领域测试和类型检查。**

Run:

```powershell
vitest run packages/domain/src
tsc --noEmit --module NodeNext --moduleResolution NodeNext --target ES2022 --strict packages/domain/src/index.ts packages/domain/src/bmi.ts packages/domain/src/daily-action.ts
```

Expected: 所有领域测试通过，纯领域包不导入 NestJS、Prisma、Vue 或 `uni`。

- [ ] **Step 5: 提交共享契约和规则。**

```powershell
git add packages/contracts packages/domain
git commit -m "feat: define daily health loop contracts"
```

### Task 2: 增加版本化记录和计划数据模型

**Files:**
- Modify: `apps/api/prisma/schema.prisma`
- Create: `apps/api/prisma/migrations/<timestamp>_stage2a_daily_loop/migration.sql`
- Create: `apps/api/test/daily-loop-schema.e2e-spec.ts`

- [ ] **Step 1: 写 schema 失败测试。**

测试必须通过 Prisma Client 断言：

1. 同一个用户能保存 `WeightRecord`、`MealStructureRecord`、`ActivityRecord`、`SleepRecord`。
2. 每种记录都有 `isCurrent`、`previousRecordId`、`supersededAt` 和按 `(userId, isCurrent, recordedAt)` 查询的索引。
3. `HealthTarget` 保存目标方向和可选目标体重；`PersonalPlan` 以 `healthTargetId` 一对一关联目标；`PlanTask` 对 `(planId, scheduledFor, actionType)` 唯一。
4. 创建新目标时 service 在同一事务中归档旧 active target 与 plan；用户删除时级联删除其目标、记录、计划和任务。

- [ ] **Step 2: 运行测试，确认新模型尚不存在。**

Run: `vitest run apps/api/test/daily-loop-schema.e2e-spec.ts`

Expected: FAIL，因为 Prisma Client 中不存在每日健康模型。

- [ ] **Step 3: 扩展 Prisma schema 并生成迁移。**

在 `User` 上增加每种记录和计划的 relation。定义以下枚举与模型字段；所有 `recordedAt` 使用 `DateTime`，`scheduledFor` 和 `startDate` 使用 `@db.Date`：

```prisma
enum PlanKind { weight sleep }
enum PlanStatus { active paused archived }
enum WeightDirection { lose maintain gain }
enum PlanTaskAction { record_weight record_meal walk_15_minutes record_sleep }
enum PlanTaskStatus { pending completed skipped }
enum MealType { breakfast lunch dinner snack }
enum SleepQuality { poor fair good }

model PersonalPlan {
  id String @id @default(cuid())
  userId String
  healthTargetId String @unique
  kind PlanKind
  startDate DateTime @db.Date
  status PlanStatus @default(active)
  ruleVersion String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  healthTarget HealthTarget @relation(fields: [healthTargetId], references: [id], onDelete: Cascade)
  tasks PlanTask[]
  @@index([userId, status])
}

model HealthTarget {
  id String @id @default(cuid())
  userId String
  kind PlanKind
  direction WeightDirection?
  targetWeightKg Float?
  startDate DateTime @db.Date
  status PlanStatus @default(active)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  plan PersonalPlan?
  @@index([userId, status])
}

model PlanTask {
  id String @id @default(cuid())
  planId String
  scheduledFor DateTime @db.Date
  actionType PlanTaskAction
  status PlanTaskStatus @default(pending)
  completedAt DateTime?
  createdAt DateTime @default(now())
  plan PersonalPlan @relation(fields: [planId], references: [id], onDelete: Cascade)
  @@unique([planId, scheduledFor, actionType])
  @@index([planId, scheduledFor])
}
```

四个记录表共同保留 `id`、`userId`、`recordedAt`、`note?`、`isCurrent @default(true)`、`previousRecordId?`、`supersededAt?`、`createdAt`、`updatedAt` 与用户 relation。差异字段必须为：`WeightRecord.valueKg`；`MealStructureRecord.mealType/hasStaple/hasProtein/hasVegetable`；`ActivityRecord.activityType/durationMinutes/intensity?`；`SleepRecord.durationMinutes/quality/sleepAt?/wakeAt?`。每个表有 self relation 和 `@@index([userId, isCurrent, recordedAt])`。

- [ ] **Step 4: 部署迁移并验证 schema 测试。**

Run:

```powershell
prisma migrate dev --schema apps/api/prisma/schema.prisma --name stage2a_daily_loop
vitest run apps/api/test/daily-loop-schema.e2e-spec.ts
```

Expected: migration SQL 被提交；schema 测试通过；没有记录原文 AI 消息或 API key 的字段。

- [ ] **Step 5: 提交数据模型。**

```powershell
git add apps/api/prisma apps/api/test/daily-loop-schema.e2e-spec.ts
git commit -m "feat: add daily health loop persistence"
```

### Task 3: 实现四类记录 API 与版本化修改

**Files:**
- Create: `apps/api/src/modules/health-records/health-records.module.ts`
- Create: `apps/api/src/modules/health-records/health-records.controller.ts`
- Create: `apps/api/src/modules/health-records/health-records.service.ts`
- Create: `apps/api/src/modules/health-records/health-records.repository.ts`
- Create: `apps/api/src/modules/health-records/prisma-health-records.repository.ts`
- Create: `apps/api/src/modules/health-records/health-records.dto.ts`
- Create: `apps/api/src/modules/health-records/health-records.service.spec.ts`
- Create: `apps/api/test/health-records.e2e-spec.ts`
- Modify: `apps/api/src/app.module.ts`

- [ ] **Step 1: 写 API 失败测试。**

覆盖以下请求：

```text
POST /health-records/weights { valueKg: 61.8, recordedAt: "2026-08-25T08:10:00.000Z" } -> 201
POST /health-records/meal-structures { mealType: "lunch", hasStaple: true, hasProtein: true, hasVegetable: false, recordedAt: "..." } -> 201
POST /health-records/activities { activityType: "walk", durationMinutes: 15, recordedAt: "..." } -> 201
POST /health-records/sleeps { durationMinutes: 430, quality: "good", recordedAt: "..." } -> 201
PATCH /health-records/weight/:id { valueKg: 61.6, recordedAt: "..." } -> 200
GET /health-records/today?date=2026-08-25 -> 只返回当前版本
```

断言修改后旧记录 `isCurrent=false`，新记录有 `previousRecordId=旧 id`；第二个用户不能读取或修改第一个用户记录；体重范围 20-300、活动时长 1-1440、睡眠时长 30-1440，非法枚举均返回 `VALIDATION_FAILED`。

- [ ] **Step 2: 运行 API 测试，确认失败。**

Run: `vitest run apps/api/test/health-records.e2e-spec.ts`

Expected: FAIL，因为模块和端点不存在。

- [ ] **Step 3: 实现 DTO、repository 和 service。**

Controller 仅从 `AuthGuard` 的 `request.user.id` 获取用户。service 的 `replaceRecord` 必须在 Prisma `$transaction` 中：验证当前记录归属 -> `update({ isCurrent: false, supersededAt: now })` -> `create({ previousRecordId: old.id, isCurrent: true, ...payload })`。不可接受 body 中的 `userId`、`isCurrent`、`previousRecordId` 或 `supersededAt`。

`GET /today` 以用户时区当天的 `[00:00, 24:00)` 查询；阶段 2A 固定 `Asia/Shanghai`，同时在响应中回传 `timeZone: 'Asia/Shanghai'`，以后允许档案级时区再替换该常量。

- [ ] **Step 4: 运行 API、服务和全量 API 测试。**

Run:

```powershell
vitest run apps/api/src/modules/health-records apps/api/test/health-records.e2e-spec.ts
vitest run --config apps/api/vitest.config.ts
```

Expected: 所有 API 测试通过，跨用户访问返回 `NOT_FOUND`，而不是泄露记录存在性。

- [ ] **Step 5: 提交记录模块。**

```powershell
git add apps/api/src/modules/health-records apps/api/src/app.module.ts apps/api/test/health-records.e2e-spec.ts
git commit -m "feat: add versioned health records"
```

### Task 4: 实现计划、每日任务和首页聚合 API

**Files:**
- Create: `apps/api/src/modules/health-plans/health-plans.module.ts`
- Create: `apps/api/src/modules/health-plans/health-plans.controller.ts`
- Create: `apps/api/src/modules/health-plans/health-plans.service.ts`
- Create: `apps/api/src/modules/health-plans/prisma-health-plans.repository.ts`
- Create: `apps/api/src/modules/health-plans/health-plans.dto.ts`
- Create: `apps/api/src/modules/daily-home/daily-home.module.ts`
- Create: `apps/api/src/modules/daily-home/daily-home.controller.ts`
- Create: `apps/api/src/modules/daily-home/daily-home.service.ts`
- Create: `apps/api/test/health-plans.e2e-spec.ts`
- Create: `apps/api/test/daily-home.e2e-spec.ts`
- Modify: `apps/api/src/app.module.ts`

- [ ] **Step 1: 写失败测试。**

覆盖以下规则：

1. `PUT /health-plans/current` 的 weight 计划需要 `direction`，`targetWeightKg` 可空但若存在范围为 20-300；sleep 计划拒绝 weight direction 和 target。
2. 新建计划会在同一事务中归档旧 active target 与 plan，创建新的 `HealthTarget`、关联的 active plan 和当日任务。weight 计划创建 `record_weight`、`record_meal`、`walk_15_minutes`；sleep 计划创建 `record_sleep`。
3. `PATCH /health-plans/tasks/:id { status: "completed" }` 只能修改本人的 pending task，并写入 `completedAt`。
4. `GET /daily-home/today` 返回 profile、active plan、todayRecords、todayTasks、`dailyAction` 和 `recordingProgress`；缺睡眠时 `dailyAction.type` 为 `record_sleep`。

- [ ] **Step 2: 运行测试，确认失败。**

Run:

```powershell
vitest run apps/api/test/health-plans.e2e-spec.ts apps/api/test/daily-home.e2e-spec.ts
```

Expected: FAIL，因为计划和首页模块不存在。

- [ ] **Step 3: 实现计划任务生成与首页聚合。**

计划 service 必须使用 `ruleVersion: 'daily-loop-v1'`。保存计划时先在一个 Prisma `$transaction` 中将现有 active target/plan 标为 `archived`，再创建 `HealthTarget` 与其 `PersonalPlan`。`ensureTasksForDate(plan, date)` 使用 `upsert` 和模型唯一约束，保证刷新首页不会创建重复任务。daily-home service 只调用 `HealthPlansService.getForUser` 和 `HealthRecordsService.getTodayForUser` 的公开方法，再调用 `selectDailyAction`；模块不得跨模块直接访问对方 Prisma repository。

- [ ] **Step 4: 运行端到端测试。**

Run: `vitest run apps/api/test/health-plans.e2e-spec.ts apps/api/test/daily-home.e2e-spec.ts`

Expected: 计划、任务、首页动作均由用户自身记录决定；未登录返回 401；同一日期多次读取不产生重复任务。

- [ ] **Step 5: 提交计划与首页模块。**

```powershell
git add apps/api/src/modules/health-plans apps/api/src/modules/daily-home apps/api/src/app.module.ts apps/api/test
git commit -m "feat: add daily plan and home APIs"
```

### Task 5: 扩展小程序请求层、store 和五栏导航

**Files:**
- Modify: `apps/mini/src/services/api-client.ts`
- Modify: `apps/mini/src/services/api-client.spec.ts`
- Create: `apps/mini/src/features/health-loop/health-loop.service.ts`
- Create: `apps/mini/src/features/health-loop/health-loop.store.ts`
- Create: `apps/mini/src/features/health-loop/health-loop.store.spec.ts`
- Create: `apps/mini/src/custom-tab-bar/index.vue`
- Modify: `apps/mini/src/pages.json`
- Create: `apps/mini/src/static/illustrations/xuxu-avatar.jpg`
- Create: `apps/mini/src/static/illustrations/home-companion-banner.png`
- Create: `apps/mini/src/static/illustrations/record-desk-banner.png`
- Create: `apps/mini/src/static/illustrations/program-weight.png`
- Create: `apps/mini/src/static/illustrations/program-sleep.png`
- Create: `apps/mini/src/static/illustrations/xuxu-record-reminder.png`
- Create: `apps/mini/src/static/illustrations/xuxu-complete.png`

- [ ] **Step 1: 写 client 与 store 的失败测试。**

测试 `createApiClient` 新增 `post`、`patch` 和带 query 的 `get` 后仍能在失败时保留 `error.code` 与 `requestId`。store 测试 fake client 后断言 `loadToday()`、`createWeightRecord()` 和 `completeTask()` 会刷新首页 DTO，而不会在组件中直接拼 URL。

- [ ] **Step 2: 运行小程序单元测试，确认失败。**

Run: `vitest run apps/mini/src/services/api-client.spec.ts apps/mini/src/features/health-loop/health-loop.store.spec.ts`

Expected: FAIL，因为 POST/PATCH 与 health-loop store 不存在。

- [ ] **Step 3: 实现客户端数据层与自定义导航。**

API transport method 扩展为 `'GET' | 'PUT' | 'POST' | 'PATCH'`。`health-loop.service.ts` 只导出 `loadToday`、`loadPlan`、`savePlan`、`createRecord`、`replaceRecord`、`completeTask`；store 对外只暴露 `today`、`plan`、`loading`、`error` 和上述动作。

在 `pages.json` 开启 `tabBar.custom: true`，注册 `home`、`records`、`xuxu`、`plan`、`me` 五个 tab 页面。`custom-tab-bar/index.vue` 的中间项使用 `xuxu-avatar.jpg`，尺寸固定为 88rpx 圆形，点击跳转 `/pages/xuxu/XuxuPage`；其余四项使用文字和轻量线性 CSS 图标。禁止采用悬浮遮挡式聊天球。

将以下已审核原型素材复制到 `src/static/illustrations/` 并改为上方的对外文件名：`avatar.jpg`、`home-companion-banner.png`、`record-desk-banner.png`、`program-weight.png`、`program-sleep.png`、`xuxu-record-reminder.png`、`xuxu-complete.png`。不提升情绪、肠胃、代谢、安全支持和周回顾图片。

- [ ] **Step 4: 运行测试和类型检查。**

Run:

```powershell
vitest run
vue-tsc --noEmit
```

Expected: store 不含硬编码业务规则；五栏导航能从每个正式页面稳定渲染。

- [ ] **Step 5: 提交小程序基础。**

```powershell
git add apps/mini
git commit -m "feat: add daily health loop client foundation"
```

### Task 6: 实现记录页与版本化编辑

**Files:**
- Create: `apps/mini/src/pages/records/RecordsPage.vue`
- Create: `apps/mini/src/features/health-loop/record-draft.ts`
- Create: `apps/mini/src/features/health-loop/record-draft.spec.ts`
- Create: `apps/mini/src/features/health-loop/components/WeightRecordForm.vue`
- Create: `apps/mini/src/features/health-loop/components/MealStructureForm.vue`
- Create: `apps/mini/src/features/health-loop/components/ActivityRecordForm.vue`
- Create: `apps/mini/src/features/health-loop/components/SleepRecordForm.vue`
- Create: `apps/mini/src/features/health-loop/components/RecordTimeline.vue`
- Create: `apps/mini/src/components/XuxuHint.vue`

- [ ] **Step 1: 写页面状态与输入校验测试。**

提取并测试纯函数 `normalizeRecordDraft`：空体重、0 分钟活动、无睡眠质量、无餐次时返回字段级错误；合法草稿产生后端 DTO，不带 `userId`、版本或派生健康指标。

- [ ] **Step 2: 运行测试，确认失败。**

Run: `vitest run apps/mini/src/features/health-loop`

Expected: FAIL，因为表单和草稿规范化不存在。

- [ ] **Step 3: 实现四种快速表单和当天时间线。**

记录页顶部固定四个入口：体重、饮食结构、活动、睡眠。饮食结构只使用“主食、蛋白质、蔬菜”三项开关与餐次；活动只要求类型与分钟；睡眠只要求时长和感受。每个表单保存成功后关闭表单、刷新时间线并调用 `XuxuHint` 显示一句事实性反馈，例如“这条记录会在本周回顾中帮助你看见节律”。

时间线仅展示当前版本，点击“修改”带入当前草稿并调用 `replaceRecord`，不在客户端修改旧记录。空时间线才展示 `record-desk-banner.png`；已有记录后不保留大横幅。

- [ ] **Step 4: 手工验证微信开发者工具路径。**

按顺序验证：新建体重 -> 修改体重 -> 刷新页面 -> 只显示新值；新增午餐结构、步行和睡眠；关闭网络后保存失败仍留在表单并显示可读错误。

- [ ] **Step 5: 提交记录体验。**

```powershell
git add apps/mini/src/pages/records apps/mini/src/features/health-loop apps/mini/src/components/XuxuHint.vue
git commit -m "feat: add daily health records page"
```

### Task 7: 实现首页、计划、序序和我的页面

**Files:**
- Modify: `apps/mini/src/pages/home/HomePage.vue`
- Create: `apps/mini/src/pages/plan/PlanPage.vue`
- Create: `apps/mini/src/pages/plan-setup/PlanSetupPage.vue`
- Create: `apps/mini/src/pages/xuxu/XuxuPage.vue`
- Create: `apps/mini/src/pages/me/MePage.vue`
- Modify: `apps/mini/src/pages.json`
- Modify: `apps/mini/src/styles/tokens.scss`

- [ ] **Step 1: 写首页显示状态测试。**

用三个 `DailyHomeDto` fixture 测试：无计划时首页跳转计划设置；缺睡眠时首行动为“补记昨晚睡眠”；有四类记录时显示“今天已记录完整”。fixture 不得包含热量、健康分、医学结论或假趋势。

- [ ] **Step 2: 运行测试，确认失败。**

Run: `vitest run apps/mini/src/features/health-loop`

Expected: FAIL，因为首页显示模型与计划设置行为不存在。

- [ ] **Step 3: 实现页面行为和素材使用规则。**

首页按顺序显示问候、今日唯一行动、四类记录进度、轻量计划进度。仅当用户已有至少两条体重记录时显示“已记录的变化”摘要，不画虚假趋势线。首页行动卡使用 `home-companion-banner.png`，左侧承载文字，右侧序序保持可见。

计划设置页：weight 计划选择“减重 / 保持 / 增重”，目标体重可跳过；sleep 计划不展示体重输入。计划页展示当前目标、当天任务与完成进度；完成时使用 `xuxu-complete.png`，未完成时不进行惩罚性文案。睡眠计划使用 `program-sleep.png`，体重计划使用 `program-weight.png`。

序序页本阶段不发送自由文本到模型。它展示当前行动的确定性解释和四个快捷入口（体重、饮食、活动、睡眠），每个入口只根据已有 DTO 展开解释；必须标明“健康管理参考，不是医疗诊断”。真实聊天输入、AI 授权开关和风险支持页属于阶段 2C。

我的页面展示档案入口、当前目标、提醒占位和数据管理入口；不提前创建 AI 授权开关，避免给用户一种真实聊天已上线的错觉。

- [ ] **Step 4: 构建微信小程序并手工验证五栏导航。**

Run:

```powershell
vue-tsc --noEmit
uni build -p mp-weixin
node ../../scripts/verify-mini-build.mjs
```

Expected: 构建产物含五个正式页面；未建档用户仍被重定向至 onboarding；任一 tab 返回后仍能加载同一用户数据。

- [ ] **Step 5: 提交闭环页面。**

```powershell
git add apps/mini/src/pages apps/mini/src/pages.json apps/mini/src/styles/tokens.scss
git commit -m "feat: add daily health loop screens"
```

### Task 8: 更新契约、文档和阶段验收

**Files:**
- Modify: `apps/api/src/openapi.ts`
- Modify: `apps/api/openapi.json`
- Modify: `docs/engineering/local-development.md`
- Modify: `docs/product/heshengxu-product-blueprint.md`
- Create: `docs/engineering/stage-2a-acceptance.md`

- [ ] **Step 1: 补齐 OpenAPI、开发命令和产品状态。**

OpenAPI 必须包含本计划“API 与数据约定”列出的全部端点和请求 schema。开发文档说明阶段 2A 仍使用开发 token，真实微信登录和 AI Provider 不可用于本地演示。产品蓝图阶段表将 2A 从“待开发”改为“已完成”只能在全部验收通过后执行。

- [ ] **Step 2: 执行完整验收。**

Run:

```powershell
docker compose -f infra/docker/docker-compose.yml ps
prisma validate --schema apps/api/prisma/schema.prisma
prisma migrate status --schema apps/api/prisma/schema.prisma
vitest run --config apps/api/vitest.config.ts
vitest run
vue-tsc --noEmit
tsc -p tsconfig.build.json
uni build -p mp-weixin
node ../../scripts/verify-mini-build.mjs
node --experimental-strip-types src/openapi.ts
git diff --check
```

Expected: PostgreSQL/Redis healthy；迁移已应用；API、领域、小程序测试全部通过；类型检查、API 构建、小程序构建和 OpenAPI 生成通过；工作区不含密钥、真实 AI key 或用户健康数据。

- [ ] **Step 3: 在真实小程序构建中走完整路径。**

验证顺序：完成建档 -> 设置体重计划 -> 补记睡眠 -> 记录体重/午餐/步行 -> 完成任务 -> 修改体重 -> 刷新 -> 进入首页/记录/序序/计划/我的五个入口。再验证第二个开发用户无法读写第一个用户的记录和任务。

- [ ] **Step 4: 提交、推送并记录验收结果。**

```powershell
git add apps/api apps/mini packages docs
git commit -m "feat: complete daily health loop"
git push origin main
```

## 计划自检

| 蓝图要求 | 对应任务 |
| --- | --- |
| 体重管理的完整每日闭环 | Task 2 至 Task 7 |
| 睡眠共享记录与节律任务 | Task 2、Task 3、Task 4、Task 6、Task 7 |
| 低摩擦四类记录 | Task 3、Task 5、Task 6 |
| 可修改且不静默覆盖记录 | Task 2、Task 3、Task 6 |
| 首页 / 记录 / 序序 / 计划 / 我的 | Task 5、Task 7 |
| 序序任务内陪伴但不接真实模型 | Task 5、Task 6、Task 7 |
| 现有插画的受控提升 | Task 5、Task 6、Task 7 |
| 用户隔离、测试、构建和 OpenAPI | Task 3、Task 4、Task 8 |

阶段 2B 才实现至少 3 天记录后的趋势和周回顾；阶段 2C 才实现自由聊天、AI 授权、风险支持页、输出审查和 AITrace 扩展。
