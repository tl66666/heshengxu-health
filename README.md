# 和生序健康

面向微信小程序优先、可扩展到 App 的 AI 健康管理平台。

“和生序”取“和身心、生息、循其序”之意：不追求极端的改变，而是通过持续记录、理解变化和小步行动，让健康回到每个人自己的节律。品牌主张：**让健康回到自己的节律。**

当前仓库处于阶段 0：工程底座建设。生产代码尚未开始实现，根目录的静态页面已被隔离为探索性原型，避免将未确认的页面、图片和模拟数据带入正式产品。

## 仓库结构

```text
apps/                 # 后续的 uni-app 小程序与 NestJS API
packages/             # 跨端 contracts、领域规则和共享配置
prototypes/web-demo/  # 当前静态 Demo，仅用于产品与设计讨论
infra/                # 本地 Docker 与部署基础设施
docs/                 # 产品、架构、工程规范和实施计划
```

## 运行原型

```powershell
node --test prototypes/web-demo/profile-utils.test.cjs
npx serve prototypes/web-demo
```

## 文档入口

- [产品蓝图](docs/superpowers/specs/2026-08-24-heban-health-platform-design.md)
- [产品范围取舍](docs/superpowers/specs/2026-08-24-product-scope-after-mint-benchmark.md)
- [阶段 0 实施计划](docs/superpowers/plans/2026-08-24-stage-0-engineering-foundation.md)

## 健康与 AI 边界

和生序提供健康管理与生活方式建议，不提供疾病诊断、处方、药物剂量或替代线下就医的判断。所有生产 AI 能力必须经过服务端风险拦截、输出校验与审计后才能上线。
