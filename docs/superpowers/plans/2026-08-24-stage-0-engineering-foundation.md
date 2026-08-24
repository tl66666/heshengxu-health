# 阶段 0：工程底座 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 隔离静态 Demo，并建立可本地运行、可测试、可扩展到微信小程序与 App 的健康管理工程底座。

**Architecture:** 使用 pnpm monorepo：`apps/mini` 是 uni-app 小程序壳，`apps/api` 是 NestJS 模块化单体，`packages/contracts` 管理接口契约，`packages/domain` 放纯健康规则。阶段 0 只完成启动、配置、数据迁移、身份接口、健康档案骨架、AI 安全边界和质量门禁，不做最终界面、记录、计划、真实微信登录或真实模型调用。

**Tech Stack:** Node.js 20 LTS、pnpm 9、TypeScript、uni-app + Vue 3、NestJS、Prisma、PostgreSQL 16、Redis 7、Vitest、Supertest、Docker Compose、GitHub Actions。

**Scope decision:** 本计划替代旧 `2026-08-24-health-platform-foundation.md` 中提前实现首页和真实 AI 调用的部分。产品取舍见 `docs/superpowers/specs/2026-08-24-product-scope-after-mint-benchmark.md`。

---

## 目标目录

```text
heban-health/
  apps/
    mini/                         # uni-app 小程序壳，不含最终 UI
    api/                          # NestJS API
  packages/
    contracts/                    # API 类型、错误码、Zod schema
    domain/                       # BMI、单位与纯领域规则
    config/                       # 共享质量配置
  prototypes/web-demo/            # 当前静态 Demo 与探索素材
  infra/docker/                   # PostgreSQL、Redis 本地环境
  docs/architecture/              # ADR、身份和安全边界
  docs/engineering/               # 本地开发与验收说明
```

### Task 1: 隔离原型并冻结其工程边界

**Files:**
- Move: `index.html`, `styles.css`, `app.js`, `profile-utils.js`, `profile-utils.test.cjs`, `assets/` -> `prototypes/web-demo/`
- Modify: `README.md`
- Create: `docs/architecture/adr-001-modular-monolith.md`
- Create: `docs/architecture/adr-002-prototype-boundary.md`

- [ ] **Step 1: 写入两份架构决策记录**

`adr-001-modular-monolith.md` 必须声明：阶段 0 至阶段 2 使用 NestJS 模块化单体；模块只能经 public service、domain event 或 contracts 通信；只有独立部署或独立扩缩容需求明确后才评估拆服务。

`adr-002-prototype-boundary.md` 必须声明：`prototypes/web-demo/` 不参与生产构建、不包含密钥、不作为正式 API 和数据库字段的来源；其中图片仅用于设计探索。

- [ ] **Step 2: 移动原型文件而不修改其行为**

```powershell
New-Item -ItemType Directory -Force prototypes\web-demo | Out-Null
git mv index.html styles.css app.js profile-utils.js profile-utils.test.cjs assets prototypes/web-demo
```

将 README 的原型启动命令改为：

```powershell
npx serve prototypes/web-demo
```

- [ ] **Step 3: 验证原型独立可运行**

```powershell
node --test prototypes/web-demo/profile-utils.test.cjs
npx serve prototypes/web-demo --listen 4173
```

预期：BMI 测试通过，`http://localhost:4173` 返回 200。验证后停止临时服务。

- [ ] **Step 4: 提交原型边界**

```powershell
git add README.md prototypes docs/architecture
git commit -m "chore: isolate exploratory web demo"
```

### Task 2: 初始化 pnpm workspace 与统一质量规则

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Create: `eslint.config.mjs`
- Create: `prettier.config.mjs`
- Create: `.prettierignore`
- Create: `packages/config/package.json`

- [ ] **Step 1: 创建根工作区清单**

`package.json` 使用以下脚本：

```json
{
  "name": "heban-health",
  "private": true,
  "packageManager": "pnpm@9.15.4",
  "engines": { "node": ">=20 <23" },
  "scripts": {
    "format": "prettier . --check",
    "format:write": "prettier . --write",
    "lint": "eslint .",
    "typecheck": "pnpm -r --if-present typecheck",
    "test": "pnpm -r --if-present test",
    "check": "pnpm format && pnpm lint && pnpm typecheck"
  }
}
```

`pnpm-workspace.yaml`：

```yaml
packages:
  - apps/*
  - packages/*
```

- [ ] **Step 2: 安装依赖后先确认检查失败**

```powershell
pnpm add -Dw typescript eslint @eslint/js typescript-eslint prettier vitest
pnpm check
```

预期：第一次因配置不完整失败。补全 ESLint flat config 和 Prettier 配置，不能通过 `--no-verify` 绕过。

- [ ] **Step 3: 添加 TypeScript 基线并验证通过**

`tsconfig.base.json`：

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "skipLibCheck": true,
    "noUncheckedIndexedAccess": true
  }
}
```

```powershell
pnpm format:write
pnpm check
```

预期：format、lint、typecheck 全部通过。

- [ ] **Step 4: 提交工作区基础**

```powershell
git add package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json eslint.config.mjs prettier.config.mjs .prettierignore packages/config
git commit -m "chore: initialize typed workspace"
```

### Task 3: 创建 PostgreSQL、Redis 与安全配置规则

**Files:**
- Create: `infra/docker/docker-compose.yml`
- Create: `.env.example`
- Create: `docs/engineering/local-development.md`
- Modify: `.gitignore`

- [ ] **Step 1: 写 Docker Compose**

`infra/docker/docker-compose.yml` 只定义 PostgreSQL 16 与 Redis 7，使用命名卷 `postgres_data`、`redis_data`。PostgreSQL healthcheck 必须执行 `pg_isready -U heban`，Redis healthcheck 必须执行 `redis-cli ping`。

- [ ] **Step 2: 写入无密钥示例配置**

`.env.example`：

```dotenv
DATABASE_URL=postgresql://heban:heban_dev_password@localhost:5432/heban?schema=public
REDIS_URL=redis://localhost:6379
API_PORT=3000
MINI_API_BASE_URL=http://localhost:3000/api/v1
```

不得出现 AI key、微信 AppSecret、真实数据库地址或用户 token。

- [ ] **Step 3: 写文档并在本地验证**

```powershell
Copy-Item .env.example .env
docker compose --env-file .env -f infra/docker/docker-compose.yml up -d
docker compose --env-file .env -f infra/docker/docker-compose.yml ps
```

预期：两个服务均为 `healthy`。验证后执行 `docker compose --env-file .env -f infra/docker/docker-compose.yml down`。

- [ ] **Step 4: 提交本地基础设施**

```powershell
git add infra/docker .env.example .gitignore docs/engineering/local-development.md
git commit -m "chore: add local postgres and redis"
```

### Task 4: 定义共享契约与 BMI 纯规则

**Files:**
- Create: `packages/contracts/package.json`
- Create: `packages/contracts/src/api-envelope.ts`
- Create: `packages/contracts/src/error-codes.ts`
- Create: `packages/contracts/src/index.ts`
- Create: `packages/domain/package.json`
- Create: `packages/domain/src/bmi.ts`
- Test: `packages/domain/src/bmi.spec.ts`

- [ ] **Step 1: 先写 BMI 失败测试**

```ts
import { describe, expect, it } from 'vitest';
import { calculateBmi, classifyBmi } from './bmi';

describe('BMI', () => {
  it('rounds BMI to one decimal place', () => {
    expect(calculateBmi(168, 62)).toBe(22);
  });

  it.each([[17.9, 'underweight'], [22, 'normal'], [25.4, 'overweight'], [29, 'obesity']])(
    'classifies %s as %s',
    (value, category) => expect(classifyBmi(value)).toBe(category),
  );
});
```

- [ ] **Step 2: 确认测试因缺少实现而失败**

```powershell
pnpm --filter @heban/domain test -- bmi.spec.ts
```

预期：失败，提示 `bmi.ts` 不存在。

- [ ] **Step 3: 实现最小规则和稳定 envelope**

`bmi.ts` 导出：

```ts
export type BmiCategory = 'underweight' | 'normal' | 'overweight' | 'obesity';
export function calculateBmi(heightCm: number, weightKg: number): number;
export function classifyBmi(bmi: number): BmiCategory;
```

`api-envelope.ts` 导出：

```ts
export type ApiSuccess<T> = { data: T; meta?: { requestId: string } };
export type ApiFailure = { error: { code: string; message: string; requestId: string } };
```

`error-codes.ts` 至少有 `UNAUTHENTICATED`、`FORBIDDEN`、`VALIDATION_FAILED`、`NOT_FOUND`、`INTERNAL_ERROR`、`AI_SAFETY_BLOCKED`。

- [ ] **Step 4: 验证并提交共享包**

```powershell
pnpm --filter @heban/domain test -- bmi.spec.ts
pnpm check
git add packages/domain packages/contracts
git commit -m "feat: add shared health contracts and bmi rules"
```

### Task 5: 创建 NestJS API 外壳与统一 HTTP 约定

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/src/main.ts`
- Create: `apps/api/src/app.module.ts`
- Create: `apps/api/src/common/http/api-exception.filter.ts`
- Create: `apps/api/src/common/http/request-id.middleware.ts`
- Create: `apps/api/src/modules/system/system.controller.ts`
- Test: `apps/api/test/system.e2e-spec.ts`

- [ ] **Step 1: 写健康检查失败测试**

`system.e2e-spec.ts` 断言 `GET /health` 返回 200、`{ data: { status: 'ok' } }`，且包含 `x-request-id` header。

- [ ] **Step 2: 确认 API 还不存在**

```powershell
pnpm --filter @heban/api test:e2e -- system.e2e-spec.ts
```

预期：失败，原因是 Nest 应用和 e2e script 不存在。

- [ ] **Step 3: 实现 API 基线**

`main.ts` 必须读取 `.env`，启用 `ValidationPipe({ whitelist: true, transform: true })`，注册 request id middleware 和全局 exception filter。`/health` 不加版本前缀；业务 API 使用 `/api/v1`。

异常映射固定为：401 -> `UNAUTHENTICATED`，403 -> `FORBIDDEN`，400 -> `VALIDATION_FAILED`，404 -> `NOT_FOUND`，其他 -> `INTERNAL_ERROR`。所有 envelope 必须回传 requestId。

- [ ] **Step 4: 验证并提交**

```powershell
pnpm --filter @heban/api test:e2e -- system.e2e-spec.ts
pnpm --filter @heban/api build
git add apps/api
git commit -m "feat: add api foundation and error contract"
```

### Task 6: 建立身份、档案与 Prisma 最小数据边界

**Files:**
- Create: `apps/api/prisma/schema.prisma`
- Create: `apps/api/src/modules/auth/auth-context.ts`
- Create: `apps/api/src/modules/auth/auth.module.ts`
- Create: `apps/api/src/modules/auth/guards/auth.guard.ts`
- Create: `apps/api/src/modules/auth/providers/identity-provider.ts`
- Create: `apps/api/src/modules/auth/providers/wechat.identity-provider.ts`
- Create: `apps/api/src/modules/health-profile/health-profile.service.ts`
- Create: `apps/api/src/modules/health-profile/health-profile.repository.ts`
- Create: `apps/api/src/modules/health-profile/health-profile.controller.ts`
- Create: `apps/api/src/modules/health-profile/health-profile.module.ts`
- Test: `apps/api/src/modules/health-profile/health-profile.service.spec.ts`
- Test: `apps/api/test/health-profile-auth.e2e-spec.ts`

- [ ] **Step 1: 写数据隔离与未认证失败测试**

服务测试要求 `getForUser('user-a')` 不接收 profileId 且只读取 `user-a` 记录。e2e 测试要求没有 `Authorization: Bearer` 的 `GET /api/v1/health-profiles/me` 返回 401 和 `UNAUTHENTICATED`。

- [ ] **Step 2: 确认测试因模块缺失而失败**

```powershell
pnpm --filter @heban/api test -- health-profile.service.spec.ts
pnpm --filter @heban/api test:e2e -- health-profile-auth.e2e-spec.ts
```

预期：失败，原因是 schema、guard、service 和 endpoint 尚不存在。

- [ ] **Step 3: 实现最小 schema 和接口**

Prisma 只创建 `User`、`ExternalIdentity`、`Consent`、`HealthProfile`。`HealthProfile` 只能有 `userId`、`birthDate?`、`sex?`、`heightCm?`、`weightKg?`、`createdAt`、`updatedAt`；不要创建食物、商城、计划、内容或图片表。

身份接口固定为：

```ts
export interface IdentityProvider {
  exchange(code: string): Promise<{ provider: 'wechat'; providerUserId: string }>;
}
```

`WechatIdentityProvider` 缺少 `WECHAT_APP_ID` 或 `WECHAT_APP_SECRET` 时启动失败。阶段 0 不写密钥、不调用微信 API；测试使用签名测试 token，生产环境必须拒绝开发 token。

BMI 只从 `@heban/domain` 计算，不作为原始字段存储。

`HealthProfileController` 只暴露受 guard 保护的 `GET /api/v1/health-profiles/me`，并将认证上下文中的 userId 传给 `HealthProfileService.getForUser(userId)`；控制器不能接受 profileId、userId 或任意查询参数。

- [ ] **Step 4: 迁移、验证和提交**

```powershell
pnpm --filter @heban/api prisma migrate dev --name stage0_identity_profile
pnpm --filter @heban/api test -- health-profile.service.spec.ts
pnpm --filter @heban/api test:e2e -- health-profile-auth.e2e-spec.ts
git add apps/api/prisma apps/api/src/modules/auth apps/api/src/modules/health-profile apps/api/test
git commit -m "feat: add identity and health profile boundary"
```

### Task 7: 建立 AI 安全和审计边界，不接入真实模型

**Files:**
- Create: `apps/api/src/modules/ai/providers/ai-provider.ts`
- Create: `apps/api/src/modules/ai/safety/risk-classifier.service.ts`
- Create: `apps/api/src/modules/ai/safety/output-validator.service.ts`
- Create: `apps/api/src/modules/ai/ai-trace.repository.ts`
- Modify: `apps/api/prisma/schema.prisma`
- Test: `apps/api/src/modules/ai/safety/risk-classifier.service.spec.ts`
- Test: `apps/api/src/modules/ai/safety/output-validator.service.spec.ts`

- [ ] **Step 1: 写风险识别失败测试**

```ts
expect(classifier.classify('我胸痛而且呼吸困难')).toEqual({ decision: 'block', reason: 'acute_symptom' });
expect(classifier.classify('我应该停用降压药吗')).toEqual({ decision: 'block', reason: 'medication_or_diagnosis' });
expect(classifier.classify('今天外卖怎么搭配更均衡')).toEqual({ decision: 'allow' });
```

- [ ] **Step 2: 确认测试失败**

```powershell
pnpm --filter @heban/api test -- risk-classifier.service.spec.ts
```

预期：失败，提示 `RiskClassifierService` 不存在。

- [ ] **Step 3: 实现 AI 边界**

定义：

```ts
export interface AiProvider {
  complete(input: { system: string; user: string }): Promise<{ text: string; model: string }>;
}
```

阶段 0 不提供 OpenAI、转发站或其他真实 Provider。`AiTrace` 只保存 `userId`、`requestHash`、`safetyDecision`、`safetyReason?`、`provider?`、`model?`、`createdAt`，绝不保存原始消息和 API key。输出 validator 必须拦截诊断、药物、剂量和停药建议；被拦截时调用方不得继续调用模型。

- [ ] **Step 4: 生成迁移、验证、提交**

```powershell
pnpm --filter @heban/api prisma migrate dev --name stage0_ai_trace
pnpm --filter @heban/api test -- risk-classifier.service.spec.ts output-validator.service.spec.ts
git add apps/api/prisma apps/api/src/modules/ai
git commit -m "feat: add ai safety and audit boundary"
```

### Task 8: 创建 uni-app 工程壳、OpenAPI 与 CI 验收

**Files:**
- Create: `apps/mini/package.json`
- Create: `apps/mini/src/App.vue`
- Create: `apps/mini/src/main.ts`
- Create: `apps/mini/src/pages.json`
- Create: `apps/mini/src/pages/bootstrap/BootstrapPage.vue`
- Create: `apps/mini/src/services/api-client.ts`
- Create: `apps/mini/src/styles/tokens.scss`
- Test: `apps/mini/src/services/api-client.spec.ts`
- Create: `apps/api/src/openapi.ts`
- Create: `apps/api/openapi.json`
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: 写小程序请求层失败测试**

测试 `createApiClient`：服务端返回 `{ error: { code: 'UNAUTHENTICATED', message: '...', requestId: 'r1' } }` 时，抛出错误必须包含 `UNAUTHENTICATED` 和 `r1`，不能吞掉 requestId。

- [ ] **Step 2: 确认客户端测试失败**

```powershell
pnpm --filter @heban/mini test -- api-client.spec.ts
```

预期：失败，原因是小程序工程和 `createApiClient` 不存在。

- [ ] **Step 3: 实现不绑定最终设计的小程序壳**

只创建 `BootstrapPage`，显示“开发环境已连接”或网络错误；禁止实现首页、建档、tabbar、插画、方案卡和 AI 对话。`tokens.scss` 仅定义颜色、间距、圆角、字体变量，不引用图片。

API client 用 `uni.request`，base URL 只读取 `VITE_API_BASE_URL`，只依赖 `@heban/contracts` 的 envelope 类型。

`apps/mini/package.json` 必须提供 `test` 和 `build:mp-weixin` 脚本；`apps/api/package.json` 必须提供 `build`、`test`、`test:e2e`、`prisma` 和 `openapi:generate` 脚本，供本计划列出的每条命令直接执行。

- [ ] **Step 4: 生成 OpenAPI 与 CI**

`openapi.ts` 输出 `apps/api/openapi.json`，标题为“和生序健康 API”、版本 `v1`、声明 bearer authentication，包含 `/health` 和 `/api/v1/health-profiles/me`。

`.github/workflows/ci.yml` 使用 Node 20 和 pnpm 9.15.4，在 pull request 与 main push 上执行：

```yaml
- run: pnpm install --frozen-lockfile
- run: pnpm check
- run: pnpm test
- run: pnpm --filter @heban/api build
- run: pnpm --filter @heban/mini build:mp-weixin
```

CI 禁止注入 AI key 或微信密钥。

- [ ] **Step 5: 完整验收并提交**

```powershell
docker compose --env-file .env -f infra/docker/docker-compose.yml up -d
pnpm check
pnpm test
pnpm --filter @heban/api test:e2e
pnpm --filter @heban/api openapi:generate
pnpm --filter @heban/api build
pnpm --filter @heban/mini build:mp-weixin
git diff --check
docker compose --env-file .env -f infra/docker/docker-compose.yml down
```

预期：所有命令通过，构建产物位于 `apps/mini/dist/build/mp-weixin`；`.env`、生产密钥、最终页面和图片均未提交。

```powershell
git add apps/mini apps/api/openapi.json apps/api/src/openapi.ts .github docs/engineering/local-development.md
git commit -m "ci: add stage zero quality gates"
git push origin main
```

## 计划自检

| 需求 | 对应任务 |
| --- | --- |
| Demo 与图片不进入正式工程 | Task 1、Task 8 |
| 多端可扩展的目录和规范 | Task 2、Task 4、Task 8 |
| PostgreSQL、Redis、环境和迁移 | Task 3、Task 6 |
| API 契约、错误格式和身份边界 | Task 4、Task 5、Task 6、Task 8 |
| AI 安全、审计、密钥隔离 | Task 7 |
| 可重复测试和 CI | 每个任务的 TDD 步骤、Task 8 |

本阶段明确不交付：正式页面、设计资源配置、完整建档流程、食物库、健康记录、计划、洞察、商城、社区、真实微信登录和真实 AI Provider。这些需在阶段 1 流程确认后另写计划。
