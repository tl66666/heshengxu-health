# Food And Activity Recording Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有微信小程序首页上，打通食物库搜索、拍照识别后保存个人食物、早餐/午餐/晚餐/加餐入账，以及热门运动选择、时长强度确认和估算热量回写。

**Architecture:** 复用现有 `food-catalog`、`food-recognition`、`meal-entries` 和 `health-records` 模块，在 mini 端增加一个轻量的 `user-foods` 服务和运动目录/估算纯函数。首页只负责聚合展示和路由；搜索、确认、识别、运动目录各自维护自己的状态，避免把业务逻辑继续堆进 `HomePage.vue`。

**Tech Stack:** Vue 3 `<script setup>`, uni-app/微信小程序, NestJS, Prisma, TypeScript, Vitest, pnpm。

---

## 文件地图

- 修改 `apps/mini/src/pages/home/HomePage.vue`：保留体重区块，重排饮食摘要与相机入口，传递餐次上下文。
- 修改 `apps/mini/src/pages/food-search/FoodSearchPage.vue`：统一公共食物、常吃和我的食物结果，补齐餐次上下文和清晰的空/错状态。
- 修改 `apps/mini/src/pages/food-confirm/FoodConfirmPage.vue`：支持识别来源、保存到我的食物开关和份量实时换算。
- 修改 `apps/mini/src/pages/food-candidates/FoodCandidatesPage.vue`：识别候选确认后进入统一确认页，携带图片和来源信息。
- 修改 `apps/mini/src/pages/food-recognition/FoodRecognitionPage.vue`：复用现有插画，缩短上传/识别流程并提供手动搜索降级。
- 新建 `apps/mini/src/features/food/user-foods.types.ts`、`user-foods.service.ts`、`user-foods.service.spec.ts`：个人食物客户端类型、接口和本地测试替身。
- 新建 `apps/mini/src/features/activity/activity-catalog.ts`、`activity-catalog.spec.ts`：运动目录、MET 配置和热量估算纯函数。
- 修改 `apps/mini/src/pages/records/RecordsPage.vue`：activity 模式改成热门运动选择、强度、时长和估算展示。
- 新建 `apps/api/src/modules/user-foods/*`：个人食物 DTO、service、controller、module。
- 修改 `apps/api/prisma/schema.prisma`：增加 `UserFood` 与用户关系及唯一/查询索引。
- 新建 `apps/api/prisma/migrations/20260830120000_user_foods/migration.sql`：对应 Prisma 迁移。
- 修改 `apps/api/src/app.module.ts`：注册 `UserFoodsModule`。
- 新建/修改 API 与 mini 端测试文件：覆盖输入校验、搜索合并、估算和主要页面契约。

## Task 1: 建立运动目录和估算规则

**Files:**
- Create: `apps/mini/src/features/activity/activity-catalog.ts`
- Test: `apps/mini/src/features/activity/activity-catalog.spec.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it } from 'vitest';
import { estimateActivityCalories, getActivityById, activityCatalog } from './activity-catalog.js';

describe('activity catalog', () => {
  it('contains the common activities shown in the picker', () => {
    expect(activityCatalog.map(item => item.id)).toEqual(
      expect.arrayContaining(['walk', 'run', 'cycle', 'rope', 'strength', 'yoga', 'ball']),
    );
  });

  it('estimates calories with MET, body weight, and duration', () => {
    expect(estimateActivityCalories({ met: 3.5, weightKg: 60, durationMinutes: 30 })).toBe(110);
  });

  it('uses a conservative default weight when no profile weight is available', () => {
    expect(estimateActivityCalories({ met: 3.5, durationMinutes: 30 })).toBe(129);
  });

  it('returns undefined for an unknown id', () => {
    expect(getActivityById('unknown')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @heban/mini exec vitest run src/features/activity/activity-catalog.spec.ts`

Expected: FAIL because the catalog module does not exist.

- [ ] **Step 3: Implement the minimal catalog**

```ts
export type ActivityIntensity = 'low' | 'medium' | 'high';

export type ActivityCatalogItem = {
  id: string;
  name: string;
  category: string;
  intensity: ActivityIntensity;
  met: number;
};

export const activityCatalog: ActivityCatalogItem[] = [
  { id: 'walk', name: '快走', category: '步行', intensity: 'medium', met: 4.3 },
  { id: 'run', name: '慢跑', category: '跑步', intensity: 'medium', met: 7 },
  { id: 'cycle', name: '骑行', category: '骑行', intensity: 'medium', met: 6.8 },
  { id: 'rope', name: '跳绳', category: '跳绳', intensity: 'high', met: 10 },
  { id: 'strength', name: '力量训练', category: '健身', intensity: 'medium', met: 5 },
  { id: 'yoga', name: '瑜伽', category: '身心', intensity: 'low', met: 2.5 },
  { id: 'ball', name: '球类运动', category: '球类', intensity: 'high', met: 8 },
];

export function getActivityById(id: string) {
  return activityCatalog.find(item => item.id === id);
}

export function estimateActivityCalories(input: { met: number; weightKg?: number; durationMinutes: number }) {
  const weightKg = input.weightKg && input.weightKg > 0 ? input.weightKg : 70;
  if (input.durationMinutes <= 0) throw new Error('运动时长需要大于 0 分钟');
  return Math.round((input.met * 3.5 * weightKg * input.durationMinutes) / 200);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @heban/mini exec vitest run src/features/activity/activity-catalog.spec.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/mini/src/features/activity/activity-catalog.ts apps/mini/src/features/activity/activity-catalog.spec.ts
git commit -m "feat: add activity catalog and calorie estimate"
```

## Task 2: Add personal food persistence on the API

**Files:**
- Modify: `apps/api/prisma/schema.prisma`
- Create: `apps/api/src/modules/user-foods/user-foods.dto.ts`
- Create: `apps/api/src/modules/user-foods/user-foods.service.ts`
- Create: `apps/api/src/modules/user-foods/user-foods.controller.ts`
- Create: `apps/api/src/modules/user-foods/user-foods.module.ts`
- Modify: `apps/api/src/app.module.ts`
- Create: `apps/api/prisma/migrations/20260830120000_user_foods/migration.sql`
- Test: `apps/api/test/user-foods.e2e-spec.ts`

- [ ] **Step 1: Add the Prisma model and migration**

Add a `userFoods UserFood[]` relation to the existing user model and this model to `schema.prisma`:

```prisma
model UserFood {
  id                   String   @id @default(cuid())
  userId               String
  name                 String
  imageUrl             String?
  source               String
  energyKcal           Float
  proteinG             Float
  fatG                 Float
  carbohydrateG        Float
  defaultServingLabel  String
  defaultServingGrams Float
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, name])
  @@index([userId, createdAt])
}
```

Generate the migration with `pnpm --filter @heban/api exec prisma migrate dev --name user_foods` and keep the generated SQL in the migration directory.

- [ ] **Step 2: Write the failing API test**

The e2e test must create a test user, `POST /user-foods`, assert the returned nutrition snapshot/source, query `GET /user-foods?q=燕麦`, and delete the item with `DELETE /user-foods/:id`.

- [ ] **Step 3: Implement DTO, service, controller, and module**

Validate `name`, `source`, positive nutrition values, and `defaultServingGrams > 0`; scope every query by the authenticated `userId`. `GET /user-foods` must order by `createdAt desc` and perform a case-insensitive name contains query. Register the module from `app.module.ts`.

- [ ] **Step 4: Run API tests**

Run: `pnpm --filter @heban/api exec vitest run test/user-foods.e2e-spec.ts`

Expected: PASS with create/list/delete assertions.

- [ ] **Step 5: Commit**

```bash
git add apps/api/prisma/schema.prisma apps/api/prisma/migrations apps/api/src/modules/user-foods apps/api/src/app.module.ts apps/api/test/user-foods.e2e-spec.ts
git commit -m "feat: add personal foods API"
```

## Task 3: Add the mini client for personal foods and result merging

**Files:**
- Create: `apps/mini/src/features/food/user-foods.types.ts`
- Create: `apps/mini/src/features/food/user-foods.service.ts`
- Test: `apps/mini/src/features/food/user-foods.service.spec.ts`
- Modify: `apps/mini/src/features/food/food.service.ts`

- [ ] **Step 1: Write the failing merge test**

```ts
it('puts personal foods before public catalog foods and de-duplicates by id', () => {
  expect(mergeFoodResults([{ id: 'mine-1', name: '燕麦杯', source: 'photo' } as never], [{ id: 'public-1', name: '燕麦片' } as never])).toMatchObject([
    { id: 'mine-1', source: 'photo' },
    { id: 'public-1' },
  ]);
});
```

- [ ] **Step 2: Implement types, service, and merge helper**

Define `UserFood` with the fields from the design spec, export `listUserFoods`, `createUserFood`, `deleteUserFood`, and `mergeFoodResults`. Use the existing `createMiniApiClient()` and return empty personal results on a 404 only; surface other failures to the page.

- [ ] **Step 3: Wire search page groups**

Update `FoodSearchPage.vue` to load personal foods when the page opens and when a query changes. Render group headings only when a group has items, preserve the existing category tabs, and pass `mealType` through the route query to `FoodConfirmPage`.

- [ ] **Step 4: Run mini food tests**

Run: `pnpm --filter @heban/mini exec vitest run src/features/food/user-foods.service.spec.ts src/pages/food-search/food-search-presentation.spec.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/mini/src/features/food/user-foods.types.ts apps/mini/src/features/food/user-foods.service.ts apps/mini/src/features/food/user-foods.service.spec.ts apps/mini/src/features/food/food.service.ts apps/mini/src/pages/food-search/FoodSearchPage.vue
git commit -m "feat: merge personal foods into search"
```

## Task 4: Complete the food confirmation and recognition save flow

**Files:**
- Modify: `apps/mini/src/pages/food-confirm/FoodConfirmPage.vue`
- Modify: `apps/mini/src/pages/food-candidates/FoodCandidatesPage.vue`
- Modify: `apps/mini/src/pages/food-recognition/FoodRecognitionPage.vue`
- Test: `apps/mini/src/pages/food-confirm/food-confirm-presentation.spec.ts`
- Test: `apps/mini/src/pages/food-candidates/food-candidates-presentation.spec.ts`

- [ ] **Step 1: Extend page contract tests**

Assert that confirmation contains the `save-to-library` switch, meal type controls, serving controls, and a manual-search fallback link on candidates/recognition pages.

- [ ] **Step 2: Implement route context and save order**

Read `mealType`, `source`, `imagePath`, and optional `userFoodId` from route query. On save, first create the personal food when the switch is enabled and source is `photo`, then call the existing meal-entry create service. Disable the save button while either request is in flight and show a single success toast.

- [ ] **Step 3: Make recognition failure recoverable**

Keep the selected image in local state after an error. Add a button that calls `navigateToFoodSearch()` with the current meal type, and keep the existing retry path. Candidates must never auto-confirm a result.

- [ ] **Step 4: Run page contract tests**

Run: `pnpm --filter @heban/mini exec vitest run src/pages/food-confirm/food-confirm-presentation.spec.ts src/pages/food-candidates/food-candidates-presentation.spec.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/mini/src/pages/food-confirm apps/mini/src/pages/food-candidates apps/mini/src/pages/food-recognition
git commit -m "feat: save recognized foods and record meals"
```

## Task 5: Rework the home food/activity summary without touching weight management

**Files:**
- Modify: `apps/mini/src/pages/home/HomePage.vue`
- Modify: `apps/mini/src/pages/home/home-actions.ts`
- Test: `apps/mini/src/pages/home/home-actions.spec.ts`
- Test: `apps/mini/src/pages/home/home-hero-art.spec.ts`

- [ ] **Step 1: Add route and asset contract tests**

Assert the five record actions remain present, the camera action points to `FoodRecognitionPage`, and the home source references `/static/illustrations/home-companion-banner.png` for the camera banner. Do not add or change weight route assertions.

- [ ] **Step 2: Implement the visual hierarchy**

Keep the existing data loaders and weight card. Replace only the food summary markup with three compact values (`已摄入`, `还可吃`, `运动消耗`) and a thin progress bar. Turn the camera card into a wide banner with right-aligned illustration and left-aligned copy. Keep the five meal/activity buttons as the only entry points for records.

- [ ] **Step 3: Validate home contracts**

Run: `pnpm --filter @heban/mini exec vitest run src/pages/home/home-actions.spec.ts src/pages/home/home-hero-art.spec.ts`

Expected: PASS and no snapshot/test references to weight routes change.

- [ ] **Step 4: Commit**

```bash
git add apps/mini/src/pages/home/HomePage.vue apps/mini/src/pages/home/home-actions.ts apps/mini/src/pages/home/home-actions.spec.ts apps/mini/src/pages/home/home-hero-art.spec.ts
git commit -m "feat: refine home food and activity summary"
```

## Task 6: Build the activity picker and record form

**Files:**
- Modify: `apps/mini/src/pages/records/RecordsPage.vue`
- Modify: `apps/mini/src/features/health-records/health-records.mapper.ts`
- Modify: `apps/mini/src/features/health-records/health-records.types.ts`
- Test: `apps/mini/src/features/health-records/health-records.validation.spec.ts`
- Test: `apps/mini/src/pages/records/records-experience.spec.ts`

- [ ] **Step 1: Add validation tests for activity duration and intensity**

Cover empty activity, `0` minutes, minutes above `1440`, and valid `walk`/`medium`/`30` input. Expected messages must be stable Chinese copy: `请选择运动项目`, `运动时长需要大于 0 分钟`, and `运动时长不能超过 24 小时`.

- [ ] **Step 2: Implement the activity picker**

When `activeType === 'activity'`, render the catalog as a horizontal category filter plus a vertical list. Selecting an item sets `activityType` and `activityId`; intensity is a segmented control; duration is a numeric input. Use the current profile weight when available and call `estimateActivityCalories` for the preview.

- [ ] **Step 3: Persist the estimated snapshot**

Extend the activity form mapping with `activityId`, `intensity`, `estimatedCalories`, and `source: 'directory'`. Send only fields accepted by the current API contract; store unsupported display-only fields in the mini record snapshot until the backend contract is extended.

- [ ] **Step 4: Run record tests**

Run: `pnpm --filter @heban/mini exec vitest run src/features/health-records/health-records.validation.spec.ts src/pages/records/records-experience.spec.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/mini/src/pages/records/RecordsPage.vue apps/mini/src/features/health-records/health-records.mapper.ts apps/mini/src/features/health-records/health-records.types.ts apps/mini/src/features/health-records/health-records.validation.spec.ts apps/mini/src/pages/records/records-experience.spec.ts
git commit -m "feat: add activity directory recording flow"
```

## Task 7: Apply semantic illustration assets and responsive polish

**Files:**
- Modify: `apps/mini/src/pages/food-recognition/FoodRecognitionPage.vue`
- Modify: `apps/mini/src/pages/records/RecordsPage.vue`
- Modify: `apps/mini/src/pages/food-search/FoodSearchPage.vue`
- Test: `apps/mini/src/pages/food-search/food-search-presentation.spec.ts`

- [ ] **Step 1: Add asset assertions**

Assert that food recognition references an existing sequence illustration and records references `/static/illustrations/record-desk-banner.png`; do not add untracked remote URLs.

- [ ] **Step 2: Implement restrained image placement**

Use `home-companion-banner.png` only in the camera-related entry/empty state and `record-desk-banner.png` only as the activity page banner. Keep text in a separate flex column with a minimum width; set images to `mode="aspectFit"` and hide overflow so they cannot cover controls.

Image quality gate: do not use emoji, system emoji, generic flat stickers, or placeholder SVGs for the camera/运动 primary visuals. Any new GPT Image 2 asset must have watercolor paper texture, physically coherent volume, soft contact shadows, clean subject edges, and a quiet area for copy; reject it if it reads as a flat AI sticker at 1x mobile size.

- [ ] **Step 3: Run formatting and page tests**

Run: `pnpm format:write` then `pnpm --filter @heban/mini exec vitest run src/pages/food-search/food-search-presentation.spec.ts`.

Expected: formatting completes and the presentation test passes.

- [ ] **Step 4: Commit**

```bash
git add apps/mini/src/pages/food-recognition/FoodRecognitionPage.vue apps/mini/src/pages/records/RecordsPage.vue apps/mini/src/pages/food-search/FoodSearchPage.vue
git commit -m "style: apply semantic watercolor assets"
```

## Task 8: End-to-end verification and build

**Files:**
- Modify only files required by failing verification output.
- Test: existing API e2e suite and mini presentation/unit suite.

- [ ] **Step 1: Run focused suites**

Run: `pnpm --filter @heban/api test` and `pnpm --filter @heban/mini test`.

Expected: all existing and newly added tests pass.

- [ ] **Step 2: Run typecheck and lint**

Run: `pnpm typecheck` and `pnpm lint`.

Expected: zero TypeScript or ESLint errors.

- [ ] **Step 3: Build the mini program**

Run: `pnpm build:mini`.

Expected: WeChat mini-program output is generated under `apps/mini/dist/build/mp-weixin`.

- [ ] **Step 4: Verify the critical flows manually**

Use the dev build to verify: home meal tap with meal type preserved; search food and confirm grams; recognition candidate confirmation; save to personal foods and search again; activity picker estimate and save; network error recovery. Capture one desktop devtools screenshot and one narrow mobile screenshot to confirm no text/image overlap.

- [ ] **Step 5: Commit verification-only fixes**

```bash
git add apps/mini apps/api packages
git commit -m "test: verify food and activity recording flows"
```
