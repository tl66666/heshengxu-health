# 和生序小程序工程

本目录是和生序的 uni-app 小程序源码，目标平台是微信小程序，后续可复用到 App。当前包含阶段 1 建档流程、实时 BMI、建档后首页占位和可测试的 API 请求层。

静态 Demo 和图片仍在 `prototypes/web-demo/`，不会直接作为正式页面实现。

## 本地命令

```powershell
pnpm --filter @heban/mini test
pnpm --filter @heban/mini typecheck
pnpm --filter @heban/mini build:mp-weixin
pnpm --filter @heban/mini build:mp-weixin:check
```

## 微信开发者工具导入

推荐在仓库根目录执行：

```powershell
./scripts/build-mini.ps1
```

然后导入 `apps/mini`。这里的 `project.config.json` 已将 `miniprogramRoot` 指向 `dist/build/mp-weixin`，所以微信工具能找到构建生成的 `app.json`。

也可以直接导入：

```text
D:\禾伴\heban-ai-health-demo\apps\mini\dist\build\mp-weixin
```

不要直接导入仓库根目录，也不要把 `apps/mini/src` 当作原生微信小程序项目。源码使用 `pages.json`，微信端 `app.json` 由构建自动生成。

`manifest.json` 中的 AppID 当前为空，发布前再填入微信公众平台申请的正式 AppID；AppSecret 不进入小程序工程或 Git 仓库。
