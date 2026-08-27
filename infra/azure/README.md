# Azure 测试环境说明

本目录仅记录首个常驻测试环境的方案，不会自动创建 Azure 资源。只有小程序本地 API 验收通过，并由账号所有者确认可接受的费用后，才开始实际开通。

## 选用服务

| 职责       | Azure 服务                                    | 选择原因                                                   |
| ---------- | --------------------------------------------- | ---------------------------------------------------------- |
| NestJS API | Azure Container Apps                          | 以容器运行现有 Node.js API，提供 HTTPS，并可在空闲时缩容。 |
| 容器镜像   | Azure Container Registry                      | 私有保存 API 镜像，供 Azure 部署。                         |
| 业务数据库 | Azure Database for PostgreSQL Flexible Server | 托管现有 Prisma schema 与 migration 所需的 PostgreSQL。    |
| 密钥       | Container Apps secret，后续可接 Key Vault     | 防止数据库与 CloudBase 凭证进入 Git 和小程序构建产物。     |
| Redis      | 初期不创建                                    | 当前 MVP 没有托管缓存的刚性需求，出现可量化需求后再接入。  |

## 建议命名

测试环境使用一个资源组：

```text
资源组：rg-heshengxu-test
容器应用：ca-heshengxu-api-test
容器镜像仓库：crheshengxutest
PostgreSQL 服务器：psql-heshengxu-test
```

创建前需检查 Azure 名称可用性。生产环境必须使用独立资源组与独立数据库。

## 服务端必需环境变量

```text
NODE_ENV=production
API_PORT=3000
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/heban?schema=public
FOOD_RECOGNITION_STORAGE_PROVIDER=mock
FOOD_RECOGNITION_VISION_PROVIDER=mock
```

`DATABASE_URL` 是密钥。只有 CloudBase 存储和混元适配器真正实现后，才加入 `CLOUDBASE_ENV_ID`、`TENCENTCLOUD_SECRET_ID` 和 `TENCENTCLOUD_SECRET_KEY`。这些值绝不进入小程序。

## 发布验收

小程序切到 Azure 测试环境前，必须全部满足：

1. 已部署 API 的 `GET /health` 通过 HTTPS 返回 HTTP 200。
2. Prisma migration 已成功写入 Azure PostgreSQL。
3. 携带身份的 `GET /api/v1/health-profiles/me` 返回项目约定的响应 envelope。
4. Azure HTTPS 域名已加入微信小程序“request 合法域名”。
5. 使用 `VITE_MINI_API_BASE_URL=https://<azure-host>/api/v1` 的测试构建能完成建档并读取首页。
6. 日志中不包含数据库密码、CloudBase 凭证、原始食物图片或 AI 服务商原始响应。

## Docker 在线上不负责什么

Docker Desktop 不是生产依赖。CI 或 Azure 构建 API 镜像，由 Azure 运行镜像；部署完成后开发者电脑可以关机。
