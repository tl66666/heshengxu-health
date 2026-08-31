# 计划页功能边界

## 页面职责

`apps/mini/src/pages/plan/PlanPage.vue` 只负责计划页编排：今日完成概览、进行中的习惯计划、七日回顾、模板和自定义计划入口。首页的轻断食卡片、今日节律和首页插画不在本模块维护。

## 模块拆分

- `components/plans/PlanHero.vue`：今日完成、连续天数、本周完成数。
- `components/plans/PlanTaskList.vue`：计划卡、行动打卡、待办/已完成筛选、计划进度。
- `components/plans/PlanTemplateGrid.vue`：官方模板和自定义计划入口。
- `components/plans/PlanCreateSheet.vue`：创建计划表单。
- `components/plans/PlanManageSheet.vue`：改名、修改说明、添加行动、归档。
- `components/plans/PlanWeekReview.vue`：近七日柱状回顾。
- `features/plans/plan-store.ts`：计划数据读写、统计和按用户隔离的本地存储。

## 数据与隔离

计划目前使用本地存储，访客使用 `heban.local.habit-plans.guest.v1`，登录用户使用 `heban.local.habit-plans.user.{userId}`。不要在页面组件中直接拼接存储 key；需要接后端时，应在 `plan-store.ts` 外新增 repository 适配层，保留页面事件接口。

## 插画约定

自定义计划使用 `assets/illustrations/custom-plan-planning.png`（同步到 `apps/mini/src/static/illustrations/`），画面是既有女主和序序一起制定计划。模板卡中的场景图使用 `aspectFit`，不要把完整场景裁成小图标；新增插画请先确认人物身份和安全留白，再同步静态目录。

## 继续开发注意事项

只启动一个小程序 watcher，避免多个会话同时写入 `apps/mini/dist/dev/mp-weixin`。首页改动请留在 `pages/home` 和对应 feature 中，不要把首页业务条件塞入计划组件。

## 饮食页边界

食物目录和餐次添加属于 `pages/food-search`、`pages/meal-add` 与 `features/food`，不由计划页消费。餐次添加页维护本餐临时购物车，保存时通过 `createMealEntry` 写入饮食记录；每日热量目标使用 `heban.food.daily-target-kcal`，缺省值 1800 仅作为估算展示。
