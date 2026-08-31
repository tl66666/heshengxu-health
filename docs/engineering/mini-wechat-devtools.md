# 微信开发者工具运行说明

## 页面被“代码依赖分析”忽略

首页使用 `uni.navigateTo` 通过字符串路由打开记录页。微信开发者工具如果开启
`setting.ignoreDevUnusedFiles`，会把这类没有静态 import 的页面判定为未使用文件，
运行时就会出现：

> pages/<page>/Page.js 已被代码依赖分析忽略

项目配置已将该选项设为 `false`：

- `apps/mini/project.config.json`：仓库默认配置
- `apps/mini/project.private.config.json`：本机开发配置（被 gitignore 忽略）

如果重新导入项目后再次出现该错误，请在微信开发者工具的项目设置中关闭“过滤无依赖文件”，
或删除本机私有配置后重新启动开发编译。

## 首页加载状态

首页首次进入会显示 `onboarding-guide-vertical.png` 品牌插画和“让健康回到自己的节律”文案。
健康数据加载完成后自动切换到真实卡片；本地缓存或本地记录可用时优先展示，不应长时间停留在纯文本等待页。

## 构建验证

```powershell
cd D:\禾伴\heban-ai-health-demo\apps\mini
.\node_modules\.bin\uni.cmd build -p mp-weixin
cd D:\禾伴\heban-ai-health-demo
node scripts/verify-mini-build.mjs
```
