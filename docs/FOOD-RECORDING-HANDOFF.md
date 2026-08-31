# 饮食记录流程交接

本次将饮食记录的默认用户流程统一为真实食物目录与购物车流程，供后续会话开发时参考。

## 默认入口

- 首页“记录饮食”入口：`/pages/food-search/FoodSearchPage?mealType=lunch`
- 首页四个餐次快捷入口：`/pages/food-search/FoodSearchPage?mealType=breakfast|lunch|dinner|snack`
- 记录页继续添加：`/pages/food-search/FoodSearchPage`

`MealAddPage` 保留用于兼容旧链接，但不要再作为新功能的默认入口。新的目录、加号、购物车和总结逻辑都在 `FoodSearchPage` 与 `FoodSummaryPage`。

## 用户流程

1. `FoodSearchPage` 从后端食物目录搜索、按分类筛选并显示营养值。
2. 点击食物右侧圆形加号加入本餐购物车；再次点击或购物车内的 `＋` 可以继续增加数量，`−` 减到 0 会移除。
3. 底部购物车展示已选份数、本餐热量和今日剩余热量，展开后可逐项调整。
4. 点击“完成记录”批量保存当前实际选择，并跳转 `FoodSummaryPage`。
5. `FoodSummaryPage` 按日期展示热量环、目标/摄入/剩余热量、三大营养素和早餐/午餐/晚餐/加餐分组，可继续添加食物。

## 数据约定

- API 可用时通过 `food.service.ts` 读取和保存。
- 未登录、401、404 或网络异常时，使用本地真实食物目录作为降级数据，不显示“没有找到这份食物”这类误导状态。
- 饮食记录保存实际选择的食物快照、份量和营养值，并按用户 ID 隔离本地存储。
- 首页和总结页的餐次图标使用共享资源：`meal-breakfast.svg`、`meal-lunch.svg`、`meal-dinner.svg`、`meal-snack.svg`。

## 变更边界

- 不要把饮食目录组件嵌入计划页或首页卡片；首页只负责入口和摘要。
- 不要删除 `foodSnapshot`，否则离线记录无法在后续日期正确计算营养值。
- 修改默认入口时同步更新 `apps/mini/src/pages/home/HomePage.vue`、`home-actions.ts` 和本文件。

## 验证

```bash
node_modules/.bin/vitest.cmd run apps/mini/src/pages/food-search/food-search-presentation.spec.ts apps/mini/src/pages/food-summary/food-summary-presentation.spec.ts
node scripts/verify-mini-build.mjs
```

