# 本地开发

## 前置条件

- Node.js 24.x
- pnpm 11.x
- Docker Desktop 已启动

## 启动本地服务

```powershell
Copy-Item .env.example .env
docker compose --env-file .env -f infra/docker/docker-compose.yml up -d
docker compose --env-file .env -f infra/docker/docker-compose.yml ps
```

预期 PostgreSQL 和 Redis 都显示为 `healthy`。

停止服务：

```powershell
docker compose --env-file .env -f infra/docker/docker-compose.yml down
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

微信小程序构建产物在 `apps/mini/dist/build/mp-weixin`，可在微信开发者工具中导入预览。开发环境不填微信 AppSecret，真实微信登录会在后续身份接入阶段实现。

阶段 1 建档流程验证重点：首次打开只能进入 onboarding；填写身高和体重后 BMI 即时变化；完成目标选择并保存后才进入首页。当前 API 使用开发 token `dev-mini-user`，只用于本地联调。

阶段 1 建档流程验证重点：首次打开只能进入 onboarding；填写身高和体重后 BMI 即时变化；完成目标选择并保存后才进入首页。当前 API 使用开发 token `dev-mini-user`，只用于本地联调。

## 当前阶段验收状态

已完成：Docker PostgreSQL/Redis 健康检查、共享 BMI 规则、API 健康端点、档案授权边界、AI 输入/输出安全规则与隐私审计、OpenAPI、uni-app 小程序工程壳、API 请求层测试、微信小程序构建。

阶段 1 已完成：服务端档案更新接口、BMI 派生结果、建档四步表单、目标选择、建档前路由锁定和完成后首页占位。

暂缓：Prisma 引擎下载与 PostgreSQL migration。此前本机下载 Prisma 二进制持续超时，因此当前健康档案仍使用内存仓储；数据库容器已经就绪，但不能把它视为已完成持久化。

OpenAPI 生成：

```powershell
pnpm --filter @heban/api openapi:generate
```
