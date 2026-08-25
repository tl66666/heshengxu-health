# 和生序阶段 0.5：数据持久化设计

**日期：** 2026-08-25  
**状态：** 已确认，进入实施

## 目标

将当前仅用于流程验证的内存健康档案替换为 PostgreSQL 持久化实现。用户完成建档后，即使 API 重启，健康档案仍可通过现有 `GET` 和 `PUT /api/v1/health-profiles/me` 读取和更新。

## 范围

- 引入 Prisma Client、Prisma CLI、PostgreSQL schema 与第一份迁移。
- 创建最小数据模型：`User`、`ExternalIdentity`、`Consent`、`HealthProfile`、`AiTrace`。
- 用 `PrismaHealthProfileRepository` 替换生产 API 中的内存仓储。
- 保持现有 API 路径、认证上下文、错误 envelope 和 BMI 派生逻辑不变。
- 为本地 Docker PostgreSQL 执行迁移，并以 API 重建后仍能读取档案作为验收。

## 明确不做

- 不接入真实微信 `code` 换取身份，不写入 AppSecret。
- 不保存 AI 原文、API key、诊断内容或药物建议。
- 不实现食物、体重记录、睡眠、计划、商城、社区等业务表。
- 不引入 Redis 队列或拆分微服务。

## 数据模型

`User` 是内部用户主键与创建时间。`ExternalIdentity` 预留微信等身份提供方，每个 `(provider, providerUserId)` 唯一；阶段 0.5 不实际调用提供方。`Consent` 记录用户同意的隐私条款版本与时间。

`HealthProfile` 与 `User` 一对一，只保存展示名、出生日期、性别、身高、体重、首要目标及时间戳。BMI 不落库，读取或更新时由 `packages/domain` 中的纯规则计算。

`AiTrace` 只保存 `userId`、请求 SHA-256、风险决策、可选原因、provider、model、创建时间；禁止存储 `message`、prompt、response、token 或 key。

## 服务端架构

健康档案服务仍只依赖 `HealthProfileRepository`。生产模块注入 `PrismaHealthProfileRepository`，测试可继续注入内存 fake。仓储按 `userId` 查询或创建档案，写入时用 Prisma `upsert`，不接受来自 HTTP body 的 `userId` 或 `profileId`。

为开发 token 创建内部 `User` 时，使用稳定的 `userId` 作为主键。真实登录接入后只替换身份层，档案控制器与 repository 合约不变。

## 迁移与运行方式

Prisma schema 位于 `apps/api/prisma/schema.prisma`。本地开发先启动 `infra/docker/docker-compose.yml` 中的 PostgreSQL，再运行 `pnpm --filter @heban/api prisma migrate dev --name stage0_persistence`。提交的 migration 是可重放的 SQL；CI 不注入数据库密码，也不运行开发迁移。

## 验收标准

1. Docker PostgreSQL healthy 后，迁移可执行并生成五张最小表。
2. `PUT /health-profiles/me` 保存资料后，重新创建 Nest 应用仍能通过 `GET /health-profiles/me` 得到同一数据。
3. 任何请求不能借 `userId`、`profileId` 读取或写入其他用户档案。
4. 数据库中 AI 审计表不含消息正文、模型输入输出或密钥字段。
5. API 单测、e2e、类型检查、构建和小程序构建通过。
