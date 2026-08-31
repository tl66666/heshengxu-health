# 本地档案与健康目标同步

更新时间：2026-08-31

## 当前事实源

微信小程序阶段以 `uni` storage 中的本地健康档案为事实源。建档或编辑保存后，页面必须立即读取本地数据；远程健康档案接口只做后台 best-effort 同步，不能用种子数据、旧响应或当天缓存覆盖用户刚保存的资料。

档案键：`heshengxu.local.health-profile`

```ts
type LocalHealthProfile = {
  displayName: string;
  sex: 'female' | 'male' | 'unspecified';
  birthDate: string;
  heightCm: number;
  weightKg: number;
  primaryGoal: HealthGoal;
  goals: HealthGoal[];
};
```

建档页的输入提示不是数据。身高、体重必须由用户填写或拖动滑块后才可继续，不能在进入步骤时写入 `168 / 60` 等默认值。

## 保存后的联动

完成建档后必须一次完成以下本地写入：

1. 保存性别、生日、身高、体重、主要目标和全部目标。
2. 没有称重历史时，将建档体重写为首条真实体重记录，备注为“建档初始体重”。
3. 根据主要目标同步当前健康主计划。
4. 根据全部目标添加对应的日常习惯计划，同类计划按模板去重。
5. 首页、健康档案和“我的”页在 `onShow` 时重新读取本地档案，不能依赖首次计算后的旧值。

编辑身体指标时，体重发生变化会新增一条“健康档案更新”称重记录，使首页体重卡片与趋势图同步更新；仅修改姓名、生日或目标不会伪造体重记录。

## 目标映射

| 健康目标 | 功能入口 | 日常计划 | 主计划 |
| --- | --- | --- | --- |
| 减脂与体重管理 | 体重趋势 | 体重 | weight / lose |
| 保持当前状态 | 体重趋势 | 体重 | weight / maintain |
| 增肌与体能 | 运动 | 运动 | weight / gain |
| 改善睡眠 | 睡眠 | 睡眠 | sleep |
| 提升精力 | 饮食 | 饮食 | 无独立主计划 |
| 情绪与压力 | 心情 | 心情 | 无独立主计划 |

“提升精力”和“情绪与压力”使用现有日常习惯计划，不强行伪装成体重或睡眠主计划。用户把主要目标切换到这两类时，会清除不再匹配的旧主计划，避免首页继续显示过期方向。

## 页面体现

- 首页：在主要健康卡片前展示“我的健康方向”，每项目标可进入对应功能，并可进入档案调整。
- 健康档案：展示全部目标、说明和功能入口；不再只展示 `primaryGoal`。
- 我的：摘要直接显示本地目标组合，并在每次显示时刷新。
- 体重管理：读取档案身高、当前体重和真实称重记录；趋势、BMI 与目标进度不得使用演示值。
- 计划：建档目标生成的计划使用现有 `HabitPlan` storage，可继续打卡、编辑和删除。

## 关键文件

- `apps/mini/src/features/health-loop/local-demo.ts`
- `apps/mini/src/features/health-loop/health-loop.store.ts`
- `apps/mini/src/features/health-profile/health-goal-sync.ts`
- `apps/mini/src/features/health-profile/profile-loader.ts`
- `apps/mini/src/pages/onboarding/OnboardingPage.vue`
- `apps/mini/src/pages/profile-edit/ProfileEditPage.vue`
- `apps/mini/src/pages/profile/ProfilePage.vue`
- `apps/mini/src/pages/home/HomePage.vue`
- `apps/mini/src/pages/me/MePage.vue`

## 后续接入边界

App 或微信账号同步接入后，应为本地档案和记录增加同步状态、服务端 id、更新时间和冲突策略，不要直接改回“远程响应优先”。服务端同步失败不能阻塞本地保存，远程旧数据也不能覆盖更新时间更晚的本地数据。
