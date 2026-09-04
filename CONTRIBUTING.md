# 贡献与协作规则

和生序是个人项目。贡献可以来自本人、受邀开发者或后续开发会话，所有改动都要保持产品边界、数据真实性和发布可追溯性。

## 开始工作

1. 阅读 README、文档中心和相关模块交接文档。
2. 从最新 main 分支开始，确认工作区没有未理解的改动。
3. 使用 npm 执行本地命令；不要在项目中引入新的包管理器或提交新的 lockfile。
4. 修改前先确认模块边界、数据来源和目标运行端。

## 代码与提交

- Vue、TypeScript、NestJS 和 Prisma 遵循现有目录结构和命名方式。
- 业务记录必须有明确的新增、编辑、删除、加载和失败状态。
- 时间、数量和用户输入使用真实值，不用静态示例数据冒充已保存记录。
- 提交保持单一目的，消息说明实际变化。
- 不提交 node_modules、dist、日志、.env、微信私有配置、数据库导出和临时截图。
- 不为通过检查而删除测试、绕过类型检查或修改无关模块。

## 必须执行的检查

    npm exec -- prettier --check .
    npm exec -- eslint .
    npm exec -- vitest run
    npm exec -- vue-tsc --noEmit

如果只修改小程序，至少在 apps/mini 目录执行测试和类型检查；如果修改 API 或 Prisma，必须同时执行 API 构建和迁移演练。

## 文档维护

功能完成后更新对应交接文档和 docs/README.md。生产配置更新后同步 docs/DEPLOYMENT.md 和 docs/RELEASE-CHECKLIST.md。过程性计划保存在 docs/superpowers/plans/，完成后保留并标记状态。

## 发布边界

小程序发布包来自 apps/mini/dist/build/mp-weixin，API 通过 Docker 镜像发布。任何密钥、数据库密码和用户数据只能在部署平台的 Secret 或环境变量中管理。
