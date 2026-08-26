# 阶段 0.1 工程结构收敛设计

## 背景

当前仓库已有可运行的小程序、API 和共享包，但同时保留了历史 `custom-tab-bar`、未接入的 `tokens.scss`、多份阶段计划和若干本地日志。它们不会直接改变业务数据，却会让开发者误判真实入口，造成页面和导航反复返工。

## 方案

采用“保留现有技术栈、收敛入口和目录”的方案：继续使用 pnpm workspace + uni-app + NestJS + Prisma + Vitest，不在本阶段迁移框架。小程序导航以页面内 `MiniTabBar` 为唯一源码实现，`pages.json` 只保留路由和 Tab 注册；删除未被构建链使用的 `custom-tab-bar/index.vue`。删除未被任何源码引用的 `styles/tokens.scss`，避免形成第二套未生效的设计变量。

## 本阶段操作范围

1. 新增代码库治理规范和阶段路线图。
2. 删除已确认未引用的 `custom-tab-bar/index.vue` 与 `styles/tokens.scss`。
3. 删除根目录本地安装日志；不删除 `.env`、项目配置或构建缓存目录中的用户文件。
4. 更新当前有效文档，明确页面内 `MiniTabBar` 是唯一导航实现，历史计划只作为归档参考。
5. 增强脚手架校验：检查页面入口、核心模块目录和禁提交文件。

## 不在本阶段做的事

- 不重写首页、记录、计划或序序业务逻辑。
- 不迁移 uni-app、NestJS、Prisma 或数据库。
- 不接入真实 AI、微信登录和食物识别。
- 不删除 `prototypes/web-demo`、`assets/illustrations` 或历史设计文档。

## 验收标准

- `rg` 找不到生产源码对 `custom-tab-bar` 和 `styles/tokens.scss` 的引用。
- 小程序构建、页面产物检查、类型检查和测试全部通过。
- 微信构建产物包含五个 Tab 页面和 `MiniTabBar`，不依赖删除的历史入口。
- Git 工作区不包含日志、dist、node_modules、密钥或私有项目配置。
