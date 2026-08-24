# 小程序工程壳

本目录包含最小 uni-app 小程序工程壳和可测试的 API 请求层。当前仅提供开发环境状态页，不包含正式建档、记录、导航、插画、方案卡或 AI 对话。

业务页面、图片和静态 Demo 不应直接迁移到这里；阶段 1 完成流程确认后再实现正式体验。

## 本地命令

```powershell
pnpm --filter @heban/mini test
pnpm --filter @heban/mini typecheck
pnpm --filter @heban/mini build:mp-weixin
```

微信开发者工具可导入构建产物 `dist/build/mp-weixin` 进行预览。`manifest.json` 中的 AppID 当前为空，发布前再填入微信公众平台申请的正式 AppID；AppSecret 不进入小程序工程或 Git 仓库。
