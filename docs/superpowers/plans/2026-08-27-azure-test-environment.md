# Azure 测试环境实施计划

> 面向执行者：必须逐项执行，步骤使用复选框记录状态。

**目标：** 将现有 NestJS API 与 PostgreSQL 部署到 Azure 测试环境，让微信小程序通过 HTTPS 使用服务，不依赖开发者电脑。

**架构：** Azure Container Apps 运行 NestJS API；Azure Database for PostgreSQL Flexible Server 保存 Prisma schema。CloudBase 仍是服务端外部集成，不保存健康业务事实。小程序构建时只接收公开 Azure HTTPS API 地址。

**技术栈：** Azure Container Apps、Azure Container Registry、Azure Database for PostgreSQL Flexible Server、NestJS、Prisma、GitHub Actions、uni-app。

---

### 任务 1：创建 Azure 测试资源组与费用保护

**文件：**
- 修改：`infra/azure/README.md`

- [ ] 在 Azure Portal 创建 `rg-heshengxu-test`，选择费用较低且中国用户延迟可接受的区域。
- [ ] 在 Cost Management 创建低于剩余代金券的预算，并配置 50%、80%、100% 告警。
- [ ] 只在 `infra/azure/README.md` 记录资源名和区域，禁止记录订阅 ID、密码和连接串。
- [ ] 创建任何计费数据库前，确认预算告警已经生效。

### 任务 2：创建托管 PostgreSQL 并执行 Prisma migration

**文件：**
- 修改：`infra/azure/README.md`

- [ ] 创建 Burstable 规格的 Azure Database for PostgreSQL Flexible Server，使用独立数据库 `heban`；管理员密码只保存于 Azure。
- [ ] 只允许部署环境访问 PostgreSQL，禁止小程序直接访问数据库。
- [ ] 将连接串保存为 Container Apps secret `database-url`。
- [ ] 在部署环境执行 `pnpm --filter @heban/api prisma:deploy`，确认 `_prisma_migrations` 包含所有已提交 migration。
- [ ] 仅在测试用户与本地开发数据隔离后，针对已部署数据库运行 API E2E 测试。

### 任务 3：打包并部署 NestJS API

**文件：**
- 新增：`apps/api/Dockerfile`
- 新增：`apps/api/.dockerignore`
- 新增：`.github/workflows/deploy-azure-test.yml`

- [ ] 编写 Docker 构建测试：用测试环境变量启动 API 镜像，`GET /health` 必须返回 HTTP 200。
- [ ] 创建多阶段 Node 24 Dockerfile：安装锁定的 workspace 依赖，构建 `@heban/domain` 与 `@heban/api`，最终镜像仅运行 API 产物。
- [ ] 在本地或 CI 构建镜像，确认其中没有 `.env`、宿主机 `node_modules`、原始食品 SQL 或小程序构建产物。
- [ ] 创建 Azure Container Registry 并推送经验证镜像。
- [ ] 创建 Azure Container Apps，设置 `API_PORT=3000`、`database-url` 和 mock 识别 Provider；通过 Azure HTTPS FQDN 验证 `GET /health`。

### 任务 4：配置小程序测试构建

**文件：**
- 新增：`apps/mini/.env.test.example`
- 修改：`docs/engineering/local-development.md`

- [ ] 添加 `VITE_MINI_API_BASE_URL=https://<container-app-fqdn>/api/v1` 示例，不含任何凭证。
- [ ] 将 Container Apps 的 HTTPS 域名加入微信小程序“request 合法域名”。
- [ ] 使用测试地址构建小程序，完成建档、新建一条健康记录，并从第二个小程序会话刷新验证持久化。
- [ ] 验收日期与 FQDN 记录在私有部署记录中，不提交到 Git。

### 任务 5：测试验收后再开放生产环境

**文件：**
- 修改：`infra/azure/README.md`

- [ ] 创建新的生产资源组和数据库，不直接提升测试数据库。
- [ ] 开启自动备份、最低日志保留、HTTPS 监控和部署审批后再发布。
- [ ] 对外发布前必须用真实微信登录替换本地开发 bearer token。
- [ ] 只有 CloudBase 存储和混元适配器真实完成后，才能启用对应生产 Provider 标志。
