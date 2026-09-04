# 本地开发

## 前置条件

- Node.js 24.x
- npm（随 Node.js 安装；仓库脚本通过 `npm`/`npx` 调用）
- 仅开发微信小程序前端：不需要 Docker Desktop，直接使用 `apps/mini` 和本地构建。
- 联调 NestJS API、PostgreSQL、Redis：需要 Docker Desktop，启动本地基础设施后再运行 API。

## 三种开发方式

1. 只检查小程序页面：运行 `./scripts/dev-mini.ps1` 并在微信开发者工具中重新编译。此方式不需要 Docker；当页面请求真实数据时会显示其已有的加载或失败状态。
2. 联调真实接口：启动 Docker Desktop、PostgreSQL、Redis 和 NestJS API。小程序默认请求 `http://localhost:3000/api/v1`，仅用于这台电脑的开发联调。
3. 测试或正式上线：小程序构建时设置 `VITE_MINI_API_BASE_URL=https://你的-api-域名/api/v1`。这个值是公开地址，不是密钥；数据库、CloudBase、混元和 Azure 凭证只存在服务端。

正式运行架构以 [ADR-005](../architecture/adr-005-target-runtime-and-deployment.md) 为准：NestJS 和 PostgreSQL 部署到 Azure，CloudBase 提供微信和 AI 相关能力。上线后用户和开发者电脑都不需要运行 Docker。

## 启动本地服务

本项目当前以 NestJS + PostgreSQL 为本地事实后端。微信云开发不是本地 API 的前置条件；只有未来把服务部署到腾讯云时，才按部署方案启用云函数、云数据库或云存储。

日常联调只需双击仓库根目录的 `start-dev.bat`。脚本会自动启动 Docker Desktop、准备独立的 npm 运行时、等待 PostgreSQL/Redis 健康、执行数据库迁移、启动 API 和小程序监听器。完整食物库存在时会直接复用；只有 active 食物不足 10,000 条时才会自动从 `food.sql` 补齐，因此电脑重启后不需要重新导入。

根目录保留现有 workspace 锁文件供 GitHub CI 复现依赖；Windows 本地不要反复执行包管理器安装来“修复”编译卡住的问题，优先关闭重复监听器后重新运行 `start-dev.bat`。该脚本不会把密钥写入项目，也不会改动源插画。

如果没有运行本地服务，食物页面会明确显示“当前为离线常见食物”，此时约 82 条只是小程序包内的应急目录，并不代表 PostgreSQL 中的完整食物库丢失。

食物拍照识别当前默认使用本地 mock Provider，用于验证“授权 -> 上传会话 -> 候选 -> 用户确认”的流程。不要在小程序填写 CloudBase、腾讯云或混元密钥。未来服务端适配器部署时，才由服务端运行环境配置 `CLOUDBASE_ENV_ID`、`TENCENTCLOUD_SECRET_ID` 和 `TENCENTCLOUD_SECRET_KEY`；选择 `cloudbase` 或 `hunyuan` 但缺少这些变量时，API 会拒绝启动。

```powershell
.\scripts\start-local-dev.ps1
```

预期 PostgreSQL 和 Redis 都显示为 `healthy`。

停止服务：

```powershell
docker compose --env-file .env -f infra/docker/docker-compose.yml down
```

以下命令会删除数据库卷、完整食物库、本机健康档案和测试数据，日常开发禁止执行：

```powershell
docker compose --env-file .env -f infra/docker/docker-compose.yml down -v
docker compose --env-file .env -f infra/docker/docker-compose.yml up -d
npx -y prisma@6.16.0 migrate deploy --schema apps/api/prisma/schema.prisma
```

## 提交前检查

```powershell
npx prettier . --check
npx eslint .
npx vitest run
npx prisma generate --schema apps/api/prisma/schema.prisma
npx prisma migrate deploy --schema apps/api/prisma/schema.prisma
npx tsc -p packages/domain/tsconfig.build.json
npx tsc -p apps/api/tsconfig.build.json
npx vue-tsc --noEmit --project apps/mini/tsconfig.json
node scripts/verify-repository-layout.mjs
```

微信小程序日常开发先运行 `./scripts/dev-mini.ps1`，脚本会先把 `assets/illustrations/` 同步到小程序构建目录，再在微信开发者工具导入 `apps/mini`；它会使用 `apps/mini/dist/dev/mp-weixin`，保存源码后点击“重新编译”即可更新。发布预览使用 `./scripts/build-mini.ps1`，直接导入 `apps/mini/dist/build/mp-weixin`。开发环境不填微信 AppSecret，真实微信登录会在后续身份接入阶段实现。

阶段 1 建档流程验证重点：首次打开只能进入 onboarding；填写身高和体重后 BMI 即时变化；完成目标选择并保存后才进入首页。当前 API 使用开发 token `dev-mini-user`，只用于本地联调。

## 当前阶段验收状态

已完成：Docker PostgreSQL/Redis 健康检查、共享 BMI 规则、API 健康端点、档案授权边界、AI 输入/输出安全规则与隐私审计、OpenAPI、uni-app 小程序工程壳、API 请求层测试、微信小程序构建。

阶段 1 已完成：服务端档案更新接口、BMI 派生结果、建档四步表单、目标选择、建档前路由锁定和完成后首页占位。

阶段 0.5 已完成：Prisma schema 与 PostgreSQL migration、健康档案持久化仓储、API 重启后档案读取、只保存哈希的 AI 审计表。真实微信登录仍未接入，开发 token 仅限本地联调。

阶段 2A 已完成：体重、饮食结构、活动、睡眠四类版本化记录；体重和睡眠计划；每日任务；首页聚合；小程序五栏导航与规则化序序场景陪伴。完整验收记录见 `docs/engineering/stage-2a-acceptance.md`。

OpenAPI 生成：

```powershell
node apps/api/src/openapi.ts
```
