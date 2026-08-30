# 计划页模块交接

更新时间：2026-08-30

## 本次完成

- `apps/mini/src/pages/plan/PlanPage.vue` 重写为计划工作台：今日完成度、连续天数、后端健康计划摘要、自定义计划入口。
- 新增 `apps/mini/src/components/plans/`：`PlanHero`、`PlanTaskList`、`PlanTemplateGrid`、`PlanCreateSheet`，页面只负责组合与导航。
- 新增 `apps/mini/src/features/plans/`：本地习惯计划类型、模板、持久化和打卡逻辑。支持体重管理、健康饮食、戒奶茶、学习、运动、睡眠、情绪和自定义计划。
- 素材适配复核：学习计划改用方形 `xuxu-record-reminder.png`，避免横幅图在缩略图中主体过小；全部图片均使用 `aspectFit` 或受控容器，不会裁切序序主体。
- 所有本地数据写入 `heban.local.habit-plans.v1`，不会覆盖 `heshengxu.local.health-plan`，也没有修改 `packages/contracts` 或 `apps/api`。

## 与其他会话的边界

- `health-loop.store.ts` 仍负责现有体重/睡眠 API 计划；计划页只读取 `activePlan` 并展示“来自健康档案”的摘要。
- 若后续需要服务端同步自定义习惯，建议新增独立 `habit-plans` API 和迁移层，再在 `features/plans/plan-store.ts` 增加可替换的 repository，不要直接改变现有 `health-plans` 契约。
- 其他会话的食物、药物和首页改动保持原样；水功能文件在本次提交前已处于暂存状态，随提交一并进入远端，但不属于本计划模块的实现范围。

## 验证

`apps/mini/node_modules/.bin/vue-tsc.cmd --noEmit --pretty false` 可执行；当前仓库仍有既存类型错误（主要集中在首页、食物详情和体重图表），本次新增文件未产生额外错误。计划存储单测位于 `features/plans/plan-store.spec.ts`。
