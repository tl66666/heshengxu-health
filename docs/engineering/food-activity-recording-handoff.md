# 食物与运动记录模块交接

更新时间：2026-08-30

分支：`feature/food-activity-recording`

范围：食物库、我的食物、四餐记录、序序相机识别、运动目录与热量估算。体重管理不在本分支范围内。

## 已完成

- 食物搜索同时合并“我的食物”和公共食物库，个人食物优先并按 ID 去重。
- 早餐、午餐、晚餐、加餐会携带 `mealType` 进入食物搜索和确认页。
- 序序相机保留所选图片，识别失败时可重试或转到手动食物搜索。
- 候选食物不会自动记账，必须由用户选中候选，再进入统一确认页调整餐次和份量。
- 拍照确认页可先保存到“我的食物”，再写入餐食记录；请求进行中禁用提交，只显示一次成功提示。
- “我的食物”可再次直接记录。餐食记录支持公共 `foodId` 或用户私有 `userFoodId`，服务端保存营养快照。
- 首页饮食摘要读取当天餐食记录，显示已摄入、还可吃、运动消耗和进度；四餐与运动共五个入口保持独立。
- 运动页提供目录、分类、强度、时长和 MET 热量估算；API 只接收现有字段，额外展示字段保存在小程序本地快照。
- 主视觉只使用现有语义匹配水彩图，操作图标使用项目 SVG；已移除本范围页面的 emoji 主视觉和旧相机 JPG。

## 主要接口

个人食物：

- `POST /api/v1/user-foods`
- `GET /api/v1/user-foods?q=...`
- `DELETE /api/v1/user-foods/:id`

餐食记录：

- `POST /api/v1/meal-entries`
- 请求必须且只能提供 `foodId` 或 `userFoodId`。
- `userFoodId` 查询按当前登录用户隔离，不能记录其他用户的个人食物。

识别流程：

- `/pages/food-recognition/FoodRecognitionPage?mealType=breakfast`
- `/pages/food-candidates/FoodCandidatesPage?jobId=...&imagePath=...&mealType=...`
- `/pages/food-confirm/FoodConfirmPage?foodId=...&candidateId=...&source=photo&grams=...&mealType=...&imagePath=...`

## 数据库变更

- `20260830120000_user_foods`：新增 `UserFood` 与 `UserFoodSource`。
- `20260830123000_meal_entry_user_foods`：给 `MealEntry` 新增可空 `userFoodId`、索引和外键。

部署 API 前必须应用以上两个迁移，并重新生成 Prisma Client。

## 小程序本地快照

运动目录的展示扩展字段使用：

`heban_activity_snapshots:YYYY-MM-DD`

每条快照包含 `recordId`、`activityId`、`activityType`、`intensity`、`durationMinutes`、`estimatedCalories`、`source` 和 `recordedAt`。后端当前只持久化 `activityType`、`durationMinutes`、`intensity`、`recordedAt` 与 `note`。

## 视觉资源约束

- 相机相关横幅：`/static/illustrations/home-companion-banner.png`
- 运动记录横幅：`/static/illustrations/record-desk-banner.png`
- 失败/空状态：`/static/illustrations/xuxu-ai-empty.png`
- 图片使用 `aspectFit`，文字保持独立列，不允许覆盖控件。
- 不要用 emoji、系统表情、扁平贴纸或临时 SVG 作为相机和运动的主视觉。
- 新生图需保持水彩纸纹理、明确体积、统一光照、柔和接触阴影和干净边缘。

## 关键提交

- `4dbea74` / `d01bd1e`：运动目录和估算规则。
- `6fcf7fe` 至 `43a04f5`：个人食物 API、校验和测试。
- `2357513`：小程序个人食物搜索合并。
- `75468a6`：识别确认、保存个人食物和个人餐食记录。
- `91c6bdb`：首页饮食与运动摘要。
- `98f4e31`：运动目录记录流程。
- `85b265c`：食物与运动视觉收敛。

## 验证

推荐使用 `npm` / `npx`，不要在当前机器上使用 `pnpm`。

已通过：

```powershell
npx -y vitest@2.1.9 run <11 个食物与运动聚焦测试文件> --maxWorkers=1 --minWorkers=1
```

结果：11 个测试文件、49 个用例通过。

Prisma schema 使用临时 `DATABASE_URL` 验证通过：

```powershell
$env:DATABASE_URL='postgresql://postgres:postgres@127.0.0.1:5432/heban'
npx -y prisma@6.16.0 validate --schema apps/api/prisma/schema.prisma
```

全量 mini 测试结果：38 个文件通过，111 个用例通过，1 个跳过；唯一失败是 `AppNavBar.vue` 的既有颜色契约，与本模块无关。

当前机器有大量并发 Node 进程。`npm run build:mp-weixin` 和 API e2e 在无输出状态下超时；完整 `vue-tsc` 也报告了仓库既有的体重图表、旧食物详情和导航类型错误。合并前应在依赖完整、并发较低的环境重跑构建和 API e2e。

## 已知限制

- 识别上传接口目前只创建上传会话和对象键，现有小程序代码没有把本地图片二进制上传到对象存储；这属于既有识别基础设施限制。
- 个人食物保存营养和名称，`imageUrl` 暂为 `null`，因为微信临时文件路径不能作为跨会话持久 URL。
- 首页热量目标暂用 1500 千卡参考值，已有 API 尚未提供个人每日热量目标。
- 运动估算是参考值，不应作为医疗或精确能量消耗结论。

## 并行开发注意事项

- 体重会话不要覆盖本分支的 `HomePage.vue` 饮食摘要、五个食物/运动入口和相机横幅；如需合并首页，请保留这些区块后再整合体重卡片。
- 不要移除 `MealEntry.userFoodId`、两个迁移或 `user-foods` 模块。
- 不要把候选页改回自动确认；只有统一确认页可以最终写入识别餐食。
- 不要把运动扩展字段直接发送给旧 API，除非同时升级后端合同和迁移。
