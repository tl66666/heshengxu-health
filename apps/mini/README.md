# 和生序小程序工程

本目录是和生序的 uni-app 小程序源码，目标平台是微信小程序，后续可复用到 App。当前包含阶段 1 建档流程、实时 BMI、建档后首页占位和可测试的 API 请求层。

静态 Demo 在 `prototypes/web-demo/`，图片源统一在仓库根目录 `assets/illustrations/`；不会把 Demo 直接当作正式页面实现。

## 源码边界

- 页面组合放在 `src/pages/`，跨页面展示组件放在 `src/components/`。
- 健康业务状态和请求编排放在 `src/features/health-loop/`；通用请求 transport 放在 `src/services/`。
- 底部导航唯一源码实现是 `src/components/MiniTabBar.vue`；不要重新创建 `custom-tab-bar/` 或在页面里复制导航模板。
- `src/static/illustrations/` 是图片同步缓存，`dist/` 是构建产物，均不手工维护。

## 本地命令

```powershell
pnpm --filter @heban/mini test
pnpm --filter @heban/mini typecheck
pnpm --filter @heban/mini build:mp-weixin
pnpm --filter @heban/mini build:mp-weixin:check
```

## 微信开发者工具导入

开发和发布只使用一套构建产物，不要同时保留或切换旧目录。日常改代码不需要手动执行 `build`：开发监听会自动编译，微信工具只需点击“重新编译”。

### 日常开发（推荐）

先在仓库根目录运行：

```powershell
./scripts/dev-mini.ps1
```

脚本会持续监听源码变化并生成 `apps/mini/dist/dev/mp-weixin`。微信开发者工具只需要导入一次 `apps/mini`，项目配置会自动把小程序根目录指向开发产物；之后保存源码后，在微信工具点击“重新编译”即可看到变化，不需要 HBuilderX 参与。

### 发布前构建

先关闭开发监听窗口，再运行：

```powershell
./scripts/build-mini.ps1
```

发布预览时直接导入 `apps/mini/dist/build/mp-weixin`。不要导入仓库根目录，也不要把 `apps/mini/src` 当作原生微信小程序项目。源码使用 `pages.json`，微信端 `app.json` 由构建自动生成。

### 目录混乱时

在仓库根目录执行：

```powershell
pnpm --filter @heban/mini clean:dist
./scripts/dev-mini.ps1
```

然后在微信开发者工具删除旧项目，重新导入 `apps/mini`。日常开发只保留 `dist/dev/mp-weixin`；发布前才会生成 `dist/build/mp-weixin`。

`manifest.json` 中的 AppID 当前为空，发布前再填入微信公众平台申请的正式 AppID；AppSecret 不进入小程序工程或 Git 仓库。

## 重置演示数据（重新体验建档）

建档完成后，本机会保存 `heshengxu.local.health-profile` 和 `heshengxu.local.health-plan` 两个演示数据，再次编译会直接进入首页，这是预期行为。想回到建档流程有两种方式：

1. **应用内入口（推荐）**：「我的 → 数据与隐私 → 重置演示数据」，确认后清除本机建档与计划，并直接重新进入建档流程。
2. **开发者工具手动清理**：微信开发者工具工具栏「清缓存 → 清除数据缓存」（或调试器 Storage 面板删除上述两个 `heshengxu.local.*` 键），然后点击「重新编译」。

注意：如果本地演示 API（PostgreSQL）正在运行且已有服务端档案，工具清缓存后 Bootstrap 页仍可能因服务端档案直接跳转首页；此时使用应用内入口即可，重新建档会覆盖服务端演示档案。
