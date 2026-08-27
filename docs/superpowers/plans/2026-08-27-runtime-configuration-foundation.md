# Runtime Configuration Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Centralize the Mini Program API endpoint and development identity so one codebase can run locally, in Azure test, and in production without editing feature files.

**Architecture:** A small runtime module owns the API base URL and development authorization value. Feature services obtain a shared client factory from this module rather than duplicating `localhost` and request setup. `VITE_` variables configure build-time targets; secrets remain server-only and are not part of this module.

**Tech Stack:** uni-app, Vue 3, TypeScript, Vitest, Vite environment variables.

---

### Task 1: Define and test Mini Program runtime configuration

**Files:**
- Create: `apps/mini/src/config/runtime.ts`
- Create: `apps/mini/src/config/runtime.spec.ts`

- [ ] Write a failing test for the local default: `resolveMiniRuntime({})` returns `apiBaseUrl: 'http://localhost:3000/api/v1'` and `authorization: 'Bearer dev-mini-user'`.
- [ ] Run `node node_modules/vitest/vitest.mjs run src/config/runtime.spec.ts`; it must fail because the resolver does not exist.
- [ ] Implement `resolveMiniRuntime(environment)` with the type `{ apiBaseUrl: string; authorization?: string }`. It reads `VITE_MINI_API_BASE_URL`, removes one trailing slash, and omits the development token when a configured URL exists.
- [ ] Add a passing test for `VITE_MINI_API_BASE_URL: 'https://api.example.test/api/v1/'`, expecting `https://api.example.test/api/v1` and no authorization token.
- [ ] Run the focused test again and commit `feat: define mini program runtime configuration`.

### Task 2: Add one Mini Program API client factory

**Files:**
- Create: `apps/mini/src/services/mini-api.ts`
- Create: `apps/mini/src/services/mini-api.spec.ts`

- [ ] Write a failing test using an injected request adapter. It must assert a configured HTTPS runtime calls `https://api.example.test/api/v1/health` and sends an empty request header rather than a development bearer token.
- [ ] Run `node node_modules/vitest/vitest.mjs run src/services/mini-api.spec.ts`; it must fail because the shared factory does not exist.
- [ ] Implement `createMiniApiClient()` by composing `resolveMiniRuntime(import.meta.env)` with `createApiClient`. The `uni.request` adapter sets `Authorization` only when runtime configuration provides it. Tests inject the adapter instead of calling `uni.request`.
- [ ] Run `node node_modules/vitest/vitest.mjs run src/services/mini-api.spec.ts src/services/api-client.spec.ts` and commit `feat: add shared mini program API client`.

### Task 3: Remove duplicated localhost configuration

**Files:**
- Modify: `apps/mini/src/pages/bootstrap/BootstrapPage.vue`
- Modify: `apps/mini/src/pages/onboarding/OnboardingPage.vue`
- Modify: `apps/mini/src/features/health-loop/health-loop.service.ts`
- Modify: `apps/mini/src/features/health-profile/health-profile.service.ts`
- Modify: `apps/mini/src/features/health-records/health-records.service.ts`
- Modify: `apps/mini/src/features/food/food.service.ts`
- Modify: `apps/mini/src/features/food/food-recognition.ts`
- Modify: `apps/mini/src/features/weekly-review/weekly-review.service.ts`
- Create: `apps/mini/src/services/no-hardcoded-api-base.spec.ts`

- [ ] Write a source-contract test that reads the eight listed source files and fails if any contains `http://localhost:3000/api/v1`.
- [ ] Run `node node_modules/vitest/vitest.mjs run src/services/no-hardcoded-api-base.spec.ts`; it must fail because those feature files currently duplicate the local host.
- [ ] Replace every local `createMiniClient` implementation and page-local client with the shared `createMiniApiClient` export. Feature files must not own an API base URL or authorization header.
- [ ] Run `pnpm typecheck`, `pnpm test`, and `pnpm build:mp-weixin:check`; then commit `refactor: centralize mini program API configuration`.

### Task 4: Document environment configuration

**Files:**
- Modify: `.env.example`
- Modify: `README.md`
- Modify: `docs/engineering/local-development.md`

- [ ] Document `VITE_MINI_API_BASE_URL` as a public build-time URL, with separate local and Azure examples.
- [ ] Keep `CLOUDBASE_ENV_ID`, Tencent credentials, and database credentials explicitly server-only.
- [ ] Run `rg -n "VITE_MINI_API_BASE_URL|CLOUDBASE_ENV_ID|localhost:3000/api/v1" README.md docs .env.example` and confirm the output labels each value's boundary.
- [ ] Commit `docs: clarify runtime configuration boundaries`.

### Task 5: Plan Azure test deployment after API configuration is stable

**Files:**
- Create: `infra/azure/README.md`
- Create: `docs/superpowers/plans/2026-08-27-azure-test-environment.md`

- [ ] Specify an Azure Container Apps or App Service deployment for the NestJS API, Azure Database for PostgreSQL Flexible Server, server-only environment variables, Prisma migration execution, `/health` verification, and an authenticated profile request.
- [ ] Explicitly defer automatic provisioning and Azure credentials until the Mini Program has stable API configuration and test acceptance.
- [ ] Commit `docs: plan Azure test environment deployment`.
