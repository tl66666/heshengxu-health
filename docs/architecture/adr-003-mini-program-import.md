# ADR-003：微信小程序采用构建产物导入

**状态：** 已接受  
**日期：** 2026-08-24

微信开发者工具要求项目根或 `miniprogramRoot` 下存在编译后的 `app.json`。uni-app 源码目录本身只有 `pages.json` 和 `manifest.json`，不会手工维护微信端 `app.json`。

因此 `apps/mini/project.config.json` 默认将 `miniprogramRoot` 指向 `dist/dev/mp-weixin/`。日常开发运行 `scripts/dev-mini.ps1` 后导入 `apps/mini`，源码保存即可持续更新；发布预览运行 `scripts/build-mini.ps1`，再直接导入 `dist/build/mp-weixin/`。两类构建产物都不提交 Git，每次切换分支或拉取新代码后重新生成。

这样保留 uni-app 的跨端源码单一来源，同时满足微信开发者工具的目录规范，避免手工复制 `app.json` 导致页面路由漂移。
