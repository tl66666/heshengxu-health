# 和生序文档中心

这里是和生序个人项目的工程文档入口。先阅读当前有效文档，再查看历史记录。

## 推荐阅读顺序

1. [根 README](../README.md)：产品、架构和发布总览。
2. [本地开发](engineering/local-development.md)：启动、构建和常见问题。
3. [项目交接](engineering/handoff.md)：模块边界、当前状态和后续会话约束。
4. [部署指南](DEPLOYMENT.md)：Azure、PostgreSQL、Docker、CloudBase 和微信后台配置。
5. [发布检查清单](RELEASE-CHECKLIST.md)：上线前后的逐项验收。
6. [App 双端发布](APP-RELEASE-HBUILDERX.md)：HBuilderX 打包 Android/iOS。

## 当前有效文档

### 产品

- [产品蓝图](product/heshengxu-product-blueprint.md)
- [数据来源与边界](product/data-sources.md)
- [计划功能说明](PLAN-FEATURES.md)

### 工程

- [项目结构规范](engineering/project-structure.md)
- [小程序前端实现](engineering/mini-frontend-implementation.md)
- [本地健康记录](engineering/local-health-records.md)
- [CloudBase AI 集成](integrations/cloudbase-ai.md)
- [公开仓库安全](engineering/public-repository-security.md)

### 架构

- [目标运行架构 ADR](architecture/adr-005-target-runtime-and-deployment.md)
- [后端运行策略 ADR](architecture/adr-004-backend-runtime-strategy.md)
- [身份与数据隔离](architecture/identity-and-data-isolation.md)
- [架构决策记录](architecture/)

### 交接与专题

- [首页交接](AI-HANDOFF-HomePage.md)
- [饮水功能交接](engineering/water-feature-handoff.md)
- [轻断食功能交接](engineering/fasting-feature-handoff.md)
- [体重管理交接](engineering/weight-management-handoff.md)
- [食品识别交接](FOOD-RECORDING-HANDOFF.md)

## 历史与归档

历史会话总结、旧方案和已结束计划保留在仓库中，供追溯使用，不作为当前实现的唯一依据：

- [历史产品探索](product/archive/)
- [已归档计划](superpowers/plans/archive/)
- [设计与实施规格](superpowers/specs/)
- [当前实施计划](superpowers/plans/)

## 文档维护规则

- 新功能先更新产品或工程文档，再更新索引。
- 当前状态写入当前有效文档；历史过程写入归档文档。
- 文档中的 URL、资源名称和环境变量必须与实际配置一致。
- 禁止写入 API Key、数据库密码、微信 AppSecret、个人数据或本机绝对路径。
- 文档只描述和生序，不把外部产品作为本项目依赖或品牌描述。
