# 阶段 0.1 工程结构收敛实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task with verification checkpoints.

**Goal:** 收敛仓库入口、删除已确认死代码，并建立可持续的分模块开发规范。

**Architecture:** 保留当前 pnpm workspace、uni-app、NestJS、Prisma 和共享 packages；小程序以页面内 `MiniTabBar` 作为唯一导航实现，业务按 `features/<domain>` 与 API `modules/<domain>` 对齐。

**Tech Stack:** pnpm 11、Node 24、Vue 3、uni-app、NestJS 11、Prisma 6、Vitest、TypeScript。

---

### Task 1: 固化仓库边界

**Files:**
- Create: `docs/architecture/codebase-governance.md`
- Create: `docs/superpowers/specs/2026-08-26-engineering-structure-cleanup-design.md`

- [ ] 阅读并确认顶层目录、依赖方向、资源源目录和构建产物规则。
- [ ] 将规则写入治理文档，明确页面、features、services、API modules 的责任边界。
- [ ] 检查文档不含 `TBD`、`TODO` 或未定义目录。

### Task 2: 删除已确认死代码

**Files:**
- Delete: `apps/mini/src/custom-tab-bar/index.vue`
- Delete: `apps/mini/src/styles/tokens.scss`
- Delete: `pnpm-mini-install.err.log`
- Delete: `pnpm-mini-install.out.log`

- [ ] 运行 `rg -n "custom-tab-bar|tokens.scss" apps docs scripts --glob '!docs/superpowers/plans/archive/**'`，记录现有引用。
- [ ] 更新当前有效文档，将导航实现指向 `apps/mini/src/components/MiniTabBar.vue`；历史归档计划不改动。
- [ ] 删除文件后再次运行 `rg`，确认没有生产源码引用。

### Task 3: 增强脚手架检查

**Files:**
- Modify: `scripts/verify-mini-build.mjs`
- Create: `scripts/verify-repository-layout.mjs`
- Modify: `apps/mini/package.json`

- [ ] 写布局检查：确认 `apps/mini/src/pages`、`components`、`features`、`services`、`stores`、`static/icons` 存在；确认删除的死入口不存在。
- [ ] 写禁提交检查：扫描 Git 跟踪文件，拒绝 `dist`、`node_modules`、`.env`、`*.log`、`project.private.config.json` 和 `apps/mini/package-lock.json`。
- [ ] 在 `apps/mini/package.json` 增加 `check:layout`，执行 `node ../../scripts/verify-repository-layout.mjs`。

### Task 4: 阶段验收

**Files:**
- Modify: `docs/engineering/project-structure.md`
- Modify: `docs/README.md`

- [ ] 更新有效文档的入口和阶段路线，明确旧计划只读归档。
- [ ] 运行 `pnpm --filter @heban/mini test`。
- [ ] 运行 `pnpm --filter @heban/mini typecheck`。
- [ ] 运行 `pnpm --filter @heban/mini build:mp-weixin:check`。
- [ ] 运行 `pnpm check` 与 `pnpm test`。
- [ ] 单独提交：`chore: converge repository structure`。
