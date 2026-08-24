# 和生序阶段 1 建档闭环实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现首次用户建档、实时 BMI、服务端保存和完成前的入口锁定。

**Architecture:** 共享包继续提供纯 BMI 规则与健康目标类型；NestJS 内存仓储增加当前用户档案更新接口；uni-app 使用单一 onboarding 页面和本地表单状态，提交成功后进入一个受保护的首页占位页。阶段 1 不接 Prisma、真实微信登录、图片资源或真实 AI Provider。

**Tech Stack:** TypeScript、NestJS、class-validator、uni-app/Vue 3、Vitest、Supertest。

## 文件边界

- Modify `packages/contracts/src/health-profile.ts`: 共享档案和目标类型。
- Modify `packages/domain/src/bmi.ts`: 暴露适合页面使用的分类标签。
- Modify `apps/api/src/modules/health-profile/health-profile.repository.ts`: 增加更新契约和内存实现。
- Modify `apps/api/src/modules/health-profile/health-profile.service.ts`: 校验并计算派生 BMI。
- Modify `apps/api/src/modules/health-profile/health-profile.controller.ts`: 增加 `PUT /api/v1/health-profiles/me`。
- Add `apps/api/src/modules/health-profile/health-profile.dto.ts`: 请求白名单和枚举校验。
- Add `apps/api/test/health-profile-onboarding.e2e-spec.ts`: 保存、越权字段和非法输入测试。
- Modify `apps/mini/src/services/api-client.ts` and its spec: 支持 PUT JSON 请求。
- Add `apps/mini/src/pages/onboarding/OnboardingPage.vue`: 四步建档、实时 BMI、提交态。
- Add `apps/mini/src/pages/home/HomePage.vue`: 完成建档后的最小入口。
- Modify `apps/mini/src/pages.json`: 注册建档和首页。
- Add `apps/mini/src/stores/onboarding.ts`: 本地流程状态和锁定判断。

### Task 1: 共享类型与服务端更新接口

- [ ] **Step 1: 写失败测试**：e2e 断言 `PUT /api/v1/health-profiles/me` 接收 `displayName`、`sex`、`heightCm`、`weightKg`、`primaryGoal`，返回计算后的 BMI；带 `userId` 时返回 400。
- [ ] **Step 2: 实现 DTO、仓储 update、service update 和 controller PUT**，用户 id 只从 `AuthGuard` 上下文读取。
- [ ] **Step 3: 运行 API 单测和 e2e，确认通过。**

### Task 2: 小程序 API client 与流程状态

- [ ] **Step 1: 写失败测试**：client 发送 PUT 时保留 URL、method、JSON body，并保留错误 code/requestId。
- [ ] **Step 2: 扩展 transport 和 `update` 方法；创建 onboarding store，默认锁定业务入口。**
- [ ] **Step 3: 运行小程序测试和类型检查。**

### Task 3: 建档页面、BMI 反馈和解锁首页

- [ ] **Step 1: 创建四步 onboarding 页面**：基础资料、身高体重、目标、确认；输入变化立即计算 BMI，提交按钮有禁用和加载态。
- [ ] **Step 2: 创建首页占位并在 `pages.json` 中注册；未完成档案时始终回到 onboarding。**
- [ ] **Step 3: 构建微信小程序并检查产物包含两个页面。**

### Task 4: 文档、验收和提交

- [ ] **Step 1: 更新本地开发文档，记录阶段 1 命令和当前 Prisma 暂缓状态。**
- [ ] **Step 2: 运行 API 测试、mini 测试、类型检查、微信构建和 `git diff --check`。**
- [ ] **Step 3: 提交并推送 `feat: add stage one onboarding flow`。**
