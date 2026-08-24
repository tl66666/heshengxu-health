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
```

API 和小程序加入后，再按阶段 0 实施计划执行其专用测试、OpenAPI 生成与构建命令。

## 当前阶段 0 验收状态

已完成：Docker PostgreSQL/Redis 健康检查、共享 BMI 规则、API 健康端点、档案授权边界、AI 输入/输出安全规则、API 请求层测试。

暂缓：Prisma 引擎下载与 PostgreSQL migration、正式 uni-app 编译插件和微信小程序构建。两项均受本机 npm 二进制/大型依赖下载超时影响，代码边界已保留但未宣称完成。

OpenAPI 生成：

```powershell
pnpm --filter @heban/api openapi:generate
```
