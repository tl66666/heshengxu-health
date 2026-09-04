# 和生序健康

和生序是一个微信小程序优先的健康管理产品，帮助用户用轻量、持续的记录理解自己的节律。产品采用“日系治愈奶油水彩”视觉语言：清透、明亮、有呼吸感，但数据和业务流程使用真实的服务端模型，不用演示数据冒充用户记录。

产品主张：**让健康回到自己的节律。**

## 产品与功能亮点

- **健康档案**：身高、体重、BMI 和体重目标在建档时即时计算，保存后成为首页的个人基线。
- **体重管理**：记录、编辑和删除每日体重；首页显示目标差距、半圆进度和趋势曲线。
- **饮水与饮食**：可调整饮水目标并记录不同饮品；食物库支持搜索、份量确认、营养计算、编辑和删除。
- **序序相机**：图片只作为识别输入，服务端返回候选食物和营养估算，用户确认后才写入饮食记录。
- **运动、睡眠、心情和经期**：每项都有独立记录页，支持真实时间、历史查看和修改；当前运动/睡眠服务端接口已接入，心情和经期先保存在本机，跨设备同步属于上线前待补能力。
- **序序聊天**：小程序只调用本项目 API，服务端负责模型授权、超时反馈、内容安全和审计。
- **离线可用的基础体验**：API 不可用时，页面显示明确的离线/失败状态；不会静默伪造“已保存”。

健康建议仅供生活方式参考，不提供疾病诊断、处方、药物剂量或替代就医的判断。

## 技术栈

| 层 | 技术 |
| --- | --- |
| 小程序 | uni-app、Vue 3、TypeScript、微信小程序 |
| API | NestJS、Prisma、OpenAPI |
| 数据 | PostgreSQL（唯一业务事实源），Redis（可选缓存/异步任务） |
| AI | CloudBase AI Gateway/混元或 GLM 视觉 Provider，由服务端适配 |
| 工程 | Vitest、ESLint、Prettier、Docker Compose、GitHub Actions |

## 云服务分工

默认生产方案是 **Azure 承载 API 和 PostgreSQL，CloudBase 服务微信生态和 AI，Cloudflare 作为可选的静态素材/CDN 层**：

- **Azure**：部署 NestJS API、PostgreSQL Flexible Server，必要时再加 Redis；密钥放在环境变量或 Key Vault。
- **CloudBase**：可选的微信生态能力、私有图片存储、CloudBase AI/混元 Gateway；当前微信身份由 API 服务端直接完成 code 换取会话。它不再维护第二套健康业务数据库。
- **Cloudflare**：可选的 R2 + CDN 或 Workers 入口，用来托管水彩插画、缓存公开素材或反向代理 API；不能替代微信登录。

三者可以替换其中一层，但小程序始终只保存公开的 HTTPS API/素材地址，任何 Secret、API Key 和数据库密码都只能在服务端。

当前水彩素材已发布到 CloudBase CDN：
`https://tl-d2ghzbl1p09ccaae3-1474520495.tcloudbaseapp.com/heban`。
生产构建时仍需把你的 API 地址填入 `VITE_MINI_API_BASE_URL`；没有 API 地址不能生成可上线版本。

## 新手快速开始（Windows）

项目日常操作使用仓库提供的 Windows 脚本，不需要你手动操作包管理器。只开发小程序时需要 Node.js 和微信开发者工具；联调 API 时再需要 Docker Desktop。

1. 首次使用先安装 Node.js 24.x；需要联调 API 时再安装 Docker Desktop。启动脚本会准备独立的本地运行时，不会覆盖工作区链接。
2. 双击 `start-dev.bat`，脚本会启动 PostgreSQL、Redis、API 和小程序监听器。
3. 微信开发者工具第一次导入 `apps/mini`；日常源码改动后点击“重新编译”。
4. 开发输出目录固定为 `apps/mini/dist/dev/mp-weixin`，发布输出目录固定为 `apps/mini/dist/build/mp-weixin`。
5. 发布前按 [上线部署清单](docs/DEPLOYMENT.md) 配置生产地址，再运行 `./scripts/build-mini.ps1`。

更完整的本地排障步骤见 [本地开发说明](docs/engineering/local-development.md)。

## HBuilderX 双端发布

`apps/mini` 是 uni-app 工程，同一套 Vue/TypeScript 页面可通过 HBuilderX 发布到微信小程序和 App：

1. HBuilderX 打开 `apps/mini`，先在“运行 -> 运行到小程序模拟器”选择微信开发者工具进行联调。
2. 微信发布仍使用 `apps/mini/dist/build/mp-weixin`，并按部署清单配置 HTTPS API 与远程插画域名。
3. 发布 App 时在 HBuilderX 选择“发行 -> 原生 App-云打包”，填写 Android 包名/证书或 iOS 证书信息，生成安装包后再做真机验收。
4. App 与小程序共用同一套 NestJS API；不要把数据库、CloudBase 或 AI 密钥写入前端工程。

App 打包需要你自己的开发者证书、苹果/安卓签名资料和平台账号，这些属于发布平台操作，不提交到 GitHub。

## 仓库结构

```text
apps/                 # 后续的 uni-app 小程序与 NestJS API
packages/             # 跨端 contracts、领域规则和共享配置
assets/illustrations/ # 原始水彩图片源目录（不压缩、不提交构建副本）
dist/mini-assets/      # 发布前导出的远程素材目录（本地生成，默认忽略）
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
- [HBuilderX 双端发布指南](docs/APP-RELEASE-HBUILDERX.md)
- [历史平台探索](docs/product/archive/2026-08-24-platform-exploration.md)
- [早期范围取舍](docs/superpowers/specs/2026-08-24-product-scope-after-mint-benchmark.md)
- [阶段 1 建档设计](docs/superpowers/specs/2026-08-24-stage-1-onboarding-design.md)
- [阶段 0.5 持久化设计](docs/superpowers/specs/2026-08-25-stage-0-5-persistence-design.md)
- [项目结构规范](docs/engineering/project-structure.md)
- [微信小程序导入架构决策](docs/architecture/adr-003-mini-program-import.md)

## 健康与 AI 边界

和生序提供健康管理与生活方式建议，不提供疾病诊断、处方、药物剂量或替代线下就医的判断。所有生产 AI 能力必须经过服务端风险拦截、输出校验与审计后才能上线。
