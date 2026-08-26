# 周健康回顾设计

## 目标

为已完成建档的用户提供一个基于真实记录的七日回顾。首期重点服务体重管理用户，同时让睡眠计划用户也能看见睡眠、活动和任务完成的事实。页面不做医学诊断、健康评分、卡路里目标判断或虚构趋势。

## 产品边界

- 回顾固定为以用户查看日期所在周的周一至周日，按 `Asia/Shanghai` 划分自然日。
- 入口放在“我的计划”底部，点击进入独立的周回顾页；不新增底部 Tab。
- 至少 3 个自然日存在任一当前版本的健康记录、餐食记录或计划任务，才显示完整回顾。
- 少于 3 天时显示“本周还在收集节律”的数据不足状态，列出已经有的事实和下一条可执行记录；不画图、不补全缺失日、不生成建议结论。
- 体重只在一周内至少有 2 条当前版本记录时显示首末体重和变化值。变化只描述为“较本周首次记录”，不判断健康与否。
- 食物能量仅为用户保存的餐食营养快照之和，显示“已记录餐食”覆盖天数和总千卡；不把未记录餐食估算进来。
- 活动只汇总已记录分钟数；睡眠只汇总已记录的时长与次数。计划完成度只统计该用户当前计划在本周已生成的任务。

## 信息结构与视觉

页面延续当前米白、鼠尾草绿和治愈插画体系，但周回顾是阅读密度更高的工具页：顶部为日期范围和返回按钮；随后是覆盖率、核心事实、体重记录序列、饮食/活动/睡眠摘要和序序的一句确定性说明。

不为数据页强行引入大幅插画或贴图。现有 `insight-report-banner.png` 只在“完整回顾”顶部作为横幅时使用，并保持 `aspectFit`，其余状态用小尺寸已审图和真实文本承载。体重展示为按实际日期排列的记录点列表，不连接缺失日期，避免制造连续曲线的错觉。

计划页只增加一张紧凑的“本周回顾”入口卡：完整数据展示覆盖天数和查看操作；数据不足展示“再记录 N 天即可形成回顾”。卡片不用手绘图标或嵌套大卡片。

## 架构

```text
WeeklyReviewPage / PlanPage
  -> weekly-review.service.ts
  -> GET /health-insights/weekly?date=YYYY-MM-DD
  -> HealthInsightsService
  -> Prisma/PostgreSQL current-version records and plan tasks
  -> @heban/domain weekly-review pure aggregation
```

`@heban/domain` 保存所有日期、覆盖率和数值聚合规则。NestJS 的 `health-insights` 模块只读取数据库、按用户隔离数据，并把原始当前记录转换为领域函数输入。uni-app 的 feature 层只请求 DTO 和将状态映射为可展示文案；Vue 页面不做日期或营养计算。

## 接口契约

`GET /api/v1/health-insights/weekly?date=YYYY-MM-DD` 返回：

```ts
type WeeklyReviewDto = {
  timeZone: 'Asia/Shanghai';
  range: { startDate: string; endDate: string };
  coverage: { recordedDayCount: number; requiredDayCount: 3; status: 'insufficient' | 'ready' };
  weight: { recordCount: number; firstKg?: number; lastKg?: number; changeKg?: number; points: Array<{ date: string; valueKg: number }> };
  food: { recordedDayCount: number; entryCount: number; energyKcal: number };
  activity: { recordCount: number; durationMinutes: number };
  sleep: { recordCount: number; durationMinutes: number };
  plan: { taskCount: number; completedTaskCount: number };
};
```

日期参数非法返回 `400`；当前用户无任何计划也仍可返回记录事实，计划字段为零。所有查询只读取 `isCurrent: true` 的记录。

## 失败与空状态

- API 加载失败：保留返回按钮，显示重试操作，不遮挡底部导航。
- 数据不足：显示覆盖天数和下一步动作，调用“去记录”回到记录页；不出现空白大容器。
- 用户没有体重记录或只有一条：体重模块显示实际次数和明确的“再记录一次后可对比”，不显示 `0kg`。
- 没有食物/活动/睡眠记录：每项显示“本周未记录”，不把它当成零完成或负面评价。

## 验收与测试

- 领域单测覆盖：跨周日期归属、少于三天不足、仅当前版本、体重首末与变化、食物能量/活动/睡眠/任务累计。
- API 端到端测试覆盖：用户隔离、真实七日范围、`insufficient` 与 `ready`、软删除/替换的餐食不进入汇总。
- 小程序单测覆盖：状态到入口卡/回顾文案映射；页面结构测试确保有返回、失败重试与数据不足入口。
- 小程序微信构建必须通过；用实际数据截图检查 375px 宽度下文本不裁切、数据点和底部导航不重叠。

## 非目标

本轮不实现 AI 周报生成、聊天自动建议、CloudBase 存储、真实拍照识别、健康评分、体脂率推断、医学判断、目标热量或计划自动调整。这些需求必须在数据与安全策略成熟后单独设计。
