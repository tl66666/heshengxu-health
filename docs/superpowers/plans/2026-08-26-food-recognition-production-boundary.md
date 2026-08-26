# Food Recognition Production Boundary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the mock-only photo-recognition boundary with explicit consent, auditable recognition calls, and a storage-upload seam that can later target CloudBase without exposing provider credentials to the mini-program.

**Architecture:** The mini-program keeps a local preview but never treats its temporary path as a production object key. The API owns consent, object-key ownership, provider selection, and `AiTrace` audit writes. A storage interface isolates the local mock upload flow from the future CloudBase adapter; a vision-provider interface continues to return only food candidates.

**Tech Stack:** NestJS, Prisma/PostgreSQL, TypeScript, Vitest, uni-app/Vue 3, CloudBase/Hunyuan adapters in a later credentialed deployment task.

---

### Task 1: Explicit image-recognition consent and audit

**Files:**
- Create: `apps/api/src/modules/food-recognition/food-recognition-consent.service.ts`
- Create: `apps/api/src/modules/food-recognition/food-recognition-consent.service.spec.ts`
- Modify: `apps/api/src/modules/ai/ai-audit.service.ts`
- Modify: `apps/api/src/modules/food-recognition/food-recognition.service.ts`
- Modify: `apps/api/src/modules/food-recognition/food-recognition.controller.ts`
- Modify: `apps/api/src/modules/food-recognition/food-recognition.dto.ts`
- Modify: `apps/api/src/modules/food-recognition/food-recognition.module.ts`
- Modify: `apps/api/test/food-recognition.e2e-spec.ts`

- [x] **Step 1: Write failing tests for consent gate and hashed audit**

```ts
await client
  .post('/api/v1/food-recognition/jobs')
  .set(authorization)
  .send({ imageKey: 'mock/meal.jpg' })
  .expect(403);

await client.post('/api/v1/food-recognition/consents').set(authorization).expect(201);
await client
  .post('/api/v1/food-recognition/jobs')
  .set(authorization)
  .send({ imageKey: 'mock/meal.jpg' })
  .expect(201);
```

The service unit test must assert that the `AiTrace.requestHash` is not the image key and the trace includes `provider` and `model` metadata.

- [x] **Step 2: Run the focused tests and confirm RED**

Run: `node ..\\mini\\node_modules\\vitest\\vitest.mjs run --config vitest.config.ts test/food-recognition.e2e-spec.ts src/modules/food-recognition/food-recognition-consent.service.spec.ts`

Expected: the consent endpoint is `404` and job creation currently succeeds without consent.

- [x] **Step 3: Add the minimum consent and audit implementation**

Use document version `food-recognition-v1`. `FoodRecognitionConsentService.grant(userId)` must upsert the user and insert a consent only when an equivalent record does not already exist. `assertGranted(userId)` must throw `ForbiddenException` when no such consent exists.

Extend `AiAuditService.record` so callers can supply optional `provider`, `model`, and `safetyReason`, while it still hashes the supplied image-key message. In `FoodRecognitionService.create`, assert consent before provider access, write an `allow` audit trace before recognition, and write a `block` trace for a missing consent. The controller exposes `POST /food-recognition/consents` and never accepts a user ID from the body.

- [x] **Step 4: Run tests and API type check**

Run: `node ..\\mini\\node_modules\\vitest\\vitest.mjs run --config vitest.config.ts test/food-recognition.e2e-spec.ts src/modules/food-recognition/food-recognition-consent.service.spec.ts`

Expected: both consent gate and existing candidate-confirmation assertions pass.

Run: `node node_modules/.pnpm/typescript@5.9.3/node_modules/typescript/bin/tsc -p apps/api/tsconfig.build.json --noEmit`

Expected: exit code `0`.

- [x] **Step 5: Commit the consent boundary**

```bash
git add apps/api/src/modules/ai apps/api/src/modules/food-recognition apps/api/test/food-recognition.e2e-spec.ts
git commit -m "feat: gate food recognition with consent"
```

### Task 2: Owned upload session and local storage adapter

**Files:**
- Modify: `apps/api/prisma/schema.prisma`
- Create: `apps/api/prisma/migrations/<timestamp>_food_recognition_uploads/migration.sql`
- Create: `apps/api/src/modules/food-recognition/storage/recognition-image-storage.ts`
- Create: `apps/api/src/modules/food-recognition/storage/mock-recognition-image-storage.ts`
- Modify: `apps/api/src/modules/food-recognition/food-recognition.service.ts`
- Modify: `apps/api/src/modules/food-recognition/food-recognition.dto.ts`
- Modify: `apps/api/src/modules/food-recognition/food-recognition.controller.ts`
- Modify: `apps/mini/src/features/food/food-recognition.ts`
- Modify: `apps/mini/src/pages/food-recognition/FoodRecognitionPage.vue`
- Test: `apps/api/test/food-recognition.e2e-spec.ts`

- [x] **Step 1: Write failing owned-upload tests**

The test must show that an arbitrary `imageKey` is rejected, another user cannot complete or submit an upload, and a completed owned upload can create a recognition job.

- [x] **Step 2: Run the test and confirm RED**

Run: `node ..\\mini\\node_modules\\vitest\\vitest.mjs run --config vitest.config.ts test/food-recognition.e2e-spec.ts`

Expected: no upload route exists and direct image keys are still accepted.

- [x] **Step 3: Implement storage seam and session routes**

Add a `FoodRecognitionUpload` record with `userId`, unique object key, content type, byte limit, status, expiry, and completion timestamp. The mock adapter creates an opaque key only; it must not treat a mini-program temporary filepath as an object key. Create `POST /food-recognition/uploads` and `POST /food-recognition/uploads/:id/complete`, then change job creation to accept `uploadId` and verify ready ownership before provider access.

- [x] **Step 4: Change mini-program orchestration**

After `uni.chooseImage`, create and complete an upload session before creating the job. Keep `imagePath` only for local preview and navigation display. The primary action must be disabled until the user has checked the explicit recognition-consent control.

- [x] **Step 5: Verify and commit**

Run API e2e, mini unit tests, `vue-tsc --noEmit`, Prisma migration deployment, and `npm exec -- uni build -p mp-weixin`.

```bash
git commit -m "feat: add owned recognition upload sessions"
```

### Task 3: Credentialed CloudBase and Hunyuan adapter

**Files:**
- Create: `apps/api/src/modules/food-recognition/storage/cloudbase-recognition-image-storage.ts`
- Create: `apps/api/src/modules/food-recognition/providers/hunyuan-vision.provider.ts`
- Modify: `.env.example`
- Modify: `docs/engineering/local-development.md`

- [x] **Step 1: Add configuration validation tests**

Assert that selecting `cloudbase` storage or `hunyuan` recognition without required server-only variables fails during API boot with a clear configuration message. Assert mini-program source contains no provider key.

- [ ] **Step 2: Implement adapters only against verified CloudBase and Hunyuan server APIs**

Use a server-side credential or workload identity, issue short-lived upload authorization, normalize vision results to `{ name, confidence, estimatedGrams }`, and reject any provider output outside this shape. The provider must never supply calories or medical interpretation.

- [x] **Step 3: Add provider audit and failure fallback**

Record provider/model in `AiTrace`, persist a non-sensitive job error code, and return a user-facing retry/manual-search path without creating `MealEntry`.

- [ ] **Step 4: Run real-environment acceptance only after credentials are configured**

Use one user-authorized meal photo to verify `upload -> candidate -> edit -> confirm`. Do not commit keys, URLs containing temporary signatures, or images to Git.
