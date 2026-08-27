# ADR-005：目标运行架构与部署方案

状态：已采纳

日期：2026-08-27

## 决策

项目继续使用 NestJS 和 PostgreSQL 作为核心业务数据的唯一事实来源。同一套 API 同时服务微信小程序与后续 uni-app 手机 App。

CloudBase 不建立第二套业务后端，只负责微信生态能力：微信身份接入、食物照片私有存储，以及由服务端调用混元 AI。产品通过本地与测试环境验收后，Azure 承载 NestJS API 和 PostgreSQL 的正式运行。

## 系统边界

```text
uni-app 微信小程序 / uni-app 手机 App
                  |
                  | HTTPS API 请求
                  v
          Azure 上的 NestJS 模块化 API
                  |
                  v
          Azure Database for PostgreSQL
                  |
                  +-- 健康档案、目标、计划、记录、饮食条目
                  +-- AI 授权、审计与用户确认后的识别结果

NestJS 服务端集成
                  |
                  +-- CloudBase 私有食物图片存储
                  +-- CloudBase / 混元的已授权 AI 请求
                  +-- 微信登录 code 换取身份
```

小程序和手机 App 不包含腾讯云、Azure 或 AI 服务商密钥，只向 NestJS API 发起经过身份验证的请求。

## 采用原因

1. 仓库已经具备 NestJS 模块、Prisma migration、PostgreSQL 关系模型、API 测试与 OpenAPI，这些能力可被小程序和 App 共同复用。
2. 健康记录需要清晰的数据归属、版本历史、审计与关系一致性，PostgreSQL 作为事实库更合适。
3. CloudBase 对微信生态很有价值，但再维护一套 CloudBase 业务数据库会造成用户、记录和排错链路重复。
4. Azure 代金券可支撑常驻测试或生产 API。部署后用户访问云端服务，开发者的电脑和 Docker Desktop 无须持续运行。

## Docker 的含义

Docker Desktop 是本地开发工具，用来在当前电脑启动 PostgreSQL 和 Redis，供 NestJS API 在部署前联调。

Docker 仅在开发者选择“本地 API + 本地 PostgreSQL/Redis 联调”时需要。编译小程序、用户使用已发布小程序、以及线上服务运行均不需要 Docker。

## 环境划分

| 环境 | API | 数据库 | CloudBase | 是否需要 Docker |
| --- | --- | --- | --- | --- |
| 小程序 UI 开发 | 本地 mock 或本地 API | 可选 | 否 | 否 |
| 本地 API 联调 | 本地 NestJS | 本地 PostgreSQL 与 Redis | 可选 mock | 是 |
| 共享测试环境 | Azure 上的 NestJS | Azure PostgreSQL | 私有存储与已批准 AI | 否 |
| 正式生产环境 | Azure 上的 NestJS | Azure PostgreSQL | 私有存储与已批准 AI | 否 |

## CloudBase 职责

CloudBase 按受控步骤接入：

1. 为食物照片启用私有云存储，文件必须使用用户隔离的路径前缀，默认不公开读取。
2. NestJS 使用服务端凭证上传文件并生成短期读取 URL，小程序不接触服务商凭证。
3. 仅在用户明确授权后由服务端调用混元；模型输出只是候选，不是已确认的健康事实。
4. 用户确认食物候选后，才会在 PostgreSQL 创建饮食记录。

当前已启用的 `hy3` 文本模型适合未来序序对话，不适用于食物照片识别。食物识别需要支持图片输入的视觉模型和相应的服务端适配器。

## Azure 部署职责

现在不创建 Azure 资源。邀请外部用户前，按以下顺序部署：

1. NestJS API 部署到 Azure Container Apps 或 App Service。
2. PostgreSQL 部署到 Azure Database for PostgreSQL Flexible Server。
3. Redis 只在出现明确生产需求后接入，不提前为托管缓存付费。
4. 通过 Azure 环境变量或 Key Vault 管理密钥，禁止写进 Git、小程序代码或聊天记录。
5. 自动化检查通过后从 GitHub 持续部署。

第一次 Azure 部署只作为测试环境。小程序流程、备份、监控和安全检查验收后，再发布生产环境。

## 开发顺序

1. 稳定小程序页面、导航、加载/失败状态和本地开发配置。
2. 将小程序 API 配置收口，使本地、测试和生产地址只在一处切换。
3. 完成健康管理 MVP 的身份认证、NestJS API 和 PostgreSQL 持久化。
4. 在既有服务端接口后实现 CloudBase 图片存储与混元适配器。
5. 接入真实微信登录，替换开发令牌。
6. 将 API 与数据库部署到 Azure，并为小程序配置生产 API 地址。
7. 使用同一套 uni-app 前端构建 Android 和 iOS App，继续调用同一套 API。

## 不可违背的规则

- 一条业务事实只能有一个权威数据库：PostgreSQL。
- 密钥禁止出现于 `apps/mini`、Git 提交、截图或聊天记录。
- AI 识别结果在用户确认前只能作为建议。
- API 不可用时，小程序必须展示可理解的加载或失败状态。
- Azure 与 CloudBase 的线上运行不能依赖开发者电脑保持开机。
