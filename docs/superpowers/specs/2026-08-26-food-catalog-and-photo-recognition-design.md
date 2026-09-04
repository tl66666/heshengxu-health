# 阶段 2B-2：食物目录与拍照识别设计

**日期：** 2026-08-26  
**状态：** 已批准进入实施  
**范围：** 食物目录、手动食物记录、营养计算、拍照识别候选与人工确认

## 1. 目标

将“饮食结构记录”升级为两条并行路径：保留 10 秒完成的结构记录；为愿意记录更多细节的用户提供食物搜索、份量选择和营养估算。拍照只负责产生候选，用户确认后才创建饮食事实记录。

首个目标用户仍是减脂与体重管理人群。所有热量和营养结果都标注为“来自食物目录的估算”，不用于疾病诊断或营养处方。

## 2. 产品决策

1. 不移除现有 `MealStructureRecord`。它仍是最快的饮食记录方式。
2. 新增 `MealEntry`，一条记录对应一种确认后的食物与份量。用户一餐可有多条 `MealEntry`。
3. 营养必须来自目录快照：食品每 100g 营养值乘以确认的克数；不得让视觉模型生成热量数值。
4. 拍照识别采用“上传图片 -> 识别任务 -> 候选列表 -> 编辑份量 -> 确认保存”流程。识别失败只提示重试或手动搜索，不生成虚假结果。
5. 第一版支持能量、蛋白质、脂肪、碳水、膳食纤维、钠六项营养素；其余微量营养素预留扩展字段，不进入首页或计划结论。
6. 用户可删除已确认的食物记录；目录更新不会改变历史条目的营养快照。

## 3. 数据来源边界

早期外部资料仅用于研究数据字段和交互层级，不属于和生序运行时依赖，也没有可直接复用的明确授权。

项目不导入、分发或使用这些仓库的爬虫代码、原始食物 SQL、站点图片或数据。为兼容未来合法数据来源，导入器接受标准 CSV/JSON 并要求写入：`sourceName`、`sourceVersion`、`sourceLicense`、`importedAt`。

## 4. 数据模型

```text
FoodCategory
- id, slug, name, sortOrder

FoodItem
- id, categoryId, name, brand?, searchableText, status
- sourceName, sourceVersion, sourceLicense, importedAt

FoodAlias
- id, foodId, alias

FoodNutrition
- foodId, basisGrams (固定 100)
- energyKcal, proteinG, fatG, carbohydrateG, dietaryFiberG?, sodiumMg?

FoodServing
- id, foodId, label, grams, sortOrder

MealEntry
- id, userId, mealType, foodId?, foodNameSnapshot, grams
- nutritionSnapshot (JSON), source (manual | photo_confirmed)
- recordedAt, note?, current/version fields

FoodRecognitionJob
- id, userId, imageKey, status, provider, model, errorCode?
- createdAt, completedAt?

FoodRecognitionCandidate
- id, jobId, foodId?, label, confidence, estimatedGrams
- candidateRank, providerPayloadVersion
```

`MealEntry.nutritionSnapshot` 以 JSON 保存计算时的食品名称、每 100g 营养基准、份量克数和计算结果。此快照是历史饮食记录的唯一营养真相。

## 5. API 契约

```text
GET  /api/v1/foods/search?q=&category=&cursor=
GET  /api/v1/foods/:foodId
POST /api/v1/meal-entries
GET  /api/v1/meal-entries?date=
PATCH /api/v1/meal-entries/:entryId
DELETE /api/v1/meal-entries/:entryId

POST /api/v1/food-recognition/jobs
GET  /api/v1/food-recognition/jobs/:jobId
POST /api/v1/food-recognition/jobs/:jobId/confirm
```

照片上传本身不直连模型。小程序先通过后端获取受限上传凭证或上传会话，后端保存对象键而不是公开 URL。正式接入腾讯云开发时，只替换对象存储适配器和视觉模型 Provider，不改变上层 API。

## 6. 视觉与交互

- 记录页的“饮食”分段保留“结构快记”，新增“食物记录”二级入口，不让四类主记录 Tab 变成复杂工具栏。
- 食物搜索页采用搜索框、最近/常用项和列表行，不使用食品图片墙。
- 食物详情页显示名称、单位、份量步进器和本次估算；主按钮是“加入这一餐”。
- 拍照页只在用户主动点击“拍照识别”后进入。识别过程中展示真实处理中状态。
- 候选页所有结果都可编辑、移除、补充；确认按钮明确写“确认并记录”。
- 识别候选、能量和份量均说明“估算，确认后保存”。

## 7. AI 与安全

视觉 Provider 只接收用户主动提交的照片。调用前检查 AI 图片识别授权；输出仅允许食品候选、置信度、估计克数和模型元数据。

禁止 Provider 返回诊断、医疗建议、进食障碍评价、身体评价和自发热量处方。所有模型调用写入 `AiTrace` 与识别任务记录。用户未确认前，候选不计入任何摄入、计划或回顾。

## 8. 分批实施

1. 食物目录契约、营养计算、Prisma 模型和只读搜索 API。
2. 手动食物记录 API 与小程序搜索/份量/确认流程。
3. 腾讯云对象存储上传会话、视觉 Provider 抽象、模拟 Provider 和候选确认。
4. 混元视觉 Provider、AI 授权、审计、失败重试与真实照片真机验收。

第一批不导入第三方食物数据、不生成食品图片、不接真实视觉模型。它必须先能使用种子测试食品跑通搜索和营养快照计算。
