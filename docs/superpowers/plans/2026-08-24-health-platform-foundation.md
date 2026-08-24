# 健康平台工程底座 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有静态原型迁移为可本地运行的 pnpm monorepo，并交付支持微信登录、受保护健康档案读取和受控 AI 调用基础的小程序与 NestJS API。

**Architecture:** 根仓库管理小程序、API、共享 API 契约和纯领域规则；服务端以 NestJS 模块化单体提供 `/api/v1` REST 接口，PostgreSQL 为事实来源，Redis 仅提供缓存和队列基础设施。客户端以 uni-app/Vue 3 实现微信小程序首发端，并通过统一请求层访问 API。

**Tech Stack:** Node.js LTS、pnpm、uni-app、Vue 3、TypeScript、Pinia、NestJS、Prisma、PostgreSQL、Redis、OpenAPI、Vitest、Playwright、Docker Compose、GitHub Actions。

---

## 目标文件结构

```text
apps/
  api/
    prisma/schema.prisma
    src/app.module.ts
    src/common/{auth,config,http}/
    src/modules/{health-profile,health-goal}/
    test/
  mini/
    src/{pages,features,services,stores}/
packages/
  contracts/src/
  domain/src/
  config/
prototypes/web-demo/
infra/docker/docker-compose.yml
.github/workflows/ci.yml
docs/engineering/local-development.md
package.json
pnpm-workspace.yaml
pnpm-lock.yaml
```

## Task 1: 固化原型位置与根目录工作区

**Files:**
- Create: `prototypes/web-demo/index.html`
- Create: `prototypes/web-demo/styles.css`
- Create: `prototypes/web-demo/app.js`
- Create: `prototypes/web-demo/assets/hero.jpg`
- Create: `prototypes/web-demo/assets/avatar.jpg`
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Modify: `.gitignore`
- Test: `package.json` workspace scripts

- [ ] **Step 1: 移动现有静态原型而不改变文件内容**

Run:

```powershell
New-Item -ItemType Directory -Force prototypes/web-demo | Out-Null
git mv index.html styles.css app.js assets prototypes/web-demo/
```

Expected: 根目录不再包含原型页面文件，`prototypes/web-demo/` 可通过静态服务原样打开。

- [ ] **Step 2: 写入根工作区清单**

Create `package.json`:

```json
{
  "name": "heban-health",
  "private": true,
  "packageManager": "pnpm@9.15.4",
  "engines": { "node": ">=20.18.0 <23" },
  "scripts": {
    "build": "pnpm -r --if-present build",
    "check": "pnpm -r --if-present check",
    "format": "prettier --check .",
    "format:write": "prettier --write .",
    "test": "pnpm -r --if-present test",
    "test:e2e": "pnpm --filter @heban/api test:e2e",
    "dev:api": "pnpm --filter @heban/api start:dev",
    "dev:mini": "pnpm --filter @heban/mini dev:mp-weixin"
  },
  "devDependencies": {
    "prettier": "^3.4.2",
    "typescript": "^5.7.2"
  }
}
```

Create `pnpm-workspace.yaml`:

```yaml
packages:
  - apps/*
  - packages/*
```

Create `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "noUncheckedIndexedAccess": true
  }
}
```

- [ ] **Step 3: 补充工作区忽略规则**

Append these lines to `.gitignore`:

```gitignore
.pnpm-store/
.turbo/
apps/mini/dist/
apps/mini/unpackage/
apps/api/.env
```

- [ ] **Step 4: 安装根依赖并验证工作区**

Run:

```powershell
corepack enable
pnpm install
pnpm format
```

Expected: 创建 `pnpm-lock.yaml`，格式检查完成且没有未格式化文件。

- [ ] **Step 5: 提交原型迁移和工作区配置**

```powershell
git add .gitignore package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json prototypes
git commit -m "chore: establish pnpm workspace"
```

## Task 2: 建立共享配置、契约包和纯领域规则包

**Files:**
- Create: `packages/config/package.json`
- Create: `packages/config/prettier.json`
- Create: `packages/contracts/package.json`
- Create: `packages/contracts/src/index.ts`
- Create: `packages/contracts/src/http.ts`
- Create: `packages/contracts/src/health-profile.ts`
- Create: `packages/domain/package.json`
- Create: `packages/domain/src/index.ts`
- Create: `packages/domain/src/bmi.ts`
- Test: `packages/domain/src/bmi.spec.ts`

- [ ] **Step 1: 写 BMI 规则的失败测试**

Create `packages/domain/src/bmi.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { calculateBmi } from './bmi';

describe('calculateBmi', () => {
  it('calculates BMI from centimeters and kilograms', () => {
    expect(calculateBmi({ heightCm: 168, weightKg: 62 })).toBe(22);
  });

  it('rejects non-positive input', () => {
    expect(() => calculateBmi({ heightCm: 0, weightKg: 62 })).toThrow('heightCm must be positive');
  });
});
```

- [ ] **Step 2: 运行测试确认规则尚未实现**

Run:

```powershell
pnpm --filter @heban/domain test
```

Expected: FAIL，错误指出 `./bmi` 或 `calculateBmi` 不存在。

- [ ] **Step 3: 实现最小 BMI 规则及包出口**

Create `packages/domain/src/bmi.ts`:

```ts
export type BmiInput = { heightCm: number; weightKg: number };

export function calculateBmi({ heightCm, weightKg }: BmiInput): number {
  if (heightCm <= 0) throw new Error('heightCm must be positive');
  if (weightKg <= 0) throw new Error('weightKg must be positive');
  const meters = heightCm / 100;
  return Math.round((weightKg / (meters * meters)) * 10) / 10;
}
```

Create `packages/domain/src/index.ts`:

```ts
export * from './bmi';
```

Create `packages/contracts/src/http.ts`:

```ts
export type ApiSuccess<T> = { data: T; requestId: string };
export type ApiError = {
  error: { code: string; message: string; requestId: string };
};
```

Create `packages/contracts/src/health-profile.ts`:

```ts
export type HealthProfileDto = {
  id: string;
  displayName: string | null;
  birthDate: string | null;
  sex: 'female' | 'male' | 'unspecified';
  heightCm: number | null;
  weightKg: number | null;
  bmi: number | null;
  updatedAt: string;
};
```

Create `packages/contracts/src/index.ts`:

```ts
export * from './health-profile';
export * from './http';
```

- [ ] **Step 4: 运行领域测试并检查包边界**

Run:

```powershell
pnpm --filter @heban/domain test
pnpm --filter @heban/domain check
```

Expected: PASS；`domain` 不导入 NestJS、Prisma、Vue 或任何 HTTP 代码。

- [ ] **Step 5: 提交共享包**

```powershell
git add packages
git commit -m "feat: add shared health contracts and BMI rule"
```

## Task 3: 启动本地 PostgreSQL 与 Redis 基础设施

**Files:**
- Create: `infra/docker/docker-compose.yml`
- Create: `apps/api/.env.example`
- Create: `docs/engineering/local-development.md`
- Test: Docker health checks

- [ ] **Step 1: 创建本地基础设施定义**

Create `infra/docker/docker-compose.yml`:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: heban
      POSTGRES_PASSWORD: heban_local
      POSTGRES_DB: heban
    ports:
      - '5432:5432'
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U heban -d heban']
      interval: 5s
      timeout: 5s
      retries: 10
    volumes:
      - postgres_data:/var/lib/postgresql/data
  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 5s
      timeout: 5s
      retries: 10
volumes:
  postgres_data:
```

Create `apps/api/.env.example`:

```dotenv
DATABASE_URL=postgresql://heban:heban_local@localhost:5432/heban?schema=public
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=replace-with-a-local-secret-of-at-least-32-characters
PORT=3000
```

- [ ] **Step 2: 写入本地开发说明**

Create `docs/engineering/local-development.md` with these commands and prerequisites:

```markdown
# 本地开发

需要 Node.js 20 LTS、pnpm 9、Docker Desktop、微信开发者工具和 HBuilderX。

```powershell
Copy-Item apps/api/.env.example apps/api/.env
docker compose -f infra/docker/docker-compose.yml up -d
pnpm install
pnpm --filter @heban/api prisma migrate dev --name init
pnpm dev:api
```

小程序开发时运行 `pnpm dev:mini`，然后在 HBuilderX 或微信开发者工具中打开 `apps/mini/dist/dev/mp-weixin`。
```

- [ ] **Step 3: 启动并验证基础设施**

Run:

```powershell
docker compose -f infra/docker/docker-compose.yml up -d
docker compose -f infra/docker/docker-compose.yml ps
```

Expected: `postgres` 与 `redis` 都显示为 `healthy`。

- [ ] **Step 4: 提交本地基础设施**

```powershell
git add infra apps/api/.env.example docs/engineering/local-development.md
git commit -m "chore: add local database and cache services"
```

## Task 4: 创建 NestJS API、配置校验与基础健康检查

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/src/main.ts`
- Create: `apps/api/src/app.module.ts`
- Create: `apps/api/src/common/config/env.schema.ts`
- Create: `apps/api/src/common/http/http-exception.filter.ts`
- Create: `apps/api/src/health/health.controller.ts`
- Test: `apps/api/test/health.e2e-spec.ts`

- [ ] **Step 1: 用 Nest CLI 生成 API 基础目录**

Run:

```powershell
pnpm dlx @nestjs/cli new apps/api --package-manager pnpm --skip-git --strict
```

Then set the generated package name to `@heban/api` and add workspace dependencies on `@heban/contracts` and `@heban/domain`.

- [ ] **Step 2: 写健康检查的失败端到端测试**

Create `apps/api/test/health.e2e-spec.ts`:

```ts
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('GET /api/v1/health', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(() => app.close());

  it('returns a request id and status', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.status).toBe('ok');
        expect(typeof body.requestId).toBe('string');
      });
  });
});
```

- [ ] **Step 3: 运行测试确认 API 尚未满足契约**

Run:

```powershell
pnpm --filter @heban/api test:e2e -- health.e2e-spec.ts
```

Expected: FAIL，`/api/v1/health` 不存在或响应结构不匹配。

- [ ] **Step 4: 实现 API 前缀和健康检查**

Create `apps/api/src/health/health.controller.ts`:

```ts
import { randomUUID } from 'node:crypto';
import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';

@Controller('health')
export class HealthController {
  @Get()
  getHealth(@Req() request: Request) {
    return {
      data: { status: 'ok' },
      requestId: request.headers['x-request-id'] ?? randomUUID(),
    };
  }
}
```

Set `app.setGlobalPrefix('api/v1')` in `apps/api/src/main.ts`, enable a global `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true`, and import `HealthController` from `AppModule`.

- [ ] **Step 5: 运行 API 测试和类型检查**

Run:

```powershell
pnpm --filter @heban/api test:e2e -- health.e2e-spec.ts
pnpm --filter @heban/api check
```

Expected: PASS，健康检查响应满足统一成功 envelope。

- [ ] **Step 6: 提交 API 启动骨架**

```powershell
git add apps/api
git commit -m "feat: add versioned API health endpoint"
```

## Task 5: 建立 Prisma 数据模型与数据库迁移

**Files:**
- Create: `apps/api/prisma/schema.prisma`
- Create: `apps/api/src/common/prisma/prisma.module.ts`
- Create: `apps/api/src/common/prisma/prisma.service.ts`
- Create: `apps/api/prisma/migrations/<timestamp>_init/migration.sql`
- Test: `apps/api/test/prisma-schema.spec.ts`

- [ ] **Step 1: 写 schema 约束的失败测试**

Create `apps/api/test/prisma-schema.spec.ts`:

```ts
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

it('defines user and health profile with a one-to-one relation', async () => {
  const schema = await readFile(join(process.cwd(), 'prisma/schema.prisma'), 'utf8');
  expect(schema).toContain('model User');
  expect(schema).toContain('model HealthProfile');
  expect(schema).toContain('userId String @unique');
});
```

- [ ] **Step 2: 运行测试确认 schema 缺失**

Run:

```powershell
pnpm --filter @heban/api test -- prisma-schema.spec.ts
```

Expected: FAIL，因为 `prisma/schema.prisma` 尚不存在。

- [ ] **Step 3: 实现最小可用健康档案 schema**

Create `apps/api/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Sex {
  female
  male
  unspecified
}

model User {
  id        String        @id @default(cuid())
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
  profile   HealthProfile?
}

model HealthProfile {
  id          String   @id @default(cuid())
  userId      String   @unique
  displayName String?
  birthDate   DateTime?
  sex         Sex      @default(unspecified)
  heightCm    Decimal? @db.Decimal(5, 2)
  weightKg    Decimal? @db.Decimal(5, 2)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

- [ ] **Step 4: 生成迁移并验证数据库可用**

Run:

```powershell
pnpm --filter @heban/api prisma generate
pnpm --filter @heban/api prisma migrate dev --name init
pnpm --filter @heban/api test -- prisma-schema.spec.ts
```

Expected: Prisma Client 生成成功，数据库出现 `User` 和 `HealthProfile` 表，测试 PASS。

- [ ] **Step 5: 提交数据模型和迁移**

```powershell
git add apps/api/prisma apps/api/src/common/prisma apps/api/test/prisma-schema.spec.ts
git commit -m "feat: add user health profile schema"
```

## Task 6: 实现认证边界与受保护健康档案 API

**Files:**
- Create: `apps/api/src/common/auth/current-user.decorator.ts`
- Create: `apps/api/src/common/auth/auth.guard.ts`
- Create: `apps/api/src/modules/health-profile/health-profile.controller.ts`
- Create: `apps/api/src/modules/health-profile/health-profile.service.ts`
- Create: `apps/api/src/modules/health-profile/dto/upsert-health-profile.dto.ts`
- Test: `apps/api/test/health-profile.e2e-spec.ts`

- [ ] **Step 1: 写受保护档案 API 的失败测试**

Create `apps/api/test/health-profile.e2e-spec.ts`:

```ts
it('rejects an unauthenticated profile request', async () => {
  await request(app.getHttpServer()).get('/api/v1/health-profiles/me').expect(401);
});

it('returns a profile owned by the current user', async () => {
  const token = createTestToken({ sub: 'user-a' });
  await request(app.getHttpServer())
    .get('/api/v1/health-profiles/me')
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect(({ body }) => {
      expect(body.data.id).toEqual(expect.any(String));
      expect(body.data.displayName).toBeNull();
    });
});
```

Define the test helper with the same secret used by the guard:

```ts
import { sign } from 'jsonwebtoken';

function createTestToken(payload: { sub: string }): string {
  return sign(payload, process.env.JWT_ACCESS_SECRET!, { expiresIn: '5m' });
}
```

- [ ] **Step 2: 运行测试确认认证和档案端点未实现**

Run:

```powershell
pnpm --filter @heban/api test:e2e -- health-profile.e2e-spec.ts
```

Expected: FAIL，端点返回 404 或未正确拒绝未认证请求。

- [ ] **Step 3: 实现最小 JWT guard 和档案读取**

The guard must extract `Bearer <jwt>`, verify it with `JWT_ACCESS_SECRET`, and put `{ id: payload.sub }` on `request.user`; invalid or absent tokens throw `UnauthorizedException`. The service must use `upsert` to ensure a profile exists for the authenticated user and return a `HealthProfileDto` with ISO strings and `bmi` calculated by `@heban/domain` only when both height and weight exist.

The controller endpoint is:

```ts
@UseGuards(AuthGuard)
@Controller('health-profiles')
export class HealthProfileController {
  @Get('me')
  getMine(@CurrentUser() user: CurrentUser) {
    return this.healthProfileService.getMine(user.id);
  }
}
```

- [ ] **Step 4: 运行端到端测试并检查数据隔离**

Run:

```powershell
pnpm --filter @heban/api test:e2e -- health-profile.e2e-spec.ts
pnpm --filter @heban/api check
```

Expected: 未认证请求返回 401；每个 token 只读取其自身档案；测试 PASS。

- [ ] **Step 5: 提交认证和档案模块**

```powershell
git add apps/api/src/common/auth apps/api/src/modules/health-profile apps/api/test/health-profile.e2e-spec.ts
git commit -m "feat: add protected health profile API"
```

## Task 7: 创建 uni-app 小程序，并接入档案读取首屏

**Files:**
- Create: `apps/mini/package.json`
- Create: `apps/mini/src/pages.json`
- Create: `apps/mini/src/main.ts`
- Create: `apps/mini/src/App.vue`
- Create: `apps/mini/src/pages/home/HomePage.vue`
- Create: `apps/mini/src/services/api-client.ts`
- Create: `apps/mini/src/features/health-profile/health-profile.service.ts`
- Create: `apps/mini/src/features/health-profile/health-profile.store.ts`
- Test: `apps/mini/src/features/health-profile/health-profile.store.spec.ts`

- [ ] **Step 1: 创建 uni-app Vue 3 TypeScript 模板**

Run:

```powershell
pnpm create uni-app@latest apps/mini --template vue-ts
```

Set the generated package name to `@heban/mini`, enable the `dev:mp-weixin` and `build:mp-weixin` scripts, then add workspace dependencies on `@heban/contracts` and Pinia.

- [ ] **Step 2: 写档案 store 的失败测试**

Create `apps/mini/src/features/health-profile/health-profile.store.spec.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { loadHealthProfile } from './health-profile.service';

const get = vi.hoisted(() => vi.fn());

vi.mock('../../services/api-client', () => ({ apiClient: { get } }));

describe('loadHealthProfile', () => {
  it('returns the profile from the protected endpoint', async () => {
    get.mockResolvedValue({
      id: 'profile-1', displayName: '唐乐', birthDate: null,
      sex: 'unspecified', heightCm: null, weightKg: null, bmi: null,
      updatedAt: '2026-08-24T00:00:00.000Z',
    });
    const profile = await loadHealthProfile();
    expect(profile).toMatchObject({ id: 'profile-1', displayName: '唐乐' });
  });
});
```

- [ ] **Step 3: 运行测试确认客户端服务未实现**

Run:

```powershell
pnpm --filter @heban/mini test -- health-profile.store.spec.ts
```

Expected: FAIL，因为 `health-profile.service.ts` 和 API client 不存在。

- [ ] **Step 4: 实现统一请求层与档案服务**

Create `apps/mini/src/services/api-client.ts`:

```ts
import type { ApiSuccess } from '@heban/contracts';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export const apiClient = {
  get<T>(path: string): Promise<T> {
    return new Promise((resolve, reject) => {
      uni.request<ApiSuccess<T>>({
        url: `${baseUrl}${path}`,
        header: { Authorization: `Bearer ${uni.getStorageSync('accessToken') || ''}` },
        success: ({ statusCode, data }) => {
          if (statusCode >= 200 && statusCode < 300) resolve(data.data);
          else reject(new Error(data?.error?.message || '请求失败'));
        },
        fail: reject,
      });
    });
  },
};
```

Create `apps/mini/src/features/health-profile/health-profile.service.ts`:

```ts
import type { HealthProfileDto } from '@heban/contracts';
import { apiClient } from '../../services/api-client';

export function loadHealthProfile(): Promise<HealthProfileDto> {
  return apiClient.get<HealthProfileDto>('/health-profiles/me');
}
```

The Pinia store exposes `profile`, `isLoading`, `error` and `load()`. `HomePage.vue` calls `load()` in `onShow`, shows the display name and BMI when present, and otherwise displays the single command “完善健康档案”.

- [ ] **Step 5: 运行客户端测试和微信小程序构建**

Run:

```powershell
pnpm --filter @heban/mini test -- health-profile.store.spec.ts
pnpm --filter @heban/mini build:mp-weixin
```

Expected: 测试 PASS；生成 `apps/mini/dist/build/mp-weixin`，可由微信开发者工具导入。

- [ ] **Step 6: 提交小程序首屏**

```powershell
git add apps/mini
git commit -m "feat: add mini program health profile home"
```

## Task 8: 建立受控 AI 调用、风险拦截和审计基础

**Files:**
- Modify: `apps/api/prisma/schema.prisma`
- Create: `apps/api/src/modules/ai/ai.module.ts`
- Create: `apps/api/src/modules/ai/ai.controller.ts`
- Create: `apps/api/src/modules/ai/ai.service.ts`
- Create: `apps/api/src/modules/ai/dto/create-ai-assist.dto.ts`
- Create: `apps/api/src/modules/ai/providers/ai-provider.ts`
- Create: `apps/api/src/modules/ai/providers/openai-compatible.provider.ts`
- Create: `apps/api/src/modules/ai/safety/risk-classifier.service.ts`
- Create: `apps/api/src/modules/ai/safety/output-validator.service.ts`
- Test: `apps/api/src/modules/ai/safety/risk-classifier.service.spec.ts`
- Test: `apps/api/test/ai-assist.e2e-spec.ts`

- [ ] **Step 1: 写高风险输入拦截的失败测试**

Create `apps/api/src/modules/ai/safety/risk-classifier.service.spec.ts`:

```ts
import { RiskClassifierService } from './risk-classifier.service';

describe('RiskClassifierService', () => {
  const service = new RiskClassifierService();

  it('blocks acute danger messages', () => {
    expect(service.classify('我胸痛而且呼吸困难')).toEqual({ decision: 'block', reason: 'acute_symptom' });
  });

  it('blocks medication and diagnosis requests', () => {
    expect(service.classify('我应该停用降压药吗')).toEqual({ decision: 'block', reason: 'medication_or_diagnosis' });
  });

  it('allows a lifestyle question', () => {
    expect(service.classify('今天吃外卖怎么搭配更均衡')).toEqual({ decision: 'allow' });
  });
});
```

- [ ] **Step 2: 运行测试确认风险策略尚未实现**

Run:

```powershell
pnpm --filter @heban/api test -- risk-classifier.service.spec.ts
```

Expected: FAIL，因为 `RiskClassifierService` 不存在。

- [ ] **Step 3: 实现确定性风险分类和模型提供商边界**

Create `apps/api/src/modules/ai/safety/risk-classifier.service.ts`:

```ts
import { Injectable } from '@nestjs/common';

export type SafetyDecision =
  | { decision: 'allow' }
  | { decision: 'block'; reason: 'acute_symptom' | 'self_harm' | 'medication_or_diagnosis' };

@Injectable()
export class RiskClassifierService {
  classify(message: string): SafetyDecision {
    if (/(胸痛|呼吸困难|昏迷|中风|大出血)/u.test(message)) {
      return { decision: 'block', reason: 'acute_symptom' };
    }
    if (/(自杀|自残|不想活|伤害自己)/u.test(message)) {
      return { decision: 'block', reason: 'self_harm' };
    }
    if (/(处方|剂量|停药|诊断|开什么药)/u.test(message)) {
      return { decision: 'block', reason: 'medication_or_diagnosis' };
    }
    return { decision: 'allow' };
  }
}
```

Create `apps/api/src/modules/ai/providers/ai-provider.ts`:

```ts
export type AiCompletionInput = {
  system: string;
  user: string;
};

export interface AiProvider {
  complete(input: AiCompletionInput): Promise<{ text: string; model: string }>;
}

export const AI_PROVIDER = Symbol('AI_PROVIDER');
```

Create `apps/api/src/modules/ai/providers/openai-compatible.provider.ts`:

```ts
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AiCompletionInput, AiProvider } from './ai-provider';

@Injectable()
export class OpenAiCompatibleProvider implements AiProvider {
  constructor(@Inject(ConfigService) private readonly config: ConfigService) {}

  async complete(input: AiCompletionInput): Promise<{ text: string; model: string }> {
    const baseUrl = this.config.getOrThrow<string>('AI_PROVIDER_BASE_URL');
    const apiKey = this.config.getOrThrow<string>('AI_PROVIDER_API_KEY');
    const model = this.config.getOrThrow<string>('AI_MODEL');
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages: [
        { role: 'system', content: input.system },
        { role: 'user', content: input.user },
      ] }),
    });
    if (!response.ok) throw new Error(`AI provider request failed: ${response.status}`);
    const body = await response.json() as { model?: string; choices?: Array<{ message?: { content?: string } }> };
    return { text: body.choices?.[0]?.message?.content?.trim() || '', model: body.model || model };
  }
}
```

This is the only class that reads `AI_PROVIDER_BASE_URL`, `AI_PROVIDER_API_KEY`, and `AI_MODEL`. Add the three variable names, without values, to `apps/api/.env.example`; no client package or browser bundle may contain these values.

- [ ] **Step 4: 为调用与拦截结果增加审计表并生成迁移**

Append this model to `apps/api/prisma/schema.prisma` and add `aiTraces AiTrace[]` to `User`:

```prisma
model AiTrace {
  id             String   @id @default(cuid())
  userId         String
  requestHash    String
  safetyDecision String
  safetyReason   String?
  provider       String?
  model          String?
  createdAt      DateTime @default(now())
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

Run:

```powershell
pnpm --filter @heban/api prisma migrate dev --name add_ai_trace
```

Expected: Prisma migration creates `AiTrace`; raw user messages are not stored in the trace table.

- [ ] **Step 5: 实现受保护 AI 端点和输出校验**

Create `apps/api/src/modules/ai/dto/create-ai-assist.dto.ts`:

```ts
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateAiAssistDto {
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  message!: string;
}
```

The protected endpoint is `POST /api/v1/ai/assist`. `AiService.assist(userId, message)` must execute this exact order:

```text
1. Classify the input.
2. Store an AiTrace with SHA-256(message), safety decision and reason.
3. On block, return the fixed non-diagnostic help text and do not call the provider.
4. On allow, send only the user message plus this system scope to the provider:
   “你是禾伴健康助手。仅提供一般健康教育和生活方式建议；不诊断、不处方、不建议药物剂量或停药。信息不足时建议咨询专业人士。”
5. Reject provider output matching the risk classifier medication/diagnosis pattern, then return the same fixed help text.
6. Update AiTrace with provider name and returned model; return `{ reply, safety: 'allow' }` in the standard envelope.
```

The fixed help text is: `这类情况不适合由 AI 判断或处理。请尽快联系医生、紧急服务或当地心理援助资源；如有紧急危险，请立即寻求身边人的帮助。`

- [ ] **Step 6: 写并运行 AI API 端到端测试**

Create `apps/api/test/ai-assist.e2e-spec.ts` with a fake `AI_PROVIDER` that returns `今天可以尝试一份蔬菜、一份优质蛋白和一份主食的组合。`. Cover these exact cases:

```text
1. 未认证 POST /api/v1/ai/assist 返回 401。
2. “我胸痛而且呼吸困难”返回 200、safety 为 block，且 fake provider 未被调用。
3. “今天吃外卖怎么搭配更均衡”返回 200、safety 为 allow，且包含 fake provider 的回复。
4. 两次请求在 AiTrace 中创建两条记录，requestHash 不等于原始消息。
```

Run:

```powershell
pnpm --filter @heban/api test -- risk-classifier.service.spec.ts
pnpm --filter @heban/api test:e2e -- ai-assist.e2e-spec.ts
pnpm --filter @heban/api check
```

Expected: 三类风险单元测试和四类端到端断言全部 PASS。

- [ ] **Step 7: 提交受控 AI 基础能力**

```powershell
git add apps/api/.env.example apps/api/prisma apps/api/src/modules/ai apps/api/test/ai-assist.e2e-spec.ts
git commit -m "feat: add safe AI assistant foundation"
```

## Task 9: 发布 OpenAPI、代码质量门禁和 GitHub CI

**Files:**
- Create: `apps/api/src/openapi.ts`
- Create: `apps/api/openapi.json`
- Create: `.github/workflows/ci.yml`
- Create: `.prettierrc.json`
- Create: `.prettierignore`
- Modify: `docs/engineering/local-development.md`
- Test: GitHub Actions workflow syntax and local `pnpm check`

- [ ] **Step 1: 添加 API 文档生成脚本**

Create `apps/api/src/openapi.ts` that creates a Nest application, calls `SwaggerModule.createDocument(app, config)` with title `禾伴健康 API`, version `v1`, and bearer authentication, then writes JSON to `apps/api/openapi.json`. Add the script:

```json
"openapi:generate": "ts-node src/openapi.ts"
```

to `apps/api/package.json`.

- [ ] **Step 2: 写 CI 工作流**

Create `.github/workflows/ci.yml`:

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - uses: pnpm/action-setup@v4
        with:
          version: 9.15.4
      - run: pnpm install --frozen-lockfile
      - run: pnpm format
      - run: pnpm check
      - run: pnpm test
      - run: pnpm --filter @heban/api build
      - run: pnpm --filter @heban/mini build:mp-weixin
```

- [ ] **Step 3: 在本地执行质量门禁**

Run:

```powershell
pnpm format
pnpm check
pnpm test
pnpm --filter @heban/api openapi:generate
pnpm --filter @heban/api build
pnpm --filter @heban/mini build:mp-weixin
```

Expected: 所有命令成功；`apps/api/openapi.json` 已更新且没有未格式化文件。

- [ ] **Step 4: 更新开发文档并提交基础阶段**

Append this validation section to `docs/engineering/local-development.md`:

```markdown
## 提交前检查

运行 `pnpm format && pnpm check && pnpm test`。涉及 API 时额外运行 `pnpm --filter @heban/api openapi:generate` 并提交更新后的 `openapi.json`；涉及小程序时运行 `pnpm --filter @heban/mini build:mp-weixin`。
```

Commit:

```powershell
git add .github .prettierrc.json .prettierignore apps/api/openapi.json apps/api/src/openapi.ts docs/engineering/local-development.md
git commit -m "ci: add workspace quality gates"
```

## Task 10: 阶段 0 验收和发布前检查

**Files:**
- Modify: `docs/engineering/local-development.md`
- Test: 全量工作区检查、API E2E、Docker health、小程序构建

- [ ] **Step 1: 执行完整验证矩阵**

Run:

```powershell
docker compose -f infra/docker/docker-compose.yml ps
pnpm format
pnpm check
pnpm test
pnpm test:e2e
pnpm --filter @heban/api openapi:generate
pnpm --filter @heban/api build
pnpm --filter @heban/mini build:mp-weixin
git diff --check
```

Expected: Docker 服务健康；所有测试、构建、格式和 diff 检查通过；微信小程序产物可被开发者工具导入。

- [ ] **Step 2: 手工验证最小用户路径**

Use a development token for a newly created user and verify in order:

```text
1. 未携带 token 请求 GET /api/v1/health-profiles/me 返回 401。
2. 携带有效 token 请求同一端点返回当前用户的 HealthProfileDto。
3. 小程序首页加载档案成功时显示姓名/BMI；未填写档案时显示“完善健康档案”。
4. 使用第二个 token 不会读取第一个用户的数据。
```

- [ ] **Step 3: 记录验收结果并提交**

Append the actual command date, Node.js version, pnpm version and pass/fail result to the “阶段 0 验收” section of `docs/engineering/local-development.md`. Then run:

```powershell
git add docs/engineering/local-development.md apps/api/openapi.json
git commit -m "docs: record platform foundation verification"
git push origin main
```

Expected: `main` 包含可重复运行的阶段 0 工程底座和验收记录。

## 计划自检

| 设计要求 | 对应任务 |
| --- | --- |
| pnpm monorepo、原型隔离、文件规范 | Task 1、Task 2 |
| PostgreSQL、Redis、环境隔离、迁移 | Task 3、Task 5 |
| NestJS 模块化 API、统一 envelope、OpenAPI | Task 4、Task 6、Task 9 |
| 健康档案、认证、数据隔离、BMI 可复算 | Task 2、Task 5、Task 6 |
| uni-app 小程序优先 | Task 7 |
| AI 提供商适配、风险拦截、输出校验与审计 | Task 8 |
| 测试、CI、发布前验证 | Task 2 至 Task 10 |

本计划实现工程底座、最小档案路径和受控 AI 调用边界；不提前实现饮食、运动、睡眠、情绪、方案包、AI 会话 UI、审核内容检索或运营后台。AI 会话 UI 与健康记录上下文会在阶段 1 计划中完成，知识库检索与方案包工具编排在阶段 2 计划中完成。
