# 和生序小程序工程

本目录是和生序正式 uni-app 客户端源码，当前发布目标为微信小程序，同一套 Vue 3/TypeScript 页面可继续通过 HBuilderX 打包为 App。健康建档、首页、记录、计划、序序聊天、序序相机和个人中心都从这里构建；原始水彩图片统一保存在仓库根目录 `assets/illustrations/`。

## 源码边界

- 页面组合放在 `src/pages/`，跨页面展示组件放在 `src/components/`。
- 健康业务状态和请求编排放在 `src/features/health-loop/`；通用请求 transport 放在 `src/services/`。
- 底部导航唯一源码实现是 `src/components/MiniTabBar.vue`；不要重新创建 `custom-tab-bar/` 或在页面里复制导航模板。
- `src/static/illustrations/` 是图片同步缓存，`dist/` 是构建产物，均不手工维护。

## 本地命令

```powershell
npm --prefix apps/mini test
npm --prefix apps/mini run typecheck
npm --prefix apps/mini run build:mp-weixin
npm --prefix apps/mini run build:mp-weixin:check
```

## 微信开发者工具导入

开发和发布只使用一套构建产物，不要同时保留或切换旧目录。日常改代码不需要手动执行 `build`：开发监听会自动编译，微信工具只需点击“重新编译”。

### 日常开发（推荐）

先在仓库根目录运行：

```powershell
./scripts/dev-mini.ps1
```

并行开发注意：`apps/mini/dist/dev/mp-weixin` 是共享输出目录，同一时间只能运行一个 `dev:mp-weixin` 监听器。遇到 `module is not defined` 时，先停止其他会话的监听器，再执行 `npm --prefix apps/mini run clean:dist` 和 `./scripts/dev-mini.ps1`；看到 `Build complete` 后再在微信开发者工具点击“重新编译”。监听器运行期间不要执行生产构建，以免把不完整的模块写入 dev 目录。

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
npm --prefix apps/mini run clean:dist
./scripts/dev-mini.ps1
```

然后在微信开发者工具删除旧项目，重新导入 `apps/mini`。日常开发只保留 `dist/dev/mp-weixin`；发布前才会生成 `dist/build/mp-weixin`。

`manifest.json` 中的 AppID 当前为空，发布前再填入微信公众平台申请的正式 AppID；AppSecret 不进入小程序工程或 Git 仓库。

## 重置本机数据（重新体验建档）

建档和部分生活记录会保存在当前设备，再次编译后继续显示原记录是预期行为。想清除当前设备上的记录并重新进入建档流程有两种方式：

1. **应用内入口（推荐）**：「我的 → 数据与隐私 → 重置本机数据」，确认后清除本机建档、计划和记录，并直接重新进入建档流程。
2. **开发者工具手动清理**：微信开发者工具工具栏「清缓存 → 清除数据缓存」，然后点击「重新编译」。

注意：清除本机缓存不会删除已经同步到生产 PostgreSQL 的服务端记录。正式的数据删除能力需要通过应用的数据与隐私入口调用服务端删除流程。

### 报 "module is not defined" 怎么办

新增源码文件后，如果开发者工具报 `module 'pages/xxx/yyy.js' is not defined`，说明 dev 监听编译中断过、`dist/dev` 产物不完整。处理：关闭微信开发者工具里的项目 → 重新运行 `./scripts/dev-mini.ps1` → 等日志出现 `Build complete` → 重新导入 `apps/mini`。

提交前可用 `node scripts/verify-mini-build.mjs`（检查 build 产物）和 `node scripts/verify-mini-build.mjs apps/mini/dist/dev/mp-weixin`（检查 dev 产物）验证产物里没有缺失的模块引用；该检查已接入 CI。
