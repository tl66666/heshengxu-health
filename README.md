# 和生序健康

面向微信小程序优先、可扩展到 App 的 AI 健康管理平台。

“和生序”取”和身心、生息、循其序”之意：不追求极端的改变，而是通过持续记录、理解变化和小步行动，让健康回到每个人自己的节律。品牌主张：**让健康回到自己的节律。**

当前仓库已完成工程底座、健康档案、每日健康记录、食物库与营养记录、序序聊天接口、食物图片识别候选流程，以及微信小程序构建检查。生产上线前仍需配置微信登录、数据库、AI 密钥与静态素材托管，并完成隐私合规和真机验收。

## 🚀 食物库功能快速开始

**新功能**：完整的食物库、拍照识别、饮食记录、体重管理、营养分析

👉 **[本地开发说明](docs/engineering/local-development.md)** - 适合第一次启动项目

📚 **详细文档**：
- [功能设计文档](docs/FOOD-NUTRITION-DESIGN.md) - 完整的6大模块设计
- [上线部署清单](docs/DEPLOYMENT.md)

**一键初始化**：
```powershell
# Windows PowerShell
./scripts/init-food-database.ps1

# 或 Git Bash
./scripts/init-food-database.sh
```

## 小程序快速开始

安装依赖后启动开发监听（以后改源码会自动编译，不需要每次手动 build）：

```powershell
./scripts/dev-mini.ps1
```

微信开发者工具导入 `apps/mini`（只需一次）。开发配置会自动使用 `apps/mini/dist/dev/mp-weixin`，保存源码后点击“重新编译”即可看到最新页面。

发布预览前按[上线部署清单](docs/DEPLOYMENT.md)配置生产 API 与素材域名，再运行 `./scripts/build-mini.ps1`，最后导入 `apps/mini/dist/build/mp-weixin`。

开发时只使用 `apps/mini`；发布时才使用 `dist/build/mp-weixin`。如果两个目录同时存在导致混乱，先运行 `node scripts/clean-mini-dist.mjs`，再运行 `./scripts/dev-mini.ps1`。

## 仓库结构

```text
apps/                 # 后续的 uni-app 小程序与 NestJS API
packages/             # 跨端 contracts、领域规则和共享配置
assets/illustrations/ # 唯一图片源目录，Demo 与小程序共用
prototypes/web-demo/  # 当前静态 Demo，仅用于产品与设计讨论
infra/                # 本地 Docker 与部署基础设施
docs/                 # 产品、架构、工程规范和实施计划
```

## 运行原型

```powershell
node --test prototypes/web-demo/profile-utils.test.cjs
npx serve .
```

然后访问 `http://localhost:3000/prototypes/web-demo/`。Demo 图片统一从 `assets/illustrations/` 读取。

## 文档入口

- [项目交接说明（给后续 AI/开发者）](docs/engineering/handoff.md)
- [公开仓库安全与本地配置规范](docs/engineering/public-repository-security.md)

- [目标运行架构与上线方案](docs/architecture/adr-005-target-runtime-and-deployment.md)
- [微信 CloudBase 准备清单](docs/engineering/cloudbase-preparation.md)
- [本地开发说明](docs/engineering/local-development.md)

- [权威产品蓝图](docs/product/heshengxu-product-blueprint.md)
- [上线部署清单](docs/DEPLOYMENT.md)
- [历史平台探索](docs/product/archive/2026-08-24-platform-exploration.md)
- [早期范围取舍](docs/superpowers/specs/2026-08-24-product-scope-after-mint-benchmark.md)
- [阶段 1 建档设计](docs/superpowers/specs/2026-08-24-stage-1-onboarding-design.md)
- [阶段 0.5 持久化设计](docs/superpowers/specs/2026-08-25-stage-0-5-persistence-design.md)
- [项目结构规范](docs/engineering/project-structure.md)
- [微信小程序导入架构决策](docs/architecture/adr-003-mini-program-import.md)

## 健康与 AI 边界

和生序提供健康管理与生活方式建议，不提供疾病诊断、处方、药物剂量或替代线下就医的判断。所有生产 AI 能力必须经过服务端风险拦截、输出校验与审计后才能上线。
