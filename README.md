# 和生序

和生序是一个由个人独立完成的健康管理项目，面向希望用轻量记录建立生活节律的人。产品把体重、饮食、饮水、运动、睡眠、心情、生理期、用药和轻断食放在同一个每日健康循环里，并用序序提供温和、可解释的陪伴。

产品视觉采用明亮、清透的日系治愈奶油水彩风格。界面强调留白、清晰层级和真实记录，不用虚构的健康结果替代用户数据，也不把 AI 建议包装成诊断。

> 健康建议仅用于生活方式参考，不提供疾病诊断、处方、药物剂量或替代就医判断。

## 产品能力

### 个人健康档案与体重目标

- 建档时记录身高、体重并即时计算 BMI。
- 设置目标体重，首页展示当前体重、目标差距和半圆进度可视化。
- 体重记录支持新增、编辑、删除和趋势查看。
- 重置本机数据会清理本机保存的全部记录。

### 饮食与序序相机

- 食物库支持搜索、分类、份量和营养信息。
- 序序相机把图片发送到服务端视觉模型，返回候选食物和热量估算。
- 识别结果必须由用户确认后，才会写入饮食记录。
- 原始照片目前只作为识别输入，不默认保存原图。

### 饮水、运动、睡眠与心情

- 饮水目标可编辑，支持水、茶、牛奶等饮品记录和当天汇总。
- 运动记录包含活动类型、时长、强度和历史查看。
- 睡眠记录使用入睡时间和醒来时间自动计算时长，并可补充睡眠质量、梦境和备注。
- 心情记录支持情绪选择、能量感受和文字日记。

### 生理期、用药与轻断食

- 生理期支持首次设置周期天数、经期天数、最近一次开始日期，并据此计算预计窗口。
- 用药支持药品、剂量、频次、提醒时段、服用状态和历史记录。
- 轻断食支持方案选择、开始/结束时间、实时计时、完成记录和首页状态同步。
- 这些模块当前以本机保存为主，跨设备同步仍是后续服务端能力，不在当前版本伪装成已完成。

### 序序聊天

- 小程序只调用本项目 API，不在客户端保存模型密钥。
- API 服务端负责调用 CloudBase AI Gateway 的混元文本模型、超时处理、错误提示和安全边界。
- 服务不可用时，界面明确显示失败原因，不伪造模型回复。

## 技术架构

    uni-app / Vue 3 / TypeScript
            |
            | HTTPS
            v
    NestJS API + Prisma
            |
            +--> Azure Database for PostgreSQL
            +--> CloudBase AI Gateway（混元文本）
            +--> GLM 视觉 API（食物图片识别）

    原始插画 --> CloudBase 静态托管/CDN --> 小程序 downloadFile 合法域名
    Docker 镜像 --> GitHub Container Registry --> Azure Container Apps

## 技术栈

| 层级     | 技术                                                                        |
| -------- | --------------------------------------------------------------------------- |
| 客户端   | uni-app、Vue 3、TypeScript、微信小程序                                      |
| 服务端   | NestJS、Prisma、OpenAPI                                                     |
| 数据库   | PostgreSQL                                                                  |
| AI       | CloudBase AI Gateway、混元文本模型、GLM 视觉模型                            |
| 工程质量 | Vitest、TypeScript、ESLint、Prettier、GitHub Actions                        |
| 交付     | Docker、GitHub Container Registry、Azure Container Apps、CloudBase 静态托管 |

## 当前生产环境

| 资源       | 当前配置                                                                            |
| ---------- | ----------------------------------------------------------------------------------- |
| API        | https://api-heshengxu-prod.yellowsky-5fa044e1.eastasia.azurecontainerapps.io/api/v1 |
| 健康检查   | https://api-heshengxu-prod.yellowsky-5fa044e1.eastasia.azurecontainerapps.io/health |
| PostgreSQL | Azure Database for PostgreSQL Flexible Server                                       |
| API 运行时 | Azure Container Apps，0.5 CPU / 1 GiB，最小实例 0，最大实例 2                       |
| 静态素材   | https://tl-d2ghzbl1p09ccaae3-1474520495.tcloudbaseapp.com/heban                     |
| API 镜像   | GitHub Container Registry 公共镜像                                                  |

生产密钥（数据库密码、AI Key、微信 AppSecret）只保存在 Azure Secret/环境变量中，不进入仓库、小程序包、日志或 README。

## 本地开发（Windows）

要求：Node.js 24.x；需要联调 API 时安装 Docker Desktop。日常命令使用 npm，不要求安装 pnpm。

    git clone https://github.com/tl66666/heshengxu-health.git
    cd heshengxu-health
    npm install

开发小程序：

    cd apps/mini
    npm run dev:mp-weixin

开发 API：

    cd apps/api
    npm run start:dev

也可以在仓库根目录运行 start-dev.bat，再用微信开发者工具导入 apps/mini。本地环境变量以 .env.example 和 apps/api/.env.example 为模板；真实值只放在未跟踪的 .env 文件。

## Docker 与 Azure 部署

API 使用根目录的 Dockerfile.api 构建，容器启动时自动执行 Prisma 迁移，然后启动 NestJS 服务：

    docker build -f Dockerfile.api -t heshengxu-api:local .
    docker run --rm -p 3000:3000 --env-file apps/api/.env heshengxu-api:local

正式部署流程：

1. GitHub Actions 构建并发布 API 镜像到 GitHub Container Registry。
2. Azure Container Apps 拉取指定镜像，使用 Azure Secret 注入数据库、AI 和微信配置。
3. Azure Database for PostgreSQL 执行 Prisma 迁移并保存服务端业务数据。
4. 发布后检查 /health、关键 API、数据库连接和容器日志。

完整步骤见 docs/DEPLOYMENT.md 和 docs/RELEASE-CHECKLIST.md。

## 微信小程序发布

使用生产地址构建：

    $env:VITE_MINI_API_BASE_URL='https://api-heshengxu-prod.yellowsky-5fa044e1.eastasia.azurecontainerapps.io/api/v1'
    $env:VITE_MINI_ASSET_BASE_URL='https://tl-d2ghzbl1p09ccaae3-1474520495.tcloudbaseapp.com/heban'
    ./scripts/build-mini.ps1

构建产物为 apps/mini/dist/build/mp-weixin，再导入微信开发者工具上传。微信公众平台已配置 API 的 request 合法域名和素材的 downloadFile 合法域名；正式发布仍需完成备案审核、隐私说明和版本审核。

## App 双端发布

apps/mini 是 uni-app 工程，可在 HBuilderX 中复用同一套页面和 API 打包 Android/iOS。App 发布还需要独立准备 Android 包名与签名证书、iOS Bundle ID 与 Apple 开发者证书、隐私政策、权限说明和真机验收。

操作指南见 docs/APP-RELEASE-HBUILDERX.md。

## 仓库结构

    apps/mini/              uni-app 小程序与 App 客户端
    apps/api/               NestJS API、Prisma schema 与迁移
    packages/               跨端 contracts、领域规则和共享配置
    assets/illustrations/   原始高质量插画资源
    scripts/                构建、素材导出和仓库检查脚本
    infra/                  本地 Docker 与部署辅助配置
    docs/                   产品、工程、部署和发布文档
    prototypes/             早期静态原型，仅用于设计讨论

## 文档入口

- [文档中心](docs/README.md)：按主题找到当前有效文档。
- [上线部署](docs/DEPLOYMENT.md)：生产资源、环境变量和部署步骤。
- [发布检查清单](docs/RELEASE-CHECKLIST.md)：小程序和 App 发布前后检查。
- [HBuilderX 双端发布](docs/APP-RELEASE-HBUILDERX.md)：Android/iOS 打包准备。
- [项目交接](docs/engineering/handoff.md)：给后续开发会话的工程边界。
- [安全与公开仓库规则](SECURITY.md)：密钥、个人数据和发布安全要求。

## 质量检查

    npm exec -- prettier --check .
    npm exec -- eslint .
    cd apps/mini
    npm exec -- vitest run
    npm exec -- vue-tsc --noEmit

GitHub Actions 会在推送和 Pull Request 时执行数据库迁移演练、类型检查、测试、API 构建和小程序生产构建。

## 项目状态

当前 API、数据库、AI 代理、静态素材 CDN 和小程序生产构建链路已部署并通过验证。饮水、心情、生理期、用药和轻断食的跨设备同步尚未完成；App 商店发布资料也需要在平台侧补齐。这些限制会在发布清单中明确标注。
