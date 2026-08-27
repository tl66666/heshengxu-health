# 食物目录与拍照识别 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为饮食记录建立可追溯食物目录、营养快照和拍照识别候选确认链路。

**Architecture:** 食物目录是只读基准数据，营养计算放在 `@heban/domain` 纯函数中，`MealEntry` 保存计算快照。图像识别通过 API 任务和 Provider 接口返回候选，只有确认接口能够写入饮食记录。

**Tech Stack:** NestJS、Prisma/PostgreSQL、TypeScript、Vitest、uni-app/Vue 3、腾讯云开发和混元视觉 Provider（第 4 批）。

---

### Task 1: 食物与营养契约

**Files:**
- Create: `packages/contracts/src/food.ts`
- Modify: `packages/contracts/src/index.ts`
- Create: `packages/domain/src/nutrition.ts`
- Create: `packages/domain/src/nutrition.spec.ts`

- [ ] **Step 1:** 写失败测试，覆盖 `100g` 基准食品按克数计算能量和营养，以及克数为零或负数时拒绝计算。
- [ ] **Step 2:** 运行 `pnpm --filter @heban/domain test`，确认新测试因函数不存在失败。
- [ ] **Step 3:** 实现 `calculateNutritionForGrams(nutrition, grams)`，只处理能量、蛋白质、脂肪、碳水、纤维和钠，数值保留一位小数。
- [ ] **Step 4:** 在 `food.ts` 定义 `FoodItemDto`、`FoodServingDto`、`FoodNutritionDto`、`MealEntryDto` 和创建记录请求；在入口导出。
- [ ] **Step 5:** 运行 domain 与 contracts 类型检查，提交 `feat: add food nutrition contracts`。

### Task 2: Prisma 食物目录与饮食条目

**Files:**
- Modify: `apps/api/prisma/schema.prisma`
- Create: `apps/api/prisma/migrations/<timestamp>_food_catalog/migration.sql`
- Create: `apps/api/test/food-catalog.e2e-spec.ts`

- [ ] **Step 1:** 写 e2e 测试，期望关键词搜索只能返回 `active` 食物，饮食条目保存后返回固定营养快照。
- [ ] **Step 2:** 运行 API 测试，确认 `/foods/search` 和 `/meal-entries` 尚不存在。
- [ ] **Step 3:** 增加 `FoodCategory`、`FoodItem`、`FoodAlias`、`FoodNutrition`、`FoodServing`、`MealEntry` 和枚举；为名称、别名、状态、用户日期建立索引。
- [ ] **Step 4:** 执行 Prisma migration 并生成 client。
- [ ] **Step 5:** 提交 `feat: add food catalog persistence`。

### Task 3: 食物目录与手动记录 API

**Files:**
- Create: `apps/api/src/modules/food-catalog/*`
- Create: `apps/api/src/modules/meal-entries/*`
- Modify: `apps/api/src/app.module.ts`
- Modify: `apps/api/src/openapi.ts`
- Test: `apps/api/test/food-catalog.e2e-spec.ts`

- [ ] **Step 1:** 实现 `GET /foods/search` 和 `GET /foods/:foodId`，仅返回 active 食物及可选份量。
- [ ] **Step 2:** 实现 `POST /meal-entries`，服务端读取食品目录、调用 domain 计算并写入营养快照；拒绝客户端传入热量结果。
- [ ] **Step 3:** 实现按日期读取、版本化修改和删除饮食条目，全部按鉴权用户隔离。
- [ ] **Step 4:** 运行 API 单测、e2e 与 OpenAPI 生成，提交 `feat: add meal entry API`。

### Task 4: 合法数据导入兼容层

**Files:**
- Create: `apps/api/src/modules/food-catalog/import/food-import.types.ts`
- Create: `apps/api/src/modules/food-catalog/import/food-import.service.ts`
- Create: `apps/api/src/modules/food-catalog/import/food-import.spec.ts`
- Modify: `docs/product/data-sources.md`

- [ ] **Step 1:** 写失败测试，验证导入批次缺少 `sourceLicense` 时拒绝，包含来源元数据时只生成规范化食品 DTO。
- [ ] **Step 2:** 实现 CSV/JSON 行到标准食品 DTO 的纯转换，不读取或内置任何参考仓库数据。
- [ ] **Step 3:** 在数据来源文档记录参考仓库的字段启发和不可导入结论。
- [ ] **Step 4:** 运行导入测试，提交 `feat: add food import compatibility layer`。

### Task 5: 小程序手动食物记录

**Files:**
- Create: `apps/mini/src/features/food/*`
- Create: `apps/mini/src/pages/food-search/FoodSearchPage.vue`
- Create: `apps/mini/src/pages/food-confirm/FoodConfirmPage.vue`
- Modify: `apps/mini/src/pages/records/RecordsPage.vue`
- Modify: `apps/mini/src/pages.json`
- Test: `apps/mini/src/features/food/*.spec.ts`

- [ ] **Step 1:** 写失败测试，验证份量改变会实时重算营养估算，且确认前不会创建 MealEntry。
- [ ] **Step 2:** 实现小程序目录客户端、搜索状态和营养展示模型。
- [ ] **Step 3:** 增加食物搜索、份量确认与保存页面；记录页饮食 Tab 保留结构快记并提供食物记录入口。
- [ ] **Step 4:** 运行 mini 测试、类型检查和微信构建，提交 `feat: add manual food logging flow`。

### Task 6: 拍照识别候选任务

**Files:**
- Create: `apps/api/src/modules/food-recognition/*`
- Create: `apps/mini/src/pages/food-recognition/FoodRecognitionPage.vue`
- Create: `apps/mini/src/pages/food-candidates/FoodCandidatesPage.vue`
- Modify: `apps/api/prisma/schema.prisma`
- Modify: `apps/mini/src/pages.json`

- [ ] **Step 1:** 写失败测试，验证识别任务结果只能是候选，未调用确认接口时不创建 MealEntry。
- [ ] **Step 2:** 创建 `FoodRecognitionProvider`、确定性 Mock Provider 和任务状态 API。
- [ ] **Step 3:** 增加小程序拍照/选图入口、处理中状态和候选编辑页。
- [ ] **Step 4:** 调用确认接口将候选转为 MealEntry，并审计 provider/model/task id。
- [ ] **Step 5:** 运行全量测试与构建，提交 `feat: add food recognition confirmation flow`。

### Task 7: 混元与 CloudBase 生产适配

**Files:**
- Create: `apps/api/src/modules/food-recognition/providers/hunyuan-vision.provider.ts`
- Create: `apps/api/src/modules/food-recognition/storage/*`
- Modify: `apps/api/src/modules/ai/*`
- Modify: `docs/engineering/local-development.md`

- [ ] **Step 1:** 补充 AI 图片识别授权、调用审计和敏感输出拦截测试。
- [ ] **Step 2:** 实现 CloudBase 对象存储上传会话与短期对象键，不暴露 Provider 密钥。
- [ ] **Step 3:** 实现混元视觉 Provider，将模型输出规范化为候选食品和估算克数，营养仍从目录读取。
- [ ] **Step 4:** 配置运行环境变量和故障回退；禁止在小程序内放置 Provider Key。
- [ ] **Step 5:** 用真实照片完成“上传 -> 候选 -> 编辑 -> 确认记录”真机验收，提交 `feat: connect food recognition provider`。
