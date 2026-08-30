# 饮水功能交接说明

## 交接范围

本次会话负责微信小程序饮水页的交互与视觉细节收敛，目标是保持项目既有的日系治愈奶油水彩风格，并修正首页与饮水页资源不一致、饮品记录入口单一、水面过于静态等问题。

本交接文档只覆盖以下文件和行为：

- `apps/mini/src/pages/water/WaterPage.vue`
- 饮水页使用的本地资源与本地存储约定
- 本次构建、产物检查和专项测试结果

不要用本次提交覆盖其他会话正在开发的文件，例如 `apps/mini/src/pages/weight/WeightDetailPage.vue` 或其他交接文档。

## 已完成内容

### 饮品记录

- 快捷记录区增加饮品选择入口，当前可切换水、茶水、牛奶、咖啡、果汁和苏打水。
- 快捷记录、主记录按钮、历史记录和弹窗选项会跟随当前饮品名称与图标变化。
- 水饮品在所有入口统一使用首页相同的水滴 PNG，不再使用另一套水滴图或带白底的替代图标。
- 其他饮品目前沿用页面已有的图标字段；后续如补充插画资源，应保持透明背景和同一水彩笔触，不要用成品截图替代图标。

### 水杯与水面

- 水杯继续使用空杯资源作为外层容器，杯内叠加水纹理资源。
- 水面增加不规则波形、高光和缓慢漂移动画，包含 `water-drift`、`water-breathe`、`water-ripple`、`surface-swell` 和 `surface-glint`。
- 记录按钮改为浅蓝水彩渐变、半透明图标圆和轻微按压反馈，避免整页只使用绿色。
- 页面文字与卡片颜色维持奶油白、雾蓝、浅绿和灰紫的低饱和组合；卡片使用轻玻璃背景、细边框和内高光。

## 关键资源

首页与饮水页统一使用：

```text
/static/icons/watercolor/water-drop.png
```

饮水页杯内纹理使用：

```text
/static/illustrations/water-ripple-texture.png
```

空杯资源位于仓库资源目录：

```text
assets/illustrations/water-cup-empty.png
```

不要使用已经装水的成品图 `assets/illustrations/water-cup-watercolor.png` 作为动态水杯主体。

## 本地存储约定

饮水页按用户标识生成当天记录键，记录通过 `uni.setStorageSync` 保存；页面在 `onShow` 时重新读取目标和当天记录。

饮水目标设置页使用以下键：

- `water_daily_goal`：当前每日目标，单位 ml。
- `water_daily_goal_custom`：用户自定义目标，单位 ml；有效范围为 500-6000 ml，并按 50 ml 取整。
- `water_user_info`：饮水页展示所需的本地用户信息。

饮水页记录结构和读取逻辑以 `WaterPage.vue` 当前实现为准。不要写入虚构的健康数据或示例记录；没有用户记录时应保持空状态。

## 验证结果

在仓库根目录 `D:\禾伴\heban-ai-health-demo` 执行过：

```powershell
cd apps/mini
.\node_modules\.bin\uni.cmd build -p mp-weixin
node ../../scripts/verify-mini-build.mjs
```

结果：微信小程序构建完成，构建产物检查通过。可将以下目录导入微信开发者工具：

```text
apps/mini/dist/build/mp-weixin
```

专项测试命令：

```powershell
.\node_modules\.bin\vitest.cmd run src/features/menstruation/menstruation.service.spec.ts src/features/medication/medication.service.spec.ts src/pages/menstruation/menstruation-setup.spec.ts --pool=threads --maxWorkers=1 --minWorkers=1
```

结果：3 个测试文件通过，6 个测试通过。

针对本次文件的类型检查没有发现新增错误；仓库全量类型检查仍有其他模块原有错误，不在本会话范围内处理。

## 后续接手建议

1. 在微信开发者工具中导入 `apps/mini/dist/build/mp-weixin`，重点查看 390x844 和 430x932 两个尺寸下的水面动画、按钮点击反馈和饮品切换。
2. 若继续完善茶水、牛奶等饮品图标，应先将透明背景水彩资源放入 `apps/mini/src/static/icons/watercolor/`，再替换 `drinkOptions` 的图标字段，保持首页资源风格一致。
3. 若修改饮水目标或记录数据结构，需同步更新本地存储键说明，并补充对应的 Vitest 测试。
4. 提交前重新检查 `git status --short`，只暂存本会话负责的文件，避免合并其他会话的未完成改动。
