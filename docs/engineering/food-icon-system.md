# 食物目录图标系统

## 规则

- 食物列表按 `category.slug` 使用独立 SVG，不使用 Emoji，也不把同一个餐碗图标重复套在所有食物上。
- 图标统一为 64x64 画布、约 2px 笔触、低饱和绿色/米色填充，列表容器固定为 76rpx，保证清晰度和对齐。
- 当前分类映射位于 `apps/mini/src/features/food/food-icon.ts`：谷物、蛋类、肉类、蔬菜、水果、奶类、主食、豆制品。
- 未知分类回退到 `/static/icons/svg/meal.svg`，避免后端新增分类时出现空图标。
- 新增分类时同时添加 SVG、映射项和 `food-icon.spec.ts` 回归测试。
- `FoodConfirmPage.vue` 与 `food-detail/FoodDetailPage.vue` 复用同一映射，详情/确认页不会再出现首字或 Emoji 占位。
- 小程序包内保留约 82 种常见食物作为应急离线目录，分类会统一为正式 slug。页面必须明确标注离线状态，不能把这批数据冒充完整食物库。
- PostgreSQL 保存从仓库 `food.sql` 整理的完整目录，基础食物优先、品牌商品后置。日常双击 `start-dev.bat`；启动脚本只在 active 食物不足 10,000 条时执行 `npm --prefix apps/api run food:import`，不会每次启动重复导入。
