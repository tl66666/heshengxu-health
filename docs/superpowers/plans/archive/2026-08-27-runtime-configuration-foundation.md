# 小程序运行时配置底座实施计划

> 面向执行者：必须逐项执行，步骤使用复选框记录状态。

**目标：** 将小程序 API 地址和开发身份收口，使同一套代码能在本地、Azure 测试与生产环境运行，无须逐页修改。

**架构：** 小型运行时模块负责 API 基地址和本地开发授权；业务服务通过共享客户端请求 API，不再自行拼接 `localhost` 或请求头。`VITE_` 变量只存放公开构建配置，任何密钥仍只存在服务端。

**技术栈：** uni-app、Vue 3、TypeScript、Vitest、Vite 环境变量。

---

### 任务 1：定义并测试小程序运行时配置

**文件：**
- 新增：`apps/mini/src/config/runtime.ts`
- 新增：`apps/mini/src/config/runtime.spec.ts`

- [x] 为本地默认值编写失败测试：`resolveMiniRuntime({})` 返回 `apiBaseUrl: 'http://localhost:3000/api/v1'` 与 `authorization: 'Bearer dev-mini-user'`。
- [x] 运行 `node node_modules/vitest/vitest.mjs run src/config/runtime.spec.ts`，确认模块不存在导致失败。
- [x] 实现 `resolveMiniRuntime(environment)`，读取 `VITE_MINI_API_BASE_URL`，移除末尾斜杠；配置 HTTPS 地址时不返回本地开发令牌。
- [x] 为 `VITE_MINI_API_BASE_URL: 'https://api.example.test/api/v1/'` 添加通过测试，断言地址标准化且没有授权令牌。
- [x] 运行聚焦测试并提交 `feat: define mini program runtime configuration`。

### 任务 2：创建唯一的小程序 API 客户端工厂

**文件：**
- 新增：`apps/mini/src/services/mini-api.ts`
- 新增：`apps/mini/src/services/mini-api.spec.ts`

- [x] 使用注入的请求适配器编写失败测试：配置 HTTPS 地址后请求 `https://api.example.test/api/v1/health`，请求头不得携带开发 bearer token。
- [x] 运行测试并确认共享客户端不存在导致失败。
- [x] 实现 `createMiniApiClient()`：组合 `resolveMiniRuntime` 和 `createApiClient`，仅在本地运行时配置提供授权值时发送 `Authorization`；测试注入适配器，不调用 `uni.request`。
- [x] 运行共享客户端与已有 API 客户端测试并提交 `feat: add shared mini program API client`。

### 任务 3：移除重复的本地地址配置

**文件：**
- 修改：`apps/mini/src/pages/bootstrap/BootstrapPage.vue`
- 修改：`apps/mini/src/pages/onboarding/OnboardingPage.vue`
- 修改：`apps/mini/src/features/health-loop/health-loop.service.ts`
- 修改：`apps/mini/src/features/health-profile/health-profile.service.ts`
- 修改：`apps/mini/src/features/health-records/health-records.service.ts`
- 修改：`apps/mini/src/features/food/food.service.ts`
- 修改：`apps/mini/src/features/food/food-recognition.ts`
- 修改：`apps/mini/src/features/weekly-review/weekly-review.service.ts`
- 新增：`apps/mini/test/no-hardcoded-api-base.spec.ts`

- [x] 编写源码契约测试：以上八个消费者文件不得出现 `http://localhost:3000/api/v1` 或开发授权头。
- [x] 先运行测试，确认旧代码因重复本地地址而失败。
- [x] 将页面本地客户端和各 feature 的 `createMiniClient` 全部替换为 `createMiniApiClient`；业务文件不再拥有 API 地址和授权头。
- [x] 运行类型检查、全量测试和小程序构建校验，再提交 `refactor: centralize mini program API configuration`。

### 任务 4：说明环境配置边界

**文件：**
- 修改：`.env.example`
- 新增：`apps/mini/.env.example`
- 修改：`README.md`
- 修改：`docs/engineering/local-development.md`

- [x] 将 `VITE_MINI_API_BASE_URL` 标注为公开构建地址，并给出本地与 Azure 示例。
- [x] 明确 `CLOUDBASE_ENV_ID`、腾讯云凭证和数据库凭证只能用于服务端。
- [x] 使用 `rg` 交叉检查 `VITE_MINI_API_BASE_URL`、`CLOUDBASE_ENV_ID` 和本地地址的文档归属。
- [x] 随配置收口提交完成。

### 任务 5：完成 Azure 测试环境方案

**文件：**
- 新增：`infra/azure/README.md`
- 新增：`docs/superpowers/plans/2026-08-27-azure-test-environment.md`

- [x] 明确 Azure Container Apps、Azure PostgreSQL、服务端环境变量、Prisma migration、`/health` 和已登录档案接口的验收标准。
- [x] 明确在小程序 API 配置稳定与功能验收前，不自动创建 Azure 资源，也不写入 Azure 凭证。
- [x] 提交 `docs: plan Azure test environment`。
