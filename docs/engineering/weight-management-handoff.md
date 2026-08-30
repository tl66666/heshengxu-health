# 体重管理模块交接说明

更新时间：2026-08-30

## 本次交付

体重详情页已从占位图表升级为可操作的体重管理工作台，入口仍为 `/pages/weight/WeightDetailPage`。

本次包含三类视图：

- **进度**：当前体重、BMI、目标进度、7/30/90 天趋势、趋势解读、里程碑、目标预测和本周记录节奏。
- **数据**：BMI、体脂率、腰围、基础代谢四项指标，以及健康区间和小絮提醒。
- **记录**：最近记录列表，显示日期、时间、备注、体重和相对上次变化。

底部主按钮打开记录弹窗，支持输入体重和备注。保存后会立即刷新当前体重、进度、趋势、里程碑和记录列表。

## 文件边界

本次只修改：

- `apps/mini/src/pages/weight/WeightDetailPage.vue`
- `docs/engineering/weight-management-handoff.md`

本次没有修改其他会话负责的 `WaterPage.vue`、首页、API 合同或服务层。

## 数据与接入

当前页面使用本地演示数据，存储键为 `heban-weight-records`，结构如下：

```ts
type WeightRecord = {
  id: string;
  weight: number;
  recordedAt: string;
  note?: string;
};
```

页面内已预置 5 条有日期的记录，便于首次打开就能看到趋势。后续接入真实数据时，建议把 `readRecords` 替换为 `healthLoopState.todayRecords.weight` + 历史记录接口，并保留本地存储作为离线回退。

## 视觉规范

- 背景使用项目既有奶油色 `#fff7f1`，主表面为半透明奶油白。
- 主色为低饱和水彩绿，辅色使用樱粉、麦芽黄和雾蓝。
- 主视觉优先复用现有高质感资产：`program-weight.png`、`xuxu-avatar.png`、`xuxu-safe-support.png`。
- 不使用通用 emoji 作为装饰图标，不新增孤立的扁平 AI 图标。
- 卡片只用于真正的指标或记录模块，保持圆角、阴影和间距的一致性。

## 验证记录

- Prettier：体重页通过格式检查。
- `vue-tsc --noEmit`：体重页没有新增类型错误；仓库仍有其他页面既存错误。
- 小程序产物：`dist/build/mp-weixin/pages/weight/WeightDetailPage.wxml` 与 `.js` 已生成。
- 生成 JS：通过 `node --check`。
- 浏览器：Playwright 已安装 Chromium，但当前 uni-app H5 入口在本地路由下根节点为空，未完成有效截图验证；需后续从 H5 启动入口或内置浏览器继续排查。

## 后续建议

1. 接入真实体重历史接口，并将 `startWeight`、`targetWeight`、`heightCm` 从健康档案读取。
2. 记录保存时同步调用 `healthLoopState.createRecord({ type: 'weight', data })`，网络失败再回退到本地存储。
3. 在微信开发者工具中确认 SVG 在目标基础库中的渲染表现，必要时降级为 canvas 图表。
4. 其他会话如果调整全局奶油色 token，请同步检查本页的 `hero-wrap`、`card` 和 `record-button` 对比度。
