# 健康记录模块（前端优先）实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task with verification checkpoints.

**Goal:** 先完成小程序健康记录的稳定前端闭环，再补齐后端接口验证。

**Architecture:** 新增 `features/health-records` 负责表单模型、纯校验、DTO 映射、请求和状态；`RecordsPage.vue` 只负责布局与事件。后端继续沿用 `health-records` 模块，第二阶段只补边界测试和必要修正。

**Tech Stack:** Vue 3、uni-app、TypeScript、Vitest、NestJS、Prisma、PostgreSQL。

---

### Task 1: 建立前端记录域纯模型

**Files:**
- Create: `apps/mini/src/features/health-records/health-records.types.ts`
- Create: `apps/mini/src/features/health-records/health-records.validation.ts`
- Create: `apps/mini/src/features/health-records/health-records.validation.spec.ts`

- [ ] 定义四类表单模型、字段错误模型和统一提交结果类型。
- [ ] 为体重、饮食结构、活动、睡眠写纯校验函数，覆盖空值、范围和必填组合。
- [ ] 先运行 `npm exec -- vitest run src/features/health-records/health-records.validation.spec.ts`，确认测试失败后再实现。

### Task 2: 抽离 DTO 映射和记录服务

**Files:**
- Create: `apps/mini/src/features/health-records/health-records.mapper.ts`
- Create: `apps/mini/src/features/health-records/health-records.service.ts`
- Create: `apps/mini/src/features/health-records/health-records.mapper.spec.ts`
- Modify: `apps/mini/src/features/health-loop/health-loop.service.ts`

- [ ] 把时间线展示文本和表单回填转换集中到 mapper，确保四类记录字段不在页面重复实现。
- [ ] 把 create、replace、loadToday 请求封装到记录 service，复用现有 `createApiClient` transport。
- [ ] 用 Vitest 覆盖四类 DTO 映射和修改记录回填。

### Task 3: 建立记录状态并重写页面事件层

**Files:**
- Create: `apps/mini/src/features/health-records/health-records.store.ts`
- Modify: `apps/mini/src/pages/records/RecordsPage.vue`
- Modify: `apps/mini/src/pages/home/HomePage.vue`

- [ ] 将页面中的 `weight`、`meal`、`activity`、`sleep`、`editingId`、`saving`、`formError` 迁移到记录 store。
- [ ] 页面只保留类型切换、字段绑定、提交和编辑事件；提交前调用纯校验，失败时保留输入。
- [ ] 重做记录页为“标题/类型切换/单一表单/今日时间线”四段结构，保留 Demo 的轻量密度。
- [ ] 保存成功后刷新记录 store 和首页 `healthLoopState`，保证两个页面显示一致。

### Task 4: 前端验收

**Files:**
- Modify: `apps/mini/src/pages/records/records-experience.spec.ts`
- Modify: `apps/mini/src/components/navigation-contract.spec.ts`

- [ ] 增加四类记录表单切换、保存中禁用、错误保留输入、修改回填的测试。
- [ ] 运行小程序测试、`vue-tsc`、Prettier 和微信构建。
- [ ] 清空 `dist/build` 与 `dist/dev` 后重新构建，运行 `verify-mini-build.mjs`。

### Task 5: 后端边界测试

**Files:**
- Modify: `apps/api/src/modules/health-records/health-records.dto.ts`
- Modify: `apps/api/test/health-records.e2e-spec.ts`
- Modify: `apps/api/test/daily-loop-schema.e2e-spec.ts`

- [ ] 补充日期格式、范围、字符串长度和用户隔离测试。
- [ ] 补充修改后旧记录 `isCurrent=false`、新记录 `previousRecordId` 正确的版本链测试。
- [ ] 确认上海时区日期查询只返回当前版本。

### Task 6: 提交

- [ ] 运行 `npm exec -- vitest run apps/mini/src apps/api/src packages/domain/src`。
- [ ] 运行 `npm exec -- vue-tsc --noEmit --pretty false`。
- [ ] 运行 `npm exec -- prettier --check ...` 和 `npm exec -- uni build -p mp-weixin`。
- [ ] 提交：`feat: build frontend-first health records flow`。
