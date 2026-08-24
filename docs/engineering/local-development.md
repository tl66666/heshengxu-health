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
