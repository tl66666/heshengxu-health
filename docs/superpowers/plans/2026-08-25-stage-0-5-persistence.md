# 和生序阶段 0.5 数据持久化实施计划

> **状态：已完成。** 对应实现提交为 `51ce5fe`。2026-08-25 已复核 PostgreSQL 迁移表、API 重启后档案读取、API/小程序测试、类型检查与微信小程序构建。文中未勾选的复选框保留为历史实施步骤，不是当前待办；后续范围以 [和生序产品蓝图](../../product/heshengxu-product-blueprint.md) 为准。

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让健康档案和 AI 审计数据由 PostgreSQL 持久化，并保持现有 API 与小程序流程不变。

**Architecture:** Prisma schema 定义最小用户、身份、同意、健康档案和 AI 审计表；健康档案模块通过既有 repository port 注入 Prisma 实现。控制器仍只使用认证上下文的 userId，BMI 仍由纯领域规则派生，AI 审计只持久化哈希和安全决策。

**Tech Stack:** Prisma CLI/Client、PostgreSQL 16、NestJS、TypeScript、Vitest、Supertest、Docker Compose。

---

## 文件边界

- Create `apps/api/prisma/schema.prisma`: PostgreSQL datasource、generator 和五张表。
- Create `apps/api/prisma/migrations/<timestamp>_stage0_persistence/migration.sql`: 可重放的初始 schema。
- Create `apps/api/src/common/database/prisma.service.ts`: Nest 生命周期管理 Prisma Client。
- Create `apps/api/src/modules/health-profile/prisma-health-profile.repository.ts`: 档案 port 的 PostgreSQL 实现。
- Modify `apps/api/src/modules/health-profile/health-profile.module.ts`: 注入 Prisma repository。
- Create `apps/api/src/modules/ai/prisma-ai-trace.repository.ts`: 哈希审计持久化实现。
- Modify `apps/api/package.json`: Prisma 依赖与迁移脚本。
- Create `apps/api/test/health-profile-persistence.e2e-spec.ts`: 重启后档案仍存在的验收。
- Modify `docs/engineering/local-development.md`: 迁移、重置和验收命令。

### Task 1: 安装 Prisma 并定义最小 schema

- [ ] **Step 1: 添加依赖与脚本**

在 `apps/api/package.json` 添加 `@prisma/client@^6.16.0`、`prisma@^6.16.0` 与 `prisma:generate`、`prisma:migrate`、`prisma:deploy` 脚本。

- [ ] **Step 2: 写入 schema**

创建 `apps/api/prisma/schema.prisma`，包含 PostgreSQL datasource、`User`、`ExternalIdentity`、`Consent`、`HealthProfile` 和 `AiTrace`；`HealthProfile.userId`、`ExternalIdentity(provider, providerUserId)` 为唯一约束，`AiTrace` 只允许 hash 与安全元数据字段。

- [ ] **Step 3: 生成 client 并创建迁移**

运行 `pnpm --filter @heban/api prisma:generate` 和 `pnpm --filter @heban/api prisma:migrate -- --name stage0_persistence`。预期：生成 Prisma Client，迁移目录含 `migration.sql`，数据库新增五张表。

### Task 2: 用 Prisma repository 替换内存档案仓储

- [ ] **Step 1: 写失败的持久化 e2e 测试**

在 `apps/api/test/health-profile-persistence.e2e-spec.ts` 保存 `displayName: '序序'`、身高、体重和目标；关闭第一个 Nest app；创建第二个 app；断言读取结果仍有相同 `userId`、名称、BMI 和目标。

- [ ] **Step 2: 运行测试确认失败**

运行 `pnpm --filter @heban/api test:e2e -- health-profile-persistence.e2e-spec.ts`。预期：失败，因为当前 repository 为内存实现。

- [ ] **Step 3: 实现 PrismaService 与 repository**

`PrismaService` 继承 `PrismaClient`，在模块销毁时断开。repository 的 `findOrCreateForUser` 使用 `user.upsert` 加上 `healthProfile.upsert`；`updateForUser` 使用同一用户 id 的 profile upsert。不得接受 HTTP body 中的 userId。

- [ ] **Step 4: 修改模块依赖注入**

将 `HealthProfileService` 的构造依赖绑定为 `PrismaHealthProfileRepository`，测试仍可直接传入 fake repository。

- [ ] **Step 5: 运行测试确认通过**

运行 `pnpm --filter @heban/api test` 与 `pnpm --filter @heban/api test:e2e`。预期：未认证、越权字段、BMI 派生和重启持久化均通过。

### Task 3: 持久化 AI 审计且不存原文

- [ ] **Step 1: 写审计 repository 测试**

构造 `PrismaAiTraceRepository` 的 Prisma fake，传入 `requestHash` 与安全元数据，断言 `create.data` 不包含 `message`、`prompt`、`response`、`token` 或 `apiKey`。

- [ ] **Step 2: 实现 PrismaAiTraceRepository**

保存 `userId`、`requestHash`、`safetyDecision`、`safetyReason?`、`provider?`、`model?`。数据库约束和 TypeScript type 中均不存在原文列。

- [ ] **Step 3: 运行 AI 审计测试**

运行 `pnpm --filter @heban/api test -- ai-audit.service.spec.ts prisma-ai-trace.repository.spec.ts`。预期：所有审计测试通过。

### Task 4: 文档、完整验收与提交

- [ ] **Step 1: 更新本地开发文档**

加入启动 Docker、执行迁移、检查 schema 和开发环境重置数据库的明确命令；写明开发 token 仅限本地。

- [ ] **Step 2: 执行完整验收**

依次运行 Docker 健康检查、`prisma:deploy`、API 测试、API 构建、小程序测试、类型检查、微信构建检查和 `git diff --check`。预期：迁移成功，API 重启后档案仍在，所有测试和微信构建通过。

- [ ] **Step 3: 提交并推送**

提交范围为 `apps/api/prisma`、`apps/api/src`、`apps/api/test`、`apps/api/package.json`、`pnpm-lock.yaml` 与 `docs/engineering`；提交消息为 `feat: persist health profiles with postgres`。
