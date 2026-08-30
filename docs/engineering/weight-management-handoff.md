# 体重管理模块交接说明

更新时间：2026-08-30

## 本次交付

体重详情页 `/pages/weight/WeightDetailPage` 已升级为可操作的体重管理工作台，包含：

- 进度视图：当前体重、BMI、目标进度、7/30/90 天趋势、趋势解读、里程碑、目标预测、本周记录节奏。
- 数据视图：BMI、体脂率、腰围、基础代谢；没有真实来源的数据显示为“待记录”，不注入假指标。
- 记录视图：真实历史记录、日期、时间、备注和相对上次变化。
- 记录弹窗：新增体重时优先写入后端，网络不可用才落本地缓存。

首页 `/pages/home/HomePage` 同步修复：

- `daily-home` 请求增加 1.6 秒超时。
- 同一天的并发请求会去重，避免 `onMounted` 和 `onShow` 重复打接口。
- 增加 30 秒网络熔断，网络不可用时不再反复卡在“正在整理今天的节律”。
- 优先渲染最近一次缓存或本地档案，再后台刷新真实数据。
- 体重进度读取真实方案的 `startWeightKg`、`targetWeightKg` 和当天体重记录。

## 文件边界

本次修改文件：

- `apps/mini/src/pages/weight/WeightDetailPage.vue`
- `apps/mini/src/pages/home/HomePage.vue`
- `apps/mini/src/features/health-loop/health-loop.store.ts`
- `apps/mini/src/features/health-loop/health-loop.service.ts`
- `apps/mini/src/features/health-loop/local-demo.ts`
- `apps/mini/src/services/mini-api.ts`
- `apps/api/src/modules/health-records/health-records.controller.ts`
- `apps/api/src/modules/health-records/health-records.dto.ts`
- `apps/api/src/modules/health-records/health-records.service.ts`
- `apps/api/src/modules/health-plans/health-plans.service.ts`
- `packages/contracts/src/health-loop.ts`
- `docs/engineering/weight-management-handoff.md`

其他会话负责的文件不要回滚或覆盖，尤其是 `apps/mini/src/pages/water/WaterPage.vue`。

## API 与数据

新增历史接口：

```text
GET /api/v1/health-records/weights/history
POST /api/v1/health-records/weights
```

体重记录类型：

```ts
type WeightRecord = {
  id: string;
  weight: number;
  recordedAt: string;
  note?: string;
};
```

本地回退存储键为 `heban-weight-records`，仅在 API 超时或不可用时使用。首次没有记录时显示空状态，不再预置演示体重。

`HealthTargetDto.startWeightKg` 由健康档案当前体重派生，后端不会新增数据库字段；本地计划也会从本地健康档案填充同一字段。

## 视觉规范

- 沿用奶油底色、低饱和水彩绿、樱粉和麦芽黄。
- 主视觉优先复用 `program-weight.png`、`xuxu-avatar.png`、`xuxu-safe-support.png`。
- 不使用通用 emoji 作为装饰图标，不新增孤立的扁平 AI 图标。
- 女主与序序的形象必须保持一致；新增图片需要先锁定现有形象再生成。
- 图片必须使用稳定尺寸和独立层级，不能遮挡数据、按钮或底部操作区。

## 验证记录

- Prettier：相关前端、API、合同文件通过格式检查。
- `vue-tsc --noEmit`：本次涉及的体重页、首页、health-loop 文件没有新增类型错误；仓库仍有其他历史页面错误。
- 小程序体重页 WXML/JS 产物已生成，生成 JS 通过 `node --check`。
- H5 浏览器：当前 uni-app H5 本地入口根节点为空，未能完成有效截图验证；需要从项目指定 H5 启动入口或内置浏览器继续排查。

## 后续接入

1. 生产环境必须配置 `VITE_MINI_API_BASE_URL`，不要依赖 localhost 默认地址。
2. 接入真实体脂率、腰围和基础代谢接口后，替换数据视图里的“待记录”状态。
3. 用户设置新计划时，后端应记录当时的起始体重快照，避免后续档案变更影响历史计划展示。
4. 图片生成需要本机设置 `OPENAI_API_KEY`；当前环境未检测到该变量，因此本次继续复用了现有高质感水彩资产，没有用低质占位图替代。
