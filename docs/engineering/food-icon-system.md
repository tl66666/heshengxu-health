# 食物目录图标系统

## 规则

- 食物列表按 `category.slug` 使用独立 SVG，不使用 Emoji，也不把同一个餐碗图标重复套在所有食物上。
- 图标统一为 64x64 画布、约 2px 笔触、低饱和绿色/米色填充，列表容器固定为 76rpx，保证清晰度和对齐。
- 当前分类映射位于 `apps/mini/src/features/food/food-icon.ts`：谷物、蛋类、肉类、蔬菜、水果、奶类、主食、豆制品。
- 未知分类回退到 `/static/icons/svg/meal.svg`，避免后端新增分类时出现空图标。
- 新增分类时同时添加 SVG、映射项和 `food-icon.spec.ts` 回归测试。
- `FoodConfirmPage.vue` 与 `food-detail/FoodDetailPage.vue` 复用同一映射，详情/确认页不会再出现首字或 Emoji 占位。
- 离线目录保留 30+ 种常见食物，营养值按仓库内 `food.sql` 的公开字段整理；API 种子同步补充蔬菜、主食、肉类、奶类和坚果，启动后可继续导入完整 SQL 数据。
- 本地 API 使用新增种子数据时，在已启动 PostgreSQL 的前提下运行 `npm --prefix apps/api exec prisma db seed`；要从仓库 `food.sql` 导入精选常见数据，运行 `npm --prefix apps/api run food:import`。没有后端时，小程序仍使用同一套精选目录兜底。
