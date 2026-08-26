# 本地开发

## 前置条件

- Node.js 24.x
- pnpm 11.x
- 仅开发微信小程序前端：不需要 Docker Desktop，直接使用 `apps/mini` 和本地构建。
- 联调 NestJS API、PostgreSQL、Redis：需要 Docker Desktop，启动本地基础设施后再运行 API。

## 启动本地服务

本项目当前以 NestJS + PostgreSQL 为本地事实后端。微信云开发不是本地 API 的前置条件；只有未来把服务部署到腾讯云时，才按部署方案启用云函数、云数据库或云存储。

食物拍照识别当前默认使用本地 mock Provider，用于验证“授权 -> 上传会话 -> 候选 -> 用户确认”的流程。不要在小程序填写 CloudBase、腾讯云或混元密钥。未来服务端适配器部署时，才由服务端运行环境配置 `CLOUDBASE_ENV_ID`、`TENCENTCLOUD_SECRET_ID` 和 `TENCENTCLOUD_SECRET_KEY`；选择 `cloudbase` 或 `hunyuan` 但缺少这些变量时，API 会拒绝启动。

```powershell
Copy-Item .env.example .env
docker compose --env-file .env -f infra/docker/docker-compose.yml up -d
docker compose --env-file .env -f infra/docker/docker-compose.yml ps
pnpm --filter @heban/api prisma:generate
pnpm --filter @heban/api prisma:deploy
pnpm --filter @heban/domain build
```

预期 PostgreSQL 和 Redis 都显示为 `healthy`。

停止服务：

```powershell
docker compose --env-file .env -f infra/docker/docker-compose.yml down
```

重置本地开发数据库会清空本机健康档案和测试数据，只在需要从零验证迁移时执行：

```powershell
docker compose --env-file .env -f infra/docker/docker-compose.yml down -v
docker compose --env-file .env -f infra/docker/docker-compose.yml up -d
pnpm --filter @heban/api prisma:deploy
```

## 提交前检查

```powershell
pnpm check
pnpm test
pnpm --filter @heban/api test:e2e
pnpm --filter @heban/api openapi:generate
pnpm --filter @heban/api build
pnpm --filter @heban/mini typecheck
pnpm --filter @heban/mini build:mp-weixin
pnpm --filter @heban/mini build:mp-weixin:check
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
pnpm --filter @heban/api openapi:generate
```
