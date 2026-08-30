# 小程序运行故障恢复

## 典型错误

`module 'pages/onboarding/onboarding-flow.js' is not defined` 表示页面脚本已经生成，但它依赖的同目录模块没有出现在 `dist/dev/mp-weixin`。最常见原因是多个会话同时运行 uni/Vite 监听器，共用同一个输出目录，或编译中途被终止。

## 恢复步骤

1. 关闭其他会话的 `dev:mp-weixin`、H5 和生产构建进程，只保留一个小程序监听器。
2. 在仓库根目录执行 `pnpm --filter @heban/mini clean:dist`。
3. 执行 `./scripts/dev-mini.ps1`，等待终端出现 `Build complete`。
4. 在微信开发者工具导入 `apps/mini`，确认项目配置指向 `apps/mini/dist/dev/mp-weixin`，再点击“重新编译”。
5. 若要检查产物完整性，执行 `node scripts/verify-mini-build.mjs apps/mini/dist/dev/mp-weixin`。该检查会验证 onboarding、首页、计划等入口以及所有相对 `require` 模块。

`scripts/dev-mini.ps1` 现在会在启动前清理 `dist/dev` 和 `dist/build`，避免复用被中断的半成品。不要在监听器运行期间执行生产构建；发布构建应先停止监听器，再执行 `scripts/build-mini.ps1`。
